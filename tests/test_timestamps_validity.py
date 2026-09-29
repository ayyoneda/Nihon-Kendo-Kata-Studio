import json
import os
import pytest

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "kata_database.json")

def test_timestamps_chronological_order():
    with open(DB_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    assert len(data["demonstrations"]) >= 4
    sections = [
        "reiho_inicial",
        "kata_01", "kata_02", "kata_03", "kata_04", "kata_05", "kata_06", "kata_07",
        "troca_kodachi",
        "kata_08", "kata_09", "kata_10",
        "reiho_final"
    ]
    for demo in data["demonstrations"]:
        demo_id = demo["id"]
        assert len(demo.get("katas", {})) == 13, f"{demo_id} deve ter todos os 13 blocos cadastrados"
        
        previous_end = 0.0
        for s_id in sections:
            assert s_id in demo["katas"], f"{demo_id} deve conter {s_id}"
            timing = demo["katas"][s_id]
            
            start = timing.get("start")
            climax = timing.get("climax")
            end = timing.get("end")
            
            assert start is not None and climax is not None and end is not None, \
                f"{demo_id} {s_id} deve possuir start, climax e end"
            assert 0 <= start < climax, f"{demo_id} {s_id}: start ({start}) deve ser menor que climax ({climax})"
            assert climax < end, f"{demo_id} {s_id}: climax ({climax}) deve ser menor que end ({end})"
            assert (end - start) >= 5.0, f"{demo_id} {s_id}: duracao ({end - start}s) deve ser valida (>5s)"
            assert start >= previous_end - 10.0, f"{demo_id} {s_id}: blocos sequenciais devem respeitar a ordem temporal"
            previous_end = end
