#!/usr/bin/env python3
"""
Nihon Kendo Kata Studio - Exportador Offline de Matriz 2x2 com FFmpeg
Sincroniza 4 vídeos de Hanshi 8º Dan alinhados pelo clímax do contragolpe (t = 0)
e gera arquivos MP4 em 1080p (1920x1080).
"""

import argparse
import json
import os
import subprocess
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "kata_database.json")
DEFAULT_OUTPUT_DIR = os.path.join(BASE_DIR, "output")
RAW_VIDEOS_DIR = os.path.join(BASE_DIR, "raw_videos")

def load_database():
    with open(DB_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def get_video_stream_or_file(youtube_id, demo_id):
    """
    Retorna o caminho local se já baixado, ou obtém a URL de stream direta via yt-dlp.
    """
    local_file = os.path.join(RAW_VIDEOS_DIR, f"{demo_id}.mp4")
    if os.path.exists(local_file):
        return local_file

    # Obtém URL direta de streaming 1080p/720p via yt-dlp
    cmd = ["yt-dlp", "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best", "-g", f"https://www.youtube.com/watch?v={youtube_id}"]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, check=True)
        lines = res.stdout.strip().split("\n")
        return lines[0] # Video stream URL
    except Exception as e:
        print(f"[!] Erro ao resolver stream para {youtube_id}: {e}")
        return f"https://www.youtube.com/watch?v={youtube_id}"

def build_grid_plan(kata_num, video_ids, output_path=None, dry_run=False):
    db = load_database()
    if str(kata_num).isdigit():
        kata_id = f"kata_{int(kata_num):02d}"
    else:
        kata_id = str(kata_num).strip()

    if kata_id not in db["katas_pedagogical"]:
        raise ValueError(f"Bloco '{kata_num}' não encontrado no catálogo pedagógico.")

    # Valida demonstrações
    demos = []
    for v_id in video_ids:
        d = next((item for item in db["demonstrations"] if item["id"] == v_id.strip()), None)
        if not d:
            raise ValueError(f"Demonstração '{v_id}' não encontrada no catálogo.")
        demos.append(d)

    if len(demos) != 4:
        raise ValueError("A matriz 2x2 requer exatamente 4 demonstrações.")

    # Calcula alinhamento pelo Clímax
    timings = [d["katas"][kata_id] for d in demos]
    pre_durations = [t["climax"] - t["start"] for t in timings]
    post_durations = [t["end"] - t["climax"] for t in timings]

    max_pre = max(pre_durations)
    max_post = max(post_durations)
    total_duration = max_pre + max_post

    print(f"\n=======================================================")
    print(f"NIHON KENDO KATA STUDIO - EXPORTADOR OFFLINE MP4")
    print(f"=======================================================")
    print(f"Kata: #{kata_num} ({db['katas_pedagogical'][kata_id]['name_romaji']})")
    print(f"Janela Pré-Clímax: {max_pre:.2f}s | Pós-Clímax: {max_post:.2f}s | Duração Total: {total_duration:.2f}s")
    print(f"Alinhamento: Golpe em t = {max_pre:.2f}s em todos os quadrantes")
    print(f"-------------------------------------------------------")

    inputs_info = []
    for i, d in enumerate(demos):
        t = d["katas"][kata_id]
        # Ponto de início absoluto cortado para que o clímax caia exatamente em max_pre
        cut_start = max(0.0, t["climax"] - max_pre)
        masters = f"{d['uchidachi']['name']} x {d['shidachi']['name']}"
        inputs_info.append({
            "slot": i + 1,
            "demo_id": d["id"],
            "title": d["title"],
            "masters": masters,
            "youtube_id": d["youtube_id"],
            "cut_start": cut_start,
            "duration": total_duration
        })
        print(f"Quadrante {i+1}: {d['title']} | Start: {cut_start:.2f}s | Clímax: {t['climax']:.2f}s")

    if not output_path:
        os.makedirs(DEFAULT_OUTPUT_DIR, exist_ok=True)
        output_path = os.path.join(DEFAULT_OUTPUT_DIR, f"{kata_id}_{db['katas_pedagogical'][kata_id]['name_romaji'].lower()}_grid.mp4")

    # Monta comando FFmpeg
    # Layout 2x2 com filtro xstack
    filter_complex = (
        "[0:v]scale=960:540:force_original_aspect_ratio=decrease,pad=960:540:(ow-iw)/2:(oh-ih)/2,drawtext=text='%{title0}':x=20:y=20:fontsize=20:fontcolor=white:box=1:boxcolor=black@0.6[v0];"
        "[1:v]scale=960:540:force_original_aspect_ratio=decrease,pad=960:540:(ow-iw)/2:(oh-ih)/2,drawtext=text='%{title1}':x=20:y=20:fontsize=20:fontcolor=white:box=1:boxcolor=black@0.6[v1];"
        "[2:v]scale=960:540:force_original_aspect_ratio=decrease,pad=960:540:(ow-iw)/2:(oh-ih)/2,drawtext=text='%{title2}':x=20:y=20:fontsize=20:fontcolor=white:box=1:boxcolor=black@0.6[v2];"
        "[3:v]scale=960:540:force_original_aspect_ratio=decrease,pad=960:540:(ow-iw)/2:(oh-ih)/2,drawtext=text='%{title3}':x=20:y=20:fontsize=20:fontcolor=white:box=1:boxcolor=black@0.6[v3];"
        "[v0][v1][v2][v3]xstack=inputs=4:layout=0_0|w0_0|0_h0|w0_h0[outv]"
    )

    for i, info in enumerate(inputs_info):
        filter_complex = filter_complex.replace(f"%{{title{i}}}", f"Q{i+1}: {info['masters']}")

    cmd = ["ffmpeg", "-y"]
    for info in inputs_info:
        # Usa input local ou stream
        cmd.extend(["-ss", f"{info['cut_start']:.2f}", "-t", f"{info['duration']:.2f}", "-i", f"raw_videos/{info['demo_id']}.mp4"])

    cmd.extend([
        "-filter_complex", filter_complex,
        "-map", "[outv]",
        "-map", "0:a?",
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "22",
        "-r", "30",
        "-c:a", "aac",
        "-b:a", "192k",
        output_path
    ])

    print(f"\nPlano de renderizacao gerado com sucesso.")
    print(f"Arquivo de saida previsto: {output_path}")
    print(f"Comando FFmpeg estruturado:\n{' '.join(cmd[:12])} ... -> {output_path}\n")

    if dry_run:
        return True

    # Execução real do FFmpeg se os arquivos existirem
    print("[*] Executando renderização FFmpeg...")
    res = subprocess.run(cmd)
    return res.returncode == 0

def main():
    parser = argparse.ArgumentParser(description="Exportar Matriz 2x2 de Kendo Kata sincronizada no Clímax")
    parser.add_argument("--kata", type=int, default=1, help="Número do Kata (1 a 10)")
    parser.add_argument("--videos", type=str, default="ajkf_official_standard,73rd_all_japan_2025,72nd_all_japan_2024,71st_all_japan_2023",
                        help="Lista separada por vírgula de 4 IDs de demonstração")
    parser.add_argument("--output", type=str, default=None, help="Caminho do arquivo de saída .mp4")
    parser.add_argument("--dry-run", action="store_true", help="Gera e valida o plano de corte e filtros sem executar renderização pesada")

    args = parser.parse_args()
    video_ids = [v.strip() for v in args.videos.split(",") if v.strip()]

    try:
        success = build_grid_plan(args.kata, video_ids, args.output, args.dry_run)
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"[!] Erro: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
