# Tests

## Ejecución

Abrir `tests/test_generadores.html` en un navegador. No requiere servidor.

## Qué se prueba

- **Sorting**: los 7 algoritmos devuelven un arreglo ordenado, con la misma longitud y los mismos elementos.
- **Searching**:
  - `linearSearch` encuentra un valor existente y devuelve el índice correcto.
  - `SearchAlgorithms.PERMUTATIONS` tiene exactamente 24 entradas.
  - Las 24 permutaciones **encuentran** un valor que existe en el arreglo.
  - Las 24 permutaciones **terminan** correctamente (no entran en loop) cuando el valor no existe.

## Cómo agregar tests

En `test_generadores.html`, usar la función `assert(nombre, condición, detalle)`.
Los resultados se acumulan y se muestran con colores.

## Ejemplo

```js
const { final } = runGen(SortingAlgorithms.bubbleSort, [3, 1, 2]);
assert('bubble ordena [3,1,2]', isSorted(final));

