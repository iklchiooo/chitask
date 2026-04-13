// ══════════════════════════════════════════════
// ⚔️ BOSS: Hantu Penunda (procras)
// ══════════════════════════════════════════════
(function() {
  // ── Sprite sheet config ──────────────────────────────────────────────────
  // idle: 2652x3156, 6 cols x 6 rows = 36 frames, each 442x526px
  // rage: 2892x2868, 6 cols x 6 rows = 36 frames, each 482x478px
  var _sheet = {
    idle: { img: null, loaded: false, cols: 6, rows: 6, frames: 36, fw: 442, fh: 526 },
    rage: { img: null, loaded: false, cols: 6, rows: 6, frames: 36, fw: 482, fh: 478 }
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
      img.src = 'boss/Sprites/Hantu-Penunda/' + key + '.webp';
      s.img = img;
    });
  }

  CT_Boss.register({
    id:     'procras',
    name:   'Hantu Penunda',
    sub:    'Procrastinatus · Tier A',
    maxHp:  800,
    col:    '#38bdf8',
    glow:   '#7dd3fc',
    aura:   'rgba(56,189,248,0.30)',
    death:  'PENUNDAAN DIKALAHKAN!\nMulai sekarang, bukan nanti! ⚡',

    phrase: [
      'Nanti aja kalau udah siap...',
      '5 menit lagi, serius ini yang terakhir...',
      'Tunggu mood datang dulu...',
      'Mulai pas jam bulat aja, biar rapi...',
      'Abis episode ini, janji deh...',
      'Bentar lagi... bentar lagi... bentar...',
      'Deadline masih jauh kok, santai dulu...',
      'Kalau udah perfect, baru mulai...',
      'Nunggu inspirasi datang dulu...',
      'Besok pagi fresh, pasti lebih produktif...',
      'Habis makan siang deh, biar kenyang dulu...',
      'Minggu ini penuh, minggu depan fix mulai...',
      'Belum riset cukup, jangan buru-buru...',
      'Tunggu kondisi ideal dulu baru gerak...',
      'Nanti kalau udah tenang pikirannya...',
      'Masih ada waktu, jangan panik dulu...',
      'Plan dulu yang mateng, baru eksekusi...',
      'Satu notif lagi, habis itu langsung kerja...',
      'Hari ini warm up aja, besok baru gas...',
      'Eh bentar, ada yang lebih penting dulu...',
      'Buka dokumennya dulu... lalu tutup lagi...',
      'Nanti kalau cuaca mendukung, baru mulai...',
      'Habis ngopi dulu biar otak nyala...',
      'Meja berantakan, beresin dulu baru fokus...',
      'Timer pomodoro disiapkan dulu... nanti dijalanin...',
      'Kerjain besok pagi aja, pasti lebih jernih...',
      'Masih 3 hari lagi, santai... 2 hari lagi... 1 hari...',
      'Nunggu teman online dulu biar bisa diskusi...',
      'Playlist harus pas dulu baru bisa konsentrasi...',
      'Draft dulu di kepala, nanti baru tulis...',
      'Buka laptop dulu... loading dulu... bentar ya...',
      'Sebentar lagi midnight, lebih produktif nanti...',
      'Tunggu dulu, lagi cari motivasi yang tepat...',
      'Keburu basi kalau dikerjain sekarang, nanti aja...',
      'Kamu sudah menunda ini berapa minggu? Aku tahu jawabannya.',
      'Kondisi ideal tidak akan pernah datang. Tapi kamu tetap menunggu.',
      'Setiap "nanti" yang kamu ucapkan memperdalamku di dalam dirimu.',
      'Orang-orang yang kamu kagumi tidak menunggu mood. Tapi kamu bukan mereka.',
      'Mimpimu punya expiry date. Dan kamu sedang membuang waktunya.',
      'Bukan kamu yang sibuk. Itu aku yang menguasaimu.',
      'Berapa impian yang sudah mati karena "nanti"-mu?',
      'Kamu master of planning. Dan slave of execution.',
      'Waktu tidak menunggu. Tapi kamu pikir waktu bisa ditunda juga.',
      'Satu tahun lagi, kamu masih akan bilang "masih ada waktu".'
    ],

    ragePhrases: [
      'B-bentar... aku belum siap mati...',
      'TIDAK!! Masih ada yang ditunda!',
      'Tunggu... aku mau mati besok aja...',
      'Hp ku tinggal dikit, nanti aja mikirnya...',
      'JANGAN SEKARANG, belum mood!!',
      'Aku... belum sempat menunda yang terakhir...',
      'TIDAK FAIR!! Kamu mulai lebih awal dari jadwal!!',
      'Satu kesempatan lagi... besok... pliss...',
      'Aku belum siap mati, masih ada yang mau ditunda...',
      'Kenapa sekarang?! Kan bisa nanti!!',
      'KAMU TIDAK AKAN KONSISTEN!! INI HANYA KEBETULAN!!',
      'Minggu depan kamu akan kembali padaku, aku jaminkan.',
      'SELAMAT MENANG HARI INI. BESOK SNOOZE LAGI SEPERTI BIASA!!',
      'Satu hari produktif tidak menghapus berbulan-bulan penundaanmu!!',
      'AKU ADALAH DEFAULTMU. PRODUKTIF ADALAH PENGECUALIANMU!!'
    ],

    preload: function() { _initSprites(); },
    sprite: function(ctx, pct, defeated, P) {
      _initSprites();

      var isRage = pct < 0.3;
      var key    = isRage ? 'rage' : 'idle';
      var s      = _sheet[key];

      if (!s.loaded) return;

      // ── Frame index: time-based loop ────────────────────────────────────
      // idle: ~125ms per frame (mengambang, lambat) | rage: ~75ms per frame
      var msPerFrame = 77; // 13 FPS
      var frame = Math.floor(Date.now() / msPerFrame) % s.frames;
      var col   = frame % s.cols;
      var row   = Math.floor(frame / s.cols);
      var sx    = col * s.fw;
      var sy    = row * s.fh;

      // ── Display size ────────────────────────────────────────────────────
      var dispH = 180;
      var dispW = Math.round(dispH * (s.fw / s.fh));

      // ── Rage: blue glow underneath ───────────────────────────────────────
      if (isRage) {
        var gAlpha = 0.12 + 0.08 * Math.sin(Date.now() / 280);
        ctx.save();
        ctx.globalAlpha = gAlpha;
        ctx.fillStyle   = '#38bdf8';
        ctx.shadowColor = '#7dd3fc';
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
