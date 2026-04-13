// ════════════════════════════════════════════════════════════════════
// CHIPSTATE EXTENSIONS — tambah duration & pendingSubtasks
// ════════════════════════════════════════════════════════════════════
// Extend chipState dengan field baru
if (typeof chipState !== 'undefined') {
  chipState.duration = 0;
  chipState.pendingSubtasks = []; // [{id,name,done:false}]
}

// ════════════════════════════════════════════════════════════════════
// RECURRING: DOW & MONTHDATE logic
// ════════════════════════════════════════════════════════════════════
var _dowTargetSel   = null; // <select> yang memanggil DOW picker
var _mdTargetSel    = null; // <select> yang memanggil MONTHDATE picker

function handleRepeatChange(sel) {
  if (sel.value === '__dow__') {
    _dowTargetSel = sel;
    // Reset btns
    document.querySelectorAll('#dowDayBtns .dow-day-btn').forEach(function(b){ b.classList.remove('active'); });
    updateDowPreview();
    showPopupNear(document.getElementById('dowPickerPopup'), sel);
    return;
  }
  if (sel.value === '__monthly_date__') {
    _mdTargetSel = sel;
    document.getElementById('monthdateInput').value = 1;
    updateMonthdatePreview();
    showPopupNear(document.getElementById('monthdatePopup'), sel);
    return;
  }
  if (sel.value === '__daily_except__') {
    _dailyExceptTargetSel = sel;
    openDailyExceptModal();
    return;
  }
  if (sel.value === '__custom__') {
    _customRepeatTargetSel = sel;
    openCustomRepeatModal();
    return;
  }
  // Plain value — sync all repeat selects
  syncRepeatSelects(sel.value, sel);
}

function syncRepeatSelects(val, source) {
  var allIds = ['chip-repeat','mchip-repeat','sqa-repeat'];
  allIds.forEach(function(id) {
    if (!id) return;
    var el = document.getElementById(id);
    if (!el || el === source) return;
    // Inject option if not present (for custom values like DOW:... MONTHDATE:...)
    var found = false;
    for (var i = 0; i < el.options.length; i++) {
      if (el.options[i].value === val) { found = true; break; }
    }
    if (!found && val) {
      var opt = document.createElement('option');
      opt.value = val; opt.textContent = val;
      el.insertBefore(opt, el.querySelector('option[value="__custom__"]') || el.lastElementChild);
    }
    el.value = val || '';
  });
}

// DOW helpers
function toggleDowBtn(btn) {
  btn.classList.toggle('active');
  updateDowPreview();
}
function updateDowPreview() {
  var days = [];
  document.querySelectorAll('#dowDayBtns .dow-day-btn.active').forEach(function(b){ days.push(b.textContent); });
  var el = document.getElementById('dowPreview');
  if (el) el.textContent = days.length ? '🔁 ' + days.join(', ') + ' setiap minggu' : '';
}
function confirmDowPicker() {
  var days = [];
  document.querySelectorAll('#dowDayBtns .dow-day-btn.active').forEach(function(b){ days.push(b.getAttribute('data-day')); });
  if (!days.length) { closeDowPicker(); return; }
  var val = 'DOW:' + days.join(',');
  applyRepeatToSel(_dowTargetSel, val);
  closeDowPicker();
}
function closeDowPicker() {
  if (_dowTargetSel && _dowTargetSel.value === '__dow__') _dowTargetSel.value = '';
  _dowTargetSel = null;
  document.getElementById('dowPickerPopup').style.display = 'none';
  document.getElementById('chipPopupOverlay').style.display = 'none';
}

// MONTHDATE helpers
function updateMonthdatePreview() {
  var d = parseInt(document.getElementById('monthdateInput').value) || 1;
  d = Math.max(1, Math.min(28, d));
  var el = document.getElementById('monthdatePreview');
  if (el) el.textContent = '🔁 Setiap tanggal ' + d + ' tiap bulan';
}
function confirmMonthdatePicker() {
  var d = parseInt(document.getElementById('monthdateInput').value) || 1;
  d = Math.max(1, Math.min(28, d));
  var val = 'MONTHDATE:' + d;
  applyRepeatToSel(_mdTargetSel, val);
  closeMonthdatePicker();
}
function closeMonthdatePicker() {
  if (_mdTargetSel && _mdTargetSel.value === '__monthly_date__') _mdTargetSel.value = '';
  _mdTargetSel = null;
  document.getElementById('monthdatePopup').style.display = 'none';
  document.getElementById('chipPopupOverlay').style.display = 'none';
}

function applyRepeatToSel(sel, val) {
  if (!sel) return;
  var allIds = ['chip-repeat','mchip-repeat','sqa-repeat'];
  allIds.forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var found = false;
    for (var i = 0; i < el.options.length; i++) {
      if (el.options[i].value === val) { found = true; break; }
    }
    if (!found) {
      var opt = document.createElement('option');
      opt.value = val; opt.textContent = _repeatLabel(val);
      el.insertBefore(opt, el.querySelector('option[value="__custom__"]') || el.lastElementChild);
    }
    el.value = val;
  });
  // Also update detail panel repeat if open
  var detRep = document.getElementById('det-repeat');
  if (detRep) {
    var found2 = false;
    for (var j = 0; j < detRep.options.length; j++) {
      if (detRep.options[j].value === val) { found2 = true; break; }
    }
    if (!found2) {
      var opt2 = document.createElement('option');
      opt2.value = val; opt2.textContent = _repeatLabel(val);
      detRep.insertBefore(opt2, detRep.querySelector('option[value="__custom__"]') || detRep.lastElementChild);
    }
    detRep.value = val;
    if (typeof liveDetail === 'function' && selectedTask) liveDetail();
  }
}

function _repeatLabel(val) {
  if (!val) return '';
  if (val === 'WEEKDAYS') return 'Hari Kerja (Sen–Jum)';
  if (val === 'WEEKEND')  return 'Weekend (Sab–Min)';
  if (val.startsWith('DOW:')) {
    var names = {0:'Min',1:'Sen',2:'Sel',3:'Rab',4:'Kam',5:'Jum',6:'Sab'};
    return val.split(':')[1].split(',').map(function(d){ return names[d]||d; }).join(', ');
  }
  if (val.startsWith('MONTHDATE:')) return 'Tgl ' + val.split(':')[1] + ' tiap bulan';
  return val;
}

// Patch handleDetRepeatChange to handle DOW and MONTHDATE from detail panel
var _origHandleDetRepeatChange = handleDetRepeatChange;
handleDetRepeatChange = function(sel) {
  if (sel.value === '__dow__') {
    _dowTargetSel = sel;
    document.querySelectorAll('#dowDayBtns .dow-day-btn').forEach(function(b){ b.classList.remove('active'); });
    // Pre-fill if selectedTask already has DOW
    if (selectedTask && selectedTask.repeat && selectedTask.repeat.startsWith('DOW:')) {
      var existing = selectedTask.repeat.split(':')[1].split(',').map(Number);
      document.querySelectorAll('#dowDayBtns .dow-day-btn').forEach(function(b){
        if (existing.indexOf(parseInt(b.getAttribute('data-day'))) >= 0) b.classList.add('active');
      });
    }
    updateDowPreview();
    showPopupNear(document.getElementById('dowPickerPopup'), sel);
    return;
  }
  if (sel.value === '__monthly_date__') {
    _mdTargetSel = sel;
    var curD = (selectedTask && selectedTask.repeat && selectedTask.repeat.startsWith('MONTHDATE:'))
      ? parseInt(selectedTask.repeat.split(':')[1]) : 1;
    document.getElementById('monthdateInput').value = curD;
    updateMonthdatePreview();
    showPopupNear(document.getElementById('monthdatePopup'), sel);
    return;
  }
  _origHandleDetRepeatChange(sel);
};

// Patch liveDetail to also handle WEEKDAYS/WEEKEND/DOW/MONTHDATE
var _origLiveDetail = liveDetail;
liveDetail = function() {
  _origLiveDetail();
  if (!selectedTask) return;
  // Save duration
  var durEl = document.getElementById('det-duration');
  if (durEl) {
    var dur = parseInt(durEl.value) || 0;
    selectedTask.duration = dur > 0 ? dur : 0;
    updateDetDurLabel(dur);
  }
  // Ensure repeat value for new types is saved correctly
  var repSel = document.getElementById('det-repeat');
  if (repSel) {
    var rv = repSel.value;
    if (rv && rv !== '__dow__' && rv !== '__monthly_date__' && rv !== '__custom__' && rv !== '__daily_except__') {
      selectedTask.repeat = rv;
    }
  }
};

// Recurring logic: isHabitDueToday override
var _origIsHabitDueToday = isHabitDueToday;
isHabitDueToday = function(t) {
  var rep = t.repeat || '';
  if (rep === 'WEEKDAYS' || rep === 'WEEKEND' || rep.startsWith('DOW:') || rep.startsWith('MONTHDATE:')) {
    if (t.type !== 'Habit') return true;
    var dow = new Date().getDay();
    if (rep === 'WEEKDAYS') return dow >= 1 && dow <= 5;
    if (rep === 'WEEKEND')  return dow === 0 || dow === 6;
    if (rep.startsWith('DOW:')) {
      var days = rep.split(':')[1].split(',').map(Number);
      return days.indexOf(dow) >= 0;
    }
    if (rep.startsWith('MONTHDATE:')) return new Date().getDate() === (parseInt(rep.split(':')[1])||1);
  }
  return _origIsHabitDueToday(t);
};

// getRepeatDays override for new formats
var _origGetRepeatDays = getRepeatDays;
getRepeatDays = function(repeat) {
  if (!repeat) return 0;
  if (repeat === 'WEEKDAYS') return 1;
  if (repeat === 'WEEKEND')  return 3;
  if (repeat.startsWith('DOW:')) {
    var cnt = repeat.split(':')[1].split(',').length;
    return Math.max(1, Math.round(7/cnt));
  }
  if (repeat.startsWith('MONTHDATE:')) return 30;
  return _origGetRepeatDays(repeat);
};

// processRepeatReset override
var _origProcessRepeatReset = processRepeatReset;
processRepeatReset = function() {
  tasks.forEach(function(t) {
    if (!t.repeat) return;
    var rep = t.repeat;
    var isNew = rep==='WEEKDAYS'||rep==='WEEKEND'||rep.startsWith('DOW:')||rep.startsWith('MONTHDATE:');
    if (!isNew || !t.done) return;
    var doneDate = t.doneDate || offset(-1);
    if (doneDate >= todayStr) return;
    var dow = new Date().getDay();
    var isDue = false;
    if (rep==='WEEKDAYS') isDue = dow>=1&&dow<=5;
    else if (rep==='WEEKEND') isDue = dow===0||dow===6;
    else if (rep.startsWith('DOW:')) { var days=rep.split(':')[1].split(',').map(Number); isDue=days.indexOf(dow)>=0; }
    else if (rep.startsWith('MONTHDATE:')) isDue = new Date().getDate()===(parseInt(rep.split(':')[1])||1);
    if (isDue) {
      t.done=false; t.due=todayStr; t.doneDate=null; delete t._nextDue;
      if(t.subtasks&&t.subtasks.length)t.subtasks.forEach(function(s){s.done=false;});
      if(t.steps&&t.steps>=2)t.stepsDone=0;
    }
  });
  _origProcessRepeatReset();
};

// openDetail: sync new repeat values and duration
var _origOpenDetail_repeat = openDetail;
openDetail = function(id) {
  _origOpenDetail_repeat(id);
  // Wrap in setTimeout so selectedTask is populated before we read it
  setTimeout(function() {
    if (!selectedTask) return;
    // Sync duration panel
    var dur = selectedTask.duration || 0;
    var durEl = document.getElementById('det-duration');
    if (durEl) { durEl.value = dur > 0 ? dur : ''; }
    if (typeof syncDetDurChips === 'function') syncDetDurChips();
    if (typeof updateDetDurLabel === 'function') updateDetDurLabel(dur);
    // Sync repeat: inject custom values if not present
    var repSel = document.getElementById('det-repeat');
    var repVal = selectedTask.repeat || '';
    if (repVal && repSel) {
      var found = false;
      for (var i = 0; i < repSel.options.length; i++) {
        if (repSel.options[i].value === repVal) { found = true; break; }
      }
      if (!found) {
        var opt = document.createElement('option');
        opt.value = repVal;
        opt.textContent = (typeof _repeatLabel === 'function') ? _repeatLabel(repVal) : repVal;
        repSel.insertBefore(opt, repSel.querySelector('option[value="__custom__"]') || repSel.lastElementChild);
      }
      repSel.value = repVal;
    }
  }, 50);
};

// ════════════════════════════════════════════════════════════════════
// TIMER CHIP
// ════════════════════════════════════════════════════════════════════
var _timerChipSource = ''; // 'chip'|'mchip'|'sqachip'

function openTimerChip(source) {
  _timerChipSource = source;
  // Restore current state
  var dur = chipState.duration || 0;
  var inp = document.getElementById('timerDurInput');
  if (inp) { inp.value = dur > 0 ? dur : ''; }
  syncTimerDurBtns();
  updateTimerDurLabel();
  // Pomodoro state
  var isPomoOn = chipState.pomo || false;
  var pomoBtn = document.getElementById('timerPomoBtn');
  var pomoActive = document.getElementById('timerPomoActive');
  if (pomoBtn)    pomoBtn.style.display    = isPomoOn ? 'none' : '';
  if (pomoActive) pomoActive.style.display = isPomoOn ? 'flex' : 'none';
  // Show popup
  var btn = document.getElementById(source + '-timer');
  var popup = document.getElementById('timerChipPopup');
  if (!btn || !popup) return;
  showPopupNear(popup, btn);
}

function setTimerDur(minutes, btn) {
  chipState.duration = minutes;
  var inp = document.getElementById('timerDurInput');
  if (inp) { inp.value = minutes > 0 ? minutes : ''; }
  syncTimerDurBtns();
  updateTimerDurLabel();
}

function syncTimerDurBtns() {
  var inp = document.getElementById('timerDurInput');
  var cur = inp ? (parseInt(inp.value) || 0) : (chipState.duration || 0);
  chipState.duration = cur;
  document.querySelectorAll('#timerDurBtns .timer-dur-btn').forEach(function(b){
    var v = parseInt(b.getAttribute('data-min'));
    b.classList.toggle('active', v === cur || (v === 0 && cur === 0));
  });
  updateTimerDurLabel();
}

function updateTimerDurLabel() {
  var cur = chipState.duration || 0;
  var el = document.getElementById('timerDurLabel');
  if (!el) return;
  if (!cur || cur <= 0) { el.textContent = ''; return; }
  if (cur < 60) { el.textContent = cur + ' menit'; return; }
  var h = Math.floor(cur/60), m = cur%60;
  el.textContent = h + ' jam' + (m > 0 ? ' ' + m + ' mnt' : '');
}

function activatePomoFromChip() {
  chipState.pomo = true;
  // Sync pomo chips
  ['chip-pomo','mchip-pomo','sqachip-pomo'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.classList.add('active');
  });
  var pomoBtn    = document.getElementById('timerPomoBtn');
  var pomoActive = document.getElementById('timerPomoActive');
  if (pomoBtn)    pomoBtn.style.display    = 'none';
  if (pomoActive) pomoActive.style.display = 'flex';
}

function deactivatePomoFromChip() {
  chipState.pomo = false;
  ['chip-pomo','mchip-pomo','sqachip-pomo'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.classList.remove('active');
  });
  var pomoBtn    = document.getElementById('timerPomoBtn');
  var pomoActive = document.getElementById('timerPomoActive');
  if (pomoBtn)    pomoBtn.style.display    = '';
  if (pomoActive) pomoActive.style.display = 'none';
}

function confirmTimerChip() {
  var inp = document.getElementById('timerDurInput');
  chipState.duration = inp ? (parseInt(inp.value) || 0) : 0;
  // Update chip label
  var dur = chipState.duration;
  var label = dur > 0
    ? (dur < 60 ? dur + 'm' : Math.floor(dur/60) + 'j' + (dur%60 > 0 ? (dur%60)+'m' : ''))
    : '';
  ['chip-timer','mchip-timer','sqachip-timer'].forEach(function(id){
    var el = document.getElementById(id);
    if (!el) return;
    var isOn = chipState.pomo || dur > 0;
    el.classList.toggle('active', isOn);
    el.textContent = '⏱ Timer' + (label ? ' ('+label+')' : '') + (chipState.pomo ? ' 🍅' : '');
    // restore badge span
    el.innerHTML = '⏱ Timer' + (label ? ' <span style="opacity:0.75;font-size:10px">('+label+')</span>' : '') + (chipState.pomo ? ' 🍅' : '');
  });
  // Also write to hidden duration inputs
  ['chip-duration','mchip-duration','sqachip-duration'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.value = dur || '';
  });
  closeAllChipPopups();
}

// ════════════════════════════════════════════════════════════════════
// SUBTASK CHIP
// ════════════════════════════════════════════════════════════════════
var _subtaskChipSource = '';
if (typeof chipState !== 'undefined') chipState.pendingSubtasks = chipState.pendingSubtasks || [];

function openSubtaskChip(source) {
  _subtaskChipSource = source;
  renderSubtaskChipList();
  var btn   = document.getElementById(source + '-subtask');
  var popup = document.getElementById('subtaskChipPopup');
  if (!btn || !popup) return;
  document.getElementById('subtaskChipInput').value = '';
  showPopupNear(popup, btn);
  setTimeout(function(){ document.getElementById('subtaskChipInput').focus(); }, 100);
}

function renderSubtaskChipList() {
  var list = document.getElementById('subtaskChipList');
  if (!list) return;
  var subs = chipState.pendingSubtasks || [];
  if (!subs.length) {
    list.innerHTML = '<div style="font-size:12px;color:var(--muted);text-align:center;padding:10px 0">Belum ada sub-task. Tambahkan di bawah.</div>';
    return;
  }
  list.innerHTML = subs.map(function(s, i) {
    return '<div class="subtask-chip-item">'
      + '<div class="subtask-chip-check" style="background:' + (s.done ? 'var(--accent)' : 'transparent') + '">'
      + (s.done ? '✓' : '') + '</div>'
      + '<span style="flex:1;font-size:12px;color:var(--text)">' + (typeof escHtml !== 'undefined' ? escHtml(s.name) : s.name) + '</span>'
      + '<button onclick="removeSubtaskChip(' + i + ')" style="border:none;background:none;color:var(--muted);cursor:pointer;font-size:14px;padding:0 2px;line-height:1">×</button>'
      + '</div>';
  }).join('');
}

function addSubtaskChip() {
  var inp = document.getElementById('subtaskChipInput');
  var name = inp ? inp.value.trim() : '';
  if (!name) return;
  if (!chipState.pendingSubtasks) chipState.pendingSubtasks = [];
  chipState.pendingSubtasks.push({ id: 's' + Date.now() + Math.random(), name: name, done: false });
  if (inp) inp.value = '';
  renderSubtaskChipList();
  updateSubtaskChipBadges();
}

function removeSubtaskChip(idx) {
  if (chipState.pendingSubtasks) chipState.pendingSubtasks.splice(idx, 1);
  renderSubtaskChipList();
  updateSubtaskChipBadges();
}

function updateSubtaskChipBadges() {
  var cnt = (chipState.pendingSubtasks || []).length;
  ['chip-subtask-badge','mchip-subtask-badge','sqachip-subtask-badge'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) { el.textContent = cnt; el.style.display = cnt > 0 ? '' : 'none'; }
  });
  ['chip-subtask','mchip-subtask','sqachip-subtask'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.classList.toggle('active', cnt > 0);
  });
}

// Patch addTask to inject pendingSubtasks & duration into new task
var _origAddTask = addTask;
addTask = function() {
  _origAddTask();
  var newT = tasks[0]; // addTask does unshift
  if (!newT) return;
  // Duration from chipState
  if (chipState.duration && chipState.duration > 0) {
    newT.duration = chipState.duration;
  }
  // Pending subtasks
  if (chipState.pendingSubtasks && chipState.pendingSubtasks.length > 0) {
    newT.subtasks = chipState.pendingSubtasks.map(function(s){
      return { id: s.id, name: s.name, done: false };
    });
  }
  // Reset
  chipState.duration = 0;
  chipState.pendingSubtasks = [];
  updateSubtaskChipBadges();
  // Reset timer chip labels
  ['chip-timer','mchip-timer','sqachip-timer'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) { el.classList.remove('active'); el.innerHTML = '⏱ Timer'; }
  });
  ['chip-duration','mchip-duration','sqachip-duration'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.value = '';
  });
  saveData(true);
};

// ════════════════════════════════════════════════════════════════════
// DETAIL PANEL: Timer section toggle & dur chip sync
// ════════════════════════════════════════════════════════════════════
var _detTimerExpanded = false;
function toggleDetTimerExpand() {
  _detTimerExpanded = !_detTimerExpanded;
  var body   = document.getElementById('det-timer-body');
  var toggle = document.getElementById('det-timer-toggle');
  if (body)   body.style.display   = _detTimerExpanded ? 'flex' : 'none';
  if (toggle) toggle.textContent   = _detTimerExpanded ? '▲ Tutup' : '▼ Buka';
}

function setDetDurChip(btn, minutes) {
  document.querySelectorAll('#det-dur-chips .det-dur-chip').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
  var inp = document.getElementById('det-duration');
  if (inp) inp.value = minutes > 0 ? minutes : '';
  if (selectedTask) selectedTask.duration = minutes > 0 ? minutes : 0;
  updateDetDurLabel(minutes);
  saveData(true);
}

function syncDetDurChips() {
  var inp = document.getElementById('det-duration');
  var cur = inp ? (parseInt(inp.value) || 0) : 0;
  document.querySelectorAll('#det-dur-chips .det-dur-chip').forEach(function(b){
    var v = parseInt(b.getAttribute('data-min'));
    b.classList.toggle('active', v === cur || (v === 0 && cur === 0));
  });
  updateDetDurLabel(cur);
}

function updateDetDurLabel(minutes) {
  var el = document.getElementById('det-dur-label');
  if (!el) return;
  if (!minutes || minutes <= 0) { el.textContent = ''; return; }
  if (minutes < 60) { el.textContent = minutes + ' menit'; return; }
  var h = Math.floor(minutes/60), m = minutes%60;
  el.textContent = h + ' jam' + (m > 0 ? ' ' + m + ' mnt' : '');
}

// ════════════════════════════════════════════════════════════════════
// TASK CARD: Inject subtask mini-list + duration badge
// ════════════════════════════════════════════════════════════════════
var _origTaskCard = taskCard;
taskCard = function(t) {
  var html = _origTaskCard(t);

  // Duration badge — inject into task-meta row (works with div.task-name structure)
  if (t.duration && t.duration > 0) {
    var dur = t.duration;
    var durLabel = dur < 60 ? dur + 'm' : (Math.floor(dur/60) + 'j' + (dur%60>0 ? (dur%60)+'m' : ''));
    var badge = '<span class="task-dur-badge">⏱\u202f' + durLabel + '</span>';
    // Inject badge into task-meta div (after the opening tag)
    html = html.replace(
      /(<div class="task-meta">)/,
      function(match) { return match + badge; }
    );
  }

  // Subtask mini — inject before last closing div
  if (t.subtasks && t.subtasks.length > 0) {
    var done = t.subtasks.filter(function(s){ return s.done; }).length;
    var total = t.subtasks.length;
    var pct   = Math.round(done / total * 100);
    var isFut = !!(t.due && t.due > todayStr && !t._nextDue);
    var rows  = t.subtasks.map(function(s, i) {
      return '<div class="subtask-mini-row">'
        + '<div class="subtask-mini-chk' + (s.done?' done':'') + '"'
        + (isFut ? ' style="opacity:0.4;cursor:not-allowed"'
                 : ' onclick="event.stopPropagation();_toggleSubMini('+t.id+','+i+')" style="cursor:pointer"')
        + '>' + (s.done ? '✓' : '') + '</div>'
        + '<span class="subtask-mini-name' + (s.done?' done':'') + '">'
        + (typeof escHtml!=='undefined' ? escHtml(s.name) : s.name) + '</span>'
        + '</div>';
    }).join('');
    var miniHtml = '<div class="task-subtasks-mini" id="tsm-'+t.id+'">'
      + '<div class="subtask-mini-progress"><div class="subtask-mini-fill" style="width:'+pct+'%"></div></div>'
      + '<div style="font-size:10px;color:var(--muted);font-weight:600;margin-bottom:3px">'+done+'/'+total+' sub-task selesai</div>'
      + rows + '</div>';
    var lastDiv = html.lastIndexOf('</div>');
    if (lastDiv >= 0) html = html.slice(0, lastDiv) + miniHtml + html.slice(lastDiv);
  }
  return html;
};

function _toggleSubMini(taskId, idx) {
  var t = tasks.filter(function(x){ return x.id === taskId; })[0];
  if (!t || !t.subtasks) return;
  if (t.due && t.due > todayStr && !t._nextDue) { showToast('⏳ Task ini baru bisa dikerjakan pada ' + fmt(t.due)); return; }
  var s = t.subtasks[idx]; if (!s) return;
  s.done = !s.done;
  if (s.done) { totalSubtasks++; addXP(XP_PER_SUBTASK, '+'+XP_PER_SUBTASK); }
  else totalSubtasks = Math.max(0, totalSubtasks-1);
  checkAchievements();
  // Refresh mini inline
  var wrap = document.getElementById('tsm-'+taskId);
  if (wrap) {
    var done  = t.subtasks.filter(function(x){ return x.done; }).length;
    var total = t.subtasks.length;
    var pct   = Math.round(done/total*100);
    var isFut = !!(t.due && t.due > todayStr && !t._nextDue);
    wrap.querySelector('.subtask-mini-fill').style.width = pct + '%';
    wrap.querySelector('.subtask-mini-fill').parentNode.nextSibling.textContent = done+'/'+total+' sub-task selesai';
    var rows = wrap.querySelectorAll('.subtask-mini-row');
    t.subtasks.forEach(function(sub, i) {
      if (!rows[i]) return;
      var chk  = rows[i].querySelector('.subtask-mini-chk');
      var name = rows[i].querySelector('.subtask-mini-name');
      if (chk)  { chk.classList.toggle('done', sub.done);  chk.textContent = sub.done ? '✓' : ''; }
      if (name) name.classList.toggle('done', sub.done);
    });
  }
  if (selectedTask && selectedTask.id === taskId && typeof renderSubtasksPanel === 'function') renderSubtasksPanel();
  saveData(true);
}

// ════════════════════════════════════════════════════════════════════
// POPUP POSITIONING HELPER
// ════════════════════════════════════════════════════════════════════
function showPopupNear(popup, anchor) {
  var ov = document.getElementById('chipPopupOverlay');
  if (ov) ov.style.display = 'block';
  popup.style.display = 'flex';
  // Position
  var rect  = anchor.getBoundingClientRect();
  var pw    = popup.offsetWidth  || 280;
  var ph    = popup.offsetHeight || 200;
  var vw    = window.innerWidth;
  var vh    = window.innerHeight;
  var isMob = vw <= 700;
  if (!isMob) {
    var left = Math.min(rect.left, vw - pw - 8);
    var top  = rect.bottom + 6;
    if (top + ph > vh - 8) top = rect.top - ph - 6;
    popup.style.left   = Math.max(8, left) + 'px';
    popup.style.top    = top + 'px';
    popup.style.bottom = '';
    popup.style.transform = '';
  }
  // Mobile: CSS handles positioning via @media query
}

function closeAllChipPopups() {
  var ov = document.getElementById('chipPopupOverlay');
  if (ov) ov.style.display = 'none';
  ['timerChipPopup','subtaskChipPopup','dowPickerPopup','monthdatePopup'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

// Close popups on scroll
window.addEventListener('scroll', closeAllChipPopups, true);

// ════════════════════════════════════════════════════════════════════
// UTIL
// ════════════════════════════════════════════════════════════════════
if (typeof escHtml === 'undefined') {
  window.escHtml = function(s) {
    return s ? s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : '';
  };
}

console.log('[ChiTask+] Features loaded: Recurring, Timer chip, Subtask chip');