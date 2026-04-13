// ═══════════════════════════════════════════════════════
// ONBOARDING TOUR
// ═══════════════════════════════════════════════════════
var _tourStep = 0;
var _tourActive = false;
var _tourCheckStarted = false; // guard: cegah double-trigger tourCheckAndStart

// ── Tour steps — dibedakan mobile (drawer/sidebar) vs desktop ──
function _buildTourSteps() {
  var isMobile = window.innerWidth <= 700;
  var isSidebarMode = isMobile && _mobileNavMode === 'sidebar';

  var common_intro = [
    { modal: true, icon: '👋', title: t('tour_welcome_title'), desc: t('tour_welcome_desc') },
    { modal: true, icon: '☁️', title: t('tour_cloud_title'), desc: t('tour_cloud_desc') },
    { modal: true, icon: '📱', title: t('tour_install_title'), desc: t('tour_install_desc') }
  ];

  var common_outro = [
    { target: 'bossBattlePanel', openSidebar: false, icon: '⚔️', title: t('tour_boss_title'), desc: t('tour_boss_desc'), preferSide: 'left', bossEnsureVisible: true },
    { modal: true, icon: '🎉', title: t('tour_ready_title'), desc: t('tour_ready_desc') }
  ];

  if (isMobile && isSidebarMode) {
    return common_intro.concat([
      { target: 'mobileSidebarToggleBtn', openSidebar: false, icon: '☰', title: t('tour_sidebar_btn_title'), desc: t('tour_sidebar_btn_desc') },
      { target: 'sqaCollapsed', openSidebar: false, icon: '➕', title: t('tour_add_task_title'), desc: t('tour_add_task_desc') },
      { target: 'habitPanel', openSidebar: false, scrollTarget: true, icon: '🔥', title: t('tour_habit_title'), desc: t('tour_habit_desc') },
      { target: 'xpFill', openSidebar: true, parent: true, preferSide: 'right', icon: '⚡', title: t('tour_xp_title'), desc: t('tour_xp_desc_sidebar') },
      { target: 'goldLabel', openSidebar: true, parent: true, preferSide: 'right', icon: '🪙', title: t('tour_gold_title'), desc: t('tour_gold_desc_sidebar') },
      { target: 'nav-myday', openSidebar: true, openNavSection: 'task', preferSide: 'right', icon: '📝', title: t('tour_nav_task_title'), desc: t('tour_nav_task_desc') },
      { target: 'nav-shop', openSidebar: true, openNavSection: 'task', preferSide: 'right', icon: '🏪', title: t('tour_shop_title'), desc: t('tour_shop_desc') },
      { target: 'nav-dashboard', openSidebar: true, openNavSection: 'task', preferSide: 'right', icon: '📊', title: t('tour_dashboard_title'), desc: t('tour_dashboard_desc') },
      { target: 'nav-achievements', openSidebar: true, openNavSection: 'task', preferSide: 'right', icon: '🏆', title: t('tour_achievements_title'), desc: t('tour_achievements_desc') },
      { target: 'navsection-fin', openSidebar: true, openNavSection: 'fin', preferSide: 'right', icon: '💰', title: t('tour_fin_title'), desc: t('tour_fin_desc') },
      { target: 'navsection-journal', openSidebar: true, openNavSection: 'journal', preferSide: 'right', icon: '📔', title: t('tour_journal_title'), desc: t('tour_journal_desc') },
      { target: 'navsection-maint', openSidebar: true, openNavSection: 'maint', preferSide: 'right', icon: '🔧', title: t('tour_maint_title'), desc: t('tour_maint_desc') },
      { target: 'fbUserInfo', openSidebar: true, preferSide: 'right', icon: '👤', title: t('tour_account_title'), desc: t('tour_account_desc') }
    ].concat(common_outro));

  } else if (isMobile) {
    return common_intro.concat([
      { target: 'fabAdd', icon: '➕', title: t('tour_add_task_title_fab'), desc: t('tour_add_task_desc_fab') },
      { target: 'habitPanel', scrollTarget: true, icon: '🔥', title: t('tour_habit_title'), desc: t('tour_habit_desc') },
      { modal: true, icon: '⚡', title: t('tour_xp_title'), desc: t('tour_xp_desc_drawer') },
      { modal: true, icon: '🪙', title: t('tour_gold_title'), desc: t('tour_gold_desc_drawer') },
      { target: 'bn-task', openDrawer: null, icon: '📋', title: t('tour_nav_task_title'), desc: t('tour_nav_task_desc_drawer') },
      { target: 'sdi-dashboard', openDrawer: 'task', icon: '📊', title: t('tour_dashboard_title'), desc: t('tour_dashboard_desc') },
      { target: 'sdi-shop', openDrawer: 'task', icon: '🏪', title: t('tour_shop_title'), desc: t('tour_shop_desc_drawer') },
      { target: 'sdi-achievements', openDrawer: 'task', icon: '🏆', title: t('tour_achievements_title'), desc: t('tour_achievements_desc') },
      { target: 'bn-fin', openDrawer: null, icon: '💰', title: t('tour_fin_title_drawer'), desc: t('tour_fin_desc_drawer') },
      { target: 'bn-journal', openDrawer: null, icon: '📔', title: t('tour_journal_title_drawer'), desc: t('tour_journal_desc') },
      { target: 'bn-maint', openDrawer: null, icon: '🔧', title: t('tour_maint_title_drawer'), desc: t('tour_maint_desc_drawer') },
      { modal: true, icon: '👤', title: t('tour_account_title_drawer'), desc: t('tour_account_desc_drawer') }
    ].concat(common_outro));

  } else {
    return common_intro.concat([
      { target: 'addBar', icon: '➕', title: t('tour_add_task_title_desktop'), desc: t('tour_add_task_desc_desktop') },
      { target: 'habitPanel', scrollTarget: true, icon: '🔥', title: t('tour_habit_title'), desc: t('tour_habit_desc') },
      { target: 'xpFill', parent: true, preferSide: 'right', icon: '⚡', title: t('tour_xp_title'), desc: t('tour_xp_desc_desktop') },
      { target: 'goldLabel', parent: true, preferSide: 'right', icon: '🪙', title: t('tour_gold_title'), desc: t('tour_gold_desc_desktop') },
      { target: 'fbUserInfo', preferSide: 'right', icon: '👤', title: t('tour_account_title'), desc: t('tour_account_desc_desktop') },
      { target: 'navgroup-task', openNavSection: 'task', preferSide: 'right', icon: '📝', title: t('tour_nav_task_title'), desc: t('tour_nav_task_desc_desktop') },
      { target: 'nav-shop', openNavSection: 'task', preferSide: 'right', icon: '🏪', title: t('tour_shop_title'), desc: t('tour_shop_desc') },
      { target: 'nav-dashboard', openNavSection: 'task', preferSide: 'right', icon: '📊', title: t('tour_dashboard_title'), desc: t('tour_dashboard_desc_desktop') },
      { target: 'nav-achievements', openNavSection: 'task', preferSide: 'right', icon: '🏆', title: t('tour_achievements_title'), desc: t('tour_achievements_desc_desktop') },
      { target: 'navsection-fin', openNavSection: 'fin', preferSide: 'right', icon: '💰', title: t('tour_fin_title_drawer'), desc: t('tour_fin_desc_desktop') },
      { target: 'navsection-maint', openNavSection: 'maint', preferSide: 'right', icon: '🔧', title: t('tour_maint_title_drawer'), desc: t('tour_maint_desc_drawer') },
      { target: 'navsection-journal', openNavSection: 'journal', preferSide: 'right', icon: '📔', title: t('tour_journal_title_drawer'), desc: t('tour_journal_desc') }
    ].concat(common_outro));
  }
}

var TOUR_STEPS = [];

// ═══════════════════════════════════════════════════════
// TASK FORM TOUR — tutorial saat pertama kali buka form tambah task
// ═══════════════════════════════════════════════════════

var _ftActive = false;
var _ftStep = 0;
var _ftSteps = [];
var FT_KEY = 'chitask_formtour_done';

function _ftIsDone() {
  try { return !!localStorage.getItem(FT_KEY); } catch(e) { return false; }
}
function _ftMarkDone() {
  try { localStorage.setItem(FT_KEY, '1'); } catch(e) {}
  // ✅ FIX: Simpan ke Firestore supaya form tour tidak muncul lagi di browser/device lain
  if (typeof fbDb !== 'undefined' && fbDb && typeof fbUser !== 'undefined' && fbUser && !fbUser._isGuest && !fbUser._isOffline) {
    fbDb.collection('users').doc(fbUser.uid).set({ formTourDone: true }, { merge: true }).catch(function(){});
  }
}

function _ftBuildMobile() {
  return [
    { target: 'mobileTaskInput', icon: '✏️', title: t('ft_input_title'), desc: t('ft_input_desc_mobile') },
    { target: 'mchip-habit', icon: '🔥', title: t('ft_habit_title'), desc: t('ft_habit_desc_mobile') },
    { target: 'mchip-important', icon: '⭐', title: t('ft_important_title'), desc: t('ft_important_desc_mobile') },
    { target: 'mchip-shopping', icon: '🛒', title: t('ft_shopping_title'), desc: t('ft_shopping_desc_mobile') },
    { target: 'mchip-nodue', icon: '📌', title: t('ft_nodue_title'), desc: t('ft_nodue_desc') },
    { target: 'mchip-repeat', icon: '🔄', title: t('ft_repeat_title'), desc: t('ft_repeat_desc') },
    { target: 'mchip-group', icon: '📁', title: t('ft_group_title'), desc: t('ft_group_desc') },
    { target: 'mchip-due', parentLabel: true, icon: '📅', title: t('ft_due_title'), desc: t('ft_due_desc') },
    { target: 'mchip-reminder', parentLabel: true, icon: '🔔', title: t('ft_reminder_title'), desc: t('ft_reminder_desc') },
    { target: 'mchip-steps', icon: '🔢', title: t('ft_steps_title'), desc: t('ft_steps_desc') }
  ];
}

function _ftBuildDesktop() {
  return [
    { target: 'taskInput', icon: '✏️', title: t('ft_input_title'), desc: t('ft_input_desc_desktop') },
    { target: 'chip-habit', icon: '🔥', title: t('ft_habit_title'), desc: t('ft_habit_desc_desktop') },
    { target: 'chip-important', icon: '⭐', title: t('ft_important_title'), desc: t('ft_important_desc_desktop') },
    { target: 'chip-shopping', icon: '🛒', title: t('ft_shopping_title'), desc: t('ft_shopping_desc_desktop') },
    { target: 'chip-nodue', icon: '📌', title: t('ft_nodue_title'), desc: t('ft_nodue_desc_desktop') },
    { target: 'chip-repeat', icon: '🔄', title: t('ft_repeat_title'), desc: t('ft_repeat_desc_desktop') },
    { target: 'chip-group', icon: '📁', title: t('ft_group_title'), desc: t('ft_group_desc_desktop') },
    { target: 'chip-due', icon: '📅', title: t('ft_due_title'), desc: t('ft_due_desc') },
    { target: 'chip-reminder', icon: '🔔', title: t('ft_reminder_title'), desc: t('ft_reminder_desc') },
    { target: 'chip-steps', icon: '🔢', title: t('ft_steps_title'), desc: t('ft_steps_desc_desktop') },
    { target: 'colorPicker', icon: '🎨', title: t('ft_color_title'), desc: t('ft_color_desc') }
  ];
}

function _ftGetRect(targetId, opts) {
  var el = document.getElementById(targetId);
  if (!el) return null;
  if (opts && opts.parentLabel) { el = el.closest('label') || el.parentElement || el; }
  var r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  return r;
}

function _ftPosition(step) {
  var card = document.getElementById('ftCard');
  var hole = document.getElementById('ftHole');
  if (!card || !hole) return;
  var s = _ftSteps[step];
  var rect = _ftGetRect(s.target, s);

  document.getElementById('ftBadge').textContent = (step + 1) + ' / ' + _ftSteps.length;
  document.getElementById('ftIcon').textContent = s.icon;
  document.getElementById('ftTitle').textContent = s.title;
  document.getElementById('ftDesc').innerHTML = s.desc;
  document.getElementById('ftPrev').style.display = step === 0 ? 'none' : '';
  var nextBtn = document.getElementById('ftNext');
  if (step === _ftSteps.length - 1) { nextBtn.textContent = t('ft_done_label'); nextBtn.style.background = 'linear-gradient(135deg,#d97706,#f59e0b)'; }
  else { nextBtn.textContent = t('ft_next_label'); nextBtn.style.background = '#d97706'; }

  var dots = document.querySelectorAll('#ftDots .ft-dot');
  dots.forEach(function(d, i) {
    d.classList.toggle('active', i === step);
    d.classList.toggle('done', i < step);
  });

  var vw = window.innerWidth;
  var vh = window.innerHeight;
  var cardW = Math.min(290, vw - 32);

  if (!rect) {
    hole.style.cssText = 'display:none';
    card.style.cssText = 'display:block;position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:' + cardW + 'px;z-index:10002;border-radius:16px';
    return;
  }

  var hPad = 7;
  hole.style.cssText = 'display:block;position:fixed;left:' + (rect.left-hPad) + 'px;top:' + (rect.top-hPad) + 'px;width:' + (rect.width+hPad*2) + 'px;height:' + (rect.height+hPad*2) + 'px;border-radius:12px;box-shadow:0 0 0 9999px rgba(0,0,0,0.75);pointer-events:none;z-index:10001;transition:all 0.22s cubic-bezier(.32,.72,0,1);border:2px solid rgba(217,119,6,0.7)';

  card.style.display = 'block';
  card.style.width = cardW + 'px';
  card.style.transform = '';
  var cardH = card.offsetHeight || 230;
  var spaceBelow = vh - rect.bottom;
  var spaceAbove = rect.top;
  var cardTop = (spaceBelow >= cardH + 20) ? rect.bottom + 12 : (spaceAbove >= cardH + 20) ? rect.top - cardH - 12 : Math.max(12, (vh - cardH) / 2);
  var cardLeft = Math.min(Math.max(rect.left, 8), vw - cardW - 8);
  card.style.cssText = 'display:block;position:fixed;left:' + cardLeft + 'px;top:' + cardTop + 'px;width:' + cardW + 'px;z-index:10002;border-radius:16px';
}

function _ftBuildDots() {
  var wrap = document.getElementById('ftDots');
  if (!wrap) return;
  wrap.innerHTML = '';
  _ftSteps.forEach(function(_, i) {
    var d = document.createElement('div');
    d.className = 'ft-dot';
    wrap.appendChild(d);
  });
}

function ftCheckAndStart(isMobile) {
  if (_ftIsDone()) return;
  if (_ftActive) return;
  if (_tourActive) return;
  setTimeout(function() { _ftStart(isMobile); }, isMobile ? 420 : 150);
}

function _ftStart(isMobile) {
  _ftSteps = isMobile ? _ftBuildMobile() : _ftBuildDesktop();
  _ftStep = 0;
  _ftActive = true;
  var overlay = document.getElementById('ftOverlay');
  if (!overlay) return;
  overlay.style.display = 'block';
  _ftBuildDots();
  _ftPosition(_ftStep);
}

function ftNext() {
  if (_ftStep < _ftSteps.length - 1) { _ftStep++; _ftPosition(_ftStep); }
  else { ftFinish(); }
}
function ftPrev() {
  if (_ftStep > 0) { _ftStep--; _ftPosition(_ftStep); }
}
function ftSkip() { ftFinish(); }
function ftFinish() {
  _ftActive = false;
  _ftMarkDone();
  var overlay = document.getElementById('ftOverlay');
  var hole = document.getElementById('ftHole');
  var card = document.getElementById('ftCard');
  if (overlay) overlay.style.display = 'none';
  if (hole) hole.style.cssText = 'display:none';
  if (card) card.style.display = 'none';
}

window.addEventListener('resize', function() {
  var _fa=document.activeElement;
  if(_fa&&(_fa.tagName==='INPUT'||_fa.tagName==='TEXTAREA'))return;
  if (_ftActive) _ftPosition(_ftStep);
});

var _tourFirestorePending = false; // guard: sedang menunggu hasil fetch Firestore

function tourCheckAndStart() {
  if (_tourCheckStarted) return; // sudah pernah dipanggil session ini
  _tourCheckStarted = true;
  // Cek localStorage dulu — kalau sudah ada, langsung skip tanpa fetch Firestore
  try { if (localStorage.getItem('chitask_tour_done')) return; } catch(e) {}
  // Cek Firestore apakah user sudah pernah tour
  if (!fbUser || !fbDb) return;
  _tourFirestorePending = true; // tandai sedang fetch, blokir _tourWaitSplashThenStart
  fbDb.collection('users').doc(fbUser.uid).get().then(function(doc) {
    _tourFirestorePending = false;
    var data = doc.exists ? doc.data() : {};
    if (data && data.tourDone) {
      // Sync ke localStorage supaya offline/fallback juga tahu sudah done
      try { localStorage.setItem('chitask_tour_done', '1'); } catch(e) {}
      return; // sudah pernah, skip
    }
    _tourWaitSplashThenStart();
  }).catch(function() {
    _tourFirestorePending = false;
    // Kalau gagal fetch, cek localStorage sebagai fallback
    try {
      if (localStorage.getItem('chitask_tour_done')) return;
    } catch(e) {}
    _tourWaitSplashThenStart();
  });
}

function _tourWaitSplashThenStart() {
  // Tunggu splash DAN gami/nav onboarding selesai, baru mulai tour
  function _bothReady() {
    if (_tourFirestorePending) return false; // masih menunggu hasil Firestore
    if (!window._splashDismissed) return false;
    var gamiEl = document.getElementById('gamiOnboarding');
    if (gamiEl && gamiEl.style.display !== 'none' && gamiEl.style.display !== '') return false;
    var navEl = document.getElementById('navOnboarding');
    if (navEl && navEl.style.display !== 'none' && navEl.style.display !== '') return false;
    return true;
  }
  if (_bothReady()) {
    setTimeout(function() { tourStart(); }, 400);
    return;
  }
  var _poll = setInterval(function() {
    if (_bothReady()) {
      clearInterval(_poll);
      setTimeout(function() { tourStart(); }, 400);
    }
  }, 200);
  // Safety timeout 18 detik
  setTimeout(function() {
    clearInterval(_poll);
    if (!_tourActive) tourStart();
  }, 18000);
}

function tourStart() {
  // Rebuild steps sesuai device (mobile/desktop) saat tour dimulai
  TOUR_STEPS = _buildTourSteps();
  _tourStep = 0;
  _tourActive = true;
  document.getElementById('tourOverlay').classList.add('active');
  document.body.classList.add('tour-active');
  _tourBuildDots();
  tourShow(_tourStep);
}

function tourShow(idx) {
  var step = TOUR_STEPS[idx];
  if (!step) { tourFinish(); return; }

  var card = document.getElementById('tourCard');
  var hole = document.getElementById('tourHole');

  // Update content
  document.getElementById('tourBadge').textContent = t('tour_step_badge').replace('{0}', idx+1).replace('{1}', TOUR_STEPS.length);
  document.getElementById('tourIcon').textContent = step.icon;
  document.getElementById('tourTitle').textContent = step.title;
  document.getElementById('tourDesc').innerHTML = step.desc;

  // Prev button
  var prevBtn = document.getElementById('tourPrevBtn');
  prevBtn.style.display = idx > 0 ? '' : 'none';

  // Next / Finish button
  var nextBtn = document.getElementById('tourNextBtn');
  var isLast = idx === TOUR_STEPS.length - 1;
  nextBtn.textContent = isLast ? t('tour_finish') : (idx === 0 ? t('tour_next') : 'Lanjut →');
  nextBtn.className = 'tour-btn ' + (isLast ? 'finish' : 'next');

  // Update dots
  _tourUpdateDots(idx);

  if (step.modal) {
    // Modal mode — centered, no spotlight
    card.style.display = '';
    card.classList.add('modal-style');
    card.style.top = '';
    card.style.left = '';
    card.style.transform = '';
    hole.classList.add('hidden');
    hole.style.opacity = '0';
    // Close any open subdrawer when showing modal
    if (typeof closeSubDrawer === 'function') closeSubDrawer(true);
    // In sidebar mode modal steps, also close the sidebar so it doesn't block
    if (typeof _mobileNavMode !== 'undefined' && _mobileNavMode === 'sidebar') {
      if (typeof closeMobileSidebar === 'function') closeMobileSidebar();
    }
    return;
  }

  // ── Spotlight mode ──

  // Handle openSidebar: open or close mobile sidebar before spotlighting
  if (typeof step.openSidebar !== 'undefined') {
    var sb = document.getElementById('sidebar');
    var isOpen = sb && sb.classList.contains('mobile-open');
    if (step.openSidebar && !isOpen) {
      if (typeof toggleMobileSidebar === 'function') toggleMobileSidebar();
      setTimeout(function() { tourShow(idx); }, 350);
      return;
    } else if (!step.openSidebar && isOpen) {
      if (typeof closeMobileSidebar === 'function') closeMobileSidebar();
      setTimeout(function() { tourShow(idx); }, 300);
      return;
    }
  }

  // If targeting mobileSidebarToggleBtn, make sure sidebar is CLOSED first so button is visible
  if (step.target === 'mobileSidebarToggleBtn') {
    var sb2 = document.getElementById('sidebar');
    if (sb2 && sb2.classList.contains('mobile-open')) {
      if (typeof closeMobileSidebar === 'function') closeMobileSidebar();
      setTimeout(function() { tourShow(idx); }, 300);
      return;
    }
  }

  // Handle openNavSection: ensure a desktop sidebar nav section is expanded
  if (step.openNavSection) {
    var secKey = step.openNavSection;
    if (typeof navSectionOpen !== 'undefined' && !navSectionOpen[secKey]) {
      // Section is collapsed — expand it, then retry after animation
      if (typeof toggleNavSection === 'function') toggleNavSection(secKey);
      setTimeout(function() { tourShow(idx); }, 350);
      return;
    }
  }

  // Handle bossEnsureVisible: temporarily restore minimized boss panel for tour spotlight
  if (step.bossEnsureVisible) {
    if (typeof _bossMinimized !== 'undefined' && _bossMinimized) {
      var _bPanel = document.getElementById('bossBattlePanel');
      var _bTab   = document.getElementById('bossTab');
      if (_bPanel) _bPanel.style.display = '';
      if (_bTab)   _bTab.style.display   = 'none';
      if (typeof bossStartLoop === 'function') bossStartLoop();
      window._tourBossWasMinimized = true;
      setTimeout(function() { tourShow(idx); }, 350);
      return;
    }
    window._tourBossWasMinimized = false;
  } else if (window._tourBossWasMinimized) {
    // Leaving boss step — re-hide panel since user had it minimized
    window._tourBossWasMinimized = false;
    var _bPanel2 = document.getElementById('bossBattlePanel');
    var _bTab2   = document.getElementById('bossTab');
    if (_bPanel2) _bPanel2.style.display = 'none';
    if (_bTab2)   _bTab2.style.display   = 'flex';
    if (typeof bossSpriteRaf !== 'undefined' && bossSpriteRaf) {
      cancelAnimationFrame(bossSpriteRaf); bossSpriteRaf = null;
    }
  }

  // Handle subdrawer open/close requirements
  // step.openDrawer === undefined  → don't care about drawer state
  // step.openDrawer === 'task'     → make sure task drawer is open
  // step.openDrawer === null       → close any open drawer
  if (typeof step.openDrawer !== 'undefined') {
    if (step.openDrawer) {
      // Need a specific drawer open
      if (typeof activeSubDrawer !== 'undefined' && activeSubDrawer !== step.openDrawer) {
        if (typeof toggleSubDrawer === 'function') toggleSubDrawer(step.openDrawer);
        setTimeout(function() { tourShow(idx); }, 380);
        return;
      }
    } else {
      // step.openDrawer === null → close drawer
      if (typeof activeSubDrawer !== 'undefined' && activeSubDrawer) {
        if (typeof closeSubDrawer === 'function') closeSubDrawer(true);
        setTimeout(function() { tourShow(idx); }, 380);
        return;
      }
    }
  }

  var el = document.getElementById(step.target);

  // habitPanel: if height is zero (no habits added yet), fallback to modal
  if (step.target === 'habitPanel' && el && el.offsetHeight < 10) {
    card.style.display = '';
    card.classList.add('modal-style');
    card.style.top = '';
    card.style.left = '';
    card.style.transform = '';
    hole.classList.add('hidden');
    hole.style.opacity = '0';
    // Update desc to explain
    document.getElementById('tourDesc').innerHTML = 'Panel ini akan muncul setelah kamu menambahkan task bertipe <b>Habit 🔥</b>. Setiap hari kamu bisa centang habit untuk menjaga streak!';
    return;
  }

  if (!el) {
    // Element not found — fallback to modal
    card.style.display = '';
    card.classList.add('modal-style');
    card.style.top = '';
    card.style.left = '';
    card.style.transform = '';
    hole.classList.add('hidden');
    hole.style.opacity = '0';
    return;
  }

  // Resolve the actual target element (for parent-based targets)
  var targetEl = el;
  if (step.parent) {
    targetEl = el.closest('.xp-bar-wrap, .gold-display, [class*="wrap"]') || el.parentElement || el;
  }
  if (step.target === 'goldLabel') {
    // Spotlight the gold-display pill, not the entire sidebar-bottom
    targetEl = el.closest('.gold-display') || el.parentElement || el;
  }
  if (step.target === 'xpFill') {
    targetEl = document.querySelector('.xp-bar-wrap') || el.parentElement || el;
  }

  // Scroll element into view correctly
  var sidebarScrollEl = document.querySelector('.sidebar-scroll');
  var sidebarBottomEl = document.querySelector('.sidebar-bottom');
  var insideSidebarScroll = sidebarScrollEl && sidebarScrollEl.contains(targetEl);
  var insideSidebarBottom = sidebarBottomEl && sidebarBottomEl.contains(targetEl);
  // posDelay declared here so assignment inside if-block takes effect
  var posDelay = insideSidebarScroll ? 200 : 60;

  if (insideSidebarScroll) {
    // Use getBoundingClientRect delta — works even through overflow:hidden parents
    var elRect2 = targetEl.getBoundingClientRect();
    var contRect2 = sidebarScrollEl.getBoundingClientRect();
    var currentScroll = sidebarScrollEl.scrollTop;
    var elTopRelCont = elRect2.top - contRect2.top;
    var targetScroll = currentScroll + elTopRelCont - (sidebarScrollEl.clientHeight / 2) + (targetEl.offsetHeight / 2);
    var scrollDist = Math.abs(targetScroll - currentScroll);
    // Adaptive delay: further = more time for smooth scroll to settle
    posDelay = Math.min(520, 200 + Math.floor(scrollDist / 2));
    sidebarScrollEl.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
  } else if (!insideSidebarBottom) {
    // Normal window scroll for elements in .main
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  // sidebar-bottom elements are always visible (fixed at bottom of sidebar), no scroll needed

  card.classList.remove('modal-style');
  hole.classList.remove('hidden');
  hole.style.opacity = '1';

  requestAnimationFrame(function() {
    setTimeout(function() {
      _tourPositionCard(card, hole, targetEl, step);
    }, posDelay);
  });
}

function _tourPositionCard(card, hole, targetEl, step) {
  var rect = targetEl.getBoundingClientRect();
  var pad = 10;

  // If element is off-screen (e.g. in collapsed sidebar), fallback to modal
  if (rect.width === 0 && rect.height === 0) {
    card.style.display = '';
    card.classList.add('modal-style');
    card.style.top = '';
    card.style.left = '';
    card.style.transform = '';
    hole.classList.add('hidden');
    hole.style.opacity = '0';
    return;
  }

  // Position hole
  hole.style.top    = (rect.top    - pad) + 'px';
  hole.style.left   = (rect.left   - pad) + 'px';
  hole.style.width  = (rect.width  + pad * 2) + 'px';
  hole.style.height = (rect.height + pad * 2) + 'px';

  var vw = window.innerWidth;
  var vh = window.innerHeight;
  var margin = 14;
  var cardW = Math.min(310, vw * 0.88);

  // Temporarily render card off-screen (invisible) to measure true height
  card.style.visibility = 'hidden';
  card.style.display    = '';
  card.style.width      = cardW + 'px';
  card.style.top        = '-9999px';
  card.style.left       = '-9999px';
  card.style.transform  = 'none';

  // Force layout then measure
  var cardH = card.getBoundingClientRect().height || card.offsetHeight || 260;
  card.style.visibility = '';

  // Spotlight zone boundaries
  var holeTop    = rect.top    - pad;
  var holeBottom = rect.bottom + pad;
  var holeLeft   = rect.left   - pad;
  var holeRight  = rect.right  + pad;

  var spaceBelow = vh - holeBottom - margin;
  var spaceAbove = holeTop - margin;
  var spaceRight = vw - holeRight - margin;
  var spaceLeft  = holeLeft - margin;

  var cardTop, cardLeft;

  // Helpers
  function clampH(t) { return Math.max(8, Math.min(t, vh - cardH - 8)); }
  function clampW(l) { return Math.max(8, Math.min(l, vw - cardW - 8)); }
  function centerOnTarget() { return clampW(rect.left + rect.width / 2 - cardW / 2); }
  function vcenterOnTarget() { return clampH(rect.top + rect.height / 2 - cardH / 2); }

  // preferSide: force card to a specific side (e.g. 'right' for sidebar items)
  var prefer = step.preferSide || null;

  if (prefer === 'right' && spaceRight >= cardW) {
    cardLeft = holeRight + margin;
    cardTop  = vcenterOnTarget();
  } else if (prefer === 'left' && spaceLeft >= cardW) {
    cardLeft = holeLeft - cardW - margin;
    cardTop  = vcenterOnTarget();
  } else if (spaceBelow >= cardH) {
    // Below spotlight — default preferred
    cardTop  = holeBottom + margin;
    cardLeft = centerOnTarget();
  } else if (spaceAbove >= cardH) {
    // Above spotlight
    cardTop  = holeTop - cardH - margin;
    cardLeft = centerOnTarget();
  } else if (spaceRight >= cardW) {
    // Right of spotlight
    cardLeft = holeRight + margin;
    cardTop  = vcenterOnTarget();
  } else if (spaceLeft >= cardW) {
    // Left of spotlight
    cardLeft = holeLeft - cardW - margin;
    cardTop  = vcenterOnTarget();
  } else {
    // Fallback: below with overlap is better than center (still shows spotlight)
    if (spaceBelow >= cardH * 0.5) {
      cardTop  = holeBottom + margin;
      cardLeft = centerOnTarget();
    } else {
      // Last resort: center of screen
      cardTop  = clampH(vh / 2 - cardH / 2);
      cardLeft = clampW(vw / 2 - cardW / 2);
    }
  }

  // Final clamp to ensure card is fully on-screen
  cardTop  = clampH(cardTop);
  cardLeft = clampW(cardLeft);

  card.style.top  = cardTop  + 'px';
  card.style.left = cardLeft + 'px';
}

function tourNext() {
  if (_tourStep < TOUR_STEPS.length - 1) {
    _tourStep++;
    tourShow(_tourStep);
  } else {
    tourFinish();
  }
}

function tourPrev() {
  if (_tourStep > 0) {
    _tourStep--;
    tourShow(_tourStep);
  }
}

function tourSkip() {
  // confirm() is unreliable in PWA/standalone mode — use inline confirmation instead
  var card = document.getElementById('tourCard');
  if (!card) { tourFinish(); return; }

  // If inline confirm already showing, avoid duplicate
  if (document.getElementById('tourSkipConfirm')) return;

  var confirmDiv = document.createElement('div');
  confirmDiv.id = 'tourSkipConfirm';
  confirmDiv.style.cssText = 'position:absolute;inset:0;background:#1c1917;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;z-index:10;text-align:center;';
  confirmDiv.innerHTML =
    '<div style="font-size:13px;color:rgba(255,255,255,0.75);line-height:1.5;">' + t('tour_skip_confirm') + '</div>' +
    '<div style="display:flex;gap:10px;width:100%;">' +
      '<button onclick="document.getElementById(\'tourSkipConfirm\').remove()" style="flex:1;padding:9px;border-radius:9px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.7);font-size:13px;cursor:pointer;">Batal</button>' +
      '<button onclick="tourFinish()" style="flex:1;padding:9px;border-radius:9px;border:none;background:#d97706;color:#fff;font-size:13px;font-weight:600;cursor:pointer;">Ya, lewati</button>' +
    '</div>';
  card.style.overflow = 'hidden';
  card.appendChild(confirmDiv);
}

function tourFinish() {
  _tourActive = false;
  document.getElementById('tourCard').style.display = 'none';
  document.getElementById('tourHole').classList.add('hidden');
  document.getElementById('tourOverlay').classList.remove('active');
  document.body.classList.remove('tour-active');
  // Close any subdrawer opened by tour
  if (typeof closeSubDrawer === 'function') closeSubDrawer(true);
  // In sidebar mode, close sidebar after tour ends
  if (typeof _mobileNavMode !== 'undefined' && _mobileNavMode === 'sidebar') {
    if (typeof closeMobileSidebar === 'function') closeMobileSidebar();
  }

  // Simpan tourDone ke in-memory (supaya saveData() tulis ke chitask_v6_data — penting untuk Guest)
  if(typeof _tourDone !== 'undefined') _tourDone = true;
  if(typeof saveData === 'function') saveData();
  // Simpan ke Firestore untuk user login
  if (fbUser && fbDb && !fbUser._isGuest && !fbUser._isOffline) {
    fbDb.collection('users').doc(fbUser.uid).set({ tourDone: true }, { merge: true }).catch(function(){});
  }
  // Fallback localStorage
  try { localStorage.setItem('chitask_tour_done', '1'); } catch(e) {}
  // Tampilkan pengumuman yang tertahan selama tutorial berjalan
  if(typeof _annDequeueNext === 'function') setTimeout(_annDequeueNext, 400);
}

function _tourBuildDots() {
  var wrap = document.getElementById('tourDots');
  wrap.innerHTML = '';
  TOUR_STEPS.forEach(function(_, i) {
    var d = document.createElement('div');
    d.className = 'tour-dot';
    wrap.appendChild(d);
  });
}

function _tourUpdateDots(idx) {
  var dots = document.querySelectorAll('#tourDots .tour-dot');
  dots.forEach(function(d, i) {
    d.classList.remove('active', 'done');
    if (i < idx) d.classList.add('done');
    else if (i === idx) d.classList.add('active');
  });
}