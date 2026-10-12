/**
 * structures/hash_table.js
 * Visualizador interactivo de Tabla Hash (Chaining + Sondeo Lineal con tombstones).
 *
 * [PATCH v3] Tombstones en sondeo lineal + cancelación async + setSpeed.
 */

class HashTableVisualizer {
  constructor(containerId, logCallback) {
    this.container = document.getElementById(containerId);
    this.log = logCallback || console.log;
    this.capacity = 7;
    this.collisionStrategy = 'chaining';
    this.buckets = [];
    this.size = 0;
    this.activeBucket = null;
    this._runToken = null;
    this.speedMs = 450;
    this.initBuckets();
    this.render();
  }

  setSpeed(ms) {
    this.speedMs = Math.max(30, Math.min(2000, Number(ms) || 450));
  }

  initBuckets() {
    this.buckets = Array.from({ length: this.capacity }, () => []);
    this.size = 0;
    this.activeBucket = null;
  }

  setCapacity(cap) {
    const newCap = Math.max(3, Math.min(19, Number(cap) || 7));
    this.capacity = newCap;
    this.initBuckets();
    this.log(`Capacidad de la tabla reconfigurada a ${this.capacity} ranuras.`, 'info');
    this.render();
  }

  setStrategy(strategy) {
    this.collisionStrategy = strategy;
    this.initBuckets();
    this.log(`Estrategia de colisión cambiada a: ${strategy === 'chaining' ? 'Encadenamiento Separado (Chaining)' : 'Sondeo Lineal (Linear Probing)'}.`);
    this.render();
  }

  hashFunction(key) {
    if (typeof key === 'number') {
      return Math.abs(key) % this.capacity;
    }
    const str = String(key);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) % this.capacity;
    }
    return Math.abs(hash) % this.capacity;
  }

  countRealElements() {
    let count = 0;
    for (const bucket of this.buckets) {
      if (bucket.length > 0 && !bucket[0].__tombstone) count++;
    }
    return count;
  }

  insert(key, value) {
    if (key === undefined || key === null || key === '') {
      key = Math.floor(Math.random() * 90 + 10);
    }
    const val = value || `Val_${key}`;
    const initialHash = this.hashFunction(key);

    if (this.collisionStrategy === 'chaining') {
      const bucket = this.buckets[initialHash];
      const existing = bucket.find(item => item.key == key);

      if (existing) {
        existing.value = val;
        this.log(`🔄 Clave [${key}] actualizada en bucket [${initialHash}].`, 'info');
      } else {
        bucket.push({ key, value: val });
        this.size++;
        const hasCollision = bucket.length > 1;
        this.log(
          `📥 Insertado [${key}: ${val}] en bucket [${initialHash}]. ${hasCollision ? '⚠️ Colisión resuelta por Encadenamiento.' : ''} O(1) promedio.`,
          hasCollision ? 'warning' : 'success'
        );
      }
      this.activeBucket = initialHash;
      this.render();
    } else {
      let idx = initialHash;
      let probes = 0;
      let firstTombstone = -1;

      while (probes < this.capacity) {
        const slot = this.buckets[idx];

        if (slot.length === 0) {
          const targetIdx = firstTombstone >= 0 ? firstTombstone : idx;
          this.buckets[targetIdx] = [{ key, value: val }];
          this.size++;
          this.activeBucket = targetIdx;
          const via = firstTombstone >= 0 ? `ranura reciclada (tombstone en [${firstTombstone}])` : 'slot libre';
          this.log(
            `📥 Insertado [${key}: ${val}] en bucket [${targetIdx}] vía ${via} tras ${probes} sondeos (hash original = ${initialHash}).`,
            probes > 0 ? 'warning' : 'success'
          );
          this.render();
          return;
        }

        if (slot[0].__tombstone) {
          if (firstTombstone < 0) firstTombstone = idx;
        } else if (slot[0].key == key) {
          slot[0].value = val;
          this.log(`🔄 Clave [${key}] actualizada en bucket [${idx}].`, 'info');
          this.activeBucket = idx;
          this.render();
          return;
        }

        idx = (idx + 1) % this.capacity;
        probes++;
      }

      if (firstTombstone >= 0) {
        this.buckets[firstTombstone] = [{ key, value: val }];
        this.size++;
        this.activeBucket = firstTombstone;
        this.log(`📥 Insertado [${key}: ${val}] en ranura reciclada [${firstTombstone}]. Tabla saturada sin slots libres.`, 'warning');
        this.render();
        return;
      }

      this.log(`⚠️ Tabla llena: imposible insertar [${key}] sin rehashing.`, 'error');
    }
  }

  async search(key) {
    if (key === undefined || key === null || key === '') return;
    this._runToken = Symbol('hash-search');
    const myToken = this._runToken;
    const initialHash = this.hashFunction(key);
    this.log(`🔍 Calculando hash(${key}) % ${this.capacity} = ${initialHash}...`, 'info');

    if (this.collisionStrategy === 'chaining') {
      this.activeBucket = initialHash;
      this.render();
      await new Promise(r => setTimeout(r, this.speedMs));

      if (this._runToken !== myToken) {
        this.log(`⏹ Búsqueda cancelada.`, 'warning');
        return;
      }

      const bucket = this.buckets[initialHash];
      const match = bucket.find(item => item.key == key);
      if (match) {
        this.log(`🎯 ¡Clave [${key}] encontrada en bucket [${initialHash}]! Valor: "${match.value}".`, 'success');
      } else {
        this.log(`❌ Clave [${key}] no encontrada en bucket [${initialHash}].`, 'error');
      }
    } else {
      let idx = initialHash;
      let probes = 0;
      let found = false;

      while (probes < this.capacity) {
        const slot = this.buckets[idx];

        if (slot.length === 0) break;

        if (!slot[0].__tombstone) {
          this.activeBucket = idx;
          this.render();
          await new Promise(r => setTimeout(r, this.speedMs));

          if (this._runToken !== myToken) {
            this.log(`⏹ Búsqueda cancelada.`, 'warning');
            return;
          }

          if (slot[0].key == key) {
            found = true;
            this.log(`🎯 ¡Clave [${key}] encontrada en ranura [${idx}] con valor "${slot[0].value}"! (${probes + 1} inspecciones).`, 'success');
            break;
          }
        }

        idx = (idx + 1) % this.capacity;
        probes++;
      }

      if (!found) {
        this.log(`❌ Clave [${key}] no encontrada en la tabla tras sondeo.`, 'error');
      }
    }
  }

  delete(key) {
    const initialHash = this.hashFunction(key);
    if (this.collisionStrategy === 'chaining') {
      const bucket = this.buckets[initialHash];
      const idx = bucket.findIndex(item => item.key == key);
      if (idx !== -1) {
        const removed = bucket.splice(idx, 1)[0];
        this.size--;
        this.activeBucket = initialHash;
        this.log(`🗑️ Eliminado elemento [${removed.key}: ${removed.value}] del bucket [${initialHash}].`, 'warning');
        this.render();
      } else {
        this.log(`⚠️ Clave [${key}] no encontrada para eliminar.`, 'error');
      }
    } else {
      let idx = initialHash;
      let probes = 0;
      while (probes < this.capacity) {
        const slot = this.buckets[idx];
        if (slot.length === 0) break;

        if (!slot[0].__tombstone && slot[0].key == key) {
          this.buckets[idx] = [{ __tombstone: true, key }];
          this.size--;
          this.activeBucket = idx;
          this.log(`🗑️ Eliminada clave [${key}] del bucket [${idx}] (marcado como tombstone para preservar el sondeo).`, 'warning');
          this.render();
          return;
        }

        idx = (idx + 1) % this.capacity;
        probes++;
      }
      this.log(`⚠️ Clave [${key}] no encontrada para eliminar.`, 'error');
    }
  }

  clear() {
    this._runToken = null;
    this.initBuckets();
    this.log(`🧹 Tabla Hash limpiada por completo.`, 'info');
    this.render();
  }

  loadFromArray(arr) {
    this.clear();
    const toTake = arr.slice(0, Math.floor(this.capacity * 1.5));
    toTake.forEach((val, idx) => {
      this.insert(val, `Dato_${idx + 1}`);
    });
    this.log(`📂 Insertados ${toTake.length} registros en la Tabla Hash.`);
    this.render();
  }

  render() {
    if (!this.container) return;

    const factorCarga = (this.size / this.capacity).toFixed(2);

    let html = `
      <div class="hash-wrapper">
        <div class="hash-info-bar">
          <span>Capacidad (m): <strong>${this.capacity}</strong></span>
          <span>Elementos (n): <strong>${this.size}</strong></span>
          <span>Factor de Carga (&alpha; = n/m): <strong class="${factorCarga > 0.75 ? 'text-warn' : ''}">${factorCarga}</strong></span>
          <span>Función Hash: <code>h(k) = k % ${this.capacity}</code></span>
        </div>
        <div class="hash-table-grid">
    `;

    for (let i = 0; i < this.capacity; i++) {
      const bucket = this.buckets[i];
      const isActive = this.activeBucket === i;
      const hasCollision = bucket.length > 1;
      const isTombstone = bucket.length > 0 && bucket[0].__tombstone;

      html += `
        <div class="hash-row ${isActive ? 'hash-row-active' : ''}">
          <div class="hash-index-cell">
            <span class="hash-slot-num">[ ${i} ]</span>
          </div>
          <div class="hash-bucket-content">
      `;

      if (bucket.length === 0) {
        html += `<span class="hash-empty-slot">Vacio (NULL)</span>`;
      } else if (isTombstone) {
        html += `<span class="hash-empty-slot" style="color: #f87171; font-style: italic;">† Tombstone (borrado)</span>`;
      } else {
        bucket.forEach((item, bIdx) => {
          html += `
            <div class="hash-entry-chip ${hasCollision ? 'collision-chip' : ''}">
              <span class="chip-key">K: ${item.key}</span>
              <span class="chip-val">V: ${item.value}</span>
            </div>
            ${bIdx < bucket.length - 1 ? '<span class="hash-link-arrow">➔</span>' : ''}
          `;
        });
      }

      html += `
          </div>
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }
}

