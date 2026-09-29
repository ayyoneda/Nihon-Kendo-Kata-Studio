import json
import os
import pytest

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "kata_database.json")

def test_timestamps_chronological_order():
    with open(DB_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    assert len(data["demonstrations"]) >= 4
    for demo in data["demonstrations"]:
        demo_id = demo["id"]
        assert len(demo.get("katas", {})) == 10, f"{demo_id} deve ter todos os 10 katas cadastrados"
        
        previous_end = 0.0
        for i in range(1, 11):
            kata_id = f"kata_{i:02d}"
            assert kata_id in demo["katas"], f"{demo_id} deve conter {kata_id}"
            timing = demo["katas"][kata_id]
            
            start = timing.get("start")
            climax = timing.get("climax")
            end = timing.get("end")
            
            assert start is not None and climax is not None and end is not None, \
                f"{demo_id} {kata_id} deve possuir start, climax e end"
            assert 0 <= start < climax, f"{demo_id} {kata_id}: start ({start}) deve ser menor que climax ({climax})"
            assert climax < end, f"{demo_id} {kata_id}: climax ({climax}) deve ser menor que end ({end})"
            assert (end - start) >= 12.0, f"{demo_id} {kata_id}: duracao do kata ({end - start}s) deve ser valida (>12s)"
            assert start >= previous_end - 10.0, f"{demo_id} {kata_id}: katas sequenciais devem respeitar a ordem temporal"
            previous_end = end
