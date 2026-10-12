/**
 * structures/queue.js
 * Visualizador interactivo de Cola (Queue - FIFO: First In, First Out)
 */

class QueueVisualizer {
  constructor(containerId, logCallback) {
    this.container = document.getElementById(containerId);
    this.log = logCallback || console.log;
    this.items = [];
    this.maxCapacity = 8;
    this.render();
  }

  setCapacity(capacity) {
    this.maxCapacity = Math.max(3, Math.min(15, Number(capacity) || 8));
    if (this.items.length > this.maxCapacity) {
      this.items = this.items.slice(0, this.maxCapacity);
      this.log(`Capacidad de cola ajustada a ${this.maxCapacity}.`);
    }
    this.render();
  }

  enqueue(value) {
    if (this.items.length >= this.maxCapacity) {
      this.log(`⚠️ Desbordamiento de Cola (Queue Full): Límite de capacidad (${this.maxCapacity}) alcanzado.`, 'error');
      this.pulseContainer('overflow');
      return false;
    }

    const val = value !== undefined && value !== null && value !== '' ? value : Math.floor(Math.random() * 90 + 10);
    this.items.push(val);
    this.log(`📥 ENQUEUE: Encolado elemento [${val}] al final (Rear = posición ${this.items.length - 1}). Complejidad: O(1).`, 'success');
    this.render({ highlightRear: true });
    return true;
  }

  dequeue() {
    if (this.items.length === 0) {
      this.log(`⚠️ Cola Vacía: No existen elementos para desencolar (Queue Underflow).`, 'error');
      this.pulseContainer('underflow');
      return null;
    }

    const removed = this.items.shift();
    this.log(`📤 DEQUEUE: Desencolado elemento [${removed}] del frente (Front). Complejidad: O(1).`, 'warning');
    this.render({ action: 'dequeue' });
    return removed;
  }

  peek() {
    if (this.items.length === 0) {
      this.log(`ℹ️ PEEK: La cola está vacía.`, 'info');
      return null;
    }
    const frontVal = this.items[0];
    this.log(`👁️ PEEK: Elemento al frente de la cola es [${frontVal}].`, 'info');
    this.render({ highlightFront: true });
    return frontVal;
  }

  clear() {
    this.items = [];
    this.log(`🧹 Cola vaciada completamente.`, 'info');
    this.render();
  }

  loadFromArray(arr) {
    this.clear();
    const toTake = arr.slice(0, this.maxCapacity);
    toTake.forEach(val => this.items.push(val));
    this.log(`📂 Cargados ${toTake.length} elementos desde dataset externo a la Cola.`);
    this.render();
  }

  pulseContainer(type) {
    if (!this.container) return;
    this.container.classList.add(`pulse-${type}`);
    setTimeout(() => {
      this.container.classList.remove(`pulse-${type}`);
    }, 600);
  }

  render(opts = {}) {
    if (!this.container) return;

    let html = `
      <div class="queue-wrapper">
        <div class="queue-metrics-badge">
          <span>Ocupación: <strong>${this.items.length} / ${this.maxCapacity}</strong></span>
          <span>Principio: <strong>FIFO (First In, First Out)</strong></span>
        </div>
        <div class="queue-flow-header">
          <div class="queue-flow-label exit">◀ SALIDA (FRONT / DEQUEUE)</div>
          <div class="queue-flow-label enter">ENTRADA (REAR / ENQUEUE) ◀</div>
        </div>
        <div class="queue-track">
    `;

    if (this.items.length === 0) {
      html += `
        <div class="queue-empty-indicator">
          <span>Cola vacía — Encole nuevos elementos o cargue un dataset</span>
        </div>
      `;
    } else {
      this.items.forEach((val, idx) => {
        const isFront = idx === 0;
        const isRear = idx === this.items.length - 1;
        const highlightClass = (isFront && opts.highlightFront) || (isRear && opts.highlightRear) ? 'highlight-item animate-pop' : '';

        html += `
          <div class="queue-node ${highlightClass}">
            <div class="queue-node-header">
              ${isFront ? '<span class="tag-front">FRONT (0)</span>' : ''}
              ${isRear ? '<span class="tag-rear">REAR (' + idx + ')</span>' : ''}
              ${!isFront && !isRear ? `<span class="tag-mid">[${idx}]</span>` : ''}
            </div>
            <div class="queue-node-val">${val}</div>
            <div class="queue-node-arrow">➔</div>
          </div>
        `;
      });
    }

    html += `
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }
}
