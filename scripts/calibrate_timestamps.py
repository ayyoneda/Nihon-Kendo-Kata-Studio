"""
Script de inspeção e calibração de timestamps para Nihon Kendo Kata.
Permite verificar a duração real de um vídeo do YouTube via yt-dlp,
listar capítulos se disponíveis e validar a consistência em data/kata_database.json.
"""

import json
import os
import subprocess
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "kata_database.json")

def load_database():
    with open(DB_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def save_database(data):
    with open(DB_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def inspect_youtube_video(youtube_id):
    """Obtém metadados básicos e capítulos do YouTube usando yt-dlp."""
    cmd = [
        "yt-dlp",
        "--dump-json",
        "--skip-download",
        f"https://www.youtube.com/watch?v={youtube_id}"
    ]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, check=True)
        info = json.loads(res.stdout)
        return {
            "title": info.get("title"),
            "duration": info.get("duration"),
            "chapters": info.get("chapters", [])
        }
    except Exception as e:
        print(f"Erro ao inspecionar {youtube_id}: {e}")
        return None

def validate_all_demonstrations():
    data = load_database()
    print(f"Validando {len(data['demonstrations'])} demonstrações...")
    all_ok = True
    for demo in data["demonstrations"]:
        demo_id = demo["id"]
        katas = demo.get("katas", {})
        if len(katas) != 10:
            print(f"[-] {demo_id}: esperado 10 katas, encontrado {len(katas)}")
            all_ok = False
            continue
        
        for k_id, t in katas.items():
            s, c, e = t["start"], t["climax"], t["end"]
            if not (0 <= s < c < e):
                print(f"[-] {demo_id} {k_id}: timestamps inconsistentes s={s}, c={c}, e={e}")
                all_ok = False
        print(f"[+] {demo_id} ({demo['title']}): 10 katas calibrados com sucesso.")
    return all_ok

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--inspect":
        y_id = sys.argv[2] if len(sys.argv) > 2 else "QIpPUdTCv-Y"
        meta = inspect_youtube_video(y_id)
        print(json.dumps(meta, indent=2, ensure_ascii=False))
    else:
        success = validate_all_demonstrations()
        sys.exit(0 if success else 1)
