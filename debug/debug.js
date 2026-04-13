// ══════════════════════════════════════════════
// 🛠️ CHITASK DEBUG PANEL
// Trigger: ketik "debug debug chitask" di taskbar
// ══════════════════════════════════════════════
(function(){

  // ── Inject styles ──────────────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

    #dbg-overlay {
      position: fixed; inset: 0; z-index: 99999;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
      animation: dbgFadeIn 0.2s ease;
    }
    @keyframes dbgFadeIn { from{opacity:0} to{opacity:1} }

    #dbg-modal {
      width: min(520px, 96vw);
      max-height: 88vh;
      background: #0d0d14;
      border: 1.5px solid #7c3aed;
      border-radius: 14px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 0 40px rgba(124,58,237,0.4), 0 20px 60px rgba(0,0,0,0.8);
      animation: dbgSlideIn 0.25s cubic-bezier(0.34,1.56,0.64,1);
      font-family: 'Press Start 2P', monospace;
    }
    @keyframes dbgSlideIn {
      from { transform: translateY(24px) scale(0.96); opacity:0; }
      to   { transform: translateY(0) scale(1); opacity:1; }
    }

    #dbg-header {
      background: linear-gradient(90deg, #1a0030, #0e001a, #1a0030);
      border-bottom: 1px solid rgba(124,58,237,0.4);
      padding: 12px 16px;
      display: flex; align-items: center; justify-content: space-between;
    }
    #dbg-header-title {
      font-size: 8px; color: #a855f7; letter-spacing: 2px;
    }
    #dbg-close {
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.18);
      color: #9ca3af; cursor: pointer;
      font-size: 9px; line-height: 1;
      width: 24px; height: 24px;
      border-radius: 5px;
      font-family: 'Press Start 2P', monospace;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s, color 0.15s;
    }
    #dbg-close:hover { background: rgba(239,68,68,0.3); color: #fff; border-color: #ef4444; }

    #dbg-tabs {
      display: flex;
      border-bottom: 1px solid rgba(124,58,237,0.25);
      background: #0a0a12;
      padding: 0 4px;
      gap: 2px;
      overflow-x: auto;
    }
    .dbg-tab {
      padding: 9px 12px;
      font-size: 6px; color: #6b7280;
      cursor: pointer; white-space: nowrap;
      border-bottom: 2px solid transparent;
      letter-spacing: 1px;
      transition: color 0.15s, border-color 0.15s;
      font-family: 'Press Start 2P', monospace;
      background: none; border-top: none; border-left: none; border-right: none;
    }
    .dbg-tab:hover { color: #c084fc; }
    .dbg-tab.active {
      color: #a855f7;
      border-bottom-color: #a855f7;
    }

    #dbg-body {
      flex: 1; overflow-y: auto; padding: 18px 16px;
    }
    #dbg-body::-webkit-scrollbar { width: 4px; }
    #dbg-body::-webkit-scrollbar-track { background: transparent; }
    #dbg-body::-webkit-scrollbar-thumb { background: #7c3aed55; border-radius: 2px; }

    .dbg-section { margin-bottom: 20px; }
    .dbg-label {
      font-size: 6px; color: #6b7280; letter-spacing: 1.5px;
      text-transform: uppercase; margin-bottom: 8px; display: block;
    }
    .dbg-row {
      display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
    }
    .dbg-input {
      flex: 1;
      background: #1a1a2e; border: 1px solid rgba(124,58,237,0.4);
      color: #e2e8f0; border-radius: 6px;
      padding: 8px 10px; font-size: 11px;
      font-family: 'DM Mono', 'Courier New', monospace;
      outline: none; transition: border-color 0.2s;
    }
    .dbg-input:focus { border-color: #a855f7; }
    .dbg-input[type=range] {
      padding: 0; background: none; border: none; cursor: pointer;
      accent-color: #a855f7;
    }
    .dbg-val {
      min-width: 52px; text-align: right;
      font-size: 10px; color: #a855f7;
      font-family: 'DM Mono', monospace;
    }
    .dbg-btn {
      background: linear-gradient(135deg, #7c3aed, #6d28d9);
      border: none; color: #fff; cursor: pointer;
      padding: 8px 14px; border-radius: 6px;
      font-size: 7px; letter-spacing: 1px;
      font-family: 'Press Start 2P', monospace;
      transition: filter 0.15s, transform 0.1s;
      white-space: nowrap;
    }
    .dbg-btn:hover { filter: brightness(1.2); }
    .dbg-btn:active { transform: scale(0.95); }
    .dbg-btn.danger {
      background: linear-gradient(135deg, #dc2626, #b91c1c);
    }
    .dbg-btn.success {
      background: linear-gradient(135deg, #059669, #047857);
    }
    .dbg-btn.warn {
      background: linear-gradient(135deg, #d97706, #b45309);
    }
    .dbg-btn.full { width: 100%; justify-content: center; display: flex; }

    .dbg-divider {
      height: 1px; background: rgba(124,58,237,0.2);
      margin: 14px 0;
    }
    .dbg-stat-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 6px 10px;
      background: rgba(124,58,237,0.07);
      border-radius: 6px; margin-bottom: 6px;
      border: 1px solid rgba(124,58,237,0.15);
    }
    .dbg-stat-key { font-size: 6px; color: #9ca3af; letter-spacing: 1px; }
    .dbg-stat-val { font-size: 9px; color: #c084fc; font-family: 'DM Mono', monospace; }

    /* Boss grid */
    .dbg-boss-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 8px; margin-top: 6px;
    }
    .dbg-boss-card {
      background: #1a1a2e;
      border: 2px solid transparent;
      border-radius: 8px; padding: 10px 12px;
      cursor: pointer; transition: border-color 0.2s, background 0.2s;
      position: relative;
    }
    .dbg-boss-card:hover { background: #1e1e38; }
    .dbg-boss-card.selected {
      background: #1e1032;
    }
    .dbg-boss-card .dbg-boss-name {
      font-size: 6.5px; color: #fff; letter-spacing: 0.5px; line-height: 1.8;
    }
    .dbg-boss-card .dbg-boss-sub {
      font-size: 5px; color: #6b7280; margin-top: 3px; line-height: 1.6;
      font-family: 'DM Mono', monospace;
    }
    .dbg-boss-card .dbg-boss-check {
      position: absolute; top: 7px; right: 9px;
      font-size: 10px; display: none;
    }
    .dbg-boss-card.selected .dbg-boss-check { display: block; }

    .dbg-toast {
      position: fixed; bottom: 90px; left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: #7c3aed; color: #fff;
      padding: 8px 18px; border-radius: 20px;
      font-family: 'Press Start 2P', monospace;
      font-size: 7px; letter-spacing: 1px;
      opacity: 0; pointer-events: none;
      transition: opacity 0.3s, transform 0.3s;
      z-index: 100000;
      white-space: nowrap;
    }
    .dbg-toast.show {
      opacity: 1; transform: translateX(-50%) translateY(0);
    }
  `;
  document.head.appendChild(style);

  // ── Helper: toast kecil ────────────────────────────────────────────────
  function dbgToast(msg){
    var t = document.getElementById('dbgToastEl');
    if(!t){ t=document.createElement('div'); t.id='dbgToastEl'; t.className='dbg-toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._to);
    t._to = setTimeout(function(){ t.classList.remove('show'); }, 1800);
  }

  // ── Build modal ────────────────────────────────────────────────────────
  function buildDebugModal(){
    if(document.getElementById('dbg-overlay')) return;

    var overlay = document.createElement('div');
    overlay.id = 'dbg-overlay';
    overlay.onclick = function(e){ if(e.target===overlay) closeDebug(); };

    overlay.innerHTML = `
      <div id="dbg-modal">
        <div id="dbg-header">
          <span id="dbg-header-title">⚙ CHITASK DEBUG PANEL</span>
          <button id="dbg-close" onclick="window._closeDebugPanel()">✕</button>
        </div>
        <div id="dbg-tabs">
          <button class="dbg-tab active" onclick="window._dbgSwitchTab('gold')">🪙 GOLD & XP</button>
          <button class="dbg-tab" onclick="window._dbgSwitchTab('boss')">⚔ BOSS</button>
          <button class="dbg-tab" onclick="window._dbgSwitchTab('state')">📊 STATE</button>
          <button class="dbg-tab" onclick="window._dbgSwitchTab('danger')">💀 RESET</button>
        </div>
        <div id="dbg-body">
          <!-- filled by tab render -->
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    renderTab('gold');
  }

  function closeDebug(){
    var ov = document.getElementById('dbg-overlay');
    if(ov) ov.remove();
  }
  window._closeDebugPanel = closeDebug;

  // ── Tab switcher ───────────────────────────────────────────────────────
  window._dbgSwitchTab = function(name){
    document.querySelectorAll('.dbg-tab').forEach(function(btn){
      btn.classList.toggle('active', btn.textContent.toLowerCase().indexOf(name.slice(0,3)) >= 0 ||
        (name==='gold' && btn.textContent.indexOf('GOLD')>=0) ||
        (name==='boss' && btn.textContent.indexOf('BOSS')>=0) ||
        (name==='state' && btn.textContent.indexOf('STATE')>=0) ||
        (name==='danger' && btn.textContent.indexOf('RESET')>=0)
      );
    });
    renderTab(name);
  };

  // ── Render tabs ────────────────────────────────────────────────────────
  function renderTab(name){
    var body = document.getElementById('dbg-body');
    if(!body) return;
    if(name==='gold')   body.innerHTML = tabGoldXP();
    if(name==='boss')   body.innerHTML = tabBoss();
    if(name==='state')  body.innerHTML = tabState();
    if(name==='danger') body.innerHTML = tabDanger();
    bindTabEvents(name);
  }

  // ── TAB: Gold & XP ────────────────────────────────────────────────────
  function tabGoldXP(){
    var curGold = (typeof goldBalance !== 'undefined') ? goldBalance : 0;
    var curXP   = (typeof xp !== 'undefined') ? xp : 0;
    var curLv   = (typeof getLevel === 'function') ? getLevel() : '?';
    return `
      <div class="dbg-section">
        <span class="dbg-label">🪙 SET GOLD</span>
        <div class="dbg-row">
          <input class="dbg-input" id="dbg-gold-range" type="range" min="0" max="9999" step="10" value="${curGold}"
            oninput="document.getElementById('dbg-gold-val').textContent=this.value">
          <span class="dbg-val" id="dbg-gold-val">${curGold}</span>
        </div>
        <div class="dbg-row">
          <input class="dbg-input" id="dbg-gold-input" type="number" min="0" placeholder="atau ketik jumlah..." value="${curGold}">
          <button class="dbg-btn" id="dbg-set-gold">SET</button>
        </div>
        <div class="dbg-row">
          <button class="dbg-btn warn" id="dbg-add-gold-100">+100</button>
          <button class="dbg-btn warn" id="dbg-add-gold-500">+500</button>
          <button class="dbg-btn warn" id="dbg-add-gold-1000">+1000</button>
          <button class="dbg-btn danger" id="dbg-gold-zero">ZERO</button>
        </div>
      </div>

      <div class="dbg-divider"></div>

      <div class="dbg-section">
        <span class="dbg-label">⚡ SET XP (Total)</span>
        <div class="dbg-row">
          <input class="dbg-input" id="dbg-xp-range" type="range" min="0" max="50000" step="50" value="${curXP}"
            oninput="document.getElementById('dbg-xp-val').textContent=this.value">
          <span class="dbg-val" id="dbg-xp-val">${curXP}</span>
        </div>
        <div class="dbg-row">
          <input class="dbg-input" id="dbg-xp-input" type="number" min="0" placeholder="atau ketik jumlah..." value="${curXP}">
          <button class="dbg-btn" id="dbg-set-xp">SET</button>
        </div>
        <div class="dbg-row">
          <button class="dbg-btn warn" id="dbg-add-xp-100">+100 XP</button>
          <button class="dbg-btn warn" id="dbg-add-xp-500">+500 XP</button>
          <button class="dbg-btn danger" id="dbg-xp-zero">ZERO</button>
        </div>
      </div>

      <div class="dbg-divider"></div>

      <div class="dbg-section">
        <span class="dbg-label">🏆 LANGSUNG SET LEVEL</span>
        <div class="dbg-row">
          <input class="dbg-input" id="dbg-lv-range" type="range" min="1" max="50" step="1" value="${curLv}"
            oninput="document.getElementById('dbg-lv-val').textContent='LV '+this.value">
          <span class="dbg-val" id="dbg-lv-val">LV ${curLv}</span>
        </div>
        <div class="dbg-row">
          <input class="dbg-input" id="dbg-lv-input" type="number" min="1" max="9999" placeholder="target level..." value="${curLv}">
          <button class="dbg-btn success" id="dbg-set-level">SET LEVEL</button>
        </div>
      </div>
    `;
  }

  // ── TAB: Boss ──────────────────────────────────────────────────────────
  function tabBoss(){
    var defs = (typeof BOSS_DEFS !== 'undefined') ? BOSS_DEFS : [];
    var state = (typeof bossState !== 'undefined') ? bossState : null;
    var curIdx = state ? state.idx : 0;
    var curHp  = state ? state.hp : 0;
    var maxHp  = state ? state.maxHp : 0;
    var pct    = maxHp > 0 ? Math.round(curHp/maxHp*100) : 0;

    var cards = '';
    defs.forEach(function(b, i){
      var sel = (i === curIdx) ? 'selected' : '';
      cards += `
        <div class="dbg-boss-card ${sel}" style="border-color:${b.col}" onclick="window._dbgSelectBoss(${i})">
          <span class="dbg-boss-check">✓</span>
          <div class="dbg-boss-name">${b.name}</div>
          <div class="dbg-boss-sub">${b.sub}<br>MaxHP: ${b.maxHp}</div>
        </div>
      `;
    });

    if(!defs.length){
      cards = '<div style="color:#6b7280;font-size:7px;padding:12px">BOSS_DEFS kosong — file boss belum dimuat</div>';
    }

    return `
      <div class="dbg-section">
        <span class="dbg-label">⚔ PILIH BOSS HARI INI</span>
        <div class="dbg-boss-grid">${cards}</div>
      </div>

      <div class="dbg-divider"></div>

      <div class="dbg-section">
        <span class="dbg-label">❤ SET HP BOSS</span>
        <div class="dbg-row">
          <input class="dbg-input" id="dbg-hp-range" type="range" min="0" max="${maxHp||1000}" step="10" value="${curHp}"
            oninput="document.getElementById('dbg-hp-val').textContent=this.value+' ('+Math.round(this.value/${maxHp||1}*100)+'%)'">
          <span class="dbg-val" id="dbg-hp-val">${curHp} (${pct}%)</span>
        </div>
        <div class="dbg-row">
          <button class="dbg-btn" id="dbg-set-hp">SET HP</button>
          <button class="dbg-btn success" id="dbg-hp-full">FULL HP</button>
          <button class="dbg-btn danger" id="dbg-hp-zero">HP 0 (KILL)</button>
        </div>
      </div>

      <div class="dbg-divider"></div>

      <div class="dbg-section">
        <span class="dbg-label">🔄 RESET BOSS</span>
        <div class="dbg-row">
          <button class="dbg-btn warn full" id="dbg-boss-reset-day">RESET (BOSSNYA HARI INI ULANG)</button>
        </div>
      </div>
    `;
  }

  // ── TAB: State ─────────────────────────────────────────────────────────
  function tabState(){
    var curGold = (typeof goldBalance !== 'undefined') ? goldBalance : '?';
    var curXP   = (typeof xp !== 'undefined') ? xp : '?';
    var curLv   = (typeof getLevel === 'function') ? getLevel() : '?';
    var curXPNeed = (typeof getLevelXpNeeded === 'function') ? getLevelXpNeeded() : '?';
    var curXPIn   = (typeof getLevelXP === 'function') ? getLevelXP() : '?';
    var totalDoneVal = (typeof totalDone !== 'undefined') ? totalDone : '?';
    var tasksLen  = (typeof tasks !== 'undefined') ? tasks.length : '?';
    var bossName  = '?';
    var bossHpStr = '?';
    var bossDay   = '?';
    if(typeof bossState !== 'undefined' && typeof bossCur === 'function'){
      bossName  = bossCur().name;
      bossHpStr = bossState.hp + ' / ' + bossState.maxHp;
      bossDay   = bossState.day;
    }
    var view = (typeof currentView !== 'undefined') ? currentView : '?';
    var theme = (typeof activeTheme !== 'undefined') ? activeTheme : '?';

    return `
      <div class="dbg-section">
        <span class="dbg-label">📊 CURRENT STATE</span>
        ${row('Gold', curGold + ' 🪙')}
        ${row('Total XP', curXP)}
        ${row('Level', curLv)}
        ${row('XP di level ini', curXPIn + ' / ' + curXPNeed)}
        ${row('Tasks total', tasksLen)}
        ${row('Task selesai', totalDoneVal)}
        ${row('Current View', view)}
        ${row('Active Theme', theme)}
      </div>
      <div class="dbg-divider"></div>
      <div class="dbg-section">
        <span class="dbg-label">⚔ BOSS STATE</span>
        ${row('Boss hari ini', bossName)}
        ${row('HP', bossHpStr)}
        ${row('Hari', bossDay)}
        ${row('Defeated', typeof bossState !== 'undefined' ? (bossState.defeated ? 'YA ☠' : 'TIDAK') : '?')}
      </div>
    `;
  }

  function row(k, v){
    return `<div class="dbg-stat-row"><span class="dbg-stat-key">${k}</span><span class="dbg-stat-val">${v}</span></div>`;
  }

  // ── TAB: Danger / Reset ────────────────────────────────────────────────
  function tabDanger(){
    return `
      <div class="dbg-section">
        <span class="dbg-label" style="color:#ef4444">⚠ DANGER ZONE</span>
        <p style="font-size:6px;color:#6b7280;line-height:2;margin-bottom:14px;font-family:'DM Mono',monospace">
          Aksi di bawah ini tidak bisa di-undo.<br>
          Pastikan kamu tahu apa yang dilakukan.
        </p>
        <div class="dbg-row">
          <button class="dbg-btn danger full" id="dbg-reset-boss-ls">RESET BOSS (localStorage)</button>
        </div>
        <div class="dbg-row">
          <button class="dbg-btn danger full" id="dbg-reset-gold">RESET GOLD → 0</button>
        </div>
        <div class="dbg-row">
          <button class="dbg-btn danger full" id="dbg-reset-xp">RESET XP → 0</button>
        </div>
        <div class="dbg-divider"></div>
        <div class="dbg-row">
          <button class="dbg-btn full" style="background:linear-gradient(135deg,#374151,#1f2937)" id="dbg-refresh">🔄 RELOAD HALAMAN</button>
        </div>
      </div>
    `;
  }

  // ── Bind events per tab ────────────────────────────────────────────────
  function bindTabEvents(name){
    if(name === 'gold'){
      // Sync range ke input
      var gRange = document.getElementById('dbg-gold-range');
      var gInput = document.getElementById('dbg-gold-input');
      if(gRange && gInput){
        gRange.oninput = function(){ gInput.value = this.value; document.getElementById('dbg-gold-val').textContent = this.value; };
        gInput.oninput = function(){ if(this.value>=0) gRange.value = this.value; };
      }
      var xRange = document.getElementById('dbg-xp-range');
      var xInput = document.getElementById('dbg-xp-input');
      if(xRange && xInput){
        xRange.oninput = function(){ xInput.value = this.value; document.getElementById('dbg-xp-val').textContent = this.value; };
        xInput.oninput = function(){ if(this.value>=0) xRange.value = this.value; };
      }
      var lRange = document.getElementById('dbg-lv-range');
      var lInput = document.getElementById('dbg-lv-input');
      if(lRange && lInput){
        lRange.oninput = function(){ lInput.value = this.value; document.getElementById('dbg-lv-val').textContent = 'LV '+this.value; };
        lInput.oninput = function(){ if(this.value>=1) lRange.value = this.value; };
      }

      btn('dbg-set-gold', function(){
        var v = parseInt(document.getElementById('dbg-gold-input').value)||0;
        if(typeof goldBalance !== 'undefined'){ goldBalance = v; updateGoldDisplay(); saveData(true); dbgToast('Gold → '+v+' 🪙'); }
      });
      btn('dbg-add-gold-100',  function(){ if(typeof addGold!=='undefined') addGold(100); dbgToast('+100 gold 🪙'); refreshStateTab(); });
      btn('dbg-add-gold-500',  function(){ if(typeof addGold!=='undefined') addGold(500); dbgToast('+500 gold 🪙'); refreshStateTab(); });
      btn('dbg-add-gold-1000', function(){ if(typeof addGold!=='undefined') addGold(1000); dbgToast('+1000 gold 🪙'); refreshStateTab(); });
      btn('dbg-gold-zero', function(){
        if(typeof goldBalance!=='undefined'){ goldBalance=0; updateGoldDisplay(); saveData(true); dbgToast('Gold di-zero'); }
      });

      btn('dbg-set-xp', function(){
        var v = parseInt(document.getElementById('dbg-xp-input').value)||0;
        if(typeof xp!=='undefined'){ xp=v; if(typeof render==='function') render(); saveData(true); dbgToast('XP → '+v+' ⚡'); }
      });
      btn('dbg-add-xp-100', function(){
        if(typeof addXP==='function') addXP(100,'DEBUG +100 XP'); dbgToast('+100 XP ⚡');
      });
      btn('dbg-add-xp-500', function(){
        if(typeof addXP==='function') addXP(500,'DEBUG +500 XP'); dbgToast('+500 XP ⚡');
      });
      btn('dbg-xp-zero', function(){
        if(typeof xp!=='undefined'){ xp=0; if(typeof render==='function') render(); saveData(true); dbgToast('XP di-zero'); }
      });

      btn('dbg-set-level', function(){
        var targetLv = parseInt(document.getElementById('dbg-lv-input').value)||1;
        if(typeof getTotalXpForLevel==='function'){
          xp = getTotalXpForLevel(targetLv);
          if(typeof render==='function') render();
          saveData(true);
          dbgToast('Level → '+targetLv+' 🏆');
        }
      });
    }

    if(name === 'boss'){
      btn('dbg-set-hp', function(){
        var v = parseInt(document.getElementById('dbg-hp-range').value)||0;
        if(typeof bossState!=='undefined'){
          bossState.hp = v;
          if(typeof bossSave==='function') bossSave();
          if(typeof bossRefresh==='function') bossRefresh();
          dbgToast('Boss HP → '+v);
        }
      });
      btn('dbg-hp-full', function(){
        if(typeof bossState!=='undefined'){
          bossState.hp = bossState.maxHp;
          bossState.defeated = false;
          if(typeof bossSave==='function') bossSave();
          if(typeof bossRefresh==='function') bossRefresh();
          dbgToast('Boss HP full ❤');
        }
      });
      btn('dbg-hp-zero', function(){
        if(typeof bossState!=='undefined' && typeof bossVictory==='function'){
          bossState.hp = 0;
          bossState.defeated = true;
          if(typeof bossSave==='function') bossSave();
          if(typeof bossRefresh==='function') bossRefresh();
          bossVictory();
          dbgToast('Boss dibunuh ☠');
        }
      });
      btn('dbg-boss-reset-day', function(){
        if(typeof bossState!=='undefined' && typeof BOSS_DEFS!=='undefined'){
          var idx = bossState.idx;
          var maxHp = BOSS_DEFS[idx] ? BOSS_DEFS[idx].maxHp : 1000;
          bossState.hp = maxHp;
          bossState.maxHp = maxHp;
          bossState.defeated = false;
          if(typeof bossSave==='function') bossSave();
          if(typeof bossRefresh==='function') bossRefresh();
          if(typeof bossStartLoop==='function') bossStartLoop();
          dbgToast('Boss direset 🔄');
          renderTab('boss');
        }
      });
    }

    if(name === 'danger'){
      btn('dbg-reset-boss-ls', function(){
        if(confirm('Reset localStorage boss? Boss hari ini hilang.')){
          localStorage.removeItem('chitask_boss_v3');
          dbgToast('Boss localStorage dihapus');
        }
      });
      btn('dbg-reset-gold', function(){
        if(typeof goldBalance!=='undefined'){ goldBalance=0; updateGoldDisplay(); saveData(true); dbgToast('Gold → 0'); }
      });
      btn('dbg-reset-xp', function(){
        if(typeof xp!=='undefined'){ xp=0; if(typeof render==='function') render(); saveData(true); dbgToast('XP → 0'); }
      });
      btn('dbg-refresh', function(){ location.reload(); });
    }
  }

  function btn(id, fn){
    var el = document.getElementById(id);
    if(el) el.onclick = fn;
  }

  function refreshStateTab(){
    // jika sedang di tab state, refresh
    var body = document.getElementById('dbg-body');
    if(body && body.querySelector('.dbg-stat-row')) renderTab('state');
  }

  // ── Boss card selection ────────────────────────────────────────────────
  window._dbgSelectBoss = function(idx){
    if(typeof BOSS_DEFS==='undefined' || !BOSS_DEFS[idx]) return;
    var b = BOSS_DEFS[idx];
    var mult = [0.85,1.2,1.0,1.0,1.0,0.9,0.8][new Date().getDay()];
    var maxHp = Math.round(b.maxHp * mult);
    if(typeof bossState !== 'undefined'){
      bossState.idx      = idx;
      bossState.hp       = maxHp;
      bossState.maxHp    = maxHp;
      bossState.defeated = false;
      bossState.day      = (typeof bossToday==='function') ? bossToday() : new Date().toISOString().slice(0,10);
      if(typeof bossSave==='function')     bossSave();
      if(typeof bossRefresh==='function')  bossRefresh();
      if(typeof bossStartLoop==='function') bossStartLoop();
      dbgToast('Boss → '+b.name+' ⚔');
      // Re-render tab boss untuk update selected card
      renderTab('boss');
    }
  };

  // ── Hook NLP: pasang SETELAH semua script selesai load ────────────────
  // Tidak override nlpApplyAndAdd saat load karena nlp.js belum ada
  window.addEventListener('load', function(){
    var _orig = window.nlpApplyAndAdd;
    window.nlpApplyAndAdd = function(inputId, addFn){
      var inp = document.getElementById(inputId);
      if(inp){
        var raw = inp.value.trim().toLowerCase();
        if(raw === 'debug debug chitask'){
          inp.value = '';
          buildDebugModal();
          return;
        }
      }
      if(typeof _orig === 'function') _orig(inputId, addFn);
    };
  });

  // Keydown fallback — Enter di input manapun
  document.addEventListener('keydown', function(e){
    if(e.key !== 'Enter') return;
    var active = document.activeElement;
    if(!active) return;
    var val = (active.value||'').trim().toLowerCase();
    if(val === 'debug debug chitask'){
      active.value = '';
      e.preventDefault();
      buildDebugModal();
    }
  }, true);

  // Keyboard shortcut: Escape menutup panel
  document.addEventListener('keydown', function(e){
    if(e.key==='Escape' && document.getElementById('dbg-overlay')) closeDebug();
  });

  console.log('%c🛠 CHITASK DEBUG PANEL siap — ketik "debug debug chitask" di taskbar', 'color:#a855f7;font-weight:bold');

})();
