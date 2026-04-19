// ═══════════════════════════════════════════════
// MOBILE NAV MODE SYSTEM
// ═══════════════════════════════════════════════
var _mobileNavMode = 'drawer'; // 'drawer' | 'sidebar'
var _navModeKey = 'chitask_nav_mode';
var _navModeFirstKey = 'chitask_nav_mode_set';
var _pendingNavMode = null;

function isMobileNavMode(){
  return window.innerWidth <= 700;
}

// Load saved mode
function loadNavMode(){
  try{ return localStorage.getItem(_navModeKey) || 'drawer'; }catch(e){ return 'drawer'; }
}

function saveNavModeToStorage(mode){
  try{ localStorage.setItem(_navModeKey, mode); localStorage.setItem(_navModeFirstKey, '1'); }catch(e){}
  // ✅ FIX: Simpan ke Firestore supaya tidak muncul lagi di browser/device lain
  if (typeof fbDb !== 'undefined' && fbDb && typeof fbUser !== 'undefined' && fbUser && !fbUser._isGuest && !fbUser._isOffline) {
    fbDb.collection('users').doc(fbUser.uid).set({ navModeDone: true, navMode: mode }, { merge: true }).catch(function(){});
  }
}

function isFirstTimeMobile(){
  if(!isMobileNavMode()) return false;
  try{ return !localStorage.getItem(_navModeFirstKey); }catch(e){ return false; }
}

// Apply nav mode to DOM
function applyNavMode(modeArg){
  var mode = modeArg || _pendingNavMode || _mobileNavMode;
  _mobileNavMode = mode;
  saveNavModeToStorage(mode);

  if(!isMobileNavMode()){
    // Desktop: always use sidebar, no mode switching needed
    closeNavPreferenceModal();
    return;
  }

  var body = document.body;
  if(mode === 'sidebar'){
    body.classList.add('mobile-nav-sidebar');
    // Remove inline override so CSS !important takes control
    var btn = document.getElementById('mobileSidebarToggleBtn');
    if(btn){ btn.style.removeProperty('display'); btn.classList.remove('sidebar-is-open'); }
    // Ensure sidebar is not open by default
    var sb = document.getElementById('sidebar');
    if(sb){ sb.classList.remove('mobile-open'); }
    // Close subdrawer if open
    if(typeof closeSubDrawer === 'function') closeSubDrawer(true);
    // Add collapse button to sidebar brand if not exists
    _injectSidebarCollapseBtn();
  } else {
    body.classList.remove('mobile-nav-sidebar');
    // Remove inline override; CSS will hide btn since body class is gone
    var btn2 = document.getElementById('mobileSidebarToggleBtn');
    if(btn2){ btn2.style.removeProperty('display'); btn2.classList.remove('sidebar-is-open'); }
    // Close sidebar
    var sb2 = document.getElementById('sidebar');
    if(sb2){ sb2.classList.remove('mobile-open'); }
    var ov = document.getElementById('sidebarOverlay');
    if(ov) ov.classList.remove('show');
  }

  _pendingNavMode = null;
  closeNavPreferenceModal();
  // Update SQA bar visibility
  if(typeof updateSidebarQuickAdd === 'function') updateSidebarQuickAdd();
  // Re-trigger view update so FAB / addBar visibility refreshes correctly
  if(typeof render === 'function') render();
}

function _injectSidebarCollapseBtn(){
  if(document.getElementById('sidebarCollapseBtnInner')) return;
  var brand = document.querySelector('.sidebar-brand');
  if(!brand) return;
  var btn = document.createElement('button');
  btn.id = 'sidebarCollapseBtnInner';
  btn.className = 'sidebar-collapse-btn';
  btn.title = 'Tutup sidebar';
  btn.innerHTML = '✕';
  btn.onclick = function(){ closeMobileSidebar(); };
  brand.appendChild(btn);
}

function toggleMobileSidebar(){
  var sb = document.getElementById('sidebar');
  var ov = document.getElementById('sidebarOverlay');
  if(!sb) return;
  var isOpen = sb.classList.contains('mobile-open');
  sb.classList.toggle('mobile-open', !isOpen);
  if(ov) ov.classList.toggle('show', !isOpen);
  // Toggle class on btn — CSS hides it when sidebar is open
  var btn = document.getElementById('mobileSidebarToggleBtn');
  if(btn) btn.classList.toggle('sidebar-is-open', !isOpen);
}

// Override closeMobileSidebar to also update the toggle btn
var _origCloseMobileSidebar = (typeof closeMobileSidebar === 'function') ? closeMobileSidebar : null;
closeMobileSidebar = function(){
  var sb = document.getElementById('sidebar');
  var ov = document.getElementById('sidebarOverlay');
  if(sb) sb.classList.remove('mobile-open');
  if(ov) ov.classList.remove('show');
  var btn = document.getElementById('mobileSidebarToggleBtn');
  if(btn) btn.classList.remove('sidebar-is-open');
  // Restore boss if no subdrawer open
  if(typeof _bossRestoreFront === 'function' && typeof activeSubDrawer !== 'undefined' && !activeSubDrawer) _bossRestoreFront();
};

// NAV PREFERENCE MODAL (settings trigger)
function openNavPreferenceModal(){
  sholatInitSettingsToggle();
  _pendingNavMode = _mobileNavMode;
  var ov = document.getElementById('navPrefOverlay');
  var modal = document.getElementById('navPrefModal');
  if(!ov || !modal) return;

  // On desktop, hide the nav mode section header and options (only gamification applies)
  var navModeSection = document.getElementById('navPrefNavSection');
  if(navModeSection) navModeSection.style.display = isMobileNavMode() ? '' : 'none';

  // Tampilkan developer section hanya untuk developer
  var devSec = document.getElementById('devSection');
  if(devSec) devSec.style.display = isDeveloper() ? 'block' : 'none';

  ov.style.display = 'flex';
  modal.style.display = 'block';
  modal.classList.add('nav-pref-modal-enter');
  setTimeout(function(){ modal.classList.remove('nav-pref-modal-enter'); }, 400);
  _updateNavOptUI(_pendingNavMode);
  // Sync gamification UI state
  var savedMode = loadGamificationMode();
  _updateGamiSettingsUI(savedMode);

  // Close on overlay click
  ov.onclick = function(e){ if(e.target === ov) closeNavPreferenceModal(); };
  // Sync language UI
  if(typeof applyLang === 'function') applyLang(getLang());
  // Sync notification status UI
  _updateNotifSettingsUI();
  // Sync segera dimulai window UI
  var _curWin = parseInt(localStorage.getItem('chitask_segera_window')||'60',10);
  setTimeout(function(){ _syncSegDimUI(_curWin); }, 50);
}

function closeNavPreferenceModal(){
  var ov = document.getElementById('navPrefOverlay');
  var modal = document.getElementById('navPrefModal');
  if(ov) ov.style.display = 'none';
  if(modal) modal.style.display = 'none';
  _pendingNavMode = null;
}

// ── Notifikasi Settings UI helpers ──
function _updateNotifSettingsUI(){
  var label  = document.getElementById('notifStatusLabel');
  var sub    = document.getElementById('notifStatusSub');
  var badge  = document.getElementById('notifStatusBadge');
  var btnAllow = document.getElementById('notifAllowBtn2');
  var btnTest  = document.getElementById('notifTestBtn');
  var deniedGuide = document.getElementById('notifDeniedGuide');
  if(!label) return;

  if(!('Notification' in window)){
    label.textContent = 'Tidak Didukung';
    sub.textContent = 'Coba gunakan Chrome atau Samsung Browser';
    badge.textContent = '\u2715'; badge.style.background='rgba(255,80,80,0.2)'; badge.style.color='#ff6060';
    if(btnAllow) btnAllow.style.display='none';
    if(btnTest)  btnTest.style.display='none';
    if(deniedGuide) deniedGuide.style.display='none';
    return;
  }
  var perm = Notification.permission;
  if(perm === 'granted'){
    label.textContent = 'Notifikasi Aktif \u2705';
    sub.textContent = 'Reminder akan tampil tepat waktu';
    badge.textContent = '\u2713 Aktif'; badge.style.background='rgba(52,211,153,0.18)'; badge.style.color='#34d399';
    if(btnAllow) btnAllow.style.display='none';
    if(btnTest)  btnTest.style.display='';
    if(deniedGuide) deniedGuide.style.display='none';
  } else if(perm === 'denied'){
    label.textContent = 'Notifikasi Diblokir';
    sub.textContent = 'Aktifkan manual lewat setelan situs di browser';
    badge.textContent = '\u2715 Blokir'; badge.style.background='rgba(255,80,80,0.2)'; badge.style.color='#ff6060';
    if(btnAllow) btnAllow.style.display='none';
    if(btnTest)  btnTest.style.display='none';
    if(deniedGuide) deniedGuide.style.display='';
    _renderNotifDeniedGuide();
  } else {
    label.textContent = 'Belum Diizinkan';
    sub.textContent = 'Tap tombol di bawah untuk mengizinkan';
    badge.textContent = '? Belum'; badge.style.background='rgba(251,191,36,0.18)'; badge.style.color='#fbbf24';
    if(btnAllow){ btnAllow.textContent='\uD83D\uDD14 Izinkan Notifikasi'; btnAllow.onclick=_settingsRequestNotif; btnAllow.style.display=''; }
    if(btnTest)  btnTest.style.display='none';
    if(deniedGuide) deniedGuide.style.display='none';
  }
}

function _isIOS(){ return /iphone|ipad|ipod/i.test(navigator.userAgent); }
function _isSamsung(){ return /samsungbrowser/i.test(navigator.userAgent); }
function _isFirefox(){ return /firefox/i.test(navigator.userAgent); }

function _renderNotifDeniedGuide(){
  var el = document.getElementById('notifDeniedGuide');
  if(!el) return;
  var isIOS = _isIOS(), isSamsung = _isSamsung(), isFF = _isFirefox();
  var steps = [];
  if(isIOS){
    steps = [
      {icon:'⚙️', text:'Buka <b>Pengaturan</b> iPhone/iPad'},
      {icon:'📱', text:'Scroll ke bawah → pilih <b>Safari</b>'},
      {icon:'🔔', text:'Tap <b>Notifikasi</b> → aktifkan untuk ChiTask'},
      {icon:'🔄', text:'Balik ke ChiTask → <b>refresh halaman</b>'},
    ];
  } else if(isSamsung){
    steps = [
      {icon:'🔒', text:'Tap ikon <b>kunci 🔒</b> di address bar'},
      {icon:'⚙️', text:'Pilih <b>"Izin situs"</b>'},
      {icon:'🔔', text:'Tap <b>Notifikasi</b> → pilih <b>"Izinkan"</b>'},
      {icon:'🔄', text:'<b>Refresh halaman</b> lalu buka Settings lagi'},
    ];
  } else if(isFF){
    steps = [
      {icon:'🔒', text:'Tap ikon <b>gembok 🔒</b> di address bar'},
      {icon:'🔔', text:'Pilih <b>"Izin Situs" → "Notifikasi" → "Izinkan"</b>'},
      {icon:'🔄', text:'<b>Refresh halaman</b> lalu buka Settings lagi'},
    ];
  } else {
    // Chrome Android
    steps = [
      {icon:'🔒', text:'Tap ikon <b>kunci 🔒</b> atau <b>ⓘ</b> di sebelah kiri address bar'},
      {icon:'⚙️', text:'Pilih <b>"Izin situs"</b> atau <b>"Site settings"</b>'},
      {icon:'🔔', text:'Tap <b>Notifikasi</b> → ubah ke <b>"Izinkan"</b>'},
      {icon:'🔄', text:'Kembali ke tab ChiTask → <b>refresh halaman</b>'},
    ];
  }
  var html = '<div style="font-size:11px;font-weight:700;color:rgba(255,120,120,0.9);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">📋 Langkah aktifkan notifikasi:</div>';
  steps.forEach(function(s){
    html += '<div style="display:flex;align-items:flex-start;gap:9px;margin-bottom:8px">'
      + '<div style="min-width:26px;height:26px;border-radius:50%;background:rgba(255,80,80,0.12);border:1px solid rgba(255,80,80,0.25);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">' + s.icon + '</div>'
      + '<div style="font-size:12px;color:rgba(255,255,255,0.7);line-height:1.55;padding-top:4px">' + s.text + '</div>'
      + '</div>';
  });
  // Visual address bar hint
  html += '<div style="margin:10px 0 8px;padding:8px 10px;background:rgba(0,0,0,0.3);border-radius:8px;display:flex;align-items:center;gap:7px">'
    + '<span style="font-size:16px">🔒</span>'
    + '<div style="flex:1;background:rgba(255,255,255,0.08);border-radius:5px;padding:4px 10px;font-size:11px;color:rgba(255,255,255,0.3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + location.hostname + '</div>'
    + '<span style="font-size:10px;color:rgba(255,120,120,0.8);font-weight:700;flex-shrink:0;white-space:nowrap">← tap sini</span>'
    + '</div>';
  // Open settings button (not iOS — can't deep link to Safari notif settings)
  if(!isIOS){
    html += '<button onclick="_openSiteSettings()" style="width:100%;margin-top:4px;padding:11px;border:1.5px solid rgba(255,80,80,0.35);border-radius:10px;background:rgba(255,80,80,0.1);color:rgba(255,150,150,0.95);font-size:12px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif;display:flex;align-items:center;justify-content:center;gap:6px">'
      + '⚙️ &nbsp;Coba Buka Setelan Situs'
      + '</button>';
  }
  // Refresh button
  html += '<button onclick="location.reload()" style="width:100%;margin-top:8px;padding:11px;border:1.5px solid rgba(52,211,153,0.25);border-radius:10px;background:rgba(52,211,153,0.08);color:rgba(52,211,153,0.9);font-size:12px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif;display:flex;align-items:center;justify-content:center;gap:6px">'
    + '🔄 &nbsp;Refresh Halaman (setelah diizinkan)'
    + '</button>';
  el.innerHTML = html;
}

function _openSiteSettings(){
  // Android Chrome: try opening the notification settings via app settings
  // chrome:// URLs are blocked from web pages — use Android intent instead
  try {
    // Works on some Android Chrome versions via intent
    location.href = 'intent://notification#Intent;scheme=android-app;package=com.android.settings;action=android.settings.APP_NOTIFICATION_SETTINGS;end';
  } catch(e){}
  // Always show guidance toast as primary fallback
  setTimeout(function(){
    showToast('\uD83D\uDD12 Tap kunci \uD83D\uDD12 di address bar → Izin situs → Notifikasi → Izinkan → Refresh');
  }, 600);
}

function _settingsRequestNotif(){
  // If already denied, skip request and just show guide
  if('Notification' in window && Notification.permission === 'denied'){
    _updateNotifSettingsUI();
    return;
  }
  _requestNotifPermission(function(ok){
    _updateNotifSettingsUI();
    if(ok){
      showToast('\u2705 Notifikasi reminder aktif!');
      scheduleReminders();
    } else {
      // Could be denied OR silently blocked (browser refused to show prompt)
      _updateNotifSettingsUI();
      if('Notification' in window && Notification.permission !== 'denied'){
        // Silently blocked — treat as denied and show guide
        var dg = document.getElementById('notifDeniedGuide');
        if(dg){ dg.style.display=''; _renderNotifDeniedGuide(); }
        var lbl = document.getElementById('notifStatusLabel');
        var sub = document.getElementById('notifStatusSub');
        if(lbl) lbl.textContent = 'Tidak Dapat Meminta Izin';
        if(sub) sub.textContent = 'Aktifkan manual lewat setelan situs browser';
      }
    }
  });
}

function _settingsTestNotif(){
  if(!('Notification' in window) || Notification.permission !== 'granted'){
    showToast('\u26A0\uFE0F Notifikasi belum diizinkan'); return;
  }
  _fireNotification(
    'ChiTask \u23F0 Tes Reminder',
    'Notifikasi reminder kamu sudah aktif dan berfungsi!',
    'chitask-test-' + Date.now(),
    null
  );
  showToast('\uD83D\uDD14 Notifikasi tes dikirim!');
}

// ── Segera Dimulai window setting helpers ──
function _selectSegDimWindow(minutes){
  setSegDimulaiWindow(minutes);
  _syncSegDimUI(minutes);
  showToast('\u2705 Jendela "Segera Dimulai" diset ke ' + _segDimLabel(minutes));
  if(typeof render === 'function') setTimeout(render, 100);
}

function _segDimLabel(minutes){
  if(minutes===30) return '30 menit';
  if(minutes===60) return '1 jam';
  if(minutes===120) return '2 jam';
  if(minutes===180) return '3 jam';
  if(minutes===240) return '4 jam';
  if(minutes===360) return '6 jam';
  if(minutes===720) return '12 jam';
  return minutes + ' menit';
}

function _syncSegDimUI(minutes){
  var chips = document.querySelectorAll('.segdim-chip');
  chips.forEach(function(c){
    var isActive = parseInt(c.getAttribute('data-val'),10) === minutes;
    c.style.background = isActive ? 'rgba(59,130,246,0.35)' : 'rgba(255,255,255,0.06)';
    c.style.borderColor = isActive ? '#3b82f6' : 'rgba(255,255,255,0.15)';
    c.style.color = isActive ? '#93c5fd' : 'rgba(255,255,255,0.55)';
  });
  // Update notif preview lines
  var lines = document.getElementById('segDimNotifLines');
  if(!lines) return;
  var taskEx = 'Rapat Tim';
  var timeEx = '14:00';
  var showSlots = [];
  var slots = [{ms:120,label:'2 jam'},{ms:60,label:'1 jam'},{ms:30,label:'30 mnt'}];
  slots.forEach(function(s){ if(minutes >= s.ms) showSlots.push(s); });
  var html = '<div>\uD83D\uDD14 <b style="color:rgba(255,255,255,0.75)">' + taskEx + '</b> dimulai dalam 2 jam &nbsp;<span style="opacity:0.4">(' + timeEx + ')</span></div>';
  showSlots.forEach(function(s){
    html += '<div style="margin-top:3px">\uD83D\uDD14 <b style="color:rgba(255,255,255,0.75)">' + taskEx + '</b> dimulai dalam ' + s.label + ' &nbsp;<span style="opacity:0.4">(' + timeEx + ')</span></div>';
  });
  html += '<div style="margin-top:3px">\u23F0 <b style="color:rgba(255,255,255,0.75)">' + taskEx + '</b> — Sekarang!</div>';
  lines.innerHTML = html;
}

function selectNavMode(mode){
  _pendingNavMode = mode;
  _updateNavOptUI(mode);
}

function _updateNavOptUI(mode){
  var drawerCard  = document.getElementById('navopt-drawer');
  var sidebarCard = document.getElementById('navopt-sidebar');
  var drawerCheck  = document.getElementById('navopt-drawer-check');
  var sidebarCheck = document.getElementById('navopt-sidebar-check');
  if(!drawerCard) return;

  // Reset
  drawerCard.classList.remove('navopt-selected','navopt-sidebar-selected');
  sidebarCard.classList.remove('navopt-selected','navopt-sidebar-selected');
  drawerCheck.classList.remove('navopt-check-active','navopt-sidebar-check-active');
  sidebarCheck.classList.remove('navopt-check-active','navopt-sidebar-check-active');
  drawerCheck.innerHTML = '';
  sidebarCheck.innerHTML = '';

  if(mode === 'drawer'){
    drawerCard.classList.add('navopt-selected');
    drawerCheck.classList.add('navopt-check-active');
    drawerCheck.innerHTML = '✓';
  } else {
    sidebarCard.classList.add('navopt-sidebar-selected');
    sidebarCheck.classList.add('navopt-sidebar-check-active');
    sidebarCheck.innerHTML = '✓';
  }
}

// FIRST-TIME ONBOARDING
var _onbSelectedMode = null;

function showNavOnboarding(){
  var el = document.getElementById('navOnboarding');
  if(!el) return;
  el.style.display = 'flex';
  _onbSelectedMode = null;
}

function onbSelectMode(mode){
  _onbSelectedMode = mode;
  var drawerCard  = document.getElementById('onb-drawer');
  var sidebarCard = document.getElementById('onb-sidebar');
  var drawerCheck  = document.getElementById('onb-drawer-check');
  var sidebarCheck = document.getElementById('onb-sidebar-check');
  var confirmBtn   = document.getElementById('onbConfirmBtn');
  if(!drawerCard) return;

  // Reset
  drawerCard.classList.remove('onb-card-selected-drawer','onb-card-selected-sidebar');
  sidebarCard.classList.remove('onb-card-selected-drawer','onb-card-selected-sidebar');
  drawerCheck.innerHTML = '';
  sidebarCheck.innerHTML = '';
  drawerCheck.style.background = '';
  drawerCheck.style.borderColor = 'rgba(255,255,255,0.2)';
  sidebarCheck.style.background = '';
  sidebarCheck.style.borderColor = 'rgba(255,255,255,0.2)';
  drawerCheck.style.color = 'transparent';
  sidebarCheck.style.color = 'transparent';

  if(mode === 'drawer'){
    drawerCard.classList.add('onb-card-selected-drawer');
    drawerCheck.innerHTML = '✓';
    drawerCheck.style.background = '#d97706';
    drawerCheck.style.borderColor = '#d97706';
    drawerCheck.style.color = '#fff';
  } else {
    sidebarCard.classList.add('onb-card-selected-sidebar');
    sidebarCheck.innerHTML = '✓';
    sidebarCheck.style.background = '#3b82f6';
    sidebarCheck.style.borderColor = '#3b82f6';
    sidebarCheck.style.color = '#fff';
  }

  // Enable confirm button
  if(confirmBtn){
    confirmBtn.disabled = false;
    confirmBtn.style.background = mode === 'drawer' ? '#d97706' : '#3b82f6';
    confirmBtn.style.color = '#fff';
    confirmBtn.style.cursor = 'pointer';
    confirmBtn.textContent = mode === 'drawer' ? t('onb_nav_confirm_drawer') : t('onb_nav_confirm_sidebar');
  }
}

function onbConfirm(){
  if(!_onbSelectedMode) return;
  _mobileNavMode = _onbSelectedMode;
  applyNavMode(_onbSelectedMode);
  // Show gamification onboarding FIRST (instantly, before nav onboarding disappears)
  if(!localStorage.getItem('chitask_gamification_set')){
    showGamificationOnboarding();
  }
  // Then fade out nav onboarding on top
  var el = document.getElementById('navOnboarding');
  if(el){
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.3s';
    setTimeout(function(){ el.style.display = 'none'; el.style.opacity = ''; el.style.transition = ''; }, 300);
  }
}

// ── Init nav mode on app ready ──
function initNavMode(){
  if(!isMobileNavMode()) return; // Desktop always uses sidebar

  if(isFirstTimeMobile()){
    // First time on mobile: show onboarding after a short delay
    // Wait for splash to dismiss
    var _poll = setInterval(function(){
      if(window._splashDismissed){
        clearInterval(_poll);
        setTimeout(function(){ showNavOnboarding(); }, 600);
      }
    }, 150);
    // Safety timeout
    setTimeout(function(){ clearInterval(_poll); showNavOnboarding(); }, 3000);
  } else {
    // Load saved preference
    var saved = loadNavMode();
    _mobileNavMode = saved;
    applyNavMode(saved);
  }
}

// Call after app initializes
document.addEventListener('DOMContentLoaded', function(){
  // Slight delay to let initApp() run first
  setTimeout(initNavMode, 300);
});

// Also handle window resize
window.addEventListener('resize', function(){
  // FIX: Skip saat keyboard mobile muncul (ada input/textarea fokus)
  var _fa=document.activeElement;
  if(_fa&&(_fa.tagName==='INPUT'||_fa.tagName==='TEXTAREA'))return;
  if(!isMobileNavMode()){
    document.body.classList.remove('mobile-nav-sidebar');
    var btn = document.getElementById('mobileSidebarToggleBtn');
    if(btn){ btn.style.removeProperty('display'); btn.classList.remove('sidebar-is-open'); }
  } else {
    if(_mobileNavMode === 'sidebar'){
      applyNavMode('sidebar');
    }
  }
});

// ═══════════════════════════════════════════════
// GAMIFICATION MODE SYSTEM
// ═══════════════════════════════════════════════
var _GAMI_KEY = 'chitask_gamification_mode';
var _GAMI_SET_KEY = 'chitask_gamification_set';
var _RADAR_STATE_KEY = 'chitask_radar_enabled';

// Returns true if radar should be hidden (explicit off state saved, or focus mode active)
function isRadarHidden(){
  var saved = null;
  try{ saved = localStorage.getItem(_RADAR_STATE_KEY); }catch(e){}
  // If no individual toggle saved yet, fall back to gamification mode
  if(saved === null){
    return loadGamificationMode() !== 'gamer';
  }
  return saved !== '1';
}

function saveRadarState(show){
  try{ localStorage.setItem(_RADAR_STATE_KEY, show ? '1' : '0'); }catch(e){}
}

function loadGamificationMode(){
  try{ return localStorage.getItem(_GAMI_KEY) || 'focus'; }catch(e){ return 'focus'; }
}

function saveGamificationMode(mode){
  try{
    localStorage.setItem(_GAMI_KEY, mode);
    localStorage.setItem(_GAMI_SET_KEY, '1');
  }catch(e){}
  // Simpan ke variabel in-memory supaya saveData() ikut menyimpan ke chitask_v6_data
  // Ini penting untuk Guest yang tidak pakai Firestore
  if(typeof _gamiOnbDone !== 'undefined'){ _gamiOnbDone = true; _gamiModeVal = mode; }
  if(typeof saveData === 'function') saveData();
  // Simpan ke Firestore untuk user login
  if (typeof fbDb !== 'undefined' && fbDb && typeof fbUser !== 'undefined' && fbUser && !fbUser._isGuest && !fbUser._isOffline) {
    fbDb.collection('users').doc(fbUser.uid).set({ gamiOnbDone: true, gamiMode: mode }, { merge: true }).catch(function(){});
  }
}

function isGamificationModeSet(){
  try{ return !!localStorage.getItem(_GAMI_SET_KEY); }catch(e){ return false; }
}

function applyGamificationMode(mode){
  saveGamificationMode(mode);
  var body = document.body;
  if(mode === 'gamer'){
    body.classList.add('gami-gamer');
    body.classList.remove('gami-focus');
    // Show boss panel if minimized by mode
    _applyBossVisibility(true);
    // Radar chart shown in dashboard
    saveRadarState(true);
    _applyRadarVisibility(true);
  } else {
    body.classList.add('gami-focus');
    body.classList.remove('gami-gamer');
    // Hide boss panel
    _applyBossVisibility(false);
    // Hide radar
    saveRadarState(false);
    _applyRadarVisibility(false);
  }
  // Render settings toggles
  _updateGamiSettingsUI(mode);
  // If switching to focus and shop avatar tab is active, reset to 'all'
  if(mode === 'focus' && typeof shopCurrentTab !== 'undefined' && shopCurrentTab === 'avatars') {
    if(typeof shopSetTab === 'function') shopSetTab('all');
  }
  // Jika user baru pertama kali pilih gamer dan belum punya nama petualang, tanya sekarang
  if(mode === 'gamer' && typeof getCharUsername === 'function' && !getCharUsername()) {
    setTimeout(function(){ if(typeof showUsernameOnboardingPrompt==='function') showUsernameOnboardingPrompt(); }, 800);
  }
  if(typeof render === 'function') setTimeout(render, 50);
}

function _applyBossVisibility(show){
  var panel = document.getElementById('bossBattlePanel');
  var tab   = document.getElementById('bossTab');
  if(!show){
    if(panel) panel.setAttribute('data-gamiHidden', '1');
    if(panel) panel.style.display = 'none';
    // FIX: tambah boss-tab-force-hide SEBELUM set display:none
    // supaya MutationObserver di boss.js tidak melawan dan mengembalikan display:flex
    if(tab)   tab.classList.add('boss-tab-force-hide');
    if(tab)   tab.style.display = 'none';
  } else {
    if(panel){ panel.removeAttribute('data-gamiHidden'); panel.style.display = ''; }
    // FIX: clear inline style & hapus force-hide agar tab kembali muncul
    // (inline style 'none' yang tersisa dari sebelumnya bisa tetap menyembunyikan tab
    // meskipun CSS gami-gamer sudah aktif)
    if(tab){
      tab.classList.remove('boss-tab-force-hide');
      tab.style.display = '';
    }
    // Restart sprite loop setelah panel visible
    // Pakai double-rAF: panel baru keluar dari display:none, canvas butuh 1-2 frame untuk punya dimensi
    if(panel && typeof bossStartLoop === 'function'){
      requestAnimationFrame(function(){
        requestAnimationFrame(function(){
          bossStartLoop();
          bossApplyTheme && bossApplyTheme();
        });
      });
    }
  }
}

function _applyRadarVisibility(show){
  var charts = document.querySelectorAll('.radar-chart-wrap,.radar-chart-section,.dash-radar-wrap');
  charts.forEach(function(el){
    el.style.display = show ? '' : 'none';
  });
  // Update dashRadarWrap if it already exists in DOM (from previous render)
  var radarEl = document.getElementById('dashRadarWrap');
  if(radarEl) radarEl.style.display = show ? '' : 'none';
  // If currently on dashboard, re-render so radar card respects new state immediately
  if(typeof currentView !== 'undefined' && currentView === 'dashboard'){
    var dashEl = document.getElementById('taskScroll');
    if(dashEl && typeof renderDashboard === 'function'){
      setTimeout(function(){ renderDashboard(dashEl); }, 30);
    }
  }
}

function _updateGamiSettingsUI(mode){
  var toggle = document.getElementById('gamiModeToggle');
  var label  = document.getElementById('gamiModeLabel');
  if(toggle) toggle.checked = (mode === 'gamer');
  if(label)  label.textContent = mode === 'gamer' ? t('gami_mode_gamer') : t('gami_mode_focus');

  // Feature toggles (now unified in navPrefModal)
  var bossTog   = document.getElementById('gamiFeatureBoss');
  var radarTog  = document.getElementById('gamiFeatureRadar');

  var gamiOn = (mode === 'gamer');
  if(bossTog)  bossTog.checked  = gamiOn;
  // Radar toggle reflects saved individual state, not just mode
  if(radarTog) radarTog.checked = !isRadarHidden();
}

// Individual feature toggles from Settings
function gamiToggleBoss(checked){
  var panel = document.getElementById('bossBattlePanel');
  var tab   = document.getElementById('bossTab');
  if(checked){
    if(panel){ panel.removeAttribute('data-gamiHidden'); panel.style.display = ''; }
  } else {
    if(panel){ panel.setAttribute('data-gamiHidden','1'); panel.style.display = 'none'; }
    if(tab)   tab.style.display = 'none';
  }
}

function gamiToggleRadar(checked){
  saveRadarState(checked);
  _applyRadarVisibility(checked);
}

// Switch master mode from settings
function gamiSwitchMode(mode){
  applyGamificationMode(mode);
}

// ── Show the gamification onboarding screen ──
function showGamificationOnboarding(){
  var el = document.getElementById('gamiOnboarding');
  if(!el) return;
  el.style.display = 'flex';
  el.style.opacity = '0';
  setTimeout(function(){ el.style.opacity = '1'; el.style.transition = 'opacity 0.4s'; }, 10);
}

function gamiOnbSelect(mode){
  window._gamiOnbSelected = mode;
  var focusCard  = document.getElementById('gamiOnb-focus');
  var gamerCard  = document.getElementById('gamiOnb-gamer');
  var focusCheck = document.getElementById('gamiOnb-focus-check');
  var gamerCheck = document.getElementById('gamiOnb-gamer-check');
  var confirmBtn = document.getElementById('gamiOnbConfirmBtn');
  // Reset
  if(focusCard)  focusCard.style.borderColor  = 'rgba(255,255,255,0.09)';
  if(gamerCard)  gamerCard.style.borderColor  = 'rgba(255,255,255,0.09)';
  if(focusCard)  focusCard.style.background   = 'rgba(255,255,255,0.04)';
  if(gamerCard)  gamerCard.style.background   = 'rgba(255,255,255,0.04)';
  if(focusCheck) { focusCheck.innerHTML = ''; focusCheck.style.background=''; focusCheck.style.borderColor='rgba(255,255,255,0.18)'; focusCheck.style.color='transparent'; }
  if(gamerCheck) { gamerCheck.innerHTML = ''; gamerCheck.style.background=''; gamerCheck.style.borderColor='rgba(255,255,255,0.18)'; gamerCheck.style.color='transparent'; }

  if(mode === 'focus'){
    if(focusCard)  { focusCard.style.borderColor='rgba(52,211,153,0.7)'; focusCard.style.background='rgba(52,211,153,0.08)'; }
    if(focusCheck) { focusCheck.innerHTML='✓'; focusCheck.style.background='#34d399'; focusCheck.style.borderColor='#34d399'; focusCheck.style.color='#fff'; }
  } else {
    if(gamerCard)  { gamerCard.style.borderColor='rgba(139,92,246,0.7)'; gamerCard.style.background='rgba(139,92,246,0.08)'; }
    if(gamerCheck) { gamerCheck.innerHTML='✓'; gamerCheck.style.background='#8b5cf6'; gamerCheck.style.borderColor='#8b5cf6'; gamerCheck.style.color='#fff'; }
  }

  if(confirmBtn){
    confirmBtn.disabled = false;
    confirmBtn.style.background = mode === 'focus' ? '#34d399' : '#8b5cf6';
    confirmBtn.style.color = '#fff';
    confirmBtn.style.cursor = 'pointer';
    confirmBtn.textContent = mode === 'focus' ? t('onb_gami_confirm_focus') : t('onb_gami_confirm_gamer');
  }
}

function gamiOnbConfirm(){
  var mode = window._gamiOnbSelected;
  if(!mode) return;
  var el = document.getElementById('gamiOnboarding');
  if(el){
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.4s';
    setTimeout(function(){
      el.style.display='none'; el.style.opacity=''; el.style.transition='';
      // ✅ Onboarding flow selesai — baru boleh tampil pengumuman
      window._onboardingFlowDone = true;
      if(typeof _annDequeueNext === 'function') setTimeout(_annDequeueNext, 300);
      // Setelah gami onboarding ditutup, cek apakah tour perlu dijalankan
      // (kalau tourCheckAndStart sudah dipanggil sebelumnya tapi masih nunggu)
      // Jika tour belum aktif dan belum done, start sekarang
      if(!_tourActive){
        // Tunggu _appReady, pengumuman selesai, DAN username prompt selesai sebelum mulai tour
        var _tourWaitMs = 0;
        var _tourWaitPoll = setInterval(function(){
          _tourWaitMs += 100;
          var appDone = (typeof _appReady !== 'undefined' && _appReady === true);
          var timedOut = _tourWaitMs >= 15000;
          if(!appDone && !timedOut) return;
          // Tahan jika pengumuman masih tampil atau masih di antrian
          var annBusy = (typeof _annShowing !== 'undefined' && _annShowing)
                     || (typeof _annQueue   !== 'undefined' && _annQueue.length > 0);
          if(annBusy && !timedOut) return;
          // Tahan jika username prompt masih tampil
          if(document.getElementById('char-username-onboarding') && !timedOut) return;
          clearInterval(_tourWaitPoll);
          try{ if(localStorage.getItem('chitask_tour_done')) return; }catch(e){}
          if(typeof tourCheckAndStart === 'function' && fbUser && !fbUser._isGuest && !fbUser._isOffline){
            tourCheckAndStart();
          } else {
            var _td = false;
            try{ _td = !!localStorage.getItem('chitask_tour_done'); }catch(e){}
            if(!_td) setTimeout(function(){ tourStart(); }, 400);
          }
        }, 100);
      }
    }, 400);
  }
  applyGamificationMode(mode);
}

// Also init gamification for desktop first time
function initGamificationMode(){
  // Kedua path (sudah set & belum set) menunggu _appReady sebelum melanjutkan.
  // Ini mencegah applyGamificationMode → saveGamificationMode → saveData()
  // dipanggil sebelum initApp() selesai load data dari localStorage,
  // yang akan menimpa data user (tasks, gold, tema boss, dll) dengan state kosong.
  var _waitedMs = 0;
  var _gamiInitPoll = setInterval(function(){
    _waitedMs += 100;
    var appDone = (typeof _appReady !== 'undefined' && _appReady === true);
    var timedOut = _waitedMs >= 10000;
    if(!appDone && !timedOut) return;
    clearInterval(_gamiInitPoll);

    if(isGamificationModeSet()){
      // Mode sudah tersimpan — terapkan sekarang data sudah pasti dimuat
      applyGamificationMode(loadGamificationMode());
      // User sudah pernah onboarding — langsung boleh tampil pengumuman
      window._onboardingFlowDone = true;
      if(typeof _annDequeueNext === 'function') setTimeout(_annDequeueNext, 300);
      return;
    }

    // Belum pernah pilih mode — tampilkan onboarding (desktop only)
    if(!isMobileNavMode()){
      var _poll2 = setInterval(function(){
        if(window._splashDismissed){
          clearInterval(_poll2);
          setTimeout(function(){ showGamificationOnboarding(); }, 400);
        }
      }, 150);
      setTimeout(function(){ clearInterval(_poll2); showGamificationOnboarding(); }, 3000);
    }
    // Mobile: _onboardingFlowDone di-set di gamiOnbConfirm setelah user selesai pilih
  }, 100);
}
document.addEventListener('DOMContentLoaded', function(){
  setTimeout(initGamificationMode, 400);
});

// In sidebar mode, nav items should close sidebar after navigation
var _origSwitchView = (typeof switchView === 'function') ? switchView : null;
if(typeof switchView === 'function'){
  var __switchViewOrig = switchView;
  switchView = function(view){
    __switchViewOrig(view);
    // On mobile sidebar mode, auto-close sidebar after nav
    if(isMobileNavMode() && _mobileNavMode === 'sidebar'){
      setTimeout(function(){ closeMobileSidebar(); }, 120);
    }
  };
}

// ═══════════════════════════════════════════════════════════════
//  HOROSCOPE SETTINGS — Zodiak picker di dalam navPrefModal
// ═══════════════════════════════════════════════════════════════

function _initHoroscopeSettings() {
  if (typeof horoscope === 'undefined') return;

  var grid = document.getElementById('settingsZodiakGrid');
  var info  = document.getElementById('settingsZodiakSelected');
  if (!grid) return;

  var current = horoscope.getZodiak();

  // Build zodiak buttons
  var html = '';
  horoscope.ZODIAK_LIST.forEach(function(z) {
    var isActive = (z.id === current);
    html += '<button '
      + 'id="settingsZodiak-' + z.id + '" '
      + 'onclick="_settingsPickZodiak(\'' + z.id + '\')" '
      + 'style="background:' + (isActive ? 'rgba(217,119,6,0.25)' : 'rgba(255,255,255,0.05)') + ';'
      + 'border:1.5px solid ' + (isActive ? 'rgba(217,119,6,0.7)' : 'rgba(255,255,255,0.1)') + ';'
      + 'border-radius:10px;padding:9px 4px;cursor:pointer;'
      + 'display:flex;flex-direction:column;align-items:center;gap:3px;'
      + 'transition:all 0.15s;font-family:\'DM Sans\',sans-serif;width:100%">'
      + '<span style="font-size:18px;line-height:1">' + z.icon + '</span>'
      + '<span style="font-size:9px;font-weight:700;color:' + (isActive ? 'rgba(217,119,6,1)' : 'rgba(255,255,255,0.6)') + '">' + z.label + '</span>'
      + '</button>';
  });
  grid.innerHTML = html;

  // Show current zodiak info banner
  _syncZodiakSelectedBanner(current);
}

function _settingsPickZodiak(id) {
  if (typeof horoscope === 'undefined') return;

  // Update button highlight
  horoscope.ZODIAK_LIST.forEach(function(z) {
    var btn = document.getElementById('settingsZodiak-' + z.id);
    if (!btn) return;
    var isActive = (z.id === id);
    btn.style.background = isActive ? 'rgba(217,119,6,0.25)' : 'rgba(255,255,255,0.05)';
    btn.style.borderColor = isActive ? 'rgba(217,119,6,0.7)' : 'rgba(255,255,255,0.1)';
    btn.querySelector('span:last-child').style.color = isActive ? 'rgba(217,119,6,1)' : 'rgba(255,255,255,0.6)';
  });

  // Apply & save via horoscope module
  horoscope.setZodiak(id);

  // Update banner
  _syncZodiakSelectedBanner(id);

  // Mini toast feedback
  if (typeof showToast === 'function') {
    var info = horoscope.ZODIAK_LIST.find(function(z){ return z.id === id; });
    if (info) showToast(info.icon + ' Zodiak ' + info.label + ' disimpan!');
  }
}

function _syncZodiakSelectedBanner(id) {
  var info   = id ? horoscope.ZODIAK_LIST.find(function(z){ return z.id === id; }) : null;
  var banner = document.getElementById('settingsZodiakSelected');
  if (!banner) return;
  if (info) {
    banner.style.display = '';
    banner.textContent   = info.icon + '  Zodiak aktif: ' + info.label + '  (' + info.date + ')';
  } else {
    banner.style.display = 'none';
  }
}

// Hook ke openNavPreferenceModal yang sudah ada
var _origOpenNavPref = openNavPreferenceModal;
openNavPreferenceModal = function() {
  _origOpenNavPref.apply(this, arguments);
  // Isi grid zodiak setiap modal dibuka (supaya state selalu fresh)
  setTimeout(_initHoroscopeSettings, 50);
};


