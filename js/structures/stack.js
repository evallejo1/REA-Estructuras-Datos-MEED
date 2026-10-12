/**
 * structures/stack.js
 * Visualizador interactivo de Pila (Stack - LIFO: Last In, First Out)
 */

class StackVisualizer {
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
      this.log(`Capacidad reducida a ${this.maxCapacity}. Elementos sobrantes recortados.`);
    }
    this.render();
  }

  push(value) {
    if (this.items.length >= this.maxCapacity) {
      this.log(`⚠️ Desbordamiento de Pila (Stack Overflow): Capacidad máxima (${this.maxCapacity}) alcanzada.`, 'error');
      this.pulseContainer('overflow');
      return false;
    }

    const val = value !== undefined && value !== null && value !== '' ? value : Math.floor(Math.random() * 90 + 10);
    this.items.push(val);
    this.log(`📥 PUSH: Insertado elemento [${val}] en la cima (Top = índice ${this.items.length - 1}). Complejidad: O(1).`, 'success');
    this.render({ highlightTop: true, action: 'push' });
    return true;
  }

  pop() {
    if (this.items.length === 0) {
      this.log(`⚠️ Subdesbordamiento de Pila (Stack Underflow): La pila está vacía, no se puede hacer POP.`, 'error');
      this.pulseContainer('underflow');
      return null;
    }

    const removed = this.items.pop();
    this.log(`📤 POP: Extraído elemento [${removed}] de la cima. Nueva cima en índice ${this.items.length - 1}. Complejidad: O(1).`, 'warning');
    this.render({ action: 'pop' });
    return removed;
  }

  peek() {
    if (this.items.length === 0) {
      this.log(`ℹ️ PEEK: La pila está vacía.`, 'info');
      return null;
    }
    const topVal = this.items[this.items.length - 1];
    this.log(`👁️ PEEK: Inspeccionando la cima sin extraerla: [${topVal}] en posición Top (${this.items.length - 1}).`, 'info');
    this.render({ highlightTop: true, action: 'peek' });
    return topVal;
  }

  clear() {
    this.items = [];
    this.log(`🧹 Pila vaciada completamente.`, 'info');
    this.render();
  }

  loadFromArray(arr) {
    this.clear();
    const toTake = arr.slice(0, this.maxCapacity);
    toTake.forEach(val => this.items.push(val));
    this.log(`📂 Cargados ${toTake.length} elementos desde dataset externo a la Pila.`);
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
      <div class="stack-wrapper">
        <div class="stack-metrics-badge">
          <span>Ocupación: <strong>${this.items.length} / ${this.maxCapacity}</strong></span>
          <span>Principio: <strong>LIFO (Last In, First Out)</strong></span>
        </div>
        <div class="stack-outer-glass">
          <div class="stack-open-top-label">▲ ENTRADA / SALIDA (TOP) ▲</div>
          <div class="stack-column">
    `;

    // Renderizar espacios vacíos arriba
    const emptySlots = this.maxCapacity - this.items.length;
    for (let i = 0; i < emptySlots; i++) {
      html += `<div class="stack-slot-empty"><span>[Vacío]</span></div>`;
    }

    // Renderizar elementos desde arriba hacia abajo
    for (let i = this.items.length - 1; i >= 0; i--) {
      const isTop = i === this.items.length - 1;
      const highlightClass = isTop && opts.highlightTop ? 'highlight-item animate-pop' : '';
      html += `
        <div class="stack-item ${isTop ? 'is-top' : ''} ${highlightClass}">
          <span class="stack-item-idx">idx: ${i}</span>
          <span class="stack-item-val">${this.items[i]}</span>
          ${isTop ? '<span class="top-tag">◄ TOP</span>' : ''}
        </div>
      `;
    }

    html += `
          </div>
          <div class="stack-base">BASE DE LA PILA</div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }
}
