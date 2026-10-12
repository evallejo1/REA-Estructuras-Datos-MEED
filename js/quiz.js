/**
 * quiz.js
 * Modo Desafío / Quiz Didáctico Interactivo.
 *
 * [PATCH Backlog B2] Carga desde datos/quiz_preguntas.json (con fallback).
 *                    Botón mezclar + cargar banco externo.
 * [PATCH Backlog B3] Progress bar llega a 100%.
 */

class QuizEngine {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentIndex = 0;
    this.score = 0;
    this.answered = false;
    this.loading = true;
    this.loadError = null;

    this.fallbackQuestions = [
      {
        question: "¿Cuál es la complejidad temporal en el peor caso del algoritmo Quick Sort?",
        options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"],
        correct: 1,
        explanation: "Quick Sort tiene un peor caso de O(n²) cuando el pivote elegido es sistemáticamente el menor o mayor elemento."
      },
      {
        question: "En una Pila (Stack) con principio LIFO, ¿dónde se realizan las inserciones (Push) y extracciones (Pop)?",
        options: ["En el frente (Front) y final (Rear)", "Únicamente en la cima (Top)", "En cualquier índice aleatorio", "En la base fija"],
        correct: 1,
        explanation: "Una Pila restringe el acceso al extremo superior denominado cima (Top)."
      },
      {
        question: "¿Qué condición es obligatoria para aplicar Búsqueda Binaria?",
        options: ["Arreglo ordenado", "Cantidad impar de elementos", "Lista doblemente enlazada", "Sin duplicados"],
        correct: 0,
        explanation: "La Búsqueda Binaria requiere datos ordenados previamente."
      },
      {
        question: "¿Cuál es el criterio de balanceo de un Árbol AVL?",
        options: ["FE = 0", "|FE| <= 1", "Todas las hojas al mismo nivel", "Dos hijos por nodo"],
        correct: 1,
        explanation: "El AVL garantiza |FE| <= 1 en cada nodo."
      }
    ];

    this.questions = [];
    this._init();
  }

  async _init() {
    await this._loadQuestionsFromServer();
    this.loading = false;
    this.render();
  }

  async _loadQuestionsFromServer() {
    try {
      const response = await fetch('datos/quiz_preguntas.json');
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const data = await response.json();
      if (data && Array.isArray(data.preguntas) && data.preguntas.length > 0) {
        this.questions = data.preguntas;
        return;
      }
      throw new Error('Formato inválido');
    } catch (err) {
      console.warn('Quiz: no se pudo cargar el banco externo, usando fallback embebido.', err);
      this.questions = this.fallbackQuestions;
      this.loadError = err.message;
    }
  }

  answer(optionIdx) {
    if (this.answered) return;
    this.answered = true;
    const q = this.questions[this.currentIndex];
    if (optionIdx === q.correct) this.score++;
    this.render({ selected: optionIdx, isCorrect: optionIdx === q.correct });
  }

  nextQuestion() {
    this.currentIndex++;
    this.answered = false;
    this.render();
  }

  restart() {
    this.currentIndex = 0;
    this.score = 0;
    this.answered = false;
    this.render();
  }

  shuffle() {
    for (let i = this.questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
    }
    this.restart();
  }

  async loadExternalBank(file) {
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const arr = Array.isArray(data) ? data : data.preguntas;
      if (!Array.isArray(arr) || arr.length === 0) {
        throw new Error('El archivo no contiene un arreglo válido de preguntas.');
      }
      for (const q of arr) {
        if (!q.question || !Array.isArray(q.options) || q.options.length < 2 || typeof q.correct !== 'number') {
          throw new Error('Una o más preguntas no cumplen el formato esperado.');
        }
      }
      this.questions = arr;
      this.loadError = null;
      this.restart();
    } catch (err) {
      this.loadError = err.message;
      this.render();
    }
  }

  render(opts = {}) {
    if (!this.container) return;

    if (this.loading) {
      this.container.innerHTML = `
        <div class="quiz-final-card">
          <p style="font-size: 1.1rem; color: #93c5fd;">⏳ Cargando banco de preguntas...</p>
        </div>
      `;
      return;
    }

    if (!this.questions || this.questions.length === 0) {
      this.container.innerHTML = `
        <div class="quiz-final-card">
          <p style="color: #f87171;">⚠️ No hay preguntas disponibles.</p>
        </div>
      `;
      return;
    }

    if (this.currentIndex >= this.questions.length) {
      const total = this.questions.length;
      const pct = Math.round((this.score / total) * 100);
      const mensaje = pct >= 80
        ? '¡Excelente dominio de las estructuras de datos y algoritmos!'
        : pct >= 50
          ? '¡Buen trabajo! Revisá los temas donde fallaste y volvé a intentarlo.'
          : '¡Buen intento! Reiniciá el quiz para reforzar los conceptos.';

      this.container.innerHTML = `
        <div class="quiz-final-card">
          <div style="font-size: 3rem; margin-bottom: 0.5rem;">🎉</div>
          <h2 style="color: #60a5fa; margin-bottom: 0.5rem;">¡Desafío Completado!</h2>
          <p style="font-size: 1.1rem; margin-bottom: 1rem;">
            Puntuación: <strong>${this.score} / ${total}</strong> (${pct}%)
          </p>
          <div class="quiz-progress-track" style="max-width: 500px; margin: 0 auto 1rem;">
            <div class="quiz-progress-fill" style="width: ${pct}%;"></div>
          </div>
          <p style="color: var(--text-secondary); max-width: 500px; margin: 0 auto 1.5rem; line-height: 1.5;">
            ${mensaje}
          </p>
          <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
            <button class="btn btn-primary" onclick="window.quizInstance.restart()">↺ Reiniciar Desafío</button>
            <button class="btn" onclick="window.quizInstance.shuffle()">🔀 Mezclar y Reiniciar</button>
            <label class="btn" style="cursor: pointer;">
              📥 Cargar banco .json
              <input type="file" accept=".json" style="display: none;" onchange="window.quizInstance.loadExternalBank(this.files[0])">
            </label>
          </div>
        </div>
      `;
      return;
    }

    const q = this.questions[this.currentIndex];
    const progressDisplay = this.currentIndex === 0 ? 0 : Math.round(((this.currentIndex) / (this.questions.length - 1)) * 100);

    let html = `
      <div class="quiz-wrapper">
        <div class="quiz-header">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <span style="font-size: 0.85rem; font-weight: 700; color: #93c5fd;">
              Pregunta ${this.currentIndex + 1} de ${this.questions.length}
            </span>
            <span style="font-size: 0.85rem; color: #34d399; font-weight: 700;">
              Aciertos: ${this.score} / ${this.currentIndex + (this.answered ? 1 : 0)}
            </span>
          </div>
          <div class="quiz-progress-track">
            <div class="quiz-progress-fill" style="width: ${progressDisplay}%;"></div>
          </div>
          ${this.loadError ? `<div style="font-size: 0.75rem; color: #f59e0b; margin-top: 0.4rem;">⚠️ Banco externo no disponible (${this.loadError}); usando preguntas embebidas.</div>` : ''}
        </div>

        <div class="quiz-question-box">
          <h3 style="font-size: 1.15rem; color: #f8fafc; line-height: 1.4; margin-bottom: 1.25rem;">${q.question}</h3>
          <div class="quiz-options-list">
    `;

    q.options.forEach((opt, idx) => {
      let btnClass = 'quiz-option-btn';
      if (this.answered) {
        if (idx === q.correct) btnClass += ' option-correct';
        else if (idx === opts.selected) btnClass += ' option-wrong';
        else btnClass += ' option-disabled';
      }

      html += `
        <button class="${btnClass}" onclick="window.quizInstance.answer(${idx})" ${this.answered ? 'disabled' : ''}>
          <span class="option-letter">${String.fromCharCode(65 + idx)}</span>
          <span class="option-text">${opt}</span>
        </button>
      `;
    });

    html += `
          </div>
        </div>
    `;

    if (this.answered) {
      html += `
        <div class="quiz-feedback-box ${opts.isCorrect ? 'feedback-correct' : 'feedback-wrong'}">
          <strong>${opts.isCorrect ? '✓ ¡Correcto!' : '✗ Respuesta incorrecta'}</strong>
          <p style="margin-top: 0.3rem; font-size: 0.85rem; color: #e2e8f0;">${q.explanation || ''}</p>
          <button class="btn btn-primary" style="margin-top: 0.8rem;" onclick="window.quizInstance.nextQuestion()">
            ${this.currentIndex + 1 < this.questions.length ? 'Siguiente Pregunta ➔' : 'Ver Resultados Finales 🏁'}
          </button>
        </div>
      `;
    }

    html += `
        <div style="margin-top: 1rem; display: flex; gap: 0.5rem; justify-content: flex-end;">
          <button class="btn" onclick="window.quizInstance.shuffle()">🔀 Mezclar</button>
        </div>
      </div>
    `;
    this.container.innerHTML = html;
  }
}

