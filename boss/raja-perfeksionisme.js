// ══════════════════════════════════════════════
// ⚔️ BOSS: Raja Perfeksionisme (perfectus)
// ══════════════════════════════════════════════
(function() {
  // ── Sprite sheet config ──────────────────────────────────────────────────
  // idle: 2976x3000, 6 cols x 6 rows = 36 frames, each 496x500px
  // rage: 3540x2556, 6 cols x 6 rows = 36 frames, each 590x426px
  var _sheet = {
    idle: { img: null, loaded: false, cols: 6, rows: 6, frames: 36, fw: 496, fh: 500 },
    rage: { img: null, loaded: false, cols: 6, rows: 6, frames: 36, fw: 590, fh: 426 }
  };
  var _inited = false;

  function _initSprites() {
    if (_inited) return;
    _inited = true;
    ['idle', 'rage'].forEach(function(key) {
      var s = _sheet[key];
      var img = new Image();
      img.onload  = function() { s.loaded = true; };
      img.onerror = function() { console.warn('[CT_Boss] Sprite load failed:', key); };
      img.src = 'boss/Sprites/Raja Perfeksionis/' + key + '.webp';
      s.img = img;
    });
  }

  CT_Boss.register({
    id:     'perfectus',
    name:   'Raja Perfeksionisme',
    sub:    'Perfectus Never-Done · Tier A',
    maxHp:  750,
    col:    '#f59e0b',
    glow:   '#fcd34d',
    aura:   'rgba(245,158,11,0.30)',
    death:  'PERFEKSIONISME DIKALAHKAN!\nDone is better than perfect! 👑',

    phrase: [
      'Masih kurang sempurna, benerin dulu...',
      'Font-nya nggak konsisten, ulangi dari awal...',
      'Udah bagus, tapi... bisa lebih bagus lagi...',
      'Kalau mau submit, harus 100% dulu...',
      'Spacing-nya meleset 2px, nggak bisa dibiarkan...',
      'Wording-nya kurang elegan, revisi dulu...',
      'Belum siap dipresentasikan, masih ada celah...',
      'Orang lain bakal notice kalau nggak sempurna...',
      'Satu kesalahan kecil bisa merusak semuanya...',
      'Standardku tinggi, jadi butuh waktu lebih...',
      'Kalau kerja, ya harus bener. Nggak ada kompromi...',
      'Revisi sekali lagi, yang ini yang terakhir janji...',
      'Detail kecil ini yang bikin bedanya...',
      'Nggak mau namaku melekat di hasil yang biasa-biasa...',
      'Tunggu dulu, ada yang mengganjal di bagian ini...',
      'Coba kita polish lagi dari awal, biar lebih crisp...',
      'Feedback orang itu penting, harus sempurna dulu...',
      'Kalau nggak bagus, lebih baik nggak usah dikerjain...',
      'Sekali lagi... sekali lagi... hampir sempurna...',
      'Nggak ada yang namanya cukup baik kalau bisa lebih baik...',
      'Warna ini kurang tepat, cari hex code yang lebih akurat...',
      'Kalimat ini bisa lebih powerful, tulis ulang...',
      'Margin kiri dan kanan harus presisi, cek lagi...',
      'Draft ketiga masih kurang, coba draft keempat...',
      'Orang-orang cerdas akan tau kekurangannya...',
      'Submit sekarang berarti memalukan diri sendiri...',
      'Sedikit lagi... sudah lama bilang sedikit lagi...',
      'Template ini kurang profesional, cari yang lebih baik...',
      'Kalau belum bisa bangga, belum boleh publish...',
      'Ini 99%... tapi 99% bukan 100%...',
      'Nggak ada kata done sebelum benar-benar selesai...',
      'Versi ini bagus, tapi versi besok pasti lebih bagus...',
      'Typo satu huruf bisa hancurkan reputasi...',
      'Standar rendah adalah musuh terbesar kreativitas...',
      'Kamu sudah berapa lama di fase "hampir selesai" ini?',
      'Pekerjaan yang tidak sempurna lebih baik tidak ada sama sekali.',
      'Orang lain sudah ship 10 project selagi kamu masih di revisi pertama.',
      'Kamu bukan perfeksionis. Kamu hanya takut dihakimi.',
      'Setiap jam yang kamu habiskan untuk "polish" adalah jam yang dicuri dari eksekusi.',
      'Standarmu yang tinggi itu bukan kekuatan. Itu penjaramu.',
      'Tidak ada yang akan ingat usahamu. Mereka hanya melihat hasilnya.',
      'Kamu sudah revisi 12 kali. Tapi masih belum selesai juga.',
      'Sempurna adalah ilusi yang aku gunakan untuk melumpuhkanmu.',
      'Saat kamu sibuk menyempurnakan, orang lain sudah mengambil spotmu.'
    ],

    ragePhrases: [
      'I-ini nggak sempurna... aku nggak bisa mati seperti ini!!',
      'TIDAK!! Ada yang belum direvisi!!',
      'Kekalahan ini... cacat... tidak bisa diterima!!',
      'Tunggu!! Posisi jatuhku nggak estetik!!',
      'MUSTAHIL!! Aku yang paling sempurna di sini!!',
      'CARA MENGALAHKANKU PUN NGGAK SEMPURNA!!',
      'Ini tidak bisa... kemenangan ini ada cacatnya!!',
      'AKU AKAN REVISI KEKALAHANKU INI!!',
      'Bahkan HP-ku saat sekarat pun harus pixel perfect!!',
      'NGGAK FAIR!! Kamu menang dengan cara yang tidak elegan!!',
      'KAMU BISA KALAHKAN AKU TAPI TIDAK BISA KALAHKAN STANDARMU SENDIRI!!',
      'BESOK KAMU AKAN MELIHAT KARYAMU DAN BILANG "KURANG BAGUS"!!',
      'AKU MATI TAPI STANDAR IMPOSSIBLEMU TETAP HIDUP!!',
      'SELAMAT SHIP. SEKARANG TUNGGU ANXIETY-MU TENTANG HASILNYA.',
      'DONE IS BETTER THAN PERFECT? BOHONG. KAMU TIDAK AKAN PERNAH PERCAYA ITU!!'
    ],

    preload: function() { _initSprites(); },
    sprite: function(ctx, pct, defeated, P) {
      _initSprites();

      var isRage = pct < 0.3;
      var key    = isRage ? 'rage' : 'idle';
      var s      = _sheet[key];

      if (!s.loaded) return;

      // ── Frame index: time-based loop ────────────────────────────────────
      // idle: ~115ms per frame (anggun, presisi) | rage: ~65ms per frame
      var msPerFrame = 77; // 13 FPS
      var frame = Math.floor(Date.now() / msPerFrame) % s.frames;
      var col   = frame % s.cols;
      var row   = Math.floor(frame / s.cols);
      var sx    = col * s.fw;
      var sy    = row * s.fh;

      // ── Display size ────────────────────────────────────────────────────
      var dispH = 150;
      var dispW = Math.round(dispH * (s.fw / s.fh));

      // ── Rage: gold/amber glow underneath ────────────────────────────────
      if (isRage) {
        var gAlpha = 0.12 + 0.08 * Math.sin(Date.now() / 280);
        ctx.save();
        ctx.globalAlpha = gAlpha;
        ctx.fillStyle   = '#f59e0b';
        ctx.shadowColor = '#fcd34d';
        ctx.shadowBlur  = 28;
        ctx.beginPath();
        ctx.ellipse(0, 10, 55, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ── Draw frame, centered on canvas origin ───────────────────────────
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        s.img,
        sx, sy, s.fw, s.fh,
        -dispW / 2, -dispH / 2, dispW, dispH
      );
      ctx.restore();
    }
  });
})();
