/**
 * Módulo do Guia Visual de Utilização - Nihon Kendo Kata Studio
 * Apresenta a metodologia de estudo passo a passo com mockups esquemáticos e dicas técnicas.
 */

export const GUIDE_STEPS = [
  {
    step: 1,
    title: "1. Formato de Visualização das Janelas",
    subtitle: "Adapte o layout da tela conforme o objetivo da sua sessão de estudo",
    icon: "🪟",
    description: `
      No canto superior direito, escolha a disposição dos quadrantes de vídeo:
      <br><br>
      • <strong>1x1 (Foco Individual):</strong> Ideal para análise minuciosa de postura, <em>hasuji</em> (alinhamento da lâmina) e movimentação de pés de uma única dupla.
      <br>
      • <strong>1x2 (Comparação Direta):</strong> Permite colocar lado a lado duas gerações ou dois torneios diferentes (ex: o Manual Oficial da AJKF contra a demonstração do Kyoto Taikai).
      <br>
      • <strong>2x2 (Quádrupla Matriz):</strong> Permite estudar simultaneamente 4 duplas em ação. O tamanho ajusta-se dinamicamente ao espaço da tela sem barras de rolagem excessivas.
    `,
    mockupHtml: `
      <div class="mockup-box">
        <div class="mockup-header-sample">
          <span class="mockup-label">Controle de Grade:</span>
          <div class="mockup-btn-group">
            <span class="mockup-btn">1x1</span>
            <span class="mockup-btn">1x2</span>
            <span class="mockup-btn active-glow">2x2 ★</span>
          </div>
        </div>
        <div class="mockup-grid-preview">
          <div class="mockup-quad active-border">Q1 • Superior Esq.</div>
          <div class="mockup-quad">Q2 • Superior Dir.</div>
          <div class="mockup-quad">Q3 • Inferior Esq.</div>
          <div class="mockup-quad">Q4 • Inferior Dir.</div>
        </div>
      </div>
    `,
    tip: "💡 <strong>Dica de Estudo:</strong> Comece no modo <code>1x2</code> comparando o <em>Manual Oficial da AJKF</em> com o torneio de <em>8º Dan</em> mais recente."
  },
  {
    step: 2,
    title: "2. Seleção dos Vídeos em Cada Quadrante",
    subtitle: "Escolha mestres e torneios específicos pelo menu suspenso de cada tela",
    icon: "🎬",
    description: `
      Cada quadrante possui seu próprio seletor no topo da moldura do vídeo. 
      Os vídeos estão organizados cronologicamente em ordem decrescente em 4 categorias oficiais:
      <br><br>
      1. 📘 <strong>Manual & Padrão Oficial AJKF</strong> (Referência regulamentar)
      <br>
      2. 🏆 <strong>All Japan Kendo Championship</strong> (Zen Nihon - 2022 a 2025)
      <br>
      3. ⚔️ <strong>Torneio Selecionado de 8º Dan</strong> (Nagoya - 2022 a 2026)
      <br>
      4. ⛩️ <strong>Kyoto Taikai</strong> (Butokuden - 2024 a 2026)
      <br><br>
      Ao mudar o vídeo em um quadrante, o sistema carrega os mestres e ajusta o tempo de forma transparente.
    `,
    mockupHtml: `
      <div class="mockup-box">
        <div class="mockup-card-sample">
          <div class="mockup-card-top">
            <span class="mockup-badge">Q1 • Superior Esquerdo</span>
            <div class="mockup-select-fake">
              ⚔️ 24th 8-Dan (2026) — Eiga (H8D) × Onda (H8D) ▾
            </div>
            <span class="mockup-audio-btn">🔊 Áudio</span>
          </div>
          <div class="mockup-video-canvas">
            <span class="mockup-play-icon">▶</span>
            <div class="mockup-footer-name">Eiga Naoki (Hanshi 8º Dan) × Onda Koji (Hanshi 8º Dan)</div>
          </div>
        </div>
      </div>
    `,
    tip: "💡 <strong>Dica de Estudo:</strong> Você pode comparar a mesma dupla em anos diferentes ou confrontar diferentes estilos de mestres de 8º Dan."
  },
  {
    step: 3,
    title: "3. Seleção do Kata / Seção de Estudo",
    subtitle: "Navegue diretamente para qualquer ponto da sequência do Nihon Kendo Kata",
    icon: "⛩️",
    description: `
      No seletor central no topo da ferramenta, você pode escolher qualquer trecho oficial:
      <br><br>
      • <strong>Reiho Inicial:</strong> Entrada, zarei e ritual de início.
      <br>
      • <strong>Katas 1 ao 7 (Tachi):</strong> Espada longa contra espada longa.
      <br>
      • <strong>Troca para Kodachi:</strong> Transição ritual de empunhadura e substituição da espada de Shidachi.
      <br>
      • <strong>Katas 8 ao 10 (Kodachi):</strong> Espada longa (Uchidachi) contra espada curta (Shidachi).
      <br>
      • <strong>Reiho Final:</strong> Zarei de encerramento e saída do dojo.
      <br><br>
      A ferramenta salta automaticamente para o início do kata selecionado e carrega os fundamentos pedagógicos correspondentes.
    `,
    mockupHtml: `
      <div class="mockup-box">
        <div class="mockup-header-sample">
          <span class="mockup-label">Kata Atual:</span>
          <div class="mockup-select-fake-large">
            ⚔️ Kata #1 • Ippon-me (Men-nuki-Men) ▾
          </div>
        </div>
        <div class="mockup-category-list">
          <span class="mockup-tag">礼法 Reiho</span>
          <span class="mockup-tag active">太刀 Tachi (1 a 7)</span>
          <span class="mockup-tag">小太刀 Kodachi (8 a 10)</span>
        </div>
      </div>
    `,
    tip: "💡 <strong>Dica de Estudo:</strong> Ao selecionar um novo kata, a linha do tempo e o painel de fundamentos são instantaneamente atualizados."
  },
  {
    step: 4,
    title: "4. Modo de Sincronia: Clímax (t=0) vs. Início",
    subtitle: "Alinhamento com defasagem matemática inteligente ou largada simultânea",
    icon: "⚡",
    description: `
      No rodapé da aplicação, você dispõe de dois modos de sincronia exclusivos:
      <br><br>
      • ⚡ <strong>CLÍMAX (t=0):</strong> É a inovação central do Studio. Como cada dupla executa os passos iniciais em cadências diferentes, este modo calcula a defasagem exata: o vídeo que demora mais para desferir o corte começa antes, enquanto os demais aguardam em pausa. <strong>O contragolpe/corte atinge o alvo exatamente no mesmo milissegundo (t = 0.0s) em todas as telas!</strong>
      <br><br>
      • ⏮ <strong>INÍCIO:</strong> Alinha a reprodução no segundo zero do kata selecionado. Todas as duplas iniciam o primeiro passo de aproximação juntas.
      <br><br>
      Ao término do kata, cada vídeo pausa estritamente em seu limite final e aguarda o término dos demais, <strong>sem invadir o kata seguinte</strong>.
    `,
    mockupHtml: `
      <div class="mockup-box">
        <div class="mockup-sync-controls">
          <button class="mockup-btn-sync start">⏮ Início</button>
          <button class="mockup-btn-sync climax active-climax">⚡ CLÍMAX (t=0)</button>
        </div>
        <div class="mockup-timeline-explain">
          <div class="mockup-bar-segment pre">-12.0s (Aproximação com defasagem)</div>
          <div class="mockup-bar-bolt">⚡ t=0 (Impacto)</div>
          <div class="mockup-bar-segment post">+15.0s (Zanshin & Retorno)</div>
        </div>
      </div>
    `,
    tip: "💡 <strong>Dica de Estudo:</strong> Use a sincronia no <strong>Clímax</strong> para comparar a altura da ponta da espada, o <em>kiai</em> e a esquiva no momento exato do golpe decisivo."
  },
  {
    step: 5,
    title: "5. Play/Pause Centralizado (Controle Mestre)",
    subtitle: "Comande todos os vídeos em perfeita harmonia a partir de um único botão",
    icon: "⏯",
    description: `
      Para garantir que nenhum vídeo perca a sincronização de milissegundos:
      <br><br>
      • <strong>Utilize SEMPRE o botão central [▶ / ⏸] na barra inferior.</strong>
      <br>
      • ⚠️ <strong>Evite clicar diretamente nos botões nativos do player do YouTube</strong> dentro de cada vídeo, pois isso desalinha o quadrante em relação aos demais.
      <br><br>
      • Você também pode usar os botões de passo rápido <strong>[⏮ -1s]</strong> e <strong>[⏭ +1s]</strong> para avançar ou recuar quadro a quadro.
      <br><br>
      • 🔄 <strong>Ressincronização Rápida (Anúncios do YouTube & Buffering):</strong> Se você utiliza uma conta básica sem YouTube Premium e for exibido um anúncio comercial, aguarde o término ou clique em <em>"Pular Anúncio"</em> no vídeo. Em seguida, clique no botão <strong>[🔄 Sincronizar]</strong> na barra inferior (ou no ícone 🔄 no cabeçalho de cada vídeo) para realinhar instantaneamente todos os vídeos ao mesmo milissegundo exato do Kata.
    `,
    mockupHtml: `
      <div class="mockup-box">
        <div class="mockup-master-bar">
          <span class="mockup-mini-btn">⏮ -1s</span>
          <button class="mockup-play-master">▶ PLAY SINCRONIZADO</button>
          <span class="mockup-mini-btn">⏭ +1s</span>
          <span class="mockup-mini-btn" style="color: #34D399; border-color: #059669;">🔄 Sincronizar</span>
        </div>
        <div class="mockup-status-alert">
          ✓ Todos os quadrantes ativos respondem instantaneamente ao comando central.
        </div>
      </div>
    `,
    tip: "💡 <strong>Dica para Contas Gratuitas:</strong> O botão <code>🔄 Sincronizar</code> realinha imediatamente qualquer vídeo que tenha sofrido atraso por anúncio comercial ou buffering."
  },
  {
    step: 6,
    title: "6. Velocidade, Timeline, Loop & Foco de Áudio",
    subtitle: "Recursos avançados de câmera lenta e isolamento acústico",
    icon: "🎛️",
    description: `
      Na barra de controle inferior, você tem à disposição:
      <br><br>
      • <strong>Velocidade:</strong> Opções de <code>0.25x</code>, <code>0.50x (Slow-mo)</code>, <code>0.75x</code> e <code>1.00x (Normal)</code>. Todos os vídeos desaceleram juntos de forma suave.
      <br>
      • <strong>Barra de Tempo (Scrubber):</strong> Arraste o cursor horizontalmente para navegar livremente entre o início do kata, o clímax e o zanshin final.
      <br>
      • 🔁 <strong>Loop Automático:</strong> Quando ativo, ao final do kata a ferramenta reinicia a reprodução de forma sincronizada com as devidas defasagens.
      <br>
      • 🔊 <strong>Foco de Áudio Exclusivo:</strong> Para evitar que 4 vídeos toquem áudio ao mesmo tempo, apenas um quadrante emite som por vez. Clique no botão de áudio de qualquer quadrante para alternar para ele.
    `,
    mockupHtml: `
      <div class="mockup-box">
        <div class="mockup-scrubber-preview">
          <div class="mockup-slider-track">
            <div class="mockup-slider-fill" style="width: 50%;"></div>
            <div class="mockup-slider-thumb" style="left: 50%;"></div>
            <div class="mockup-slider-climax-pin"></div>
          </div>
          <div class="mockup-slider-meta">
            <span>-12.4s</span>
            <span class="mockup-highlight-time">0.0s (Clímax)</span>
            <span>+15.2s</span>
          </div>
        </div>
        <div class="mockup-tools-row">
          <span class="mockup-pill-tool">Velocidade: 0.50x</span>
          <span class="mockup-pill-tool active-tool">🔁 Loop Ativo</span>
          <span class="mockup-pill-tool">🔊 Áudio: Q1 (Eiga × Onda)</span>
        </div>
      </div>
    `,
    tip: "💡 <strong>Dica de Estudo:</strong> Coloque em <code>0.50x</code> e alterne o botão de áudio entre as duplas para perceber a intensidade e o timbre dos <em>kiais</em> de cada mestre."
  },
  {
    step: 7,
    title: "7. Consulta aos Fundamentos do Kata",
    subtitle: "Integração didática da doutrina oficial paralelamente ao vídeo",
    icon: "📜",
    description: `
      No botão <strong>📜 Fundamentos</strong> no cabeçalho, você abre o painel lateral pedagógico:
      <br><br>
      • <strong>Kamae Inicial:</strong> A guarda canônica de Uchidachi e Shidachi (ex: <em>Jodan</em>, <em>Chudan</em>, <em>Gedan</em>, <em>Hasso</em>, <em>Waki-gamae</em>).
      <br>
      • <strong>Ação de Uchidachi (Mestre / Atacante):</strong> Distância, timing do ataque e postura pedagógica.
      <br>
      • <strong>Ação de Shidachi (Discípulo / Defensor):</strong> Técnica de contra-ataque (<em>Nuki</em>, <em>Suriage</em>, <em>Kaeshi</em>, etc.), kiai e <em>zanshin</em>.
      <br>
      • <strong>Pontos Críticos de Avaliação:</strong> Critérios rigorosos exigidos em exames de graduação da AJKF e CBK.
    `,
    mockupHtml: `
      <div class="mockup-box">
        <div class="mockup-doctrine-sample">
          <div class="mockup-doctrine-title">📜 Fundamentos • Ippon-me (Kata #1)</div>
          <div class="mockup-doctrine-item"><strong>Kamae:</strong> Hidari-Jodan (Uchidachi) × Migi-Jodan (Shidachi)</div>
          <div class="mockup-doctrine-item"><strong>Ação:</strong> Uchidachi desfere Men; Shidachi esquiva recuando e contra-ataca Men (Men-nuki-Men).</div>
          <div class="mockup-doctrine-item"><strong>Zanshin:</strong> Shidachi assume Jodan demonstrando domínio espiritual absoluto.</div>
        </div>
      </div>
    `,
    tip: "💡 <strong>Dica de Estudo:</strong> Mantenha o painel de Fundamentos aberto enquanto assiste em câmera lenta para conferir se cada mestre segue com rigor os pontos exigidos pela doutrina."
  }
];

export class UserGuideModal {
  constructor() {
    this.currentStepIndex = 0;
    this.modalEl = document.getElementById('modal-guide');
    this.containerEl = document.getElementById('guide-step-container');
    this.stepperNavEl = document.getElementById('guide-stepper-nav');
    this.btnPrev = document.getElementById('btn-guide-prev');
    this.btnNext = document.getElementById('btn-guide-next');
    this.btnClose = document.getElementById('btn-close-guide');
    this.btnFinish = document.getElementById('btn-finish-guide');
    this.btnOpen = document.getElementById('btn-open-guide');

    this.initEvents();
  }

  initEvents() {
    if (this.btnOpen) {
      this.btnOpen.addEventListener('click', () => this.open());
    }

    if (this.btnClose) {
      this.btnClose.addEventListener('click', () => this.close());
    }

    if (this.btnFinish) {
      this.btnFinish.addEventListener('click', () => this.close());
    }

    if (this.modalEl) {
      this.modalEl.addEventListener('click', (e) => {
        if (e.target === this.modalEl) {
          this.close();
        }
      });
    }

    if (this.btnPrev) {
      this.btnPrev.addEventListener('click', () => {
        if (this.currentStepIndex > 0) {
          this.goToStep(this.currentStepIndex - 1);
        }
      });
    }

    if (this.btnNext) {
      this.btnNext.addEventListener('click', () => {
        if (this.currentStepIndex < GUIDE_STEPS.length - 1) {
          this.goToStep(this.currentStepIndex + 1);
        } else {
          this.close();
        }
      });
    }

    // Teclado (ESC fecha, Setas navegam)
    window.addEventListener('keydown', (e) => {
      if (!this.modalEl || this.modalEl.classList.contains('hidden')) return;

      if (e.key === 'Escape') {
        this.close();
      } else if (e.key === 'ArrowRight') {
        if (this.currentStepIndex < GUIDE_STEPS.length - 1) {
          this.goToStep(this.currentStepIndex + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (this.currentStepIndex > 0) {
          this.goToStep(this.currentStepIndex - 1);
        }
      }
    });
  }

  open() {
    if (!this.modalEl) return;
    this.modalEl.classList.remove('hidden');
    this.goToStep(this.currentStepIndex);
  }

  close() {
    if (!this.modalEl) return;
    this.modalEl.classList.add('hidden');
  }

  goToStep(index) {
    this.currentStepIndex = index;
    const stepData = GUIDE_STEPS[index];
    if (!stepData) return;

    // Renderiza o Stepper
    this.renderStepper();

    // Renderiza o Conteúdo do Passo
    this.containerEl.innerHTML = `
      <div class="guide-step-card">
        <div class="guide-step-meta">
          <span class="guide-step-badge">Passo ${stepData.step} de ${GUIDE_STEPS.length}</span>
          <span class="guide-step-icon">${stepData.icon}</span>
        </div>

        <h3 class="guide-step-title">${stepData.title}</h3>
        <p class="guide-step-subtitle">${stepData.subtitle}</p>

        <div class="guide-step-layout">
          <div class="guide-step-desc">
            ${stepData.description}
            <div class="guide-step-tip">
              ${stepData.tip}
            </div>
          </div>
          <div class="guide-step-mockup">
            ${stepData.mockupHtml}
          </div>
        </div>
      </div>
    `;

    // Atualiza botões
    if (this.btnPrev) {
      this.btnPrev.disabled = index === 0;
      this.btnPrev.style.opacity = index === 0 ? "0.4" : "1";
    }

    if (this.btnNext) {
      if (index === GUIDE_STEPS.length - 1) {
        this.btnNext.innerHTML = "Começar a Praticar ⛩️";
        this.btnNext.className = "btn-modal-ack";
      } else {
        this.btnNext.innerHTML = "Próximo Passo ▶";
        this.btnNext.className = "btn-guide-nav next";
      }
    }
  }

  renderStepper() {
    if (!this.stepperNavEl) return;

    const shortLabels = [
      "1. Grade",
      "2. Vídeos",
      "3. Kata",
      "4. Sincronia",
      "5. Play/Pause",
      "6. Controles",
      "7. Fundamentos"
    ];

    let html = "";
    GUIDE_STEPS.forEach((step, idx) => {
      const isActive = idx === this.currentStepIndex;
      const isPast = idx < this.currentStepIndex;
      const cls = isActive ? "active" : (isPast ? "completed" : "");
      html += `
        <button class="guide-step-pill ${cls}" data-step-idx="${idx}" title="${step.title}">
          <span class="pill-number">${isPast ? "✓" : idx + 1}</span>
          <span class="pill-text">${shortLabels[idx]}</span>
        </button>
      `;
    });

    this.stepperNavEl.innerHTML = html;

    this.stepperNavEl.querySelectorAll('.guide-step-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetIdx = parseInt(e.currentTarget.getAttribute('data-step-idx'), 10);
        this.goToStep(targetIdx);
      });
    });
  }
}
