import os
import sys
import subprocess
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, find_peaks

sys.stdout.reconfigure(encoding='utf-8')

FFMPEG_PATH = r"C:\Users\adrian.yoneda\AppData\Local\Programs\Python\Python314\Scripts\ffmpeg.exe"
SCRATCH_DIR = r"C:\Users\adrian.yoneda\.gemini\antigravity-ide\brain\9e980e55-fe32-430b-9cde-75208e845010\scratch"
VIDEO_ID = "w8z979zqX9s"
VIDEO_FILE = os.path.join(SCRATCH_DIR, f"{VIDEO_ID}_360.mp4")
AUDIO_FILE = os.path.join(SCRATCH_DIR, f"{VIDEO_ID}_audio.wav")
FRAMES_DIR = os.path.join(SCRATCH_DIR, f"{VIDEO_ID}_frames")
os.makedirs(FRAMES_DIR, exist_ok=True)

sr, data = wavfile.read(AUDIO_FILE)
if data.dtype == np.int16:
    data = data.astype(np.float32) / 32768.0

duration = len(data) / sr
print(f"70th Video Duration: {duration:.2f}s")

# Filtro vocal para kiai (500Hz - 2500Hz)
sos = butter(4, [500, 2500], btype='bandpass', fs=sr, output='sos')
filtered = sosfilt(sos, data)

hop = int(sr * 0.01) # 10ms
win = int(sr * 0.05) # 50ms
num_frames = (len(filtered) - win) // hop
rms = np.zeros(num_frames)
times = np.zeros(num_frames)
for i in range(num_frames):
    seg = filtered[i*hop : i*hop + win]
    rms[i] = np.sqrt(np.mean(seg**2))
    times[i] = (i * hop + win // 2) / sr

# Picos gerais de áudio
threshold = np.percentile(rms, 93)
peaks, props = find_peaks(rms, height=threshold, distance=int(3.0 / 0.01))
print("\nPicos expressivos de áudio (kiai / impacto):")
for p, h in zip(times[peaks], props['peak_heights']):
    print(f"  t = {p:6.2f}s | RMS = {h:.4f}")

# Extrai frames para inspeção visual dos momentos cruciais
def extract_frame(t, name):
    out = os.path.join(FRAMES_DIR, f"{name}_{t:06.2f}s.jpg")
    cmd = [FFMPEG_PATH, "-y", "-ss", str(t), "-i", VIDEO_FILE, "-vframes", "1", "-q:v", "2", out]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return out

# Scan inicial de 10s a 30s (entrada e ritsurei ao shomen)
for t in np.arange(10.0, 30.0, 2.0):
    extract_frame(t, "scan_entry")

# Scan de Zarei inicial de 45s a 70s
for t in np.arange(45.0, 70.0, 2.0):
    extract_frame(t, "scan_zarei_init")

print("Frames extracted.")
