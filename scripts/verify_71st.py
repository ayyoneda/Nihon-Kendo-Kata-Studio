import json

# Tempos determinados para o 71st_all_japan_2023 com base nos frames e áudio:
katas_71st = {
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

# Verificação de continuidade e consistência matemática
keys = list(katas_71st.keys())
print("=== VERIFICAÇÃO DE CONTINUIDADE DO 71º ALL JAPAN ===")
all_ok = True
for i, k in enumerate(keys):
    item = katas_71st[k]
    s, c, e = item["start"], item["climax"], item["end"]
    pre = c - s
    post = e - c
    dur = e - s
    print(f"{k:14s}: {s:6.2f}s -> [Clímax: {c:6.2f}s] -> {e:6.2f}s | Pré: {pre:5.2f}s | Pós: {post:5.2f}s | Dur: {dur:5.2f}s")
    
    if not (s < c < e):
        print(f"  [ERRO] Inconsistência temporal em {k}: start={s}, climax={c}, end={e}")
        all_ok = False
    if i > 0:
        prev_k = keys[i-1]
        prev_end = katas_71st[prev_k]["end"]
        if abs(prev_end - s) > 0.001:
            print(f"  [ERRO] Descontinuidade entre {prev_k} (end={prev_end}) e {k} (start={s})")
            all_ok = False

if all_ok:
    print("\n✅ TODAS AS SEÇÕES ESTÃO PERFEITAMENTE ENCADEADAS E CONSISTENTES!")
