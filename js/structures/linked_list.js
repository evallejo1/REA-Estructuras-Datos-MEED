/**
 * structures/linked_list.js
 * Visualizador interactivo de Listas Enlazadas (Simple y Doblemente Enlazada).
 *
 * [PATCH v3] Búsqueda con cancelación async (_runToken) + setSpeed.
 */

class LinkedListNode {
  constructor(value) {
    this.value = value;
    this.next = null;
    this.prev = null;
  }
}

class LinkedListVisualizer {
  constructor(containerId, logCallback) {
    this.container = document.getElementById(containerId);
    this.log = logCallback || console.log;
    this.head = null;
    this.tail = null;
    this.size = 0;
    this.isDoubly = false;
    this._runToken = null;
    this.speedMs = 450;
    this.render();
  }

  setSpeed(ms) {
    this.speedMs = Math.max(30, Math.min(2000, Number(ms) || 450));
  }

  setListType(isDoubly) {
    this.isDoubly = Boolean(isDoubly);
    this.rebuildLinks();
    this.log(`Tipo de lista configurado a: ${this.isDoubly ? 'Lista Doblemente Enlazada' : 'Lista Simplemente Enlazada'}.`);
    this.render();
  }

  rebuildLinks() {
    let curr = this.head;
    let prev = null;
    while (curr) {
      curr.prev = this.isDoubly ? prev : null;
      prev = curr;
      curr = curr.next;
    }
    this.tail = prev;
  }

  insertHead(value) {
    const val = value !== undefined && value !== null && value !== '' ? value : Math.floor(Math.random() * 90 + 10);
    const newNode = new LinkedListNode(val);

    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.next = this.head;
      if (this.isDoubly) this.head.prev = newNode;
      this.head = newNode;
    }
    this.size++;
    this.log(`📌 Inserción al Inicio: Nodo [${val}] asignado como nueva CABEZA (HEAD). Complejidad: O(1).`, 'success');
    this.render({ highlightIndex: 0 });
  }

  insertTail(value) {
    const val = value !== undefined && value !== null && value !== '' ? value : Math.floor(Math.random() * 90 + 10);
    const newNode = new LinkedListNode(val);

    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail.next = newNode;
      if (this.isDoubly) newNode.prev = this.tail;
      this.tail = newNode;
    }
    this.size++;
    this.log(`📌 Inserción al Final: Nodo [${val}] asignado como COLA (TAIL). Complejidad: O(1) con puntero tail.`, 'success');
    this.render({ highlightIndex: this.size - 1 });
  }

  insertAt(index, value) {
    const idx = Number(index);
    if (isNaN(idx) || idx < 0 || idx > this.size) {
      this.log(`⚠️ Índice inválido: debe estar entre 0 y ${this.size}.`, 'error');
      return;
    }
    if (idx === 0) return this.insertHead(value);
    if (idx === this.size) return this.insertTail(value);

    const val = value !== undefined && value !== null && value !== '' ? value : Math.floor(Math.random() * 90 + 10);
    const newNode = new LinkedListNode(val);

    let curr = this.head;
    for (let i = 0; i < idx - 1; i++) {
      curr = curr.next;
    }

    newNode.next = curr.next;
    if (this.isDoubly && curr.next) curr.next.prev = newNode;
    curr.next = newNode;
    if (this.isDoubly) newNode.prev = curr;

    this.size++;
    this.log(`📌 Inserción en posición ${idx}: Nodo [${val}] enlazado tras recorrer ${idx} saltos. Complejidad: O(k).`, 'success');
    this.render({ highlightIndex: idx });
  }

  deleteHead() {
    if (!this.head) {
      this.log(`⚠️ Lista vacía: No hay elementos para eliminar.`, 'error');
      return;
    }
    const removedVal = this.head.value;
    if (this.head === this.tail) {
      this.head = null;
      this.tail = null;
    } else {
      this.head = this.head.next;
      if (this.isDoubly && this.head) this.head.prev = null;
    }
    this.size--;
    this.log(`🗑️ Eliminada CABEZA [${removedVal}]. Nueva cabeza asignada. Complejidad: O(1).`, 'warning');
    this.render();
  }

  deleteTail() {
    if (!this.head) {
      this.log(`⚠️ Lista vacía: No hay elementos para eliminar.`, 'error');
      return;
    }
    const removedVal = this.tail.value;
    if (this.head === this.tail) {
      this.head = null;
      this.tail = null;
    } else {
      let curr = this.head;
      while (curr.next !== this.tail) {
        curr = curr.next;
      }
      curr.next = null;
      this.tail = curr;
    }
    this.size--;
    this.log(`🗑️ Eliminada COLA [${removedVal}]. Complejidad: O(n) simple / O(1) doble.`, 'warning');
    this.render();
  }

  deleteByValue(value) {
    if (!this.head) {
      this.log(`⚠️ Lista vacía: No hay elementos para eliminar.`, 'error');
      return;
    }
    const val = Number(value);
    if (this.head.value === val) return this.deleteHead();

    let curr = this.head;
    while (curr.next && curr.next.value !== val) {
      curr = curr.next;
    }
    if (!curr.next) {
      this.log(`⚠️ Elemento [${val}] no encontrado en la lista.`, 'error');
      return;
    }
    const targetNode = curr.next;
    curr.next = targetNode.next;
    if (this.isDoubly && targetNode.next) targetNode.next.prev = curr;
    if (targetNode === this.tail) this.tail = curr;
    this.size--;
    this.log(`🗑️ Eliminado nodo con valor [${val}]. Enlaces reconectados. Complejidad: O(n).`, 'warning');
    this.render();
  }

  async search(value) {
    const val = Number(value);
    if (isNaN(val)) {
      this.log(`⚠️ Ingrese un valor numérico para buscar.`, 'error');
      return;
    }

    this._runToken = Symbol('ll-run');
    const myToken = this._runToken;

    this.log(`🔍 Iniciando búsqueda secuencial de [${val}] recorriendo punteros...`, 'info');
    let curr = this.head;
    let idx = 0;
    let found = false;

    while (curr) {
      this.render({ activeNodeIdx: idx });
      await new Promise(r => setTimeout(r, this.speedMs));

      if (this._runToken !== myToken) {
        this.log(`⏹ Búsqueda cancelada por una nueva acción.`, 'warning');
        this.render();
        return;
      }

      if (curr.value === val) {
        found = true;
        this.log(`🎯 ¡Nodo [${val}] ENCONTRADO en el índice ${idx}!`, 'success');
        this.render({ successIdx: idx });
        break;
      }
      curr = curr.next;
      idx++;
    }

    if (!found) {
      this.log(`❌ Nodo [${val}] no existe en la lista tras recorrer ${this.size} nodos.`, 'error');
      this.render();
    }
  }

  clear() {
    this._runToken = null;
    this.head = null;
    this.tail = null;
    this.size = 0;
    this.log(`🧹 Lista enlazada vaciada.`, 'info');
    this.render();
  }

  loadFromArray(arr) {
    this.clear();
    const toTake = arr.slice(0, 12);
    toTake.forEach(val => this.insertTail(val));
    this.log(`📂 Cargados ${toTake.length} nodos desde el dataset.`);
    this.render();
  }

  render(opts = {}) {
    if (!this.container) return;

    let html = `
      <div class="ll-wrapper">
        <div class="ll-info-bar">
          <span>Longitud: <strong>${this.size} nodos</strong></span>
          <span>Estructura: <strong>${this.isDoubly ? 'Lista Doble (Prev ⇄ Next)' : 'Lista Simple (Next ➔)'}</strong></span>
        </div>
        <div class="ll-nodes-track">
    `;

    if (!this.head) {
      html += `
        <div class="ll-empty">
          <span>HEAD = NULL (Lista vacía. Inserte un nodo al inicio o al final)</span>
        </div>
      `;
    } else {
      let curr = this.head;
      let idx = 0;

      while (curr) {
        const isHead = idx === 0;
        const isTail = idx === this.size - 1;
        const isHighlight = opts.highlightIndex === idx;
        const isActive = opts.activeNodeIdx === idx;
        const isSuccess = opts.successIdx === idx;

        let stateClass = '';
        if (isSuccess) stateClass = 'll-node-found';
        else if (isActive) stateClass = 'll-node-active';
        else if (isHighlight) stateClass = 'highlight-item animate-pop';

        html += `
          <div class="ll-node-unit ${stateClass}">
            <div class="ll-pointer-tags">
              ${isHead ? '<span class="tag-head">HEAD</span>' : ''}
              ${isTail ? '<span class="tag-tail">TAIL</span>' : ''}
              <span class="tag-index">[${idx}]</span>
            </div>

            <div class="ll-node-box">
              ${this.isDoubly ? `<div class="ll-prev-field">${curr.prev ? '◂' : 'Ø'}</div>` : ''}
              <div class="ll-data-field">${curr.value}</div>
              <div class="ll-next-field">${curr.next ? '▸' : 'Ø'}</div>
            </div>

            <div class="ll-connector">
              ${curr.next
                ? (this.isDoubly ? '<div class="ll-double-arrow">⇄</div>' : '<div class="ll-single-arrow">➜</div>')
                : '<div class="ll-null-pointer">NULL</div>'
              }
            </div>
          </div>
        `;

        curr = curr.next;
        idx++;
      }
    }

    html += `
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }
}


