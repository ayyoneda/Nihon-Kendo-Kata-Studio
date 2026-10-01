/**
 * Gerenciador da Grade Dinâmica de Vídeos e Integração com a YouTube IFrame API
 */

import { getAbsoluteVideoTime, calculateTimeWindow, getSlotPlaybackState } from './syncEngine.js';

let isYouTubeApiReady = false;
const pendingCallbacks = [];

// Carrega o script da API do YouTube se ainda não foi injetado
export function ensureYouTubeIFrameApi() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      isYouTubeApiReady = true;
      resolve();
      return;
    }

    pendingCallbacks.push(resolve);

    if (!document.getElementById('youtube-iframe-api-script')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        isYouTubeApiReady = true;
        while (pendingCallbacks.length) {
          const cb = pendingCallbacks.shift();
          cb();
        }
      };
    }
  });
}

export class VideoGridManager {
  constructor({ containerEl, db, onAudioChange, onReadyStateChange, onDemoChange }) {
    this.containerEl = containerEl;
    this.db = db;
    this.onAudioChange = onAudioChange;
    this.onReadyStateChange = onReadyStateChange;
    this.onDemoChange = onDemoChange;

    this.slots = []; // Array de slots ativos: [{ index, demoId, ytPlayer, isReady, isMuted }]
    this.activeAudioIndex = 0; // Por padrão, slot 0 tem áudio
    this.currentKataId = "kata_01";
    this.currentLayout = "grid-2x2";
  }

  /**
   * Configura e renderiza a grade para o layout e lista de demonstrações selecionadas.
   */
  async setupGrid(layout, selectedDemoIds, currentKataId) {
    this.currentLayout = layout;
    this.currentKataId = currentKataId;

    // Destrói players antigos para liberar memória
    this.destroyPlayers();

    // Determina quantos slots exibir
    let numSlots = 4;
    if (layout === 'grid-1x1') numSlots = 1;
    else if (layout === 'grid-1x2') numSlots = 2;

    this.containerEl.className = `video-grid ${layout}`;
    this.containerEl.innerHTML = '';

    await ensureYouTubeIFrameApi();

    this.slots = [];
    for (let i = 0; i < numSlots; i++) {
      const demoId = selectedDemoIds[i] || this.db.demonstrations[i % this.db.demonstrations.length].id;
      const slot = this.createSlotElement(i, demoId);
      this.slots.push(slot);
    }

    // Inicializa os players do YouTube
    for (const slot of this.slots) {
      this.initPlayerForSlot(slot);
    }

    this.notifyAudioChange();
  }

  createSlotElement(index, demoId) {
    const demo = this.db.demonstrations.find(d => d.id === demoId) || this.db.demonstrations[0];
    const cardEl = document.createElement('div');
    cardEl.className = `player-card ${index === this.activeAudioIndex ? 'active-audio' : ''}`;
    cardEl.id = `player-card-${index}`;

    const quadrantLabels = ["Q1 • Superior Esquerdo", "Q2 • Superior Direito", "Q3 • Inferior Esquerdo", "Q4 • Inferior Direito"];
    const qBadge = quadrantLabels[index] || `Slot ${index + 1}`;

    const categories = [
      { label: "📘 Manual & Padrão Oficial AJKF", filter: d => d.id === 'ajkf_official_standard' },
      { label: "🏆 All Japan Kendo Championship (Zen Nihon)", filter: d => d.id.includes('all_japan') },
      { label: "⚔️ Torneio Selecionado de 8º Dan (Nagoya)", filter: d => d.id.includes('8dan') },
      { label: "⛩️ Kyoto Taikai (Butokuden)", filter: d => d.id.includes('kyoto') }
    ];

    let demoOptionsHtml = "";
    for (const cat of categories) {
      const catDemos = this.db.demonstrations.filter(cat.filter);
      if (catDemos.length > 0) {
        demoOptionsHtml += `<optgroup label="${cat.label}">`;
        for (const d of catDemos) {
          demoOptionsHtml += `<option value="${d.id}" ${d.id === demo.id ? 'selected' : ''}>${d.title}</option>`;
        }
        demoOptionsHtml += `</optgroup>`;
      }
    }

    cardEl.innerHTML = `
      <div class="player-card-header">
        <div class="demo-selector-group">
          <span class="quadrant-badge">${qBadge}</span>
          <select class="kendo-select demo-select" id="select-demo-${index}" title="Selecionar Demonstração">
            ${demoOptionsHtml}
          </select>
        </div>
        <div class="player-actions">
          <button class="btn-audio ${index === this.activeAudioIndex ? 'unmuted' : ''}" id="btn-audio-${index}" title="Alternar áudio deste quadrante">
            ${index === this.activeAudioIndex ? '🔊 Áudio' : '🔇 Mudo'}
          </button>
        </div>
      </div>

      <div class="video-wrapper">
        <div id="yt-player-target-${index}"></div>
      </div>

      <div class="player-card-footer">
        <span class="masters-names">
          ${demo.uchidachi.name} (${demo.uchidachi.title}) × ${demo.shidachi.name} (${demo.shidachi.title})
        </span>
      </div>
    `;

    this.containerEl.appendChild(cardEl);

    // Eventos do card
    const selectEl = cardEl.querySelector(`#select-demo-${index}`);
    selectEl.addEventListener('change', (e) => {
      this.changeDemoForSlot(index, e.target.value);
    });

    const audioBtn = cardEl.querySelector(`#btn-audio-${index}`);
    audioBtn.addEventListener('click', () => {
      this.setActiveAudio(index);
    });

    return {
      index,
      demoId: demo.id,
      cardEl,
      ytPlayer: null,
      isReady: false,
      isMuted: index !== this.activeAudioIndex
    };
  }

  initPlayerForSlot(slot) {
    const demo = this.db.demonstrations.find(d => d.id === slot.demoId) || this.db.demonstrations[0];
    const tw = calculateTimeWindow(this.currentKataId, [slot.demoId], this.db);
    const initialTime = getAbsoluteVideoTime(tw.minRelative, demo.id, this.currentKataId, this.db);

    slot.ytPlayer = new window.YT.Player(`yt-player-target-${slot.index}`, {
      videoId: demo.youtube_id,
      playerVars: {
        autoplay: 0,
        controls: 0, // Controles limpos controlados pela timeline mestre
        disablekb: 1,
        fs: 0,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        start: Math.floor(initialTime)
      },
      events: {
        onReady: (event) => {
          slot.isReady = true;
          if (slot.isMuted) {
            event.target.mute();
          } else {
            event.target.unMute();
            event.target.setVolume(100);
          }
          // Pausa no início exato para sincronia
          event.target.seekTo(initialTime, true);
          event.target.pauseVideo();

          if (this.onReadyStateChange) {
            this.onReadyStateChange();
          }
        },
        onStateChange: (event) => {
          // Monitoramento de buffering / loop
        }
      }
    });
  }

  changeDemoForSlot(slotIndex, newDemoId) {
    const slot = this.slots.find(s => s.index === slotIndex);
    if (!slot) return;

    slot.demoId = newDemoId;
    const demo = this.db.demonstrations.find(d => d.id === newDemoId);
    if (!demo) return;

    // Atualiza nomes no footer
    const footerNameEl = slot.cardEl.querySelector('.masters-names');
    if (footerNameEl) {
      footerNameEl.textContent = `${demo.uchidachi.name} (${demo.uchidachi.title}) × ${demo.shidachi.name} (${demo.shidachi.title})`;
    }

    if (slot.ytPlayer && typeof slot.ytPlayer.loadVideoById === 'function') {
      const tw = calculateTimeWindow(this.currentKataId, [demo.id], this.db);
      const initialTime = getAbsoluteVideoTime(tw.minRelative, demo.id, this.currentKataId, this.db);
      slot.ytPlayer.loadVideoById({
        videoId: demo.youtube_id,
        startSeconds: Math.floor(initialTime)
      });
      slot.ytPlayer.pauseVideo();
    }

    if (slotIndex === this.activeAudioIndex) {
      this.notifyAudioChange();
    }

    if (this.onDemoChange) {
      this.onDemoChange(slotIndex, newDemoId);
    }
  }

  notifyAudioChange() {
    if (this.onAudioChange) {
      const activeSlot = this.slots.find(s => s.index === this.activeAudioIndex);
      const demo = activeSlot ? this.db.demonstrations.find(d => d.id === activeSlot.demoId) : null;
      if (demo) {
        const uLastName = (demo.uchidachi && demo.uchidachi.name) ? demo.uchidachi.name.split(' ')[0] : '';
        const sLastName = (demo.shidachi && demo.shidachi.name) ? demo.shidachi.name.split(' ')[0] : '';
        const duoText = (uLastName && sLastName) ? ` (${uLastName} & ${sLastName})` : '';
        this.onAudioChange(`Q${this.activeAudioIndex + 1}: ${demo.title}${duoText}`);
      } else {
        this.onAudioChange("Nenhum");
      }
    }
  }

  setActiveAudio(activeSlotIndex) {
    this.activeAudioIndex = activeSlotIndex;
    this.slots.forEach(slot => {
      const btn = slot.cardEl.querySelector(`#btn-audio-${slot.index}`);
      if (slot.index === activeSlotIndex) {
        slot.isMuted = false;
        slot.cardEl.classList.add('active-audio');
        if (slot.ytPlayer && typeof slot.ytPlayer.unMute === 'function') {
          slot.ytPlayer.unMute();
          slot.ytPlayer.setVolume(100);
        }
        if (btn) {
          btn.innerHTML = '🔊 Áudio';
          btn.classList.add('unmuted');
        }
      } else {
        slot.isMuted = true;
        slot.cardEl.classList.remove('active-audio');
        if (slot.ytPlayer && typeof slot.ytPlayer.mute === 'function') {
          slot.ytPlayer.mute();
        }
        if (btn) {
          btn.innerHTML = '🔇 Mudo';
          btn.classList.remove('unmuted');
        }
      }
    });

    this.notifyAudioChange();
  }

  seekAll(relativeTime, kataId, syncMode = 'climax') {
    this.currentKataId = kataId;
    this.slots.forEach(slot => {
      if (slot.ytPlayer && slot.isReady && typeof slot.ytPlayer.seekTo === 'function') {
        const absTime = getAbsoluteVideoTime(relativeTime, slot.demoId, kataId, this.db, syncMode);
        slot.ytPlayer.seekTo(absTime, true);
      }
    });
  }

  updatePlaybackState(currentRelativeTime, currentKataId, isPlayingMaster, syncMode = 'climax') {
    this.currentKataId = currentKataId;
    this.slots.forEach(slot => {
      if (!slot.ytPlayer || !slot.isReady) return;

      const state = getSlotPlaybackState(currentRelativeTime, slot.demoId, currentKataId, this.db, syncMode);

      if (!isPlayingMaster) {
        if (typeof slot.ytPlayer.pauseVideo === 'function') {
          slot.ytPlayer.pauseVideo();
        }
        if (typeof slot.ytPlayer.seekTo === 'function') {
          slot.ytPlayer.seekTo(state.targetTime, true);
        }
        return;
      }

      // Master está reproduzindo (PLAY)
      if (!state.shouldPlay) {
        // Pausa no início (aguardando defasagem) ou no fim (kata concluído)
        if (typeof slot.ytPlayer.pauseVideo === 'function') {
          slot.ytPlayer.pauseVideo();
        }
        if (typeof slot.ytPlayer.seekTo === 'function') {
          const curTime = typeof slot.ytPlayer.getCurrentTime === 'function' ? slot.ytPlayer.getCurrentTime() : state.targetTime;
          if (Math.abs(curTime - state.targetTime) > 0.15) {
            slot.ytPlayer.seekTo(state.targetTime, true);
          }
        }
      } else {
        // Deve estar reproduzindo normalmente
        if (typeof slot.ytPlayer.getPlayerState === 'function') {
          const playerState = slot.ytPlayer.getPlayerState();
          // Se não estiver tocando (1 = PLAYING, 3 = BUFFERING)
          if (playerState !== 1 && playerState !== 3) {
            slot.ytPlayer.playVideo();
          }
        } else if (typeof slot.ytPlayer.playVideo === 'function') {
          slot.ytPlayer.playVideo();
        }

        // Verificação periódica de drift / atraso por buffering
        if (typeof slot.ytPlayer.getCurrentTime === 'function' && typeof slot.ytPlayer.seekTo === 'function') {
          const curTime = slot.ytPlayer.getCurrentTime();
          if (Math.abs(curTime - state.targetTime) > 0.4) {
            slot.ytPlayer.seekTo(state.targetTime, true);
          }
        }
      }
    });
  }

  playAll(currentRelativeTime, currentKataId, syncMode = 'climax') {
    if (currentRelativeTime !== undefined && currentKataId !== undefined) {
      this.updatePlaybackState(currentRelativeTime, currentKataId, true, syncMode);
    } else {
      this.slots.forEach(slot => {
        if (slot.ytPlayer && slot.isReady && typeof slot.ytPlayer.playVideo === 'function') {
          slot.ytPlayer.playVideo();
        }
      });
    }
  }

  pauseAll() {
    this.slots.forEach(slot => {
      if (slot.ytPlayer && slot.isReady && typeof slot.ytPlayer.pauseVideo === 'function') {
        slot.ytPlayer.pauseVideo();
      }
    });
  }

  setPlaybackRate(rate) {
    this.slots.forEach(slot => {
      if (slot.ytPlayer && slot.isReady && typeof slot.ytPlayer.setPlaybackRate === 'function') {
        slot.ytPlayer.setPlaybackRate(rate);
      }
    });
  }

  destroyPlayers() {
    this.slots.forEach(slot => {
      if (slot.ytPlayer && typeof slot.ytPlayer.destroy === 'function') {
        try {
          slot.ytPlayer.destroy();
        } catch (e) {
          // ignore
        }
      }
    });
    this.slots = [];
  }

  areAllReady() {
    return this.slots.length > 0 && this.slots.every(s => s.isReady);
  }

  getActiveDemoIds() {
    return this.slots.map(s => s.demoId);
  }
}
