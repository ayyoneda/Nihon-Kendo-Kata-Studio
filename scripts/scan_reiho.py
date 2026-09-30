import os
import subprocess

FFMPEG_PATH = r"C:\Users\adrian.yoneda\AppData\Local\Programs\Python\Python314\Scripts\ffmpeg.exe"
SCRATCH_DIR = r"C:\Users\adrian.yoneda\.gemini\antigravity-ide\brain\9e980e55-fe32-430b-9cde-75208e845010\scratch"
VIDEO_PATH = os.path.join(SCRATCH_DIR, "71st_video_360.mp4")
SCAN_DIR = os.path.join(SCRATCH_DIR, "scan_reiho")
os.makedirs(SCAN_DIR, exist_ok=True)

def scan_range(start_t, end_t, step, prefix):
    t = start_t
    while t <= end_t:
        out_file = os.path.join(SCAN_DIR, f"{prefix}_{t:06.2f}s.jpg")
        cmd = [
            FFMPEG_PATH, "-y",
            "-ss", str(t),
            "-i", VIDEO_PATH,
            "-vframes", "1",
            "-q:v", "3",
            out_file
        ]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        t += step

# Scan do rei ao shomen antes de entrar (10s a 25s)
scan_range(10.0, 26.0, 2.0, "entry_rei")

# Scan do zarei mútuo (60s a 75s)
scan_range(60.0, 75.0, 1.0, "zarei")

# Scan de sonkyo e assunção de chudan para kata 1 (95s a 112s)
scan_range(95.0, 112.0, 1.0, "to_kata1")

print("Scans extracted.")
