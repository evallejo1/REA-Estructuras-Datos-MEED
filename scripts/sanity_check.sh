#!/usr/bin/env bash
# ============================================================================
# sanity_check.sh
# Verificacion de integridad del REA Estructuras de Datos y Algoritmos (v3.1)
#
# Uso:
#   bash sanity_check.sh
#   bash sanity_check.sh /ruta/al/proyecto
#
# Codigos de salida:
#   0 = todo OK
#   1 = hay advertencias o fallos
#   2 = error de invocacion
# ============================================================================

set -u

# ---- Colores ---------------------------------------------------------------
if [ -t 1 ]; then
  R=$'\033[0m'; B=$'\033[1m'
  RED=$'\033[31m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'
  BLUE=$'\033[34m'; DIM=$'\033[2m'
else
  R=''; B=''; RED=''; GREEN=''; YELLOW=''; BLUE=''; DIM=''
fi

ok()   { printf "  ${GREEN}OK${R}  %s\n" "$1"; }
warn() { printf "  ${YELLOW}!${R}   %s\n" "$1"; }
fail() { printf "  ${RED}X${R}   %s\n" "$1"; }

# ---- Localizar la raiz del proyecto ----------------------------------------
PROJECT_ROOT="${1:-}"
if [ -z "$PROJECT_ROOT" ]; then
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  DIR="$SCRIPT_DIR"
  while [ "$DIR" != "/" ] && [ ! -f "$DIR/index.html" ]; do
    DIR="$(dirname "$DIR")"
  done
  if [ ! -f "$DIR/index.html" ]; then
    printf "${RED}No se encontro index.html subiendo desde %s${R}\n" "$SCRIPT_DIR"
    printf "Uso: bash %s /ruta/al/proyecto\n" "$0"
    exit 2
  fi
  PROJECT_ROOT="$DIR"
fi

if [ ! -d "$PROJECT_ROOT" ]; then
  printf "${RED}La ruta no existe: %s${R}\n" "$PROJECT_ROOT"
  exit 2
fi

PROJECT_ROOT="$(cd "$PROJECT_ROOT" && pwd)"

printf "\n"
printf "${B}${BLUE}=================================================================${R}\n"
printf "${B}${BLUE}   Sanity Check - REA Estructuras de Datos y Algoritmos (v3.1)${R}\n"
printf "${B}${BLUE}=================================================================${R}\n"
printf "   Proyecto: ${DIM}%s${R}\n\n" "$PROJECT_ROOT"

TOTAL=0; PASS=0; WARN=0; FAIL=0

# ============================================================================
# 1. Directorios esperados
# ============================================================================
printf "${B}[1] Estructura de directorios${R}\n"

for d in "css" "js" "js/structures" "datos" "tests" "scripts"; do
  TOTAL=$((TOTAL+1))
  if [ -d "$PROJECT_ROOT/$d" ]; then
    ok "$d/"
    PASS=$((PASS+1))
  else
    fail "$d/  (falta el directorio)"
    FAIL=$((FAIL+1))
  fi
done
printf "\n"

# ============================================================================
# 2. Archivos esperados (ruta|tamano minimo en bytes)
# ============================================================================
printf "${B}[2] Archivos del proyecto${R}\n"

FILES=(
  "index.html|10000"
  "autor.txt|1"
  "iniciar.bat|1000"
  "LEEME_PRIMERO.txt|500"
  "README.md|200"
  "CHANGELOG.md|200"
  "ARQUITECTURA.md|200"

  "css/styles.css|1500"

  "js/app.js|15000"
  "js/file_loader.js|3000"
  "js/sorting.js|8000"
  "js/searching.js|5000"
  "js/pseudocode.js|2000"
  "js/race_mode.js|2000"
  "js/benchmark.js|3000"
  "js/quiz.js|3000"
  "js/help_content.js|4000"

  "js/structures/stack.js|1500"
  "js/structures/queue.js|1500"
  "js/structures/linked_list.js|3000"
  "js/structures/bst.js|5000"
  "js/structures/avl.js|5000"
  "js/structures/graph.js|5000"
  "js/structures/hash_table.js|3000"

  "datos/README.md|50"
  "datos/datos_numeros.csv|50"
  "datos/datos_valores.txt|30"
  "datos/datos_estudiantes.json|100"
  "datos/datos_inversos.csv|50"
  "datos/quiz_preguntas.json|500"

  "tests/test_generadores.html|2000"
  "tests/README.md|100"

  "scripts/sanity_check.sh|1000"
  "scripts/sanity_check.ps1|1000"
  "scripts/sanity_check.bat|200"
  "scripts/serve.js|1000"
)

for entry in "${FILES[@]}"; do
  path="${entry%%|*}"
  minsize="${entry##*|}"
  TOTAL=$((TOTAL+1))
  full="$PROJECT_ROOT/$path"

  if [ ! -f "$full" ]; then
    fail "$path  (no existe)"
    FAIL=$((FAIL+1))
    continue
  fi

  size=$(wc -c < "$full" | tr -d ' ')
  if [ "$size" -lt "$minsize" ]; then
    warn "$path  (${size}B < ${minsize}B minimos - archivo truncado?)"
    WARN=$((WARN+1))
  else
    ok "$path  ${DIM}(${size}B)${R}"
    PASS=$((PASS+1))
  fi
done
printf "\n"

# ============================================================================
# 3. Marcadores de version v3 / v3.1
# ============================================================================
printf "${B}[3] Marcadores de version v3/v3.1${R}\n"

MARKERS=(
  "js/app.js|getPseudoKeyForSearch|Fase 2: mapeo de permutaciones"
  "js/app.js|executePermutation|Fase 2: 24 permutaciones"
  "js/app.js|Backlog B7|Backlog: velocidad universal"
  "js/app.js|highlight_range|Fase 2: Merge Sort resalta rango"
  "js/app.js|openStructureHelp|Ayuda contextual: apertura"
  "js/app.js|data-help|Ayuda contextual: delegacion de eventos"

  "js/sorting.js|Depende de brechas|Shell Sort corregido"
  "js/sorting.js|Garantiza O(n log n)|Heap Sort corregido"

  "js/searching.js|executePermutation|24 permutaciones"

  "js/pseudocode.js|binary_perm|Alias de pseudocodigo"

  "js/file_loader.js|async function loadPreset|Backlog B5: fetch + fallback"

  "js/benchmark.js|REPS = 5|Backlog B4: 5 repeticiones"
  "js/benchmark.js|'shell'|Shell en benchmark"

  "js/quiz.js|loadExternalBank|Backlog B2: banco expandible"
  "js/quiz.js|shuffle|Backlog B2: mezclar"

  "js/help_content.js|HelpContent|Ayuda: diccionario"
  "js/help_content.js|conceptosClave|Ayuda: definiciones"

  "js/structures/bst.js|_insertGen|BST paso a paso"
  "js/structures/bst.js|setSpeed|BST velocidad"
  "js/structures/bst.js|overflow-y: auto|BST scroll"

  "js/structures/avl.js|prepare-rotation|AVL rotaciones"
  "js/structures/avl.js|_rotateRight|AVL rotacion derecha"

  "js/structures/graph.js|_runToken|Grafo cancelacion"
  "js/structures/graph.js|setMode|Grafo modos"
  "js/structures/graph.js|graph-edge-weight-bg|Grafo pesos visibles"

  "js/structures/linked_list.js|_runToken|Lista cancelacion"
  "js/structures/linked_list.js|setSpeed|Lista velocidad"

  "js/structures/hash_table.js|__tombstone|Hash tombstones"
  "js/structures/hash_table.js|_runToken|Hash cancelacion"

  "index.html|bst-play-btn|BST botones paso"
  "index.html|avl-step-btn|AVL botones paso"
  "index.html|graph-mode-add-node|Grafo modos interactivos"
  "index.html|search-perm-select|Selector de permutaciones"
  "index.html|structure-help-modal-backdrop|Modal de ayuda"

  "css/styles.css|.btn-mode|Estilos modos"
  "css/styles.css|.graph-edge-weight-bg|Estilos pesos"
  "css/styles.css|.help-btn|Estilos boton ayuda"

  "datos/quiz_preguntas.json|preguntas|Banco externo de quiz"
)

for entry in "${MARKERS[@]}"; do
  path="${entry%%|*}"
  rest="${entry#*|}"
  needle="${rest%%|*}"
  desc="${rest#*|}"
  TOTAL=$((TOTAL+1))
  full="$PROJECT_ROOT/$path"

  if [ ! -f "$full" ]; then
    fail "$path - $desc (archivo ausente)"
    FAIL=$((FAIL+1))
    continue
  fi

  if grep -qF -- "$needle" "$full" 2>/dev/null; then
    ok "$desc"
    PASS=$((PASS+1))
  else
    warn "$path - $desc (marcador no encontrado)"
    WARN=$((WARN+1))
  fi
done
printf "\n"

# ============================================================================
# 4. Resumen
# ============================================================================
printf "${B}${BLUE}=================================================================${R}\n"
printf "${B}${BLUE}   RESUMEN${R}\n"
printf "${B}${BLUE}=================================================================${R}\n"
printf "   Total de chequeos : %d\n" "$TOTAL"
printf "   ${GREEN}Pasados${R}           : %d\n" "$PASS"
printf "   ${YELLOW}Advertencias${R}      : %d\n" "$WARN"
printf "   ${RED}Fallos${R}            : %d\n" "$FAIL"
printf "${B}${BLUE}=================================================================${R}\n\n"

if [ "$FAIL" -gt 0 ]; then
  printf "${RED}${B}Estado: HAY FALLOS - revise los archivos marcados arriba.${R}\n\n"
  exit 1
elif [ "$WARN" -gt 0 ]; then
  printf "${YELLOW}${B}Estado: HAY ADVERTENCIAS - el proyecto funciona pero revise los avisos.${R}\n\n"
  exit 1
else
  printf "${GREEN}${B}Estado: TODO OK - el proyecto esta completo y parcheado a v3.1.${R}\n\n"
  exit 0
fi

