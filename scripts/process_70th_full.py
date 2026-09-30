import os
import sys
import subprocess
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

sys.stdout.reconfigure(encoding='utf-8')

FFMPEG_PATH = r"C:\Users\adrian.yoneda\AppData\Local\Programs\Python\Python314\Scripts\ffmpeg.exe"
SCRATCH_DIR = r"C:\Users\adrian.yoneda\.gemini\antigravity-ide\brain\9e980e55-fe32-430b-9cde-75208e845010\scratch"
VIDEO_ID = "w8z979zqX9s"
VIDEO_FILE = os.path.join(SCRATCH_DIR, f"{VIDEO_ID}_360.mp4")
AUDIO_FILE = os.path.join(SCRATCH_DIR, f"{VIDEO_ID}_audio.wav")
PRECISION_DIR = os.path.join(SCRATCH_DIR, f"{VIDEO_ID}_precision")
os.makedirs(PRECISION_DIR, exist_ok=True)

sr, data = wavfile.read(AUDIO_FILE)
if data.dtype == np.int16:
    data = data.astype(np.float32) / 32768.0

# Filtro vocal
sos = butter(4, [500, 2500], btype='bandpass', fs=sr, output='sos')
filtered = sosfilt(sos, data)
hop = int(sr * 0.01)
win = int(sr * 0.05)
num_frames = (len(filtered) - win) // hop
rms = np.zeros(num_frames)
times = np.zeros(num_frames)
for i in range(num_frames):
    seg = filtered[i*hop : i*hop + win]
    rms[i] = np.sqrt(np.mean(seg**2))
    times[i] = (i * hop + win // 2) / sr

# Definir janelas para os picos de Kiai exatos dos 10 katas
kiai_windows = [
    ("kata_01", 130.0, 145.0),
    ("kata_02", 180.0, 195.0),
    ("kata_03", 215.0, 228.0),
    ("kata_04", 255.0, 268.0),
    ("kata_05", 294.0, 306.0),
    ("kata_06", 325.0, 338.0),
    ("kata_07", 360.0, 372.0),
    ("kata_08", 490.0, 505.0),
    ("kata_09", 522.0, 536.0),
    ("kata_10", 552.0, 566.0),
]

climax_points = {}
for name, w_start, w_end in kiai_windows:
    mask = (times >= w_start) & (times <= w_end)
    w_t = times[mask]
    w_r = rms[mask]
    max_i = np.argmax(w_r)
    climax_points[name] = float(w_t[max_i])
    print(f"Kiai {name}: {climax_points[name]:.2f}s (RMS: {w_r[max_i]:.4f})")

# Função auxiliar para extrair frames
def extract_frame(t, name):
    out = os.path.join(PRECISION_DIR, f"{name}_{t:06.2f}s.jpg")
    cmd = [FFMPEG_PATH, "-y", "-ss", str(t), "-i", VIDEO_FILE, "-vframes", "1", "-q:v", "2", out]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return out

# Extrair frames de validação dos clímax detectados
for name, t_c in climax_points.items():
    extract_frame(t_c, f"climax_{name}")

# Scan de momentos-chave de transição e cerimoniais:
# 1. Ritsurei inicial ao Shomen
for t in np.arange(10.0, 25.0, 1.0):
    extract_frame(t, "00_entry_ritsurei")

# 2. Zarei inicial no tatame
for t in np.arange(48.0, 62.0, 1.0):
    extract_frame(t, "00_zarei_init")

# 3. Transição Reiho Inicial -> Kata 1 (quando assumem chudan a 9 passos)
for t in np.arange(115.0, 132.0, 1.0):
    extract_frame(t, "01_trans_reiho_k1")

# 4. Transição K1 -> K2
for t in np.arange(155.0, 175.0, 1.0):
    extract_frame(t, "02_trans_k1_k2")

# 5. Transição K2 -> K3
for t in np.arange(198.0, 212.0, 1.0):
    extract_frame(t, "03_trans_k2_k3")

# 6. Transição K3 -> K4
for t in np.arange(235.0, 250.0, 1.0):
    extract_frame(t, "04_trans_k3_k4")

# 7. Transição K4 -> K5
for t in np.arange(275.0, 290.0, 1.0):
    extract_frame(t, "05_trans_k4_k5")

# 8. Transição K5 -> K6
for t in np.arange(310.0, 324.0, 1.0):
    extract_frame(t, "06_trans_k5_k6")

# 9. Transição K6 -> K7
for t in np.arange(342.0, 356.0, 1.0):
    extract_frame(t, "07_trans_k6_k7")

# 10. Sonkyo término K7 / Início Troca Kodachi
for t in np.arange(378.0, 395.0, 1.0):
    extract_frame(t, "07_end_sonkyo7")

# 11. Sonkyo com Kodachi (Clímax da troca)
for t in np.arange(455.0, 480.0, 1.0):
    extract_frame(t, "08_troca_kodachi_sonkyo")

# 12. Transição Troca -> Kata 8 (Chudan a 9 passos antes de subir para Jodan)
for t in np.arange(480.0, 495.0, 1.0):
    extract_frame(t, "08_trans_troca_k8")

# 13. Transição K8 -> K9
for t in np.arange(510.0, 524.0, 1.0):
    extract_frame(t, "09_trans_k8_k9")

# 14. Transição K9 -> K10
for t in np.arange(538.0, 552.0, 1.0):
    extract_frame(t, "10_trans_k9_k10")

# 15. Sonkyo término K10 / Início Reiho Final
for t in np.arange(568.0, 582.0, 1.0):
    extract_frame(t, "10_end_sonkyo10")

# 16. Zarei mútuo final no tatame
for t in np.arange(630.0, 660.0, 2.0):
    extract_frame(t, "11_zarei_final")

# 17. Saída e Ritsurei final ao Shomen
for t in np.arange(695.0, 720.0, 2.0):
    extract_frame(t, "11_exit_ritsurei")

print("Processing and frame extraction complete.")
