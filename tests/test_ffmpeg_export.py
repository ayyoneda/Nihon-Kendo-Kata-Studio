import subprocess
import sys
import os
import pytest

SCRIPT_PATH = os.path.join(os.path.dirname(__file__), "..", "pipeline", "build_mp4_grid.py")

def test_build_mp4_grid_help_cli():
    cmd = [sys.executable, SCRIPT_PATH, "--help"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    assert result.returncode == 0, f"Script deve rodar com --help com sucesso. Erro: {result.stderr}"
    assert "--kata" in result.stdout
    assert "--videos" in result.stdout
    assert "--output" in result.stdout

def test_build_mp4_grid_dry_run_validation():
    cmd = [
        sys.executable, SCRIPT_PATH,
        "--kata", "1",
        "--videos", "ajkf_official_standard,73rd_all_japan_2025,72nd_all_japan_2024,71st_all_japan_2023",
        "--dry-run"
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    assert result.returncode == 0, f"Dry-run deve validar comandos sem erro: {result.stderr}"
    assert "Plano de renderizacao gerado com sucesso" in result.stdout or "ffmpeg" in result.stdout
