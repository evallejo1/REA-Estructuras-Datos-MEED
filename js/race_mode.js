/**
 * race_mode.js
 * Comparador en Paralelo (Race Mode / Benchmark Visual Cara a Cara).
 * Ejecuta simultáneamente dos algoritmos de ordenación sobre el mismo dataset exacto.
 */

class RaceModeVisualizer {
  constructor(containerId, logCallback) {
    this.container = document.getElementById(containerId);
    this.log = logCallback || console.log;

    this.algo1Key = 'quick';
    this.algo2Key = 'bubble';
    this.dataset = [64, 34, 25, 12, 22, 11, 90, 88, 76, 54, 43, 31, 95, 19, 8];

    this.gen1 = null;
    this.gen2 = null;

    this.arr1 = [];
    this.arr2 = [];

    this.stats1 = { comparisons: 0, swaps: 0, steps: 0, finished: false };
    this.stats2 = { comparisons: 0, swaps: 0, steps: 0, finished: false };

    this.active1 = [];
    this.active2 = [];
    this.sorted1 = new Set();
    this.sorted2 = new Set();

    this.isRunning = false;
    this.timerId = null;
    this.speedMs = 120;

    this.render();
  }

  setDataset(arr) {
    this.dataset = [...arr];
    this.reset();
  }

  setSpeed(ms) {
    this.speedMs = Math.max(10, ms);
  }

  setAlgorithms(a1, a2) {
    this.algo1Key = a1;
    this.algo2Key = a2;
    this.reset();
  }

  reset() {
    this.pause();
    this.arr1 = [...this.dataset];
    this.arr2 = [...this.dataset];

    this.stats1 = { comparisons: 0, swaps: 0, steps: 0, finished: false };
    this.stats2 = { comparisons: 0, swaps: 0, steps: 0, finished: false };

    this.active1 = [];
    this.active2 = [];
    this.sorted1.clear();
    this.sorted2.clear();

    const getFn = (key) => {
      const map = {
        bubble: SortingAlgorithms.bubbleSort,
        selection: SortingAlgorithms.selectionSort,
        insertion: SortingAlgorithms.insertionSort,
        merge: SortingAlgorithms.mergeSort,
        quick: SortingAlgorithms.quickSort,
        heap: SortingAlgorithms.heapSort,
        shell: SortingAlgorithms.shellSort
      };
      return map[key] || SortingAlgorithms.bubbleSort;
    };

    this.gen1 = getFn(this.algo1Key)(this.arr1);
    this.gen2 = getFn(this.algo2Key)(this.arr2);

    this.render();
  }

  step() {
    let hasMore1 = !this.stats1.finished;
    let hasMore2 = !this.stats2.finished;

    if (hasMore1 && this.gen1) {
      const res1 = this.gen1.next();
      if (res1.done || !res1.value) {
        this.stats1.finished = true;
        this.arr1.forEach((_, i) => this.sorted1.add(i));
        this.active1 = [];
        if (!this.stats2.finished) {
          this.log(`🏁 ¡${this.algo1Key.toUpperCase()} ha cruzado la meta en primer lugar!`, 'success');
        }
      } else {
        const step = res1.value;
        this.stats1.steps++;
        this.stats1.comparisons = step.comparisons || this.stats1.comparisons;
        this.stats1.swaps = step.swaps || this.stats1.swaps;
        if (step.array) this.arr1 = [...step.array];
        this.active1 = step.indices || [];
        if (step.type === 'sorted_index') this.sorted1.add(step.index);
      }
    }

    if (hasMore2 && this.gen2) {
      const res2 = this.gen2.next();
      if (res2.done || !res2.value) {
        this.stats2.finished = true;
        this.arr2.forEach((_, i) => this.sorted2.add(i));
        this.active2 = [];
        if (!this.stats1.finished) {
          this.log(`🏁 ¡${this.algo2Key.toUpperCase()} ha cruzado la meta en primer lugar!`, 'success');
        }
      } else {
        const step = res2.value;
        this.stats2.steps++;
        this.stats2.comparisons = step.comparisons || this.stats2.comparisons;
        this.stats2.swaps = step.swaps || this.stats2.swaps;
        if (step.array) this.arr2 = [...step.array];
        this.active2 = step.indices || [];
        if (step.type === 'sorted_index') this.sorted2.add(step.index);
      }
    }

    this.render();

    if (this.stats1.finished && this.stats2.finished) {
      this.pause();
      this.log(`🏆 Duelo finalizado: Comparaciones [${this.algo1Key}: ${this.stats1.comparisons} vs ${this.algo2Key}: ${this.stats2.comparisons}]`, 'success');
      return false;
    }
    return true;
  }

  play() {
    if (this.isRunning) return;
    this.isRunning = true;

    const loop = () => {
      if (!this.isRunning) return;
      const running = this.step();
      if (running) {
        this.timerId = setTimeout(loop, this.speedMs);
      }
    };
    loop();
  }

  pause() {
    this.isRunning = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  renderBars(arr, active, sorted) {
    const maxVal = Math.max(...arr, 1);
    let html = '';
    arr.forEach((v, i) => {
      const h = Math.max(8, (v / maxVal) * 100);
      let cls = 'sort-bar-item';
      if (sorted.has(i)) cls += ' bar-sorted';
      else if (active.includes(i)) cls += ' bar-comparing';

      html += `
        <div class="${cls}" style="height: ${h}%;">
          <span class="bar-value-label">${v}</span>
          <span class="bar-index-label">${i}</span>
        </div>
      `;
    });
    return html;
  }

  render() {
    if (!this.container) return;

    let html = `
      <div class="race-wrapper">
        <div class="race-grid">

          <!-- Competidor 1 -->
          <div class="race-card ${this.stats1.finished ? 'race-winner' : ''}">
            <div class="race-card-header">
              <div class="race-algo-title">
                <span class="race-badge-number">1</span>
                <strong>${SortingAlgorithms.ALGORITHM_INFO[this.algo1Key]?.nombre || this.algo1Key}</strong>
              </div>
              <div class="hud-metrics">
                <div class="hud-item"><span class="hud-label">Comp:</span><span class="hud-value">${this.stats1.comparisons}</span></div>
                <div class="hud-item"><span class="hud-label">Swaps:</span><span class="hud-value">${this.stats1.swaps}</span></div>
                <div class="hud-item"><span class="hud-label">Pasos:</span><span class="hud-value">${this.stats1.steps}</span></div>
              </div>
            </div>
            <div class="sorting-stage" style="height: 250px;">
              ${this.renderBars(this.arr1.length ? this.arr1 : this.dataset, this.active1, this.sorted1)}
            </div>
          </div>

          <!-- Competidor 2 -->
          <div class="race-card ${this.stats2.finished ? 'race-winner' : ''}">
            <div class="race-card-header">
              <div class="race-algo-title">
                <span class="race-badge-number">2</span>
                <strong>${SortingAlgorithms.ALGORITHM_INFO[this.algo2Key]?.nombre || this.algo2Key}</strong>
              </div>
              <div class="hud-metrics">
                <div class="hud-item"><span class="hud-label">Comp:</span><span class="hud-value">${this.stats2.comparisons}</span></div>
                <div class="hud-item"><span class="hud-label">Swaps:</span><span class="hud-value">${this.stats2.swaps}</span></div>
                <div class="hud-item"><span class="hud-label">Pasos:</span><span class="hud-value">${this.stats2.steps}</span></div>
              </div>
            </div>
            <div class="sorting-stage" style="height: 250px;">
              ${this.renderBars(this.arr2.length ? this.arr2 : this.dataset, this.active2, this.sorted2)}
            </div>
          </div>

        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }
}
