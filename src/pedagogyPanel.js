/**
 * Módulo de Apresentação Pedagógica Doutrinária do Nihon Kendo Kata
 * Extraído rigorosamente do acervo oficial e Kendo_Kata_Deep_Research.md
 */

/**
 * Renderiza o painel doutrinário para o kata selecionado.
 * 
 * @param {string} kataId - Ex: "kata_01"
 * @param {object} db - Banco de dados kata_database.json
 * @param {HTMLElement} containerEl - Elemento DOM do aside #pedagogy-panel
 */
export function renderPedagogyPanel(kataId, db, containerEl) {
  if (!containerEl || !db || !db.katas_pedagogical) return;

  const kata = db.katas_pedagogical[kataId];
  if (!kata) {
    containerEl.innerHTML = `<div class="pedagogy-empty">Selecione um Kata para visualizar os dados técnicos.</div>`;
    return;
  }

  const chakugantenHtml = (kata.chakuganten || [])
    .map(point => `<li>${point}</li>`)
    .join("");

  const mistakesHtml = (kata.common_mistakes || [])
    .map(err => `<li>${err}</li>`)
    .join("");

  let typeLabel = "太刀 (Tachi - Espada Longa)";
  let numberTag = `Kata #${kata.number} • ${typeLabel}`;

  if (kata.type === "kodachi") {
    typeLabel = "小太刀 (Kodachi - Espada Curta)";
    numberTag = `Kata #${kata.number} • ${typeLabel}`;
  } else if (kata.type === "reiho") {
    typeLabel = "礼法 (Reiho - Etiqueta e Protocolo)";
    if (kata.id === "reiho_inicial") {
      numberTag = `Protocolo Inicial • ${typeLabel}`;
    } else if (kata.id === "troca_kodachi") {
      numberTag = `Transição de Armamento • ${typeLabel}`;
    } else {
      numberTag = `Protocolo Final • ${typeLabel}`;
    }
  }

  const climaxSyncHtml = kata.climax_desc ? `
    <div class="climax-anchor-badge" style="margin-top: 0.5rem; background: rgba(212, 175, 55, 0.12); border-left: 3px solid var(--gold-primary); padding: 0.45rem 0.65rem; border-radius: 4px; font-size: 0.82rem; color: var(--gold-light);">
      ⚡ <strong>Ponto de Sincronia (Clímax):</strong> ${kata.climax_desc}
    </div>
  ` : '';

  containerEl.innerHTML = `
    <div class="pedagogy-header">
      <span class="kata-number-tag">${numberTag}</span>
      <h2 class="kata-main-title">${kata.name_romaji} <span class="kanji-sub">${kata.name_jp}</span></h2>
      ${climaxSyncHtml}
    </div>

    <!-- Kamae & Alvos -->
    <div class="pedagogy-card">
      <div class="pedagogy-card-title">⚔️ Posturas Iniciais (Kamae)</div>
      <div class="combat-roles">
        <div class="role-box">
          <div class="role-name">Uchidachi (打太刀)</div>
          <div class="role-kamae">${kata.kamae_uchidachi}</div>
        </div>
        <div class="role-box">
          <div class="role-name">Shidachi (仕太刀)</div>
          <div class="role-kamae">${kata.kamae_shidachi}</div>
        </div>
      </div>
      <div class="target-row">
        <span class="role-name">Alvo de Uchidachi:</span> <strong>${kata.target_uchidachi}</strong>
      </div>
    </div>

    <!-- Técnica e Iniciativa -->
    <div class="pedagogy-card">
      <div class="pedagogy-card-title">🎯 Técnica Decisiva & Iniciativa</div>
      <div class="waza-highlight">
        <div class="role-name">Waza de Shidachi:</div>
        <div class="waza-name" style="font-size: 1.05rem; font-weight: 700; color: var(--gold-light); margin: 0.2rem 0;">
          ${kata.waza_shidachi}
        </div>
      </div>
      <div class="sen-box" style="margin-top: 0.5rem;">
        <span class="role-name">Princípio Tático (Mitsu no Sen):</span><br/>
        <span class="sen-badge">${kata.sen}</span>
      </div>
      <div class="zanshin-box" style="margin-top: 0.6rem; font-size: 0.82rem; color: var(--text-secondary);">
        <span class="role-name">Postura de Zanshin:</span><br/>
        ${kata.zanshin}
      </div>
    </div>

    <!-- Pontos Críticos de Avaliação (Chakuganten) -->
    <div class="pedagogy-card">
      <div class="pedagogy-card-title">🔍 Critérios de Avaliação AJKF (Chakuganten)</div>
      <ul class="pedagogy-list">
        ${chakugantenHtml}
      </ul>
    </div>

    <!-- Erros Frequentes -->
    <div class="pedagogy-card">
      <div class="pedagogy-card-title" style="color: #F87171;">⚠️ Erros Técnicos Mais Frequentes</div>
      <ul class="pedagogy-list mistakes">
        ${mistakesHtml}
      </ul>
    </div>

    <!-- Riai Doutrinário -->
    <div class="pedagogy-card">
      <div class="pedagogy-card-title">📖 Riai & Significado Marcial</div>
      <p style="font-size: 0.83rem; color: var(--text-secondary); line-height: 1.45;">
        ${kata.riai_summary || "Estudo da harmonia entre espírito, postura e espada (Ki-Ken-Tai-Itchi)."}
      </p>
    </div>
  `;
}
