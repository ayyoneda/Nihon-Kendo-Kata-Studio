import os
import sys
import subprocess
import yt_dlp
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

sys.stdout.reconfigure(encoding='utf-8')

FFMPEG_PATH = r"C:\Users\adrian.yoneda\AppData\Local\Programs\Python\Python314\Scripts\ffmpeg.exe"
SCRATCH_DIR = r"C:\Users\adrian.yoneda\.gemini\antigravity-ide\brain\9e980e55-fe32-430b-9cde-75208e845010\scratch"
VIDEO_ID = "w8z979zqX9s"
VIDEO_FILE = os.path.join(SCRATCH_DIR, f"{VIDEO_ID}_360.mp4")
AUDIO_FILE = os.path.join(SCRATCH_DIR, f"{VIDEO_ID}_audio.wav")
FRAMES_DIR = os.path.join(SCRATCH_DIR, f"{VIDEO_ID}_frames")
os.makedirs(FRAMES_DIR, exist_ok=True)

def download_media():
    url = f"https://www.youtube.com/watch?v={VIDEO_ID}"
    if not os.path.exists(VIDEO_FILE):
        print(f"Downloading video {VIDEO_ID} 360p...")
        ydl_opts = {
            'format': '134/worst[ext=mp4]/worst',
            'outtmpl': VIDEO_FILE,
            'quiet': True
        }
        yt_dlp.YoutubeDL(ydl_opts).download([url])
        print("Video downloaded.")

    if not os.path.exists(AUDIO_FILE):
        print(f"Extracting 16kHz mono audio...")
        cmd = [
            FFMPEG_PATH, "-y",
            "-i", VIDEO_FILE,
            "-ar", "16000",
            "-ac", "1",
            "-vn",
            AUDIO_FILE
        ]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print("Audio extracted.")

if __name__ == "__main__":
    download_media()
