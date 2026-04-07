#!/usr/bin/env python3
"""
bundle_firebase.py
Unduh 5 Firebase compat scripts → gabung jadi firebase-bundle.js
Jalankan sekali saja. Setelah itu firebase-bundle.js sudah lokal.
"""

import urllib.request
import sys
import os

FIREBASE_VER = "9.23.0"
BASE_URL = f"https://www.gstatic.com/firebasejs/{FIREBASE_VER}/"
FALLBACK_URL = f"https://cdn.jsdelivr.net/npm/firebase@{FIREBASE_VER}/compat/"

SCRIPTS = [
    "firebase-app-compat.js",
    "firebase-auth-compat.js",
    "firebase-firestore-compat.js",
    "firebase-storage-compat.js",
    "firebase-messaging-compat.js",
]

OUTPUT = "firebase-bundle.js"

def download(name):
    for base in [BASE_URL, FALLBACK_URL]:
        url = base + name
        try:
            print(f"  ⬇  {url}")
            with urllib.request.urlopen(url, timeout=30) as r:
                data = r.read().decode("utf-8")
            print(f"  ✓  {name} ({len(data)//1024} KB)")
            return data
        except Exception as e:
            print(f"  ✗  {url} — {e}")
    raise RuntimeError(f"Gagal download {name} dari semua CDN")

def main():
    parts = []
    for name in SCRIPTS:
        print(f"\n[{SCRIPTS.index(name)+1}/{len(SCRIPTS)}] {name}")
        code = download(name)
        parts.append(f"/* ── {name} ── */\n{code}\n")

    bundle = "\n".join(parts)
    with open(OUTPUT, "w", encoding="utf-8") as f:
        f.write(bundle)

    size_kb = os.path.getsize(OUTPUT) // 1024
    print(f"\n✅  Bundle selesai: {OUTPUT} ({size_kb} KB)")
    print(f"    Letakkan {OUTPUT} di folder yang sama dengan index.html")

if __name__ == "__main__":
    main()
