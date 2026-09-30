import os
import sys
import json
import subprocess
import yt_dlp
import numpy as np
from scipy.io import wavfile

sys.stdout.reconfigure(encoding='utf-8')

FFMPEG_PATH = r"C:\Users\adrian.yoneda\AppData\Local\Programs\Python\Python314\Scripts\ffmpeg.exe"
OUTPUT_DIR = r"C:\Users\adrian.yoneda\.gemini\antigravity-ide\brain\9e980e55-fe32-430b-9cde-75208e845010\scratch"
os.makedirs(OUTPUT_DIR, exist_ok=True)

AUDIO_FILE = os.path.join(OUTPUT_DIR, "71st_audio.wav")
VIDEO_ID = "p9SD3EjtwEw"
URL = f"https://www.youtube.com/watch?v={VIDEO_ID}"

def download_audio():
    if os.path.exists(AUDIO_FILE) and os.path.getsize(AUDIO_FILE) > 1000000:
        print(f"Audio already exists: {AUDIO_FILE} ({os.path.getsize(AUDIO_FILE)} bytes)")
        return AUDIO_FILE

    print(f"Extracting stream URL for {VIDEO_ID}...")
    ydl_opts = {
        'format': 'bestaudio/best',
        'quiet': True,
        'no_warnings': True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(URL, download=False)
        stream_url = info['url']
        duration = info.get('duration', 0)
        print(f"Video Title: {info.get('title')}, Duration: {duration}s")

    print(f"Downloading and converting to 16kHz mono WAV using ffmpeg...")
    cmd = [
        FFMPEG_PATH, "-y",
        "-i", stream_url,
        "-ar", "16000",
        "-ac", "1",
        "-vn",
        AUDIO_FILE
    ]
    subprocess.run(cmd, check=True)
    print(f"Downloaded audio to {AUDIO_FILE}")
    return AUDIO_FILE

if __name__ == "__main__":
    download_audio()
