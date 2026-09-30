import os
import sys
import subprocess
import numpy as np
from scipy.io import wavfile

sys.stdout.reconfigure(encoding='utf-8')

FFMPEG_PATH = r"C:\Users\adrian.yoneda\AppData\Local\Programs\Python\Python314\Scripts\ffmpeg.exe"
SCRATCH_DIR = r"C:\Users\adrian.yoneda\.gemini\antigravity-ide\brain\9e980e55-fe32-430b-9cde-75208e845010\scratch"
VIDEO_PATH = os.path.join(SCRATCH_DIR, "71st_video_360.mp4")
FRAMES_DIR = os.path.join(SCRATCH_DIR, "inspect_frames")
os.makedirs(FRAMES_DIR, exist_ok=True)

def extract_frame(time_sec, label):
    out_file = os.path.join(FRAMES_DIR, f"{label}_{time_sec:.2f}s.jpg")
    cmd = [
        FFMPEG_PATH, "-y",
        "-ss", str(time_sec),
        "-i", VIDEO_PATH,
        "-vframes", "1",
        "-q:v", "2",
        out_file
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return out_file

# Vamos inspecionar os candidatos a clímax e limites
test_points = [
    # Reiho inicial
    ("reiho_shomen_rei", 25.0),
    ("reiho_shomen_rei", 28.0),
    ("reiho_shomen_rei", 32.0),
    ("reiho_zarei_climax", 55.0),
    ("reiho_zarei_climax", 59.0),
    ("reiho_zarei_climax", 62.0),
    ("reiho_end_chudan", 100.0),
    ("reiho_end_chudan", 105.0),
    ("reiho_end_chudan", 110.0),
    
    # Kata 1
    ("kata01_climax", 111.1),
    ("kata01_climax", 114.1),
    ("kata01_end", 130.0),
    ("kata01_end", 135.0),

    # Kata 2
    ("kata02_climax", 158.0),
    ("kata02_climax", 162.3),
    ("kata02_end", 175.0),

    # Kata 3
    ("kata03_climax", 195.7),
    ("kata03_end", 215.0),

    # Kata 4
    ("kata04_climax", 237.6),
    ("kata04_end", 255.0),

    # Kata 5
    ("kata05_climax", 283.3),
    ("kata05_end", 300.0),

    # Kata 6
    ("kata06_climax", 318.5),
    ("kata06_end", 335.0),

    # Kata 7
    ("kata07_climax", 361.3),
    ("kata07_end_sonkyo", 375.0),
    ("kata07_end_sonkyo", 380.0),

    # Troca Kodachi
    ("troca_recuo", 390.0),
    ("troca_pegar_kodachi", 420.0),
    ("troca_sonkyo_climax", 450.0),
    ("troca_sonkyo_climax", 465.0),
    ("troca_end_chudan", 480.0),

    # Kata 8
    ("kata08_climax", 509.0),
    ("kata08_end", 520.0),

    # Kata 9
    ("kata09_climax", 527.4),
    ("kata09_end", 538.0),

    # Kata 10
    ("kata10_climax", 548.9),
    ("kata10_end_sonkyo", 565.0),

    # Reiho final
    ("reiho_final_zarei_climax", 600.0),
    ("reiho_final_zarei_climax", 610.0),
    ("reiho_final_exit_rei", 690.0),
    ("reiho_final_exit_rei", 710.0),
    ("reiho_final_exit_rei", 725.0)
]

for label, t in test_points:
    path = extract_frame(t, label)
    print(f"Frame extracted: {t:.2f}s -> {path}")
