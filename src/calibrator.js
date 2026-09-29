/**
 * Módulo Calibrador Web de Alta Precisão (Frame a Frame)
 * Permite marcar Start (S), Clímax (C) e End (E) com atalhos de teclado e encadeamento contínuo de recortes.
 */

import { formatClock, SECTION_KEYS } from './syncEngine.js';

export class WebCalibrator {
  constructor({ containerEl, db, onDatabaseUpdated }) {
    this.containerEl = containerEl;
    this.db = db;
    this.onDatabaseUpdated = onDatabaseUpdated;

    this.currentDemoId = db.demonstrations[0].id;
    this.currentKataId = "reiho_inicial";
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
    
    // Encontra seção anterior e posterior na cadeia cronológica
    const curIdx = SECTION_KEYS.indexOf(this.currentKataId);
    const prevKey = curIdx > 0 ? SECTION_KEYS[curIdx - 1] : null;
    const nextKey = curIdx < SECTION_KEYS.length - 1 ? SECTION_KEYS[curIdx + 1] : null;

    const prevEnd = (prevKey && demo.katas && demo.katas[prevKey]) ? demo.katas[prevKey].end : null;

    // Obtém timing atual
    let kataTiming = (demo.katas && demo.katas[this.currentKataId]) ? { ...demo.katas[this.currentKataId] } : null;
    if (!kataTiming) {
      const defaultStart = prevEnd !== null ? prevEnd : 0;
      kataTiming = { start: defaultStart, climax: defaultStart + 10, end: defaultStart + 20 };
    } else if (kataTiming.start === 0 && prevEnd !== null && this.currentKataId !== "reiho_inicial") {
      // Auto-encadeamento inteligente: se start for 0 e houver bloco anterior, sugere o término anterior
      kataTiming.start = prevEnd;
    }

    const demoOptions = this.db.demonstrations.map(d => {
      return `<option value="${d.id}" ${d.id === this.currentDemoId ? 'selected' : ''}>${d.title}</option>`;
    }).join("");

    // Agrupamento pedagógico cronológico
    const groups = [
      { label: "⛩️ Protocolo Inicial", keys: ["reiho_inicial"] },
      { label: "⚔️ Katas de Tachi (Espada Longa)", keys: ["kata_01", "kata_02", "kata_03", "kata_04", "kata_05", "kata_06", "kata_07"] },
      { label: "🔄 Transição de Armas", keys: ["troca_kodachi"] },
      { label: "🗡️ Katas de Kodachi (Espada Curta)", keys: ["kata_08", "kata_09", "kata_10"] },
      { label: "⛩️ Protocolo Final", keys: ["reiho_final"] }
    ];

    let kataOptions = "";
    for (const g of groups) {
      kataOptions += `<optgroup label="${g.label}">`;
      for (const kId of g.keys) {
        const k = this.db.katas_pedagogical[kId];
        if (!k) continue;
        let title = "";
        if (kId === "reiho_inicial") title = "Reiho Inicial (Zarei) • 礼法（前）";
        else if (kId === "troca_kodachi") title = "Troca para Kodachi • 小太刀への交換";
        else if (kId === "reiho_final") title = "Reiho Final (Zarei e Saída) • 礼法（後）";
        else {
          const prefix = k.type === "kodachi" ? "Kodachi" : "Kata";
          title = `${prefix} #${k.number} • ${k.name_romaji} (${k.name_jp})`;
        }
        kataOptions += `<option value="${kId}" ${kId === this.currentKataId ? 'selected' : ''}>${title}</option>`;
      }
      kataOptions += `</optgroup>`;
    }

    // Títulos e descrições contextuais de cada marcador
    let startTitle = "1. Ponto de Início (Start)";
    let startDesc = "Último frame estável em Chūdan a 9 passos (término do bloco anterior)";
    let climaxTitle = "2. Ponto de Clímax (Impacto)";
    let climaxDesc = "Momento exato do contragolpe de Shidachi (t=0)";
    let endTitle = "3. Ponto de Término (End)";
    let endDesc = "Final dos 5 passos e estabilização em Chūdan";

    if (this.currentKataId === "reiho_inicial") {
      startTitle = "1. Início do Protocolo (Start)";
      startDesc = "Entrada na quadra / Antes do primeiro Rei mútuo ao Shomen";
      climaxTitle = "2. Zarei Mútuo (Clímax / Âncora)";
      climaxDesc = "Instante da inclinação cerimonial em Zarei entre Uchidachi e Shidachi";
      endTitle = "3. Término do Protocolo (End)";
      endDesc = "Assunção sincronizada de Chūdan a 9 passos (início do Ippon-me)";
    } else if (this.currentKataId === "troca_kodachi") {
      startTitle = "1. Início da Troca (Start)";
      startDesc = "Sonkyo ao término do Nanahon-me / Embainhar da espada longa";
      climaxTitle = "2. Sonkyo com Kodachi (Clímax / Âncora)";
      climaxDesc = "Instante exato do Sonkyo com a Kodachi desembainhada";
      endTitle = "3. Término da Troca (End)";
      endDesc = "Assunção de Chūdan antes do 8º kata (1º de Kodachi)";
    } else if (this.currentKataId === "reiho_final") {
      startTitle = "1. Início do Encerramento (Start)";
      startDesc = "Sonkyo ao término do 10º kata / Embainhar";
      climaxTitle = "2. Zarei Mútuo Final (Clímax / Âncora)";
      climaxDesc = "Zarei mútuo final de agradecimento e reverência mútua";
      endTitle = "3. Saída da Quadra (End)";
      endDesc = "Último Rei mútuo ao Shomen na borda ao sair da quadra";
    }

    const prevKataName = prevKey ? (this.db.katas_pedagogical[prevKey]?.name_romaji || prevKey) : "";
    const chainPrevBtnHtml = prevKey ? `
      <button type="button" id="btn-chain-prev" class="btn-chain-link" title="Copiar exatamente o término de ${prevKataName}">
        🔗 Início = Fim de "${prevKataName}" (${prevEnd !== null && prevEnd !== undefined ? prevEnd.toFixed(2) + 's' : 'não definido'})
      </button>
    ` : '';

    this.containerEl.innerHTML = `
      <div class="calibrator-header-bar">
        <div class="calibrator-title">
          <span class="calib-badge">MODO CALIBRADOR DE PRECISÃO</span>
          <h3>Mesa de Calibração e Encadeamento Contínuo</h3>
        </div>
        <div class="calibrator-selectors">
          <select id="calib-demo-select" class="kendo-select">${demoOptions}</select>
          <div style="display: flex; gap: 0.35rem; align-items: center;">
            <button id="btn-prev-section" class="calibrator-nav-btn" ${!prevKey ? 'disabled' : ''} title="Ir para o bloco anterior">⏮ Anterior</button>
            <select id="calib-kata-select" class="kendo-select">${kataOptions}</select>
            <button id="btn-next-section" class="calibrator-nav-btn" ${!nextKey ? 'disabled' : ''} title="Ir para o próximo bloco">Próximo ⏭</button>
          </div>
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
            <div class="marker-title">${startTitle}</div>
            <div class="marker-desc">${startDesc}</div>
            <div class="marker-input-row">
              <input type="number" step="0.05" id="input-start" class="kendo-input-num" value="${kataTiming.start.toFixed(2)}" />
              <button id="btn-mark-start" class="btn-mark btn-start" title="Atalho: tecla S">📍 Marcar [S]</button>
            </div>
            ${chainPrevBtnHtml}
          </div>

          <div class="marker-card climax-card">
            <div class="marker-title">${climaxTitle}</div>
            <div class="marker-desc">${climaxDesc}</div>
            <div class="marker-input-row">
              <input type="number" step="0.05" id="input-climax" class="kendo-input-num" value="${kataTiming.climax.toFixed(2)}" />
              <button id="btn-mark-climax" class="btn-mark btn-climax-mark" title="Atalho: tecla C">⚡ Marcar [C]</button>
            </div>
          </div>

          <div class="marker-card end-card">
            <div class="marker-title">${endTitle}</div>
            <div class="marker-desc">${endDesc}</div>
            <div class="marker-input-row">
              <input type="number" step="0.05" id="input-end" class="kendo-input-num" value="${kataTiming.end.toFixed(2)}" />
              <button id="btn-mark-end" class="btn-mark btn-end" title="Atalho: tecla E">🏁 Marcar [E]</button>
            </div>
            <span class="chain-badge-info">🔗 Ao salvar, o Fim deste bloco será atribuído ao Início do próximo.</span>
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

    this.bindEvents(prevKey, nextKey, prevEnd);
    this.initYouTubePlayer();
  }

  bindEvents(prevKey, nextKey, prevEnd) {
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

    const btnPrev = this.containerEl.querySelector('#btn-prev-section');
    if (btnPrev && prevKey) {
      btnPrev.addEventListener('click', () => {
        this.currentKataId = prevKey;
        this.render();
      });
    }

    const btnNext = this.containerEl.querySelector('#btn-next-section');
    if (btnNext && nextKey) {
      btnNext.addEventListener('click', () => {
        this.currentKataId = nextKey;
        this.render();
      });
    }

    const btnChainPrev = this.containerEl.querySelector('#btn-chain-prev');
    if (btnChainPrev && prevEnd !== null && prevEnd !== undefined) {
      btnChainPrev.addEventListener('click', () => {
        const inputStart = this.containerEl.querySelector('#input-start');
        if (inputStart) {
          inputStart.value = prevEnd.toFixed(2);
          inputStart.style.borderColor = "#3B82F6";
          setTimeout(() => { inputStart.style.borderColor = ""; }, 1000);
        }
      });
    }

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

  async saveCurrentTiming() {
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

    // Auto-encadeamento para o bloco seguinte na cadeia cronológica
    const curIdx = SECTION_KEYS.indexOf(this.currentKataId);
    const nextKey = curIdx < SECTION_KEYS.length - 1 ? SECTION_KEYS[curIdx + 1] : null;

    if (nextKey) {
      if (!demo.katas[nextKey]) {
        demo.katas[nextKey] = { start: end, climax: end + 10, end: end + 20 };
      } else {
        demo.katas[nextKey].start = end;
        if (demo.katas[nextKey].climax <= end) {
          demo.katas[nextKey].climax = Number((end + 8).toFixed(2));
          demo.katas[nextKey].end = Number((end + 18).toFixed(2));
        }
      }
    }

    // Salva no localStorage como backup local imediato
    try {
      localStorage.setItem('kendo_kata_db', JSON.stringify(this.db));
    } catch (e) {}

    const saveBtn = this.containerEl.querySelector('#btn-save-kata-timing');
    const originalText = saveBtn ? saveBtn.innerHTML : '';
    if (saveBtn) saveBtn.innerHTML = '⏳ Salvando...';

    // Envia para o endpoint do Vite para gravar no arquivo do disco
    try {
      const response = await fetch('/api/save-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.db)
      });

      if (response.ok) {
        if (saveBtn) {
          saveBtn.innerHTML = '✅ Salvo no Disco!';
          setTimeout(() => { saveBtn.innerHTML = originalText; }, 2500);
        }
        const nextInfo = nextKey ? `\n🔗 O Início do próximo bloco (${nextKey}) foi automaticamente encadeado em ${end.toFixed(2)}s.` : '';
        alert(`✅ Sucesso! Os timestamps do ${this.currentKataId} foram salvos diretamente no arquivo data/kata_database.json no disco!${nextInfo}`);
      } else {
        throw new Error(`Status ${response.status}`);
      }
    } catch (err) {
      if (saveBtn) saveBtn.innerHTML = originalText;
      alert(`ℹ️ Timestamps salvos na memória do navegador. Para atualizar o arquivo físico no disco, clique em "Baixar kata_database.json".`);
    }

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
