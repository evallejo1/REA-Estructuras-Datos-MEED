/**
 * sorting.js
 * Motor de algoritmos de ordenación basado en generadores de estados paso a paso.
 * Incluye mapeo de líneas de pseudocódigo (codeLine) para trazado didáctico.
 *
 * [PATCH Fase 2]
 *  - Corregida complejidad de Heap Sort en peor caso (O(n log n), no O(n²)).
 *  - Corregida la complejidad de Shell Sort (depende de la secuencia de brechas).
 *  - Documentado que la métrica 'swaps' también cuenta desplazamientos.
 */

const SortingAlgorithms = (() => {
  const ALGORITHM_INFO = {
    bubble: {
      nombre: 'Bubble Sort (Burbuja)',
      mejorCaso: 'O(n)',
      casoPromedio: 'O(n²)',
      peorCaso: 'O(n²)',
      espacio: 'O(1)',
      estable: true,
      descripcion: 'Compara pares de elementos adyacentes e intercambia aquellos que están en orden incorrecto. En cada pasada, el elemento más grande "burbujea" hasta su posición final.'
    },
    selection: {
      nombre: 'Selection Sort (Selección)',
      mejorCaso: 'O(n²)',
      casoPromedio: 'O(n²)',
      peorCaso: 'O(n²)',
      espacio: 'O(1)',
      estable: false,
      descripcion: 'Divide la lista en una sublista ordenada y otra no ordenada. Busca repetidamente el elemento mínimo de la sublista no ordenada y lo intercambia con el primer elemento no ordenado.'
    },
    insertion: {
      nombre: 'Insertion Sort (Inserción)',
      mejorCaso: 'O(n)',
      casoPromedio: 'O(n²)',
      peorCaso: 'O(n²)',
      espacio: 'O(1)',
      estable: true,
      descripcion: 'Construye la lista ordenada de forma incremental insertando cada nuevo elemento en su posición relativa correcta, desplazando los elementos mayores hacia la derecha.'
    },
    merge: {
      nombre: 'Merge Sort (Mezcla)',
      mejorCaso: 'O(n log n)',
      casoPromedio: 'O(n log n)',
      peorCaso: 'O(n log n)',
      espacio: 'O(n)',
      estable: true,
      descripcion: 'Algoritmo divide y vencerás. Divide la lista recursivamente en dos mitades hasta llegar a listas de 1 elemento, y luego fusiona (merge) las mitades de forma ordenada.'
    },
    quick: {
      nombre: 'Quick Sort (Rápido)',
      mejorCaso: 'O(n log n)',
      casoPromedio: 'O(n log n)',
      peorCaso: 'O(n²)',
      espacio: 'O(log n)',
      estable: false,
      descripcion: 'Selecciona un elemento como pivote y particiona el arreglo de forma que todos los elementos menores al pivote queden a la izquierda y los mayores a la derecha. Aplica recursión.'
    },
    heap: {
      nombre: 'Heap Sort (Montículo)',
      mejorCaso: 'O(n log n)',
      casoPromedio: 'O(n log n)',
      peorCaso: 'O(n log n)',
      espacio: 'O(1)',
      estable: false,
      descripcion: 'Convierte el arreglo en un Max-Heap (árbol binario completo donde la raíz es mayor que sus hijos). Extrae repetidamente el valor máximo de la raíz y reconstruye el heap. Garantiza O(n log n) en mejor, promedio y peor caso, in-place.'
    },
    shell: {
      nombre: 'Shell Sort (Brechas)',
      mejorCaso: 'O(n log n)',
      casoPromedio: 'Depende de brechas',
      peorCaso: 'O(n²)',
      espacio: 'O(1)',
      estable: false,
      descripcion: 'Generalización de Insertion Sort que permite intercambios de elementos distantes usando una secuencia decreciente de intervalos (gaps). La complejidad depende críticamente de la secuencia: esta implementación usa la secuencia original de Shell (n/2, n/4, …, 1), cuyo peor caso es Θ(n²). Otras secuencias como Knuth o Sedgewick ofrecen mejores cotas asintóticas.'
    }
  };

  /**
   * NOTA DIDÁCTICA: el campo 'swaps' en los generadores cuenta,
   * además de swaps reales, los DESPLAZAMIENTOS y ESCRITURAS de celdas
   * (Insertion, Merge, Shell).
   */

  function* bubbleSort(array) {
    const arr = [...array];
    const n = arr.length;
    let comparisons = 0;
    let swaps = 0;
    let swapped = false;

    for (let i = 0; i < n - 1; i++) {
      swapped = false;
      for (let j = 0; j < n - i - 1; j++) {
        comparisons++;
        yield {
          type: 'compare',
          indices: [j, j + 1],
          array: [...arr],
          comparisons,
          swaps,
          codeLine: 5,
          description: `Comparando arr[${j}] = ${arr[j]} con arr[${j + 1}] = ${arr[j + 1]}`
        };

        if (arr[j] > arr[j + 1]) {
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          swaps++;
          swapped = true;

          yield {
            type: 'swap',
            indices: [j, j + 1],
            array: [...arr],
            comparisons,
            swaps,
            codeLine: 6,
            description: `Intercambio: ${arr[j + 1]} > ${arr[j]} -> swapped arr[${j}] y arr[${j + 1}]`
          };
        }
      }

      yield {
        type: 'sorted_index',
        index: n - 1 - i,
        array: [...arr],
        comparisons,
        swaps,
        codeLine: 3,
        description: `Elemento arr[${n - 1 - i}] = ${arr[n - 1 - i]} fijado en su posición final.`
      };

      if (!swapped) break;
    }

    yield {
      type: 'complete',
      array: [...arr],
      comparisons,
      swaps,
      codeLine: 7,
      description: `Ordenamiento completado con éxito. Total comparaciones: ${comparisons}, intercambios: ${swaps}.`
    };
  }

  function* selectionSort(array) {
    const arr = [...array];
    const n = arr.length;
    let comparisons = 0;
    let swaps = 0;

    for (let i = 0; i < n; i++) {
      let minIdx = i;

      yield {
        type: 'highlight_special',
        indices: [i],
        role: 'pivot',
        array: [...arr],
        comparisons,
        swaps,
        codeLine: 3,
        description: `Buscando el mínimo a partir del índice ${i} (mínimo tentativo: arr[${minIdx}] = ${arr[minIdx]}).`
      };

      for (let j = i + 1; j < n; j++) {
        comparisons++;
        yield {
          type: 'compare',
          indices: [minIdx, j],
          array: [...arr],
          comparisons,
          swaps,
          codeLine: 5,
          description: `Comparando arr[${j}] = ${arr[j]} con mínimo actual arr[${minIdx}] = ${arr[minIdx]}`
        };

        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          yield {
            type: 'highlight_special',
            indices: [minIdx],
            role: 'min',
            array: [...arr],
            comparisons,
            swaps,
            codeLine: 5,
            description: `Nuevo mínimo encontrado: arr[${minIdx}] = ${arr[minIdx]}`
          };
        }
      }

      if (minIdx !== i) {
        const temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;
        swaps++;

        yield {
          type: 'swap',
          indices: [i, minIdx],
          array: [...arr],
          comparisons,
          swaps,
          codeLine: 7,
          description: `Intercambiando mínimo arr[${minIdx}] a la posición ${i}`
        };
      }

      yield {
        type: 'sorted_index',
        index: i,
        array: [...arr],
        comparisons,
        swaps,
        codeLine: 2,
        description: `Elemento arr[${i}] = ${arr[i]} ordenado definitivamente.`
      };
    }

    yield {
      type: 'complete',
      array: [...arr],
      comparisons,
      swaps,
      codeLine: 8,
      description: `Selection Sort finalizado. Comparaciones: ${comparisons}, Intercambios: ${swaps}.`
    };
  }

  function* insertionSort(array) {
    const arr = [...array];
    const n = arr.length;
    let comparisons = 0;
    let swaps = 0;

    for (let i = 1; i < n; i++) {
      const key = arr[i];
      let j = i - 1;

      yield {
        type: 'highlight_special',
        indices: [i],
        role: 'key',
        array: [...arr],
        comparisons,
        swaps,
        codeLine: 3,
        description: `Elemento clave a insertar: arr[${i}] = ${key}`
      };

      while (j >= 0) {
        comparisons++;
        yield {
          type: 'compare',
          indices: [j, j + 1],
          array: [...arr],
          comparisons,
          swaps,
          codeLine: 4,
          description: `Comparando clave ${key} con arr[${j}] = ${arr[j]}`
        };

        if (arr[j] > key) {
          arr[j + 1] = arr[j];
          swaps++; // En realidad es un desplazamiento, no un swap
          yield {
            type: 'set',
            index: j + 1,
            value: arr[j],
            array: [...arr],
            comparisons,
            swaps,
            codeLine: 5,
            description: `Desplazando arr[${j}] a posición ${j + 1}`
          };
          j--;
        } else {
          break;
        }
      }

      arr[j + 1] = key;
      yield {
        type: 'set',
        index: j + 1,
        value: key,
        array: [...arr],
        comparisons,
        swaps,
        codeLine: 7,
        description: `Insertando clave ${key} en posición final ${j + 1}`
      };
    }

    yield {
      type: 'complete',
      array: [...arr],
      comparisons,
      swaps,
      codeLine: 8,
      description: `Insertion Sort completado.`
    };
  }

  function* mergeSort(array) {
    const arr = [...array];
    let comparisons = 0;
    let swaps = 0;

    function* mergeHelper(start, end) {
      if (start >= end) return;
      const mid = Math.floor((start + end) / 2);

      yield* mergeHelper(start, mid);
      yield* mergeHelper(mid + 1, end);

      const left = arr.slice(start, mid + 1);
      const right = arr.slice(mid + 1, end + 1);
      let i = 0, j = 0, k = start;

      yield {
        type: 'highlight_range',
        start,
        end,
        array: [...arr],
        comparisons,
        swaps,
        codeLine: 6,
        description: `Fusionando subarreglos [${start}..${mid}] y [${mid + 1}..${end}]`
      };

      while (i < left.length && j < right.length) {
        comparisons++;
        yield {
          type: 'compare',
          indices: [start + i, mid + 1 + j],
          array: [...arr],
          comparisons,
          swaps,
          codeLine: 6,
          description: `Comparando izquierdo ${left[i]} con derecho ${right[j]}`
        };

        if (left[i] <= right[j]) {
          arr[k] = left[i];
          i++;
        } else {
          arr[k] = right[j];
          j++;
        }
        swaps++;
        yield {
          type: 'set',
          index: k,
          value: arr[k],
          array: [...arr],
          comparisons,
          swaps,
          codeLine: 6,
          description: `Colocando ${arr[k]} en la posición ${k}`
        };
        k++;
      }

      while (i < left.length) {
        arr[k] = left[i];
        swaps++;
        yield {
          type: 'set',
          index: k,
          value: arr[k],
          array: [...arr],
          comparisons,
          swaps,
          codeLine: 6,
          description: `Vaciando resto izquierdo: ${arr[k]} en arr[${k}]`
        };
        i++;
        k++;
      }

      while (j < right.length) {
        arr[k] = right[j];
        swaps++;
        yield {
          type: 'set',
          index: k,
          value: arr[k],
          array: [...arr],
          comparisons,
          swaps,
          codeLine: 6,
          description: `Vaciando resto derecho: ${arr[k]} en arr[${k}]`
        };
        j++;
        k++;
      }
    }

    yield* mergeHelper(0, arr.length - 1);

    yield {
      type: 'complete',
      array: [...arr],
      comparisons,
      swaps,
      codeLine: 7,
      description: `Merge Sort finalizado con éxito.`
    };
  }

  function* quickSort(array) {
    const arr = [...array];
    let comparisons = 0;
    let swaps = 0;

    function* quickHelper(low, high) {
      if (low < high) {
        const pivot = arr[high];
        let i = low - 1;

        yield {
          type: 'highlight_special',
          indices: [high],
          role: 'pivot',
          array: [...arr],
          comparisons,
          swaps,
          codeLine: 3,
          description: `Pivote seleccionado: arr[${high}] = ${pivot}`
        };

        for (let j = low; j < high; j++) {
          comparisons++;
          yield {
            type: 'compare',
            indices: [j, high],
            array: [...arr],
            comparisons,
            swaps,
            codeLine: 5,
            description: `Comparando arr[${j}] = ${arr[j]} con pivote ${pivot}`
          };

          if (arr[j] < pivot) {
            i++;
            if (i !== j) {
              const temp = arr[i];
              arr[i] = arr[j];
              arr[j] = temp;
              swaps++;
              yield {
                type: 'swap',
                indices: [i, j],
                array: [...arr],
                comparisons,
                swaps,
                codeLine: 5,
                description: `Partición: arr[${i}] = ${arr[i]} intercambiado con arr[${j}] = ${arr[j]}`
              };
            }
          }
        }

        const temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;
        swaps++;

        yield {
          type: 'swap',
          indices: [i + 1, high],
          array: [...arr],
          comparisons,
          swaps,
          codeLine: 6,
          description: `Pivote ${arr[i + 1]} colocado en posición final ${i + 1}`
        };

        yield {
          type: 'sorted_index',
          index: i + 1,
          array: [...arr],
          comparisons,
          swaps,
          codeLine: 6,
          description: `Pivote en arr[${i + 1}] asegurado.`
        };

        const pi = i + 1;
        yield* quickHelper(low, pi - 1);
        yield* quickHelper(pi + 1, high);
      } else if (low === high) {
        yield {
          type: 'sorted_index',
          index: low,
          array: [...arr],
          comparisons,
          swaps,
          codeLine: 7,
          description: `Elemento arr[${low}] ordenado.`
        };
      }
    }

    yield* quickHelper(0, arr.length - 1);

    yield {
      type: 'complete',
      array: [...arr],
      comparisons,
      swaps,
      codeLine: 8,
      description: `Quick Sort completado.`
    };
  }

  function* heapSort(array) {
    const arr = [...array];
    const n = arr.length;
    let comparisons = 0;
    let swaps = 0;

    function* heapify(size, root) {
      let largest = root;
      const left = 2 * root + 1;
      const right = 2 * root + 2;

      if (left < size) {
        comparisons++;
        yield {
          type: 'compare',
          indices: [left, largest],
          array: [...arr],
          comparisons,
          swaps,
          codeLine: 5,
          description: `Heapify: arr[${left}] con arr[${largest}]`
        };
        if (arr[left] > arr[largest]) largest = left;
      }

      if (right < size) {
        comparisons++;
        yield {
          type: 'compare',
          indices: [right, largest],
          array: [...arr],
          comparisons,
          swaps,
          codeLine: 5,
          description: `Heapify: arr[${right}] con arr[${largest}]`
        };
        if (arr[right] > arr[largest]) largest = right;
      }

      if (largest !== root) {
        const temp = arr[root];
        arr[root] = arr[largest];
        arr[largest] = temp;
        swaps++;

        yield {
          type: 'swap',
          indices: [root, largest],
          array: [...arr],
          comparisons,
          swaps,
          codeLine: 5,
          description: `Reorganizando montículo: arr[${root}] <-> arr[${largest}]`
        };

        yield* heapify(size, largest);
      }
    }

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      yield* heapify(n, i);
    }

    for (let i = n - 1; i > 0; i--) {
      const temp = arr[0];
      arr[0] = arr[i];
      arr[i] = temp;
      swaps++;

      yield {
        type: 'swap',
        indices: [0, i],
        array: [...arr],
        comparisons,
        swaps,
        codeLine: 4,
        description: `Moviendo raíz máxima a posición final ${i}`
      };

      yield {
        type: 'sorted_index',
        index: i,
        array: [...arr],
        comparisons,
        swaps,
        codeLine: 4,
        description: `Elemento arr[${i}] ordenado definitivamente.`
      };

      yield* heapify(i, 0);
    }

    yield {
      type: 'sorted_index',
      index: 0,
      array: [...arr],
      comparisons,
      swaps,
      codeLine: 6,
      description: `Raíz fijada.`
    };

    yield {
      type: 'complete',
      array: [...arr],
      comparisons,
      swaps,
      codeLine: 6,
      description: `Heap Sort completado.`
    };
  }

  function* shellSort(array) {
    const arr = [...array];
    const n = arr.length;
    let comparisons = 0;
    let swaps = 0;

    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
      yield {
        type: 'info',
        array: [...arr],
        comparisons,
        swaps,
        codeLine: 2,
        description: `Iniciando pase con brecha (gap) = ${gap}`
      };

      for (let i = gap; i < n; i++) {
        const temp = arr[i];
        let j = i;

        while (j >= gap) {
          comparisons++;
          yield {
            type: 'compare',
            indices: [j - gap, i],
            array: [...arr],
            comparisons,
            swaps,
            codeLine: 5,
            description: `Comparando salto: arr[${j - gap}] con ${temp}`
          };

          if (arr[j - gap] > temp) {
            arr[j] = arr[j - gap];
            swaps++;
            yield {
              type: 'set',
              index: j,
              value: arr[j - gap],
              array: [...arr],
              comparisons,
              swaps,
              codeLine: 6,
              description: `Desplazando por brecha`
            };
            j -= gap;
          } else {
            break;
          }
        }

        arr[j] = temp;
        yield {
          type: 'set',
          index: j,
          value: temp,
          array: [...arr],
          comparisons,
          swaps,
          codeLine: 7,
          description: `Insertando ${temp} en arr[${j}]`
        };
      }
    }

    yield {
      type: 'complete',
      array: [...arr],
      comparisons,
      swaps,
      codeLine: 8,
      description: `Shell Sort terminado.`
    };
  }

  return {
    ALGORITHM_INFO,
    bubbleSort,
    selectionSort,
    insertionSort,
    mergeSort,
    quickSort,
    heapSort,
    shellSort
  };
})();

