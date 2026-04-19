// ╔══════════════════════════════════════════════════════════════╗
// ║   FITUR JADWAL SHOLAT — ChiTask (v3)                         ║
// ║   - Task sholat otomatis setiap hari                         ║
// ║   - Reminder pakai scheduleReminders() bawaan app            ║
// ║   - Waktu reminder update tiap hari sesuai jadwal            ║
// ╚══════════════════════════════════════════════════════════════╝

var KOTA_LIST = [
  { name: 'Jakarta',       lat: -6.2088,  lng: 106.8456 },
  { name: 'Surabaya',      lat: -7.2575,  lng: 112.7521 },
  { name: 'Bandung',       lat: -6.9175,  lng: 107.6191 },
  { name: 'Medan',         lat:  3.5952,  lng:  98.6722 },
  { name: 'Semarang',      lat: -6.9932,  lng: 110.4203 },
  { name: 'Makassar',      lat: -5.1477,  lng: 119.4327 },
  { name: 'Palembang',     lat: -2.9761,  lng: 104.7754 },
  { name: 'Tangerang',     lat: -6.1781,  lng: 106.6300 },
  { name: 'Depok',         lat: -6.4025,  lng: 106.7942 },
  { name: 'Bekasi',        lat: -6.2383,  lng: 106.9756 },
  { name: 'Batam',         lat:  1.1301,  lng: 104.0529 },
  { name: 'Pekanbaru',     lat:  0.5071,  lng: 101.4478 },
  { name: 'Bandar Lampung',lat: -5.3971,  lng: 105.2668 },
  { name: 'Malang',        lat: -7.9797,  lng: 112.6304 },
  { name: 'Yogyakarta',    lat: -7.7956,  lng: 110.3695 },
  { name: 'Solo',          lat: -7.5755,  lng: 110.8243 },
  { name: 'Balikpapan',    lat: -1.2654,  lng: 116.8312 },
  { name: 'Samarinda',     lat: -0.5022,  lng: 117.1536 },
  { name: 'Banjarmasin',   lat: -3.3194,  lng: 114.5908 },
  { name: 'Pontianak',     lat: -0.0263,  lng: 109.3425 },
  { name: 'Denpasar',      lat: -8.6500,  lng: 115.2167 },
  { name: 'Mataram',       lat: -8.5833,  lng: 116.1167 },
  { name: 'Kupang',        lat:-10.1772,  lng: 123.6070 },
  { name: 'Manado',        lat:  1.4748,  lng: 124.8421 },
  { name: 'Jayapura',      lat: -2.5337,  lng: 140.7181 },
  { name: 'Ambon',         lat: -3.6954,  lng: 128.1814 },
  { name: 'Padang',        lat: -0.9492,  lng: 100.3543 },
  { name: 'Jambi',         lat: -1.6101,  lng: 103.6131 },
  { name: 'Bengkulu',      lat: -3.8004,  lng: 102.2655 },
  { name: 'Pangkalpinang', lat: -2.1316,  lng: 106.1169 },
  { name: 'Tanjungpinang', lat:  0.9186,  lng: 104.4424 },
  { name: 'Serang',        lat: -6.1201,  lng: 106.1503 },
  { name: 'Tasikmalaya',   lat: -7.3274,  lng: 108.2207 },
  { name: 'Cirebon',       lat: -6.7063,  lng: 108.5570 },
  { name: 'Bogor',         lat: -6.5971,  lng: 106.8060 },
  { name: 'Kediri',        lat: -7.8166,  lng: 111.9650 },
  { name: 'Madiun',        lat: -7.6298,  lng: 111.5239 },
  { name: 'Jember',        lat: -8.1845,  lng: 113.6679 },
  { name: 'Palu',          lat: -0.8917,  lng: 119.8707 },
  { name: 'Kendari',       lat: -3.9778,  lng: 122.5133 },
  { name: 'Gorontalo',     lat:  0.5435,  lng: 123.0600 },
  { name: 'Sorong',        lat: -0.8833,  lng: 131.2500 },
  { name: 'Merauke',       lat: -8.4667,  lng: 140.3333 },
];

var SHOLAT_NAMES = ['Subuh','Dzuhur','Ashr','Maghrib','Isya'];
var SHOLAT_ICONS = ['🌙','☀️','🌤️','🌅','🌙'];
var SHOLAT_KEYS  = ['Fajr','Dhuhr','Asr','Maghrib','Isha'];

var _sholatEnabled  = localStorage.getItem('chitask_sholat_enabled') === '1';
var _sholatKota     = localStorage.getItem('chitask_sholat_kota') || '';
var _sholatSchedule = null;
var _sholatDate     = '';
var _sholatTimers   = [];

// ── CSS ──────────────────────────────────────────────────────
(function() {
  var s = document.createElement('style');
  s.textContent = `
    #sholat-fab {
      position:fixed; bottom:88px; right:18px;
      width:48px; height:48px; border-radius:50%;
      background:linear-gradient(135deg,#1a6b3a,#2d9e5f);
      color:#fff; font-size:22px; border:none; cursor:pointer;
      box-shadow:0 4px 16px rgba(0,0,0,0.35); z-index:999;
      display:none; align-items:center; justify-content:center;
      transition:transform 0.2s;
    }
    #sholat-fab:hover { transform:scale(1.1); }
    #sholat-panel {
      position:fixed; bottom:148px; right:18px; width:300px;
      background:#1a1a2e; border:1px solid rgba(255,255,255,0.1);
      border-radius:16px; padding:16px; z-index:1000;
      box-shadow:0 8px 32px rgba(0,0,0,0.5); display:none;
    }
    #sholat-panel.open { display:block; animation:sholatSlide 0.2s ease; }
    @keyframes sholatSlide {
      from{opacity:0;transform:translateY(10px)}
      to{opacity:1;transform:translateY(0)}
    }
    .sholat-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
    .sholat-title  { font-size:15px; font-weight:600; color:#fff; }
    .sholat-close  { background:none;border:none;color:rgba(255,255,255,0.5);font-size:18px;cursor:pointer;padding:0;line-height:1; }
    .sholat-kota-label { font-size:11px;color:rgba(255,255,255,0.4);text-align:center;margin-bottom:10px; }
    .sholat-list   { display:flex; flex-direction:column; gap:5px; }
    .sholat-item   { display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-radius:10px;background:rgba(255,255,255,0.05); }
    .sholat-item.next { background:rgba(45,158,95,0.2);border:1px solid rgba(45,158,95,0.4); }
    .sholat-item-left { display:flex;align-items:center;gap:10px; }
    .sholat-item-icon { font-size:17px; }
    .sholat-item-name { font-size:13px;font-weight:500;color:#fff; }
    .sholat-item-time { font-size:13px;color:rgba(255,255,255,0.7);font-variant-numeric:tabular-nums; }
    .sholat-next-badge { font-size:10px;background:#2d9e5f;color:#fff;border-radius:4px;padding:1px 5px;margin-left:5px; }
    .sholat-loading,.sholat-empty { text-align:center;color:rgba(255,255,255,0.4);font-size:13px;padding:14px 0; }
  `;
  document.head.appendChild(s);
})();

// ── FAB + PANEL ───────────────────────────────────────────────
(function() {
  var fab = document.createElement('button');
  fab.id = 'sholat-fab'; fab.title = 'Jadwal Sholat'; fab.innerHTML = '🕌';
  fab.onclick = toggleSholatPanel;
  fab.style.display = 'none'; // FAB dipindah ke Settings — selalu tersembunyi
  document.body.appendChild(fab);

  var panel = document.createElement('div');
  panel.id = 'sholat-panel';
  panel.innerHTML = '<div class="sholat-header">'
    + '<span class="sholat-title">🕌 Jadwal Sholat</span>'
    + '<button class="sholat-close" onclick="toggleSholatPanel()">✕</button>'
    + '</div><div id="sholat-content"><div class="sholat-loading">Memuat...</div></div>';
  document.body.appendChild(panel);
})();

// ── TOGGLE PANEL ─────────────────────────────────────────────
function toggleSholatPanel() {
  var panel = document.getElementById('sholat-panel');
  var open = panel.classList.toggle('open');
  if (open) {
    if (!_sholatKota) {
      document.getElementById('sholat-content').innerHTML =
        '<div class="sholat-empty">Pilih kota dulu di ⚙️ Settings → Jadwal Sholat</div>';
    } else {
      sholatLoadAndRender();
    }
  }
}

// ── TOGGLE FITUR (dari Settings) ─────────────────────────────
function sholatToggleFeature(enabled) {
  _sholatEnabled = enabled;
  localStorage.setItem('chitask_sholat_enabled', enabled ? '1' : '0');
  var fab     = document.getElementById('sholat-fab');
  var track   = document.getElementById('sholatToggleTrack');
  var thumb   = document.getElementById('sholatToggleThumb');
  var kotaRow = document.getElementById('sholatKotaSettingsRow');
  if (fab)     fab.style.display = 'none'; // FAB dipindah ke Settings
  if (track)   track.style.background = enabled ? '#2d9e5f' : 'rgba(255,255,255,0.1)';
  if (thumb)   thumb.style.transform  = enabled ? 'translateX(20px)' : 'translateX(0)';
  if (kotaRow) kotaRow.style.display  = enabled ? 'flex' : 'none';
  if (enabled) {
    sholatPopulateSettingsSelect();
    if (_sholatKota) sholatAutoInject(); // langsung inject task hari ini
  } else {
    var panel = document.getElementById('sholat-panel');
    if (panel) panel.classList.remove('open');
    // Hapus habit sholat hari ini saat fitur dimatikan
    if (typeof tasks !== 'undefined') {
      var sholatNamesToRemove = SHOLAT_NAMES.map(function(name, i) {
        return SHOLAT_ICONS[i] + ' Sholat ' + name;
      });
      sholatNamesToRemove.push('🕌 Sholat Jumat');
      var before = tasks.length;
      tasks = tasks.filter(function(t) {
        return sholatNamesToRemove.indexOf(t.name) === -1;
      });
      if (tasks.length !== before) {
        localStorage.removeItem('chitask_sholat_lastrun');
        if (typeof saveData   === 'function') saveData(true);
        if (typeof render     === 'function') render();
        if (typeof showToast  === 'function') showToast('🗑️ Habit sholat hari ini dihapus');
      }
    }
  }
}

// ── INIT TOGGLE STATE (dipanggil saat Settings dibuka) ───────
function sholatInitSettingsToggle() {
  var cb = document.getElementById('sholatFeatureToggle');
  if (cb) cb.checked = _sholatEnabled;
  sholatToggleFeature(_sholatEnabled);
}

// ── ISI DROPDOWN KOTA DI SETTINGS ────────────────────────────
function sholatPopulateSettingsSelect() {
  var sel = document.getElementById('sholat-kota-select-settings');
  if (!sel) return;
  if (sel.options.length > 1) { sel.value = _sholatKota; return; }
  KOTA_LIST.forEach(function(k) {
    var o = document.createElement('option');
    o.value = k.name; o.textContent = k.name;
    o.style.background = '#1e2d24';
    o.style.color = '#fff';
    if (k.name === _sholatKota) o.selected = true;
    sel.appendChild(o);
  });
}

// ── SIMPAN KOTA DARI SETTINGS ─────────────────────────────────
function sholatSimpanKotaSettings() {
  var sel = document.getElementById('sholat-kota-select-settings');
  if (!sel || !sel.value) {
    if (typeof showToast === 'function') showToast('⚠️ Pilih kota dulu');
    return;
  }
  _sholatKota = sel.value;
  localStorage.setItem('chitask_sholat_kota', _sholatKota);
  // Reset cache jadwal & lastrun agar fetch ulang dan update reminder
  _sholatSchedule = null; _sholatDate = '';
  localStorage.removeItem('chitask_sholat_lastrun');
  if (typeof showToast === 'function') showToast('⏳ Menyinkron jadwal ' + _sholatKota + '...');
  sholatAutoInject(); // fetch + update reminder task sholat
}

// ── FETCH API ALADHAN ─────────────────────────────────────────
function sholatFetch(callback) {
  var kota = KOTA_LIST.find(function(k) { return k.name === _sholatKota; });
  if (!kota) { callback(null); return; }
  var d = new Date();
  var todayStr = localDateStr(d);
  if (_sholatSchedule && _sholatDate === todayStr) { callback(_sholatSchedule); return; }
  var url = 'https://api.aladhan.com/v1/timings/'
    + d.getDate() + '-' + (d.getMonth()+1) + '-' + d.getFullYear()
    + '?latitude=' + kota.lat + '&longitude=' + kota.lng + '&method=11';
  fetch(url)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.code === 200) {
        _sholatSchedule = data.data.timings;
        _sholatDate = todayStr;
        callback(data.data.timings);
      } else { callback(null); }
    })
    .catch(function() { callback(null); });
}

// ══════════════════════════════════════════════════════════════
// CORE: Auto-inject/update task sholat setiap hari
//
// Flow:
// 1. Fetch jadwal hari ini dari aladhan
// 2. Untuk tiap sholat:
//    - Kalau task belum ada → buat sekali (repeat Harian)
//    - Kalau sudah ada → cukup update reminder-nya
// 3. Jumat: task "Sholat Dzuhur" di-hide (done=true hari ini),
//    task "Sholat Jumat" (sekali, bukan repeat) dibuat/ditampilkan
// ══════════════════════════════════════════════════════════════
function sholatAutoInject() {
  if (!_sholatEnabled || !_sholatKota) return;
  if (typeof tasks === 'undefined') return;

  sholatFetch(function(timings) {
    if (!timings) return;

    var now      = new Date();
    var todayStr = now.getFullYear() + '-'
      + String(now.getMonth()+1).padStart(2,'0') + '-'
      + String(now.getDate()).padStart(2,'0');
    var isJumat  = (now.getDay() === 5); // 0=Minggu, 5=Jumat
    var changed  = false;

    // ── Helper: cari task by nama ──────────────────────────────
    function findByName(nm) {
      for (var j = 0; j < tasks.length; j++) {
        if (tasks[j].name === nm) return tasks[j];
      }
      return null;
    }

    // ── Helper: buat task sholat baru ─────────────────────────
    function buatTask(nm, time, repeatVal) {
      tasks.push({
        id: nextId++,
        name: nm,
        type: 'Habit',
        repeat: repeatVal || 'Harian',
        due: todayStr,
        done: false,
        important: false,
        myday: true,
        note: 'Jadwal: ' + time + ' — ' + _sholatKota,
        group: 'Ibadah',
        history: [],
        color: '#1a6b3a',
        subtasks: [],
        reminder: time,
        xpVal: 10,
        goldVal: 0,
        isShopping: false,
        gcalEventId: ''
      });
      changed = true;
    }

    // ── Helper: update reminder task (pakai format HH:MM) ─────
    function updateReminder(task, time) {
      if (task.reminder !== time) {
        task.reminder = time;
        task.note = 'Jadwal: ' + time + ' — ' + _sholatKota;
        changed = true;
      }
    }

    // ── Proses 5 sholat wajib ─────────────────────────────────
    SHOLAT_NAMES.forEach(function(name, i) {
      var taskName = SHOLAT_ICONS[i] + ' Sholat ' + name;
      var newTime  = timings[SHOLAT_KEYS[i]]; // "HH:MM"
      var isDzuhur = (name === 'Dzuhur');

      var existing = findByName(taskName);

      if (isDzuhur) {
        // ── Dzuhur: kalau hari Jumat sembunyikan dari My Day, selain itu tampilkan normal
        if (isJumat) {
          if (existing) {
            if (!existing._jumatHidden) {
              existing._jumatHidden = true;
              existing.myday    = false;
              existing.reminder = '';
              changed = true;
            }
          } else {
            buatTask(taskName, newTime);
            var t = findByName(taskName);
            if (t) { t._jumatHidden = true; t.myday = false; t.reminder = ''; }
          }
        } else {
          // Bukan Jumat: kembalikan Dzuhur ke My Day
          if (existing) {
            if (existing._jumatHidden) {
              existing._jumatHidden = false;
              existing.myday = true;
              changed = true;
            }
            // Reset fallback: done dari hari lalu tanpa _nextDue (processRepeatReset belum jalan)
            if (existing.done && !existing._nextDue && existing.doneDate && existing.doneDate < todayStr) {
              existing.done     = false;
              existing.doneDate = null;
              existing.due      = todayStr;
              existing.myday    = true;
              changed = true;
            }
            updateReminder(existing, newTime);
          } else {
            buatTask(taskName, newTime);
          }
        }
      } else {
        // ── Sholat lain: buat kalau belum ada, update reminder
        if (existing) {
          // Reset fallback: done dari hari lalu tanpa _nextDue (processRepeatReset belum jalan)
          if (existing.done && !existing._nextDue && existing.doneDate && existing.doneDate < todayStr) {
            existing.done     = false;
            existing.doneDate = null;
            existing.due      = todayStr;
            existing.myday    = true;
            if (existing.subtasks && existing.subtasks.length) existing.subtasks.forEach(function(s){s.done=false;});
            changed = true;
          }
          updateReminder(existing, newTime);
        } else {
          buatTask(taskName, newTime);
        }
      }
    });

    // ── Sholat Jumat: hanya muncul hari Jumat ─────────────────
    var jumatName = '🕌 Sholat Jumat';
    var jumatTime = timings['Dhuhr']; // waktu Dzuhur = patokan Jumat
    var jumatTask = findByName(jumatName);

    if (isJumat) {
      if (jumatTask) {
        // Kalau sudah done hari ini & punya _nextDue → biarkan, repeat flow sudah jalan
        // Kalau done dari minggu lalu tanpa _nextDue → reset manual (fallback processRepeatReset)
        if (jumatTask.done && !jumatTask._nextDue && jumatTask.doneDate && jumatTask.doneDate < todayStr) {
          jumatTask.done     = false;
          jumatTask.doneDate = null;
          jumatTask.due      = todayStr;
          jumatTask.myday    = true;
          if (jumatTask.subtasks && jumatTask.subtasks.length) jumatTask.subtasks.forEach(function(s){s.done=false;});
          changed = true;
        } else if (!jumatTask.done) {
          jumatTask.myday = true;
          jumatTask.due   = todayStr;
          changed = true;
        }
        updateReminder(jumatTask, jumatTime);
      } else {
        buatTask(jumatName, jumatTime, 'Mingguan');
      }
    } else {
      // Bukan Jumat: keluarkan task Jumat dari My Day + hapus reminder
      if (jumatTask) {
        var jumatChanged = false;
        if (jumatTask.myday)    { jumatTask.myday    = false; jumatChanged = true; }
        if (jumatTask.reminder) { jumatTask.reminder = '';    jumatChanged = true; }
        if (jumatTask.due && jumatTask.due !== todayStr) { jumatTask.due = todayStr; jumatChanged = true; }
        if (jumatChanged) changed = true;
      }
    }

    // ── Simpan & render ───────────────────────────────────────
    if (changed) {
      if (typeof saveData      === 'function') saveData(true);
      if (typeof render        === 'function') render();
      if (typeof scheduleReminders === 'function') scheduleReminders();
      if (typeof showToast     === 'function') showToast('✅ Jadwal sholat ' + _sholatKota + ' tersinkron');
    }
  });
}

// ── LOAD & RENDER PANEL ───────────────────────────────────────
function sholatLoadAndRender() {
  var content = document.getElementById('sholat-content');
  if (!content) return;
  if (!_sholatKota) return;
  content.innerHTML = '<div class="sholat-loading">⏳ Memuat...</div>';
  sholatFetch(function(timings) {
    if (!timings) {
      content.innerHTML = '<div class="sholat-empty">Gagal memuat. Cek koneksi.</div>';
      return;
    }
    var now     = new Date();
    var nowMins = now.getHours() * 60 + now.getMinutes();
    var mins    = SHOLAT_KEYS.map(function(k) {
      var p = timings[k].split(':'); return parseInt(p[0])*60+parseInt(p[1]);
    });
    var nextIdx = -1;
    for (var i = 0; i < mins.length; i++) { if (mins[i] > nowMins) { nextIdx = i; break; } }

    var html = '<div class="sholat-kota-label">📍 ' + _sholatKota + '</div><div class="sholat-list">';
    SHOLAT_NAMES.forEach(function(name, i) {
      var isNext = (i === nextIdx);
      html += '<div class="sholat-item' + (isNext ? ' next' : '') + '">'
        + '<div class="sholat-item-left">'
        + '<span class="sholat-item-icon">' + SHOLAT_ICONS[i] + '</span>'
        + '<span class="sholat-item-name">' + name
        + (isNext ? '<span class="sholat-next-badge">Berikutnya</span>' : '')
        + '</span></div>'
        + '<span class="sholat-item-time">' + timings[SHOLAT_KEYS[i]] + '</span>'
        + '</div>';
    });
    html += '</div>';
    content.innerHTML = html;
  });
}

// ── AUTO-RUN SAAT APP BUKA ────────────────────────────────────
// Tunggu tasks loaded, lalu inject/update task sholat hari ini
(function() {
  if (!_sholatEnabled || !_sholatKota) return;
  var todayStr = localDateStr(new Date());
  // Cek apakah task sholat hari ini sudah ada & remindernya sudah benar
  // Kalau belum, jalankan autoInject setelah app siap
  var _tryCount = 0;
  function _waitReady() {
    _tryCount++;
    if (_tryCount > 30) return; // max 15 detik
    if (typeof tasks === 'undefined' || typeof nextId === 'undefined') {
      setTimeout(_waitReady, 500); return;
    }
    // Cek apakah sudah ada task sholat hari ini dengan tanggal yang benar
    var todayKey = localStorage.getItem('chitask_sholat_lastrun');
    var isJumatNow = (new Date().getDay() === 5);
    if (todayKey === todayStr) {
      // Sudah inject hari ini — tapi kalau hari Jumat, pastikan task Jumat sudah ada & aktif
      if (isJumatNow) {
        var jumatTask = (tasks||[]).filter(function(t){ return t.name === '🕌 Sholat Jumat'; })[0];
        if (!jumatTask || !jumatTask.myday) {
          // Task Jumat belum ada atau belum aktif — force re-inject
          localStorage.removeItem('chitask_sholat_lastrun');
          sholatAutoInject();
          localStorage.setItem('chitask_sholat_lastrun', todayStr);
          return;
        }
      }
      // Sudah inject hari ini, cukup reschedule reminder
      if (typeof scheduleReminders === 'function') setTimeout(scheduleReminders, 1000);
      return;
    }
    // Belum inject hari ini — fetch dan inject
    sholatAutoInject();
    localStorage.setItem('chitask_sholat_lastrun', todayStr);
  }
  setTimeout(_waitReady, 1500);
})();

// ── Midnight watcher: deteksi pergantian hari & re-inject sholat ──
(function _sholatMidnightWatch() {
  if (!_sholatEnabled || !_sholatKota) return;
  var _lastWatchDate = localDateStr(new Date());
  setInterval(function() {
    if (!_sholatEnabled || !_sholatKota) return;
    var today = localDateStr(new Date());
    if (today !== _lastWatchDate) {
      _lastWatchDate = today;
      localStorage.removeItem('chitask_sholat_lastrun');
      sholatAutoInject();
      localStorage.setItem('chitask_sholat_lastrun', today);
    }
  }, 60 * 1000); // cek setiap 1 menit
})();

// ── Visibility watcher: re-inject sholat saat tab aktif kembali setelah hari berganti ──
(function _sholatVisibilityWatch() {
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState !== 'visible') return;
    if (!_sholatEnabled || !_sholatKota) return;
    var today = localDateStr(new Date());
    var lastRun = localStorage.getItem('chitask_sholat_lastrun');
    if (lastRun !== today) {
      localStorage.removeItem('chitask_sholat_lastrun');
      sholatAutoInject();
      localStorage.setItem('chitask_sholat_lastrun', today);
    }
  });
})();

// Update lastrun key setelah inject berhasil (hook ke saveData)
var _origSaveData = typeof saveData === 'function' ? saveData : null;

