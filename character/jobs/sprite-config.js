/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║            SPRITE CONFIG — ChiTask Character System             ║
 * ║  Edit file ini untuk kustomisasi sprite sheet per job.          ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * ── CARA MENGATUR UKURAN SPRITE ──────────────────────────────────────
 *
 *  A) GLOBAL (berlaku semua job yang tidak punya override):
 *     Ubah SPRITE_DISPLAY_SIZE di bawah ini.
 *     Contoh: { w: 138, h: 142 }
 *
 *  B) PER-JOB / PER-GENDER (override khusus):
 *     Ubah displayW / displayH di config job yang diinginkan.
 *     Nilai null  → otomatis pakai SPRITE_DISPLAY_SIZE global.
 *     Nilai angka → ukuran khusus job tersebut (px).
 *
 *     Contoh mengubah ukuran Warrior male menjadi 170×175px:
 *       Warrior: {
 *         male: { ..., displayW: 170, displayH: 175 },
 *         ...
 *       }
 *
 *  C) DEBUG — jalankan di browser console untuk cek ukuran aktif:
 *     CT_SpriteConfig.debug('Warrior', 'male')
 */

// ─────────────────────────────────────────────────────────────────────────────
//  ★ UKURAN GLOBAL — Ukuran ini adalah ukuran LAPTOP (baseline).
//    JS akan menyesuaikan otomatis ke desktop/mobile via getResponsiveSize().
//    Untuk override per-job gunakan displayW/displayH di SPRITE_CONFIGS.
// ─────────────────────────────────────────────────────────────────────────────
var SPRITE_DISPLAY_SIZE = {
  w: 138,  // lebar baseline (laptop/tablet ~768-1023px)
  h: 142   // tinggi baseline
};

/**
 * Baca ukuran responsif dari CSS custom properties (--sprite-w / --sprite-h).
 * Fallback ke SPRITE_DISPLAY_SIZE jika CSS var belum tersedia.
 * Ini memastikan JS selalu sinkron dengan breakpoint CSS.
 */
function getResponsiveSize() {
  var root = document.documentElement;
  var cs = window.getComputedStyle(root);
  var wStr = cs.getPropertyValue('--sprite-w').trim();
  var hStr = cs.getPropertyValue('--sprite-h').trim();
  var w = wStr ? parseInt(wStr, 10) : 0;
  var h = hStr ? parseInt(hStr, 10) : 0;
  // Fallback: baca dari breakpoint window width jika CSS var tidak tersedia
  if (!w || !h) {
    var vw = window.innerWidth;
    if (vw >= 1024) { w = 172; h = 177; }       // desktop
    else if (vw <= 700) { w = 110; h = 113; }    // mobile
    else { w = SPRITE_DISPLAY_SIZE.w; h = SPRITE_DISPLAY_SIZE.h; } // laptop/tablet
  }
  return { w: w, h: h };
}

// ─────────────────────────────────────────────────────────────────────────────
//  DEFAULT CONFIG
// ─────────────────────────────────────────────────────────────────────────────
var SPRITE_DEFAULT = {
  cols       : 6,
  rows       : 6,
  frameCount : 36,
  fps        : 12,
  frameW     : 194,
  frameH     : 200,
  displayW   : null,   // null = pakai SPRITE_DISPLAY_SIZE global (160×238)
  displayH   : null,
  pickerW    : null,
  pickerH    : null,
  isStatic   : false
};

// ─────────────────────────────────────────────────────────────────────────────
//  PER-JOB CONFIG
//  → Ubah displayW / displayH untuk mengatur ukuran sprite per job & gender.
//  → null  = pakai ukuran global SPRITE_DISPLAY_SIZE (138×142)
//  → angka = ukuran khusus dalam px
// ─────────────────────────────────────────────────────────────────────────────
var SPRITE_CONFIGS = {
  // ── SLYTHERIN (paid avatar) ──────────────────────────────────────────────
  'Slytherin_Char1': {
    male:   { cols: 6, rows: 6, frameCount: 36, fps: 12, frameW: 194, frameH: 200, displayW: 170, displayH: 195 },
    female: { cols: 6, rows: 6, frameCount: 36, fps: 12, frameW: 194, frameH: 200, displayW: 155, displayH: 185 }
  },

  // ── Novice ───────────────────────────────────────────────────────────
  Novice: {
    male:   { cols: 6, rows: 6, frameCount: 36, fps: 12, frameW: 194, frameH: 200, displayW: 170, displayH: 180 },
    female: { cols: 6, rows: 6, frameCount: 36, fps: 17, frameW: 194, frameH: 200, displayW: 150, displayH: 185 }
  },

  // ── Hunter ──────────────────────────────────────────────────────────────
  Hunter: {
    male:   { cols: 6, rows: 6, frameCount: 36, fps: 12, frameW: 194, frameH: 200, displayW: 187, displayH: 185 },
    female: { cols: 6, rows: 6, frameCount: 36, fps: 12, frameW: 194, frameH: 200, displayW: 157, displayH: 185 }
  },

  // ── Warrior ──────────────────────────────────────────────────────────────
  Warrior: {
    male:   { cols: 6, rows: 6, frameCount: 36, fps: 12, frameW: 194, frameH: 200, displayW: 170, displayH: 185 },
    female: { cols: 6, rows: 6, frameCount: 36, fps: 12, frameW: 194, frameH: 200, displayW: 170, displayH: 185 }
  },

    // ── KNIGHT ─────────────────────────────────────────────────────────────
  knight: {
    male:   { cols: 6, rows: 6, frameCount: 36, fps: 12, frameW: 194, frameH: 200, displayW: 170, displayH: 185 },
    female: { cols: 6, rows: 6, frameCount: 36, fps: 12, frameW: 194, frameH: 200, displayW: 170, displayH: 185 }
  },

    // ── PALADIN ──────────────────────────────────────────────────────────────
  paladin: {
    male:   { cols: 6, rows: 6, frameCount: 36, fps: 12, frameW: 194, frameH: 200, displayW: 170, displayH: 185 },
    female: { cols: 6, rows: 6, frameCount: 36, fps: 12, frameW: 194, frameH: 200, displayW: 170, displayH: 179 }
  },

  // ── SAGE ─────────────────────────────────────────────────────────────────
  sage: {
    male:   { cols: 6, rows: 6, frameCount: 36, fps: 12, frameW: 194, frameH: 200, displayW: null, displayH: null },
    female: { cols: 6, rows: 6, frameCount: 36, fps: 12, frameW: 194, frameH: 200, displayW: null, displayH: null }
  },

  // ── BARD ─────────────────────────────────────────────────────────────────
  bard: {
    male:   { cols: 6, rows: 6, frameCount: 36, fps: 12, frameW: 194, frameH: 200, displayW: null, displayH: null },
    female: { cols: 6, rows: 6, frameCount: 36, fps: 12, frameW: 194, frameH: 200, displayW: null, displayH: null }
  },

  // ── CRUSADER ──────────────────────────────────────────────────────────────
  crusader: {
    male:   { cols: 6, rows: 6, frameCount: 36, fps: 12, frameW: 194, frameH: 200, displayW: null, displayH: null },
    female: { cols: 6, rows: 6, frameCount: 36, fps: 12, frameW: 194, frameH: 200, displayW: null, displayH: null }
  },

  // ── ALCHEMIST ────────────────────────────────────────────────────────────
  alchemist: {
    male:   { cols: 6, rows: 6, frameCount: 36, fps: 12, frameW: 194, frameH: 200, displayW: null, displayH: null },
    female: { cols: 6, rows: 6, frameCount: 36, fps: 12, frameW: 194, frameH: 200, displayW: null, displayH: null }
  },

  // ── ARCHMAGE ─────────────────────────────────────────────────────────────
  archmage: {
    male:   { cols: 6, rows: 6, frameCount: 36, fps: 12, frameW: 194, frameH: 200, displayW: null, displayH: null },
    female: { cols: 6, rows: 6, frameCount: 36, fps: 12, frameW: 194, frameH: 200, displayW: null, displayH: null }
  },

  // ── SHADOW (hidden) ──────────────────────────────────────────────────────
  shadow: {
    male:   { cols: 6, rows: 6, frameCount: 36, fps: 14, frameW: 194, frameH: 200, displayW: null, displayH: null },
    female: { cols: 6, rows: 6, frameCount: 36, fps: 14, frameW: 194, frameH: 200, displayW: null, displayH: null }
  },

  // ── SOVEREIGN (hidden) ───────────────────────────────────────────────────
  sovereign: {
    male:   { cols: 6, rows: 6, frameCount: 36, fps: 10, frameW: 194, frameH: 200, displayW: null, displayH: null },
    female: { cols: 6, rows: 6, frameCount: 36, fps: 10, frameW: 194, frameH: 200, displayW: null, displayH: null }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  ENGINE
// ─────────────────────────────────────────────────────────────────────────────
var CT_SpriteConfig = (function() {

  function resolve(jobId, gender) {
    var jobCfg = SPRITE_CONFIGS[jobId] || {};
    var genCfg = jobCfg[gender] || {};
    var cfg = {};
    var keys = Object.keys(SPRITE_DEFAULT);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      cfg[k] = (genCfg[k] !== undefined) ? genCfg[k] : SPRITE_DEFAULT[k];
    }
    // Resolusi ukuran tampil: responsif dulu, lalu per-job override di-scale
    // displayW/H di config adalah nilai baseline (tablet ~138px). Di-scale ke breakpoint aktif.
    var responsive = getResponsiveSize();
    var scaleW = responsive.w / SPRITE_DISPLAY_SIZE.w;
    var scaleH = responsive.h / SPRITE_DISPLAY_SIZE.h;
    cfg._resolvedW = cfg.displayW ? Math.round(cfg.displayW * scaleW) : responsive.w;
    cfg._resolvedH = cfg.displayH ? Math.round(cfg.displayH * scaleH) : responsive.h;
    return cfg;
  }

  function buildKeyframes(name, cfg, displayW, displayH) {
    // Gunakan pixel absolut bukan persentase agar posisi tidak bergantung pada
    // ukuran elemen. Dengan persentase, saat sprite lebih besar dari container
    // yang di-clip, browser menghitung posisi relatif terhadap (elemen - bg)
    // sehingga menyebabkan geser kiri-kanan yang tidak diinginkan.
    var w = displayW || cfg._resolvedW || 138;
    var h = displayH || cfg._resolvedH || 142;
    var cols = cfg.cols, rows = cfg.rows;
    var frameCount = Math.min(cfg.frameCount, cols * rows);
    var steps = [];
    for (var f = 0; f < frameCount; f++) {
      var col = f % cols;
      var row = Math.floor(f / cols);
      var xPx = -(col * w) + 'px';
      var yPx = -(row * h) + 'px';
      var timePct = ((f / frameCount) * 100).toFixed(4) + '%';
      steps.push('  ' + timePct + ' { background-position: ' + xPx + ' ' + yPx + ' }');
    }
    steps.push('  100% { background-position: 0px 0px }');
    return '@keyframes ' + name + ' {\n' + steps.join('\n') + '\n}';
  }

  function calcDuration(cfg) {
    var frames = Math.min(cfg.frameCount, cfg.cols * cfg.rows);
    return (frames / cfg.fps).toFixed(3) + 's';
  }

  var _injectedKeys = {};
  var _lastBreakpoint = '';
  var _activeGender = 'male';   // track gender aktif agar resize tidak reset ke male
  var _activeJobId  = '';
  function _getCurrentBreakpoint() {
    var vw = window.innerWidth;
    if (vw >= 1024) return 'desktop';
    if (vw <= 700) return 'mobile';
    return 'tablet';
  }
  function injectKeyframes(jobId, gender, cfg) {
    var bp = _getCurrentBreakpoint();
    var key = jobId + '_' + gender;
    var sizeKey = key + '_' + cfg._resolvedW + 'x' + cfg._resolvedH + '_' + bp;
    if (_injectedKeys[sizeKey]) return;
    // Hapus keyframe lama untuk job+gender ini jika ukuran/breakpoint berubah
    var oldTag = document.getElementById('ct-sprite-kf-' + key);
    if (oldTag) oldTag.remove();
    // Bersihkan cache key lama agar bisa di-regenerate
    Object.keys(_injectedKeys).forEach(function(k) {
      if (k.indexOf(key + '_') === 0) delete _injectedKeys[k];
    });
    var w = cfg._resolvedW;
    var h = cfg._resolvedH;
    var css = buildKeyframes('spriteIdle_' + key, cfg, w, h) + '\n' + buildKeyframes('pickerIdle_' + key, cfg, w, h);
    var tag = document.createElement('style');
    tag.id = 'ct-sprite-kf-' + key;
    tag.textContent = css;
    document.head.appendChild(tag);
    _injectedKeys[sizeKey] = true;
  }

  /**
   * Terapkan config ke elemen sprite di dashboard.
   * Menggunakan _resolvedW/_resolvedH yang sudah dihitung responsif.
   * TIDAK pakai !important agar CSS breakpoint bisa override bila perlu.
   */
  function apply(jobId, gender) {
    _activeGender = gender;   // simpan gender aktif untuk keperluan resize
    _activeJobId  = jobId;
    var cfg = resolve(jobId, gender);
    if (!cfg.isStatic) injectKeyframes(jobId, gender, cfg);

    var dashEl = document.getElementById('char-sprite-img');
    if (dashEl) {
      var w = cfg._resolvedW;
      var h = cfg._resolvedH;

      // Set ukuran via style langsung (tanpa !important agar CSS breakpoint tetap bisa menang)
      dashEl.style.width  = w + 'px';
      dashEl.style.height = h + 'px';

      // Set CSS custom properties di elemen agar CSS var() bisa membaca ukuran aktif
      dashEl.style.setProperty('--sprite-w', w + 'px');
      dashEl.style.setProperty('--sprite-h', h + 'px');

      // Centering ditangani CSS via margin-left/right:auto di .char-sprite-anim
      // (tidak di-set JS agar tidak konflik dengan flex wrap)

      if (cfg.isStatic) {
        dashEl.style.backgroundSize = '100% 100%';
        dashEl.style.animation = 'charSpriteFloat 2.8s ease-in-out infinite';
      } else {
        var bgW = w * cfg.cols;
        var bgH = h * cfg.rows;
        dashEl.style.backgroundSize = bgW + 'px ' + bgH + 'px';
        var keyName = 'spriteIdle_' + jobId + '_' + gender;
        var dur = calcDuration(cfg);
        dashEl.style.animation =
          'charSpriteFloat 2.8s ease-in-out infinite, ' +
          keyName + ' ' + dur + ' steps(1) infinite';
      }
    }

    applyPicker(jobId, gender, cfg);
  }

  function applyPicker(jobId, gender, cfg) {
    cfg = cfg || resolve(jobId, gender);
    if (!cfg.isStatic) injectKeyframes(jobId, gender, cfg);
    var els = document.querySelectorAll('[data-job="' + jobId + '"] .job-picker-item-sprite-anim');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (cfg.isStatic) {
        el.style.animation = 'none';
        el.style.backgroundSize = '100% 100%';
      } else {
        var keyName = 'pickerIdle_' + jobId + '_' + gender;
        el.style.backgroundSize = (cfg.cols * 100) + '% ' + (cfg.rows * 100) + '%';
        el.style.animation = keyName + ' ' + calcDuration(cfg) + ' steps(1) infinite';
      }
      if (cfg.pickerW) el.style.setProperty('width',  cfg.pickerW + 'px', 'important');
      if (cfg.pickerH) el.style.setProperty('height', cfg.pickerH + 'px', 'important');
    }
  }

  function applyAll(gender) {
    var dashEl = document.getElementById('char-sprite-img');
    if (dashEl) {
      var spriteUrl = dashEl.getAttribute('data-sprite-url') || '';
      var jobId = null;
      // Paid avatars: path = character/jobs/paid/<Name>/<Char N>/<gender>.webp
      // Key di SPRITE_CONFIGS = <Name>_<CharN> e.g. Slytherin_Char1
      var paidMatch = spriteUrl.match(/jobs\/paid\/([^/]+)\/Char\s*(\d+)\//);
      if (paidMatch) {
        jobId = paidMatch[1] + '_Char' + paidMatch[2];
      } else {
        // Normal/hidden: jobs/normal/<JobId>/ atau jobs/hidden/<JobId>/
        var normMatch = spriteUrl.match(/jobs\/(?:normal|hidden)\/([^/]+)\//);
        if (normMatch) jobId = normMatch[1];
      }
      if (jobId) apply(jobId, gender || _activeGender || 'male');
    }
    var pickerEls = document.querySelectorAll('.job-picker-item[data-job]');
    for (var i = 0; i < pickerEls.length; i++) {
      var jobId2 = pickerEls[i].getAttribute('data-job');
      if (jobId2) applyPicker(jobId2, gender || _activeGender || 'male');
    }
  }

  function getConfig(jobId, gender) { return resolve(jobId, gender); }

  function debug(jobId, gender) {
    var cfg = resolve(jobId, gender);
    console.group('[CT_SpriteConfig] ' + jobId + ' / ' + gender);
    console.log('Grid    :', cfg.cols + '×' + cfg.rows);
    console.log('FPS     :', cfg.fps, '→', calcDuration(cfg), 'per loop');
    console.log('Display :', cfg._resolvedW + 'px × ' + cfg._resolvedH + 'px',
      cfg.displayW ? '(per-job override, scaled)' : '(responsif dari breakpoint)');
    console.log('BgSize  :', (cfg._resolvedW * cfg.cols) + 'px ' + (cfg._resolvedH * cfg.rows) + 'px');
    console.log('Breakpt :', _getCurrentBreakpoint(), '— window width:', window.innerWidth + 'px');
    console.groupEnd();
    return cfg;
  }

  // ── Auto-refresh saat resize (misal rotate HP landscape↔portrait) ──────────
  var _resizeTimer = null;
  window.addEventListener('resize', function() {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(function() {
      applyAll(_activeGender);  // gunakan gender aktif, bukan default 'male'
    }, 150);
  });

  return { apply, applyAll, applyPicker, getConfig, debug };

})();
