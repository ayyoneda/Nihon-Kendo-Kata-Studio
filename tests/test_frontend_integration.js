import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { calculateTimeWindow, getAbsoluteVideoTime, formatRelativeTime, formatClock } from '../src/syncEngine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'data', 'kata_database.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

describe('Frontend Integration - Validação do Acervo e Motor de Sincronia', () => {
  it('deve sincronizar com sucesso todos os 13 blocos pedagógicos para todas as 8 demonstrações reais', () => {
    const demoIds = db.demonstrations.map(d => d.id);
    assert.equal(demoIds.length, 8, "Devem existir 8 demonstrações");

    const sectionKeys = [
      "reiho_inicial",
      "kata_01", "kata_02", "kata_03", "kata_04", "kata_05", "kata_06", "kata_07",
      "troca_kodachi",
      "kata_08", "kata_09", "kata_10",
      "reiho_final"
    ];

    for (const kataId of sectionKeys) {
      const window = calculateTimeWindow(kataId, demoIds, db);

      assert.ok(window.preDuration > 0, `${kataId}: preDuration deve ser maior que 0`);
      assert.ok(window.postDuration > 0, `${kataId}: postDuration deve ser maior que 0`);
      assert.equal(window.minRelative, -window.preDuration);
      assert.equal(window.maxRelative, window.postDuration);
      assert.equal(window.totalDuration, window.preDuration + window.postDuration);

      for (const demoId of demoIds) {
        const demo = db.demonstrations.find(d => d.id === demoId);
        const timing = demo.katas[kataId];

        // No clímax (t = 0), deve bater exatamente com o climax do banco
        const absClimax = getAbsoluteVideoTime(0.0, demoId, kataId, db);
        assert.equal(absClimax, timing.climax, `${demoId} ${kataId}: tempo no climax deve ser exato`);

        // No início relativo extremo, não pode ser menor que start
        const absMin = getAbsoluteVideoTime(window.minRelative, demoId, kataId, db);
        assert.ok(absMin >= timing.start, `${demoId} ${kataId}: tempo minimo deve respeitar start`);

        // No fim relativo extremo, não pode ser maior que end
        const absMax = getAbsoluteVideoTime(window.maxRelative, demoId, kataId, db);
        assert.ok(absMax <= timing.end, `${demoId} ${kataId}: tempo maximo deve respeitar end`);
      }
    }
  });

  it('deve formatar relógio e tempo relativo sem exceções', () => {
    assert.equal(formatRelativeTime(-0.01), "0.0s");
    assert.equal(formatRelativeTime(0.0), "0.0s");
    assert.equal(formatRelativeTime(5.5), "+05.5s");
    assert.equal(formatClock(125.4), "02:05.4");
  });
});
