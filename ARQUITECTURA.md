# Arquitectura — REA Estructuras de Datos y Algoritmos

Documento técnico para desarrolladores y docentes que deseen extender el REA.

## 1. Diagrama general de módulos

```mermaid
graph TD
  HTML[index.html<br/>13 paneles + topbar + sidebar] --> APP[app.js<br/>Orquestador]
  APP --> SORT[sorting.js<br/>7 generadores]
  APP --> SEARCH[searching.js<br/>linearSearch + executePermutation]
  APP --> RACE[race_mode.js<br/>2 generadores lockstep]
  APP --> BENCH[benchmark.js<br/>versiones síncronas ×5 reps]
  APP --> STRUCTS[js/structures/*.js<br/>7 visualizers]
  APP --> PSEUDO[pseudocode.js<br/>CODE_DATABASE]
  APP --> QUIZ[quiz.js<br/>QuizEngine]
  APP --> HELP[help_content.js<br/>HelpContent por panel]
  APP --> LOADER[file_loader.js<br/>fetch + fallback]
  SORT -.->|yields codeLine| PSEUDO
  SEARCH -.->|yields codeLine| PSEUDO
  STRUCTS -->|log via callback| APP
  LOADER -.->|presets desde /datos/ o embebidos| APP
  QUIZ -.->|preguntas desde /datos/quiz_preguntas.json| APP
  HELP -.->|contenido pedagógico| APP

