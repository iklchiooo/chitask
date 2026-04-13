// ══════════════════════════════════════════════
// ⚔️ BOSS: Dewa Burnout (burnout)
// ══════════════════════════════════════════════
(function() {
  // ── Sprite sheet config (closure, bukan this) ────────────────────────────
  // idle: 2328x3180, 6 cols x 6 rows = 36 frames, each 388x530px
  // rage: 3168x3564, 6 cols x 6 rows = 36 frames, each 528x594px
  var _sheet = {
    idle: { img: null, loaded: false, cols: 6, rows: 6, frames: 36, fw: 388, fh: 530 },
    rage: { img: null, loaded: false, cols: 6, rows: 6, frames: 36, fw: 528, fh: 594 }
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
      img.src = 'boss/Sprites/Dewa-Burnout/' + key + '.webp';
      s.img = img;
    });
  }

  CT_Boss.register({
    id:     'burnout',
    name:   'Dewa Burnout',
    sub:    'Exhaustus · Tier SS',
    maxHp:  1200,
    col:    '#f97316',
    glow:   '#fb923c',
    aura:   'rgba(249,115,22,0.35)',
    death:  'BURNOUT DIKALAHKAN!\nKamu lebih kuat dari kelelahan! 🔥',

    phrase: [
      'Kamu sudah terlalu lelah untuk lanjut...',
      'Buat apa kerja keras kalau ujungnya kosong?',
      'Semua task itu menghisap energimu...',
      'Tubuhmu sudah berteriak berhenti, dengerin...',
      'Produktif terus? Sampai kapan kuat?',
      'List-mu tak pernah habis, lelah itu wajar...',
      'Kamu bukan mesin, batas itu nyata...',
      'Sudah berapa lama kamu gak istirahat beneran?',
      'Selesaikan satu, muncul sepuluh yang baru...',
      'Semangat itu bahan bakar yang bisa habis...',
      'Kamu kerja keras tapi hasilnya gak kerasa...',
      'Energimu habis bahkan sebelum hari mulai...',
      'Gak ada yang menghargai usahamu anyway...',
      'Mimpimu terlalu besar buat tenagamu yang tersisa...',
      'Bahkan hobi pun terasa seperti kewajiban...',
      'Kamu lupa kapan terakhir kali benar-benar senang...',
      'Tubuh minta tidur, pikiran gak bisa berhenti...',
      'Semakin keras kamu push, semakin dekat jurangnya...',
      'Ini bukan produktivitas, ini penyiksaan diri...',
      'Resign dari semua... istirahat selamanya bersamaku...',
      'Matamu berat, badanmu berat, segalanya berat...',
      'Tidurmu tidak pernah cukup, dan tidak akan cukup...',
      'Kopi keberapa hari ini? Dan masih capek juga...',
      'Tidak ada finish line, tugasnya tidak pernah selesai...',
      'Kepalamu sudah penuh, tapi list masih panjang...',
      'Kamu kerja keras untuk siapa sebenarnya?',
      'Terakhir kali santai... kapan itu ya?',
      'Tubuhmu sudah kirim sinyal SOS, tapi kamu abaikan...',
      'Passion-mu perlahan jadi beban...',
      'Tidur lebih awal malam ini? Atau begadang lagi?',
      'Productivity hack apapun tidak akan mengisi kosongmu...',
      'Semua orang butuh kamu, tapi siapa yang butuh dirimu sendiri?',
      'Semakin banyak selesai, semakin banyak yang datang...',
      'Istirahat itu bukan kelemahan... tapi kamu gak pernah mau percaya itu...',
      'Kamu bangga kerja keras. Aku bangga melihat kamu hancur perlahan.',
      'Body-mu sudah mati rasa. Kamu tidak sadar itu adalah gejala dariku.',
      'Produktivitas yang kamu banggakan itu dibangun di atas tubuh yang sekarat.',
      'Kamu bukan high performer. Kamu hanya belum kolaps.',
      'Semua orang melihat hasilmu. Hanya aku yang melihat harganya.',
      'Setiap hari kamu push lebih keras, lubangnya semakin dalam.',
      'Tidurmu berkualitas buruk dan kamu tahu itu. Tapi tetap lanjut.',
      'Kamu tidak bisa berhenti karena kamu takut — bukan karena kuat.',
      'Saat kamu akhirnya jatuh, tidak akan ada yang siap menangkap.',
      'Yang kamu sebut "hustle" adalah aku yang sedang membakarmu dari dalam.'
    ],

    ragePhrases: [
      'HAHAHA KAMU PIKIR KAU MENANG?!',
      'CHAOS TIDAK BISA DIKALAHKAN!!',
      'SEMUANYA AKAN BERANTAKAN LAGI!!',
      'RAAAAHHH — KEKACAUAN ABADI!!',
      'AKU AKAN BANGKIT LEBIH KUAT!!!',
      'KAMU BOLEH MENANG HARI INI, TAPI BESOK BURNOUT LAGI!!',
      'ENERGIMU HAMPIR HABIS, AKU TUNGGU DI UJUNG!!',
      'TIDAK ADA YANG BISA ESCAPE DARIKU SELAMANYA!!',
      'TERTAWA DULU, BESOK KAMU KELELAHAN LAGI!!',
      'LIHATLAH MATAMU DI CERMIN... ITU WAJAH YANG HAMPIR MENYERAH!!',
      'SATU HARI INI TIDAK MEMBAYAR HUTANG TIDURMU YANG BERTAHUN-TAHUN!!',
      'KAMU MENANG BATTLE. AKU MASIH MEMENANGKAN PERANG!!',
      'TUBUHMU INGAT SEMUA YANG KAMU LAKUKAN PADANYA. DAN TAGIHAN AKAN DATANG!!',
      'SELAMAT ATAS KEMENANGAN KECILMU. SEKARANG LIHAT TO-DO LIST BESOK.',
      'AKU BUKAN BURNOUT. AKU ADALAH BATAS YANG SELALU KAMU ABAIKAN!!'
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
        dispW = 180; dispH = 180;
      } else {
        dispH = 180; dispW = Math.round(dispH * (s.fw / s.fh)); // ~125px
      }

      // ── Rage: orange/fire glow underneath ──────────────────────────────
      if (isRage) {
        var gAlpha = 0.12 + 0.08 * Math.sin(Date.now() / 280);
        ctx.save();
        ctx.globalAlpha = gAlpha;
        ctx.fillStyle   = '#f97316';
        ctx.shadowColor = '#f97316';
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
