// ══════════════════════════════════════════════
// 🍀 BOSS: Lucky Amstow (lucky)
// Kemungkinan muncul: 3%
// Mekanisme: Selesaikan task → dia MAKAN (nyam nyam), bukan diserang
// Menang (kenyang) → dapat 1 item toko gratis selama 14 hari
// ══════════════════════════════════════════════
(function() {
  // ── Sprite sheet config ──────────────────────────────────────────────────
  // idle:  2940x3144, 6 cols x 6 rows = 36 frames, each 490x524px
  // happy: 3204x3636, 6 cols x 6 rows = 36 frames, each 534x606px
  // feed:  3840x3096, 6 cols x 6 rows = 36 frames, each 640x516px
  var _sheet = {
    idle:  { img: null, loaded: false, cols: 6, rows: 6, frames: 36, fw: 490, fh: 524 },
    happy: { img: null, loaded: false, cols: 6, rows: 6, frames: 36, fw: 534, fh: 606 },
    feed:  { img: null, loaded: false, cols: 6, rows: 6, frames: 36, fw: 640, fh: 516 }
  };
  var _inited = false;

  function _initSprites() {
    if (_inited) return;
    _inited = true;
    ['idle', 'happy', 'feed'].forEach(function(key) {
      var s = _sheet[key];
      var img = new Image();
      img.onload  = function() { s.loaded = true; };
      img.onerror = function() { console.warn('[CT_Boss] Sprite load failed:', key); };
      img.src = 'boss/Sprites/Lucky-Hamster/' + key + '.webp';
      s.img = img;
    });
  }

  CT_Boss.register({
    id:     'lucky',
    name:   'Lucky Amstow',
    sub:    'Hamster Langka · 3% Chance',
    maxHp:  500,
    col:    '#facc15',
    glow:   '#fde68a',
    aura:   'rgba(250,204,21,0.30)',
    death:  'LUCKY AMSTOW KENYANG!\nKamu sangat beruntung hari ini! 🍀',

    phrase: [
      'Nyam... tugasmu terlihat lezat...',
      'Hmm... aku lapar, kerjakan tugasmu!',
      'Perutku keroncongan... cepat selesaikan!',
      'Kamu beruntung bertemu aku hari ini...',
      'Aku hanya muncul 3%... istimewa kan?',
      'Berikan aku makanan (task selesai)!',
      'Keberuntunganmu dimulai hari ini...',
      'Nyam nyam... masih kurang kenyang...',
      'Aku membawa keberuntungan bagimu!',
      'Selesaikan tugasmu, beri aku makan!',
      'Clover berdaun 4 membawa hoki...',
      'Hari ini hari terbaikmu, aku jaminkan!',
      'Perutku berbunyi... task selesai, yuk!',
      'Rezekimu mengalir deras hari ini...',
      'Aku hamster paling langka di sini...',
      'Makananku adalah productivitasmu!',
      'Nyam... satu task lagi, satu suap lagi...',
      'Kamu 97% lebih beruntung dari orang lain hari ini!',
      'Jangan sia-siakan keberuntungan ini!',
      'Aku menunggu tugasmu selesai... nyam!',
      'Bulu ekorku bergetar... pertanda tugasmu mau selesai...',
      'Hamster wheel-ku sudah berputar untukmu!',
      'Hari ini aura hoki-mu sangat kuat, sayang dilewatin...',
      'Cuciku tadi pagi pakai shampo keberuntungan...',
      'Kantong pipiku penuh harapan untukmu!',
      'Setiap task yang selesai = satu biji sunflower untukku!',
      'Aku sudah titip doa di lubang hamsterku buat kamu...',
      'Rezeki nomplok sedang dalam perjalanan menuju kamu...',
      'Kamu hari ini spesial, bahkan aku yang bilang!',
      'Pipimu penuh semangat ya... atau itu cuma aku?',
      'Satu task selesai, satu bintang keberuntungan aktif...',
      'Aku sudah lama nunggu kamu datang hari ini!',
      'Productivitasmu adalah makananku, dan aku SANGAT lapar...',
      'Keberuntungan itu seperti makanan, harus diambil saat ada...',
      'Kamu tahu berapa banyak orang yang mau di posisimu sekarang? Hargai itu.',
      'Keberuntungan tidak mengetuk dua kali. Aku sudah di sini. Gerak.',
      'Aku muncul 3% dari waktu. Kamu mau sia-siakan ini?!',
      'Setiap menit yang terbuang adalah hoki yang kamu buang sendiri.',
      'Orang lain sedang berdoa agar seberuntung kamu hari ini.',
      'Jangan buat aku menyesal sudah memilih kamu.',
      'Aku bisa pergi dan tidak kembali. Kamu mau ambil risiko itu?',
      'Perutku berbunyi keras — itu tandanya kamu HARUS selesaikan tugasmu sekarang.',
      'Jangan buang keberuntungan langka ini untuk hal yang tidak penting.',
      'Aku sudah datang jauh-jauh. Jangan mengecewakan aku.'
    ],

    ragePhrases: [
      'PERUTKU KERONCONGAN!! CEPAT!!',
      'AKU HAMPIR KENYANG!! SATU LAGI!!',
      'NYAM NYAM NYAM!! LEBIH CEPAT!!',
      'KEBERUNTUNGANMU HAMPIR PENUH!!',
      'SATU SUAP LAGI... AKU HAMPIR PUAS!!',
      'AAAA PERUT LUCKY MAU MELEDAK KARENA SEMANGAT!!',
      'JANGAN BERHENTI!! AKU BELUM KENYANG!!',
      'TUBUHKU GEMETAR KARENA LAPAR DAN HOKI!!',
      'KAMU LUAR BIASA!! BERI AKU SATU TASK LAGI!!',
      'NYAM NYAM NYAM NYAM NYAM NYAM!!',
      'KAMU MENGECEWAKAN HAMSTER PALING LANGKA DI DUNIA INI!!',
      'SETELAH SEMUA HOKI YANG KU BERI, INI YANG KAMU LAKUKAN?!',
      'AKU DATANG 3% DAN KAMU MENYIA-NYIAKANNYA!! TAK TERMAAFKAN!!',
      'PERUTKU SUDAH MENJERIT SEJAK TADI!! KAPAN KAU SELESAI?!',
      'KALAU AKU LAPAR BEGINI LAGI, AKU TIDAK AKAN KEMBALI UNTUK WAKTU YANG LAMA!!'
    ],

    preload: function() { _initSprites(); },
    sprite: function(ctx, pct, defeated, P) {
      _initSprites();

      // ── State selection ──────────────────────────────────────────────────
      // idle  → default menunggu
      // feed  → saat task diselesaikan (bossState._luckyEating = true)
      // happy → saat HP ≤ 30% atau defeated
      // Setelah feed selesai, kembali ke state sebelumnya (_luckyPrevState)
      var bs      = (typeof bossState !== 'undefined') ? bossState : {};
      var eating  = !!bs._luckyEating;
      var isHappy = pct < 0.3 || defeated;
      var key;
      if (eating) {
        key = 'feed';
      } else if (bs._luckyPrevState) {
        key = bs._luckyPrevState; // kembali ke idle/happy setelah feed
      } else {
        key = isHappy ? 'happy' : 'idle';
      }
      var s   = _sheet[key];

      if (!s.loaded) return;

      // ── Frame index: time-based loop ────────────────────────────────────
      // idle:  ~130ms (santai nunggu)
      // feed:  ~80ms  (lahap makan)
      // happy: ~90ms  (girang kenyang)
      var msPerFrame = 77; // 13 FPS
      var frame = Math.floor(Date.now() / msPerFrame) % s.frames;
      var col   = frame % s.cols;
      var row   = Math.floor(frame / s.cols);
      var sx    = col * s.fw;
      var sy    = row * s.fh;

      // ── Display size ────────────────────────────────────────────────────
      var dispH = 180;
      var dispW = Math.round(dispH * (s.fw / s.fh));

      // ── Happy/kenyang: golden glow underneath ────────────────────────────
      if (isHappy) {
        var gAlpha = 0.15 + 0.10 * Math.sin(Date.now() / 250);
        ctx.save();
        ctx.globalAlpha = gAlpha;
        ctx.fillStyle   = '#facc15';
        ctx.shadowColor = '#fde68a';
        ctx.shadowBlur  = 32;
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
