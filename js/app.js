/**
 * app.js
 * Orquestador principal del REA.
 *
 * [PATCH Fase 2] 24 Permutaciones de Búsqueda cableadas de punta a punta.
 * [PATCH Fase 3] Paso a paso BST/AVL + modos interactivos del grafo.
 * [PATCH Backlog B5] loadPresetTrigger() async.
 * [PATCH Backlog B7] Velocidad universal.
 * [PATCH v3.1] Sistema de ayuda contextual.
 */

document.addEventListener('DOMContentLoaded', () => {
  const state = {
    activeTab: 'sorting',
    dataset: [64, 34, 25, 12, 22, 11, 90, 88, 76, 54, 43, 31, 95, 19, 8],
    originalDataset: [64, 34, 25, 12, 22, 11, 90, 88, 76, 54, 43, 31, 95, 19, 8],
    speedMs: 250,
    isPlaying: false,
    timerId: null,

    sortGenerator: null,
    sortAlgorithm: 'bubble',
    sortStepCount: 0,
    sortStats: { comparisons: 0, swaps: 0 },
    sortedIndices: new Set(),
    activeIndices: [],
    specialIndices: {},

    searchGenerator: null,
    searchAlgorithm: 'binary_perm',
    searchTarget: 43,
    searchState: null,
    searchStats: { comparisons: 0 },

    creatorName: 'Docente / Creador del Proyecto',
    creatorSource: 'autor.txt'
  };

  let stackVisualizer = null;
  let queueVisualizer = null;
  let linkedListVisualizer = null;
  let bstVisualizer = null;
  let avlVisualizer = null;
  let graphVisualizer = null;
  let hashTableVisualizer = null;
  let raceVisualizer = null;
  let quizInstance = null;

  const dom = {
    tabs: document.querySelectorAll('.nav-tab-btn'),
    tabPanels: document.querySelectorAll('.tab-panel'),
    logBox: document.getElementById('log-stream'),
    speedSlider: document.getElementById('speed-slider'),
    speedLabel: document.getElementById('speed-label'),
    datasetSizeLabel: document.getElementById('dataset-size-badge'),
    datasetPresetSelect: document.getElementById('dataset-preset-select'),
    fileInput: document.getElementById('file-upload-input'),
    dropZone: document.getElementById('file-drop-zone'),
    helpModal: document.getElementById('help-modal-backdrop'),
    creatorDisplay: document.getElementById('creator-name-display'),

    sortSelect: document.getElementById('sort-algo-select'),
    sortBarsContainer: document.getElementById('sort-bars-stage'),
    sortPlayBtn: document.getElementById('sort-play-btn'),
    sortPauseBtn: document.getElementById('sort-pause-btn'),
    sortStepBtn: document.getElementById('sort-step-btn'),
    sortResetBtn: document.getElementById('sort-reset-btn'),
    sortCompBadge: document.getElementById('sort-comparisons-count'),
    sortSwapBadge: document.getElementById('sort-swaps-count'),
    sortTimeBadge: document.getElementById('sort-steps-count'),
    sortTheoryCard: document.getElementById('sort-theory-content'),
    sortCodeContainer: document.getElementById('sort-code-tracer-container'),

    searchSelect: document.getElementById('search-algo-select'),
    searchTargetInput: document.getElementById('search-target-input'),
    searchStage: document.getElementById('search-stage'),
    searchPlayBtn: document.getElementById('search-play-btn'),
    searchStepBtn: document.getElementById('search-step-btn'),
    searchResetBtn: document.getElementById('search-reset-btn'),
    searchSortFirstBtn: document.getElementById('search-sort-first-btn'),
    searchCompBadge: document.getElementById('search-comparisons-count'),
    searchTheoryCard: document.getElementById('search-theory-content'),
    searchCodeContainer: document.getElementById('search-code-tracer-container'),

    searchPermSelect: document.getElementById('search-perm-select'),
    permDivSelect: document.getElementById('perm-div-select'),
    permSegSelect: document.getElementById('perm-seg-select'),
    permLimSelect: document.getElementById('perm-lim-select'),
    permInfoBadge: document.getElementById('perm-info-badge')
  };

  // ==========================================
  // Consola didáctica
  // ==========================================
  function addLog(message, type = 'info') {
    if (!dom.logBox) return;
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    const time = new Date().toLocaleTimeString('es-ES', { hour12: false });
    entry.innerHTML = `
      <span class="log-time">[${time}]</span>
      <span class="log-tag tag-${type}">${type.toUpperCase()}</span>
      <span class="log-msg">${message}</span>
    `;
    dom.logBox.appendChild(entry);
    dom.logBox.scrollTop = dom.logBox.scrollHeight;
  }

  // ==========================================
  // Inicialización de estructuras
  // ==========================================
  function initStructures() {
    stackVisualizer = new StackVisualizer('stack-stage', (msg, t) => addLog(msg, t));
    queueVisualizer = new QueueVisualizer('queue-stage', (msg, t) => addLog(msg, t));
    linkedListVisualizer = new LinkedListVisualizer('ll-stage', (msg, t) => addLog(msg, t));
    bstVisualizer = new BSTVisualizer('bst-stage', (msg, t) => addLog(msg, t));
    avlVisualizer = new AVLVisualizer('avl-stage', (msg, t) => addLog(msg, t));
    graphVisualizer = new GraphVisualizer('graph-stage', (msg, t) => addLog(msg, t));
    hashTableVisualizer = new HashTableVisualizer('hash-stage', (msg, t) => addLog(msg, t));

    raceVisualizer = new RaceModeVisualizer('race-stage-container', (msg, t) => addLog(msg, t));
    quizInstance = new QuizEngine('quiz-container');
    window.quizInstance = quizInstance;

    // Sincronizar velocidad inicial
    [bstVisualizer, avlVisualizer, graphVisualizer, linkedListVisualizer, hashTableVisualizer]
      .forEach(v => { if (v && typeof v.setSpeed === 'function') v.setSpeed(state.speedMs); });

    loadAuthorFromFile();
  }

  // ==========================================
  // Navegación por pestañas
  // ==========================================
  function switchTab(targetTab) {
    dom.tabs.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === targetTab);
    });

    dom.tabPanels.forEach(p => {
      p.classList.toggle('active', p.id === `panel-${targetTab}`);
    });

    state.activeTab = targetTab;
    pauseSorting();

    if (targetTab === 'sorting') {
      renderSortBars();
      PseudocodeTracer.render('sort-code-tracer-container', state.sortAlgorithm, null);
    } else if (targetTab === 'searching') {
      renderSearchStage();
      PseudocodeTracer.render('search-code-tracer-container', getPseudoKeyForSearch(), null);
    } else if (targetTab === 'race' && raceVisualizer) {
      raceVisualizer.setDataset(state.dataset);
    } else if (targetTab === 'benchmark') {
      const data = BenchmarkRunner.getLastResults() || BenchmarkRunner.runBenchmark();
      BenchmarkRunner.renderChart('benchmark-chart-container', data);
    } else if (targetTab === 'bst' && bstVisualizer) {
      setTimeout(() => bstVisualizer.render(), 60);
    } else if (targetTab === 'avl' && avlVisualizer) {
      setTimeout(() => avlVisualizer.render(), 60);
    } else if (targetTab === 'graph' && graphVisualizer) {
      setTimeout(() => graphVisualizer.render(), 60);
    }
  }
  window.switchTab = switchTab;

  function initTabs() {
    dom.tabs.forEach(btn => {
      btn.addEventListener('click', () => {
        switchTab(btn.getAttribute('data-tab'));
      });
    });
  }

  // ==========================================
  // Carga de Dataset
  // ==========================================
  function setDataset(newArray, sourceName = 'Personalizado') {
    state.dataset = [...newArray];
    state.originalDataset = [...newArray];
    state.sortedIndices.clear();
    state.activeIndices = [];
    state.specialIndices = {};
    state.sortStepCount = 0;
    state.sortStats = { comparisons: 0, swaps: 0 };
    updateSortStatsUI();

    if (dom.datasetSizeLabel) {
      dom.datasetSizeLabel.textContent = `${state.dataset.length} valores`;
    }
    if (raceVisualizer) raceVisualizer.setDataset(state.dataset);

    const minVal = Math.min(...state.dataset);
    const maxVal = Math.max(...state.dataset);
    addLog(`📁 Dataset cargado [${sourceName}]: ${state.dataset.length} valores (${minVal} a ${maxVal}).`, 'success');

    resetSorting();
    resetSearching();
  }

  async function loadPresetTrigger(val) {
    try {
      const parsed = await FileLoader.loadPreset(val);
      const sourceTag = parsed.source === 'archivo-fisico' ? 'archivo-fisico' : 'embebido';
      setDataset(parsed.numbers, `${parsed.fileName} [${sourceTag}]`);
      if (dom.datasetPresetSelect) dom.datasetPresetSelect.value = val;
    } catch (err) {
      addLog(`Error al cargar preset: ${err.message}`, 'error');
    }
  }
  window.loadPresetTrigger = loadPresetTrigger;

  function initFileHandling() {
    if (dom.datasetPresetSelect) {
      dom.datasetPresetSelect.addEventListener('change', async (e) => {
        const val = e.target.value;
        if (val) await loadPresetTrigger(val);
      });
    }

    if (dom.fileInput) {
      dom.fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          addLog(`Leyendo archivo externo: ${file.name}...`, 'info');
          const parsed = await FileLoader.readFileAsync(file);
          setDataset(parsed.numbers, parsed.fileName);
          e.target.value = '';
        } catch (err) {
          addLog(`Error al procesar archivo: ${err.message}`, 'error');
        }
      });
    }

    if (dom.dropZone) {
      dom.dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dom.dropZone.classList.add('drag-over');
      });
      dom.dropZone.addEventListener('dragleave', () => dom.dropZone.classList.remove('drag-over'));
      dom.dropZone.addEventListener('drop', async (e) => {
        e.preventDefault();
        dom.dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) {
          try {
            const parsed = await FileLoader.readFileAsync(file);
            setDataset(parsed.numbers, parsed.fileName);
          } catch (err) {
            addLog(`Error de archivo arrastrado: ${err.message}`, 'error');
          }
        }
      });
    }

    document.getElementById('gen-random-btn')?.addEventListener('click', () => {
      const count = Number(document.getElementById('random-count-input')?.value) || 20;
      const arr = Array.from({ length: count }, () => Math.floor(Math.random() * 95 + 5));
      setDataset(arr, `Aleatorio (${count} elementos)`);
    });

    document.getElementById('gen-reverse-btn')?.addEventListener('click', () => {
      const sorted = [...state.dataset].sort((a, b) => b - a);
      setDataset(sorted, 'Orden Inverso (Peor Caso)');
    });

    document.getElementById('gen-nearly-btn')?.addEventListener('click', () => {
      const sorted = [...state.dataset].sort((a, b) => a - b);
      for (let i = 0; i < 2; i++) {
        const idx1 = Math.floor(Math.random() * sorted.length);
        const idx2 = Math.floor(Math.random() * sorted.length);
        const temp = sorted[idx1];
        sorted[idx1] = sorted[idx2];
        sorted[idx2] = temp;
      }
      setDataset(sorted, 'Casi Ordenado');
    });
  }

  // ==========================================
  // Visualizador de Ordenación
  // ==========================================
  function renderSortBars() {
    if (!dom.sortBarsContainer) return;
    const arr = state.dataset;
    const maxVal = Math.max(...arr, 1);
    dom.sortBarsContainer.innerHTML = '';

    arr.forEach((val, idx) => {
      const bar = document.createElement('div');
      bar.className = 'sort-bar-item';
      const heightPercent = Math.max(8, (val / maxVal) * 100);
      bar.style.height = `${heightPercent}%`;

      if (state.sortedIndices.has(idx)) bar.classList.add('bar-sorted');
      else if (state.activeIndices.includes(idx)) bar.classList.add('bar-comparing');
      else if (state.specialIndices.pivot === idx) bar.classList.add('bar-pivot');
      else if (state.specialIndices.min === idx) bar.classList.add('bar-min');

      bar.innerHTML = `<span class="bar-value-label">${val}</span><span class="bar-index-label">${idx}</span>`;
      dom.sortBarsContainer.appendChild(bar);
    });
  }

  function updateSortStatsUI() {
    if (dom.sortCompBadge) dom.sortCompBadge.textContent = state.sortStats.comparisons;
    if (dom.sortSwapBadge) dom.sortSwapBadge.textContent = state.sortStats.swaps;
    if (dom.sortTimeBadge) dom.sortTimeBadge.textContent = state.sortStepCount;
  }

  function updateSortTheoryUI() {
    const info = SortingAlgorithms.ALGORITHM_INFO[state.sortAlgorithm];
    if (!info || !dom.sortTheoryCard) return;

    dom.sortTheoryCard.innerHTML = `
      <div class="theory-grid">
        <div class="theory-item"><span class="theory-label">Mejor Caso:</span><span class="theory-badge complexity-best">${info.mejorCaso}</span></div>
        <div class="theory-item"><span class="theory-label">Caso Promedio:</span><span class="theory-badge complexity-avg">${info.casoPromedio}</span></div>
        <div class="theory-item"><span class="theory-label">Peor Caso:</span><span class="theory-badge complexity-worst">${info.peorCaso}</span></div>
        <div class="theory-item"><span class="theory-label">Espacio:</span><span class="theory-badge">${info.espacio}</span></div>
        <div class="theory-item"><span class="theory-label">Estabilidad:</span><span class="theory-badge">${info.estable ? 'Estable ✓' : 'Inestable ✗'}</span></div>
      </div>
      <p class="theory-desc">${info.descripcion}</p>
    `;
    PseudocodeTracer.render('sort-code-tracer-container', state.sortAlgorithm, null);
  }

  function initSortGenerator() {
    const algos = {
      bubble: SortingAlgorithms.bubbleSort,
      selection: SortingAlgorithms.selectionSort,
      insertion: SortingAlgorithms.insertionSort,
      merge: SortingAlgorithms.mergeSort,
      quick: SortingAlgorithms.quickSort,
      heap: SortingAlgorithms.heapSort,
      shell: SortingAlgorithms.shellSort
    };
    const fn = algos[state.sortAlgorithm] || SortingAlgorithms.bubbleSort;
    state.sortGenerator = fn(state.dataset);
    state.sortedIndices.clear();
    state.activeIndices = [];
    state.specialIndices = {};
  }

  function stepSorting() {
    if (!state.sortGenerator) initSortGenerator();
    const { value: step, done } = state.sortGenerator.next();

    if (done || !step) {
      pauseSorting();
      state.dataset.forEach((_, i) => state.sortedIndices.add(i));
      state.activeIndices = [];
      state.specialIndices = {};
      renderSortBars();
      PseudocodeTracer.render('sort-code-tracer-container', state.sortAlgorithm, null);
      addLog(`✨ Algoritmo finalizado. Arreglo completamente ordenado.`, 'success');
      return false;
    }

    state.sortStepCount++;
    state.sortStats.comparisons = step.comparisons || state.sortStats.comparisons;
    state.sortStats.swaps = step.swaps || state.sortStats.swaps;
    updateSortStatsUI();

    if (step.array) state.dataset = [...step.array];

    if (step.type === 'compare') {
      state.activeIndices = step.indices || [];
      addLog(step.description, 'compare');
    } else if (step.type === 'swap') {
      state.activeIndices = step.indices || [];
      addLog(step.description, 'swap');
    } else if (step.type === 'set') {
      state.activeIndices = [step.index];
      addLog(step.description, 'info');
    } else if (step.type === 'sorted_index') {
      state.sortedIndices.add(step.index);
    } else if (step.type === 'highlight_special') {
      state.specialIndices[step.role] = step.indices[0];
      addLog(step.description, 'info');
    } else if (step.type === 'highlight_range') {
      state.activeIndices = [];
      for (let i = step.start; i <= step.end; i++) state.activeIndices.push(i);
      addLog(step.description, 'info');
    } else if (step.type === 'info') {
      addLog(step.description, 'info');
    }

    if (step.codeLine) {
      PseudocodeTracer.render('sort-code-tracer-container', state.sortAlgorithm, step.codeLine);
    }

    renderSortBars();
    return true;
  }

  function playSorting() {
    if (state.isPlaying) return;
    state.isPlaying = true;
    if (dom.sortPlayBtn) dom.sortPlayBtn.disabled = true;
    if (dom.sortPauseBtn) dom.sortPauseBtn.disabled = false;

    function loop() {
      if (!state.isPlaying) return;
      const hasMore = stepSorting();
      if (hasMore) {
        state.timerId = setTimeout(loop, state.speedMs);
      } else {
        pauseSorting();
      }
    }
    loop();
  }

  function pauseSorting() {
    state.isPlaying = false;
    if (state.timerId) {
      clearTimeout(state.timerId);
      state.timerId = null;
    }
    if (dom.sortPlayBtn) dom.sortPlayBtn.disabled = false;
    if (dom.sortPauseBtn) dom.sortPauseBtn.disabled = true;
  }

  function resetSorting() {
    pauseSorting();
    state.dataset = [...state.originalDataset];
    state.sortedIndices.clear();
    state.activeIndices = [];
    state.specialIndices = {};
    state.sortStepCount = 0;
    state.sortStats = { comparisons: 0, swaps: 0 };
    state.sortGenerator = null;
    updateSortStatsUI();
    renderSortBars();
    PseudocodeTracer.render('sort-code-tracer-container', state.sortAlgorithm, null);
    addLog('↺ Ordenación restablecida al conjunto original.', 'info');
  }

  function initSortingControls() {
    if (dom.sortSelect) {
      dom.sortSelect.addEventListener('change', (e) => {
        state.sortAlgorithm = e.target.value;
        updateSortTheoryUI();
        resetSorting();
      });
      updateSortTheoryUI();
    }

    dom.sortPlayBtn?.addEventListener('click', playSorting);
    dom.sortPauseBtn?.addEventListener('click', pauseSorting);
    dom.sortStepBtn?.addEventListener('click', () => {
      pauseSorting();
      stepSorting();
    });
    dom.sortResetBtn?.addEventListener('click', resetSorting);
  }

  // ==========================================
  // Visualizador de Búsqueda
  // ==========================================
  function getPseudoKeyForSearch() {
    if (state.searchAlgorithm === 'binary_perm') {
      const permId = Number(dom.searchPermSelect?.value) || 1;
      const perm = SearchAlgorithms.PERMUTATIONS.find(p => p.id === permId);
      return perm?.division === 'trisection' ? 'trisection' : 'bisection';
    }
    return state.searchAlgorithm;
  }

  function renderSearchStage() {
    if (!dom.searchStage) return;
    const arr = state.dataset;
    dom.searchStage.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'search-elements-row';

    const st = state.searchState;

    arr.forEach((val, idx) => {
      const cell = document.createElement('div');
      cell.className = 'search-cell';
      let pointersHtml = '';

      if (st) {
        if (st.low === idx) pointersHtml += '<span class="ptr-tag ptr-low">L</span>';
        if (st.high === idx) pointersHtml += '<span class="ptr-tag ptr-high">H</span>';
        if (st.mid === idx) pointersHtml += '<span class="ptr-mid">MID</span>';
        if (st.m1 === idx) pointersHtml += '<span class="ptr-mid">M1</span>';
        if (st.m2 === idx) pointersHtml += '<span class="ptr-mid">M2</span>';

        if (st.type === 'found' && st.index === idx) cell.classList.add('cell-found');
        else if (st.type === 'inspect' && st.index === idx) cell.classList.add('cell-inspecting');

        if (st.discardRange && idx >= st.discardRange[0] && idx <= st.discardRange[1]) {
          cell.classList.add('cell-discarded');
        }
        if (st.discardRange2 && idx >= st.discardRange2[0] && idx <= st.discardRange2[1]) {
          cell.classList.add('cell-discarded');
        }
      }

      cell.innerHTML = `
        <div class="search-cell-pointers">${pointersHtml}</div>
        <div class="search-cell-val">${val}</div>
        <div class="search-cell-idx">[${idx}]</div>
      `;
      wrapper.appendChild(cell);
    });
    dom.searchStage.appendChild(wrapper);
  }

  function updateSearchTheoryUI() {
    let infoKey = state.searchAlgorithm;
    if (infoKey === 'binary_perm') {
      const permId = Number(dom.searchPermSelect?.value) || 1;
      const perm = SearchAlgorithms.PERMUTATIONS.find(p => p.id === permId);
      infoKey = perm?.division === 'trisection' ? 'trisection' : 'bisection';
    }

    const info = SearchAlgorithms.SEARCH_INFO[infoKey];
    if (!info || !dom.searchTheoryCard) return;

    let permHeader = '';
    if (state.searchAlgorithm === 'binary_perm') {
      const permId = Number(dom.searchPermSelect?.value) || 1;
      const perm = SearchAlgorithms.PERMUTATIONS.find(p => p.id === permId);
      if (perm) {
        permHeader = `
          <div style="margin-bottom: 0.75rem; padding: 0.5rem; background: rgba(56,189,248,0.1); border-left: 3px solid #38bdf8; border-radius: 4px;">
            <span style="font-weight: 700; color: #38bdf8; font-size: 0.8rem;">${perm.code}</span>
            <span style="font-size: 0.8rem; color: #cbd5e1;"> — ${perm.divisionLabel} · ${perm.segmentoLabel} · ${perm.limiteLabel}</span>
          </div>
        `;
      }
    }

    dom.searchTheoryCard.innerHTML = `
      ${permHeader}
      <div class="theory-grid">
        <div class="theory-item"><span class="theory-label">Mejor Caso:</span><span class="theory-badge complexity-best">${info.mejorCaso}</span></div>
        <div class="theory-item"><span class="theory-label">Caso Promedio:</span><span class="theory-badge complexity-avg">${info.casoPromedio}</span></div>
        <div class="theory-item"><span class="theory-label">Peor Caso:</span><span class="theory-badge complexity-worst">${info.peorCaso}</span></div>
        <div class="theory-item"><span class="theory-label">Requisito:</span><span class="theory-badge">${info.requisito}</span></div>
      </div>
      <p class="theory-desc">${info.descripcion}</p>
    `;
    PseudocodeTracer.render('search-code-tracer-container', getPseudoKeyForSearch(), null);
  }

  function resetSearching() {
    state.searchGenerator = null;
    state.searchState = null;
    state.searchStats.comparisons = 0;
    if (dom.searchCompBadge) dom.searchCompBadge.textContent = '0';
    renderSearchStage();
    PseudocodeTracer.render('search-code-tracer-container', getPseudoKeyForSearch(), null);
  }

  function initSearchGenerator() {
    const targetVal = Number(dom.searchTargetInput?.value || state.searchTarget);
    state.searchTarget = targetVal;

    if (state.searchAlgorithm === 'binary_perm') {
      let isSorted = true;
      for (let i = 0; i < state.dataset.length - 1; i++) {
        if (state.dataset[i] > state.dataset[i + 1]) {
          isSorted = false;
          break;
        }
      }
      if (!isSorted) {
        addLog(`⚠️ La búsqueda por permutación requiere arreglo ordenado. Pulse "Auto-ordenar array".`, 'warning');
      }
      const permId = Number(dom.searchPermSelect?.value) || 1;
      state.searchGenerator = SearchAlgorithms.executePermutation(permId, state.dataset, targetVal);
    } else {
      state.searchGenerator = SearchAlgorithms.linearSearch(state.dataset, targetVal);
    }
  }

  function stepSearching() {
    if (!state.searchGenerator) initSearchGenerator();
    const { value: step, done } = state.searchGenerator.next();

    if (done || !step) {
      addLog(`Búsqueda concluida.`, 'info');
      PseudocodeTracer.render('search-code-tracer-container', getPseudoKeyForSearch(), null);
      return false;
    }

    state.searchState = step;
    if (step.comparisons !== undefined) {
      state.searchStats.comparisons = step.comparisons;
      if (dom.searchCompBadge) dom.searchCompBadge.textContent = step.comparisons;
    }

    if (step.codeLine) {
      PseudocodeTracer.render('search-code-tracer-container', getPseudoKeyForSearch(), step.codeLine);
    }

    const logType = step.type === 'found' ? 'success' : (step.type === 'not_found' ? 'error' : 'info');
    addLog(step.description, logType);
    renderSearchStage();

    const isTerminal = step.type === 'found' || step.type === 'not_found';
    return !isTerminal;
  }

  function updatePermInfoBadge() {
    const permId = Number(dom.searchPermSelect?.value) || 1;
    const perm = SearchAlgorithms.PERMUTATIONS.find(p => p.id === permId);
    if (!perm) return;

    if (dom.permDivSelect) dom.permDivSelect.value = perm.division;
    if (dom.permSegSelect) dom.permSegSelect.value = perm.segmento;
    if (dom.permLimSelect) dom.permLimSelect.value = perm.limite;

    if (dom.permInfoBadge) {
      dom.permInfoBadge.textContent = `Permutación activa: ${perm.code}`;
    }
  }

  function syncPermutationFromIndividualSelects() {
    const div = dom.permDivSelect?.value || 'bisection';
    const seg = dom.permSegSelect?.value || 'left';
    const lim = dom.permLimSelect?.value || 'strict';

    const found = SearchAlgorithms.PERMUTATIONS.find(p =>
      p.division === div && p.segmento === seg && p.limite === lim
    );
    if (found) {
      if (dom.searchPermSelect) dom.searchPermSelect.value = found.id;
      updatePermInfoBadge();
      updateSearchTheoryUI();
      resetSearching();
      addLog(`⚙️ Permutación cambiada a ${found.code}: ${found.divisionLabel}, ${found.segmentoLabel}, ${found.limiteLabel}.`, 'info');
    }
  }

  function initSearchingControls() {
    if (dom.searchPermSelect) {
      dom.searchPermSelect.innerHTML = '';
      SearchAlgorithms.PERMUTATIONS.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.nombre;
        dom.searchPermSelect.appendChild(opt);
      });
      dom.searchPermSelect.value = 1;
      dom.searchPermSelect.addEventListener('change', () => {
        updatePermInfoBadge();
        updateSearchTheoryUI();
        resetSearching();
        const perm = SearchAlgorithms.PERMUTATIONS.find(p => p.id === Number(dom.searchPermSelect.value));
        if (perm) {
          addLog(`⚙️ Permutación cambiada a ${perm.code}: ${perm.divisionLabel}, ${perm.segmentoLabel}, ${perm.limiteLabel}.`, 'info');
        }
      });
      updatePermInfoBadge();
    }

    [dom.permDivSelect, dom.permSegSelect, dom.permLimSelect].forEach(sel => {
      sel?.addEventListener('change', syncPermutationFromIndividualSelects);
    });

    if (dom.searchSelect) {
      dom.searchSelect.addEventListener('change', (e) => {
        state.searchAlgorithm = e.target.value;
        updateSearchTheoryUI();
        resetSearching();
      });
      updateSearchTheoryUI();
    }

    dom.searchStepBtn?.addEventListener('click', () => stepSearching());

    dom.searchPlayBtn?.addEventListener('click', async () => {
      resetSearching();
      initSearchGenerator();
      let running = true;
      while (running) {
        running = stepSearching();
        if (running) await new Promise(r => setTimeout(r, Math.max(100, state.speedMs)));
      }
    });

    dom.searchResetBtn?.addEventListener('click', resetSearching);

    dom.searchSortFirstBtn?.addEventListener('click', () => {
      state.dataset.sort((a, b) => a - b);
      state.originalDataset = [...state.dataset];
      resetSearching();
      renderSortBars();
      addLog(`Arreglo ordenado ascendentemente para Búsqueda Binaria/Trisección.`, 'success');
    });

    document.getElementById('search-pick-existing')?.addEventListener('click', () => {
      const randItem = state.dataset[Math.floor(Math.random() * state.dataset.length)];
      if (dom.searchTargetInput) dom.searchTargetInput.value = randItem;
      resetSearching();
    });

    document.getElementById('search-pick-nonexisting')?.addEventListener('click', () => {
      const max = Math.max(...state.dataset, 100);
      if (dom.searchTargetInput) dom.searchTargetInput.value = max + 7;
      resetSearching();
    });
  }

  // ==========================================
  // Race Mode
  // ==========================================
  function initRaceControls() {
    const a1Select = document.getElementById('race-algo1-select');
    const a2Select = document.getElementById('race-algo2-select');

    const updateRaceAlgos = () => {
      if (raceVisualizer && a1Select && a2Select) {
        raceVisualizer.setAlgorithms(a1Select.value, a2Select.value);
      }
    };

    a1Select?.addEventListener('change', updateRaceAlgos);
    a2Select?.addEventListener('change', updateRaceAlgos);

    document.getElementById('race-play-btn')?.addEventListener('click', () => raceVisualizer?.play());
    document.getElementById('race-pause-btn')?.addEventListener('click', () => raceVisualizer?.pause());
    document.getElementById('race-step-btn')?.addEventListener('click', () => raceVisualizer?.step());
    document.getElementById('race-reset-btn')?.addEventListener('click', () => raceVisualizer?.reset());
  }

  // ==========================================
  // Benchmark
  // ==========================================
  function initBenchmarkControls() {
    document.getElementById('benchmark-run-btn')?.addEventListener('click', () => {
      addLog('⚡ Ejecutando benchmark empírico para N=[10..400] con 7 algoritmos y 5 repeticiones...', 'info');
      const results = BenchmarkRunner.runBenchmark();
      BenchmarkRunner.renderChart('benchmark-chart-container', results, 'operations');
      addLog('✨ Curvas de rendimiento generadas con éxito.', 'success');
    });

    document.getElementById('benchmark-export-btn')?.addEventListener('click', () => {
      BenchmarkRunner.exportToCSV();
      addLog('💾 Informe CSV descargado con estadísticas de benchmark.', 'success');
    });
  }

  // ==========================================
  // Estructuras
  // ==========================================
  function initStructuresControls() {
    document.querySelectorAll('.btn-load-dataset-into').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        if (target === 'stack') stackVisualizer.loadFromArray(state.dataset);
        else if (target === 'queue') queueVisualizer.loadFromArray(state.dataset);
        else if (target === 'll') linkedListVisualizer.loadFromArray(state.dataset);
        else if (target === 'bst') bstVisualizer.loadFromArray(state.dataset);
        else if (target === 'avl') avlVisualizer.loadFromArray(state.dataset);
        else if (target === 'hash') hashTableVisualizer.loadFromArray(state.dataset);
      });
    });

    // PILA
    document.getElementById('stack-push-btn')?.addEventListener('click', () => {
      const val = document.getElementById('stack-val-input')?.value;
      stackVisualizer.push(val ? Number(val) : undefined);
    });
    document.getElementById('stack-pop-btn')?.addEventListener('click', () => stackVisualizer.pop());
    document.getElementById('stack-peek-btn')?.addEventListener('click', () => stackVisualizer.peek());
    document.getElementById('stack-clear-btn')?.addEventListener('click', () => stackVisualizer.clear());
    document.getElementById('stack-cap-input')?.addEventListener('change', (e) => stackVisualizer.setCapacity(e.target.value));

    // COLA
    document.getElementById('queue-enq-btn')?.addEventListener('click', () => {
      const val = document.getElementById('queue-val-input')?.value;
      queueVisualizer.enqueue(val ? Number(val) : undefined);
    });
    document.getElementById('queue-deq-btn')?.addEventListener('click', () => queueVisualizer.dequeue());
    document.getElementById('queue-peek-btn')?.addEventListener('click', () => queueVisualizer.peek());
    document.getElementById('queue-clear-btn')?.addEventListener('click', () => queueVisualizer.clear());
    document.getElementById('queue-cap-input')?.addEventListener('change', (e) => queueVisualizer.setCapacity(e.target.value));

    // LISTA ENLAZADA
    document.getElementById('ll-insert-head-btn')?.addEventListener('click', () => {
      const val = document.getElementById('ll-val-input')?.value;
      linkedListVisualizer.insertHead(val ? Number(val) : undefined);
    });
    document.getElementById('ll-insert-tail-btn')?.addEventListener('click', () => {
      const val = document.getElementById('ll-val-input')?.value;
      linkedListVisualizer.insertTail(val ? Number(val) : undefined);
    });
    document.getElementById('ll-insert-idx-btn')?.addEventListener('click', () => {
      const val = document.getElementById('ll-val-input')?.value;
      const idx = document.getElementById('ll-idx-input')?.value;
      linkedListVisualizer.insertAt(idx, val ? Number(val) : undefined);
    });
    document.getElementById('ll-del-head-btn')?.addEventListener('click', () => linkedListVisualizer.deleteHead());
    document.getElementById('ll-del-tail-btn')?.addEventListener('click', () => linkedListVisualizer.deleteTail());
    document.getElementById('ll-del-val-btn')?.addEventListener('click', () => {
      const val = document.getElementById('ll-val-input')?.value;
      linkedListVisualizer.deleteByValue(val);
    });
    document.getElementById('ll-search-btn')?.addEventListener('click', () => {
      const val = document.getElementById('ll-val-input')?.value;
      linkedListVisualizer.search(val);
    });
    document.getElementById('ll-clear-btn')?.addEventListener('click', () => linkedListVisualizer.clear());
    document.getElementById('ll-type-select')?.addEventListener('change', (e) => {
      linkedListVisualizer.setListType(e.target.value === 'doubly');
    });

    // BST
    document.getElementById('bst-insert-btn')?.addEventListener('click', () => {
      const val = document.getElementById('bst-val-input')?.value;
      bstVisualizer.insert(val);
    });
    document.getElementById('bst-search-btn')?.addEventListener('click', () => {
      const val = document.getElementById('bst-val-input')?.value;
      bstVisualizer.search(val);
    });
    document.getElementById('bst-delete-btn')?.addEventListener('click', () => {
      const val = document.getElementById('bst-val-input')?.value;
      bstVisualizer.delete(val);
    });
    document.getElementById('bst-play-btn')?.addEventListener('click', () => bstVisualizer.play());
    document.getElementById('bst-pause-btn')?.addEventListener('click', () => bstVisualizer.pause());
    document.getElementById('bst-step-btn')?.addEventListener('click', () => {
      bstVisualizer.pause();
      bstVisualizer.step();
    });
    document.getElementById('bst-clear-btn')?.addEventListener('click', () => bstVisualizer.clear());
    document.getElementById('bst-inorder-btn')?.addEventListener('click', () => bstVisualizer.runTraversal('inorder'));
    document.getElementById('bst-preorder-btn')?.addEventListener('click', () => bstVisualizer.runTraversal('preorder'));
    document.getElementById('bst-postorder-btn')?.addEventListener('click', () => bstVisualizer.runTraversal('postorder'));
    document.getElementById('bst-bfs-btn')?.addEventListener('click', () => bstVisualizer.runTraversal('bfs'));

    // AVL
    document.getElementById('avl-insert-btn')?.addEventListener('click', () => {
      const val = document.getElementById('avl-val-input')?.value;
      avlVisualizer.insert(val);
    });
    document.getElementById('avl-search-btn')?.addEventListener('click', () => {
      const val = document.getElementById('avl-val-input')?.value;
      avlVisualizer.search(val);
    });
    document.getElementById('avl-delete-btn')?.addEventListener('click', () => {
      const val = document.getElementById('avl-val-input')?.value;
      avlVisualizer.delete(val);
    });
    document.getElementById('avl-play-btn')?.addEventListener('click', () => avlVisualizer.play());
    document.getElementById('avl-pause-btn')?.addEventListener('click', () => avlVisualizer.pause());
    document.getElementById('avl-step-btn')?.addEventListener('click', () => {
      avlVisualizer.pause();
      avlVisualizer.step();
    });
    document.getElementById('avl-clear-btn')?.addEventListener('click', () => avlVisualizer.clear());

    // GRAFOS
    document.getElementById('graph-add-node-btn')?.addEventListener('click', () => {
      const label = document.getElementById('graph-node-input')?.value;
      graphVisualizer.addNode(label);
    });
    document.getElementById('graph-add-edge-btn')?.addEventListener('click', () => {
      const u = document.getElementById('graph-edge-from')?.value;
      const v = document.getElementById('graph-edge-to')?.value;
      const w = document.getElementById('graph-edge-w')?.value;
      graphVisualizer.addEdge(u, v, w);
    });
    document.getElementById('graph-preset-btn')?.addEventListener('click', () => graphVisualizer.loadPresetNetwork());
    document.getElementById('graph-clear-btn')?.addEventListener('click', () => graphVisualizer.clear());
    document.getElementById('graph-bfs-btn')?.addEventListener('click', () => graphVisualizer.runBFS('A'));
    document.getElementById('graph-dfs-btn')?.addEventListener('click', () => graphVisualizer.runDFS('A'));
    document.getElementById('graph-dijkstra-btn')?.addEventListener('click', () => graphVisualizer.runDijkstra('A', 'F'));

    const modeButtons = [
      ['graph-mode-none', 'none'],
      ['graph-mode-add-node', 'add-node'],
      ['graph-mode-add-edge', 'add-edge'],
      ['graph-mode-del-node', 'del-node'],
      ['graph-mode-del-edge', 'del-edge']
    ];
    modeButtons.forEach(([btnId, mode]) => {
      document.getElementById(btnId)?.addEventListener('click', () => {
        modeButtons.forEach(([other]) => document.getElementById(other)?.classList.remove('active-mode'));
        document.getElementById(btnId)?.classList.add('active-mode');
        graphVisualizer.setMode(mode);
      });
    });

    // HASH
    document.getElementById('hash-insert-btn')?.addEventListener('click', () => {
      const key = document.getElementById('hash-key-input')?.value;
      const val = document.getElementById('hash-val-input')?.value;
      hashTableVisualizer.insert(key, val);
    });
    document.getElementById('hash-search-btn')?.addEventListener('click', () => {
      const key = document.getElementById('hash-key-input')?.value;
      hashTableVisualizer.search(key);
    });
    document.getElementById('hash-delete-btn')?.addEventListener('click', () => {
      const key = document.getElementById('hash-key-input')?.value;
      hashTableVisualizer.delete(key);
    });
    document.getElementById('hash-clear-btn')?.addEventListener('click', () => hashTableVisualizer.clear());
    document.getElementById('hash-strategy-select')?.addEventListener('change', (e) => hashTableVisualizer.setStrategy(e.target.value));
    document.getElementById('hash-cap-input')?.addEventListener('change', (e) => hashTableVisualizer.setCapacity(e.target.value));
  }

  // ==========================================
  // Modal REA + Ayuda contextual
  // ==========================================
  window.openHelpModal = (mode) => {
    if (mode === 'guia') {
      window.openStructureHelp(state.activeTab);
      return;
    }
    dom.helpModal?.classList.add('show');
  };

  window.closeHelpModal = () => {
    dom.helpModal?.classList.remove('show');
  };

  const helpModal = document.getElementById('structure-help-modal-backdrop');
  const helpBody = document.getElementById('help-modal-body');
  const helpIcon = document.getElementById('help-modal-icon');
  const helpTitle = document.getElementById('help-modal-title');
  const helpSubtitle = document.getElementById('help-modal-subtitle');

  function renderHelpSection(titulo, icono, contenido) {
    if (!contenido || (Array.isArray(contenido) && contenido.length === 0)) return '';
    let inner = '';

    if (Array.isArray(contenido)) {
      if (typeof contenido[0] === 'string') {
        inner = `<ul>${contenido.map(item => `<li>${item}</li>`).join('')}</ul>`;
      } else if (contenido[0].termino) {
        inner = `
          <dl class="help-dl">
            ${contenido.map(c => `
              <dt>${c.termino}</dt>
              <dd>${c.detalle}</dd>
            `).join('')}
          </dl>
        `;
      }
    }

    return `
      <section class="help-section">
        <h3 class="help-section-title">${icono} ${titulo}</h3>
        ${inner}
      </section>
    `;
  }

  window.openStructureHelp = (key = null) => {
    if (!key) key = state.activeTab;
    const content = HelpContent[key];
    if (!content) {
      addLog(`⚠️ No hay ayuda disponible para "${key}".`, 'warning');
      return;
    }

    helpIcon.textContent = content.icono || '❓';
    helpTitle.textContent = content.titulo || 'Ayuda';
    helpSubtitle.textContent = 'Guía de uso del módulo';

    helpBody.innerHTML = `
      <div class="help-summary">
        <p>${content.resumen || ''}</p>
      </div>

      ${renderHelpSection('Conceptos clave', '📖', content.conceptosClave)}
      ${renderHelpSection('Cómo usar este módulo', '🎯', content.pasos)}
      ${renderHelpSection('Ejercicios sugeridos', '🧪', content.ejercicios)}
      ${renderHelpSection('Tips', '💡', content.tips)}
      ${renderHelpSection('Errores comunes', '⚠️', content.erroresComunes)}
    `;

    helpModal.classList.add('show');
    setTimeout(() => helpModal.querySelector('.modal-close-btn')?.focus(), 50);
  };

  window.closeStructureHelp = () => {
    helpModal?.classList.remove('show');
  };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && helpModal?.classList.contains('show')) {
      window.closeStructureHelp();
    }
  });

  helpModal?.addEventListener('click', (e) => {
    if (e.target === helpModal) window.closeStructureHelp();
  });

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-help]');
    if (trigger) {
      e.preventDefault();
      const key = trigger.getAttribute('data-help');
      window.openStructureHelp(key);
    }
  });

  document.addEventListener('keydown', (e) => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
      e.preventDefault();
      window.openStructureHelp(state.activeTab);
    }
  });

  // ==========================================
  // Carga del autor desde autor.txt
  // ==========================================
  async function loadAuthorFromFile(file = null) {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => applyAuthorText(e.target.result, file.name);
      reader.readAsText(file);
      return;
    }

    try {
      const response = await fetch('autor.txt');
      if (response.ok) {
        const text = await response.text();
        applyAuthorText(text, 'autor.txt');
      }
    } catch (err) {
      console.warn('Lectura automática de autor.txt:', err);
    }
  }

  function applyAuthorText(rawText, sourceName = 'autor.txt') {
    const cleanLine = rawText
      .split(/\r?\n/)
      .map(l => l.trim())
      .find(l => l.length > 0 && !l.startsWith('#'));

    if (cleanLine) {
      state.creatorName = cleanLine;
      state.creatorSource = sourceName;
      updateCreatorDisplay();
      addLog(`👤 Autor cargado desde archivo [${sourceName}]: "${cleanLine}".`, 'info');
    }
  }

  function updateCreatorDisplay() {
    if (dom.creatorDisplay) {
      dom.creatorDisplay.textContent = state.creatorName;
    }
    const badge = document.getElementById('creator-source-badge');
    if (badge) {
      badge.textContent = `(Leído desde: ${state.creatorSource})`;
    }
  }

  window.reloadAuthorFile = () => { loadAuthorFromFile(); };

  document.getElementById('author-file-input')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) loadAuthorFromFile(file);
  });

  // ==========================================
  // Accesibilidad (alto contraste)
  // ==========================================
  window.toggleHighContrast = () => {
    document.body.classList.toggle('high-contrast-mode');
    const isHigh = document.body.classList.contains('high-contrast-mode');
    localStorage.setItem('rea_high_contrast', isHigh ? 'true' : 'false');
    const btn = document.getElementById('accessibility-toggle-btn');
    if (btn) {
      btn.textContent = isHigh ? '👁️ Contraste Estándar' : '👁️ Alto Contraste';
    }
    addLog(`Pautas de accesibilidad UNSL: Modo ${isHigh ? 'de Alto Contraste' : 'Estándar'} activado.`, 'info');
  };

  if (localStorage.getItem('rea_high_contrast') === 'true') {
    document.body.classList.add('high-contrast-mode');
    const btn = document.getElementById('accessibility-toggle-btn');
    if (btn) btn.textContent = '👁️ Contraste Estándar';
  }

  // ==========================================
  // Controles generales
  // ==========================================
  function initGeneralControls() {
    if (dom.speedSlider) {
      dom.speedSlider.addEventListener('input', (e) => {
        state.speedMs = Number(e.target.value);
        if (raceVisualizer) raceVisualizer.setSpeed(state.speedMs / 2);
        if (bstVisualizer && bstVisualizer.setSpeed) bstVisualizer.setSpeed(state.speedMs);
        if (avlVisualizer && avlVisualizer.setSpeed) avlVisualizer.setSpeed(state.speedMs);
        if (graphVisualizer && graphVisualizer.setSpeed) graphVisualizer.setSpeed(state.speedMs);
        if (linkedListVisualizer && linkedListVisualizer.setSpeed) linkedListVisualizer.setSpeed(state.speedMs);
        if (hashTableVisualizer && hashTableVisualizer.setSpeed) hashTableVisualizer.setSpeed(state.speedMs);
        if (dom.speedLabel) dom.speedLabel.textContent = `${state.speedMs} ms`;
      });
    }

    document.getElementById('clear-log-btn')?.addEventListener('click', () => {
      if (dom.logBox) dom.logBox.innerHTML = '';
      addLog('Consola reiniciada.', 'info');
    });
  }

  // ==========================================
  // Inicialización
  // ==========================================
  initStructures();
  initTabs();
  initFileHandling();
  initSortingControls();
  initSearchingControls();
  initRaceControls();
  initBenchmarkControls();
  initStructuresControls();
  initGeneralControls();

  renderSortBars();
  renderSearchStage();
  PseudocodeTracer.render('sort-code-tracer-container', state.sortAlgorithm, null);
  PseudocodeTracer.render('search-code-tracer-container', getPseudoKeyForSearch(), null);

  addLog('🚀 Laboratorio REA de Estructuras de Datos y Algoritmos iniciado.', 'success');
  addLog('Menú superior disponible con acceso a archivos, algoritmos, estructuras, benchmark, quiz y licencia CC-BY-NC.', 'info');
  addLog('💡 Presioná "?" en cualquier panel para abrir la ayuda contextual.', 'info');
});

