// ══════════════════════════════════════════════
// ⚔️ BOSS: Iblis Kemalasan (sloth)
// ══════════════════════════════════════════════
(function() {
  // ── Sprite sheet config (closure, bukan this) ────────────────────────────
  // idle: 2388x3096, 6 cols x 6 rows = 36 frames, each 398x516px
  // rage: 2388x3336, 6 cols x 6 rows = 36 frames, each 398x556px
  var _sheet = {
    idle: { img: null, loaded: false, cols: 6, rows: 6, frames: 36, fw: 398, fh: 516 },
    rage: { img: null, loaded: false, cols: 6, rows: 6, frames: 36, fw: 398, fh: 556 }
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
      img.src = 'boss/Sprites/Iblis-Kemalasan/' + key + '.webp';
      s.img = img;
    });
  }

  CT_Boss.register({
    id:     'sloth',
    name:   'Iblis Kemalasan',
    sub:    'Lord Sloth · Tier S',
    maxHp:  1000,
    col:    '#a855f7',
    glow:   '#c084fc',
    aura:   'rgba(168,85,247,0.35)',
    death:  'KEMALASAN DIKALAHKAN!\nKamu produktif hari ini! 🎉',

    phrase: [
      'Tiduran aja... jauh lebih enak...',
      'Ngapain kerja, rebahan kan bisa...',
      'Kasur itu surgamu, bukan meja kerja...',
      'Produktif itu capek, santai itu surga...',
      'Besok kan masih ada... dan lusa juga...',
      'Matiin alarm dulu, tidur lagi bentar...',
      'To-do list bisa nunggu, bantalmu tidak...',
      'Hari ini skip dulu, nanti pasti mood...',
      'Charging diri dulu... selamanya...',
      'Deadline? Belum urgent kok, santai...',
      'Kenapa berdiri kalau bisa tiduran?',
      'Istirahat dulu, toh belum telat-telat amat...',
      'Mode hibernasi diaktifkan... jangan ganggu...',
      'Nanti kalau mood, baru dikerjain...',
      'Scrolling sambil tiduran itu juga gerak otak...',
      'Hidup bukan lomba, nikmati kasurmu...',
      'Badan ini butuh istirahat... terus menerus...',
      'Kerjaan itu bisa besok, tiduran itu harus sekarang...',
      'Selimut sudah manggil, jangan diabaikan...',
      'Zzzzz... tugasnya lari sendiri nanti...',
      'Alarm ketiga boleh kan? Yang ini yang terakhir...',
      'Otak butuh istirahat, dan istirahat butuh waktu lama...',
      'Kalau capek ya tidur, bukan kerja...',
      'Netflix dulu satu episode, yang 45 menit itu...',
      'Gerak dikit aja udah ngos-ngosan, tanda butuh rebahan...',
      'Misi hari ini: jangan ngapa-ngapain dulu...',
      'Sofa itu udah bentuk badanmu, sayang kalau ditinggal...',
      'Energi terbatas, harus dihemat untuk hal penting... seperti tidur...',
      'Kamu gak malas, kamu cuma sedang mengumpulkan energi... sejak kemarin...',
      'Satu scroll lagi, habis itu tidur... serius...',
      'HP di tangan, mata setengah tutup... kondisi sempurna...',
      'Prokrastinasi bukan kebiasaan, ini gaya hidup...',
      'Dunia masih berputar walau kamu rebahan kok...',
      'Mode hemat energi... permanen...',
      'Kamu gak akan pernah bisa konsisten. Sudah terbukti.',
      'Lihatlah to-do list-mu. Sudah berapa hari itu numpuk?',
      'Tubuhmu lebih jujur darimu — dia selalu memilihku.',
      'Setiap kali kamu "istirahat sebentar", itu adalah aku yang menang.',
      'Kamu bukan malas? Buktikan. Oh tunggu, besok aja...',
      'Bahkan mimpimu pun sudah menyerah sebelum kamu.',
      'Energimu habis sebelum hari mulai. Itu bukan kebetulan.',
      'Kamu tahu apa yang lebih kuat dari niatmu? Kasurmu.',
      'Setiap deadline yang kamu lewatkan adalah kemenanganku.',
      'Aku tidak perlu berjuang. Kamu menyerah sendiri.'
    ],

    ragePhrases: [
      'ZZZ... masih hidup aku...',
      'Kamu ganggu tidurku!!',
      'Aku... akan tidur lagi setelah ini...',
      'JANGAN PAKSA AKU BANGUN!!',
      'Bahkan sekarat pun aku malas gerak...',
      'Ini... tidak adil... aku belum tidur siang...',
      'AARGH... kenapa kamu gak ikut rebahan aja...',
      'Aku bangkit lagi... nanti... mungkin besok...',
      'Kamu... mengganggu jadwal tidurku yang sudah sempurna...',
      'Bahkan untuk marah pun aku... malas...',
      'KAMU MENANG HARI INI. TAPI BESOK PAGI, AKU SUDAH DI SANA.',
      'Selamat. Kamu mengalahkanku sekali. Aku mengalahkanmu 364 hari lainnya.',
      'TIDUR ITU ABADI. PRODUKTIVITASMU SEMENTARA!!',
      'Kamu pikir ini selesai?! Alarm-mu berbunyi 6 jam lagi!!',
      'AKU BUKAN MUSUHMU. AKU ADALAH DIRIMU YANG SEBENARNYA!!'
    ],

    preload: function() { _initSprites(); },
    sprite: function(ctx, pct, defeated, P) {
      _initSprites();

      var isRage = pct < 0.3;
      var key    = isRage ? 'rage' : 'idle';
      var s      = _sheet[key];

      if (!s.loaded) return;

      // ── Frame index: time-based loop ────────────────────────────────────
      // idle: ~130ms per frame (malas, lambat) | rage: ~75ms per frame (panik kebangkitan)
      var msPerFrame = 77; // 13 FPS
      var frame = Math.floor(Date.now() / msPerFrame) % s.frames;
      var col   = frame % s.cols;
      var row   = Math.floor(frame / s.cols);
      var sx    = col * s.fw;
      var sy    = row * s.fh;

      // ── Display size ────────────────────────────────────────────────────
      var dispH = 200;
      var dispW = Math.round(dispH * (s.fw / s.fh));

      // ── Rage: purple glow underneath ────────────────────────────────────
      if (isRage) {
        var gAlpha = 0.12 + 0.08 * Math.sin(Date.now() / 280);
        ctx.save();
        ctx.globalAlpha = gAlpha;
        ctx.fillStyle   = '#a855f7';
        ctx.shadowColor = '#c084fc';
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
