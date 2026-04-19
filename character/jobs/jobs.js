// ═══════════════════════════════════════════════════════════════
//  JOBS MODULE — ChiTask Character System
//
//  Struktur folder:
//    character/jobs/normal/   → sprite normal jobs (nama folder = job id)
//    character/jobs/hidden/   → sprite hidden jobs
//
//  Setiap job folder berisi:
//    idle.webp   → animasi idle (sprite sheet atau static)
//    info.json   → metadata job (opsional, bisa override dari sini)
//
//  Public API:
//    charJobs.getActive()         → job object aktif
//    charJobs.setActive(id)       → ganti job (cek unlock dulu)
//    charJobs.isUnlocked(id)      → cek apakah job unlocked
//    charJobs.getAll()            → semua jobs (normal + hidden yg unlocked)
//    charJobs.getSpriteUrl(id)    → URL sprite idle job
//    charJobs.openPicker()        → buka job picker modal
// ═══════════════════════════════════════════════════════════════

var charJobs = (function () {

  var STORAGE_KEY = 'chitask_active_job';

  // ── NORMAL JOBS (10 starter) ──────────────────────────────────
  // unlockLevel: level minimum untuk unlock job ini
  // sprite: path relatif ke sprite idle (dari root project)
  var NORMAL_JOBS = [
    {
      id: 'Novice',
      name: 'Novice',
      icon: '⚔️',
      desc: 'Pemula yang siap menjelajah. Jack of all trades.',
      unlockLevel: 1,
      sprite: 'character/jobs/normal/Novice/idle.webp',
      statBonus: null,
      rarity: 'common'
    },
    {
      id: 'Hunter',
      name: 'Hunter',
      icon: '📚',
      desc: 'Pemburu pengalaman yang haus ilmu. Bonus XP dari task belajar.',
      unlockLevel: 3,
      sprite: 'character/jobs/normal/Hunter/idle.webp',
      statBonus: { intelligence: 1.2 },
      rarity: 'common'
    },
    {
      id: 'Warrior',
      name: 'Warrior',
      icon: '🛡️',
      desc: 'Tangguh dan tak kenal lelah. Bonus dari task olahraga.',
      unlockLevel: 6,
      sprite: 'character/jobs/normal/Warrior/idle.webp',
      statBonus: { strength: 1.2 },
      rarity: 'common'
    },
    {
      id: 'knight',
      name: 'Knight',
      icon: '🧘',
      desc: 'Disiplin besi, pikiran jernih. Bonus dari habit konsisten.',
      unlockLevel: 12,
      sprite: 'character/jobs/normal/knight/idle.webp',
      statBonus: { discipline: 1.2 },
      rarity: 'uncommon'
    },
    {
      id: 'paladin',
      name: 'Paladin',
      icon: '⚡',
      desc: 'Penjaga kesehatan jiwa dan raga. Bonus dari task kesehatan.',
      unlockLevel: 20,
      sprite: 'character/jobs/normal/paladin/idle.webp',
      statBonus: { vitality: 1.2 },
      rarity: 'uncommon'
    },
    {
      id: 'sage',
      name: 'Sage',
      icon: '🔮',
      desc: 'Kebijaksanaan melampaui usia. Bonus dari task refleksi & jurnal.',
      unlockLevel: 8,
      sprite: 'character/jobs/normal/sage/idle.webp',
      statBonus: { wisdom: 1.2 },
      rarity: 'uncommon',
      comingSoon: true
    },
    {
      id: 'bard',
      name: 'Bard',
      icon: '🎸',
      desc: 'Pesona tak tertandingi. Bonus dari task sosial & komunikasi.',
      unlockLevel: 8,
      sprite: 'character/jobs/normal/bard/idle.webp',
      statBonus: { charisma: 1.2 },
      rarity: 'uncommon',
      comingSoon: true
    },
    // [slot reserved — rare knight job TBD]
    {
      id: 'alchemist',
      name: 'Alchemist',
      icon: '⚗️',
      desc: 'Mengubah kebiasaan kecil jadi kekuatan besar.',
      unlockLevel: 15,
      sprite: 'character/jobs/normal/alchemist/idle.webp',
      statBonus: { intelligence: 1.1, wisdom: 1.1 },
      rarity: 'rare',
      comingSoon: true
    },
    {
      id: 'archmage',
      name: 'Archmage',
      icon: '🧙',
      desc: 'Puncak intelektual. Semua stat mental terboost.',
      unlockLevel: 20,
      sprite: 'character/jobs/normal/archmage/idle.webp',
      statBonus: { intelligence: 1.15, wisdom: 1.15, charisma: 1.1 },
      rarity: 'epic',
      comingSoon: true
    }
  ];

  // ── HIDDEN JOBS ───────────────────────────────────────────────
  // hiddenCondition: deskripsi kondisi unlock (tidak ditampilkan ke user sampai unlock)
  var HIDDEN_JOBS = [
    {
      id: 'shadow',
      name: '???',
      icon: '👤',
      desc: 'Sebuah kekuatan tersembunyi yang menantimu.',
      unlockLevel: 0, // unlock via kondisi khusus, bukan level
      sprite: 'character/jobs/hidden/shadow/idle.webp',
      statBonus: null,
      rarity: 'hidden',
      hiddenCondition: 'perfectStreak7', // 7 hari perfect day berturut-turut
      revealedName: 'Shadow Walker',
      revealedDesc: 'Melampaui batas tanpa diketahui siapapun. 7 hari perfect day berturut-turut.'
    },
    {
      id: 'sovereign',
      name: '???',
      icon: '👑',
      desc: 'Legenda yang belum terungkap.',
      unlockLevel: 0,
      sprite: 'character/jobs/hidden/sovereign/idle.webp',
      statBonus: null,
      rarity: 'hidden',
      hiddenCondition: 'level30',
      revealedName: 'Sovereign',
      revealedDesc: 'Hanya yang mencapai Level 30 layak menyandang mahkota ini.'
    }
  ];

  // ── State ─────────────────────────────────────────────────────
  var _activeId = null;

  function _load() {
    try { _activeId = localStorage.getItem(STORAGE_KEY) || 'Novice'; } catch(e) { _activeId = 'Novice'; }
  }
  function _save(id) {
    try { localStorage.setItem(STORAGE_KEY, id); } catch(e) {}
  }

  _load();

  // ── Helpers ───────────────────────────────────────────────────
  function _getLevel() {
    return (typeof getLevel === 'function') ? getLevel() : 1;
  }

  function _checkHiddenUnlock(job) {
    if (job.hiddenCondition === 'perfectStreak7') {
      return (typeof perfectDays !== 'undefined' && perfectDays >= 7);
    }
    if (job.hiddenCondition === 'level30') {
      return _getLevel() >= 30;
    }
    return false;
  }

  // ── Public ────────────────────────────────────────────────────
  function isUnlocked(id) {
    var job = NORMAL_JOBS.find(function(j){ return j.id === id; });
    if (job) return _getLevel() >= job.unlockLevel;
    job = HIDDEN_JOBS.find(function(j){ return j.id === id; });
    if (job) return _checkHiddenUnlock(job);
    return false;
  }

  function getActive() {
    // Cek paid avatar dulu
    if (typeof activeAvatarCard !== 'undefined' && activeAvatarCard && typeof SHOP_AVATARS !== 'undefined') {
      var paidItem = SHOP_AVATARS.find(function(i){ return i.id === activeAvatarCard; });
      if (paidItem && typeof isOwned === 'function' && isOwned(paidItem.id)) {
        var _g = (typeof charGender !== 'undefined') ? charGender.get() : 'male';
        var _spriteUrl = _g === 'female' ? paidItem.spriteFemale : paidItem.spriteMale;
        return {
          id: paidItem.jobId,
          jobId: paidItem.jobId,
          name: paidItem.name,
          icon: paidItem.icon,
          rarity: paidItem.rarity,
          sprite: _spriteUrl,
          _isPaid: true,
          _paidId: paidItem.id
        };
      }
    }
    var all = NORMAL_JOBS.concat(HIDDEN_JOBS);
    var job = all.find(function(j){ return j.id === _activeId; });
    if (!job || !isUnlocked(job.id)) {
      _activeId = 'Novice';
      _save(_activeId);
      job = NORMAL_JOBS[0];
    }
    return job;
  }

  function setActive(id) {
    if (!isUnlocked(id)) {
      if (typeof showToast === 'function') showToast('🔒 Job belum terbuka!');
      return false;
    }
    // Reset avatar card lock so job switch is not overridden by previous avatar
    if (typeof activeAvatarCard !== 'undefined') {
      activeAvatarCard = null;
    }
    _activeId = id;
    _save(id);
    // Patch sprite & rarity strip langsung tanpa tunggu full re-render
    var job = getActive();
    var _g = (typeof charGender !== 'undefined') ? charGender.get() : 'male';
    var _folder = job.sprite ? job.sprite.replace(/\/[^/]+\.webp$/, '/') : '';
    var _newSrc = _folder ? (_folder + _g + '.webp') : job.sprite;
    var spriteEl = document.getElementById('char-sprite-img');
    if (spriteEl) {
      if (spriteEl.tagName === 'IMG') {
        spriteEl.src = _newSrc;
      } else {
        spriteEl.style.backgroundImage = "url('" + _newSrc + "')";
        spriteEl.setAttribute('data-sprite-url', _newSrc);
      }
    }
    var rarityStripColors = {
      common: 'linear-gradient(90deg,var(--border),var(--border))',
      uncommon: 'linear-gradient(90deg,#22c55e,#16a34a)',
      rare: 'linear-gradient(90deg,#3b82f6,#1d4ed8)',
      epic: 'linear-gradient(90deg,#a855f7,#7c3aed)',
      hidden: 'linear-gradient(90deg,#f59e0b,#b45309)'
    };
    var stripEl = document.querySelector('.char-card-rarity-strip');
    if (stripEl) stripEl.style.background = rarityStripColors[job.rarity] || rarityStripColors.common;
    // Patch char-sprite-label (overlay label di atas sprite)
    var labelEl = document.getElementById('char-sprite-label');
    if (labelEl) labelEl.textContent = job.icon + ' ' + job.name;
    // Patch char-job-badge (badge di info karakter)
    var rarityColors = { common:'var(--muted)', uncommon:'var(--green)', rare:'var(--blue)', epic:'var(--purple)', hidden:'#f59e0b' };
    var rColor = rarityColors[job.rarity] || 'var(--muted)';
    var badgeEl = document.getElementById('char-job-badge');
    if (badgeEl) {
      badgeEl.className = 'char-job-badge rarity-' + job.rarity;
      badgeEl.style.color = rColor;
      badgeEl.style.borderColor = rColor;
      badgeEl.innerHTML = '<span>' + job.icon + '</span> ' + job.name;
    }
    // Terapkan config sprite sesuai job baru
    if (typeof CT_SpriteConfig !== 'undefined') {
      CT_SpriteConfig.apply(id, _g);
    }
    // Update skills card langsung (tanpa menunggu full re-render)
    var skillsCardEl = document.getElementById('char-skills-card');
    if (skillsCardEl && typeof buildCharSkillsCard === 'function') {
      var tmpDiv = document.createElement('div');
      tmpDiv.innerHTML = buildCharSkillsCard();
      var newCard = tmpDiv.firstChild;
      if (newCard) skillsCardEl.parentNode.replaceChild(newCard, skillsCardEl);
    }
    // Full re-render untuk update stats, nama job, dll
    var dashEl = document.getElementById('main-content') || document.getElementById('app-content') || document.getElementById('mainContent');
    if (typeof renderDashboard === 'function' && dashEl) {
      setTimeout(function(){ renderDashboard(dashEl); }, 0);
    }
    if (typeof showToast === 'function') {
      showToast(job.icon + ' Job berganti ke ' + job.name + '!');
    }
    return true;
  }

  function getAll() {
    var result = [];
    NORMAL_JOBS.forEach(function(j) {
      if (j.comingSoon) return; // hide jobs not yet ready
      result.push({ job: j, unlocked: isUnlocked(j.id), type: 'normal' });
    });
    HIDDEN_JOBS.forEach(function(j) {
      var unlocked = isUnlocked(j.id);
      result.push({
        job: unlocked ? Object.assign({}, j, { name: j.revealedName, desc: j.revealedDesc }) : j,
        unlocked: unlocked,
        type: 'hidden'
      });
    });
    return result;
  }

  function getSpriteUrl(id, gender) {
    var g = gender || (typeof charGender !== 'undefined' ? charGender.get() : 'male');
    // Check paid avatars
    if (typeof SHOP_AVATARS !== 'undefined') {
      var paidItem = SHOP_AVATARS.find(function(i){ return i.jobId === id || i.id === id; });
      if (paidItem) return g === 'female' ? paidItem.spriteFemale : paidItem.spriteMale;
    }
    var all = NORMAL_JOBS.concat(HIDDEN_JOBS);
    var job = all.find(function(j){ return j.id === id; });
    if (!job) return NORMAL_JOBS[0].sprite;
    var folder = job.sprite ? job.sprite.replace(/\/[^/]+\.webp$/, '/') : '';
    return folder ? (folder + g + '.webp') : job.sprite;
  }

  function openPicker() {
    var el = document.getElementById('char-job-picker-modal');
    if (el) {
      el.classList.add('show');
      _renderPickerContent();
    }
  }

  function closePicker() {
    var el = document.getElementById('char-job-picker-modal');
    if (el) el.classList.remove('show');
  }

  function _rarityColor(rarity) {
    return { common:'var(--muted)', uncommon:'var(--green)', rare:'var(--blue)', epic:'var(--purple)', hidden:'#f59e0b' }[rarity] || 'var(--muted)';
  }
  function _rarityLabel(rarity) {
    return { common:'Common', uncommon:'Uncommon', rare:'Rare', epic:'Epic', hidden:'Hidden' }[rarity] || rarity;
  }

  function _buildJobItem(j, unlocked, isActive) {
    var rarityColor = _rarityColor(j.rarity);
    var lockedStyle = unlocked ? '' : 'opacity:0.4;filter:grayscale(0.9)';
    var activeBorder = isActive ? 'border-color:var(--accent);box-shadow:0 0 0 2px color-mix(in srgb,var(--accent) 40%,transparent)' : '';
    var reqText = !unlocked
      ? (j.rarity === 'hidden' ? '🔒 Kondisi khusus' : '🔒 Lv ' + j.unlockLevel)
      : (isActive ? '✅ Aktif' : '');
    var clickable = unlocked && !isActive;
    // Gunakan sprite gender-aware
    var _g = (typeof charGender !== 'undefined') ? charGender.get() : 'male';
    var _folder = j.sprite ? j.sprite.replace(/\/[^/]+\.webp$/, '/') : '';
    var _spriteUrl = _folder ? (_folder + _g + '.webp') : j.sprite;
    var spriteHtml = '';
    if (unlocked && j.sprite) {
      spriteHtml = '<div class="job-picker-item-sprite-wrap"><div class="job-picker-item-sprite-anim" style="background-image:url(\'' + _spriteUrl + '\')" title="' + j.name + '"></div></div>';
    } else {
      spriteHtml = '<div style="font-size:' + (unlocked ? '24px' : '20px') + ';margin-bottom:2px">' + (unlocked || j.rarity !== 'hidden' ? j.icon : '❓') + '</div>';
    }
    return '<div class="job-picker-item" style="' + lockedStyle + ';' + activeBorder + '" '
      + (clickable ? 'onclick="charJobs.setActive(\'' + j.id + '\');charJobs.closePicker()"' : '')
      + '>'
      + spriteHtml
      + '<div style="font-size:10px;font-weight:700;color:var(--text);white-space:nowrap">' + (unlocked || j.rarity !== 'hidden' ? j.name : '???') + '</div>'
      + '<div style="font-size:9px;color:' + rarityColor + ';font-weight:700;margin-top:1px;text-transform:uppercase;letter-spacing:0.3px">' + _rarityLabel(j.rarity) + '</div>'
      + '<div style="font-size:9px;color:var(--muted);margin-top:2px">' + reqText + '</div>'
      + '</div>';
  }

  function _renderPickerContent() {
    var normalEl = document.getElementById('char-job-picker-list');
    var hiddenEl = document.getElementById('char-job-picker-hidden-list');
    var hiddenSection = document.getElementById('char-job-picker-hidden-section');
    if (!normalEl) return;
    var normalHtml = '', hiddenHtml = '';
    var anyHiddenUnlocked = false;
    var _paidActive = (typeof activeAvatarCard !== 'undefined') && !!activeAvatarCard;
    NORMAL_JOBS.forEach(function(j) {
      if (j.comingSoon) return; // hide jobs not yet ready
      normalHtml += _buildJobItem(j, isUnlocked(j.id), !_paidActive && j.id === _activeId);
    });
    HIDDEN_JOBS.forEach(function(j) {
      var unlocked = isUnlocked(j.id);
      if (unlocked) {
        anyHiddenUnlocked = true;
        var displayJob = Object.assign({}, j, { name: j.revealedName, desc: j.revealedDesc });
        hiddenHtml += _buildJobItem(displayJob, true, !_paidActive && displayJob.id === _activeId);
      }
    });
    normalEl.innerHTML = normalHtml;
    if (hiddenEl) hiddenEl.innerHTML = hiddenHtml;
    // Only show hidden section if at least one hidden job is unlocked
    if (hiddenSection) hiddenSection.style.display = anyHiddenUnlocked ? '' : 'none';
    // Paid avatars section
    var paidSection = document.getElementById('char-job-picker-paid-section');
    var paidEl = document.getElementById('char-job-picker-paid-list');
    if (paidEl && typeof SHOP_AVATARS !== 'undefined' && typeof isOwned === 'function') {
      var paidHtml = '';
      var anyPaidOwned = false;
      SHOP_AVATARS.forEach(function(item){
        if (!isOwned(item.id)) return;
        anyPaidOwned = true;
        var isActive = (typeof activeAvatarCard !== 'undefined') && activeAvatarCard === item.id;
        var _g = (typeof charGender !== 'undefined') ? charGender.get() : 'male';
        var _spriteUrl = _g === 'female' ? item.spriteFemale : item.spriteMale;
        var activeBorder = isActive ? 'border-color:var(--accent);box-shadow:0 0 0 2px color-mix(in srgb,var(--accent) 40%,transparent)' : '';
        var reqText = isActive ? '✅ Aktif' : '';
        var clickable = !isActive;
        var spriteHtml = '<div class="job-picker-item-sprite-wrap"><div class="job-picker-item-sprite-anim" style="background-image:url(\'' + _spriteUrl + '\')" title="' + item.name + '"></div></div>';
        paidHtml += '<div class="job-picker-item" style="' + activeBorder + '" '
          + (clickable ? 'onclick="shopActivateAvatarFromPicker(\'' + item.id + '\')"' : '')
          + '>'
          + spriteHtml
          + '<div style="font-size:10px;font-weight:700;color:var(--text);white-space:nowrap">' + item.name + '</div>'
          + '<div style="font-size:9px;color:var(--purple,#a855f7);font-weight:700;margin-top:1px;text-transform:uppercase;letter-spacing:0.3px">Paid</div>'
          + '<div style="font-size:9px;color:var(--muted);margin-top:2px">' + reqText + '</div>'
          + '</div>';
      });
      paidEl.innerHTML = paidHtml;
      if (paidSection) paidSection.style.display = anyPaidOwned ? '' : 'none';
      // Apply sprite animation for paid avatars in picker
      if (anyPaidOwned && typeof CT_SpriteConfig !== 'undefined') {
        setTimeout(function(){
          SHOP_AVATARS.forEach(function(item){
            if (!isOwned(item.id)) return;
            var _g2 = (typeof charGender !== 'undefined') ? charGender.get() : 'male';
            var pickerEls = paidEl ? paidEl.querySelectorAll('.job-picker-item-sprite-anim') : [];
            for (var i=0; i<pickerEls.length; i++) {
              CT_SpriteConfig.applyPicker(item.jobId, _g2);
            }
          });
        }, 50);
      }
    }
  }

  return {
    getActive, setActive, isUnlocked, getAll,
    getSpriteUrl, openPicker, closePicker,
    NORMAL_JOBS, HIDDEN_JOBS
  };

})();

// ═══════════════════════════════════════════════════════════════
//  GENDER MODULE — Pilih sprite male / female per job
//
//  Sprite path convention:
//    character/jobs/normal/<job>/male.webp
//    character/jobs/normal/<job>/female.webp
//    character/jobs/hidden/<job>/male.webp
//    character/jobs/hidden/<job>/female.webp
//
//  Fallback otomatis ke idle.webp jika file tidak ditemukan.
//
//  Public API:
//    charGender.get()       → 'male' | 'female'
//    charGender.set(v)      → simpan & re-render karakter
//    charGender.toggle()    → ganti male↔female & re-render
// ═══════════════════════════════════════════════════════════════

var charGender = (function () {
  var STORAGE_KEY = 'chitask_char_gender';
  var _gender = 'male';

  function _load() {
    try { _gender = localStorage.getItem(STORAGE_KEY) || 'male'; } catch(e) { _gender = 'male'; }
  }
  function _save(v) {
    try { localStorage.setItem(STORAGE_KEY, v); } catch(e) {}
  }

  function get() { return _gender; }

  function set(v) {
    _gender = (v === 'female') ? 'female' : 'male';
    _save(_gender);
    _rerender();
  }

  function toggle() {
    set(_gender === 'male' ? 'female' : 'male');
  }

  function _rerender() {
    // Update tombol label di card
    var btn = document.getElementById('char-gender-btn');
    if (btn) btn.innerHTML = _gender === 'female' ? '♀ Female' : '♂ Male';

    // Update sprite div langsung tanpa full re-render
    var spriteEl = document.getElementById('char-sprite-img');
    if (spriteEl && typeof charJobs !== 'undefined') {
      var job = charJobs.getActive();
      var folder = job.sprite ? job.sprite.replace(/\/[^/]+\.webp$/, '/') : '';
      if (folder) {
        var newSrc = folder + _gender + '.webp';
        if (spriteEl.tagName === 'IMG') {
          // Legacy <img> path
          spriteEl.onerror = function() {
            if (this.src.indexOf('idle.webp') < 0) { this.src = job.sprite; }
            else { this.style.display = 'none'; var ph = document.getElementById('char-sprite-placeholder'); if(ph) ph.style.display='flex'; }
          };
          spriteEl.src = newSrc;
          spriteEl.style.display = '';
          var ph = document.getElementById('char-sprite-placeholder'); if(ph) ph.style.display='none';
        } else {
          // Animated sprite div
          spriteEl.style.backgroundImage = "url('" + newSrc + "')";
          spriteEl.setAttribute('data-sprite-url', newSrc);
          spriteEl.style.display = '';
          var ph = document.getElementById('char-sprite-placeholder'); if(ph) ph.style.display='none';
        }
        // Terapkan config sprite (grid, fps, ukuran) sesuai job & gender
        if (typeof CT_SpriteConfig !== 'undefined' && job.id) {
          CT_SpriteConfig.apply(job.id, _gender);
        }
      }
    }

    // Toast feedback
    if (typeof showToast === 'function') {
      showToast(_gender === 'female' ? '♀ Karakter: Female' : '♂ Karakter: Male');
    }
  }

  _load();

  return { get, set, toggle };
})();
