import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTimeWindow,
  getAbsoluteVideoTime,
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
});
