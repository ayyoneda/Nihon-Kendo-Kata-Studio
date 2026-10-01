/**
 * Motor de Sincronização Matemática de Vídeos ancorado no Clímax (t = 0)
 * para o Nihon Kendo Kata Studio.
 */

export const SECTION_KEYS = [
  "reiho_inicial",
  "kata_01",
  "kata_02",
  "kata_03",
  "kata_04",
  "kata_05",
  "kata_06",
  "kata_07",
  "troca_kodachi",
  "kata_08",
  "kata_09",
  "kata_10",
  "reiho_final"
];

/**
 * Encontra a demonstração pelo ID no catálogo do banco de dados.
 */
function findDemonstration(demoId, db) {
  if (!db || !db.demonstrations) return null;
  return db.demonstrations.find(d => d.id === demoId) || null;
}

/**
 * Calcula os limites da janela de reprodução relativa considerando
 * todas as duplas selecionadas para o kata atual e o modo de sincronia.
 *
 * @param {string} kataId - Ex: "kata_01"
 * @param {string[]} activeDemoIds - Lista de IDs das demonstrações ativas na tela
 * @param {object} db - Banco de dados kata_database.json
 * @param {'climax' | 'start'} syncMode - Modo de sincronia
 * @returns {object} { preDuration, postDuration, minRelative, maxRelative, totalDuration }
 */
export function calculateTimeWindow(kataId, activeDemoIds, db, syncMode = 'climax') {
  let maxPre = 0.0;
  let maxPost = 0.0;
  let maxDuration = 0.0;

  for (const demoId of activeDemoIds) {
    const demo = findDemonstration(demoId, db);
    if (!demo || !demo.katas || !demo.katas[kataId]) continue;

    const { start, climax, end } = demo.katas[kataId];
    const pre = Math.max(0, climax - start);
    const post = Math.max(0, end - climax);
    const dur = Math.max(0, end - start);

    if (pre > maxPre) maxPre = pre;
    if (post > maxPost) maxPost = post;
    if (dur > maxDuration) maxDuration = dur;
  }

  // Fallback seguro se não houver dados
  if (maxPre === 0 && maxPost === 0) {
    maxPre = 15.0;
    maxPost = 15.0;
    maxDuration = 30.0;
  }

  if (syncMode === 'start') {
    return {
      preDuration: 0.0,
      postDuration: Number(maxDuration.toFixed(3)),
      minRelative: 0.0,
      maxRelative: Number(maxDuration.toFixed(3)),
      totalDuration: Number(maxDuration.toFixed(3))
    };
  }

  return {
    preDuration: Number(maxPre.toFixed(3)),
    postDuration: Number(maxPost.toFixed(3)),
    minRelative: Number((-maxPre).toFixed(3)),
    maxRelative: Number(maxPost.toFixed(3)),
    totalDuration: Number((maxPre + maxPost).toFixed(3))
  };
}

/**
 * Converte um tempo relativo para o timestamp absoluto do player do YouTube,
 * com clamping nos limites estritos de start e end do vídeo.
 *
 * @param {number} relativeTime - Segundos relativos ao clímax (ex: -5.0, 0.0) ou início (0.0, 10.0)
 * @param {string} demoId - ID da demonstração
 * @param {string} kataId - ID do kata
 * @param {object} db - Banco de dados kata_database.json
 * @param {'climax' | 'start'} syncMode - Modo de sincronia
 * @returns {number} Segundo absoluto no YouTube
 */
export function getAbsoluteVideoTime(relativeTime, demoId, kataId, db, syncMode = 'climax') {
  const demo = findDemonstration(demoId, db);
  if (!demo || !demo.katas || !demo.katas[kataId]) {
    return 0.0;
  }

  const { start, climax, end } = demo.katas[kataId];
  const target = syncMode === 'start' ? start + relativeTime : climax + relativeTime;

  // Clamping nos limites do kata específico
  const clamped = Math.max(start, Math.min(end, target));
  return Number(clamped.toFixed(3));
}

/**
 * Determina o estado estrito de reprodução de uma demonstração em um instante da timeline:
 * se deve tocar, se deve pausar no início aguardando defasagem, ou se já finalizou e deve pausar no fim.
 *
 * @param {number} relativeTime
 * @param {string} demoId
 * @param {string} kataId
 * @param {object} db
 * @param {'climax' | 'start'} syncMode
 * @returns {{ shouldPlay: boolean, targetTime: number, isWaitingStart: boolean, isFinishedEnd: boolean }}
 */
export function getSlotPlaybackState(relativeTime, demoId, kataId, db, syncMode = 'climax') {
  const demo = findDemonstration(demoId, db);
  if (!demo || !demo.katas || !demo.katas[kataId]) {
    return { shouldPlay: false, targetTime: 0.0, isWaitingStart: false, isFinishedEnd: true };
  }

  const { start, climax, end } = demo.katas[kataId];
  const idealAbsTime = syncMode === 'start' ? start + relativeTime : climax + relativeTime;

  if (idealAbsTime < start - 0.05) {
    // Ainda não atingiu o instante de início desta dupla (aguardando defasagem no clímax)
    return {
      shouldPlay: false,
      targetTime: start,
      isWaitingStart: true,
      isFinishedEnd: false
    };
  }

  if (idealAbsTime >= end) {
    // Já concluiu o kata desta dupla (aguardando duplas mais longas concluírem)
    return {
      shouldPlay: false,
      targetTime: end,
      isWaitingStart: false,
      isFinishedEnd: true
    };
  }

  return {
    shouldPlay: true,
    targetTime: Number(idealAbsTime.toFixed(3)),
    isWaitingStart: false,
    isFinishedEnd: false
  };
}

/**
 * Formata o tempo relativo com sinais visuais claros para a timeline.
 * Ex: -8.42 -> "-08.4s", 0.0 -> "0.0s", 11.25 -> "+11.2s"
 *
 * @param {number} seconds
 * @returns {string}
 */
export function formatRelativeTime(seconds) {
  if (Math.abs(seconds) < 0.05) {
    return "0.0s";
  }

  const sign = seconds < 0 ? "-" : "+";
  const abs = Math.abs(seconds);
  const formatted = abs.toFixed(1);
  // Garante padding de 2 dígitos na parte inteira (ex: 8.4 -> 08.4)
  const [integ, dec] = formatted.split(".");
  const paddedInt = integ.padStart(2, "0");
  return `${sign}${paddedInt}.${dec}s`;
}

/**
 * Formata segundos absolutos em relógio MM:SS.s
 * Ex: 65.4 -> "01:05.4"
 *
 * @param {number} seconds
 * @returns {string}
 */
export function formatClock(seconds) {
  const total = Math.max(0, seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  const minsStr = String(mins).padStart(2, "0");
  const secsFormatted = secs.toFixed(1);
  const [sInt, sDec] = secsFormatted.split(".");
  const secsStr = `${sInt.padStart(2, "0")}.${sDec}`;
  return `${minsStr}:${secsStr}`;
}
