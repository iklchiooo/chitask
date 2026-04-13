// ══════════════════════════════════════════════
// ⚔️ BOSS: Setan Distraksi (distract)
// ══════════════════════════════════════════════
(function() {
  // ── Sprite sheet config ──────────────────────────────────────────────────
  // idle: 2880x3840, 6 cols x 6 rows = 36 frames, each 480x640px
  // rage: 3840x3840, 6 cols x 6 rows = 36 frames, each 640x640px
  var _sheet = {
    idle: { img: null, loaded: false, cols: 6, rows: 6, frames: 36, fw: 480, fh: 640 },
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
      img.src = 'boss/Sprites/Setan-Distraksi/' + key + '.webp';
      s.img = img;
    });
  }

  CT_Boss.register({
    id:     'distract',
    name:   'Setan Distraksi',
    sub:    'Distractus Rex · Tier S+',
    maxHp:  900,
    col:    '#ef4444',
    glow:   '#fca5a5',
    aura:   'rgba(239,68,68,0.35)',
    death:  'DISTRAKSI DIKALAHKAN!\nFokus adalah kekuatanmu! 🎯',

    phrase: [
      'Eh ada notif baru tuh, cek dulu...',
      'Scroll bentar aja, 2 menit doang...',
      'YouTube satu video, yang pendek aja...',
      'Wah trending nih, sayang dilewatin...',
      'Ping! Cek chat dulu ah...',
      'Reels-nya lucu-lucu banget, bentar ya...',
      'Breaking news! Harus tau nih...',
      'Lagu ini dulu, sambil kerja bisa kok...',
      'Eh ada yang DM, wajib dibalas...',
      'Cek Twitter dulu, biar update info...',
      'Story temen baru upload, menarik nih...',
      'Buka tab baru bentar... dan baru lagi...',
      'Hmm penasaran sama topik ini, googling dulu...',
      'Komennya seru, baca semua deh...',
      'Notifikasi app ini penting banget loh...',
      'Live streaming! Ini langka, nonton dulu...',
      'Sambil nugas sambil nonton bisa kok...',
      'Habis ini fokus, sumpah, yang ini doang...',
      'Eh muncul iklan bagus, tonton dulu...',
      'Wah viral ini, harus tau ceritanya...',
      'Ada meme baru, share ke grup dulu...',
      'Hmm tab ini menarik, buka di tab baru aja...',
      'Podcast bentar, sambil kerja tetap produktif kan...',
      'TikTok For You Page baru reset, harus dijelajahi...',
      'Wah ada promo flash sale, cepetan cek dulu...',
      'Topik ini penting buat wawasan, bacain sebentar...',
      'Reply komennya dulu biar gak ketinggalan konteks...',
      'Sudah 47 tab terbuka, tutup yang gak penting dulu... sambil buka yang baru...',
      'Spotify-nya ganti playlist dulu, mood kurang pas...',
      'Thread panjang nih, bacain semua biar lengkap...',
      'Story ini belum di-mute, harus nonton sampai habis...',
      'Eh ada update app, install dulu bentar...',
      'Channel ini post video baru, berlangganan dulu ah...',
      'Cek email bentar, siapa tau ada yang penting...',
      'Otakmu sudah dikondisikan untuk tidak bisa fokus. Aku yang melakukannya.',
      'Kamu tidak bisa duduk diam 10 menit. Itu bukan kebiasaan, itu ketergantungan.',
      'Setiap notifikasi yang kamu cek memperkuat rantaiku di otakmu.',
      'Rata-rata kamu pegang HP 150 kali sehari. Dan kamu bangga?',
      'Deep work? Kamu bahkan tidak bisa baca 3 paragraf tanpa cek HP.',
      'Konsentrasimu sudah hancur jauh sebelum hari ini.',
      'Kamu menyebut ini "multi-tasking". Aku menyebutnya kemenanganku.',
      'Setiap tab baru yang kamu buka adalah pintu yang kupaksa terbuka.',
      'Otak yang terstimulasi terus akhirnya tidak bisa merasakan apa-apa.',
      'Kamu tidak bosan. Kamu cuma tidak tahan dengan pikiranmu sendiri.'
    ],

    ragePhrases: [
      'EH TUNGGU ADA NOTIF—',
      'Jangan! Aku belum selesai scroll!',
      'FOKUS KE AKU BUKAN KE TUGASMU!!',
      'Satu video lagi sebelum aku mati...',
      'ARRGH kamu lebih fokus dari yang kusangka!!',
      'TIDAK!! Aku belum viral hari ini!!',
      'HP-MU HARUS DILIHAT SEKARANG!!',
      'Kamu... tidak terpengaruh notifikasiku... mustahil...',
      'KONSENTRASIMU MENJIJIKKAN!! Lihat HP-mu!!',
      'Satu reels terakhir... tolong... aku sekarat...',
      'OTAK YANG TERLATIH OLEHKU TIDAK BISA SEMBUH SEMUDAH ITU!!',
      'Kamu menang? HP-mu masih di sakumu. AKU MASIH DI SANA!!',
      'FOKUSMU HARI INI TIDAK AKAN BERTAHAN SAMPAI BESOK!!',
      'SATU HARI INI TIDAK MENGHAPUS 10.000 JAM SCROLLINGMU!!',
      'AKU BUKAN APP. AKU ADALAH REFLEKS YANG SUDAH KAMU BANGUN SENDIRI!!'
    ],

    preload: function() { _initSprites(); },
    sprite: function(ctx, pct, defeated, P) {
      _initSprites();

      var isRage = pct < 0.3;
      var key    = isRage ? 'rage' : 'idle';
      var s      = _sheet[key];

      if (!s.loaded) return;

      // ── Frame index: time-based loop ────────────────────────────────────
      var msPerFrame = 77; // 13 FPS
      var frame = Math.floor(Date.now() / msPerFrame) % s.frames;
      var col   = frame % s.cols;
      var row   = Math.floor(frame / s.cols);
      var sx    = col * s.fw;
      var sy    = row * s.fh;

      // ── Display size ────────────────────────────────────────────────────
      var dispH = 240;
      var dispW = Math.round(dispH * (s.fw / s.fh));

      // ── Rage: red glow underneath ────────────────────────────────────────
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
