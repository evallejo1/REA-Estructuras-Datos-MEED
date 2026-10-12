/**
 * searching.js
 * Motor de algoritmos de búsqueda: Búsqueda Lineal y las 24 Permutaciones
 * de Búsqueda Binaria divididas en Bisección y Trisección.
 *
 * [PATCH Fase 2] codeLine en trisección + conteo de comparaciones corregido.
 */

const SearchAlgorithms = (() => {
  const PERMUTATIONS = [];

  const DIVISIONES = [
    { key: 'bisection', label: 'Bisección (2 subintervalos)', factor: 2 },
    { key: 'trisection', label: 'Trisección (3 subintervalos)', factor: 3 }
  ];

  const SEGMENTOS = [
    { key: 'left', label: 'Segmento Izquierdo Mayor (Sesgo Izq)' },
    { key: 'center', label: 'Segmento Central Mayor (Equitativo/Centro)' },
    { key: 'right', label: 'Segmento Derecho Mayor (Sesgo Der)' }
  ];

  const LIMITES = [
    { key: 'strict', label: 'Límites Estrictos Exclusivos (mid ± 1 / m1,m2 ± 1)', desc: 'Descarta el punto medio evaluado en ambos extremos' },
    { key: 'lower_inclusive', label: 'Límite Inferior Inclusivo (low = mid, high = mid - 1)', desc: 'Retiene el extremo inferior evaluado' },
    { key: 'upper_inclusive', label: 'Límite Superior Inclusivo (low = mid + 1, high = mid)', desc: 'Retiene el extremo superior evaluado' },
    { key: 'bilateral_inclusive', label: 'Límites Conducentes Inclusivos (low = mid, high = mid)', desc: 'Convergencia conservadora en ambos extremos' }
  ];

  let idCounter = 1;
  DIVISIONES.forEach(div => {
    SEGMENTOS.forEach(seg => {
      LIMITES.forEach(lim => {
        const id = idCounter++;
        const idStr = String(id).padStart(2, '0');
        PERMUTATIONS.push({
          id,
          code: `P-${idStr}`,
          division: div.key,
          divisionLabel: div.label,
          segmento: seg.key,
          segmentoLabel: seg.label,
          limite: lim.key,
          limiteLabel: lim.label,
          limiteDesc: lim.desc,
          nombre: `[P${idStr}] ${div.key === 'bisection' ? 'Bisección' : 'Trisección'} | Seg. ${seg.key.toUpperCase()} | ${lim.label}`
        });
      });
    });
  });

  const SEARCH_INFO = {
    linear: {
      nombre: 'Búsqueda Lineal (Secuencial)',
      mejorCaso: 'O(1)',
      casoPromedio: 'O(n)',
      peorCaso: 'O(n)',
      espacio: 'O(1)',
      requisito: 'Ninguno (funciona en listas desordenadas u ordenadas)',
      descripcion: 'Examina cada elemento secuencialmente desde el inicio hasta encontrar el valor objetivo o recorrer toda la colección.'
    },
    bisection: {
      nombre: 'Búsqueda por Bisección (Binary Search)',
      mejorCaso: 'O(1)',
      casoPromedio: 'O(log₂ n)',
      peorCaso: 'O(log₂ n)',
      espacio: 'O(1)',
      requisito: 'El arreglo DEBE estar ordenado previamente',
      descripcion: 'Divide el espacio en 2 subintervalos evaluando un punto medio (mid). Reduce el espacio a la mitad en cada paso.'
    },
    trisection: {
      nombre: 'Búsqueda por Trisección (Ternary Search)',
      mejorCaso: 'O(1)',
      casoPromedio: 'O(log₃ n)',
      peorCaso: 'O(log₃ n)',
      espacio: 'O(1)',
      requisito: 'El arreglo DEBE estar ordenado previamente',
      descripcion: 'Divide el espacio en 3 subintervalos evaluando dos puntos tercios (m1 y m2). Reduce el espacio a un tercio en cada paso.'
    }
  };

  function* linearSearch(array, target) {
    const arr = [...array];
    let comparisons = 0;

    yield {
      type: 'start',
      array: [...arr],
      target,
      comparisons,
      codeLine: 2,
      description: `Iniciando búsqueda lineal del objetivo ${target}`
    };

    for (let i = 0; i < arr.length; i++) {
      comparisons++;
      yield {
        type: 'inspect',
        index: i,
        array: [...arr],
        target,
        comparisons,
        codeLine: 3,
        description: `Inspeccionando índice ${i}: arr[${i}] = ${arr[i]} frente al objetivo ${target}`
      };

      if (arr[i] === target) {
        yield {
          type: 'found',
          index: i,
          array: [...arr],
          target,
          comparisons,
          codeLine: 4,
          description: `¡OBJETIVO ENCONTRADO! arr[${i}] = ${target} tras ${comparisons} comparaciones.`
        };
        return;
      }
    }

    yield {
      type: 'not_found',
      array: [...arr],
      target,
      comparisons,
      codeLine: 5,
      description: `Búsqueda finalizada: El valor ${target} NO se encuentra en la colección.`
    };
  }

  function* executePermutation(permId, array, target) {
    const perm = PERMUTATIONS.find(p => p.id === Number(permId)) || PERMUTATIONS[0];
    const arr = [...array];
    const n = arr.length;
    let comparisons = 0;
    let low = 0;
    let high = n - 1;

    yield {
      type: 'start',
      array: [...arr],
      target,
      comparisons,
      low,
      high,
      perm,
      codeLine: 2,
      description: `Iniciando [${perm.code}]: ${perm.divisionLabel} con ${perm.segmentoLabel} y ${perm.limiteLabel}. Rango: [${low}..${high}]`
    };

    let iterations = 0;
    const maxIterations = n * 4 + 10;

    if (perm.division === 'bisection') {
      while (low <= high && iterations++ < maxIterations) {
        const len = high - low + 1;
        let mid;
        if (perm.segmento === 'left') {
          mid = low + Math.ceil((high - low) / 2);
        } else if (perm.segmento === 'right') {
          mid = low + Math.floor((high - low) / 2);
        } else {
          mid = Math.floor((low + high) / 2);
        }

        mid = Math.max(low, Math.min(high, mid));
        comparisons++;

        yield {
          type: 'check_mid',
          low,
          mid,
          high,
          array: [...arr],
          target,
          comparisons,
          perm,
          codeLine: 4,
          description: `Punto medio (Bisección): mid = ${mid} (arr[${mid}] = ${arr[mid]}). Segmento mayor asignado a: ${perm.segmento}.`
        };

        if (arr[mid] === target) {
          yield {
            type: 'found',
            index: mid,
            low, mid, high,
            array: [...arr],
            target,
            comparisons,
            perm,
            codeLine: 5,
            description: `🎯 ¡OBJETIVO ENCONTRADO! arr[${mid}] = ${target} en ${comparisons} comparaciones bajo [${perm.code}].`
          };
          return;
        }

        if (len <= 2) {
          if (arr[low] === target) {
            comparisons++;
            yield { type: 'found', index: low, low, mid: low, high, array: [...arr], target, comparisons, perm, codeLine: 5, description: `🎯 ¡Encontrado en límite low (${low}) = ${target}!` };
            return;
          }
          if (arr[high] === target) {
            comparisons++;
            yield { type: 'found', index: high, low, mid: high, high, array: [...arr], target, comparisons, perm, codeLine: 5, description: `🎯 ¡Encontrado en límite high (${high}) = ${target}!` };
            return;
          }
          break;
        }

        if (arr[mid] < target) {
          let nextLow;
          if (perm.limite === 'strict' || perm.limite === 'upper_inclusive') {
            nextLow = mid + 1;
          } else {
            nextLow = mid;
          }
          yield {
            type: 'discard',
            discardRange: [low, mid - 1],
            newRange: [nextLow, high],
            low, mid, high,
            array: [...arr],
            target,
            comparisons,
            perm,
            codeLine: 6,
            description: `arr[${mid}] < ${target}: Descartando porción izquierda. Actualizando límite inferior a low = ${nextLow} (${perm.limiteLabel}).`
          };
          low = nextLow;
        } else {
          let nextHigh;
          if (perm.limite === 'strict' || perm.limite === 'lower_inclusive') {
            nextHigh = mid - 1;
          } else {
            nextHigh = mid;
          }
          yield {
            type: 'discard',
            discardRange: [mid + 1, high],
            newRange: [low, nextHigh],
            low, mid, high,
            array: [...arr],
            target,
            comparisons,
            perm,
            codeLine: 7,
            description: `arr[${mid}] > ${target}: Descartando porción derecha. Actualizando límite superior a high = ${nextHigh} (${perm.limiteLabel}).`
          };
          high = nextHigh;
        }
      }
    } else {
      while (low <= high && iterations++ < maxIterations) {
        const len = high - low + 1;

        if (len <= 2) {
          comparisons++;
          if (arr[low] === target) {
            yield { type: 'found', index: low, low, m1: low, high, array: [...arr], target, comparisons, perm, codeLine: 5, description: `🎯 ¡Encontrado en arr[${low}] = ${target}!` };
            return;
          }
          if (high > low) {
            comparisons++;
            if (arr[high] === target) {
              yield { type: 'found', index: high, low, m2: high, high, array: [...arr], target, comparisons, perm, codeLine: 6, description: `🎯 ¡Encontrado en arr[${high}] = ${target}!` };
              return;
            }
          }
          break;
        }

        let m1, m2;
        const tercio = Math.floor(len / 3);

        if (perm.segmento === 'left') {
          m1 = low + Math.ceil(len / 3);
          m2 = m1 + tercio;
        } else if (perm.segmento === 'center') {
          m1 = low + tercio;
          m2 = high - tercio;
        } else {
          m1 = low + tercio;
          m2 = low + 2 * tercio;
        }

        m1 = Math.max(low, Math.min(high - 1, m1));
        m2 = Math.max(m1 + 1, Math.min(high, m2));

        comparisons++;
        yield {
          type: 'check_trisection',
          low, m1, m2, high,
          array: [...arr],
          target,
          comparisons,
          perm,
          codeLine: 4,
          description: `Trisección [${perm.code}]: Evaluando m1 = ${m1} (arr[${m1}]=${arr[m1]}) y m2 = ${m2} (arr[${m2}]=${arr[m2]}). Sesgo: ${perm.segmentoLabel}.`
        };

        if (arr[m1] === target) {
          yield { type: 'found', index: m1, low, m1, m2, high, array: [...arr], target, comparisons, perm, codeLine: 5, description: `🎯 ¡OBJETIVO ENCONTRADO en tercio m1 = ${m1} (${arr[m1]})!` };
          return;
        }

        comparisons++;
        if (arr[m2] === target) {
          yield { type: 'found', index: m2, low, m1, m2, high, array: [...arr], target, comparisons, perm, codeLine: 6, description: `🎯 ¡OBJETIVO ENCONTRADO en tercio m2 = ${m2} (${arr[m2]})!` };
          return;
        }

        comparisons++;
        if (target < arr[m1]) {
          const nextHigh = (perm.limite === 'strict' || perm.limite === 'lower_inclusive') ? m1 - 1 : m1;
          yield {
            type: 'discard_tri',
            discardRange: [m1, high],
            newRange: [low, nextHigh],
            low, m1, m2, high,
            array: [...arr], target, comparisons, perm,
            codeLine: 7,
            description: `target < arr[m1]: Se descarta segmento central y derecho. Nuevo rango: [${low}..${nextHigh}].`
          };
          high = nextHigh;
        } else if (target > arr[m2]) {
          const nextLow = (perm.limite === 'strict' || perm.limite === 'upper_inclusive') ? m2 + 1 : m2;
          yield {
            type: 'discard_tri',
            discardRange: [low, m2],
            newRange: [nextLow, high],
            low, m1, m2, high,
            array: [...arr], target, comparisons, perm,
            codeLine: 8,
            description: `target > arr[m2]: Se descarta segmento izquierdo y central. Nuevo rango: [${nextLow}..${high}].`
          };
          low = nextLow;
        } else {
          const nextLow = (perm.limite === 'strict' || perm.limite === 'upper_inclusive') ? m1 + 1 : m1;
          const nextHigh = (perm.limite === 'strict' || perm.limite === 'lower_inclusive') ? m2 - 1 : m2;
          yield {
            type: 'discard_tri',
            discardRange: [low, m1 - 1],
            discardRange2: [m2 + 1, high],
            newRange: [nextLow, nextHigh],
            low, m1, m2, high,
            array: [...arr], target, comparisons, perm,
            codeLine: 9,
            description: `arr[m1] < target < arr[m2]: Objetivo en segmento central. Nuevo rango: [${nextLow}..${nextHigh}].`
          };
          low = nextLow;
          high = nextHigh;
        }
      }
    }

    yield {
      type: 'not_found',
      array: [...arr],
      target,
      comparisons,
      perm,
      codeLine: perm.division === 'trisection' ? 10 : 8,
      description: `Búsqueda finalizada bajo [${perm.code}]: El valor ${target} NO existe en la colección (${comparisons} comparaciones).`
    };
  }

  return {
    PERMUTATIONS,
    DIVISIONES,
    SEGMENTOS,
    LIMITES,
    SEARCH_INFO,
    linearSearch,
    executePermutation
  };
})();

