// ╔══════════════════════════════════════════════════════════════╗
// ║   ANNOUNCEMENT SYSTEM — ChiTask                              ║
// ║   - Pengumuman dari developer ke semua user                  ║
// ║   - Real-time listener via Firestore                         ║
// ║   - Support antrian, guest mode, gambar, custom button       ║
// ╚══════════════════════════════════════════════════════════════╝

// ══════════════════════════════════════════════════════════════════
// ANNOUNCEMENT SYSTEM — Semua fungsi
// ══════════════════════════════════════════════════════════════════

var _ANN_DEVELOPER_UID = ''; // TODO: ganti dengan UID akun developer kamu dari Firebase Console

function isDeveloper(){
  if(!_ANN_DEVELOPER_UID) return false;
  return fbUser && fbUser.uid === _ANN_DEVELOPER_UID;
}

// ── Mulai listener real-time saat user login ──
// ── Antrian pengumuman untuk tampil satu per satu ──
var _annUnsubscribe = null;
var _annQueue = [];
var _annShowing = false;
// FIX #2: Throttle mode 'always' — catat ID yang sudah dismiss di sesi ini
var _annSessionDismissed = {};

// FIX #3: annStartListener dipanggil dari initApp (setelah fbDb siap), bukan dari onAuthStateChanged
// FIX #5: Guest mendapat pengumuman via one-time fetch (tanpa Firestore listener & tanpa readIds)
function annStartListener(){
  // Berhenti listener lama kalau ada (FIX #1 support)
  if(_annUnsubscribe){ _annUnsubscribe(); _annUnsubscribe=null; }

  if(fbUser && !fbUser._isGuest){
    if(!fbDb) return; // fbDb null = pure offline, tidak ada pengumuman untuk user Google
    // ── Login Google: real-time listener seperti sebelumnya ──
    _annUnsubscribe = fbDb.collection('announcements')
      .where('active','==',true)
      .onSnapshot(function(snapshot){
        var anns = [];
        snapshot.forEach(function(doc){ anns.push(Object.assign({id:doc.id}, doc.data())); });
        _annProcessAndShow(anns);
      }, function(err){ console.warn('Announcement listener error:', err); });
  } else if(fbUser && fbUser._isGuest){
    // FIX #5 (revised): Guest — one-time fetch pakai Firestore.
    // fbDb bisa saja belum tersedia saat loginAsGuest() dipanggil karena Firebase SDK
    // masih loading. Retry polling sampai fbDb siap (max 15 detik).
    if(fbDb){
      fbDb.collection('announcements').where('active','==',true).get().then(function(snapshot){
        var anns = [];
        snapshot.forEach(function(doc){ anns.push(Object.assign({id:doc.id}, doc.data())); });
        _annProcessAndShowGuest(anns);
      }).catch(function(err){ console.warn('Guest announcement fetch error:', err); });
    } else {
      // fbDb belum siap — polling sampai tersedia
      var _annGuestRetries = 0;
      var _annGuestPoll = setInterval(function(){
        _annGuestRetries++;
        if(fbDb){
          clearInterval(_annGuestPoll);
          fbDb.collection('announcements').where('active','==',true).get().then(function(snapshot){
            var anns = [];
            snapshot.forEach(function(doc){ anns.push(Object.assign({id:doc.id}, doc.data())); });
            _annProcessAndShowGuest(anns);
          }).catch(function(err){ console.warn('Guest announcement fetch error:', err); });
        } else if(_annGuestRetries >= 50){ // max ~15 detik (50 x 300ms)
          clearInterval(_annGuestPoll);
          console.warn('annStartListener: fbDb tidak tersedia setelah 15 detik, guest announcement dilewati.');
        }
      }, 300);
    }
  }
}

// ── Stop listener saat logout ──
function annStopListener(){
  if(_annUnsubscribe){ _annUnsubscribe(); _annUnsubscribe=null; }
  // Reset antrian & sesi saat logout
  _annQueue = [];
  _annShowing = false;
  _annSessionDismissed = {};
}

// ── Proses pengumuman untuk user Google (dengan readIds Firestore) ──
function _annProcessAndShow(anns){
  if(!anns || !anns.length){ window._annAllDone = true; return; }
  var now = Date.now();
  var valid = anns.filter(function(a){
    if(!a.active) return false;
    if(a.expiresAt && a.expiresAt.toMillis && a.expiresAt.toMillis() < now) return false;
    if(a.expiresAt && typeof a.expiresAt === 'number' && a.expiresAt < now) return false;
    return true;
  });
  if(!valid.length){ window._annAllDone = true; return; }
  valid.sort(function(a,b){
    return (b.createdAt&&b.createdAt.toMillis?b.createdAt.toMillis():0)
          -(a.createdAt&&a.createdAt.toMillis?a.createdAt.toMillis():0);
  });
  // BUG FIX #6: Jangan pakai readIds dari closure (stale).
  // Selalu baca fresh dari Firestore saat enqueue, dan saat dismiss pakai merge
  // sehingga tiap dismiss hanya menambah 1 ID ke Firestore tanpa overwrite yang lain.
  fbDb.collection('announcement_reads').doc(fbUser.uid).get().then(function(doc){
    var readIds = (doc.exists && doc.data().readIds) ? doc.data().readIds : [];
    _annEnqueue(valid, readIds);
  }).catch(function(){
    _annEnqueue(valid, []);
  });
}

// FIX #5: Proses pengumuman untuk guest (localStorage sebagai readIds, tanpa Firestore write)
function _annProcessAndShowGuest(anns){
  if(!anns || !anns.length){ window._annAllDone = true; return; }
  var now = Date.now();
  var valid = anns.filter(function(a){
    if(!a.active) return false;
    if(a.expiresAt && a.expiresAt.toMillis && a.expiresAt.toMillis() < now) return false;
    if(a.expiresAt && typeof a.expiresAt === 'number' && a.expiresAt < now) return false;
    return true;
  });
  if(!valid.length){ window._annAllDone = true; return; }
  valid.sort(function(a,b){
    return (b.createdAt&&b.createdAt.toMillis?b.createdAt.toMillis():0)
          -(a.createdAt&&a.createdAt.toMillis?a.createdAt.toMillis():0);
  });
  // Baca readIds dari localStorage untuk guest
  var guestReadIds = [];
  try { guestReadIds = JSON.parse(localStorage.getItem('chitask_guest_ann_reads') || '[]'); } catch(e){}
  _annEnqueue(valid, guestReadIds);
}

// FIX #4: Antrian — semua pengumuman yang belum dibaca ditampilkan satu per satu
function _annEnqueue(valid, readIds){
  var toShow = valid.filter(function(a){
    // FIX #2: mode 'always' hanya muncul sekali per sesi (bukan setiap kali snapshot)
    if(a.displayMode === 'always') return !_annSessionDismissed[a.id];
    if(a.displayMode === 'once_per_session') return !_annSessionDismissed[a.id];
    return readIds.indexOf(a.id) < 0;
  });
  if(!toShow.length){ window._annAllDone = true; return; }
  // Tambahkan ke antrian hanya yang belum ada di antrian
  toShow.forEach(function(a){
    var alreadyQueued = _annQueue.some(function(q){ return q.ann.id === a.id; });
    if(!alreadyQueued) _annQueue.push({ ann:a });
  });
  _annDequeueNext();
}

function _annDequeueNext(){
  if(_annShowing || !_annQueue.length) return;
  // Tahan pengumuman selama tutorial/onboarding sedang berjalan
  if(typeof _tourActive !== 'undefined' && _tourActive) return;
  // Tahan sampai splash selesai DAN nav+gami onboarding sudah dilalui
  if(!window._splashDismissed) return;
  if(!window._onboardingFlowDone) return;
  // Tahan selama username onboarding prompt masih tampil
  if(document.getElementById('char-username-onboarding')) return;
  var item = _annQueue.shift();
  _annShowing = true;
  _annShowPopup(item.ann);
}

// ── Tampilkan popup pengumuman ──
function _annShowPopup(ann){
  var overlay = document.getElementById('annOverlay');
  if(!overlay) return;
  var iconMap    = { warning:'⚠️', success:'✅', info:'📢', danger:'🚨', promo:'🎁' };
  var dismissMap = { warning:'⚠️ Oke, Mengerti', success:'✅ Mantap!', info:'✓ Oke, Mengerti!', danger:'🚨 Oke, Dipahami', promo:'🎁 Klaim Sekarang' };
  var styleKey = ann.style || 'info';
  var card = document.getElementById('annCard');
  var imgMode = ann.imageMode || 'thumbnail'; // 'thumbnail' | 'fullimage'

  // Resolve imgSrc dulu sebelum menentukan isFullImage
  var _isMobileViewEarly = window.innerWidth < 768;
  var _resolvedImgSrcEarly = null;
  if(ann.imagePortrait || ann.imageLandscape){
    _resolvedImgSrcEarly = _isMobileViewEarly
      ? (ann.imagePortrait || ann.imageLandscape)
      : (ann.imageLandscape || ann.imagePortrait);
  } else {
    _resolvedImgSrcEarly = ann.imageUrl || ann.imageBase64 || null;
  }
  // Sistem baru (portrait/landscape) → selalu full image
  // Sistem lama (imageBase64/imageUrl) → hanya kalau imageMode === 'fullimage'
  var isFullImage = !!_resolvedImgSrcEarly && (
    !!(ann.imagePortrait || ann.imageLandscape) || imgMode === 'fullimage'
  );

  card.setAttribute('data-ann-style', styleKey);
  // Mode fullimage: sembunyikan header, icon, body teks
  var headerEl = document.getElementById('annPopupHeader');
  var bodyEl   = document.getElementById('annPopupBody');
  if(isFullImage){
    card.classList.add('ann-fullimage-mode');
  } else {
    card.classList.remove('ann-fullimage-mode');
  }
  var footerEl = document.getElementById('annPopupFooter');
  if(headerEl)  headerEl.style.display  = isFullImage ? 'none' : '';
  if(bodyEl)    bodyEl.style.display    = isFullImage ? 'none' : '';
  if(footerEl)  footerEl.style.display  = isFullImage ? 'none' : '';

  document.getElementById('annIcon').textContent = iconMap[styleKey] || '📢';
  document.getElementById('annTitle').textContent = ann.title || 'Pengumuman';
  // Render HTML (rich text dari editor)
  var msgEl = document.getElementById('annMessage');
  var rawMsg = ann.message || '';
  if(/<[a-z][\s\S]*>/i.test(rawMsg)){
    msgEl.innerHTML = rawMsg;
  } else {
    msgEl.innerHTML = rawMsg.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
  }
  document.getElementById('annDismissBtn').textContent = dismissMap[styleKey] || '✓ Oke, Mengerti!';

  var timeBadge = document.getElementById('annTimeBadge');
  if(timeBadge){
    var ts = ann.createdAt && ann.createdAt.toDate ? ann.createdAt.toDate() : null;
    timeBadge.textContent = ts ? _relativeTime(ts) : '';
  }

  var footer = document.getElementById('annFooterNote');
  if(footer){
    var isGuest = fbUser && fbUser._isGuest;
    footer.textContent = isGuest
      ? 'ChiTask · Pesan untuk semua pengguna'
      : (ann.displayMode === 'always' ? 'ChiTask · Pesan selalu ditampilkan' : 'ChiTask · Pesan dari developer');
  }

  // Gambar iklan — auto-detect device: portrait → mobile, landscape → desktop
  var imgWrap = document.getElementById('annImageWrap');
  var imgEl   = document.getElementById('annImage');
  var imgHint = document.getElementById('annImageLinkHint');
  if(imgWrap && imgEl){
    // Pakai hasil resolve yang sudah dihitung di atas (konsisten dengan isFullImage)
    var _isMobileView = _isMobileViewEarly;
    var imgSrc = _resolvedImgSrcEarly;
    var resolvedOrient = 'portrait';
    if(ann.imagePortrait || ann.imageLandscape){
      // Sistem baru: dua gambar terpisah
      if(_isMobileView){
        resolvedOrient = ann.imagePortrait ? 'portrait' : 'landscape';
      } else {
        resolvedOrient = ann.imageLandscape ? 'landscape' : 'portrait';
      }
    } else {
      // Fallback: sistem lama (imageBase64 / imageUrl)
      resolvedOrient = ann.imageOrient || 'portrait';
    }

    var isFullImageResolved = isFullImage;

    if(imgSrc){
      imgEl.src = imgSrc;
      imgWrap.style.display = 'block';
      imgWrap.dataset.link = ann.imageLink || '';
      if(isFullImage || isFullImageResolved){
        imgWrap.style.margin = '0';
        imgWrap.style.borderRadius = '0';
        imgWrap.style.overflow = 'hidden';
        if(resolvedOrient === 'landscape'){
          imgEl.style.maxHeight = '';
          imgEl.style.height = 'auto';
          imgEl.style.width = '100%';
          imgEl.style.objectFit = 'cover';
          imgEl.style.aspectRatio = '16/9';
        } else {
          imgEl.style.maxHeight = '';
          imgEl.style.height = 'auto';
          imgEl.style.width = '100%';
          imgEl.style.objectFit = 'cover';
          imgEl.style.aspectRatio = '';
        }
        card.style.paddingTop = '0';
        card.style.overflow = 'hidden';
      } else {
        imgWrap.style.margin = '0 0 16px 0';
        imgWrap.style.borderRadius = '14px';
        imgEl.style.maxHeight = '220px';
        imgEl.style.height = '';
        imgEl.style.width = '100%';
        imgEl.style.objectFit = 'cover';
        imgEl.style.aspectRatio = '';
        card.style.paddingTop = '';
        card.style.overflow = '';
      }
      if(imgHint) imgHint.style.display = ann.imageLink ? 'block' : 'none';
    } else {
      imgWrap.style.display = 'none';
      imgEl.src = '';
      imgWrap.dataset.link = '';
      if(imgHint) imgHint.style.display = 'none';
      card.style.paddingTop = '';
      card.style.overflow = '';
    }
  }

  // Custom button
  var cbWrap = document.getElementById('annCustomBtnWrap');
  if(cbWrap){
    if(ann.customBtnEnabled && ann.customBtnText){
      cbWrap.style.display = 'block';
      var cbBtn = document.getElementById('annCustomBtn');
      if(cbBtn){
        cbBtn.textContent = ann.customBtnText;
        if(ann.customBtnAction === 'close'){
          cbBtn.onclick = function(){ _annDismiss(ann); };
        } else {
          cbBtn.onclick = function(){
            if(ann.customBtnUrl) window.open(ann.customBtnUrl, '_blank', 'noopener');
            _annDismiss(ann);
          };
        }
      }
    } else {
      cbWrap.style.display = 'none';
    }
  }

  // Full-image mode: tambahkan tombol X di atas gambar
  var fxClose = document.getElementById('annFullImgClose');
  if(fxClose) fxClose.style.display = isFullImage ? 'flex' : 'none';

  // FIX #7: Click-outside overlay juga dismiss
  overlay.onclick = function(e){ if(e.target === overlay) _annDismiss(ann); };
  document.getElementById('annDismissBtn').onclick = function(){ _annDismiss(ann); };
  overlay.style.display = 'flex';
  setTimeout(function(){ card.classList.add('ann-visible'); }, 15);
}

// Klik gambar iklan → buka link di tab baru (jika ada)
function annImageClick(){
  var imgWrap = document.getElementById('annImageWrap');
  if(!imgWrap) return;
  var link = imgWrap.dataset.link;
  if(link) window.open(link, '_blank', 'noopener');
}

// ── Toggle custom button section di new dpContent-ann UI ──
var _dpAnnCustomBtnActive = false;
function dpAnnToggleCustomBtn(){
  _dpAnnCustomBtnActive = !_dpAnnCustomBtnActive;
  var details = document.getElementById('dpAnnCustomBtnDetails');
  var hint    = document.getElementById('dpAnnCustomBtnHint');
  var bg      = document.getElementById('dpAnnCustomBtnToggleBg');
  var dot     = document.getElementById('dpAnnCustomBtnToggleDot');
  var lbl     = document.getElementById('dpAnnCustomBtnToggleLabel');
  if(details) details.style.display = _dpAnnCustomBtnActive ? 'block' : 'none';
  if(hint)    hint.style.display    = _dpAnnCustomBtnActive ? 'none'  : 'block';
  if(bg)   bg.style.background   = _dpAnnCustomBtnActive ? 'rgba(34,197,94,0.6)' : 'rgba(255,255,255,0.1)';
  if(dot)  dot.style.transform   = _dpAnnCustomBtnActive ? 'translateX(16px)' : 'translateX(0)';
  if(dot)  dot.style.background  = _dpAnnCustomBtnActive ? '#fff' : 'rgba(255,255,255,0.35)';
  if(lbl)  lbl.textContent       = _dpAnnCustomBtnActive ? 'Aktif' : 'Nonaktif';
  if(lbl)  lbl.style.color       = _dpAnnCustomBtnActive ? '#4ade80' : 'rgba(255,255,255,0.35)';
  // Default aksi = close saat pertama aktif
  if(_dpAnnCustomBtnActive) dpAnnSetCustomBtnAction('close', document.getElementById('dpAnnCBAction-close'));
}

// ── Pilih aksi tombol: 'close' atau 'link' ──
var _dpAnnCustomBtnAction = 'close';
function dpAnnSetCustomBtnAction(action, btn){
  _dpAnnCustomBtnAction = action;
  var urlWrap = document.getElementById('dpAnnCustomBtnUrlWrap');
  if(urlWrap) urlWrap.style.display = (action === 'link') ? 'block' : 'none';
  // Update visual tombol
  ['close','link'].forEach(function(a){
    var b = document.getElementById('dpAnnCBAction-'+a);
    if(!b) return;
    if(a === action){
      b.style.borderColor = 'rgba(34,197,94,0.6)';
      b.style.background  = 'rgba(34,197,94,0.15)';
      b.style.color       = '#4ade80';
    } else {
      b.style.borderColor = 'rgba(255,255,255,0.1)';
      b.style.background  = 'rgba(255,255,255,0.04)';
      b.style.color       = 'rgba(255,255,255,0.35)';
    }
  });
}

// Toggle custom button section di admin panel
function _devAnnToggleCustomBtn(enabled){
  var wrap = document.getElementById('devAnnCustomBtnDetails');
  if(wrap) wrap.style.display = enabled ? 'block' : 'none';
}

// Toggle URL field berdasarkan action pilihan
function _devAnnToggleCustomBtnAction(action){
  var urlWrap = document.getElementById('devAnnCustomBtnUrlWrap');
  if(urlWrap) urlWrap.style.display = (action === 'link') ? 'block' : 'none';
}

// Toggle guide ukuran & update preview gambar ketika mode/orient berubah
function _devAnnImgModeChanged(){
  var modeEl = document.getElementById('devAnnImgMode');
  var orientEl = document.getElementById('devAnnImgOrient');
  var guideEl = document.getElementById('devAnnImgGuide');
  var orientWrap = document.getElementById('devAnnOrientWrap');
  var msgSectionEl = document.getElementById('devAnnMsgSection');
  var imgMode = modeEl ? modeEl.value : 'thumbnail';
  var orient = orientEl ? orientEl.value : 'portrait';
  // Sembunyikan field pesan jika full image
  if(msgSectionEl) msgSectionEl.style.opacity = imgMode === 'fullimage' ? '0.4' : '1';
  // Tampilkan orient selector hanya jika fullimage
  if(orientWrap) orientWrap.style.display = imgMode === 'fullimage' ? 'flex' : 'none';
  _devAnnUpdateGuide(imgMode, orient, guideEl);
  // Update preview jika ada gambar
  if(_devAnnImgBase64){
    var preview = document.getElementById('devAnnImgPreview');
    _devAnnUpdatePreviewStyle(imgMode, orient, preview);
  }
}

function _devAnnUpdateGuide(imgMode, orient, guideEl){
  if(!guideEl) return;
  var guides = {
    'thumbnail': '📐 <b>Thumbnail</b> — Gambar kecil di bawah teks. Ukuran bebas, disarankan lebar minimal <b>600px</b>, rasio apapun (akan di-crop maks 220px tinggi).',
    'fullimage-portrait': '📐 <b>Full Gambar · Portrait</b> — Gambar memenuhi lebar kartu.<br>• <b>Mobile</b>: 750 × 1100px (rasio ~2:3) — ideal untuk HP vertikal<br>• <b>Desktop</b>: 800 × 1000px (rasio 4:5) — tetap proporsional<br>• Gambar akan di-scale otomatis sesuai lebar layar.',
    'fullimage-landscape': '📐 <b>Full Gambar · Landscape</b> — Gambar lebar 16:9, cocok untuk banner promo.<br>• <b>Mobile</b>: 1280 × 720px (rasio 16:9) — nyaman di HP horizontal<br>• <b>Desktop</b>: 1280 × 720px — ideal untuk monitor lebar<br>• Tidak perlu padding, gambar langsung penuh.'
  };
  var key = imgMode === 'fullimage' ? 'fullimage-' + orient : 'thumbnail';
  guideEl.innerHTML = guides[key] || '';
  guideEl.style.display = 'block';
}

function _relativeTime(date){
  var diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if(diff < 60) return 'Baru saja';
  if(diff < 3600) return Math.floor(diff/60) + ' mnt lalu';
  if(diff < 86400) return Math.floor(diff/3600) + ' jam lalu';
  return Math.floor(diff/86400) + ' hari lalu';
}

// ── Dismiss: tutup popup, catat readId, lanjut ke antrian berikutnya ──
function _annDismiss(ann){
  var overlay = document.getElementById('annOverlay');
  var card = document.getElementById('annCard');
  // Lepas onclick overlay agar tidak terpanggil lagi setelah tutup
  overlay.onclick = null;
  card.classList.remove('ann-visible');
  card.style.transform='translateY(16px) scale(0.94)'; card.style.opacity='0';
  setTimeout(function(){
    overlay.style.display='none';
    card.style.transform=''; card.style.opacity='';
    // Kembalikan z-index annOverlay jika ada dev preview cleanup
    if(typeof window._devPreviewCleanupOnce === 'function'){
      window._devPreviewCleanupOnce();
      window._devPreviewCleanupOnce = null;
    }
    // FIX #4: Lanjut tampilkan pengumuman berikutnya di antrian
    _annShowing = false;
    _annDequeueNext();
    // Set flag global ketika semua pengumuman sudah habis ditampilkan
    if(!_annQueue.length && !_annShowing) window._annAllDone = true;
  }, 280);

  // FIX #2: Tandai sudah dismiss di sesi ini (untuk mode 'always')
  _annSessionDismissed[ann.id] = true;

  // once_per_session: hanya simpan ke _annSessionDismissed (sudah done di atas), tidak ke Firestore/localStorage
  if(ann.displayMode !== 'always' && ann.displayMode !== 'once_per_session'){
    var isGuest = fbUser && fbUser._isGuest;
    if(isGuest){
      // FIX #5: Guest — simpan ke localStorage (fresh read dulu agar tidak overwrite)
      var guestReadIds = [];
      try { guestReadIds = JSON.parse(localStorage.getItem('chitask_guest_ann_reads') || '[]'); } catch(e){}
      if(guestReadIds.indexOf(ann.id) < 0) guestReadIds.push(ann.id);
      try { localStorage.setItem('chitask_guest_ann_reads', JSON.stringify(guestReadIds)); } catch(e){}
    } else if(fbDb && fbUser){
      // FIX #6: User Google — pakai merge:true dengan array union agar tidak overwrite
      // readIds dari sesi lain yang lebih baru. Tidak bergantung closure readIds lama.
      fbDb.collection('announcement_reads').doc(fbUser.uid)
        .set({
          readIds: firebase.firestore.FieldValue.arrayUnion(ann.id)
        }, { merge: true })
        .catch(function(e){ console.warn('annDismiss save error:', e); });
    }
  }
}

// ══════════════════════════════════════════════
// DEVELOPER — Fungsi panel lengkap (v3)
// ══════════════════════════════════════════════

// ── Hidden style field (chip selector) ──
var _devAnnSelectedStyle = 'info';

function devSelectStyle(style, btn){
  _devAnnSelectedStyle = style;
  var styleColors = {
    info:    { border:'#3b82f6', bg:'rgba(59,130,246,0.15)',   color:'#60a5fa' },
    success: { border:'#10b981', bg:'rgba(16,185,129,0.15)',   color:'#34d399' },
    warning: { border:'#f59e0b', bg:'rgba(245,158,11,0.15)',   color:'#fbbf24' },
    danger:  { border:'#ef4444', bg:'rgba(239,68,68,0.15)',    color:'#f87171' },
    promo:   { border:'#8b5cf6', bg:'rgba(139,92,246,0.15)',   color:'#a78bfa' }
  };
  document.querySelectorAll('.dev-style-chip').forEach(function(c){
    c.style.borderColor='rgba(255,255,255,0.12)';
    c.style.background='rgba(255,255,255,0.05)';
    c.style.color='rgba(255,255,255,0.4)';
  });
  var sc = styleColors[style] || styleColors['info'];
  btn.style.borderColor = sc.border;
  btn.style.background  = sc.bg;
  btn.style.color       = sc.color;
}

// ── Image mode toggle helper ──
function _devAnnSetImgMode(mode, btn){
  document.getElementById('devAnnImgMode').value = mode;
  var modes = ['thumbnail','fullimage'];
  modes.forEach(function(m){
    var b = document.getElementById('devAnnImgModeBtn-'+m);
    if(!b) return;
    if(m === mode){
      b.style.borderColor='rgba(217,119,6,0.7)'; b.style.background='rgba(217,119,6,0.12)'; b.style.color='#fbbf24';
    } else {
      b.style.borderColor='rgba(255,255,255,0.1)'; b.style.background='rgba(255,255,255,0.04)'; b.style.color='rgba(255,255,255,0.4)';
    }
  });
  _devAnnImgModeChanged();
}

function _devAnnSetOrient(orient, btn){
  document.getElementById('devAnnImgOrient').value = orient;
  ['portrait','landscape'].forEach(function(o){
    var b = document.getElementById('devAnnOrientBtn-'+o);
    if(!b) return;
    if(o === orient){
      b.style.borderColor='rgba(217,119,6,0.7)'; b.style.background='rgba(217,119,6,0.12)'; b.style.color='#fbbf24';
    } else {
      b.style.borderColor='rgba(255,255,255,0.1)'; b.style.background='rgba(255,255,255,0.04)'; b.style.color='rgba(255,255,255,0.4)';
    }
  });
  _devAnnImgModeChanged();
}



var _devAnnImgBase64 = null; // base64 final (sudah dikompres, siap simpan ke Firestore)

function devAnnHandleImg(file){
  if(!file) return;
  if(!file.type.startsWith('image/')){ showToast('⚠️ File harus berupa gambar!'); return; }
  var originalKB = Math.round(file.size / 1024);
  var info = document.getElementById('devAnnImgInfo');
  if(info) info.textContent = '⏳ Memproses gambar...';

  var reader = new FileReader();
  reader.onload = function(e){
    var img2 = new Image();
    img2.onload = function(){
      // Target: base64 string < 700KB (aman untuk Firestore 1MB doc limit)
      var TARGET_B64_CHARS = 700 * 1024; // ~700KB karakter base64
      var maxW = 1200, maxH = 1200;
      var w = img2.width, h = img2.height;

      // Fungsi kompres dengan dimensi & kualitas tertentu
      function _compress(maxDim, quality){
        var canvas = document.createElement('canvas');
        var scale = Math.min(maxDim/w, maxDim/h, 1);
        canvas.width  = Math.round(w * scale);
        canvas.height = Math.round(h * scale);
        canvas.getContext('2d').drawImage(img2, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', quality);
      }

      // Iterasi: turunkan kualitas/dimensi sampai ukuran aman
      var steps = [
        { dim: 1200, q: 0.85 },
        { dim: 1000, q: 0.80 },
        { dim:  900, q: 0.75 },
        { dim:  800, q: 0.70 },
        { dim:  700, q: 0.65 },
        { dim:  600, q: 0.60 },
        { dim:  500, q: 0.55 }
      ];
      var finalB64 = null;
      for(var i = 0; i < steps.length; i++){
        var b64 = _compress(steps[i].dim, steps[i].q);
        if(b64.length <= TARGET_B64_CHARS){ finalB64 = b64; break; }
        // Simpan hasil terakhir sebagai fallback
        finalB64 = b64;
      }

      var finalKB = Math.round(finalB64.length * 0.75 / 1024);
      _devAnnImgBase64 = finalB64;

      var preview     = document.getElementById('devAnnImgPreview');
      var placeholder = document.getElementById('devAnnImgPlaceholder');
      var removeBtn   = document.getElementById('devAnnImgRemove');
      var linkWrap    = document.getElementById('devAnnLinkWrap');
      var modeEl      = document.getElementById('devAnnImgMode');
      var imgMode     = modeEl ? modeEl.value : 'thumbnail';
      var orientEl    = document.getElementById('devAnnImgOrient');
      var orient      = orientEl ? orientEl.value : 'portrait';

      _devAnnUpdatePreviewStyle(imgMode, orient, preview);
      if(preview) preview.src = finalB64;
      if(placeholder) placeholder.style.display = 'none';
      if(removeBtn)   removeBtn.style.display   = 'block';
      if(linkWrap)    linkWrap.style.display     = 'block';

      var sizeOk = finalB64.length <= TARGET_B64_CHARS;
      if(info) info.textContent = (sizeOk ? '✅ ' : '⚠️ ') + file.name
        + ' (' + originalKB + 'KB → ~' + finalKB + 'KB'
        + (sizeOk ? ', aman ✓' : ', mungkin terlalu besar') + ')';

      if(originalKB > finalKB){
        showToast('📐 Dikompres: ' + originalKB + 'KB → ~' + finalKB + 'KB');
      }
    };
    img2.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function devAnnRemoveImg(){
  _devAnnImgBase64 = null;
  var preview = document.getElementById('devAnnImgPreview');
  var placeholder = document.getElementById('devAnnImgPlaceholder');
  var removeBtn = document.getElementById('devAnnImgRemove');
  var info = document.getElementById('devAnnImgInfo');
  var linkWrap = document.getElementById('devAnnLinkWrap');
  var input = document.getElementById('devAnnImgInput');
  if(preview){ preview.src=''; preview.style.display='none'; preview.style.maxHeight=''; preview.style.height=''; preview.style.aspectRatio=''; preview.style.objectFit='cover'; }
  if(placeholder) placeholder.style.display='flex';
  if(removeBtn) removeBtn.style.display='none';
  if(info) info.textContent='';
  if(linkWrap) linkWrap.style.display='none';
  if(input) input.value='';
}

// Helper: update preview style sesuai mode & orientasi gambar
function _devAnnUpdatePreviewStyle(imgMode, orient, previewEl){
  if(!previewEl) return;
  if(imgMode === 'fullimage'){
    if(orient === 'portrait'){
      previewEl.style.maxHeight = '340px';
      previewEl.style.height = '340px';
      previewEl.style.aspectRatio = '';
      previewEl.style.width = '100%';
      previewEl.style.objectFit = 'cover';
    } else {
      previewEl.style.maxHeight = '200px';
      previewEl.style.height = '200px';
      previewEl.style.aspectRatio = '16/9';
      previewEl.style.width = '100%';
      previewEl.style.objectFit = 'cover';
    }
  } else {
    previewEl.style.maxHeight = '120px';
    previewEl.style.height = '';
    previewEl.style.aspectRatio = '';
    previewEl.style.width = '100%';
    previewEl.style.objectFit = 'cover';
  }
  previewEl.style.display = 'block';
}

function devAnnExec(cmd, val){
  document.getElementById('devAnnMessage').focus();
  document.execCommand(cmd, false, val || null);
}
function devAnnCountChars(el){
  var cnt = document.getElementById('devAnnCharCount');
  if(cnt) cnt.textContent = (el.innerText || el.textContent || '').length;
}

function devAnnPreview(){
  var title   = document.getElementById('devAnnTitle').value.trim() || 'Preview Judul';
  var msgEl   = document.getElementById('devAnnMessage');
  var message = msgEl.innerHTML.trim() || '<em>Ini adalah preview pesan pengumuman.</em>';
  var linkEl  = document.getElementById('devAnnLink');
  var modeEl  = document.getElementById('devAnnImgMode');
  var orientEl= document.getElementById('devAnnImgOrient');
  var cbEnEl  = document.getElementById('devAnnCustomBtnEnabled');
  var cbTxtEl = document.getElementById('devAnnCustomBtnText');
  var cbUrlEl = document.getElementById('devAnnCustomBtnUrl');
  var cbActEl = document.getElementById('devAnnCustomBtnAction');
  var ann = {
    id:'__preview__', title:title, message:message,
    style:_devAnnSelectedStyle||'info', displayMode:'always', createdAt:null,
    imageBase64: _devAnnImgBase64 || null,
    imageLink:   (linkEl && linkEl.value.trim()) || null,
    imageMode:   (modeEl && modeEl.value) || 'thumbnail',
    imageOrient: (orientEl && orientEl.value) || 'portrait',
    customBtnEnabled: cbEnEl ? cbEnEl.checked : false,
    customBtnText:    (cbTxtEl && cbTxtEl.value.trim()) || 'Selengkapnya',
    customBtnUrl:     (cbUrlEl && cbUrlEl.value.trim()) || '',
    customBtnAction:  (cbActEl && cbActEl.value) || 'link'
  };
  // Naikkan z-index annOverlay di atas devPage (9900) agar preview tampil
  var overlayEl = document.getElementById('annOverlay');
  if(overlayEl) overlayEl.style.zIndex = '99980';
  // Kembalikan z-index setelah dismiss
  var _origDismiss = window._annDismissHook;
  var _devPreviewCleanup = function(){
    if(overlayEl) overlayEl.style.zIndex = '';
  };
  // Patch sekali pakai: tambahkan cleanup ke dismiss berikutnya
  var _origAnnDismiss = window._annDismiss;
  window._devPreviewCleanupOnce = _devPreviewCleanup;
  // Reset _annShowing agar preview bisa tampil kapanpun
  _annShowing = false;
  _annShowPopup(ann);
}

// ── Tab switcher ──
function devSwitchTab(tab){
  ['ann','debug','gami','data'].forEach(function(t){
    var content = document.getElementById('devTabContent-'+t);
    var btn     = document.getElementById('devTab-'+t);
    if(!content||!btn) return;
    if(t === tab){
      content.style.display = 'block';
      btn.style.background = 'rgba(217,119,6,0.85)';
      btn.style.color = '#fff';
    } else {
      content.style.display = 'none';
      btn.style.background = 'transparent';
      btn.style.color = 'rgba(255,255,255,0.4)';
    }
  });
  // Info user ditampilkan via modal saat tombol diklik
}

// ── openDevAnnPanel kept for backward compat ──
function openDevAnnPanel(){ devSwitchTab('ann'); }

// ══════════════════════════════════════════════
// DEVELOPER PAGE
// ══════════════════════════════════════════════
var _dpLiveLogs = [];
var _dpNetworkLogs = [];
var _dpLogFilterMode = 'all';
var _dpFlags = {
  'show_task_id':       {label:'Tampilkan Task ID di card', default:false},
  'verbose_sync':       {label:'Verbose sync log ke console', default:false},
  'disable_animations': {label:'Matikan semua animasi', default:false},
  'force_offline':      {label:'Simulasi offline mode', default:false},
  'show_perf_overlay':  {label:'Performance overlay (FPS)', default:false},
};

function openDevPage(){
  var el = document.getElementById('devPage');
  if(!el) return;
  el.style.display = 'flex';
  closeNavPreferenceModal();
  // Set UID label
  var uid = (typeof currentUser !== 'undefined' && currentUser) ? (currentUser.email || currentUser.uid || '—') : '—';
  var lbl = document.getElementById('devPageUidLabel');
  if(lbl) lbl.textContent = 'UID: ' + uid;
  // Init tabs
  dpSwitch('ann');
  // Start live log intercept
  _dpStartLogIntercept();
  // Load stats
  setTimeout(dpLoadStats, 200);
  // Load flags
  dpRenderFlags();
  // Load debug user info
  dpLoadDebugUserInfo();
}

function closeDevPage(){
  var el = document.getElementById('devPage');
  if(el) el.style.display = 'none';
}

function dpSwitch(tab){
  var tabs = ['ann','debug','gami','data','logs','stats','flags'];
  tabs.forEach(function(t){
    var c = document.getElementById('dpContent-'+t);
    var b = document.getElementById('dpTab-'+t);
    if(c) c.style.display = (t===tab)?'block':'none';
    if(b){ b.classList.toggle('dp-tab-active', t===tab); }
  });
  if(tab==='stats') dpLoadStats();
  if(tab==='logs') dpRenderLiveLogs();
}

// ── Announce (bridge to existing functions) ──
function dpAnnExec(cmd, val){ document.execCommand(cmd, false, val||null); }
function dpSelectStyle(style, el){
  document.querySelectorAll('.dp-style-chip').forEach(function(b){ b.style.borderColor='rgba(255,255,255,0.12)'; b.style.background='rgba(255,255,255,0.05)'; b.style.color='rgba(255,255,255,0.4)'; b.classList.remove('dp-style-active'); });
  el.classList.add('dp-style-active');
  var colors = {info:{b:'#3b82f6',bg:'rgba(59,130,246,0.15)',c:'#60a5fa'}, success:{b:'#22c55e',bg:'rgba(34,197,94,0.15)',c:'#4ade80'}, warning:{b:'#f59e0b',bg:'rgba(245,158,11,0.15)',c:'#fbbf24'}, danger:{b:'#ef4444',bg:'rgba(239,68,68,0.15)',c:'#f87171'}, promo:{b:'#a855f7',bg:'rgba(168,85,247,0.15)',c:'#c084fc'}};
  var s = colors[style]||colors.info;
  el.style.borderColor = s.b; el.style.background = s.bg; el.style.color = s.c;
}

// ── Gambar iklan: portrait (mobile) & landscape (desktop) ──
var _dpAnnImgPortrait  = null; // base64 gambar portrait (HP)
var _dpAnnImgLandscape = null; // base64 gambar landscape (Desktop)

function _dpAnnCompressImg(file, maxDim, targetB64, callback){
  if(!file || !file.type.startsWith('image/')){ callback(null,'Bukan file gambar'); return; }
  var reader = new FileReader();
  reader.onload = function(e){
    var img = new Image();
    img.onload = function(){
      var steps = [{dim:maxDim,q:0.88},{dim:Math.round(maxDim*0.85),q:0.82},{dim:Math.round(maxDim*0.75),q:0.76},{dim:Math.round(maxDim*0.65),q:0.70},{dim:Math.round(maxDim*0.55),q:0.63}];
      var finalB64 = null;
      for(var i=0;i<steps.length;i++){
        var canvas=document.createElement('canvas');
        var w=img.width, h=img.height;
        var scale=Math.min(steps[i].dim/w, steps[i].dim/h, 1);
        canvas.width=Math.round(w*scale); canvas.height=Math.round(h*scale);
        canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
        var b64=canvas.toDataURL('image/jpeg',steps[i].q);
        finalB64=b64;
        if(b64.length<=targetB64) break;
      }
      callback(finalB64, null);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function dpAnnHandleImg(type, file){
  // type: 'portrait' | 'landscape'
  if(!file) return;
  var TARGET = 700*1024; // ~700KB base64
  var maxDim = type==='landscape' ? 1400 : 1000;
  var infoEl  = document.getElementById('dpAnnImg'+_cap(type)+'Info');
  var prevEl  = document.getElementById('dpAnnImg'+_cap(type)+'Preview');
  var phEl    = document.getElementById('dpAnnImg'+_cap(type)+'Ph');
  var rmBtn   = document.getElementById('dpAnnImg'+_cap(type)+'Rm');
  if(infoEl) infoEl.textContent = '⏳ Memproses...';
  _dpAnnCompressImg(file, maxDim, TARGET, function(b64, err){
    if(err||!b64){ if(infoEl) infoEl.textContent='❌ '+err; showToast('❌ Gagal proses gambar'); return; }
    var origKB = Math.round(file.size/1024);
    var finalKB = Math.round(b64.length*0.75/1024);
    if(type==='portrait') _dpAnnImgPortrait=b64;
    else _dpAnnImgLandscape=b64;
    if(prevEl){ prevEl.src=b64; prevEl.style.display='block'; }
    if(phEl) phEl.style.display='none';
    if(rmBtn) rmBtn.style.display='inline-flex';
    if(infoEl) infoEl.textContent=(b64.length<=TARGET?'✅ ':'⚠️ ')+file.name+' ('+origKB+'KB → ~'+finalKB+'KB)';
    if(origKB>finalKB) showToast('📐 Dikompres '+type+': '+origKB+'KB → ~'+finalKB+'KB');
  });
}
function _cap(s){ return s.charAt(0).toUpperCase()+s.slice(1); }

function dpAnnRemoveImg(type){
  if(type==='portrait') _dpAnnImgPortrait=null;
  else _dpAnnImgLandscape=null;
  var prevEl = document.getElementById('dpAnnImg'+_cap(type)+'Preview');
  var phEl   = document.getElementById('dpAnnImg'+_cap(type)+'Ph');
  var rmBtn  = document.getElementById('dpAnnImg'+_cap(type)+'Rm');
  var infoEl = document.getElementById('dpAnnImg'+_cap(type)+'Info');
  var inp    = document.getElementById('dpAnnImg'+_cap(type)+'Input');
  if(prevEl){ prevEl.src=''; prevEl.style.display='none'; }
  if(phEl) phEl.style.display='flex';
  if(rmBtn) rmBtn.style.display='none';
  if(infoEl) infoEl.textContent='';
  if(inp) inp.value='';
}

function dpAnnPreview(){
  var title = document.getElementById('dpAnnTitle').value.trim();
  var msg   = document.getElementById('dpAnnMessage').innerHTML.trim();
  var chip  = document.querySelector('.dp-style-chip.dp-style-active');
  var style = chip ? chip.dataset.style : 'info';
  var hasImg = _dpAnnImgPortrait || _dpAnnImgLandscape;
  if(!title){ showToast('⚠️ Judul wajib diisi'); return; }
  if(!msg && !hasImg){ showToast('⚠️ Isi pesan atau upload minimal 1 gambar'); return; }
  // Pilih gambar sesuai device saat preview
  var isMobile = window.innerWidth < 768;
  var imgSrc = isMobile
    ? (_dpAnnImgPortrait || _dpAnnImgLandscape)
    : (_dpAnnImgLandscape || _dpAnnImgPortrait);
  var imgMode   = hasImg ? 'fullimage' : 'none';
  var imgOrient = (_dpAnnImgLandscape && !isMobile) ? 'landscape' : 'portrait';
  var imgLinkEl = document.getElementById('dpAnnImageLink');
  var cbTxtEl   = document.getElementById('dpAnnCustomBtnText');
  var cbUrlEl   = document.getElementById('dpAnnCustomBtnUrl');
  var ann = {
    id:'__preview__', title:title, message:msg||'', style:style,
    displayMode:'always', createdAt:null,
    imageBase64: imgSrc || null,
    imageMode:   imgSrc ? imgMode : 'thumbnail',
    imageOrient: imgOrient,
    imagePortrait:  _dpAnnImgPortrait  || null,
    imageLandscape: _dpAnnImgLandscape || null,
    imageLink: (imgLinkEl && imgLinkEl.value.trim()) || null,
    customBtnEnabled: _dpAnnCustomBtnActive,
    customBtnText:    (_dpAnnCustomBtnActive && cbTxtEl) ? cbTxtEl.value.trim() : null,
    customBtnAction:  _dpAnnCustomBtnActive ? _dpAnnCustomBtnAction : null,
    customBtnUrl:     (_dpAnnCustomBtnActive && _dpAnnCustomBtnAction==='link' && cbUrlEl) ? cbUrlEl.value.trim() : null
  };
  var overlayEl = document.getElementById('annOverlay');
  if(overlayEl) overlayEl.style.zIndex='99980';
  window._devPreviewCleanupOnce = function(){ if(overlayEl) overlayEl.style.zIndex=''; };
  _annShowing = false;
  _annShowPopup(ann);
}

function dpAnnSubmit(){
  var title  = document.getElementById('dpAnnTitle').value.trim();
  var msg    = document.getElementById('dpAnnMessage').innerHTML.trim();
  var plain  = (document.getElementById('dpAnnMessage').innerText||'').trim();
  var mode   = document.getElementById('dpAnnMode').value;
  var expiry = document.getElementById('dpAnnExpiry').value;
  var chip   = document.querySelector('.dp-style-chip.dp-style-active');
  var style  = chip ? chip.dataset.style : 'info';
  var hasImg = _dpAnnImgPortrait || _dpAnnImgLandscape;
  if(!title){ showToast('⚠️ Judul wajib diisi'); return; }
  if(!plain && !hasImg){ showToast('⚠️ Isi pesan atau upload minimal 1 gambar'); return; }
  if(!fbDb){ showToast('Firestore tidak tersambung'); return; }
  // Cek total ukuran base64 aman untuk Firestore (doc limit ~1MB)
  var totalB64Len = (_dpAnnImgPortrait ? _dpAnnImgPortrait.length : 0) + (_dpAnnImgLandscape ? _dpAnnImgLandscape.length : 0);
  if(totalB64Len > 900 * 1024){
    showToast('⚠️ Total gambar terlalu besar (maks ~900KB). Upload salah satu saja atau perkecil gambar.');
    return;
  }
  var btn = document.getElementById('dpAnnSubmitBtn');
  if(btn){ btn.disabled=true; btn.textContent='⏳ Menyimpan...'; }
  var imgLinkEl = document.getElementById('dpAnnImageLink');
  var imgLink   = imgLinkEl ? imgLinkEl.value.trim() : '';
  var cbTxtEl   = document.getElementById('dpAnnCustomBtnText');
  var cbUrlEl   = document.getElementById('dpAnnCustomBtnUrl');
  var cbText    = (cbTxtEl && cbTxtEl.value.trim()) || '';
  var cbUrl     = (cbUrlEl && cbUrlEl.value.trim()) || '';
  if(_dpAnnCustomBtnActive && !cbText){ showToast('⚠️ Isi teks tombol dulu!'); return; }
  if(_dpAnnCustomBtnActive && _dpAnnCustomBtnAction === 'link' && !cbUrl){ showToast('⚠️ Isi URL tombol dulu!'); return; }
  var data = {
    title: title, message: msg, style: style,
    displayMode: mode, active: true,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    createdBy: fbUser ? fbUser.uid : null,
    expiresAt: expiry ? firebase.firestore.Timestamp.fromDate(new Date(expiry)) : null,
    // Dua gambar terpisah: portrait (mobile) & landscape (desktop)
    imagePortrait:  _dpAnnImgPortrait  || null,
    imageLandscape: _dpAnnImgLandscape || null,
    // Compat: imageBase64 = portrait atau landscape (fallback)
    imageBase64: (_dpAnnImgPortrait || _dpAnnImgLandscape) || null,
    imageMode:   hasImg ? 'fullimage' : 'thumbnail',
    imageOrient: _dpAnnImgLandscape ? 'landscape' : 'portrait',
    // Link gambar (klik gambar → buka URL)
    imageLink: imgLink || null,
    // Tombol custom di bawah gambar
    customBtnEnabled: _dpAnnCustomBtnActive,
    customBtnText:    (_dpAnnCustomBtnActive && cbText) ? cbText : null,
    customBtnAction:  _dpAnnCustomBtnActive ? _dpAnnCustomBtnAction : null,
    customBtnUrl:     (_dpAnnCustomBtnActive && _dpAnnCustomBtnAction === 'link' && cbUrl) ? cbUrl : null
  };
  fbDb.collection('announcements').add(data).then(function(){
    showToast('📢 Pengumuman dikirim ke semua user!');
    document.getElementById('dpAnnTitle').value='';
    document.getElementById('dpAnnMessage').innerHTML='';
    dpAnnRemoveImg('portrait');
    dpAnnRemoveImg('landscape');
    var imgLinkClr = document.getElementById('dpAnnImageLink'); if(imgLinkClr) imgLinkClr.value='';
    var cbTxtClr = document.getElementById('dpAnnCustomBtnText'); if(cbTxtClr) cbTxtClr.value='';
    var cbUrlClr = document.getElementById('dpAnnCustomBtnUrl'); if(cbUrlClr) cbUrlClr.value='';
    if(_dpAnnCustomBtnActive){ _dpAnnCustomBtnActive=false; dpAnnToggleCustomBtn(); }
    if(btn){ btn.disabled=false; btn.textContent='📢 Kirim Pengumuman'; }
    dpAnnLoadList();
  }).catch(function(e){
    showToast('❌ Gagal: '+e.message);
    if(btn){ btn.disabled=false; btn.textContent='📢 Kirim Pengumuman'; }
  });
}

function dpAnnLoadList(){
  if(!fbDb){ return; }
  var listEl = document.getElementById('dpAnnList');
  listEl.innerHTML = '<div style="color:rgba(255,255,255,0.25);font-size:12px;padding:8px 0;text-align:center">⏳ Memuat...</div>';
  fbDb.collection('announcements').orderBy('createdAt','desc').limit(20).get().then(function(snap){
    if(snap.empty){ listEl.innerHTML='<div style="color:rgba(255,255,255,0.2);font-size:12px;padding:12px 0;text-align:center">— Belum ada —</div>'; return; }
    var html='';
    snap.forEach(function(doc){
      var d=doc.data();
      var ts=d.createdAt&&d.createdAt.toDate?d.createdAt.toDate().toLocaleString('id-ID'):'—';
      var imgBadge='';
      if(d.imagePortrait&&d.imageLandscape) imgBadge='<span style="font-size:9px;padding:2px 6px;border-radius:8px;background:rgba(168,85,247,0.15);color:#c084fc;border:1px solid rgba(168,85,247,0.3);margin-left:5px">📸 P+L</span>';
      else if(d.imagePortrait) imgBadge='<span style="font-size:9px;padding:2px 6px;border-radius:8px;background:rgba(59,130,246,0.12);color:#60a5fa;border:1px solid rgba(59,130,246,0.25);margin-left:5px">📱 Portrait</span>';
      else if(d.imageLandscape||d.imageBase64) imgBadge='<span style="font-size:9px;padding:2px 6px;border-radius:8px;background:rgba(34,197,94,0.12);color:#4ade80;border:1px solid rgba(34,197,94,0.25);margin-left:5px">🖥 Landscape</span>';
      html+='<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:10px 12px;margin-bottom:7px;display:flex;align-items:center;justify-content:space-between;gap:8px">'
        +'<div style="min-width:0"><div style="font-size:12px;font-weight:700;color:rgba(255,255,255,0.8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+d.title+imgBadge+'</div>'
        +'<div style="font-size:10px;color:rgba(255,255,255,0.3);margin-top:2px">'+ts+' · '+d.style+' · '+(d.active?'<span style="color:#4ade80">aktif</span>':'<span style="color:#f87171">nonaktif</span>')+'</div></div>'
        +'<div style="display:flex;gap:5px;flex-shrink:0">'
        +'<button onclick="dpAnnToggle(\''+doc.id+'\','+(!d.active)+')" style="padding:4px 9px;border:1px solid rgba(255,255,255,0.12);border-radius:7px;background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.5);font-size:10px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif">'+(d.active?'🔕':'✅')+'</button>'
        +'<button onclick="dpAnnDelete(\''+doc.id+'\')" style="padding:4px 9px;border:1px solid rgba(239,68,68,0.3);border-radius:7px;background:rgba(239,68,68,0.08);color:#f87171;font-size:11px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif">🗑</button>'
        +'</div></div>';
    });
    listEl.innerHTML = html;
  }).catch(function(){ listEl.innerHTML='<div style="color:rgba(255,80,80,0.5);font-size:12px;padding:8px 0;text-align:center">Gagal memuat</div>'; });
}
function dpAnnDelete(id){
  if(!fbDb||!confirm('Hapus pengumuman ini?')) return;
  fbDb.collection('announcements').doc(id).delete().then(function(){ showToast('🗑 Dihapus'); dpAnnLoadList(); });
}
function dpAnnToggle(id, newActive){
  if(!fbDb) return;
  fbDb.collection('announcements').doc(id).update({ active: newActive }).then(function(){
    showToast(newActive ? '✅ Diaktifkan' : '🔕 Dinonaktifkan'); dpAnnLoadList();
  });
}

// ── Debug ──
function dpLoadDebugUserInfo(){
  var el = document.getElementById('dpDebugUserInfo');
  if(!el) return;
  var uid = (typeof currentUser!=='undefined'&&currentUser) ? (currentUser.uid||'—') : '—';
  var email = (typeof currentUser!=='undefined'&&currentUser) ? (currentUser.email||'guest') : 'guest';
  var xp = (typeof totalXP!=='undefined') ? totalXP : '—';
  var gold = (typeof totalGold!=='undefined') ? totalGold : '—';
  var level = (typeof userLevel!=='undefined') ? userLevel : '—';
  el.innerHTML = 'UID: '+uid+'<br>Email: '+email+'<br>XP: '+xp+' · Gold: '+gold+' · Level: '+level+'<br>Tasks: '+(typeof tasks!=='undefined'?tasks.length:'—')+'<br>UA: '+navigator.userAgent.slice(0,60)+'...';
}
function dpLoadAllUsers(){ if(typeof devShowAllUsers==='function') devShowAllUsers(); }
function dpSimulateError(){ try{ null.crash(); }catch(e){ dpLog('error','Simulated error: '+e.message); showToast('⚠️ Error simulated — cek Live Logs'); } }
function dpCheckSW(){
  if(!('serviceWorker' in navigator)){ dpLog('warn','SW not supported'); showToast('SW tidak didukung'); return; }
  navigator.serviceWorker.getRegistrations().then(function(regs){
    dpLog('info','SW registrations: '+regs.length);
    regs.forEach(function(r){ dpLog('info','SW scope: '+r.scope+' state: '+(r.active?r.active.state:'none')); });
    showToast('SW: '+regs.length+' registration(s) — cek Live Logs');
  });
}

// ── Live Logs ──
function _dpStartLogIntercept(){
  if(window._dpLogIntercepted) return;
  window._dpLogIntercepted = true;
  var _origLog   = console.log.bind(console);
  var _origWarn  = console.warn.bind(console);
  var _origError = console.error.bind(console);
  console.log   = function(){ _origLog.apply(console,arguments);   dpLog('log',   Array.from(arguments).map(String).join(' ')); };
  console.warn  = function(){ _origWarn.apply(console,arguments);  dpLog('warn',  Array.from(arguments).map(String).join(' ')); };
  console.error = function(){ _origError.apply(console,arguments); dpLog('error', Array.from(arguments).map(String).join(' ')); };
  // Network intercept
  var _origFetch = window.fetch;
  window.fetch = function(url, opts){
    var method = (opts&&opts.method)||'GET';
    var t = Date.now();
    _dpNetworkLogs.push({ts:t, method:method, url:String(url).slice(0,120), status:'pending'});
    dpRenderNetworkLog();
    return _origFetch.apply(this,arguments).then(function(res){
      var entry = _dpNetworkLogs.find(function(e){ return e.ts===t; });
      if(entry){ entry.status=res.status; entry.ok=res.ok; dpRenderNetworkLog(); }
      return res;
    }).catch(function(err){
      var entry = _dpNetworkLogs.find(function(e){ return e.ts===t; });
      if(entry){ entry.status='ERR'; dpRenderNetworkLog(); }
      throw err;
    });
  };
}
function dpLog(level, msg){
  var ts = new Date().toLocaleTimeString('id-ID',{hour12:false});
  _dpLiveLogs.push({level:level, ts:ts, msg:msg});
  if(_dpLiveLogs.length > 500) _dpLiveLogs.shift();
  var logEl = document.getElementById('dpContent-logs');
  if(logEl && logEl.style.display!=='none') dpRenderLiveLogs();
}
function dpRenderLiveLogs(){
  var el = document.getElementById('dpLiveLogContainer');
  if(!el) return;
  var filtered = _dpLogFilterMode==='all' ? _dpLiveLogs : _dpLiveLogs.filter(function(l){ return l.level===_dpLogFilterMode; });
  if(!filtered.length){ el.innerHTML='<span style="color:rgba(255,255,255,0.2)">// Belum ada log.</span>'; return; }
  var colors = {log:'rgba(255,255,255,0.55)', warn:'#fbbf24', error:'#f87171', info:'#60a5fa'};
  el.innerHTML = filtered.map(function(l){ return '<div><span style="color:rgba(255,255,255,0.2)">'+l.ts+'</span> <span style="color:'+(colors[l.level]||'#fff')+';font-weight:'+(l.level==='error'||l.level==='warn'?'700':'400')+'">['+l.level.toUpperCase()+']</span> '+escHtml(l.msg)+'</div>'; }).join('');
  el.scrollTop = el.scrollHeight;
}
function dpRenderNetworkLog(){
  var el = document.getElementById('dpNetworkLog');
  if(!el) return;
  if(!_dpNetworkLogs.length){ el.innerHTML='<span style="color:rgba(255,255,255,0.2)">// Belum ada request.</span>'; return; }
  var last = _dpNetworkLogs.slice(-30);
  el.innerHTML = last.map(function(r){ var ok=r.status==='pending'?'#60a5fa':(r.ok?'#4ade80':'#f87171'); return '<div><span style="color:'+(r.ok===false||r.status==='ERR'?'#f87171':'#4ade80')+';font-weight:700">'+r.method+'</span> <span style="color:rgba(255,255,255,0.5)">'+r.url+'</span> <span style="color:'+ok+';font-weight:700">'+r.status+'</span></div>'; }).join('');
  el.scrollTop = el.scrollHeight;
}
function dpLogFilter(mode){
  _dpLogFilterMode = mode;
  ['all','error','warn'].forEach(function(m){
    var b = document.getElementById('dpLogBtn-'+m);
    if(!b) return;
    if(m===mode){ b.style.background='rgba(217,119,6,0.12)'; b.style.color='#f59e0b'; b.style.borderColor='rgba(217,119,6,0.5)'; }
    else { b.style.background='transparent'; b.style.color='rgba(255,255,255,0.3)'; b.style.borderColor='rgba(255,255,255,0.08)'; }
  });
  dpRenderLiveLogs();
}
function dpClearLiveLogs(){ _dpLiveLogs=[]; dpRenderLiveLogs(); }
// ── App Stats ──
function dpLoadStats(){
  var todayStr2 = (new Date()).toISOString().slice(0,10);
  var totalTasks   = (typeof tasks!=='undefined') ? tasks.filter(function(t){ return t.type!=='Habit'; }).length : '—';
  var totalHabits  = (typeof tasks!=='undefined') ? tasks.filter(function(t){ return t.type==='Habit'; }).length : '—';
  var doneToday    = (typeof tasks!=='undefined') ? tasks.filter(function(t){ return t.doneDate===todayStr2||(t.history&&t.history.indexOf(todayStr2)>=0); }).length : '—';
  var overdueCount = (typeof tasks!=='undefined') ? tasks.filter(function(t){ return t.due&&t.due<todayStr2&&!t.done&&t.type!=='Habit'; }).length : '—';
  var xp   = (typeof totalXP!=='undefined')   ? totalXP   : '—';
  var gold = (typeof totalGold!=='undefined')  ? totalGold : '—';
  var streak = '—';
  if(typeof tasks!=='undefined'){
    var maxS=0, curS=0, prev='';
    var sorted = tasks.filter(function(t){ return t.doneDate; }).map(function(t){ return t.doneDate; }).sort();
    sorted.forEach(function(d){ if(prev){ var diff=Math.round((new Date(d)-new Date(prev))/86400000); if(diff===1){curS++;maxS=Math.max(maxS,curS);}else curS=1; }else curS=1; prev=d; });
    streak = maxS;
  }
  var journalCount = (typeof journalEntries!=='undefined') ? journalEntries.length : '—';

  function setS(id,v){ var el=document.getElementById(id); if(el) el.textContent=v; }
  setS('dpStatTasks',    totalTasks);
  setS('dpStatHabits',   totalHabits);
  setS('dpStatDoneToday',doneToday);
  setS('dpStatOverdue',  overdueCount);
  setS('dpStatXP',       xp);
  setS('dpStatGold',     gold);
  setS('dpStatStreak',   streak);
  setS('dpStatJournal',  journalCount);

  // Groups breakdown
  var grpEl = document.getElementById('dpStatsGroups');
  if(grpEl && typeof tasks!=='undefined'){
    var grpMap={};
    tasks.forEach(function(t){ var g=t.group||'(tanpa grup)'; if(!grpMap[g])grpMap[g]={total:0,done:0}; grpMap[g].total++; if(t.done)grpMap[g].done++; });
    var lines=Object.keys(grpMap).sort().map(function(g){ var d=grpMap[g]; return g+': '+d.total+' task, '+d.done+' selesai'; });
    grpEl.innerHTML = lines.length ? lines.join('<br>') : '— Tidak ada data —';
  }
}

// ── Feature Flags ──
function dpRenderFlags(){
  var el = document.getElementById('dpFlagsList');
  if(!el) return;
  var html = '';
  Object.keys(_dpFlags).forEach(function(key){
    var f = _dpFlags[key];
    var saved = localStorage.getItem('devFlag_'+key);
    var enabled = saved !== null ? saved==='1' : f.default;
    html += '<div style="display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:10px 12px">'
      + '<div><div style="font-size:12px;font-weight:700;color:rgba(255,255,255,0.75)">'+key+'</div><div style="font-size:10px;color:rgba(255,255,255,0.3);margin-top:2px">'+f.label+'</div></div>'
      + '<label style="position:relative;display:inline-block;width:38px;height:21px;flex-shrink:0">'
      + '<input type="checkbox" '+(enabled?'checked':'')+" onchange=\"dpToggleFlag('"+key+"',this.checked)\" style=\"opacity:0;width:0;height:0;position:absolute\">"
      + '<span style="position:absolute;cursor:pointer;inset:0;border-radius:21px;background:'+(enabled?'#d97706':'rgba(255,255,255,0.12)')+';transition:0.25s;border:1px solid rgba(255,255,255,0.15)"></span>'
      + '<span style="position:absolute;height:15px;width:15px;left:'+(enabled?'20':'3')+'px;bottom:3px;border-radius:50%;background:#fff;transition:0.25s;pointer-events:none"></span>'
      + '</label></div>';
  });
  el.innerHTML = html;
}
function dpToggleFlag(key, val){
  localStorage.setItem('devFlag_'+key, val?'1':'0');
  dpApplyFlag(key, val);
  dpRenderFlags();
}
function dpApplyFlag(key, val){
  if(key==='disable_animations'){ document.body.style.transition = val ? 'none' : ''; }
  if(key==='show_perf_overlay'){ dpTogglePerfOverlay(val); }
  if(key==='verbose_sync'){ window._devVerboseSync = val; }
  dpLog('info', 'Flag ['+key+'] → '+(val?'ON':'OFF'));
}
function dpTogglePerfOverlay(show){
  var el = document.getElementById('dpPerfOverlay');
  if(show){
    if(!el){ el=document.createElement('div'); el.id='dpPerfOverlay'; el.style.cssText='position:fixed;top:60px;right:10px;z-index:99999;background:rgba(0,0,0,0.8);color:#4ade80;font-family:monospace;font-size:11px;padding:6px 10px;border-radius:8px;pointer-events:none;border:1px solid rgba(255,255,255,0.1)'; document.body.appendChild(el); }
    var last=performance.now(), frames=0;
    function tick(){ frames++; var now=performance.now(); if(now-last>=1000){ el.textContent='FPS: '+frames+'\nMem: '+(performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576)+'MB':'—'); frames=0; last=now; } if(document.getElementById('dpPerfOverlay')) requestAnimationFrame(tick); }
    requestAnimationFrame(tick);
  } else { if(el) el.remove(); }
}

// ── Config Override ──
function dpSaveConfig(){
  var xp   = parseInt(document.getElementById('dpCfgXP').value)||10;
  var gold = parseInt(document.getElementById('dpCfgGold').value)||2;
  var max  = parseInt(document.getElementById('dpCfgMaxMyday').value)||0;
  localStorage.setItem('devCfg_xpPerTask', xp);
  localStorage.setItem('devCfg_goldPerTask', gold);
  localStorage.setItem('devCfg_maxMyday', max);
  if(typeof XP_PER_TASK!=='undefined') window.XP_PER_TASK = xp;
  if(typeof GOLD_PER_TASK!=='undefined') window.GOLD_PER_TASK = gold;
  showToast('💾 Config override disimpan');
  dpLog('info','Config override: XP='+xp+', Gold='+gold+', MaxMyday='+max);
}
function dpResetConfig(){
  ['devCfg_xpPerTask','devCfg_goldPerTask','devCfg_maxMyday'].forEach(function(k){ localStorage.removeItem(k); });
  document.getElementById('dpCfgXP').value    = 10;
  document.getElementById('dpCfgGold').value  = 2;
  document.getElementById('dpCfgMaxMyday').value = 0;
  showToast('↩ Config direset ke default');
}


// ── Announcement list ──
function _devAnnLoadList(){
  if(!fbDb){ showToast('Firestore belum tersambung'); return; }
  var listEl = document.getElementById('devAnnList');
  listEl.innerHTML = '<div style="color:rgba(255,255,255,0.25);font-size:12px;padding:8px 0;text-align:center">⏳ Memuat...</div>';
  fbDb.collection('announcements').orderBy('createdAt','desc').limit(20).get().then(function(snap){
    if(snap.empty){ listEl.innerHTML = '<div style="color:rgba(255,255,255,0.2);font-size:12px;padding:12px 0;text-align:center">— Belum ada pengumuman —</div>'; return; }
    var html = '';
    snap.forEach(function(doc){
      var d = doc.data();
      var styleColors = {info:'#3b82f6',success:'#10b981',warning:'#f59e0b',danger:'#ef4444',promo:'#8b5cf6'};
      var clr = styleColors[d.style||'info'] || '#3b82f6';
      html += '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-left:3px solid '+clr+';border-radius:10px;padding:10px 12px;margin-bottom:7px">'
        + '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:6px">'
        + '<div style="flex:1;min-width:0">'
        + '<div style="font-size:12px;font-weight:800;color:rgba(255,255,255,0.8);margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + (d.title||'(tanpa judul)') + '</div>'
        + '<div style="font-size:10px;color:rgba(255,255,255,0.3)">' + (d.displayMode||'once') + ' · ' + (d.style||'info') + ' · ' + (d.active?'<span style="color:#4ade80">aktif</span>':'<span style="color:#f87171">nonaktif</span>') + '</div>'
        + '</div>'
        + '<span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:10px;border:1px solid;color:'+clr+';border-color:'+clr+';background:'+clr+'18;flex-shrink:0">' + (d.style||'info').toUpperCase() + '</span>'
        + '</div>'
        + '<div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:8px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + (d.message||'') + '</div>'
        + '<div style="display:flex;gap:6px">'
        + '<button onclick="_devAnnToggle(\''+doc.id+'\','+(!d.active)+')" style="padding:5px 11px;border-radius:7px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.5);font-size:10px;font-weight:700;cursor:pointer;font-family:DM Sans,sans-serif">'+(d.active?'🔕 Nonaktif':'✅ Aktifkan')+'</button>'
        + '<button onclick="_devAnnDelete(\''+doc.id+'\')" style="padding:5px 11px;border-radius:7px;border:1px solid rgba(239,68,68,0.25);background:rgba(239,68,68,0.07);color:#f87171;font-size:10px;font-weight:700;cursor:pointer;font-family:DM Sans,sans-serif">🗑 Hapus</button>'
        + '</div>'
        + '</div>';
    });
    listEl.innerHTML = html;
  }).catch(function(e){ listEl.innerHTML = '<div style="color:#f87171;font-size:11px">Error: '+e.message+'</div>'; });
}

function devAnnSubmit(){
  if(!isDeveloper() || !fbDb) return;
  var title     = document.getElementById('devAnnTitle').value.trim();
  var msgEl     = document.getElementById('devAnnMessage');
  var message   = msgEl.innerHTML.trim();
  var plainText = (msgEl.innerText || msgEl.textContent || '').trim();
  var mode      = (document.getElementById('devAnnMode') || document.getElementById('dpAnnMode') || {value:'once'}).value;
  var expiryVal = document.getElementById('devAnnExpiry').value;
  var linkVal   = (document.getElementById('devAnnLink') && document.getElementById('devAnnLink').value.trim()) || '';
  var imgModeVal= (document.getElementById('devAnnImgMode') && document.getElementById('devAnnImgMode').value) || 'thumbnail';
  var orientVal = (document.getElementById('devAnnImgOrient') && document.getElementById('devAnnImgOrient').value) || 'portrait';
  var cbEnabled = document.getElementById('devAnnCustomBtnEnabled') ? document.getElementById('devAnnCustomBtnEnabled').checked : false;
  var cbText    = (document.getElementById('devAnnCustomBtnText') && document.getElementById('devAnnCustomBtnText').value.trim()) || '';
  var cbUrl     = (document.getElementById('devAnnCustomBtnUrl') && document.getElementById('devAnnCustomBtnUrl').value.trim()) || '';
  var cbAction  = (document.getElementById('devAnnCustomBtnAction') && document.getElementById('devAnnCustomBtnAction').value) || 'link';
  // Mode fullimage: boleh tanpa teks
  var isFullImage = imgModeVal === 'fullimage' && _devAnnImgBase64;
  if(!title){ showToast('⚠️ Judul harus diisi!'); return; }
  if(!isFullImage && !plainText){ showToast('⚠️ Pesan harus diisi (atau pilih mode Full Gambar dengan gambar ter-upload)!'); return; }

  var btn = document.getElementById('devAnnSubmitBtn');
  btn.disabled = true; btn.textContent = '⏳ Menyimpan...';

  function _saveAnnToFirestore(imageBase64Val){
    var data = {
      title: title, message: message, style: _devAnnSelectedStyle||'info',
      displayMode: mode, active: true,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdBy: fbUser.uid,
      expiresAt: expiryVal ? firebase.firestore.Timestamp.fromDate(new Date(expiryVal)) : null,
      imageBase64: imageBase64Val || null,
      imageLink:   linkVal || null,
      imageMode:   imgModeVal,
      imageOrient: orientVal,
      customBtnEnabled: cbEnabled,
      customBtnText:    cbEnabled ? cbText : null,
      customBtnUrl:     (cbEnabled && cbAction === 'link') ? cbUrl : null,
      customBtnAction:  cbEnabled ? cbAction : null
    };
    fbDb.collection('announcements').add(data).then(function(){
      showToast('✅ Pengumuman dikirim ke semua user!');
      document.getElementById('devAnnTitle').value = '';
      msgEl.innerHTML = '';
      document.getElementById('devAnnExpiry').value = '';
      var cnt = document.getElementById('devAnnCharCount'); if(cnt) cnt.textContent = '0';
      devAnnRemoveImg();
      var linkEl2 = document.getElementById('devAnnLink'); if(linkEl2) linkEl2.value = '';
      var cbTxtEl = document.getElementById('devAnnCustomBtnText'); if(cbTxtEl) cbTxtEl.value = '';
      var cbUrlEl = document.getElementById('devAnnCustomBtnUrl'); if(cbUrlEl) cbUrlEl.value = '';
      var cbEnEl  = document.getElementById('devAnnCustomBtnEnabled'); if(cbEnEl){ cbEnEl.checked = false; _devAnnToggleCustomBtn(false); }
      btn.disabled = false; btn.textContent = '📢 Kirim Pengumuman';
      _devAnnLoadList();
    }).catch(function(e){
      showToast('❌ Error: ' + e.message);
      btn.disabled = false; btn.textContent = '📢 Kirim Pengumuman';
    });
  }

  // Simpan langsung ke Firestore (base64 sudah dikompres saat upload)
  _saveAnnToFirestore(_devAnnImgBase64 || null);
}

function _devAnnToggle(id, newActive){
  fbDb.collection('announcements').doc(id).update({ active: newActive }).then(function(){
    showToast(newActive ? '✅ Pengumuman diaktifkan' : '🔕 Pengumuman dinonaktifkan');
    _devAnnLoadList();
  });
}

function _devAnnDelete(id){
  if(!confirm('Hapus pengumuman ini permanen?')) return;
  fbDb.collection('announcements').doc(id).delete().then(function(){
    showToast('🗑 Pengumuman dihapus');
    _devAnnLoadList();
  });
}

// ── DEBUG TAB ──
function _devLog(msg, type){
  var el = document.getElementById('devConsoleLog');
  if(!el) return;
  var colors = { info:'#60a5fa', ok:'#4ade80', warn:'#fbbf24', err:'#f87171' };
  var clr = colors[type||'info'] || '#60a5fa';
  var time = new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  el.innerHTML += '\n<span style="color:rgba(255,255,255,0.2)">['+time+']</span> <span style="color:'+clr+'">'+msg+'</span>';
  el.scrollTop = el.scrollHeight;
}

function devRefreshUserInfo(){
  // Legacy — tidak dipakai lagi, digantikan devShowAllUsers()
}

// ════════════════════════════════════════════
// PRESENCE SYSTEM — deteksi user online
// ════════════════════════════════════════════


function devShowAllUsers(){
  var modal = document.getElementById('devAllUsersModal');
  if(!modal) return;
  modal.style.display = 'flex';
  // Reset ke tab Google by default
  devSwitchUsersTab('google');
}

function devCloseAllUsersModal(){
  var modal = document.getElementById('devAllUsersModal');
  if(modal) modal.style.display = 'none';
}

// Tab switcher: 'google' | 'guest'
var _devUsersActiveTab = 'google';
function devSwitchUsersTab(tab){
  _devUsersActiveTab = tab;
  var btnG = document.getElementById('devUsersTabGoogle');
  var btnGuest = document.getElementById('devUsersTabGuest');
  var actionBar = document.getElementById('devGuestActionBar');
  if(btnG){
    btnG.style.background  = tab==='google' ? 'rgba(99,102,241,0.85)' : 'transparent';
    btnG.style.color       = tab==='google' ? '#fff' : 'rgba(255,255,255,0.35)';
  }
  if(btnGuest){
    btnGuest.style.background = tab==='guest' ? 'rgba(245,158,11,0.75)' : 'transparent';
    btnGuest.style.color      = tab==='guest' ? '#1c1200' : 'rgba(255,255,255,0.35)';
  }
  if(actionBar) actionBar.style.display = tab==='guest' ? 'block' : 'none';
  devLoadAllUsers();
}

function devClearAllGuests(){
  if(!fbDb){
    _devLog('Firestore belum tersambung','err');
    return;
  }
  var confirmed = confirm('⚠️ Hapus SEMUA data presence guest dari Firestore?\n\nIni hanya membersihkan daftar monitor — data task/keuangan guest di localStorage mereka tidak terpengaruh.');
  if(!confirmed) return;

  var listEl = document.getElementById('devAllUsersList');
  if(listEl) listEl.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,0.3);font-size:12px;padding:20px 0">⏳ Menghapus...</div>';

  fbDb.collection('presence').where('isGuest','==',true).get().then(function(snap){
    if(snap.empty){
      if(listEl) listEl.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,0.3);font-size:12px;padding:20px 0">✅ Tidak ada data guest untuk dihapus.</div>';
      _devLog('Tidak ada guest presence di Firestore','info');
      return;
    }
    var batch = fbDb.batch();
    var count = 0;
    snap.forEach(function(doc){
      batch.delete(doc.ref);
      count++;
    });
    return batch.commit().then(function(){
      _devLog('Deleted '+count+' guest presence records','ok');
      showToast('🗑️ '+count+' data guest dihapus');
      devLoadAllUsers();
    });
  }).catch(function(e){
    _devLog('Error clear guest: '+e.message,'err');
    if(listEl) listEl.innerHTML = '<div style="text-align:center;color:#f87171;font-size:12px;padding:20px 0">❌ Gagal: '+e.message+'</div>';
  });
}

function devLoadAllUsers(){
  var listEl  = document.getElementById('devAllUsersList');
  var countEl = document.getElementById('devAllUsersCount');
  if(!listEl) return;

  var isGuestTab = _devUsersActiveTab === 'guest';

  listEl.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,0.25);font-size:12px;padding:20px 0">⏳ Memuat...</div>';
  if(countEl) countEl.textContent = 'Memuat...';

  if(isGuestTab){
    // ── Guest tab: baca dari chitask_guest_presence di localStorage semua key ──
    // Guest presence disimpan di localStorage dengan key: chitask_guest_presence_{deviceId}
    // Atau bisa juga dari Firestore collection 'presence' filter isGuest=true
    _devLoadGuestUsers(listEl, countEl);
    return;
  }

  // ── Google tab: dari Firestore presence, filter isGuest=false ──
  if(!fbDb){
    listEl.innerHTML = '<div style="text-align:center;color:#f87171;font-size:12px;padding:20px 0">❌ Firestore belum tersambung</div>';
    return;
  }

  fbDb.collection('presence').get().then(function(snap){
    if(snap.empty){
      listEl.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,0.25);font-size:12px;padding:20px 0">Belum ada data presence</div>';
      if(countEl) countEl.textContent = '0 user';
      return;
    }

    var now      = Date.now();
    var onlineMs = 5 * 60 * 1000;
    var online   = [];
    var offline  = [];

    snap.forEach(function(doc){
      var d        = doc.data();
      var isGuest  = d.isGuest || false;
      if(isGuest) return; // skip guest di tab Google
      var email    = d.email || '—';
      var name     = d.displayName || '';
      var lastSeen = d.lastSeen ? d.lastSeen.toDate() : null;
      var diffMs   = lastSeen ? (now - lastSeen.getTime()) : Infinity;
      var isOnline = diffMs <= onlineMs;
      var uid      = doc.id;
      var entry = { email:email, name:name, isGuest:false, lastSeen:lastSeen, diffMs:diffMs, isOnline:isOnline, uid:uid };
      if(isOnline) online.push(entry); else offline.push(entry);
    });

    online.sort(function(a,b){ return a.diffMs - b.diffMs; });
    offline.sort(function(a,b){ return a.diffMs - b.diffMs; });

    _devRenderUserList(listEl, countEl, online, offline, '📧');
    _devLog('Presence loaded: '+online.length+' online, '+offline.length+' offline','ok');

  }).catch(function(e){
    listEl.innerHTML = '<div style="text-align:center;color:#f87171;font-size:12px;padding:20px 0">❌ Error: '+e.message+'</div>';
    _devLog('Error load presence: '+e.message,'err');
  });
}

function _devLoadGuestUsers(listEl, countEl){
  // Guest presence: dari Firestore collection 'presence' filter isGuest=true
  // + jika ada data lokal (device sendiri yang sedang guest)
  var now      = Date.now();
  var onlineMs = 5 * 60 * 1000;
  var online   = [];
  var offline  = [];

  // Tambahkan device sendiri jika sedang guest
  var selfIsGuest = (typeof fbUser !== 'undefined') && fbUser && fbUser._isGuest;
  if(selfIsGuest){
    var selfEntry = {
      email: 'Perangkat Ini (Guest)',
      name: navigator.userAgent.substring(0, 40),
      isGuest: true,
      diffMs: 0,
      isOnline: true,
      deviceId: 'self'
    };
    online.push(selfEntry);
  }

  if(!fbDb){
    // Hanya tampilkan self jika ada
    if(online.length === 0 && offline.length === 0){
      listEl.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,0.25);font-size:12px;padding:20px 0">🎭 Tidak ada data guest.<br><br>Guest tidak menyimpan data presence ke cloud — hanya perangkat yang sedang aktif yang bisa terdeteksi.</div>';
      if(countEl) countEl.textContent = '0 guest';
      return;
    }
    _devRenderUserList(listEl, countEl, online, offline, '🎭');
    return;
  }

  // Coba load dari Firestore presence yang isGuest=true
  fbDb.collection('presence').where('isGuest','==',true).get().then(function(snap){
    snap.forEach(function(doc){
      var d        = doc.data();
      var lastSeen = d.lastSeen ? d.lastSeen.toDate() : null;
      var diffMs   = lastSeen ? (now - lastSeen.getTime()) : Infinity;
      var isOnline = diffMs <= onlineMs;
      // Hindari duplikat self
      if(selfIsGuest && isOnline && diffMs < 30000) return;
      var deviceId = d.deviceId || doc.id;
      var guestLabel = (d.displayName && d.displayName !== 'Tamu') ? d.displayName : ('Guest #'+deviceId.substring(0,8));
      var entry = {
        email: guestLabel,
        name: d.ua ? d.ua.substring(0,50) : '',
        isGuest: true,
        diffMs: diffMs,
        isOnline: isOnline,
        deviceId: deviceId
      };
      if(isOnline) online.push(entry); else offline.push(entry);
    });

    if(online.length===0 && offline.length===0){
      listEl.innerHTML = '<div style="padding:20px 14px;text-align:center">'
        +'<div style="font-size:24px;margin-bottom:8px">🎭</div>'
        +'<div style="font-size:12px;color:rgba(255,255,255,0.4);line-height:1.6">'
        +'Tidak ada data guest terdeteksi.<br>'
        +'<span style="font-size:10px;color:rgba(255,255,255,0.2)">Guest biasanya tidak menyimpan presence ke cloud. Data hanya tersedia jika presence system diaktifkan untuk guest.</span>'
        +'</div></div>';
      if(countEl) countEl.textContent = '0 guest';
      return;
    }

    online.sort(function(a,b){ return a.diffMs - b.diffMs; });
    offline.sort(function(a,b){ return a.diffMs - b.diffMs; });
    _devRenderUserList(listEl, countEl, online, offline, '🎭');

  }).catch(function(e){
    // Fallback jika query gagal (misalnya index belum ada)
    if(online.length > 0){
      _devRenderUserList(listEl, countEl, online, [], '🎭');
    } else {
      listEl.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,0.3);font-size:12px;padding:20px 0">🎭 Tidak ada data guest di Firestore.<br><span style="font-size:10px;color:rgba(255,255,255,0.2)">'+e.message+'</span></div>';
    }
    if(countEl) countEl.textContent = '0 guest';
  });
}

function _devRenderUserList(listEl, countEl, online, offline, typeIcon){
  function fmtAgo(ms){
    if(!isFinite(ms)) return 'tidak diketahui';
    var s = Math.floor(ms/1000);
    if(s < 60)  return s+'d lalu';
    var m = Math.floor(s/60);
    if(m < 60)  return m+'m lalu';
    var h = Math.floor(m/60);
    if(h < 24)  return h+'j lalu';
    return Math.floor(h/24)+'h lalu';
  }

  function buildCard(u){
    var subtitle = u.isGuest
      ? (u.deviceId ? '<span style="font-family:monospace">'+u.deviceId.substring(0,16)+'…</span>' : '')
      : (u.name && u.name !== u.email ? u.name : '');
    var icon = u.isGuest ? '🎭' : '👤';
    return '<div style="background:rgba(255,255,255,0.03);border:1px solid '+(u.isOnline?'rgba(74,222,128,0.2)':'rgba(255,255,255,0.07)')+';border-radius:12px;padding:11px 13px;display:flex;align-items:center;gap:11px">'
      + '<div style="position:relative;flex-shrink:0">'
      +   '<div style="width:36px;height:36px;border-radius:50%;background:'+(u.isOnline?'rgba(74,222,128,0.12)':'rgba(255,255,255,0.05)')+';border:1px solid '+(u.isOnline?'rgba(74,222,128,0.3)':'rgba(255,255,255,0.1)')+';display:flex;align-items:center;justify-content:center;font-size:16px">'+icon+'</div>'
      +   '<div style="position:absolute;bottom:0;right:0;width:11px;height:11px;border-radius:50%;background:'+(u.isOnline?'#4ade80':'#6b7280')+';border:2px solid #1c1917"></div>'
      + '</div>'
      + '<div style="flex:1;min-width:0">'
      +   '<div style="font-size:12px;font-weight:700;color:#e2e8f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+(u.isGuest?'🎭 ':'📧 ')+u.email+'</div>'
      +   (subtitle ? '<div style="font-size:10px;color:rgba(255,255,255,0.3);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+subtitle+'</div>' : '')
      +   '<div style="display:flex;align-items:center;gap:6px;margin-top:4px;flex-wrap:wrap">'
      +     '<span style="font-size:10px;font-weight:700;color:'+(u.isOnline?'#4ade80':'#9ca3af')+';background:'+(u.isOnline?'rgba(74,222,128,0.1)':'rgba(255,255,255,0.05)')+';border:1px solid '+(u.isOnline?'rgba(74,222,128,0.25)':'rgba(255,255,255,0.1)')+';border-radius:20px;padding:1px 8px">'+(u.isOnline?'🟢 Online':'⚫ Offline')+'</span>'
      +     '<span style="font-size:10px;color:rgba(255,255,255,0.25)">'+fmtAgo(u.diffMs)+'</span>'
      +     (u.uid ? '<span style="font-size:9px;color:rgba(255,255,255,0.15);font-family:monospace">'+u.uid.substring(0,10)+'…</span>' : '')
      +   '</div>'
      + '</div>'
      + '</div>';
  }

  var html = '';
  if(online.length){
    html += '<div style="font-size:9px;font-weight:800;color:rgba(74,222,128,0.6);text-transform:uppercase;letter-spacing:0.6px;margin:4px 2px 6px">🟢 Online sekarang ('+online.length+')</div>';
    online.forEach(function(u){ html += buildCard(u); });
  }
  if(offline.length){
    html += '<div style="font-size:9px;font-weight:800;color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:0.6px;margin:'+(online.length?'14px':'4px')+' 2px 6px">⚫ Offline ('+offline.length+')</div>';
    offline.forEach(function(u){ html += buildCard(u); });
  }

  listEl.innerHTML = html || '<div style="text-align:center;color:rgba(255,255,255,0.2);font-size:12px;padding:20px 0">Tidak ada data</div>';
  var totalOnline = online.length;
  if(countEl) countEl.textContent = totalOnline + ' online · ' + (online.length+offline.length) + ' total';
}
function devClearLog(){ var el=document.getElementById('devConsoleLog'); if(el) el.innerHTML='<span style="color:rgba(255,255,255,0.2)">// Log cleared.</span>'; }

function devForceShowAnn(){
  _devLog('Forcing test announcement modal...','info');
  var ann = { id:'__test__', title:'🧪 Test Pengumuman', message:'Ini adalah test modal pengumuman dari Developer Console. Tampilannya akan seperti ini saat pengumuman dikirim ke semua user.', style:_devAnnSelectedStyle||'info', displayMode:'always', createdAt:null };
  _annShowing = false;
  _annShowPopup(ann);
}

function devClearAnnReads(){
  // FIX #5: Guest bisa clear reads dari localStorage
  if(fbUser && fbUser._isGuest){
    try { localStorage.removeItem('chitask_guest_ann_reads'); } catch(e){}
    _annSessionDismissed = {};
    _annQueue = [];
    _annShowing = false;
    showToast('✅ Ann reads (guest) cleared');
    _devLog('Cleared guest announcement_reads dari localStorage','ok');
    return;
  }
  if(!fbDb||!fbUser){ showToast('Butuh login Firebase'); return; }
  fbDb.collection('announcement_reads').doc(fbUser.uid).delete().then(function(){
    _annSessionDismissed = {};
    _annQueue = [];
    _annShowing = false;
    showToast('✅ Ann reads cleared');
    _devLog('Cleared announcement_reads for uid: '+fbUser.uid,'ok');
  }).catch(function(e){ _devLog('Error: '+e.message,'err'); });
}

function devShowToast(){ showToast('🍞 Ini adalah test toast notification dari Developer Console!'); _devLog('Toast triggered','ok'); }

function devCheckFirestore(){
  if(!fbDb){ _devLog('Firestore tidak tersambung!','err'); return; }
  _devLog('Checking Firestore connection...','info');
  fbDb.collection('_devping').doc('ping').set({ ts: firebase.firestore.FieldValue.serverTimestamp() })
    .then(function(){ _devLog('✅ Firestore OK — read/write berhasil','ok'); showToast('✅ Firestore OK!'); })
    .catch(function(e){ _devLog('❌ Firestore error: '+e.message,'err'); });
}

function devReloadApp(){ if(confirm('Reload app?')) window.location.reload(); }

function devClearLocalStorage(){
  if(!confirm('Clear localStorage? Ini akan hapus preferensi lokal (bukan data Firebase).')) return;
  localStorage.clear();
  showToast('💣 localStorage cleared — reload diperlukan');
  _devLog('localStorage cleared','warn');
}

// ── GAMI TAB ──
function devInjectXp(){
  var amt = parseInt(document.getElementById('devXpAmount').value)||100;
  if(typeof addXP==='function'){ addXP(amt,'🛠️ Dev Inject'); showToast('⚡ +'+amt+' XP injected!'); _devLog('+'+amt+' XP injected','ok'); }
  else { _devLog('addXP tidak ditemukan','err'); showToast('addXP function tidak ada'); }
}
function devInjectGold(){
  var amt = parseInt(document.getElementById('devGoldAmount').value)||50;
  if(typeof addGold==='function'){ addGold(amt,'🛠️ Dev Inject'); showToast('🪙 +'+amt+' Gold!'); _devLog('+'+amt+' Gold injected','ok'); }
  else if(typeof _gamiAddGold==='function'){ _gamiAddGold(amt); showToast('🪙 +'+amt+' Gold!'); }
  else { _devLog('Gold function tidak ditemukan','err'); showToast('Gold function tidak ada'); }
}
function devInjectBoth(){ devInjectXp(); setTimeout(devInjectGold,300); }

function devBossSpawn(){
  if(typeof spawnBoss==='function'){ spawnBoss(); showToast('⚔️ Boss spawned!'); _devLog('Boss spawned','ok'); }
  else if(typeof _bossSpawn==='function'){ _bossSpawn(); showToast('⚔️ Boss spawned!'); }
  else { _devLog('spawnBoss tidak ditemukan','warn'); showToast('⚠️ spawnBoss tidak ada'); }
}
function devBossKill(){
  if(typeof killBoss==='function'){ killBoss(); showToast('💀 Boss killed!'); _devLog('Boss killed','ok'); }
  else { _devLog('killBoss tidak ditemukan','warn'); showToast('⚠️ killBoss tidak ada'); }
}
function devBossDmg(){
  if(typeof dealBossDamage==='function'){ dealBossDamage(100); showToast('💥 100 DMG dealt!'); _devLog('100 DMG dealt to boss','ok'); }
  else if(typeof _bossDmg==='function'){ _bossDmg(100); showToast('💥 100 DMG!'); }
  else { _devLog('dealBossDamage tidak ditemukan','warn'); showToast('⚠️ DMG function tidak ada'); }
}
function devBossStatus(){
  var info = document.getElementById('devBossInfo');
  var status='';
  try {
    if(typeof _bossState!=='undefined'){ status=JSON.stringify(_bossState,null,1); }
    else if(typeof getBossState==='function'){ status=JSON.stringify(getBossState(),null,1); }
    else { status='Boss state tidak ditemukan di global scope'; }
  } catch(e){ status='Error: '+e.message; }
  if(info) info.textContent=status;
  _devLog('Boss status logged','info');
}
function devResetGami(){
  if(!confirm('Reset XP, Gold, Level ke 0? Tidak bisa di-undo!')) return;
  if(typeof resetGamification==='function'){ resetGamification(); showToast('🔁 Gamification reset!'); _devLog('Gamification reset','warn'); }
  else { _devLog('resetGamification tidak ditemukan','err'); showToast('⚠️ Reset function tidak ada'); }
}
function devUnlockAllAchv(){
  if(!confirm('Unlock semua achievements?')) return;
  if(typeof unlockAllAchievements==='function'){ unlockAllAchievements(); showToast('🏆 Semua achievements unlocked!'); _devLog('All achievements unlocked','ok'); }
  else { _devLog('unlockAllAchievements tidak ditemukan','warn'); showToast('⚠️ Function tidak ada'); }
}

function devResetAchievements(){
  if(!confirm('Reset semua achievements? Tidak bisa di-undo!')) return;
  if(typeof achievements !== 'undefined'){
    Object.keys(achievements).forEach(function(k){ achievements[k].unlocked = false; achievements[k].progress = 0; });
    if(typeof saveData==='function') saveData();
    if(typeof renderAchievements==='function') renderAchievements();
    showToast('🔁 Achievements reset!');
    _devLog('Achievements reset','warn');
  } else { _devLog('achievements object tidak ditemukan','err'); }
}

// ── SHOP & TEMA FUNCTIONS ──

function devRefreshShopInfo(){
  var el = document.getElementById('devShopInfo'); if(!el) return;
  var themeName = '—', effectName = '—';
  // cari nama tema aktif
  if(typeof SHOP_THEMES !== 'undefined'){
    var t = SHOP_THEMES.find(function(x){ return x.id === activeTheme; });
    if(t) themeName = t.icon + ' ' + t.name;
  }
  if(typeof SHOP_EFFECTS !== 'undefined'){
    var e = SHOP_EFFECTS.find(function(x){ return x.id === activeEffect; });
    if(e) effectName = e.icon + ' ' + e.name;
    else if(!activeEffect) effectName = '✨ Default';
  }
  var purchases = typeof shopPurchases !== 'undefined' ? shopPurchases.length : 0;
  var html = '';
  html += '🎨 Tema aktif: <span style="color:#a78bfa">' + themeName + '</span>\n';
  html += '✨ Efek aktif: <span style="color:#a5b4fc">' + effectName + '</span>\n';
  html += '🛍️ Item dibeli: <span style="color:#fbbf24">' + purchases + ' item</span>\n';
  if(typeof shopPurchases !== 'undefined' && shopPurchases.length){
    shopPurchases.forEach(function(p){
      html += '  → <span style="color:rgba(255,255,255,0.35)">' + (p.name||p.id) + '</span>\n';
    });
  }
  el.innerHTML = html;
  _devLog('Shop info refreshed','info');
}

function devUnlockAllThemes(){
  if(!confirm('Unlock semua tema tanpa bayar Gold?')) return;
  if(typeof SHOP_THEMES === 'undefined' || typeof shopPurchases === 'undefined'){ showToast('⚠️ Shop data tidak ditemukan'); return; }
  var added = 0;
  SHOP_THEMES.forEach(function(item){
    if(item.builtin) return;
    var alreadyOwned = shopPurchases.some(function(p){ return p.id === item.id; });
    if(!alreadyOwned){
      shopPurchases.push({ id: item.id, name: item.name, type: 'theme', cost: 0, date: new Date().toISOString() });
      added++;
    }
  });
  if(typeof saveData==='function') saveData();
  if(typeof renderShop==='function') renderShop();
  showToast('🎨 ' + added + ' tema di-unlock!');
  _devLog('Unlocked ' + added + ' themes', 'ok');
  devRefreshShopInfo();
}

function devUnlockAllEffects(){
  if(!confirm('Unlock semua efek animasi tanpa bayar Gold?')) return;
  if(typeof SHOP_EFFECTS === 'undefined' || typeof shopPurchases === 'undefined'){ showToast('⚠️ Shop data tidak ditemukan'); return; }
  var added = 0;
  SHOP_EFFECTS.forEach(function(item){
    if(item.builtin) return;
    var alreadyOwned = shopPurchases.some(function(p){ return p.id === item.id; });
    if(!alreadyOwned){
      shopPurchases.push({ id: item.id, name: item.name, type: 'effect', cost: 0, date: new Date().toISOString() });
      added++;
    }
  });
  if(typeof saveData==='function') saveData();
  if(typeof renderShop==='function') renderShop();
  showToast('✨ ' + added + ' efek di-unlock!');
  _devLog('Unlocked ' + added + ' effects', 'ok');
  devRefreshShopInfo();
}

function devResetTheme(){
  if(!confirm('Reset tema ke Dark Mode?')) return;
  activeTheme = 'theme-dark';
  tempThemeExpiry = 0;
  tempThemePrev = '';
  if(typeof applyTheme==='function') applyTheme('theme-dark');
  if(typeof saveData==='function') saveData();
  showToast('🌙 Tema direset ke Dark Mode');
  _devLog('Theme reset to dark', 'warn');
  devRefreshShopInfo();
}

function devResetEffect(){
  if(!confirm('Reset efek ke Default (tidak ada efek)?')) return;
  activeEffect = '';
  if(typeof stopEffect==='function') stopEffect();
  if(typeof saveData==='function') saveData();
  showToast('✨ Efek direset ke Default');
  _devLog('Effect reset to default', 'warn');
  devRefreshShopInfo();
}

function devResetShopPurchases(){
  if(!confirm('Reset SEMUA pembelian shop? Item akan hilang, Gold tidak dikembalikan!')) return;
  shopPurchases = [];
  activeTheme = 'theme-dark';
  activeEffect = '';
  tempThemeExpiry = 0;
  tempThemePrev = '';
  if(typeof applyTheme==='function') applyTheme('theme-dark');
  if(typeof stopEffect==='function') stopEffect();
  if(typeof saveData==='function') saveData();
  if(typeof renderShop==='function') renderShop();
  showToast('🗑️ Semua pembelian shop direset!');
  _devLog('All shop purchases reset', 'warn');
  devRefreshShopInfo();
}

function devResetAllGami(){
  if(!confirm('⚠️ Reset SEMUA gamifikasi: XP, Gold, Level, Achievements, Shop, Tema, Efek?')) return;
  if(!confirm('Konfirmasi lagi — ini tidak bisa di-undo!')) return;
  // Reset gami stats
  if(typeof resetGamification==='function') resetGamification();
  // Reset achievements
  if(typeof achievements !== 'undefined'){
    Object.keys(achievements).forEach(function(k){ achievements[k].unlocked = false; achievements[k].progress = 0; });
  }
  // Reset shop
  shopPurchases = [];
  activeTheme = 'theme-dark';
  activeEffect = '';
  tempThemeExpiry = 0;
  tempThemePrev = '';
  if(typeof applyTheme==='function') applyTheme('theme-dark');
  if(typeof stopEffect==='function') stopEffect();
  if(typeof saveData==='function') saveData();
  if(typeof renderShop==='function') renderShop();
  if(typeof renderAchievements==='function') renderAchievements();
  showToast('💣 Semua gamifikasi direset total!');
  _devLog('FULL GAMI RESET complete', 'warn');
  devRefreshShopInfo();
}

// ── DATA TAB ──
// Helper: ambil data dari localStorage chitask_v6_data
function _getLocalData(){
  try{ var raw=localStorage.getItem('chitask_v6_data'); return raw?JSON.parse(raw):null; }catch(e){ return null; }
}
// Helper: download JSON blob
function _downloadJson(data, filename){
  var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download=filename+'_'+new Date().toISOString().slice(0,10)+'.json'; a.click();
}
function _devExport(collectionName, filename){
  // ── Fallback localStorage untuk guest/offline ──
  if(!fbDb||!fbUser||fbUser._isGuest||fbUser._isOffline){
    var ld=_getLocalData();
    if(!ld){ showToast('Tidak ada data lokal'); _devLog('No local data found','err'); return; }
    var data=[];
    if(collectionName==='tasks'){ data=(ld.tasks||[]).filter(function(t){return !t.type||t.type!=='Habit';}); }
    else if(collectionName==='habits'){ data=(ld.tasks||[]).filter(function(t){return t.type==='Habit';}); }
    else if(collectionName==='transactions'){ data=ld.finTransactions||[]; }
    else if(collectionName==='wallets'){ data=ld.finWallets||[]; }
    else if(collectionName==='journals'){ data=ld.journalEntries||[]; }
    else{ data=ld[collectionName]||[]; }
    _downloadJson(data, filename);
    showToast('📦 '+filename+' exported! ('+data.length+' items) [lokal]');
    _devLog('Exported '+data.length+' items from localStorage['+collectionName+']','ok');
    return;
  }
  fbDb.collection('users').doc(fbUser.uid).collection(collectionName).get().then(function(snap){
    var data=[]; snap.forEach(function(doc){ data.push(Object.assign({_id:doc.id},doc.data())); });
    _downloadJson(data, filename);
    showToast('📦 '+filename+' exported! ('+data.length+' items)');
    _devLog('Exported '+data.length+' docs from '+collectionName,'ok');
  }).catch(function(e){ _devLog('Export error: '+e.message,'err'); showToast('Error: '+e.message); });
}
function devExportTasks(){ _devExport('tasks','chitask_tasks'); }
function devExportHabits(){ _devExport('habits','chitask_habits'); }
function devExportFinance(){ _devExport('transactions','chitask_finance'); }
function devExportAll(){
  // ── Fallback localStorage untuk guest/offline ──
  if(!fbDb||!fbUser||fbUser._isGuest||fbUser._isOffline){
    var ld=_getLocalData();
    if(!ld){ showToast('Tidak ada data lokal'); _devLog('No local data found','err'); return; }
    var allData={
      tasks:(ld.tasks||[]).filter(function(t){return !t.type||t.type!=='Habit';}),
      habits:(ld.tasks||[]).filter(function(t){return t.type==='Habit';}),
      transactions:ld.finTransactions||[],
      wallets:ld.finWallets||[],
      journals:ld.journalEntries||[],
      maintItems:ld.maintItems||[],
      finTagihan:ld.finTagihan||[],
      finHutang:ld.finHutang||[],
      finWishlist:ld.finWishlist||[],
      finBudgets:ld.finBudgets||{},
      _exportedAt:new Date().toISOString(),
      _source:'localStorage'
    };
    _downloadJson(allData,'chitask_fullexport');
    showToast('📦 Full export berhasil! [lokal]'); _devLog('Full export from localStorage complete','ok');
    return;
  }
  var cols=['tasks','habits','transactions','wallets','journals']; var allData={}; var pending=cols.length;
  cols.forEach(function(col){
    fbDb.collection('users').doc(fbUser.uid).collection(col).get().then(function(snap){
      allData[col]=[];
      snap.forEach(function(doc){ allData[col].push(Object.assign({_id:doc.id},doc.data())); });
      if(--pending===0){
        allData._exportedAt=new Date().toISOString(); allData._uid=fbUser.uid;
        _downloadJson(allData,'chitask_fullexport');
        showToast('📦 Full export berhasil!'); _devLog('Full export complete','ok');
      }
    }).catch(function(){ pending--; });
  });
}
function devLoadFirestoreStats(){
  if(!fbDb||!fbUser||fbUser._isGuest){ showToast('Butuh login Firebase'); return; }
  var el=document.getElementById('devFirestoreStats'); if(el) el.innerHTML='⏳ Memuat...';
  var cols=['tasks','habits','transactions','journals','wallets']; var stats={}; var pending=cols.length;
  cols.forEach(function(col){
    fbDb.collection('users').doc(fbUser.uid).collection(col).get().then(function(snap){
      stats[col]=snap.size; if(--pending===0){
        var html=''; Object.keys(stats).forEach(function(k){ html+='📁 '+k+': <span style="color:#60a5fa">'+stats[k]+' docs</span>\n'; });
        if(el) el.innerHTML=html; _devLog('Firestore stats loaded','ok');
      }
    }).catch(function(){ pending--; });
  });
}
function devWipeUserData(){
  if(!confirm('‼️ SERIUS: Hapus SEMUA data user dari Firestore? Tidak bisa di-undo!')) return;
  if(!confirm('Konfirmasi sekali lagi — semua data Firebase user ini akan dihapus?')) return;
  showToast('⚠️ Wipe diblokir — lakukan manual via Firebase Console untuk keamanan');
  _devLog('⚠️ Wipe blocked — gunakan Firebase Console','warn');
}
