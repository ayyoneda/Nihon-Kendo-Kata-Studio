# Nihon Kendo Kata Studio — Documentação Técnica e Arquitetural

**Autor e Curadoria:** Adrian Yoneda (Renshi 7º Dan — Brasil)  
**Repositório Oficial:** [GitHub: ayyoneda/Nihon-Kendo-Kata-Studio](https://github.com/ayyoneda/Nihon-Kendo-Kata-Studio.git)  
**Ambiente de Publicação:** GitHub Pages

---

## 1. Contexto e Conceito da Ferramenta

### 1.1 Objetivo
O **Nihon Kendo Kata Studio** foi concebido para o estudo comparativo, técnico e visual minucioso dos **Nihon Kendo Kata** (Katas 1 a 7 com Tachi e Katas 8 a 10 com Kodachi, além dos Reiho Inicial e Final).

Diferente do Shiai (combate esportivo), a prática dos Kata exige o domínio de conceitos refinados como:
- **Maai** (distância e intervalo espacial);
- **Hasuji** (alinhamento correto do fio da espada no corte);
- **Kiai** (manifestação da energia e intenção vocal);
- **Metsuke** (foco do olhar nos olhos do oponente);
- **Zanshin** (estado de alerta físico e mental pós-golpe);
- **Kansei / Kigurai** (porte, dignidade e autoridade marcial).

### 1.2 O Conceito de Sincronização Relativa (Ancoragem no Clímax)
Cada dupla de mestres (Uchidachi e Shidachi) possui sua própria cadência, ritmo respiratório e tempo de deslocamento até os 9 ou 3 passos. Se dois vídeos forem simplesmente iniciados no mesmo segundo, o momento do golpe (*clímax*) ocorrerá com vários segundos de defasagem entre eles, inviabilizando uma comparação precisa.

Por isso, o núcleo da ferramenta baseia-se na **Ancoragem Matemática pelo Clímax ($t = 0.0\text{s}$)**:
1. Para cada kata de cada vídeo curado, calibra-se o instante exato do golpe decisivo (ex.: contato de lâminas ou interrupção do corte).
2. O relógio central da ferramenta trabalha em tempo relativo:
   - $t < 0$: aproximação, preparação dos 3/5 passos, tomada de kamae e início do ataque.
   - $t = 0.0\text{s}$: o Clímax milimétrico (momento do kiai e golpe).
   - $t > 0$: reação de Shidachi, corte de resposta, zanshin e retorno aos 9 passos.
3. Permite também a **Sincronização pelo Início**, onde $t = 0.0\text{s}$ marca o primeiro movimento do kata para estudo da cadência inicial.

### 1.3 Arquitetura Zero-Hosting e Conformidade com Copyright
- A ferramenta **não armazena nem redistribui arquivos de vídeo**.
- Todos os vídeos são transmitidos diretamente pela API oficial do YouTube IFrame, respeitando integralmente as diretrizes de direitos autorais e gerando visualizações para os canais proprietários oficiais (AJKF, Kendo World, etc.).
- O sistema armazena unicamente metadados e timestamps de curadoria no arquivo `data/kata_database.json`.

---

## 2. Estrutura de Arquivos e Organização

A estrutura atual do repositório adota boas práticas de separação de responsabilidades para projetos web modernos:

```
├── .agents/                          # Configurações de agentes e automações
│   └── skills/                       # Skills do projeto para sessões futuras
├── data/
│   └── kata_database.json            # Banco canônico de vídeos, timestamps e fundamentos
├── docs/                             # Documentação técnica, especificações e planos
│   └── PROJECT_DOCUMENTATION.md      # Este documento consolidado
├── public/                           # Arquivos estáticos servidos diretamente pelo Vite
├── references/                       # Manuais oficiais de referência em PDF (AJKF e CBK)
│   ├── nippon_kendo_kata_manual.pdf  # Manual canônico AJKF (Japonês/Inglês)
│   └── traducao kendo kata - 200923.pdf # Tradução canônica CBK (Português)
├── scripts/                          # Scripts Python auxiliares para calibração e áudio
├── src/                              # Código-fonte da aplicação (Modular Vanilla JS)
│   ├── app.js                        # Orquestrador mestre da UI e ciclo de eventos
│   ├── calibrator.js                 # Ferramenta de calibração fina (somente localhost)
│   ├── guide.js                      # Modal e guia visual passo a passo
│   ├── style.css                     # Sistema de design, grid responsivo e tokens
│   ├── syncEngine.js                 # Matemática pura de tempo relativo e janelas
│   └── videoGrid.js                  # Gerenciamento dos players YouTube IFrame API
├── tests/                            # Testes automatizados (Node Test Runner)
│   ├── syncEngine.test.js            # Testes do motor matemático de sincronia
│   └── test_frontend_integration.js  # Testes de integridade do banco e slots
├── index.html                        # Ponto de entrada HTML e estrutura da aplicação
├── package.json                      # Scripts de teste, build e dependências
└── vite.config.js                    # Configuração de build para GitHub Pages
```

---

## 3. Lições Aprendidas e Post-Mortem de Correções Críticas

Para evitar a reincidência de erros técnicos em futuras implementações, as seguintes lições e padrões foram estabelecidos:

### 3.1 Dessincronia de Velocidade de Reprodução (`playbackRate`)
- **Problema:** A ferramenta definia a velocidade do relógio de simulação em `0.5x` no Javascript, mas os players do YouTube iniciavam na taxa nativa de `1.0x`. Com isso, os vídeos corriam ao dobro da velocidade do relógio central e ultrapassavam o ponto de corte do kata.
- **Regra de Ouro:** Sempre chamar explicitamente `player.setPlaybackRate(speed)` tanto no evento `onReady` de cada slot quanto ao disparar o `playAll()` e no seletor de velocidade.

### 3.2 Vazamento de Kata no Término (Bleeding into next kata)
- **Problema:** O relógio geral em `requestAnimationFrame` pode sofrer pequenos atrasos de rede ou perda de frames, fazendo com que o player do YouTube ultrapasse o timestamp final do kata (`kata.end`) e invada o kata seguinte.
- **Regra de Ouro (Dual-Clock Barrier):** No método `onPlaybackTick`, é obrigatório consultar o relógio interno do próprio player do YouTube (`actualTime = player.getCurrentTime()`). Se `actualTime >= kata.end - 0.15s`, o slot deve:
  1. Pausar imediatamente (`player.pauseVideo()`);
  2. Travar no frame final (`player.seekTo(kata.end, true)`);
  3. Marcar o estado do slot como `'ended'`.
  4. Se o **Loop** estiver desativado, o botão mestre pausa e congela na postura final. Se o **Loop** estiver ativado, todos os slots retornam de forma suave e sincronizada para o início do kata.

### 3.3 Evitar Seek Storms (Trava de Player / Buffering Infinito)
- **Problema:** Chamar `seekTo()` a cada frame em animação contínua causa sobrecarga na API do YouTube e acarreta travamentos infinitos.
- **Regra de Ouro:** O `seekTo` só deve ser invocado em ações discretas do usuário (ao arrastar o scrubber, ao clicar nos botões de Início/Clímax, ou ao reiniciar o ciclo de Loop). Durante a reprodução contínua, os vídeos devem fluir livremente, monitorando apenas a taxa de drift e o ponto de corte.

### 3.4 Posicionamento Dinâmico do Marcador de Clímax no Scrubber
- **Problema:** O marcador vermelho na barra de tempo inferior estava fixado em `left: 50%` no CSS, mas os katas são temporalmente assimétricos (a aproximação dura ~10s e o zanshin pós-golpe dura ~26s, colocando o clímax real a ~28% da barra).
- **Regra de Ouro:** O indicador de clímax (`#climax-tick`) deve ter sua posição calculada dinamicamente com base nos limites do kata ativo:
  $$\text{Posição} = \frac{0 - t_{\min}}{t_{\max} - t_{\min}} \times 100\%$$
  E deve ser ocultado quando o modo for "Sincronizar Início".

### 3.5 Separação de Acesso ao Modo Calibrador
- **Problema:** O modo de calibração permite alterar timestamps e não deve ser acessível ao usuário final na versão pública.
- **Regra de Ouro:** O botão e os controles do Calibrador são renderizados condicionalmente apenas se o endereço de acesso for `localhost` ou `127.0.0.1`. No GitHub Pages público, o botão sequer é exibido no cabeçalho.

---

## 4. Próximas Etapas e Roadmap Priorizado

### Prioridade 1: Responsividade Mobile e Padronização de Defaults
- **Objetivo:** Garantir uma experiência limpa em smartphones e definir preferências padrão ideais.
- **Especificações:**
  - Detecção automática de dispositivos móveis via media query CSS e largura de tela.
  - No mobile: focar em layout **1x1** (1 vídeo), com curadoria de kata ativa e menu simplificado; o painel de "Fundamentos" inicia **recolhido/fechado** para priorizar a área visual.
  - No computador/desktop: o layout padrão inicia em **1x2** (2 vídeos lado a lado para estudo comparativo) com o painel de "Fundamentos" **aberto/ativo**.
  - Velocidade de reprodução padrão ajustada para **1.0x (Normal)** em todos os dispositivos (mantendo seletores para 0.25x, 0.5x, 0.75x).

### Prioridade 2: Resiliência a Anúncios do YouTube (Contas Gratuitas / Anônimas)
- **Objetivo:** Mitigar o impacto de anúncios pre-roll e mid-roll para usuários sem YouTube Premium.
- **Especificações:**
  - Detecção de estado de reprodução de anúncio via API do YouTube (`player.getDuration()` ou estados anômalos de buffer).
  - Pausa inteligente do relógio mestre durante a exibição de anúncio, com aviso visual sutil no slot (*"Aguardando anúncio do YouTube..."*).
  - Botão de "Ressincronizar" (Quick Resync) com 1 clique para realinhar os vídeos instantaneamente após o anúncio ser pulado ou concluído.
  - Orientação no Guia da Ferramenta explicando como proceder quando houver anúncio.

### Prioridade 3: Revisão Canônica dos Fundamentos via Manuais AJKF e CBK
- **Objetivo:** Elevar o rigor técnico pedagógico das explicações de cada kata.
- **Fontes:**
  - Manual Oficial da All Japan Kendo Federation (`references/nippon_kendo_kata_manual.pdf`).
  - Tradução Oficial da Confederação Brasileira de Kendo (`references/traducao kendo kata - 200923.pdf`).
- **Escopo:** Padronizar termos canônicos (Metsuke, Maai, Kiai, Hasuji, Zanshin), diretrizes estritas para Uchidachi e Shidachi, e detalhamento de pontos de corte e de avaliação para exames de graduação.

### Prioridade 4: Suporte Multilíngue (i18n: PT-BR, EN, JA)
- **Objetivo:** Permitir a internacionalização completa da ferramenta para a comunidade global de Kendo.
- **Especificações:**
  - Sistema de internacionalização leve sem dependências pesadas (`src/i18n/`).
  - Seletor discreto no cabeçalho: `[PT | EN | JA]`.
  - Tradução da interface completa, botões, modais, guia de uso e da base pedagógica de Fundamentos de todos os kata.
