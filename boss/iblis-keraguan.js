// ══════════════════════════════════════════════
// ⚔️ BOSS: Iblis Keraguan (doubt)
// ══════════════════════════════════════════════
(function() {
  // ── Sprite sheet config (closure, bukan this) ────────────────────────────
  // idle: 1956x2964, 6 cols x 6 rows = 36 frames, each 326x494px
  // rage: 3840x3840, 6 cols x 6 rows = 36 frames, each 640x640px
  var _sheet = {
    idle: { img: null, loaded: false, cols: 6, rows: 6, frames: 36, fw: 326, fh: 494 },
    rage: { img: null, loaded: false, cols: 6, rows: 6, frames: 36, fw: 640, fh: 640 }
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
      img.src = 'boss/Sprites/Iblis-Keraguan/' + key + '.webp';
      s.img = img;
    });
  }

  CT_Boss.register({
    id:     'doubt',
    name:   'Iblis Keraguan',
    sub:    'Doubticus · Tier A+',
    maxHp:  750,
    col:    '#94a3b8',
    glow:   '#cbd5e1',
    aura:   'rgba(148,163,184,0.30)',
    death:  'KERAGUAN DIKALAHKAN!\nPercaya pada dirimu! 💪',

    phrase: [
      'Kamu pasti gagal, percuma dicoba...',
      'Orang lain jauh lebih pintar dari kamu...',
      'Siapa kamu buat ngelakuin ini?',
      'Nanti dihina kalau hasilnya jelek...',
      'Kamu gak cukup berbakat untuk ini...',
      'Udah telat, orang lain udah jauh di depan...',
      'Usahamu pasti sia-sia akhirnya...',
      'Mimpimu kegedean, realistis dong...',
      'Kalau gagal, semua orang ketawa...',
      'Kamu belum siap, jangan dipaksain...',
      'Pernah gagal sebelumnya, kenapa beda sekarang?',
      'Lebih aman gak coba daripada malu...',
      'Kamu cuma buang waktu dan tenaga...',
      'Standarmu gak akan pernah tercapai...',
      'Yang lain bisa karena mereka berbeda dari kamu...',
      'Harapan itu hanya untuk orang terpilih...',
      'Jangan terlalu tinggi, sakit kalau jatuh...',
      'Bahkan kamu sendiri tidak percaya diri kan?',
      'Untuk apa kerja keras kalau hasil belum pasti?',
      'Keraguan ini ada karena kamu tau batasmu...',
      'Seberapa yakin kamu ini akan berhasil?',
      'Semua orang sudah maju, kamu masih di sini...',
      'Kamu cuma beruntung sejauh ini, habis itu...',
      'Bahkan idemu sendiri kamu gak yakini...',
      'Suara kecil di kepalamu itu benar adanya...',
      'Siap gagal lagi? Karena itu yang akan terjadi...',
      'Kamu terlalu biasa-biasa saja untuk ini...',
      'Orang lain punya versi lebih baik dari idemu...',
      'Kalau kamu bagus, kenapa belum berhasil?',
      'Percaya diri itu mewah yang tidak kamu miliki...',
      'Satu langkah salah dan semuanya runtuh...',
      'Kamu takut, dan itu masuk akal...',
      'Berapa kali lagi kamu mau coba hal yang sama?',
      'Hati kecilmu tahu kamu belum cukup baik...',
      'Kamu bukan underdog. Kamu hanya belum cukup.',
      'Orang-orang yang berhasil tidak punya keraguan sepertimu.',
      'Setiap kesempatan yang lewat karena kamu takut — itu aku yang menang.',
      'Kamu bisa saja berhasil. Tapi lebih mungkin tidak.',
      'Imposter syndrome-mu bukan perasaan. Itu intuisi.',
      'Lihat di sekelilingmu. Mereka semua melangkah maju. Kamu?',
      'Kepercayaan dirimu itu konstruksi rapuh yang aku bisa hancurkan kapan saja.',
      'Kamu tidak takut gagal. Kamu takut terbukti tidak layak.',
      'Setiap kali kamu mundur, aku semakin dalam merasuki pikiranmu.',
      'Satu feedback negatif dan seluruh bangunan kepercayaan dirimu runtuh.'
    ],

    ragePhrases: [
      'K-kamu... tidak seharusnya bisa sampai sini...',
      'Tapi... tapi kamu pasti tetap gagal...',
      'TIDAK MUNGKIN!!! Kamu lemah!!',
      'Keberanian palsu tidak akan menyelamatkanmu!',
      'Aku masih meragukan segalanya tentangmu...',
      'BAGAIMANA?! Orang sepertimu tidak seharusnya menang!!',
      'Ini keberuntungan... bukan kemampuanmu...',
      'Kamu... kamu berani... tapi itu tidak cukup!!',
      'IMPOSTOR!! Kamu hanya pura-pura bisa!!',
      'Bahkan kalahku pun kamu ragukan sendiri kan?!',
      'SELAMAT. TAPI DEEP DOWN KAMU TIDAK PERCAYA KAMU LAYAK MENANG!!',
      'Besok keraguan itu kembali. Lebih kuat dari sebelumnya.',
      'SATU KEMENANGAN TIDAK MENGUBAH SIAPA DIRIMU SEBENARNYA!!',
      'Kamu menang atas aku. Tapi kamu belum menang atas dirimu sendiri.',
      'AKU BUKAN SUARAMU. AKU ADALAH BAGIAN DARIMU YANG TIDAK BISA DIHILANGKAN!!'
    ],

    preload: function() { _initSprites(); },
    sprite: function(ctx, pct, defeated, P) {
      _initSprites();

      var isRage = pct < 0.3;
      var key    = isRage ? 'rage' : 'idle';
      var s      = _sheet[key];

      if (!s.loaded) return;

      // ── Frame index: time-based loop ────────────────────────────────────
      // idle: ~120ms per frame | rage: ~70ms per frame (lebih cepat/intens)
      var msPerFrame = 77; // 13 FPS
      var frame = Math.floor(Date.now() / msPerFrame) % s.frames;
      var col   = frame % s.cols;
      var row   = Math.floor(frame / s.cols);
      var sx    = col * s.fw;
      var sy    = row * s.fh;

      // ── Display size ────────────────────────────────────────────────────
      var dispW, dispH;
      if (isRage) {
        dispW = 270; dispH = 270;
      } else {
        dispH = 180; dispW = Math.round(dispH * (s.fw / s.fh)); // ~119px
      }

      // ── Rage: red glow underneath ───────────────────────────────────────
      if (isRage) {
        var gAlpha = 0.12 + 0.08 * Math.sin(Date.now() / 280);
        ctx.save();
        ctx.globalAlpha = gAlpha;
        ctx.fillStyle   = '#ef4444';
        ctx.shadowColor = '#ef4444';
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
