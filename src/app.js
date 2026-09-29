/**
 * Nihon Kendo Kata Studio - Controlador Principal da Aplicação
 */

import { calculateTimeWindow, formatRelativeTime, SECTION_KEYS } from './syncEngine.js';
import { renderPedagogyPanel } from './pedagogyPanel.js';
import { VideoGridManager } from './videoGrid.js';
import { WebCalibrator } from './calibrator.js';

let db = null;
let currentKataId = "reiho_inicial";
let currentLayout = "grid-2x2";
let selectedDemoIds = [];
let isPlaying = false;
let isLooping = true;
let isCalibratorOpen = false;
let playbackRate = 0.50;
let currentRelativeTime = 0.0;
let timeWindow = { preDuration: 15, postDuration: 15, minRelative: -15, maxRelative: 15, totalDuration: 30 };

let gridManager = null;
let calibrator = null;
let syncTickerId = null;
let lastTickTime = null;

// Elementos DOM
const kataSelectEl = document.getElementById('kata-select');
const videoGridEl = document.getElementById('video-grid');
const pedagogyPanelEl = document.getElementById('pedagogy-panel');
const btnPlayPause = document.getElementById('btn-play-pause');
const playPauseIcon = document.getElementById('play-pause-icon');
const btnJumpClimax = document.getElementById('btn-jump-climax');
const btnStepBack = document.getElementById('btn-step-back');
const btnStepFwd = document.getElementById('btn-step-fwd');
const speedSelectEl = document.getElementById('speed-select');
const btnToggleLoop = document.getElementById('btn-toggle-loop');
const masterScrubber = document.getElementById('master-scrubber');
const labelTimeStart = document.getElementById('label-time-start');
const labelTimeCurrent = document.getElementById('label-time-current');
const labelTimeEnd = document.getElementById('label-time-end');
const activeAudioNameEl = document.getElementById('active-audio-name');
const btnTogglePedagogy = document.getElementById('btn-toggle-pedagogy');
const btnToggleCalibrator = document.getElementById('btn-toggle-calibrator');
const calibratorViewEl = document.getElementById('calibrator-view');

/**
 * Carrega a base de dados centralizada.
 */
async function loadDatabase() {
  try {
    const res = await fetch('./data/kata_database.json');
    db = await res.json();
    return db;
  } catch (err) {
    console.error("Erro ao carregar kata_database.json:", err);
    return null;
  }
}

/**
 * Inicializa os seletores de UI com todas as seções e katas cronológicos.
 */
function initKataSelector() {
  kataSelectEl.innerHTML = '';

  const groups = [
    { label: "⛩️ Protocolo Inicial", keys: ["reiho_inicial"] },
    { label: "⚔️ Katas de Tachi (Espada Longa)", keys: ["kata_01", "kata_02", "kata_03", "kata_04", "kata_05", "kata_06", "kata_07"] },
    { label: "🔄 Transição de Armas", keys: ["troca_kodachi"] },
    { label: "🗡️ Katas de Kodachi (Espada Curta)", keys: ["kata_08", "kata_09", "kata_10"] },
    { label: "⛩️ Protocolo Final", keys: ["reiho_final"] }
  ];

  for (const group of groups) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = group.label;

    for (const kId of group.keys) {
      const kata = db.katas_pedagogical[kId];
      if (!kata) continue;

      const opt = document.createElement('option');
      opt.value = kId;
      if (kId === "reiho_inicial") {
        opt.textContent = `Reiho Inicial (Zarei) • 礼法（前）`;
      } else if (kId === "troca_kodachi") {
        opt.textContent = `Troca para Kodachi • 小太刀への交換`;
      } else if (kId === "reiho_final") {
        opt.textContent = `Reiho Final (Zarei e Saída) • 礼法（後）`;
      } else {
        const prefix = kata.type === "kodachi" ? "Kodachi" : "Kata";
        opt.textContent = `${prefix} #${kata.number} • ${kata.name_romaji} (${kata.name_jp})`;
      }
      optgroup.appendChild(opt);
    }
    kataSelectEl.appendChild(optgroup);
  }

  kataSelectEl.value = currentKataId;

  kataSelectEl.addEventListener('change', (e) => {
    switchKata(e.target.value);
  });
}

/**
 * Atualiza o Kata selecionado e recalcula a linha do tempo.
 */
function switchKata(newKataId) {
  currentKataId = newKataId;
  kataSelectEl.value = newKataId;

  // Atualiza painel didático
  renderPedagogyPanel(currentKataId, db, pedagogyPanelEl);

  // Recalcula janela de tempo
  const activeDemos = gridManager ? gridManager.getActiveDemoIds() : selectedDemoIds;
  timeWindow = calculateTimeWindow(currentKataId, activeDemos, db);

  // Atualiza controles do Scrubber
  masterScrubber.min = timeWindow.minRelative;
  masterScrubber.max = timeWindow.maxRelative;
  labelTimeStart.textContent = `${timeWindow.minRelative}s`;
  labelTimeEnd.textContent = `+${timeWindow.maxRelative}s`;

  // Salta para o Clímax
  jumpToClimax();
}

/**
 * Salta para o instante do contragolpe / clímax (t = 0).
 */
function jumpToClimax() {
  currentRelativeTime = 0.0;
  masterScrubber.value = 0.0;
  updateTimeDisplay();
  if (gridManager) {
    gridManager.seekAll(0.0, currentKataId);
  }
}

function updateTimeDisplay() {
  labelTimeCurrent.textContent = formatRelativeTime(currentRelativeTime) + (Math.abs(currentRelativeTime) < 0.1 ? " (Clímax)" : "");
}

/**
 * Alterna Play / Pause sincronizado.
 */
function togglePlayPause() {
  if (isPlaying) {
    pausePlayback();
  } else {
    startPlayback();
  }
}

function startPlayback() {
  if (!gridManager) return;
  isPlaying = true;
  playPauseIcon.textContent = "⏸";
  btnPlayPause.style.backgroundColor = "var(--crimson-primary)";
  btnPlayPause.style.color = "#FFF";
  gridManager.playAll();

  lastTickTime = performance.now();
  if (!syncTickerId) {
    syncTickerId = requestAnimationFrame(handleSyncLoop);
  }
}

function pausePlayback() {
  if (!gridManager) return;
  isPlaying = false;
  playPauseIcon.textContent = "▶";
  btnPlayPause.style.backgroundColor = "var(--gold-primary)";
  btnPlayPause.style.color = "#070A11";
  gridManager.pauseAll();

  if (syncTickerId) {
    cancelAnimationFrame(syncTickerId);
    syncTickerId = null;
  }
}

/**
 * Loop de animação e controle de sincronismo contínuo.
 */
function handleSyncLoop(now) {
  if (!isPlaying) return;

  const delta = (now - lastTickTime) / 1000;
  lastTickTime = now;

  currentRelativeTime += delta * playbackRate;

  // Checa se atingiu o fim da janela do kata
  if (currentRelativeTime >= timeWindow.maxRelative) {
    if (isLooping) {
      currentRelativeTime = timeWindow.minRelative;
      if (gridManager) {
        gridManager.seekAll(currentRelativeTime, currentKataId);
      }
    } else {
      pausePlayback();
      currentRelativeTime = timeWindow.maxRelative;
    }
  }

  masterScrubber.value = currentRelativeTime;
  updateTimeDisplay();

  syncTickerId = requestAnimationFrame(handleSyncLoop);
}

/**
 * Configuração dos botões de grade.
 */
function initLayoutControls() {
  const layouts = ['1x1', '1x2', '2x2'];
  layouts.forEach(l => {
    const btn = document.getElementById(`layout-${l}`);
    if (btn) {
      btn.addEventListener('click', () => {
        layouts.forEach(x => document.getElementById(`layout-${x}`)?.classList.remove('active'));
        btn.classList.add('active');
        currentLayout = `grid-${l}`;
        if (gridManager) {
          gridManager.setupGrid(currentLayout, selectedDemoIds, currentKataId);
        }
      });
    }
  });
}

/**
 * Inicialização global da aplicação.
 */
async function initApp() {
  const data = await loadDatabase();
  if (!data) return;

  // Demonstrações padrão iniciais
  selectedDemoIds = data.demonstrations.slice(0, 4).map(d => d.id);

  // Inicializa seletores e painel
  initKataSelector();
  initLayoutControls();
  renderPedagogyPanel(currentKataId, db, pedagogyPanelEl);

  // Inicializa o Gerenciador de Vídeos
  gridManager = new VideoGridManager({
    containerEl: videoGridEl,
    db: data,
    onAudioChange: (demoTitle) => {
      activeAudioNameEl.textContent = demoTitle;
    },
    onReadyStateChange: () => {
      // Quando todos os players estiverem prontos
    }
  });

  // Renderiza a grade padrão
  await gridManager.setupGrid(currentLayout, selectedDemoIds, currentKataId);
  switchKata(currentKataId);

  // Eventos da Timeline Mestre
  btnPlayPause.addEventListener('click', togglePlayPause);
  btnJumpClimax.addEventListener('click', jumpToClimax);

  btnStepBack.addEventListener('click', () => {
    currentRelativeTime = Math.max(timeWindow.minRelative, currentRelativeTime - 1.0);
    masterScrubber.value = currentRelativeTime;
    updateTimeDisplay();
    gridManager.seekAll(currentRelativeTime, currentKataId);
  });

  btnStepFwd.addEventListener('click', () => {
    currentRelativeTime = Math.min(timeWindow.maxRelative, currentRelativeTime + 1.0);
    masterScrubber.value = currentRelativeTime;
    updateTimeDisplay();
    gridManager.seekAll(currentRelativeTime, currentKataId);
  });

  speedSelectEl.addEventListener('change', (e) => {
    playbackRate = parseFloat(e.target.value);
    gridManager.setPlaybackRate(playbackRate);
  });

  btnToggleLoop.addEventListener('click', () => {
    isLooping = !isLooping;
    btnToggleLoop.classList.toggle('active', isLooping);
  });

  masterScrubber.addEventListener('input', (e) => {
    currentRelativeTime = parseFloat(e.target.value);
    updateTimeDisplay();
    gridManager.seekAll(currentRelativeTime, currentKataId);
  });

  // Alternador de Painel Didático
  btnTogglePedagogy.addEventListener('click', () => {
    pedagogyPanelEl.classList.toggle('collapsed');
    btnTogglePedagogy.classList.toggle('active');
  });

  // Alternador de Modo Calibrador
  btnToggleCalibrator.addEventListener('click', () => {
    isCalibratorOpen = !isCalibratorOpen;
    btnToggleCalibrator.classList.toggle('active', isCalibratorOpen);

    if (isCalibratorOpen) {
      pausePlayback();
      videoGridEl.classList.add('hidden');
      calibratorViewEl.classList.remove('hidden');

      if (!calibrator) {
        calibrator = new WebCalibrator({
          containerEl: calibratorViewEl,
          db,
          onDatabaseUpdated: (newDb) => {
            db = newDb;
          }
        });
      }
      calibrator.render();
    } else {
      if (calibrator) {
        calibrator.destroy();
      }
      calibratorViewEl.classList.add('hidden');
      videoGridEl.classList.remove('hidden');
      switchKata(currentKataId);
    }
  });

  // Atalhos de teclado globais de playback
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    if (e.code === 'Space') {
      e.preventDefault();
      togglePlayPause();
    } else if (e.code === 'KeyC') {
      e.preventDefault();
      jumpToClimax();
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      currentRelativeTime = Math.max(timeWindow.minRelative, currentRelativeTime - 0.5);
      masterScrubber.value = currentRelativeTime;
      updateTimeDisplay();
      gridManager.seekAll(currentRelativeTime, currentKataId);
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      currentRelativeTime = Math.min(timeWindow.maxRelative, currentRelativeTime + 0.5);
      masterScrubber.value = currentRelativeTime;
      updateTimeDisplay();
      gridManager.seekAll(currentRelativeTime, currentKataId);
    }
  });

  console.log("Nihon Kendo Kata Studio inicializado com sucesso.");
}

// Inicia no carregamento do DOM
document.addEventListener('DOMContentLoaded', initApp);
