'use strict';
// ══════════════════════════════════════════════════════════════════════════
// MODULE 1: ADVANCED NLP PARSER
// Replaces the original nlpParseTask with full recurrence + day detection
// ══════════════════════════════════════════════════════════════════════════
(function() {

  // ── Helper: date to YYYY-MM-DD string ──
  function toDateStr(d) {
    return d.getFullYear() + '-'
      + String(d.getMonth() + 1).padStart(2, '0') + '-'
      + String(d.getDate()).padStart(2, '0');
  }

  // ── Helper: next occurrence of a weekday from today ──
  function nextWeekday(dayIndex, fromToday) {
    var d = new Date(); d.setHours(0,0,0,0);
    var cur = d.getDay();
    var diff = ((dayIndex - cur + 7) % 7) || (fromToday ? 7 : 0);
    d.setDate(d.getDate() + diff);
    return d;
  }

  /**
   * DAYS_MAP: maps Indonesian day names → 0-6 (0=Minggu)
   */
  var DAYS_MAP = {
    'minggu': 0, 'senin': 1, 'selasa': 2, 'rabu': 3,
    'kamis': 4, 'jumat': 5, "jum'at": 5, 'sabtu': 6
  };

  /**
   * buildRepeatFromDays: given array of day indices, build a repeat string
   * e.g. [1,3] → "Tiap Senin Rabu"
   */
  var DAY_NAMES = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  function buildRepeatFromDays(dayIndices) {
    if (!dayIndices || !dayIndices.length) return '';
    if (dayIndices.length === 7) return 'Harian';
    return 'Tiap ' + dayIndices.map(function(i){ return DAY_NAMES[i]; }).join(' ');
  }

  /**
   * ENHANCED nlpParseTask — full NLP with recurrence support
   * Returns: { name, due, reminder, repeat, important, nlpHints }
   */
  window.nlpParseTask = function(raw) {
    var text = (raw || '').trim();
    var result = {
      name: raw,
      due: '',
      reminder: '',
      repeat: '',
      important: false,
      nlpHints: []
    };
    if (!text) return result;

    // ── STEP 1: Parse TIME ──
    // Patterns: "jam 7", "jam 07:30", "jam 7 pagi", "3 sore", "pukul 10", "09.00"
    var timePatterns = [
      /\bjam\s+(\d{1,2})(?:[:\.](\d{2}))?\s*(pagi|siang|sore|malam)?\b/i,
      /\bpukul\s+(\d{1,2})(?:[:\.](\d{2}))?\s*(pagi|siang|sore|malam)?\b/i,
      /@(\d{1,2})(?::(\d{2}))?\s*(pagi|siang|sore|malam)?\b/i,
      /\b(\d{1,2})\s+(pagi|siang|sore|malam)\b/i,
      /\b(\d{1,2})[:\.](\d{2})\b/
    ];
    var parsedHour = -1, parsedMin = 0;
    for (var tp = 0; tp < timePatterns.length; tp++) {
      var tm = text.match(timePatterns[tp]);
      if (tm) {
        parsedHour = parseInt(tm[1]);
        parsedMin = tm[2] ? parseInt(tm[2]) : 0;
        var period = (tm[3] || tm[2] || '').toLowerCase();
        if (period === 'malam' || period === 'sore') {
          if (parsedHour < 12) parsedHour += 12;
        } else if (period === 'pagi') {
          if (parsedHour === 12) parsedHour = 0;
        } else if (period === 'siang') {
          if (parsedHour < 12) parsedHour = parsedHour; // noon-ish
        } else {
          // Heuristic: 1-6 tanpa keterangan → sore/malam
          if (parsedHour >= 1 && parsedHour <= 6) parsedHour += 12;
        }
        // Clamp
        if (parsedHour > 23) parsedHour = 23;
        text = text.replace(tm[0], '').trim();
        result.reminder = String(parsedHour).padStart(2,'0') + ':' + String(parsedMin).padStart(2,'0');
        var h12 = parsedHour % 12 || 12;
        var ampm = parsedHour >= 12 ? 'PM' : 'AM';
        result.nlpHints.push('⏰ ' + String(h12).padStart(2,'0') + ':' + String(parsedMin).padStart(2,'0') + ' ' + ampm);
        break;
      }
    }

    // ── STEP 2: Detect RECURRENCE ──
    // Priority: check recurrence BEFORE date so "tiap senin rabu" doesn't get eaten as a date
    var repeatResult = _nlpDetectRepeat(text);
    if (repeatResult.repeat) {
      result.repeat = repeatResult.repeat;
      result.nlpHints.push('🔁 ' + repeatResult.label);
      text = repeatResult.remaining;
      // For habits, default due = today (start now)
      if (!result.due) {
        var todayD = new Date(); todayD.setHours(0,0,0,0);
        result.due = toDateStr(todayD);
      }
    }

    // ── STEP 3: Parse DATE (only if not already set by recurrence) ──
    if (!result.due || result.due === toDateStr((function(){ var d=new Date();d.setHours(0,0,0,0);return d; })())) {
      var dateResult = _nlpDetectDate(text);
      if (dateResult.due) {
        result.due = dateResult.due;
        result.nlpHints.push('📅 ' + dateResult.label);
        text = dateResult.remaining;
      }
    }

    // ── STEP 4: Important keywords ──
    if (/\b(penting|urgent|segera|asap|prioritas)\b/i.test(text)) {
      result.important = true;
      text = text.replace(/\b(penting|urgent|segera|asap|prioritas)\b/gi, '').trim();
      result.nlpHints.push('⭐ Penting');
    }

    // ── STEP 5: Auto-detect Habit type if has recurrence ──
    if (result.repeat && !result.isHabit) {
      result.isHabit = true; // Signal to caller to set type=Habit
    }

    // ── STEP 6: Clean title ──
    result.name = text.replace(/\s{2,}/g, ' ').replace(/[,\-–]+$/, '').trim() || raw;

    return result;
  };

  // ── Internal: detect repeat patterns ──
  function _nlpDetectRepeat(text) {
    var out = { repeat: '', label: '', remaining: text };

    // "tiap hari" / "setiap hari" / "tiap harinya" / "harian" / "minum vitamin tiap hari"
    if (/\b(tiap|setiap)\s+hari\b|(\bharian\b)/i.test(text)) {
      out.repeat = 'Harian';
      out.label = 'Setiap hari';
      out.remaining = text.replace(/\b(tiap|setiap)\s+hari\b|\bharian\b/gi, '').trim();
      return out;
    }

    // "seminggu sekali" / "tiap minggu" / "setiap minggu" / "mingguan"
    if (/\b(seminggu\s+sekali|tiap\s+minggu|setiap\s+minggu|mingguan)\b/i.test(text)) {
      out.repeat = 'Mingguan';
      out.label = 'Setiap minggu';
      out.remaining = text.replace(/\b(seminggu\s+sekali|tiap\s+minggu|setiap\s+minggu|mingguan)\b/gi, '').trim();
      return out;
    }

    // "sebulan sekali" / "tiap bulan" / "bulanan" / "tiap tanggal X"
    var monthlyTgl = text.match(/\btiap\s+tanggal\s+(\d{1,2})\b/i);
    if (monthlyTgl) {
      var tgl = parseInt(monthlyTgl[1]);
      out.repeat = 'Bulanan';
      out.label = 'Setiap tgl ' + tgl;
      out.remaining = text.replace(monthlyTgl[0], '').trim();
      // Set due to next occurrence of this date
      var today2 = new Date(); today2.setHours(0,0,0,0);
      var dNext = new Date(today2.getFullYear(), today2.getMonth(), tgl);
      if (dNext < today2) dNext.setMonth(dNext.getMonth() + 1);
      out.due = toDateStr(dNext);
      return out;
    }
    if (/\b(sebulan\s+sekali|tiap\s+bulan|setiap\s+bulan|bulanan)\b/i.test(text)) {
      out.repeat = 'Bulanan';
      out.label = 'Setiap bulan';
      out.remaining = text.replace(/\b(sebulan\s+sekali|tiap\s+bulan|setiap\s+bulan|bulanan)\b/gi, '').trim();
      return out;
    }

    // "tiap X hari" / "setiap 2 hari sekali" / "tiap 3 hari"
    var everyNDays = text.match(/\b(?:tiap|setiap)\s+(\d+)\s+hari(?:\s+sekali)?\b/i);
    if (everyNDays) {
      var n = parseInt(everyNDays[1]);
      out.repeat = 'Tiap ' + n + ' Hari';
      out.label = 'Setiap ' + n + ' hari';
      out.remaining = text.replace(everyNDays[0], '').trim();
      return out;
    }

    // "tiap X minggu"
    var everyNWeeks = text.match(/\b(?:tiap|setiap)\s+(\d+)\s+minggu\b/i);
    if (everyNWeeks) {
      var nw = parseInt(everyNWeeks[1]);
      out.repeat = 'Tiap ' + (nw * 7) + ' Hari';
      out.label = 'Setiap ' + nw + ' minggu';
      out.remaining = text.replace(everyNWeeks[0], '').trim();
      return out;
    }

    // "tiap senin rabu" / "setiap senin dan kamis" — multiple days
    var multiDayMatch = text.match(
      /\b(?:tiap|setiap)\s+((?:(?:senin|selasa|rabu|kamis|jumat|jum'at|sabtu|minggu)(?:\s+(?:dan|&|,)?\s*)?){2,})\b/i
    );
    if (multiDayMatch) {
      var dayStr = multiDayMatch[1].toLowerCase();
      var indices = [];
      Object.keys(DAYS_MAP).forEach(function(k) {
        if (new RegExp('\\b' + k + '\\b').test(dayStr)) {
          var idx = DAYS_MAP[k];
          if (indices.indexOf(idx) < 0) indices.push(idx);
        }
      });
      indices.sort(function(a,b){ return a-b; });
      if (indices.length >= 2) {
        out.repeat = buildRepeatFromDays(indices);
        out.label = 'Tiap ' + indices.map(function(i){ return DAY_NAMES[i]; }).join(', ');
        out.remaining = text.replace(multiDayMatch[0], '').trim();
        // Due = next occurrence of first day
        out.due = toDateStr(nextWeekday(indices[0], true));
        return out;
      }
    }

    // Single day: "tiap senin" / "setiap jumat"
    var singleDayMatch = text.match(
      /\b(?:tiap|setiap)\s+(senin|selasa|rabu|kamis|jumat|jum'at|sabtu|minggu)\b/i
    );
    if (singleDayMatch) {
      var dIdx = DAYS_MAP[singleDayMatch[1].toLowerCase()];
      out.repeat = 'Tiap ' + DAY_NAMES[dIdx];
      out.label = 'Setiap ' + DAY_NAMES[dIdx];
      out.remaining = text.replace(singleDayMatch[0], '').trim();
      out.due = toDateStr(nextWeekday(dIdx, true));
      return out;
    }

    return out;
  }

  // ── Internal: detect relative/absolute dates ──
  function _nlpDetectDate(text) {
    var out = { due: '', label: '', remaining: text };
    var today = new Date(); today.setHours(0,0,0,0);

    function offset(n) {
      var d = new Date(today); d.setDate(d.getDate() + n); return toDateStr(d);
    }
    function friendlyLabel(dateStr) {
      var d = new Date(dateStr + 'T00:00:00');
      var diff = Math.round((d - today) / 86400000);
      return diff === 0 ? 'Hari ini' : diff === 1 ? 'Besok' : diff === 2 ? 'Lusa' : dateStr;
    }

    var patterns = [
      { re: /\bhari\s+ini\b/i, fn: function(){ return offset(0); } },
      { re: /\bsekarang\b/i,    fn: function(){ return offset(0); } },
      { re: /\bbesok\b/i,       fn: function(){ return offset(1); } },
      { re: /\blusa\b/i,        fn: function(){ return offset(2); } },
      { re: /\bminggu\s+depan\b/i, fn: function(){ return offset(7); } },
      { re: /\bbulan\s+depan\b/i,  fn: function(){
        var d = new Date(today); d.setMonth(d.getMonth()+1); return toDateStr(d);
      }},
      { re: /\b(?:tanggal|tgl)\s+(\d{1,2})\b/i, fn: function(m){
        var d = new Date(today); d.setDate(parseInt(m[1]));
        if (d < today) d.setMonth(d.getMonth()+1);
        return toDateStr(d);
      }},
      { re: /\b(\d{1,2})\s+(jan(?:uari)?|feb(?:ruari)?|mar(?:et)?|apr(?:il)?|mei|jun(?:i)?|jul(?:i)?|agu(?:stus)?|sep(?:tember)?|okt(?:ober)?|nov(?:ember)?|des(?:ember)?)\b/i, fn: function(m){
        var months={jan:0,feb:1,mar:2,apr:3,mei:4,jun:5,jul:6,agu:7,sep:8,okt:9,nov:10,des:11};
        var key = m[2].slice(0,3).toLowerCase();
        var d = new Date(today.getFullYear(), months[key]||0, parseInt(m[1]));
        if (d < today) d.setFullYear(d.getFullYear()+1);
        return toDateStr(d);
      }},
      { re: /\b(senin|selasa|rabu|kamis|jumat|sabtu|minggu)\b/i, fn: function(m){
        var idx = DAYS_MAP[m[1].toLowerCase()];
        var d = new Date(today); var cur = d.getDay();
        var diff = ((idx - cur + 7) % 7) || 7;
        d.setDate(d.getDate() + diff);
        return toDateStr(d);
      }},
      { re: /\b(\d+)\s+hari\s+(?:lagi|ke\s*depan)\b/i, fn: function(m){ return offset(parseInt(m[1])); } },
      { re: /\b(\d+)\s+minggu\s+lagi\b/i, fn: function(m){ return offset(parseInt(m[1])*7); } },
    ];

    for (var i = 0; i < patterns.length; i++) {
      var dm = text.match(patterns[i].re);
      if (dm) {
        var val = patterns[i].fn(dm);
        if (val) {
          out.due = val;
          out.label = friendlyLabel(val);
          out.remaining = text.replace(dm[0], '').trim();
        }
        break;
      }
    }
    return out;
  }

  console.log('[ChiTask v2] Advanced NLP parser loaded.');
})();


// ══════════════════════════════════════════════════════════════════════════
// MODULE 2: ENHANCED nlpApplyAndAdd — apply repeat/habit from NLP
// Wraps the existing function to also handle the new `repeat` and `isHabit`
// fields returned by the upgraded parser.
// ══════════════════════════════════════════════════════════════════════════
(function() {
  var _origNlpApplyAndAdd = window.nlpApplyAndAdd;

  window.nlpApplyAndAdd = function(inputId, addFn) {
    var inp = document.getElementById(inputId);
    if (!inp) return;
    var raw = inp.value.trim();
    if (!raw) { if (typeof showToast !== 'undefined') showToast('Ketik nama task dulu 😊'); return; }

    if (typeof window._handleHiddenGimmeGoldCommand === 'function' && window._handleHiddenGimmeGoldCommand(raw, inputId)) {
      return;
    }

    var p = window.nlpParseTask(raw);

    // Set task name
    inp.value = p.name;
    var mainInp = document.getElementById('taskInput');
    if (mainInp && inputId !== 'taskInput') mainInp.value = p.name;

    // Apply due date
    if (p.due) {
      ['chip-due', 'mchip-due'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) {
          el.value = p.due;
          if (typeof taskbarDateUpdateLabel === 'function') taskbarDateUpdateLabel(id, p.due);
        }
      });
    }

    // Apply reminder time
    if (p.reminder) {
      ['chip-reminder', 'mchip-reminder'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) {
          el.value = p.reminder;
          if (typeof taskbarReminderUpdateLabel === 'function') taskbarReminderUpdateLabel(id, p.reminder);
        }
      });
    }

    // Apply recurrence repeat rule
    if (p.repeat) {
      ['chip-repeat', 'mchip-repeat'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el && !el.value) {
          // Check if this repeat value exists as an option; if so, set it
          var exists = false;
          for (var i = 0; i < el.options.length; i++) {
            if (el.options[i].value === p.repeat) { exists = true; break; }
          }
          if (!exists) {
            // Add as custom option
            var opt = document.createElement('option');
            opt.value = p.repeat;
            opt.textContent = p.repeat;
            el.appendChild(opt);
          }
          el.value = p.repeat;
        }
      });

      // Auto-enable Habit chip when recurrence detected
      if (p.isHabit && typeof chipState !== 'undefined' && !chipState.habit) {
        chipState.habit = true;
        ['chip-habit', 'mchip-habit', 'sqachip-habit'].forEach(function(id) {
          var el = document.getElementById(id);
          if (el) el.classList.add('active');
        });
      }
    }

    // Apply important flag
    if (p.important && typeof chipState !== 'undefined' && !chipState.important) {
      chipState.important = true;
      ['chip-important', 'mchip-important'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.classList.add('active');
      });
    }

    // Hide NLP previews
    ['nlpPreview', 'nlpPreviewMobile'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    // Call original add function (addTask / addTaskMobile / addTaskSqa)
    addFn();
  };

  console.log('[ChiTask v2] Enhanced nlpApplyAndAdd loaded.');
})();


// ══════════════════════════════════════════════════════════════════════════
// MODULE 3: NLP PREVIEW UPGRADE — show repeat hint in preview bar
// ══════════════════════════════════════════════════════════════════════════
(function() {
  // Override nlpShowPreview to also handle repeat hints
  window.nlpShowPreview = function(val) {
    var previewEl = document.getElementById('nlpPreview');
    if (!previewEl) return;
    if (!val || val.length < 4) { previewEl.style.display = 'none'; return; }
    var p = window.nlpParseTask(val);
    if (!p.nlpHints || !p.nlpHints.length) { previewEl.style.display = 'none'; return; }
    previewEl.innerHTML = '<span style="color:var(--muted);font-size:11px">✨ Terdeteksi: </span>'
      + p.nlpHints.map(function(h) {
          return '<span style="background:var(--pill,#f0f0f0);border:1px solid var(--border);border-radius:10px;'
               + 'padding:2px 8px;font-size:11px;font-weight:600;color:var(--accent)">' + h + '</span>';
        }).join(' ');
    previewEl.style.display = 'flex';
    previewEl.style.flexWrap = 'wrap';
    previewEl.style.gap = '4px';
    previewEl.style.alignItems = 'center';
  };

  // Same for mobile
  window.nlpShowPreviewMobile = window.nlpShowPreview;

  // Keep debounce wrappers pointing to new function
  var _debTimer = null;
  window.nlpInputChange = function(val) {
    clearTimeout(_debTimer);
    _debTimer = setTimeout(function() { window.nlpShowPreview(val); }, 220);
  };
  window.nlpInputChangeMobile = window.nlpInputChange;

  console.log('[ChiTask v2] Enhanced NLP preview loaded.');
})();


// ══════════════════════════════════════════════════════════════════════════
// MODULE 4: CALENDAR RENDERING BUG FIX
// Fix: recurring/habit tasks added to future dates don't show in calendar.
// Solution: patch getTasksForDate to handle repeat intervals correctly,
// including tasks that have a repeat but no history yet.
// ══════════════════════════════════════════════════════════════════════════
(function() {

  // Helper: parse YYYY-MM-DD to midnight Date
  function parseDate(s) {
    return new Date(s + 'T00:00:00');
  }

  // Helper: check if a repeat pattern fires on a given dateStr
  function repeatFiresOnDate(t, dateStr) {
    if (!t.repeat) return false;
    var anchor = t.due;
    if (!anchor) return false;

    var anchorD = parseDate(anchor);
    var targetD = parseDate(dateStr);

    // Must not be before anchor
    if (targetD < anchorD) return false;

    var repeat = t.repeat;

    // "Harian" or "Harian kecuali X"
    if (repeat === 'Harian' || repeat.indexOf('Harian kecuali') === 0) {
      if (repeat.indexOf('Harian kecuali') === 0) {
        var _HARI_MAP2 = {senin:1,selasa:2,rabu:3,kamis:4,jumat:5,"jum'at":5,sabtu:6,minggu:0};
        var skipDay = repeat.replace('Harian kecuali','').trim().toLowerCase();
        var skipIdx = _HARI_MAP2[skipDay];
        if (skipIdx !== undefined && parseDate(dateStr).getDay() === skipIdx) return false;
      }
      return true;
    }

    // "Mingguan"
    if (repeat === 'Mingguan') {
      var diff = Math.round((targetD - anchorD) / 86400000);
      return diff % 7 === 0;
    }

    // "Bulanan"
    if (repeat === 'Bulanan') {
      return anchorD.getDate() === targetD.getDate();
    }

    // "Tiap Senin Rabu" — named days pattern
    var tiapMatch = repeat.match(/^Tiap\s+([\w\s]+)$/i);
    if (tiapMatch) {
      var DAY_MAP3 = {minggu:0,senin:1,selasa:2,rabu:3,kamis:4,jumat:5,sabtu:6};
      var dayParts = tiapMatch[1].toLowerCase().split(/\s+/);
      var dayIndices = [];
      dayParts.forEach(function(p) {
        if (DAY_MAP3.hasOwnProperty(p)) dayIndices.push(DAY_MAP3[p]);
      });
      if (dayIndices.length > 0) {
        var targetDOW = parseDate(dateStr).getDay();
        return dayIndices.indexOf(targetDOW) >= 0;
      }
    }

    // "Tiap N Hari"
    var nDayMatch = repeat.match(/Tiap\s+(\d+)\s+Hari/i) ||
                    repeat.match(/(\d+)\s*h$/i) ||
                    repeat.match(/(\d+)\s+hari/i);
    if (nDayMatch) {
      var n = parseInt(nDayMatch[1]);
      if (n > 0) {
        var diffN = Math.round((targetD - anchorD) / 86400000);
        return diffN >= 0 && diffN % n === 0;
      }
    }

    return false;
  }

  // Patch getTasksForDate
  var _origGetTasksForDate = window.getTasksForDate;
  window.getTasksForDate = function(dateStr) {
    var seen = {};
    var result = [];
    if (typeof tasks === 'undefined') return result;

    // Today's date string (YYYY-MM-DD) for future-date guard
    var _todayStr = (typeof todayStr !== 'undefined') ? todayStr
      : new Date().toISOString().slice(0, 10);

    tasks.forEach(function(t) {
      if (seen[t.id]) return;

      // 1. Exact due date match (past or today only; future: only show if no repeat)
      if (t.due === dateStr) {
        // If it's a future repeat task, only show on due date if it's today or past
        if (dateStr > _todayStr && t.repeat && t.repeat !== 'Tidak' && t.repeat !== 'None' && t.repeat !== '') {
          // future repeat — handled by rule 2 below, skip exact-due here to avoid double
        } else {
          seen[t.id] = true; result.push(t); return;
        }
      }

      // 2. Repeat task fires on this date via interval
      if (t.repeat && t.repeat !== 'Tidak' && t.repeat !== 'None' && t.repeat !== '' && t.due) {
        if (repeatFiresOnDate(t, dateStr)) {
          // FUTURE GUARD: don't mark any date strictly after today
          if (dateStr > _todayStr) return;

          // DONE GUARD: if task was completed (done=true), only show on the date it was completed
          // so the calendar dot doesn't bleed into every past occurrence
          if (t.done && t.doneDate && t.doneDate !== dateStr) return;

          // HISTORY GUARD: if this date already has a completion in history, show it (was completed)
          // If not in history and it's a past date before today, skip — user didn't complete it
          // (we still show today even without history so the task is actionable)
          if (dateStr < _todayStr) {
            var completedOnDate = (t.history && t.history.indexOf(dateStr) >= 0)
                                || (t.doneDate === dateStr);
            if (!completedOnDate) return; // past occurrence not completed — don't show dot
          }

          seen[t.id] = true; result.push(t); return;
        }
      }

      // 3. Habit checked on dateStr (history) — always show completed entries
      if (t.type === 'Habit' && t.history && t.history.indexOf(dateStr) >= 0) {
        if (t.due && t.due > dateStr) return; // future due → skip
        seen[t.id] = true; result.push(t); return;
      }

      // 4. Completed task with doneDate = dateStr
      if (t.done && t.doneDate === dateStr) {
        seen[t.id] = true; result.push(t); return;
      }

      // 5. Non-habit task completed on dateStr (history)
      if (t.done && t.type !== 'Habit' && t.history && t.history.indexOf(dateStr) >= 0) {
        seen[t.id] = true; result.push(t); return;
      }
    });

    return result;
  };

  console.log('[ChiTask v2] Calendar bug fix (getTasksForDate) loaded.');
})();


// ══════════════════════════════════════════════════════════════════════════
// MODULE 5: INSTANT RENDER ON ENTER — Optimistic UI updates
// Wraps addTask, addTaskMobile, addTaskSqa to immediately render before save
// ══════════════════════════════════════════════════════════════════════════
(function() {

  /**
   * Patch: after each addTask variant, call render() immediately.
   * The original addTask already calls render() at the end, BUT
   * it's called after saveData() which can be async (Firestore).
   * We call render() right away as an optimistic update.
   */
  function wrapAddFn(fnName) {
    if (typeof window[fnName] !== 'function') return;
    var orig = window[fnName];
    window[fnName] = function() {
      // Capture task count before
      var countBefore = (typeof tasks !== 'undefined') ? tasks.length : 0;
      // Call original
      orig.apply(this, arguments);
      // Optimistic: if a task was added, render immediately
      var countAfter = (typeof tasks !== 'undefined') ? tasks.length : 0;
      if (countAfter !== countBefore && typeof render === 'function') {
        // Force calendar re-render if active
        if (typeof currentView !== 'undefined' && currentView === 'calendar') {
          var calEl = document.getElementById('pageContent');
          if (calEl && typeof renderCalendar === 'function') {
            renderCalendar(calEl);
          }
        }
        render();
      }
    };
  }

  // Wait for functions to be defined then patch
  setTimeout(function() {
    wrapAddFn('addTask');
    wrapAddFn('addTaskMobile');
    wrapAddFn('addTaskSqa');
    console.log('[ChiTask v2] Instant render (optimistic update) loaded.');
  }, 500);

})();


// ══════════════════════════════════════════════════════════════════════════
// MODULE 6: TIMER INFO MODAL — explain Estimation vs Pomodoro
// ══════════════════════════════════════════════════════════════════════════
(function() {

  var TIMER_INFO = {
    est: {
      title: '⏳ Estimasi Durasi',
      icon: '⏳',
      color: '#6366f1',
      lines: [
        { icon: '📌', text: '<b>Apa ini?</b> Perkiraan berapa lama task ini akan memakan waktu.' },
        { icon: '📊', text: '<b>Fungsi:</b> Bantu kamu merencanakan hari dengan lebih realistis.' },
        { icon: '📈', text: '<b>Tracking:</b> Kalau kamu aktifkan timer saat mengerjakan, waktu aktual vs estimasi tercatat otomatis.' },
        { icon: '💡', text: '<b>Contoh:</b> Task "review laporan" → set estimasi 30 menit supaya kamu tahu kapan harus mulai.' }
      ]
    },
    pomo: {
      title: '🍅 Pomodoro Timer',
      icon: '🍅',
      color: '#ef4444',
      lines: [
        { icon: '📌', text: '<b>Apa ini?</b> Teknik fokus kerja: 25 menit kerja → 5 menit istirahat. Ulangi.' },
        { icon: '🎯', text: '<b>Tujuan:</b> Menghindari burnout, jaga fokus, dan tingkatkan produktivitas.' },
        { icon: '🔔', text: '<b>Cara kerja:</b> Timer akan bunyi setelah 25 menit. Ambil napas 5 menit, lalu lanjut lagi.' },
        { icon: '💡', text: '<b>Tips:</b> Matikan notifikasi HP selama sesi. Setelah 4 Pomodoro, istirahat lebih panjang ~15 menit.' }
      ]
    }
  };

  window.ctTimerInfo = function(type) {
    var info = TIMER_INFO[type];
    if (!info) return;
    var contentEl = document.getElementById('ctTimerInfoContent');
    if (!contentEl) return;

    contentEl.innerHTML =
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">'
      + '<div style="width:36px;height:36px;border-radius:10px;background:' + info.color + '20;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">' + info.icon + '</div>'
      + '<div style="font-size:15px;font-weight:800;color:var(--text)">' + info.title + '</div>'
      + '</div>'
      + info.lines.map(function(l) {
          return '<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:10px">'
            + '<span style="font-size:14px;flex-shrink:0;margin-top:1px">' + l.icon + '</span>'
            + '<span style="font-size:12.5px;color:var(--text);line-height:1.55">' + l.text + '</span>'
            + '</div>';
        }).join('');

    var overlay = document.getElementById('ctTimerInfoOverlay');
    var modal = document.getElementById('ctTimerInfoModal');
    if (overlay) overlay.style.display = 'block';
    if (modal) {
      modal.style.display = 'block';
      modal.style.animation = 'ctModalIn 0.22s ease';
    }
  };

  window.ctCloseTimerInfo = function() {
    var overlay = document.getElementById('ctTimerInfoOverlay');
    var modal = document.getElementById('ctTimerInfoModal');
    if (overlay) overlay.style.display = 'none';
    if (modal) modal.style.display = 'none';
  };

  // Inject animation style
  var style = document.createElement('style');
  style.textContent = '@keyframes ctModalIn { from { opacity:0; transform:translate(-50%,-50%) scale(0.92); } to { opacity:1; transform:translate(-50%,-50%) scale(1); } }';
  document.head.appendChild(style);

  console.log('[ChiTask v2] Timer info modal loaded.');
})();


// ══════════════════════════════════════════════════════════════════════════
// MODULE 7: NLP PREVIEW — also show for mobile (unified)
// ══════════════════════════════════════════════════════════════════════════
(function() {
  // Unified mobile preview (mirrors desktop showPreview logic)
  var origMobilePreview = window.nlpInputChangeMobile;
  window.nlpInputChangeMobile = function(val) {
    var prevM = document.getElementById('nlpPreviewMobile');
    if (!prevM) return;
    if (!val || val.length < 4) { prevM.style.display = 'none'; return; }
    var p = window.nlpParseTask(val);
    if (!p.nlpHints || !p.nlpHints.length) { prevM.style.display = 'none'; return; }
    prevM.innerHTML = '<span style="color:var(--muted);font-size:11px">✨ </span>'
      + p.nlpHints.map(function(h) {
          return '<span style="background:var(--pill,#f0f0f0);border:1px solid var(--border);border-radius:10px;'
               + 'padding:2px 8px;font-size:11px;font-weight:600;color:var(--accent)">' + h + '</span>';
        }).join(' ');
    prevM.style.display = 'flex';
    prevM.style.flexWrap = 'wrap';
    prevM.style.gap = '4px';
    prevM.style.alignItems = 'center';
  };
})();

console.log('[ChiTask v2] All upgrades loaded ✅');
