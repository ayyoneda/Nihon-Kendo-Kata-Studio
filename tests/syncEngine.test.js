import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTimeWindow,
  getAbsoluteVideoTime,
  getSlotPlaybackState,
  formatRelativeTime,
  formatClock
} from '../src/syncEngine.js';

const mockDb = {
  demonstrations: [
    {
      id: "demo_1",
      katas: {
        kata_01: { start: 100.0, climax: 115.0, end: 130.0 } // pre: 15s, post: 15s
      }
    },
    {
      id: "demo_2",
      katas: {
        kata_01: { start: 50.0, climax: 62.0, end: 80.0 }    // pre: 12s, post: 18s
      }
    }
  ]
};

describe('syncEngine - Motor de Sincronizacao no Climax', () => {
  it('deve calcular corretamente a janela de tempo maxima pre e pos climax', () => {
    const window = calculateTimeWindow("kata_01", ["demo_1", "demo_2"], mockDb);
    assert.equal(window.preDuration, 15.0);
    assert.equal(window.postDuration, 18.0);
    assert.equal(window.minRelative, -15.0);
    assert.equal(window.maxRelative, 18.0);
    assert.equal(window.totalDuration, 33.0);
  });

  it('deve converter tempo relativo para o segundo absoluto do YouTube ancorado no climax', () => {
    // No climax exato (t = 0.0)
    assert.equal(getAbsoluteVideoTime(0.0, "demo_1", "kata_01", mockDb), 115.0);
    assert.equal(getAbsoluteVideoTime(0.0, "demo_2", "kata_01", mockDb), 62.0);

    // 5 segundos antes do climax (t = -5.0)
    assert.equal(getAbsoluteVideoTime(-5.0, "demo_1", "kata_01", mockDb), 110.0);
    assert.equal(getAbsoluteVideoTime(-5.0, "demo_2", "kata_01", mockDb), 57.0);

    // 10 segundos apos o climax (t = +10.0)
    assert.equal(getAbsoluteVideoTime(10.0, "demo_1", "kata_01", mockDb), 125.0);
    assert.equal(getAbsoluteVideoTime(10.0, "demo_2", "kata_01", mockDb), 72.0);
  });

  it('deve aplicar clamping nos limites de start e end do video se t_relativo exceder', () => {
    // demo_2 tem pre: 12s. Se t = -15s, deve prender no start (50.0)
    assert.equal(getAbsoluteVideoTime(-15.0, "demo_2", "kata_01", mockDb), 50.0);

    // demo_1 tem post: 15s. Se t = +18s, deve prender no end (130.0)
    assert.equal(getAbsoluteVideoTime(18.0, "demo_1", "kata_01", mockDb), 130.0);
  });

  it('deve formatar o tempo relativo com sinais visuais claros', () => {
    assert.equal(formatRelativeTime(-8.42), "-08.4s");
    assert.equal(formatRelativeTime(0.0), "0.0s");
    assert.equal(formatRelativeTime(11.20), "+11.2s");
  });

  it('deve formatar o relogio absoluto em MM:SS.s', () => {
    assert.equal(formatClock(65.4), "01:05.4");
    assert.equal(formatClock(9.2), "00:09.2");
  });

  it('deve calcular corretamente a janela de tempo no modo de sincronia pelo inicio', () => {
    const window = calculateTimeWindow("kata_01", ["demo_1", "demo_2"], mockDb, 'start');
    assert.equal(window.minRelative, 0.0);
    assert.equal(window.maxRelative, 30.0);
    assert.equal(window.totalDuration, 30.0);
  });

  it('deve converter tempo absoluto no modo de sincronia pelo inicio', () => {
    assert.equal(getAbsoluteVideoTime(0.0, "demo_1", "kata_01", mockDb, 'start'), 100.0);
    assert.equal(getAbsoluteVideoTime(10.0, "demo_1", "kata_01", mockDb, 'start'), 110.0);
    assert.equal(getAbsoluteVideoTime(35.0, "demo_1", "kata_01", mockDb, 'start'), 130.0);
  });

  it('deve reportar corretamente o estado estrito de reproducao (defasagem no inicio e fim)', () => {
    // Em t = -15s no modo Clímax:
    // demo_1 está no seu start (100) -> shouldPlay = true
    const s1 = getSlotPlaybackState(-15.0, "demo_1", "kata_01", mockDb, 'climax');
    assert.equal(s1.shouldPlay, true);
    assert.equal(s1.targetTime, 100.0);

    // demo_2 estaria em 62 - 15 = 47 (< 50) -> deve aguardar defasagem!
    const s2 = getSlotPlaybackState(-15.0, "demo_2", "kata_01", mockDb, 'climax');
    assert.equal(s2.shouldPlay, false);
    assert.equal(s2.isWaitingStart, true);
    assert.equal(s2.targetTime, 50.0);

    // Em t = -12s no modo Clímax: demo_2 atinge o start (50) -> shouldPlay = true!
    const s2_at_start = getSlotPlaybackState(-12.0, "demo_2", "kata_01", mockDb, 'climax');
    assert.equal(s2_at_start.shouldPlay, true);
    assert.equal(s2_at_start.targetTime, 50.0);

    // Em t = +16s no modo Clímax:
    // demo_1 tem end: 130 (climax + 15 = 130). Em +16s já passou do end! -> deve pausar no fim
    const s1_end = getSlotPlaybackState(16.0, "demo_1", "kata_01", mockDb, 'climax');
    assert.equal(s1_end.shouldPlay, false);
    assert.equal(s1_end.isFinishedEnd, true);
    assert.equal(s1_end.targetTime, 130.0);

    // demo_2 tem post: 18s (end: 80). Em +16s (62 + 16 = 78) ainda está tocando!
    const s2_playing = getSlotPlaybackState(16.0, "demo_2", "kata_01", mockDb, 'climax');
    assert.equal(s2_playing.shouldPlay, true);
    assert.equal(s2_playing.targetTime, 78.0);
  });
});
