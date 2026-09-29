# OBJETIVO PRINCIPAL
Criar um pipeline automatizado para baixar 4 vídeos de demonstrações oficiais de Nihon Kendo Kata (YouTube), identificar os pontos exatos de início e fim de cada um dos 10 Katas por visão computacional/análise multimodal, e gerar 10 vídeos comparativos em matriz 2x2 (4 quadrantes), um para cada kata.

---

### ENTRADAS (URLs de Referência)
Substitua ou use as seguintes URLs de demonstrações oficiais (Hanshi 8º Dan):
- VIDEO_1: "<URL_YOUTUBE_1>" # Ex: Abertura All Japan 8-Dan Championship
- VIDEO_2: "<URL_YOUTUBE_2>" # Ex: Abertura All Japan Championship (Nippon Budokan)
- VIDEO_3: "<URL_YOUTUBE_3>" # Ex: Kyoto Taikai Butokuden
- VIDEO_4: "<URL_YOUTUBE_4>" # Ex: Demonstração AJKF

---

### CRITÉRIOS RÍGIDOS DE RECORTE (REGRAS DE DOMÍNIO DE KENDO)
Para cada um dos 10 Katas (Kata 1 a 7 Tachi-no-Kata; Kata 8 a 10 Kodachi-no-Kata), identifique os timestamps com precisão de frações de segundo segundo as regras oficiais da AJKF:

1. PONTO DE INÍCIO (Start Timestamp):
   - Ocorre quando Uchidachi e Shidachi estão posicionados à distância canônica de 9 passos (kyū-ho no ma-ai), ambos estabilizados em Chūdan-no-kamae.
   - O marco temporal exato é o ÚLTIMO FRAME em Chūdan, IMEDIATAMENTE ANTES de qualquer um dos praticantes iniciar o movimento corporal de transição para o Kamae específico do Kata (ex: subida para Jōdan no Ipponme, Chūdan sustentado com avanço no Nihonme, descida para Gedan no Sanbonme, etc.).

2. PONTO DE TÉRMINO (End Timestamp):
   - Ocorre após o clímax da técnica e a demonstração completa de Zanshin.
   - Os praticantes recuam os 5 passos para trás (go-ho sagaru) partindo do centro e retornam à distância de 9 passos.
   - O marco temporal exato é quando ambos completam o 5º passo para trás, estabilizam a postura e voltam a ponta do shinai/bokuto em Chūdan-no-kamae frente a frente (antes de baixar as espadas em sage-to ou transicionar para o próximo kata).

---

### FLUXO DE EXECUÇÃO ESPERADO DO AGENTE

#### Fase 1: Ambiente e Ingestão
1. Verifique se yt-dlp e ffmpeg estão disponíveis no ambiente. Se não estiverem, instale-os.
2. Crie uma pasta workspace/raw_videos/.
3. Baixe os 4 vídeos em resolução 1080p (formato MP4) utilizando yt-dlp.

#### Fase 2: Análise Multimodal e Criação dos Metadados
1. Inspecione visualmente cada vídeo baixado aplicando rigorosamente as regras de início e fim descritas acima.
2. Extraia os timestamps de início e término (start_time e end_time em formato HH:MM:SS.mmm) para os 10 Katas de cada uma das 4 duplas.
3. Gere um arquivo de artefato workspace/kata_timestamps.json estruturado no formato:
   {
     "kata_01": {
       "dupla_1": {"start": "00:01:23.400", "end": "00:01:52.100"},
       "dupla_2": {"start": "00:02:05.150", "end": "00:02:33.800"},
       "dupla_3": {"start": "00:00:58.000", "end": "00:01:26.500"},
       "dupla_4": {"start": "00:03:10.200", "end": "00:03:39.000"}
     },
     ...
     "kata_10": { ... }
   }
4. Pausa para Verificação: Exiba a tabela de timestamps consolidada em um Artifact Markdown para conferência visual rápida antes de iniciar a renderização massiva.

#### Fase 3: Processamento e Montagem dos Quadrantes (FFmpeg)
1. Crie um script de automação (build_grids.py) para processar os 10 katas em lote.
2. Para cada kata (de 1 a 10):
   - Extraia o trecho de cada uma das 4 duplas a partir do arquivo JSON gerado.
   - Aplique normalização de resolução: dimensione cada quadrante para exatamente 960x540 pixels (usando: scale=960:540:force_original_aspect_ratio=decrease,pad=960:540:(ow-iw)/2:(oh-ih)/2).
   - Insira uma legenda discreta no canto superior de cada quadrante identificando a fonte (ex: "Dupla 1 - Hanshi 8º Dan", "Dupla 2", etc.).
   - Sincronize a taxa de quadros (fps=30).
   - Use o filtro xstack para compor o layout 2x2 final (1920x1080):
     * Superior Esquerdo: Dupla 1 (coordenada 0_0)
     * Superior Direito: Dupla 2 (coordenada w0_0)
     * Inferior Esquerdo: Dupla 3 (coordenada 0_h0)
     * Inferior Direito: Dupla 4 (coordenada w0_h0)
   - Configuração de áudio: Mantenha apenas a faixa de áudio da Dupla 1 ou mute todas as faixas (-an) para evitar sobreposição simultânea de kiais.
3. Salve os vídeos resultantes na pasta workspace/output_grids/ nomeados sequencialmente:
   - kata_01_ipponme_grid.mp4
   - kata_02_nihonme_grid.mp4
   ...
   - kata_10_kodachi_sanbonme_grid.mp4

---

### REQUISITOS DE ENTREGA
1. Arquivo workspace/kata_timestamps.json preenchido e verificado.
2. Script build_grids.py documentado e testado.
3. Os 10 vídeos MP4 renderizados e prontos para reprodução comparativa.