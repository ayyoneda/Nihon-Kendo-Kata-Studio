---
name: nihon-kendo-kata-studio
description: Diretrizes de arquitetura, padrões técnicos e regras de sincronização para o desenvolvimento e evolução do Nihon Kendo Kata Studio.
---

# Nihon Kendo Kata Studio — Skill de Desenvolvimento

Esta skill deve ser consultada em qualquer sessão de trabalho neste repositório para garantir continuidade sem desvios conceituais, regressões de bugs ou perda de tempo.

## 1. Visão do Projeto e Papéis
- **Autor e Curador Técnico:** Adrian Yoneda (Renshi 7º Dan — Brasil).
- **Missão:** Plataforma de estudo comparativo de alto nível técnico dos Nihon Kendo Kata (Katas 1 a 10 + Reiho Inicial e Final).
- **Princípio Zero-Hosting:** NUNCA armazenar arquivos de vídeo no servidor. Toda a mídia é consumida diretamente via YouTube IFrame API oficial, respeitando direitos autorais e gerando audiência para os canais originais.

## 2. Princípios do Motor de Sincronização (`src/syncEngine.js` e `src/videoGrid.js`)
1. **Ancoragem no Clímax ($t = 0.0s$):**
   - No modo Clímax, $t = 0.0s$ é o instante exato do corte/impacto/decisão técnica.
   - Tempos antes do clímax são negativos ($t < 0$), e tempos posteriores são positivos ($t > 0$).
   - A barra de progresso inferior calcula a posição do marcador de clímax (`#climax-tick`) dinamicamente:
     `climaxPercent = ((0 - minRelative) / (maxRelative - minRelative)) * 100`.
2. **Sincronização pelo Início:**
   - $t = 0.0s$ marca o início do kata (deslocamento dos 3/5/7/9 passos). O marcador de clímax fica oculto.
3. **Barreira Estrita de Fim de Kata (Dual-Clock Barrier):**
   - Nunca confiar apenas no relógio Javascript.
   - Em `videoGrid.js`, sempre verificar o tempo real do player (`actualTime = player.getCurrentTime()`).
   - Se `actualTime >= kata.end - 0.15s`:
     - Se `loop` desativado: pausar o player e congelar estritamente no frame final (`player.seekTo(kata.end, true)`), marcando estado como `'ended'`. O botão mestre muda para Pausado (`▶`).
     - Se `loop` ativado: reiniciar todos os slots de forma coordenada a partir de `minRelative`.
4. **Sincronização de Taxa de Reprodução (`playbackRate`):**
   - Sempre propagar explicitamente a velocidade selecionada (`player.setPlaybackRate(speed)`) tanto no `onReady` quanto no `playAll()`.
5. **Anti-Pattern de Seek:**
   - NUNCA executar `player.seekTo()` a cada frame de animação. Seek só é chamado em eventos pontuais (scrubbing do usuário, pulo para início/clímax, ou reinício de loop).

## 3. Segurança e Separação de Acesso
- O **Modo Calibrador** (`src/calibrator.js`) permite editar e afinar timestamps.
- Ele **só deve ser visível e acessível em ambiente local** (`window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'`).
- Na versão pública (GitHub Pages), o botão e a interface do calibrador permanecem ocultos para o usuário comum.

## 4. Banco de Dados de Kata (`data/kata_database.json`)
- Cada demonstração possui metadados da dupla (`uchidachi`, `shidachi`, títulos, bio), link do YouTube (`youtube_id`), e blocos de tempo para os 13 eventos:
  - `reiho_inicial`
  - `kata_01` até `kata_10`
  - `reiho_final`
- Cada bloco contém `start`, `climax` e `end` em segundos decimais.
- A ordenação das demonstrações deve ser rigorosamente decrescente por ano e agrupada por prestígio:
  1. AJKF Official Standard
  2. All Japan Kendo Championship (Enbu)
  3. All Japan 8th Dan Taikai
  4. Kyoto Taikai

## 5. Procedimento de Validação Obrigatória
Antes de commitar qualquer alteração:
1. Executar testes de unidade e integração:
   `npm test`
2. Executar build de produção:
   `npm run build`
3. Verificar a ausência de regressões na reprodução e no scrubber.
