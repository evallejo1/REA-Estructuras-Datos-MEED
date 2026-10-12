# Laboratorio Visual de Estructuras de Datos y Algoritmos (REA)

**Recurso Educativo Abierto** para la enseñanza inicial de estructuras de datos y análisis de complejidad algorítmica en carreras universitarias de Informática.

## 📋 Características

- **13 paneles interactivos** en una SPA vanilla (0 dependencias externas).
- **7 algoritmos de ordenamiento** con trazador de pseudocódigo en vivo.
- **24 Permutaciones de búsqueda** (Bisección + Trisección, con 3 sesgos de segmento y 4 reglas de límites).
- **7 estructuras de datos**: Pila, Cola, Lista Enlazada, BST, AVL, Grafo Ponderado, Tabla Hash.
- **Race Mode**: comparación en paralelo de dos algoritmos con step-lock.
- **Benchmark empírico**: 7 algoritmos × 6 tamaños de N, con curvas SVG y exportación CSV.
- **Quiz didáctico**: banco de preguntas expandible desde JSON.
- **Paso a paso** en BST, AVL, ordenamiento y búsqueda.
- **Modo alto contraste** (WCAG 2.1 AA/AAA, pautas UNSL).
- **Sistema de ayuda contextual** por módulo (botón `?` en cada panel).
- **Autoría dinámica** desde `autor.txt`.

## 🚀 Cómo ejecutar

### Opción 1 — Doble clic (recomendado para uso rápido)
Haga doble clic en `iniciar.bat` y elija la opción **[1]** en el menú. Los presets están embebidos en `file_loader.js`, así que funciona desde `file://` sin necesidad de servidor.

### Opción 2 — Servidor local (recomendado para desarrollo)
Desde `iniciar.bat`, elegir:
- **[2]** si tiene Python instalado → `http://localhost:8000`
- **[3]** si tiene Node.js instalado → `http://localhost:8080`

Esto habilita además la lectura automática de `autor.txt` vía `fetch` y del banco de preguntas `datos/quiz_preguntas.json`.

### Opción 3 — Servidor manual
```bash
# Python
python3 -m http.server 8000

# Node.js
node scripts/serve.js 8080

