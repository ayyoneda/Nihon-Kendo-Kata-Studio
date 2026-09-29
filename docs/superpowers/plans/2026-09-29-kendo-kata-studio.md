# Kendo Kata Studio & Comparador Multivídeo - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir uma plataforma web interativa (SPA estática) para estudo e comparação de demonstrações de Nihon Kendo Kata (Hanshi 8º Dan) transmitidas diretamente do YouTube, com sincronização dinâmica ancorada no clímax do contragolpe ($t=0$), painel de apoio didático doutrinário, calibrador web milimétrico e utilitário de exportação offline FFmpeg.

**Architecture:** A aplicação é composta por um banco de dados unificado (`data/kata_database.json`) contendo os metadados de 10 katas e 8-10 demonstrações oficiais. O frontend em Vanilla JS/Vite gerencia múltiplos `YT.Player` sincronizados por uma linha do tempo relativa ao clímax do golpe. Um calibrador web embutido permite refinar timestamps frame a frame, enquanto um script Python (`pipeline/build_mp4_grid.py`) permite exportação física em MP4 com FFmpeg para uso offline.

**Tech Stack:** JavaScript moderno (ES Modules, Vanilla JS), HTML5, CSS3 (Design System com Dark Mode e estética Kendo), YouTube IFrame Player API, Vite, Python 3 (com `yt-dlp` e `pytest`), FFmpeg.

**Spec:** [docs/superpowers/specs/2026-09-29-kendo-kata-comparador-design.md](file:///c:/IA/Kendo%20Kata%20Comparador/docs/superpowers/specs/2026-09-29-kendo-kata-comparador-design.md)

## Global Constraints

- O acervo inicial deve contemplar todas as demonstrações e os 10 katas catalogados no [Kendo_Kata_Deep_Research.md](file:///c:/IA/Kendo%20Kata%20Comparador/Kendo_Kata_Deep_Research.md).
- O sincronizador deve alinhar os vídeos pelo instante do Clímax ($t = 0$), calculando os offsets de início e fim individualmente para cada dupla.
- Não deve haver dependência de tokens de API externa pagos (o Antigravity calibra a base inicial diretamente no ambiente).
- A aplicação web deve ser 100% estática para permitir hospedagem gratuita no GitHub Pages / Vercel.
- O tema visual deve seguir a paleta do Kendo (*Aizome* `#0B0F19`/`#141C2E`, Ouro Bambu `#D4AF37`, Vermelho Laca `#E03131`).

## Review Focus

1. **Dessincronização por Buffering:** Jogar múltiplos players no YouTube pode ter latência de rede; o motor deve pausar e só disparar o play conjunto quando todos sinalizarem prontidão (`onPlayerReady` / buffer lock).
2. **Scrubbing fora do intervalo do Kata:** Ao arrastar a timeline além do início ($S_i$) ou do fim ($E_i$) de um kata mais curto, o player correspondente deve pausar no frame limite sem quebrar os outros.
3. **Persistência de Áudio Exclusivo:** Apenas um quadrante pode tocar áudio por vez; ao trocar o áudio ativo de um quadrante, os outros devem ser mutados imediatamente.
4. **Precisão dos Timestamps de Corte:** $S_i < C_i < E_i$ deve ser estritamente verdadeiro para todas as duplas em todos os 10 katas.
5. **Comportamento em Telas Menores (Responsividade):** Em telas com largura menor que 1024px, o grid 2x2 deve reorganizar fluidamente para 1 coluna ou 1x2 para preservar a visibilidade dos detalhes técnicos.

---

### Task 1: Estrutura do Banco de Dados e Curadoria Pedagógica

**Files:**
- Create: `data/kata_database.json`
- Create: `tests/test_database_schema.py`

**Interfaces:**
- Produces: `data/kata_database.json` consumido por `src/syncEngine.js`, `src/pedagogyPanel.js` e `pipeline/build_mp4_grid.py`.
- Formato: Objeto com `version`, `katas_pedagogical` (10 katas com Kamaes, Alvos, Waza, Sen, Chakuganten, Erros) e `demonstrations` (array de duplas com `youtube_id`, `uchidachi`, `shidachi`, `katas`).

- [ ] **Step 1: Escrever teste de integridade do schema do banco de dados**

Criar `tests/test_database_schema.py`:
```python
import json
import os
import pytest

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "kata_database.json")

def test_database_structure_exists():
    assert os.path.exists(DB_PATH), "data/kata_database.json deve existir"
    with open(DB_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    assert "version" in data
    assert "katas_pedagogical" in data
    assert "demonstrations" in data

def test_pedagogical_katas_completeness():
    with open(DB_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    pedagogy = data["katas_pedagogical"]
    assert len(pedagogy) == 10, "Devem existir exatamente 10 katas catalogados"
    
    for i in range(1, 11):
        kata_id = f"kata_{i:02d}"
        assert kata_id in pedagogy, f"{kata_id} deve estar presente"
        kata = pedagogy[kata_id]
        assert "name_romaji" in kata
        assert "name_jp" in kata
        assert "type" in kata
        assert "kamae_uchidachi" in kata
        assert "kamae_shidachi" in kata
        assert "waza_shidachi" in kata
        assert "sen" in kata
        assert len(kata["chakuganten"]) > 0
        assert len(kata["common_mistakes"]) > 0

def test_demonstrations_catalog():
    with open(DB_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    demos = data["demonstrations"]
    assert len(demos) >= 4, "Devem existir pelo menos 4 demonstrações no catálogo inicial"
    for demo in demos:
        assert "id" in demo
        assert "title" in demo
        assert "youtube_id" in demo and len(demo["youtube_id"]) == 11
        assert "uchidachi" in demo and "name" in demo["uchidachi"]
        assert "shidachi" in demo and "name" in demo["shidachi"]
        assert "katas" in demo
```

- [ ] **Step 2: Rodar teste para verificar que falha antes da criação**

Comando: `python -m pytest tests/test_database_schema.py -v`  
Esperado: FAIL (arquivo não existe).

- [ ] **Step 3: Construir `data/kata_database.json` com os dados do Deep Research**

Criar `data/kata_database.json` com todos os 10 katas pedagógicos (Tachi 1 a 7 e Kodachi 1 a 3) extraídos minuciosamente de `Kendo_Kata_Deep_Research.md`, e registrar as 8 principais demonstrações de Hanshi 8º Dan com seus respectivos dados de mestres e IDs do YouTube.

- [ ] **Step 4: Rodar teste para verificar aprovação**

Comando: `python -m pytest tests/test_database_schema.py -v`  
Esperado: PASS.

- [ ] **Step 5: Commit**

```bash
git add data/kata_database.json tests/test_database_schema.py
git commit -m "feat: adicionar schema e curadoria pedagogica em kata_database.json"
```

---

### Task 2: Ingestão e Calibração dos Timestamps dos Vídeos Iniciais

**Files:**
- Create: `scripts/calibrate_timestamps.py`
- Modify: `data/kata_database.json`
- Create: `tests/test_timestamps_validity.py`

**Interfaces:**
- Produces: Timestamps válidos ($0 < \text{start} < \text{climax} < \text{end}$) para os 10 katas das demonstrações em `data/kata_database.json`.

- [ ] **Step 1: Escrever teste de validação de timestamps**

Criar `tests/test_timestamps_validity.py`:
```python
import json
import os
import pytest

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "kata_database.json")

def test_timestamps_chronological_order():
    with open(DB_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    for demo in data["demonstrations"]:
        demo_id = demo["id"]
        for kata_id, timing in demo.get("katas", {}).items():
            start = timing.get("start")
            climax = timing.get("climax")
            end = timing.get("end")
            
            assert start is not None and climax is not None and end is not None, \
                f"{demo_id} {kata_id} deve possuir start, climax e end"
            assert 0 <= start < climax, f"{demo_id} {kata_id}: start ({start}) deve ser menor que climax ({climax})"
            assert climax < end, f"{demo_id} {kata_id}: climax ({climax}) deve ser menor que end ({end})"
            assert (end - start) >= 10.0, f"{demo_id} {kata_id}: duracao do kata ({end - start}s) deve ser valida (>10s)"
```

- [ ] **Step 2: Rodar teste para verificar status atual**

Comando: `python -m pytest tests/test_timestamps_validity.py -v`  
Esperado: Validação das demonstrações catalogadas.

- [ ] **Step 3: Criar script auxiliar `scripts/calibrate_timestamps.py` e extrair timestamps das demonstrações**

O script analisa capítulos e marcos temporais das transmissões oficiais do YouTube (`yt-dlp --dump-json`) e sincroniza os 10 katas para as demonstrações principais:
1. `ajkf_official_standard` (Sato & Terachi, `QIpPUdTCv-Y`)
2. `73rd_all_japan_2025` (Funatsu & Kurita, `K5wtqeIKlIo`)
3. `72nd_all_japan_2024` (Shimizu & Shimaue, `3Bf9D5NL1RM`)
4. `71st_all_japan_2023` (Shimojima & Shigematsu, `p9SD3EjtwEw`)
5. `70th_all_japan_2022` (Tani & Matsuda, `w8z979zqX9s`)
6. `24th_8dan_2026` (Sato & Yamazaki, `SoDlY0lcPz8`)
7. `20th_8dan_2022` (Matsuda & Higashi, `z50QPdzbGAs`)
8. `kyoto_taikai_120th` (Kamei & Matsuda, `nz_gnUFsnEE`)

- [ ] **Step 4: Rodar teste e certificar 100% de aprovação**

Comando: `python -m pytest tests/test_timestamps_validity.py -v`  
Esperado: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/calibrate_timestamps.py data/kata_database.json tests/test_timestamps_validity.py
git commit -m "feat: calibrar timestamps de start, climax e end dos videos iniciais"
```

---

### Task 3: Motor de Sincronização Lógica do Frontend (TDD)

**Files:**
- Create: `src/syncEngine.js`
- Create: `tests/syncEngine.test.js`
- Modify: `package.json`

**Interfaces:**
- Produces: Módulo puro `syncEngine.js` exportando:
  - `calculateTimeWindow(kataId, activeDemos, db)`: retorna `{ preDuration, postDuration, totalDuration }`
  - `getAbsoluteVideoTime(relativeTime, demoId, kataId, db)`: converte tempo relativo $(-t \dots +t)$ para segundo absoluto no YouTube
  - `formatRelativeTime(seconds)`: formata para string amigável (ex: `-08.4s`, `0.0s`, `+11.2s`)
  - `formatClock(seconds)`: formata para `MM:SS.s`

- [ ] **Step 1: Configurar ambiente Node / Vitest para testes unitários do motor JS**

Configurar `package.json` com scripts de teste e dev (usando `vite` e `vitest`).

- [ ] **Step 2: Escrever testes unitários em `tests/syncEngine.test.js`**

```javascript
import { describe, it, expect } from 'vitest';
import { calculateTimeWindow, getAbsoluteVideoTime, formatRelativeTime } from '../src/syncEngine.js';

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

describe('syncEngine', () => {
  it('deve calcular corretamente a janela de tempo máxima pré e pós clímax', () => {
    const window = calculateTimeWindow("kata_01", ["demo_1", "demo_2"], mockDb);
    expect(window.preDuration).toBe(15.0);   // max(15, 12)
    expect(window.postDuration).toBe(18.0);  // max(15, 18)
    expect(window.minRelative).toBe(-15.0);
    expect(window.maxRelative).toBe(18.0);
    expect(window.totalDuration).toBe(33.0);
  });

  it('deve converter tempo relativo para o segundo absoluto do YouTube ancorado no clímax', () => {
    // No clímax (t=0)
    expect(getAbsoluteVideoTime(0.0, "demo_1", "kata_01", mockDb)).toBe(115.0);
    expect(getAbsoluteVideoTime(0.0, "demo_2", "kata_01", mockDb)).toBe(62.0);

    // 5 segundos antes do clímax (t=-5.0)
    expect(getAbsoluteVideoTime(-5.0, "demo_1", "kata_01", mockDb)).toBe(110.0);
    expect(getAbsoluteVideoTime(-5.0, "demo_2", "kata_01", mockDb)).toBe(57.0);

    // Clamping para início se t_relativo for menor que o start do vídeo
    expect(getAbsoluteVideoTime(-20.0, "demo_2", "kata_01", mockDb)).toBe(50.0);
  });

  it('deve formatar o tempo relativo com sinais visuais claros', () => {
    expect(formatRelativeTime(-8.42)).toBe("-08.4s");
    expect(formatRelativeTime(0.0)).toBe("0.0s");
    expect(formatRelativeTime(11.25)).toBe("+11.2s");
  });
});
```

- [ ] **Step 3: Rodar teste e verificar falha**

Comando: `npx vitest run tests/syncEngine.test.js`  
Esperado: FAIL (módulo `src/syncEngine.js` ainda não existe).

- [ ] **Step 4: Implementar `src/syncEngine.js`**

Implementar os cálculos matemáticos de offset, tempo relativo, clamping nos limites de *start* e *end*, e formatação de tempo.

- [ ] **Step 5: Rodar testes e certificar aprovação**

Comando: `npx vitest run tests/syncEngine.test.js`  
Esperado: PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json src/syncEngine.js tests/syncEngine.test.js
git commit -m "feat: implementar motor matematico de sincronizacao relativa no climax"
```

---

### Task 4: Interface do Usuário (Design System, Grade Dinâmica e Painel Didático)

**Files:**
- Create: `index.html`
- Create: `src/style.css`
- Create: `src/pedagogyPanel.js`
- Create: `src/videoGrid.js`
- Create: `src/app.js`

**Interfaces:**
- Consumes: `data/kata_database.json`, `src/syncEngine.js`
- Produces: Aplicação visual completa com:
  - Header com seletores de Kata (1 a 10) e Layout (1x1, 1x2, 2x2);
  - Barra de controle mestre de reprodução;
  - Grade de vídeos YouTube com controles de áudio e seletor de dupla;
  - Painel lateral retrátil de estudo doutrinário.

- [ ] **Step 1: Criar `index.html` com marcação semântica e acessível**

Montar a estrutura HTML da aplicação incluindo:
- `<header>`: logotipo, seletor de katas com kanjis, alternador de grid (1x1, 1x2, 2x2) e botão de alternância de modo (Estudo / Calibrador);
- `<main class="app-layout">`: área da grade de vídeos e `<aside id="pedagogy-panel">`;
- `<footer>`: barra fixa inferior com a linha do tempo mestre (timeline scrubber, botões Play/Pause, Replay do Clímax, velocidade 0.25x/0.5x/0.75x/1.0x e Loop).

- [ ] **Step 2: Implementar `src/style.css` com Design System Kendo Premium**

Criar variáveis CSS:
- `--bg-primary: #0B0F19;`
- `--bg-surface: #141C2E;`
- `--accent-gold: #D4AF37;`
- `--accent-crimson: #E03131;`
- `--border-color: #222F48;`
- Classes para grid responsivo: `.grid-1x1`, `.grid-1x2`, `.grid-2x2`.
- Estilização moderna para timeline scrubber, badges dos mestres, botões de ação e painel pedagógico com tipografia Inter + Noto Serif JP.

- [ ] **Step 3: Implementar `src/pedagogyPanel.js`**

Função `renderPedagogyPanel(kataId, db)`:
- Atualiza dinamicamente as seções do painel:
  - Título do Kata com Kanji e Romaji;
  - Cards de Kamae (Uchidachi vs Shidachi) e Alvo;
  - Técnica de Shidachi e Princípio de Iniciativa (*Mitsu no Sen*);
  - Lista de *Chakuganten* (Critérios de Avaliação AJKF);
  - Lista de Erros Comuns e orientações de execução.

- [ ] **Step 4: Implementar `src/videoGrid.js` com YouTube IFrame API**

Gerenciamento dinâmico de players:
- Carrega a biblioteca `https://www.youtube.com/iframe_api`;
- Função `setupGrid(layout, selectedDemoIds, currentKataId, db)`: cria ou recicla instâncias de `YT.Player` dentro dos containers;
- Implementa a trava de prontidão (*Buffer Lock*): coleta o evento `onReady` e `onStateChange` de todos os players ativos;
- Gerencia o seletor de duplas em cada quadrante e o botão de áudio exclusivo (mutando os outros players para garantir áudio limpo de apenas 1 demonstração).

- [ ] **Step 5: Integrar tudo em `src/app.js`**

Conectar os controles da linha do tempo mestre aos players:
- Play/Pause sincronizado;
- Botão "⚡ Ir para o Clímax (t=0)";
- Scrubbing na barra de progresso calculando $T_i = C_i + t_{\text{relativo}}$;
- Seletor de velocidade síncrono (`setPlaybackRate`);
- Loop automático ao atingir o fim da janela do kata.

- [ ] **Step 6: Executar servidor de desenvolvimento local e testar visualmente**

Comando: `npx vite --port 3000` (ou script Python HTTP).  
Verificar no navegador: carregamento fluido da interface, renderização dos 10 katas e exibição dos dados pedagógicos.

- [ ] **Step 7: Commit**

```bash
git add index.html src/style.css src/pedagogyPanel.js src/videoGrid.js src/app.js
git commit -m "feat: construir interface web responsiva com grade dinamica e painel didatico"
```

---

### Task 5: Calibrador Web Integrado (Interface de Marcação Frame a Frame)

**Files:**
- Create: `src/calibrator.js`
- Modify: `index.html`
- Modify: `src/style.css`
- Modify: `src/app.js`

**Interfaces:**
- Consumes: `data/kata_database.json`, YouTube IFrame API
- Produces: Tela de calibração que permite selecionar qualquer vídeo e kata, navegar frame a frame e gravar `Start` (`S`), `Clímax` (`C`), `End` (`E`), com botão de exportar/baixar o JSON atualizado.

- [ ] **Step 1: Implementar lógica de atualização do calibrador**

Implementar função de atualização de timestamps com ordenação estrita ($S < C < E$) e salvamento no estado local.

- [ ] **Step 2: Implementar módulo `src/calibrator.js`**

- Player dedicado de alta precisão com exibição em tempo real do timestamp atual em segundos com 3 casas decimais (`currentTime.toFixed(3)`);
- Atalhos de teclado:
  - `Espaço`: Play / Pause;
  - `J` / `Seta Esquerda`: Voltar 0.1 segundo / 1 frame;
  - `L` / `Seta Direita`: Avançar 0.1 segundo / 1 frame;
  - `S`: Marcar **Start** do kata selecionado;
  - `C`: Marcar **Clímax** (contragolpe de Shidachi);
  - `E`: Marcar **End** (estabilização em Chudan a 9 passos).
- Botão "Preview Loop do Corte": reproduz de `start` a `end` com sinalização visual na tela no exato instante do `climax`;
- Botão "Exportar kata_database.json": faz o download do arquivo atualizado no formato JSON para salvar no repositório.

- [ ] **Step 3: Integrar botão de alternância "Estudo / Calibrador" no Header**

Permitir alternar entre a visão de comparação multivídeo e a mesa de calibração com 1 clique.

- [ ] **Step 4: Testar calibração no navegador**

Verificar que ao abrir o calibrador, avançar o vídeo e teclar `S`, `C`, `E`, os campos são preenchidos e o preview reproduz exatamente o intervalo marcado.

- [ ] **Step 5: Commit**

```bash
git add src/calibrator.js index.html src/style.css src/app.js
git commit -m "feat: adicionar calibrador web integrado com atalhos de teclado frame a frame"
```

---

### Task 6: Módulo Opcional de Exportação FFmpeg Offline

**Files:**
- Create: `pipeline/build_mp4_grid.py`
- Create: `tests/test_ffmpeg_export.py`

**Interfaces:**
- Consumes: `data/kata_database.json`, `raw_videos/`
- Produces: Arquivos MP4 em `output/kata_XX_grid.mp4` montados em matriz 2x2 1080p sincronizados pelo clímax.

- [ ] **Step 1: Escrever teste de validação do script de exportação**

Criar `tests/test_ffmpeg_export.py`:
```python
import subprocess
import os
import pytest

def test_build_mp4_grid_help_cli():
    result = subprocess.run(["python", "pipeline/build_mp4_grid.py", "--help"], capture_output=True, text=True)
    assert result.returncode == 0
    assert "--kata" in result.stdout
    assert "--videos" in result.stdout
```

- [ ] **Step 2: Rodar teste para verificar falha inicial**

Comando: `python -m pytest tests/test_ffmpeg_export.py -v`  
Esperado: FAIL (`build_mp4_grid.py` ainda não existe).

- [ ] **Step 3: Implementar `pipeline/build_mp4_grid.py`**

- Lê `data/kata_database.json`;
- Baixa o trecho de 4 vídeos selecionados via `yt-dlp` (se ainda não baixados);
- Calcula a maior duração pré-clímax e pós-clímax para garantir que o golpe de todos os quadrantes ocorra exatamente no mesmo segundo do MP4 final;
- Aplica corte, filtro `scale=960:540`, `drawtext` com identificação das duplas, e une os 4 vídeos com `xstack=inputs=4:layout=0_0|w0_0|0_h0|w0_h0`;
- Salva o arquivo resultante em `output/kata_{XX}_grid.mp4`.

- [ ] **Step 4: Rodar teste do CLI e testar renderização de amostra**

Comando: `python -m pytest tests/test_ffmpeg_export.py -v`  
Esperado: PASS.

- [ ] **Step 5: Commit**

```bash
git add pipeline/build_mp4_grid.py tests/test_ffmpeg_export.py
git commit -m "feat: implementar script de exportacao de matriz 2x2 offline via ffmpeg"
```

---

### Task 7: Validação End-to-End, Build de Produção e Documentação

**Files:**
- Create: `README.md`
- Modify: `package.json`

**Interfaces:**
- Produces: `dist/` (build otimizado para deploy estático no GitHub Pages) e documentação de uso no `README.md`.

- [ ] **Step 1: Teste End-to-End via Browser Subagent**

Iniciar o servidor local e disparar o subagente de browser para:
1. Abrir o app na rota principal;
2. Selecionar Kata 1 (Ippon-me), Kata 2 (Nihon-me) e verificar atualização do painel doutrinário;
3. Alternar layout para 1x1, 1x2 e 2x2;
4. Testar clique no botão "⚡ Ir para o Clímax" e atestar salto síncrono dos players;
5. Abrir o modo Calibrador e testar atalhos de marcação.

- [ ] **Step 2: Configurar Build para GitHub Pages / Vercel**

Configurar script `npm run build` no `package.json` gerando os arquivos estáticos prontos para distribuição na pasta `dist/`.

- [ ] **Step 3: Elaborar `README.md` Completo**

Documentar:
- Como abrir e rodar localmente (`npm install && npm run dev`);
- Como fazer deploy gratuito no GitHub Pages com 1 comando;
- Como usar o comparador para estudos de arbitragem e exames de graduação;
- Como usar o Calibrador Web para adicionar novos vídeos ao catálogo;
- Como rodar o script de exportação offline em MP4 com FFmpeg.

- [ ] **Step 4: Rodar suíte completa de testes (Python + JS)**

Comandos:
- `python -m pytest tests/ -v`
- `npx vitest run`  
Esperado: 100% de testes aprovados.

- [ ] **Step 5: Commit final**

```bash
git add README.md package.json
git commit -m "docs: adicionar documentacao completa de uso e scripts de deploy"
```
