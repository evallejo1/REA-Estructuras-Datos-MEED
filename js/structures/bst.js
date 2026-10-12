/**
 * structures/bst.js
 * Visualizador interactivo de Árbol Binario de Búsqueda (BST).
 *
 * [PATCH v3] Altura dinámica, scroll vertical, insert/delete como generadores,
 *            play/pause/step/setSpeed unificados.
 */

class BSTNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.x = 0;
    this.y = 0;
    this.height = 1;
  }
}

class BSTVisualizer {
  constructor(containerId, logCallback) {
    this.container = document.getElementById(containerId);
    this.log = logCallback || console.log;
    this.root = null;
    this.nodeCount = 0;
    this.allowDuplicates = false;

    this.activeNode = null;
    this.highlightVal = null;
    this.foundVal = null;
    this.traversalQueue = [];

    this.activeGen = null;
    this.isPlaying = false;
    this.timerId = null;
    this.speedMs = 500;
    this.actionLabel = '';

    this.render();
  }

  setSpeed(ms) {
    this.speedMs = Math.max(30, Math.min(2000, Number(ms) || 500));
  }

  setAllowDuplicates(allow) {
    this.allowDuplicates = Boolean(allow);
    this.log(`Duplicados en BST: ${this.allowDuplicates ? 'Permitidos' : 'Ignorados'}.`);
  }

  stopAll() {
    this.isPlaying = false;
    if (this.timerId) { clearTimeout(this.timerId); this.timerId = null; }
    this.activeGen = null;
    this.activeNode = null;
    this.highlightVal = null;
    this.foundVal = null;
  }

  _startGenerator(gen, label) {
    this.stopAll();
    this.activeGen = gen;
    this.actionLabel = label;
    this.play();
  }

  play() {
    if (this.isPlaying || !this.activeGen) return;
    this.isPlaying = true;
    const loop = () => {
      if (!this.isPlaying) return;
      const more = this.step();
      if (more) this.timerId = setTimeout(loop, this.speedMs);
      else this.pause();
    };
    loop();
  }

  pause() {
    this.isPlaying = false;
    if (this.timerId) { clearTimeout(this.timerId); this.timerId = null; }
  }

  step() {
    if (!this.activeGen) return false;
    const { value: st, done } = this.activeGen.next();
    if (done || !st) {
      this.activeGen = null;
      this.activeNode = null;
      this.highlightVal = null;
      this.render();
      return false;
    }
    this._applyStep(st);
    return true;
  }

  _applyStep(st) {
    if (st.activeNode !== undefined) this.activeNode = st.activeNode;
    if (st.highlightVal !== undefined) this.highlightVal = st.highlightVal;
    if (st.foundVal !== undefined) this.foundVal = st.foundVal;
    if (st.type === 'complete') {
      this.activeNode = null;
      this.highlightVal = null;
    }
    if (st.description) {
      const t = st.logType || 'info';
      this.log(st.description, t);
    }
    this.render();
  }

  insert(value) {
    const val = Number(value !== undefined && value !== null && value !== '' ? value : Math.floor(Math.random() * 90 + 10));
    if (isNaN(val)) return;
    this._startGenerator(this._insertGen(val), `Inserción de ${val}`);
  }

  *_insertGen(val) {
    yield { type: 'start', activeNode: null, description: `▶ Iniciando inserción de [${val}] en el BST...` };

    if (!this.root) {
      this.root = new BSTNode(val);
      this.nodeCount++;
      yield { type: 'inserted', activeNode: null, highlightVal: val, logType: 'success', description: `🌱 Nodo raíz creado con valor [${val}].` };
      yield { type: 'complete', activeNode: null, description: `✓ Inserción completada.` };
      return;
    }

    let curr = this.root;
    while (true) {
      yield { type: 'visit', activeNode: curr.value, description: `👀 Visitando nodo [${curr.value}]...` };

      if (val === curr.value && !this.allowDuplicates) {
        yield { type: 'duplicate', activeNode: null, logType: 'warning', description: `⚠️ El valor [${val}] ya existe y los duplicados están deshabilitados.` };
        return;
      }

      if (val < curr.value) {
        if (!curr.left) {
          curr.left = new BSTNode(val);
          this.nodeCount++;
          yield { type: 'inserted', activeNode: null, highlightVal: val, logType: 'success', description: `🌿 Insertado [${val}] a la IZQUIERDA de [${curr.value}].` };
          yield { type: 'complete', activeNode: null, description: `✓ Inserción completada.` };
          return;
        }
        yield { type: 'descend-left', activeNode: curr.value, description: `◀ ${val} < ${curr.value}: descendiendo por rama IZQUIERDA.` };
        curr = curr.left;
      } else {
        if (!curr.right) {
          curr.right = new BSTNode(val);
          this.nodeCount++;
          yield { type: 'inserted', activeNode: null, highlightVal: val, logType: 'success', description: `🌿 Insertado [${val}] a la DERECHA de [${curr.value}].` };
          yield { type: 'complete', activeNode: null, description: `✓ Inserción completada.` };
          return;
        }
        yield { type: 'descend-right', activeNode: curr.value, description: `▶ ${val} > ${curr.value}: descendiendo por rama DERECHA.` };
        curr = curr.right;
      }
    }
  }

  search(value) {
    const val = Number(value);
    if (isNaN(val) || !this.root) {
      this.log(`⚠️ Árbol vacío o valor de búsqueda no numérico.`, 'error');
      return;
    }
    this._startGenerator(this._searchGen(val), `Búsqueda de ${val}`);
  }

  *_searchGen(val) {
    yield { type: 'start', activeNode: null, description: `🔍 Iniciando búsqueda de [${val}] en el BST...` };

    let curr = this.root;
    while (curr) {
      yield { type: 'visit', activeNode: curr.value, description: `👀 Comparando [${val}] con nodo [${curr.value}]...` };

      if (curr.value === val) {
        yield { type: 'found', activeNode: null, foundVal: val, logType: 'success', description: `🎯 ¡Valor [${val}] ENCONTRADO en el árbol!` };
        yield { type: 'complete', activeNode: null, foundVal: val, description: `✓ Búsqueda completada.` };
        return;
      }
      if (val < curr.value) {
        yield { type: 'descend-left', activeNode: curr.value, description: `◀ ${val} < ${curr.value}: descendiendo por rama IZQUIERDA.` };
        curr = curr.left;
      } else {
        yield { type: 'descend-right', activeNode: curr.value, description: `▶ ${val} > ${curr.value}: descendiendo por rama DERECHA.` };
        curr = curr.right;
      }
    }

    yield { type: 'not-found', activeNode: null, logType: 'error', description: `❌ El valor [${val}] NO se encuentra en el árbol.` };
  }

  delete(value) {
    const val = Number(value);
    if (isNaN(val) || !this.root) return;
    this._startGenerator(this._deleteGen(val), `Eliminación de ${val}`);
  }

  *_deleteGen(val) {
    yield { type: 'start', activeNode: null, description: `🗑️ Iniciando eliminación de [${val}] del BST...` };

    const path = [];
    let curr = this.root;
    while (curr) {
      yield { type: 'visit', activeNode: curr.value, description: `👀 Comparando [${val}] con nodo [${curr.value}]...` };
      path.push(curr);
      if (val === curr.value) break;
      if (val < curr.value) {
        yield { type: 'descend-left', activeNode: curr.value, description: `◀ Descendiendo por IZQUIERDA.` };
        curr = curr.left;
      } else {
        yield { type: 'descend-right', activeNode: curr.value, description: `▶ Descendiendo por DERECHA.` };
        curr = curr.right;
      }
    }

    if (!curr) {
      yield { type: 'not-found', activeNode: null, logType: 'error', description: `❌ El valor [${val}] NO se encuentra en el árbol.` };
      return;
    }

    const hasLeft = !!curr.left;
    const hasRight = !!curr.right;
    if (!hasLeft && !hasRight) {
      yield { type: 'case', activeNode: curr.value, description: `📋 Caso 1: nodo HOJA [${val}]. Se elimina sin más.` };
    } else if (hasLeft && hasRight) {
      yield { type: 'case', activeNode: curr.value, description: `📋 Caso 3: nodo con DOS HIJOS. Se buscará el sucesor inorden.` };
      let succParent = curr;
      let succ = curr.right;
      while (succ.left) {
        yield { type: 'visit', activeNode: succ.value, description: `🔎 Buscando sucesor inorden: visitando [${succ.value}]...` };
        succParent = succ;
        succ = succ.left;
      }
      yield { type: 'case', activeNode: succ.value, logType: 'info', description: `✨ Sucesor inorden encontrado: [${succ.value}]. Se copiará su valor al nodo a eliminar.` };
      curr.value = succ.value;
      if (succParent.left === succ) succParent.left = succ.right;
      else succParent.right = succ.right;
      this.nodeCount--;
      yield { type: 'deleted', activeNode: null, logType: 'warning', description: `🗑️ Nodo [${val}] eliminado (valor reemplazado por sucesor [${succ.value}]).` };
      yield { type: 'complete', activeNode: null, description: `✓ Eliminación completada.` };
      return;
    } else {
      yield { type: 'case', activeNode: curr.value, description: `📋 Caso 2: nodo con UN SOLO HIJO. Se reemplaza por ese hijo.` };
    }

    const child = curr.left || curr.right || null;
    const parent = path.length > 1 ? path[path.length - 2] : null;
    if (!parent) {
      this.root = child;
    } else if (parent.left === curr) {
      parent.left = child;
    } else {
      parent.right = child;
    }
    this.nodeCount--;
    yield { type: 'deleted', activeNode: null, logType: 'warning', description: `🗑️ Nodo [${val}] eliminado y enlaces reconectados.` };
    yield { type: 'complete', activeNode: null, description: `✓ Eliminación completada.` };
  }

  runTraversal(type) {
    if (!this.root) {
      this.log(`⚠️ El árbol está vacío.`, 'error');
      return;
    }
    const order = [];
    if (type === 'inorder') {
      const traverse = (n) => { if (!n) return; traverse(n.left); order.push(n.value); traverse(n.right); };
      traverse(this.root);
      this.log(`📖 Recorrido INORDEN (Izq-Raíz-Der): [${order.join(', ')}].`, 'info');
    } else if (type === 'preorder') {
      const traverse = (n) => { if (!n) return; order.push(n.value); traverse(n.left); traverse(n.right); };
      traverse(this.root);
      this.log(`📖 Recorrido PREORDEN (Raíz-Izq-Der): [${order.join(', ')}].`, 'info');
    } else if (type === 'postorder') {
      const traverse = (n) => { if (!n) return; traverse(n.left); traverse(n.right); order.push(n.value); };
      traverse(this.root);
      this.log(`📖 Recorrido POSTORDEN (Izq-Der-Raíz): [${order.join(', ')}].`, 'info');
    } else if (type === 'bfs') {
      const q = [this.root];
      while (q.length > 0) {
        const n = q.shift();
        order.push(n.value);
        if (n.left) q.push(n.left);
        if (n.right) q.push(n.right);
      }
      this.log(`📖 Recorrido POR NIVELES (BFS): [${order.join(', ')}].`, 'info');
    }

    this.traversalQueue = [];
    this._startTraversalAnimation(order);
  }

  _startTraversalAnimation(order) {
    this.stopAll();
    let i = 0;
    const animate = () => {
      if (i >= order.length) {
        this.activeNode = null;
        this.isPlaying = false;
        this.render();
        return;
      }
      this.activeNode = order[i];
      this.traversalQueue.push(order[i]);
      this.render();
      i++;
      this.timerId = setTimeout(animate, this.speedMs);
    };
    this.isPlaying = true;
    animate();
  }

  clear() {
    this.stopAll();
    this.root = null;
    this.nodeCount = 0;
    this.traversalQueue = [];
    this.log(`🧹 Árbol Binario de Búsqueda vaciado.`, 'info');
    this.render();
  }

  loadFromArray(arr) {
    this.stopAll();
    this.root = null;
    this.nodeCount = 0;
    this.traversalQueue = [];
    const toTake = arr.slice(0, 15);
    toTake.forEach(val => {
      const gen = this._insertGen(val);
      let r = gen.next();
      while (!r.done) r = gen.next();
    });
    this.log(`📂 Cargados ${toTake.length} elementos en el BST.`);
    this.render();
  }

  _getDepth(node) {
    if (!node) return 0;
    return 1 + Math.max(this._getDepth(node.left), this._getDepth(node.right));
  }

  calculatePositions(width, depth) {
    if (!this.root) return;
    const levelGap = 65;
    const assignCoords = (node, d, leftBound, rightBound) => {
      if (!node) return;
      node.x = (leftBound + rightBound) / 2;
      node.y = 40 + d * levelGap;
      assignCoords(node.left, d + 1, leftBound, node.x);
      assignCoords(node.right, d + 1, node.x, rightBound);
    };
    assignCoords(this.root, 0, 30, width - 30);
  }

  render(opts = {}) {
    if (!this.container) return;

    const width = this.container.clientWidth || 700;
    const depth = this._getDepth(this.root);
    const height = Math.max(520, depth * 65 + 60);

    this.calculatePositions(width, depth);

    let linesSvg = '';
    let nodesSvg = '';

    const drawTree = (node) => {
      if (!node) return;
      if (node.left) {
        linesSvg += `<line x1="${node.x}" y1="${node.y}" x2="${node.left.x}" y2="${node.left.y}" class="bst-edge" />`;
        drawTree(node.left);
      }
      if (node.right) {
        linesSvg += `<line x1="${node.x}" y1="${node.y}" x2="${node.right.x}" y2="${node.right.y}" class="bst-edge" />`;
        drawTree(node.right);
      }
      const isActive = this.activeNode === node.value;
      const isFound = this.foundVal === node.value;
      const isHighlight = this.highlightVal === node.value;
      let nodeClass = 'bst-node-circle';
      if (isFound) nodeClass += ' bst-found';
      else if (isActive) nodeClass += ' bst-active';
      else if (isHighlight) nodeClass += ' bst-highlight';

      nodesSvg += `
        <g class="bst-node-group" transform="translate(${node.x}, ${node.y})">
          <circle r="22" class="${nodeClass}"></circle>
          <text dy="6" text-anchor="middle" class="bst-node-text">${node.value}</text>
        </g>
      `;
    };

    drawTree(this.root);

    let html = `
      <div class="bst-wrapper">
        <div class="bst-info-bar">
          <span>Nodos: <strong>${this.nodeCount}</strong></span>
          <span>Altura: <strong>${depth}</strong></span>
          <span>Invariante: <strong>Izq &lt; Raíz &le; Der</strong></span>
          <span>Búsqueda: <strong>O(log n) promedio</strong></span>
          ${this.actionLabel ? `<span style="color: #38bdf8;">Operación: <strong>${this.actionLabel}</strong></span>` : ''}
        </div>
        <div class="bst-canvas-box" style="max-height: 520px; overflow-y: auto; overflow-x: hidden;">
          <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}">
            ${linesSvg}
            ${nodesSvg}
          </svg>
          ${!this.root ? '<div class="bst-empty-overlay"><span>Árbol vacío. Inserte nodos o cargue un archivo.</span></div>' : ''}
        </div>
        ${this.traversalQueue.length > 0 ? `
          <div class="bst-traversal-strip">
            <span class="strip-label">Secuencia del recorrido:</span>
            <div class="strip-pills">
              ${this.traversalQueue.map(v => `<span class="strip-pill">${v}</span>`).join(' ')}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    this.container.innerHTML = html;
  }
}

