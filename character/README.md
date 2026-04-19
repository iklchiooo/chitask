# ChiTask — Character System

## Struktur Folder

```
character/
  jobs/
    normal/         → job starter (unlock by level)
      <job-id>/
        male.webp   → sprite idle versi male   ← WAJIB ADA
        female.webp → sprite idle versi female ← WAJIB ADA
        idle.webp   → fallback lama (masih dipakai jika male/female tidak ada)
    hidden/         → job tersembunyi (unlock by kondisi khusus)
      <job-id>/
        male.webp
        female.webp
        idle.webp
    skills/         → skill sprites per job
```

## Konvensi Sprite

| File          | Keterangan                                    |
|---------------|-----------------------------------------------|
| `male.webp`   | Sprite karakter laki-laki, dipakai saat gender = 'male'   |
| `female.webp` | Sprite karakter perempuan, dipakai saat gender = 'female' |
| `idle.webp`   | Fallback otomatis jika male/female belum ada  |

- Format: **WebP** (wajib, semua sprite pakai .webp)
- Dimensi ideal: 200×320px (portrait, rasio ~2:3)
- Rendering: pixelated (cocok untuk pixel art)

## Gender System

Gender disimpan di `localStorage` key `chitask_char_gender`.

```js
charGender.get()       // → 'male' | 'female'
charGender.set('female')
charGender.toggle()    // ganti male ↔ female, update sprite otomatis
```

Tombol **♂ Male / ♀ Female** tersedia di header card karakter di dashboard.

## Jobs

| ID          | Unlock     | Rarity   |
|-------------|-----------|----------|
| adventurer  | Lv 1      | common   |
| scholar     | Lv 1      | common   |
| warrior     | Lv 3      | common   |
| monk        | Lv 5      | uncommon |
| healer      | Lv 5      | uncommon |
| sage        | Lv 8      | uncommon |
| bard        | Lv 8      | uncommon |
| knight      | Lv 12     | rare     |
| alchemist   | Lv 15     | rare     |
| archmage    | Lv 20     | epic     |
| shadow      | 7 perfect days | hidden |
| sovereign   | Lv 30     | hidden   |

## Menambah Sprite Baru

1. Buat `male.webp` dan `female.webp` di folder job yang sesuai
2. Simpan dalam format WebP, ukuran ideal 200×320px
3. Tidak perlu ubah kode — sistem otomatis pakai file tersebut
