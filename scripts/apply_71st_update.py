import json
import shutil

NEW_71ST_KATAS = {
    "reiho_inicial": {
        "start": 11.50,
        "climax": 65.00,
        "end": 153.00
    },
    "kata_01": {
        "start": 153.00,
        "climax": 162.25,
        "end": 185.00
    },
    "kata_02": {
        "start": 185.00,
        "climax": 195.71,
        "end": 217.50
    },
    "kata_03": {
        "start": 217.50,
        "climax": 237.53,
        "end": 267.50
    },
    "kata_04": {
        "start": 267.50,
        "climax": 283.35,
        "end": 304.50
    },
    "kata_05": {
        "start": 304.50,
        "climax": 318.46,
        "end": 343.50
    },
    "kata_06": {
        "start": 343.50,
        "climax": 361.31,
        "end": 385.50
    },
    "kata_07": {
        "start": 385.50,
        "climax": 398.14,
        "end": 418.00
    },
    "troca_kodachi": {
        "start": 418.00,
        "climax": 482.00,
        "end": 498.50
    },
    "kata_08": {
        "start": 498.50,
        "climax": 509.06,
        "end": 524.50
    },
    "kata_09": {
        "start": 524.50,
        "climax": 550.00,
        "end": 568.00
    },
    "kata_10": {
        "start": 568.00,
        "climax": 584.00,
        "end": 600.00
    },
    "reiho_final": {
        "start": 600.00,
        "climax": 665.00,
        "end": 707.00
    }
}

paths = [
    r"C:\IA\Kendo Kata Comparador\data\kata_database.json",
    r"C:\IA\Kendo Kata Comparador\public\data\kata_database.json"
]

for p in paths:
    with open(p, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    # Encontra a demo do 71st
    for demo in data["demonstrations"]:
        if demo["id"] == "71st_all_japan_2023":
            demo["katas"] = NEW_71ST_KATAS
            print(f"Updated 71st demo in {p}")
            break
            
    with open(p, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

print("Database update complete.")
