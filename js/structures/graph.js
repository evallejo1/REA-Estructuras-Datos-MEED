/**
 * structures/graph.js
 * Visualizador interactivo de Grafos Ponderados (BFS, DFS, Dijkstra).
 *
 * [PATCH v3] Modos interactivos + pesos visibles + cancelación async (backlog B1).
 */

class GraphVisualizer {
  constructor(containerId, logCallback) {
    this.container = document.getElementById(containerId);
    this.log = logCallback || console.log;

    this.nodes = new Map();
    this.edges = [];
    this.isDirected = false;

    this.activeNodes = new Set();
    this.activeEdges = new Set();
    this.visitedNodes = [];

    this.mode = 'none';
    this.pendingEdgeFrom = null;

    this._runToken = null;
    this.speedMs = 650;

    this._boundClick = this._onSvgClick.bind(this);
    this.loadPresetNetwork();
  }

  setSpeed(ms) {
    this.speedMs = Math.max(30, Math.min(2000, Number(ms) || 650));
  }

  _cancelRunning() { this._runToken = null; }

  async _sleep(ms) {
    const myToken = this._runToken;
    await new Promise(r => setTimeout(r, ms));
    return this._runToken === myToken;
  }

  _beginRun() {
    this._runToken = Symbol('graph-run');
    return this._runToken;
  }

  setMode(mode) {
    this.mode = mode;
    this.pendingEdgeFrom = null;
    const msgs = {
      'none': 'Modo interactivo desactivado.',
      'add-node': '➕ Modo AGREGAR NODO: haga clic en el lienzo para colocar un nuevo nodo.',
      'add-edge': '🔗 Modo AGREGAR ARISTA: clic en un nodo ORIGEN, luego en un nodo DESTINO.',
      'del-node': '🗑️ Modo ELIMINAR NODO: clic sobre un nodo para eliminarlo.',
      'del-edge': '🗑️ Modo ELIMINAR ARISTA: clic sobre los dos nodos extremos.'
    };
    this.log(msgs[mode] || `Modo: ${mode}`, 'info');
    this.render();
  }

  _onSvgClick(evt) {
    if (this.mode === 'none') return;
    const svg = evt.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    const cursor = pt.matrixTransform(svg.getScreenCTM().inverse());

    if (this.mode === 'add-node') {
      this._addNodeAt(cursor.x, cursor.y);
      return;
    }

    const clickedNode = this._findNodeAt(cursor.x, cursor.y);
    if (!clickedNode) {
      if (this.mode === 'add-edge') this.log('⚠️ Haga clic sobre un nodo para seleccionar el origen.', 'warning');
      return;
    }

    if (this.mode === 'del-node') {
      this._removeNode(clickedNode.id);
      return;
    }

    if (this.mode === 'add-edge') {
      if (!this.pendingEdgeFrom) {
        this.pendingEdgeFrom = clickedNode.id;
        this.log(`🔗 Nodo origen seleccionado: [${clickedNode.id}]. Haga clic en el DESTINO.`, 'info');
        this.render();
      } else {
        const from = this.pendingEdgeFrom;
        const to = clickedNode.id;
        this.pendingEdgeFrom = null;
        if (from === to) {
          this.log(`⚠️ No se permiten auto-bucles.`, 'warning');
          this.render();
          return;
        }
        const weight = Number(prompt(`Peso de la arista [${from}] → [${to}]:`, '1'));
        if (isNaN(weight)) return;
        this.addEdge(from, to, weight);
      }
      return;
    }

    if (this.mode === 'del-edge') {
      if (!this.pendingEdgeFrom) {
        this.pendingEdgeFrom = clickedNode.id;
        this.log(`🗑️ Primer nodo: [${clickedNode.id}]. Haga clic en el otro extremo.`, 'info');
        this.render();
      } else {
        const from = this.pendingEdgeFrom;
        const to = clickedNode.id;
        this.pendingEdgeFrom = null;
        const idx = this.edges.findIndex(e => (e.from === from && e.to === to) || (!this.isDirected && e.from === to && e.to === from));
        if (idx === -1) {
          this.log(`⚠️ No existe arista entre [${from}] y [${to}].`, 'warning');
          this.render();
          return;
        }
        const removed = this.edges.splice(idx, 1)[0];
        this.log(`🗑️ Arista eliminada: [${removed.from}] ↔ [${removed.to}] (peso ${removed.weight}).`, 'warning');
        this.render();
      }
    }
  }

  _findNodeAt(x, y) {
    for (const n of this.nodes.values()) {
      const dx = n.x - x;
      const dy = n.y - y;
      if (dx * dx + dy * dy <= 24 * 24) return n;
    }
    return null;
  }

  _addNodeAt(x, y) {
    let id;
    let i = 0;
    do {
      id = String.fromCharCode(65 + i);
      i++;
    } while (this.nodes.has(id) && i < 26);
    if (this.nodes.has(id)) {
      this.log(`⚠️ No quedan letras libres.`, 'warning');
      return;
    }
    this.nodes.set(id, { id, x, y });
    this.log(`📍 Nodo [${id}] agregado en (${Math.round(x)}, ${Math.round(y)}).`, 'success');
    this.render();
  }

  _removeNode(id) {
    if (!this.nodes.has(id)) return;
    this.nodes.delete(id);
    const before = this.edges.length;
    this.edges = this.edges.filter(e => e.from !== id && e.to !== id);
    const removedEdges = before - this.edges.length;
    this.log(`🗑️ Nodo [${id}] eliminado. Aristas removidas: ${removedEdges}.`, 'warning');
    this.render();
  }

  loadPresetNetwork() {
    this._cancelRunning();
    this.nodes.clear();
    this.edges = [];

    const defaultNodes = [
      { id: 'A', x: 120, y: 100 },
      { id: 'B', x: 300, y: 70 },
      { id: 'C', x: 500, y: 110 },
      { id: 'D', x: 160, y: 260 },
      { id: 'E', x: 360, y: 270 },
      { id: 'F', x: 540, y: 260 }
    ];
    defaultNodes.forEach(n => this.nodes.set(n.id, n));

    this.edges = [
      { from: 'A', to: 'B', weight: 4 },
      { from: 'A', to: 'D', weight: 2 },
      { from: 'B', to: 'C', weight: 5 },
      { from: 'B', to: 'E', weight: 10 },
      { from: 'D', to: 'E', weight: 3 },
      { from: 'C', to: 'F', weight: 1 },
      { from: 'E', to: 'F', weight: 7 }
    ];
    this.render();
  }

  addNode(label) {
    const id = (label || String.fromCharCode(65 + this.nodes.size)).toUpperCase().trim();
    if (!id) return;
    if (this.nodes.has(id)) {
      this.log(`⚠️ El nodo [${id}] ya existe.`, 'warning');
      return;
    }
    const x = Math.floor(Math.random() * 450 + 80);
    const y = Math.floor(Math.random() * 200 + 70);
    this.nodes.set(id, { id, x, y });
    this.log(`📍 Nodo [${id}] agregado.`, 'success');
    this.render();
  }

  addEdge(from, to, weight = 1) {
    const u = String(from).toUpperCase().trim();
    const v = String(to).toUpperCase().trim();
    const w = Number(weight) || 1;
    if (!this.nodes.has(u) || !this.nodes.has(v)) {
      this.log(`⚠️ Uno o ambos nodos ([${u}], [${v}]) no existen.`, 'error');
      return;
    }
    if (u === v) {
      this.log(`⚠️ Auto-bucles no permitidos.`, 'warning');
      return;
    }
    const exists = this.edges.some(e => (e.from === u && e.to === v) || (!this.isDirected && e.from === v && e.to === u));
    if (exists) {
      this.log(`⚠️ La arista ya existe.`, 'warning');
      return;
    }
    this.edges.push({ from: u, to: v, weight: w });
    this.log(`🔗 Arista creada: [${u}] ↔ [${v}] (peso ${w}).`, 'success');
    this.render();
  }

  getNeighbors(u) {
    const neighbors = [];
    this.edges.forEach(e => {
      if (e.from === u) neighbors.push({ node: e.to, weight: e.weight });
      if (!this.isDirected && e.to === u) neighbors.push({ node: e.from, weight: e.weight });
    });
    return neighbors;
  }

  async runBFS(startId) {
    const start = (startId || 'A').toUpperCase();
    if (!this.nodes.has(start)) {
      this.log(`⚠️ Nodo inicial [${start}] no existe.`, 'error');
      return;
    }
    this._beginRun();
    this.log(`🚀 BFS desde [${start}] usando COLA...`, 'info');

    const queue = [start];
    const visited = new Set([start]);
    this.visitedNodes = [];
    this.activeEdges.clear();

    while (queue.length > 0) {
      const curr = queue.shift();
      this.activeNodes = new Set([curr]);
      this.visitedNodes.push(curr);
      this.render();
      this.log(`🚶 Visitando [${curr}]. Cola: [${queue.join(', ')}]`, 'info');

      if (!(await this._sleep(this.speedMs))) {
        this.log(`⏹ BFS cancelado por una nueva acción.`, 'warning');
        this.activeNodes.clear();
        this.render();
        return;
      }

      for (const edge of this.getNeighbors(curr)) {
        if (!visited.has(edge.node)) {
          visited.add(edge.node);
          queue.push(edge.node);
          this.activeEdges.add(`${curr}-${edge.node}`);
          this.activeEdges.add(`${edge.node}-${curr}`);
          this.log(`➕ Encolando vecino [${edge.node}].`);
        }
      }
    }
    this.activeNodes.clear();
    this.log(`✨ BFS completado: ${this.visitedNodes.join(' ➔ ')}`, 'success');
    this.render();
  }

  async runDFS(startId) {
    const start = (startId || 'A').toUpperCase();
    if (!this.nodes.has(start)) {
      this.log(`⚠️ Nodo [${start}] no existe.`, 'error');
      return;
    }
    this._beginRun();
    this.log(`🚀 DFS desde [${start}]...`, 'info');

    const visited = new Set();
    this.visitedNodes = [];
    this.activeEdges.clear();

    const self = this;
    async function dfsVisit(u) {
      visited.add(u);
      self.activeNodes = new Set([u]);
      self.visitedNodes.push(u);
      self.render();
      self.log(`📍 DFS visitando [${u}].`, 'info');

      if (!(await self._sleep(self.speedMs))) return false;

      for (const edge of self.getNeighbors(u)) {
        if (!visited.has(edge.node)) {
          self.activeEdges.add(`${u}-${edge.node}`);
          self.activeEdges.add(`${edge.node}-${u}`);
          const cont = await dfsVisit(edge.node);
          if (!cont) return false;
        }
      }
      return true;
    }

    const completed = await dfsVisit(start);
    this.activeNodes.clear();
    if (completed) {
      this.log(`✨ DFS completado: ${this.visitedNodes.join(' ➔ ')}`, 'success');
    } else {
      this.log(`⏹ DFS cancelado por una nueva acción.`, 'warning');
    }
    this.render();
  }

  async runDijkstra(startId, endId) {
    const start = (startId || 'A').toUpperCase();
    const end = (endId || 'F').toUpperCase();
    if (!this.nodes.has(start) || !this.nodes.has(end)) {
      this.log(`⚠️ Nodos origen o destino inválidos.`, 'error');
      return;
    }
    this._beginRun();
    this.log(`🗺️ Dijkstra de [${start}] a [${end}]...`, 'info');

    const distances = {};
    const previous = {};
    const unvisited = new Set(this.nodes.keys());
    for (const node of this.nodes.keys()) {
      distances[node] = Infinity;
      previous[node] = null;
    }
    distances[start] = 0;
    this.visitedNodes = [];
    this.activeEdges.clear();

    while (unvisited.size > 0) {
      let current = null, minD = Infinity;
      for (const node of unvisited) {
        if (distances[node] < minD) {
          minD = distances[node];
          current = node;
        }
      }
      if (current === null || distances[current] === Infinity) break;
      if (current === end) break;
      unvisited.delete(current);
      this.activeNodes = new Set([current]);
      this.visitedNodes.push(current);
      this.render();
      this.log(`📏 Evaluando [${current}] (distancia acumulada: ${distances[current]}).`, 'info');

      if (!(await this._sleep(this.speedMs))) {
        this.log(`⏹ Dijkstra cancelado por una nueva acción.`, 'warning');
        this.activeNodes.clear();
        this.render();
        return;
      }

      for (const edge of this.getNeighbors(current)) {
        if (unvisited.has(edge.node)) {
          const alt = distances[current] + edge.weight;
          if (alt < distances[edge.node]) {
            distances[edge.node] = alt;
            previous[edge.node] = current;
            this.log(`📉 Relajando: dist[${edge.node}] = ${alt} (vía ${current}).`);
          }
        }
      }
    }

    const path = [];
    let curr = end;
    while (curr) {
      path.unshift(curr);
      curr = previous[curr];
    }
    if (distances[end] === Infinity) {
      this.log(`❌ No hay camino entre [${start}] y [${end}].`, 'error');
      return;
    }
    this.activeEdges.clear();
    for (let i = 0; i < path.length - 1; i++) {
      this.activeEdges.add(`${path[i]}-${path[i + 1]}`);
      this.activeEdges.add(`${path[i + 1]}-${path[i]}`);
    }
    this.activeNodes = new Set(path);
    this.render();
    this.log(`🎯 CAMINO ÓPTIMO: ${path.join(' ➔ ')} | Costo total = ${distances[end]}`, 'success');
  }

  clear() {
    this._cancelRunning();
    this.nodes.clear();
    this.edges = [];
    this.activeNodes.clear();
    this.activeEdges.clear();
    this.visitedNodes = [];
    this.pendingEdgeFrom = null;
    this.log(`🧹 Grafo vaciado.`, 'info');
    this.render();
  }

  render() {
    if (!this.container) return;
    const width = this.container.clientWidth || 700;
    const height = 360;
    const cursorClass = this.mode === 'none' ? '' : 'cursor-crosshair';

    let edgesSvg = '';
    this.edges.forEach(e => {
      const u = this.nodes.get(e.from);
      const v = this.nodes.get(e.to);
      if (!u || !v) return;
      const isPathActive = this.activeEdges.has(`${e.from}-${e.to}`) || this.activeEdges.has(`${e.to}-${e.from}`);
      const strokeClass = isPathActive ? 'graph-edge-active' : 'graph-edge';
      const midX = (u.x + v.x) / 2;
      const midY = (u.y + v.y) / 2;

      edgesSvg += `
        <line x1="${u.x}" y1="${u.y}" x2="${v.x}" y2="${v.y}" class="${strokeClass}" />
        <circle cx="${midX}" cy="${midY}" r="14" class="graph-edge-weight-bg"></circle>
        <text x="${midX}" y="${midY + 5}" text-anchor="middle" class="graph-edge-weight">${e.weight}</text>
      `;
    });

    let nodesSvg = '';
    this.nodes.forEach(n => {
      const isActive = this.activeNodes.has(n.id);
      const isPending = this.pendingEdgeFrom === n.id;
      let circleClass = 'graph-node-circle';
      if (isActive || isPending) circleClass += ' graph-node-active';

      nodesSvg += `
        <g class="graph-node-group" transform="translate(${n.x}, ${n.y})">
          <circle r="22" class="${circleClass}"></circle>
          <text dy="5" text-anchor="middle" class="graph-node-text">${n.id}</text>
        </g>
      `;
    });

    const nodeList = Array.from(this.nodes.keys()).sort();
    let matrixHtml = '<table class="adj-matrix-table"><thead><tr><th></th>';
    nodeList.forEach(id => matrixHtml += `<th>${id}</th>`);
    matrixHtml += '</tr></thead><tbody>';
    nodeList.forEach(u => {
      matrixHtml += `<tr><th>${u}</th>`;
      nodeList.forEach(v => {
        const edge = this.edges.find(e => (e.from === u && e.to === v) || (!this.isDirected && e.from === v && e.to === u));
        matrixHtml += `<td>${edge ? edge.weight : '0'}</td>`;
      });
      matrixHtml += '</tr>';
    });
    matrixHtml += '</tbody></table>';

    let listHtml = '<div class="adj-list-container">';
    nodeList.forEach(u => {
      const neighbors = this.getNeighbors(u);
      listHtml += `
        <div class="adj-list-item">
          <span class="adj-head">[${u}] ➔</span>
          <span class="adj-tails">${neighbors.length > 0 ? neighbors.map(n => `(${n.node}, w:${n.weight})`).join(' ➔ ') : 'Ø'}</span>
        </div>
      `;
    });
    listHtml += '</div>';

    const modeLabels = {
      'none': '—',
      'add-node': '➕ AGREGAR NODO',
      'add-edge': '🔗 AGREGAR ARISTA',
      'del-node': '🗑️ ELIMINAR NODO',
      'del-edge': '🗑️ ELIMINAR ARISTA'
    };

    let html = `
      <div class="graph-wrapper">
        <div class="bst-info-bar">
          <span>Nodos: <strong>${this.nodes.size}</strong></span>
          <span>Aristas: <strong>${this.edges.length}</strong></span>
          <span>Tipo: <strong>Ponderado ${this.isDirected ? 'Dirigido' : 'No Dirigido'}</strong></span>
          ${this.mode !== 'none' ? `<span style="color: #38bdf8; font-weight: bold;">Modo: ${modeLabels[this.mode]}</span>` : ''}
          ${this.pendingEdgeFrom ? `<span style="color: #f59e0b; font-weight: bold;">Origen: [${this.pendingEdgeFrom}]</span>` : ''}
          ${this.visitedNodes.length > 0 ? `<span>Secuencia: <strong style="color: #38bdf8;">${this.visitedNodes.join(' ➔ ')}</strong></span>` : ''}
        </div>

        <div class="graph-dual-view">
          <div class="bst-canvas-box ${cursorClass}" style="flex: 1; position: relative;">
            <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" class="graph-svg-clickable">
              ${edgesSvg}
              ${nodesSvg}
            </svg>
            ${this.nodes.size === 0 ? '<div class="bst-empty-overlay"><span>Grafo vacío. Use los botones para agregar nodos o active el modo interactivo.</span></div>' : ''}
          </div>

          <div class="graph-tables-pane">
            <h4 style="font-size: 0.85rem; color: #93c5fd; margin-bottom: 0.4rem;">Matriz de Adyacencia</h4>
            <div style="overflow-x: auto; margin-bottom: 0.8rem;">${matrixHtml}</div>

            <h4 style="font-size: 0.85rem; color: #93c5fd; margin-bottom: 0.4rem;">Lista de Adyacencia</h4>
            ${listHtml}
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;

    const svgEl = this.container.querySelector('.graph-svg-clickable');
    if (svgEl) svgEl.addEventListener('click', this._boundClick);
  }
}

