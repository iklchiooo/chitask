# 📁 Folder `nav/` — Komponen Navigasi ChiTask

Folder ini berisi semua komponen navigasi yang sudah dipisahkan dari `index.html`.
Setiap file adalah **salinan persis** dari bagian nav di `index.html` — jadi kalau
Anda ingin edit, hapus, atau pahami suatu nav, cukup buka file yang relevan di sini.

---

## Daftar Komponen

| File | ID/Class Utama | Dipakai Di | Fungsi |
|------|---------------|-----------|--------|
| `nav-1-overlays.html` | `#sidebarOverlay` `#moreOverlay` `#morePanel` `#subdrawerOverlay` | Mobile | Layer gelap penutup konten saat panel/sidebar terbuka |
| `nav-2-subdrawer-task.html` | `#subdrawer-task` | Mobile | Panel geser dari tombol **Task** di Bottom Nav |
| `nav-3-subdrawer-keuangan.html` | `#subdrawer-fin` | Mobile | Panel geser dari tombol **Keuangan** di Bottom Nav |
| `nav-4-subdrawer-journal.html` | `#subdrawer-journal` | Mobile | Panel geser dari tombol **Jurnal** di Bottom Nav |
| `nav-5-subdrawer-maintenance.html` | `#subdrawer-maint` | Mobile | Panel geser dari tombol **Maintenance** di Bottom Nav |
| `nav-6-bottom-nav.html` | `#bottomNav` `.bottom-nav` | Mobile | Bar navigasi 4 tombol di bawah layar |
| `nav-7-sidebar.html` | `#sidebar` `.sidebar` | Desktop/Tablet | Sidebar kiri dengan semua section menu |
| `nav-8-topbar.html` | `#topbar` `.topbar` | Mobile | Header atas: logo, back button, judul halaman, action buttons |

---

## Cara Menemukan Nav di `index.html`

Setiap komponen di `index.html` dibungkus dengan marker seperti ini:

```html
<!-- ════════════════════════════════════════════════════════ -->
<!-- KOMPONEN NAV 6: nav/nav-6-bottom-nav.html                -->
<!-- Bottom Nav (mobile): Task | Keuangan | Jurnal | Maint    -->
<!-- ════════════════════════════════════════════════════════ -->

  ... isi nav ...

<!-- /KOMPONEN NAV 6 ════════════════════════════════════════ -->
```

Cukup **Ctrl+F** → ketik `KOMPONEN NAV 6` di editor Anda untuk langsung lompat ke bagian tersebut.

---

## Cara Menghapus Salah Satu Nav

Contoh: ingin **hapus Bottom Nav** (mode desktop-only tanpa nav bawah):

1. Buka `index.html`
2. Ctrl+F → cari `KOMPONEN NAV 6`
3. Hapus semua baris mulai dari:
   ```
   <!-- ════... KOMPONEN NAV 6 ...════ -->
   ```
   sampai:
   ```
   <!-- /KOMPONEN NAV 6 ════... -->
   ```
4. Jika menghapus Bottom Nav, **ikut hapus juga** Sub-drawer (NAV 2–5) karena
   keempatnya dipanggil oleh tombol-tombol di Bottom Nav.
5. Hapus pula **FAB button** (`#fabAdd`) yang ada tepat di bawah Sub-drawer Maintenance.

---

## Dependensi Antar Komponen

```
Bottom Nav (NAV 6)
    ├── toggleSubDrawer('task')     → Sub-drawer Task     (NAV 2)
    ├── toggleSubDrawer('fin')      → Sub-drawer Keuangan (NAV 3)
    ├── toggleSubDrawer('journal')  → Sub-drawer Journal  (NAV 4)
    └── toggleSubDrawer('maint')    → Sub-drawer Maint    (NAV 5)
         semua sub-drawer butuh → Overlay (NAV 1)

Sidebar (NAV 7)
    └── berdiri sendiri, tidak butuh overlay subdrawer
    └── pakai sidebar-overlay (NAV 1) untuk mobile toggle

Topbar (NAV 8)
    └── berdiri sendiri
    └── tombol ☰ memanggil toggleSidebar() → butuh Sidebar (NAV 7)
```

---

## Catatan CSS

Semua style untuk komponen-komponen ini ada di `css/main.css`.
Cari class berikut untuk menemukan style masing-masing:

| Komponen | Class CSS utama |
|----------|----------------|
| Overlays | `.sidebar-overlay` `.more-overlay` `.more-panel` `.subdrawer-overlay` |
| Sub-drawer | `.subdrawer` `.subdrawer-header` `.subdrawer-body` `.subdrawer-grid` `.subdrawer-item` |
| Bottom Nav | `.bottom-nav` `.bn-item` `.bn-ic` `.bn-lbl` `.bn-badge` `.bn-fab-spacer` |
| Sidebar | `.sidebar` `.sidebar-scroll` `.sidebar-brand` `.nav-section` `.nav-group` `.nav-item` `.sidebar-bottom` |
| Topbar | `.topbar` `.topbar-row1` `.topbar-row2` `.topbar-actions` `.mobile-logo` `.mobile-back-btn` `.page-title` |

---

## File Backup

`index.html.bak` — backup `index.html` sebelum pemisahan nav dilakukan.
