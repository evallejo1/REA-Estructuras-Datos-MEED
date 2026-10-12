/**
 * pseudocode.js
 * Mapeo didáctico de pseudocódigo para algoritmos de ordenación y búsqueda.
 *
 * [PATCH Fase 2] Alias 'binary_perm' → 'bisection' como salvaguarda.
 */

const PseudocodeTracer = (() => {
  const CODE_DATABASE = {
    bubble: [
      { line: 1, text: "procedimiento BubbleSort(A):" },
      { line: 2, text: "  n = longitud(A)" },
      { line: 3, text: "  para i desde 0 hasta n - 2 hacer:" },
      { line: 4, text: "    para j desde 0 hasta n - i - 2 hacer:" },
      { line: 5, text: "      si A[j] > A[j + 1] entonces:" },
      { line: 6, text: "        intercambiar(A[j], A[j + 1])" },
      { line: 7, text: "  fin procedimiento" }
    ],
    selection: [
      { line: 1, text: "procedimiento SelectionSort(A):" },
      { line: 2, text: "  para i desde 0 hasta n - 1 hacer:" },
      { line: 3, text: "    min_idx = i" },
      { line: 4, text: "    para j desde i + 1 hasta n - 1 hacer:" },
      { line: 5, text: "      si A[j] < A[min_idx] entonces min_idx = j" },
      { line: 6, text: "    si min_idx != i entonces:" },
      { line: 7, text: "      intercambiar(A[i], A[min_idx])" },
      { line: 8, text: "  fin procedimiento" }
    ],
    insertion: [
      { line: 1, text: "procedimiento InsertionSort(A):" },
      { line: 2, text: "  para i desde 1 hasta n - 1 hacer:" },
      { line: 3, text: "    clave = A[i]; j = i - 1" },
      { line: 4, text: "    mientras j >= 0 y A[j] > clave hacer:" },
      { line: 5, text: "      A[j + 1] = A[j]" },
      { line: 6, text: "      j = j - 1" },
      { line: 7, text: "    A[j + 1] = clave" },
      { line: 8, text: "  fin procedimiento" }
    ],
    merge: [
      { line: 1, text: "procedimiento MergeSort(A, inicio, fin):" },
      { line: 2, text: "  si inicio < fin entonces:" },
      { line: 3, text: "    medio = piso((inicio + fin) / 2)" },
      { line: 4, text: "    MergeSort(A, inicio, medio)" },
      { line: 5, text: "    MergeSort(A, medio + 1, fin)" },
      { line: 6, text: "    Merge(A, inicio, medio, fin)" },
      { line: 7, text: "  fin procedimiento" }
    ],
    quick: [
      { line: 1, text: "procedimiento QuickSort(A, bajo, alto):" },
      { line: 2, text: "  si bajo < alto entonces:" },
      { line: 3, text: "    pivote = A[alto]; i = bajo - 1" },
      { line: 4, text: "    para j desde bajo hasta alto - 1:" },
      { line: 5, text: "      si A[j] < pivote entonces i++; swap(A[i], A[j])" },
      { line: 6, text: "    swap(A[i + 1], A[alto]) // fija pivote" },
      { line: 7, text: "    QuickSort(A, bajo, i); QuickSort(A, i + 2, alto)" },
      { line: 8, text: "  fin procedimiento" }
    ],
    heap: [
      { line: 1, text: "procedimiento HeapSort(A):" },
      { line: 2, text: "  construirMaxHeap(A)" },
      { line: 3, text: "  para i desde n - 1 hacia 1 hacer:" },
      { line: 4, text: "    intercambiar(A[0], A[i])" },
      { line: 5, text: "    heapify(A, i, 0)" },
      { line: 6, text: "  fin procedimiento" }
    ],
    shell: [
      { line: 1, text: "procedimiento ShellSort(A):" },
      { line: 2, text: "  para brecha = n/2; brecha > 0; brecha /= 2:" },
      { line: 3, text: "    para i desde brecha hasta n - 1:" },
      { line: 4, text: "      temp = A[i]; j = i" },
      { line: 5, text: "      mientras j >= brecha y A[j - brecha] > temp:" },
      { line: 6, text: "        A[j] = A[j - brecha]; j -= brecha" },
      { line: 7, text: "      A[j] = temp" },
      { line: 8, text: "  fin procedimiento" }
    ],
    linear: [
      { line: 1, text: "procedimiento BusquedaLineal(A, objetivo):" },
      { line: 2, text: "  para i desde 0 hasta n - 1 hacer:" },
      { line: 3, text: "    si A[i] == objetivo entonces:" },
      { line: 4, text: "      retornar i // Elemento encontrado" },
      { line: 5, text: "  retornar -1 // No encontrado" },
      { line: 6, text: "fin procedimiento" }
    ],
    binary: [
      { line: 1, text: "procedimiento BusquedaBiseccion(A, objetivo, sesgo, limite):" },
      { line: 2, text: "  bajo = 0; alto = n - 1" },
      { line: 3, text: "  mientras bajo <= alto hacer:" },
      { line: 4, text: "    medio = calcularPuntoMedio(bajo, alto, sesgo)" },
      { line: 5, text: "    si A[medio] == objetivo entonces retornar medio" },
      { line: 6, text: "    si no si A[medio] < objetivo entonces bajo = ajustarInferior(medio, limite)" },
      { line: 7, text: "    si no alto = ajustarSuperior(medio, limite)" },
      { line: 8, text: "  retornar -1 // No encontrado" }
    ],
    bisection: [
      { line: 1, text: "procedimiento BusquedaBiseccion(A, objetivo, sesgo, limite):" },
      { line: 2, text: "  bajo = 0; alto = n - 1" },
      { line: 3, text: "  mientras bajo <= alto hacer:" },
      { line: 4, text: "    medio = calcularPuntoMedio(bajo, alto, sesgo)" },
      { line: 5, text: "    si A[medio] == objetivo entonces retornar medio" },
      { line: 6, text: "    si no si A[medio] < objetivo entonces bajo = ajustarInferior(medio, limite)" },
      { line: 7, text: "    si no alto = ajustarSuperior(medio, limite)" },
      { line: 8, text: "  retornar -1 // No encontrado" }
    ],
    trisection: [
      { line: 1, text: "procedimiento BusquedaTriseccion(A, objetivo, sesgo, limite):" },
      { line: 2, text: "  bajo = 0; alto = n - 1" },
      { line: 3, text: "  mientras bajo <= alto hacer:" },
      { line: 4, text: "    (m1, m2) = calcularPuntosTercios(bajo, alto, sesgo)" },
      { line: 5, text: "    si A[m1] == objetivo entonces retornar m1" },
      { line: 6, text: "    si A[m2] == objetivo entonces retornar m2" },
      { line: 7, text: "    si objetivo < A[m1] entonces alto = ajustar(m1, limite)" },
      { line: 8, text: "    si no si objetivo > A[m2] entonces bajo = ajustar(m2, limite)" },
      { line: 9, text: "    si no bajo = m1; alto = m2 // Segmento central" },
      { line: 10, text: "  retornar -1 // No encontrado" }
    ]
  };

  // [PATCH Fase 2] Alias de compatibilidad
  CODE_DATABASE['binary_perm'] = CODE_DATABASE['bisection'];

  function render(containerId, algorithmKey, activeLineNum = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const lines = CODE_DATABASE[algorithmKey] || [];
    let html = `
      <div class="code-tracer-header">
        <span class="code-tracer-title">💻 Trazador de Pseudocódigo en Vivo</span>
        <span class="code-tracer-badge">${algorithmKey.toUpperCase()}</span>
      </div>
      <pre class="code-tracer-body"><code>`;

    lines.forEach(item => {
      const isActive = item.line === activeLineNum;
      html += `<div class="code-line ${isActive ? 'code-line-active' : ''}"><span class="code-gutter">${item.line}</span><span class="code-arrow">${isActive ? '►' : ' '}</span><span class="code-text">${escapeHtml(item.text)}</span></div>`;
    });

    html += `</code></pre>`;
    container.innerHTML = html;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  return {
    CODE_DATABASE,
    render
  };
})();

