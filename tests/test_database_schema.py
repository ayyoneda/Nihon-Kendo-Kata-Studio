import json
import os
import pytest

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "kata_database.json")

def test_database_structure_exists():
    assert os.path.exists(DB_PATH), "data/kata_database.json deve existir"
    with open(DB_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    assert "version" in data
    assert "katas_pedagogical" in data
    assert "demonstrations" in data

def test_pedagogical_katas_completeness():
    assert os.path.exists(DB_PATH), "data/kata_database.json deve existir"
    with open(DB_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    pedagogy = data["katas_pedagogical"]
    assert len(pedagogy) == 13, "Devem existir 13 blocos pedagógicos catalogados (10 katas + 3 seções de protocolo/troca)"
    
    sections = [
        "reiho_inicial",
        "kata_01", "kata_02", "kata_03", "kata_04", "kata_05", "kata_06", "kata_07",
        "troca_kodachi",
        "kata_08", "kata_09", "kata_10",
        "reiho_final"
    ]
    for s_id in sections:
        assert s_id in pedagogy, f"{s_id} deve estar presente"
        s = pedagogy[s_id]
        assert "name_romaji" in s
        assert "name_jp" in s
        assert "type" in s
        assert "kamae_uchidachi" in s
        assert "kamae_shidachi" in s
        assert "waza_shidachi" in s
        assert "sen" in s
        assert len(s["chakuganten"]) > 0
        assert len(s["common_mistakes"]) > 0

def test_demonstrations_catalog():
    assert os.path.exists(DB_PATH), "data/kata_database.json deve existir"
    with open(DB_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    demos = data["demonstrations"]
    assert len(demos) >= 4, "Devem existir pelo menos 4 demonstrações no catálogo inicial"
    for demo in demos:
        assert "id" in demo
        assert "title" in demo
        assert "youtube_id" in demo and len(demo["youtube_id"]) == 11
        assert "uchidachi" in demo and "name" in demo["uchidachi"]
        assert "shidachi" in demo and "name" in demo["shidachi"]
        assert "katas" in demo
