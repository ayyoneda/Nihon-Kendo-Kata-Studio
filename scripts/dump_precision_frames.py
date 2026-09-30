import os
import subprocess
import numpy as np

FFMPEG = r"C:\Users\adrian.yoneda\AppData\Local\Programs\Python\Python314\Scripts\ffmpeg.exe"
SCRATCH_DIR = r"C:\Users\adrian.yoneda\.gemini\antigravity-ide\brain\9e980e55-fe32-430b-9cde-75208e845010\scratch"
VID = os.path.join(SCRATCH_DIR, "71st_video_360.mp4")
PRECISION_DIR = os.path.join(SCRATCH_DIR, "precision_frames")
os.makedirs(PRECISION_DIR, exist_ok=True)

def dump_frames(t_start, t_end, step, prefix):
    t = t_start
    while t <= t_end:
        out = os.path.join(PRECISION_DIR, f"{prefix}_{t:06.2f}s.jpg")
        cmd = [FFMPEG, "-y", "-ss", str(t), "-i", VID, "-vframes", "1", "-q:v", "3", out]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        t += step

# 1. Reiho Inicial:
# Início do Ritsurei inicial ao Shomen na borda da quadra
dump_frames(11.0, 16.0, 0.5, "00_reiho_shomen_rei")
# Zarei mútuo no tatame (ponto mais baixo da reverência)
dump_frames(64.0, 67.0, 0.25, "00_reiho_zarei_climax")
# Término do Reiho / Chudan no Kamae a 9 passos antes de subir para Jodan no Kata 1
dump_frames(140.0, 155.0, 1.0, "01_trans_kata1")

# Kata 1 Clímax (Men-nuki-men)
dump_frames(161.5, 163.5, 0.25, "01_climax_k1")
# Transição Kata 1 -> Kata 2 (retorno ao centro em Chudan)
dump_frames(178.0, 188.0, 1.0, "02_trans_k1_k2")

# Kata 2 Clímax (Kote-nuki-kote)
dump_frames(194.5, 196.5, 0.25, "02_climax_k2")
# Transição Kata 2 -> Kata 3
dump_frames(210.0, 222.0, 1.0, "03_trans_k2_k3")

# Kata 3 Clímax (Nayashi-tsuki)
dump_frames(236.5, 238.5, 0.25, "03_climax_k3")
# Transição Kata 3 -> Kata 4
dump_frames(262.0, 274.0, 1.0, "04_trans_k3_k4")

# Kata 4 Clímax (Maki-kaeshi-men)
dump_frames(282.5, 284.5, 0.25, "04_climax_k4")
# Transição Kata 4 -> Kata 5
dump_frames(300.0, 310.0, 1.0, "05_trans_k4_k5")

# Kata 5 Clímax (Men-suriage-men)
dump_frames(317.5, 319.5, 0.25, "05_climax_k5")
# Transição Kata 5 -> Kata 6
dump_frames(338.0, 348.0, 1.0, "06_trans_k5_k6")

# Kata 6 Clímax (Kote-suriage-kote)
dump_frames(360.5, 362.5, 0.25, "06_climax_k6")
# Transição Kata 6 -> Kata 7
dump_frames(378.0, 388.0, 1.0, "07_trans_k6_k7")

# Kata 7 Clímax (Do-nuki-do)
dump_frames(397.0, 399.0, 0.25, "07_climax_k7")
# Kata 7 End = Sonkyo ao término do 7o
dump_frames(408.0, 418.0, 1.0, "07_end_sonkyo")

# Troca Kodachi:
# Clímax = Sonkyo com a Kodachi
dump_frames(475.0, 488.0, 1.0, "08_troca_kodachi_sonkyo")
# Fim da troca = Chudan no kamae com Kodachi antes de iniciar o Kata 8
dump_frames(492.0, 502.0, 1.0, "08_trans_troca_k8")

# Kata 8 Clímax
dump_frames(508.0, 510.5, 0.25, "08_climax_k8")
# Transição Kata 8 -> Kata 9
dump_frames(520.0, 528.0, 1.0, "09_trans_k8_k9")

# Kata 9 Clímax (procurar o corte de Kodachi 2)
dump_frames(530.0, 540.0, 0.5, "09_scan_climax_k9")
# Transição Kata 9 -> Kata 10
dump_frames(540.0, 546.0, 0.5, "10_trans_k9_k10")

# Kata 10 Clímax
dump_frames(548.0, 550.5, 0.25, "10_climax_k10")
# Kata 10 End = Sonkyo ao término do 10o
dump_frames(556.0, 566.0, 1.0, "10_end_sonkyo")

# Reiho Final:
# Zarei mútuo de encerramento
dump_frames(600.0, 615.0, 1.0, "11_reiho_final_zarei")
# Saída: último rei lado a lado para o Shomen
dump_frames(700.0, 725.0, 2.0, "11_reiho_final_exit")

print("Dump finished successfully.")
