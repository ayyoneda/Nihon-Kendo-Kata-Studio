import os
import subprocess
import numpy as np
from scipy.io import wavfile

FFMPEG_PATH = r"C:\Users\adrian.yoneda\AppData\Local\Programs\Python\Python314\Scripts\ffmpeg.exe"
SCRATCH_DIR = r"C:\Users\adrian.yoneda\.gemini\antigravity-ide\brain\9e980e55-fe32-430b-9cde-75208e845010\scratch"
AUDIO_FILE = os.path.join(SCRATCH_DIR, "71st_audio.wav")
VIDEO_PATH = os.path.join(SCRATCH_DIR, "71st_video_360.mp4")
KATAS_DIR = os.path.join(SCRATCH_DIR, "katas_detail")
os.makedirs(KATAS_DIR, exist_ok=True)

sr, data = wavfile.read(AUDIO_FILE)
if data.dtype == np.int16:
    data = data.astype(np.float32) / 32768.0

# Bandpass simples ou filtro para destacar frequências vocais de kiai (500Hz - 2000Hz)
from scipy.signal import butter, sosfilt
sos = butter(4, [500, 2500], btype='bandpass', fs=sr, output='sos')
filtered_data = sosfilt(sos, data)

hop = int(sr * 0.01) # 10ms
win = int(sr * 0.05) # 50ms
num_frames = (len(filtered_data) - win) // hop
rms = np.zeros(num_frames)
times = np.zeros(num_frames)
for i in range(num_frames):
    seg = filtered_data[i*hop : i*hop + win]
    rms[i] = np.sqrt(np.mean(seg**2))
    times[i] = (i * hop + win // 2) / sr

# Definimos janelas de busca para cada kata com base nos picos preliminares
search_windows = [
    ("kata_01", 140.0, 165.0),
    ("kata_02", 185.0, 205.0),
    ("kata_03", 225.0, 245.0),
    ("kata_04", 270.0, 295.0),
    ("kata_05", 305.0, 325.0),
    ("kata_06", 350.0, 370.0),
    ("kata_07", 385.0, 410.0),
    ("kata_08", 495.0, 520.0),
    ("kata_09", 520.0, 535.0),
    ("kata_10", 540.0, 558.0),
]

print("Buscando picos de Kiai em cada janela de Kata:")
detected_climax = {}
for name, t_min, t_max in search_windows:
    mask = (times >= t_min) & (times <= t_max)
    w_times = times[mask]
    w_rms = rms[mask]
    if len(w_rms) == 0:
        continue
    # Encontra os maiores picos
    max_idx = np.argmax(w_rms)
    peak_t = w_times[max_idx]
    detected_climax[name] = peak_t
    print(f"{name}: Peak RMS at t = {peak_t:.2f}s (RMS = {w_rms[max_idx]:.4f})")
    
    # Extrai frame exatamente nesse instante e 0.5s antes/depois
    for dt in [-0.5, 0.0, 0.5]:
        out_f = os.path.join(KATAS_DIR, f"{name}_{peak_t+dt:.2f}s.jpg")
        cmd = [
            FFMPEG_PATH, "-y",
            "-ss", str(peak_t + dt),
            "-i", VIDEO_PATH,
            "-vframes", "1",
            "-q:v", "2",
            out_f
        ]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

