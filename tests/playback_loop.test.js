import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { VideoGridManager } from '../src/videoGrid.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'data', 'kata_database.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

test('Playback & Loop Mechanics - onPlaybackTick and Dual-Clock Barrier', async (t) => {
  await t.test('deve executar onPlaybackTick sem erro de escopo (actualTime ReferenceError)', () => {
    const mgr = new VideoGridManager({ containerEl: null, db });
    let isPaused = false;
    let seekedTo = null;

    const mockSlot = {
      index: 0,
      demoId: 'ajkf_official_standard',
      isReady: true,
      playbackState: 'playing',
      lastSeekTime: 0,
      ytPlayer: {
        getCurrentTime: () => 180.0, // Meio do kata 01 (start: 166.73, end: 203.08)
        getDuration: () => 600,
        getPlayerState: () => 1,
        getVideoData: () => ({ video_id: 'QIpPUdTCv-Y' }),
        pauseVideo: () => { isPaused = true; },
        seekTo: (sec) => { seekedTo = sec; },
        playVideo: () => {}
      }
    };
    mgr.slots = [mockSlot];

    // Não deve lançar ReferenceError
    assert.doesNotThrow(() => {
      mgr.onPlaybackTick(0.0, 'kata_01', 'climax');
    });

    // Como 180.0s está no meio do kata, não deve ter terminado ainda
    assert.equal(mockSlot.playbackState, 'playing');
    assert.equal(isPaused, false);
  });

  await t.test('deve ativar barreira de fim de kata quando actualTime >= kata.end - 0.15', () => {
    const mgr = new VideoGridManager({ containerEl: null, db });
    let isPaused = false;
    let seekedTo = null;

    const kataEnd = db.demonstrations.find(d => d.id === 'ajkf_official_standard').katas.kata_01.end; // 203.08

    const mockSlot = {
      index: 0,
      demoId: 'ajkf_official_standard',
      isReady: true,
      playbackState: 'playing',
      lastSeekTime: 0, // Sem grace period ativo
      ytPlayer: {
        getCurrentTime: () => kataEnd - 0.10, // Dentro da barreira de 150ms do fim
        getDuration: () => 600,
        getPlayerState: () => 1,
        getVideoData: () => ({ video_id: 'QIpPUdTCv-Y' }),
        pauseVideo: () => { isPaused = true; },
        seekTo: (sec) => { seekedTo = sec; },
        playVideo: () => {}
      }
    };
    mgr.slots = [mockSlot];

    mgr.onPlaybackTick(5.0, 'kata_01', 'climax');

    assert.equal(mockSlot.playbackState, 'ended', 'Slot deve transicionar para ended');
    assert.equal(isPaused, true, 'Player deve ter sido pausado');
    assert.equal(seekedTo, kataEnd, 'Player deve travar estritamente em kata.end');
  });

  await t.test('grace period deve impedir falso fim de kata imediatamente após seek de loop', () => {
    const mgr = new VideoGridManager({ containerEl: null, db });
    let isPaused = false;
    let seekedTo = null;

    const kataEnd = db.demonstrations.find(d => d.id === 'ajkf_official_standard').katas.kata_01.end; // 203.08

    const mockSlot = {
      index: 0,
      demoId: 'ajkf_official_standard',
      isReady: true,
      playbackState: 'playing',
      lastSeekTime: performance.now(), // Acabou de fazer seek (grace period ativo de 800ms)
      ytPlayer: {
        // Leitura assíncrona residual do YouTube ainda reportando fim antes do seek completar
        getCurrentTime: () => kataEnd - 0.05,
        getDuration: () => 600,
        getPlayerState: () => 1,
        getVideoData: () => ({ video_id: 'QIpPUdTCv-Y' }),
        pauseVideo: () => { isPaused = true; },
        seekTo: (sec) => { seekedTo = sec; },
        playVideo: () => {}
      }
    };
    mgr.slots = [mockSlot];

    // Timeline relativa está no início do kata (-10.0s)
    mgr.onPlaybackTick(-10.0, 'kata_01', 'climax');

    // Durante o grace period, NÃO deve disparar ended
    assert.equal(mockSlot.playbackState, 'playing', 'Não deve disparar ended prematuro durante grace period');
    assert.equal(isPaused, false);
  });

  await t.test('checkAdStatus não deve emitir falso positivo para vídeo canônico com duration > 75', () => {
    const mgr = new VideoGridManager({ containerEl: null, db });
    const mockSlot = {
      index: 0,
      demoId: 'ajkf_official_standard',
      isReady: true,
      isAdPlaying: false,
      adNoticeEl: null,
      ytPlayer: {
        getCurrentTime: () => 5.0, // Bem abaixo de kata.start (166.73s)
        getDuration: () => 600,     // Duração longa real
        getPlayerState: () => 1,
        getVideoData: () => ({ video_id: 'QIpPUdTCv-Y' }) // ID canônico idêntico
      }
    };

    const isAd = mgr.checkAdStatus(mockSlot);
    assert.equal(isAd, false, 'Vídeo oficial nunca deve ser marcado como anúncio comercial');
  });
});
