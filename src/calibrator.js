/**
 * Módulo Calibrador Web de Alta Precisão (Frame a Frame)
 * Permite marcar Start (S), Clímax (C) e End (E) com atalhos de teclado e exportar o JSON atualizado.
 */

import { formatClock } from './syncEngine.js';

export class WebCalibrator {
  constructor({ containerEl, db, onDatabaseUpdated }) {
    this.containerEl = containerEl;
    this.db = db;
    this.onDatabaseUpdated = onDatabaseUpdated;

    this.currentDemoId = db.demonstrations[0].id;
    this.currentKataId = "kata_01";
    this.calibratorPlayer = null;
    this.isPlaying = false;
    this.isTestingLoop = false;
    this.loopCheckInterval = null;
    this.pollInterval = null;
  }

  /**
   * Renderiza a interface do calibrador no container.
   */
  render() {
    const demo = this.db.demonstrations.find(d => d.id === this.currentDemoId) || this.db.demonstrations[0];
    const kataTiming = (demo.katas && demo.katas[this.currentKataId]) || { start: 0, climax: 10, end: 20 };

    const demoOptions = this.db.demonstrations.map(d => {
      return `<option value="${d.id}" ${d.id === this.currentDemoId ? 'selected' : ''}>${d.title}</option>`;
    }).join("");

    const kataOptions = Object.keys(this.db.katas_pedagogical).map(kId => {
      const k = this.db.katas_pedagogical[kId];
      return `<option value="${kId}" ${kId === this.currentKataId ? 'selected' : ''}>Kata #${k.number} • ${k.name_romaji} (${k.name_jp})</option>`;
    }).join("");

    this.containerEl.innerHTML = `
      <div class="calibrator-header-bar">
        <div class="calibrator-title">
          <span class="calib-badge">MODO CALIBRADOR</span>
          <h3>Mesa de Calibração e Ajuste Fino de Timestamps</h3>
        </div>
        <div class="calibrator-selectors">
          <select id="calib-demo-select" class="kendo-select">${demoOptions}</select>
          <select id="calib-kata-select" class="kendo-select">${kataOptions}</select>
        </div>
      </div>

      <!-- Player de Alta Precisão -->
      <div class="calibrator-player-box">
        <div class="video-wrapper">
          <div id="calibrator-yt-target"></div>
        </div>
      </div>

      <!-- Display de Tempo e Controles Frame a Frame -->
      <div class="calibrator-controls-panel">
        <div class="precision-time-display">
          <span class="time-readout-label">Tempo Atual:</span>
          <span id="calib-current-time" class="time-readout-val">00:00.000</span>
          <span id="calib-current-sec" class="time-sec-val">(0.000s)</span>
        </div>

        <div class="precision-btn-row">
          <button id="calib-step-back-sec" class="btn-icon-action" title="Voltar 1 segundo (Seta Esquerda)">⏮ -1.0s</button>
          <button id="calib-step-back-frame" class="btn-icon-action" title="Voltar 1 frame / 0.1s (J)">⏪ -0.1s [J]</button>
          <button id="calib-play-pause" class="btn-play-pause" title="Play / Pausa (Espaço)"><span id="calib-play-icon">▶</span></button>
          <button id="calib-step-fwd-frame" class="btn-icon-action" title="Avançar 1 frame / 0.1s (L)">⏩ +0.1s [L]</button>
          <button id="calib-step-fwd-sec" class="btn-icon-action" title="Avançar 1 segundo (Seta Direita)">⏭ +1.0s</button>
        </div>

        <!-- Marcações de Início, Clímax e Fim -->
        <div class="markers-grid">
          <div class="marker-card start-card">
            <div class="marker-title">1. Ponto de Início (Start)</div>
            <div class="marker-desc">Último frame estável em Chūdan a 9 passos</div>
            <div class="marker-input-row">
              <input type="number" step="0.05" id="input-start" class="kendo-input-num" value="${kataTiming.start.toFixed(2)}" />
              <button id="btn-mark-start" class="btn-mark btn-start" title="Atalho: tecla S">📍 Marcar [S]</button>
            </div>
          </div>

          <div class="marker-card climax-card">
            <div class="marker-title">2. Ponto de Clímax (Impacto)</div>
            <div class="marker-desc">Momento exato do contragolpe de Shidachi (t=0)</div>
            <div class="marker-input-row">
              <input type="number" step="0.05" id="input-climax" class="kendo-input-num" value="${kataTiming.climax.toFixed(2)}" />
              <button id="btn-mark-climax" class="btn-mark btn-climax-mark" title="Atalho: tecla C">⚡ Marcar [C]</button>
            </div>
          </div>

          <div class="marker-card end-card">
            <div class="marker-title">3. Ponto de Término (End)</div>
            <div class="marker-desc">Final dos 5 passos e estabilização em Chūdan</div>
            <div class="marker-input-row">
              <input type="number" step="0.05" id="input-end" class="kendo-input-num" value="${kataTiming.end.toFixed(2)}" />
              <button id="btn-mark-end" class="btn-mark btn-end" title="Atalho: tecla E">🏁 Marcar [E]</button>
            </div>
          </div>
        </div>

        <!-- Ações do Calibrador -->
        <div class="calibrator-footer-actions">
          <button id="btn-test-preview" class="btn-pill" style="border-color: var(--gold-primary);">
            <span>🔄</span> Testar Loop do Corte
          </button>
          <button id="btn-save-kata-timing" class="btn-pill" style="background-color: rgba(16, 185, 129, 0.2); border-color: #10B981; color: #10B981;">
            <span>💾</span> Salvar no Banco
          </button>
          <button id="btn-export-json" class="btn-pill" style="background-color: var(--gold-primary); color: #070A11; font-weight: 700;">
            <span>📥</span> Baixar kata_database.json
          </button>
          <button id="btn-copy-json" class="btn-pill">
            <span>📋</span> Copiar JSON
          </button>
        </div>
      </div>
    `;

    this.bindEvents();
    this.initYouTubePlayer();
  }

  bindEvents() {
    const demoSelect = this.containerEl.querySelector('#calib-demo-select');
    demoSelect.addEventListener('change', (e) => {
      this.currentDemoId = e.target.value;
      this.render();
    });

    const kataSelect = this.containerEl.querySelector('#calib-kata-select');
    kataSelect.addEventListener('change', (e) => {
      this.currentKataId = e.target.value;
      this.render();
    });

    // Botões de marcação
    this.containerEl.querySelector('#btn-mark-start').addEventListener('click', () => this.markCurrentTime('start'));
    this.containerEl.querySelector('#btn-mark-climax').addEventListener('click', () => this.markCurrentTime('climax'));
    this.containerEl.querySelector('#btn-mark-end').addEventListener('click', () => this.markCurrentTime('end'));

    // Botões de navegação
    this.containerEl.querySelector('#calib-play-pause').addEventListener('click', () => this.togglePlayPause());
    this.containerEl.querySelector('#calib-step-back-sec').addEventListener('click', () => this.stepTime(-1.0));
    this.containerEl.querySelector('#calib-step-back-frame').addEventListener('click', () => this.stepTime(-0.1));
    this.containerEl.querySelector('#calib-step-fwd-frame').addEventListener('click', () => this.stepTime(0.1));
    this.containerEl.querySelector('#calib-step-fwd-sec').addEventListener('click', () => this.stepTime(1.0));

    // Ações finais
    this.containerEl.querySelector('#btn-test-preview').addEventListener('click', () => this.testLoop());
    this.containerEl.querySelector('#btn-save-kata-timing').addEventListener('click', () => this.saveCurrentTiming());
    this.containerEl.querySelector('#btn-export-json').addEventListener('click', () => this.exportJson());
    this.containerEl.querySelector('#btn-copy-json').addEventListener('click', () => this.copyJson());
  }

  initYouTubePlayer() {
    const demo = this.db.demonstrations.find(d => d.id === this.currentDemoId);
    const timing = (demo.katas && demo.katas[this.currentKataId]) || { start: 0 };

    if (this.calibratorPlayer && typeof this.calibratorPlayer.destroy === 'function') {
      try { this.calibratorPlayer.destroy(); } catch (e) {}
    }

    this.calibratorPlayer = new window.YT.Player('calibrator-yt-target', {
      videoId: demo.youtube_id,
      playerVars: {
        autoplay: 0,
        controls: 1, // controles visíveis no modo calibrador
        playsinline: 1,
        start: Math.floor(timing.start)
      },
      events: {
        onReady: (event) => {
          event.target.seekTo(timing.start, true);
          event.target.pauseVideo();
          this.startPollingTime();
        }
      }
    });
  }

  startPollingTime() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = setInterval(() => {
      if (this.calibratorPlayer && typeof this.calibratorPlayer.getCurrentTime === 'function') {
        const t = this.calibratorPlayer.getCurrentTime() || 0;
        const timeEl = this.containerEl.querySelector('#calib-current-time');
        const secEl = this.containerEl.querySelector('#calib-current-sec');
        if (timeEl) timeEl.textContent = formatClock(t);
        if (secEl) secEl.textContent = `(${t.toFixed(3)}s)`;
      }
    }, 60);
  }

  togglePlayPause() {
    if (!this.calibratorPlayer) return;
    const icon = this.containerEl.querySelector('#calib-play-icon');
    if (this.isPlaying) {
      this.calibratorPlayer.pauseVideo();
      this.isPlaying = false;
      if (icon) icon.textContent = "▶";
    } else {
      this.calibratorPlayer.playVideo();
      this.isPlaying = true;
      if (icon) icon.textContent = "⏸";
    }
  }

  stepTime(delta) {
    if (!this.calibratorPlayer || typeof this.calibratorPlayer.getCurrentTime !== 'function') return;
    const current = this.calibratorPlayer.getCurrentTime();
    const newTime = Math.max(0, current + delta);
    this.calibratorPlayer.seekTo(newTime, true);
  }

  markCurrentTime(field) {
    if (!this.calibratorPlayer || typeof this.calibratorPlayer.getCurrentTime !== 'function') return;
    const t = Number(this.calibratorPlayer.getCurrentTime().toFixed(2));
    const input = this.containerEl.querySelector(`#input-${field}`);
    if (input) {
      input.value = t;
      input.style.borderColor = "var(--gold-primary)";
      setTimeout(() => { input.style.borderColor = ""; }, 1000);
    }
  }

  saveCurrentTiming() {
    const start = parseFloat(this.containerEl.querySelector('#input-start').value);
    const climax = parseFloat(this.containerEl.querySelector('#input-climax').value);
    const end = parseFloat(this.containerEl.querySelector('#input-end').value);

    if (isNaN(start) || isNaN(climax) || isNaN(end) || !(start < climax && climax < end)) {
      alert("Erro: Certifique-se de que Start < Clímax < End!");
      return;
    }

    const demo = this.db.demonstrations.find(d => d.id === this.currentDemoId);
    if (!demo.katas) demo.katas = {};
    demo.katas[this.currentKataId] = { start, climax, end };

    alert(`Timestamps do ${this.currentKataId} salvos com sucesso na memória!`);
    if (this.onDatabaseUpdated) {
      this.onDatabaseUpdated(this.db);
    }
  }

  testLoop() {
    const start = parseFloat(this.containerEl.querySelector('#input-start').value);
    const end = parseFloat(this.containerEl.querySelector('#input-end').value);

    if (!this.calibratorPlayer) return;

    if (this.loopCheckInterval) clearInterval(this.loopCheckInterval);

    this.calibratorPlayer.seekTo(start, true);
    this.calibratorPlayer.playVideo();
    this.isPlaying = true;

    this.loopCheckInterval = setInterval(() => {
      const cur = this.calibratorPlayer.getCurrentTime();
      if (cur >= end) {
        this.calibratorPlayer.seekTo(start, true);
      }
    }, 100);
  }

  exportJson() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.db, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "kata_database.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  copyJson() {
    navigator.clipboard.writeText(JSON.stringify(this.db, null, 2)).then(() => {
      alert("Banco de dados JSON copiado para a área de transferência!");
    });
  }

  destroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.loopCheckInterval) clearInterval(this.loopCheckInterval);
    if (this.calibratorPlayer && typeof this.calibratorPlayer.destroy === 'function') {
      try { this.calibratorPlayer.destroy(); } catch (e) {}
    }
  }
}
