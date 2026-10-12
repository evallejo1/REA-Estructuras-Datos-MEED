/**
 * benchmark.js
 * Módulo de Benchmark y Análisis Empírico de Rendimiento.
 *
 * [PATCH Fase 2] Se agregó Shell Sort.
 * [PATCH Backlog B4] timeMs con 5 repeticiones, se toma el mínimo.
 */

const BenchmarkRunner = (() => {
  const SIZES = [10, 25, 50, 100, 200, 400];
  const ALGORITHMS = ['bubble', 'selection', 'insertion', 'merge', 'quick', 'heap', 'shell'];
  const REPS = 5;

  const COLORS = {
    bubble: '#ef4444',
    selection: '#f59e0b',
    insertion: '#eab308',
    merge: '#10b981',
    quick: '#3b82f6',
    heap: '#8b5cf6',
    shell: '#ec4899'
  };

  let lastResults = null;

  function runPureAlgorithm(key, originalArr) {
    let best = null;

    for (let rep = 0; rep < REPS; rep++) {
      const arr = [...originalArr];
      const n = arr.length;
      let comparisons = 0;
      let swaps = 0;
      const start = performance.now();

      if (key === 'bubble') {
        for (let i = 0; i < n - 1; i++) {
          let swp = false;
          for (let j = 0; j < n - i - 1; j++) {
            comparisons++;
            if (arr[j] > arr[j + 1]) {
              const t = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = t;
              swaps++; swp = true;
            }
          }
          if (!swp) break;
        }
      } else if (key === 'selection') {
        for (let i = 0; i < n; i++) {
          let min = i;
          for (let j = i + 1; j < n; j++) {
            comparisons++;
            if (arr[j] < arr[min]) min = j;
          }
          if (min !== i) {
            const t = arr[i]; arr[i] = arr[min]; arr[min] = t;
            swaps++;
          }
        }
      } else if (key === 'insertion') {
        for (let i = 1; i < n; i++) {
          const k = arr[i];
          let j = i - 1;
          while (j >= 0) {
            comparisons++;
            if (arr[j] > k) {
              arr[j + 1] = arr[j];
              swaps++;
              j--;
            } else break;
          }
          arr[j + 1] = k;
        }
      } else if (key === 'merge') {
        function mSort(a) {
          if (a.length <= 1) return a;
          const mid = Math.floor(a.length / 2);
          const left = mSort(a.slice(0, mid));
          const right = mSort(a.slice(mid));
          const res = [];
          let i = 0, j = 0;
          while (i < left.length && j < right.length) {
            comparisons++;
            if (left[i] <= right[j]) res.push(left[i++]);
            else res.push(right[j++]);
            swaps++;
          }
          return res.concat(left.slice(i)).concat(right.slice(j));
        }
        mSort(arr);
      } else if (key === 'quick') {
        function qSort(l, h) {
          if (l < h) {
            const p = arr[h];
            let i = l - 1;
            for (let j = l; j < h; j++) {
              comparisons++;
              if (arr[j] < p) {
                i++;
                const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
                swaps++;
              }
            }
            const t = arr[i + 1]; arr[i + 1] = arr[h]; arr[h] = t;
            swaps++;
            const pi = i + 1;
            qSort(l, pi - 1);
            qSort(pi + 1, h);
          }
        }
        qSort(0, n - 1);
      } else if (key === 'heap') {
        function heapify(s, r) {
          let largest = r;
          const left = 2 * r + 1, right = 2 * r + 2;
          if (left < s) { comparisons++; if (arr[left] > arr[largest]) largest = left; }
          if (right < s) { comparisons++; if (arr[right] > arr[largest]) largest = right; }
          if (largest !== r) {
            const t = arr[r]; arr[r] = arr[largest]; arr[largest] = t;
            swaps++;
            heapify(s, largest);
          }
        }
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i);
        for (let i = n - 1; i > 0; i--) {
          const t = arr[0]; arr[0] = arr[i]; arr[i] = t;
          swaps++;
          heapify(i, 0);
        }
      } else if (key === 'shell') {
        for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
          for (let i = gap; i < n; i++) {
            const temp = arr[i];
            let j = i;
            while (j >= gap) {
              comparisons++;
              if (arr[j - gap] > temp) {
                arr[j] = arr[j - gap];
                swaps++;
                j -= gap;
              } else break;
            }
            arr[j] = temp;
          }
        }
      }

      const elapsedMs = performance.now() - start;
      const candidate = {
        comparisons,
        swaps,
        operations: comparisons + swaps,
        timeMs: elapsedMs
      };

      if (best === null || candidate.timeMs < best.timeMs) {
        best = candidate;
      }
    }

    return {
      comparisons: best.comparisons,
      swaps: best.swaps,
      operations: best.operations,
      timeMs: +best.timeMs.toFixed(4)
    };
  }

  function runBenchmark(sizes = SIZES, algorithms = ALGORITHMS) {
    const results = {};
    algorithms.forEach(algo => { results[algo] = []; });

    sizes.forEach(size => {
      const testData = Array.from({ length: size }, () => Math.floor(Math.random() * 1000 + 1));
      algorithms.forEach(algo => {
        const stats = runPureAlgorithm(algo, testData);
        results[algo].push({
          size,
          comparisons: stats.comparisons,
          swaps: stats.swaps,
          operations: stats.operations,
          timeMs: stats.timeMs
        });
      });
    });

    lastResults = { sizes, algorithms, results };
    return lastResults;
  }

  function renderChart(containerId, benchmarkData, metricKey = 'operations') {
    const container = document.getElementById(containerId);
    if (!container || !benchmarkData) return;

    const { sizes, algorithms, results } = benchmarkData;
    const width = container.clientWidth || 700;
    const height = 360;
    const padding = { top: 30, right: 130, bottom: 40, left: 65 };

    let maxVal = 0;
    algorithms.forEach(algo => {
      results[algo].forEach(pt => {
        if (pt[metricKey] > maxVal) maxVal = pt[metricKey];
      });
    });
    maxVal = Math.max(maxVal, 10);

    const scaleX = (sz) => padding.left + ((sz - sizes[0]) / (sizes[sizes.length - 1] - sizes[0])) * (width - padding.left - padding.right);
    const scaleY = (val) => height - padding.bottom - (val / maxVal) * (height - padding.top - padding.bottom);

    let gridSvg = '';
    const yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
      const val = Math.round((maxVal / yTicks) * i);
      const y = scaleY(val);
      gridSvg += `
        <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3,3" />
        <text x="${padding.left - 8}" y="${y + 4}" fill="#94a3b8" font-size="11" text-anchor="end">${val.toLocaleString()}</text>
      `;
    }

    sizes.forEach(sz => {
      const x = scaleX(sz);
      gridSvg += `
        <line x1="${x}" y1="${height - padding.bottom}" x2="${x}" y2="${height - padding.bottom + 5}" stroke="#64748b" />
        <text x="${x}" y="${height - padding.bottom + 20}" fill="#94a3b8" font-size="11" text-anchor="middle">N=${sz}</text>
      `;
    });

    let linesSvg = '';
    let legendSvg = '';
    let legendY = padding.top;

    algorithms.forEach(algo => {
      const color = COLORS[algo] || '#38bdf8';
      const pts = results[algo];
      let pathD = '';

      pts.forEach((pt, idx) => {
        const x = scaleX(pt.size);
        const y = scaleY(pt[metricKey]);
        if (idx === 0) pathD += `M ${x} ${y}`;
        else pathD += ` L ${x} ${y}`;

        linesSvg += `<circle cx="${x}" cy="${y}" r="4" fill="${color}" stroke="#0f172a" stroke-width="1.5"><title>${algo} (N=${pt.size}): ${pt[metricKey]}</title></circle>`;
      });

      linesSvg += `<path d="${pathD}" fill="none" stroke="${color}" stroke-width="2.5" />`;

      legendSvg += `
        <g transform="translate(${width - padding.right + 15}, ${legendY})">
          <circle cx="6" cy="6" r="5" fill="${color}" />
          <text x="16" y="10" fill="#f1f5f9" font-size="11" font-weight="600">${algo.toUpperCase()}</text>
        </g>
      `;
      legendY += 20;
    });

    let html = `
      <div class="benchmark-chart-box">
        <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}">
          <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="#475569" stroke-width="1.5" />
          <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}" stroke="#475569" stroke-width="1.5" />
          ${gridSvg}
          ${linesSvg}
          ${legendSvg}
        </svg>
      </div>
    `;

    container.innerHTML = html;
  }

  function exportToCSV() {
    if (!lastResults) return;
    const { algorithms, results } = lastResults;
    let csv = "Algoritmo,Tamaño_N,Comparaciones,Intercambios,Total_Operaciones,Tiempo_ms\n";

    algorithms.forEach(algo => {
      results[algo].forEach(row => {
        csv += `${algo},${row.size},${row.comparisons},${row.swaps},${row.operations},${row.timeMs}\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `benchmark_algoritmos_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return {
    SIZES,
    ALGORITHMS,
    runBenchmark,
    renderChart,
    exportToCSV,
    getLastResults: () => lastResults
  };
})();

