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
    assert len(pedagogy) == 10, "Devem existir exatamente 10 katas catalogados"
    
    for i in range(1, 11):
        kata_id = f"kata_{i:02d}"
        assert kata_id in pedagogy, f"{kata_id} deve estar presente"
        kata = pedagogy[kata_id]
        assert "name_romaji" in kata
        assert "name_jp" in kata
        assert "type" in kata
        assert "kamae_uchidachi" in kata
        assert "kamae_shidachi" in kata
        assert "waza_shidachi" in kata
        assert "sen" in kata
        assert len(kata["chakuganten"]) > 0
        assert len(kata["common_mistakes"]) > 0

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
