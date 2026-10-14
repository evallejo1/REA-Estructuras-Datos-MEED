# ============================================================================
# sanity_check.ps1
# Verificacion de integridad del REA Estructuras de Datos y Algoritmos (v3.1)
#
# Uso:
#   .\sanity_check.ps1
#   .\sanity_check.ps1 -ProjectRoot "C:\ruta\al\proyecto"
#
# Codigos de salida:
#   0 = todo OK
#   1 = hay advertencias o fallos
#   2 = error de invocacion
# ============================================================================

[CmdletBinding()]
param([string]$ProjectRoot = "")

$ErrorActionPreference = "Continue"

# ---- Localizar la raiz del proyecto ----------------------------------------
if ([string]::IsNullOrEmpty($ProjectRoot)) {
    # Partir de la carpeta donde vive este script y subir hasta encontrar index.html
    $dir = $PSScriptRoot
    if (-not $dir) { $dir = (Get-Location).Path }

    while ($dir -and -not (Test-Path (Join-Path $dir "index.html"))) {
        $parent = Split-Path -Parent $dir
        if ($parent -eq $dir -or [string]::IsNullOrEmpty($parent)) {
            $dir = $null
            break
        }
        $dir = $parent
    }

    if (-not $dir) {
        Write-Host "No se encontro index.html subiendo desde $PSScriptRoot" -ForegroundColor Red
        Write-Host "Uso: .\sanity_check.ps1 -ProjectRoot 'C:\ruta\al\proyecto'"
        exit 2
    }
    $ProjectRoot = $dir
}

if (-not (Test-Path $ProjectRoot)) {
    Write-Host "La ruta no existe: $ProjectRoot" -ForegroundColor Red
    exit 2
}

$ProjectRoot = (Resolve-Path $ProjectRoot).Path

# ---- Contadores ------------------------------------------------------------
$script:Total = 0
$script:Pass  = 0
$script:Warn  = 0
$script:Fail  = 0

function Write-Ok   ($msg) {
    Write-Host "  " -NoNewline
    Write-Host "OK  " -ForegroundColor Green -NoNewline
    Write-Host $msg
}
function Write-Warn ($msg) {
    Write-Host "  " -NoNewline
    Write-Host "!   " -ForegroundColor Yellow -NoNewline
    Write-Host $msg
}
function Write-Fail ($msg) {
    Write-Host "  " -NoNewline
    Write-Host "X   " -ForegroundColor Red -NoNewline
    Write-Host $msg
}

# ---- Banner ----------------------------------------------------------------
Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "   Sanity Check - REA Estructuras de Datos y Algoritmos (v3.1)"   -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "   Proyecto: $ProjectRoot" -ForegroundColor DarkGray
Write-Host ""

# ============================================================================
# 1. Directorios esperados
# ============================================================================
Write-Host "[1] Estructura de directorios" -ForegroundColor White

$dirs = @("css", "js", "js\structures", "datos", "tests", "scripts")

foreach ($d in $dirs) {
    $script:Total++
    $full = Join-Path $ProjectRoot $d
    if (Test-Path -PathType Container $full) {
        Write-Ok "$d\"
        $script:Pass++
    } else {
        Write-Fail "$d\  (falta el directorio)"
        $script:Fail++
    }
}
Write-Host ""

# ============================================================================
# 2. Archivos esperados (ruta|tamano minimo en bytes)
# ============================================================================
Write-Host "[2] Archivos del proyecto" -ForegroundColor White

$files = @(
    "index.html|10000",
    "autor.txt|1",
    "iniciar.bat|1000",
    "LEEME_PRIMERO.txt|500",
    "README.md|200",
    "CHANGELOG.md|200",
    "ARQUITECTURA.md|200",

    "css\styles.css|1500",

    "js\app.js|15000",
    "js\file_loader.js|3000",
    "js\sorting.js|8000",
    "js\searching.js|5000",
    "js\pseudocode.js|2000",
    "js\race_mode.js|2000",
    "js\benchmark.js|3000",
    "js\quiz.js|3000",
    "js\help_content.js|4000",

    "js\structures\stack.js|1500",
    "js\structures\queue.js|1500",
    "js\structures\linked_list.js|3000",
    "js\structures\bst.js|5000",
    "js\structures\avl.js|5000",
    "js\structures\graph.js|5000",
    "js\structures\hash_table.js|3000",

    "datos\README.md|50",
    "datos\datos_numeros.csv|50",
    "datos\datos_valores.txt|30",
    "datos\datos_estudiantes.json|100",
    "datos\datos_inversos.csv|50",
    "datos\quiz_preguntas.json|500",

    "tests\test_generadores.html|2000",
    "tests\README.md|100",

    "scripts\sanity_check.sh|1000",
    "scripts\sanity_check.ps1|1000",
    "scripts\sanity_check.bat|200",
    "scripts\serve.js|1000"
)

foreach ($entry in $files) {
    $script:Total++
    $parts = $entry -split '\|', 2
    $rel = $parts[0]
    $minSize = [int]$parts[1]
    $full = Join-Path $ProjectRoot $rel

    if (-not (Test-Path -PathType Leaf $full)) {
        Write-Fail "$rel  (no existe)"
        $script:Fail++
        continue
    }

    $size = (Get-Item $full).Length
    if ($size -lt $minSize) {
        Write-Warn "$rel  ($size B < $minSize B minimos - archivo truncado?)"
        $script:Warn++
    } else {
        Write-Ok "$rel  ($size B)"
        $script:Pass++
    }
}
Write-Host ""

# ============================================================================
# 3. Marcadores de version v3 / v3.1
# ============================================================================
Write-Host "[3] Marcadores de version v3/v3.1" -ForegroundColor White

$markers = @(
    "js\app.js|getPseudoKeyForSearch|Fase 2: mapeo de permutaciones",
    "js\app.js|executePermutation|Fase 2: 24 permutaciones",
    "js\app.js|Backlog B7|Backlog: velocidad universal",
    "js\app.js|highlight_range|Fase 2: Merge Sort resalta rango",
    "js\app.js|openStructureHelp|Ayuda contextual: apertura",
    "js\app.js|data-help|Ayuda contextual: delegacion de eventos",

    "js\sorting.js|Depende de brechas|Shell Sort corregido",
    "js\sorting.js|Garantiza O(n log n)|Heap Sort corregido",

    "js\searching.js|executePermutation|24 permutaciones",

    "js\pseudocode.js|binary_perm|Alias de pseudocodigo",

    "js\file_loader.js|async function loadPreset|Backlog B5: fetch + fallback",

    "js\benchmark.js|REPS = 5|Backlog B4: 5 repeticiones",
    "js\benchmark.js|'shell'|Shell en benchmark",

    "js\quiz.js|loadExternalBank|Backlog B2: banco expandible",
    "js\quiz.js|shuffle|Backlog B2: mezclar",

    "js\help_content.js|HelpContent|Ayuda: diccionario",
    "js\help_content.js|conceptosClave|Ayuda: definiciones",

    "js\structures\bst.js|_insertGen|BST paso a paso",
    "js\structures\bst.js|setSpeed|BST velocidad",
    "js\structures\bst.js|overflow-y: auto|BST scroll",

    "js\structures\avl.js|prepare-rotation|AVL rotaciones",
    "js\structures\avl.js|_rotateRight|AVL rotacion derecha",

    "js\structures\graph.js|_runToken|Grafo cancelacion",
    "js\structures\graph.js|setMode|Grafo modos",
    "js\structures\graph.js|graph-edge-weight-bg|Grafo pesos visibles",

    "js\structures\linked_list.js|_runToken|Lista cancelacion",
    "js\structures\linked_list.js|setSpeed|Lista velocidad",

    "js\structures\hash_table.js|__tombstone|Hash tombstones",
    "js\structures\hash_table.js|_runToken|Hash cancelacion",

    "index.html|bst-play-btn|BST botones paso",
    "index.html|avl-step-btn|AVL botones paso",
    "index.html|graph-mode-add-node|Grafo modos interactivos",
    "index.html|search-perm-select|Selector de permutaciones",
    "index.html|structure-help-modal-backdrop|Modal de ayuda",

    "css\styles.css|.btn-mode|Estilos modos",
    "css\styles.css|.graph-edge-weight-bg|Estilos pesos",
    "css\styles.css|.help-btn|Estilos boton ayuda",

    "datos\quiz_preguntas.json|preguntas|Banco externo de quiz"
)

foreach ($entry in $markers) {
    $script:Total++
    $parts = $entry -split '\|', 3
    $rel = $parts[0]
    $needle = $parts[1]
    $desc = $parts[2]
    $full = Join-Path $ProjectRoot $rel

    if (-not (Test-Path -PathType Leaf $full)) {
        Write-Fail "$rel - $desc (archivo ausente)"
        $script:Fail++
        continue
    }

    $content = Get-Content -Path $full -Raw -ErrorAction SilentlyContinue
    if ($content -and ($content.Contains($needle))) {
        Write-Ok $desc
        $script:Pass++
    } else {
        Write-Warn "$rel - $desc (marcador no encontrado)"
        $script:Warn++
    }
}
Write-Host ""

# ============================================================================
# 4. Resumen
# ============================================================================
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "   RESUMEN" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ("   Total de chequeos : {0}" -f $script:Total)
Write-Host ("   Pasados           : {0}" -f $script:Pass) -ForegroundColor Green
Write-Host ("   Advertencias      : {0}" -f $script:Warn) -ForegroundColor Yellow
Write-Host ("   Fallos            : {0}" -f $script:Fail) -ForegroundColor Red
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

if ($script:Fail -gt 0) {
    Write-Host "Estado: HAY FALLOS - revise los archivos marcados arriba." -ForegroundColor Red
    exit 1
} elseif ($script:Warn -gt 0) {
    Write-Host "Estado: HAY ADVERTENCIAS - el proyecto funciona pero revise los avisos." -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "Estado: TODO OK - el proyecto esta completo y parcheado a v3.1." -ForegroundColor Green
    exit 0
}

