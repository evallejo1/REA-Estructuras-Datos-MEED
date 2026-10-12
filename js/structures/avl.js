/**
 * structures/avl.js
 * Visualizador interactivo de Árbol AVL auto-balanceado.
 *
 * [PATCH v3] Altura dinámica + scroll, insert/delete como generadores,
 *            rotaciones explicadas paso a paso, setSpeed unificado.
 */

class AVLNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
    this.balanceFactor = 0;
    this.x = 0;
    this.y = 0;
  }
}

class AVLVisualizer {
  constructor(containerId, logCallback) {
    this.container = document.getElementById(containerId);
    this.log = logCallback || console.log;
    this.root = null;
    this.nodeCount = 0;

    this.activeNode = null;
    this.highlightVal = null;
    this.foundVal = null;
    this.rotationNode = null;
    this.lastRotation = null;

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

  getHeight(node) { return node ? node.height : 0; }
  getBalance(node) {
    if (!node) return 0;
    return this.getHeight(node.left) - this.getHeight(node.right);
  }
  updateNode(node) {
    if (!node) return;
    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    node.balanceFactor = this.getBalance(node);
  }

  stopAll() {
    this.isPlaying = false;
    if (this.timerId) { clearTimeout(this.timerId); this.timerId = null; }
    this.activeGen = null;
    this.activeNode = null;
    this.highlightVal = null;
    this.foundVal = null;
    this.rotationNode = null;
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
      this.rotationNode = null;
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
    if (st.rotationNode !== undefined) this.rotationNode = st.rotationNode;
    if (st.lastRotation !== undefined) this.lastRotation = st.lastRotation;
    if (st.description) this.log(st.description, st.logType || 'info');
    this.render();
  }

  insert(value) {
    const val = Number(value !== undefined && value !== null && value !== '' ? value : Math.floor(Math.random() * 90 + 10));
    if (isNaN(val)) return;
    this._startGenerator(this._insertGen(val), `Inserción de ${val}`);
  }

  *_insertGen(val) {
    yield { type: 'start', activeNode: null, description: `▶ Iniciando inserción de [${val}] en el AVL...` };

    if (!this.root) {
      this.root = new AVLNode(val);
      this.nodeCount++;
      yield { type: 'inserted', activeNode: null, highlightVal: val, logType: 'success', description: `🌱 Nodo raíz creado con valor [${val}].` };
      yield { type: 'complete', description: `✓ Inserción completada.` };
      return;
    }

    const path = [];
    let curr = this.root;
    while (true) {
      yield { type: 'visit', activeNode: curr.value, description: `👀 Visitando nodo [${curr.value}]...` };
      path.push(curr);
      if (val === curr.value) {
        yield { type: 'duplicate', activeNode: null, logType: 'warning', description: `⚠️ Clave [${val}] ya existe; duplicados ignorados en AVL.` };
        return;
      }
      if (val < curr.value) {
        if (!curr.left) {
          curr.left = new AVLNode(val);
          this.nodeCount++;
          yield { type: 'inserted', activeNode: null, highlightVal: val, logType: 'success', description: `🌿 Insertado [${val}] a la IZQUIERDA de [${curr.value}].` };
          break;
        }
        yield { type: 'descend-left', activeNode: curr.value, description: `◀ ${val} < ${curr.value}: descendiendo IZQUIERDA.` };
        curr = curr.left;
      } else {
        if (!curr.right) {
          curr.right = new AVLNode(val);
          this.nodeCount++;
          yield { type: 'inserted', activeNode: null, highlightVal: val, logType: 'success', description: `🌿 Insertado [${val}] a la DERECHA de [${curr.value}].` };
          break;
        }
        yield { type: 'descend-right', activeNode: curr.value, description: `▶ ${val} > ${curr.value}: descendiendo DERECHA.` };
        curr = curr.right;
      }
    }

    yield { type: 'phase', activeNode: null, description: `🔁 Iniciando fase de re-balanceo ascendente por el camino de inserción...` };

    for (let i = path.length - 1; i >= 0; i--) {
      let node = path[i];
      const oldHeight = node.height;
      const oldBf = node.balanceFactor;
      this.updateNode(node);

      if (node.height !== oldHeight || node.balanceFactor !== oldBf) {
        yield {
          type: 'update-node',
          activeNode: node.value,
          description: `📐 Nodo [${node.value}]: altura ${oldHeight}→${node.height}, FE ${oldBf}→${node.balanceFactor}.`
        };
      }

      const bf = node.balanceFactor;

      if (bf > 1 || bf < -1) {
        yield {
          type: 'unbalance-detected',
          activeNode: node.value,
          logType: 'warning',
          description: `⚠️ ¡DESBALANCE en nodo [${node.value}]! FE = ${bf} (|FE| > 1).`
        };
      }

      if (bf > 1 && val < node.left.value) {
        yield { type: 'prepare-rotation', activeNode: node.value, description: `🔧 Preparando rotación: caso IZQUIERDA-IZQUIERDA (LL) sobre pivote [${node.value}].` };
        const newSubRoot = this._rotateRight(node);
        this._attachRotation(path, i, newSubRoot);
        this.lastRotation = 'Rotación Simple Derecha (LL)';
        yield { type: 'rotated', activeNode: newSubRoot.value, lastRotation: this.lastRotation, logType: 'warning', description: `🔄 Aplicada ${this.lastRotation}. Nuevo subárbol raíz: [${newSubRoot.value}].` };
        break;
      }

      if (bf < -1 && val > node.right.value) {
        yield { type: 'prepare-rotation', activeNode: node.value, description: `🔧 Preparando rotación: caso DERECHA-DERECHA (RR) sobre pivote [${node.value}].` };
        const newSubRoot = this._rotateLeft(node);
        this._attachRotation(path, i, newSubRoot);
        this.lastRotation = 'Rotación Simple Izquierda (RR)';
        yield { type: 'rotated', activeNode: newSubRoot.value, lastRotation: this.lastRotation, logType: 'warning', description: `🔄 Aplicada ${this.lastRotation}. Nuevo subárbol raíz: [${newSubRoot.value}].` };
        break;
      }

      if (bf > 1 && val > node.left.value) {
        yield { type: 'prepare-rotation', activeNode: node.value, description: `🔧 Preparando rotación DOBLE: caso IZQUIERDA-DERECHA (LR). Primero rotación izquierda sobre hijo [${node.left.value}], luego derecha sobre [${node.value}].` };
        node.left = this._rotateLeft(node.left);
        yield { type: 'rotated-partial', activeNode: node.left.value, description: `↩️ Rotación parcial izquierda aplicada. Nuevo hijo izquierdo: [${node.left.value}].` };
        const newSubRoot = this._rotateRight(node);
        this._attachRotation(path, i, newSubRoot);
        this.lastRotation = 'Rotación Doble (LR)';
        yield { type: 'rotated', activeNode: newSubRoot.value, lastRotation: this.lastRotation, logType: 'warning', description: `🔄 Aplicada ${this.lastRotation}. Nuevo subárbol raíz: [${newSubRoot.value}].` };
        break;
      }

      if (bf < -1 && val < node.right.value) {
        yield { type: 'prepare-rotation', activeNode: node.value, description: `🔧 Preparando rotación DOBLE: caso DERECHA-IZQUIERDA (RL). Primero rotación derecha sobre hijo [${node.right.value}], luego izquierda sobre [${node.value}].` };
        node.right = this._rotateRight(node.right);
        yield { type: 'rotated-partial', activeNode: node.right.value, description: `↩️ Rotación parcial derecha aplicada. Nuevo hijo derecho: [${node.right.value}].` };
        const newSubRoot = this._rotateLeft(node);
        this._attachRotation(path, i, newSubRoot);
        this.lastRotation = 'Rotación Doble (RL)';
        yield { type: 'rotated', activeNode: newSubRoot.value, lastRotation: this.lastRotation, logType: 'warning', description: `🔄 Aplicada ${this.lastRotation}. Nuevo subárbol raíz: [${newSubRoot.value}].` };
        break;
      }
    }

    yield { type: 'complete', activeNode: null, description: `✓ Inserción y balanceo completados.` };
  }

  _attachRotation(path, i, newSubRoot) {
    if (i === 0) {
      this.root = newSubRoot;
    } else {
      const parent = path[i - 1];
      if (parent.left === path[i]) parent.left = newSubRoot;
      else parent.right = newSubRoot;
    }
  }

  _rotateRight(y) {
    const x = y.left;
    const T2 = x.right;
    x.right = y;
    y.left = T2;
    this.updateNode(y);
    this.updateNode(x);
    return x;
  }

  _rotateLeft(x) {
    const y = x.right;
    const T2 = y.left;
    y.left = x;
    x.right = T2;
    this.updateNode(x);
    this.updateNode(y);
    return y;
  }

  search(value) {
    const val = Number(value);
    if (isNaN(val) || !this.root) return;
    this._startGenerator(this._searchGen(val), `Búsqueda de ${val}`);
  }

  *_searchGen(val) {
    yield { type: 'start', description: `🔍 Buscando [${val}] en AVL (cota garantizada O(log n))...` };
    let curr = this.root;
    while (curr) {
      yield { type: 'visit', activeNode: curr.value, description: `👀 Nodo [${curr.value}] — altura ${curr.height}, FE ${curr.balanceFactor}.` };
      if (curr.value === val) {
        yield { type: 'found', activeNode: null, foundVal: val, logType: 'success', description: `🎯 ¡Nodo [${val}] ENCONTRADO! (altura ${curr.height}, FE ${curr.balanceFactor})` };
        return;
      }
      if (val < curr.value) {
        yield { type: 'descend-left', activeNode: curr.value, description: `◀ ${val} < ${curr.value}: IZQUIERDA.` };
        curr = curr.left;
      } else {
        yield { type: 'descend-right', activeNode: curr.value, description: `▶ ${val} > ${curr.value}: DERECHA.` };
        curr = curr.right;
      }
    }
    yield { type: 'not-found', logType: 'error', description: `❌ Nodo [${val}] no existe en el AVL.` };
  }

  delete(value) {
    const val = Number(value);
    if (isNaN(val) || !this.root) return;
    this._startGenerator(this._deleteGen(val), `Eliminación de ${val}`);
  }

  *_deleteGen(val) {
    yield { type: 'start', description: `🗑️ Iniciando eliminación de [${val}] del AVL...` };

    const path = [];
    let curr = this.root;
    while (curr) {
      path.push(curr);
      yield { type: 'visit', activeNode: curr.value, description: `👀 Comparando [${val}] con [${curr.value}]...` };
      if (val === curr.value) break;
      if (val < curr.value) {
        yield { type: 'descend-left', activeNode: curr.value, description: `◀ IZQUIERDA.` };
        curr = curr.left;
      } else {
        yield { type: 'descend-right', activeNode: curr.value, description: `▶ DERECHA.` };
        curr = curr.right;
      }
    }
    if (!curr) {
      yield { type: 'not-found', logType: 'error', description: `❌ Nodo [${val}] no encontrado.` };
      return;
    }

    const removeNode = (node, key) => {
      if (!node) return null;
      if (key < node.value) { node.left = removeNode(node.left, key); return node; }
      if (key > node.value) { node.right = removeNode(node.right, key); return node; }
      if (!node.left) return node.right;
      if (!node.right) return node.left;
      let succ = node.right;
      while (succ.left) succ = succ.left;
      node.value = succ.value;
      node.right = removeNode(node.right, succ.value);
      return node;
    };

    yield { type: 'case', activeNode: curr.value, description: `🗑️ Removiendo nodo [${val}] y aplicando estrategia según sus hijos.` };
    this.root = removeNode(this.root, val);
    this.nodeCount--;

    yield { type: 'phase', description: `🔁 Re-balanceo ascendente tras eliminación...` };

    const rebalance = (node) => {
      if (!node) return null;
      this.updateNode(node);
      const bf = node.balanceFactor;
      if (bf > 1) {
        if (this.getBalance(node.left) >= 0) {
          node = this._rotateRight(node);
        } else {
          node.left = this._rotateLeft(node.left);
          node = this._rotateRight(node);
        }
      } else if (bf < -1) {
        if (this.getBalance(node.right) <= 0) {
          node = this._rotateLeft(node);
        } else {
          node.right = this._rotateRight(node.right);
          node = this._rotateLeft(node);
        }
      }
      node.left = rebalance(node.left);
      node.right = rebalance(node.right);
      return node;
    };

    this.root = rebalance(this.root);
    yield { type: 'rotated', activeNode: this.root?.value, logType: 'warning', description: `🔄 Re-balanceo AVL completado (rotaciones aplicadas según fuese necesario).` };
    yield { type: 'complete', description: `✓ Eliminación completada.` };
  }

  clear() {
    this.stopAll();
    this.root = null;
    this.nodeCount = 0;
    this.lastRotation = null;
    this.log(`🧹 Árbol AVL vaciado completamente.`, 'info');
    this.render();
  }

  loadFromArray(arr) {
    this.stopAll();
    this.root = null;
    this.nodeCount = 0;
    this.lastRotation = null;
    const toTake = arr.slice(0, 15);
    toTake.forEach(val => {
      const gen = this._insertGen(val);
      let r = gen.next();
      while (!r.done) r = gen.next();
    });
    this.log(`📂 Cargados ${toTake.length} nodos en el AVL con balanceo dinámico.`);
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
      node.y = 45 + d * levelGap;
      assignCoords(node.left, d + 1, leftBound, node.x);
      assignCoords(node.right, d + 1, node.x, rightBound);
    };
    assignCoords(this.root, 0, 30, width - 30);
  }

  render() {
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
      const isRotating = this.rotationNode === node.value;

      let circleClass = 'avl-circle';
      if (isFound) circleClass += ' bst-found';
      else if (isRotating) circleClass += ' bst-active';
      else if (isActive) circleClass += ' bst-active';
      else if (isHighlight) circleClass += ' bst-highlight';

      const bf = node.balanceFactor;
      const bfColor = Math.abs(bf) > 1 ? '#ef4444' : (Math.abs(bf) === 1 ? '#f59e0b' : '#10b981');

      nodesSvg += `
        <g class="avl-node-group" transform="translate(${node.x}, ${node.y})">
          <circle r="23" class="${circleClass}"></circle>
          <text dy="5" text-anchor="middle" class="bst-node-text">${node.value}</text>
          <rect x="-14" y="-35" width="28" height="15" rx="3" class="avl-fe-badge" style="fill: ${bfColor}; opacity: 0.35;"></rect>
          <text x="0" y="-24" text-anchor="middle" class="avl-fe-text">FE:${bf}</text>
        </g>
      `;
    };

    drawTree(this.root);

    const totalHeight = this.getHeight(this.root);

    let html = `
      <div class="bst-wrapper">
        <div class="bst-info-bar">
          <span>Nodos: <strong>${this.nodeCount}</strong></span>
          <span>Altura Total (h): <strong>${totalHeight}</strong></span>
          <span>Criterio AVL: <strong>|FE| &le; 1</strong></span>
          ${this.lastRotation ? `<span style="color: #38bdf8; font-weight: bold;">Última rotación: ${this.lastRotation}</span>` : ''}
          ${this.actionLabel ? `<span style="color: #38bdf8;">Operación: <strong>${this.actionLabel}</strong></span>` : ''}
        </div>
        <div class="bst-canvas-box" style="max-height: 520px; overflow-y: auto; overflow-x: hidden;">
          <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}">
            ${linesSvg}
            ${nodesSvg}
          </svg>
          ${!this.root ? '<div class="bst-empty-overlay"><span>Árbol AVL vacío. Inserte valores para visualizar el auto-balanceo y rotaciones.</span></div>' : ''}
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }
}

