# Changelog — REA Estructuras de Datos y Algoritmos

Todas las modificaciones relevantes al proyecto. Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [3.1.0] — Sistema de ayuda contextual

### ✨ Agregado

- **Sistema de ayuda contextual** por módulo:
  - `js/help_content.js` con contenido pedagógico completo para los 13 paneles.
  - Botón `?` en el `card-header` de cada panel.
  - Modal reutilizable (`#structure-help-modal-backdrop`) con secciones:
    Conceptos clave, Cómo usar, Ejercicios sugeridos, Tips, Errores comunes.
  - Atajo de teclado `?` para abrir la ayuda del panel activo.
  - Cierre con `Escape` o clic fuera del modal.
- **CSS del sistema de ayuda** (apéndice v3.1): `.help-btn`, `.modal-card-wide`, `.help-dl`, etc.

## [3.0.0] — Backlog completo + mejoras pedagógicas

### ✨ Agregado

- **Cancelación real de animaciones async** (backlog B1):
  - Grafos, listas y hash usan `_runToken` para abortar corridas previas.
  - Al iniciar una nueva operación, la anterior se detiene en el próximo `await`.
- **Slider de velocidad universal** (backlog B7):
  - El slider de la sidebar ahora propaga a BST, AVL, grafos, listas y hash.
- **Quiz expandible** (backlog B2):
  - Carga desde `datos/quiz_preguntas.json` (con fallback embebido).
  - Botón "🔀 Mezclar" y "📥 Cargar banco .json".
- **Fix progress bar del Quiz** (backlog B3):
  - Ahora llega a 100% en la última pregunta.
- **Benchmark con timeMs preciso** (backlog B4):
  - 5 repeticiones por algoritmo/N, se toma el mínimo.
- **`file_loader` con fetch + fallback** (backlog B5):
  - `loadPreset()` async. Intenta leer el archivo físico, cae al embebido.
- **Test runner HTML** (backlog B6):
  - `tests/test_generadores.html` verifica los 7 algoritmos y las 24 permutaciones.
- **Scripts de verificación** (sanity check):
  - `scripts/sanity_check.sh`, `.ps1`, `.bat`.
- **Servidor Node minimalista**:
  - `scripts/serve.js` sin dependencias externas.
- **Lanzador interactivo** (`iniciar.bat`):
  - Menú con 6 opciones, detección de Python/Node, apertura directa o servidor.
- **Documentación**:
  - `LEEME_PRIMERO.txt`, `CHANGELOG.md`, `ARQUITECTURA.md` reescrito.

### 🔴 Corregido (Crítico)

- **`js/app.js` + `js/searching.js`**: las **24 Permutaciones de Búsqueda** nunca se ejecutaban.
  - `getPseudoKeyForSearch()` mapea `'binary_perm'` → `'bisection'`/`'trisection'`.
  - `initSearchGenerator()` invoca `SearchAlgorithms.executePermutation()`.
  - `initSearchingControls()` puebla y sincroniza los 4 selects de permutación.
- **`js/structures/hash_table.js`**: bug de tombstones en Sondeo Lineal.
  - Implementados tombstones (`{__tombstone: true}`), reciclados en `insert()` y saltados en `search()`.

### 🟠 Corregido (Factual / pedagógico)

- **`js/sorting.js`**: Heap Sort mal clasificado como `O(n²)`. Corregido a `O(n log n)`.
- **`js/sorting.js`**: Shell Sort con complejidad incorrecta. Corregido a `Depende de brechas`.
- **`js/searching.js`**: `codeLine` faltantes en trisección + conteo de comparaciones.
- **`js/benchmark.js`**: faltaba Shell Sort. Ahora las 7 curvas se renderizan.
- **`js/app.js`**: `highlight_range` (Merge Sort) no se renderizaba.

### ✨ Agregado (UI / UX)

- **BST paso a paso**: `insert()`, `search()` y `delete()` ahora son generadores.
- **AVL paso a paso**: idem + logs explícitos de rotaciones (LL, RR, LR, RL).
- **BST/AVL canvas dinámico**: altura crece con la profundidad. Scroll vertical.
- **Grafos con modos interactivos**: 5 modos (Ninguno, Add nodo, Add arista, Del nodo, Del arista).
- **Grafos con aristas más visibles**: peso en badge circular con borde azul.

---

## [2.0.0] — Correcciones críticas y Fase 2

### 🔴 Corregido

- 24 Permutaciones de búsqueda cableadas de punta a punta.
- Tombstones en Hash (sondeo lineal).
- Heap Sort `O(n log n)`.
- Shell Sort con complejidad correcta.
- `highlight_range` de Merge Sort renderizado.

### ✨ Agregado

- BST/AVL paso a paso.
- Modos interactivos del grafo.
- Aristas más visibles.
- Fix del selector de permutaciones.

---

## [1.0.0] — Versión original

- Estructura completa del REA: 13 paneles, 7 estructuras, 7 algoritmos de sorting,
  24 permutaciones de búsqueda, benchmark y quiz.
- Sistema de generadores + trazador de pseudocódigo en vivo.
- Modo alto contraste (WCAG 2.1 AA/AAA).
- Carga de datasets desde CSV / TXT / JSON + presets embebidos.
- Autoría dinámica desde `autor.txt`.
- Licencia CC BY-NC 4.0.

