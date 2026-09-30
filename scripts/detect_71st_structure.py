import os
import sys
import json
import subprocess
import numpy as np
from scipy.io import wavfile
from scipy.signal import find_peaks

sys.stdout.reconfigure(encoding='utf-8')

FFMPEG_PATH = r"C:\Users\adrian.yoneda\AppData\Local\Programs\Python\Python314\Scripts\ffmpeg.exe"
SCRATCH_DIR = r"C:\Users\adrian.yoneda\.gemini\antigravity-ide\brain\9e980e55-fe32-430b-9cde-75208e845010\scratch"
AUDIO_FILE = os.path.join(SCRATCH_DIR, "71st_audio.wav")
VIDEO_ID = "p9SD3EjtwEw"

def analyze_audio():
    sr, data = wavfile.read(AUDIO_FILE)
    if data.dtype == np.int16:
        data = data.astype(np.float32) / 32768.0
    
    duration = len(data) / sr
    print(f"Sample rate: {sr}, Duration: {duration:.2f}s")

    # Calcula envelope RMS em janelas de 100ms com salto de 20ms
    hop = int(sr * 0.02)
    win = int(sr * 0.10)
    num_frames = (len(data) - win) // hop
    
    rms = np.zeros(num_frames)
    times = np.zeros(num_frames)
    for i in range(num_frames):
        seg = data[i*hop : i*hop + win]
        rms[i] = np.sqrt(np.mean(seg**2))
        times[i] = (i * hop + win // 2) / sr

    # Picos expressivos de áudio (kiai / aplausos / impacto)
    threshold = np.percentile(rms, 92)
    peaks, props = find_peaks(rms, height=threshold, distance=int(3.0 / 0.02)) # distância mínima 3s
    
    print(f"\nDetectados {len(peaks)} picos sonoros expressivos:")
    peak_times = times[peaks]
    peak_heights = props['peak_heights']
    for t, h in zip(peak_times, peak_heights):
        print(f"t = {t:6.2f}s | RMS = {h:.4f}")

    return times, rms, peak_times

if __name__ == "__main__":
    analyze_audio()
