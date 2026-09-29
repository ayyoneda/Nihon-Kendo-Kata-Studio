# ⛩️ Nihon Kendo Kata Studio (日本剣道形)

> **Plataforma de alta precisão para estudo e comparação multivídeo sincronizado de Nihon Kendo Kata (Hanshi 8º Dan).**

---

## 📌 Visão Geral

O **Nihon Kendo Kata Studio** foi desenvolvido para transformar o estudo das 10 formas canônicas do Kendo (*Tachi-no-Kata* 1 a 7 e *Kodachi-no-Kata* 8 a 10) através da comparação visual e doutrinária precisa de mestres graduados como **Hanshi 8º Dan** nos eventos mais prestigiados do Japão (*Nippon Budokan*, *Kyoto Taikai*, *Torneio Selecionado de 8º Dan de Nagoya* e o *Vídeo Oficial da All Japan Kendo Federation - AJKF*).

### Principais Inovações:
1. **Sincronização Pelo Clímax ($t = 0$):** Em vez de alinhar os vídeos pelo início (onde cada dupla avança em cadências diferentes), a linha do tempo mestre é ancorada no **exato momento do impacto do contragolpe de Shidachi** (*Men-nuki-men*, *Kote-nuki-kote*, *Aiuchi*, etc.). O golpe acontece exatamente no mesmo instante em todos os quadrantes.
2. **Integração Nativa com YouTube (Custo Zero de Hospedagem):** A aplicação web reproduz os vídeos oficiais diretamente do YouTube via **YouTube IFrame API**, sem necessidade de baixar gigabytes nem de pagar por servidores caros de vídeo ou CDN.
3. **Painel Pedagógico Integrado:** Exibição sincronizada das posturas (*Kamae*), técnica de Shidachi, iniciativa tática (*Mitsu no Sen: Sen-sen-no-sen, Sen-no-sen, Go-no-sen*), critérios oficiais de avaliação da AJKF (*Chakuganten*) e advertências de erros frequentes para cada um dos 10 katas.
4. **Mesa de Calibração Integrada:** Interface com atalhos de teclado frame a frame (`S`, `C`, `E`) para marcar ou refinar timestamps de novos vídeos do YouTube sem precisar programar.
5. **Exportador Offline em MP4 (FFmpeg):** Utilitário em Python para renderizar vídeos físicos em matriz 2x2 (1080p a 30fps) para levar em pen drives ou projetores no dojo sem internet.

---

## 🥋 Demonstrações de Referência Catalogadas

| # | Evento / Demonstração | Uchidachi (打太刀) | Shidachi (仕太刀) | Registro Oficial |
|---|----------------------|-------------------|------------------|------------------|
| 1 | **Vídeo Padrão de Instrução AJKF** | Katsunobu Sato (Hanshi 8º Dan) | Tanetoshi Terachi (Hanshi 8º Dan) | [Canal AJKF](https://www.youtube.com/watch?v=QIpPUdTCv-Y) |
| 2 | **73º All Japan Kendo Championship (2025)** | Shinji Funatsu (Hanshi 8º Dan) | Waichiro Kurita (Hanshi 8º Dan) | [Nippon Budokan 2025](https://www.youtube.com/watch?v=K5wtqeIKlIo) |
| 3 | **72º All Japan Kendo Championship (2024)** | Shinji Shimizu (Hanshi 8º Dan) | Shuichi Shimaue (Hanshi 8º Dan) | [Nippon Budokan 2024](https://www.youtube.com/watch?v=3Bf9D5NL1RM) |
| 4 | **71º All Japan Kendo Championship (2023)** | Kiyoichi Shimojima (Hanshi 8º Dan) | Takashi Shigematsu (Hanshi 8º Dan) | [Nippon Budokan 2023](https://www.youtube.com/watch?v=p9SD3EjtwEw) |
| 5 | **70º All Japan Kendo Championship (2022)** | Katsuhiko Tani (Hanshi 8º Dan) | Hayato Matsuda (Hanshi 8º Dan) | [Nippon Budokan 2022](https://www.youtube.com/watch?v=w8z979zqX9s) |
| 6 | **24º All Japan Selected 8-Dan (2026)** | Katsunobu Sato (Hanshi 8º Dan) | Takashi Yamazaki (Hanshi 8º Dan) | [Nagoya 2026](https://www.youtube.com/watch?v=SoDlY0lcPz8) |
| 7 | **20º All Japan Selected 8-Dan (2022)** | Hayato Matsuda (Hanshi 8º Dan) | Yoshimi Higashi (Hanshi 8º Dan) | [Nagoya 2022](https://www.youtube.com/watch?v=z50QPdzbGAs) |
| 8 | **120º Kyoto Taikai (2024)** | Toru Kamei (Hanshi 8º Dan) | Hayato Matsuda (Hanshi 8º Dan) | [Kyoto Butokuden](https://www.youtube.com/watch?v=nz_gnUFsnEE) |

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
* **Node.js** (v18+ recomendado; testado em v24)
* **Python** (v3.10+) com `yt-dlp` e `pytest`

### Instalação e Execução
```bash
# 1. Clonar ou navegar até o repositório
cd "c:/IA/Kendo Kata Comparador"

# 2. Instalar dependências JavaScript
npm install

# 3. Iniciar o servidor de desenvolvimento
npm run dev
```

Abra seu navegador em `http://localhost:3000/`.

---

## 🌐 Como Publicar Gratuitamente no GitHub Pages

A aplicação foi projetada como uma **Single Page Application (SPA) 100% estática**:

```bash
# Compilar bundle estático otimizado
npm run build
```

Os arquivos prontos para publicação estarão na pasta `dist/`. Basta apontar o branch `gh-pages` ou a pasta `dist` no GitHub Pages, Vercel ou Netlify!

---

## ⏱️ Como Usar a Mesa de Calibração (Calibrador Web)

Para adicionar um vídeo novo ou refinar os timestamps existentes:
1. No cabeçalho da aplicação, clique no botão **"⏱️ Calibrador"**.
2. Selecione a demonstração e o Kata desejado.
3. Utilize os atalhos de teclado de alta precisão:
   * **Espaço:** Play / Pausa
   * **J:** Voltar 1 frame / 0.1s
   * **L:** Avançar 1 frame / 0.1s
   * **S:** Gravar **Start** (último frame estável em *Chūdan* a 9 passos)
   * **C:** Gravar **Clímax** (momento exato do contragolpe de Shidachi)
   * **E:** Gravar **End** (conclusão do 5º passo de recuo e retorno ao *Chūdan*)
4. Clique em **"🔄 Testar Loop do Corte"** para conferir a fluidez.
5. Clique em **"📥 Baixar kata_database.json"** para atualizar os dados no repositório.

---

## 📹 Como Gerar Vídeos em Matriz 2x2 Offline (FFmpeg)

Para criar um arquivo de vídeo `.mp4` composto em 1080p para levar ao dojo:

```bash
# Executar plano de renderização para o Kata 1 com as 4 duplas padrão
python pipeline/build_mp4_grid.py --kata 1

# Ou especificar duplas personalizadas
python pipeline/build_mp4_grid.py --kata 3 --videos ajkf_official_standard,73rd_all_japan_2025,72nd_all_japan_2024,24th_8dan_2026
```

Os vídeos resultantes são salvos automaticamente na pasta `output/` (ex: `output/kata_01_ippon-me_grid.mp4`).

---

## 🧪 Suíte de Testes Automatizados

```bash
# Testes unitários do motor de sincronização matemática e integração
npm test

# Testes do schema do banco de dados, cronologia dos timestamps e CLI do FFmpeg
pytest tests/ -v
```

---

## 📄 Licença e Reconhecimentos

Desenvolvido para estudo de Kendo Kata respeitando integralmente as diretrizes técnicas e doutrinárias da **All Japan Kendo Federation (AJKF / 全日本剣道連盟)**. Todos os créditos de transmissão e imagem pertencem aos seus respectivos canais oficiais de Kendo no Japão.
