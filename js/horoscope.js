// ═══════════════════════════════════════════════════════════════
//  HOROSCOPE MODULE — ChiTask
//  API: https://freehoroscopeapi.com/ (free, no key needed)
//
//  Production (Netlify): /.netlify/functions/horoscope-proxy
//  Development (localhost): data fallback lokal (no network needed)
//
//  Response format dari freehoroscopeapi:
//    { data: { date, period, sign, horoscope } }
//
//  Public API:
//    horoscope.getCard()          → HTML untuk dashboard
//    horoscope.refresh()          → paksa fetch ulang
//    horoscope.getZodiak()        → zodiak aktif
//    horoscope.setZodiak(z)       → set + simpan + re-render
//    horoscope.openZodiakPicker() → tampilkan picker
// ═══════════════════════════════════════════════════════════════

var horoscope = (function () {

  // ── Konstanta ─────────────────────────────────────────────────
  var STORAGE_KEY_ZODIAK = 'chitask_horoscope_zodiak';
  var STORAGE_KEY_CACHE  = 'chitask_horoscope_cache';
  var PROXY_URL = '/.netlify/functions/horoscope-proxy?sign={SIGN}';

  // Dev mode: localhost / 127.0.0.1 / file:// / LAN IP
  var IS_DEV = (function () {
    var h = window.location.hostname;
    return h === 'localhost' || h === '127.0.0.1' || h === '' || h.startsWith('192.168.');
  })();

  var ZODIAK_LIST = [
    { id: 'aries',       label: 'Aries',       icon: '♈', date: '21 Mar – 19 Apr' },
    { id: 'taurus',      label: 'Taurus',       icon: '♉', date: '20 Apr – 20 Mei' },
    { id: 'gemini',      label: 'Gemini',       icon: '♊', date: '21 Mei – 20 Jun' },
    { id: 'cancer',      label: 'Cancer',       icon: '♋', date: '21 Jun – 22 Jul' },
    { id: 'leo',         label: 'Leo',          icon: '♌', date: '23 Jul – 22 Agu' },
    { id: 'virgo',       label: 'Virgo',        icon: '♍', date: '23 Agu – 22 Sep' },
    { id: 'libra',       label: 'Libra',        icon: '♎', date: '23 Sep – 22 Okt' },
    { id: 'scorpio',     label: 'Scorpio',      icon: '♏', date: '23 Okt – 21 Nov' },
    { id: 'sagittarius', label: 'Sagittarius',  icon: '♐', date: '22 Nov – 21 Des' },
    { id: 'capricorn',   label: 'Capricorn',    icon: '♑', date: '22 Des – 19 Jan' },
    { id: 'aquarius',    label: 'Aquarius',     icon: '♒', date: '20 Jan – 18 Feb' },
    { id: 'pisces',      label: 'Pisces',       icon: '♓', date: '19 Feb – 20 Mar' }
  ];

  // ── Fallback data (dev/offline) ───────────────────────────────
  var _devMessages = [
    'Energi hari ini sangat mendukung produktivitasmu. Fokus pada hal-hal yang benar-benar penting dan jangan biarkan distraksi menghalangimu.',
    'Intuisimu sedang tajam. Percayai perasaanmu dalam mengambil keputusan, terutama soal hubungan dan pekerjaan.',
    'Hari yang baik untuk memulai sesuatu yang baru. Semesta mendukung langkah beranimu hari ini.',
    'Kesabaran adalah kunci. Sesuatu yang kamu tunggu-tunggu akan segera terwujud jika kamu tetap konsisten.',
    'Perhatikan keseimbangan antara kerja dan istirahat. Tubuh dan pikiranmu butuh recharge hari ini.',
    'Komunikasikan apa yang ada di pikiranmu dengan jelas. Orang-orang di sekitarmu siap mendengar.',
    'Peluang datang dari arah yang tidak terduga. Tetap terbuka dan jangan terlalu kaku dengan rencana.'
  ];

  function _devFallback(sign) {
    var seed = sign.charCodeAt(0) + new Date().getDate();
    return { horoscope: _devMessages[seed % _devMessages.length] };
  }

  // ── State ─────────────────────────────────────────────────────
  var _zodiak = null;
  var _cache  = null;

  // ── Storage ───────────────────────────────────────────────────
  function _loadZodiak() { try { return localStorage.getItem(STORAGE_KEY_ZODIAK) || null; } catch(e) { return null; } }
  function _saveZodiak(z){ try { localStorage.setItem(STORAGE_KEY_ZODIAK, z); } catch(e) {} }
  function _loadCache()  { try { var r = localStorage.getItem(STORAGE_KEY_CACHE); return r ? JSON.parse(r) : null; } catch(e) { return null; } }
  function _saveCache(o) { try { localStorage.setItem(STORAGE_KEY_CACHE, JSON.stringify(o)); } catch(e) {} }
  function _clearCache() { try { localStorage.removeItem(STORAGE_KEY_CACHE); } catch(e) {} }
  // FIX 3: Cache expire per-jam (bukan per-hari) supaya kalau API update di tengah hari, ikut terupdate
  function _today()      { var d = new Date(); return d.toISOString().slice(0, 13); } // format: YYYY-MM-DDTHH
  function _info(id)     { return ZODIAK_LIST.find(function(z){ return z.id === id; }) || null; }

  // ── Init ──────────────────────────────────────────────────────
  _zodiak = _loadZodiak();
  _cache  = _loadCache();

  // ── Fetch ─────────────────────────────────────────────────────
  function _fetch(sign, cb) {
    // FIX 1: Dev mode sekarang tetap hit API langsung ke freehoroscopeapi.com
    // Fallback lokal hanya dipakai kalau fetch gagal (offline / error)
    var url = IS_DEV
      ? 'https://freehoroscopeapi.com/api/v1/get-horoscope/daily?sign=' + sign
      : PROXY_URL.replace('{SIGN}', sign);

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      // freehoroscopeapi mengembalikan { data: { horoscope, sign, date, period } }
      .then(function (json) { cb(null, json.data || json); })
      .catch(function (err) {
        // Fallback lokal hanya kalau benar-benar tidak bisa fetch (misal offline)
        console.warn('[horoscope] fetch gagal, pakai fallback lokal:', err.message);
        cb(null, _devFallback(sign));
      });
  }

  // ── Render ────────────────────────────────────────────────────
  function _devBadge() {
    return IS_DEV
      ? '<div style="font-size:9px;color:rgba(255,255,255,0.22);text-align:right;margin-bottom:4px;font-family:\'DM Mono\',monospace">⚙️ dev mode — data lokal</div>'
      : '';
  }

  function _renderLoading(nfo) {
    return '<div class="dash-card horoscope-card"><div class="horoscope-card-inner">'
      + '<div class="dash-card-title">✦ Ramalan Hari Ini'
      + '<a onclick="horoscope.openZodiakPicker()">Ganti →</a></div>'
      + '<div class="horoscope-loading">'
      + '<span class="horoscope-spin">✦</span>'
      + '<span style="font-size:11px;color:var(--muted)">Membaca bintang ' + (nfo ? nfo.label : '') + '…</span>'
      + '</div>'
      + '</div></div>';
  }

  function _renderPicker() {
    var html = '<div class="dash-card horoscope-card"><div class="horoscope-card-inner">'
      + '<div class="dash-card-title" style="color:color-mix(in srgb,#a78bfa 60%,var(--muted))">✦ Pilih Zodiak Kamu</div>'
      + '<div class="horoscope-picker-grid">';
    ZODIAK_LIST.forEach(function (z) {
      html += '<button class="horoscope-picker-btn" onclick="horoscope.setZodiak(\'' + z.id + '\')">'
        + '<span class="horoscope-picker-ic">' + z.icon + '</span>'
        + '<span class="horoscope-picker-lbl">' + z.label + '</span>'
        + '</button>';
    });
    return html + '</div></div></div>';
  }

  function _renderError(nfo) {
    return '<div class="dash-card horoscope-card"><div class="horoscope-card-inner">'
      + '<div class="dash-card-title" style="color:color-mix(in srgb,#a78bfa 60%,var(--muted))">✦ Ramalan Hari Ini'
      + '<a onclick="horoscope.openZodiakPicker()" style="color:#a78bfa">Ganti →</a></div>'
      + '<div style="text-align:center;padding:14px 0;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center">'
      + '<div style="font-size:32px;margin-bottom:8px;filter:drop-shadow(0 0 8px rgba(167,139,250,0.5))">' + (nfo ? nfo.icon : '🌌') + '</div>'
      + '<div style="font-size:11px;color:var(--muted);margin-bottom:10px">Gagal memuat ramalan. Cek koneksi.</div>'
      + '<button onclick="horoscope.refresh()" style="padding:7px 16px;border:1.5px solid color-mix(in srgb,#7c3aed 40%,var(--border));border-radius:6px;'
      + 'background:color-mix(in srgb,#7c3aed 10%,var(--card));color:#a78bfa;font-size:11px;cursor:pointer;font-weight:700;font-family:\'DM Sans\',sans-serif">↺ Coba Lagi</button>'
      + '</div></div></div>';
  }

  function _renderCard(data, nfo) {
    var desc = data.horoscope || data.description || 'Tidak ada ramalan tersedia.';

    return '<div class="dash-card horoscope-card"><div class="horoscope-card-inner">'
      + _devBadge()
      + '<div class="dash-card-title" style="color:color-mix(in srgb,#a78bfa 60%,var(--muted))">✦ Ramalan Hari Ini'
      + '<a onclick="horoscope.openZodiakPicker()" style="color:#a78bfa!important">Ganti →</a></div>'
      + '<div class="horoscope-main-row">'
        + '<div class="horoscope-sign-col">'
          + '<div class="horoscope-big-icon-wrap"><div class="horoscope-big-icon">' + nfo.icon + '</div></div>'
          + '<div class="horoscope-sign-name">' + nfo.label + '</div>'
          + '<div class="horoscope-sign-date">' + nfo.date + '</div>'
        + '</div>'
        + '<div class="horoscope-divider"></div>'
        + '<div class="horoscope-desc-col">'
          + '<p class="horoscope-desc">' + desc + '</p>'
        + '</div>'
      + '</div>'
      + '</div></div>';
  }

  // ── Core ──────────────────────────────────────────────────────
  function _inject(html) {
    var el = document.getElementById('horoscope-slot');
    if (el) el.innerHTML = html;
  }

  function _fetchAndRender() {
    if (!_zodiak) return;
    var nfo = _info(_zodiak);
    if (!nfo) return;

    if (_cache && _cache.date === _today() && _cache.sign === _zodiak) {
      _inject(_renderCard(_cache.data, nfo));
      return;
    }

    _fetch(_zodiak, function (err, data) {
      if (err || !data) { _inject(_renderError(nfo)); return; }
      _cache = { date: _today(), sign: _zodiak, data: data };
      _saveCache(_cache);
      _inject(_renderCard(data, nfo));
    });
  }

  // ── Public ────────────────────────────────────────────────────
  function getZodiak() { return _zodiak; }

  function setZodiak(z) {
    _zodiak = z;
    _saveZodiak(z);
    _clearCache();
    _cache = null;
    _inject(_renderLoading(_info(z)));
    _fetchAndRender();
  }

  function openZodiakPicker() { _inject(_renderPicker()); }

  function refresh() {
    _clearCache();
    _cache = null;
    if (_zodiak) _inject(_renderLoading(_info(_zodiak)));
    _fetchAndRender();
  }

  function getCard() {
    if (!_zodiak) return '<div id="horoscope-slot" style="height:100%;display:flex;flex-direction:column">' + _renderPicker() + '</div>';
    var nfo = _info(_zodiak);
    if (_cache && _cache.date === _today() && _cache.sign === _zodiak) {
      return '<div id="horoscope-slot" style="height:100%;display:flex;flex-direction:column">' + _renderCard(_cache.data, nfo) + '</div>';
    }
    setTimeout(_fetchAndRender, 80);
    return '<div id="horoscope-slot" style="height:100%;display:flex;flex-direction:column">' + _renderLoading(nfo) + '</div>';
  }

  return { getCard, getZodiak, setZodiak, refresh, openZodiakPicker, ZODIAK_LIST };

})();
