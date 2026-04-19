// ══════════════════════════════════════════════
// CONSTANTS & HELPERS
// ══════════════════════════════════════════════
var today = new Date(); today.setHours(0,0,0,0);
function localDateStr(dt){var y=dt.getFullYear(),m=String(dt.getMonth()+1).padStart(2,'0'),d=String(dt.getDate()).padStart(2,'0');return y+'-'+m+'-'+d;}
var todayStr = localDateStr(today);
function offset(n){var dt=new Date(today);dt.setDate(dt.getDate()+n);return localDateStr(dt);}
function fmtDate(s){if(!s)return'';var p=s.split('-');return p[2]+'/'+p[1]+'/'+p[0];}
function fmt(s){if(!s)return'';var d=new Date(s+'T00:00:00'),diff=Math.round((d-today)/86400000);if(diff===0)return'Hari ini';if(diff===-1)return'Kemarin';if(diff===1)return'Besok';return diff<0?Math.abs(diff)+' hari lalu':diff+' hari lagi';}
function fmtShort(s){if(!s)return'';return new Date(s+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short'});}
function isOverdue(t){return t.due&&t.due<todayStr&&!t.done&&!t._nextDue;}
function fmtRp(n){if(!n&&n!==0)return'Rp 0';var neg=n<0;return(neg?'-':'')+'Rp '+Math.abs(Math.round(n)).toLocaleString('id-ID');}
// Custom confirm modal — pengganti confirm() native yang sering diblokir di webview/iframe
function showConfirm(msg,onOk,onCancel){
  var ov=document.getElementById('_confirmOverlay');
  if(!ov){
    ov=document.createElement('div');
    ov.id='_confirmOverlay';
    ov.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.45);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;font-family:DM Sans,sans-serif';
    ov.innerHTML='<div style="background:var(--card,#fff);border:1px solid var(--border,#e5e7eb);border-radius:16px;padding:24px 20px;width:min(320px,92vw);box-shadow:0 12px 40px rgba(0,0,0,0.22);text-align:center">'
      +'<div id="_confirmMsg" style="font-size:14px;font-weight:600;color:var(--text,#111);margin-bottom:18px;line-height:1.5"></div>'
      +'<div style="display:flex;gap:10px">'
      +'<button id="_confirmCancel" style="flex:1;padding:10px;border:1px solid var(--border,#e5e7eb);border-radius:10px;background:var(--bg,#f9f9f9);color:var(--muted,#666);font-size:13px;font-weight:600;cursor:pointer;font-family:DM Sans,sans-serif">Batal</button>'
      +'<button id="_confirmOk" style="flex:1;padding:10px;border:none;border-radius:10px;background:#ef4444;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:DM Sans,sans-serif">Hapus</button>'
      +'</div></div>';
    document.body.appendChild(ov);
  }
  document.getElementById('_confirmMsg').textContent=msg;
  ov.style.display='flex';
  var okBtn=document.getElementById('_confirmOk');
  var cancelBtn=document.getElementById('_confirmCancel');
  var close=function(){ov.style.display='none';};
  okBtn.onclick=function(){close();if(onOk)onOk();};
  cancelBtn.onclick=function(){close();if(onCancel)onCancel();};
  ov.onclick=function(e){if(e.target===ov){close();if(onCancel)onCancel();}};
}
// Auto-format input angka ke format Rupiah saat mengetik
// el: input element, e: event; nilai raw disimpan di el._rawVal
function autoFormatRp(el){
  var raw=el.value.replace(/\D/g,'');
  el._rawVal=raw?parseInt(raw,10):0;
  el.value=raw?parseInt(raw,10).toLocaleString('id-ID'):'';
}
function getRawVal(el){return el?el._rawVal||parseFloat((el.value||'').replace(/\./g,'').replace(',','.'))||0:0;}
function getMonthStr(m,y){var months=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];return months[m]+' '+y;}

var COLORS = ['','#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899','#6b7280'];
var COLOR_NAMES = {''  :'Tanpa','#ef4444':'Merah','#f97316':'Oranye','#eab308':'Kuning','#22c55e':'Hijau','#3b82f6':'Biru','#8b5cf6':'Ungu','#ec4899':'Pink','#6b7280':'Abu'};
var BASE_GROUPS = ['Belanja','Hygiene','Olahraga','Kesehatan','Produktivitas','Mindfulness','Nutrisi','Sosial','Ibadah','Lainnya'];
var BASE_ICONS  = {Belanja:'🛒',Hygiene:'🧼',Olahraga:'💪',Kesehatan:'❤️',Produktivitas:'🧠',Mindfulness:'🧘',Nutrisi:'🥗',Sosial:'👥',Ibadah:'🕌',Lainnya:'📌',''  :'📁'};
function getGroupIcon(g){return customGroupIcons[g]||BASE_ICONS[g]||'📁';}
function getAllGroups(){return BASE_GROUPS.concat(customGroups.filter(function(g){return BASE_GROUPS.indexOf(g)<0;}));}
function getGroupOrder(){return getAllGroups().concat(['']);}

// Achievements definition
var ACHIEV_DEF = [
  {id:'first',icon:'🌱',name:'Langkah Pertama',desc:'Selesaikan 1 task',check:function(s){return s.totalDone>=1;}},
  {id:'ten',icon:'🎯',name:'Konsisten',desc:'Selesaikan 10 task',check:function(s){return s.totalDone>=10;}},
  {id:'fifty',icon:'💪',name:'Rajin',desc:'Selesaikan 50 task',check:function(s){return s.totalDone>=50;}},
  {id:'habit7',icon:'🔥',name:'Streak 7',desc:'Habit streak 7 hari',check:function(s){return s.maxStreak>=7;}},
  {id:'habit30',icon:'⚡',name:'Streak 30',desc:'Habit streak 30 hari',check:function(s){return s.maxStreak>=30;}},
  {id:'lv5',icon:'🏅',name:'Level 5',desc:'Capai level 5',check:function(s){return s.level>=5;}},
  {id:'lv10',icon:'🥇',name:'Level 10',desc:'Capai level 10',check:function(s){return s.level>=10;}},
  {id:'perfect',icon:'✨',name:'Hari Sempurna',desc:'Selesaikan semua task 1 hari',check:function(s){return s.perfectDays>=1;}},
  {id:'subtask',icon:'🧩',name:'Detail-Oriented',desc:'Buat 5 sub-task',check:function(s){return s.totalSubtasks>=5;}}
];

// ── GROUP REWARDS — XP & Gold bervariasi per grup ──
// XP min:5, max:10 | Gold min:2, max:6
var GROUP_REWARDS = {
  'Olahraga'      : { xp: 10, gold: 5 },  // aktivitas fisik = effort tinggi
  'Kesehatan'     : { xp: 9,  gold: 5 },  // prioritas tinggi
  'Ibadah'        : { xp: 9,  gold: 4 },  // konsistensi spiritual
  'Produktivitas' : { xp: 8,  gold: 6 },  // langsung impact produktivitas & karir
  'Mindfulness'   : { xp: 8,  gold: 4 },  // self-care mental
  'Nutrisi'       : { xp: 7,  gold: 4 },  // habit makan sehat
  'Sosial'        : { xp: 7,  gold: 3 },  // interaksi & relasi
  'Hygiene'       : { xp: 6,  gold: 3 },  // rutinitas dasar
  'Belanja'       : { xp: 5,  gold: 6 },  // transaksi → lebih banyak gold, XP kecil
  'Lainnya'       : { xp: 5,  gold: 2 },  // default fallback
};
function getGroupReward(group, isHabit) {
  var r = GROUP_REWARDS[group];
  if (!r) return { xp: isHabit ? 15 : 10, gold: 2 };
  // Habit bonus: +2 XP
  return { xp: r.xp + (isHabit ? 2 : 0), gold: r.gold };
}

// XP config
var XP_PER_TASK = 10, XP_PER_HABIT = 15, XP_PER_SUBTASK = 5;
var GOLD_PER_TASK = 2;
// Gold & Shop
var goldBalance = 0;
var shopPurchases = []; // [{id, name, type, cost, date}]
var shopCustomItems = []; // [{id, name, icon, desc, cost}]
var shopLoginDays = []; // array of ISO date strings for actual login days this week
var activeTheme = 'theme-light'; // id of active theme
var tempThemeExpiry = 0;  // timestamp ms kapan tema sementara kedaluwarsa (0 = tidak ada)
var tempThemePrev   = ''; // tema sebelum dapat tema sementara
var _gamiOnbDone    = false; // sudah pernah pilih gami mode
var _tourDone       = false; // sudah pernah selesaikan tour
var _navModeDone    = false; // sudah pernah pilih nav mode
var _gamiModeVal    = '';    // nilai gami mode tersimpan
var activeEffect = ''; // id of active effect
var finSavingTarget = 0; // monthly saving target
var weeklyReviewLastSeen = ''; // ISO date string of last seen
// Pomodoro
var pomoTaskId = null, pomoMode = 'focus', pomoRunning = false;
var pomoSecondsLeft = 25*60, pomoSession = 1, pomoTimer = null;
var POMO_DURATIONS = {focus:25*60, short:5*60, long:15*60};
// Shop catalog
var SHOP_THEMES = [
  {id:'theme-light',name:'Light Mode',icon:'☀️',desc:'Tampilan terang & bersih, nyaman di siang hari',price:0,builtin:true},
  {id:'theme-dark',name:'Dark Mode',icon:'🌙',desc:'Tema gelap elegan, nyaman di malam hari',price:0,builtin:true},
  {id:'theme-forest',name:'Forest',icon:'🌿',desc:'Hijau alam yang menenangkan',price:50},
  {id:'theme-ocean',name:'Ocean',icon:'🌊',desc:'Biru samudra yang dalam',price:50},
  {id:'theme-rose',name:'Rose',icon:'🌸',desc:'Pink lembut & feminin',price:50},
  {id:'theme-midnight',name:'Midnight',icon:'🌌',desc:'Ungu gelap dan misterius',price:80},
  {id:'theme-sunset',name:'Sunset',icon:'🌅',desc:'Oranye hangat kemerahan',price:80},
  {id:'theme-slytherin',name:'Slytherin',icon:'🐍',iconSvg:'css/themes/icons/slytherin.png',desc:'Slytherin House Ambisius',price:200},
  {id:'theme-fluffytown',name:'Fluffy Town',icon:'🐹',iconSvg:'css/themes/icons/fluffytown.png',desc:'✨Hamster lucu pink peach yang menggemaskan',price:200},
  {id:'theme-sololeveling',name:'Solo Leveling',icon:'⚔️',iconSvg:'css/themes/icons/solo-leveling.png',desc:'Bangkitlah bayanganku. Kekuatan hunter terkuat.',price:200},
];
var SHOP_EFFECTS = [
  {id:'effect-none',name:'Default',icon:'✨',desc:'Tanpa efek khusus',price:0,builtin:true},
  {id:'effect-confetti',name:'Confetti',icon:'🎉',desc:'Konfeti saat task selesai',price:30},
  {id:'effect-stars',name:'Bintang',icon:'⭐',desc:'Bintang berterbangan',price:30},
  {id:'effect-firework',name:'Kembang Api',icon:'🎆',desc:'Efek kembang api meriah',price:60},
  {id:'effect-hamster',name:'Hamster Makan',icon:'🐹',desc:'🌟 EKSKLUSIF — Hamster lucu makan kuaci saat task selesai!',price:120},
];

var SHOP_AVATARS = [
  {
    id: 'avatar-slytherin-char1',
    jobId: 'Slytherin_Char1',
    name: 'Slytherin',
    icon: '🐍',
    desc: 'Karakter eksklusif Slytherin. Unlock skin male & female.',
    price: 150,
    rarity: 'epic',
    spriteMale:   'character/jobs/paid/Slytherin/Char 1/male.webp',
    spriteFemale: 'character/jobs/paid/Slytherin/Char 1/female.webp'
  }
];
var activeAvatarCard = null;

// XP per level progresif — bertahap naik, tidak langsung curam
function getXpForLevel(lv){
  // Formula: base 100 XP di level 1, naik ~8% tiap level, smooth & gradual
  // Lv1→2: 100, Lv5→6: ~136, Lv10→11: ~200, Lv20→21: ~437, Lv30→31: ~954
  if(lv<=1) return 100;
  return Math.round(100 * Math.pow(1.08, lv - 1));
}
function getTotalXpForLevel(lv){
  // total XP yang dibutuhkan untuk mencapai level lv
  if(lv<=1)return 0;
  var t=0;for(var l=2;l<=lv;l++)t+=getXpForLevel(l);return t;
}
var XP_PER_LEVEL = 100; // legacy — masih dipakai di beberapa tempat, set ke 100 agar aman

// ══════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════
var tasks=[], nextId=13, currentView='myday', selectedTask=null;
var chipState={habit:false,important:false,shopping:false,nodue:false,pomo:false,color:''};
var darkMode=false, sortDir=1, habitStreakMode='week';
var groupOpenState={}, customGroups=[], customGroupIcons={};
var mydayGroupOrder=[]; // urutan grup di My Day (drag-to-reorder)
var xp=0, achievements=[], totalDone=0, perfectDays=0, totalSubtasks=0;

// ══ CHARACTER STATS SYSTEM ══
var charStatProgress={intelligence:0,strength:0,wisdom:0,vitality:0,charisma:0,discipline:0};
var charStatLastActivity={intelligence:'',strength:'',wisdom:'',vitality:'',charisma:'',discipline:''};
var CHAR_STAT_DEF=[
  {key:'intelligence',icon:'🧠',name:'Intelligence',color:'#3b82f6',groups:['produktivitas','coding','belajar','work','pekerjaan','study','kerja','tugas']},
  {key:'strength',icon:'💪',name:'Strength',color:'#ef4444',groups:['olahraga','gym','fitness','latihan','sport','push','lari','run']},
  {key:'wisdom',icon:'📖',name:'Wisdom',color:'#8b5cf6',groups:['baca','membaca','mindfulness','spiritual','jurnal','journal','refleksi','meditasi']},
  {key:'vitality',icon:'❤️',name:'Vitality',color:'#22c55e',groups:['kesehatan','health','hygiene','tidur','sleep','makan','diet','air','minum','sikat']},
  {key:'charisma',icon:'✨',name:'Charisma',color:'#f59e0b',groups:['sosial','social','komunikasi','meeting','keluarga','teman','relasi','email','balas']},
  {key:'discipline',icon:'🎯',name:'Discipline',color:'#d97706',groups:['ibadah','sholat','shalat','doa','puasa','quran','zikir','dzikir','tahajud','subuh','maghrib','isya','ashar','zhuhur','tarawih']}
];
function getStatLevelThreshold(level){
  // Level 1-10: mulai mudah (3 task → naik ke 6), lalu eksponensial curam
  if(level<=0)return 0;
  var t=0;
  for(var l=1;l<=level;l++){
    var needed;
    if(l<=10){
      // 3, 3, 4, 4, 4, 5, 5, 5, 6, 6
      needed=Math.round(3+(l-1)*0.35);
    } else {
      // level 11+ makin curam
      needed=Math.round(8*Math.pow(1.45,l-10));
    }
    t+=needed;
  }
  return t;
}
function getStatLevel(key){var p=charStatProgress[key]||0,lv=0;while(p>=getStatLevelThreshold(lv+1)&&lv<99)lv++;return lv;}
function getStatLevelPct(key){var lv=getStatLevel(key),cur=charStatProgress[key]||0,prev=getStatLevelThreshold(lv),next=getStatLevelThreshold(lv+1);if(next===prev)return 100;return Math.round((cur-prev)/(next-prev)*100);}
function getStatNextNeeded(key){var lv=getStatLevel(key),cur=charStatProgress[key]||0,next=getStatLevelThreshold(lv+1);return Math.max(0,next-cur);}

// Rank berdasarkan stat level: F→E→D→C→B→A→S→SS→SSS
function getStatRank(key){
  var lv=getStatLevel(key);
  if(lv===0)  return {rank:'F', color:'rgba(148,163,184,0.5)'};
  if(lv<=2)   return {rank:'E', color:'#94a3b8'};
  if(lv<=5)   return {rank:'D', color:'#86efac'};
  if(lv<=9)   return {rank:'C', color:'#67e8f9'};
  if(lv<=14)  return {rank:'B', color:'#60a5fa'};
  if(lv<=20)  return {rank:'A', color:'#a78bfa'};
  if(lv<=29)  return {rank:'S', color:'#fbbf24'};
  if(lv<=39)  return {rank:'SS', color:'#f97316'};
  return              {rank:'SSS', color:'#ef4444'};
}
// Next rank label helper — shows what rank the stat upgrades to
getStatRank._nextRankLabel = function(key, currentLv){
  var nextLv = currentLv + 1;
  var r;
  if(nextLv<=1)  r='E';
  else if(nextLv<=2)  r='E';
  else if(nextLv<=5)  r='D';
  else if(nextLv<=9)  r='C';
  else if(nextLv<=14) r='B';
  else if(nextLv<=20) r='A';
  else if(nextLv<=29) r='S';
  else if(nextLv<=39) r='SS';
  else r='SSS';
  return 'Rank '+r;
};
function getOverallRank(){
  // Rata-rata level semua stat → rank keseluruhan
  var total=CHAR_STAT_DEF.reduce(function(s,d){return s+getStatLevel(d.key);},0);
  var avg=total/CHAR_STAT_DEF.length;
  if(avg<1)   return {rank:'F',  color:'rgba(148,163,184,0.5)'};
  if(avg<3)   return {rank:'E',  color:'#94a3b8'};
  if(avg<6)   return {rank:'D',  color:'#86efac'};
  if(avg<10)  return {rank:'C',  color:'#67e8f9'};
  if(avg<15)  return {rank:'B',  color:'#60a5fa'};
  if(avg<21)  return {rank:'A',  color:'#a78bfa'};
  if(avg<30)  return {rank:'S',  color:'#fbbf24'};
  if(avg<40)  return {rank:'SS', color:'#f97316'};
  return             {rank:'SSS',color:'#ef4444'};
}
function awardStatProgress(t){var key=matchTaskToStat(t),prevLv=getStatLevel(key);charStatProgress[key]=(charStatProgress[key]||0)+1;charStatLastActivity[key]=todayStr;var newLv=getStatLevel(key);if(newLv>prevLv){var def=CHAR_STAT_DEF.filter(function(d){return d.key===key;})[0];var newRank=getStatRank(key);setTimeout(function(){showToast('⬆️ '+def.icon+' '+def.name+' naik ke Rank '+newRank.rank+'!');},400);}}
function revokeStatProgress(t){var key=matchTaskToStat(t);charStatProgress[key]=Math.max(0,(charStatProgress[key]||0)-1);}
function getCharClass(){var top=CHAR_STAT_DEF.slice().sort(function(a,b){return getStatLevel(b.key)-getStatLevel(a.key);})[0];var cls={intelligence:'Hunter',strength:'Warrior',wisdom:'Sage',vitality:'Guardian',charisma:'Leader',discipline:'Monk'};return cls[top.key]||'Novice';}
var calendarMonth=today.getMonth(), calendarYear=today.getFullYear();
var calSelectedDate=todayStr;
var _unifiedCalTab='all'; // 'all'|'task'|'journal'|'gcal'
var calModalDateStr='';
var reminderTimers=[];

// ── Google Calendar state (Worker-based token) ──
var _gcalAccessToken = null;
var _gcalTokenExpiry = 0;
var _gcalEnabled = true;
var _gcalEvents = {};
var _gcalSyncing = false;

// Worker URL & config
var GCAL_WORKER_URL = 'https://chitask-gcal-worker.yuuchi-sandi.workers.dev';
var GCAL_CLIENT_ID = '914322046491-vtarff8ibfc30rkk5frdk7keas9ijv5m.apps.googleusercontent.com';
var GCAL_SCOPES = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events';

// ── Handle OAuth callback jika ini halaman /oauth2callback ──
(function() {
  if (window.location.search.indexOf('code=') >= 0 && window.location.search.indexOf('state=') >= 0) {
    var params = new URLSearchParams(window.location.search);
    var code = params.get('code');
    var uid = params.get('state');
    if (code && uid) {
      fetch(GCAL_WORKER_URL + '/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code, uid: uid, redirect_uri: window.location.origin + '/' })
      }).then(function(r) { return r.json(); }).then(function(data) {
        if (data.access_token) {
          try {
            localStorage.setItem('chitask_gcal_token', data.access_token);
            localStorage.setItem('chitask_gcal_token_expiry', String(Date.now() + (data.expires_in * 1000)));
            localStorage.setItem('chitask_gcal_connected', '1');
          } catch(e) {}
        }
        // Bersihkan URL dan reload
        window.history.replaceState({}, '', '/');
        window.location.reload();
      }).catch(function(e) {
        console.error('OAuth callback error:', e);
        window.history.replaceState({}, '', '/');
      });
    }
  }
})();

// Restore token dari localStorage jika masih valid
try {
  var _storedToken  = localStorage.getItem('chitask_gcal_token');
  var _storedExpiry = parseInt(localStorage.getItem('chitask_gcal_token_expiry') || '0');
  if (_storedToken && _storedExpiry > Date.now() + 120000) {
    _gcalAccessToken = _storedToken;
    _gcalTokenExpiry = _storedExpiry;
  } else {
    localStorage.removeItem('chitask_gcal_token');
    localStorage.removeItem('chitask_gcal_token_expiry');
  }
} catch(e) {}

// ── Ambil access token — otomatis refresh via Worker ──
function gcalGetToken() {
  // Token masih valid (buffer 2 menit)
  if (_gcalAccessToken && Date.now() < _gcalTokenExpiry - 120000) {
    return Promise.resolve(_gcalAccessToken);
  }
  if (!fbUser || fbUser._isGuest || _offlineMode) return Promise.resolve(null);
  // Refresh via Worker
  return fetch(GCAL_WORKER_URL + '/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid: fbUser.uid })
  }).then(function(r) { return r.json(); }).then(function(data) {
    if (data.access_token) {
      _gcalAccessToken = data.access_token;
      _gcalTokenExpiry = Date.now() + (data.expires_in * 1000);
      try {
        localStorage.setItem('chitask_gcal_token', _gcalAccessToken);
        localStorage.setItem('chitask_gcal_token_expiry', String(_gcalTokenExpiry));
      } catch(e) {}
      return _gcalAccessToken;
    }
    if (data.error === 'not_connected') {
      _gcalAccessToken = null;
      if (typeof render === 'function') render();
    }
    return null;
  }).catch(function() { return null; });
}

// ── Connect Google Calendar (buka popup OAuth) ──
function gcalReauth() {
  if (_offlineMode || !fbUser || fbUser._isGuest) {
    showToast('⚠️ Login Google diperlukan untuk sync Calendar');
    return;
  }
  var params = new URLSearchParams({
    client_id: GCAL_CLIENT_ID,
    redirect_uri: window.location.origin + '/',
    response_type: 'code',
    scope: GCAL_SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    state: fbUser.uid
  });
  window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?' + params.toString();
}

// ── Disconnect Google Calendar ──
function gcalDisconnect() {
  if (!fbUser) return;
  fetch(GCAL_WORKER_URL + '/revoke', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid: fbUser.uid })
  });
  _gcalAccessToken = null;
  _gcalTokenExpiry = 0;
  try {
    localStorage.removeItem('chitask_gcal_token');
    localStorage.removeItem('chitask_gcal_token_expiry');
    localStorage.removeItem('chitask_gcal_connected');
  } catch(e) {}
  showToast('Google Calendar diputuskan');
  if (typeof render === 'function') render();
}

// ── Init untuk user (dipanggil dari onAuthStateChanged) ──
function _gcalInitForUser(user) {
  if (!user || user._isGuest || _offlineMode) return;

  var _connected = localStorage.getItem('chitask_gcal_connected');

  if (_connected) {
    // Device ini sudah pernah connect — langsung refresh token
    gcalGetToken().then(function(token) {
      if (token) {
        _gcalEnabled = true;
        gcalFetchMonth(calendarYear, calendarMonth);
        if (typeof render === 'function') render();
      }
    });
  } else {
    // Device baru / localStorage kosong — cek ke Worker apakah user
    // sudah pernah connect di device lain (cross-device support)
    fetch(GCAL_WORKER_URL + '/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: user.uid })
    }).then(function(r) { return r.json(); }).then(function(data) {
      if (data.connected) {
        // Worker punya refresh_token — set flag lokal dan init Calendar
        try { localStorage.setItem('chitask_gcal_connected', '1'); } catch(e) {}
        gcalGetToken().then(function(token) {
          if (token) {
            _gcalEnabled = true;
            gcalFetchMonth(calendarYear, calendarMonth);
            if (typeof render === 'function') render();
          }
        });
      }
    }).catch(function() { /* offline atau worker error — skip */ });
  }
}
var navSectionOpen={task:false,fin:false,maint:false,journal:false};
var STORAGE_KEY='chitask_v6_data';
var _syncTimer=null;

// Finance state
var finTransactions=[]; // {id,type:'income'|'expense'|'saving',amount,category,note,date,walletId}
var finWallets=[]; // {id,name,icon,balance}
var defaultShoppingWalletId=''; // ID wallet default untuk belanja
var finWishlist=[]; // {id,name,targetPrice,saved,note,status:'active'|'done',transactions:[...]}
var finViewMonth=today.getMonth(), finViewYear=today.getFullYear();
var finNextId=1;
var finCategories={
  expense:['Makan','Transport','Belanja','Hiburan','Kesehatan','Tagihan','Pendidikan','Rumah','Lainnya'],
  income:['Gaji','Freelance','Investasi','Bonus','Hadiah','Lainnya'],
  saving:['Dana Darurat','Tabungan Wishlist','Deposito','Lainnya']
};

// Maintenance state
// maintItems: [{id,name,category,lastDate,intervalDays,nextDate,cost,walletId,note,log:[{date,note,cost,walletId}]}]
// maintCategories: [{id,name,icon}]
var maintItems=[];
var maintCategories=[];
var maintNextId=1;
var selectedMaintItem=null;

// Tagihan state: [{id,name,amount,dueDay,walletId,category,note,status:'active'|'paid',lastPaid,history:[{date,amount,walletId}]}]
var finTagihan=[];
// Hutang state: [{id,name,type:'hutang'|'piutang',totalAmount,walletId,note,createdDate,transactions:[{id,date,type:'pinjam'|'bayar',amount,walletId,note}]}]
var finHutang=[];

// Budget state: {categoryName: limitAmount} – per bulan
var finBudgets={};  // e.g. {'Makan':500000, 'Transport':300000}

// Journal state: [{id,date,content,mood,tags:[]}]
var journalEntries=[];
var journalNextId=1;

// Shopping items state: [{id,name,price,note}]
var shoppingItems=[];
var shoppingItemNextId=1;
var journalEditDate=null;   // date string being edited
var journalEditMood=-1;
var journalEditTags=[];
var journalCalMonth=today.getMonth(), journalCalYear=today.getFullYear();
var journalSearchQ='';

// ══════════════════════════════════════════════
// STORAGE
// ══════════════════════════════════════════════
// _lastSavedTs menyimpan timestamp terakhir yang valid (dari load data atau user action)
// Ini TIDAK diperbarui saat init/render — hanya saat user benar-benar mengubah data
var _lastSavedTs = null;
// _initLocalTs: timestamp dari localStorage yang dibaca SEBELUM init berjalan
var _initLocalTs = (function(){
  try{
    var raw=localStorage.getItem('chitask_v6_data');
    if(raw){var p=JSON.parse(raw);if(p&&p.lastSaved)return p.lastSaved;}
  }catch(e){}
  return null;
})();

function saveData(userAction){
  // Hanya perbarui timestamp jika ini adalah aksi user (bukan init/render)
  if(userAction===true){
    _lastSavedTs = new Date().toISOString();
  }
  // Jika _lastSavedTs masih null, pertahankan yang sudah ada di localStorage
  if(!_lastSavedTs) _lastSavedTs = _initLocalTs;
  var payload=JSON.stringify({
    tasks:tasks,nextId:nextId,darkMode:darkMode,groupOpenState:groupOpenState,
    customGroups:customGroups,customGroupIcons:customGroupIcons,xp:xp,achievements:achievements,totalDone:totalDone,
    perfectDays:perfectDays,totalSubtasks:totalSubtasks,navSectionOpen:navSectionOpen,
    mydayGroupOrder:mydayGroupOrder,
    finTransactions:finTransactions,finWallets:finWallets,finWishlist:finWishlist,defaultShoppingWalletId:defaultShoppingWalletId,
    finNextId:finNextId,finCategories:finCategories,
    maintItems:maintItems,maintCategories:maintCategories,maintNextId:maintNextId,
    finTagihan:finTagihan,finHutang:finHutang,
    finBudgets:finBudgets,
    journalEntries:journalEntries,journalNextId:journalNextId,
    goldBalance:goldBalance,shopPurchases:shopPurchases,shopCustomItems:shopCustomItems,shopLoginDays:shopLoginDays,
    shoppingItems:shoppingItems,shoppingItemNextId:shoppingItemNextId,
    activeTheme:activeTheme,activeEffect:activeEffect,activeAvatarCard:activeAvatarCard,finSavingTarget:finSavingTarget,
    tempThemeExpiry:tempThemeExpiry,tempThemePrev:tempThemePrev,
    weeklyReviewLastSeen:weeklyReviewLastSeen,
    charStatProgress:charStatProgress,
    charStatLastActivity:charStatLastActivity,
    lastSaved:_lastSavedTs||null,
    gamiOnbDone:_gamiOnbDone,gamiModeVal:_gamiModeVal,
    tourDone:_tourDone,navModeDone:_navModeDone,
    // ── PENTING untuk guest reload ──
    // onAuthStateChanged mengecek _isGuest dari localStorage untuk mendeteksi
    // apakah ini reload dari sesi guest sebelumnya. Tanpa field ini, guest
    // tidak dikenali saat reload dan app tidak memanggil initApp() sama sekali.
    _isGuest: (typeof fbUser !== 'undefined' && fbUser && fbUser._isGuest) ? true : undefined,
    _userName: (typeof fbUser !== 'undefined' && fbUser && fbUser._isGuest) ? (fbUser.displayName || 'Tamu') : undefined
  });
  // Simpan ke localStorage sebagai cache offline
  try{localStorage.setItem(STORAGE_KEY,payload);}catch(e){}
  if(userAction===true){
    var el=document.getElementById('saveIndicator');
    if(el){el.classList.add('show');clearTimeout(el._to);el._to=setTimeout(function(){el.classList.remove('show');},1800);}
  }
  // ── Sync ke Firebase Firestore (prioritas utama) ──
  if(typeof fbSaveData === 'function') {
    fbSaveData(payload);
  }
}
function loadData(){
  try{var raw=localStorage.getItem(STORAGE_KEY);if(raw)return JSON.parse(raw);}catch(e){}
  return null;
}

// ══════════════════════════════════════════════
// DEFAULT DATA
// ══════════════════════════════════════════════
var DEFAULT_TASKS=[];

var DEFAULT_WALLETS=[];

var DEFAULT_MAINT_CATEGORIES=[
  {id:'mc1',name:'Motor',icon:'🏍️'},
  {id:'mc2',name:'Mobil',icon:'🚗'},
  {id:'mc3',name:'Rumah',icon:'🏠'},
  {id:'mc4',name:'Elektronik',icon:'💻'}
];

// ══════════════════════════════════════════════
// NAV SECTION TOGGLE
// ══════════════════════════════════════════════
function toggleNavSection(sec){
  navSectionOpen[sec]=!navSectionOpen[sec];
  var group=document.getElementById('navgroup-'+sec);
  var chevron=document.getElementById('chevron-'+sec);
  if(group){group.style.maxHeight=navSectionOpen[sec]?Math.max(group.scrollHeight,2000)+'px':'0';}
  if(chevron){chevron.classList.toggle('open',navSectionOpen[sec]);}
  saveData();
}
function applyNavSections(){
  ['task','fin','maint','journal'].forEach(function(sec){
    var group=document.getElementById('navgroup-'+sec);
    var chevron=document.getElementById('chevron-'+sec);
    var open=navSectionOpen[sec]!==false;
    if(group){group.style.maxHeight=open?'2000px':'0';}
    if(chevron){chevron.classList.toggle('open',open);}
  });
}

// ══════════════════════════════════════════════
// REPEAT HELPERS
// ══════════════════════════════════════════════
// Hitung berapa hari yang benar-benar dijadwalkan untuk habit t dalam array dayList
function calcScheduledDays(t,dayList){
  var days=Math.max(1,getRepeatDays(t.repeat||'Harian'));
  var anchor=t.due||todayStr;
  var anchorD=new Date(anchor+'T00:00:00');
  var count=0;
  dayList.forEach(function(d){
    // Skip excluded days
    var dateObj=new Date(d+'T00:00:00');
    var skip=getExceptDay(t.repeat||'Harian');
    if(skip>=0&&dateObj.getDay()===skip)return;
    var diff=Math.round((dateObj-anchorD)/86400000);
    if(diff<0)return;
    if(days<=1||diff%days===0)count++;
  });
  return count||1; // minimal 1 agar tidak divide by zero
}

function getRepeatDays(repeat){
  if(!repeat)return 0;
  if(repeat==='Harian')return 1;
  // Handle "Harian kecuali [hari]" — still 1 day interval base, handled separately
  if(repeat&&repeat.indexOf('Harian kecuali')===0)return 1;
  if(repeat==='Mingguan')return 7;
  if(repeat==='Bulanan')return 30;
  // "Tiap X Hari" or "Tiap X Minggu" or custom "Xh" / "Xm"
  var m=repeat.match(/(\d+)\s*(hari|h|minggu|m|bulan)/i);
  if(m){
    var n=parseInt(m[1]);
    var unit=(m[2]||'h').toLowerCase();
    if(unit==='minggu'||unit==='m')return n*7;
    if(unit==='bulan')return n*30;
    return n;
  }
  // Legacy "Tiap 2 Hari" etc
  var m2=repeat.match(/Tiap\s+(\d+)\s+Hari/i);
  if(m2)return parseInt(m2[1]);
  return 1;
}

// Map hari nama ke getDay() index (0=Minggu)
var _HARI_MAP={'senin':1,'selasa':2,'rabu':3,'kamis':4,'jumat':5,'jum\'at':5,'sabtu':6,'minggu':0};
function getExceptDay(repeat){
  // Returns day-of-week index to skip, or -1
  if(!repeat||repeat.indexOf('Harian kecuali')!==0)return -1;
  var hariStr=repeat.replace('Harian kecuali','').trim().toLowerCase();
  if(_HARI_MAP.hasOwnProperty(hariStr))return _HARI_MAP[hariStr];
  return -1;
}
function isRepeatSkipToday(repeat){
  // Returns true if today should be skipped (due to "Harian kecuali [hari]")
  var skip=getExceptDay(repeat);
  if(skip<0)return false;
  return new Date().getDay()===skip;
}
// Is a habit due today based on its repeat interval?
function isHabitDueToday(t){
  if(t.type!=='Habit')return true;
  // If today is the excluded day, habit is not due
  if(isRepeatSkipToday(t.repeat||'Harian'))return false;
  var days=getRepeatDays(t.repeat||'Harian');
  if(days<=1)return true;
  // Find best anchor: due date, atau tanggal paling awal di history, atau hari ini
  var anchor=t.due;
  if(!anchor&&t.history&&t.history.length){
    // Pakai tanggal paling awal di history sebagai anchor yang stabil
    anchor=t.history.slice().sort()[0];
  }
  if(!anchor)anchor=todayStr;
  // Walk forward from anchor by interval to find if today is a scheduled day
  var anchorD=new Date(anchor+'T00:00:00');
  var todayD=new Date(today);
  var diff=Math.round((todayD-anchorD)/86400000);
  if(diff<0)return false;
  return diff%days===0;
}

// ══════════════════════════════════════════════
// REPEAT RESET
// ══════════════════════════════════════════════
function processRepeatReset(){
  tasks.forEach(function(t){
    if(!t.repeat)return;
    // Kasus baru: task selesai hari ini, punya _nextDue → saat hari berganti, aktifkan next cycle
    if(t._nextDue && t.done && t.doneDate && t.doneDate < todayStr){
      t.done=false;
      t.due=t._nextDue;
      t.doneDate=null;
      delete t._nextDue;
      t.myday=(t.due===todayStr);
      if(t.subtasks&&t.subtasks.length){t.subtasks.forEach(function(s){s.done=false;});}
      if(t.steps&&t.steps>=2)t.stepsDone=0;
      return;
    }
    // Kasus lama: task done tanpa _nextDue (migrasi data lama)
    if(!t.done)return;
    if(isRepeatSkipToday(t.repeat))return;
    var doneDate=t.doneDate||offset(-1);
    if(doneDate>=todayStr)return;
    var days=getRepeatDays(t.repeat);
    if(!days)return;
    var diff=Math.round((today-new Date(doneDate+'T00:00:00'))/86400000);
    if(diff>=days){
      t.done=false;
      t.due=todayStr;
      t.doneDate=null;
      delete t._nextDue;
      if(t.subtasks&&t.subtasks.length){t.subtasks.forEach(function(s){s.done=false;});}
      if(t.steps&&t.steps>=2)t.stepsDone=0;
    }
  });
  processStatDecay();
}

// ── Stat Decay: perlahan turun kalau tidak ada aktivitas ──
// Grace period: 7 hari. Setelah itu decay proporsional:
// tiap 3 hari kehilangan ~1% dari progress saat ini (min 1).
// Terasa nyata di semua level — tidak terlalu cepat di awal, tidak stagnan di level tinggi.
function processStatDecay(){
  var GRACE_DAYS = 7;      // hari pertama tidak terasa sama sekali
  var DECAY_INTERVAL = 3;  // setiap N hari, 1 tick decay
  var DECAY_PCT = 0.01;    // tiap tick: kurangi 1% dari progress saat ini (min 1)
  var changed = false;
  CHAR_STAT_DEF.forEach(function(def){
    var key = def.key;
    var prog = charStatProgress[key] || 0;
    if(prog <= 0) return;
    var last = charStatLastActivity[key] || '';
    if(!last) return;
    var lastDt = new Date(last + 'T00:00:00');
    var inactiveDays = Math.round((today - lastDt) / 86400000);
    if(inactiveDays <= GRACE_DAYS) return;
    var decayableDays = inactiveDays - GRACE_DAYS;
    var ticks = Math.floor(decayableDays / DECAY_INTERVAL);
    if(ticks <= 0) return;
    // Tiap tick: kurangi 1% dari progress (min 1 per tick)
    var newProg = prog;
    for(var i = 0; i < ticks; i++){
      newProg = newProg - Math.max(1, Math.floor(newProg * DECAY_PCT));
      if(newProg <= 0){ newProg = 0; break; }
    }
    if(newProg < prog){
      charStatProgress[key] = newProg;
      // Geser lastActivity maju supaya ticks ini tidak dihitung lagi
      var newLast = new Date(lastDt);
      newLast.setDate(newLast.getDate() + ticks * DECAY_INTERVAL);
      charStatLastActivity[key] = localDateStr(newLast);
      changed = true;
    }
  });
  if(changed){ saveData(true); }
}

// ══════════════════════════════════════════════
// XP & GAMIFICATION
// ══════════════════════════════════════════════
function getLevel(){
  var lv=1;
  while(xp>=getTotalXpForLevel(lv+1))lv++;
  return lv;
}
function getLevelXP(){
  var lv=getLevel();
  return xp-getTotalXpForLevel(lv);
}
function getLevelXpNeeded(){
  var lv=getLevel();
  return getXpForLevel(lv+1);
}
function getTaskXP(t){return t.xpVal||(t.type==='Habit'?XP_PER_HABIT:XP_PER_TASK);}
function addXP(amount,label){
  var levelBefore = getLevel();
  xp+=amount;
  var levelAfter = getLevel();
  var el=document.getElementById('xpToast');
  el.textContent='+'+(label||amount)+' XP';
  el.classList.remove('show');
  void el.offsetWidth;
  el.classList.add('show');
  clearTimeout(el._to);el._to=setTimeout(function(){el.classList.remove('show');},2200);
  updateXPBar();checkAchievements();
  // Cek level up & job unlock baru
  if(levelAfter > levelBefore){
    setTimeout(function(){ _checkAndShowJobUnlock(levelBefore, levelAfter); }, 600);
  }
}
function updateXPBar(){
  var lv=getLevel(),needed=getLevelXpNeeded(),cur=getLevelXP(),pct=needed>0?(cur/needed*100):100;
  var lbl=document.getElementById('xpLevelLabel');
  var xlbl=document.getElementById('xpLabel');
  var fill=document.getElementById('xpFill');
  if(lbl)lbl.textContent='Lv '+lv;
  if(xlbl)xlbl.textContent=cur+'/'+needed+' XP';
  if(fill)fill.style.width=pct+'%';
}

// ── Job Unlock Overlay ────────────────────────────────────────────────────
function _checkAndShowJobUnlock(levelBefore, levelAfter){
  if(typeof charJobs === 'undefined') return;
  var allJobs = charJobs.NORMAL_JOBS || [];
  // Kumpulkan semua job yang unlock di range level ini
  var newlyUnlocked = allJobs.filter(function(j){
    return j.unlockLevel > levelBefore && j.unlockLevel <= levelAfter && !j.comingSoon;
  });
  if(!newlyUnlocked.length){
    // Tetap tampilkan level-up overlay tanpa job baru
    showLevelUpOverlay(levelAfter, null);
    return;
  }
  // Tampilkan satu per satu jika ada beberapa (delay antar overlay)
  newlyUnlocked.forEach(function(job, i){
    setTimeout(function(){
      showLevelUpOverlay(levelAfter, job);
    }, i * 3200);
  });
}

var _julRaysRaf = null;

function _julStartRays(canvas, glowColor) {
  if (_julRaysRaf) cancelAnimationFrame(_julRaysRaf);
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  var ctx = canvas.getContext('2d');
  var cx = canvas.width / 2, cy = canvas.height * 0.45;
  var angle = 0;

  // Particle system
  var particles = [];
  for (var p = 0; p < 28; p++) {
    particles.push({
      x: cx, y: cy,
      vx: (Math.random()-0.5)*3.5,
      vy: (Math.random()-1.4)*3.5,
      life: Math.random(),
      maxLife: 0.6 + Math.random()*0.8,
      size: 1.5 + Math.random()*2.5,
      delay: Math.random()*1.5
    });
  }
  var startTime = null;

  function draw(ts) {
    if (!startTime) startTime = ts;
    var elapsed = (ts - startTime) / 1000;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var len = Math.hypot(canvas.width, canvas.height);

    // Rotating rays — 24 rays, more vivid
    for (var i = 0; i < 24; i++) {
      var a = angle + (i / 24) * Math.PI * 2;
      var isAccent = i % 4 === 0;
      var isBright = i % 4 === 2;
      var grad = ctx.createLinearGradient(cx, cy, cx + Math.cos(a)*len, cy + Math.sin(a)*len);
      if (isAccent) {
        grad.addColorStop(0,   glowColor.replace(/[\d.]+\)$/, '0.12)'));
        grad.addColorStop(0.35, glowColor.replace(/[\d.]+\)$/, '0.04)'));
        grad.addColorStop(1,   'rgba(0,0,0,0)');
      } else if (isBright) {
        grad.addColorStop(0,   'rgba(255,255,255,0.05)');
        grad.addColorStop(0.4, 'rgba(255,255,255,0.015)');
        grad.addColorStop(1,   'rgba(0,0,0,0)');
      } else {
        grad.addColorStop(0,   glowColor.replace(/[\d.]+\)$/, '0.03)'));
        grad.addColorStop(1,   'rgba(0,0,0,0)');
      }
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, len, a - 0.04, a + 0.04);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Particles burst (only in first 3 seconds)
    if (elapsed < 3) {
      particles.forEach(function(pt) {
        if (elapsed < pt.delay) return;
        var t = elapsed - pt.delay;
        if (t > pt.maxLife) {
          // Reset particle
          pt.x = cx; pt.y = cy;
          pt.vx = (Math.random()-0.5)*4;
          pt.vy = (Math.random()-1.6)*4;
          pt.delay = elapsed + Math.random()*0.3;
          pt.life = 0; pt.maxLife = 0.5 + Math.random()*0.7;
          return;
        }
        var progress = t / pt.maxLife;
        var alpha = Math.sin(progress * Math.PI) * 0.85;
        var px = cx + pt.vx * t * 80;
        var py = cy + pt.vy * t * 80 + 0.5 * 120 * t * t; // slight gravity
        ctx.beginPath();
        ctx.arc(px, py, pt.size * (1 - progress * 0.5), 0, Math.PI*2);
        ctx.fillStyle = glowColor.replace(/[\d.]+\)$/, alpha + ')');
        ctx.fill();
      });
    }

    // Center radial flash (only at start)
    if (elapsed < 1.2) {
      var flashAlpha = Math.max(0, 0.18 * (1 - elapsed / 1.2));
      var flashGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 200);
      flashGrad.addColorStop(0, glowColor.replace(/[\d.]+\)$/, flashAlpha + ')'));
      flashGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, 200, 0, Math.PI*2);
      ctx.fillStyle = flashGrad;
      ctx.fill();
    }

    angle += 0.0025;
    _julRaysRaf = requestAnimationFrame(draw);
  }
  draw(performance.now());
}

function showLevelUpOverlay(newLevel, job) {
  // Per-rarity theme: accent color, glow rgba, blob color (CSS), border alpha, btn text color
  var RC = {
    common:   { accent:'#94a3b8', glow:'rgba(148,163,184,', blob:'rgba(100,116,139,0.25)',  border:'rgba(148,163,184,.22)', btnBg:'rgba(148,163,184,.15)', btnBorder:'rgba(148,163,184,.4)', btnColor:'#cbd5e1' },
    uncommon: { accent:'#4ade80', glow:'rgba(74,222,128,',  blob:'rgba(34,197,94,0.22)',    border:'rgba(74,222,128,.2)',   btnBg:'rgba(74,222,128,.12)',  btnBorder:'rgba(74,222,128,.38)',  btnColor:'#86efac' },
    rare:     { accent:'#60a5fa', glow:'rgba(96,165,250,',  blob:'rgba(59,130,246,0.25)',   border:'rgba(96,165,250,.22)', btnBg:'rgba(96,165,250,.12)',  btnBorder:'rgba(96,165,250,.4)',   btnColor:'#93c5fd' },
    epic:     { accent:'#c084fc', glow:'rgba(192,132,252,', blob:'rgba(139,92,246,0.28)',   border:'rgba(192,132,252,.22)',btnBg:'rgba(192,132,252,.12)', btnBorder:'rgba(192,132,252,.38)', btnColor:'#d8b4fe' },
    hidden:   { accent:'#fbbf24', glow:'rgba(251,191,36,',  blob:'rgba(245,158,11,0.28)',   border:'rgba(251,191,36,.22)', btnBg:'rgba(251,191,36,.1)',   btnBorder:'rgba(251,191,36,.38)',  btnColor:'#fde68a' }
  };
  var rarity = job ? (job.rarity || 'common') : 'common';
  var rc = RC[rarity] || RC.common;

  var overlay = document.getElementById('jobUnlockOverlay');
  if (!overlay) return;

  var rarityLabel = {common:'Common',uncommon:'Uncommon',rare:'Rare',epic:'Epic',hidden:'Hidden'}[rarity] || rarity;

  var spriteUrl = '';
  var jobGender = (typeof charGender !== 'undefined') ? charGender.get() : 'male';
  if (job && typeof charJobs !== 'undefined') {
    spriteUrl = charJobs.getSpriteUrl(job.id, jobGender);
  }

  // Orbit ring sizes based on sprite display size
  var orbitBig = 190, orbitSml = 158;

  var bodyHtml = '';
  if (job) {
    var sprHtml = spriteUrl
      ? '<div id="julSprite" class="jul-sprite"></div>'
      : '<div class="jul-icon-fallback">' + job.icon + '</div>';

    bodyHtml =
        '<div class="jul-sprite-section" id="julSpriteSection">'
      +   '<div class="jul-sprite-halo" style="width:' + (orbitBig+32) + 'px;height:' + (orbitBig+32) + 'px"></div>'
      +   '<div class="jul-orbit1" style="width:' + orbitBig + 'px;height:' + orbitBig + 'px"></div>'
      +   '<div class="jul-orbit2" style="width:' + orbitSml + 'px;height:' + orbitSml + 'px"></div>'
      +   sprHtml
      + '</div>'
      + '<div class="jul-rarity-pill" style="color:' + rc.accent + ';border-color:' + rc.accent + '44;background:' + rc.accent + '14">' + rarityLabel + '</div>'
      + '<div class="jul-job-name">' + job.name + '</div>'
      + '<div class="jul-job-desc">' + job.desc + '</div>'
      + '<div class="jul-hint">Bisa dipilih di Job Picker ↗</div>';
  } else {
    bodyHtml =
        '<div class="jul-levelonly-desc">Kamu semakin kuat.<br>Terus tingkatkan dirimu.</div>';
  }

  // Build sprite section separately (outside card) so it overflows the top
  var spriteSectionHtml = '';
  var bodyInsideCard = bodyHtml;
  if (job) {
    var sprHtml2 = spriteUrl
      ? '<div id="julSprite" class="jul-sprite"></div>'
      : '<div class="jul-icon-fallback">' + job.icon + '</div>';
    spriteSectionHtml =
        '<div class="jul-sprite-section" id="julSpriteSection" style="margin-bottom:-55px;z-index:2;position:relative;width:' + (orbitBig+20) + 'px;height:' + (orbitBig+20) + 'px;">'
      +   '<div class="jul-sprite-halo" style="width:' + (orbitBig+60) + 'px;height:' + (orbitBig+60) + 'px;top:50%;left:50%;transform:translate(-50%,-50%)"></div>'
      +   '<div class="jul-aura-ring" style="width:' + (orbitBig+10) + 'px;height:' + (orbitBig+10) + 'px;top:50%;left:50%;transform:translate(-50%,-50%)"></div>'
      +   '<div class="jul-orbit1" style="width:' + orbitBig + 'px;height:' + orbitBig + 'px;top:50%;left:50%;transform:translate(-50%,-50%)"></div>'
      +   '<div class="jul-orbit2" style="width:' + orbitSml + 'px;height:' + orbitSml + 'px;top:50%;left:50%;transform:translate(-50%,-50%)"></div>'
      +   '<div class="jul-sprite-shadow" style="bottom:0;left:50%"></div>'
      +   '<div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);z-index:10">' + sprHtml2 + '</div>'
      + '</div>';
    bodyInsideCard =
        '<div class="jul-rarity-pill" style="color:' + rc.accent + ';border-color:' + rc.accent + '44;background:' + rc.accent + '14">' + rarityLabel + '</div>'
      + '<div class="jul-job-name">' + job.name + '</div>'
      + '<div class="jul-job-desc">' + job.desc + '</div>'
      + '<div class="jul-hint">Bisa dipilih di Job Picker ↗</div>';
  }

  overlay.innerHTML =
      '<canvas class="jul-rays-canvas" id="julRaysCanvas"></canvas>'
    + '<div class="jul-backdrop"></div>'
    + '<div class="jul-glow-blob" style="background:' + rc.blob + '"></div>'
    + '<div class="jul-wrap" style="--jul-accent:' + rc.accent + ';--jul-glow:' + rc.glow + '0.4);--jul-glow-soft:' + rc.glow + '0.15);--jul-border:' + rc.border + '">'
    +   spriteSectionHtml
    +   '<div class="jul-card" style="border-color:' + rc.border + ';' + (job ? 'padding-top:65px;' : '') + '">'
    +     '<button class="jul-close" onclick="closeJobUnlockOverlay()">✕</button>'
    +     '<div class="jul-level-section">'
    +       '<div class="jul-level-label">✦ Level Up ✦</div>'
    +       '<div class="jul-level-num" style="--jul-accent:' + rc.accent + '">' + newLevel + '</div>'
    +     '</div>'
    +     bodyInsideCard
    +     '<button class="jul-btn" style="background:' + rc.btnBg + ';border:1px solid ' + rc.btnBorder + ';color:' + rc.btnColor + ';box-shadow:0 0 20px ' + rc.glow + '0.25)' + '" onclick="' + (job ? 'closeJobUnlockOverlay();setTimeout(function(){if(typeof charJobs!==\'undefined\')charJobs.openPicker();},350)' : 'closeJobUnlockOverlay()') + '">'
    +       (job ? 'Pilih Job Sekarang' : 'Lanjutkan!')
    +     '</button>'
    +   '</div>'
    + '</div>';

  overlay.classList.add('show');

  var canvas = document.getElementById('julRaysCanvas');
  if (canvas) _julStartRays(canvas, rc.glow + '1)');

  // Sprite sheet animation
  if (job && spriteUrl && typeof CT_SpriteConfig !== 'undefined') {
    setTimeout(function() {
      var el = document.getElementById('julSprite');
      if (!el) return;
      var cfg = CT_SpriteConfig.getConfig(job.id, jobGender);
      if (!cfg) return;
      var dW = cfg.displayW || 170;
      var dH = cfg.displayH || 185;
      el.style.width          = dW + 'px';
      el.style.height         = dH + 'px';
      el.style.backgroundImage = 'url(\'' + spriteUrl + '\')';
      if (cfg.isStatic) {
        el.style.backgroundSize     = '100% 100%';
        el.style.backgroundPosition = '0 0';
      } else {
        el.style.backgroundSize = (dW * cfg.cols) + 'px ' + (dH * cfg.rows) + 'px';
        el.style.backgroundPosition = '0px 0px';
        // Inject unique @keyframes
        var keyName = 'julOvr_' + job.id + '_' + jobGender;
        var old = document.getElementById('ct-jul-kf');
        if (old) old.remove();
        var frames = Math.min(cfg.frameCount, cfg.cols * cfg.rows);
        var steps = [];
        for (var f = 0; f < frames; f++) {
          var col = f % cfg.cols;
          var row = Math.floor(f / cfg.cols);
          steps.push(((f / frames)*100).toFixed(2) + '%{background-position:' + (-col*dW) + 'px ' + (-row*dH) + 'px}');
        }
        steps.push('100%{background-position:0px 0px}');
        var tag = document.createElement('style');
        tag.id = 'ct-jul-kf';
        tag.textContent = '@keyframes ' + keyName + '{' + steps.join('') + '}';
        document.head.appendChild(tag);
        var dur = (frames / cfg.fps).toFixed(3) + 's';
        el.style.animation = keyName + ' ' + dur + ' steps(1) infinite';
      }
    }, 150);
  }

  if (typeof triggerConfetti === 'function' && activeEffect === 'effect-confetti') triggerConfetti();
  else if (typeof triggerFirework === 'function' && activeEffect === 'effect-firework') triggerFirework();
}

function closeJobUnlockOverlay() {
  if (_julRaysRaf) { cancelAnimationFrame(_julRaysRaf); _julRaysRaf = null; }
  var kf = document.getElementById('ct-jul-kf');
  if (kf) kf.remove();
  var overlay = document.getElementById('jobUnlockOverlay');
  if (!overlay) return;
  overlay.style.opacity = '0';
  overlay.style.transition = 'opacity 0.3s ease';
  setTimeout(function() {
    overlay.classList.remove('show');
    overlay.style.opacity = '';
    overlay.style.transition = '';
    overlay.innerHTML = '';
  }, 300);
}
function getStats(){
  // Gunakan lastKnownStreak jika ada (sudah di-persist saat toggle), fallback ke calcStreak
  var maxStreak=tasks.filter(function(t){return t.type==='Habit';}).reduce(function(m,t){
    var s=t.lastKnownStreak!=null?t.lastKnownStreak:calcStreak(t);
    return Math.max(m,s);
  },0);
  return{totalDone:totalDone,maxStreak:maxStreak,level:getLevel(),perfectDays:perfectDays,totalSubtasks:totalSubtasks};
}
function checkAchievements(){
  var stats=getStats();
  var newUnlock=false;
  ACHIEV_DEF.forEach(function(a){
    if(achievements.indexOf(a.id)<0&&a.check(stats)){
      achievements.push(a.id);newUnlock=true;
      setTimeout(function(){showToast('🏆 Pencapaian baru: '+a.name+'!');},300);
    }
  });
  if(newUnlock)saveData();
}

// ══════════════════════════════════════════════
// REMINDERS
// ══════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// NOTIFICATION SYSTEM v2 — Robust, permission-aware
// ═══════════════════════════════════════════════════════════

// ── Icon SVG untuk notifikasi ──
var _NOTIF_ICON = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
  '<rect width="64" height="64" rx="14" fill="#d97706"/>' +
  '<text y="46" x="32" text-anchor="middle" font-size="38">⏰</text>' +
  '</svg>'
);

// ══ FCM: Subscribe token & simpan reminder ke Firestore ══════════════════════════════════

// VAPID public key dari Firebase Console > Project Settings > Cloud Messaging
// > Web Push certificates > Generate key pair
var _FCM_VAPID_KEY = 'BM2WWZ3-KsRiRhKpKutCmeJfkwamUTOEvY7JOGi026NEE2fWzc2TNh1Kbl4NdlmsGOiL9kwbjN6_qZ84l_g1QQk';

// Subscribe FCM dan simpan token ke Firestore koleksi 'fcm_tokens'
function _fcmSubscribe(userId) {
  if (!userId || !window.firebase || !firebase.messaging) return;
  if (!('serviceWorker' in navigator)) return;

  // Minta izin notifikasi dulu jika belum
  if (Notification.permission === 'denied') return;

  navigator.serviceWorker.ready.then(function(swReg) {
    try {
      var msg = firebase.messaging();
      msg.getToken({ vapidKey: _FCM_VAPID_KEY, serviceWorkerRegistration: swReg })
        .then(function(token) {
          if (!token) { console.warn('[FCM] Token kosong, izin notifikasi belum diberikan?'); return; }
          console.log('[FCM] Token OK:', token.substring(0, 20) + '...');
          // Simpan token ke Firestore untuk dipakai Netlify function
          if (fbDb) {
            fbDb.collection('fcm_tokens').doc(userId).set({
              userId:    userId,
              token:     token,
              updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }).catch(function(e){ console.warn('[FCM] Gagal simpan token:', e); });
          }
          window._fcmToken = token;
        })
        .catch(function(err) { console.warn('[FCM] getToken error:', err); });
    } catch(e) { console.warn('[FCM] messaging init error:', e); }
  });
}

// Simpan reminder ke Firestore koleksi 'reminders' agar Netlify function bisa kirim FCM
// Panggil ini setiap kali user set reminder pada task
// fireAtMs = timestamp milidetik kapan notifikasi harus muncul
function _fcmSaveReminder(userId, taskId, taskName, fireAtMs) {
  if (!userId || !fbDb || !fireAtMs) return;
  var fireAtSec = Math.floor(fireAtMs / 1000);
  var docId = userId + '_' + taskId + '_' + fireAtSec;
  fbDb.collection('reminders').doc(docId).set({
    userId:   userId,
    taskId:   String(taskId),
    taskName: taskName || 'Task',
    fireAt:   fireAtSec,
    sent:     false,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).catch(function(e){ console.warn('[FCM] Gagal simpan reminder:', e); });
}

// Hapus reminder dari Firestore saat task selesai / reminder diubah / dihapus
function _fcmDeleteReminder(userId, taskId) {
  if (!userId || !fbDb) return;
  fbDb.collection('reminders')
    .where('userId', '==', userId)
    .where('taskId', '==', String(taskId))
    .where('sent', '==', false)
    .get()
    .then(function(snap){ snap.forEach(function(d){ d.ref.delete(); }); })
    .catch(function(e){ console.warn('[FCM] Gagal hapus reminder:', e); });
}

// ────────────────────────────────────────────────────────────────────────────
// ── Register Service Worker dari /sw.js (PWA proper) ──
// CATATAN: registrasi SW dilakukan SATU KALI di setupPWA() (lihat bawah).
// _initReminderSW() tidak lagi menduplikasi register() — cukup tunggu SW ready.
(function _initReminderSW(){
  if(!('serviceWorker' in navigator)) return;
  // Gunakan navigator.serviceWorker.ready — menunggu SW apapun yang sudah/akan aktif
  // tanpa mendaftarkan ulang. Ini mencegah race condition dengan setupPWA().
  navigator.serviceWorker.ready.then(function(reg){
    window._reminderSWReg = reg;
    console.log('[ChiTask] SW ready (reminder):', reg.scope);
  }).catch(function(err){
    console.warn('[ChiTask] SW ready gagal:', err);
  });
})();

// ── Kirim notifikasi: SW jika tersedia, fallback Notification API ──
function _fireNotification(title, body, tag, taskId){
  if(!('Notification' in window) || Notification.permission !== 'granted') return;
  var opts = {
    body: body,
    icon: _NOTIF_ICON,
    badge: '/icons/icon-96x96.png',
    tag: tag,
    renotify: true,
    vibrate: [200, 100, 200],
    requireInteraction: false,
    data: { taskId: taskId }
  };
  var swCtrl = navigator.serviceWorker && navigator.serviceWorker.controller;
  if(swCtrl){
    try{
      swCtrl.postMessage({
        type:'SHOW_NOTIFICATION', title:title, body:body,
        icon:_NOTIF_ICON, badge:'/icons/icon-96x96.png', tag:tag, taskId:taskId
      });
      return;
    }catch(e){}
  }
  // Fallback: Notification API langsung (bekerja saat tab aktif/foreground)
  try{ new Notification(title, opts); }catch(e){}
}

// ── Minta izin notifikasi ──
function _requestNotifPermission(callback){
  if(!('Notification' in window)){if(callback)callback(false);return;}
  if(Notification.permission==='granted'){if(callback)callback(true);return;}
  if(Notification.permission==='denied'){if(callback)callback(false);return;}
  // Notification.requestPermission() harus dipanggil dari user gesture
  try{
    var p = Notification.requestPermission();
    if(p && typeof p.then === 'function'){
      p.then(function(r){if(callback)callback(r==='granted');});
    } else {
      // Fallback untuk browser lama (callback-style)
      Notification.requestPermission(function(r){if(callback)callback(r==='granted');});
    }
  }catch(e){ if(callback)callback(false); }
}

// ── Banner minta izin notifikasi ──
// Guard: simpan dismiss di sessionStorage (hilang saat tab ditutup)
// + cooldown 24 jam di localStorage agar tidak muncul terus-menerus
var _NOTIF_BANNER_COOLDOWN_KEY = 'chitask_notif_banner_ts';
var _NOTIF_BANNER_SESSION_KEY  = 'chitask_notif_banner_dismissed';
var _NOTIF_BANNER_COOLDOWN_MS  = 24 * 60 * 60 * 1000; // 24 jam

function _notifBannerDismiss(permanent){
  // Mark session: jangan tampil lagi sampai tab di-refresh
  try{ sessionStorage.setItem(_NOTIF_BANNER_SESSION_KEY, '1'); }catch(e){}
  // Mark cooldown localStorage
  if(permanent){
    try{ localStorage.setItem(_NOTIF_BANNER_COOLDOWN_KEY, String(Date.now())); }catch(e){}
  }
  var b=document.getElementById('_notifPermBanner');if(b)b.remove();
}

function _showNotifPermissionBanner(){
  if(!('Notification' in window)||Notification.permission!=='default')return;
  if(document.getElementById('_notifPermBanner'))return;
  // Cek session dismiss (sudah klik Nanti di sesi ini)
  try{ if(sessionStorage.getItem(_NOTIF_BANNER_SESSION_KEY)==='1')return; }catch(e){}
  // Cek cooldown localStorage
  try{
    var lastTs=parseInt(localStorage.getItem(_NOTIF_BANNER_COOLDOWN_KEY)||'0',10);
    if(lastTs && Date.now()-lastTs < _NOTIF_BANNER_COOLDOWN_MS)return;
  }catch(e){}
  var banner=document.createElement('div');
  banner.id='_notifPermBanner';
  banner.style.cssText='position:fixed;bottom:76px;left:50%;transform:translateX(-50%);z-index:9999;background:var(--card);border:1.5px solid var(--accent);border-radius:16px;padding:12px 14px;display:flex;align-items:center;gap:10px;box-shadow:0 4px 28px rgba(0,0,0,0.22);max-width:360px;width:calc(100% - 32px);animation:_notifBannerIn 0.3s ease';
  banner.innerHTML=
    '<style>@keyframes _notifBannerIn{from{opacity:0;transform:translateX(-50%) translateY(16px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}</style>'+
    '<span style="font-size:22px;flex-shrink:0">\uD83D\uDD14</span>'+
    '<div style="flex:1;min-width:0">'+
      '<div style="font-size:13px;font-weight:700;color:var(--text)">Aktifkan Notifikasi Reminder</div>'+
      '<div style="font-size:11px;color:var(--muted);margin-top:1px">Agar task dengan reminder bisa mengingatkanmu tepat waktu</div>'+
    '</div>'+
    '<button id="_notifAllowBtn" style="flex-shrink:0;padding:7px 12px;background:var(--accent);color:#fff;border:none;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif">Izinkan</button>'+
    '<button id="_notifDismissBtn" style="flex-shrink:0;padding:7px 10px;background:var(--bg);color:var(--muted);border:1px solid var(--border);border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;font-family:\'DM Sans\',sans-serif">Nanti</button>';
  document.body.appendChild(banner);
  document.getElementById('_notifAllowBtn').onclick=function(){
    _requestNotifPermission(function(ok){
      _notifBannerDismiss(true);
      if(ok){ showToast('\u2705 Notifikasi reminder aktif!'); scheduleReminders(); }
      else showToast('\u274C Notifikasi diblokir. Aktifkan manual di setelan browser.');
    });
  };
  document.getElementById('_notifDismissBtn').onclick=function(){
    // Klik "Nanti": simpan cooldown 24 jam + session flag
    _notifBannerDismiss(true);
  };
  // Auto-close setelah 20 detik: hanya set session flag, TIDAK cooldown 24 jam
  // supaya muncul lagi keesokan harinya
  setTimeout(function(){
    var b=document.getElementById('_notifPermBanner');
    if(b){ _notifBannerDismiss(false); }
  }, 20000);
}

// ── scheduleReminders: jadwalkan semua task dengan reminder ──
// Mendukung: reminder hari ini, due date mendatang (maks 7 hari ke depan),
// repeat task (Harian dijadwalkan setiap hari), reschedule saat tab visible kembali.
function scheduleReminders(){
  // Bersihkan timer lama
  reminderTimers.forEach(function(t){clearTimeout(t);});
  reminderTimers=[];

  var hasReminders = tasks.some(function(t){ return t.reminder && !t.done; });

  // Kalau ada reminder tapi belum ada izin → tampilkan banner
  // _showNotifPermissionBanner sudah punya guard session+cooldown,
  // jadi aman dipanggil berkali-kali — tidak akan muncul terus-menerus
  if(hasReminders && 'Notification' in window && Notification.permission === 'default'){
    setTimeout(_showNotifPermissionBanner, 1200);
    // Lanjut juga scheduling, nanti dicek ulang saat izin diberikan
  }

  if(!('Notification' in window) || Notification.permission !== 'granted') return;

  var now = new Date();
  var todayDateStr = now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
  var maxFuture = 7 * 24 * 3600 * 1000; // jadwalkan maks 7 hari ke depan

  tasks.forEach(function(t){
    if(!t.reminder || t.done) return;
    // Sholat Jumat: skip scheduling kalau task tidak aktif (myday=false = bukan hari Jumat)
    if(t.name === '🕌 Sholat Jumat' && !t.myday) return;
    var parts = t.reminder.split(':');
    var hh = parseInt(parts[0],10), mm = parseInt(parts[1],10);
    if(isNaN(hh)||isNaN(mm)) return;
    var timeStr = String(hh).padStart(2,'0') + ':' + String(mm).padStart(2,'0');

    var isRepeat = t.repeat && t.repeat !== 'Tidak' && t.repeat !== 'None' && t.repeat !== '';

    // Tentukan tanggal-tanggal yang perlu dijadwalkan
    var datesToSchedule = [];

    if(isRepeat){
      // Repeat task: jadwalkan hari ini dan 6 hari ke depan
      for(var d=0; d<7; d++){
        var dd = new Date(now);
        dd.setDate(dd.getDate() + d);
        var ds = dd.getFullYear()+'-'+String(dd.getMonth()+1).padStart(2,'0')+'-'+String(dd.getDate()).padStart(2,'0');
        datesToSchedule.push(ds);
      }
    } else {
      // Non-repeat: pakai due date jika ada dan tidak lewat, kalau tidak pakai hari ini
      var base = (t.due && t.due >= todayDateStr) ? t.due : todayDateStr;
      datesToSchedule.push(base);
    }

    datesToSchedule.forEach(function(dateStr){
      var remind = new Date(dateStr + 'T' + timeStr + ':00');
      var diff = remind - now;
      var taskName = t.name;
      var taskId = t.id;
      var dueDateLabel = (dateStr !== todayDateStr) ? ' (' + dateStr + ')' : '';

      // ── Notifikasi utama (tepat waktu) ──
      if(diff > 0 && diff < maxFuture){
        var tag = 'chitask-rem-' + taskId + '-' + dateStr;
        (function(tn, ti, tg, dl, df){
          var timer = setTimeout(function(){
            var stillActive = tasks.some(function(x){ return x.id === ti && !x.done; });
            if(!stillActive) return;
            _fireNotification('ChiTask \u23F0 Waktunya!', '\u23f0 ' + tn + dl + ' — Sekarang!', tg, ti);
          }, df);
          reminderTimers.push(timer);
        })(taskName, taskId, tag, dueDateLabel, diff);
        // ── FCM: simpan ke Firestore agar push tetap terkirim meski tab tutup ──
        if (fbUser && diff > 0) {
          _fcmSaveReminder(fbUser.uid, taskId, taskName + dueDateLabel, remind.getTime());
        }
      }

      // ── Early reminder notifications: 2 jam, 1 jam, 30 menit sebelum ──
      var earlySlots = [
        { ms: 2*60*60*1000, label: '2 jam lagi' },
        { ms: 60*60*1000,   label: '1 jam lagi' },
        { ms: 30*60*1000,   label: '30 menit lagi' }
      ];
      earlySlots.forEach(function(slot){
        var earlyDiff = diff - slot.ms;
        if(earlyDiff > 0 && earlyDiff < maxFuture){
          var earlyTag = 'chitask-early-' + taskId + '-' + dateStr + '-' + slot.ms;
          (function(tn, ti, et, el, dl, ed){
            var timer = setTimeout(function(){
              var stillActive = tasks.some(function(x){ return x.id === ti && !x.done; });
              if(!stillActive) return;
              _fireNotification(
                'ChiTask \u23F0 ' + el,
                tn + dl + ' dimulai dalam ' + el,
                et, ti
              );
            }, ed);
            reminderTimers.push(timer);
          })(taskName, taskId, earlyTag, slot.label, dueDateLabel, earlyDiff);
        }
      });
    });
  });
}

// ── Reschedule otomatis saat tab kembali visible (misal user buka tab lagi) ──
(function _initVisibilityReschedule(){
  document.addEventListener('visibilitychange', function(){
    if(document.visibilityState === 'visible'){
      // Delay sedikit agar state app sudah ready
      setTimeout(function(){
        if(typeof scheduleReminders === 'function') scheduleReminders();
      }, 500);
    }
  });
  // Reschedule saat tab dapat focus kembali (fallback untuk browser tertentu)
  window.addEventListener('focus', function(){
    setTimeout(function(){
      if(typeof scheduleReminders === 'function') scheduleReminders();
    }, 500);
  });
})();

// ══════════════════════════════════════════════
// STREAK
// ══════════════════════════════════════════════
function calcStreak(t){
  if(!t.history||!t.history.length)return 0;
  var days=Math.max(1,getRepeatDays(t.repeat||'Harian'));
  var s=0;
  var d=new Date(today);
  // Helper: cek apakah titik jadwal ini adalah excluded day
  function isSkipPoint(dateObj){
    if(days>1)return false; // skip-day hanya relevan untuk habit harian
    var skip=getExceptDay(t.repeat||'Harian');
    return skip>=0&&dateObj.getDay()===skip;
  }
  // Mundur sampai titik jadwal yang tidak di-skip
  while(isSkipPoint(d))d.setDate(d.getDate()-1);
  // Cek apakah interval ini sudah ada di history; jika belum, mundur satu interval
  var winHalf=Math.floor((days-1)/2);
  function intervalDone(center){
    // Window simetris: cari history dalam rentang [center-(days-1), center+winHalf]
    // Ini menangkap check-in lebih awal (forward) maupun terlambat (backward)
    for(var w=-(days-1);w<=winHalf;w++){
      var check=new Date(center);check.setDate(check.getDate()+w);
      if(t.history.indexOf(localDateStr(check))>=0)return true;
    }
    return false;
  }
  if(!intervalDone(d))d.setDate(d.getDate()-days);
  for(var i=0;i<365;i++){
    // Lewati titik jadwal yang merupakan excluded day
    while(isSkipPoint(d))d.setDate(d.getDate()-1);
    if(intervalDone(d)){s++;d.setDate(d.getDate()-days);}else break;
  }
  return s;
}

// ══════════════════════════════════════════════
// INIT — dipanggil oleh Firebase auth setelah login
// ══════════════════════════════════════════════
function initApp(){
  // Guard: jangan init ulang kalau sudah pernah jalan (cegah double-init dari race condition)
  if (window._initAppRunning) {
    console.warn('[ChiTask] initApp() dipanggil saat masih running — diabaikan');
    return;
  }
  window._initAppRunning = true;
function init(){
  var saved=loadData();
  if(saved&&saved.tasks&&saved.tasks.length>0){
    // ── Migration v18: remove old default tasks (IDs 1–12 with known default names) ──
    var _defaultNames=['Minum air putih 8 gelas','Lari pagi 30 menit','Baca buku 20 menit',
      'Meditasi 10 menit','Push-up 50 kali','Jurnal harian','Sikat gigi malam',
      'Cek & balas email','Review mingguan','Meeting tim produk',
      'Bayar tagihan listrik','Belanja bulanan'];
    var _migrated=false;
    saved.tasks=saved.tasks.filter(function(t){
      if(t.id>=1&&t.id<=12&&_defaultNames.indexOf(t.name)!==-1){_migrated=true;return false;}
      return true;
    });
    if(_migrated){try{localStorage.setItem('chitask_v6_data',JSON.stringify(saved));}catch(e){}}
    // ────────────────────────────────────────────────────────────────────────────────
    tasks=saved.tasks;
    nextId=saved.nextId||(Math.max.apply(null,tasks.map(function(t){return t.id;}))+1);
    darkMode=saved.darkMode||false;
    groupOpenState=saved.groupOpenState||{};
    customGroups=saved.customGroups||[];
    customGroupIcons=saved.customGroupIcons||{};
    mydayGroupOrder=saved.mydayGroupOrder||[];
    xp=saved.xp||0;
    achievements=saved.achievements||[];
    totalDone=saved.totalDone||0;
    perfectDays=saved.perfectDays||0;
    totalSubtasks=saved.totalSubtasks||0;
    navSectionOpen=saved.navSectionOpen||{task:false,fin:false,maint:false,journal:false};
    finTransactions=saved.finTransactions||[];
    finWallets=saved.finWallets||JSON.parse(JSON.stringify(DEFAULT_WALLETS));
    finWishlist=saved.finWishlist||[];
    defaultShoppingWalletId=saved.defaultShoppingWalletId||'';
    finNextId=saved.finNextId||1;
    if(saved.finCategories)finCategories=saved.finCategories;
    maintItems=saved.maintItems||[];
    maintCategories=saved.maintCategories||JSON.parse(JSON.stringify(DEFAULT_MAINT_CATEGORIES));
    maintNextId=saved.maintNextId||1;
    finTagihan=saved.finTagihan||[];
    finHutang=saved.finHutang||[];
    if(saved.finBudgets)finBudgets=saved.finBudgets;
    journalEntries=saved.journalEntries||[];
    journalNextId=saved.journalNextId||1;
    goldBalance=saved.goldBalance||0;
    shopPurchases=saved.shopPurchases||[];
    shopCustomItems=saved.shopCustomItems||[];
    shopLoginDays=saved.shopLoginDays||[];
    shoppingItems=saved.shoppingItems||[];
    shoppingItemNextId=saved.shoppingItemNextId||1;
    // Migration: if old save had darkMode but no activeTheme, pick correct theme
    if(saved.activeTheme){
      activeTheme=saved.activeTheme;
    } else {
      activeTheme=(saved.darkMode)?'theme-dark':'theme-light';
    }
    activeEffect=saved.activeEffect||'';
    activeAvatarCard=saved.activeAvatarCard||null;
    tempThemeExpiry=saved.tempThemeExpiry||0;
    tempThemePrev=saved.tempThemePrev||'';
    // Restore onboarding flags
    if(saved.gamiOnbDone){ _gamiOnbDone=true; _gamiModeVal=saved.gamiModeVal||'focus'; try{localStorage.setItem('chitask_gamification_set','1'); localStorage.setItem('chitask_gamification_mode',_gamiModeVal);}catch(e){} }
    if(saved.tourDone){ _tourDone=true; try{localStorage.setItem('chitask_tour_done','1');}catch(e){} }
    if(saved.navModeDone){ _navModeDone=true; }
    // ── Purge item Lucky Amstow yang sudah melewati 14 hari ──
    // (harus setelah activeTheme & activeEffect di-load agar bisa cek & reset dengan benar)
    var _today = new Date().toISOString().slice(0,10);
    var _expiredLucky = shopPurchases.filter(function(p){ return p.source==='lucky' && p.expires && p.expires < _today; });
    if(_expiredLucky.length){
      shopPurchases = shopPurchases.filter(function(p){ return !(p.source==='lucky' && p.expires && p.expires < _today); });
      var _expiredIds = _expiredLucky.map(function(p){ return p.id; });
      if(_expiredIds.indexOf(activeTheme) !== -1){ activeTheme = tempThemePrev || 'theme-light'; }
      if(_expiredIds.indexOf(activeEffect) !== -1){ activeEffect = ''; }
      setTimeout(function(){
        saveData();
        showToast('⏰ Reward Lucky Amstow ('+_expiredLucky.length+' item) sudah kedaluwarsa dan dihapus.');
        if(typeof renderShop==='function') renderShop();
      }, 2000);
    }
    finSavingTarget=saved.finSavingTarget||0;
    weeklyReviewLastSeen=saved.weeklyReviewLastSeen||'';
    if(saved.charStatProgress)charStatProgress=saved.charStatProgress;
    if(saved.charStatLastActivity)charStatLastActivity=saved.charStatLastActivity;
    // ── Cek tema sementara dari boss reward ──
    if(tempThemeExpiry > 0){
      var now = Date.now();
      if(now < tempThemeExpiry){
        // Masih aktif — terapkan tema sementara dan set timer untuk sisa waktu
        // ✅ FIX: defer applyTheme ke requestAnimationFrame supaya semua CSS/script
        // sudah selesai load saat reload, menghindari layar putih kosong.
        (function(_activeTheme, _remaining, _minsLeft){
          requestAnimationFrame(function(){
            applyTheme(_activeTheme || 'theme-light');
          });
          if(_tempThemeTimer) clearTimeout(_tempThemeTimer);
          _tempThemeTimer = setTimeout(function(){
            _tempThemeTimer = null;
            activeTheme = tempThemePrev || 'theme-light';
            tempThemeExpiry = 0;
            tempThemePrev = '';
            applyTheme(activeTheme);
            saveData();
            showToast('⏰ Tema sementara habis, kembali ke tema sebelumnya');
          }, _remaining);
          setTimeout(function(){ showToast('🎨 Tema sementara masih aktif: '+_minsLeft+' menit lagi'); }, 1200);
        })(activeTheme, tempThemeExpiry - now, Math.ceil((tempThemeExpiry - now) / 60000));
      } else {
        // Sudah kedaluwarsa saat app ditutup — langsung restore
        activeTheme = tempThemePrev || 'theme-light';
        tempThemeExpiry = 0;
        tempThemePrev = '';
        // ✅ FIX: defer juga untuk konsistensi
        requestAnimationFrame(function(){
          applyTheme(activeTheme);
        });
        saveData();
      }
    } else {
      // ✅ FIX: defer applyTheme normal juga supaya CSS sudah siap
      requestAnimationFrame(function(){
        applyTheme(activeTheme || 'theme-light');
      });
    }
    applyEffect(activeEffect);
  } else {
    tasks=[];
    nextId=1;
    activeTheme='theme-light';
    applyTheme('theme-light');
    finWallets=JSON.parse(JSON.stringify(DEFAULT_WALLETS));
    finTransactions=[];
    finWishlist=[];
    finNextId=1;
    maintItems=[];
    maintCategories=JSON.parse(JSON.stringify(DEFAULT_MAINT_CATEGORIES));
    maintNextId=1;
    finTagihan=[];
    finHutang=[];
  }
  processRepeatReset();
  var days=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  var months=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  document.getElementById('todayLabel').textContent=days[today.getDay()]+', '+today.getDate()+' '+months[today.getMonth()];
  applyNavSections();
  refreshGroupSelects();
  buildColorPicker('colorPicker','chipColor',chipState,'color');
  updateXPBar();
  updateGoldDisplay();
  scheduleReminders();
  render();
  renderMaintCategoryNav();
  setupPWA();
  updateBottomNav();
  updateOnlineIndicator();
  updateMobileBackBtn();
  checkWeeklyReviewPopup();
  // ── Username onboarding: tampilkan prompt jika belum ada charUsername ──
  // Hanya tampil jika user sudah pilih mode 'gamer' (fitur karakter/petualang adalah gamer-only)
  if (!getCharUsername()) {
    (function _waitGamiForUsername() {
      // Kalau gami mode belum dipilih, polling sampai selesai
      if (typeof isGamificationModeSet === 'function' && !isGamificationModeSet()) {
        setTimeout(_waitGamiForUsername, 300);
        return;
      }
      // Gami mode sudah dipilih — hanya tampilkan kalau mode 'gamer'
      if (typeof loadGamificationMode === 'function' && loadGamificationMode() === 'gamer') {
        // Tunggu sampai onboarding flow selesai (nav+gami), baru tampilkan nama petualang
        // Guard: hanya boleh ada satu instance polling ini
        if (window._waitOnbForUsernameRunning) return;
        window._waitOnbForUsernameRunning = true;
        (function _waitOnbForUsername(){
          if(!window._onboardingFlowDone){
            setTimeout(_waitOnbForUsername, 200);
            return;
          }
          window._waitOnbForUsernameRunning = false;
          if(typeof showUsernameOnboardingPrompt === 'function') showUsernameOnboardingPrompt();
        })();
      }
    })();
  }
  // FIX #3: annStartListener dipanggil di sini (bukan di onAuthStateChanged)
  // agar fbDb sudah pasti siap dan data sudah dimuat sebelum listener jalan.
  // Berlaku untuk user Google maupun Guest (FIX #5).
  annStartListener();

  // ── Google Calendar: auto-init via Worker jika pernah connect ──
  if (!_offlineMode && fbUser && !fbUser._isGuest) {
    setTimeout(function(){ _gcalInitForUser(fbUser); }, 800);
  }

  // Dismiss splash screen
  var splash=document.getElementById('chitask-splash');
  if(splash){
    setTimeout(function(){
      splash.style.opacity='0';
      splash.style.transform='scale(1.04)';
      setTimeout(function(){
        splash.style.display='none';
        window._splashDismissed=true;
      },520);
    },1500);
  } else {
    window._splashDismissed=true;
  }

  setInterval(function(){
    var n=new Date();n.setHours(0,0,0,0);
    if(localDateStr(n)!==todayStr){saveData();location.reload();}
    // Refresh card pengingat waktu di My Day setiap menit
    if(currentView==='myday'){render();}
  },60000);

  // FIX: Periodic silent GCal token refresh tiap 45 menit
  // Mencegah token expired saat user tidak logout & app terbuka lama
  setInterval(function(){
    if(!_offlineMode && fbUser && !fbUser._isGuest && localStorage.getItem('chitask_gcal_connected')){
      gcalGetToken();
    }
  }, 45 * 60 * 1000);

  // ── Tandai app sudah siap: baru boleh push ke Firestore setelah ini ──
  _appReady = true;

  // FIX Bug 3: Di mobile, browser sering suspend tab sehingga setInterval tidak jalan.
  // visibilitychange memastikan repeat di-check ulang saat app dibuka dari background.
  document.addEventListener('visibilitychange',function(){
    if(document.visibilityState==='visible'){
      var n=new Date();n.setHours(0,0,0,0);
      if(localDateStr(n)!==todayStr){
        saveData();location.reload();
      } else {
        processRepeatReset();
        render();
        // FIX: Refresh GCal token saat kembali dari background (mobile suspend)
        if(!_offlineMode && fbUser && !fbUser._isGuest && localStorage.getItem('chitask_gcal_connected')){
          gcalGetToken().then(function(token){
            if(token) gcalFetchMonth(calendarYear, calendarMonth);
          });
        }
      }
    }
  });
} // end inner init()
  init();
  // Catat login hari ini saat app dibuka (bukan hanya saat buka shop)
  if(typeof _shopRecordLoginToday === 'function') _shopRecordLoginToday();
  // Reset flag setelah selesai, agar bisa re-init saat reload halaman
  window._initAppRunning = false;
} // end initApp()



// ══════════════════════════════════════════════
// COLOR PICKER
// ══════════════════════════════════════════════
function buildColorPicker(containerId, selectedId, stateObj, stateKey){
  var wrap=document.getElementById(containerId);if(!wrap)return;
  wrap.innerHTML='';
  COLORS.forEach(function(c){
    var dot=document.createElement('div');
    dot.className='color-dot'+(stateObj[stateKey]===c?' selected':'');
    dot.style.background=c||'#e7e5e4';
    dot.style.border='2px solid '+(stateObj[stateKey]===c?'var(--text)':'transparent');
    dot.title=COLOR_NAMES[c]||'Tanpa';
    dot.onclick=function(){
      stateObj[stateKey]=c;
      wrap.querySelectorAll('.color-dot').forEach(function(d){
        var dc=d.style.background;
        var match=dc===(c||'rgb(231, 229, 228)')||dc===(c||'#e7e5e4');
        d.style.border='2px solid '+(match?'var(--text)':'transparent');
        d.classList.toggle('selected',match);
      });
      if(selectedTask)liveDetail();
    };
    wrap.appendChild(dot);
  });
}
function buildDetailColorPicker(){
  var wrap=document.getElementById('det-color-picker');if(!wrap||!selectedTask)return;
  wrap.innerHTML='';
  var cur=selectedTask.color||'';
  COLORS.forEach(function(c){
    var dot=document.createElement('div');
    dot.className='color-dot'+(cur===c?' selected':'');
    dot.style.background=c||'#e7e5e4';
    dot.style.border='2px solid '+(cur===c?'var(--text)':'transparent');
    dot.style.width='20px';dot.style.height='20px';
    dot.title=COLOR_NAMES[c]||'Tanpa';
    dot.onclick=function(){
      selectedTask.color=c;
      wrap.querySelectorAll('.color-dot').forEach(function(d){
        d.style.border='2px solid transparent';d.classList.remove('selected');
      });
      dot.style.border='2px solid var(--text)';dot.classList.add('selected');
      saveData(true);render();
    };
    wrap.appendChild(dot);
  });
}

// ══════════════════════════════════════════════
// FILTER
// ══════════════════════════════════════════════

// Helper: apakah task dianggap "selesai" secara efektif?
// - Task biasa: t.done === true
// - Habit/Task repeat: t.done ATAU ada entry di t.history (karena setelah repeat
//   reschedule, t.done di-reset ke false tapi history tanggal tetap tercatat)
// - Task dengan steps: stepsDone >= steps (tapi setelah reset stepsDone=0, tidak done lagi)
function isEffectiveDone(t){
  // Task selesai biasa
  if(t.done) return true;
  // Task repeat yang sudah selesai hari ini (history hari ini ada)
  if(t.history && t.history.indexOf(todayStr) >= 0) return true;
  return false;
}

// Helper: apakah task selesai UNTUK HARI INI atau due-date-nya (untuk filter per-tab)
function isDoneForDate(t, dateStr){
  if(t.done&&(t.doneDate===dateStr||!t.doneDate))return true;
  if(t.history&&t.history.indexOf(dateStr)>=0)return true;
  return false;
}

function getFiltered(){
  switch(currentView){
    case 'myday': {
      // Tampilkan: (1) due hari ini, (2) tidak ada due, (3) sudah selesai hari ini (history)
      var mdAll = tasks.filter(function(t){
        if(t.due && t.due > todayStr && !t._nextDue) return false; // future task tanpa _nextDue
        var dueToday = !t.due || t.due === todayStr;
        var doneToday = t.history && t.history.indexOf(todayStr) >= 0;
        var hasDueToday = t.due && t.due <= todayStr;
        return dueToday || doneToday || hasDueToday;
      });
      // Pending dulu, lalu selesai
      var mdPending = mdAll.filter(function(t){ return !isEffectiveDone(t); });
      var mdDone    = mdAll.filter(function(t){ return isEffectiveDone(t); });
      return mdPending.concat(mdDone);
    }
    case 'important': return tasks.filter(function(t){
      if(!t.important)return false;
      var hd=t.due&&t.due<todayStr?t.due:todayStr;
      return !isDoneForDate(t,hd);
    }).concat(tasks.filter(function(t){
      if(!t.important)return false;
      var hd=t.due&&t.due<todayStr?t.due:todayStr;
      return isDoneForDate(t,hd);
    }));
    case 'planned':   return tasks.filter(function(t){
      // Task selesai hari ini dengan _nextDue → tampil di terjadwal sebagai next cycle
      if(t._nextDue && t.done) return true;
      if(!t.due)return false;
      // Task future: tampilkan selama belum done
      if(t.due>todayStr)return !t.done;
      // Task hari ini atau overdue: tampilkan jika belum done
      return !t.done&&!isDoneForDate(t,t.due);
    }).sort(function(a,b){
      var da = a._nextDue||a.due||''; var db = b._nextDue||b.due||'';
      return da.localeCompare(db);
    });
    case 'all':       return tasks.slice().sort(function(a,b){
      return isEffectiveDone(a)-isEffectiveDone(b);
    });
    case 'completed': return tasks.filter(function(t){
      // Hanya task yang selesai HARI INI (kemarin/lalu hanya di kalender)
      if(t.done) return t.doneDate===todayStr||!t.doneDate;
      // Habit/repeat: selesai hari ini jika history punya todayStr
      if(t.history&&t.history.indexOf(todayStr)>=0) return true;
      return false;
    });
    case 'habits':    return tasks.filter(function(t){return t.type==='Habit';});
    default:          return tasks;
  }
}

// ══════════════════════════════════════════════
// RENDER MAIN
// ══════════════════════════════════════════════

// ── Helper: render grup terjadwal dengan collapsible ──
var _plannedGroupOpen = {overdue:true, today:true, upcoming:true};
function togglePlannedGroup(key){
  _plannedGroupOpen[key] = !_plannedGroupOpen[key];
  renderMain();
}
function renderPlannedGroup(key, list, label, color, defaultOpen){
  if(!list.length) return '';
  var open = (_plannedGroupOpen[key] !== undefined) ? _plannedGroupOpen[key] : defaultOpen;
  var arrow = open ? '\u25be' : '\u25b8';
  var mt = (key==='overdue') ? '' : 'margin-top:14px;';
  var hdr = '<div class="section-hdr" style="'+mt+'cursor:pointer;user-select:none" onclick="togglePlannedGroup(this.dataset.key)" data-key="'+key+'"><span style="color:'+color+'">'+arrow+' '+label+' ('+list.length+')</span></div>';
  if(!open) return hdr;
  var cards = '';
  list.forEach(function(t){ cards += taskCard(t); });
  return hdr + cards;
}

function render(){updateCounts();updateMaintCount();renderMain();renderHabitPanel();updateGoldDisplay();}

function updateCounts(){
  document.getElementById('cnt-myday').textContent=tasks.filter(function(t){
    // Hitung task aktif (belum selesai) yang due hari ini atau tidak ada due
    if(t.done || (t.history && t.history.indexOf(todayStr)>=0)) return false; // sudah selesai
    if(t.due && t.due > todayStr) return false; // future
    if(t.steps && t.steps>=2 && t.stepsDone>=t.steps) return false;
    return !t.due || t.due === todayStr;
  }).length;
  document.getElementById('cnt-important').textContent=tasks.filter(function(t){return t.important&&!t.done;}).length;
  document.getElementById('cnt-planned').textContent=tasks.filter(function(t){
    // Sama persis dengan logic render: pending + _nextDue tasks
    if(t._nextDue && t.done) return true;              // repeat selesai, next cycle pending
    if(!t.due) return false;                            // tanpa due tidak masuk terjadwal
    if(isEffectiveDone(t)) return false;               // sudah selesai, jangan hitung
    if(t.due > todayStr) return true;                  // future
    return !isDoneForDate(t, t.due);                   // hari ini atau overdue yang belum selesai
  }).length;
  document.getElementById('cnt-completed').textContent=tasks.filter(function(t){
    if(t.done) return t.doneDate===todayStr||!t.doneDate;
    if(t.history&&t.history.indexOf(todayStr)>=0) return true;
    return false;
  }).length;
  // Tagihan due soon (within 7 days or overdue)
  var now=new Date();now.setHours(0,0,0,0);
  var tagihanDue=finTagihan.filter(function(t){if(t.status==='paid')return false;var d=getTagihanNextDue(t);if(!d)return false;var diff=Math.round((new Date(d+'T00:00:00')-now)/86400000);return diff<=7;}).length;
  var cntT=document.getElementById('cnt-tagihan');if(cntT){cntT.textContent=tagihanDue;cntT.style.display=tagihanDue?'':'none';}
  // Hutang active count
  var hutangActive=finHutang.filter(function(h){return getSisaHutang(h)>0;}).length;
  var cntH=document.getElementById('cnt-hutang');if(cntH){cntH.textContent=hutangActive;cntH.style.display=hutangActive?'':'none';}
  updateBudgetOverBadge();
}

var FIN_VIEWS=['fin-overview','fin-cashflow','fin-transactions','fin-wallets','fin-wishlist','fin-tagihan','fin-hutang','fin-categories','fin-budget'];
var MAINT_VIEWS=['maint-overview','maint-all','maint-log','maint-categories','maint-category'];
var JOURNAL_VIEWS=['journal-today','journal-all','journal-search'];
function isFinView(v){return FIN_VIEWS.indexOf(v)>=0;}
function isMaintView(v){return MAINT_VIEWS.indexOf(v)>=0||v.startsWith('maint-cat-');}
function isJournalView(v){return JOURNAL_VIEWS.indexOf(v)>=0;}

function renderMain(){
  // FIX: Jangan re-render DOM saat ada input/textarea yang sedang fokus
  // (mencegah keyboard mobile tutup sendiri saat resize dipicu keyboard muncul)
  var _focused=document.activeElement;
  if(_focused&&(_focused.tagName==='INPUT'||_focused.tagName==='TEXTAREA')&&document.body.contains(_focused)){return;}
  var el=document.getElementById('taskScroll');
  var fw=document.getElementById('finWrap');
  var titles={
    dashboard:t('title_dashboard'),myday:t('title_myday'),important:t('title_important'),
    planned:t('title_planned'),habits:t('title_habits'),'habit-analisa':'🧠 Analisa Habit',all:t('title_all'),
    completed:t('title_completed'),achievements:t('title_achievements'),calendar:t('title_calendar'),'unified-calendar':t('title_calendar'),
    'task-groups':'🗂️ Kelola Grup',
    'fin-overview':t('title_fin_overview'),'fin-cashflow':t('title_fin_cashflow'),
    'fin-transactions':t('title_fin_transactions'),'fin-wallets':t('title_fin_wallets'),
    'fin-wishlist':t('title_fin_wishlist'),'fin-tagihan':t('title_fin_tagihan'),
    'fin-hutang':t('title_fin_hutang'),'fin-categories':t('title_fin_categories'),
    'fin-budget':t('title_fin_budget'),
    'maint-overview':t('title_maint_overview'),'maint-all':t('title_maint_all'),
    'maint-log':t('title_maint_log'),'maint-categories':t('title_maint_categories'),
    'journal-today':t('title_journal_today'),'journal-calendar':t('title_journal_calendar'),
    'journal-all':t('title_journal_all'),'journal-search':t('title_journal_search')
  };
  var subs={
    dashboard:t('sub_dashboard'),
    myday:t('sub_myday')+' — '+new Date().toLocaleDateString(getLang()==='en'?'en-US':'id-ID',{weekday:'long',day:'numeric',month:'long'}),
    important:t('sub_important'),planned:t('sub_planned'),habits:t('sub_habits'),'habit-analisa':'Laporan & saran cerdas untuk habitual kamu',
    all:t('sub_all'),completed:t('sub_completed'),achievements:t('sub_achievements'),
    calendar:t('sub_calendar'),'unified-calendar':'Task · Jurnal · Google Calendar',
    'task-groups':'Buat dan atur grup kustom untuk task kamu',
    'fin-overview':t('sub_fin_overview'),'fin-cashflow':t('sub_fin_cashflow'),
    'fin-transactions':t('sub_fin_transactions'),'fin-wallets':t('sub_fin_wallets'),
    'fin-wishlist':t('sub_fin_wishlist'),'fin-tagihan':t('sub_fin_tagihan'),
    'fin-hutang':t('sub_fin_hutang'),'fin-categories':t('sub_fin_categories'),
    'fin-budget':t('sub_fin_budget'),
    'maint-overview':t('sub_maint_overview'),'maint-all':t('sub_maint_all'),
    'maint-log':t('sub_maint_log'),'maint-categories':t('sub_maint_categories'),
    'journal-today':t('sub_journal_today'),'journal-calendar':t('sub_journal_calendar'),
    'journal-all':t('sub_journal_all'),'journal-search':t('sub_journal_search')
  };

  // Handle dynamic category views
  var viewTitle=titles[currentView]||'ChiTask';
  var viewSub=subs[currentView]||'';
  if(currentView.startsWith('maint-cat-')){
    var catId=currentView.replace('maint-cat-','');
    var cat=maintCategories.filter(function(c){return c.id===catId;})[0];
    if(cat){viewTitle=cat.icon+' '+cat.name;viewSub='Item maintenance untuk '+cat.name;}
  }
  document.getElementById('pageTitle').textContent=viewTitle;
  window._lastViewTitle=currentView;
  // Update subtitle text without overwriting child elements (online indicator)
  var subEl=document.getElementById('pageSubtitle');
  // Remove old text nodes, keep child elements
  Array.from(subEl.childNodes).forEach(function(n){if(n.nodeType===3)subEl.removeChild(n);});
  if(viewSub){var tn=document.createTextNode(viewSub);subEl.insertBefore(tn,subEl.firstChild);}
  updateMobileBackBtn();
  updateOnlineIndicator();

  var isFin=isFinView(currentView);
  var isMaint=isMaintView(currentView);
  var isJournal=isJournalView(currentView);
  var hideAdd=['completed','habits','habit-analisa','stats','achievements','calendar','unified-calendar','dashboard','task-groups'].concat(FIN_VIEWS).concat(MAINT_VIEWS).concat(JOURNAL_VIEWS);
  if(currentView.startsWith('maint-cat-'))hideAdd.push(currentView);
  var shouldShowAdd=hideAdd.indexOf(currentView)<0;
  document.getElementById('addBar').style.display=shouldShowAdd?'flex':'none';
  // Control FAB — mobile only, shown on ALL views
  var fab=document.getElementById('fabAdd');
  var fabIc=document.getElementById('fabAddIc');
  if(fab&&isMobile()){
    fab.style.display='flex';
    // Warna & aksi berdasarkan konteks view
    var fabBg,fabShadow,fabIcon,fabAction;
    if(isFin){
      // Keuangan — biru
      fabBg='linear-gradient(135deg,#3b82f6,#60a5fa)';
      fabShadow='0 4px 18px rgba(59,130,246,0.5)';
      fabIcon='\uff0b';
      if(currentView==='fin-wishlist'){
        fabAction=function(){document.getElementById('wish-name')&&document.getElementById('wish-name').focus();var el=document.getElementById('wishlist-form-area');if(el)el.scrollIntoView({behavior:'smooth'});};
      } else if(currentView==='fin-tagihan'){
        fabAction=function(){var el=document.getElementById('tagihan-form');if(el){el.style.display='flex';el.scrollIntoView({behavior:'smooth'});}else{if(!mobileAddBarOpen)openMobileFinAddBar();}};
      } else if(currentView==='fin-hutang'){
        fabAction=function(){var el=document.getElementById('hutang-form');if(el){el.style.display='flex';el.scrollIntoView({behavior:'smooth'});}else{if(!mobileAddBarOpen)openMobileFinAddBar();}};
      } else {
        fabAction=function(){if(!mobileAddBarOpen)openMobileFinAddBar();else closeMobileFinAddBar();};
      }
    } else if(isMaint||currentView.startsWith('maint-cat-')){
      // Maintenance — ungu
      fabBg='linear-gradient(135deg,#8b5cf6,#a78bfa)';
      fabShadow='0 4px 18px rgba(139,92,246,0.5)';
      fabIcon='\uff0b';
      fabAction=function(){if(!mobileAddBarOpen)openMobileMaintAddBar();else closeMobileMaintAddBar();};
    } else if(isJournal){
      // Jurnal — ungu gelap
      fabBg='linear-gradient(135deg,#8b5cf6,#7c3aed)';
      fabShadow='0 4px 18px rgba(139,92,246,0.5)';
      fabIcon='\u270d\ufe0f';
      fabAction=function(){openJournalModal(todayStr);};
    } else if(currentView==='dashboard'){
      // Dashboard → tambah task
      fabBg='linear-gradient(135deg,var(--accent),#fbbf24)';
      fabShadow='0 4px 18px rgba(217,119,6,0.5)';
      fabIcon='\uff0b';
      fabAction=function(){switchView('myday');setTimeout(function(){toggleMobileAddBar();},100);};
    } else if(currentView==='habits'){
      // Habits → buka add bar dengan chip Habit aktif
      fabBg='linear-gradient(135deg,var(--accent),#fbbf24)';
      fabShadow='0 4px 18px rgba(217,119,6,0.5)';
      fabIcon='\uff0b';
      fabAction=function(){
        openMobileAddBar();
        setTimeout(function(){var c=document.getElementById('mchip-habit');if(c&&!c.classList.contains('active'))c.click();},120);
      };
    } else if(currentView==='calendar'||currentView==='unified-calendar'){
      // Kalender → tambah task di tanggal terpilih
      fabBg='linear-gradient(135deg,var(--accent),#fbbf24)';
      fabShadow='0 4px 18px rgba(217,119,6,0.5)';
      fabIcon='\uff0b';
      fabAction=function(){openCalModal(calSelectedDate||todayStr);};
    } else if(currentView==='achievements'||currentView==='completed'){
      // Stats / Achievements / Completed → tetap ada FAB, arahkan ke tambah task
      fabBg='linear-gradient(135deg,var(--accent),#fbbf24)';
      fabShadow='0 4px 18px rgba(217,119,6,0.5)';
      fabIcon='\uff0b';
      fabAction=function(){switchView('myday');setTimeout(function(){toggleMobileAddBar();},100);};
    } else {
      // Task views (myday, planned, important, all, dll)
      fabBg='linear-gradient(135deg,var(--accent),#fbbf24)';
      fabShadow='0 4px 18px rgba(217,119,6,0.5)';
      fabIcon='\uff0b';
      fabAction=function(){toggleMobileAddBar();};
    }
    fab.style.background=fabBg;
    fab.style.boxShadow=fabShadow;
    if(fabIc)fabIc.textContent=fabIcon;
    fab.onclick=fabAction;
    // In sidebar mode, hide FAB entirely (SQA bar is used instead)
    if(_isSidebarMode()) fab.style.display='none';
  } else if(fab){
    fab.style.display='none';
  }
  // Show/hide sidebar quick-add bar
  if(typeof updateSidebarQuickAdd==='function') updateSidebarQuickAdd();
  var isMob=window.innerWidth<=700;
  // habitPanel display managed by renderHabitPanel()

  if(isMaint||currentView.startsWith('maint-cat-')){
    el.style.display='none';fw.style.display='flex';fw.style.flexDirection='column';
    renderMaintView(fw);return;
  }
  if(isFin){
    el.style.display='none';
    fw.style.cssText='flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden';
    renderFinView(fw);return;
  }
  if(isJournal){
    el.style.display='';fw.style.display='none';
    renderJournalView(el);return;
  }
  el.style.display='';fw.style.display='none';

  if(currentView==='dashboard'){renderDashboard(el);return;}
  if(currentView==='habits'){renderHabitFull(el);return;}
  if(currentView==='habit-analisa'){renderHabitAnalisa(el);return;}
  if(currentView==='stats'){currentView='dashboard';renderDashboard(el);return;}
  if(currentView==='achievements'){renderAchievements(el);return;}
  if(currentView==='calendar'){renderCalendar(el);return;}
  if(currentView==='unified-calendar'){renderUnifiedCalendar(el);return;}
  if(currentView==='task-groups'){renderGroupManager(el);return;}

  var list=getFiltered();

  // My Day: render per grup pakai accordion seperti habit tracker
  // Badge hanya hitung task AKTIF. Task selesai tetap muncul tapi tidak dihitung di badge.
  // Task repeat tetap tersimpan (myday=true) — processRepeatReset reset besok.
  if(currentView==='myday'){
    // FIX: Kumpulkan task overdue (due < hari ini, belum selesai, bukan habit) meski myday=false
// Helper: cek apakah habit scheduled untuk suatu tanggal (sama logika dgn isHabitDueToday tapi paramnya dateStr)
function isHabitDueOnDate(t, dateStr){
  if(t.type!=='Habit')return false;
  var skipDay=getExceptDay(t.repeat||'Harian');
  if(skipDay>=0&&new Date(dateStr+'T00:00:00').getDay()===skipDay)return false;
  var days=getRepeatDays(t.repeat||'Harian');
  var anchor=t.due;
  if(!anchor&&t.history&&t.history.length) anchor=t.history.slice().sort()[0];
  if(!anchor) anchor=dateStr;
  var anchorD=new Date(anchor+'T00:00:00');
  var checkD=new Date(dateStr+'T00:00:00');
  var diff=Math.round((checkD-anchorD)/86400000);
  if(diff<0)return false;
  return days<=1||diff%days===0;
}

// Cari habit overdue: myday=true, belum done hari itu (tidak ada di history), scheduled untuk hari tsb
var overdueHabits=tasks.filter(function(t){
  if(t.type!=='Habit'||!t.myday)return false;
  if(isEffectiveDone(t))return false; // sudah selesai hari ini
  // Cek 7 hari ke belakang apakah ada hari yang terlewat
  for(var i=1;i<=7;i++){
    var d=new Date(today); d.setDate(d.getDate()-i);
    var ds=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    if(isHabitDueOnDate(t,ds)&&(!t.history||t.history.indexOf(ds)<0)){
      return true; // ada hari yang terlewat
    }
  }
  return false;
});

var overdueTasks=tasks.filter(function(t){
  if(t.done||t.myday)return false;
  if(!t.due||t.due>=todayStr)return false;
  if(t.type==='Habit')return false;
  if(isEffectiveDone(t))return false;
  return true;
}).concat(overdueHabits);
    var mydayTasks=tasks.filter(function(t){
      if(t.due&&t.due>todayStr)return false;
      if(!t.myday&&t.due!==todayStr)return false;
      if(t.type==='Habit')return isHabitDueToday(t);
      return true;
    });

    if(!mydayTasks.length){
      el.innerHTML='<div class="empty"><div class="empty-icon">☀️</div>Tidak ada task hari ini.<br>Tambah task baru di atas! 🎉</div>';
      return;
    }

    // Kelompokkan semua task myday per grup (aktif + selesai)
    var groups={};
    mydayTasks.forEach(function(t){var g=t.group||'';if(!groups[g])groups[g]=[];groups[g].push(t);});
    // Masukkan overdue tasks sebagai grup '__overdue__' di dalam groups
    var OVERDUE_KEY='__overdue__';
    if(overdueTasks.length){
      overdueTasks.sort(function(a,b){return a.due.localeCompare(b.due);});
      groups[OVERDUE_KEY]=overdueTasks;
    }
    // Susun urutan grup: gunakan mydayGroupOrder sbg urutan dasar, sisipkan grup baru yg belum ada
    var defaultOrder=getGroupOrder().filter(function(g){return groups[g]&&groups[g].length;});
    if(groups['']&&groups[''].length&&defaultOrder.indexOf('')<0)defaultOrder.push('');
    defaultOrder.forEach(function(g){if(mydayGroupOrder.indexOf(g)<0)mydayGroupOrder.push(g);});
    // Masukkan OVERDUE_KEY ke mydayGroupOrder jika belum ada (agar posisi drag bisa tersimpan)
    if(groups[OVERDUE_KEY]&&mydayGroupOrder.indexOf(OVERDUE_KEY)<0)mydayGroupOrder.push(OVERDUE_KEY);
    var orderedGrps=mydayGroupOrder.filter(function(g){return groups[g]&&groups[g].length;});

    var html=getUpcomingTaskReminderHTML()+getJournalMyDayBannerHTML()+getTagihanMyDayHTML()+getMaintMyDayHTML();
    orderedGrps.forEach(function(g){
      var gTasks=groups[g];
      var pending=gTasks.filter(function(t){return!isEffectiveDone(t)&&!(t.steps&&t.steps>=2&&t.stepsDone>=t.steps);});
      var done=gTasks.filter(function(t){return isEffectiveDone(t)||(t.steps&&t.steps>=2&&t.stepsDone>=t.steps);});
      if(!pending.length)return;
      var isOverdue=(g===OVERDUE_KEY);
      var gKey=isOverdue?'md_overdue':('md_'+g);
      if(!(gKey in groupOpenState))groupOpenState[gKey]=true;
      var isOpen=groupOpenState[gKey];
      var label=isOverdue?'\u26a0\ufe0f Terlambat':(g?(getGroupIcon(g)+' '+g):'📁 Tanpa Grup');
      var badge='<span class="group-badge"'+(isOverdue?' style="background:#dc2626"':'')+'>'+pending.length+'</span>';
      var gSafe=isOverdue?'__overdue__':(g.replace(/\\/g,'\\\\').replace(/'/g,"\\'"));

      // Estimasi saldo wallet untuk grup Belanja
      var estimasiHtml='';
      if(g==='Belanja'){
        var shopItems=gTasks.filter(function(t){return t.isShopping&&t.price;});
        if(shopItems.length){
          var walletTotals={};
          var noWalletPlanned=0, noWalletSpent=0;
          shopItems.forEach(function(t){
            // Pakai walletId apa adanya — jangan fallback ke default
            var wid = t.walletId || '';
            if(!wid){
              if(t.done) noWalletSpent+=t.price;
              else noWalletPlanned+=t.price;
            } else {
              if(!walletTotals[wid]) walletTotals[wid]={spent:0,planned:0};
              if(t.done) walletTotals[wid].spent+=t.price;
              else walletTotals[wid].planned+=t.price;
            }
          });
          // Hanya tampilkan card wallet yang punya item pending (planned > 0)
          var walletKeys=Object.keys(walletTotals).filter(function(wid){return walletTotals[wid].planned>0;});
          var hasAnyCard = walletKeys.length > 0 || noWalletPlanned > 0;
          if(hasAnyCard){
            estimasiHtml='<div style="margin:0 0 8px;display:flex;flex-direction:column;gap:5px">';
            walletKeys.forEach(function(wid){
              var w=getWalletById(wid);
              if(!w)return;
              var info=walletTotals[wid];
              var sisa=w.balance-info.planned;
              var sisaColor=sisa<0?'#dc2626':'#16a34a';
              estimasiHtml+='<div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:8px 10px;font-size:12px">'
                +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">'
                +'<span style="font-weight:700;color:var(--text)">'+w.icon+' '+w.name+'</span>'
                +'<span style="color:var(--muted);font-size:11px">Saldo: <b style="color:var(--text)">'+fmtRp(w.balance)+'</b></span>'
                +'</div>'
                +'<div style="display:flex;align-items:center;justify-content:space-between">'
                +'<span style="color:var(--muted)">Estimasi belanja: <b style="color:#d97706">'+fmtRp(info.planned)+'</b></span>'
                +'<span style="font-weight:700;color:'+sisaColor+'">Sisa ≈ '+fmtRp(sisa)+'</span>'
                +'</div>'
                +(sisa<0?'<div style="font-size:10px;color:#dc2626;margin-top:3px">⚠️ Saldo tidak cukup untuk semua item</div>':'')
                +'</div>';
            });
            if(noWalletPlanned>0){
              estimasiHtml+='<div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:8px 10px;font-size:12px">'
                +'<span style="font-weight:700;color:var(--text)">👜 Tanpa Wallet</span>'
                +'<div style="color:var(--muted);margin-top:4px">Estimasi belanja: <b style="color:#d97706">'+fmtRp(noWalletPlanned)+'</b></div>'
                +'</div>';
            }
            estimasiHtml+='</div>';
          }
        }
      }

      var accordionExtra=isOverdue?' style="border-color:#fca5a5"':'';
      var headerExtra=isOverdue?' style="display:flex;align-items:center;gap:0;background:#fff1f2"':' style="display:flex;align-items:center;gap:0"';
      var labelExtra=isOverdue?' style="flex:1;color:#dc2626"':' style="flex:1"';
      html+='<div class="group-accordion myday-drag-grp" draggable="true" data-grp="'+(isOverdue?'__overdue__':g.replace(/"/g,'&quot;'))+'"'
        +accordionExtra
        +' ondragstart="mdGrpDragStart(event,this)" ondragend="mdGrpDragEnd(event,this)"'
        +' ondragover="mdGrpDragOver(event)" ondragleave="mdGrpDragLeave(event)" ondrop="mdGrpDrop(event,this)">'
        +'<div class="group-header" onclick="toggleGroup(\''+gKey+'\')"'+headerExtra+'>'
        +'<span class="myday-drag-handle" onclick="event.stopPropagation()" title="Drag untuk ubah urutan">⠿</span>'
        +'<div class="group-header-left"'+labelExtra+'>'+label+badge+'</div>'
        +'<span class="group-chevron'+(isOpen?' open':'')+'">▼</span>'
        +'</div>'
        +'<div class="group-body'+(isOpen?' open':'')+'"><div style="padding:6px 8px 8px">'
        +estimasiHtml;
      pending.forEach(function(t){html+=taskCard(t);});
      html+='</div></div></div>';
    });
    el.innerHTML=html||'<div class="empty"><div class="empty-icon">🎉</div>Semua task hari ini selesai!<br><span style="font-size:12px">Keren banget, pertahankan! 🔥</span></div>';
    return;
  }

  if(!list.length){
    var msgs={myday:'Tidak ada task hari ini.\nTambah task baru di atas! 🎉',important:'Belum ada task penting.\nKlik ★ untuk menandainya.',planned:'Belum ada task terjadwal.',completed:'Belum ada task selesai.',all:'Belum ada task.\nYuk tambah task pertamamu!'};
    el.innerHTML='<div class="empty"><div class="empty-icon">📭</div>'+(msgs[currentView]||'Kosong').replace(/\n/g,'<br>')+'</div>';
    return;
  }
  var html='';
  // Task dengan _nextDue (repeat selesai hari ini) → tampil sebagai pending di Terjadwal
  var pending=list.filter(function(t){return !isEffectiveDone(t) || t._nextDue;});
  var done=list.filter(function(t){return isEffectiveDone(t) && !t._nextDue;});
  if(pending.length){
    if(currentView==='planned'){
      // Task dengan _nextDue: gunakan _nextDue untuk pengelompokan, bukan due asli
      var overdueList=pending.filter(function(t){var d=t._nextDue||t.due; return d<todayStr && !t._nextDue;});
      var todayList=pending.filter(function(t){var d=t._nextDue||t.due; return d===todayStr;});
      var upcomingList=pending.filter(function(t){var d=t._nextDue||t.due; return d>todayStr;});
      html+=renderPlannedGroup('overdue',overdueList,'⚠️ Terlambat','#dc2626',true);
      html+=renderPlannedGroup('today',todayList,'☀️ Hari Ini','var(--accent)',true);
      html+=renderPlannedGroup('upcoming',upcomingList,'📅 Akan Datang','var(--text)',true);
    } else {
      if(currentView!=='all'&&currentView!=='completed')html+='<div class="section-hdr"><span>'+pending.length+' Task Aktif</span></div>';
      pending.forEach(function(t){html+=taskCard(t);});
    }
  }
  if(done.length&&currentView!=='completed'&&currentView!=='planned'){
    html+='<div class="section-hdr" style="margin-top:14px"><span>Selesai ('+done.length+')</span></div>';
    done.forEach(function(t){html+=taskCard(t);});
  }
  if(currentView==='completed')done.forEach(function(t){html+=taskCard(t);});
  el.innerHTML=html;
}

// ══════════════════════════════════════════════
// TASK CARD
// ══════════════════════════════════════════════
function taskCard(t){
  var over=isOverdue(t);
  var isMulti=t.steps&&t.steps>=2;
  var stepsDone=t.stepsDone||0;
  // FIX: gunakan isEffectiveDone untuk konsistensi dengan filter & render
  var habitDoneToday=false; // sudah di-handle oleh isEffectiveDone
  var effectiveDone=isMulti?(stepsDone>=t.steps):isEffectiveDone(t);
  var color=t.color||'';
  var taskXP=getTaskXP(t);

  var stepsHtml='';
  if(isMulti){
    var boxes='';
    for(var i=0;i<t.steps;i++){
      var checked=i<stepsDone;
      var bc=checked?'var(--green)':'#d6d3d1',bg=checked?'var(--green)':'transparent';
      var stepClick=isFutureTask?('event.stopPropagation();showToast(\'⏳ Task ini baru bisa diselesaikan pada '+fmt(t.due)+'\')'):'event.stopPropagation();toggleStep('+t.id+','+i+')';
      boxes+='<div onclick="'+stepClick+'" style="width:16px;height:16px;border-radius:50%;border:2px solid '+bc+';background:'+bg+';display:inline-flex;align-items:center;justify-content:center;cursor:'+(isFutureTask?'not-allowed':'pointer')+';flex-shrink:0;opacity:'+(isFutureTask?'0.5':'1')+'"><span style="color:#fff;font-size:8px">'+(checked?'✓':'')+'</span></div>';
    }
    stepsHtml='<div style="display:flex;gap:3px;flex-wrap:wrap;margin-top:5px;align-items:center">'+boxes+'<span style="font-size:10px;color:var(--muted);margin-left:3px;font-family:DM Mono,monospace">'+stepsDone+'/'+t.steps+'</span></div>';
  }

  var subHtml='';
  if(t.subtasks&&t.subtasks.length){
    subHtml='<div class="subtask-list">';
    t.subtasks.forEach(function(s){
      subHtml+='<div class="subtask-item"><div class="subtask-check'+(s.done?' checked':'')+'" onclick="event.stopPropagation();'+(isFutureTask?'showToast(\'⏳ Task ini baru bisa diselesaikan pada '+fmt(t.due)+'\')':'toggleSubtask('+t.id+',\''+s.id+'\')')+'" style="cursor:'+(isFutureTask?'not-allowed':'pointer')+';opacity:'+(isFutureTask?'0.5':'1')+'">'+(s.done?'✓':'')+'</div><span class="subtask-name'+(s.done?' done-sub':'')+'">'+s.name+'</span></div>';
    });
    subHtml+='</div>';
  }

  var colorStrip=color?'<div class="task-color-strip" style="background:'+color+'"></div>':'';
  var isFutureTask=!!(t.due&&t.due>todayStr&&!t._nextDue);
  var checkIcon=effectiveDone?'✓':(isMulti?'<span style="font-size:8px;font-weight:700;color:var(--accent)">'+stepsDone+'</span>':'');
  var checkClick=isFutureTask?'event.stopPropagation();showToast(\'⏳ Task ini baru bisa diselesaikan pada \'+fmt(\''+t.due+'\'))':isMulti?'toggleStep('+t.id+',"all")':'toggleDone('+t.id+')';
  var cardClass='task-card'+(effectiveDone?' done':'')+(over?' overdue':'');
  var checkClass='check'+(effectiveDone?' checked':'')+(isFutureTask?' future-locked':'');
  var groupTag=t.group?'<span class="tag" style="background:#f0fdf4;color:#166534">'+getGroupIcon(t.group)+' '+t.group+'</span>':'';
  var repeatTag=t.repeat?'<span class="tag repeat">🔄 '+t.repeat+'</span>':'';
  var displayDue = (currentView==='completed')?t.due:(t._nextDue||t.due);
  var isNextCycle = currentView!=='completed'&&!!t._nextDue;
  var isNextCycle = !!t._nextDue;
  var dueTag=displayDue?'<span class="due'+(over?' overdue':'')+(isNextCycle?'">🔄 ':'">📅 ')+fmt(displayDue)+'</span>':'';
  var reminderTag=t.reminder?'<span style="font-size:10px;color:var(--muted)">🔔 '+t.reminder+'</span>':'';
  var noteTag=t.note?'<span style="font-size:11px;color:var(--muted)">· '+t.note.slice(0,30)+(t.note.length>30?'…':'')+'</span>':'';
  var typeTag='<span class="tag '+(t.type==='Habit'?'habit':(t.isShopping?'shopping':'task'))+'">'+( t.isShopping?'🛒 Belanja':t.type)+'</span>';
  var xpTag='<span style="font-size:10px;color:var(--accent);font-family:DM Mono,monospace;font-weight:700">⚡'+taskXP+'XP</span>';
  var taskGold=t.goldVal||GOLD_PER_TASK;
  var goldTag='<span style="font-size:10px;color:#d97706;font-family:DM Mono,monospace;font-weight:700">🪙'+taskGold+'</span>';
  var priceTag=t.isShopping&&t.price?'<span style="font-size:10px;color:#15803d;font-weight:600">'+fmtRp(t.price)+'</span>':'';

  var dragHandle='<span class="task-drag-handle" onclick="event.stopPropagation()" title="Drag untuk ubah urutan">⠿</span>';
  return '<div class="'+cardClass+' task-draggable" draggable="true" data-task-id="'+t.id+'"'
    +' ondragstart="taskItemDragStart(event,'+t.id+')"'
    +' ondragend="taskItemDragEnd(event)"'
    +' ondragover="taskItemDragOver(event)"'
    +' ondragleave="taskItemDragLeave(event)"'
    +' ondrop="taskItemDrop(event,'+t.id+')"'
    +' onclick="openDetail('+t.id+')">'+colorStrip
    +dragHandle
    +'<div class="'+checkClass+'" onclick="event.stopPropagation();'+checkClick+'">'+checkIcon+'</div>'
    +'<div class="task-body">'
      +'<div class="task-name">'+t.name+'</div>'
      +stepsHtml+subHtml
      +'<div class="task-meta">'+typeTag+groupTag+repeatTag+dueTag+reminderTag+xpTag+' '+goldTag+priceTag+noteTag+'</div>'
    +'</div>'
    +(over&&!effectiveDone?'<button onclick="event.stopPropagation();skipToToday('+t.id+')" title="Skip ke hari ini" style="border:none;background:#fff7ed;color:#d97706;cursor:pointer;font-size:10px;font-weight:700;padding:4px 8px;line-height:1.3;flex-shrink:0;border-radius:6px;border:1px solid #fed7aa;font-family:DM Sans,sans-serif;transition:background 0.1s;white-space:nowrap">⏩ Skip ke hari ini</button>':'')
    +(t.pomo?'<button onclick="event.stopPropagation();openPomoForTask('+t.id+')" title="Pomodoro" style="border:none;background:none;cursor:pointer;font-size:15px;padding:2px 3px;line-height:1;flex-shrink:0;border-radius:5px;transition:background 0.1s;-webkit-tap-highlight-color:transparent">🍅</button>':'')
    +'<button class="star-btn'+(t.important?' on':'')+'" onclick="event.stopPropagation();toggleImportant('+t.id+')" title="'+(t.important?'Hapus dari penting':'Tandai penting')+'">'+(t.important?'★':'☆')+'</button>'
    +'</div>';
}

// ══════════════════════════════════════════════
// STATS VIEW (improved)
// ══════════════════════════════════════════════
function renderStats(el){
  var days7=[];for(var i=6;i>=0;i--)days7.push(offset(-i));
  var barData=days7.map(function(d){
    var count=tasks.filter(function(t){return t.doneDate===d||(t.type==='Habit'&&t.history&&t.history.indexOf(d)>=0);}).length;
    return{d:d,count:count};
  });
  var maxBar=Math.max.apply(null,barData.map(function(b){return b.count;}))||1;
  var barsHtml='';
  barData.forEach(function(b){
    var ht=Math.round((b.count/maxBar)*60);
    var dayName=new Date(b.d+'T00:00:00').toLocaleDateString('id-ID',{weekday:'short'});
    var isToday=b.d===todayStr;
    barsHtml+='<div class="bar-col">'
      +'<div class="bar-val">'+b.count+'</div>'
      +'<div class="bar" style="height:'+(ht||2)+'px;background:'+(isToday?'var(--accent)':'#d6b896')+';width:100%"></div>'
      +'<div class="bar-lbl" style="font-weight:'+(isToday?'700':'400')+'">'+dayName+'</div>'
      +'</div>';
  });

  var days30=[];for(var i=29;i>=0;i--)days30.push(offset(-i));
  var habits=tasks.filter(function(t){return t.type==='Habit';});
  var todayHabits=habits.filter(function(t){return isHabitDueToday(t);});
  var completionPct=todayHabits.length?Math.round(todayHabits.filter(function(t){return t.history&&t.history.indexOf(todayStr)>=0;}).length/todayHabits.length*100):0;
  var maxStreak=habits.reduce(function(m,t){return Math.max(m,calcStreak(t));},0);
  var lv=getLevel();
  var totalTasks=tasks.length;
  var doneTasks=tasks.filter(function(t){return t.done;}).length;
  var totalHabits=habits.length;
  var todayDoneHabits=todayHabits.filter(function(t){return t.history&&t.history.indexOf(todayStr)>=0;}).length;

  var html='<div class="stats-grid-4">'
    +'<div class="stat-card-sm"><div class="stat-num-sm" style="color:var(--accent)">'+totalDone+'</div><div class="stat-lbl-sm">Total Selesai</div></div>'
    +'<div class="stat-card-sm"><div class="stat-num-sm" style="color:var(--green)">'+completionPct+'%</div><div class="stat-lbl-sm">Habit Hari Ini</div></div>'
    +'<div class="stat-card-sm"><div class="stat-num-sm" style="color:#c2410c">'+maxStreak+'🔥</div><div class="stat-lbl-sm">Streak Terbaik</div></div>'
    +'<div class="stat-card-sm"><div class="stat-num-sm" style="color:var(--purple)">'+lv+'</div><div class="stat-lbl-sm">Level Saat Ini</div></div>'
    +'</div>';

  html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">'
    +'<div class="stat-card-sm"><div class="stat-num-sm" style="color:var(--blue)">'+totalTasks+'</div><div class="stat-lbl-sm">Total Task</div></div>'
    +'<div class="stat-card-sm"><div class="stat-num-sm" style="color:var(--green)">'+doneTasks+'</div><div class="stat-lbl-sm">Task Selesai</div></div>'
    +'<div class="stat-card-sm"><div class="stat-num-sm" style="color:var(--gold)">'+totalHabits+'</div><div class="stat-lbl-sm">Total Habit</div></div>'
    +'<div class="stat-card-sm"><div class="stat-num-sm" style="color:#15803d">'+todayDoneHabits+'/'+todayHabits.length+'</div><div class="stat-lbl-sm">Habit Selesai Hari Ini</div></div>'
    +'</div>';

  html+='<div class="chart-wrap"><div class="chart-title">📅 Task Selesai — 7 Hari Terakhir</div><div class="bar-chart">'+barsHtml+'</div></div>';

  if(habits.length){
    var days30=[];for(var i=29;i>=0;i--)days30.push(offset(-i));
    var trendData=days30.map(function(d){
      var dueHabits=habits.filter(function(t){
        // count habits that were scheduled on that day
        var dd=getRepeatDays(t.repeat||'Harian');
        var anchor=t.due||todayStr;
        var anchorD=new Date(anchor+'T00:00:00');
        var checkD=new Date(d+'T00:00:00');
        var diff=Math.round((checkD-anchorD)/86400000);
        return diff>=0&&diff%dd===0;
      });
      var doneCount=habits.filter(function(t){return t.history&&t.history.indexOf(d)>=0;}).length;
      var dueCount=dueHabits.length||habits.length;
      return{d:d,done:doneCount,due:dueCount,pct:dueCount?Math.round(doneCount/dueCount*100):0};
    });
    var maxDue=Math.max.apply(null,trendData.map(function(x){return x.due;}))||1;
    html+='<div class="chart-wrap"><div class="chart-title" style="display:flex;align-items:center;justify-content:space-between">🔥 Tren Habit — 30 Hari Terakhir<span style="font-size:10px;font-weight:400;color:var(--muted)">bar=selesai, garis=target</span></div>'
      +'<div style="display:flex;align-items:flex-end;gap:2px;height:72px;margin-bottom:4px">';
    trendData.forEach(function(b){
      var doneH=Math.round((b.done/maxDue)*60);
      var dueH=Math.round((b.due/maxDue)*60);
      var isToday=b.d===todayStr;
      var pctColor=b.pct>=80?'var(--green)':b.pct>=50?'#f59e0b':'var(--red)';
      html+='<div title="'+fmtShort(b.d)+': '+b.done+'/'+b.due+' ('+b.pct+'%)" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:0;position:relative;height:72px">'
        +'<div style="position:absolute;bottom:0;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:72px">'
        +'<div style="width:80%;height:'+(doneH||1)+'px;background:'+(isToday?'var(--accent)':pctColor)+';border-radius:2px 2px 0 0;opacity:0.85;transition:height 0.3s"></div>'
        +'</div>'
        +(dueH>doneH?'<div style="position:absolute;bottom:'+(doneH)+'px;width:100%;border-top:2px dashed rgba(0,0,0,0.15)"></div>':'')
        +(isToday?'<div style="position:absolute;bottom:-14px;font-size:8px;color:var(--accent);font-weight:700">▲</div>':'')
        +'</div>';
    });
    html+='</div>';
    // Week labels
    html+='<div style="display:flex;gap:2px;margin-top:14px">';
    trendData.forEach(function(b,i){
      var show=i%5===0||b.d===todayStr;
      html+='<div style="flex:1;text-align:center;font-size:8px;color:var(--muted)">'+(show?b.d.slice(8):'')+'</div>';
    });
    html+='</div>';
    // Summary row
    var avg=Math.round(trendData.reduce(function(s,b){return s+b.pct;},0)/30);
    var best=Math.max.apply(null,trendData.map(function(b){return b.pct;}));
    html+='<div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap">'
      +'<span style="font-size:11px;color:var(--muted)">Rata-rata: <b style="color:var(--text)">'+avg+'%</b></span>'
      +'<span style="font-size:11px;color:var(--muted)">Hari terbaik: <b style="color:var(--green)">'+best+'%</b></span>'
      +'<span style="font-size:11px;color:var(--muted)">Hari aktif: <b style="color:var(--accent)">'+trendData.filter(function(b){return b.done>0;}).length+'/30</b></span>'
      +'</div></div>';
  }

  html+='<div class="chart-wrap"><div class="chart-title">⚡ Progress XP — Level '+lv+'</div>'
    +'<div style="display:flex;align-items:center;gap:12px">'
    +'<div style="font-size:36px;font-weight:700;font-family:DM Mono,monospace;color:var(--accent)">'+lv+'</div>'
    +'<div style="flex:1"><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:5px"><span>Level '+lv+'</span><span>'+getLevelXP()+'/'+getLevelXpNeeded()+' XP</span></div>'
    +'<div style="height:12px;background:var(--border);border-radius:6px;overflow:hidden"><div style="height:100%;width:'+(getLevelXpNeeded()>0?(getLevelXP()/getLevelXpNeeded()*100):100)+'%;background:linear-gradient(90deg,var(--accent),#fbbf24);border-radius:6px;transition:width 0.4s"></div></div>'
    +'<div style="font-size:11px;color:var(--muted);margin-top:6px">Total XP: <b>'+xp+'</b> &nbsp;|&nbsp; Butuh <b>'+(getLevelXpNeeded()-getLevelXP())+'</b> XP lagi ke Level '+(lv+1)+'</div>'
    +'</div></div></div>';

  html+='<div class="chart-wrap"><div class="chart-title">🏆 Pencapaian</div>'
    +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">'
    +'<div style="font-size:24px;font-weight:700;color:var(--gold);font-family:DM Mono">'+achievements.length+'/'+ACHIEV_DEF.length+'</div>'
    +'<div style="flex:1"><div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden"><div style="height:100%;width:'+(ACHIEV_DEF.length?achievements.length/ACHIEV_DEF.length*100:0)+'%;background:var(--gold);border-radius:4px"></div></div>'
    +'<div style="font-size:10px;color:var(--muted);margin-top:4px">'+achievements.length+' dari '+ACHIEV_DEF.length+' pencapaian terbuka</div></div></div></div>';

  html+='<div class="chart-wrap"><div class="chart-title">🛒 Belanja Habit</div>';
  var shopTasks=tasks.filter(function(t){return t.isShopping;});
  if(!shopTasks.length){html+='<div style="color:var(--muted);font-size:12px">Belum ada task belanja</div>';}
  else{shopTasks.forEach(function(t){html+='<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:12px"><span>'+(t.done?'<del>':'')+''+t.name+(t.done?'</del>':'')+'</span><span style="color:'+(t.done?'var(--muted)':'#15803d')+';font-weight:700;font-family:DM Mono">'+fmtRp(t.price||0)+'</span></div>';});}
  html+='</div>';

  el.innerHTML=html;
}

// ══════════════════════════════════════════════
// ACHIEVEMENTS VIEW
// ══════════════════════════════════════════════
function renderAchievements(el){
  var stats=getStats();
  var html='<div style="margin-bottom:14px;font-size:13px;color:var(--muted)">'+achievements.length+' dari '+ACHIEV_DEF.length+' pencapaian terbuka</div>';
  html+='<div class="achievement-grid">';
  ACHIEV_DEF.forEach(function(a){
    var unlocked=achievements.indexOf(a.id)>=0;
    html+='<div class="achievement '+(unlocked?'unlocked':'locked')+'">'
      +'<div class="ach-icon">'+a.icon+'</div>'
      +'<div class="ach-name">'+a.name+'</div>'
      +'<div class="ach-desc">'+a.desc+'</div>'
      +(unlocked?'<div style="font-size:9px;color:var(--green);margin-top:3px;font-weight:700">✓ Terbuka</div>':'')
      +'</div>';
  });
  html+='</div>';
  el.innerHTML=html;
}

// ══════════════════════════════════════════════
// CALENDAR VIEW
// ══════════════════════════════════════════════

// ═══════════════════════════════════════════════════════
// GOOGLE CALENDAR INTEGRATION
// ═══════════════════════════════════════════════════════

// Fetch events for a given month from ALL Google Calendars (primary + holidays + others)
function gcalFetchMonth(year, month) {
  if (!_gcalEnabled) return;
  var timeMin = new Date(year, month, 1).toISOString();
  var timeMax = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
  _gcalSyncing = true;
  _gcalShowSyncBadge(true);

  gcalGetToken().then(function(token) {
    if (!token) { _gcalSyncing = false; _gcalShowSyncBadge(false); return; }

  // Step 1: get list of all calendars user has (primary + holidays + subscribed)
  fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=50', {
    headers: { 'Authorization': 'Bearer ' + token }
  }).then(function(r) {
    if (r.status === 401) {
      _gcalAccessToken = null;
      try {
        localStorage.removeItem('chitask_gcal_token');
        localStorage.removeItem('chitask_gcal_token_expiry');
      } catch(e) {}
      _gcalSyncing = false;
      _gcalShowSyncBadge(false);
      // Token expired — auto refresh via Worker
      gcalGetToken().then(function(newToken) {
        if (newToken) gcalFetchMonth(year, month);
        else if (typeof render === 'function') render();
      });
      return null;
    }
    return r.json();
  }).then(function(listData) {
    if (!listData || !listData.items || listData.items.length === 0) {
      _gcalSyncing = false; _gcalShowSyncBadge(false); return;
    }
    // Step 2: fetch events from each visible calendar in parallel
    var calItems = listData.items.filter(function(c) { return c.selected !== false; });
    var promises = calItems.map(function(cal) {
      var calColor = cal.backgroundColor || '#4285F4';
      return fetch('https://www.googleapis.com/calendar/v3/calendars/'
        + encodeURIComponent(cal.id) + '/events'
        + '?timeMin=' + encodeURIComponent(timeMin)
        + '&timeMax=' + encodeURIComponent(timeMax)
        + '&singleEvents=true&orderBy=startTime&maxResults=100', {
        headers: { 'Authorization': 'Bearer ' + token }
      }).then(function(r) {
        if (!r.ok) return [];
        return r.json().then(function(data) {
          if (!data || !data.items) return [];
          return data.items.map(function(ev) {
            return {
              gcalId:   ev.id,
              title:    ev.summary || '(no title)',
              start:    ev.start.dateTime || ev.start.date,
              end:      ev.end.dateTime   || ev.end.date,
              allDay:   !!ev.start.date,
              color:    (ev.colorId ? _gcalColorMap[ev.colorId] : null) || calColor,
              htmlLink: ev.htmlLink || '',
              calName:  cal.summary || ''
            };
          });
        });
      }).catch(function() { return []; });
    });

    Promise.all(promises).then(function(results) {
      // Flatten all events from all calendars
      var allEvents = [];
      results.forEach(function(evList) { allEvents = allEvents.concat(evList); });

      // Index by date
      var byDate = {};
      allEvents.forEach(function(ev) {
        var dateKey = (ev.start || '').substring(0, 10);
        if (!dateKey) return;
        if (!byDate[dateKey]) byDate[dateKey] = [];
        byDate[dateKey].push(ev);
      });

      // Merge: clear this month old data, write new
      var y2 = year, m2 = month;
      var daysInM = new Date(y2, m2+1, 0).getDate();
      for (var di = 1; di <= daysInM; di++) {
        var dk = y2+'-'+String(m2+1).padStart(2,'0')+'-'+String(di).padStart(2,'0');
        delete _gcalEvents[dk];
      }
      Object.keys(byDate).forEach(function(k){ _gcalEvents[k] = byDate[k]; });
      _gcalSyncing = false;
      _gcalShowSyncBadge(false);
      if (typeof render === 'function') render();
    });
  }).catch(function(e) {
    console.warn('gcalFetchMonth error:', e);
    _gcalSyncing = false;
    _gcalShowSyncBadge(false);
  });
  }); // end gcalGetToken
}

// Create a task in Google Calendar as an event
function gcalCreateEvent(task) {
  if (!_gcalEnabled || !task.due) return;
  gcalGetToken().then(function(token) {
    if (!token) return;
  var startDate = task.due;
  var endDateParts = startDate.split('-');
  var endDateObj = new Date(parseInt(endDateParts[0]), parseInt(endDateParts[1])-1, parseInt(endDateParts[2])+1);
  var endDate = endDateObj.getFullYear()+'-'+String(endDateObj.getMonth()+1).padStart(2,'0')+'-'+String(endDateObj.getDate()).padStart(2,'0');
  var body = {
    summary: task.name,
    description: task.note || '',
    start: { date: startDate },
    end:   { date: endDate }
  };
  if (task.reminder) {
    var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    var startDT = startDate + 'T' + task.reminder + ':00';
    var remParts = task.reminder.split(':');
    var endH = String((parseInt(remParts[0])+1)%24).padStart(2,'0');
    var endDT = startDate + 'T' + endH + ':' + remParts[1] + ':00';
    body.start = { dateTime: startDT, timeZone: tz };
    body.end   = { dateTime: endDT,   timeZone: tz };
  }
  function _doCreate(tok) {
    fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(function(r) {
      // FIX: Handle 401 — clear token & retry sekali dengan token baru
      if (r.status === 401) {
        _gcalAccessToken = null;
        try { localStorage.removeItem('chitask_gcal_token'); localStorage.removeItem('chitask_gcal_token_expiry'); } catch(e) {}
        gcalGetToken().then(function(newTok) { if (newTok) _doCreate(newTok); });
        return null;
      }
      return r.json();
    }).then(function(ev) {
      if (!ev) return;
      if (ev && ev.id) {
        var t = tasks ? tasks.find(function(t) { return t && t.id === task.id; }) : null;
        if (t) { t.gcalEventId = ev.id; saveData(); }
        gcalFetchMonth(calendarYear, calendarMonth);
      }
    }).catch(function(e) { console.warn('gcalCreateEvent error:', e); });
  }
  _doCreate(token);
  });
}

// Update a Google Calendar event when task changes
function gcalUpdateEvent(task) {
  if (!_gcalEnabled || !task.gcalEventId || !task.due) return;
  gcalGetToken().then(function(token) {
    if (!token) return;
  var startDate = task.due;
  var endDateParts = startDate.split('-');
  var endDateObj = new Date(parseInt(endDateParts[0]), parseInt(endDateParts[1])-1, parseInt(endDateParts[2])+1);
  var endDate = endDateObj.getFullYear()+'-'+String(endDateObj.getMonth()+1).padStart(2,'0')+'-'+String(endDateObj.getDate()).padStart(2,'0');
  var body = {
    summary: task.name,
    description: task.note || '',
    start: { date: startDate },
    end:   { date: endDate }
  };
  if (task.reminder) {
    var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    var startDT = startDate + 'T' + task.reminder + ':00';
    var remParts = task.reminder.split(':');
    var endH = String((parseInt(remParts[0])+1)%24).padStart(2,'0');
    var endDT = startDate + 'T' + endH + ':' + remParts[1] + ':00';
    body.start = { dateTime: startDT, timeZone: tz };
    body.end   = { dateTime: endDT,   timeZone: tz };
  }
  function _doUpdate(tok) {
    fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events/' + task.gcalEventId, {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(function(r) {
      // FIX: Handle 401 — clear token & retry sekali dengan token baru
      if (r.status === 401) {
        _gcalAccessToken = null;
        try { localStorage.removeItem('chitask_gcal_token'); localStorage.removeItem('chitask_gcal_token_expiry'); } catch(e) {}
        gcalGetToken().then(function(newTok) { if (newTok) _doUpdate(newTok); });
        return;
      }
      gcalFetchMonth(calendarYear, calendarMonth);
    }).catch(function(e) { console.warn('gcalUpdateEvent error:', e); });
  }
  _doUpdate(token);
  });
}

// Delete a Google Calendar event when task is deleted
function gcalDeleteEvent(gcalEventId) {
  if (!_gcalEnabled || !gcalEventId) return;
  gcalGetToken().then(function(token) {
    if (!token) return;
    fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events/' + gcalEventId, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    }).catch(function(e) { console.warn('gcalDeleteEvent error:', e); });
  });
}

// Google Calendar color ID map
var _gcalColorMap = {
  '1':'#a4bdfc','2':'#7ae28c','3':'#dbadff','4':'#ff887c',
  '5':'#fbd75b','6':'#ffb878','7':'#46d6db','8':'#e1e1e1',
  '9':'#5484ed','10':'#51b749','11':'#dc2127'
};

// Sync badge in calendar header
function _gcalShowSyncBadge(show) {
  var badge = document.getElementById('gcalSyncBadge');
  if (badge) badge.style.display = show ? 'inline-flex' : 'none';
}

// Connect button handler — triggers re-auth to get calendar token
function gcalConnect() {
  if (_gcalEnabled && localStorage.getItem('chitask_gcal_connected')) {
    // Already connected — just refresh data
    gcalFetchMonth(calendarYear, calendarMonth);
    showToast('🔄 Google Calendar disinkronkan');
  } else {
    gcalReauth();
  }
}

// Helper: ambil semua task & habit yang relevan untuk satu tanggal di kalender.
// Mencakup: due=dateStr, doneDate=dateStr (task selesai di hari itu), habit history
function getTasksForDate(dateStr){
  var seen={};
  var result=[];
  tasks.forEach(function(t){
    if(seen[t.id])return;
    // Task/habit dengan due = dateStr (belum selesai atau selesai hari itu)
    if(t.due===dateStr){seen[t.id]=true;result.push(t);return;}
    // Repeat task yang sudah done hari ini — tampilkan di _nextDue (preview cycle berikutnya)
    if(t.repeat&&t._nextDue&&t._nextDue===dateStr&&!seen[t.id]){seen[t.id]=true;result.push(t);return;}
    // Habit yang dicentang di dateStr (via history)
    // PENTING: Jangan tampilkan habit di dateStr kalau due-nya masih di masa depan dari dateStr
    if(t.type==='Habit'&&t.history&&t.history.indexOf(dateStr)>=0){
      if(t.due&&t.due>dateStr)return; // due di masa depan → jangan tampilkan di dateStr ini
      seen[t.id]=true;result.push(t);return;
    }
    // Regular task (NON-repeat) yang diselesaikan di dateStr (doneDate = dateStr, meski due beda)
    // TIDAK pakai history untuk non-Habit — repeat task punya banyak history entry (tiap completion)
    // sehingga akan muncul di semua tanggal lama. Cukup tampilkan di doneDate saja.
    if(t.done&&!t.repeat&&t.doneDate===dateStr){seen[t.id]=true;result.push(t);return;}
    // Repeat task yang sudah done: tampilkan hanya di doneDate (hari selesainya), bukan di semua history
    if(t.done&&t.repeat&&t.doneDate===dateStr){seen[t.id]=true;result.push(t);return;}
    // Task tanpa due date tidak muncul di kalender
  });
  return result;
}

function renderCalendar(el){
  var y=calendarYear,m=calendarMonth;
  var months=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  var firstDay=new Date(y,m,1).getDay();
  var daysInMonth=new Date(y,m+1,0).getDate();
  var daysInPrev=new Date(y,m,0).getDate();

  // Google Calendar syncs automatically — no connect button needed
  // Invisible sync spinner badge still used internally by _gcalShowSyncBadge
  var gcalSyncSpinner = (fbUser && !_offlineMode && !fbUser._isGuest)
    ? '<span id="gcalSyncBadge" style="display:none;align-items:center;gap:3px;position:absolute;top:4px;right:4px"><span style="width:8px;height:8px;border:2px solid #4285F4;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite;display:inline-block"></span></span>'
    : '';

  var html='<div style="position:relative;display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">'
    + gcalSyncSpinner
    +'<button onclick="changeCalMonth(-1)" style="padding:6px 12px;border:1px solid var(--border);background:var(--card);border-radius:7px;cursor:pointer;font-size:14px;color:var(--muted)">‹</button>'
    +'<div style="font-size:15px;font-weight:700;color:var(--text)">'+months[m]+' '+y+'</div>'
    +'<button onclick="changeCalMonth(1)" style="padding:6px 12px;border:1px solid var(--border);background:var(--card);border-radius:7px;cursor:pointer;font-size:14px;color:var(--muted)">›</button>'
    +'</div>';

  html+='<div class="cal-grid">';
  ['Min','Sen','Sel','Rab','Kam','Jum','Sab'].forEach(function(d){html+='<div class="cal-head">'+d+'</div>';});
  for(var i=0;i<firstDay;i++){
    var day=daysInPrev-firstDay+i+1;
    html+='<div class="cal-cell other-month"><div class="cal-cell-day">'+day+'</div></div>';
  }
  for(var d=1;d<=daysInMonth;d++){
    var dateStr=y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    var isToday=dateStr===todayStr;
    var isSel=dateStr===calSelectedDate;
    var dayTasks=getTasksForDate(dateStr);
    // Deduplicate by id
    var _seen={}; dayTasks=dayTasks.filter(function(t){return _seen[t.id]?false:(_seen[t.id]=true);});
    var dayGcal=(_gcalEvents[dateStr]||[]);
    var dotHtml='';
    dayTasks.slice(0,3).forEach(function(t){
      var c=t.color||'var(--accent)';
      dotHtml+='<div class="cal-dot" style="background:'+c+'"></div>';
    });
    dayGcal.slice(0,2).forEach(function(ev){
      dotHtml+='<div class="cal-dot" style="background:'+ev.color+';opacity:0.75"></div>';
    });
    var cls='cal-cell'+(isToday?' today':'')+((dayTasks.length||dayGcal.length)?' has-tasks':'')+(isSel?' selected-date':'');
    html+='<div class="'+cls+'" onclick="calDayClick(\''+dateStr+'\')">'
      +'<div class="cal-cell-day">'+d+'</div>'
      +'<div class="cal-dots">'+dotHtml+'</div>'
      +'</div>';
  }
  var total=firstDay+daysInMonth;
  var nextDays=(7-total%7)%7;
  for(var i=1;i<=nextDays;i++){html+='<div class="cal-cell other-month"><div class="cal-cell-day">'+i+'</div></div>';}
  html+='</div>';

  // Selected date panel
  var selDate=calSelectedDate||todayStr;
  var selTasks=getTasksForDate(selDate);
  var selGcal=(_gcalEvents[selDate]||[]);
  html+='<div style="margin-top:14px"><div class="section-hdr"><span>📅 Task & Habit pada '+fmtDate(selDate)+'</span>'
    +'<button onclick="openCalModal(\''+selDate+'\')" style="background:var(--accent);color:#fff;border:none;border-radius:7px;padding:4px 12px;font-size:11px;font-weight:600;cursor:pointer;font-family:DM Sans,sans-serif">+ Tambah Task</button>'
    +'</div>';
  if(!selTasks.length&&!selGcal.length){html+='<div style="color:var(--muted);font-size:13px;padding:12px 0">Tidak ada task — klik "+ Tambah Task" untuk menambahkan</div>';}
  else{
    selTasks.forEach(function(t){html+=taskCard(t);});
    // Google Calendar events from GCal
    if(selGcal.length){
      html+='<div style="margin-top:10px;font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px">🗓 Dari Google Calendar</div>';
      selGcal.forEach(function(ev){
        var timeStr='';
        if(!ev.allDay && ev.start){
          var d=new Date(ev.start);
          timeStr='<span style="font-size:10px;color:var(--muted);font-family:DM Mono,monospace;margin-left:6px">'+d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})+'</span>';
        }
        html+='<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;margin-bottom:5px;background:var(--card);border:1px solid var(--border);border-radius:9px;border-left:3px solid '+ev.color+'">'
          +'<div style="width:8px;height:8px;border-radius:50%;background:'+ev.color+';flex-shrink:0"></div>'
          +'<span style="font-size:13px;font-weight:500;color:var(--text);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+ev.title+'</span>'
          +timeStr
          +(ev.htmlLink?'<a href="'+ev.htmlLink+'" target="_blank" style="font-size:10px;color:#4285F4;text-decoration:none;flex-shrink:0">Buka ↗</a>':'')
          +'</div>';
      });
    }
  }
  html+='</div>';
  el.innerHTML=html;
}

// ══════════════════════════════════════════════════════════════
// UNIFIED CALENDAR — Task + Journal + Google Calendar
// ══════════════════════════════════════════════════════════════
function renderUnifiedCalendar(el) {
  var y = calendarYear, m = calendarMonth;
  var months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus',
    'September','Oktober','November','Desember'];
  var firstDay = new Date(y, m, 1).getDay();
  var daysInMonth = new Date(y, m+1, 0).getDate();
  var daysInPrev = new Date(y, m, 0).getDate();

  // ── Header: month nav + sync spinner ──
  var gcalSpinner = (fbUser && !_offlineMode && !fbUser._isGuest)
    ? '<span id="gcalSyncBadge" style="display:none;align-items:center;gap:3px"><span style="width:8px;height:8px;border:2px solid #4285F4;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite;display:inline-block"></span><span style="font-size:10px;color:#4285F4">sync</span></span>'
    : '';

  var html = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;gap:8px">'
    + '<button onclick="changeCalMonth(-1)" style="padding:6px 14px;border:1px solid var(--border);background:var(--card);border-radius:8px;cursor:pointer;font-size:15px;color:var(--muted)">‹</button>'
    + '<div style="display:flex;align-items:center;gap:8px">'
    + '<span style="font-size:15px;font-weight:700;color:var(--text)">' + months[m] + ' ' + y + '</span>'
    + gcalSpinner
    + '</div>'
    + '<button onclick="changeCalMonth(1)" style="padding:6px 14px;border:1px solid var(--border);background:var(--card);border-radius:8px;cursor:pointer;font-size:15px;color:var(--muted)">›</button>'
    + '</div>';

  // ── Calendar grid ──
  html += '<div class="cal-grid">';
  ['Min','Sen','Sel','Rab','Kam','Jum','Sab'].forEach(function(d){
    html += '<div class="cal-head">' + d + '</div>';
  });
  for (var i = 0; i < firstDay; i++) {
    html += '<div class="cal-cell other-month"><div class="cal-cell-day">' + (daysInPrev-firstDay+i+1) + '</div></div>';
  }
  for (var d = 1; d <= daysInMonth; d++) {
    var dateStr = y + '-' + String(m+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
    var isToday = dateStr === todayStr;
    var isSel = dateStr === calSelectedDate;
    var dayTasks = getTasksForDate(dateStr);
    // Deduplicate by id (a habit with t.due===dateStr AND in t.history would be counted twice)
    var seenIds = {}; var dedupedTasks = [];
    dayTasks.forEach(function(t){ if(!seenIds[t.id]){seenIds[t.id]=true;dedupedTasks.push(t);} });
    dayTasks = dedupedTasks;
    var dayGcal = (_gcalEvents[dateStr] || []);
    var hasJournal = !!getJournalEntry(dateStr);
    var dotHtml = '';
    dayTasks.slice(0,2).forEach(function(t){
      dotHtml += '<div class="cal-dot" style="background:' + (t.color||'var(--accent)') + '"></div>';
    });
    dayGcal.slice(0,2).forEach(function(ev){
      dotHtml += '<div class="cal-dot" style="background:' + ev.color + ';opacity:0.8"></div>';
    });
    var cls = 'cal-cell' + (isToday?' today':'') + ((dayTasks.length||dayGcal.length||hasJournal)?' has-tasks':'') + (isSel?' selected-date':'');
    var je = getJournalEntry(dateStr);
    var moodEmoji = je ? (je.mood >= 0 ? MOODS[je.mood] : '📓') : '';
    html += '<div class="' + cls + '" onclick="calDayClick(\'' + dateStr + '\')" style="position:relative">'
      + (moodEmoji ? '<div style="position:absolute;top:-11px;left:-9px;font-size:22px;line-height:1;z-index:2;pointer-events:none;filter:drop-shadow(0 0 1px var(--card)) drop-shadow(0 0 2px var(--card)) drop-shadow(0 0 3px var(--card))">' + moodEmoji + '</div>' : '')
      + '<div class="cal-cell-day">' + d + '</div>'
      + '<div class="cal-dots">' + dotHtml + '</div>'
      + '</div>';
  }
  var total = firstDay + daysInMonth;
  var nextDays = (7 - total%7) % 7;
  for (var i = 1; i <= nextDays; i++) {
    html += '<div class="cal-cell other-month"><div class="cal-cell-day">' + i + '</div></div>';
  }
  html += '</div>';

  // ── Legend ──
  html += '<div style="display:flex;gap:12px;flex-wrap:wrap;margin:8px 0 12px">'
    + '<div style="display:flex;align-items:center;gap:4px;font-size:10px;color:var(--muted)"><div class="cal-dot" style="background:var(--accent)"></div>Task</div>'
    + '<div style="display:flex;align-items:center;gap:4px;font-size:10px;color:var(--muted)"><span style="font-size:13px;line-height:1">😊</span>Jurnal</div>'
    + '<div style="display:flex;align-items:center;gap:4px;font-size:10px;color:var(--muted)"><div class="cal-dot" style="background:#4285F4;opacity:0.8"></div>Google Cal</div>'
    + '</div>';

  // ── Connect banner (shown only if user is Google but belum pernah connect Calendar) ──
  if (fbUser && !_offlineMode && !fbUser._isGuest && !localStorage.getItem('chitask_gcal_connected')) {
    var _bannerText = '🗓 Hubungkan Google Calendar — ketuk untuk izinkan akses';
    var _bannerSub = 'Izinkan sekali, event Google Calendar muncul otomatis — tidak perlu ulang';
    html += '<div onclick="gcalReauth()" style="display:flex;align-items:center;gap:10px;padding:10px 14px;margin-bottom:10px;background:rgba(66,133,244,0.08);border:1px solid rgba(66,133,244,0.3);border-radius:10px;cursor:pointer">'
      + '<svg width="16" height="16" viewBox="0 0 24 24" style="flex-shrink:0">'
      + '<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>'
      + '<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>'
      + '<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>'
      + '<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>'
      + '</svg>'
      + '<div style="flex:1;min-width:0">'
      + '<div style="font-size:12px;font-weight:700;color:#4285F4">' + _bannerText + '</div>'
      + '<div style="font-size:10px;color:var(--muted);margin-top:2px">' + _bannerSub + '</div>'
      + '</div>'
      + '<span style="font-size:18px;color:#4285F4">↻</span>'
      + '</div>';
  }

  // ── Tab bar ──
  var tabs = [
    { id:'all', label:'Semua' },
    { id:'task', label:'Task' },
    { id:'journal', label:'Jurnal' },
    { id:'gcal', label:'🗓 Event Google' }
  ];
  html += '<div style="display:flex;gap:6px;margin-bottom:14px;border-bottom:1px solid var(--border);padding-bottom:0">';
  tabs.forEach(function(tab){
    var active = _unifiedCalTab === tab.id;
    html += '<button onclick="setUnifiedCalTab(\'' + tab.id + '\')" style="'
      + 'padding:6px 14px;border:none;background:transparent;cursor:pointer;font-size:12px;font-weight:600;font-family:DM Sans,sans-serif;'
      + 'color:' + (active ? 'var(--accent)' : 'var(--muted)') + ';'
      + 'border-bottom:2px solid ' + (active ? 'var(--accent)' : 'transparent') + ';'
      + 'margin-bottom:-1px;transition:all 0.15s">'
      + tab.label + '</button>';
  });
  html += '</div>';

  // ── Selected date detail panel ──
  var selDate = calSelectedDate || todayStr;
  var selTasks = getTasksForDate(selDate);
  var selGcal = (_gcalEvents[selDate] || []);
  var selJournal = getJournalEntry(selDate);

  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">'
    + '<div style="font-size:13px;font-weight:700;color:var(--text)">📅 ' + fmtDate(selDate) + '</div>'
    + '<button onclick="openCalModal(\'' + selDate + '\')" style="background:var(--accent);color:#fff;border:none;border-radius:7px;padding:5px 12px;font-size:11px;font-weight:600;cursor:pointer;font-family:DM Sans,sans-serif">+ Tambah Task</button>'
    + '</div>';

  var hasAnything = selTasks.length || selGcal.length || selJournal;

  if (!hasAnything) {
    html += '<div style="color:var(--muted);font-size:13px;padding:16px 0;text-align:center">Tidak ada task, jurnal, atau event di tanggal ini</div>';
  } else {
    // ── TAB: ALL ──
    if (_unifiedCalTab === 'all') {
      // Group: Task
      if (selTasks.length) {
        var taskBody = '';
        selTasks.forEach(function(t){ taskBody += taskCard(t); });
        html += _unifiedGroupHeader('📋 Task', selTasks.length, 'task');
        html += _unifiedGroupBody(taskBody, 'task');
      }
      // Group: Journal
      if (selJournal) {
        var journalBody = _journalEntryCard(selDate, selJournal);
        html += _unifiedGroupHeader('📓 Jurnal', 1, 'journal');
        html += _unifiedGroupBody(journalBody, 'journal');
      }
      // Group: Google Calendar Events
      if (selGcal.length) {
        var gcalBody = '';
        selGcal.forEach(function(ev){ gcalBody += _gcalEventCard(ev); });
        html += _unifiedGroupHeader('🗓 Google Calendar', selGcal.length, 'gcal');
        html += _unifiedGroupBody(gcalBody, 'gcal');
      }
    }
    // ── TAB: TASK ──
    else if (_unifiedCalTab === 'task') {
      if (selTasks.length) {
        selTasks.forEach(function(t){ html += taskCard(t); });
      } else {
        html += '<div style="color:var(--muted);font-size:13px;padding:12px 0;text-align:center">Tidak ada task di tanggal ini</div>';
      }
    }
    else if (_unifiedCalTab === 'journal') {
      if (selJournal) {
        html += _journalEntryCard(selDate, selJournal);
      } else {
        html += '<div style="color:var(--muted);font-size:13px;padding:12px 0;text-align:center">Belum ada jurnal di tanggal ini</div>'
          + (selDate === todayStr
            ? '<button onclick="openJournalModal(\'' + todayStr + '\')" style="margin-top:8px;padding:7px 16px;border:none;background:var(--accent);color:#fff;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;font-family:DM Sans,sans-serif">✍️ Tulis Jurnal Hari Ini</button>'
            : '<button onclick="openJournalModal(\'' + selDate + '\')" style="margin-top:8px;padding:7px 16px;border:none;background:rgba(139,92,246,0.15);color:#8b5cf6;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;font-family:DM Sans,sans-serif">✍️ Tulis Jurnal Tanggal Ini</button>');
      }
    }
    // ── TAB: GCAL ──
    else if (_unifiedCalTab === 'gcal') {
      if (selGcal.length) {
        selGcal.forEach(function(ev){ html += _gcalEventCard(ev); });
      } else {
        html += '<div style="color:var(--muted);font-size:13px;padding:12px 0;text-align:center">Tidak ada event Google Calendar di tanggal ini</div>';
      }
    }
  }

  el.innerHTML = html;
}

function setUnifiedCalTab(tab) {
  _unifiedCalTab = tab;
  var el = document.getElementById('taskScroll');
  if (el) renderUnifiedCalendar(el);
}

// State collapse untuk grup di tab "Semua" — default semua terbuka
var _calGroupCollapsed = { task: false, journal: false, gcal: false };

function _unifiedGroupHeader(label, count, groupKey) {
  var isCollapsed = _calGroupCollapsed[groupKey];
  var accentColor = groupKey === 'journal' ? '#8b5cf6' : groupKey === 'gcal' ? '#4285F4' : 'var(--accent)';
  return '<div onclick="toggleCalGroup(\'' + groupKey + '\')" style="'
    + 'display:flex;align-items:center;gap:8px;padding:8px 12px;margin:10px 0 6px;'
    + 'background:var(--card);border:1px solid var(--border);border-radius:10px;'
    + 'cursor:pointer;user-select:none;transition:background 0.15s">'
    + '<span style="font-size:13px">' + label.split(' ')[0] + '</span>'
    + '<span style="font-size:12px;font-weight:700;color:var(--text);flex:1">' + label.split(' ').slice(1).join(' ') + '</span>'
    + '<span style="background:' + accentColor + ';color:#fff;border-radius:20px;padding:1px 8px;font-size:10px;font-weight:700">' + count + '</span>'
    + '<span style="font-size:11px;color:var(--muted);transition:transform 0.2s;display:inline-block;transform:rotate(' + (isCollapsed ? '-90deg' : '0deg') + ')">'
    + '▾</span>'
    + '</div>';
}

function _unifiedGroupBody(content, groupKey) {
  var isCollapsed = _calGroupCollapsed[groupKey];
  return '<div id="calGroup-' + groupKey + '" style="'
    + (isCollapsed ? 'display:none;' : '')
    + 'overflow:hidden">'
    + content
    + '</div>';
}

function toggleCalGroup(key) {
  _calGroupCollapsed[key] = !_calGroupCollapsed[key];
  var body = document.getElementById('calGroup-' + key);
  if (body) {
    body.style.display = _calGroupCollapsed[key] ? 'none' : '';
  }
  // Update chevron icon
  var el = document.getElementById('taskScroll');
  // Just re-render untuk update chevron state
  if (el && typeof renderUnifiedCalendar === 'function') renderUnifiedCalendar(el);
}

function _journalEntryCard(dateStr, entry) {
  var moodLabel = (entry.mood >= 0) ? MOODS[entry.mood] : '';
  var preview = (entry.content||entry.text||'').replace(/<[^>]+>/g,'').substring(0,120);
  if ((entry.content||entry.text||'').length > 120) preview += '…';
  return '<div onclick="openJournalModal(\'' + dateStr + '\')" style="padding:10px 12px;background:rgba(139,92,246,0.07);border:1px solid rgba(139,92,246,0.2);border-radius:10px;margin-bottom:6px;cursor:pointer;transition:background 0.15s" onmouseover="this.style.background=\'rgba(139,92,246,0.13)\'" onmouseout="this.style.background=\'rgba(139,92,246,0.07)\'">'
    + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">'
    + (moodLabel ? '<span style="font-size:18px">' + moodLabel + '</span>' : '<span style="font-size:16px">📓</span>')
    + '<span style="font-size:12px;font-weight:600;color:#8b5cf6;flex:1">' + fmtDate(dateStr) + '</span>'
    + (entry.tags && entry.tags.length ? '<span style="font-size:10px;color:var(--muted)">' + entry.tags.slice(0,3).map(function(tg){return '#'+tg;}).join(' ') + '</span>' : '')
    + '<span style="font-size:10px;color:#8b5cf6;font-weight:600;opacity:0.7">✏️ Edit</span>'
    + '</div>'
    + (preview ? '<div style="font-size:12px;color:var(--muted);line-height:1.5">' + preview + '</div>' : '<div style="font-size:12px;color:var(--muted);font-style:italic">Ketuk untuk buka jurnal</div>')
    + '</div>';
}

function _gcalEventCard(ev) {
  var timeStr = '';
  if (!ev.allDay && ev.start) {
    var d = new Date(ev.start);
    timeStr = '<span style="font-size:10px;color:var(--muted);font-family:DM Mono,monospace">' + d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}) + '</span>';
  } else {
    timeStr = '<span style="font-size:10px;color:var(--muted)">Seharian</span>';
  }
  var calNameBadge = ev.calName ? '<span style="font-size:9px;color:var(--muted);background:var(--border);border-radius:4px;padding:1px 5px">' + ev.calName + '</span>' : '';
  return '<div style="display:flex;align-items:center;gap:8px;padding:9px 12px;margin-bottom:6px;background:var(--card);border:1px solid var(--border);border-radius:10px;border-left:3px solid ' + ev.color + '">'
    + '<div style="width:8px;height:8px;border-radius:50%;background:' + ev.color + ';flex-shrink:0"></div>'
    + '<div style="flex:1;min-width:0">'
    + '<div style="font-size:13px;font-weight:500;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + ev.title + '</div>'
    + '<div style="display:flex;align-items:center;gap:6px;margin-top:2px">' + timeStr + calNameBadge + '</div>'
    + '</div>'
    + (ev.htmlLink ? '<a href="' + ev.htmlLink + '" target="_blank" style="font-size:10px;color:#4285F4;text-decoration:none;flex-shrink:0">Buka ↗</a>' : '')
    + '</div>';
}

function changeCalMonth(dir){calendarMonth+=dir;if(calendarMonth>11){calendarMonth=0;calendarYear++;}if(calendarMonth<0){calendarMonth=11;calendarYear--;}
  // Fetch Google Calendar events for the new month
  if(_gcalEnabled) gcalFetchMonth(calendarYear, calendarMonth);
  render();}
function calDayClick(d){calSelectedDate=d;render();}
function openCalModal(dateStr){
  calModalDateStr=dateStr;
  document.getElementById('calModalDate').textContent=fmtDate(dateStr);
  document.getElementById('calModalName').value='';
  document.getElementById('calModalType').value='Task';
  document.getElementById('calModalImp').value='false';
  document.getElementById('calModalGroup').value='';
  calReminderReset();
  document.getElementById('calModalXPPreviewRow').style.display='none';
  document.getElementById('calModal').classList.add('show');
  setTimeout(function(){document.getElementById('calModalName').focus();},100);
}
// ── Reminder Picker globals ──────────────────────────────────
var _remH=8, _remM=0, _remAmPm='AM';
var _remSnapTH=null, _remSnapTM=null;

var _remTargetId = 'calModalReminder';
function openReminderPicker(targetId){
  _remTargetId = targetId || 'calModalReminder';
  // Read current value if set
  var srcEl = document.getElementById(_remTargetId);
  var cur = srcEl ? srcEl.value : '';
  if(cur){
    var p=cur.split(':');
    var h24=parseInt(p[0]),m=parseInt(p[1]);
    _remAmPm=h24>=12?'PM':'AM';
    _remH=h24%12||12;
    _remM=m;
  } else {
    var _nowD=new Date();
    var _nowH=_nowD.getHours(),_nowMin=_nowD.getMinutes();
    _remAmPm=_nowH>=12?'PM':'AM';
    _remH=_nowH%12||12;
    _remM=_nowMin;
  }
  remBuildDrums();
  remSetAmPm(_remAmPm);
  remUpdatePreview();
  // clear preset active states
  document.querySelectorAll('.rem-picker-chip').forEach(function(b){b.classList.remove('active');});
  // show overlay
  var ov=document.getElementById('reminderPickerOverlay');
  ov.style.display='flex';
  setTimeout(function(){
    var sh=document.getElementById('reminderPickerSheet');
    sh.style.transform='scale(1)';
    sh.style.opacity='1';
  },10);
}
function closeReminderPicker(){
  var sh=document.getElementById('reminderPickerSheet');
  sh.style.transform='scale(0.9)';
  sh.style.opacity='0';
  setTimeout(function(){
    document.getElementById('reminderPickerOverlay').style.display='none';
  },220);
}
function remBuildDrums(){
  // Hours 1-12
  var dh=document.getElementById('remDrumH');
  dh.innerHTML='';
  for(var i=1;i<=12;i++){
    var d=document.createElement('div');
    d.className='rem-drum-item'+(i===_remH?' selected':'');
    d.textContent=String(i).padStart(2,'0');
    d.setAttribute('data-val',i);
    d.onclick=(function(v){return function(){remDrumClickH(v);};})(i);
    dh.appendChild(d);
  }
  // Minutes 0-59
  var dm=document.getElementById('remDrumM');
  dm.innerHTML='';
  for(var j=0;j<60;j++){
    var d2=document.createElement('div');
    d2.className='rem-drum-item'+(j===_remM?' selected':'');
    d2.textContent=String(j).padStart(2,'0');
    d2.setAttribute('data-val',j);
    d2.onclick=(function(v){return function(){remDrumClickM(v);};})(j);
    dm.appendChild(d2);
  }
  setTimeout(function(){
    remScrollTo('H',_remH,false);
    remScrollTo('M',_remM,false);
  },20);
}
function remScrollTo(which, val, smooth){
  var drum=document.getElementById(which==='H'?'remDrumH':'remDrumM');
  var items=drum.querySelectorAll('.rem-drum-item');
  for(var i=0;i<items.length;i++){
    var iv=parseInt(items[i].getAttribute('data-val'));
    if(iv===val){
      var top=i*46;
      drum.scrollTo({top:top, behavior:smooth?'smooth':'instant'});
      break;
    }
  }
}
function remDrumSnap(which){
  var drum=document.getElementById(which==='H'?'remDrumH':'remDrumM');
  var snapTimer=which==='H'?'_remSnapTH':'_remSnapTM';
  if(window[snapTimer])clearTimeout(window[snapTimer]);
  window[snapTimer]=setTimeout(function(){
    // Read scrollTop AFTER scroll settles, not before
    var st=drum.scrollTop;
    var items=drum.querySelectorAll('.rem-drum-item');
    var idx=Math.round(st/46);
    if(idx<0)idx=0;
    if(idx>=items.length)idx=items.length-1;
    drum.scrollTo({top:idx*46,behavior:'smooth'});
    var val=parseInt(items[idx].getAttribute('data-val'));
    if(which==='H'){_remH=val;}else{_remM=val;}
    items.forEach(function(it){it.classList.remove('selected');});
    items[idx].classList.add('selected');
    remUpdatePreview();
  },200);
}
function remDrumClickH(v){
  _remH=v;
  remScrollTo('H',v,true);
  remUpdatePreview();
}
function remDrumClickM(v){
  _remM=v;
  remScrollTo('M',v,true);
  remUpdatePreview();
}
function remSetAmPm(ap){
  _remAmPm=ap;
  document.getElementById('remAmBtn').className='rem-ampm-btn'+(ap==='AM'?' rem-ampm-active':'');
  document.getElementById('remPmBtn').className='rem-ampm-btn'+(ap==='PM'?' rem-ampm-active':'');
  remUpdatePreview();
}
function remPickerSelectPreset(val,btn){
  var p=val.split(':');
  var h24=parseInt(p[0]),m=parseInt(p[1]);
  _remAmPm=h24>=12?'PM':'AM';
  _remH=h24%12||12;
  _remM=m;
  remScrollTo('H',_remH,true);
  remScrollTo('M',_remM,true);
  remSetAmPm(_remAmPm);
  remUpdatePreview();
  document.querySelectorAll('.rem-picker-chip').forEach(function(b){b.classList.remove('active');});
  if(btn)btn.classList.add('active');
  // Update drum selected classes
  document.querySelectorAll('#remDrumH .rem-drum-item').forEach(function(it){
    it.classList.toggle('selected',parseInt(it.getAttribute('data-val'))===_remH);
  });
  document.querySelectorAll('#remDrumM .rem-drum-item').forEach(function(it){
    it.classList.toggle('selected',parseInt(it.getAttribute('data-val'))===_remM);
  });
}
function remUpdatePreview(){
  var h=_remH, m=_remM, ap=_remAmPm;
  document.getElementById('remPickerPreview').textContent=
    String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+' '+ap;
}
function confirmReminderPicker(){
  // Convert to 24h
  var h=_remH, ap=_remAmPm;
  var h24;
  if(ap==='AM'){h24=h===12?0:h;}
  else{h24=h===12?12:h+12;}
  var val=String(h24).padStart(2,'0')+':'+String(_remM).padStart(2,'0');
  // Write to target
  var target = _remTargetId || 'calModalReminder';
  var el = document.getElementById(target);
  if(el) el.value = val;
  // If it's the calendar modal, update its trigger button as before
  if(target === 'calModalReminder'){
    calReminderUpdateTrigger(val);
  } else {
    // Update the companion label button for taskbar/detail inputs
    taskbarReminderUpdateLabel(target, val);
    // If detail panel, also trigger liveDetail
    if(target === 'det-reminder') liveDetail();
  }
  closeReminderPicker();
  // Minta izin notifikasi segera saat user set reminder
  if('Notification' in window && Notification.permission === 'default'){
    setTimeout(function(){
      _requestNotifPermission(function(ok){
        if(ok){ showToast('\u2705 Notifikasi reminder aktif!'); scheduleReminders(); }
      });
    }, 400);
  }
}
// ═══════════════════════════════════════════════════════
// DATE PICKER MODAL
// ═══════════════════════════════════════════════════════
var _dpTargetId = '';
var _dpSelectedDate = ''; // yyyy-mm-dd
var _dpViewYear = 0;
var _dpViewMonth = 0; // 0-11

var _DP_MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function openDatePicker(targetId) {
  _dpTargetId = targetId;
  var el = document.getElementById(targetId);
  var cur = el ? el.value : '';
  var today = new Date();
  if (cur) {
    var parts = cur.split('-');
    _dpSelectedDate = cur;
    _dpViewYear = parseInt(parts[0]);
    _dpViewMonth = parseInt(parts[1]) - 1;
  } else {
    _dpSelectedDate = '';
    _dpViewYear = today.getFullYear();
    _dpViewMonth = today.getMonth();
  }
  dpRenderCalendar();
  dpUpdatePreview();
  document.querySelectorAll('.date-picker-chip').forEach(function(b){b.classList.remove('active');});
  var ov = document.getElementById('datePickerOverlay');
  ov.style.display = 'flex';
  setTimeout(function(){
    var sh = document.getElementById('datePickerSheet');
    sh.style.transform = 'scale(1)';
    sh.style.opacity = '1';
  }, 10);
}

function closeDatePicker() {
  var sh = document.getElementById('datePickerSheet');
  sh.style.transform = 'scale(0.9)';
  sh.style.opacity = '0';
  setTimeout(function(){
    document.getElementById('datePickerOverlay').style.display = 'none';
  }, 220);
}

function dpRenderCalendar() {
  var label = document.getElementById('datePickerMonthLabel');
  label.textContent = _DP_MONTHS[_dpViewMonth] + ' ' + _dpViewYear;

  var grid = document.getElementById('datePickerGrid');
  grid.innerHTML = '';

  var today = new Date();
  today.setHours(0,0,0,0);
  var todayStr = localDateStr(today);

  // first day of month
  var firstDay = new Date(_dpViewYear, _dpViewMonth, 1).getDay(); // 0=Sun
  var daysInMonth = new Date(_dpViewYear, _dpViewMonth + 1, 0).getDate();

  // empty cells before first day
  for (var e = 0; e < firstDay; e++) {
    var empty = document.createElement('div');
    empty.className = 'dp-day dp-empty';
    grid.appendChild(empty);
  }

  for (var d = 1; d <= daysInMonth; d++) {
    var dateStr = _dpViewYear + '-' + String(_dpViewMonth+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
    var dayEl = document.createElement('div');
    dayEl.className = 'dp-day';
    dayEl.textContent = d;

    var dayDate = new Date(_dpViewYear, _dpViewMonth, d);
    dayDate.setHours(0,0,0,0);
    var isPast = dayDate < today;
    var isToday = dateStr === todayStr;
    var isSelected = dateStr === _dpSelectedDate;

    if (isSelected) dayEl.classList.add('dp-selected');
    else if (isToday) dayEl.classList.add('dp-today');
    else if (isPast) dayEl.classList.add('dp-past');

    (function(ds, past) {
      dayEl.onclick = function() {
        _dpSelectedDate = ds;
        document.querySelectorAll('.date-picker-chip').forEach(function(b){b.classList.remove('active');});
        dpRenderCalendar();
        dpUpdatePreview();
      };
    })(dateStr, isPast);

    grid.appendChild(dayEl);
  }
}

function dpUpdatePreview() {
  var prev = document.getElementById('datePickerPreview');
  if (!_dpSelectedDate) {
    prev.textContent = 'Belum dipilih';
    prev.style.color = 'var(--muted)';
    return;
  }
  var parts = _dpSelectedDate.split('-');
  var y = parseInt(parts[0]), m = parseInt(parts[1])-1, d = parseInt(parts[2]);
  var days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  var dateObj = new Date(y, m, d);
  prev.textContent = days[dateObj.getDay()] + ', ' + d + ' ' + _DP_MONTHS[m] + ' ' + y;
  prev.style.color = 'var(--accent)';
}

function datePickerPrevMonth() {
  _dpViewMonth--;
  if (_dpViewMonth < 0) { _dpViewMonth = 11; _dpViewYear--; }
  dpRenderCalendar();
}

function datePickerNextMonth() {
  _dpViewMonth++;
  if (_dpViewMonth > 11) { _dpViewMonth = 0; _dpViewYear++; }
  dpRenderCalendar();
}

function datePickerSelectPreset(daysOffset, btn) {
  var d = new Date();
  d.setDate(d.getDate() + daysOffset);
  var y = d.getFullYear();
  var m = String(d.getMonth()+1).padStart(2,'0');
  var day = String(d.getDate()).padStart(2,'0');
  _dpSelectedDate = y + '-' + m + '-' + day;
  _dpViewYear = d.getFullYear();
  _dpViewMonth = d.getMonth();
  document.querySelectorAll('.date-picker-chip').forEach(function(b){b.classList.remove('active');});
  if (btn) btn.classList.add('active');
  dpRenderCalendar();
  dpUpdatePreview();
}

function datePickerClear() {
  _dpSelectedDate = '';
  document.querySelectorAll('.date-picker-chip').forEach(function(b){b.classList.remove('active');});
  dpRenderCalendar();
  dpUpdatePreview();
  // Clear the target value
  var el = document.getElementById(_dpTargetId);
  if (el) el.value = '';
  taskbarDateUpdateLabel(_dpTargetId, '');
  if (_dpTargetId === 'det-due') { liveDetail(); saveData(true); render(); }
  closeDatePicker();
}

function confirmDatePicker() {
  var el = document.getElementById(_dpTargetId);
  if (el) el.value = _dpSelectedDate;
  taskbarDateUpdateLabel(_dpTargetId, _dpSelectedDate);
  if (_dpTargetId === 'det-due') { liveDetail(); saveData(true); render(); }
  closeDatePicker();
}

function taskbarDateUpdateLabel(targetId, val) {
  var labelId = targetId + '-label';
  var btnId = targetId + '-btn';
  var label = document.getElementById(labelId);
  var btn = document.getElementById(btnId);

  // default empty text per context
  var emptyText = 'Tanggal';
  if (targetId === 'det-due') emptyText = 'Pilih tanggal...';
  else if (targetId === 'sqa-due') emptyText = '';

  if (!label) return;
  if (val) {
    var parts = val.split('-');
    var y = parseInt(parts[0]), m = parseInt(parts[1])-1, d = parseInt(parts[2]);
    var months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    var today = new Date(); today.setHours(0,0,0,0);
    var dateObj = new Date(y, m, d);
    var diff = Math.round((dateObj - today) / 86400000);
    var shortLabel;
    if (diff === 0) shortLabel = 'Hari ini';
    else if (diff === 1) shortLabel = 'Besok';
    else shortLabel = d + ' ' + months[m];
    label.textContent = shortLabel;
    label.style.color = 'var(--accent)';
    label.style.fontWeight = '700';
    if (btn) { btn.style.borderColor = 'var(--accent)'; btn.style.background = 'var(--pill)'; }
  } else {
    label.textContent = emptyText;
    label.style.color = '';
    label.style.fontWeight = '';
    if (btn) { btn.style.borderColor = ''; btn.style.background = ''; }
  }
}

// ── Sync date label on load (det-due restored from saved task) ──
function dpSyncDetDue(val) {
  taskbarDateUpdateLabel('det-due', val);
}

function calReminderUpdateTrigger(val){
  var icon=document.getElementById('calReminderTriggerIcon');
  var label=document.getElementById('calReminderTriggerLabel');
  var clearBtn=document.getElementById('calReminderTriggerClear');
  var trigger=document.getElementById('calReminderTrigger');
  if(val){
    var p=val.split(':');
    var h=parseInt(p[0]),m=p[1];
    var ap=h>=12?'PM':'AM';
    var h12=h%12||12;
    icon.textContent='🔔';
    label.textContent=String(h12).padStart(2,'0')+':'+m+' '+ap;
    label.style.color='var(--accent)';
    label.style.fontWeight='700';
    clearBtn.style.display='';
    trigger.style.borderColor='var(--accent)';
    trigger.style.background='var(--pill)';
  } else {
    icon.textContent='🔔';
    label.textContent='Tambah reminder...';
    label.style.color='var(--muted)';
    label.style.fontWeight='500';
    clearBtn.style.display='none';
    trigger.style.borderColor='var(--border)';
    trigger.style.background='var(--bg)';
  }
}
function calReminderClear(){
  document.getElementById('calModalReminder').value='';
  calReminderUpdateTrigger('');
}
function calReminderReset(){
  calReminderClear();
}
// Update label on taskbar/detail/sqa reminder buttons
function taskbarReminderUpdateLabel(targetId, val){
  var labelId = targetId + '-label';
  var btnId = targetId + '-btn';
  var label = document.getElementById(labelId);
  var btn = document.getElementById(btnId);
  if(!label) return;
  var emptyText = (targetId === 'det-reminder') ? 'Tambah reminder...' : (targetId === 'mchip-reminder') ? 'Reminder' : 'Reminder';
  var hideWhenEmpty = (targetId === 'sqa-reminder');
  if(val){
    var p=val.split(':');
    var h=parseInt(p[0]),m=p[1];
    var ap=h>=12?'PM':'AM';
    var h12=h%12||12;
    label.textContent=String(h12).padStart(2,'0')+':'+m+' '+ap;
    label.style.color='var(--accent)';
    label.style.fontWeight='700';
    label.style.display='';
    if(btn){btn.style.borderColor='var(--accent)';btn.style.background='var(--pill)';}
  } else {
    label.textContent=emptyText;
    label.style.color='';
    label.style.fontWeight='';
    label.style.display= hideWhenEmpty ? 'none' : '';
    if(btn){btn.style.borderColor='';btn.style.background='';}
  }
}
function calModalUpdateXPPreview(){
  var group=document.getElementById('calModalGroup').value;
  var isHabit=document.getElementById('calModalType').value==='Habit';
  var row=document.getElementById('calModalXPPreviewRow');
  var prev=document.getElementById('calModalXPPreview');
  if(!group){row.style.display='none';return;}
  row.style.display='';
  var r=getGroupReward(group,isHabit);
  prev.textContent='⚡ '+r.xp+' XP  🪙 '+r.gold+' Gold'+(isHabit?' (Habit +2 XP)':'');
}
function closeCalModal(){document.getElementById('calModal').classList.remove('show');}
function submitCalModal(){
  var name=document.getElementById('calModalName').value.trim();
  if(!name){showToast('Ketik nama task dulu!');return;}
  var type=document.getElementById('calModalType').value;
  var imp=document.getElementById('calModalImp').value==='true';
  var group=document.getElementById('calModalGroup').value||'';
  var reminder=document.getElementById('calModalReminder').value||'';
  var isHabit=(type==='Habit');
  var gr=getGroupReward(group,isHabit);
  var newTask={id:nextId++,name:name,type:type,repeat:'',due:calModalDateStr,done:false,important:imp,myday:calModalDateStr===todayStr,note:'',group:group,history:[],color:'',subtasks:[],reminder:reminder,xpVal:gr.xp,goldVal:gr.gold,gcalEventId:''};
  tasks.unshift(newTask);
  closeCalModal();showToast('Task ditambahkan ke '+fmtDate(calModalDateStr)+' ✨');
  saveData(true);render();
  if(reminder && typeof scheduleReminders==='function') scheduleReminders();
  // Sync task baru ke Google Calendar
  if(_gcalEnabled) gcalCreateEvent(newTask);
}

// ══════════════════════════════════════════════
// HABIT FULL VIEW
// ══════════════════════════════════════════════
function renderHabitFull(el){
  var habits=tasks.filter(function(t){return t.type==='Habit';});
  if(!habits.length){el.innerHTML='<div class="empty"><div class="empty-icon">🌱</div>Belum ada habit.<br>Tambah task bertipe Habit!</div>';return;}
  var days30=[],days7=[];
  for(var i=0;i<30;i++)days30.push(offset(i-29));
  for(var i=0;i<7;i++)days7.push(offset(i-6));
  var todayDone=habits.filter(function(t){return t.history&&t.history.indexOf(todayStr)>=0;}).length;
  var pctToday=habits.length?Math.round(todayDone/habits.length*100):0;
  var maxStreak=habits.reduce(function(m,t){return Math.max(m,calcStreak(t));},0);
  // Analisa button header
  var pct7days=habits.length?Math.round(habits.filter(function(t){return t.history&&t.history.indexOf(todayStr)>=0;}).length/habits.length*100):0;
  var html='<button class="btn-habit-analisa" onclick="switchView(\'habit-analisa\')">'
    +'<span class="bha-icon">🧠</span>'
    +'<span class="bha-content">'
    +'<span class="bha-title">Analisa Habit</span>'
    +'<span class="bha-sub">Lihat insight & rekomendasi personalmu</span>'
    +'</span>'
    +'<span class="bha-arrow">→</span>'
    +'</button>';
  html+='<div class="stat-cards">'
    +'<div class="stat-card"><div class="stat-num" style="color:var(--accent)">'+habits.length+'</div><div class="stat-lbl">Total Habit</div></div>'
    +'<div class="stat-card"><div class="stat-num" style="color:var(--green)">'+pctToday+'%</div><div class="stat-lbl">Selesai Hari Ini</div></div>'
    +'<div class="stat-card"><div class="stat-num" style="color:#c2410c">'+maxStreak+'\uD83D\uDD25</div><div class="stat-lbl">Streak Terbaik</div></div>'
    +'</div>';
  html+='<div class="streak-tabs">'
    +'<div class="streak-tab'+(habitStreakMode==='week'?' active':'')+'" onclick="setStreakMode(\'week\')">📅 7 Hari</div>'
    +'<div class="streak-tab'+(habitStreakMode==='month'?' active':'')+'" onclick="setStreakMode(\'month\')">📆 30 Hari</div>'
    +'</div>';
  var groups={};
  habits.forEach(function(t){var g=t.group||'';if(!groups[g])groups[g]=[];groups[g].push(t);});
  var usedGroups=getGroupOrder().filter(function(g){return groups[g]&&groups[g].length>0;});
  var mob=isMobile();
  if(habitStreakMode==='week'){
    var dayNames=days7.map(function(d){return new Date(d+'T00:00:00').toLocaleDateString('id-ID',{weekday:'short'}).slice(0,2);});
    usedGroups.forEach(function(g){
      var gHabits=groups[g],gKey='g_'+g;
      if(!(gKey in groupOpenState))groupOpenState[gKey]=true;
      var isOpen=groupOpenState[gKey],label=g?(getGroupIcon(g)+' '+g):'📁 Tanpa Grup';
      html+='<div class="group-accordion"><div class="group-header" onclick="toggleGroup(\''+gKey+'\')">'
        +'<div class="group-header-left">'+label+'<span class="group-badge">'+gHabits.length+'</span></div>'
        +'<span class="group-chevron'+(isOpen?' open':'')+'">▼</span></div>'
        +'<div class="group-body'+(isOpen?' open':'')+'">';
      if(mob){
        html+='<div style="padding:6px 8px 8px;display:flex;flex-direction:column;gap:8px">';
        gHabits.forEach(function(t){
          var streak=calcStreak(t),wDone=days7.filter(function(d){return t.history&&t.history.indexOf(d)>=0;}).length,pct=Math.round(wDone/calcScheduledDays(t,days7)*100);
          var sc=streak>=7?'#c2410c':streak>=3?'var(--green)':'var(--muted)';
          var pc=pct>=70?'var(--green)':pct>=40?'#f59e0b':'var(--red)';
          var colorBorder=t.color?'border-left:3px solid '+t.color+';':'';
          var dotsHtml='';
          days7.forEach(function(d,i){
            var done=t.history&&t.history.indexOf(d)>=0,isTd=d===todayStr;
            dotsHtml+='<div style="display:flex;flex-direction:column;align-items:center;gap:2px;flex:1">'
              +'<div style="font-size:9px;color:var(--muted);font-weight:600">'+dayNames[i]+'</div>'
              +'<div onclick="event.stopPropagation();toggleHabitDay('+t.id+',\''+d+'\')" '
              +'style="width:28px;height:28px;border-radius:6px;border:'+(isTd?'2px solid var(--accent)':'1px solid var(--border)')+';background:'+(done?'var(--green)':'var(--bg)')+';display:flex;align-items:center;justify-content:center;font-size:12px;cursor:pointer;color:'+(done?'#fff':'var(--muted)')+';">'+(done?'✓':(isTd?'·':''))+'</div>'
              +'</div>';
          });
          html+='<div style="background:var(--card);border:1px solid var(--border);border-radius:10px;padding:10px 12px;'+colorBorder+'cursor:pointer" onclick="openDetail('+t.id+')">'
            +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">'
            +'<span style="font-size:13px;font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;margin-right:8px">'+t.name+'</span>'
            +'<span style="font-size:12px;font-weight:700;color:'+sc+';white-space:nowrap;flex-shrink:0">'+streak+'\uD83D\uDD25</span>'
            +'</div>'
            +'<div style="display:flex;gap:4px;align-items:flex-end" onclick="event.stopPropagation()">'+dotsHtml+'</div>'
            +'<div style="margin-top:8px;display:flex;align-items:center;gap:8px">'
            +'<div style="flex:1;height:4px;background:var(--border);border-radius:2px;overflow:hidden"><div style="height:100%;width:'+pct+'%;background:'+pc+';border-radius:2px"></div></div>'
            +'<span style="font-size:10px;color:var(--muted);font-family:DM Mono,monospace;flex-shrink:0">'+pct+'%</span>'
            +'</div>'
            +'</div>';
        });
        html+='</div>';
      } else {
        var col='1fr repeat(7,26px) 56px 50px';
        html+='<div class="hft-head" style="grid-template-columns:'+col+';gap:4px">'
          +'<div>Habit</div>'+dayNames.map(function(d){return'<div style="text-align:center">'+d+'</div>';}).join('')
          +'<div style="text-align:center">Streak</div><div style="text-align:center">%</div></div>';
        gHabits.forEach(function(t){
          var streak=calcStreak(t),wDone=days7.filter(function(d){return t.history&&t.history.indexOf(d)>=0;}).length,pct=Math.round(wDone/calcScheduledDays(t,days7)*100);
          var colorBar=t.color?'<div style="width:3px;background:'+t.color+';border-radius:2px;align-self:stretch;flex-shrink:0"></div>':'';
          html+='<div class="hft-row" style="grid-template-columns:'+col+';gap:4px" onclick="openDetail('+t.id+')">'
            +'<div style="display:flex;align-items:center;gap:4px;overflow:hidden">'+colorBar+'<span style="font-size:12px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+t.name+'</span></div>';
          days7.forEach(function(d){
            var done=t.history&&t.history.indexOf(d)>=0,isTd=d===todayStr;
            html+='<div onclick="event.stopPropagation();toggleHabitDay('+t.id+',\''+d+'\')" style="width:24px;height:24px;border-radius:4px;border:'+(isTd?'2px solid var(--accent)':'1px solid var(--border)')+';background:'+(done?'var(--green)':'var(--bg)')+';display:flex;align-items:center;justify-content:center;font-size:10px;cursor:pointer;color:'+(done?'#fff':'var(--muted)')+';">'+(done?'✓':(isTd?'·':''))+'</div>';
          });
          var sc=streak>=7?'#c2410c':streak>=3?'var(--green)':'var(--muted)';
          var pc=pct>=70?'var(--green)':pct>=40?'#f59e0b':'var(--red)';
          html+='<div style="text-align:center;font-size:13px;font-weight:700;color:'+sc+'">'+streak+'\uD83D\uDD25</div>'
            +'<div style="text-align:center"><div style="height:4px;background:var(--border);border-radius:2px;overflow:hidden;margin-bottom:2px"><div style="height:100%;width:'+pct+'%;background:'+pc+';border-radius:2px"></div></div>'
            +'<div style="font-size:10px;color:var(--muted);font-family:DM Mono,monospace">'+pct+'%</div></div></div>';
        });
      }
      html+='</div></div>';
    });
  } else {
    usedGroups.forEach(function(g){
      var gHabits=groups[g],gKey='g_'+g;
      if(!(gKey in groupOpenState))groupOpenState[gKey]=true;
      var isOpen=groupOpenState[gKey],label=g?(getGroupIcon(g)+' '+g):'📁 Tanpa Grup';
      html+='<div class="group-accordion"><div class="group-header" onclick="toggleGroup(\''+gKey+'\')">'
        +'<div class="group-header-left">'+label+'<span class="group-badge">'+gHabits.length+'</span></div>'
        +'<span class="group-chevron'+(isOpen?' open':'')+'">▼</span></div>'
        +'<div class="group-body'+(isOpen?' open':'')+'">';
      if(mob){
        html+='<div style="padding:6px 8px 8px;display:flex;flex-direction:column;gap:8px">';
        gHabits.forEach(function(t){
          var streak=calcStreak(t),mDone=days30.filter(function(d){return t.history&&t.history.indexOf(d)>=0;}).length,pct=Math.round(mDone/calcScheduledDays(t,days30)*100);
          var sc=streak>=7?'#c2410c':streak>=3?'var(--green)':'var(--muted)';
          var pc=pct>=70?'var(--green)':pct>=40?'#f59e0b':'var(--red)';
          var colorBorder=t.color?'border-left:3px solid '+t.color+';':'';
          var dotHtml='';
          days30.forEach(function(d){
            var done=t.history&&t.history.indexOf(d)>=0,isTd=d===todayStr;
            dotHtml+='<div onclick="toggleHabitDay('+t.id+',\''+d+'\')" title="'+fmtShort(d)+'" style="width:8px;height:16px;border-radius:2px;background:'+(done?'var(--green)':'#e7e5e4')+';cursor:pointer;outline:'+(isTd?'2px solid var(--accent)':'none')+';outline-offset:1px;flex-shrink:0"></div>';
          });
          html+='<div style="background:var(--card);border:1px solid var(--border);border-radius:10px;padding:10px 12px;'+colorBorder+'cursor:pointer" onclick="openDetail('+t.id+')">'
            +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">'
            +'<span style="font-size:13px;font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;margin-right:8px">'+t.name+'</span>'
            +'<span style="font-size:12px;font-weight:700;color:'+sc+';white-space:nowrap;flex-shrink:0">'+streak+'\uD83D\uDD25</span>'
            +'</div>'
            +'<div style="display:flex;gap:2px;align-items:center;overflow-x:auto;-webkit-overflow-scrolling:touch" onclick="event.stopPropagation()">'+dotHtml+'</div>'
            +'<div style="margin-top:8px;display:flex;align-items:center;gap:8px">'
            +'<div style="flex:1;height:4px;background:var(--border);border-radius:2px;overflow:hidden"><div style="height:100%;width:'+pct+'%;background:'+pc+';border-radius:2px"></div></div>'
            +'<span style="font-size:10px;color:var(--muted);font-family:DM Mono,monospace;flex-shrink:0">'+pct+'% (30hr)</span>'
            +'</div>'
            +'</div>';
        });
        html+='</div>';
      } else {
        var col30='1fr 200px 56px 50px';
        html+='<div class="hft-head" style="grid-template-columns:'+col30+';gap:4px">'
          +'<div>Habit</div><div style="font-size:9px;color:var(--muted)">← 30 hari (lama → hari ini)</div>'
          +'<div style="text-align:center">Streak</div><div style="text-align:center">%</div></div>';
        gHabits.forEach(function(t){
          var streak=calcStreak(t),mDone=days30.filter(function(d){return t.history&&t.history.indexOf(d)>=0;}).length,pct=Math.round(mDone/calcScheduledDays(t,days30)*100);
          var dotHtml='';
          days30.forEach(function(d){
            var done=t.history&&t.history.indexOf(d)>=0,isTd=d===todayStr;
            dotHtml+='<div onclick="toggleHabitDay('+t.id+',\''+d+'\')" title="'+fmtShort(d)+'" style="width:9px;height:14px;border-radius:2px;background:'+(done?'var(--green)':'#e7e5e4')+';cursor:pointer;outline:'+(isTd?'2px solid var(--accent)':'none')+';outline-offset:1px;flex-shrink:0"></div>';
          });
          var sc=streak>=7?'#c2410c':streak>=3?'var(--green)':'var(--muted)';
          var pc=pct>=70?'var(--green)':pct>=40?'#f59e0b':'var(--red)';
          html+='<div class="hft-row" style="grid-template-columns:'+col30+';gap:4px" onclick="openDetail('+t.id+')">'
            +'<div style="font-size:12px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+t.name+'</div>'
            +'<div style="display:flex;gap:2px;align-items:center;flex-wrap:wrap" onclick="event.stopPropagation()">'+dotHtml+'</div>'
            +'<div style="text-align:center;font-size:13px;font-weight:700;color:'+sc+'">'+streak+'\uD83D\uDD25</div>'
            +'<div style="text-align:center"><div style="height:4px;background:var(--border);border-radius:2px;overflow:hidden;margin-bottom:2px"><div style="height:100%;width:'+pct+'%;background:'+pc+';border-radius:2px"></div></div>'
            +'<div style="font-size:10px;color:var(--muted);font-family:DM Mono,monospace">'+pct+'%</div></div></div>';
        });
      }
      html+='</div></div>';
    });
  }
  el.innerHTML=html;
}
// ══════════════════════════════════════════════
// HABIT ANALISA PAGE
// ══════════════════════════════════════════════
function renderHabitAnalisa(el){
  var habits=tasks.filter(function(t){return t.type==='Habit';});
  if(!habits.length){
    el.innerHTML='<div class="empty"><div class="empty-icon">🧠</div>Belum ada habit untuk dianalisa.<br>Tambah habit dulu di halaman Habit Tracker!</div>';
    return;
  }

  // ── Hitung data statistik per habit ──
  var days7=[],days28=[],days30=[],days60=[],days90=[];
  for(var i=6;i>=0;i--)days7.push(offset(-i));
  for(var i=27;i>=0;i--)days28.push(offset(-i));
  for(var i=29;i>=0;i--)days30.push(offset(-i));
  for(var i=59;i>=0;i--)days60.push(offset(-i));
  for(var i=89;i>=0;i--)days90.push(offset(-i));

  var dayNames=['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

  var habitStats=habits.map(function(t){
    var s7=days7.filter(function(d){return t.history&&t.history.indexOf(d)>=0;}).length;
    var s30=days30.filter(function(d){return t.history&&t.history.indexOf(d)>=0;}).length;
    var s90=days90.filter(function(d){return t.history&&t.history.indexOf(d)>=0;}).length;
    var pct7=Math.round(s7/calcScheduledDays(t,days7)*100);
    var pct30=Math.round(s30/calcScheduledDays(t,days30)*100);
    var streak=calcStreak(t);
    // Best day of week (last 90 days)
    var dayCount=[0,0,0,0,0,0,0];
    days90.forEach(function(d){
      if(t.history&&t.history.indexOf(d)>=0){
        var dow=new Date(d+'T00:00:00').getDay();
        dayCount[dow]++;
      }
    });
    var bestDow=dayCount.indexOf(Math.max.apply(null,dayCount));
    var worstDow=dayCount.indexOf(Math.min.apply(null,dayCount));
    // Trend: compare last 15 days vs prev 15 days
    var last15=0,prev15=0;
    for(var i=0;i<15;i++){
      var d1=offset(-i),d2=offset(-i-15);
      if(t.history&&t.history.indexOf(d1)>=0)last15++;
      if(t.history&&t.history.indexOf(d2)>=0)prev15++;
    }
    var trend=last15-prev15; // positive = improving
    // Consistency score (0-100)
    var consistScore=pct30;
    // Grade
    var grade=consistScore>=85?'S':consistScore>=70?'A':consistScore>=55?'B':consistScore>=40?'C':'D';
    var gradeColor=consistScore>=85?'#10b981':consistScore>=70?'#3b82f6':consistScore>=55?'#f59e0b':consistScore>=40?'#f97316':'#ef4444';
    return {t:t,s7:s7,s30:s30,pct7:pct7,pct30:pct30,streak:streak,trend:trend,bestDow:bestDow,worstDow:worstDow,dayCount:dayCount,grade:grade,gradeColor:gradeColor,consistScore:consistScore};
  });

  // ── Ringkasan global ──
  var totalHabits=habits.length;
  var avgPct30=Math.round(habitStats.reduce(function(s,h){return s+h.pct30;},0)/totalHabits);
  var doneToday=habitStats.filter(function(h){return h.t.history&&h.t.history.indexOf(todayStr)>=0;}).length;
  var topStreak=habitStats.reduce(function(m,h){return h.streak>m.streak?h:m;},habitStats[0]);
  var needsWork=habitStats.filter(function(h){return h.pct30<50;}).sort(function(a,b){return a.pct30-b.pct30;});
  var improving=habitStats.filter(function(h){return h.trend>2;}).sort(function(a,b){return b.trend-a.trend;});
  var declining=habitStats.filter(function(h){return h.trend<-2;}).sort(function(a,b){return a.trend-b.trend;});

  // ── Health score ──
  var healthScore=Math.round(avgPct30*0.5+Math.min(topStreak.streak,30)/30*100*0.3+(doneToday/totalHabits)*100*0.2);
  var healthColor=healthScore>=80?'#10b981':healthScore>=60?'#3b82f6':healthScore>=40?'#f59e0b':'#ef4444';
  var healthLabel=healthScore>=80?'Luar Biasa! 🏆':healthScore>=60?'Bagus! 💪':healthScore>=40?'Butuh Perhatian ⚠️':'Perlu Perbaikan 🚨';

  // ── Streak heatmap 90 hari (gabungan semua habit) ──
  var heatHtml='';
  days90.forEach(function(d){
    var doneCount=habits.filter(function(t){return t.history&&t.history.indexOf(d)>=0;}).length;
    var pct=habits.length?doneCount/habits.length:0;
    var bg=pct>=0.8?'#10b981':pct>=0.5?'#34d399':pct>0?'#6ee7b7':'var(--border)';
    var dow=new Date(d+'T00:00:00').getDay();
    var isToday=d===todayStr;
    heatHtml+='<div title="'+fmtShort(d)+': '+doneCount+'/'+habits.length+'" style="width:10px;height:10px;border-radius:2px;background:'+bg+';flex-shrink:0;outline:'+(isToday?'2px solid var(--accent)':'none')+';outline-offset:1px"></div>';
  });

  // ── Best day of week analysis ──
  var dowTotals=[0,0,0,0,0,0,0];
  habitStats.forEach(function(h){
    h.dayCount.forEach(function(c,i){dowTotals[i]+=c;});
  });
  var dowMax=Math.max.apply(null,dowTotals)||1;
  var bestDowGlobal=dowTotals.indexOf(Math.max.apply(null,dowTotals));
  var worstDowGlobal=dowTotals.indexOf(Math.min.apply(null,dowTotals));
  var dowBarsHtml=dowTotals.map(function(c,i){
    var pct=Math.round(c/dowMax*100);
    var isBest=i===bestDowGlobal,isWorst=i===worstDowGlobal;
    var barColor=isBest?'#10b981':isWorst?'#ef4444':'var(--accent)';
    return '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1">'
      +'<div style="width:100%;background:var(--border);border-radius:4px;height:50px;display:flex;align-items:flex-end;overflow:hidden">'
      +'<div style="width:100%;height:'+pct+'%;background:'+barColor+';border-radius:4px;transition:height 0.4s"></div></div>'
      +'<div style="font-size:10px;font-weight:700;color:'+(isBest?'#10b981':isWorst?'#ef4444':'var(--muted)')+'">'
      +dayNames[i]+'</div></div>';
  }).join('');


  // ── Analisa Cerdas Lokal ──
  var insight = buildHabitInsight(habitStats, avgPct30, topStreak, needsWork, improving, declining, bestDowGlobal, worstDowGlobal, dayNames, totalHabits, doneToday);

  // ── Render HTML ──
  var html='';

  // Back button
  html+='<div style="margin-bottom:16px">'
    +'<button onclick="switchView(\'habits\')" style="display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:20px;border:1px solid var(--border);background:var(--card);color:var(--muted);font-size:12px;font-weight:600;cursor:pointer;font-family:\'DM Sans\',sans-serif">'
    +'\u2190 Kembali ke Habit Tracker</button></div>';

  // Health score card
  html+='<div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px;margin-bottom:14px;text-align:center">'
    +'<div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Habit Health Score</div>'
    +'<div style="font-size:64px;font-weight:900;color:'+healthColor+';line-height:1;font-family:DM Mono,monospace">'+healthScore+'</div>'
    +'<div style="font-size:13px;font-weight:700;color:'+healthColor+';margin-top:4px">'+healthLabel+'</div>'
    +'<div style="display:flex;justify-content:center;gap:24px;margin-top:16px;flex-wrap:wrap">'
    +'<div style="text-align:center"><div style="font-size:20px;font-weight:800;color:var(--text)">'+doneToday+'/'+totalHabits+'</div><div style="font-size:11px;color:var(--muted)">Selesai Hari Ini</div></div>'
    +'<div style="text-align:center"><div style="font-size:20px;font-weight:800;color:var(--text)">'+avgPct30+'%</div><div style="font-size:11px;color:var(--muted)">Rata-rata 30 hari</div></div>'
    +'<div style="text-align:center"><div style="font-size:20px;font-weight:800;color:var(--text)">'+topStreak.streak+'\uD83D\uDD25</div><div style="font-size:11px;color:var(--muted)">Streak Terbaik</div></div>'
    +'</div></div>';

  // ── AI Insight (Groq) — paling atas ──
  html += '<div id="habitAnalisaAIBox" style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:16px;margin-bottom:14px">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">'
    +'<div style="font-size:13px;font-weight:700;color:var(--text)">🤖 Analisa AI Personal</div>'
    +'<button onclick="refreshHabitAI()" style="font-size:11px;padding:4px 10px;border-radius:10px;border:1px solid var(--border);background:var(--bg);color:var(--muted);cursor:pointer;font-family:\'DM Sans\',sans-serif">↻ Refresh</button>'
    +'</div>'
    +'<div style="font-size:11px;color:var(--muted);margin-bottom:10px">Saran personal berbasis pola habit kamu — powered by Llama 70B</div>'
    +'<div id="habitAILoading" style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--muted);padding:8px 0">'
    +'<span style="display:inline-flex;gap:3px"><span class="ai-dot"></span><span class="ai-dot" style="animation-delay:0.2s"></span><span class="ai-dot" style="animation-delay:0.4s"></span></span>'
    +'Sedang menganalisa pola habit kamu...</div>'
    +'<div id="habitAIText" style="display:none;font-size:13px;color:var(--text);line-height:1.7"></div>'
    +'<div id="habitAIError" style="display:none;font-size:12px;color:#ef4444;padding:8px 0"></div>'
    +'</div>';

  // ── Tabs: Laporan Mingguan & Bulanan ──
  html += renderHabitReportTabs(habitStats, habits, days7, days30, days60, avgPct30, topStreak, doneToday, totalHabits);

  // Heatmap 90 hari (gabungan semua habit)
  html+='<div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:16px;margin-bottom:14px">'
    +'<div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:10px">\uD83D\uDCCA Aktivitas 90 Hari Terakhir</div>'
    +'<div style="display:flex;gap:3px;flex-wrap:wrap">'+heatHtml+'</div>'
    +'<div style="display:flex;gap:8px;align-items:center;margin-top:8px;font-size:10px;color:var(--muted)">'
    +'<span>Kurang</span>'
    +'<div style="width:10px;height:10px;border-radius:2px;background:var(--border)"></div>'
    +'<div style="width:10px;height:10px;border-radius:2px;background:#6ee7b7"></div>'
    +'<div style="width:10px;height:10px;border-radius:2px;background:#34d399"></div>'
    +'<div style="width:10px;height:10px;border-radius:2px;background:#10b981"></div>'
    +'<span>Sempurna</span></div></div>';

  // Best/worst day of week
  html+='<div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:16px;margin-bottom:14px">'
    +'<div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:4px">\uD83D\uDCC5 Hari Terbaik vs Terlemah</div>'
    +'<div style="font-size:11px;color:var(--muted);margin-bottom:12px">Gabungan semua habit \u2014 90 hari terakhir</div>'
    +'<div style="display:flex;gap:6px;align-items:flex-end">'+dowBarsHtml+'</div>'
    +'<div style="display:flex;gap:12px;margin-top:10px;flex-wrap:wrap">'
    +'<span style="font-size:11px;color:#10b981;font-weight:700">\uD83C\uDFC6 Terbaik: '+dayNames[bestDowGlobal]+'</span>'
    +'<span style="font-size:11px;color:#ef4444;font-weight:700">\u26A0\uFE0F Terlemah: '+dayNames[worstDowGlobal]+'</span>'
    +'</div></div>';

  // ── Prediksi Kegagalan Besok ──
  html += renderFailurePredictionCard(habitStats, days30);

  // ── Habit Correlation ──
  html += renderCorrelationCard(habits, days60);

  // ── Rapor Per Habit ──
  html+='<div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:16px;margin-bottom:14px">'
    +'<div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:4px">\uD83C\uDFC5 Rapor Per Habit</div>'
    +'<div style="font-size:11px;color:var(--muted);margin-bottom:12px">Heatmap 28 hari + tren mingguan per habit</div>'
    +'<div style="display:flex;flex-direction:column">';
  habitStats.sort(function(a,b){return b.consistScore-a.consistScore;}).forEach(function(h){
    html += renderExtendedHabitCard(h, days28);
  });
  html+='</div></div>';

  // ── Insight Cerdas (Rule-based) ──
  html += renderHabitInsightBox(insight);

  el.innerHTML=html;

  // Trigger AI call setelah render
  _callHabitAI(habitStats, avgPct30, topStreak, needsWork, improving, declining, bestDowGlobal, worstDowGlobal, dayNames, totalHabits, doneToday, habits);
}

// ── Render tab Laporan Mingguan + Bulanan ──
function renderHabitReportTabs(habitStats, habits, days7, days30, days60, avgPct30, topStreak, doneToday, totalHabits) {
  var dayNames=['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
  var todayStr=offset(0);

  // Weekly stats
  var weekStats=habitStats.map(function(h){
    var done=days7.filter(function(d){return h.t.history&&h.t.history.indexOf(d)>=0;}).length;
    return{name:h.t.name,done:done,pct:Math.round(done/7*100)};
  });
  var weekTotal=weekStats.reduce(function(s,h){return s+h.done;},0);
  var weekPct=Math.round(weekTotal/((habits.length*7)||1)*100);

  // Weekly heatmap cells
  var cellsHtml=days7.map(function(d){
    var cnt=habits.filter(function(h){return h.history&&h.history.indexOf(d)>=0;}).length;
    var pct=habits.length?cnt/habits.length:0;
    var bg=pct>=0.8?'#10b981':pct>=0.5?'#34d399':pct>0?'#6ee7b7':'var(--border)';
    var dow=new Date(d+'T00:00:00').getDay();
    var isToday=d===todayStr;
    return '<div title="'+fmtShort(d)+': '+cnt+'/'+habits.length+'" style="flex:1;text-align:center;padding:6px 2px;border-radius:6px;background:'+bg+';font-size:9px;font-weight:700;color:'+(pct>=0.5?'#fff':'var(--muted)')+';outline:'+(isToday?'2px solid var(--accent)':'none')+';outline-offset:1px">'+dayNames[dow]+'</div>';
  }).join('');

  // Per-habit weekly list
  var weekListHtml=weekStats.sort(function(a,b){return b.pct-a.pct;}).map(function(s){
    var c=s.pct>=70?'#10b981':s.pct>=40?'#f59e0b':'#ef4444';
    var bg=s.pct>=70?'#d1fae5':s.pct>=40?'#fef3c7':'#fee2e2';
    return '<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border)">'
      +'<div style="flex:1;font-size:12px;font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+s.name+'</div>'
      +'<div style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;background:'+bg+';color:'+c+'">'+s.pct+'%</div>'
      +'<div style="font-size:11px;color:var(--muted);width:30px;text-align:right">'+s.done+'/7</div>'
      +'</div>';
  }).join('');

  // Monthly per-habit
  var monthListHtml=habitStats.sort(function(a,b){return b.pct30-a.pct30;}).map(function(h,i){
    var medal=i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1);
    var c=h.pct30>=70?'#10b981':h.pct30>=40?'#f59e0b':'#ef4444';
    var bg=h.pct30>=70?'#d1fae5':h.pct30>=40?'#fef3c7':'#fee2e2';
    return '<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border)">'
      +'<div style="font-size:12px;width:22px;flex-shrink:0">'+medal+'</div>'
      +'<div style="flex:1;font-size:12px;font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+h.t.name+'</div>'
      +'<div style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;background:'+bg+';color:'+c+'">'+h.pct30+'%</div>'
      +'</div>';
  }).join('');

  // Monthly weekly trend bars
  var weekCount=4;
  var weekBarsHtml='';
  for(var w=weekCount-1;w>=0;w--){
    var wDone=0,wTotal=0;
    for(var d=0;d<7;d++){
      var dt=offset(-(w*7+d));
      habits.forEach(function(h){if(h.history&&h.history.indexOf(dt)>=0)wDone++;wTotal++;});
    }
    var wPct=wTotal?Math.round(wDone/wTotal*100):0;
    var barH=Math.max(4,Math.round(wPct*0.5));
    var bc=wPct>=70?'#10b981':wPct>=50?'#3b82f6':wPct>=30?'#f59e0b':'#ef4444';
    weekBarsHtml+='<div style="display:flex;flex-direction:column;align-items:center;gap:3px;flex:1">'
      +'<div style="font-size:10px;color:var(--muted);font-weight:600">'+wPct+'%</div>'
      +'<div style="width:100%;background:var(--border);border-radius:3px;height:48px;display:flex;align-items:flex-end;overflow:hidden">'
      +'<div style="width:100%;height:'+barH+'px;background:'+bc+';border-radius:3px;min-height:4px"></div></div>'
      +'<div style="font-size:9px;color:var(--muted)">W'+(weekCount-w)+'</div>'
      +'</div>';
  }

  var html='<div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:16px;margin-bottom:14px">'
    +'<div style="display:flex;gap:6px;margin-bottom:14px;background:var(--bg);border-radius:20px;padding:3px">'
    +'<button id="tabWeekBtn" onclick="switchReportTab(\'week\')" style="flex:1;padding:6px;border-radius:16px;border:none;background:var(--accent);color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif">📅 Mingguan</button>'
    +'<button id="tabMonthBtn" onclick="switchReportTab(\'month\')" style="flex:1;padding:6px;border-radius:16px;border:none;background:transparent;color:var(--muted);font-size:12px;font-weight:600;cursor:pointer;font-family:\'DM Sans\',sans-serif">📆 Bulanan</button>'
    +'</div>'

    // Weekly tab
    +'<div id="tabWeekContent">'
    +'<div style="text-align:center;margin-bottom:14px">'
    +'<div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Completion Rate Minggu Ini</div>'
    +'<div style="font-size:48px;font-weight:900;line-height:1;color:'+(weekPct>=70?'#10b981':weekPct>=40?'#f59e0b':'#ef4444')+';font-family:DM Mono,monospace">'+weekPct+'%</div>'
    +'</div>'
    +'<div style="display:flex;gap:4px;margin-bottom:12px">'+cellsHtml+'</div>'
    +'<div>'+weekListHtml+'</div>'
    +'<button onclick="_shareWeekReport()" style="width:100%;margin-top:12px;padding:10px;border-radius:10px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:13px;font-weight:600;cursor:pointer;font-family:\'DM Sans\',sans-serif">📤 Salin Ringkasan untuk Di-share</button>'
    +'</div>'

    // Monthly tab
    +'<div id="tabMonthContent" style="display:none">'
    +'<div style="text-align:center;margin-bottom:14px">'
    +'<div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Rata-rata 30 Hari</div>'
    +'<div style="font-size:48px;font-weight:900;line-height:1;color:'+(avgPct30>=70?'#10b981':avgPct30>=40?'#f59e0b':'#ef4444')+';font-family:DM Mono,monospace">'+avgPct30+'%</div>'
    +'</div>'
    +'<div style="margin-bottom:12px">'
    +'<div style="font-size:11px;color:var(--muted);font-weight:600;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px">Tren 4 Minggu Terakhir</div>'
    +'<div style="display:flex;gap:6px;align-items:flex-end;height:72px">'+weekBarsHtml+'</div>'
    +'</div>'
    +'<div>'+monthListHtml+'</div>'
    +'<button onclick="_shareMonthReport()" style="width:100%;margin-top:12px;padding:10px;border-radius:10px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:13px;font-weight:600;cursor:pointer;font-family:\'DM Sans\',sans-serif">📤 Salin Laporan Bulanan</button>'
    +'</div>'
    +'</div>';

  return html;
}

function switchReportTab(tab){
  var isWeek=tab==='week';
  document.getElementById('tabWeekContent').style.display=isWeek?'block':'none';
  document.getElementById('tabMonthContent').style.display=isWeek?'none':'block';
  document.getElementById('tabWeekBtn').style.background=isWeek?'var(--accent)':'transparent';
  document.getElementById('tabWeekBtn').style.color=isWeek?'#fff':'var(--muted)';
  document.getElementById('tabMonthBtn').style.background=isWeek?'transparent':'var(--accent)';
  document.getElementById('tabMonthBtn').style.color=isWeek?'var(--muted)':'#fff';
}

// ── Groq AI Call ──
var _habitAIData=null;
function _callHabitAI(habitStats,avgPct30,topStreak,needsWork,improving,declining,bestDow,worstDow,dayNames,totalHabits,doneToday,habits){
  _habitAIData={habitStats:habitStats,avgPct30:avgPct30,topStreak:topStreak,needsWork:needsWork,improving:improving,declining:declining,bestDow:bestDow,worstDow:worstDow,dayNames:dayNames,totalHabits:totalHabits,doneToday:doneToday,habits:habits};
  var loading=document.getElementById('habitAILoading');
  var textEl=document.getElementById('habitAIText');
  var errEl=document.getElementById('habitAIError');
  if(!loading||!textEl) return;
  loading.style.display='flex'; textEl.style.display='none'; errEl.style.display='none';

  var prompt='Kamu adalah coach produktivitas personal. Analisa pola habit berikut dan berikan saran DALAM BAHASA INDONESIA.\n\n';
  prompt+='Jumlah habit: '+totalHabits+'\n';
  prompt+='Selesai hari ini: '+doneToday+'/'+totalHabits+'\n';
  prompt+='Rata-rata 30 hari: '+avgPct30+'%\n';
  prompt+='Streak terbaik: '+topStreak.streak+' hari ('+topStreak.t.name+')\n';
  prompt+='Hari terkuat: '+dayNames[bestDow]+', hari terlemah: '+dayNames[worstDow]+'\n';
  if(needsWork.length) prompt+='Habit butuh perhatian: '+needsWork.slice(0,3).map(function(h){return h.t.name+' ('+h.pct30+'%)';}).join(', ')+'\n';
  if(improving.length) prompt+='Habit membaik: '+improving.slice(0,2).map(function(h){return h.t.name;}).join(', ')+'\n';
  if(declining.length) prompt+='Habit menurun: '+declining.slice(0,2).map(function(h){return h.t.name;}).join(', ')+'\n';
  prompt+='\nSemua habit: '+habits.map(function(h){return h.name;}).join(', ')+'\n\n';
  prompt+='Tulis 3 paragraf pendek: 1) diagnosis karakter habit secara keseluruhan, 2) kekuatan terbesar yang perlu dijaga, 3) satu prioritas perbaikan paling penting dengan langkah konkret. Maksimal 160 kata. Tone: hangat, personal, jujur seperti teman dekat. Jangan pakai bullet points.';

  fetch('/.netlify/functions/groq-proxy',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({messages:[{role:'user',content:prompt}]})
  })
  .then(function(r){return r.json();})
  .then(function(data){
    if(data.error||!data.choices){
      errEl.textContent='Gagal mendapat analisa AI: '+(data.error||'Response tidak valid');
      loading.style.display='none'; errEl.style.display='block'; return;
    }
    var resp=data.choices[0].message.content;
    textEl.innerHTML=resp.split(/\n\n+/).map(function(p){return '<p style="margin-bottom:10px;last-child:margin-bottom:0">'+p+'</p>';}).join('');
    loading.style.display='none'; textEl.style.display='block';
  })
  .catch(function(e){
    errEl.textContent='Koneksi ke AI gagal. Coba reload ChiTask atau hubungi Developer.';
    loading.style.display='none'; errEl.style.display='block';
  });
}

function refreshHabitAI(){
  if(!_habitAIData) return;
  var d=_habitAIData;
  _callHabitAI(d.habitStats,d.avgPct30,d.topStreak,d.needsWork,d.improving,d.declining,d.bestDow,d.worstDow,d.dayNames,d.totalHabits,d.doneToday,d.habits);
}

function _shareWeekReport(){
  var habits=tasks.filter(function(t){return t.type==='Habit';});
  var days7=[];for(var i=6;i>=0;i--)days7.push(offset(-i));
  var weekPct=0,lines='';
  habits.forEach(function(h){
    var done=days7.filter(function(d){return h.history&&h.history.indexOf(d)>=0;}).length;
    var pct=Math.round(done/7*100);
    weekPct+=pct;
    lines+='• '+h.name+': '+pct+'% ('+done+'/7)\n';
  });
  weekPct=habits.length?Math.round(weekPct/habits.length):0;
  var txt='📊 Laporan Habit Mingguan\n\nCompletion Rate: '+weekPct+'%\n\n'+lines+'\nDibuat dengan ChiTask';
  navigator.clipboard&&navigator.clipboard.writeText(txt).then(function(){alert('Laporan disalin! Siap di-paste ke WhatsApp/Notes.');}).catch(function(){alert(txt);});
}

function _shareMonthReport(){
  var habits=tasks.filter(function(t){return t.type==='Habit';});
  var days30=[];for(var i=29;i>=0;i--)days30.push(offset(-i));
  var lines='';
  habits.forEach(function(h){
    var done=days30.filter(function(d){return h.history&&h.history.indexOf(d)>=0;}).length;
    lines+='• '+h.name+': '+Math.round(done/30*100)+'%\n';
  });
  var txt='📆 Laporan Habit Bulanan (30 Hari)\n\n'+lines+'\nDibuat dengan ChiTask';
  navigator.clipboard&&navigator.clipboard.writeText(txt).then(function(){alert('Laporan disalin!');}).catch(function(){alert(txt);});
}

// ══════════════════════════════════════════════════════════════
// HABIT INSIGHT ENGINE v2 — Smart Analytics (Rule-based, offline)
// ══════════════════════════════════════════════════════════════

// ── Hitung prediksi gagal besok berdasarkan pola historis ──
function calcFailurePrediction(habitStat, days30) {
  var t = habitStat.t;
  if(!t.history || t.history.length < 7) return null;
  // Ambil hari besok
  var tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1);
  var tomorrowDow = tomorrow.getDay();
  var dayNames = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

  // Hitung rate completion untuk hari besok (hari yang sama dalam 4 minggu terakhir)
  var sameDoWDays = [];
  for(var i=1;i<=28;i++){
    var d=new Date(); d.setDate(d.getDate()-i);
    if(d.getDay()===tomorrowDow){
      var ds=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
      sameDoWDays.push(ds);
    }
  }
  var doneOnDoW = sameDoWDays.filter(function(d){return t.history.indexOf(d)>=0;}).length;
  var dowRate = sameDoWDays.length ? Math.round(doneOnDoW/sameDoWDays.length*100) : 50;

  // Apakah streak sedang aktif atau baru putus?
  var streakBonus = habitStat.streak > 0 ? 15 : -15;
  // Trend faktor
  var trendBonus = habitStat.trend > 2 ? 10 : habitStat.trend < -2 ? -10 : 0;

  var successProb = Math.min(100, Math.max(0, dowRate + streakBonus + trendBonus));
  var failProb = 100 - successProb;

  var riskLevel = failProb >= 60 ? 'tinggi' : failProb >= 40 ? 'sedang' : 'rendah';
  var riskColor = failProb >= 60 ? '#ef4444' : failProb >= 40 ? '#f59e0b' : '#10b981';
  var riskEmoji = failProb >= 60 ? '🚨' : failProb >= 40 ? '⚠️' : '✅';

  return {
    failProb: failProb,
    successProb: successProb,
    dowRate: dowRate,
    tomorrowDay: dayNames[tomorrowDow],
    riskLevel: riskLevel,
    riskColor: riskColor,
    riskEmoji: riskEmoji,
    habitName: t.name
  };
}

// ── Hitung habit correlation matrix ──
function calcHabitCorrelation(habits, days60) {
  if(habits.length < 2) return [];
  var correlations = [];
  for(var i=0;i<habits.length;i++){
    for(var j=i+1;j<habits.length;j++){
      var h1=habits[i], h2=habits[j];
      var bothDone=0, onlyH1=0, onlyH2=0, neitherDone=0;
      days60.forEach(function(d){
        var d1=h1.history&&h1.history.indexOf(d)>=0;
        var d2=h2.history&&h2.history.indexOf(d)>=0;
        if(d1&&d2) bothDone++;
        else if(d1) onlyH1++;
        else if(d2) onlyH2++;
        else neitherDone++;
      });
      var total=days60.length;
      // Phi coefficient (correlation -1 to 1)
      var p1=(bothDone+onlyH1)/total, p2=(bothDone+onlyH2)/total;
      var num=(bothDone/total) - p1*p2;
      var den=Math.sqrt(p1*(1-p1)*p2*(1-p2));
      var phi = den>0 ? Math.round(num/den*100)/100 : 0;
      var pct = Math.round(total>0?bothDone/total*100:0);
      correlations.push({
        h1:h1, h2:h2,
        bothDone:bothDone, total:total, pct:pct,
        phi:phi,
        type: phi>=0.4?'strong_pos':phi>=0.2?'weak_pos':phi<=-0.2?'negative':'neutral'
      });
    }
  }
  return correlations.sort(function(a,b){return Math.abs(b.phi)-Math.abs(a.phi);});
}

// ── Hitung weekly trend per habit (4 minggu terakhir) ──
function calcWeeklyTrend(habitStat) {
  var t = habitStat.t;
  var weeks = [];
  for(var w=3;w>=0;w--){
    var cnt=0;
    for(var d=0;d<7;d++){
      var offset_days = w*7+d;
      var date=new Date(); date.setDate(date.getDate()-offset_days);
      var ds=date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');
      if(t.history&&t.history.indexOf(ds)>=0) cnt++;
    }
    weeks.push(cnt);
  }
  return weeks; // [oldest, ..., newest]
}

// ══════════════════════════════════════════════════════════════
// HABIT CONTEXT ENGINE — Deteksi kategori & keyword per habit
// ══════════════════════════════════════════════════════════════
var HABIT_CONTEXT_MAP = {
  ibadah: {
    groups: ['ibadah'],
    keywords: ['sholat','shalat','solat','subuh','zhuhur','zuhur','ashar','maghrib','isya','tahajud','dhuha','dhuha','tarawih','witir','quran','qur\'an','al-quran','ngaji','mengaji','dzikir','zikir','doa','berdoa','puasa','sedekah','infaq','zakat','istighfar','sunnah','fardhu','wajib','ibadah','spiritual','sholawat'],
    emoji: '🕌',
    label: 'Ibadah',
    tips: {
      low:    'Sholat/ibadah adalah tiang agama — jangan sampai terlewat. Coba pasang alarm untuk setiap waktu sholat dan langsung bergerak begitu adzan berkumandang.',
      mid:    'Konsistensimu dalam ibadah sudah lumayan, tapi masih ada yang terlewat. Ingat: satu waktu sholat yang tertinggal lebih baik diqadha daripada ditinggal. Buat rutinitas wudhu lebih mudah (siapkan air di tempat yang mudah dijangkau).',
      high:   'Mashaa Allah, konsistensi ibadahmu luar biasa! Jaga niat agar tetap ikhlas. Pertimbangkan menambah amalan sunnah seperti sholat dhuha atau membaca Al-Quran setiap hari.',
      streak_break: 'Jangan putus asa jika terlewat — segera qadha dan mulai kembali. Ingat, Allah Maha Pengampun. Satu langkah kembali lebih baik dari terus menunda.',
      best_time: 'Waktu terbaik ibadah sudah terjadwal oleh syariat — manfaatkan momen setelah sholat fardhu untuk amalan tambahan seperti dzikir pagi/petang atau tilawah.',
      challenge: 'Tantangan minggu ini: jaga 5 waktu sholat tepat di awal waktu, tanpa terlambat. Tambahkan minimal 5 menit dzikir setelah sholat subuh.'
    }
  },
  olahraga: {
    groups: ['olahraga'],
    keywords: ['olahraga','lari','jogging','gym','angkat beban','push up','sit up','squat','plank','renang','bersepeda','sepeda','yoga','pilates','zumba','hiit','kardio','cardio','stretching','pemanasan','pull up','chin up','deadlift','bench press','workout','latihan','fitness','senam','badminton','tenis','futsal','basket','voli','berenang','jalan kaki','mountain biking','hiking','trail'],
    emoji: '💪',
    label: 'Olahraga',
    tips: {
      low:    'Olahraga butuh momentum awal yang kuat. Mulai dari yang paling mudah — 10 menit jalan kaki sudah cukup untuk memulai kebiasaan bergerak. Letakkan sepatu olahraga di pintu kamar agar jadi pengingat visual.',
      mid:    'Jadwal olahragamu mulai terbentuk. Kunci konsistensi: tentukan waktu tetap (pagi/sore) dan anggap itu seperti meeting yang tidak bisa dibatalkan. Siapkan baju olahraga malam sebelumnya.',
      high:   'Program latihanmu sudah sangat konsisten! Waktunya naik level — coba tambah intensitas, durasi, atau variasi gerakan agar tubuh terus berkembang dan tidak plateau.',
      streak_break: 'Istirahat 1-2 hari itu normal dan bahkan dianjurkan untuk recovery otot. Yang penting jangan biarkan jeda menjadi lebih dari 3 hari — efek detraining mulai terasa di hari ke-4.',
      best_time: 'Data menunjukkan kamu paling konsisten berolahraga di hari-hari tertentu. Manfaatkan pola ini: jadwalkan sesi paling berat di hari-hari tersebut dan sesi ringan (stretching/jalan kaki) di hari lainnya.',
      challenge: 'Tantangan minggu ini: lakukan olahraga setiap hari meski cuma 15 menit. Variasikan: 2 hari cardio, 2 hari strength, 1 hari yoga/stretching, 2 hari aktifitas ringan.'
    }
  },
  kesehatan: {
    groups: ['kesehatan'],
    keywords: ['minum air','minum vitamin','vitamin','suplemen','obat','tidur','bangun','istirahat','detox','check up','timbang','berat badan','tekanan darah','gula darah','kesehatan','sehat','sakit','flu','vaksin','dokter','terapi','meditasi','napas','pernapasan','mata','berjemur','kulit','dental','gigi','cuci tangan'],
    emoji: '❤️',
    label: 'Kesehatan',
    tips: {
      low:    'Kesehatan adalah investasi jangka panjang. Mulai dari hal terkecil: minum 8 gelas air sehari, tidur 7-8 jam, dan jalan kaki 30 menit. Tiga hal ini sudah berdampak besar pada kesehatan secara keseluruhan.',
      mid:    'Rutinitas kesehatanmu sudah mulai terbentuk. Evaluasi: apakah kamu cukup tidur? Kualitas tidur sama pentingnya dengan durasi. Coba buat jadwal tidur dan bangun yang konsisten termasuk weekend.',
      high:   'Gaya hidup sehatmu luar biasa konsisten! Pertimbangkan untuk tracking lebih dalam: catat energi harian, kualitas tidur, atau lakukan medical check-up rutin untuk memastikan semua dalam kondisi optimal.',
      streak_break: 'Satu hari melewatkan rutinitas kesehatan tidak merusak segalanya. Tubuh punya mekanisme pemulihan — yang penting kamu kembali ke rutinitas besok. Jangan kompensasi berlebihan.',
      best_time: 'Tubuh punya jam biologis (circadian rhythm). Manfaatkan: minum air segera setelah bangun, olahraga di pagi hari, dan hindari layar 1 jam sebelum tidur untuk kualitas tidur yang lebih baik.',
      challenge: 'Tantangan minggu ini: tidur sebelum jam 23.00 setiap malam dan bangun di waktu yang sama. Tambahkan minum segelas air putih pertama sebelum apapun di pagi hari.'
    }
  },
  produktivitas: {
    groups: ['produktivitas'],
    keywords: ['baca','membaca','belajar','nulis','menulis','coding','code','kerja','deep work','fokus','pomodoro','jurnal','journaling','review','planning','riset','research','skill','kursus','podcast','audiobook','notula','catatan','meeting','presentasi','review harian','weekly review','inbox zero','todo','project','deadline','target','goal'],
    emoji: '🧠',
    label: 'Produktivitas',
    tips: {
      low:    'Produktivitas dimulai dari satu sesi fokus sehari. Coba teknik Pomodoro: 25 menit kerja tanpa distraksi, lalu 5 menit istirahat. Matikan notifikasi HP selama sesi tersebut.',
      mid:    'Rutinitas produktifmu mulai terbentuk, tapi belum konsisten. Coba "anchor habit": tautkan kebiasaan belajar/kerja dengan kegiatan yang sudah rutin — misalnya baca 10 halaman setelah sarapan, sebelum buka medsos.',
      high:   'Kebiasaan produktifmu sangat kuat! Pastikan kamu juga menjaga keseimbangan — produktivitas tinggi tanpa recovery akan menyebabkan burnout. Jadwalkan waktu untuk istirahat dan aktivitas yang kamu nikmati.',
      streak_break: 'Skip satu hari belajar/bekerja itu manusiawi. Yang berbahaya adalah "skip 2 hari berturut-turut" — itu yang membunuh momentum. Hari ini, lakukan versi mini-nya minimal 10 menit.',
      best_time: 'Setiap orang punya "peak hours" produktivitas. Berdasarkan pola habitual kamu, jadwalkan tugas paling berat dan kreatif di jam tersebut, dan tugas rutin/admin di jam energi rendah.',
      challenge: 'Tantangan minggu ini: lakukan "deep work" minimal 1 jam tanpa HP dan notifikasi setiap hari. Catat apa yang kamu capai setiap sesi — ini akan memotivasi kamu untuk mempertahankannya.'
    }
  },
  mindfulness: {
    groups: ['mindfulness'],
    keywords: ['meditasi','meditasi','mindfulness','napas','pernapasan','breathing','relaksasi','yoga','journaling','syukur','gratitude','afirmasi','visualisasi','tenang','stress','cemas','anxiety','self care','me time','refleksi','kontemplasi','mindful'],
    emoji: '🧘',
    label: 'Mindfulness',
    tips: {
      low:    'Mindfulness tidak butuh waktu lama — mulai dari 5 menit meditasi pernapasan setiap pagi. Duduk, tutup mata, fokus pada napas masuk dan keluar. Ini sudah terbukti mengurangi stres secara signifikan.',
      mid:    'Praktik mindfulness-mu sudah mulai terasa. Coba tingkatkan: tambahkan sesi journaling 5 menit sebelum tidur untuk mencatat 3 hal yang kamu syukuri hari ini. Ini memprogram otak untuk fokus ke hal positif.',
      high:   'Komitmenmu pada mindfulness sangat inspiring! Pertimbangkan mendalami teknik yang lebih advanced — meditasi body scan, loving kindness meditation, atau retreat mindfulness untuk memperdalam praktikmu.',
      streak_break: 'Kehilangan ketenangan sesekali adalah bagian dari perjalanan — ini bukan kegagalan mindfulness, ini adalah kesempatan untuk mempraktikkan self-compassion. Mulai kembali dengan satu napas dalam.',
      best_time: 'Mindfulness paling efektif di pagi hari sebelum pikiran dipenuhi aktivitas, atau malam hari sebagai ritual wind-down sebelum tidur. Coba konsisten di salah satu waktu tersebut.',
      challenge: 'Tantangan minggu ini: lakukan 10 menit meditasi setiap pagi sebelum buka HP. Catat perasaanmu sebelum dan sesudah — kamu akan terkejut betapa berbedanya kondisi mental sepanjang hari.'
    }
  },
  nutrisi: {
    groups: ['nutrisi'],
    keywords: ['makan','sarapan','makan siang','makan malam','diet','nutrisi','sayur','buah','protein','kalori','intermittent fasting','puasa makan','meal prep','masak','memasak','snack','jus','smoothie','suplemen','vitamin','omega','probiotik','serat','gula','garam','kolesterol','hidrat','karbohidrat'],
    emoji: '🥗',
    label: 'Nutrisi',
    tips: {
      low:    'Pola makan yang baik dimulai dari satu keputusan konsisten. Mulai dari yang sederhana: sarapan setiap hari sebelum jam 9 pagi, atau tambahkan satu porsi sayur/buah di setiap makan. Jangan langsung mengubah semua.',
      mid:    'Kebiasaan makan sehatmu sudah mulai terbentuk. Tips kunci: meal prep di akhir pekan untuk persiapkan makanan sehat selama seminggu. Ini mengurangi "keputusan" makan di saat lapar yang biasanya berakhir dengan pilihan yang kurang sehat.',
      high:   'Pola nutrisimu sangat disiplin! Pastikan kamu tidak terlalu ketat sampai menimbulkan stres — "80/20 rule" dalam nutrisi: 80% makanan bergizi, 20% boleh menikmati makanan favorit. Keseimbangan adalah kuncinya.',
      streak_break: 'Satu hari makan tidak sesuai rencana tidak merusak program nutrisimu. Tubuh tidak berubah dalam sehari — yang penting konsistensi jangka panjang, bukan perfeksionisme.',
      best_time: 'Waktu makan berpengaruh pada metabolisme. Usahakan makan dalam window 8-10 jam (misalnya 7 pagi – 7 malam) dan hindari makan berat 3 jam sebelum tidur untuk kualitas tidur dan pencernaan yang lebih baik.',
      challenge: 'Tantangan minggu ini: tambahkan satu porsi sayuran hijau di setiap makan siang dan malam. Tujuh hari berturut-turut. Mulai dari yang mudah — bayam, kangkung, atau brokoli bisa jadi pilihan.'
    }
  },
  sosial: {
    groups: ['sosial'],
    keywords: ['hubungi','telpon','phone','video call','kunjungi','silaturahmi','keluarga','teman','sahabat','networking','komunitas','organisasi','sosial','berbagi','volunteer','sukarela','mentor','bimbingan','chat','pesan','surat','ucapan'],
    emoji: '👥',
    label: 'Sosial',
    tips: {
      low:    'Koneksi sosial adalah kebutuhan dasar manusia. Mulai dari yang kecil: kirim pesan kepada satu orang yang sudah lama tidak kamu hubungi. Konsistensi dalam menjaga hubungan lebih penting daripada intensitasnya.',
      mid:    'Kebiasaan sosialmu mulai terbentuk. Jadwalkan "social block" di kalender — misalnya setiap Sabtu pagi untuk menghubungi keluarga atau teman lama. Jadikan itu appointment yang tidak bisa dibatalkan.',
      high:   'Kamu sangat konsisten menjaga koneksi sosial! Pertimbangkan untuk memperdalam — dari sekadar chat menjadi video call atau pertemuan langsung. Kualitas interaksi lebih bermakna dari kuantitasnya.',
      streak_break: 'Kehidupan sosial bisa surut-pasang — itu normal. Yang penting jangan sampai isolasi menjadi kebiasaan. Satu pesan singkat ke orang tersayang sudah cukup untuk menjaga koneksi tetap hidup.',
      best_time: 'Waktu terbaik untuk kontak sosial adalah di akhir pekan saat orang lain juga lebih santai, atau di malam hari setelah jam kerja. Hindari hubungi di jam sibuk agar percakapan lebih berkualitas.',
      challenge: 'Tantangan minggu ini: hubungi satu orang berbeda setiap hari selama 7 hari — bisa keluarga, teman lama, atau rekan kerja. Tanyakan kabar mereka dengan tulus.'
    }
  },
  hygiene: {
    groups: ['hygiene'],
    keywords: ['mandi','cuci','gosok gigi','sikat gigi','facial','skincare','moisturizer','sunscreen','flossing','cuci muka','kebersihan','bersih','rapi','rapikan','beresin','bersih-bersih','laundry','cuci baju','potong kuku','cukur','shampoo','kondisioner'],
    emoji: '🧼',
    label: 'Kebersihan & Hygiene',
    tips: {
      low:    'Kebersihan diri adalah fondasi kesehatan dan kepercayaan diri. Jadikan rutinitas pagi sebagai ritual — urutkan: bangun, cuci muka, sikat gigi, mandi. Lakukan dalam urutan yang sama setiap hari agar otomatis.',
      mid:    'Rutinitas kebersihanmu sudah cukup baik. Tingkatkan dengan menambahkan "evening routine": cuci muka sebelum tidur, moisturizer, dan siapkan pakaian untuk besok. Ini investasi 10 menit yang berdampak besar.',
      high:   'Self-care rutinemu sangat konsisten! Pertimbangkan untuk meng-upgrade produk yang kamu gunakan sesuai kebutuhan kulitmu, atau tambahkan weekly treatment seperti masker wajah atau deep conditioning rambut.',
      streak_break: 'Satu hari melewatkan rutinitas kebersihan tidak apa-apa — tubuh punya sistem perlindungan sendiri. Yang penting besok kembali normal. Jangan skip lebih dari 2 hari berturut-turut.',
      best_time: 'Rutinitas pagi (setelah bangun) dan malam (sebelum tidur) adalah waktu terbaik untuk hygiene. Pagi untuk bersiap menghadapi hari, malam untuk membersihkan diri dari semua kotoran dan polusi.',
      challenge: 'Tantangan minggu ini: tambahkan satu langkah baru dalam rutinitas pagi — bisa sunscreen sebelum keluar, atau flossing setelah sikat gigi. Lakukan 7 hari berturut-turut sampai jadi otomatis.'
    }
  }
};

// Deteksi konteks habit berdasarkan grup dan nama habit
function detectHabitContext(habit) {
  var name = (habit.name || '').toLowerCase();
  var group = (habit.group || '').toLowerCase();

  // Cek group match dulu (lebih akurat)
  for(var ctx in HABIT_CONTEXT_MAP) {
    var def = HABIT_CONTEXT_MAP[ctx];
    if(def.groups && def.groups.indexOf(group) >= 0) return ctx;
  }
  // Cek keyword match di nama habit
  for(var ctx in HABIT_CONTEXT_MAP) {
    var def = HABIT_CONTEXT_MAP[ctx];
    if(def.keywords) {
      for(var i=0;i<def.keywords.length;i++) {
        if(name.indexOf(def.keywords[i]) >= 0) return ctx;
      }
    }
  }
  return 'general';
}

// Ambil tip kontekstual berdasarkan tipe dan level
// Ambil emoji dan label konteks
function getContextMeta(habit) {
  var ctx = detectHabitContext(habit);
  if(ctx !== 'general' && HABIT_CONTEXT_MAP[ctx]) {
    return { emoji: HABIT_CONTEXT_MAP[ctx].emoji, label: HABIT_CONTEXT_MAP[ctx].label, ctx: ctx };
  }
  return { emoji: '📌', label: 'Umum', ctx: 'general' };
}

// ── Hitung dominan konteks dari semua habit ──
function getDominantContext(habitStats) {
  var ctxCount = {};
  habitStats.forEach(function(h) {
    var ctx = detectHabitContext(h.t);
    ctxCount[ctx] = (ctxCount[ctx]||0) + 1;
  });
  var maxCtx = 'general', maxCount = 0;
  for(var c in ctxCount) { if(ctxCount[c] > maxCount) { maxCount = ctxCount[c]; maxCtx = c; } }
  return maxCtx;
}

function buildHabitInsight(stats, avgPct, topStreak, needsWork, improving, declining, bestDow, worstDow, dayNames, total, doneToday) {
  var ins = { sections: [] };

  // Deteksi konteks dominan
  var dominantCtx = getDominantContext(stats);
  var domDef = HABIT_CONTEXT_MAP[dominantCtx];

  // ── 1. Diagnosis Overall (context-aware) ──
  var overallMsg, overallEmoji;
  if(dominantCtx === 'ibadah') {
    overallEmoji = avgPct>=85?'🕌':avgPct>=70?'🌙':avgPct>=50?'🤲':avgPct>=30?'📿':'🌱';
    overallMsg = avgPct>=85 ? 'Mashaa Allah! Konsistensi ibadahmu luar biasa. Semoga setiap amalan diterima dan menjadi kebiasaan yang mengakar kuat.'
      : avgPct>=70 ? 'Progres ibadahmu bagus dan ada usaha yang nyata. Beberapa waktu sholat atau amalan masih bisa diperkuat — fokus ke konsistensi, bukan kesempurnaan.'
      : avgPct>=50 ? 'Kamu sudah berusaha menjaga ibadah, tapi belum konsisten. Ingat: sholat adalah tiang agama — mulai dari memastikan 5 waktu fardhu tidak ada yang terlewat.'
      : avgPct>=30 ? 'Ibadahmu belum konsisten. Ini bukan tentang menyalahkan diri — ini waktu untuk muhasabah dan kembali. Mulai dari satu waktu sholat yang paling sering terlewat dan fokus ke sana dulu.'
      : 'Saatnya kembali ke rutinitas ibadah. Tidak perlu menunggu sempurna — mulai dari sholat fardhu 5 waktu hari ini. Allah selalu membuka pintu bagi yang kembali.';
  } else if(dominantCtx === 'olahraga') {
    overallEmoji = avgPct>=85?'🏆':avgPct>=70?'💪':avgPct>=50?'⚡':avgPct>=30?'🌱':'🎯';
    overallMsg = avgPct>=85 ? 'Luar biasa! Program latihanmu sangat konsisten. Tubuhmu pasti sudah merasakan perubahan signifikan. Waktunya naik level atau tantang diri ke target baru.'
      : avgPct>=70 ? 'Latihan fisikmu sudah membangun fondasi yang baik. Tingkatkan konsistensi di hari-hari yang sering kamu skip — biasanya itu hari di mana hasil terbaik bisa dicapai.'
      : avgPct>=50 ? 'Kamu sudah bergerak, tapi konsistensi masih naik turun. Ingat: 3x seminggu yang konsisten jauh lebih efektif dari 7x seminggu yang tidak beraturan.'
      : avgPct>=30 ? 'Aktivitas fisikmu perlu ditingkatkan. Mulai dari target yang sangat kecil: 15 menit jalan kaki setiap hari. Gerakan apapun lebih baik dari tidak bergerak sama sekali.'
      : 'Saatnya mulai bergerak! Pilih satu aktivitas fisik yang paling kamu sukai dan lakukan selama 10 menit saja setiap hari minggu ini. Bangun habit dulu, baru tingkatkan.';
  } else if(dominantCtx === 'kesehatan') {
    overallEmoji = avgPct>=85?'❤️':avgPct>=70?'💊':avgPct>=50?'🌿':avgPct>=30?'⚕️':'🏥';
    overallMsg = avgPct>=85 ? 'Kesehatanmu terjaga dengan sangat baik! Rutinitas kesehatan yang konsisten adalah investasi terbaik untuk jangka panjang. Pertahankan dan pertimbangkan medical check-up rutin.'
      : avgPct>=70 ? 'Perawatan kesehatanmu cukup baik. Ada beberapa area yang masih bisa ditingkatkan — perhatikan kualitas tidur dan hidrasi, keduanya berdampak besar pada kesehatan keseluruhan.'
      : avgPct>=50 ? 'Setengah jalan! Tapi konsistensi kesehatan perlu lebih dari 50% — tubuh butuh rutinitas yang stabil agar bisa berfungsi optimal. Prioritaskan tidur dan minum air dulu.'
      : avgPct>=30 ? 'Kesehatanmu butuh lebih banyak perhatian. Coba audit: apa yang paling sering kamu skip? Fokus ke satu hal itu dulu sampai jadi otomatis, baru tambah yang lain.'
      : 'Mulai jaga kesehatan dari hal paling dasar: tidur 7-8 jam, minum 8 gelas air, dan jalan kaki 30 menit. Tiga hal sederhana ini bisa mengubah kualitas hidup secara dramatis.';
  } else if(dominantCtx === 'produktivitas') {
    overallEmoji = avgPct>=85?'🚀':avgPct>=70?'🧠':avgPct>=50?'📚':avgPct>=30?'⚡':'🎯';
    overallMsg = avgPct>=85 ? 'Produktivitasmu on fire! Kamu sudah membangun sistem belajar dan kerja yang solid. Attention: pastikan kamu juga menjaga keseimbangan agar tidak burnout.'
      : avgPct>=70 ? 'Kebiasaan produktifmu sudah terbentuk dengan baik. Fokus sekarang adalah menjaga kualitas, bukan hanya kuantitas — deep work 1 jam lebih berharga dari scattered work 3 jam.'
      : avgPct>=50 ? 'Setengah konsisten itu artinya kamu bisa, tapi ada yang menghalangi. Identifikasi: kapan kamu paling sering skip belajar/bekerja? Apa yang terjadi di hari itu? Selesaikan hambatan itu dulu.'
      : avgPct>=30 ? 'Produktivitasmu masih fluktuatif. Coba buat "non-negotiable": satu sesi belajar/fokus setiap hari, minimal 20 menit, tidak peduli seberapa sibuk. Konsistensi kecil mengalahkan marathon sesekali.'
      : 'Mulai dari sangat kecil: baca 10 halaman atau belajar satu topik baru selama 15 menit setiap hari. Tidak perlu langsung heroik — bangun kebiasaan dulu, kapasitas akan mengikuti.';
  } else if(dominantCtx === 'mindfulness') {
    overallEmoji = avgPct>=85?'🧘':avgPct>=70?'☯️':avgPct>=50?'🌸':avgPct>=30?'🌬️':'🕯️';
    overallMsg = avgPct>=85 ? 'Praktik mindfulness-mu sangat konsisten dan inspiratif! Kamu telah membangun fondasi mental yang kuat. Pertimbangkan untuk mendalami teknik yang lebih advanced.'
      : avgPct>=70 ? 'Praktik mindfulness-mu sudah baik. Kualitas lebih penting dari kuantitas di sini — 10 menit meditasi yang fokus lebih bermakna dari 30 menit yang terdistraksi.'
      : avgPct>=50 ? 'Kamu setengah jalan dalam membangun ketenangan batin. Ingat: mindfulness bukan tentang menjadi "super tenang" — tapi tentang menyadari dan menerima apapun yang terjadi.'
      : avgPct>=30 ? 'Praktik mindfulness-mu butuh lebih banyak konsistensi. Coba "tempatkan" meditasi di anchor yang kuat: langsung setelah bangun tidur, sebelum menyentuh HP apapun.'
      : 'Mulai dengan 5 menit saja. Duduk, tutup mata, fokus pada napas. Ketika pikiran melayang, kembalikan dengan lembut. Lakukan ini setiap pagi — dampaknya akan terasa dalam 2 minggu.';
  } else if(dominantCtx === 'nutrisi') {
    overallEmoji = avgPct>=85?'🥗':avgPct>=70?'🥦':avgPct>=50?'🍽️':avgPct>=30?'🌿':'🍎';
    overallMsg = avgPct>=85 ? 'Pola makanmu sangat disiplin dan konsisten! Nutrisi yang baik adalah bahan bakar untuk semua hal lain yang kamu lakukan. Ingat untuk tetap menikmati makanan, bukan hanya "memprogram" tubuh.'
      : avgPct>=70 ? 'Kebiasaan makan sehatmu sudah terbentuk dengan baik. Perhatikan kualitas pilihan makanan di hari-hari sibuk — biasanya di hari itu pilihan nutrisi kita paling buruk karena keputusan terburu-buru.'
      : avgPct>=50 ? 'Pola nutrisimu masih perlu diperkuat. Kunci: meal prep di akhir pekan. Saat lapar, kita selalu memilih yang mudah dan cepat — buat "yang sehat" menjadi yang termudah.'
      : avgPct>=30 ? 'Kebiasaan makan sehatmu belum stabil. Mulai dari satu perubahan kecil: ganti satu camilan tidak sehat dengan buah setiap hari. Satu perubahan, konsisten, lebih powerful dari banyak perubahan sekaligus.'
      : 'Mulai perjalanan nutrisimu dengan sangat simpel: tambahkan satu porsi sayur atau buah di setiap makan. Tidak perlu diet ekstrem — perubahan kecil yang konsisten menghasilkan transformasi besar.';
  } else {
    overallEmoji = avgPct>=85?'🏆':avgPct>=70?'💪':avgPct>=50?'⚡':avgPct>=30?'🌱':'🔥';
    overallMsg = avgPct>=85 ? 'Konsistensimu luar biasa! Kamu sudah membangun sistem habit yang solid. Pertahankan momentum ini.'
      : avgPct>=70 ? 'Progresmu bagus dan terlihat usaha nyata. Beberapa habit masih bisa diperkuat untuk mencapai level berikutnya.'
      : avgPct>=50 ? 'Kamu sudah di jalur yang benar, tapi konsistensi masih belum stabil. Fokus ke 1-2 habit kunci dulu sebelum menambah yang baru.'
      : avgPct>=30 ? 'Jujur ya — habitmu belum konsisten. Tapi ini bukan kegagalan, ini data berharga. Mulai kecil: pilih 1 habit paling mudah dan jadikan itu tidak bisa dilewati.'
      : 'Kamu baru memulai atau sempat vakum. Tidak apa-apa — yang penting kamu kembali hari ini. Reset ekspektasi, mulai dari 1 habit saja.';
  }
  ins.sections.push({ type:'overall', emoji:overallEmoji, title:'Diagnosis', body:overallMsg });

  // ── 2. Kekuatan Terbesar (context-aware) ──
  if(topStreak.streak > 0) {
    var topCtx = detectHabitContext(topStreak.t);
    var topCtxDef = HABIT_CONTEXT_MAP[topCtx];
    var strengthMsg = '"' + topStreak.t.name + '" adalah pilar terkuatmu dengan streak ' + topStreak.streak + ' hari.';

    if(topCtx === 'ibadah') {
      if(topStreak.streak >= 21) strengthMsg += ' Subhanallah! Lebih dari 21 hari konsisten dalam ibadah ini. Amalan yang sedikit tapi kontinu lebih dicintai Allah. Jadikan ini anchor untuk memperkuat amalan lain.';
      else if(topStreak.streak >= 7) strengthMsg += ' Satu minggu penuh konsisten — ini momentum yang kuat. Pertahankan hingga 40 hari, angka yang secara spiritual dan psikologis sangat bermakna.';
      else strengthMsg += ' Baru dimulai, tapi niat sudah ada. Jaga jangan sampai terputus — kalau terlewat, segera qadha dan jangan putus semangat.';
    } else if(topCtx === 'olahraga') {
      if(topStreak.streak >= 21) strengthMsg += ' 21 hari berturut-turut latihan — tubuhmu sudah mulai beradaptasi dan ini bukan lagi sekedar kebiasaan, ini gaya hidupmu. Jaga dan tingkatkan!';
      else if(topStreak.streak >= 7) strengthMsg += ' Satu minggu konsisten berolahraga! Tubuh sudah mulai menyesuaikan diri. Fokus ke 30 hari untuk membuat ini benar-benar menjadi bagian dari identitasmu.';
      else strengthMsg += ' Awal yang baik! Hari-hari paling kritis dalam kebiasaan olahraga adalah hari ke 3-5 saat motivasi awal mulai memudar. Kamu sudah melewatinya — teruskan!';
    } else if(topCtx === 'kesehatan') {
      if(topStreak.streak >= 21) strengthMsg += ' Lebih dari 3 minggu konsisten menjaga kesehatan — perubahan nyata sudah terjadi di dalam tubuhmu meski belum semua terlihat. Ini investasi jangka panjang terbaik.';
      else if(topStreak.streak >= 7) strengthMsg += ' Seminggu konsisten! Tubuh mulai membangun ritme baru. Pertahankan dan perhatikan bagaimana energi dan mood-mu mulai membaik.';
      else strengthMsg += ' Langkah pertama selalu yang terberat. Kamu sudah melewatinya — momentum kecil ini adalah fondasi kesehatan jangka panjang.';
    } else {
      if(topStreak.streak >= 21) strengthMsg += ' Lebih dari 21 hari — ini sudah menjadi bagian dari identitasmu. Jadikan habit ini sebagai anchor untuk membangun kebiasaan baru di sekitarnya.';
      else if(topStreak.streak >= 7) strengthMsg += ' Satu minggu penuh! Fokus ke 21 hari untuk membuatnya semakin mengakar dan otomatis.';
      else strengthMsg += ' Baru dimulai — jaga jangan sampai putus di hari ke-3 hingga ke-5, ini periode paling rentan.';
    }
    ins.sections.push({ type:'strength', emoji: topCtxDef?topCtxDef.emoji:'🌟', title:'Kekuatan Terbesar', body:strengthMsg });
  }

  // ── 3. Prioritas Perbaikan (context-aware per habit) ──
  if(needsWork.length) {
    var fixes = [];
    needsWork.slice(0,3).forEach(function(h) {
      var hCtx = detectHabitContext(h.t);
      var hDef = HABIT_CONTEXT_MAP[hCtx];
      var levelKey = h.pct30 < 30 ? 'low' : 'mid';
      var contextTip = hDef && hDef.tips ? hDef.tips[levelKey] : null;
      var tip;

      if(h.pct30 < 20) {
        if(hCtx === 'ibadah') {
          tip = '"' + h.t.name + '" ('+h.pct30+'%) hampir tidak pernah dilakukan. ' + (contextTip || 'Set alarm untuk waktu ibadah ini dan jadikan sebagai prioritas utama sebelum aktivitas lain.');
        } else if(hCtx === 'olahraga') {
          tip = '"' + h.t.name + '" ('+h.pct30+'%) hampir tidak pernah dilakukan. Coba buat versi mini: ganti sesi penuh dengan 5 menit gerakan apapun. Siapkan pakaian olahraga malam sebelumnya agar hambatan berkurang.';
        } else {
          tip = '"' + h.t.name + '" ('+h.pct30+'%) hampir tidak pernah dilakukan. ' + (contextTip || 'Pertimbangkan: apakah habit ini terlalu susah atau waktunya kurang tepat? Sederhanakan jadi versi 2 menit.');
        }
      } else if(h.trend < -3) {
        if(hCtx === 'ibadah') {
          tip = '"' + h.t.name + '" ('+h.pct30+'%) menunjukkan tren menurun. ' + (hDef && hDef.tips ? hDef.tips.streak_break : 'Jangan biarkan satu hari skip menjadi kebiasaan baru. Kembali segera.');
        } else if(hCtx === 'olahraga') {
          tip = '"' + h.t.name + '" ('+h.pct30+'%) mulai menurun — ini sering terjadi setelah motivasi awal memudar. Coba "tempatkan" latihan di jadwal harian seperti rapat — tidak bisa dibatalkan.';
        } else {
          tip = '"' + h.t.name + '" ('+h.pct30+'%) menunjukkan tren menurun. ' + (contextTip || 'Pasangkan dengan habit yang sudah kuat (habit stacking) agar tidak mudah di-skip.');
        }
      } else if(h.pct30 < 50) {
        tip = '"' + h.t.name + '" ('+h.pct30+'%) butuh perhatian. ' + (contextTip || 'Set pengingat di waktu spesifik dan buat lingkungan yang mendukung agar habit ini lebih mudah dilakukan.');
      }
      if(tip) fixes.push(tip);
    });
    if(fixes.length) ins.sections.push({ type:'fixes', emoji:'🎯', title:'Prioritas Perbaikan', body: fixes.join('<br><br>') });
  }

  // ── 4. Pattern Hari Lemah (context-aware) ──
  var worstDayName = dayNames[worstDow];
  var bestDayName = dayNames[bestDow];

  // Day tips generik
  var dayTipsGeneral = {
    0: 'Hari Minggu sering jadi titik reset — tidak ada rutinitas kerja yang mengikat. Buat ritual khusus Minggu pagi agar habit tetap berjalan.',
    1: 'Senin bisa jadi hari terberat karena transisi dari weekend. Jadikan habit Senin sebagai ritual "kickstart minggu" — lakukan yang paling mudah dulu.',
    2: 'Selasa adalah hari produktif bagi kebanyakan orang, tapi jika ini hari terlemahmu, kemungkinan ada overload kerja. Geser habit ke slot waktu yang berbeda.',
    3: 'Rabu adalah titik tengah minggu — kelelahan mulai terasa. Coba buat habit Rabu lebih singkat dari biasanya agar tetap mudah dilakukan.',
    4: 'Kamis sering jadi hari dengan beban kerja tertinggi menjelang deadline Jumat. Siapkan habit kamu sehari sebelumnya.',
    5: 'Jumat sering ada godaan untuk "istirahat awal". Buat deal dengan diri sendiri: selesaikan habit dulu baru boleh bersantai.',
    6: 'Sabtu penuh aktivitas sosial yang tidak terprediksi. Lakukan habit di pagi hari sebelum jadwal lain mengisi waktumu.'
  };
  // Day tips kontekstual
  var dayTipsCtx = {
    ibadah: {
      0: 'Hari Minggu sering penuh aktivitas keluarga — tapi justru ini waktu terbaik untuk sholat berjamaah dan mengaji bersama. Manfaatkan hari ini untuk memperkuat ibadah yang biasanya terburu-buru.',
      1: 'Senin awal minggu sering sibuk — tapi ingat, sholat tidak butuh waktu lama. Wudhu dan sholat bisa memakan 10 menit saja. Jadikan sholat sebagai cara "membuka" hari yang produktif.',
      5: 'Jumat adalah hari istimewa! Jangan lewatkan sholat Jumat, perbanyak sholawat, dan baca Surat Al-Kahfi. Jadikan Jumat sebagai puncak ibadah minggu ini.'
    },
    olahraga: {
      0: 'Minggu harusnya hari long run atau sesi latihan yang lebih santai. Manfaatkan tidak ada kewajiban kerja untuk olahraga lebih lama atau coba aktivitas outdoor.',
      1: 'Senin pagi adalah waktu terbaik untuk menetapkan tone aktif sepanjang minggu. Workout Senin pagi terbukti meningkatkan produktivitas dan energi sepanjang minggu.',
      5: 'Jumat sore perfect untuk olahraga — minggu kerja hampir selesai, adrenalin "approaching weekend" bisa jadi energi ekstra untuk latihan yang lebih intens.'
    },
    kesehatan: {
      0: 'Minggu adalah hari terbaik untuk meal prep mingguan dan istirahat berkualitas. Manfaatkan untuk memastikan tidur dan nutrisi minggu depan terencana dengan baik.',
      1: 'Senin adalah momen reset — mulai minggu baru dengan mengecek: apakah kamu sudah minum cukup air hari ini? Tidur berapa jam semalam? Tindakan kecil di Senin pagi menentukan ritme seminggu.'
    }
  };

  var ctxDayTips = (dayTipsCtx[dominantCtx] && dayTipsCtx[dominantCtx][worstDow]) ? dayTipsCtx[dominantCtx][worstDow] : null;
  var worstDayTip = ctxDayTips || dayTipsGeneral[worstDow] || ('Hari ' + worstDayName + ' adalah titik lemahmu.');
  ins.sections.push({ type:'daytip', emoji:'📅', title:'Strategi Hari ' + worstDayName, body: worstDayTip + ' Sebaliknya, replikasi apa yang membuat hari ' + bestDayName + ' begitu produktif.' });

  // ── 5. Streak Terputus (context-aware) ──
  var gapHabits = stats.filter(function(h){ return h.streak === 0 && h.pct30 > 20; });
  if(gapHabits.length) {
    var gapH = gapHabits[0];
    var gapCtx = detectHabitContext(gapH.t);
    var gapCtxDef = HABIT_CONTEXT_MAP[gapCtx];
    var gapNames = gapHabits.slice(0,2).map(function(h){ return '"'+h.t.name+'"'; }).join(' dan ');
    var gapMsg;
    if(gapCtxDef && gapCtxDef.tips && gapCtxDef.tips.streak_break) {
      gapMsg = gapNames + ' punya rekam jejak bagus tapi streak-nya baru reset. ' + gapCtxDef.tips.streak_break;
    } else {
      gapMsg = gapNames + ' punya rekam jejak bagus tapi streak-nya baru reset. Ini bukan kegagalan — ini kesempatan untuk membuktikan bahwa satu hari skip tidak merusak segalanya. Mulai kembali hari ini.';
    }
    ins.sections.push({ type:'gap', emoji: gapCtxDef?gapCtxDef.emoji:'🔗', title:'Streak Terputus', body: gapMsg });
  }

  // ── 6. Momentum Positif ──
  if(improving.length >= 2) {
    var impNames = improving.slice(0,2).map(function(h){ return '"'+h.t.name+'"'; }).join(' dan ');
    var impCtx = detectHabitContext(improving[0].t);
    var impCtxDef = HABIT_CONTEXT_MAP[impCtx];
    var impEmoji = impCtxDef ? impCtxDef.emoji : '🚀';
    ins.sections.push({ type:'momentum', emoji:impEmoji, title:'Momentum Positif', body: impNames + ' sedang dalam tren naik! Ini menunjukkan sesuatu yang kamu lakukan 2 minggu terakhir berhasil. Identifikasi apa yang berbeda dan aplikasikan ke habit lain.' });
  }

  // ── 7. Tantangan 7 Hari (context-aware) ──
  var challenge7;
  if(needsWork.length) {
    var ch = needsWork[0];
    var chCtx = detectHabitContext(ch.t);
    var chDef = HABIT_CONTEXT_MAP[chCtx];
    if(chDef && chDef.tips && chDef.tips.challenge) {
      challenge7 = chDef.tips.challenge;
    } else {
      challenge7 = 'Fokus 1 minggu penuh pada "' + ch.t.name + '". Lakukan setiap hari meski hanya versi mini-nya. Catat setiap keberhasilan — visual progress adalah motivasi terbaik.';
    }
  } else if(avgPct >= 80) {
    var ch7Ctx = dominantCtx;
    var ch7Def = HABIT_CONTEXT_MAP[ch7Ctx];
    challenge7 = ch7Def && ch7Def.tips && ch7Def.tips.challenge
      ? ch7Def.tips.challenge
      : 'Semua habitmu sudah kuat! Tantanganmu minggu ini: tambah 1 habit baru yang sudah lama ingin kamu coba, tapi buat versi 2 menit dulu.';
  } else {
    challenge7 = 'Minggu ini, fokus lakukan semua habit di hari ' + worstDayName + ' tanpa pengecualian. Buktikan bahwa kamu bisa membalik hari terlemahmu.';
  }
  ins.sections.push({ type:'challenge', emoji:'🏁', title:'Tantangan 7 Hari', body: challenge7 });

  return ins;
}

function renderHabitInsightBox(insight) {
  var typeColors = {
    overall: '#6366f1', strength: '#10b981', fixes: '#f59e0b',
    daytip: '#3b82f6', gap: '#ec4899', momentum: '#8b5cf6', challenge: '#ef4444'
  };
  var html = '<div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:16px;margin-bottom:14px">'
    +'<div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:14px">'
    +'\uD83D\uDCA1 Insight & Rekomendasi</div>'
    +'<div style="display:flex;flex-direction:column;gap:12px">';
  insight.sections.forEach(function(s){
    var c = typeColors[s.type] || 'var(--accent)';
    html += '<div style="border-left:3px solid '+c+';padding:10px 12px;background:'+c+'11;border-radius:0 10px 10px 0">'
      +'<div style="font-size:12px;font-weight:700;color:'+c+';margin-bottom:5px">'+s.emoji+' '+s.title+'</div>'
      +'<div style="font-size:12px;color:var(--text);line-height:1.65">'+s.body+'</div>'
      +'</div>';
  });
  html += '</div></div>';
  return html;
}

// ── Render Prediksi Kegagalan Besok ──
function renderFailurePredictionCard(habitStats, days30) {
  var predictions = habitStats.map(function(h){ return calcFailurePrediction(h, days30); }).filter(Boolean);
  if(!predictions.length) return '';

  var highRisk = predictions.filter(function(p){return p.failProb>=60;}).sort(function(a,b){return b.failProb-a.failProb;});
  var medRisk  = predictions.filter(function(p){return p.failProb>=40&&p.failProb<60;}).sort(function(a,b){return b.failProb-a.failProb;});
  var lowRisk  = predictions.filter(function(p){return p.failProb<40;});

  var tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1);
  var tomorrowName = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'][tomorrow.getDay()];

  var html = '<div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:16px;margin-bottom:14px">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">'
    +'<div style="font-size:13px;font-weight:700;color:var(--text)">🔮 Prediksi Besok ('+tomorrowName+')</div>'
    +'</div>'
    +'<div style="font-size:11px;color:var(--muted);margin-bottom:12px">Berdasarkan pola historis & streak aktif</div>'
    +'<div style="display:flex;flex-direction:column;gap:8px">';

  predictions.slice(0,6).forEach(function(p){
    var barW = p.successProb;
    var barColor = p.failProb>=60?'#ef4444':p.failProb>=40?'#f59e0b':'#10b981';
    var label = p.failProb>=60?'Rawan Skip':'Aman';
    html += '<div style="padding:8px 10px;border-radius:10px;border:1px solid var(--border);background:var(--bg)">'
      +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px">'
      +'<span style="font-size:12px;font-weight:600;color:var(--text)">'+p.riskEmoji+' '+p.habitName+'</span>'
      +'<span style="font-size:11px;font-weight:700;color:'+p.riskColor+'">'+p.failProb+'% gagal</span>'
      +'</div>'
      +'<div style="height:5px;background:var(--border);border-radius:3px;overflow:hidden;margin-bottom:4px">'
      +'<div style="height:100%;width:'+barW+'%;background:'+barColor+';border-radius:3px;transition:width 0.5s ease"></div>'
      +'</div>'
      +'<div style="font-size:10px;color:var(--muted)">Sukses '+p.dowRate+'% di hari '+p.tomorrowDay+' historis · Streak: '+(p.riskLevel==='rendah'?'aktif 💪':'perlu dijaga')+'</div>'
      +'</div>';
  });

  html += '</div>';
  if(highRisk.length) {
    html += '<div style="margin-top:10px;padding:8px 10px;border-radius:8px;background:#ef444411;border:1px solid #ef444433">'
      +'<div style="font-size:11px;font-weight:700;color:#ef4444;margin-bottom:3px">💡 Tips untuk besok</div>'
      +'<div style="font-size:11px;color:var(--text)">Siapkan "'+highRisk[0].habitName+'" malam ini — letakkan pengingat visual atau alat yang dibutuhkan di tempat yang mudah terlihat.</div>'
      +'</div>';
  }
  html += '</div>';
  return html;
}

// ── Render Habit Correlation Matrix ──
function renderCorrelationCard(habits, days60) {
  if(habits.length < 2) return '';
  var corrs = calcHabitCorrelation(habits, days60);
  if(!corrs.length) return '';

  var strong = corrs.filter(function(c){return c.type==='strong_pos';}).slice(0,3);
  var neg    = corrs.filter(function(c){return c.type==='negative';}).slice(0,2);
  var top    = corrs.slice(0,Math.min(5, corrs.length));

  var html = '<div style="background:var(--card);border:1px solid var(--border);border-radius:16px;padding:16px;margin-bottom:14px">'
    +'<div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:4px">🧩 Korelasi Antar Habit</div>'
    +'<div style="font-size:11px;color:var(--muted);margin-bottom:12px">Habit mana yang saling mendukung — 60 hari terakhir</div>';

  // Legend
  html += '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:10px">'
    +'<span style="font-size:10px;color:#10b981;font-weight:600">🟢 Saling mendukung</span>'
    +'<span style="font-size:10px;color:#6366f1;font-weight:600">🔵 Lemah positif</span>'
    +'<span style="font-size:10px;color:#ef4444;font-weight:600">🔴 Tidak terkait</span>'
    +'</div>';

  html += '<div style="display:flex;flex-direction:column;gap:7px">';
  top.forEach(function(c){
    var strength = Math.abs(c.phi);
    var barW = Math.round(strength*100);
    var color = c.type==='strong_pos'?'#10b981':c.type==='weak_pos'?'#6366f1':c.type==='negative'?'#ef4444':'var(--muted)';
    var icon = c.type==='strong_pos'?'💚':c.type==='weak_pos'?'💙':c.type==='negative'?'❌':'➡️';
    var label = c.type==='strong_pos'?'Sering bareng ('+c.pct+'%)':c.type==='weak_pos'?'Kadang bareng ('+c.pct+'%)':c.type==='negative'?'Jarang bersamaan':'Tidak ada pola';
    html += '<div style="padding:8px 10px;border-radius:10px;border:1px solid var(--border);background:var(--bg)">'
      +'<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">'
      +'<span style="font-size:11px">'+icon+'</span>'
      +'<span style="font-size:11px;font-weight:600;color:var(--text);flex:1">'+c.h1.name+' &amp; '+c.h2.name+'</span>'
      +'<span style="font-size:10px;font-weight:700;color:'+color+'">φ='+c.phi.toFixed(2)+'</span>'
      +'</div>'
      +'<div style="height:4px;background:var(--border);border-radius:2px;overflow:hidden;margin-bottom:3px">'
      +'<div style="height:100%;width:'+barW+'%;background:'+color+';border-radius:2px"></div>'
      +'</div>'
      +'<div style="font-size:10px;color:var(--muted)">'+label+'</div>'
      +'</div>';
  });
  html += '</div>';

  // Insight dari korelasi
  if(strong.length) {
    html += '<div style="margin-top:10px;padding:8px 10px;border-radius:8px;background:#10b98111;border:1px solid #10b98133">'
      +'<div style="font-size:11px;font-weight:700;color:#10b981;margin-bottom:3px">💡 Habit Stack Potensial</div>'
      +'<div style="font-size:11px;color:var(--text)">'
      +'Kamu sudah secara alami menggabungkan "'+strong[0].h1.name+'" dan "'+strong[0].h2.name+'". '
      +'Ini adalah habit stack alami — manfaatkan dengan menjadikan keduanya satu ritual berurutan.'
      +'</div></div>';
  }
  if(neg.length) {
    html += '<div style="margin-top:8px;padding:8px 10px;border-radius:8px;background:#6366f111;border:1px solid #6366f133">'
      +'<div style="font-size:11px;font-weight:700;color:#6366f1;margin-bottom:3px">🔍 Perlu Dijadwalkan Terpisah</div>'
      +'<div style="font-size:11px;color:var(--text)">'
      +'"'+neg[0].h1.name+'" dan "'+neg[0].h2.name+'" jarang selesai di hari yang sama. '
      +'Mungkin keduanya membutuhkan energi yang sama — jadwalkan di waktu/slot berbeda.'
      +'</div></div>';
  }

  html += '</div>';
  return html;
}

// ── Render Rapor Per Habit (Extended dengan Heatmap + Weekly Trend) ──
function renderExtendedHabitCard(h, days28) {
  var weeks = calcWeeklyTrend(h);
  var weekMax = Math.max.apply(null,weeks)||1;
  var weekLabels = ['M-4','M-3','M-2','M-1'];
  var wkBars = weeks.map(function(c,i){
    var pct=Math.round(c/7*100);
    var barH = Math.round(c/weekMax*40);
    var barColor = c>=6?'#10b981':c>=4?'#3b82f6':c>=2?'#f59e0b':'#ef4444';
    return '<div style="display:flex;flex-direction:column;align-items:center;gap:2px;flex:1">'
      +'<div style="font-size:9px;font-weight:700;color:var(--muted)">'+c+'/7</div>'
      +'<div style="width:100%;background:var(--border);border-radius:3px;height:36px;display:flex;align-items:flex-end;overflow:hidden">'
      +'<div style="width:100%;height:'+(barH||2)+'px;background:'+barColor+';border-radius:3px;min-height:2px"></div></div>'
      +'<div style="font-size:9px;color:var(--muted)">'+weekLabels[i]+'</div>'
      +'</div>';
  }).join('');

  // Heatmap 28 hari per habit
  var heatRows = '';
  var dayShort=['M','S','S','R','K','J','S'];
  // Build 4 weeks x 7 days grid
  var gridCells = '';
  for(var i=27;i>=0;i--){
    var date=new Date(); date.setDate(date.getDate()-i);
    var ds=date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');
    var done=h.t.history&&h.t.history.indexOf(ds)>=0;
    var isToday=ds===todayStr;
    var bg=done?'#10b981':'var(--border)';
    gridCells+='<div title="'+ds+'" style="width:12px;height:12px;border-radius:2px;background:'+bg+';flex-shrink:0;outline:'+(isToday?'2px solid var(--accent)':'none')+';outline-offset:1px"></div>';
  }

  var trendIcon = h.trend>2?'📈':h.trend<-2?'📉':'➡️';
  var trendColor = h.trend>2?'#10b981':h.trend<-2?'#ef4444':'var(--muted)';
  var ctxMeta = getContextMeta(h.t);

  return '<div style="border:1px solid var(--border);border-radius:12px;padding:12px;background:var(--bg);margin-bottom:8px">'
    +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">'
    +'<div style="width:34px;height:34px;border-radius:8px;background:'+h.gradeColor+'22;border:2px solid '+h.gradeColor+';display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:900;color:'+h.gradeColor+';flex-shrink:0">'+h.grade+'</div>'
    +'<div style="flex:1;min-width:0">'
    +'<div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap">'
    +'<span style="font-size:13px;font-weight:700;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+h.t.name+'</span>'
    +'<span style="font-size:9px;font-weight:700;color:var(--muted);background:var(--card);border:1px solid var(--border);border-radius:8px;padding:1px 5px;white-space:nowrap">'+ctxMeta.emoji+' '+ctxMeta.label+'</span>'
    +'</div>'
    +'<div style="display:flex;gap:8px;align-items:center;margin-top:2px">'
    +'<span style="font-size:10px;color:var(--muted)">'+h.pct30+'% / 30hr</span>'
    +'<span style="font-size:10px;color:var(--muted)">·</span>'
    +'<span style="font-size:10px;color:var(--muted)">'+h.streak+'🔥 streak</span>'
    +'<span style="font-size:10px;color:'+trendColor+'">'+trendIcon+' '+(h.trend>0?'+':'')+h.trend+'</span>'
    +'</div></div>'
    +'<div onclick="openDetail('+h.t.id+')" style="font-size:10px;color:var(--muted);cursor:pointer;padding:4px 8px;border-radius:6px;border:1px solid var(--border)">Detail</div>'
    +'</div>'
    // Heatmap 28 hari
    +'<div style="margin-bottom:8px">'
    +'<div style="font-size:9px;color:var(--muted);font-weight:600;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px">28 Hari Terakhir</div>'
    +'<div style="display:flex;gap:3px;flex-wrap:wrap">'+gridCells+'</div>'
    +'</div>'
    // Weekly bar chart
    +'<div>'
    +'<div style="font-size:9px;color:var(--muted);font-weight:600;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px">Tren Mingguan</div>'
    +'<div style="display:flex;gap:4px;align-items:flex-end">'+wkBars+'</div>'
    +'</div>'
    +'</div>';
}

// ══════════════════════════════════════════════
// HABIT SIDE PANEL
// ══════════════════════════════════════════════
var _habitPanelCollapsed=false;
var _habitPanelCompact=false;
function toggleHabitPanel(){
  _habitPanelCollapsed=!_habitPanelCollapsed;
  try{localStorage.setItem('habitPanelCollapsed',_habitPanelCollapsed?'1':'0');}catch(e){}
  renderHabitPanel();
}
function toggleHabitPanelWidth(){
  _habitPanelCompact=!_habitPanelCompact;
  try{localStorage.setItem('habitPanelCompact',_habitPanelCompact?'1':'0');}catch(e){}
  _applyHabitPanelCompact();
}
function _applyHabitPanelCompact(){
  var wrap=document.getElementById('habitPanelWrap');
  var btn=document.getElementById('habitPanelEdgeToggle');
  if(!wrap) return;
  if(_habitPanelCompact){
    wrap.classList.add('compact');
    if(btn){btn.innerHTML='&#x276F;';btn.title='Tampilan Lengkap';}
  } else {
    wrap.classList.remove('compact');
    if(btn){btn.innerHTML='&#x276E;';btn.title='Tampilan Ringkas';}
  }
}
function renderHabitPanel(){
  var panel=document.getElementById('habitPanel');
  var wrap=document.getElementById('habitPanelWrap');
  var restoreBtn=document.getElementById('habitPanelRestoreBtn');
  // Di layar <=900px habit panel tidak pernah ditampilkan (CSS display:none)
  // Jangan set display:flex via JS — biarkan CSS yang mengontrol seutuhnya
  var _screenNarrow = window.innerWidth <= 900;
  if(_screenNarrow){
    panel.innerHTML='';
    if(wrap){wrap.style.display='none';}
    if(restoreBtn){restoreBtn.style.display='none';}
    return;
  }
  var _hideViews=['habits','habit-analisa','dashboard','stats','achievements','calendar','unified-calendar','task-groups'];
  if(isFinView(currentView)||isMaintView(currentView)||currentView.startsWith('maint-cat-')||_hideViews.indexOf(currentView)>=0||(typeof JOURNAL_VIEWS!=='undefined'&&JOURNAL_VIEWS.indexOf(currentView)>=0)){
    panel.innerHTML='';panel.style.display='none';if(wrap)wrap.style.display='none';if(restoreBtn)restoreBtn.style.display='none';return;
  }
  var habits=tasks.filter(function(t){return t.type==='Habit'&&isHabitDueToday(t);});
  if(!habits.length){panel.innerHTML='';panel.style.display='none';if(wrap)wrap.style.display='none';if(restoreBtn)restoreBtn.style.display='none';return;}
  try{var s=localStorage.getItem('habitPanelCollapsed');if(s!==null)_habitPanelCollapsed=s==='1';}catch(e){}
  try{var sc=localStorage.getItem('habitPanelCompact');if(sc!==null)_habitPanelCompact=sc==='1';}catch(e){}

  // Saat collapsed: sembunyikan panel & edge toggle, tampilkan restore tab saja (masih dalam wrap)
  if(_habitPanelCollapsed){
    panel.innerHTML='';
    panel.style.display='none';
    panel.style.visibility='hidden';
    var edgeToggle=document.getElementById('habitPanelEdgeToggle');
    if(edgeToggle)edgeToggle.style.display='none';
    if(wrap){wrap.style.display='flex';wrap.style.visibility='visible';wrap.style.width='auto';}
    if(restoreBtn){restoreBtn.style.display='flex';}
    return;
  }
  // Panel terbuka: pastikan visibility kembali normal
  panel.style.visibility='';
  if(wrap){wrap.style.visibility='';wrap.style.width='';}
  var edgeToggle=document.getElementById('habitPanelEdgeToggle');
  if(edgeToggle)edgeToggle.style.display='';

  // Panel terbuka
  panel.style.display='flex';
  if(wrap)wrap.style.display='flex';
  if(restoreBtn)restoreBtn.style.display='none';
  _applyHabitPanelCompact();
  var days7=[];for(var i=0;i<7;i++)days7.push(offset(i-6));
  var html='<div class="panel-title" style="cursor:pointer;display:flex;align-items:center;justify-content:space-between;user-select:none" onclick="toggleHabitPanel()">'
    +'<span>🔥 Habit Hari Ini</span>'
    +'<span style="font-size:10px;color:var(--muted);margin-left:8px">&#9660;</span>'
    +'</div>';
  habits.forEach(function(t){
    var streak=calcStreak(t),wDone=days7.filter(function(d){return t.history&&t.history.indexOf(d)>=0;}).length,pct=Math.round(wDone/7*100);
    var dots='';
    days7.forEach(function(d){
      var done=t.history&&t.history.indexOf(d)>=0,isTd=d===todayStr;
      dots+='<div class="dot'+(done?' done':' miss')+(isTd?' today-dot':'')+'" onclick="event.stopPropagation();toggleHabitDay('+t.id+',\''+d+'\')" title="'+fmtShort(d)+'">'+(done?'✓':(isTd?'·':''))+'</div>';
    });
    var colorBorder=t.color?'border-left:3px solid '+t.color+';':''
    html+='<div class="habit-row" onclick="openDetail('+t.id+')" style="'+colorBorder+'">'
      +'<div class="habit-name" title="'+t.name+'">'+t.name+'</div>'
      +'<div class="streak-label">7 Hari terakhir</div>'
      +'<div class="habit-dots">'+dots+'</div>'
      +'<div class="habit-stats"><span class="streak-badge">'+streak+'🔥</span>'
      +'<div class="pct-bar"><div class="pct-fill" style="width:'+pct+'%"></div></div>'
      +'<span class="pct-label">'+pct+'%</span></div>'
      +'</div>';
  });
  panel.innerHTML=html;
}


// ══════════════════════════════════════════════
// ══════════════════════════════════════════════
// MAINTENANCE MODULE
// ══════════════════════════════════════════════
// ══════════════════════════════════════════════

function getMaintStatus(item){
  var now=new Date();now.setHours(0,0,0,0);
  if(!item.nextDate)return 'ok';
  var next=new Date(item.nextDate+'T00:00:00');
  var diffDays=Math.round((next-now)/86400000);
  if(diffDays<0)return 'overdue';
  if(diffDays<=7)return 'soon';
  return 'ok';
}
function getMaintDaysLeft(item){
  if(!item.nextDate)return null;
  var now=new Date();now.setHours(0,0,0,0);
  var next=new Date(item.nextDate+'T00:00:00');
  return Math.round((next-now)/86400000);
}
function getMaintProgress(item){
  if(!item.lastDate||!item.nextDate||!item.intervalDays)return 0;
  var last=new Date(item.lastDate+'T00:00:00');
  var now=new Date();now.setHours(0,0,0,0);
  var elapsed=Math.round((now-last)/86400000);
  return Math.min(100,Math.round(elapsed/item.intervalDays*100));
}
function computeNextDate(lastDate,intervalDays){
  if(!lastDate||!intervalDays)return '';
  var d=new Date(lastDate+'T00:00:00');
  d.setDate(d.getDate()+parseInt(intervalDays));
  return localDateStr(d);
}
function getMaintDueCount(){
  return maintItems.filter(function(it){var s=getMaintStatus(it);return s==='overdue'||s==='soon';}).length;
}
function updateMaintCount(){
  var el=document.getElementById('cnt-maint-due');
  if(el){var c=getMaintDueCount();el.textContent=c;el.style.display=c?'':'none';}
}
function getMaintItemsByCategory(catId){
  return maintItems.filter(function(it){return it.categoryId===catId;});
}

// Check maint items and inject into My Day reminders
function getMaintDueForMyDay(){
  return maintItems.filter(function(it){
    var s=getMaintStatus(it);return s==='overdue'||s==='soon';
  });
}

function renderMaintCategoryNav(){
  var el=document.getElementById('maint-category-nav');
  if(!el)return;
  var html='';
  maintCategories.forEach(function(cat){
    var count=getMaintItemsByCategory(cat.id).length;
    var dueCount=getMaintItemsByCategory(cat.id).filter(function(it){var s=getMaintStatus(it);return s==='overdue'||s==='soon';}).length;
    var isActive=currentView==='maint-cat-'+cat.id;
    html+='<div class="nav-item'+(isActive?' maint-active':'')+'" onclick="switchView(\'maint-cat-'+cat.id+'\')" id="nav-maint-cat-'+cat.id+'">'
      +'<div class="ic">'+cat.icon+'</div>'
      +'<div class="lbl">'+cat.name+'</div>'
      +(dueCount?'<div class="cnt" style="background:rgba(239,68,68,0.25);color:#fca5a5">'+dueCount+'</div>':count?'<div class="cnt">'+count+'</div>':'')
      +'</div>';
  });
  el.innerHTML=html;
}

function renderMaintView(fw){
  updateMaintCount();
  renderMaintCategoryNav();
  if(currentView==='maint-overview')renderMaintOverview(fw);
  else if(currentView==='maint-all')renderMaintAll(fw);
  else if(currentView==='maint-log')renderMaintLog(fw);
  else if(currentView==='maint-categories')renderMaintCategoriesPage(fw);
  else if(currentView.startsWith('maint-cat-')){
    var catId=currentView.replace('maint-cat-','');
    renderMaintCategory(fw,catId);
  }
}

function maintStatusBadge(item){
  var s=getMaintStatus(item),days=getMaintDaysLeft(item);
  if(s==='overdue')return '<span class="maint-status-badge overdue">⚠️ Terlambat '+Math.abs(days)+' hari</span>';
  if(s==='soon')return '<span class="maint-status-badge soon">⏰ '+days+' hari lagi</span>';
  return '<span class="maint-status-badge ok">✅ OK '+(days!==null?days+' hari lagi':'')+'</span>';
}

function maintItemCard(item,showCat){
  var cat=maintCategories.filter(function(c){return c.id===item.categoryId;})[0];
  var pct=getMaintProgress(item),s=getMaintStatus(item);
  var fillColor=s==='overdue'?'var(--red)':s==='soon'?'#f59e0b':'var(--green)';
  var cardClass='maint-card '+(s==='overdue'?'overdue-maint':s==='soon'?'due-soon':'ok-maint');
  var cost=item.cost?(' · <span style="color:var(--purple);font-family:DM Mono,monospace;font-size:11px">'+fmtRp(item.cost)+'</span>'):'';
  var catLabel=showCat&&cat?'<span style="font-size:10px;padding:2px 7px;border-radius:8px;background:rgba(139,92,246,0.1);color:#7c3aed;font-weight:600">'+cat.icon+' '+cat.name+'</span>':'';
  return '<div class="'+cardClass+'" onclick="openMaintDetail(\''+item.id+'\')">'
    +'<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:6px">'
    +'<div style="font-size:13px;font-weight:600;color:var(--text);flex:1;line-height:1.4">'+item.name+'</div>'
    +maintStatusBadge(item)
    +'</div>'
    +'<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:6px">'
    +catLabel
    +(item.intervalDays?'<span style="font-size:10px;color:var(--muted)">🔄 Setiap '+item.intervalDays+' hari</span>':'')
    +(item.lastDate?'<span style="font-size:10px;color:var(--muted)">📅 Terakhir: '+fmtDate(item.lastDate)+'</span>':'')
    +(item.nextDate?'<span style="font-size:10px;color:var(--muted)">⏭ Next: '+fmtDate(item.nextDate)+'</span>':'')
    +cost
    +'</div>'
    +'<div class="maint-progress"><div class="maint-fill" style="width:'+pct+'%;background:'+fillColor+'"></div></div>'
    +'<div style="font-size:10px;color:var(--muted);display:flex;justify-content:space-between"><span>'+pct+'% interval</span>'
    +(item.note?'<span style="font-style:italic;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:60%">'+item.note+'</span>':'')+'</div>'
    +'</div>';
}

function addMaintForm(catId){
  var walletOpts=buildWalletOpts('',true);
  var catOpts=maintCategories.map(function(c){return'<option value="'+c.id+'"'+(c.id===catId?' selected':'')+'>'+c.icon+' '+c.name+'</option>';}).join('');
  return '<div class="maint-add-form">'
    +'<div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:12px;display:flex;align-items:center;gap:6px">➕ Tambah Item Maintenance</div>'
    +'<div class="maint-form-grid">'
    +'<div><label class="maint-label">Nama Item</label><input class="maint-input" id="maint-add-name" placeholder="cth: Ganti Oli Motor..."></div>'
    +'<div><label class="maint-label">Kategori</label><select class="maint-input" id="maint-add-cat">'+catOpts+'</select></div>'
    +'</div>'
    +'<div class="maint-form-grid-3">'
    +'<div><label class="maint-label">Tanggal Terakhir</label><input type="date" class="maint-input" id="maint-add-last" value="'+todayStr+'"></div>'
    +'<div><label class="maint-label">Interval (hari)</label><input type="number" class="maint-input" id="maint-add-interval" placeholder="cth: 90" min="1"></div>'
    +'<div><label class="maint-label">Biaya (Rp)</label><input type="text" inputmode="numeric" class="maint-input" id="maint-add-cost" placeholder="0" oninput="autoFormatRp(this)"></div>'
    +'</div>'
    +'<div class="maint-form-grid">'
    +'<div><label class="maint-label">Potong dari Wallet</label><select class="maint-input" id="maint-add-wallet">'+walletOpts+'</select></div>'
    +'<div><label class="maint-label">Catatan</label><input class="maint-input" id="maint-add-note" placeholder="Opsional..."></div>'
    +'</div>'
    +'<button class="btn-maint-add" onclick="addMaintItem()">+ Tambah Item</button>'
    +'</div>';
}

function renderMaintOverview(fw){
  var dueItems=maintItems.filter(function(it){return getMaintStatus(it)==='overdue';});
  var soonItems=maintItems.filter(function(it){return getMaintStatus(it)==='soon';});
  var okItems=maintItems.filter(function(it){return getMaintStatus(it)==='ok';});
  var html='<div class="fin-wrap" style="flex:1;overflow-y:auto;padding:0 20px 20px">';
  // Annual cost: sum of (cost * 365/intervalDays) per item
  var annualCost=maintItems.reduce(function(s,it){
    if(!it.cost||!it.intervalDays)return s;
    return s+(it.cost*(365/it.intervalDays));
  },0);
  var monthlyCost=annualCost/12;
  html+='<div class="maint-header-cards">'
    +'<div class="fin-card"><div class="fin-card-label">⚠️ Terlambat</div><div class="fin-card-val" style="color:var(--red)">'+dueItems.length+'</div><div class="fin-card-sub">item perlu segera</div></div>'
    +'<div class="fin-card"><div class="fin-card-label">⏰ Segera</div><div class="fin-card-val" style="color:#f59e0b">'+soonItems.length+'</div><div class="fin-card-sub">dalam 7 hari</div></div>'
    +'<div class="fin-card"><div class="fin-card-label">✅ OK</div><div class="fin-card-val" style="color:var(--green)">'+okItems.length+'</div><div class="fin-card-sub">tidak ada masalah</div></div>'
    +'<div class="fin-card"><div class="fin-card-label">💰 Est. /Bulan</div><div class="fin-card-val" style="color:#8b5cf6;font-size:14px">'+fmtRp(Math.round(monthlyCost))+'</div><div class="fin-card-sub">estimasi biaya bulanan</div></div>'
    +'</div>';

  // My Day reminder section for maint
  var dueForToday=getMaintDueForMyDay();
  if(dueForToday.length){
    html+='<div style="background:linear-gradient(135deg,#fef3c7,#fff7ed);border:1.5px solid #f59e0b;border-radius:var(--radius);padding:14px;margin-bottom:14px">'
      +'<div style="font-size:11px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">🔔 Pengingat My Day</div>';
    dueForToday.forEach(function(it){
      html+='<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid rgba(245,158,11,0.2);font-size:12px">'
        +'<span>'+maintStatusBadge(it)+'</span>'
        +'<span style="font-weight:600;flex:1">'+it.name+'</span>'
        +'<button onclick="openMaintDetail(\''+it.id+'\')" style="padding:4px 10px;border:none;border-radius:6px;background:#f59e0b;color:#fff;cursor:pointer;font-size:11px;font-weight:600;font-family:DM Sans,sans-serif">Tandai Selesai</button>'
        +'</div>';
    });
    html+='</div>';
  }

  // By category
  maintCategories.forEach(function(cat){
    var items=getMaintItemsByCategory(cat.id);
    if(!items.length)return;
    var dueCat=items.filter(function(it){var s=getMaintStatus(it);return s==='overdue'||s==='soon';}).length;
    html+='<div style="margin-bottom:14px">'
      +'<div class="fin-section-title"><span>'+cat.icon+' '+cat.name+' <span style="font-weight:400;color:var(--muted)">('+items.length+' item)</span></span>'
      +(dueCat?'<span style="font-size:11px;color:var(--red);font-weight:700">⚠️ '+dueCat+' perlu perhatian</span>':'')
      +'</div>';
    items.forEach(function(it){html+=maintItemCard(it,false);});
    html+='</div>';
  });

  if(!maintItems.length){
    html+='<div class="empty"><div class="empty-icon">🔧</div>Belum ada item maintenance.<br>Tambah item di menu kategori kendaraan/aset kamu.</div>';
  }

  html+='</div>';
  fw.innerHTML=html;
}

function renderMaintAll(fw){
  var sorted=maintItems.slice().sort(function(a,b){
    var order={overdue:0,soon:1,ok:2};
    return (order[getMaintStatus(a)]||0)-(order[getMaintStatus(b)]||0);
  });
  var html='<div class="fin-wrap" style="flex:1;overflow-y:auto;padding:0 20px 20px">';
  if(!sorted.length){html+='<div class="empty"><div class="empty-icon">📋</div>Belum ada item maintenance.<br>Tambah item lewat menu kategori di sidebar.</div>';}
  else sorted.forEach(function(it){html+=maintItemCard(it,true);});
  html+='</div>';
  fw.innerHTML=html;
}

function renderMaintLog(fw){
  var logs=[];
  maintItems.forEach(function(it){
    (it.log||[]).forEach(function(l){logs.push({item:it,log:l});});
  });
  logs.sort(function(a,b){return b.log.date.localeCompare(a.log.date);});
  var html='<div class="fin-wrap" style="flex:1;overflow-y:auto;padding:0 20px 20px">';
  html+='<div class="fin-table"><div class="fin-table-head" style="grid-template-columns:auto 1fr 1fr auto auto">'+
    '<div>Tanggal</div><div>Item</div><div>Catatan</div><div>Biaya</div><div></div></div>';
  if(!logs.length){html+='<div style="padding:24px;text-align:center;color:var(--muted);font-size:13px">Belum ada riwayat maintenance</div>';}
  else logs.forEach(function(entry){
    var cat=maintCategories.filter(function(c){return c.id===entry.item.categoryId;})[0];
    html+='<div class="fin-table-row" style="grid-template-columns:auto 1fr 1fr auto auto">'
      +'<div style="font-family:DM Mono,monospace;color:var(--muted);white-space:nowrap">'+fmtDate(entry.log.date)+'</div>'
      +'<div><div style="font-weight:500">'+entry.item.name+'</div>'+(cat?'<div style="font-size:10px;color:var(--muted)">'+cat.icon+' '+cat.name+'</div>':'')+'</div>'
      +'<div style="color:var(--muted);font-size:11px">'+( entry.log.note||'—')+'</div>'
      +'<div style="font-family:DM Mono,monospace;color:#8b5cf6;white-space:nowrap">'+(entry.log.cost?fmtRp(entry.log.cost):'—')+'</div>'
      +'<div><button class="del-btn" onclick="deleteMaintLog(\''+entry.item.id+'\',\''+entry.log.id+'\')">🗑</button></div>'
      +'</div>';
  });
  html+='</div></div>';
  fw.innerHTML=html;
}

function renderMaintCategory(fw,catId){
  var cat=maintCategories.filter(function(c){return c.id===catId;})[0];
  if(!cat){fw.innerHTML='<div class="fin-wrap" style="flex:1;overflow-y:auto;padding:0 20px 20px"><div class="empty">Kategori tidak ditemukan</div></div>';return;}
  var items=getMaintItemsByCategory(catId);
  var html='<div class="fin-wrap" style="flex:1;overflow-y:auto;padding:0 20px 20px">';
  html+=addMaintForm(catId);
  if(!items.length){html+='<div class="empty"><div class="empty-icon">'+cat.icon+'</div>Belum ada item untuk '+cat.name+'.<br>Tambah item di atas!</div>';}
  else items.forEach(function(it){html+=maintItemCard(it,false);});
  html+='</div>';
  fw.innerHTML=html;
}

function renderMaintCategoriesPage(fw){
  var html='<div class="fin-wrap" style="flex:1;overflow-y:auto;padding:0 20px 20px">';
  html+='<div class="maint-add-form">'
    +'<div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:12px">➕ Tambah Kategori Baru</div>'
    +'<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end">'
    +'<div><label class="maint-label">Icon (emoji)</label><input class="maint-input" id="maint-cat-icon" placeholder="🚗" style="width:70px;text-align:center;font-size:18px"></div>'
    +'<div style="flex:1;min-width:120px"><label class="maint-label">Nama Kategori</label><input class="maint-input" id="maint-cat-name" placeholder="cth: Sepeda, AC, dll" onkeydown="if(event.key===\'Enter\')addMaintCategory()"></div>'
    +'<button class="btn-maint-add" onclick="addMaintCategory()">+ Tambah</button>'
    +'</div></div>';

  html+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-bottom:14px">';
  maintCategories.forEach(function(cat){
    var count=getMaintItemsByCategory(cat.id).length;
    var dueCount=getMaintItemsByCategory(cat.id).filter(function(it){var s=getMaintStatus(it);return s==='overdue'||s==='soon';}).length;
    html+='<div style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:14px;display:flex;flex-direction:column;gap:8px;cursor:pointer;transition:box-shadow 0.15s" onclick="switchView(\'maint-cat-'+cat.id+'\')" onmouseover="this.style.boxShadow=\'0 4px 14px rgba(0,0,0,0.09)\'" onmouseout="this.style.boxShadow=\'\'">'
      +'<div style="display:flex;align-items:center;justify-content:space-between">'
      +'<span style="font-size:28px">'+cat.icon+'</span>'
      +(dueCount?'<span style="font-size:10px;background:#fee2e2;color:#b91c1c;padding:2px 7px;border-radius:8px;font-weight:700">⚠️ '+dueCount+'</span>':'')
      +'</div>'
      +'<div style="font-size:13px;font-weight:600;color:var(--text)">'+cat.name+'</div>'
      +'<div style="font-size:11px;color:var(--muted)">'+count+' item maintenance</div>'
      +'<div style="display:flex;gap:6px;margin-top:4px">'
      +'<button onclick="event.stopPropagation();switchView(\'maint-cat-'+cat.id+'\')" style="flex:1;padding:5px;border:1px solid rgba(139,92,246,0.3);border-radius:6px;background:rgba(139,92,246,0.07);color:#7c3aed;cursor:pointer;font-size:11px;font-weight:600;font-family:DM Sans,sans-serif">Lihat</button>'
      +'<button onclick="event.stopPropagation();deleteMaintCategory(\''+cat.id+'\')" style="padding:5px 8px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--red);cursor:pointer;font-size:11px;font-family:DM Sans,sans-serif">🗑</button>'
      +'</div>'
      +'</div>';
  });
  html+='</div></div>';
  fw.innerHTML=html;
}

// ─── MAINT ACTIONS ───
function addMaintItem(){
  var name=document.getElementById('maint-add-name').value.trim();
  if(!name){showToast('Nama item wajib diisi!');return;}
  var catId=document.getElementById('maint-add-cat').value;
  var lastDate=document.getElementById('maint-add-last').value||todayStr;
  var intervalDays=parseInt(document.getElementById('maint-add-interval').value)||0;
  var cost=getRawVal(document.getElementById('maint-add-cost'))||0;
  var walletId=document.getElementById('maint-add-wallet').value||'';
  var note=document.getElementById('maint-add-note').value.trim();
  var nextDate=intervalDays?computeNextDate(lastDate,intervalDays):'';
  var item={
    id:'m'+maintNextId++,name:name,categoryId:catId,
    lastDate:lastDate,intervalDays:intervalDays,nextDate:nextDate,
    cost:cost,walletId:walletId,note:note,
    log:[{id:'l'+Date.now(),date:lastDate,note:'Pertama kali ditambahkan',cost:cost,walletId:walletId}]
  };
  // Deduct from wallet if set
  if(cost&&walletId){
    var w=getWalletById(walletId);
    if(w){w.balance-=cost;showToast(fmtRp(cost)+' dikurangi dari '+w.name);}
    finTransactions.push({id:'ft'+finNextId++,type:'expense',amount:cost,category:'Maintenance',note:'Maintenance: '+name,date:lastDate,walletId:walletId});
  }
  maintItems.push(item);
  saveData(true);render();showToast('Item "'+name+'" ditambahkan! 🔧');
}

function addMaintCategory(){
  var icon=document.getElementById('maint-cat-icon').value.trim()||'🔧';
  var name=document.getElementById('maint-cat-name').value.trim();
  if(!name){showToast('Nama kategori wajib diisi!');return;}
  var id='mc'+Date.now();
  maintCategories.push({id:id,name:name,icon:icon});
  document.getElementById('maint-cat-icon').value='';
  document.getElementById('maint-cat-name').value='';
  // FIX: blur aktif input agar guard input-fokus di renderMain() tidak memblokir render
  var activeEl=document.activeElement;
  if(activeEl&&activeEl.blur)activeEl.blur();
  saveData(true);render();showToast('Kategori "'+name+'" ditambahkan! 📁');
}

function deleteMaintCategory(catId){
  var cat=maintCategories.filter(function(c){return c.id===catId;})[0];
  if(!cat)return;
  var count=getMaintItemsByCategory(catId).length;
  if(count>0&&!confirm('Kategori "'+cat.name+'" masih punya '+count+' item. Tetap hapus?'))return;
  maintCategories=maintCategories.filter(function(c){return c.id!==catId;});
  maintItems=maintItems.filter(function(it){return it.categoryId!==catId;});
  if(currentView==='maint-cat-'+catId)switchView('maint-overview');
  saveData(true);render();showToast('Kategori dihapus');
}

function deleteMaintItem(itemId){
  maintItems=maintItems.filter(function(it){return it.id!==itemId;});
  closeMaintModal();saveData(true);render();showToast('Item dihapus');
}

function deleteMaintLog(itemId,logId){
  var item=maintItems.filter(function(it){return it.id===itemId;})[0];
  if(!item)return;
  item.log=item.log.filter(function(l){return l.id!==logId;});
  saveData(true);render();showToast('Log dihapus');
}

function openMaintDetail(itemId){
  var item=maintItems.filter(function(it){return it.id===itemId;})[0];
  if(!item)return;
  selectedMaintItem=item;
  var cat=maintCategories.filter(function(c){return c.id===item.categoryId;})[0];
  var walletOpts=buildWalletOpts(item.walletId,true);
  var catOpts=maintCategories.map(function(c){return'<option value="'+c.id+'"'+(c.id===item.categoryId?' selected':'')+'>'+c.icon+' '+c.name+'</option>';}).join('');
  var logs=(item.log||[]).slice().sort(function(a,b){return b.date.localeCompare(a.date);});
  document.getElementById('maintModalTitle').textContent=(cat?cat.icon+' ':'🔧 ')+item.name;

  var html='';
  // Status banner
  var s=getMaintStatus(item),days=getMaintDaysLeft(item),pct=getMaintProgress(item);
  var bannerBg=s==='overdue'?'#fee2e2':s==='soon'?'#fef3c7':'#dcfce7';
  var bannerColor=s==='overdue'?'#b91c1c':s==='soon'?'#92400e':'#15803d';
  var bannerText=s==='overdue'?'⚠️ Terlambat '+Math.abs(days)+' hari! Segera lakukan maintenance':s==='soon'?'⏰ Jadwal maintenance '+days+' hari lagi':'✅ Maintenance masih OK ('+(days!==null?days+' hari lagi':'tidak ada jadwal')+')';
  html+='<div style="background:'+bannerBg+';border-radius:8px;padding:10px 12px;margin-bottom:14px;font-size:12px;font-weight:600;color:'+bannerColor+'">'+bannerText+'</div>';

  // Progress bar
  html+='<div style="margin-bottom:14px">'
    +'<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:4px"><span>Progress interval</span><span>'+pct+'%</span></div>'
    +'<div class="maint-progress"><div class="maint-fill" style="width:'+pct+'%;background:'+(s==='overdue'?'var(--red)':s==='soon'?'#f59e0b':'var(--green)')+'"></div></div>'
    +'<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--muted);margin-top:3px">'
    +'<span>📅 '+(item.lastDate?fmtDate(item.lastDate):'—')+'</span>'
    +'<span>⏭ '+(item.nextDate?fmtDate(item.nextDate):'—')+'</span>'
    +'</div></div>';

  // Edit form
  html+='<div style="background:var(--bg);border-radius:10px;padding:14px;margin-bottom:14px">'
    +'<div style="font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">✏️ Edit Info</div>'
    +'<div class="maint-form-grid">'
    +'<div><label class="maint-label">Nama</label><input class="maint-input" id="md-name" value="'+escHtml(item.name)+'"></div>'
    +'<div><label class="maint-label">Kategori</label><select class="maint-input" id="md-cat">'+catOpts+'</select></div>'
    +'</div>'
    +'<div class="maint-form-grid-3">'
    +'<div><label class="maint-label">Interval (hari)</label><input type="number" class="maint-input" id="md-interval" value="'+(item.intervalDays||'')+'" min="1"></div>'
    +'<div><label class="maint-label">Biaya per service</label><input type="text" inputmode="numeric" class="maint-input" id="md-cost" value="'+(item.cost||0)+'" oninput="autoFormatRp(this)"></div>'
    +'<div><label class="maint-label">Wallet default</label><select class="maint-input" id="md-wallet">'+walletOpts+'</select></div>'
    +'</div>'
    +'<div><label class="maint-label">Catatan</label><input class="maint-input" id="md-note" value="'+escHtml(item.note||'')+'"></div>'
    +'<div style="margin-top:10px;display:flex;gap:8px">'
    +'<button onclick="saveMaintEdit()" style="flex:1;padding:8px;border:none;border-radius:7px;background:#8b5cf6;color:#fff;cursor:pointer;font-size:12px;font-weight:600;font-family:DM Sans,sans-serif">💾 Simpan Edit</button>'
    +'<button onclick="deleteMaintItem(\''+item.id+'\')" style="padding:8px 14px;border:1px solid var(--border);border-radius:7px;background:var(--bg);color:var(--red);cursor:pointer;font-size:12px;font-family:DM Sans,sans-serif">🗑 Hapus</button>'
    +'</div>'
    +'</div>';

  // Mark done / add log
  var walletOptsLog=buildWalletOpts('',true);
  html+='<div style="background:rgba(139,92,246,0.06);border:1.5px solid rgba(139,92,246,0.2);border-radius:10px;padding:14px;margin-bottom:14px">'
    +'<div style="font-size:11px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">✅ Catat Maintenance Selesai</div>'
    +'<div class="maint-form-grid-3">'
    +'<div><label class="maint-label">Tanggal Selesai</label><input type="date" class="maint-input" id="md-done-date" value="'+todayStr+'"></div>'
    +'<div><label class="maint-label">Biaya (Rp)</label><input type="text" inputmode="numeric" class="maint-input" id="md-done-cost" placeholder="0" value="'+(item.cost||0)+'" oninput="autoFormatRp(this)"></div>'
    +'<div><label class="maint-label">Dari Wallet</label><select class="maint-input" id="md-done-wallet">'+walletOptsLog+'</select></div>'
    +'</div>'
    +'<div style="margin-bottom:8px"><label class="maint-label">Catatan</label><input class="maint-input" id="md-done-note" placeholder="Opsional..."></div>'
    +'<button onclick="markMaintDone(\''+item.id+'\')" style="width:100%;padding:9px;border:none;border-radius:7px;background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:#fff;cursor:pointer;font-size:13px;font-weight:700;font-family:DM Sans,sans-serif">✅ Tandai Selesai & Perbarui Jadwal</button>'
    +'</div>';

  // Log history
  html+='<div style="font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">📜 Riwayat</div>';
  if(!logs.length){html+='<div style="color:var(--muted);font-size:12px;text-align:center;padding:12px">Belum ada riwayat</div>';}
  else{
    html+='<div style="border:1px solid var(--border);border-radius:8px;overflow:hidden">';
    logs.forEach(function(l,i){
      html+='<div class="maint-log-row" style="'+(i===logs.length-1?'border-bottom:none':'')+'padding:8px 10px">'
        +'<span style="font-family:DM Mono,monospace;font-size:11px;color:var(--muted);flex-shrink:0;white-space:nowrap">'+fmtDate(l.date)+'</span>'
        +'<span style="flex:1;font-size:12px">'+( l.note||'Maintenance dilakukan')+'</span>'
        +(l.cost?'<span style="font-family:DM Mono,monospace;font-size:11px;color:#8b5cf6;white-space:nowrap">'+fmtRp(l.cost)+'</span>':'')
        +'<button onclick="deleteMaintLog(\''+item.id+'\',\''+l.id+'\')" style="border:none;background:none;cursor:pointer;color:var(--muted);font-size:12px;padding:2px 4px;line-height:1;border-radius:4px" title="Hapus log">×</button>'
        +'</div>';
    });
    html+='</div>';
  }

  document.getElementById('maintModalBody').innerHTML=html;
  document.getElementById('maintModal').classList.add('show');
}

function escHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

function closeMaintModal(){
  document.getElementById('maintModal').classList.remove('show');
  selectedMaintItem=null;
}

function saveMaintEdit(){
  if(!selectedMaintItem)return;
  selectedMaintItem.name=document.getElementById('md-name').value.trim()||selectedMaintItem.name;
  selectedMaintItem.categoryId=document.getElementById('md-cat').value;
  selectedMaintItem.intervalDays=parseInt(document.getElementById('md-interval').value)||0;
  selectedMaintItem.cost=parseFloat(document.getElementById('md-cost').value)||0;
  selectedMaintItem.walletId=document.getElementById('md-wallet').value||'';
  selectedMaintItem.note=document.getElementById('md-note').value.trim();
  if(selectedMaintItem.intervalDays&&selectedMaintItem.lastDate){
    selectedMaintItem.nextDate=computeNextDate(selectedMaintItem.lastDate,selectedMaintItem.intervalDays);
  }
  saveData(true);closeMaintModal();render();showToast('Item diperbarui ✓');
}

function markMaintDone(itemId){
  var item=maintItems.filter(function(it){return it.id===itemId;})[0];
  if(!item)return;
  var doneDate=document.getElementById('md-done-date').value||todayStr;
  var doneCost=getRawVal(document.getElementById('md-done-cost'))||0;
  var doneWallet=document.getElementById('md-done-wallet').value||'';
  var doneNote=document.getElementById('md-done-note').value.trim()||'Maintenance selesai';
  // Update item
  item.lastDate=doneDate;
  if(item.intervalDays)item.nextDate=computeNextDate(doneDate,item.intervalDays);
  if(!item.log)item.log=[];
  item.log.push({id:'l'+Date.now(),date:doneDate,note:doneNote,cost:doneCost,walletId:doneWallet});
  // Deduct wallet
  if(doneCost&&doneWallet){
    var w=getWalletById(doneWallet);
    if(w){w.balance-=doneCost;showToast(fmtRp(doneCost)+' dikurangi dari '+w.name);}
    finTransactions.push({id:'ft'+finNextId++,type:'expense',amount:doneCost,category:'Maintenance',note:'Maintenance: '+item.name,date:doneDate,walletId:doneWallet});
  }
  saveData(true);closeMaintModal();render();
  showToast('✅ Maintenance "'+item.name+'" dicatat! Jadwal berikutnya: '+(item.nextDate?fmtDate(item.nextDate):'—'));
}

// Inject tagihan reminders into My Day
function getTagihanMyDayHTML(){
  if(!finTagihan||!finTagihan.length)return'';
  var dueTagihan=finTagihan.filter(function(t){
    if(t.status==='paid')return false;
    var due=getTagihanNextDue(t);if(!due)return false;
    var diff=Math.round((new Date(due+'T00:00:00')-new Date(todayStr+'T00:00:00'))/86400000);
    return diff<=7;
  });
  if(!dueTagihan.length)return'';
  var isOpen=groupOpenState['tagihan_myday']!==false;
  var html='<div class="group-accordion" style="border-color:rgba(139,92,246,0.4);background:linear-gradient(135deg,#f5f3ff,#ede9fe)">'
    +'<div class="group-header" onclick="toggleGroup(\'tagihan_myday\')" style="background:transparent">'
    +'<div class="group-header-left" style="color:#6d28d9">🧾 Tagihan Mendekati Jatuh Tempo<span class="group-badge" style="background:#8b5cf6">'+dueTagihan.length+'</span></div>'
    +'<span class="group-chevron'+(isOpen?' open':'')+'">▼</span>'
    +'</div>'
    +'<div class="group-body'+(isOpen?' open':'')+'"><div style="padding:6px 8px 8px">';
  dueTagihan.forEach(function(t){
    var due=getTagihanNextDue(t);
    var diff=due?Math.round((new Date(due+'T00:00:00')-new Date(todayStr+'T00:00:00'))/86400000):null;
    var st=getTagihanStatus(t);
    var color=st==='overdue'?'var(--red)':'#8b5cf6';
    var diffText=diff===null?'':(diff<0?'⚠️ Lewat '+Math.abs(diff)+' hari':(diff===0?'Hari ini!':diff+' hari lagi'));
    html+='<div class="task-card" style="border-left:3px solid '+color+';cursor:pointer" onclick="switchView(\'fin-tagihan\')">'
      +'<div style="width:20px;height:20px;border-radius:50%;border:2px solid '+color+';display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0;margin-top:1px">🧾</div>'
      +'<div class="task-body">'
      +'<div class="task-name">'+t.name+'</div>'
      +'<div class="task-meta">'
      +'<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;background:'+(st==='overdue'?'#fee2e2':'#ede9fe')+';color:'+color+'">'+diffText+'</span>'
      +'<span style="font-size:10px;color:#8b5cf6;font-family:DM Mono,monospace;font-weight:700">'+fmtRp(t.amount)+'</span>'
      +(due?'<span style="font-size:10px;color:var(--muted)">'+fmtDate(due)+'</span>':'')
      +'</div></div>'
      +'<button onclick="event.stopPropagation();bayarTagihan(\''+t.id+'\')" style="border:none;background:#8b5cf6;color:#fff;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:11px;font-weight:600;font-family:DM Sans,sans-serif;flex-shrink:0;white-space:nowrap">💳 Bayar</button>'
      +'</div>';
  });
  html+='</div></div></div>';
  return html;
}

// ── Helper: load/save segera dimulai window setting ──
function getSegDimulaiWindowMs(){
  try{
    var v=parseInt(localStorage.getItem('chitask_segera_window')||'60',10);
    if(isNaN(v)||v<5)v=60;
    return v*60*1000;
  }catch(e){return 3600000;}
}
function setSegDimulaiWindow(minutes){
  try{localStorage.setItem('chitask_segera_window',String(minutes));}catch(e){}
}

// ── Upcoming task reminders (reminder waktu dalam window yg dipilih, belum lewat) ──
function getUpcomingTaskReminderHTML(){
  var now=new Date();
  var nowMs=now.getTime();
  var windowMs=getSegDimulaiWindowMs();
  var upcoming=tasks.filter(function(t){
    if(t.done||!t.reminder||!t.myday)return false;
    // Hanya task hari ini
    if(t.due&&t.due!==todayStr&&t.type!=='Habit')return false;
    if(t.type==='Habit'&&!isHabitDueToday(t))return false;
    var parts=t.reminder.split(':');
    if(parts.length<2)return false;
    var remDate=new Date(now);
    remDate.setHours(parseInt(parts[0]),parseInt(parts[1]),0,0);
    var diffMs=remDate-nowMs;
    // Tampilkan kalau waktunya antara sekarang s/d window yang dipilih (belum lewat)
    return diffMs>=0&&diffMs<=windowMs;
  });
  if(!upcoming.length)return'';
  var isOpen=groupOpenState['upcoming_reminder_myday']!==false;
  var html='<div class="group-accordion" style="border-color:rgba(59,130,246,0.4);background:linear-gradient(135deg,#eff6ff,#dbeafe)">'
    +'<div class="group-header" onclick="toggleGroup(\'upcoming_reminder_myday\')" style="background:transparent">'
    +'<div class="group-header-left" style="color:#1d4ed8">\u23f0 Segera Dimulai<span class="group-badge" style="background:#3b82f6">'+upcoming.length+'</span></div>'
    +'<span class="group-chevron'+(isOpen?' open':'')+'">▼</span>'
    +'</div>'
    +'<div class="group-body'+(isOpen?' open':'')+'"><div style="padding:6px 8px 8px">';
  upcoming.forEach(function(t){
    var parts=t.reminder.split(':');
    var remDate=new Date(now);
    remDate.setHours(parseInt(parts[0]),parseInt(parts[1]),0,0);
    var diffMs=remDate-now;
    var diffMin=Math.round(diffMs/60000);
    var timeLabel;
    if(diffMin<=1){timeLabel='Sekarang!';}
    else if(diffMin<60){timeLabel=diffMin+' menit lagi';}
    else{var jamnya=Math.floor(diffMin/60);var sisaMenit=diffMin%60;timeLabel=sisaMenit>0?(jamnya+' jam '+sisaMenit+' menit lagi'):(jamnya+' jam lagi');}
    var color='#3b82f6';
    var bgBadge='#dbeafe';
    if(diffMin<=10){color='#dc2626';bgBadge='#fee2e2';}
    else if(diffMin<=30){color='#d97706';bgBadge='#fef3c7';}
    html+='<div class="task-card" style="border-left:3px solid '+color+'" onclick="openDetail('+t.id+')">'
      +'<div style="width:20px;height:20px;border-radius:50%;background:'+color+';display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0;margin-top:1px;color:#fff">\u23f0</div>'
      +'<div class="task-body">'
      +'<div class="task-name">'+t.name+'</div>'
      +'<div class="task-meta">'
      +'<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;background:'+bgBadge+';color:'+color+'">'+timeLabel+'</span>'
      +'<span style="font-size:10px;color:var(--muted)">🔔 '+t.reminder+'</span>'
      +(t.type==='Habit'?'<span class="tag habit">Habit</span>':'')
      +(t.important?'<span style="color:#f59e0b;font-size:13px">★</span>':'')
      +'</div></div>'
      +'</div>';
  });
  html+='</div></div></div>';
  return html;
}

// Inject maintenance reminders into My Day
function getMaintMyDayHTML(){
  var dueItems=getMaintDueForMyDay();
  if(!dueItems.length)return '';
  var html='<div class="group-accordion" style="border-color:rgba(245,158,11,0.4);background:linear-gradient(135deg,#fffbeb,#fff7ed)">'
    +'<div class="group-header" onclick="toggleGroup(\'maint_myday\')" style="background:transparent">'
    +'<div class="group-header-left" style="color:#92400e">🔧 Maintenance Perlu Perhatian<span class="group-badge" style="background:#f59e0b">'+dueItems.length+'</span></div>'
    +'<span class="group-chevron'+(groupOpenState['maint_myday']!==false?' open':'')+'">▼</span>'
    +'</div>'
    +'<div class="group-body'+(groupOpenState['maint_myday']!==false?' open':'')+'"><div style="padding:6px 8px 8px">';
  dueItems.forEach(function(it){
    var days=getMaintDaysLeft(it),s=getMaintStatus(it);
    var color=s==='overdue'?'var(--red)':'#f59e0b';
    html+='<div class="task-card" style="border-left:3px solid '+color+';cursor:pointer" onclick="openMaintDetail(\''+it.id+'\')">'
      +'<div style="width:20px;height:20px;border-radius:50%;border:2px solid '+color+';display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0;margin-top:1px">🔧</div>'
      +'<div class="task-body">'
      +'<div class="task-name">'+it.name+'</div>'
      +'<div class="task-meta">'
      +maintStatusBadge(it)
      +(it.cost?'<span style="font-size:10px;color:#8b5cf6;font-family:DM Mono,monospace">'+fmtRp(it.cost)+'</span>':'')
      +'</div></div>'
      +'<button onclick="event.stopPropagation();openMaintDetail(\''+it.id+'\')" style="border:none;background:#f59e0b;color:#fff;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:11px;font-weight:600;font-family:DM Sans,sans-serif;flex-shrink:0;white-space:nowrap">Catat</button>'
      +'</div>';
  });
  html+='</div></div></div>';
  return html;
}

// Helper: ambil warna jurnal banner sesuai tema aktif
function getJournalThemeColors(){
  var t = activeTheme || 'theme-light';
  var palettes = {
    'theme-sololeveling': {
      // Ungu gelap ala Solo Leveling
      bg:       'linear-gradient(135deg,rgba(20,16,48,0.95),rgba(12,10,32,0.92))',
      border:   'rgba(124,106,247,0.5)',
      borderHov:'rgba(168,156,255,0.75)',
      orb1:     'rgba(124,106,247,0.12)',
      orb2:     'rgba(168,156,255,0.07)',
      iconBg:   'linear-gradient(135deg,rgba(124,106,247,0.3),rgba(90,70,230,0.2))',
      iconBorder:'rgba(124,106,247,0.45)',
      iconShadow:'0 2px 10px rgba(124,106,247,0.3)',
      titleColor:'#a89cff',
      subColor:  '#7c6af7',
      badgeBg:  'rgba(124,106,247,0.2)',
      badgeColor:'#c4baff',
      previewBg: 'rgba(124,106,247,0.08)',
      previewBorder:'rgba(124,106,247,0.4)',
      previewColor:'#a89cff',
      btnBg:    'linear-gradient(135deg,#7c6af7,#5b4de0)',
      btnShadow:'0 3px 12px rgba(124,106,247,0.45)',
      editBg:   'rgba(124,106,247,0.15)',
      editBorder:'rgba(124,106,247,0.4)',
      editColor: '#a89cff',
      editBgHov:'rgba(124,106,247,0.28)',
      glow:     '0 6px 24px rgba(124,106,247,0.25)',
      glowHov:  '0 8px 28px rgba(124,106,247,0.38)',
      streakColor:'#9d8fff',
      label:    'Jurnal Hari Ini', writeLbl:'Tulis jurnal hari ini'
    },
    'theme-slytherin': {
      // Hijau gelap Slytherin
      bg:       'linear-gradient(135deg,rgba(4,20,8,0.95),rgba(2,12,4,0.92))',
      border:   'rgba(45,187,93,0.45)',
      borderHov:'rgba(93,219,160,0.7)',
      orb1:     'rgba(45,187,93,0.1)',
      orb2:     'rgba(93,219,160,0.06)',
      iconBg:   'linear-gradient(135deg,rgba(45,187,93,0.25),rgba(26,122,60,0.15))',
      iconBorder:'rgba(45,187,93,0.4)',
      iconShadow:'0 2px 10px rgba(45,187,93,0.25)',
      titleColor:'#5ddba0',
      subColor:  '#2dbb5d',
      badgeBg:  'rgba(45,187,93,0.18)',
      badgeColor:'#86efac',
      previewBg: 'rgba(45,187,93,0.07)',
      previewBorder:'rgba(45,187,93,0.35)',
      previewColor:'#86efac',
      btnBg:    'linear-gradient(135deg,#2dbb5d,#1a7a3c)',
      btnShadow:'0 3px 12px rgba(45,187,93,0.4)',
      editBg:   'rgba(45,187,93,0.12)',
      editBorder:'rgba(45,187,93,0.35)',
      editColor: '#5ddba0',
      editBgHov:'rgba(45,187,93,0.24)',
      glow:     '0 6px 24px rgba(45,187,93,0.2)',
      glowHov:  '0 8px 28px rgba(45,187,93,0.32)',
      streakColor:'#4ade80',
      label:    'Jurnal Hari Ini', writeLbl:'Tulis jurnal hari ini'
    },
    'theme-fluffytown': {
      // Pink pastel Fluffy Town
      bg:       'linear-gradient(135deg,rgba(255,240,250,0.97),rgba(253,232,244,0.95))',
      border:   'rgba(244,114,182,0.45)',
      borderHov:'rgba(236,72,153,0.65)',
      orb1:     'rgba(244,114,182,0.12)',
      orb2:     'rgba(251,207,232,0.15)',
      iconBg:   'linear-gradient(135deg,rgba(244,114,182,0.28),rgba(216,72,153,0.15))',
      iconBorder:'rgba(244,114,182,0.45)',
      iconShadow:'0 2px 10px rgba(244,114,182,0.25)',
      titleColor:'#9d174d',
      subColor:  '#be185d',
      badgeBg:  'rgba(244,114,182,0.18)',
      badgeColor:'#9d174d',
      previewBg: 'rgba(244,114,182,0.08)',
      previewBorder:'rgba(244,114,182,0.4)',
      previewColor:'#be185d',
      btnBg:    'linear-gradient(135deg,#f472b6,#ec4899)',
      btnShadow:'0 3px 12px rgba(244,114,182,0.45)',
      editBg:   'rgba(244,114,182,0.15)',
      editBorder:'rgba(244,114,182,0.4)',
      editColor: '#be185d',
      editBgHov:'rgba(244,114,182,0.28)',
      glow:     '0 6px 20px rgba(244,114,182,0.22)',
      glowHov:  '0 8px 26px rgba(244,114,182,0.35)',
      streakColor:'#ec4899',
      label:    'Jurnal Hari Ini', writeLbl:'Tulis jurnal hari ini'
    },
    'theme-sunset': {
      // Oranye api Sunset
      bg:       'linear-gradient(135deg,rgba(45,10,0,0.95),rgba(30,6,0,0.92))',
      border:   'rgba(234,88,12,0.45)',
      borderHov:'rgba(251,146,60,0.68)',
      orb1:     'rgba(234,88,12,0.12)',
      orb2:     'rgba(251,146,60,0.07)',
      iconBg:   'linear-gradient(135deg,rgba(234,88,12,0.28),rgba(194,65,12,0.18))',
      iconBorder:'rgba(234,88,12,0.45)',
      iconShadow:'0 2px 10px rgba(234,88,12,0.3)',
      titleColor:'#fb923c',
      subColor:  '#ea580c',
      badgeBg:  'rgba(234,88,12,0.2)',
      badgeColor:'#fdba74',
      previewBg: 'rgba(234,88,12,0.08)',
      previewBorder:'rgba(234,88,12,0.38)',
      previewColor:'#fdba74',
      btnBg:    'linear-gradient(135deg,#ea580c,#c2410c)',
      btnShadow:'0 3px 12px rgba(234,88,12,0.45)',
      editBg:   'rgba(234,88,12,0.15)',
      editBorder:'rgba(234,88,12,0.4)',
      editColor: '#fb923c',
      editBgHov:'rgba(234,88,12,0.28)',
      glow:     '0 6px 24px rgba(234,88,12,0.22)',
      glowHov:  '0 8px 28px rgba(234,88,12,0.35)',
      streakColor:'#fb923c',
      label:    'Jurnal Hari Ini', writeLbl:'Tulis jurnal hari ini'
    },
    'theme-midnight': {
      // Ungu malam Midnight
      bg:       'linear-gradient(135deg,rgba(18,16,30,0.96),rgba(12,10,22,0.93))',
      border:   'rgba(139,92,246,0.4)',
      borderHov:'rgba(167,139,250,0.65)',
      orb1:     'rgba(139,92,246,0.1)',
      orb2:     'rgba(167,139,250,0.06)',
      iconBg:   'linear-gradient(135deg,rgba(139,92,246,0.28),rgba(109,40,217,0.18))',
      iconBorder:'rgba(139,92,246,0.4)',
      iconShadow:'0 2px 10px rgba(139,92,246,0.25)',
      titleColor:'#a78bfa',
      subColor:  '#8b5cf6',
      badgeBg:  'rgba(139,92,246,0.18)',
      badgeColor:'#c4b5fd',
      previewBg: 'rgba(139,92,246,0.07)',
      previewBorder:'rgba(139,92,246,0.35)',
      previewColor:'#c4b5fd',
      btnBg:    'linear-gradient(135deg,#8b5cf6,#7c3aed)',
      btnShadow:'0 3px 12px rgba(139,92,246,0.4)',
      editBg:   'rgba(139,92,246,0.14)',
      editBorder:'rgba(139,92,246,0.38)',
      editColor: '#a78bfa',
      editBgHov:'rgba(139,92,246,0.26)',
      glow:     '0 6px 24px rgba(139,92,246,0.2)',
      glowHov:  '0 8px 28px rgba(139,92,246,0.32)',
      streakColor:'#a78bfa',
      label:    'Jurnal Hari Ini', writeLbl:'Tulis jurnal hari ini'
    },
    'theme-dark': {
      // Amber/warm dark
      bg:       'linear-gradient(135deg,rgba(28,22,10,0.95),rgba(20,16,6,0.92))',
      border:   'rgba(217,119,6,0.4)',
      borderHov:'rgba(251,191,36,0.6)',
      orb1:     'rgba(245,158,11,0.1)',
      orb2:     'rgba(251,191,36,0.06)',
      iconBg:   'linear-gradient(135deg,rgba(245,158,11,0.25),rgba(180,83,9,0.15))',
      iconBorder:'rgba(217,119,6,0.4)',
      iconShadow:'0 2px 10px rgba(217,119,6,0.25)',
      titleColor:'#fbbf24',
      subColor:  '#d97706',
      badgeBg:  'rgba(217,119,6,0.18)',
      badgeColor:'#fcd34d',
      previewBg: 'rgba(217,119,6,0.07)',
      previewBorder:'rgba(217,119,6,0.35)',
      previewColor:'#fcd34d',
      btnBg:    'linear-gradient(135deg,#d97706,#b45309)',
      btnShadow:'0 3px 12px rgba(217,119,6,0.4)',
      editBg:   'rgba(217,119,6,0.14)',
      editBorder:'rgba(217,119,6,0.38)',
      editColor: '#fbbf24',
      editBgHov:'rgba(217,119,6,0.26)',
      glow:     '0 6px 24px rgba(217,119,6,0.2)',
      glowHov:  '0 8px 28px rgba(217,119,6,0.32)',
      streakColor:'#fbbf24',
      label:    'Jurnal Hari Ini', writeLbl:'Tulis jurnal hari ini'
    }
  };
  // Default (theme-light & tema lain)
  var def = {
    bg:       'linear-gradient(135deg,rgba(139,92,246,0.1),rgba(124,58,237,0.06))',
    border:   'rgba(139,92,246,0.3)',
    borderHov:'rgba(139,92,246,0.5)',
    orb1:     'rgba(139,92,246,0.08)',
    orb2:     'rgba(139,92,246,0.05)',
    iconBg:   'linear-gradient(135deg,rgba(139,92,246,0.22),rgba(109,40,217,0.13))',
    iconBorder:'rgba(139,92,246,0.3)',
    iconShadow:'0 2px 8px rgba(139,92,246,0.18)',
    titleColor:'#6d28d9',
    subColor:  '#8b5cf6',
    badgeBg:  'rgba(139,92,246,0.13)',
    badgeColor:'#7c3aed',
    previewBg: 'rgba(139,92,246,0.06)',
    previewBorder:'rgba(139,92,246,0.3)',
    previewColor:'#6d28d9',
    btnBg:    'linear-gradient(135deg,#8b5cf6,#7c3aed)',
    btnShadow:'0 3px 12px rgba(139,92,246,0.4)',
    editBg:   'rgba(139,92,246,0.1)',
    editBorder:'rgba(139,92,246,0.35)',
    editColor: '#7c3aed',
    editBgHov:'rgba(139,92,246,0.2)',
    glow:     '0 6px 20px rgba(139,92,246,0.18)',
    glowHov:  '0 6px 20px rgba(139,92,246,0.28)',
    streakColor:'#8b5cf6',
    label:    'Jurnal Hari Ini', writeLbl:'Tulis jurnal hari ini'
  };
  return palettes[t] || def;
}

// Journal banner di My Day
function getJournalMyDayBannerHTML(){
  var entry=getJournalEntry(todayStr);
  var streak=getJournalStreak();
  var c=getJournalThemeColors();
  if(entry){
    var moodIcon=entry.mood>=0?MOODS[entry.mood]:'📓';
    var moodLabel=entry.mood>=0?MOOD_LABELS[entry.mood]:'';
    var preview=entry.content?(entry.content.length>90?entry.content.slice(0,90)+'…':entry.content):'';
    return '<div style="position:relative;overflow:hidden;background:'+c.bg+';border:1.5px solid '+c.border+';border-radius:12px;padding:14px 14px 12px;margin-bottom:10px;cursor:pointer;transition:box-shadow 0.18s,border-color 0.18s" onclick="switchView(\'journal-today\')" onmouseover="this.style.boxShadow=\''+c.glowHov+'\';this.style.borderColor=\''+c.borderHov+'\'" onmouseout="this.style.boxShadow=\'\';this.style.borderColor=\''+c.border+'\'">'
      // decorative orb
      +'<div style="position:absolute;top:-18px;right:-18px;width:72px;height:72px;border-radius:50%;background:'+c.orb1+';pointer-events:none"></div>'
      +'<div style="position:absolute;top:6px;right:6px;width:36px;height:36px;border-radius:50%;background:'+c.orb2+';pointer-events:none"></div>'
      // top row: icon + label + check badge
      +'<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:8px">'
      +'<div style="display:flex;align-items:center;gap:9px;flex:1;min-width:0">'
      +'<div style="width:38px;height:38px;border-radius:10px;background:'+c.iconBg+';border:1.5px solid '+c.iconBorder+';display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;box-shadow:'+c.iconShadow+'">'+moodIcon+'</div>'
      +'<div style="min-width:0">'
      +'<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">'
      +'<span style="font-size:12px;font-weight:700;color:'+c.titleColor+';letter-spacing:-0.2px">'+c.label+'</span>'
      +'<span style="font-size:10px;background:'+c.badgeBg+';color:'+c.badgeColor+';border-radius:10px;padding:1px 7px;font-weight:700">✓ Tersimpan</span>'
      +(moodLabel?'<span style="font-size:10px;background:'+c.badgeBg+';color:'+c.badgeColor+';border-radius:10px;padding:1px 7px;font-weight:600">'+moodLabel+'</span>':'')
      +'</div>'
      +(streak>0?'<div style="font-size:10px;color:'+c.streakColor+';margin-top:3px;font-family:\'DM Mono\',monospace;font-weight:600">🔥 '+streak+' hari streak</div>':'')
      +'</div></div>'
      +'<button onclick="event.stopPropagation();openJournalModal(\''+todayStr+'\')" style="border:1.5px solid '+c.editBorder+';background:'+c.editBg+';color:'+c.editColor+';border-radius:8px;padding:5px 12px;cursor:pointer;font-size:11px;font-weight:700;font-family:DM Sans,sans-serif;flex-shrink:0;white-space:nowrap;transition:background 0.15s" onmouseover="this.style.background=\''+c.editBgHov+'\'" onmouseout="this.style.background=\''+c.editBg+'\'">✏️ Edit</button>'
      +'</div>'
      // preview text
      +(preview?'<div style="font-size:11.5px;color:'+c.previewColor+';opacity:0.85;line-height:1.55;padding:8px 10px;background:'+c.previewBg+';border-radius:7px;border-left:3px solid '+c.previewBorder+';font-style:italic;word-break:break-word">'+escHtml(preview)+'</div>':'')
      +'</div>';
  } else {
    var streakTxt=streak>0?'🔥 Streak '+streak+' hari — jangan putus hari ini!':'Mulai streak jurnal harianmu sekarang';
    return '<div style="position:relative;overflow:hidden;background:'+c.bg+';border:1.5px solid '+c.border+';border-radius:12px;padding:14px;margin-bottom:10px;cursor:pointer;transition:box-shadow 0.18s,border-color 0.18s" onclick="openJournalModal(\''+todayStr+'\')" onmouseover="this.style.boxShadow=\''+c.glowHov+'\';this.style.borderColor=\''+c.borderHov+'\'" onmouseout="this.style.boxShadow=\'\';this.style.borderColor=\''+c.border+'\'">'
      // decorative orbs
      +'<div style="position:absolute;top:-22px;right:-22px;width:88px;height:88px;border-radius:50%;background:'+c.orb1+';pointer-events:none"></div>'
      +'<div style="position:absolute;bottom:-14px;right:40px;width:52px;height:52px;border-radius:50%;background:'+c.orb2+';pointer-events:none"></div>'
      // content
      +'<div style="display:flex;align-items:center;justify-content:space-between;gap:12px">'
      +'<div style="display:flex;align-items:center;gap:11px;flex:1;min-width:0">'
      +'<div style="width:42px;height:42px;border-radius:11px;background:'+c.iconBg+';border:1.5px solid '+c.iconBorder+';display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;box-shadow:'+c.iconShadow+'">📓</div>'
      +'<div>'
      +'<div style="font-size:13px;font-weight:700;color:'+c.titleColor+';letter-spacing:-0.3px;margin-bottom:3px">'+c.writeLbl+'</div>'
      +'<div style="font-size:10.5px;color:'+c.subColor+';font-weight:500;line-height:1.4">'+streakTxt+'</div>'
      +'</div></div>'
      +'<button onclick="event.stopPropagation();openJournalModal(\''+todayStr+'\')" style="border:none;background:'+c.btnBg+';color:#fff;border-radius:9px;padding:8px 14px;cursor:pointer;font-size:12px;font-weight:700;font-family:DM Sans,sans-serif;flex-shrink:0;white-space:nowrap;box-shadow:'+c.btnShadow+';letter-spacing:-0.2px;transition:opacity 0.15s" onmouseover="this.style.opacity=\'0.9\'" onmouseout="this.style.opacity=\'1\'">✍️ Tulis</button>'
      +'</div></div>';
  }
}


function getFinMonthTx(m,y){
  var prefix=(y+'-'+String(m+1).padStart(2,'0'));
  return finTransactions.filter(function(tx){return tx.date&&tx.date.startsWith(prefix);});
}
function getFinSummary(m,y){
  var txs=getFinMonthTx(m,y);
  var income=0,expense=0,saving=0;
  txs.forEach(function(tx){
    if(tx.type==='income')income+=tx.amount;
    else if(tx.type==='expense')expense+=tx.amount;
    else if(tx.type==='saving')saving+=tx.amount;
  });
  return{income:income,expense:expense,saving:saving,net:income-expense-saving};
}
function getTotalWalletBalance(){
  return finWallets.reduce(function(s,w){return s+(w.balance||0);},0);
}
function getWalletById(id){return finWallets.filter(function(w){return w.id===id;})[0]||null;}
// Helper: build wallet options — "Tanpa Wallet" selalu ada, default wallet otomatis terpilih
// selectedId: id yg sudah tersimpan (string/''); forceNoDefault: true = jangan auto-select default
function buildWalletOpts(selectedId,forceNoDefault){
  var effectiveId=(selectedId!==undefined&&selectedId!==null&&selectedId!=='')?selectedId:(forceNoDefault?'':defaultShoppingWalletId);
  var noSel=(effectiveId===''||effectiveId===undefined||effectiveId===null)?'selected':'';
  var opts='<option value="" '+noSel+'>👐 Tanpa Wallet</option>';
  opts+=finWallets.map(function(w){
    var sel=(w.id===effectiveId)?'selected':'';
    var star=(w.id===defaultShoppingWalletId)?' ⭐':'';
    return'<option value="'+w.id+'" '+sel+'>'+w.icon+' '+w.name+' ('+fmtRp(w.balance)+')'+star+' </option>';
  }).join('');
  return opts;
}

function renderFinView(fw){
  fw.innerHTML='<div id="finScroll" class="fin-scroll-inner" style="flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;padding:0 20px 20px;touch-action:pan-y;-webkit-overflow-scrolling:touch"></div>';
  var sc=document.getElementById('finScroll');
  switch(currentView){
    case 'fin-overview': renderFinOverview(sc);break;
    case 'fin-cashflow': renderFinCashflow(sc);break;
    case 'fin-transactions': renderFinTransactions(sc);break;
    case 'fin-wallets': renderFinWallets(sc);break;
    case 'fin-wishlist': renderFinWishlist(sc);break;
    case 'fin-tagihan': renderFinTagihan(sc);break;
    case 'fin-hutang': renderFinHutang(sc);break;
    case 'fin-categories': renderFinCategories(sc);break;
    case 'fin-budget': renderFinBudget(sc);break;
  }
}

// ─── FIN MONTH NAV ───
function finMonthNav(){
  var months=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  var html='<div class="fin-month-nav">'
    +'<button onclick="finChangeMonth(-1)" style="padding:5px 12px;border:1px solid var(--border);background:var(--card);border-radius:7px;cursor:pointer;font-size:13px;color:var(--muted)">‹</button>'
    +'<select onchange="finSetMonth(this.value)" style="border:1px solid var(--border);border-radius:7px;padding:6px 10px;font-size:13px;font-family:DM Sans,sans-serif;background:var(--card);color:var(--text);outline:none;cursor:pointer">';
  for(var i=0;i<12;i++){html+='<option value="'+i+'"'+(i===finViewMonth?' selected':'')+'>'+months[i]+'</option>';}
  html+='</select>'
    +'<input type="number" value="'+finViewYear+'" min="2000" max="2099" onchange="finSetYear(this.value)" style="width:75px;border:1px solid var(--border);border-radius:7px;padding:6px 10px;font-size:13px;font-family:DM Mono,sans-serif;background:var(--card);color:var(--text);outline:none">'
    +'<button onclick="finChangeMonth(1)" style="padding:5px 12px;border:1px solid var(--border);background:var(--card);border-radius:7px;cursor:pointer;font-size:13px;color:var(--muted)">›</button>'
    +'<span style="font-size:12px;color:var(--muted)">'+ months[finViewMonth]+' '+finViewYear+'</span>'
    +'</div>';
  return html;
}
function finChangeMonth(dir){
  finViewMonth+=dir;
  if(finViewMonth>11){finViewMonth=0;finViewYear++;}
  if(finViewMonth<0){finViewMonth=11;finViewYear--;}
  render();
}
function finSetMonth(v){finViewMonth=parseInt(v);render();}
function finSetYear(v){var y=parseInt(v);if(y>=2000&&y<=2099){finViewYear=y;render();}}

// ─── OVERVIEW ───
function renderFinOverview(fw){
  var s=getFinSummary(finViewMonth,finViewYear);
  var totalBal=getTotalWalletBalance();
  var html=finMonthNav();

  // PDF Export button
  html+='<div style="display:flex;justify-content:flex-end;margin-bottom:10px">'
    +'<button onclick="exportFinPDF()" style="padding:7px 14px;border:1px solid var(--border);border-radius:7px;background:var(--card);font-size:12px;cursor:pointer;color:var(--muted);font-family:DM Sans,sans-serif;display:flex;align-items:center;gap:5px;font-weight:600;transition:all 0.15s" onmouseover="this.style.borderColor=\'var(--blue)\';this.style.color=\'var(--blue)\'" onmouseout="this.style.borderColor=\'var(--border)\';this.style.color=\'var(--muted)\'">📄 Export PDF</button>'
    +'</div>';

  var mLabel=(['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][finViewMonth])+' '+finViewYear;
  html+='<div class="fin-header-cards">'
    +'<div class="fin-card"><div class="fin-card-label">💰 Total Saldo</div><div class="fin-card-val" style="color:var(--blue)">'+fmtRp(totalBal)+'</div><div class="fin-card-sub">'+finWallets.length+' wallet aktif (semua waktu)</div></div>'
    +'<div class="fin-card"><div class="fin-card-label">📥 Pemasukan</div><div class="fin-card-val" style="color:var(--green)">'+fmtRp(s.income)+'</div><div class="fin-card-sub">'+mLabel+'</div></div>'
    +'<div class="fin-card"><div class="fin-card-label">📤 Pengeluaran</div><div class="fin-card-val" style="color:var(--red)">'+fmtRp(s.expense)+'</div><div class="fin-card-sub">'+mLabel+'</div></div>'
    +'<div class="fin-card"><div class="fin-card-label">'+(s.net>=0?'✅ Net Positif':'⚠️ Net Negatif')+'</div><div class="fin-card-val" style="color:'+(s.net>=0?'var(--green)':'var(--red)')+'">'+fmtRp(s.net)+'</div><div class="fin-card-sub">'+mLabel+' · Tab: '+fmtRp(s.saving)+'</div></div>'
    +'</div>';

  // Budget summary card (if budgets set)
  if(Object.keys(finBudgets).length){
    var budgetSummary=getBudgetSummary(finViewMonth,finViewYear);
    var budgetBorder=budgetSummary.over?'var(--red)':budgetSummary.warn?'#f59e0b':'var(--green)';
    html+='<div class="fin-card" style="margin-bottom:14px;cursor:pointer;border-left:3px solid '+budgetBorder+';transition:box-shadow 0.15s" onclick="switchView(\'fin-budget\')" onmouseover="this.style.boxShadow=\'0 4px 12px rgba(0,0,0,0.09)\'" onmouseout="this.style.boxShadow=\'\'">'
      +'<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">'
      +'<div><div class="fin-card-label">💰 Status Budget Bulan Ini</div>'
      +'<div style="font-size:13px;font-weight:600;margin-top:5px;display:flex;gap:10px;flex-wrap:wrap">'
      +(budgetSummary.safe?'<span style="color:var(--green)">✅ '+budgetSummary.safe+' aman</span>':'')
      +(budgetSummary.warn?'<span style="color:#f59e0b">⚠️ '+budgetSummary.warn+' hampir habis</span>':'')
      +(budgetSummary.over?'<span style="color:var(--red)">🔴 '+budgetSummary.over+' over</span>':'')
      +'</div></div>'
      +'<span style="font-size:11px;color:var(--blue);font-weight:600">Kelola Budget →</span>'
      +'</div></div>';
  }

  // Saving target card
  var savingS=getFinSummary(finViewMonth,finViewYear);
  var savingPct=finSavingTarget>0?Math.min(100,Math.round(savingS.saving/finSavingTarget*100)):0;
  html+='<div class="fin-card" style="margin-bottom:14px;border-left:3px solid var(--blue)">';
  html+='<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">';
  html+='<div><div class="fin-card-label">🎯 Target Tabungan Bulanan</div>';
  if(finSavingTarget>0){
    html+='<div style="font-size:16px;font-weight:700;font-family:DM Mono;color:var(--blue);margin-top:4px">'+fmtRp(savingS.saving)+' / '+fmtRp(finSavingTarget)+'</div>';
    html+='<div class="saving-target-bar" style="margin-top:6px"><div class="saving-target-fill" style="width:'+savingPct+'%"></div></div>';
    html+='<div style="font-size:11px;color:var(--muted);margin-top:3px">'+savingPct+'% tercapai</div>';
  }else{
    html+='<div style="font-size:12px;color:var(--muted);margin-top:4px">Belum ada target. Set sekarang!</div>';
  }
  html+='</div><button onclick="setSavingTarget()" style="padding:6px 12px;border:1px solid var(--blue);border-radius:7px;background:var(--card);font-size:11px;color:var(--blue);cursor:pointer;font-weight:600;font-family:DM Sans,sans-serif">✏️ Set Target</button>';
  html+='</div></div>';
  // Wallet overview
  html+='<div class="fin-section-title">👛 Saldo per Wallet</div>';
  html+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin-bottom:16px">';
  finWallets.forEach(function(w){
    html+='<div class="fin-card" style="text-align:center;padding:12px">'
      +'<div style="font-size:22px">'+w.icon+'</div>'
      +'<div style="font-size:12px;font-weight:600;margin:4px 0">'+w.name+'</div>'
      +'<div style="font-size:15px;font-weight:700;font-family:DM Mono;color:var(--blue)">'+fmtRp(w.balance)+'</div>'
      +'</div>';
  });
  html+='</div>';

  // Category breakdown for expense
  var txs=getFinMonthTx(finViewMonth,finViewYear);
  var cats={};
  txs.filter(function(tx){return tx.type==='expense';}).forEach(function(tx){
    var c=tx.category||'Lainnya';
    cats[c]=(cats[c]||0)+tx.amount;
  });
  var catKeys=Object.keys(cats).sort(function(a,b){return cats[b]-cats[a];});
  if(catKeys.length){
    html+='<div class="chart-wrap"><div class="chart-title">🏷️ Pengeluaran per Kategori</div>';
    var maxCat=Math.max.apply(null,catKeys.map(function(k){return cats[k];}));
    catKeys.forEach(function(k){
      var spent=cats[k];
      var pctBar=maxCat?spent/maxCat*100:0;
      var budgetStatus=getBudgetStatus(k,finViewMonth,finViewYear);
      var barColor=budgetStatus?(budgetStatus.over?'var(--red)':budgetStatus.warn?'#f59e0b':'var(--green)'):'var(--red)';
      var budgetLabel=budgetStatus?(' <span style="font-size:10px;color:'+(budgetStatus.over?'var(--red)':budgetStatus.warn?'#f59e0b':'var(--muted)')+'">/ '+fmtRp(budgetStatus.limit)+'</span>'):'';
      html+='<div style="margin-bottom:8px">'
        +'<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px"><span>'+k+'</span><span style="font-family:DM Mono;font-weight:600;color:var(--red)">'+fmtRp(spent)+budgetLabel+'</span></div>'
        +'<div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden"><div style="height:100%;width:'+pctBar+'%;background:'+barColor+';border-radius:3px"></div></div>'
        +'</div>';
    });
    html+='</div>';
  }

  // Wishlist progress
  if(finWishlist.length){
    html+='<div class="chart-wrap"><div class="chart-title">🎯 Progress Wishlist</div>';
    finWishlist.slice(0,3).forEach(function(w){
      var pct=w.targetPrice>0?Math.min(100,Math.round(w.saved/w.targetPrice*100)):0;
      html+='<div style="margin-bottom:10px">'
        +'<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px"><span style="font-weight:500">'+w.name+'</span><span style="font-family:DM Mono;color:var(--blue)">'+pct+'%</span></div>'
        +'<div class="wishlist-progress"><div class="wishlist-fill" style="width:'+pct+'%"></div></div>'
        +'<div style="font-size:10px;color:var(--muted)">'+fmtRp(w.saved)+' / '+fmtRp(w.targetPrice)+'</div>'
        +'</div>';
    });
    html+='<button onclick="switchView(\'fin-wishlist\')" style="font-size:11px;color:var(--blue);background:none;border:none;cursor:pointer;font-family:DM Sans,sans-serif">Lihat semua wishlist →</button>';
    html+='</div>';
  }
  fw.innerHTML=html;
}

// ─── CASH FLOW ───
function makePieSVG(data, colors){
  // data: [{label,val}], total
  var total=data.reduce(function(s,d){return s+d.val;},0);
  if(!total)return '<div style="color:var(--muted);font-size:12px;text-align:center;padding:20px">Belum ada data</div>';
  var cx=80,cy=80,r=70,html='<svg width="160" height="160" viewBox="0 0 160 160">';
  var startAngle=-Math.PI/2;
  data.forEach(function(d,i){
    if(!d.val)return;
    var slice=2*Math.PI*(d.val/total);
    var endAngle=startAngle+slice;
    var x1=cx+r*Math.cos(startAngle),y1=cy+r*Math.sin(startAngle);
    var x2=cx+r*Math.cos(endAngle),y2=cy+r*Math.sin(endAngle);
    var large=slice>Math.PI?1:0;
    html+='<path d="M'+cx+','+cy+' L'+x1.toFixed(1)+','+y1.toFixed(1)+' A'+r+','+r+' 0 '+large+',1 '+x2.toFixed(1)+','+y2.toFixed(1)+' Z" fill="'+(colors[i%colors.length])+'" stroke="var(--card)" stroke-width="2"/>';
    startAngle=endAngle;
  });
  html+='<circle cx="'+cx+'" cy="'+cy+'" r="38" fill="var(--card)"/></svg>';
  return html;
}
function renderFinCashflow(fw){
  var s=getFinSummary(finViewMonth,finViewYear);
  var txs=getFinMonthTx(finViewMonth,finViewYear);
  var html=finMonthNav();
  html+='<div style="display:flex;justify-content:flex-end;margin-bottom:10px"><button onclick="exportFinPDF()" style="padding:7px 14px;border:1px solid var(--border);border-radius:7px;background:var(--card);font-size:12px;cursor:pointer;color:var(--muted);font-family:DM Sans,sans-serif;font-weight:600">📄 Export PDF</button></div>';

  // Summary cards
  html+='<div class="fin-header-cards" style="grid-template-columns:repeat(3,1fr)">'
    +'<div class="fin-card"><div class="fin-card-label">📥 Pemasukan</div><div class="fin-card-val" style="color:var(--green)">'+fmtRp(s.income)+'</div></div>'
    +'<div class="fin-card"><div class="fin-card-label">📤 Pengeluaran</div><div class="fin-card-val" style="color:var(--red)">'+fmtRp(s.expense)+'</div></div>'
    +'<div class="fin-card"><div class="fin-card-label">'+(s.net>=0?'✅ Surplus':'⚠️ Defisit')+'</div><div class="fin-card-val" style="color:'+(s.net>=0?'var(--green)':'var(--red)')+'">'+fmtRp(Math.abs(s.net))+'</div></div>'
    +'</div>';

  // Daily cashflow bar chart
  var daysInMonth=new Date(finViewYear,finViewMonth+1,0).getDate();
  var dailyIncome=[],dailyExpense=[];
  for(var d=1;d<=daysInMonth;d++){
    var ds=finViewYear+'-'+String(finViewMonth+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    var dayTxs=txs.filter(function(tx){return tx.date===ds;});
    dailyIncome.push(dayTxs.filter(function(tx){return tx.type==='income';}).reduce(function(a,tx){return a+tx.amount;},0));
    dailyExpense.push(dayTxs.filter(function(tx){return tx.type==='expense';}).reduce(function(a,tx){return a+tx.amount;},0));
  }
  var maxDaily=Math.max.apply(null,dailyIncome.concat(dailyExpense))||1;
  html+='<div class="chart-wrap"><div class="chart-title">📊 Cash Flow Harian</div>'
    +'<div style="display:flex;gap:8px;margin-bottom:8px;font-size:10px">'
    +'<span style="display:flex;align-items:center;gap:4px"><span style="width:10px;height:10px;background:var(--green);border-radius:2px;display:inline-block"></span>Pemasukan</span>'
    +'<span style="display:flex;align-items:center;gap:4px"><span style="width:10px;height:10px;background:var(--red);border-radius:2px;display:inline-block"></span>Pengeluaran</span>'
    +'</div><div class="cashflow-chart">';
  for(var d=0;d<daysInMonth;d++){
    var iHt=Math.round((dailyIncome[d]/maxDaily)*80);
    var eHt=Math.round((dailyExpense[d]/maxDaily)*80);
    var isToday=(finViewYear+'-'+String(finViewMonth+1).padStart(2,'0')+'-'+String(d+1).padStart(2,'0'))===todayStr;
    html+='<div class="cf-col"><div class="cf-bar-wrap">'
      +'<div class="cf-bar" style="height:'+(iHt||2)+'px;background:'+(iHt?'var(--green)':'transparent')+';border:'+(iHt?'none':'1px dashed #e0e0e0')+'"></div>'
      +'<div class="cf-bar" style="height:'+(eHt||2)+'px;background:'+(eHt?'var(--red)':'transparent')+';border:'+(eHt?'none':'1px dashed #e0e0e0')+'"></div>'
      +'</div><div class="cf-lbl" style="font-weight:'+(isToday?'700':'400')+';color:'+(isToday?'var(--accent)':'var(--muted)')+'">'+String(d+1)+'</div></div>';
  }
  html+='</div></div>';

  // Pie charts side by side
  var expCats={},incomeCats={};
  txs.filter(function(tx){return tx.type==='expense';}).forEach(function(tx){var c=tx.category||'Lainnya';expCats[c]=(expCats[c]||0)+tx.amount;});
  txs.filter(function(tx){return tx.type==='income';}).forEach(function(tx){var c=tx.category||'Lainnya';incomeCats[c]=(incomeCats[c]||0)+tx.amount;});
  var expKeys=Object.keys(expCats).sort(function(a,b){return expCats[b]-expCats[a];});
  var incKeys=Object.keys(incomeCats).sort(function(a,b){return incomeCats[b]-incomeCats[a];});
  var pieColorsExp=['#ef4444','#f97316','#eab308','#8b5cf6','#ec4899','#6b7280','#14b8a6','#3b82f6'];
  var pieColorsInc=['#22c55e','#10b981','#06b6d4','#3b82f6','#8b5cf6','#f59e0b','#6b7280','#14b8a6'];

  html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">';

  // Pie pengeluaran
  html+='<div class="chart-wrap"><div class="chart-title">🥧 Pengeluaran per Kategori</div>';
  if(expKeys.length){
    var expData=expKeys.map(function(k){return{label:k,val:expCats[k]};});
    var expTotal=expData.reduce(function(a,d){return a+d.val;},0);
    html+='<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">'
      +'<div style="flex-shrink:0">'+makePieSVG(expData,pieColorsExp)+'</div>'
      +'<div style="flex:1;min-width:100px">';
    expData.forEach(function(d,i){
      html+='<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;font-size:11px">'
        +'<span style="width:10px;height:10px;border-radius:2px;background:'+pieColorsExp[i%pieColorsExp.length]+';flex-shrink:0;display:inline-block"></span>'
        +'<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+d.label+'</span>'
        +'<span style="font-family:DM Mono;font-weight:600;color:var(--red);white-space:nowrap">'+Math.round(d.val/expTotal*100)+'%</span>'
        +'</div>';
    });
    html+='</div></div>';
  } else {html+='<div style="color:var(--muted);font-size:12px;padding:12px 0">Belum ada data</div>';}
  html+='</div>';

  // Pie pemasukan
  html+='<div class="chart-wrap"><div class="chart-title">🥧 Pemasukan per Sumber</div>';
  if(incKeys.length){
    var incData=incKeys.map(function(k){return{label:k,val:incomeCats[k]};});
    var incTotal=incData.reduce(function(a,d){return a+d.val;},0);
    html+='<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">'
      +'<div style="flex-shrink:0">'+makePieSVG(incData,pieColorsInc)+'</div>'
      +'<div style="flex:1;min-width:100px">';
    incData.forEach(function(d,i){
      html+='<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;font-size:11px">'
        +'<span style="width:10px;height:10px;border-radius:2px;background:'+pieColorsInc[i%pieColorsInc.length]+';flex-shrink:0;display:inline-block"></span>'
        +'<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+d.label+'</span>'
        +'<span style="font-family:DM Mono;font-weight:600;color:var(--green);white-space:nowrap">'+Math.round(d.val/incTotal*100)+'%</span>'
        +'</div>';
    });
    html+='</div></div>';
  } else {html+='<div style="color:var(--muted);font-size:12px;padding:12px 0">Belum ada data</div>';}
  html+='</div>';
  html+='</div>'; // end grid

  // Top pengeluaran bar
  if(expKeys.length){
    html+='<div class="chart-wrap"><div class="chart-title">📤 Top Pengeluaran Terbesar</div>';
    var maxE=expCats[expKeys[0]];
    expKeys.slice(0,8).forEach(function(k,i){
      var p=maxE?expCats[k]/maxE*100:0;
      html+='<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">'
        +'<span style="display:flex;align-items:center;gap:6px"><span style="width:8px;height:8px;border-radius:50%;background:'+pieColorsExp[i%pieColorsExp.length]+';display:inline-block"></span>'+k+'</span>'
        +'<span style="font-family:DM Mono;font-weight:700;color:var(--red)">'+fmtRp(expCats[k])+'</span></div>'
        +'<div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden"><div style="height:100%;width:'+p+'%;background:'+pieColorsExp[i%pieColorsExp.length]+';border-radius:3px;transition:width 0.4s"></div></div></div>';
    });
    html+='</div>';
  }

  // Top pemasukan bar
  if(incKeys.length){
    html+='<div class="chart-wrap"><div class="chart-title">📥 Top Pemasukan Terbesar</div>';
    var maxI=incomeCats[incKeys[0]];
    incKeys.slice(0,8).forEach(function(k,i){
      var p=maxI?incomeCats[k]/maxI*100:0;
      html+='<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">'
        +'<span style="display:flex;align-items:center;gap:6px"><span style="width:8px;height:8px;border-radius:50%;background:'+pieColorsInc[i%pieColorsInc.length]+';display:inline-block"></span>'+k+'</span>'
        +'<span style="font-family:DM Mono;font-weight:700;color:var(--green)">'+fmtRp(incomeCats[k])+'</span></div>'
        +'<div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden"><div style="height:100%;width:'+p+'%;background:'+pieColorsInc[i%pieColorsInc.length]+';border-radius:3px;transition:width 0.4s"></div></div></div>';
    });
    html+='</div>';
  }

  // Statistik ringkas
  var avgExp=daysInMonth>0?s.expense/daysInMonth:0;
  var topExpCat=expKeys[0]||'-';
  var topIncCat=incKeys[0]||'-';
  html+='<div class="chart-wrap"><div class="chart-title">📋 Statistik Bulan Ini</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'
    +'<div style="font-size:12px"><span style="color:var(--muted)">Rata-rata pengeluaran/hari</span><br><b style="font-family:DM Mono;color:var(--red)">'+fmtRp(avgExp)+'</b></div>'
    +'<div style="font-size:12px"><span style="color:var(--muted)">Jumlah transaksi</span><br><b style="font-family:DM Mono">'+txs.length+'</b></div>'
    +'<div style="font-size:12px"><span style="color:var(--muted)">Kategori pengeluaran terbesar</span><br><b>'+topExpCat+'</b></div>'
    +'<div style="font-size:12px"><span style="color:var(--muted)">Sumber pemasukan terbesar</span><br><b>'+topIncCat+'</b></div>'
    +'<div style="font-size:12px"><span style="color:var(--muted)">Total tabungan</span><br><b style="font-family:DM Mono;color:var(--blue)">'+fmtRp(s.saving)+'</b></div>'
    +'<div style="font-size:12px"><span style="color:var(--muted)">Rasio tabungan</span><br><b style="font-family:DM Mono;color:var(--blue)">'+(s.income>0?Math.round(s.saving/s.income*100):0)+'%</b></div>'
    +'</div></div>';

  fw.innerHTML=html;
}

// ─── TRANSACTIONS ───
var finTxTab='all'; // 'all','income','expense','saving'
var finTxWallet='all';
function renderFinTransactions(fw){
  var txs=getFinMonthTx(finViewMonth,finViewYear);
  var s=getFinSummary(finViewMonth,finViewYear);

  var html=finMonthNav();
  html+='<div style="display:flex;justify-content:flex-end;gap:8px;margin-bottom:10px">'
    +'<button onclick="openShoppingItemsModal()" style="padding:7px 14px;border:1px solid #bbf7d0;border-radius:7px;background:#f0fdf4;font-size:12px;cursor:pointer;color:#15803d;font-family:DM Sans,sans-serif;font-weight:600">🛒 Kelola Item Belanja</button>'
    +'<button onclick="exportFinPDF()" style="padding:7px 14px;border:1px solid var(--border);border-radius:7px;background:var(--card);font-size:12px;cursor:pointer;color:var(--muted);font-family:DM Sans,sans-serif;font-weight:600">📄 Export PDF</button>'
    +'</div>';

  // Add transaction bar
  html+='<div class="fin-add-bar">'
    +'<div class="fin-add-title">➕ Tambah Transaksi</div>'
    +'<div class="fin-form-row">'
    +'<div class="fin-form-group" style="min-width:120px">'
    +'<div class="fin-form-label">Tipe</div>'
    +'<select class="fin-input" id="fin-tx-type"><option value="expense">📤 Pengeluaran</option><option value="income">📥 Pemasukan</option><option value="saving">💙 Tabungan</option></select>'
    +'</div>'
    +'<div class="fin-form-group">'
    +'<div class="fin-form-label">Jumlah (Rp)</div>'
    +'<input type="text" inputmode="numeric" class="fin-input" id="fin-tx-amount" placeholder="0" onkeydown="if(event.key===\'Enter\')addFinTx()" oninput="autoFormatRp(this)">'
    +'</div>'
    +'<div class="fin-form-group">'
    +'<div class="fin-form-label">Kategori</div>'
    +'<input class="fin-input" id="fin-tx-cat" placeholder="Makan, Gaji, dll" list="fin-cat-list" onkeydown="if(event.key===\'Enter\')addFinTx()">'
    +'<datalist id="fin-cat-list">'+getAllCats('expense').concat(getAllCats('income')).concat(getAllCats('saving')).filter(function(c,i,a){return a.indexOf(c)===i;}).map(function(c){return'<option value="'+c+'">';}).join('')+'</datalist>'
    +'</div>'
    +'<div class="fin-form-group" style="min-width:130px">'
    +'<div class="fin-form-label">Wallet</div>'
    +'<select class="fin-input" id="fin-tx-wallet">'+buildWalletOpts('')+'</select>'
    +'</div>'
    +'<div class="fin-form-group">'
    +'<div class="fin-form-label">Tanggal</div>'
    +'<input type="date" class="fin-input" id="fin-tx-date" value="'+todayStr+'">'
    +'</div>'
    +'<div class="fin-form-group">'
    +'<div class="fin-form-label">Catatan</div>'
    +'<input class="fin-input" id="fin-tx-note" placeholder="Opsional" onkeydown="if(event.key===\'Enter\')addFinTx()">'
    +'</div>'
    +'<button class="btn-fin-add" onclick="addFinTx()">+ Tambah</button>'
    +'</div></div>';

  // Filter tabs
  html+='<div class="type-tabs">'
    +'<div class="type-tab'+(finTxTab==='all'?' active income':'')+'" onclick="finSetTab(\'all\')">📋 Semua</div>'
    +'<div class="type-tab income'+(finTxTab==='income'?' active':'')+'" onclick="finSetTab(\'income\')">📥 Pemasukan</div>'
    +'<div class="type-tab expense'+(finTxTab==='expense'?' active':'')+'" onclick="finSetTab(\'expense\')">📤 Pengeluaran</div>'
    +'<div class="type-tab saving'+(finTxTab==='saving'?' active':'')+'" onclick="finSetTab(\'saving\')">💙 Tabungan</div>'
    +'</div>';

  // Wallet filter
  html+='<div class="wallet-pills">'
    +'<div class="wallet-pill'+(finTxWallet==='all'?' active':'')+'" onclick="finSetTxWallet(\'all\')">Semua Wallet</div>'
    +finWallets.map(function(w){return'<div class="wallet-pill'+(finTxWallet===w.id?' active':'')+'" onclick="finSetTxWallet(\''+w.id+'\')">'+w.icon+' '+w.name+'</div>';}).join('')
    +'</div>';

  var filtered=txs.filter(function(tx){
    if(finTxTab!=='all'&&tx.type!==finTxTab)return false;
    if(finTxWallet!=='all'&&tx.walletId!==finTxWallet)return false;
    return true;
  }).sort(function(a,b){return b.date.localeCompare(a.date);});

  // Summary mini
  html+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">'
    +'<div class="fin-card" style="padding:10px;text-align:center"><div style="font-size:11px;font-weight:700;font-family:DM Mono;color:var(--green)">'+fmtRp(s.income)+'</div><div style="font-size:9px;color:var(--muted);margin-top:2px">PEMASUKAN</div></div>'
    +'<div class="fin-card" style="padding:10px;text-align:center"><div style="font-size:11px;font-weight:700;font-family:DM Mono;color:var(--red)">'+fmtRp(s.expense)+'</div><div style="font-size:9px;color:var(--muted);margin-top:2px">PENGELUARAN</div></div>'
    +'<div class="fin-card" style="padding:10px;text-align:center"><div style="font-size:11px;font-weight:700;font-family:DM Mono;color:var(--blue)">'+fmtRp(s.saving)+'</div><div style="font-size:9px;color:var(--muted);margin-top:2px">TABUNGAN</div></div>'
    +'</div>';

  // Table header
  html+='<div class="fin-table">'
    +'<div class="fin-table-head" style="grid-template-columns:80px 1fr 100px 80px 80px 30px"><span>Tgl</span><span>Keterangan</span><span>Jumlah</span><span>Wallet</span><span>Kategori</span><span></span></div>';

  if(!filtered.length){
    html+='<div style="text-align:center;padding:24px;color:var(--muted);font-size:13px">Tidak ada transaksi</div>';
  } else {
    filtered.forEach(function(tx){
      var w=getWalletById(tx.walletId);
      var typeIcon=tx.type==='income'?'📥':tx.type==='expense'?'📤':'💙';
      var typeColor=tx.type==='income'?'var(--green)':tx.type==='expense'?'var(--red)':'var(--blue)';
      html+='<div class="fin-table-row" style="grid-template-columns:80px 1fr 100px 80px 80px 30px">'
        +'<span style="color:var(--muted);font-size:11px">'+fmtDate(tx.date)+'</span>'
        +'<span style="font-size:12px;font-weight:500">'+typeIcon+' '+(tx.note||tx.category||'-')+'</span>'
        +'<span style="font-family:DM Mono;font-weight:700;color:'+typeColor+'">'+(tx.type==='expense'?'-':tx.type==='saving'?'~':'+')+''+fmtRp(tx.amount)+'</span>'
        +'<span style="font-size:11px;color:var(--muted)">'+(w?w.icon+' '+w.name:'-')+'</span>'
        +'<span style="font-size:11px;color:var(--muted)">'+(tx.category||'-')+'</span>'
        +'<button class="del-btn" onclick="deleteFinTx(\''+tx.id+'\')">×</button>'
        +'</div>';
    });
  }
  html+='</div>';
  fw.innerHTML=html;
}
function finSetTab(t){finTxTab=t;render();}
function finSetTxWallet(w){finTxWallet=w;render();}

function addFinTx(){
  var type=document.getElementById('fin-tx-type').value;
  var amount=getRawVal(document.getElementById('fin-tx-amount'))||0;
  var cat=document.getElementById('fin-tx-cat').value.trim();
  var walletId=document.getElementById('fin-tx-wallet').value;
  var date=document.getElementById('fin-tx-date').value||todayStr;
  var note=document.getElementById('fin-tx-note').value.trim();
  if(!amount){showToast('Masukkan jumlah!');return;}
  var tx={id:'tx'+finNextId++,type:type,amount:amount,category:cat,walletId:walletId,date:date,note:note};
  finTransactions.push(tx);
  // Update wallet balance
  var w=getWalletById(walletId);
  if(w){
    if(type==='income')w.balance+=amount;
    else if(type==='expense')w.balance-=amount;
    else if(type==='saving')w.balance-=amount;
  }
  showToast('Transaksi ditambahkan ✅');saveData(true);render();
}
function deleteFinTx(id){
  var tx=finTransactions.filter(function(t){return t.id===id;})[0];
  if(!tx)return;
  // Reverse wallet change
  var w=getWalletById(tx.walletId);
  if(w){
    if(tx.type==='income')w.balance-=tx.amount;
    else if(tx.type==='expense')w.balance+=tx.amount;
    else if(tx.type==='saving')w.balance+=tx.amount;
  }
  finTransactions=finTransactions.filter(function(t){return t.id!==id;});
  showToast('Transaksi dihapus');saveData(true);render();
}

// ─── WALLETS ───
function renderFinWallets(fw){
  var totalBal=getTotalWalletBalance();
  var html='<div class="fin-header-cards" style="grid-template-columns:repeat(2,1fr);margin-bottom:16px">'
    +'<div class="fin-card"><div class="fin-card-label">💰 Total Saldo</div><div class="fin-card-val" style="color:var(--blue)">'+fmtRp(totalBal)+'</div></div>'
    +'<div class="fin-card"><div class="fin-card-label">👛 Jumlah Wallet</div><div class="fin-card-val">'+finWallets.length+'</div></div>'
    +'</div>';

  html+='<div class="fin-section-title">Daftar Wallet</div>';
  html+='<div style="font-size:11px;color:var(--muted);margin-bottom:8px;padding:6px 10px;background:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.15);border-radius:8px;">💡 Wallet <b>Default Belanja</b> akan otomatis terpilih saat menambah task belanja dari taskbar.</div>';
  html+='<div class="wallet-manager"><div class="wallet-list">';
  finWallets.forEach(function(w){
    var isDefault=(w.id===defaultShoppingWalletId);
    html+='<div class="wallet-item" style="flex-wrap:wrap;gap:8px;'+(isDefault?'border-color:var(--blue);background:rgba(59,130,246,0.04);':'')+'">'
      +'<div class="wallet-icon">'+w.icon+'</div>'
      +'<div class="wallet-info" style="flex:1;min-width:0">'
        +'<div class="wallet-name" style="display:flex;align-items:center;gap:5px;flex-wrap:wrap">'
          +'<span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+w.name+'</span>'
          +(isDefault?'<span style="background:#eff6ff;color:var(--blue);font-size:9px;font-weight:700;padding:2px 6px;border-radius:10px;border:1px solid #bfdbfe;flex-shrink:0">⭐ DEFAULT</span>':'')+'</div>'
        +'<div style="font-size:13px;font-weight:700;color:var(--text);margin-top:2px">'+fmtRp(w.balance)+'</div>'
      +'</div>'
      +'<div style="display:flex;gap:6px;align-items:center;flex-shrink:0">'
        +(isDefault
          ? '<button onclick="setDefaultShoppingWallet(\'\')" style="border:1px solid #bfdbfe;background:#eff6ff;border-radius:6px;padding:5px 8px;font-size:10px;cursor:pointer;color:var(--blue);font-weight:600;white-space:nowrap">✖ Default</button>'
          : '<button onclick="setDefaultShoppingWallet(\''+w.id+'\')" style="border:1px solid var(--border);background:var(--bg);border-radius:6px;padding:5px 8px;font-size:10px;cursor:pointer;color:var(--muted);white-space:nowrap">⭐ Default</button>')
        +'<button onclick="editWalletBalance(\''+w.id+'\')" style="border:1px solid var(--border);background:var(--card);border-radius:6px;padding:5px 8px;font-size:11px;cursor:pointer;color:var(--muted)">✏️</button>'
        +'<button onclick="deleteWallet(\''+w.id+'\')" style="border:none;background:none;cursor:pointer;color:var(--red);font-size:16px;padding:2px 4px;line-height:1">×</button>'
      +'</div>'
      +'</div>';
  });
  html+='</div>';

  // Add wallet
  html+='<div class="fin-add-title" style="margin-bottom:8px">+ Tambah Wallet</div>'
    +'<div class="fin-form-row">'
    +'<div class="fin-form-group"><div class="fin-form-label">Nama</div><input class="fin-input" id="new-wallet-name" placeholder="BCA, Gopay..." onkeydown="if(event.key===\'Enter\')addWallet()"></div>'
    +'<div class="fin-form-group" style="max-width:80px"><div class="fin-form-label">Icon</div><input class="fin-input" id="new-wallet-icon" placeholder="💵" value="💳" style="text-align:center;font-size:18px"></div>'
    +'<div class="fin-form-group"><div class="fin-form-label">Saldo Awal (Rp)</div><input type="text" inputmode="numeric" class="fin-input" id="new-wallet-bal" placeholder="0" onkeydown="if(event.key===\'Enter\')addWallet()" oninput="autoFormatRp(this)"></div>'
    +'<button class="btn-fin-add" onclick="addWallet()">+ Tambah</button>'
    +'</div></div>';

  // Transfer between wallets
  html+='<div class="fin-add-bar" style="border-color:var(--accent)">'
    +'<div class="fin-add-title">🔄 Transfer Antar Wallet</div>'
    +'<div class="fin-form-row">'
    +'<div class="fin-form-group"><div class="fin-form-label">Dari</div><select class="fin-input" id="transfer-from"><option value="">Pilih...</option>'+finWallets.map(function(w){return'<option value="'+w.id+'">'+w.icon+' '+w.name+'</option>';}).join('')+'</select></div>'
    +'<div class="fin-form-group"><div class="fin-form-label">Ke</div><select class="fin-input" id="transfer-to"><option value="">Pilih...</option>'+finWallets.map(function(w){return'<option value="'+w.id+'">'+w.icon+' '+w.name+'</option>';}).join('')+'</select></div>'
    +'<div class="fin-form-group"><div class="fin-form-label">Jumlah (Rp)</div><input type="text" inputmode="numeric" class="fin-input" id="transfer-amount" placeholder="0" oninput="autoFormatRp(this)"></div>'
    +'<button class="btn-fin-add amber" onclick="doTransfer()">Transfer</button>'
    +'</div></div>';

  fw.innerHTML=html;
}
function addWallet(){
  var name=document.getElementById('new-wallet-name').value.trim();
  if(!name){showToast('Masukkan nama wallet!');return;}
  var icon=document.getElementById('new-wallet-icon').value.trim()||'💳';
  var bal=getRawVal(document.getElementById('new-wallet-bal'))||0;
  var w={id:'w'+Date.now(),name:name,icon:icon,balance:bal};
  finWallets.push(w);
  showToast('Wallet "'+name+'" ditambahkan!');saveData(true);render();
}
function deleteWallet(id){
  if(defaultShoppingWalletId===id) defaultShoppingWalletId='';
  finWallets=finWallets.filter(function(w){return w.id!==id;});
  showToast('Wallet dihapus');saveData(true);render();
}
function editWalletBalance(id){
  var w=getWalletById(id);if(!w)return;
  // Remove existing modal if any
  var old=document.getElementById('editWalletModal');if(old)old.remove();
  var modal=document.createElement('div');
  modal.id='editWalletModal';
  modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:2100;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px)';
  modal.innerHTML='<div style="background:var(--card);border-radius:16px;padding:24px;width:360px;max-width:94vw;box-shadow:0 20px 60px rgba(0,0,0,0.25);font-family:DM Sans,sans-serif">'
    +'<div style="font-size:15px;font-weight:800;color:var(--text);margin-bottom:18px;display:flex;align-items:center;justify-content:space-between">'
    +'<span>✏️ Edit Dompet</span>'
    +'<button onclick="document.getElementById(\'editWalletModal\').remove()" style="border:none;background:none;cursor:pointer;font-size:20px;color:var(--muted);line-height:1">✕</button>'
    +'</div>'
    +'<div style="margin-bottom:12px"><div style="font-size:11px;font-weight:700;color:var(--muted);margin-bottom:5px;text-transform:uppercase;letter-spacing:0.5px">Icon</div>'
    +'<input id="ew-icon" value="'+w.icon+'" style="width:100%;box-sizing:border-box;padding:9px 12px;border:1.5px solid var(--border);border-radius:9px;background:var(--bg);color:var(--text);font-size:22px;text-align:center;font-family:DM Sans,sans-serif;outline:none"></div>'
    +'<div style="margin-bottom:12px"><div style="font-size:11px;font-weight:700;color:var(--muted);margin-bottom:5px;text-transform:uppercase;letter-spacing:0.5px">Nama Dompet</div>'
    +'<input id="ew-name" value="'+w.name+'" style="width:100%;box-sizing:border-box;padding:9px 12px;border:1.5px solid var(--border);border-radius:9px;background:var(--bg);color:var(--text);font-size:14px;font-family:DM Sans,sans-serif;outline:none"></div>'
    +'<div style="margin-bottom:20px"><div style="font-size:11px;font-weight:700;color:var(--muted);margin-bottom:5px;text-transform:uppercase;letter-spacing:0.5px">Saldo (Rp)</div>'
    +'<input id="ew-bal" type="text" inputmode="numeric" value="'+w.balance.toLocaleString('id-ID')+'" style="width:100%;box-sizing:border-box;padding:9px 12px;border:1.5px solid var(--border);border-radius:9px;background:var(--bg);color:var(--text);font-size:14px;font-family:DM Sans,sans-serif;outline:none;font-family:DM Mono,monospace" oninput="autoFormatRp(this)"></div>'
    +'<div style="display:flex;gap:8px">'
    +'<button onclick="document.getElementById(\'editWalletModal\').remove()" style="flex:1;padding:10px;border:1.5px solid var(--border);border-radius:9px;background:none;color:var(--muted);font-size:13px;font-weight:600;cursor:pointer;font-family:DM Sans,sans-serif">Batal</button>'
    +'<button onclick="saveEditWallet(\''+id+'\')" style="flex:2;padding:10px;border:none;border-radius:9px;background:var(--accent);color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:DM Sans,sans-serif">💾 Simpan</button>'
    +'</div></div>';
  document.body.appendChild(modal);
  modal.addEventListener('click',function(e){if(e.target===modal)modal.remove();});
  setTimeout(function(){var n=document.getElementById('ew-name');if(n)n.focus();},80);
}
function saveEditWallet(id){
  var w=getWalletById(id);if(!w)return;
  var icon=document.getElementById('ew-icon').value.trim()||w.icon;
  var name=document.getElementById('ew-name').value.trim();
  var bal=getRawVal(document.getElementById('ew-bal'));
  if(!name){showToast('Nama dompet tidak boleh kosong!');return;}
  if(isNaN(bal)){showToast('Saldo tidak valid!');return;}
  w.icon=icon;w.name=name;w.balance=bal;
  var m=document.getElementById('editWalletModal');if(m)m.remove();
  showToast('✅ Dompet "'+name+'" diperbarui!');saveData(true);render();
}
function setDefaultShoppingWallet(id){
  defaultShoppingWalletId=id;
  if(id){
    var w=getWalletById(id);
    showToast('⭐ '+(w?w.icon+' '+w.name:'Wallet')+' dijadikan default belanja!');
  } else {
    showToast('Default wallet belanja dihapus');
  }
  saveData(true);render();
}
function doTransfer(){
  var fromId=document.getElementById('transfer-from').value;
  var toId=document.getElementById('transfer-to').value;
  var amount=getRawVal(document.getElementById('transfer-amount'))||0;
  if(!fromId||!toId){showToast('Pilih wallet asal & tujuan!');return;}
  if(fromId===toId){showToast('Wallet asal dan tujuan sama!');return;}
  if(!amount){showToast('Masukkan jumlah transfer!');return;}
  var from=getWalletById(fromId),to=getWalletById(toId);
  if(!from||!to)return;
  if(from.balance<amount){showToast('Saldo tidak cukup!');return;}
  from.balance-=amount;to.balance+=amount;
  // Log as transactions
  finTransactions.push({id:'tx'+finNextId++,type:'expense',amount:amount,category:'Transfer',walletId:fromId,date:todayStr,note:'Transfer ke '+to.name});
  finTransactions.push({id:'tx'+finNextId++,type:'income',amount:amount,category:'Transfer',walletId:toId,date:todayStr,note:'Transfer dari '+from.name});
  showToast('Transfer berhasil!');saveData(true);render();
}

// ─── WISHLIST ───
function renderFinWishlist(fw){
  // Rebuild form jika belum ada (misal baru switch view)
  if(!fw.querySelector('#wishlist-form-area')){
    fw.innerHTML=''
      +'<div id="wishlist-form-area" class="fin-add-bar">'
        +'<div class="fin-add-title">🎯 Tambah Item Wishlist</div>'
        +'<div class="fin-form-row">'
        +'<div class="fin-form-group"><div class="fin-form-label">Nama Item</div><input class="fin-input" id="wish-name" placeholder="iPhone, Laptop, dll" onkeydown="if(event.key===\'Enter\')addWishItem()"></div>'
        +'<div class="fin-form-group"><div class="fin-form-label">Target Harga (Rp)</div><input type="text" inputmode="numeric" class="fin-input" id="wish-target" placeholder="0" oninput="autoFormatRp(this)"></div>'
        +'<div class="fin-form-group"><div class="fin-form-label">Dana Awal (Rp)</div><input type="text" inputmode="numeric" class="fin-input" id="wish-saved" placeholder="0" oninput="autoFormatRp(this)"></div>'
        +'<div class="fin-form-group"><div class="fin-form-label">Catatan</div><input class="fin-input" id="wish-note" placeholder="Opsional"></div>'
        +'<button class="btn-fin-add" onclick="addWishItem()">+ Tambah</button>'
        +'</div></div>'
      +'<div id="wishlist-list-area"></div>';
  }
  renderWishlistList();
}
function renderWishlistList(){
  var el=document.getElementById('wishlist-list-area');
  if(!el)return;
  if(!finWishlist.length){
    el.innerHTML='<div class="empty"><div class="empty-icon">🎯</div>Belum ada wishlist.<br>Tambahkan impian finansialmu!</div>';
    return;
  }
  var html='';
  var active=finWishlist.filter(function(w){return w.status!=='done';});
  var done=finWishlist.filter(function(w){return w.status==='done';});
  if(active.length){
    html+='<div class="section-hdr"><span>'+active.length+' Item Aktif</span></div>';
    active.forEach(function(w){html+=wishCard(w);});
  }
  if(done.length){
    html+='<div class="section-hdr" style="margin-top:14px"><span>✅ Tercapai ('+done.length+')</span></div>';
    done.forEach(function(w){html+=wishCard(w);});
  }
  el.innerHTML=html;
}
function wishCard(w){
  var pct=w.targetPrice>0?Math.min(100,Math.round(w.saved/w.targetPrice*100)):0;
  var sisa=Math.max(0,w.targetPrice-w.saved);
  var isDone=w.status==='done';
  var txCount=(w.transactions||[]).length;
  var pctColor=pct>=100?'var(--green)':'var(--blue)';
  return '<div class="wishlist-card'+(isDone?' completed-wish':'')+'">'
    +'<div class="wc-top">'
    +'<div class="wc-name">'+(isDone?'✅ ':'🎯 ')+w.name+'</div>'
    +'<span class="wc-pct" style="color:'+pctColor+'">'+pct+'%</span>'
    +'</div>'
    +'<div class="wc-info">'
    +'<div class="wc-info-cell"><span class="wc-info-label">Target:</span><span class="wc-info-val" style="color:var(--text)">'+fmtRp(w.targetPrice)+'</span></div>'
    +'<div class="wc-info-cell"><span class="wc-info-label">Terkumpul:</span><span class="wc-info-val" style="color:var(--green)">'+fmtRp(w.saved)+'</span></div>'
    +'<div class="wc-info-cell"><span class="wc-info-label">Sisa:</span><span class="wc-info-val" style="color:'+(sisa===0?'var(--green)':'var(--red)')+'">'+fmtRp(sisa)+'</span></div>'
    +'</div>'
    +(w.note?'<div class="wc-note">📝 '+w.note+'</div>':'')
    +(txCount?'<div style="margin-bottom:6px"><span style="background:#dbeafe;color:#1d4ed8;padding:2px 8px;border-radius:8px;font-size:10px;font-weight:700">'+txCount+' transaksi</span></div>':'')
    +'<div class="wishlist-progress" style="margin:6px 0"><div class="wishlist-fill" style="width:'+pct+'%"></div></div>'
    +'<div class="wc-actions">'
    +'<span class="wc-status">'+(isDone?'✅ Tercapai':'🔄 Menabung')+'</span>'
    +'<div class="wc-btns">'
    +(pct>=100&&!isDone?'<button onclick="markWishDone(\''+w.id+'\')" style="font-size:11px;padding:4px 10px;border:none;border-radius:6px;background:var(--green);color:#fff;cursor:pointer;font-family:DM Sans,sans-serif;font-weight:600">✓ Selesai</button>':'')
    +(isDone?'':'<button onclick="openWishModalDana(\''+w.id+'\')" style="font-size:11px;padding:4px 10px;border:1.5px solid var(--blue);border-radius:6px;background:#eff6ff;color:var(--blue);cursor:pointer;font-family:DM Sans,sans-serif;font-weight:600">💰 Dana</button>')
    +'<button onclick="openWishModalEdit(\''+w.id+'\')" style="font-size:11px;padding:4px 10px;border:1.5px solid var(--accent);border-radius:6px;background:#fff7ed;color:var(--accent);cursor:pointer;font-family:DM Sans,sans-serif;font-weight:600">✏️ Edit</button>'
    +'<button onclick="deleteWishItem(\''+w.id+'\')" style="font-size:11px;padding:4px 8px;border:1px solid var(--border);border-radius:6px;background:none;color:var(--muted);cursor:pointer">🗑</button>'
    +'</div></div>'
    +'</div>';
}
function addWishItem(){
  var name=document.getElementById('wish-name').value.trim();
  if(!name){showToast('Masukkan nama item!');return;}
  var target=getRawVal(document.getElementById('wish-target'))||0;
  var saved=getRawVal(document.getElementById('wish-saved'))||0;
  var note=document.getElementById('wish-note').value.trim();
  var item={id:'wish'+finNextId++,name:name,targetPrice:target,saved:saved,note:note,status:'active',transactions:[]};
  finWishlist.push(item);
  document.getElementById('wish-name').value='';
  document.getElementById('wish-target').value='';
  document.getElementById('wish-saved').value='';
  document.getElementById('wish-note').value='';
  showToast('Wishlist ditambahkan 🎯');saveData(true);
  renderWishlistList();
  updateCounts();
}
function switchWishTab(tab){
  var isEdit=tab==='edit';
  document.getElementById('wm-panel-edit').style.display=isEdit?'':'none';
  document.getElementById('wm-panel-dana').style.display=isEdit?'none':'';
  document.getElementById('wm-tab-edit').style.color=isEdit?'var(--accent)':'var(--muted)';
  document.getElementById('wm-tab-edit').style.borderBottomColor=isEdit?'var(--accent)':'transparent';
  document.getElementById('wm-tab-dana').style.color=isEdit?'var(--muted)':'var(--blue)';
  document.getElementById('wm-tab-dana').style.borderBottomColor=isEdit?'transparent':'var(--blue)';
}
// ── WISHLIST MODAL ──
var wishModalId=null;
function openWishModal(id, focusDana){
  var w=finWishlist.filter(function(x){return x.id===id;})[0];if(!w)return;
  wishModalId=id;
  document.getElementById('wishModalTitle').textContent='🎯 '+w.name;
  document.getElementById('wm-name').value=w.name;
  document.getElementById('wm-target').value=w.targetPrice||0;
  document.getElementById('wm-saved').value=w.saved||0;
  document.getElementById('wm-note').value=w.note||'';
  document.getElementById('wm-status').value=w.status||'active';
  document.getElementById('wm-tx-date').value=todayStr;
  document.getElementById('wm-tx-amount').value='';
  document.getElementById('wm-tx-note').value='';
  var sel=document.getElementById('wm-tx-wallet');
  sel.innerHTML=buildWalletOpts('');
  renderWishTxList(w);
  switchWishTab(focusDana?'dana':'edit');
  document.getElementById('wishModal').classList.add('show');
  if(focusDana)setTimeout(function(){document.getElementById('wm-tx-amount').focus();},120);
}
function renderWishTxList(w){
  var wrap=document.getElementById('wm-tx-list');if(!wrap)return;
  var txs=(w.transactions||[]).slice().reverse();
  if(!txs.length){wrap.innerHTML='<div style="color:var(--muted);font-size:12px;padding:8px 0;text-align:center">Belum ada transaksi tabungan</div>';return;}
  var html='';
  txs.forEach(function(tx,idx){
    var wl=getWalletById(tx.walletId);
    var realIdx=(w.transactions||[]).length-1-idx;
    html+='<div class="wish-tx-row">'
      +'<span style="color:var(--muted);font-size:11px;white-space:nowrap">'+fmtDate(tx.date)+'</span>'
      +'<span style="font-family:DM Mono;font-weight:700;color:var(--green);white-space:nowrap">+'+fmtRp(tx.amount)+'</span>'
      +(wl?'<span style="font-size:11px;color:var(--muted)">'+wl.icon+' '+wl.name+'</span>':'<span style="font-size:11px;color:var(--muted)">-</span>')
      +'<span style="flex:1;font-size:11px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(tx.note||'')+'</span>'
      +'<button onclick="deleteWishTx(\''+w.id+'\','+realIdx+')" style="border:none;background:none;cursor:pointer;color:var(--muted);font-size:13px;padding:2px 4px;line-height:1;flex-shrink:0" title="Hapus transaksi">×</button>'
      +'</div>';
  });
  wrap.innerHTML=html;
}
function addWishTx(){
  var w=finWishlist.filter(function(x){return x.id===wishModalId;})[0];if(!w)return;
  var amt=getRawVal(document.getElementById('wm-tx-amount'))||0;
  if(!amt){showToast('Masukkan jumlah!');return;}
  var walletId=document.getElementById('wm-tx-wallet').value;
  var date=document.getElementById('wm-tx-date').value||todayStr;
  var note=document.getElementById('wm-tx-note').value.trim();
  if(!w.transactions)w.transactions=[];
  var txId='wtx'+finNextId++;
  var tx={id:txId,amount:amt,walletId:walletId,date:date,note:note};
  w.transactions.push(tx);
  w.saved=(w.saved||0)+amt;
  // Kurangi saldo wallet & catat sebagai saving (sementara menabung)
  if(walletId){
    var wl=getWalletById(walletId);
    if(wl){
      wl.balance-=amt;
      finTransactions.push({id:'tx'+finNextId++,type:'saving',amount:amt,category:'Tabungan Wishlist',walletId:walletId,date:date,note:'Nabung: '+w.name,wishRef:w.id});
    }
  }
  if(w.saved>=w.targetPrice&&w.targetPrice>0){
    w.status='done';
    convertWishToExpense(w);
    showToast('🎉 Target "'+w.name+'" tercapai! Dicatat sebagai pengeluaran.');
  } else {
    showToast('+'+fmtRp(amt)+' ditabung untuk "'+w.name+'"');
  }
  document.getElementById('wm-saved').value=w.saved;
  document.getElementById('wm-tx-amount').value='';
  document.getElementById('wm-tx-note').value='';
  renderWishTxList(w);
  saveData(true);
}
function deleteWishTx(wishId,idx){
  var w=finWishlist.filter(function(x){return x.id===wishId;})[0];if(!w||!w.transactions)return;
  var tx=w.transactions[idx];if(!tx)return;
  w.saved=Math.max(0,(w.saved||0)-tx.amount);
  // Kembalikan saldo wallet & hapus transaksi saving terkait
  if(tx.walletId){
    var wl=getWalletById(tx.walletId);
    if(wl)wl.balance+=tx.amount;
    // Cari & hapus finTransaction saving yang cocok (pakai wishRef)
    for(var i=finTransactions.length-1;i>=0;i--){
      var ft=finTransactions[i];
      if(ft.wishRef===w.id&&ft.type==='saving'&&ft.amount===tx.amount&&ft.date===tx.date){
        finTransactions.splice(i,1);break;
      }
    }
  }
  w.transactions.splice(idx,1);
  document.getElementById('wm-saved').value=w.saved;
  renderWishTxList(w);
  showToast('Transaksi dihapus');saveData(true);
}
function closeWishModal(){
  document.getElementById('wishModal').classList.remove('show');
  wishModalId=null;
  renderWishlistList();
  saveData(true);
}
function saveWishModal(){
  var w=finWishlist.filter(function(x){return x.id===wishModalId;})[0];if(!w)return;
  w.name=document.getElementById('wm-name').value.trim()||w.name;
  w.targetPrice=parseFloat(document.getElementById('wm-target').value)||0;
  w.saved=parseFloat(document.getElementById('wm-saved').value)||0;
  w.note=document.getElementById('wm-note').value.trim();
  w.status=document.getElementById('wm-status').value;
  showToast('Wishlist diperbarui ✅');closeWishModal();saveData(true);
}

function openWishModalEdit(id){ openWishModal(id,false); }
function openWishModalDana(id){ openWishModal(id,true); }
function addWishSaving(id){ openWishModal(id,true); }
// Saat wishlist selesai: hapus semua transaksi saving-nya, ganti dengan 1 expense
function convertWishToExpense(w){
  // Hapus semua finTransactions saving yang terkait wishlist ini
  finTransactions=finTransactions.filter(function(tx){return tx.wishRef!==w.id;});
  // Buat satu transaksi expense dengan total saved, dari wallet terakhir yang dipakai
  var lastWalletId='';
  if(w.transactions&&w.transactions.length){
    for(var i=w.transactions.length-1;i>=0;i--){
      if(w.transactions[i].walletId){lastWalletId=w.transactions[i].walletId;break;}
    }
  }
  finTransactions.push({
    id:'tx'+finNextId++,
    type:'expense',
    amount:w.saved,
    category:'Wishlist',
    walletId:lastWalletId,
    date:todayStr,
    note:'Beli: '+w.name
  });
}
function markWishDone(id){
  var w=finWishlist.filter(function(x){return x.id===id;})[0];if(!w)return;
  w.status='done';
  convertWishToExpense(w);
  showToast('🎉 "'+w.name+'" selesai! Dicatat sebagai pengeluaran.');
  saveData(true);renderWishlistList();
}
function deleteWishItem(id){
  finWishlist=finWishlist.filter(function(x){return x.id!==id;});
  showToast('Dihapus dari wishlist');saveData(true);renderWishlistList();
}

// ─── CATEGORIES ───
function renderFinCategories(fw){
  var types=[{k:'expense',label:'📤 Pengeluaran',color:'var(--red)'},{k:'income',label:'📥 Pemasukan',color:'var(--green)'},{k:'saving',label:'💙 Tabungan',color:'var(--blue)'}];
  var html='';
  types.forEach(function(tp){
    var cats=finCategories[tp.k]||[];
    html+='<div class="chart-wrap" style="margin-bottom:14px">'
      +'<div class="chart-title" style="color:'+tp.color+'">'+tp.label+'</div>'
      +'<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">';
    cats.forEach(function(cat,i){
      html+='<span style="display:inline-flex;align-items:center;gap:5px;background:var(--bg);border:1px solid var(--border);border-radius:20px;padding:4px 10px;font-size:12px">'
        +cat
        +'<span onclick="deleteCat(\''+tp.k+'\','+i+')" style="cursor:pointer;color:var(--muted);font-size:14px;line-height:1;margin-left:2px" title="Hapus">×</span>'
        +'</span>';
    });
    html+='</div>'
      +'<div style="display:flex;gap:8px;align-items:center">'
      +'<input class="fin-input" id="new-cat-'+tp.k+'" placeholder="Nama kategori baru..." style="flex:1;max-width:260px" onkeydown="if(event.key===\'Enter\')addCat(\''+tp.k+'\')">'
      +'<button onclick="addCat(\''+tp.k+'\')" class="btn-fin-add" style="background:'+tp.color+'">+ Tambah</button>'
      +'</div></div>';
  });
  fw.innerHTML=html;
}
function addCat(type){
  var el=document.getElementById('new-cat-'+type);if(!el)return;
  var name=el.value.trim();if(!name){showToast('Masukkan nama kategori!');return;}
  if(!finCategories[type])finCategories[type]=[];
  if(finCategories[type].indexOf(name)>=0){showToast('Kategori sudah ada!');return;}
  finCategories[type].push(name);
  el.value='';
  showToast('Kategori "'+name+'" ditambahkan ✅');saveData(true);
  var fw=document.getElementById('finScroll')||document.getElementById('finWrap');if(fw)renderFinCategories(fw);
}
function deleteCat(type,idx){
  if(!finCategories[type])return;
  var name=finCategories[type][idx];
  finCategories[type].splice(idx,1);
  showToast('"'+name+'" dihapus');saveData(true);
  var fw=document.getElementById('finScroll')||document.getElementById('finWrap');if(fw)renderFinCategories(fw);
}
function getAllCats(type){
  return(finCategories[type]||[]).concat(['Lainnya']).filter(function(c,i,a){return a.indexOf(c)===i;});
}

// ══════════════════════════════════════════════
// TAGIHAN MODULE
// ══════════════════════════════════════════════
function getTagihanNextDue(t){
  // dueDay: day of month 1-31
  if(!t.dueDay)return null;
  var now=new Date();now.setHours(0,0,0,0);
  var d=new Date(now.getFullYear(),now.getMonth(),t.dueDay);
  if(d<now)d=new Date(now.getFullYear(),now.getMonth()+1,t.dueDay);
  return localDateStr(d);
}
function getTagihanStatus(t){
  if(t.status==='paid')return'paid';
  var due=getTagihanNextDue(t);if(!due)return'ok';
  var now=new Date();now.setHours(0,0,0,0);
  var diff=Math.round((new Date(due+'T00:00:00')-now)/86400000);
  if(diff<0)return'overdue';
  if(diff<=7)return'soon';
  return'ok';
}
function renderFinTagihan(fw){
  var walletOpts=buildWalletOpts('');
  var html='<div class="fin-wrap" style="flex:1;overflow-y:auto;padding:0 20px 20px">';
  // Summary
  var overdue=finTagihan.filter(function(t){return getTagihanStatus(t)==='overdue';}).length;
  var soon=finTagihan.filter(function(t){return getTagihanStatus(t)==='soon';}).length;
  var totalBulan=finTagihan.reduce(function(s,t){return s+(t.amount||0);},0);
  html+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px">'
    +'<div class="fin-card"><div class="fin-card-label">⚠️ Terlambat</div><div class="fin-card-val" style="color:var(--red)">'+overdue+'</div></div>'
    +'<div class="fin-card"><div class="fin-card-label">⏰ Mendekati</div><div class="fin-card-val" style="color:#f59e0b">'+soon+'</div></div>'
    +'<div class="fin-card"><div class="fin-card-label">💸 Total/Bulan</div><div class="fin-card-val" style="color:var(--purple);font-size:15px">'+fmtRp(totalBulan)+'</div></div>'
    +'</div>';
  // Add form
  html+='<div class="fin-add-bar" style="border-color:#8b5cf6">'
    +'<div class="fin-add-title">🧾 Tambah Tagihan Rutin</div>'
    +'<div class="fin-form-row">'
    +'<div class="fin-form-group"><div class="fin-form-label">Nama Tagihan</div><input class="fin-input" id="tag-name" placeholder="cth: Listrik, WiFi, Netflix..."></div>'
    +'<div class="fin-form-group" style="max-width:130px"><div class="fin-form-label">Jumlah (Rp)</div><input type="text" inputmode="numeric" class="fin-input" id="tag-amount" placeholder="0" oninput="autoFormatRp(this)"></div>'
    +'<div class="fin-form-group" style="max-width:140px"><div class="fin-form-label">Jatuh Tempo (tanggal)</div><input type="number" class="fin-input" id="tag-dueday" placeholder="1-31 (tgl tiap bulan)" min="1" max="31" title="Masukkan tanggal jatuh tempo setiap bulan, misal 5 = tiap tgl 5"></div>'
    +'<div class="fin-form-group"><div class="fin-form-label">Wallet Default</div><select class="fin-input" id="tag-wallet">'+walletOpts+'</select></div>'
    +'<div class="fin-form-group"><div class="fin-form-label">Catatan</div><input class="fin-input" id="tag-note" placeholder="Opsional"></div>'
    +'<button onclick="addTagihan()" class="btn-fin-add" style="background:#8b5cf6;align-self:flex-end">+ Tambah</button>'
    +'</div></div>';
  // List
  if(!finTagihan.length){html+='<div class="empty"><div class="empty-icon">🧾</div>Belum ada tagihan.<br>Tambah tagihan rutin di atas!</div>';}
  else{
    finTagihan.forEach(function(t){
      var st=getTagihanStatus(t),due=getTagihanNextDue(t);
      var stColor=st==='overdue'?'var(--red)':st==='soon'?'#f59e0b':'var(--green)';
      var stText=st==='overdue'?'⚠️ Terlambat':st==='soon'?'⏰ Segera':'✅ OK';
      var diffDays=due?Math.round((new Date(due+'T00:00:00')-new Date())/86400000):null;
      var walletName=t.walletId?(finWallets.filter(function(w){return w.id===t.walletId;})[0]||{name:'—'}).name:'—';
      html+='<div class="fin-table" style="margin-bottom:8px">'
        +'<div style="padding:10px 12px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">'
        +'<div style="flex:1;min-width:120px"><div style="font-size:13px;font-weight:600;color:var(--text)">'+t.name+'</div>'
        +'<div style="font-size:10px;color:var(--muted);margin-top:2px">Jatuh tempo setiap tgl '+t.dueDay+' · '+(due?('<b style="color:var(--text)">'+fmtDate(due)+'</b>'):'-')+' · '+walletName+(t.note?' · '+t.note:'')+'</div></div>'
        +'<div style="text-align:right"><div style="font-size:16px;font-weight:700;font-family:DM Mono,monospace;color:#8b5cf6">'+fmtRp(t.amount)+'</div>'
        +'<div style="font-size:10px;color:'+stColor+'">'+(diffDays!==null?(diffDays>0?diffDays+' hari lagi':(diffDays===0?'Hari ini!':Math.abs(diffDays)+' hari lewat')):'—')+'</div></div>'
        +'<span style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:8px;background:'+(st==='overdue'?'#fee2e2':st==='soon'?'#fef3c7':'#dcfce7')+';color:'+stColor+'">'+stText+'</span>'
        +'<button onclick="bayarTagihan(\''+t.id+'\')" style="padding:6px 12px;border:none;border-radius:7px;background:#8b5cf6;color:#fff;cursor:pointer;font-size:11px;font-weight:700;font-family:DM Sans,sans-serif;white-space:nowrap">💳 Bayar</button>'
        +'<button onclick="hapusTagihan(\''+t.id+'\')" style="padding:6px;border:1px solid var(--border);border-radius:7px;background:var(--bg);color:var(--red);cursor:pointer;font-size:12px">🗑</button>'
        +'</div>';
      // History
      if(t.history&&t.history.length){
        html+='<div style="padding:0 12px 10px"><div style="font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.4px;margin-bottom:6px">Riwayat Pembayaran</div>';
        t.history.slice().reverse().slice(0,3).forEach(function(h){
          html+='<div style="display:flex;justify-content:space-between;font-size:11px;padding:4px 0;border-bottom:1px solid var(--border)">'
            +'<span style="color:var(--muted)">'+fmtDate(h.date)+'</span>'
            +'<span style="font-family:DM Mono;color:var(--green);font-weight:600">'+fmtRp(h.amount)+'</span>'
            +'</div>';
        });
        html+='</div>';
      }
      html+='</div>';
    });
  }
  html+='</div>';
  fw.innerHTML=html;
}
function addTagihan(){
  var name=document.getElementById('tag-name').value.trim();
  if(!name){showToast('Nama tagihan wajib diisi!');return;}
  var amount=getRawVal(document.getElementById('tag-amount'))||0;
  var dueDay=parseInt(document.getElementById('tag-dueday').value)||1;
  var walletId=document.getElementById('tag-wallet').value||'';
  var note=document.getElementById('tag-note').value.trim();
  finTagihan.push({id:'tg'+finNextId++,name:name,amount:amount,dueDay:dueDay,walletId:walletId,note:note,status:'active',lastPaid:'',history:[]});
  document.getElementById('tag-name').value='';document.getElementById('tag-amount').value='';document.getElementById('tag-dueday').value='';document.getElementById('tag-note').value='';
  saveData(true);render();showToast('Tagihan "'+name+'" ditambahkan 🧾');
}
function bayarTagihan(id){
  var t=finTagihan.filter(function(x){return x.id===id;})[0];if(!t)return;
  var walletId=t.walletId;
  var w=walletId?getWalletById(walletId):null;
  var msg='Bayar tagihan "'+t.name+'" sebesar '+fmtRp(t.amount)+'?';
  if(w)msg+='\n('+fmtRp(w.balance)+' tersedia di '+w.name+')';
  if(!confirm(msg))return;
  if(w){
    w.balance-=t.amount;
  }
  var date=todayStr;
  t.history=t.history||[];
  t.history.push({date:date,amount:t.amount,walletId:walletId});
  t.lastPaid=date;
  if(walletId)finTransactions.push({id:'tx'+finNextId++,type:'expense',amount:t.amount,category:'Tagihan',note:'Bayar: '+t.name,date:date,walletId:walletId});
  saveData(true);render();showToast('✅ Tagihan "'+t.name+'" dibayar!');
}
function hapusTagihan(id){
  finTagihan=finTagihan.filter(function(x){return x.id!==id;});
  saveData(true);render();showToast('Tagihan dihapus');
}

// ══════════════════════════════════════════════
// HUTANG MODULE
// ══════════════════════════════════════════════
function getSisaHutang(h){
  // total pinjam - total bayar
  var totalPinjam=(h.transactions||[]).filter(function(tx){return tx.type==='pinjam';}).reduce(function(s,tx){return s+tx.amount;},0);
  var totalBayar=(h.transactions||[]).filter(function(tx){return tx.type==='bayar';}).reduce(function(s,tx){return s+tx.amount;},0);
  return Math.max(0,totalPinjam-totalBayar);
}
function renderFinHutang(fw){
  var walletOpts=buildWalletOpts('');
  var html='<div class="fin-wrap" style="flex:1;overflow-y:auto;padding:0 20px 20px">';
  // Summary
  var totalHutang=finHutang.filter(function(h){return h.type==='hutang';}).reduce(function(s,h){return s+getSisaHutang(h);},0);
  var totalPiutang=finHutang.filter(function(h){return h.type==='piutang';}).reduce(function(s,h){return s+getSisaHutang(h);},0);
  html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">'
    +'<div class="fin-card"><div class="fin-card-label">🔴 Total Hutang</div><div class="fin-card-val" style="color:var(--red)">'+fmtRp(totalHutang)+'</div><div class="fin-card-sub">yang masih harus dibayar</div></div>'
    +'<div class="fin-card"><div class="fin-card-label">🟢 Total Piutang</div><div class="fin-card-val" style="color:var(--green)">'+fmtRp(totalPiutang)+'</div><div class="fin-card-sub">yang harus diterima</div></div>'
    +'</div>';
  // Add form
  html+='<div class="fin-add-bar" style="border-color:#ef4444">'
    +'<div class="fin-add-title">🤝 Tambah Hutang / Piutang</div>'
    +'<div class="fin-form-row">'
    +'<div class="fin-form-group"><div class="fin-form-label">Tipe</div><select class="fin-input" id="hut-type"><option value="hutang">🔴 Hutang (saya yang pinjam)</option><option value="piutang">🟢 Piutang (saya yang meminjamkan)</option></select></div>'
    +'<div class="fin-form-group"><div class="fin-form-label">Nama / Keterangan</div><input class="fin-input" id="hut-name" placeholder="cth: Pinjam ke Budi, KPR Bank..."></div>'
    +'<div class="fin-form-group" style="max-width:150px"><div class="fin-form-label">Jumlah Awal (Rp)</div><input type="text" inputmode="numeric" class="fin-input" id="hut-amount" placeholder="0" oninput="autoFormatRp(this)"></div>'
    +'<div class="fin-form-group"><div class="fin-form-label">Wallet (opsional)</div><select class="fin-input" id="hut-wallet">'+walletOpts+'</select></div>'
    +'<div class="fin-form-group"><div class="fin-form-label">Catatan</div><input class="fin-input" id="hut-note" placeholder="Opsional"></div>'
    +'<button onclick="addHutang()" class="btn-fin-add red" style="align-self:flex-end">+ Tambah</button>'
    +'</div></div>';
  // List
  if(!finHutang.length){html+='<div class="empty"><div class="empty-icon">🤝</div>Belum ada hutang / piutang.<br>Tambah di atas!</div>';}
  else{
    // Group by type
    ['hutang','piutang'].forEach(function(tp){
      var list=finHutang.filter(function(h){return h.type===tp;});
      if(!list.length)return;
      html+='<div class="fin-section-title" style="margin-top:14px">'+(tp==='hutang'?'🔴 Hutang':'🟢 Piutang')+'</div>';
      list.forEach(function(h){
        var sisa=getSisaHutang(h);
        var totalPinjam=(h.transactions||[]).filter(function(tx){return tx.type==='pinjam';}).reduce(function(s,tx){return s+tx.amount;},0);
        var pct=totalPinjam?Math.round((1-sisa/totalPinjam)*100):100;
        var lunas=sisa<=0;
        html+='<div class="fin-table" style="margin-bottom:10px">'
          +'<div style="padding:12px;display:flex;flex-direction:column;gap:8px">'
          +'<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap">'
          +'<div><div style="font-size:13px;font-weight:600;color:var(--text)">'+h.name+'</div>'
          +'<div style="font-size:10px;color:var(--muted);margin-top:2px">Mulai: '+fmtDate(h.createdDate)+(h.note?' · '+h.note:'')+'</div></div>'
          +'<div style="text-align:right"><div style="font-size:11px;color:var(--muted)">Sisa</div>'
          +'<div style="font-size:18px;font-weight:700;font-family:DM Mono;color:'+(lunas?'var(--green)':tp==='hutang'?'var(--red)':'var(--blue)')+'">'+fmtRp(sisa)+'</div>'
          +(lunas?'<span style="font-size:10px;background:#dcfce7;color:#15803d;padding:2px 7px;border-radius:8px;font-weight:700">✅ LUNAS</span>':'')+'</div></div>'
          // Progress bar
          +'<div><div style="display:flex;justify-content:space-between;font-size:10px;color:var(--muted);margin-bottom:3px"><span>Total pinjam: '+fmtRp(totalPinjam)+'</span><span>'+pct+'% dibayar</span></div>'
          +'<div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden"><div style="height:100%;width:'+pct+'%;background:'+(lunas?'var(--green)':tp==='hutang'?'#f87171':'#60a5fa')+';border-radius:3px;transition:width 0.4s"></div></div></div>'
          // Tx buttons
          +(!lunas?'<div style="display:flex;gap:8px;flex-wrap:wrap">'
            +(tp==='hutang'
              ? '<button onclick="openHutangTx(\''+h.id+'\',\'pinjam\')" style="padding:6px 12px;border:none;border-radius:7px;background:#fef2f2;color:var(--red);cursor:pointer;font-size:11px;font-weight:700;font-family:DM Sans,sans-serif">+ Pinjam Lagi</button>'
                +'<button onclick="openHutangTx(\''+h.id+'\',\'bayar\')" style="padding:6px 12px;border:none;border-radius:7px;background:#f0fdf4;color:var(--green);cursor:pointer;font-size:11px;font-weight:700;font-family:DM Sans,sans-serif">✓ Bayar</button>'
              : '<button onclick="openHutangTx(\''+h.id+'\',\'pinjam\')" style="padding:6px 12px;border:none;border-radius:7px;background:#fef2f2;color:var(--red);cursor:pointer;font-size:11px;font-weight:700;font-family:DM Sans,sans-serif">+ Pinjamkan Lagi</button>'
                +'<button onclick="openHutangTx(\''+h.id+'\',\'bayar\')" style="padding:6px 12px;border:none;border-radius:7px;background:#f0fdf4;color:var(--green);cursor:pointer;font-size:11px;font-weight:700;font-family:DM Sans,sans-serif">✓ Terima Pembayaran</button>')
            +'</div>':'')
          // History
          +(h.transactions&&h.transactions.length?'<details style="margin-top:4px"><summary style="font-size:11px;color:var(--muted);cursor:pointer;user-select:none">Riwayat transaksi ('+h.transactions.length+')</summary>'
            +'<div style="margin-top:8px;border-top:1px solid var(--border);padding-top:6px">'
            +h.transactions.slice().reverse().map(function(tx,ri){
              var origIdx=h.transactions.length-1-ri;
              return'<div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;padding:5px 0;border-bottom:1px solid var(--border);gap:6px">'
                +'<div style="flex:1;min-width:0"><span style="font-size:10px;padding:1px 6px;border-radius:5px;font-weight:700;background:'+(tx.type==='pinjam'?'#fee2e2':'#dcfce7')+';color:'+(tx.type==='pinjam'?'var(--red)':'var(--green)')+'">'+tx.type.toUpperCase()+'</span>'
                +' <span style="color:var(--muted)">'+fmtDate(tx.date)+'</span>'+(tx.note?' <span style="color:var(--muted)">· '+tx.note+'</span>':'')+'</div>'
                +'<div style="font-family:DM Mono;font-weight:600;color:'+(tx.type==='pinjam'?'var(--red)':'var(--green)')+'">'+fmtRp(tx.amount)+'</div>'
                +'<div style="display:flex;gap:3px;flex-shrink:0">'
                +'<button onclick="event.stopPropagation();editHutangTx(\''+h.id+'\','+origIdx+')" style="border:1px solid var(--border);background:var(--bg);color:var(--muted);border-radius:5px;padding:2px 6px;cursor:pointer;font-size:10px;font-family:DM Sans,sans-serif" title="Edit transaksi">✏️</button>'
                +'<button onclick="event.stopPropagation();deleteHutangTx(\''+h.id+'\','+origIdx+')" style="border:1px solid var(--border);background:var(--bg);color:var(--red);border-radius:5px;padding:2px 6px;cursor:pointer;font-size:10px;font-family:DM Sans,sans-serif" title="Hapus transaksi">×</button>'
                +'</div></div>';
            }).join('')
            +'</div></details>':'')
          +'</div>'
          +'<div style="padding:0 12px 10px;display:flex;justify-content:flex-end">'
          +'<button onclick="hapusHutang(\''+h.id+'\')" style="padding:4px 8px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--muted);cursor:pointer;font-size:11px;font-family:DM Sans,sans-serif">🗑 Hapus</button>'
          +'</div></div>';
      });
    });
  }
  html+='</div>';
  fw.innerHTML=html;
}
function addHutang(){
  var type=document.getElementById('hut-type').value;
  var name=document.getElementById('hut-name').value.trim();
  if(!name){showToast('Nama/keterangan wajib diisi!');return;}
  var amount=getRawVal(document.getElementById('hut-amount'))||0;
  var walletId=document.getElementById('hut-wallet').value||'';
  var note=document.getElementById('hut-note').value.trim();
  var h={id:'hu'+finNextId++,name:name,type:type,createdDate:todayStr,walletId:walletId,note:note,transactions:[]};
  if(amount>0){
    h.transactions.push({id:'htx'+finNextId++,date:todayStr,type:'pinjam',amount:amount,walletId:walletId,note:'Awal'});
    // Adjust wallet
    if(walletId){
      var w=getWalletById(walletId);
      if(w){if(type==='hutang')w.balance+=amount;else w.balance-=amount;}
      finTransactions.push({id:'tx'+finNextId++,type:type==='hutang'?'income':'expense',amount:amount,category:'Hutang/Piutang',note:(type==='hutang'?'Pinjam: ':'Pinjamkan: ')+name,date:todayStr,walletId:walletId});
    }
  }
  finHutang.push(h);
  document.getElementById('hut-name').value='';document.getElementById('hut-amount').value='';document.getElementById('hut-note').value='';
  saveData(true);render();showToast((type==='hutang'?'🔴 Hutang':'🟢 Piutang')+' "'+name+'" ditambahkan!');
}
var _hutangTxTarget=null;
function openHutangTx(id,txType){
  _hutangTxTarget={id:id,txType:txType};
  var h=finHutang.filter(function(x){return x.id===id;})[0];if(!h)return;
  var walletOpts=buildWalletOpts('');
  var isHutang=(h.type==='hutang');
  var label=txType==='pinjam'?(isHutang?'Pinjam Lagi':'Pinjamkan Lagi'):(isHutang?'Bayar':'Terima Pembayaran');
  var color=txType==='pinjam'?'var(--red)':'var(--green)';
  var modal=document.getElementById('hutangTxModal');
  if(!modal){
    modal=document.createElement('div');
    modal.id='hutangTxModal';
    modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:2000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px)';
    modal.innerHTML='<div style="background:var(--card);border-radius:14px;padding:24px;width:420px;max-width:96vw;box-shadow:0 20px 60px rgba(0,0,0,0.22)">'
      +'<div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:16px;display:flex;align-items:center;justify-content:space-between">'
      +'<span id="htx-title"></span><button onclick="closeHutangTx()" style="border:none;background:none;cursor:pointer;font-size:18px;color:var(--muted)">✕</button></div>'
      +'<div class="modal-field"><div class="modal-label">Jumlah (Rp)</div><input type="text" inputmode="numeric" class="modal-input" id="htx-amount" placeholder="0" oninput="autoFormatRp(this)"></div>'
      +'<div class="modal-field"><div class="modal-label">Wallet</div><select class="modal-input" id="htx-wallet"></select></div>'
      +'<div class="modal-field"><div class="modal-label">Tanggal</div><input type="date" class="modal-input" id="htx-date" value="'+todayStr+'"></div>'
      +'<div class="modal-field"><div class="modal-label">Catatan</div><input class="modal-input" id="htx-note" placeholder="Opsional"></div>'
      +'<div style="display:flex;gap:8px;margin-top:16px">'
      +'<button onclick="closeHutangTx()" style="flex:1;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg);cursor:pointer;font-size:13px;font-family:DM Sans,sans-serif;color:var(--muted)">Batal</button>'
      +'<button id="htx-submit" onclick="submitHutangTx()" style="flex:1;padding:10px;border:none;border-radius:8px;color:#fff;cursor:pointer;font-size:13px;font-weight:700;font-family:DM Sans,sans-serif">Simpan</button>'
      +'</div></div>';
    document.body.appendChild(modal);
  }
  document.getElementById('htx-title').textContent=label+' — '+h.name;
  document.getElementById('htx-wallet').innerHTML=walletOpts;
  document.getElementById('htx-amount').value='';
  document.getElementById('htx-note').value='';
  document.getElementById('htx-date').value=todayStr;
  document.getElementById('htx-submit').style.background=color;
  modal.style.display='flex';
}
function closeHutangTx(){var m=document.getElementById('hutangTxModal');if(m){m.style.display='none';m.style.zIndex='2000';}}
function submitHutangTx(){
  if(!_hutangTxTarget)return;
  var h=finHutang.filter(function(x){return x.id===_hutangTxTarget.id;})[0];if(!h)return;
  var amount=getRawVal(document.getElementById('htx-amount'))||0;
  if(!amount){showToast('Masukkan jumlah!');return;}
  var walletId=document.getElementById('htx-wallet').value||'';
  var date=document.getElementById('htx-date').value||todayStr;
  var note=document.getElementById('htx-note').value.trim();
  var txType=_hutangTxTarget.txType;
  // Edit mode
  if(_hutangTxTarget.editIdx!==undefined){
    var oldTx=h.transactions[_hutangTxTarget.editIdx];
    // Reverse old wallet effect
    if(oldTx.walletId){
      var wOld=getWalletById(oldTx.walletId);
      if(wOld){
        if(h.type==='hutang'){if(oldTx.type==='pinjam')wOld.balance-=oldTx.amount;else wOld.balance+=oldTx.amount;}
        else{if(oldTx.type==='pinjam')wOld.balance+=oldTx.amount;else wOld.balance-=oldTx.amount;}
      }
    }
    // Apply new wallet effect
    if(walletId){
      var wNew=getWalletById(walletId);
      if(wNew){
        if(h.type==='hutang'){if(txType==='pinjam')wNew.balance+=amount;else wNew.balance-=amount;}
        else{if(txType==='pinjam')wNew.balance-=amount;else wNew.balance+=amount;}
      }
    }
    h.transactions[_hutangTxTarget.editIdx]={id:oldTx.id,date:date,type:txType,amount:amount,walletId:walletId,note:note};
    closeHutangTx();saveData(true);render();showToast('✏️ Transaksi diperbarui!');
    return;
  }
  // Add new
  h.transactions.push({id:'htx'+finNextId++,date:date,type:txType,amount:amount,walletId:walletId,note:note});
  // Adjust wallet
  if(walletId){
    var w=getWalletById(walletId);
    if(w){
      if(h.type==='hutang'){if(txType==='pinjam')w.balance+=amount;else w.balance-=amount;}
      else{if(txType==='pinjam')w.balance-=amount;else w.balance+=amount;}
    }
    finTransactions.push({id:'tx'+finNextId++,type:(txType==='bayar'?(h.type==='hutang'?'expense':'income'):(h.type==='hutang'?'income':'expense')),amount:amount,category:'Hutang/Piutang',note:(h.type==='hutang'?(txType==='bayar'?'Bayar hutang: ':'Pinjam lagi: '):(txType==='bayar'?'Terima pembayaran: ':'Pinjamkan lagi: '))+h.name,date:date,walletId:walletId});
  }
  closeHutangTx();saveData(true);render();showToast(txType==='bayar'?'✅ Pembayaran dicatat!':'📝 Pinjaman baru dicatat!');
}
function hapusHutang(id){
  var h=finHutang.filter(function(x){return x.id===id;})[0];if(!h)return;
  showConfirm('Hapus '+(h.type==='hutang'?'hutang':'piutang')+' "'+h.name+'" beserta riwayatnya?',function(){
    // Reverse semua wallet effect
    (h.transactions||[]).forEach(function(tx){
      if(tx.walletId){
        var w=getWalletById(tx.walletId);
        if(w){
          if(h.type==='hutang'){if(tx.type==='pinjam')w.balance-=tx.amount;else w.balance+=tx.amount;}
          else{if(tx.type==='pinjam')w.balance+=tx.amount;else w.balance-=tx.amount;}
        }
      }
    });
    finHutang=finHutang.filter(function(x){return x.id!==id;});
    saveData(true);render();showToast('🗑 Dihapus');
  });
}
function deleteHutangTx(hutangId,txIdx){
  var h=finHutang.filter(function(x){return x.id===hutangId;})[0];if(!h||!h.transactions)return;
  var tx=h.transactions[txIdx];if(!tx)return;
  showConfirm('Hapus transaksi '+tx.type.toUpperCase()+' '+fmtRp(tx.amount)+'?',function(){
    if(tx.walletId){
      var w=getWalletById(tx.walletId);
      if(w){
        if(h.type==='hutang'){if(tx.type==='pinjam')w.balance-=tx.amount;else w.balance+=tx.amount;}
        else{if(tx.type==='pinjam')w.balance+=tx.amount;else w.balance-=tx.amount;}
      }
    }
    h.transactions.splice(txIdx,1);
    saveData(true);render();showToast('Transaksi dihapus');
  });
}
function editHutangTx(hutangId,txIdx){
  var h=finHutang.filter(function(x){return x.id===hutangId;})[0];if(!h||!h.transactions)return;
  var tx=h.transactions[txIdx];if(!tx)return;
  // Reuse openHutangTx modal but pre-fill with existing tx data for editing
  _hutangTxTarget={id:hutangId,txType:tx.type,editIdx:txIdx};
  var walletOpts=buildWalletOpts(tx.walletId,true);
  var label='Edit Transaksi '+tx.type.toUpperCase()+' — '+h.name;
  var color=tx.type==='pinjam'?'var(--red)':'var(--green)';
  var modal=document.getElementById('hutangTxModal');
  if(!modal){
    modal=document.createElement('div');
    modal.id='hutangTxModal';
    modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:2000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px)';
    modal.innerHTML='<div style="background:var(--card);border-radius:14px;padding:24px;width:420px;max-width:96vw;box-shadow:0 20px 60px rgba(0,0,0,0.22)">'
      +'<div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:16px;display:flex;align-items:center;justify-content:space-between">'
      +'<span id="htx-title"></span><button onclick="closeHutangTx()" style="border:none;background:none;cursor:pointer;font-size:18px;color:var(--muted)">✕</button></div>'
      +'<div class="modal-field"><div class="modal-label">Jumlah (Rp)</div><input type="text" inputmode="numeric" class="modal-input" id="htx-amount" placeholder="0" oninput="autoFormatRp(this)"></div>'
      +'<div class="modal-field"><div class="modal-label">Wallet</div><select class="modal-input" id="htx-wallet"></select></div>'
      +'<div class="modal-field"><div class="modal-label">Tanggal</div><input type="date" class="modal-input" id="htx-date" value="'+todayStr+'"></div>'
      +'<div class="modal-field"><div class="modal-label">Catatan</div><input class="modal-input" id="htx-note" placeholder="Opsional"></div>'
      +'<div style="display:flex;gap:8px;margin-top:16px">'
      +'<button onclick="closeHutangTx()" style="flex:1;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--bg);cursor:pointer;font-size:13px;font-family:DM Sans,sans-serif;color:var(--muted)">Batal</button>'
      +'<button id="htx-submit" onclick="submitHutangTx()" style="flex:1;padding:10px;border:none;border-radius:8px;color:#fff;cursor:pointer;font-size:13px;font-weight:700;font-family:DM Sans,sans-serif">Simpan</button>'
      +'</div></div>';
    document.body.appendChild(modal);
  }
  modal.style.zIndex='2000';
  document.getElementById('htx-title').textContent=label;
  document.getElementById('htx-wallet').innerHTML=walletOpts;
  document.getElementById('htx-amount').value=tx.amount;
  document.getElementById('htx-note').value=tx.note||'';
  document.getElementById('htx-date').value=tx.date||todayStr;
  document.getElementById('htx-submit').style.background=color;
  modal.style.display='flex';
}

// ══════════════════════════════════════════════
// REPEAT CUSTOM HANDLER
// ══════════════════════════════════════════════
var _dailyExceptTargetSel=null;
var _customRepeatTargetSel = null;

function handleRepeatChange(sel){
  if(sel.value==='__daily_except__'){
    _dailyExceptTargetSel=sel;
    openDailyExceptModal();
    return;
  }
  if(sel.value==='__custom__'){
    _customRepeatTargetSel = sel;
    openCustomRepeatModal();
    return;
  }
}

function openCustomRepeatModal() {
  // Reset ke default
  document.getElementById('cr-n').value = 2;
  document.querySelectorAll('.cr-unit-btn').forEach(function(b){ b.classList.remove('active'); });
  document.querySelector('.cr-unit-btn[data-unit="Hari"]').classList.add('active');
  updateCRPreview();
  document.getElementById('customRepeatOverlay').style.display = 'block';
  document.getElementById('customRepeatModal').style.display = 'block';
  setTimeout(function(){ document.getElementById('cr-n').focus(); document.getElementById('cr-n').select(); }, 100);
}

function closeCustomRepeatModal() {
  document.getElementById('customRepeatOverlay').style.display = 'none';
  document.getElementById('customRepeatModal').style.display = 'none';
  // Reset select ke kosong jika belum ada nilai tersimpan
  if (_customRepeatTargetSel && _customRepeatTargetSel.value === '__custom__') {
    _customRepeatTargetSel.value = '';
  }
  _customRepeatTargetSel = null;
}

function setCRUnit(btn) {
  document.querySelectorAll('.cr-unit-btn').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
  updateCRPreview();
}

function updateCRPreview() {
  var n    = parseInt(document.getElementById('cr-n').value) || 1;
  var unit = (document.querySelector('.cr-unit-btn.active') || {}).dataset.unit || 'Hari';
  n = Math.max(1, Math.min(365, n));
  var preview = '';
  if (unit==='Hari')   preview = n===1 ? 'Setiap hari' : 'Setiap '+n+' hari sekali';
  if (unit==='Minggu') preview = n===1 ? 'Setiap minggu' : 'Setiap '+n+' minggu sekali';
  if (unit==='Bulan')  preview = n===1 ? 'Setiap bulan' : 'Setiap '+n+' bulan sekali';
  document.getElementById('cr-preview').textContent = '→ ' + preview;
}

function confirmCustomRepeat() {
  var n    = parseInt(document.getElementById('cr-n').value) || 1;
  var unit = (document.querySelector('.cr-unit-btn.active') || {}).dataset.unit || 'Hari';
  n = Math.max(1, Math.min(365, n));
  var val;
  if (n===1 && unit==='Hari')   val = 'Harian';
  else if (n===1 && unit==='Minggu') val = 'Mingguan';
  else if (n===1 && unit==='Bulan')  val = 'Bulanan';
  else val = 'Tiap ' + n + ' ' + unit;

  // Tambah option custom ke SEMUA repeat select supaya saat sync antar bar tidak hilang
  var allRepeatSels = ['chip-repeat','mchip-repeat','sqa-repeat'];
  allRepeatSels.forEach(function(selId) {
    var sel = document.getElementById(selId);
    if (!sel) return;
    var found = false;
    for (var i = 0; i < sel.options.length; i++) {
      if (sel.options[i].value === val) { found = true; break; }
    }
    if (!found) {
      var opt = document.createElement('option');
      opt.value = val; opt.textContent = val;
      // Sisipkan sebelum option __custom__ (selalu di ujung)
      var anchor = sel.querySelector('option[value="__custom__"]');
      sel.insertBefore(opt, anchor || sel.lastElementChild);
    }
    // Set value hanya ke select yang jadi target
    if (_customRepeatTargetSel && sel === _customRepeatTargetSel) {
      sel.value = val;
    }
  });
  document.getElementById('customRepeatOverlay').style.display = 'none';
  document.getElementById('customRepeatModal').style.display = 'none';
  _customRepeatTargetSel = null;
}
function openDailyExceptModal(){
  // Reset button states
  document.querySelectorAll('.de-day-btn').forEach(function(b){b.classList.remove('selected');});
  var ov=document.getElementById('dailyExceptOverlay');
  var md=document.getElementById('dailyExceptModal');
  if(ov)ov.style.display='block';
  if(md)md.style.display='block';
}
function closeDailyExceptModal(){
  var ov=document.getElementById('dailyExceptOverlay');
  var md=document.getElementById('dailyExceptModal');
  if(ov)ov.style.display='none';
  if(md)md.style.display='none';
  // Reset select if no day was chosen
  if(_dailyExceptTargetSel&&_dailyExceptTargetSel.value==='__daily_except__'){
    _dailyExceptTargetSel.value='';
  }
  _dailyExceptTargetSel=null;
}
function selectDailyExceptDay(hari){
  var val='Harian kecuali '+hari;
  // Tambah option ke SEMUA repeat select supaya sync antar bar tidak kehilangan nilai
  var allRepeatSels2 = ['chip-repeat','mchip-repeat','sqa-repeat'];
  allRepeatSels2.forEach(function(selId) {
    var sel2 = document.getElementById(selId);
    if (!sel2) return;
    var exists2 = false;
    for (var i = 0; i < sel2.options.length; i++) { if (sel2.options[i].value === val) { exists2 = true; break; } }
    if (!exists2) {
      var opt2 = document.createElement('option');
      opt2.value = val; opt2.textContent = val;
      var anchor2 = sel2.querySelector('option[value="__daily_except__"]');
      sel2.insertBefore(opt2, anchor2 ? anchor2.nextSibling : sel2.lastElementChild);
    }
    if (_dailyExceptTargetSel && sel2 === _dailyExceptTargetSel) sel2.value = val;
  });
  closeDailyExceptModal();
}
function updateCustomRepeat() {
  var n    = parseInt(document.getElementById('det-repeat-custom-n').value) || 1;
  var unit = document.getElementById('det-repeat-custom-unit').value;
  n = Math.max(1, Math.min(365, n));
  document.getElementById('det-repeat-custom-n').value = n;
  var val  = (n === 1) ? unit === 'Hari' ? 'Harian' : unit === 'Minggu' ? 'Mingguan' : 'Bulanan'
           : 'Tiap ' + n + ' ' + unit;
  // Singkat: "Tiap 1 Hari" → "Harian", dll sudah di atas
  document.getElementById('det-repeat-custom-val').value = val;
  // Preview humanized
  var preview = '';
  if (unit === 'Hari')   preview = n === 1 ? '(setiap hari)' : '(setiap ' + n + ' hari sekali)';
  if (unit === 'Minggu') preview = n === 1 ? '(setiap minggu)' : '(setiap ' + n + ' minggu sekali)';
  if (unit === 'Bulan')  preview = n === 1 ? '(setiap bulan)' : '(setiap ' + n + ' bulan sekali)';
  document.getElementById('det-repeat-custom-preview').textContent = preview;
  liveDetail();
}

function handleDetRepeatChange(sel){
  var custom=document.getElementById('det-repeat-custom');
  if(sel.value==='__daily_except__'){
    if(custom)custom.style.display='none';
    _dailyExceptTargetSel=sel;
    openDailyExceptModal();
    return;
  }
  if(sel.value==='__custom__'){
    if(custom){
      custom.style.display='block';
      // Inisialisasi picker dari nilai existing kalau ada
      var existVal = selectedTask ? (selectedTask.repeat||'') : '';
      var n = 2, unit = 'Hari';
      var m;
      if ((m = existVal.match(/^Tiap (\d+) (Hari|Minggu|Bulan)$/))) {
        n = parseInt(m[1]); unit = m[2];
      } else if (existVal === 'Mingguan') { n = 1; unit = 'Minggu'; }
      else if (existVal === 'Bulanan')    { n = 1; unit = 'Bulan'; }
      document.getElementById('det-repeat-custom-n').value = n;
      document.getElementById('det-repeat-custom-unit').value = unit;
      updateCustomRepeat();
    }
  } else {
    if(custom)custom.style.display='none';
    liveDetail();
  }
}
function liveDetailDailyExcept(){
  var inp=document.getElementById('det-repeat-daily-except-val');
  if(!inp)return;
  var hari=inp.value.trim();
  if(!hari){if(selectedTask)selectedTask.repeat='';saveData();return;}
  var hariNorm=hari.charAt(0).toUpperCase()+hari.slice(1).toLowerCase();
  var repeatVal='Harian kecuali '+hariNorm;
  var sel=document.getElementById('det-repeat');
  if(sel){
    if(!sel.querySelector('option[value="'+repeatVal+'"]')){
      var opt=document.createElement('option');
      opt.value=repeatVal;opt.textContent=repeatVal;
      var anchor=sel.querySelector('option[value="__daily_except__"]');
      sel.insertBefore(opt,anchor?anchor.nextSibling:sel.lastElementChild);
    }
    sel.value=repeatVal;
  }
  if(selectedTask){selectedTask.repeat=repeatVal;saveData();}
}

// ══════════════════════════════════════════════
// ACTIONS
// ══════════════════════════════════════════════
// ── Helper: hitung next due date untuk task repeat ──
function calcNextDue(t, fromDate) {
  if (!t.repeat) return null;
  var days = getRepeatDays(t.repeat);
  if (!days) return null;
  // Kalau due asli sudah lewat, hitung dari hari ini supaya next due selalu ke depan
  var base = (fromDate && fromDate >= todayStr) ? fromDate : todayStr;
  var dt = new Date(base + 'T00:00:00');
  dt.setDate(dt.getDate() + days);
  // Skip hari yang dikecualikan (Harian kecuali X)
  var skipDay = getExceptDay(t.repeat);
  if (skipDay >= 0 && dt.getDay() === skipDay) dt.setDate(dt.getDate() + 1);
  return localDateStr(dt);
}

function skipToToday(id){
  var t=tasks.filter(function(x){return x.id===id;})[0];if(!t)return;
  if(!t.due||t.due>=todayStr)return;
  t.due=todayStr;
  t.myday=true;
  showToast('⏩ Task dipindah ke hari ini');
  saveData(true);render();
}
function toggleDone(id){
  var t=tasks.filter(function(x){return x.id===id;})[0];if(!t)return;

  // Kalau task punya _nextDue (sudah selesai hari ini, repeat pending besok)
  // dan user uncheck dari view completed → batalkan: hapus _nextDue, kembalikan ke My Day
  if(t._nextDue && t.done){
    // Undo repeat: hapus _nextDue, kembalikan due ke hari ini
    delete t._nextDue;
    t.done=false;
    t.doneDate=null;
    t.due=todayStr;
    t.myday=true;
    if(t.steps)t.stepsDone=0;
    totalDone=Math.max(0,totalDone-1);
    xp=Math.max(0,xp-getTaskXP(t));updateXPBar();
    goldBalance=Math.max(0,goldBalance-(t.goldVal||GOLD_PER_TASK));updateGoldDisplay();
    revokeStatProgress(t);
    // Hapus history hari ini
    if(!t.history)t.history=[];
    var hi=t.history.indexOf(todayStr);if(hi>=0)t.history.splice(hi,1);
    // Undo shopping
    if(t.isShopping&&t.price&&t.walletId){
      var w=getWalletById(t.walletId);
      for(var i=finTransactions.length-1;i>=0;i--){
        if(finTransactions[i].note==='Task: '+t.name&&finTransactions[i].type==='expense'){
          if(w)w.balance+=t.price;finTransactions.splice(i,1);break;
        }
      }
    }
    showToast('↩️ Task dibuka kembali');
    checkAchievements();saveData(true);render();
    return;
  }

  // Task dengan due masa depan tidak bisa dicentang
  if(!t.done&&t.due&&t.due>todayStr){showToast('⏳ Task ini baru bisa diselesaikan pada '+fmt(t.due));return;}

  var _wasChecked=!t.done;
  var effectiveDoneDate=(t.due&&t.due<todayStr)?t.due:todayStr;
  t.done=!t.done;

  // Sholat Jumat: saat dicentang, otomatis centang Dzuhur juga (dan sebaliknya)
  if(t.name === '🕌 Sholat Jumat') {
    var dzuhurTask = tasks.filter(function(x){ return x.name === '☀️ Sholat Dzuhur'; })[0];
    if(dzuhurTask && dzuhurTask.done !== t.done) {
      dzuhurTask.done = t.done;
      dzuhurTask.doneDate = t.done ? effectiveDoneDate : null;
      if(t.done) {
        if(!dzuhurTask.history) dzuhurTask.history = [];
        if(dzuhurTask.history.indexOf(effectiveDoneDate) < 0) dzuhurTask.history.push(effectiveDoneDate);
      } else {
        if(dzuhurTask.history) {
          var _dhi = dzuhurTask.history.indexOf(effectiveDoneDate);
          if(_dhi >= 0) dzuhurTask.history.splice(_dhi, 1);
        }
      }
    }
  }

  if(t.done){
    t.doneDate=effectiveDoneDate;totalDone++;
    var _alreadyRewarded=t.history&&(t.history.indexOf(todayStr)>=0||t.history.indexOf(effectiveDoneDate)>=0);
    if(!_alreadyRewarded){
      var xpGain=getTaskXP(t);addXP(xpGain,'+'+xpGain);
      var goldGain=t.goldVal||GOLD_PER_TASK;addGold(goldGain);
    }
    awardStatProgress(t);triggerCompletionEffect();
    // Repeat: simpan _nextDue, task tetap done=true tampil di Selesai
    // _nextDue dipakai oleh: view Terjadwal (preview next cycle) & processRepeatReset (besok pagi)
    if(t.repeat){
      var nextDue=calcNextDue(t,effectiveDoneDate);
      if(nextDue) t._nextDue=nextDue;
    }
    // Shopping
    if(t.isShopping&&t.price&&t.walletId){
      var w=getWalletById(t.walletId);
      if(w){
        w.balance-=t.price;
        finTransactions.push({id:'tx'+finNextId++,type:'expense',amount:t.price,category:'Belanja',walletId:t.walletId,date:effectiveDoneDate,note:'Task: '+t.name});
        showToast('✅ Selesai & '+fmtRp(t.price)+' dikurangi dari '+w.name);
      }
    }
    var myDayTasks=tasks.filter(function(x){return x.myday||x.due===todayStr;});
    if(myDayTasks.length&&myDayTasks.every(function(x){return x.done||(x._nextDue&&x.history&&x.history.indexOf(todayStr)>=0);})){perfectDays++;showToast('✨ Hari Sempurna! Semua task selesai!');}
  } else {
    // Uncheck task biasa (non-repeat atau repeat tanpa _nextDue)
    t.doneDate=null;totalDone=Math.max(0,totalDone-1);
    xp=Math.max(0,xp-getTaskXP(t));updateXPBar();
    goldBalance=Math.max(0,goldBalance-(t.goldVal||GOLD_PER_TASK));updateGoldDisplay();
    revokeStatProgress(t);
    delete t._nextDue;
    t.myday=(t.due===todayStr||!t.due);
    if(t.steps)t.stepsDone=0;
    if(t.isShopping&&t.price&&t.walletId){
      var w=getWalletById(t.walletId);
      var matchTx=null;
      for(var i=finTransactions.length-1;i>=0;i--){
        if(finTransactions[i].note==='Task: '+t.name&&finTransactions[i].type==='expense'){matchTx=i;break;}
      }
      if(matchTx!==null){if(w)w.balance+=t.price;finTransactions.splice(matchTx,1);}
    }
  }
  if(!t.history)t.history=[];
  if(_wasChecked){
    // Fix: catat history di effectiveDoneDate (tanggal due asli), bukan hanya todayStr
    var _histDate = effectiveDoneDate || todayStr;
    if(t.history.indexOf(_histDate)<0) t.history.push(_histDate);
    if(_histDate !== todayStr && t.history.indexOf(todayStr)<0) t.history.push(todayStr);
  } else {
    var hidx=t.history.indexOf(todayStr);if(hidx>=0)t.history.splice(hidx,1);
    if(effectiveDoneDate && effectiveDoneDate!==todayStr){var hidx2=t.history.indexOf(effectiveDoneDate);if(hidx2>=0)t.history.splice(hidx2,1);}
  }
  if(_wasChecked){
    if(t.type==='Habit')showToast('🔥 Habit selesai! Streak terjaga!');
    else if(t.repeat)showToast('✅ Selesai! Terjadwal lagi '+fmt(t._nextDue||'')+ ' 🔄');
    else if(!t.isShopping||!t.price)showToast('Task selesai! ✅');
  } else {
    showToast('↩️ Task dibuka kembali');
  }
  checkAchievements();saveData(true);render();
}

function toggleStep(id,idx){
  var t=tasks.filter(function(x){return x.id===id;})[0];if(!t||!t.steps)return;
  if(!t.stepsDone)t.stepsDone=0;
  var wasDone=t.done;
  if(idx==='all'){t.stepsDone=(t.stepsDone>=t.steps)?0:t.steps;}
  else{idx=parseInt(idx);t.stepsDone=(idx<t.stepsDone)?idx:idx+1;}
  t.done=(t.stepsDone>=t.steps);
  if(t.done&&!wasDone){
    // FIX OVERDUE: doneDate & repeat base = due asli jika overdue
    var effDate=(t.due&&t.due<todayStr)?t.due:todayStr;
    t.doneDate=effDate;totalDone++;
    // Hanya beri XP & Gold kalau belum pernah selesai sebelumnya (cegah double reward)
    var _stepAlreadyRewarded=t.history&&(t.history.indexOf(todayStr)>=0||t.history.indexOf(effDate)>=0);
    if(!_stepAlreadyRewarded){addXP(getTaskXP(t));var gg=t.goldVal||GOLD_PER_TASK;addGold(gg);}
    awardStatProgress(t);triggerCompletionEffect();
    if(t.repeat){
      var nd=calcNextDue(t,effDate);
      if(nd){
        t._nextDue=nd;
        // task tetap done=true, tampil di Selesai
        if(!t.history)t.history=[];
        if(t.history.indexOf(todayStr)<0)t.history.push(todayStr);
      }
    }
  }
  else if(!t.done&&wasDone){
    t.doneDate=null;totalDone=Math.max(0,totalDone-1);
    xp=Math.max(0,xp-getTaskXP(t));updateXPBar();
    // Kembalikan gold saat step task dibuka kembali
    goldBalance=Math.max(0,goldBalance-(t.goldVal||GOLD_PER_TASK));updateGoldDisplay();
    revokeStatProgress(t);
    // Undo repeat: hapus _nextDue, kembalikan due hari ini
    if(t.repeat&&t._nextDue){ delete t._nextDue; t.due=todayStr; }
    // _prevDue sudah tidak dipakai, _nextDue handles repeat
    if(t.due&&t.due<todayStr)t.due=todayStr;
    t.myday=(t.due===todayStr||!t.due);
    t.stepsDone=0;
  }
  if(!t.history)t.history=[];
  // Catat history hari ini kalau selesai (termasuk repeat dengan _nextDue)
  if(t.done || t._nextDue){
    if(t.history.indexOf(todayStr)<0) t.history.push(todayStr);
  } else {
    // Uncheck: hapus history hari ini
    var hi=t.history.indexOf(todayStr); if(hi>=0) t.history.splice(hi,1);
  }
  showToast(t.done?'Semua langkah selesai! ✅':t.stepsDone+'/'+t.steps+' langkah ✓');
  checkAchievements();saveData(true);render();
}

function toggleImportant(id){
  var t=tasks.filter(function(x){return x.id===id;})[0];if(!t)return;
  t.important=!t.important;
  showToast(t.important?'Ditandai penting ★':'Dihapus dari penting');
  saveData(true);render();
}

function toggleHabitDay(id,dateStr){
  var t=tasks.filter(function(x){return x.id===id;})[0];if(!t)return;
  if(!t.history)t.history=[];
  var idx=t.history.indexOf(dateStr);
  if(idx>=0)t.history.splice(idx,1);else t.history.push(dateStr);
  if(dateStr===todayStr&&!(t.steps&&t.steps>=2))t.done=t.history.indexOf(todayStr)>=0;
  // Persist streak setelah perubahan agar achievement comparison konsisten
  t.lastKnownStreak=calcStreak(t);
  saveData(true);render();
}

function toggleSubtask(taskId,subId){
  var t=tasks.filter(function(x){return x.id===taskId;})[0];if(!t||!t.subtasks)return;
  if(t.due&&t.due>todayStr&&!t._nextDue){showToast('⏳ Task ini baru bisa diselesaikan pada '+fmt(t.due));return;}
  var s=t.subtasks.filter(function(x){return x.id===subId;})[0];if(!s)return;
  s.done=!s.done;
  if(s.done){totalSubtasks++;addXP(XP_PER_SUBTASK,'+'+XP_PER_SUBTASK);}
  else{totalSubtasks=Math.max(0,totalSubtasks-1);}
  checkAchievements();saveData(true);render();
}

// ═══════════════════════════════════════════════════════
// NATURAL LANGUAGE INPUT PARSER
// Contoh: "beli susu besok jam 8" → task + due date + reminder
// ═══════════════════════════════════════════════════════
function nlpParseTask(raw) {
  var text = raw;
  var result = { name: raw, due: '', reminder: '', nlpHints: [] };
  var today = new Date(); today.setHours(0,0,0,0);

  // ── NEW: Detect REPEAT pattern FIRST ──
  // PRIORITAS: Pattern yang lebih spesifik dulu

  // ── DAILY: "setiap hari", "tiap hari", "sehari sekali", "harian" ──
  var _dailyMatch = text.match(/\b(?:setiap\s+hari|tiap\s+hari|sehari\s+sekali|setiap\s+harinya|harian)\b/i);
  if (_dailyMatch) {
    result.repeat = 'Harian';
    result.nlpHints.push('🔁 Harian');
    if (!result.due) result.due = (function(){ var d=new Date(); d.setHours(0,0,0,0); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); })();
    text = text.replace(_dailyMatch[0], '').trim();
  }

  var repeatMatch = null;

  // ── WEEKLY: hanya jika belum match daily ──
  if (!result.repeat) {
    // Pattern 1: "seminggu sekali tiap/setiap hari X"
    repeatMatch = text.match(/\b(?:se)?minggu\s+sekali\s+(?:tiap|setiap|pada|di)?\s*(?:hari\s+)?(senin|selasa|rabu|kamis|jumat|sabtu|minggu)\b/i);
    // Pattern 2: "setiap minggu hari X"
    if (!repeatMatch) repeatMatch = text.match(/\bsetiap\s+minggu\s+(?:hari\s+)?(senin|selasa|rabu|kamis|jumat|sabtu|minggu)\b/i);
    // Pattern 3: "tiap minggu hari X"
    if (!repeatMatch) repeatMatch = text.match(/\btiap\s+minggu\s+(?:hari\s+)?(senin|selasa|rabu|kamis|jumat|sabtu|minggu)\b/i);

    if (repeatMatch) {
      var dayName = repeatMatch[1].toLowerCase();
      var _dowMap = {minggu:0,senin:1,selasa:2,rabu:3,kamis:4,jumat:5,sabtu:6};
      var targetDay = _dowMap[dayName];
      result.repeat = 'Mingguan';
      result.nlpHints.push('🔁 Mingguan');
      var d = new Date(today);
      var cur = d.getDay();
      var diff = (targetDay - cur + 7) % 7;
      if (diff === 0) diff = 7;
      d.setDate(d.getDate() + diff);
      result.due = _nlpDateStr(d);
      var dayDisplay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
      result.nlpHints.push('📅 ' + dayDisplay);
      text = text.replace(repeatMatch[0], '').trim();
    } else {
      // Pattern 4: "setiap minggu" / "tiap minggu" / "seminggu sekali" tanpa nama hari
      var _weeklyMatch = text.match(/\b(?:setiap\s+minggu|tiap\s+minggu|seminggu\s+sekali)\b/i);
      if (_weeklyMatch) {
        result.repeat = 'Mingguan';
        result.nlpHints.push('🔁 Mingguan');
        text = text.replace(_weeklyMatch[0], '').trim();
      }
    }
  }

  // ── MONTHLY ──
  if (!result.repeat) {
    var _monthlyMatch = text.match(/\b(?:setiap\s+bulan|tiap\s+bulan|sebulan\s+sekali|bulanan)\b/i);
    if (_monthlyMatch) {
      result.repeat = 'Bulanan';
      result.nlpHints.push('🔁 Bulanan');
      text = text.replace(_monthlyMatch[0], '').trim();
    }
  }

  // ── 1. Parse TIME ──
  // "jam 8", "jam 08:30", "jam 8 pagi", "jam 9 malam", "pukul 10", "09.00", "@08:00"
  var timePatterns = [
    /\bjam\s+(\d{1,2})(?:[:\.](\d{2}))?\s*(pagi|siang|sore|malam)?\b/i,
    /\bpukul\s+(\d{1,2})(?:[:\.](\d{2}))?\s*(pagi|siang|sore|malam)?\b/i,
    /@(\d{1,2})(?::(\d{2}))?\s*(pagi|siang|sore|malam)?\b/i,
    /\b(\d{1,2})[:\.](\d{2})\s*(pagi|siang|sore|malam)?\b/i
  ];
  var parsedHour = -1, parsedMin = 0;
  for (var tp = 0; tp < timePatterns.length; tp++) {
    var tm = text.match(timePatterns[tp]);
    if (tm) {
      parsedHour = parseInt(tm[1]);
      parsedMin = tm[2] ? parseInt(tm[2]) : 0;
      var period = (tm[3] || '').toLowerCase();
      if (period === 'malam' || period === 'sore') { if (parsedHour < 12) parsedHour += 12; }
      else if (period === 'pagi') { if (parsedHour === 12) parsedHour = 0; }
      else {
        // Heuristic: jam 1-6 tanpa keterangan → anggap siang/sore jika > 6
        if (parsedHour >= 1 && parsedHour <= 6) parsedHour += 12;
      }
      text = text.replace(tm[0], '').trim();
      result.reminder = String(parsedHour).padStart(2,'0') + ':' + String(parsedMin).padStart(2,'0');
      result.nlpHints.push('⏰ ' + String(parsedHour % 12 || 12).padStart(2,'0') + ':' + String(parsedMin).padStart(2,'0') + (parsedHour >= 12 ? ' PM' : ' AM'));
      break;
    }
  }

  // ── 2. Parse DATE (only if not already set by repeat) ──
  if (!result.due) {
    var datePatterns = [
      // Hari spesifik
      { re: /\bhari\s+ini\b/i, fn: function() { return _nlpOffset(0); } },
      { re: /\bsekarang\b/i, fn: function() { return _nlpOffset(0); } },
      { re: /\bbesok\b/i, fn: function() { return _nlpOffset(1); } },
      { re: /\blusa\b/i, fn: function() { return _nlpOffset(2); } },
      { re: /\btumben\b/i, fn: function() { return null; } },
      // "minggu depan"
      { re: /\bminggu\s+depan\b/i, fn: function() { return _nlpOffset(7); } },
      // "bulan depan"
      { re: /\bbulan\s+depan\b/i, fn: function() {
        var d = new Date(today); d.setMonth(d.getMonth()+1); return _nlpDateStr(d);
      }},
      // "tanggal 15", "tgl 5"
      { re: /\b(?:tanggal|tgl)\s+(\d{1,2})\b/i, fn: function(m) {
        var d = new Date(today); d.setDate(parseInt(m[1]));
        if (d < today) d.setMonth(d.getMonth()+1);
        return _nlpDateStr(d);
      }},
      // "15 april", "5 mei"
      { re: /\b(\d{1,2})\s+(jan(?:uari)?|feb(?:ruari)?|mar(?:et)?|apr(?:il)?|mei|jun(?:i)?|jul(?:i)?|agu(?:stus)?|sep(?:tember)?|okt(?:ober)?|nov(?:ember)?|des(?:ember)?)\b/i, fn: function(m) {
        var months = {jan:0,feb:1,mar:2,apr:3,mei:4,jun:5,jul:6,agu:7,sep:8,okt:9,nov:10,des:11};
        var key = m[2].slice(0,3).toLowerCase();
        var d = new Date(today.getFullYear(), months[key], parseInt(m[1]));
        if (d < today) d.setFullYear(d.getFullYear()+1);
        return _nlpDateStr(d);
      }},
      // Nama hari: "senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"
      { re: /\b(senin|selasa|rabu|kamis|jumat|sabtu|minggu)\b/i, fn: function(m) {
        var days = {minggu:0,senin:1,selasa:2,rabu:3,kamis:4,jumat:5,sabtu:6};
        var target = days[m[1].toLowerCase()];
        var d = new Date(today); var cur = d.getDay();
        var diff = (target - cur + 7) % 7 || 7;
        d.setDate(d.getDate() + diff);
        return _nlpDateStr(d);
      }},
      // "2 hari lagi", "3 hari ke depan"
      { re: /\b(\d+)\s+hari\s+(?:lagi|ke\s*depan)\b/i, fn: function(m) { return _nlpOffset(parseInt(m[1])); } },
      // "2 minggu lagi"
      { re: /\b(\d+)\s+minggu\s+lagi\b/i, fn: function(m) { return _nlpOffset(parseInt(m[1])*7); } },
    ];

    for (var dp = 0; dp < datePatterns.length; dp++) {
      var dm = text.match(datePatterns[dp].re);
      if (dm) {
        var dateVal = datePatterns[dp].fn(dm);
        if (dateVal) {
          result.due = dateVal;
          // Friendly label
          var dd = new Date(dateVal + 'T00:00:00');
          var diff2 = Math.round((dd - today) / 86400000);
          var lbl = diff2 === 0 ? 'Hari ini' : diff2 === 1 ? 'Besok' : diff2 === 2 ? 'Lusa' : dateVal;
          result.nlpHints.push('📅 ' + lbl);
        }
        text = text.replace(dm[0], '').trim();
        break;
      }
    }
  }

  // ── 3. Detect important keywords ──
  if (/\b(penting|urgent|segera|asap|prioritas)\b/i.test(text)) {
    result.important = true;
    text = text.replace(/\b(penting|urgent|segera|asap|prioritas)\b/gi, '').trim();
    result.nlpHints.push('⭐ Penting');
  }
  // ── 4. Clean up extra spaces/punctuation ──
  result.name = text.replace(/\s{2,}/g,' ').replace(/[,\-–]+$/,'').trim() || raw;
  return result;
}
function _nlpOffset(n) {
  var d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()+n);
  return _nlpDateStr(d);
}
function _nlpDateStr(d) {
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

// NLP Preview: tampil di bawah input saat user mengetik
var _nlpPreviewTimer = null;
function nlpInputChange(val) {
  clearTimeout(_nlpPreviewTimer);
  _nlpPreviewTimer = setTimeout(function() {
    nlpShowPreview(val);
  }, 300);
}
function nlpShowPreview(val) {
  var previewEl = document.getElementById('nlpPreview');
  if (!previewEl) return;
  if (!val || val.length < 4) { previewEl.style.display='none'; return; }
  var p = nlpParseTask(val);
  if (!p.nlpHints || !p.nlpHints.length) { previewEl.style.display='none'; return; }
  previewEl.innerHTML = '<span style="color:var(--muted);font-size:11px">✨ Terdeteksi: </span>'
    + p.nlpHints.map(function(h){ return '<span style="background:var(--pill);border:1px solid var(--border);border-radius:10px;padding:2px 8px;font-size:11px;font-weight:600;color:var(--accent)">' + h + '</span>'; }).join(' ');
  previewEl.style.display = 'flex';
}
function nlpApplyAndAdd(inputId, addFn) {
  var inp = document.getElementById(inputId);
  if (!inp) return;
  var raw = inp.value.trim();
  if (!raw) { showToast('Ketik nama task dulu 😊'); return; }
  var p = nlpParseTask(raw);
  // Apply parsed name
  inp.value = p.name;
  // Also sync to main taskInput if this is mobile/sqa input
  var mainInp = document.getElementById('taskInput');
  if (mainInp && inputId !== 'taskInput') mainInp.value = p.name;
  // Apply due date if not already set
  if (p.due) {
    var dueEls = ['chip-due', 'mchip-due'];
    dueEls.forEach(function(id) {
      var el = document.getElementById(id);
      if (el && !el.value) {
        el.value = p.due;
        taskbarDateUpdateLabel(id, p.due);
      }
    });
  }
  // Apply reminder if not already set
  if (p.reminder) {
    var remEls = ['chip-reminder', 'mchip-reminder'];
    remEls.forEach(function(id) {
      var el = document.getElementById(id);
      if (el && !el.value) {
        el.value = p.reminder;
        taskbarReminderUpdateLabel(id, p.reminder);
      }
    });
  }
  // Apply repeat if detected
  if (p.repeat) {
    ['chip-repeat', 'mchip-repeat', 'sqa-repeat'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el && !el.value) {
        el.value = p.repeat;
        // Trigger onchange so any dependent UI updates (e.g. handleRepeatChange)
        if (typeof handleRepeatChange === 'function') handleRepeatChange(el);
      }
    });
  }
  // Apply important flag
  if (p.important && !chipState.important) {
    chipState.important = true;
    var ci = document.getElementById('chip-important'); if(ci) ci.classList.add('active');
    var mi = document.getElementById('mchip-important'); if(mi) mi.classList.add('active');
  }
  // Hide preview
  var prev = document.getElementById('nlpPreview');
  if (prev) prev.style.display = 'none';
  var prevM = document.getElementById('nlpPreviewMobile');
  if (prevM) prevM.style.display = 'none';
  // Call original add function
  addFn();
}

function addTask(){
  var inp=document.getElementById('taskInput'),name=inp.value.trim();
  if(!name){showToast('Ketik nama task dulu 😊');return;}
  var isHabit=chipState.habit,isImp=chipState.important,isShopping=chipState.shopping,nodue=chipState.nodue;
  var repeat=document.getElementById('chip-repeat').value;
  if(repeat==='__custom__'||repeat==='__daily_except__')repeat='';
  var group=document.getElementById('chip-group').value;
  // Auto-set group to Belanja when shopping is active
  if(isShopping)group='Belanja';
  var due=nodue?'':(document.getElementById('chip-due').value||todayStr);
  var reminder=document.getElementById('chip-reminder').value||'';
  var stepsEl=document.getElementById('chip-steps');
  var stepsVal=stepsEl?(parseInt(stepsEl.value)||0):0;
  var steps=stepsVal>=2?stepsVal:undefined;
  var color=chipState.color||'';
  var xpInput=document.getElementById('chip-xp');
  var xpVal=xpInput?(parseInt(xpInput.value)||0):0;
  // Auto-reward berdasarkan grup jika user belum set manual
  var _gr=getGroupReward(group,isHabit);
  if(!xpVal)xpVal=_gr.xp;
  var goldInput=document.getElementById('chip-gold');
  var goldVal=goldInput?(parseInt(goldInput.value)||0):0;
  if(!goldVal)goldVal=_gr.gold;
  var isPomo=chipState.pomo;
  var newTask={id:nextId++,name:name,type:isHabit?'Habit':'Task',repeat:repeat,due:due,done:false,important:isImp,myday:true,note:'',group:group,history:[],color:color,subtasks:[],reminder:reminder,xpVal:xpVal,goldVal:goldVal,isShopping:isShopping||false,pomo:isPomo||false};
  if(isShopping){newTask.price=chipState.shoppingPrice||0;newTask.walletId=chipState.shoppingWalletId||(defaultShoppingWalletId||'');}
  if(steps){newTask.steps=steps;newTask.stepsDone=0;}
  tasks.unshift(newTask);
  inp.value='';chipState={habit:false,important:false,shopping:false,nodue:false,pomo:false,color:'',shoppingPrice:0,shoppingWalletId:''};
  ['chip-habit','chip-important','chip-shopping','chip-nodue','chip-pomo'].forEach(function(id){var el=document.getElementById(id);if(el)el.classList.remove('active');});
  ['mchip-habit','mchip-important','mchip-shopping','mchip-nodue','mchip-pomo'].forEach(function(id){var el=document.getElementById(id);if(el)el.classList.remove('active');});
  ['sqachip-pomo'].forEach(function(id){var el=document.getElementById(id);if(el)el.classList.remove('active');});
  document.getElementById('chip-repeat').value='';
  document.getElementById('chip-group').value='';
  document.getElementById('chip-due').value='';
  taskbarDateUpdateLabel('chip-due','');
  document.getElementById('chip-reminder').value='';
  taskbarReminderUpdateLabel('chip-reminder','');
  if(xpInput)xpInput.value='';
  if(goldInput)goldInput.value='';
  buildColorPicker('colorPicker','chipColor',chipState,'color');
  showToast('Ditambahkan! ✨');scheduleReminders();saveData(true);render();
  // Sync ke Google Calendar kalau ada due date
  if(_gcalEnabled && newTask.due) gcalCreateEvent(newTask);
}

function toggleChip(c){
  chipState[c]=!chipState[c];
  var dEl=document.getElementById('chip-'+c);
  if(dEl)dEl.classList.toggle('active',chipState[c]);
  var mEl=document.getElementById('mchip-'+c);
  if(mEl)mEl.classList.toggle('active',chipState[c]);
  // Buka popup setting belanja saat diaktifkan
  if(c==='shopping'){
    if(chipState.shopping) openShoppingQuick();
    else closeShoppingQuick();
  }
}

function openShoppingQuick(){
  var overlay=document.getElementById('shoppingQuickOverlay');
  var modal=document.getElementById('shoppingQuickModal');
  if(!overlay||!modal)return;

  // ── Reset all taskbar state — shopping modal is fully independent ──
  chipState={habit:false,important:false,shopping:false,nodue:false,color:'',shoppingPrice:0,shoppingWalletId:''};
  ['chip-habit','chip-important','chip-shopping','chip-nodue'].forEach(function(id){
    var el=document.getElementById(id);if(el)el.classList.remove('active');
  });
  ['mchip-habit','mchip-important','mchip-shopping','mchip-nodue'].forEach(function(id){
    var el=document.getElementById(id);if(el)el.classList.remove('active');
  });
  ['sqachip-habit','sqachip-important','sqachip-shopping','sqachip-nodue'].forEach(function(id){
    var el=document.getElementById(id);if(el)el.classList.remove('active');
  });
  var chipRepeat=document.getElementById('chip-repeat');if(chipRepeat)chipRepeat.value='';
  var chipGroup=document.getElementById('chip-group');if(chipGroup)chipGroup.value='';
  var chipDue=document.getElementById('chip-due');if(chipDue)chipDue.value='';
  taskbarDateUpdateLabel('chip-due','');
  var chipReminder=document.getElementById('chip-reminder');if(chipReminder)chipReminder.value='';
  taskbarReminderUpdateLabel('chip-reminder','');
  var mchipRepeat=document.getElementById('mchip-repeat');if(mchipRepeat)mchipRepeat.value='';
  var mchipGroup=document.getElementById('mchip-group');if(mchipGroup)mchipGroup.value='';
  var mchipDue=document.getElementById('mchip-due');if(mchipDue)mchipDue.value='';
  taskbarDateUpdateLabel('mchip-due','');

  // ── Reset modal fields ──
  var nameEl=document.getElementById('sqTaskName');
  if(nameEl)nameEl.value='';
  var priceEl=document.getElementById('sqPrice');
  if(priceEl)priceEl.value='';
  var noteEl=document.getElementById('sqNote');
  if(noteEl)noteEl.value='';
  var saveChk=document.getElementById('sqSaveItem');
  if(saveChk)saveChk.checked=false;
  sqCloseDropdown();

  // ── Populate wallet select ──
  var sel=document.getElementById('sqWallet');
  if(sel) sel.innerHTML=buildWalletOpts('', true);
  var hint=document.getElementById('sqDefaultWalletHint');
  if(hint) hint.style.display=(defaultShoppingWalletId&&finWallets.some(function(w){return w.id===defaultShoppingWalletId;}))?'block':'none';

  overlay.style.display='block';
  modal.style.display='block';
  setTimeout(function(){var n=document.getElementById('sqTaskName');if(n)n.focus();},80);
}

function closeShoppingQuick(){
  var overlay=document.getElementById('shoppingQuickOverlay');
  var modal=document.getElementById('shoppingQuickModal');
  if(overlay)overlay.style.display='none';
  if(modal)modal.style.display='none';
}

function confirmShoppingQuick(){
  // ── Get values from modal ──
  var nameEl=document.getElementById('sqTaskName');
  var name=(nameEl?nameEl.value.trim():'');
  if(!name){showToast('Ketik nama barang dulu 😊');if(nameEl)nameEl.focus();return;}

  var price=getRawVal(document.getElementById('sqPrice'))||0;
  var walletId=document.getElementById('sqWallet').value;
  var noteEl=document.getElementById('sqNote');
  var note=(noteEl?noteEl.value.trim():'');

  // ── Optionally save item to shopping list ──
  var saveChk=document.getElementById('sqSaveItem');
  if(saveChk&&saveChk.checked&&price>0){
    var exists=shoppingItems.some(function(s){return s.name.toLowerCase()===name.toLowerCase();});
    if(!exists){
      shoppingItems.push({id:shoppingItemNextId++,name:name,price:price});
      shoppingItems.sort(function(a,b){return a.name.localeCompare(b.name,'id');});
    }
  }

  // ── Create the task directly ──
  var newTask={
    id:nextId++, name:name, type:'Task', repeat:'', due:todayStr,
    done:false, important:false, myday:true, note:note,
    group:'Belanja', history:[], color:'', subtasks:[], reminder:'',
    xpVal:XP_PER_TASK, goldVal:GOLD_PER_TASK,
    isShopping:true, price:price, walletId:walletId
  };
  tasks.unshift(newTask);

  sqCloseDropdown();
  closeShoppingQuick();
  showToast('🛒 '+name+' ditambahkan!');
  scheduleReminders();
  saveData(true);
  render();
  if(_gcalEnabled && newTask.due) gcalCreateEvent(newTask);
}



// ── Shopping Items Search / Autocomplete ──
function sqSearchItems(q){
  var dropdown=document.getElementById('sqItemDropdown');
  if(!dropdown)return;
  q=(q||'').trim().toLowerCase();
  if(!q||!shoppingItems.length){dropdown.style.display='none';return;}
  var matches=shoppingItems.filter(function(s){return s.name.toLowerCase().indexOf(q)>=0;});
  if(!matches.length){dropdown.style.display='none';return;}
  dropdown.style.display='block';
  dropdown.innerHTML=matches.map(function(s){
    return '<div onclick="sqSelectItem('+s.id+')" style="padding:9px 12px;cursor:pointer;font-size:13px;color:var(--text);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:8px" onmouseover="this.style.background=\'var(--hover)\'" onmouseout="this.style.background=\'\'">'
      +'<span>'+s.name+'</span>'
      +'<span style="font-size:11px;font-weight:700;color:var(--accent);font-family:\'DM Mono\',monospace">'+fmtRp(s.price)+'</span>'
      +'</div>';
  }).join('');
}
function sqSelectItem(id){
  var item=shoppingItems.filter(function(s){return s.id===id;})[0];
  if(!item)return;
  var nameEl=document.getElementById('sqTaskName');
  if(nameEl)nameEl.value=item.name;
  var priceEl=document.getElementById('sqPrice');
  if(priceEl){priceEl.value=item.price;}
  sqCloseDropdown();
}
function sqCloseDropdown(){
  var d=document.getElementById('sqItemDropdown');
  if(d)d.style.display='none';
}

// ── Shopping Items Manager ──
function openShoppingItemsModal(){
  var ov=document.getElementById('shoppingItemsOverlay');
  var md=document.getElementById('shoppingItemsModal');
  if(ov){ov.style.display='flex';}
  if(md){md.style.display='flex';}
  renderShoppingItemsList();
}
function closeShoppingItemsModal(){
  var ov=document.getElementById('shoppingItemsOverlay');
  var md=document.getElementById('shoppingItemsModal');
  if(ov)ov.style.display='none';
  if(md)md.style.display='none';
}
function renderShoppingItemsList(){
  var wrap=document.getElementById('shoppingItemsList');
  if(!wrap)return;
  if(!shoppingItems.length){
    wrap.innerHTML='<div style="text-align:center;padding:30px 10px;color:var(--muted);font-size:13px"><div style="font-size:32px;margin-bottom:8px">🛒</div>Belum ada item tersimpan.<br>Tambah item baru di atas!</div>';
    return;
  }
  var sorted=[].concat(shoppingItems).sort(function(a,b){return a.name.localeCompare(b.name,'id');});
  wrap.innerHTML=sorted.map(function(s){
    return '<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border)" id="sim-row-'+s.id+'">'
      +'<div style="flex:1;min-width:0">'
      +'<div style="font-size:13px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis" id="sim-name-display-'+s.id+'">'+s.name+'</div>'
      +'<div style="font-size:11px;color:var(--accent);font-family:\'DM Mono\',monospace;font-weight:700" id="sim-price-display-'+s.id+'">'+fmtRp(s.price)+'</div>'
      +'</div>'
      +'<button onclick="editShoppingItem('+s.id+')" style="border:none;background:var(--bg);border:1px solid var(--border);border-radius:7px;padding:5px 10px;font-size:11px;cursor:pointer;color:var(--muted);font-family:\'DM Sans\',sans-serif">✏️ Edit</button>'
      +'<button onclick="deleteShoppingItem('+s.id+')" style="border:none;background:rgba(239,68,68,0.1);border-radius:7px;padding:5px 10px;font-size:11px;cursor:pointer;color:#dc2626;font-family:\'DM Sans\',sans-serif">🗑</button>'
      +'</div>';
  }).join('');
}
function addShoppingItem(){
  var nameEl=document.getElementById('sim-name');
  var priceEl=document.getElementById('sim-price');
  if(!nameEl||!priceEl)return;
  var name=nameEl.value.trim();
  var price=parseFloat(priceEl.value)||0;
  if(!name){showToast('Masukkan nama barang!');return;}
  var exists=shoppingItems.some(function(s){return s.name.toLowerCase()===name.toLowerCase();});
  if(exists){showToast('Item sudah ada!');return;}
  shoppingItems.push({id:shoppingItemNextId++,name:name,price:price});
  nameEl.value='';priceEl.value='';
  showToast('Item "'+name+'" ditambahkan ✅');
  saveData(true);renderShoppingItemsList();
}
function editShoppingItem(id){
  var item=shoppingItems.filter(function(s){return s.id===id;})[0];
  if(!item)return;
  var row=document.getElementById('sim-row-'+id);
  if(!row)return;
  row.innerHTML='<div style="flex:1;display:flex;gap:6px;align-items:center">'
    +'<input type="text" id="sim-edit-name-'+id+'" value="'+item.name.replace(/"/g,'&quot;')+'" style="flex:2;border:1px solid var(--border);border-radius:6px;padding:5px 8px;font-size:12px;font-family:\'DM Sans\',sans-serif;color:var(--text);background:var(--bg);outline:none">'
    +'<input type="number" id="sim-edit-price-'+id+'" value="'+item.price+'" min="0" style="flex:1;border:1px solid var(--border);border-radius:6px;padding:5px 8px;font-size:12px;font-family:\'DM Sans\',sans-serif;color:var(--text);background:var(--bg);outline:none">'
    +'</div>'
    +'<button onclick="saveShoppingItem('+id+')" style="border:none;background:var(--accent);border-radius:7px;padding:5px 12px;font-size:11px;cursor:pointer;color:#fff;font-family:\'DM Sans\',sans-serif;font-weight:700">Simpan</button>'
    +'<button onclick="renderShoppingItemsList()" style="border:none;background:var(--bg);border:1px solid var(--border);border-radius:7px;padding:5px 10px;font-size:11px;cursor:pointer;color:var(--muted);font-family:\'DM Sans\',sans-serif">Batal</button>';
}
function saveShoppingItem(id){
  var nameEl=document.getElementById('sim-edit-name-'+id);
  var priceEl=document.getElementById('sim-edit-price-'+id);
  if(!nameEl||!priceEl)return;
  var name=nameEl.value.trim();
  var price=parseFloat(priceEl.value)||0;
  if(!name){showToast('Nama tidak boleh kosong!');return;}
  var item=shoppingItems.filter(function(s){return s.id===id;})[0];
  if(item){item.name=name;item.price=price;}
  showToast('Item diperbarui ✅');
  saveData(true);renderShoppingItemsList();
}
function deleteShoppingItem(id){
  shoppingItems=shoppingItems.filter(function(s){return s.id!==id;});
  showToast('Item dihapus');
  saveData(true);renderShoppingItemsList();
}

// ══════════════════════════════════════════════
// DETAIL PANEL
// ══════════════════════════════════════════════
function refreshWalletSelect(){
  var sel=document.getElementById('det-wallet');if(!sel)return;
  var cur=selectedTask?selectedTask.walletId||'':'';
  // Jika task belanja baru (belum ada wallet), pakai default
  var forceNoDefault=(cur!=='');
  if(!cur && selectedTask && selectedTask.isShopping) cur=''; // akan auto-default via buildWalletOpts
  sel.innerHTML=buildWalletOpts(cur,forceNoDefault);
}

function openDetail(id){
  selectedTask=tasks.filter(function(t){return t.id===id;})[0];if(!selectedTask)return;
  if(!selectedTask.subtasks)selectedTask.subtasks=[];
  document.getElementById('detTitle').textContent=selectedTask.name;
  document.getElementById('det-name').value=selectedTask.name;
  document.getElementById('det-type').value=selectedTask.type;
  var repSel=document.getElementById('det-repeat');
  var repVal=selectedTask.repeat||'';
  var dailyExceptDiv=document.getElementById('det-repeat-daily-except');
  var dailyExceptInp=document.getElementById('det-repeat-daily-except-val');
  var custDiv=document.getElementById('det-repeat-custom');
  if(custDiv)custDiv.style.display='none';
  if(dailyExceptDiv)dailyExceptDiv.style.display='none';
  if(repVal&&repVal.indexOf('Harian kecuali ')===0){
    // Harian kecuali X — insert option if not present, show input
    var exists=false;for(var i=0;i<repSel.options.length;i++){if(repSel.options[i].value===repVal){exists=true;break;}}
    if(!exists){var opt=document.createElement('option');opt.value=repVal;opt.textContent=repVal;var anchor=repSel.querySelector('option[value="__daily_except__"]');repSel.insertBefore(opt,anchor?anchor.nextSibling:repSel.lastElementChild);}
    repSel.value=repVal;
    if(dailyExceptDiv)dailyExceptDiv.style.display='block';
    if(dailyExceptInp)dailyExceptInp.value=repVal.replace('Harian kecuali ','');
  } else {
    var standardRepeats=['','Harian','Tiap 2 Hari','Tiap 3 Hari','Tiap 4 Hari','Tiap 5 Hari','Mingguan','Tiap 2 Minggu','Tiap 3 Minggu','Bulanan','__custom__','__daily_except__'];
    var isCustomVal = repVal && standardRepeats.indexOf(repVal) < 0;
    if (isCustomVal) {
      repSel.value = '__custom__';
      if (custDiv) custDiv.style.display = 'block';
      var cn = 2, cu = 'Hari';
      var cm = repVal.match(/^Tiap (\d+) (Hari|Minggu|Bulan)$/);
      if (cm) { cn = parseInt(cm[1]); cu = cm[2]; }
      else if (repVal === 'Mingguan') { cn = 1; cu = 'Minggu'; }
      else if (repVal === 'Bulanan')  { cn = 1; cu = 'Bulan'; }
      document.getElementById('det-repeat-custom-n').value = cn;
      document.getElementById('det-repeat-custom-unit').value = cu;
      document.getElementById('det-repeat-custom-val').value = repVal;
      var prev = '';
      if (cu==='Hari')   prev = cn===1?'(setiap hari)':'(setiap '+cn+' hari sekali)';
      if (cu==='Minggu') prev = cn===1?'(setiap minggu)':'(setiap '+cn+' minggu sekali)';
      if (cu==='Bulan')  prev = cn===1?'(setiap bulan)':'(setiap '+cn+' bulan sekali)';
      document.getElementById('det-repeat-custom-preview').textContent = prev;
    } else {
      repSel.value = repVal;
    }
  }
  document.getElementById('det-due').value=selectedTask.due||'';
  taskbarDateUpdateLabel('det-due', selectedTask.due||'');
  document.getElementById('det-reminder').value=selectedTask.reminder||'';
  taskbarReminderUpdateLabel('det-reminder', selectedTask.reminder||'');
  document.getElementById('det-myday').value=selectedTask.myday?'true':'false';
  document.getElementById('det-note').value=selectedTask.note||'';
  document.getElementById('det-steps').value=selectedTask.steps||'';
  var _dgrp=getGroupReward(selectedTask.group||'',selectedTask.type==='Habit');
  document.getElementById('det-xp').value=selectedTask.xpVal||_dgrp.xp;
  var detGoldEl=document.getElementById('det-gold');if(detGoldEl)detGoldEl.value=selectedTask.goldVal!=null?selectedTask.goldVal:_dgrp.gold;
  var sp=document.getElementById('det-steps-preview');
  if(sp)sp.textContent=(selectedTask.steps>=2)?(selectedTask.stepsDone||0)+'/'+selectedTask.steps+' selesai':'';
  var dd=document.getElementById('det-due-display');
  if(dd)dd.textContent=selectedTask.due?'('+fmtDate(selectedTask.due)+')':'';
  document.getElementById('det-group-field').style.display='flex';
  // Shopping fields
  var sf=document.getElementById('det-shopping-field');
  if(sf){
    sf.style.display=selectedTask.isShopping?'block':'none';
    document.getElementById('det-price').value=selectedTask.price||'';
    refreshWalletSelect();
  }
  refreshDetailGroups();
  buildDetailColorPicker();
  renderSubtasksPanel();
  document.getElementById('detailPanel').classList.add('open');
  document.getElementById('overlay').classList.add('show');
}

function closeDetail(){
  document.getElementById('detailPanel').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
  selectedTask=null;saveData(true);render();
}

function liveDetail(){
  if(!selectedTask)return;
  selectedTask.name=document.getElementById('det-name').value;
  selectedTask.type=document.getElementById('det-type').value;
  var repSel=document.getElementById('det-repeat');
  var repVal=repSel?repSel.value:'';
  if(repVal==='__custom__'){
    var customEl=document.getElementById('det-repeat-custom-val');
    repVal=customEl?customEl.value.trim():'';
  }
  selectedTask.repeat=repVal;
  selectedTask.due=document.getElementById('det-due').value;
  taskbarDateUpdateLabel('det-due', selectedTask.due||'');
  selectedTask.reminder=document.getElementById('det-reminder').value||'';
  // My Day otomatis: tampil jika due hari ini atau tidak ada due date
  selectedTask.myday = (selectedTask.due === todayStr || !selectedTask.due);
  selectedTask.note=document.getElementById('det-note').value;
  selectedTask.group=document.getElementById('det-group').value;
  var xpRaw=parseInt(document.getElementById('det-xp').value)||0;  if(xpRaw>0)selectedTask.xpVal=xpRaw;
  var goldRaw=parseInt(document.getElementById('det-gold')?document.getElementById('det-gold').value:0)||0;if(goldRaw>=0)selectedTask.goldVal=goldRaw||GOLD_PER_TASK;
  var stepsRaw=parseInt(document.getElementById('det-steps').value)||0;
  var newSteps=stepsRaw>=2?stepsRaw:undefined;
  selectedTask.steps=newSteps;
  selectedTask.stepsDone=Math.min(selectedTask.stepsDone||0,newSteps||0);
  if(!newSteps){delete selectedTask.steps;delete selectedTask.stepsDone;}
  // Shopping
  var sf=document.getElementById('det-shopping-field');
  if(sf){
    sf.style.display=selectedTask.isShopping?'block':'none';
    if(selectedTask.isShopping){
      selectedTask.price=parseFloat(document.getElementById('det-price').value)||0;
      selectedTask.walletId=document.getElementById('det-wallet').value||'';
    }
  }
  var sp=document.getElementById('det-steps-preview');
  if(sp)sp.textContent=selectedTask.steps>=2?(selectedTask.stepsDone||0)+'/'+selectedTask.steps+' selesai':'';
  var dd=document.getElementById('det-due-display');
  if(dd)dd.textContent=selectedTask.due?'('+fmtDate(selectedTask.due)+')':'';
  document.getElementById('detTitle').textContent=selectedTask.name;
  document.getElementById('det-group-field').style.display='flex';
  scheduleReminders();
  // Sync perubahan ke Google Calendar (debounced via saveData timer)
  if(_gcalEnabled && selectedTask.due) {
    clearTimeout(liveDetail._gcalTimer);
    liveDetail._gcalTimer = setTimeout(function(){ gcalUpdateEvent(selectedTask); }, 1500);
  }
}

function renderSubtasksPanel(){
  var wrap=document.getElementById('det-subtasks');if(!wrap||!selectedTask)return;
  if(!selectedTask.subtasks)selectedTask.subtasks=[];
  var html='';
  var isFutureDet=!!(selectedTask.due&&selectedTask.due>todayStr&&!selectedTask._nextDue);
  selectedTask.subtasks.forEach(function(s,i){
    html+='<div style="display:flex;align-items:center;gap:6px;padding:5px 0;border-bottom:1px solid var(--border)">'
      +'<div class="subtask-check'+(s.done?' checked':'')+'" onclick="toggleSubtaskDet('+i+')" style="cursor:'+(isFutureDet?'not-allowed':'pointer')+';opacity:'+(isFutureDet?'0.5':'1')+'">'+(s.done?'✓':'')+'</div>'
      +'<span style="flex:1;font-size:13px;'+(s.done?'text-decoration:line-through;color:var(--muted)':'')+'">'+s.name+'</span>'
      +'<span onclick="removeSubtask('+i+')" style="cursor:pointer;color:var(--muted);font-size:14px;line-height:1">×</span>'
      +'</div>';
  });
  wrap.innerHTML=html;
}

function addSubtask(){
  if(!selectedTask)return;
  var inp=document.getElementById('det-subtask-input');
  var name=inp.value.trim();if(!name)return;
  if(!selectedTask.subtasks)selectedTask.subtasks=[];
  var sid='s'+Date.now();
  selectedTask.subtasks.push({id:sid,name:name,done:false});
  inp.value='';
  renderSubtasksPanel();saveData(true);render();
}

function toggleSubtaskDet(idx){
  if(!selectedTask||!selectedTask.subtasks)return;
  if(selectedTask.due&&selectedTask.due>todayStr&&!selectedTask._nextDue){showToast('⏳ Task ini baru bisa diselesaikan pada '+fmt(selectedTask.due));return;}
  var s=selectedTask.subtasks[idx];if(!s)return;
  s.done=!s.done;
  if(s.done){totalSubtasks++;addXP(XP_PER_SUBTASK,'+'+XP_PER_SUBTASK);}
  else totalSubtasks=Math.max(0,totalSubtasks-1);
  checkAchievements();renderSubtasksPanel();saveData(true);render();
}

function removeSubtask(idx){
  if(!selectedTask||!selectedTask.subtasks)return;
  selectedTask.subtasks.splice(idx,1);
  renderSubtasksPanel();saveData(true);render();
}

function deleteTask(){
  if(!selectedTask)return;
  var name=selectedTask.name;
  var gcalId=selectedTask.gcalEventId||'';
  tasks=tasks.filter(function(t){return t.id!==selectedTask.id;});
  closeDetail();showToast('"'+name.slice(0,20)+'" dihapus');saveData(true);
  // Hapus juga dari Google Calendar
  if(gcalId && _gcalEnabled) gcalDeleteEvent(gcalId);
}

// ══════════════════════════════════════════════
// GROUPS & SELECTS
// ══════════════════════════════════════════════
function addCustomGroup(){
  var el=document.getElementById('custom-group-input');if(!el)return;
  var name=el.value.trim();if(!name)return;
  if(customGroups.indexOf(name)>=0||BASE_GROUPS.indexOf(name)>=0){showToast('Grup sudah ada!');return;}
  var emojiEl=document.getElementById('custom-group-emoji');
  var icon=emojiEl?emojiEl.textContent.trim():'';
  if(icon&&icon!=='📁')customGroupIcons[name]=icon;
  customGroups.push(name);el.value='';
  if(emojiEl)emojiEl.textContent='📁';
  saveData(true);refreshGroupSelects();render();showToast('Grup "'+name+'" ditambahkan!');
}
function deleteCustomGroup(name){
  customGroups=customGroups.filter(function(g){return g!==name;});
  delete customGroupIcons[name];
  tasks.forEach(function(t){if(t.group===name)t.group='Lainnya';});
  saveData(true);refreshGroupSelects();render();showToast('Grup "'+name+'" dihapus');
}
// Drag-reorder for custom groups
var _dragGroupSrc=null;
function groupDragStart(e,name){
  _dragGroupSrc=name;
  e.dataTransfer.effectAllowed='move';
  e.currentTarget.style.opacity='0.4';
}
function groupDragEnd(e){e.currentTarget.style.opacity='';}
function groupDragOver(e){e.preventDefault();e.dataTransfer.dropEffect='move';e.currentTarget.style.background='rgba(217,119,6,0.1)';}
function groupDragLeave(e){e.currentTarget.style.background='';}
function groupDrop(e,targetName){
  e.preventDefault();e.currentTarget.style.background='';
  if(!_dragGroupSrc||_dragGroupSrc===targetName)return;
  var si=customGroups.indexOf(_dragGroupSrc);
  var ti=customGroups.indexOf(targetName);
  if(si<0||ti<0)return;
  customGroups.splice(si,1);
  customGroups.splice(ti,0,_dragGroupSrc);
  _dragGroupSrc=null;
  saveData(true);refreshGroupSelects();render();
}
// ══════════════════════════════════════════════
// MY DAY GROUP DRAG-TO-REORDER
// ══════════════════════════════════════════════
var _mdDragSrcEl=null, _mdDragSrcGrp=null;
var _mdDragSrcNull=false; // flag khusus untuk grup '' (Tanpa Grup)
function mdGrpDragStart(e,el){
  _mdDragSrcEl=el;
  _mdDragSrcGrp=el.getAttribute('data-grp'); // bisa '' untuk Tanpa Grup
  _mdDragSrcNull=(_mdDragSrcGrp==='');
  e.dataTransfer.effectAllowed='move';
  e.dataTransfer.setData('text/plain',_mdDragSrcGrp||'__empty__');
  setTimeout(function(){el.classList.add('dragging');},0);
}
function mdGrpDragEnd(e,el){
  el.classList.remove('dragging');
  document.querySelectorAll('.myday-drag-grp').forEach(function(n){n.classList.remove('drag-over');});
  _mdDragSrcEl=null;_mdDragSrcGrp=null;_mdDragSrcNull=false;
}
function mdGrpDragOver(e){
  e.preventDefault();e.dataTransfer.dropEffect='move';
  var target=e.currentTarget;
  if(target===_mdDragSrcEl)return;
  document.querySelectorAll('.myday-drag-grp').forEach(function(n){n.classList.remove('drag-over');});
  target.classList.add('drag-over');
}
function mdGrpDragLeave(e){
  e.currentTarget.classList.remove('drag-over');
}
function mdGrpDrop(e,el){
  e.preventDefault();
  el.classList.remove('drag-over');
  var targetGrp=el.getAttribute('data-grp'); // bisa '' untuk Tanpa Grup
  // Cek apakah source valid — gunakan _mdDragSrcNull untuk membedakan null vs ''
  if(_mdDragSrcEl===null)return;
  if(_mdDragSrcGrp===targetGrp)return; // sama persis (termasuk '' === '')
  var si=mydayGroupOrder.indexOf(_mdDragSrcGrp);
  var ti=mydayGroupOrder.indexOf(targetGrp);
  if(si<0||ti<0)return;
  mydayGroupOrder.splice(si,1);
  mydayGroupOrder.splice(ti,0,_mdDragSrcGrp);
  saveData(true);render();
  showToast('Urutan grup diperbarui');
}

// ── TOUCH DRAG-REORDER untuk Mobile My Day Groups ──
(function(){
  var _touchSrcEl=null,_touchSrcGrp=null;
  var _touchClone=null;
  var _touchOffX=0,_touchOffY=0;
  var _touchLastOver=null;

  function getGrpElFromPoint(x,y){
    var els=document.querySelectorAll('.myday-drag-grp');
    for(var i=0;i<els.length;i++){
      var r=els[i].getBoundingClientRect();
      if(x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom)return els[i];
    }
    return null;
  }

  document.addEventListener('touchstart',function(e){
    var handle=e.target.closest('.myday-drag-handle');
    if(!handle)return;
    var grpEl=handle.closest('.myday-drag-grp');
    if(!grpEl)return;
    e.preventDefault();
    _touchSrcEl=grpEl;
    _touchSrcGrp=grpEl.getAttribute('data-grp');
    var t=e.touches[0];
    var r=grpEl.getBoundingClientRect();
    _touchOffX=t.clientX-r.left;
    _touchOffY=t.clientY-r.top;
    // buat clone visual
    _touchClone=grpEl.cloneNode(true);
    _touchClone.style.cssText='position:fixed;z-index:9999;pointer-events:none;opacity:0.85;width:'+r.width+'px;box-shadow:0 6px 24px rgba(0,0,0,0.25);border-radius:10px;left:'+(t.clientX-_touchOffX)+'px;top:'+(t.clientY-_touchOffY)+'px;background:var(--card);transition:none;';
    document.body.appendChild(_touchClone);
    grpEl.classList.add('dragging');
  },{passive:false});

  document.addEventListener('touchmove',function(e){
    if(!_touchSrcEl)return;
    e.preventDefault();
    var t=e.touches[0];
    if(_touchClone){
      _touchClone.style.left=(t.clientX-_touchOffX)+'px';
      _touchClone.style.top=(t.clientY-_touchOffY)+'px';
    }
    var over=getGrpElFromPoint(t.clientX,t.clientY);
    if(over&&over!==_touchSrcEl){
      if(over!==_touchLastOver){
        document.querySelectorAll('.myday-drag-grp').forEach(function(n){n.classList.remove('drag-over');});
        over.classList.add('drag-over');
        _touchLastOver=over;
      }
    } else {
      document.querySelectorAll('.myday-drag-grp').forEach(function(n){n.classList.remove('drag-over');});
      _touchLastOver=null;
    }
  },{passive:false});

  document.addEventListener('touchend',function(e){
    if(!_touchSrcEl)return;
    if(_touchClone){_touchClone.remove();_touchClone=null;}
    _touchSrcEl.classList.remove('dragging');
    document.querySelectorAll('.myday-drag-grp').forEach(function(n){n.classList.remove('drag-over');});
    var t=e.changedTouches[0];
    var targetEl=getGrpElFromPoint(t.clientX,t.clientY);
    if(targetEl&&targetEl!==_touchSrcEl){
      var targetGrp=targetEl.getAttribute('data-grp');
      var srcGrp=_touchSrcGrp;
      if(srcGrp!==targetGrp){
        var si=mydayGroupOrder.indexOf(srcGrp);
        var ti=mydayGroupOrder.indexOf(targetGrp);
        if(si>=0&&ti>=0){
          mydayGroupOrder.splice(si,1);
          mydayGroupOrder.splice(ti,0,srcGrp);
          saveData(true);render();
          showToast('Urutan grup diperbarui');
        }
      }
    }
    _touchSrcEl=null;_touchSrcGrp=null;_touchLastOver=null;
  },{passive:false});

  document.addEventListener('touchcancel',function(){
    if(_touchClone){_touchClone.remove();_touchClone=null;}
    if(_touchSrcEl)_touchSrcEl.classList.remove('dragging');
    document.querySelectorAll('.myday-drag-grp').forEach(function(n){n.classList.remove('drag-over');});
    _touchSrcEl=null;_touchSrcGrp=null;_touchLastOver=null;
  });
})();

// ══════════════════════════════════════════════
// INDIVIDUAL TASK DRAG-TO-REORDER
// ══════════════════════════════════════════════
var _taskDragSrcId = null;
function taskItemDragStart(e, taskId) {
  _taskDragSrcId = taskId;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', String(taskId));
  // Stop group drag from firing
  e.stopPropagation();
  setTimeout(function(){ 
    var el = e.target.closest('.task-draggable');
    if(el) el.classList.add('task-dragging');
  }, 0);
}
function taskItemDragEnd(e) {
  var el = e.target.closest('.task-draggable');
  if(el) el.classList.remove('task-dragging');
  document.querySelectorAll('.task-draggable').forEach(function(n){ n.classList.remove('task-drag-over'); });
  _taskDragSrcId = null;
}
function taskItemDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  e.dataTransfer.dropEffect = 'move';
  var el = e.currentTarget;
  document.querySelectorAll('.task-draggable').forEach(function(n){ n.classList.remove('task-drag-over'); });
  if(_taskDragSrcId !== null) el.classList.add('task-drag-over');
}
function taskItemDragLeave(e) {
  e.currentTarget.classList.remove('task-drag-over');
}
function taskItemDrop(e, targetId) {
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.classList.remove('task-drag-over');
  if(_taskDragSrcId === null || _taskDragSrcId === targetId) return;
  var si = tasks.findIndex(function(t){ return t.id === _taskDragSrcId; });
  var ti = tasks.findIndex(function(t){ return t.id === targetId; });
  if(si < 0 || ti < 0) return;
  var moved = tasks.splice(si, 1)[0];
  tasks.splice(ti, 0, moved);
  _taskDragSrcId = null;
  saveData(true); render();
  showToast('Urutan task diperbarui ✓');
}

// Touch drag for individual tasks (mobile)
(function(){
  var _tSrcId=null, _tSrcEl=null, _tClone=null;
  var _tOffX=0, _tOffY=0, _tLastOver=null;
  function getTaskElFromPoint(x,y){
    var els=document.querySelectorAll('.task-draggable');
    for(var i=0;i<els.length;i++){
      var r=els[i].getBoundingClientRect();
      if(x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom)return els[i];
    }
    return null;
  }
  document.addEventListener('touchstart',function(e){
    var handle=e.target.closest('.task-drag-handle');
    if(!handle)return;
    var card=handle.closest('.task-draggable');
    if(!card)return;
    e.preventDefault(); e.stopPropagation();
    _tSrcEl=card;
    _tSrcId=parseInt(card.getAttribute('data-task-id')||0);
    var t=e.touches[0], r=card.getBoundingClientRect();
    _tOffX=t.clientX-r.left; _tOffY=t.clientY-r.top;
    _tClone=card.cloneNode(true);
    _tClone.style.cssText='position:fixed;z-index:9999;pointer-events:none;opacity:0.85;width:'+r.width+'px;box-shadow:0 4px 20px rgba(0,0,0,0.25);border-radius:10px;left:'+(t.clientX-_tOffX)+'px;top:'+(t.clientY-_tOffY)+'px;background:var(--card);';
    document.body.appendChild(_tClone);
    card.classList.add('task-dragging');
  },{passive:false});
  document.addEventListener('touchmove',function(e){
    if(!_tSrcEl)return; e.preventDefault();
    var t=e.touches[0];
    if(_tClone){_tClone.style.left=(t.clientX-_tOffX)+'px';_tClone.style.top=(t.clientY-_tOffY)+'px';}
    var over=getTaskElFromPoint(t.clientX,t.clientY);
    if(over&&over!==_tSrcEl){
      if(over!==_tLastOver){
        document.querySelectorAll('.task-draggable').forEach(function(n){n.classList.remove('task-drag-over');});
        over.classList.add('task-drag-over'); _tLastOver=over;
      }
    } else {
      document.querySelectorAll('.task-draggable').forEach(function(n){n.classList.remove('task-drag-over');}); _tLastOver=null;
    }
  },{passive:false});
  document.addEventListener('touchend',function(e){
    if(!_tSrcEl)return;
    if(_tClone){_tClone.remove();_tClone=null;}
    _tSrcEl.classList.remove('task-dragging');
    document.querySelectorAll('.task-draggable').forEach(function(n){n.classList.remove('task-drag-over');});
    var t=e.changedTouches[0];
    var targetEl=getTaskElFromPoint(t.clientX,t.clientY);
    if(targetEl&&targetEl!==_tSrcEl){
      var targetId=parseInt(targetEl.getAttribute('data-task-id')||0);
      var srcId=_tSrcId;
      if(srcId&&targetId&&srcId!==targetId){
        var si=tasks.findIndex(function(x){return x.id===srcId;});
        var ti=tasks.findIndex(function(x){return x.id===targetId;});
        if(si>=0&&ti>=0){
          var moved=tasks.splice(si,1)[0]; tasks.splice(ti,0,moved);
          saveData(true); render(); showToast('Urutan task diperbarui ✓');
        }
      }
    }
    _tSrcEl=null;_tSrcId=null;_tLastOver=null;
  },{passive:false});
  document.addEventListener('touchcancel',function(){
    if(_tClone){_tClone.remove();_tClone=null;}
    if(_tSrcEl)_tSrcEl.classList.remove('task-dragging');
    document.querySelectorAll('.task-draggable').forEach(function(n){n.classList.remove('task-drag-over');});
    _tSrcEl=null;_tSrcId=null;_tLastOver=null;
  });
})();

// ══════════════════════════════════════════════
// NLP MOBILE PREVIEW
// ══════════════════════════════════════════════
var _nlpPreviewTimerM = null;
function nlpInputChangeMobile(val) {
  clearTimeout(_nlpPreviewTimerM);
  _nlpPreviewTimerM = setTimeout(function() {
    var p = nlpParseTask(val);
    var el = document.getElementById('nlpPreviewMobile');
    if (!el) return;
    if (!val || val.length < 4 || !p.nlpHints || !p.nlpHints.length) { el.style.display='none'; return; }
    el.innerHTML = '<span style="color:rgba(255,255,255,0.5);font-size:11px">✨ </span>'
      + p.nlpHints.map(function(h){ return '<span style="background:rgba(255,255,255,0.15);border-radius:10px;padding:2px 8px;font-size:11px;font-weight:600;color:#fff">' + h + '</span>'; }).join(' ');
    el.style.display = 'flex';
  }, 300);
}

function refreshGroupSelects(){
  var all=getAllGroups();
  ['chip-group','det-group'].forEach(function(id){
    var el=document.getElementById(id);if(!el)return;
    var cur=el.value;
    var first=id==='chip-group'?'<option value="">📁 Grup</option>':'<option value="">Tanpa Grup</option>';
    el.innerHTML=first+all.map(function(g){return'<option value="'+g+'">'+getGroupIcon(g)+' '+g+'</option>';}).join('');
    el.value=cur;
  });
}
// ══════════════════════════════════════════════
// KELOLA GRUP — view 'task-groups'
// ══════════════════════════════════════════════
var _GRP_EMOJIS=['📁','💪','🧼','❤️','🧠','🧘','🥗','👥','📌','⭐','🔥','🎯','📚','🏃','🎮','🎨','🎵','💰','🌿','✈️','🍎','💊','🧪','🏋️','🤸','🎒','🏠','🌟','⚡','🦋','🌈','🎁','🍕','☕','🐱','🐶','🚀','🔑','🧡','💜','🟢','🔵','🌊','🎤','🎬','📷','🕹️','🏆','🎖️','🏅','🔮','🎪','🌺','🌸','🍀','🦄','🐉','🎻','🥁','🎸','🏖️','⛺','🏕️','🧩','🎲','♟️','🖊️','📐','🔭','🧲','💡','🔐','🗝️','🛡️','⚔️','🧸','🪆','🎀','🎗️'];

function renderGroupManager(el){
  if(!el) el = document.getElementById('taskScroll');
  if(!el) return;
  var BASE_G = ['Belanja','Hygiene','Olahraga','Kesehatan','Produktivitas','Mindfulness','Nutrisi','Sosial','Ibadah','Lainnya'];
  var customs = customGroups.filter(function(g){ return BASE_G.indexOf(g)<0; });
  var html = '';

  // ── Tambah Grup Baru ──
  html += '<div style="background:var(--card);border:1.5px solid var(--border);border-radius:16px;padding:16px;margin-bottom:14px">'
    + '<div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.6px;margin-bottom:12px">➕ Tambah Grup Baru</div>'
    + '<div style="display:flex;gap:8px;align-items:center;margin-bottom:10px">'
    + '<div id="group-emoji-wrap" style="position:relative;flex-shrink:0">'
    + '<button type="button" id="custom-group-emoji" onclick="openGroupEmojiPicker()" title="Pilih atau ketik icon" style="width:44px;height:44px;border-radius:12px;border:1.5px solid var(--border);background:var(--bg);font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center">📁</button>'
    + '</div>'
    + '<input type="text" id="custom-group-input" placeholder="Nama grup baru..." maxlength="24"'
    + ' onkeydown="if(event.key===\'Enter\')addCustomGroup()"'
    + ' style="flex:1;padding:11px 13px;border:1.5px solid var(--border);border-radius:11px;background:var(--bg);color:var(--text);font-size:14px;font-family:\'DM Sans\',sans-serif;outline:none;min-width:0">'
    + '</div>'
    + '<button onclick="addCustomGroup()" style="width:100%;padding:12px;background:var(--accent);color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;font-family:\'DM Sans\',sans-serif;box-shadow:0 3px 12px rgba(217,119,6,0.3)">＋ Tambah Grup</button>'
    + '</div>';

  // ── Grup Kustom ──
  html += '<div style="background:var(--card);border:1.5px solid var(--border);border-radius:16px;padding:16px;margin-bottom:14px">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">'
    + '<div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.6px">✨ Grup Kustom</div>'
    + '<span style="font-size:11px;background:rgba(217,119,6,0.12);color:var(--accent);padding:2px 8px;border-radius:8px;font-weight:700">'+customs.length+'</span>'
    + '</div>';
  if(!customs.length){
    html += '<div style="text-align:center;padding:22px 0;color:var(--muted);font-size:13px;line-height:1.6">Belum ada grup kustom.<br>Buat satu di atas! 🎨</div>';
  } else {
    html += '<div style="display:flex;flex-direction:column;gap:7px">';
    customs.forEach(function(g){
      var icon = customGroupIcons[g]||'📁';
      var count = tasks.filter(function(t){return t.group===g&&!isEffectiveDone(t);}).length;
      var gSafe = g.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
      html += '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg);border-radius:12px;border:1px solid var(--border)">'
        + '<button onclick="openGroupIconEditor(\''+gSafe+'\')" title="Ubah icon" style="width:38px;height:38px;font-size:22px;border:1.5px dashed var(--border);border-radius:10px;background:var(--card);cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center">'+icon+'</button>'
        + '<span style="flex:1;font-size:14px;font-weight:600;color:var(--text);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+g+'</span>'
        + (count?'<span style="font-size:11px;background:rgba(217,119,6,0.15);color:var(--accent);padding:2px 8px;border-radius:8px;font-weight:700;flex-shrink:0">'+count+'</span>':'')
        + '<button onclick="deleteCustomGroup(\''+gSafe+'\')" title="Hapus grup" style="width:32px;height:32px;border:none;background:rgba(220,38,38,0.1);color:#dc2626;border-radius:9px;cursor:pointer;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0">🗑</button>'
        + '</div>';
    });
    html += '</div>';
  }
  html += '</div>';

  // ── Grup Bawaan ──
  html += '<div style="background:var(--card);border:1.5px solid var(--border);border-radius:16px;padding:16px">'
    + '<div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.6px;margin-bottom:12px">📦 Grup Bawaan</div>'
    + '<div style="display:flex;flex-direction:column;gap:6px">';
  BASE_G.forEach(function(g){
    var icon = getGroupIcon(g);
    var count = tasks.filter(function(t){return t.group===g&&!isEffectiveDone(t);}).length;
    html += '<div style="display:flex;align-items:center;gap:10px;padding:9px 12px;background:var(--bg);border-radius:11px">'
      + '<span style="font-size:22px;width:30px;text-align:center;flex-shrink:0">'+icon+'</span>'
      + '<span style="flex:1;font-size:14px;font-weight:600;color:var(--text)">'+g+'</span>'
      + (count?'<span style="font-size:11px;background:rgba(217,119,6,0.15);color:var(--accent);padding:2px 8px;border-radius:8px;font-weight:700">'+count+'</span>':'')
      + '<span style="font-size:10px;color:var(--muted);padding:2px 8px;border:1px solid var(--border);border-radius:8px;flex-shrink:0">Bawaan</span>'
      + '</div>';
  });
  html += '</div></div>';

  el.innerHTML = '<div style="padding:4px 0 80px">'+html+'</div>';
}

// ── Picker FORM TAMBAH: dropdown di bawah tombol icon ──
function openGroupEmojiPicker(){
  var existing=document.getElementById('group-emoji-sheet');
  if(existing){existing.remove();return;}
  var wrap=document.getElementById('group-emoji-wrap');if(!wrap)return;

  var sheet=document.createElement('div');
  sheet.id='group-emoji-sheet';
  sheet.style.cssText='position:absolute;left:0;top:52px;z-index:500;background:var(--card);border:1.5px solid var(--border);border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.18);padding:12px;width:290px;max-height:320px;overflow-y:auto';

  // Baris input manual
  var manRow=document.createElement('div');
  manRow.style.cssText='display:flex;gap:7px;align-items:center;margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid var(--border)';
  manRow.innerHTML='<span style="font-size:11px;font-weight:700;color:var(--muted);white-space:nowrap">Ketik:</span>'
    +'<input id="grp-emoji-new-input" type="text" maxlength="4" placeholder="✏️" '
    +'style="flex:1;padding:7px 8px;border:1.5px solid var(--border);border-radius:9px;background:var(--bg);color:var(--text);font-size:20px;font-family:\'DM Sans\',sans-serif;outline:none;min-width:0;text-align:center">'
    +'<button type="button" onclick="_applyNewEmoji()" '
    +'style="padding:7px 11px;background:var(--accent);color:#fff;border:none;border-radius:9px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap">✓ OK</button>';
  sheet.appendChild(manRow);

  // Label koleksi
  var lbl=document.createElement('div');
  lbl.style.cssText='font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:7px';
  lbl.textContent='Atau pilih koleksi';
  sheet.appendChild(lbl);

  // Grid
  var grid=document.createElement('div');
  grid.style.cssText='display:grid;grid-template-columns:repeat(7,1fr);gap:3px';
  _GRP_EMOJIS.forEach(function(em){
    var btn=document.createElement('button');
    btn.type='button';btn.textContent=em;
    btn.style.cssText='width:34px;height:34px;border:2px solid transparent;border-radius:8px;background:transparent;font-size:19px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.1s';
    btn.onmouseover=function(){btn.style.background='rgba(217,119,6,0.12)';};
    btn.onmouseleave=function(){btn.style.background='transparent';};
    btn.onclick=function(){
      var emojiEl=document.getElementById('custom-group-emoji');
      if(emojiEl)emojiEl.textContent=em;
      sheet.remove();
    };
    grid.appendChild(btn);
  });
  sheet.appendChild(grid);
  wrap.appendChild(sheet);

  setTimeout(function(){var inp=document.getElementById('grp-emoji-new-input');if(inp)inp.focus();},60);
  setTimeout(function(){
    document.addEventListener('mousedown',function _cls(ev){
      if(!wrap.contains(ev.target)){sheet.remove();document.removeEventListener('mousedown',_cls);}
    });
  },80);
}
function _applyNewEmoji(){
  var inp=document.getElementById('grp-emoji-new-input');if(!inp)return;
  var val=inp.value.trim();if(!val)return;
  var emojiEl=document.getElementById('custom-group-emoji');
  if(emojiEl)emojiEl.textContent=val;
  var sheet=document.getElementById('group-emoji-sheet');if(sheet)sheet.remove();
}

// ── Editor icon grup yang sudah ada (bottom sheet) ──
function openGroupIconEditor(groupName){
  var existing=document.getElementById('group-icon-editor-popup');
  if(existing){existing.remove();return;}
  var curIcon=customGroupIcons[groupName]||'📁';
  var gSafeJs=groupName.replace(/\\/g,'\\\\').replace(/'/g,"\\'");

  var popup=document.createElement('div');
  popup.id='group-icon-editor-popup';
  popup.style.cssText='position:fixed;inset:0;z-index:600;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center';

  var gridHtml=_GRP_EMOJIS.map(function(em){
    var sel=em===curIcon;
    return '<button type="button" onclick="applyGroupIcon(\''+gSafeJs+'\',\''+em+'\')" '
      +'style="width:40px;height:40px;border:2px solid '+(sel?'var(--accent)':'transparent')+';border-radius:10px;'
      +'background:'+(sel?'rgba(217,119,6,0.15)':'var(--bg)')+';font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center">'+em+'</button>';
  }).join('');

  popup.innerHTML=''
    +'<div style="background:var(--card);border-radius:22px 22px 0 0;padding:18px 16px 36px;width:100%;max-width:440px;max-height:78vh;overflow-y:auto">'
    // Header
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">'
    +'<div style="font-size:15px;font-weight:700;color:var(--text)">🎨 Icon · <b>'+groupName+'</b></div>'
    +'<button onclick="document.getElementById(\'group-icon-editor-popup\').remove()" style="border:none;background:var(--bg);border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:16px;color:var(--muted);display:flex;align-items:center;justify-content:center">✕</button>'
    +'</div>'
    // Preview + input manual dalam satu baris
    +'<div style="display:flex;gap:10px;align-items:center;padding:10px 14px;background:var(--bg);border-radius:14px;margin-bottom:14px">'
    +'<span id="grp-icon-preview" style="font-size:32px;flex-shrink:0;min-width:40px;text-align:center">'+curIcon+'</span>'
    +'<input id="grp-emoji-edit-input" type="text" maxlength="4" value="'+curIcon+'" '
    +'placeholder="Ketik emoji..." '
    +'oninput="var p=document.getElementById(\'grp-icon-preview\');if(p&&this.value.trim())p.textContent=this.value.trim();" '
    +'style="flex:1;padding:9px 12px;border:1.5px solid var(--border);border-radius:10px;background:var(--card);color:var(--text);font-size:22px;font-family:\'DM Sans\',sans-serif;outline:none;min-width:0;text-align:center">'
    +'<button type="button" onclick="_applyEditEmoji(\''+gSafeJs+'\')" '
    +'style="padding:9px 14px;background:var(--accent);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0">✓ Pakai</button>'
    +'</div>'
    // Divider + label koleksi
    +'<div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:9px">Atau pilih dari koleksi</div>'
    // Grid
    +'<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:5px">'+gridHtml+'</div>'
    +'</div>';

  document.body.appendChild(popup);
  popup.addEventListener('click',function(e){if(e.target===popup)popup.remove();});
  setTimeout(function(){var inp=document.getElementById('grp-emoji-edit-input');if(inp){inp.focus();inp.select();}},80);
}
function _applyEditEmoji(groupName){
  var inp=document.getElementById('grp-emoji-edit-input');if(!inp)return;
  var val=inp.value.trim();if(!val)return;
  applyGroupIcon(groupName,val);
}

function applyGroupIcon(groupName,icon){
  customGroupIcons[groupName]=icon;
  var popup=document.getElementById('group-icon-editor-popup');
  if(popup)popup.remove();
  saveData(true);refreshGroupSelects();render();
  showToast('Icon "'+groupName+'" diperbarui!');
}

function refreshDetailGroups(){
  var all=getAllGroups();
  var el=document.getElementById('det-group');if(!el)return;
  var cur=selectedTask?(selectedTask.group||''):'';
  el.innerHTML='<option value="">Tanpa Grup</option>'+all.map(function(g){return'<option value="'+g+'">'+getGroupIcon(g)+' '+g+'</option>';}).join('');
  el.value=cur;
}

// ══════════════════════════════════════════════
// MISC
// ══════════════════════════════════════════════
function setStreakMode(mode){habitStreakMode=mode;render();}

function toggleGroup(gKey){groupOpenState[gKey]=!groupOpenState[gKey];saveData();render();}
function switchView(v){
  currentView=v;
  document.querySelectorAll('.nav-item').forEach(function(el){el.classList.remove('active');el.classList.remove('fin-active');el.classList.remove('maint-active');el.classList.remove('journal-active');});
  // unified-calendar maps to nav-calendar element
  var navId = v === 'unified-calendar' ? 'calendar' : v;
  var nav=document.getElementById('nav-'+navId);
  if(nav){
    if(isFinView(v))nav.classList.add('fin-active');
    else if(isMaintView(v)||v.startsWith('maint-cat-'))nav.classList.add('maint-active');
    else if(isJournalView(v))nav.classList.add('journal-active');
    else nav.classList.add('active');
  }
  if(v.startsWith('maint-cat-')){
    var dynNav=document.getElementById('nav-maint-cat-'+v.replace('maint-cat-',''));
    if(dynNav)dynNav.classList.add('maint-active');
  }
  updateBottomNav();
  render();
  updateOnlineIndicator();

}
function sortTasks(){
  sortDir*=-1;
  tasks.sort(function(a,b){var da=a.due||'9999',db=b.due||'9999';return sortDir*(da<db?-1:da>db?1:0);});
  showToast('Diurutkan '+(sortDir>0?'terdekat':'terjauh')+' dulu');saveData(true);render();
}
function applyDark(){
  var r=document.documentElement.style;
  r.setProperty('--bg','#0c0a09');r.setProperty('--card','#1c1917');r.setProperty('--sidebar','#0c0a09');
  r.setProperty('--text','#fafaf9');r.setProperty('--muted','#78716c');
  r.setProperty('--border','rgba(255,255,255,0.08)');r.setProperty('--hover','rgba(255,255,255,0.04)');
  r.setProperty('--pill','#292524');r.setProperty('--pill-text','#fbbf24');
}
function applyLight(){
  var r=document.documentElement.style;
  r.setProperty('--bg','#f0ede8');r.setProperty('--card','#fff');r.setProperty('--sidebar','#1c1917');
  r.setProperty('--text','#1c1917');r.setProperty('--muted','#78716c');
  r.setProperty('--border','rgba(0,0,0,0.08)');r.setProperty('--hover','rgba(0,0,0,0.03)');
  r.setProperty('--pill','#fef3c7');r.setProperty('--pill-text','#92400e');
}
function toggleTheme(){
  // toggleTheme kept for backward compat; now routes through applyTheme
  var newTheme=darkMode?'theme-light':'theme-dark';
  activeTheme=newTheme;
  applyTheme(newTheme);
  var shopOverlay=document.getElementById('shopOverlay');
  if(shopOverlay&&shopOverlay.classList.contains('show'))renderShop();
  saveData(true);
}
// ── Dynamic toast position ──
function _updateToastPosition(){
  var isMobile=window.innerWidth<=700;
  var isSidebar=document.body.classList.contains('mobile-nav-sidebar');
  // Cek bottom nav height — fallback 64px kalau offsetHeight belum tersedia
  var bn=document.getElementById('bottomNav');
  var bnVisible=isMobile&&!isSidebar&&bn&&getComputedStyle(bn).display!=='none';
  var bnH=bnVisible?(bn.offsetHeight||64):0;
  // Safe area
  var sa=0;
  try{
    var saStr=getComputedStyle(document.documentElement).getPropertyValue('--sai-bottom')||'0px';
    sa=parseInt(saStr)||0;
  }catch(e){}
  // Kalau keyboard terbuka (visualViewport jauh lebih kecil dari window)
  var vv=window.visualViewport;
  var keyboardOpen=vv&&(window.innerHeight-vv.height)>150;
  var gap=isMobile?12:24;
  var base=keyboardOpen?gap:(bnH>0?bnH+gap:gap);
  var r=document.documentElement;
  r.style.setProperty('--toast-bottom', base+'px');
  r.style.setProperty('--xp-toast-bottom', (base+46)+'px');
  r.style.setProperty('--gold-toast-bottom', (base+92)+'px');
}
// Jalankan saat resize, orientasi berubah, dan keyboard muncul
window.addEventListener('resize',_updateToastPosition);
if(window.visualViewport) window.visualViewport.addEventListener('resize',_updateToastPosition);
// DOMContentLoaded + delay 200ms agar bottom nav sudah ter-render
document.addEventListener('DOMContentLoaded',function(){
  _updateToastPosition();
  setTimeout(_updateToastPosition,200);
  // Init sidebar edge toggle position
  setTimeout(_updateSidebarEdgeToggle,50);
});

function showToast(msg){
  _updateToastPosition();
  var t=document.getElementById('toast');
  t.textContent=msg;
  t.classList.remove('show');
  // force reflow agar posisi bottom ter-apply sebelum animasi muncul
  void t.offsetWidth;
  t.classList.add('show');
  clearTimeout(t._to);t._to=setTimeout(function(){t.classList.remove('show');},2500);
}


// ══════════════════════════════════════════════
// PWA SETUP
// ══════════════════════════════════════════════
function setupPWA(){
  // manifest.json sudah di-link di <head>

  // Register service worker dari file eksternal
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('./sw.js', { scope: './' }).then(function(reg){
      reg.update();
      // Deteksi update SW baru
      reg.addEventListener('updatefound', function(){
        var newWorker = reg.installing;
        newWorker.addEventListener('statechange', function(){
          if(newWorker.state === 'installed' && navigator.serviceWorker.controller){
            // Ada update — skip waiting agar langsung aktif
            newWorker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
    }).catch(function(err){ console.warn('SW register failed:', err); });

    // Reload saat SW baru aktif (seamless update)
    var refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', function(){
      if(!refreshing){ refreshing = true; }
    });
  }

  // Prompt install PWA
  // CATATAN: listener beforeinstallprompt sudah dipasang lebih awal (early capture di <body>)
  // Di sini cukup expose _triggerPWAInstall dan sync banner jika prompt sudah tertangkap.
  window._triggerPWAInstall = function(){
    var prompt = window._earlyCapturedInstallPrompt || window._installPrompt;
    if(prompt){
      prompt.prompt();
      prompt.userChoice.then(function(r){
        if(r.outcome === 'accepted') showToast('✅ ChiTask berhasil diinstall!');
        window._earlyCapturedInstallPrompt = null;
        window._installPrompt = null;
      });
    }
  };
  // Jika prompt sudah tertangkap sebelum setupPWA jalan, tampilkan banner sekarang
  if(window._earlyCapturedInstallPrompt && window.innerWidth <= 700 && !document.getElementById('installBanner')){
    showInstallBanner(window._earlyCapturedInstallPrompt);
  }


  // Add to homescreen prompt — listener sudah dipasang lebih awal (early capture di <body>)
  // Tidak perlu daftar ulang di sini; cukup gunakan window._earlyCapturedInstallPrompt
}

function showInstallBanner(prompt){
  if(!prompt)return;
  var banner=document.createElement('div');
  banner.style.cssText='position:fixed;bottom:calc(64px + env(safe-area-inset-bottom,0));left:12px;right:12px;background:#1c1917;border:1px solid rgba(255,255,255,0.15);border-radius:14px;padding:12px 14px;z-index:300;display:flex;align-items:center;gap:12px;box-shadow:0 8px 32px rgba(0,0,0,0.4);animation:slideUp 0.3s ease';
  banner.innerHTML='<span style="font-size:28px">📝</span>'
    +'<div style="flex:1"><div style="font-size:13px;font-weight:700;color:#fff">Install ChiTask</div><div style="font-size:11px;color:rgba(255,255,255,0.6)">Tambah ke homescreen untuk akses cepat</div></div>'
    +'<button onclick="this.parentNode.remove()" style="background:none;border:none;color:rgba(255,255,255,0.5);font-size:18px;cursor:pointer;padding:2px;line-height:1">✕</button>'
    +'<button onclick="installApp()" style="background:var(--accent);border:none;border-radius:8px;color:#fff;padding:7px 12px;font-size:12px;font-weight:700;cursor:pointer;font-family:DM Sans,sans-serif;white-space:nowrap">Install</button>';
  banner.id='installBanner';
  document.body.appendChild(banner);
  window._installPrompt=prompt;
}
function _showPWADiagModal(lines){
  var existing = document.getElementById('_pwaDiagModal');
  if(existing) existing.remove();
  var overlay = document.createElement('div');
  overlay.id = '_pwaDiagModal';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';
  var box = document.createElement('div');
  box.style.cssText = 'background:#1c1917;border:1px solid rgba(255,255,255,0.15);border-radius:16px;padding:20px;max-width:360px;width:100%;max-height:80vh;overflow-y:auto';
  var html = '<div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:14px">🔍 PWA Install Diagnosis</div>';
  lines.forEach(function(l){
    var color = l.startsWith('❌') ? '#f87171' : l.startsWith('✅') ? '#4ade80' : '#fbbf24';
    html += '<div style="font-size:12px;color:'+color+';margin-bottom:8px;line-height:1.5">'+l+'</div>';
  });
  html += '<div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:12px;margin-bottom:14px">Log: '+(window._pwaDebugLog||[]).join(' → ')+'</div>';
  html += '<button onclick="document.getElementById(\'_pwaDiagModal\').remove()" style="width:100%;background:var(--accent,#f59e0b);border:none;border-radius:8px;color:#fff;padding:10px;font-size:13px;font-weight:700;cursor:pointer">Tutup</button>';
  box.innerHTML = html;
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}
function installApp(){
  var log = window._pwaLog || function(m){console.log('[PWA] '+m);};
  var p = window._earlyCapturedInstallPrompt || window._installPrompt;
  log('installApp() dipanggil — prompt ada: ' + (p ? 'YA' : 'TIDAK'));
  if(p){
    log('Memanggil p.prompt()...');
    p.prompt();
    p.userChoice.then(function(r){
      log('userChoice: ' + r.outcome);
      if(r.outcome==='accepted') showToast('✅ ChiTask berhasil diinstall!');
      window._earlyCapturedInstallPrompt = null;
      window._installPrompt = null;
    });
    var b = document.getElementById('installBanner');
    if(b) b.remove();
  } else {
    log('❌ Tidak ada prompt — browser belum tembak beforeinstallprompt');
    // Diagnosa otomatis
    var diag = [];
    // 1. Cek SW
    if (!('serviceWorker' in navigator)) {
      diag.push('❌ Service Worker tidak didukung browser ini');
    } else {
      navigator.serviceWorker.getRegistrations().then(function(regs) {
        if (regs.length === 0) {
          log('❌ DIAGNOSA: Tidak ada SW yang terdaftar!');
          _showPWADiagModal(['❌ Service Worker belum terdaftar — /sw.js gagal load?']);
        } else {
          log('✅ SW terdaftar: ' + regs.map(function(r){return r.scope;}).join(', '));
          // 2. Cek manifest
          fetch('/manifest.json').then(function(r){
            if (!r.ok) {
              log('❌ DIAGNOSA: /manifest.json tidak ditemukan! Status: ' + r.status);
              _showPWADiagModal(['❌ /manifest.json tidak ditemukan (HTTP '+r.status+')']);
            } else {
              return r.json().then(function(m){
                var issues = [];
                if (!m.name && !m.short_name) issues.push('❌ manifest: tidak ada name/short_name');
                if (!m.icons || m.icons.length === 0) issues.push('❌ manifest: tidak ada icons');
                else {
                  var has192 = m.icons.some(function(i){return i.sizes && i.sizes.indexOf('192')>=0;});
                  var has512 = m.icons.some(function(i){return i.sizes && i.sizes.indexOf('512')>=0;});
                  if (!has192) issues.push('❌ manifest: tidak ada icon 192x192');
                  if (!has512) issues.push('❌ manifest: tidak ada icon 512x512');
                }
                if (!m.start_url) issues.push('❌ manifest: tidak ada start_url');
                if (m.display !== 'standalone' && m.display !== 'fullscreen' && m.display !== 'minimal-ui') issues.push('❌ manifest: display harus standalone/fullscreen/minimal-ui, saat ini: '+m.display);
                if (issues.length === 0) {
                  issues.push('✅ SW OK, manifest OK');
                  issues.push('⚠️ Kemungkinan: app sudah pernah di-dismiss → Chrome blacklist 3 bulan.');
                  issues.push('Coba: Settings → Apps → ChiTask → Uninstall, atau clear site data Chrome, lalu buka ulang.');
                }
                log('DIAGNOSA manifest: ' + issues.join(' | '));
                _showPWADiagModal(issues);
              });
            }
          }).catch(function(e){
            log('❌ DIAGNOSA: Gagal fetch manifest.json — ' + e.message);
            _showPWADiagModal(['❌ Gagal fetch /manifest.json: ' + e.message]);
          });
        }
      });
      return;
    }
    if (diag.length) _showPWADiagModal(diag);
  }
}

// ══════════════════════════════════════════════
// MOBILE NAV — SUB-DRAWER SYSTEM
// ══════════════════════════════════════════════
var isMobile=function(){return window.innerWidth<=700;};
var activeSubDrawer=null;

function toggleSidebar(){
  if(isMobile()){
    var sb=document.getElementById('sidebar');
    var ov=document.getElementById('sidebarOverlay');
    var isOpen=sb.classList.contains('mobile-open');
    sb.classList.toggle('mobile-open',!isOpen);
    if(ov)ov.classList.toggle('show',!isOpen);
    var btn=document.getElementById('mobileSidebarToggleBtn');
    if(btn)btn.classList.toggle('sidebar-is-open',!isOpen);
  } else {
    var sb=document.getElementById('sidebar');
    sb.classList.toggle('collapsed');
    _updateSidebarEdgeToggle();
  }
}
function _updateSidebarEdgeToggle(){
  var sb=document.getElementById('sidebar');
  var tab=document.getElementById('sidebarEdgeToggle');
  if(!tab) return;
  var collapsed=sb&&sb.classList.contains('collapsed');
  tab.style.left=collapsed?'0':'220px';
  tab.innerHTML=collapsed?'&#x276F;':'&#x276E;';
  tab.title=collapsed?'Buka Sidebar':'Tutup Sidebar';
}
function closeMobileSidebar(){
  var sb=document.getElementById('sidebar');
  var ov=document.getElementById('sidebarOverlay');
  sb.classList.remove('mobile-open');
  if(ov)ov.classList.remove('show');
}
// Keep old closeMorePanel as no-op for compatibility
function closeMorePanel(){}

function toggleSubDrawer(name){
  if(activeSubDrawer===name){closeSubDrawer();return;}
  closeSubDrawer(true);
  activeSubDrawer=name;
  var drawer=document.getElementById('subdrawer-'+name);
  var ov=document.getElementById('subdrawerOverlay');
  if(drawer)drawer.classList.add('open');
  if(ov)ov.classList.add('show');
  // Refresh maint categories in maint drawer
  if(name==='maint'){buildMaintSubDrawer();}
  if(name==='task'){buildTaskSubDrawer();}
  if(name==='journal')updateJournalDrawer();
  updateSubDrawerActive();
  // Attach swipe-to-close on the handle
  if(drawer){
    setupDrawerSwipe(drawer);
    // Reset to mid snap height on open
    if(drawer._resetSnap)drawer._resetSnap();
  }
}
function closeSubDrawer(silent){
  if(activeSubDrawer){
    var drawer=document.getElementById('subdrawer-'+activeSubDrawer);
    if(drawer){
      drawer.classList.remove('open');
      // Reset height so next open starts fresh from CSS default
      setTimeout(function(){drawer.style.height='';},300);
    }
  }
  activeSubDrawer=null;
  var ov=document.getElementById('subdrawerOverlay');
  if(ov)ov.classList.remove('show');
}

// ── Drawer resize + swipe-to-close via handle only ──
var DRAWER_SNAPS=[50,72,88]; // % of viewport height
function setupDrawerSwipe(drawer){
  if(drawer._swipeAttached)return;
  drawer._swipeAttached=true;

  var handle=drawer.querySelector('.subdrawer-handle');
  if(!handle)return;

  var startY=0,startH=0,isDragging=false;
  var snapIdx=1; // default = middle snap

  function getVH(){ return window.innerHeight; }

  function snapTo(idx,animate){
    snapIdx=Math.max(0,Math.min(DRAWER_SNAPS.length-1,idx));
    var pct=DRAWER_SNAPS[snapIdx];
    if(animate){
      drawer.style.transition='transform 0.28s cubic-bezier(.32,.72,0,1), height 0.25s cubic-bezier(.32,.72,0,1)';
      requestAnimationFrame(function(){
        drawer.style.height=pct+'dvh';
        setTimeout(function(){drawer.style.transition='';},280);
      });
    } else {
      drawer.style.height=pct+'dvh';
    }
  }

  // Expose reset for toggleSubDrawer
  drawer._resetSnap=function(){ snapTo(1,false); };

  // Use Pointer Events API — works on both iOS (13.4+) and Android
  // Fallback to touch events for older iOS
  var usePointer=!!window.PointerEvent;

  if(usePointer){
    handle.addEventListener('pointerdown',function(e){
      handle.setPointerCapture(e.pointerId);
      startY=e.clientY;
      startH=drawer.getBoundingClientRect().height;
      isDragging=true;
      drawer.classList.add('resizing');
    });
    handle.addEventListener('pointermove',function(e){
      if(!isDragging)return;
      var dy=e.clientY-startY;
      var newH=startH-dy;
      var vh=getVH();
      var pct=Math.round(newH/vh*100);
      pct=Math.max(22,Math.min(92,pct));
      drawer.style.height=pct+'dvh';
    });
    handle.addEventListener('pointerup',function(e){
      if(!isDragging)return;
      isDragging=false;
      drawer.classList.remove('resizing');
      var dy=e.clientY-startY;
      var vh=getVH();
      var curPct=Math.round(drawer.getBoundingClientRect().height/vh*100);
      // Close if dragged down hard
      if(dy>130||(dy>70&&curPct<25)){
        closeSubDrawer();
        return;
      }
      // Snap to nearest
      var best=0;
      DRAWER_SNAPS.forEach(function(s,i){
        if(Math.abs(s-curPct)<Math.abs(DRAWER_SNAPS[best]-curPct))best=i;
      });
      snapTo(best,true);
    });
    handle.addEventListener('pointercancel',function(){
      isDragging=false;
      drawer.classList.remove('resizing');
      snapTo(snapIdx,true);
    });
  } else {
    // Touch fallback
    handle.addEventListener('touchstart',function(e){
      startY=e.touches[0].clientY;
      startH=drawer.getBoundingClientRect().height;
      isDragging=true;
      drawer.classList.add('resizing');
    },{passive:true});
    handle.addEventListener('touchmove',function(e){
      if(!isDragging)return;
      var dy=e.touches[0].clientY-startY;
      var newH=startH-dy;
      var vh=getVH();
      var pct=Math.round(newH/vh*100);
      pct=Math.max(22,Math.min(92,pct));
      drawer.style.height=pct+'dvh';
    },{passive:true});
    handle.addEventListener('touchend',function(e){
      if(!isDragging)return;
      isDragging=false;
      drawer.classList.remove('resizing');
      var dy=e.changedTouches[0].clientY-startY;
      var vh=getVH();
      var curPct=Math.round(drawer.getBoundingClientRect().height/vh*100);
      if(dy>130||(dy>70&&curPct<25)){
        closeSubDrawer();
        return;
      }
      var best=0;
      DRAWER_SNAPS.forEach(function(s,i){
        if(Math.abs(s-curPct)<Math.abs(DRAWER_SNAPS[best]-curPct))best=i;
      });
      snapTo(best,true);
    },{passive:true});
  }
}
function buildTaskSubDrawer(){
  var grid=document.querySelector('#subdrawer-task .subdrawer-grid');
  if(!grid)return;
  // Remove any leftover dynamic group items
  var existing=grid.querySelectorAll('.sdi-task-dynamic');
  existing.forEach(function(el){el.remove();});
}

function buildMaintSubDrawer(){
  var grid=document.getElementById('sdi-maint-grid');
  if(!grid)return;
  // Remove dynamic cat items first
  var existing=grid.querySelectorAll('.sdi-maint-dynamic');
  existing.forEach(function(el){el.remove();});
  // Add categories
  maintCategories.forEach(function(cat){
    var div=document.createElement('div');
    div.className='subdrawer-item maint sdi-maint-dynamic'+(currentView==='maint-cat-'+cat.id?' active':'');
    div.innerHTML='<span class="sdi-ic">'+cat.icon+'</span><span class="sdi-lbl">'+cat.name+'</span>';
    div.onclick=function(){switchView('maint-cat-'+cat.id);closeSubDrawer();};
    grid.appendChild(div);
  });
}
function updateSubDrawerActive(){
  // Task drawer
  var taskViews=['myday','important','planned','calendar','unified-calendar','habits','habit-analisa','all','completed','stats','achievements'];
  taskViews.forEach(function(v){
    var el=document.getElementById('sdi-'+v);
    if(el)el.classList.toggle('active',currentView===v);
  });
  // Fin drawer
  var finViews=['fin-overview','fin-cashflow','fin-transactions','fin-wallets','fin-wishlist','fin-tagihan','fin-hutang','fin-categories','fin-budget'];
  finViews.forEach(function(v){
    var el=document.getElementById('sdi-'+v);
    if(el)el.classList.toggle('active',currentView===v);
  });
  // Maint drawer
  ['maint-overview','maint-all','maint-log','maint-categories'].forEach(function(v){
    var el=document.getElementById('sdi-'+v);
    if(el)el.classList.toggle('active',currentView===v);
  });
  // Journal drawer
  JOURNAL_VIEWS.forEach(function(v){
    var el=document.getElementById('sdi-'+v);
    if(el)el.classList.toggle('active',currentView===v);
  });
}

// ── Online / Offline Indicator ──
function updateOnlineIndicator(){
  var isOnline=navigator.onLine;
  // Desktop sidebar
  var dot=document.getElementById('onlineDot');
  var txt=document.getElementById('onlineText');
  if(dot){
    dot.style.background=isOnline?'#4ade80':'#ef4444';
    dot.className=isOnline?'dot-pulse-online':'dot-pulse-offline';
  }
  if(txt){txt.textContent=isOnline?'Online':'Offline';txt.style.color=isOnline?'#4ade80':'#ef4444';}
  // Mobile sync drawer
  var dotM=document.getElementById('onlineDotMobile');
  var txtM=document.getElementById('onlineTextMobile');
  if(dotM){
    dotM.style.background=isOnline?'#4ade80':'#ef4444';
    dotM.className=isOnline?'dot-pulse-online':'dot-pulse-offline';
  }
  if(txtM)txtM.textContent=isOnline?'Online':'Offline';
  // Body indicator (shown in My Day subtitle)
  var dotB=document.getElementById('onlineDotBody');
  var txtB=document.getElementById('onlineTextBody');
  var indB=document.getElementById('onlineIndicatorBody');
  if(dotB){dotB.style.background=isOnline?'#4ade80':'#ef4444';dotB.className=isOnline?'dot-pulse-online':'dot-pulse-offline';}
  if(txtB){txtB.textContent=isOnline?'Online':'Offline';txtB.style.color=isOnline?'#4ade80':'#ef4444';}
  if(indB){indB.style.display='none';} // hide old subtitle indicator on mobile
  // Hero indicator (shown in home hero row on mobile)
  var dotH=document.getElementById('onlineDotHero');
  var txtH=document.getElementById('onlineTextHero');
  var indH=document.getElementById('onlineIndicatorHero');
  if(dotH){dotH.style.background=isOnline?'#4ade80':'#ef4444';dotH.className=isOnline?'dot-pulse-online':'dot-pulse-offline';}
  if(txtH){txtH.textContent=isOnline?'Online':'Offline';txtH.style.color=isOnline?'#4ade80':'#ef4444';}
  if(indH){indH.style.display=(currentView==='myday'&&window.innerWidth<=700)?'flex':'none';}
}
window.addEventListener('online',updateOnlineIndicator);
window.addEventListener('offline',updateOnlineIndicator);
window.addEventListener('resize',function(){
  // FIX: Skip saat keyboard mobile muncul (ada input/textarea fokus)
  var _fa=document.activeElement;
  if(_fa&&(_fa.tagName==='INPUT'||_fa.tagName==='TEXTAREA'))return;
  updateMobileBackBtn();updateOnlineIndicator();
});


// Open the correct sub-drawer based on current view (for back button)
function openParentDrawer(){
  if(isFinView(currentView))toggleSubDrawer('fin');
  else if(isMaintView(currentView)||currentView.startsWith('maint-cat-'))toggleSubDrawer('maint');
  else if(isJournalView(currentView))toggleSubDrawer('journal');
  else toggleSubDrawer('task');
}
function updateMobileBackBtn(){
  var isMobile=window.innerWidth<=700;
  var isHome=currentView==='myday';
  var btn=document.getElementById('mobileBackBtn');
  var topbar=document.getElementById('topbar');
  var row2=document.getElementById('topbarRow2');
  var pageTitleWrap=document.getElementById('pageTitleWrap');
  var heroTitle=document.getElementById('homeTitleHero');
  var heroDate=document.getElementById('homeDateHero');

  // Back button selalu disembunyikan (sudah tidak dipakai)
  if(btn) btn.classList.add('hidden');

  if(!isMobile){
    // Desktop: keep topbar normal
    if(topbar){topbar.classList.remove('home-mode','page-mode');}
    if(row2) row2.classList.remove('home-mode');
    if(pageTitleWrap) pageTitleWrap.style.display='';
    return;
  }

  // Mobile: smart mode — home-mode vs page-mode
  if(topbar){
    topbar.classList.toggle('home-mode', isHome);
    topbar.classList.toggle('page-mode', !isHome);
  }
  if(row2) row2.classList.toggle('home-mode', isHome);

  // Sync hero title dengan judul halaman saat ini
  var pageTitleEl=document.getElementById('pageTitle');
  if(heroTitle && pageTitleEl) heroTitle.textContent=pageTitleEl.textContent;

  // Hero date — hanya di home
  if(heroDate){
    if(isHome){
      heroDate.style.display='';
      var d=new Date();
      var days=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
      var months=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
      heroDate.textContent=days[d.getDay()]+', '+d.getDate()+' '+months[d.getMonth()]+' '+d.getFullYear();
    } else {
      heroDate.style.display='none';
    }
  }

  // pageTitleWrap di row1 selalu disembunyikan di mobile (row2 yang dipakai)
  if(pageTitleWrap) pageTitleWrap.style.display='none';
}

// ── Mobile Add Bar ──
var mobileAddBarOpen=false;
function toggleMobileAddBar(){
  if(mobileAddBarOpen)closeMobileAddBar();
  else openMobileAddBar();
}
// ── Shared drag-snap system for all mobile add bars ──
var ADD_BAR_SNAPS=[40,65,88]; // % of viewport height
function setupAddBarDrag(bar,closeFn){
  if(bar._addSwipeAttached)return;
  bar._addSwipeAttached=true;
  var handle=bar.querySelector('.mobile-add-handle');
  if(!handle)return;
  var startY=0,startH=0,isDragging=false,snapIdx=1;
  function getVH(){return window.innerHeight;}
  function snapTo(idx,animate){
    snapIdx=Math.max(0,Math.min(ADD_BAR_SNAPS.length-1,idx));
    var pct=ADD_BAR_SNAPS[snapIdx];
    if(animate){
      bar.style.transition='transform 0.28s cubic-bezier(.32,.72,0,1),height 0.25s cubic-bezier(.32,.72,0,1)';
      requestAnimationFrame(function(){
        bar.style.height=pct+'dvh';
        setTimeout(function(){bar.style.transition='';},280);
      });
    } else {
      bar.style.height=pct+'dvh';
    }
  }
  bar._addResetSnap=function(){snapTo(1,false);};
  var usePointer=!!window.PointerEvent;
  if(usePointer){
    handle.addEventListener('pointerdown',function(e){
      handle.setPointerCapture(e.pointerId);
      startY=e.clientY;startH=bar.getBoundingClientRect().height;isDragging=true;
      bar.classList.add('add-resizing');
    });
    handle.addEventListener('pointermove',function(e){
      if(!isDragging)return;
      var dy=e.clientY-startY;
      var newH=startH-dy;
      var pct=Math.round(newH/getVH()*100);
      pct=Math.max(25,Math.min(94,pct));
      bar.style.height=pct+'dvh';
    });
    handle.addEventListener('pointerup',function(e){
      if(!isDragging)return;
      isDragging=false;bar.classList.remove('add-resizing');
      var dy=e.clientY-startY;
      var curPct=Math.round(bar.getBoundingClientRect().height/getVH()*100);
      if(dy>140||(dy>80&&curPct<28)){closeFn();return;}
      var best=0;
      ADD_BAR_SNAPS.forEach(function(s,i){if(Math.abs(s-curPct)<Math.abs(ADD_BAR_SNAPS[best]-curPct))best=i;});
      snapTo(best,true);
    });
    handle.addEventListener('pointercancel',function(){
      isDragging=false;bar.classList.remove('add-resizing');snapTo(snapIdx,true);
    });
  } else {
    handle.addEventListener('touchstart',function(e){
      startY=e.touches[0].clientY;startH=bar.getBoundingClientRect().height;isDragging=true;
      bar.classList.add('add-resizing');
    },{passive:true});
    handle.addEventListener('touchmove',function(e){
      if(!isDragging)return;
      var dy=e.touches[0].clientY-startY;
      var newH=startH-dy;
      var pct=Math.round(newH/getVH()*100);
      pct=Math.max(25,Math.min(94,pct));
      bar.style.height=pct+'dvh';
    },{passive:true});
    handle.addEventListener('touchend',function(e){
      if(!isDragging)return;isDragging=false;bar.classList.remove('add-resizing');
      var dy=e.changedTouches[0].clientY-startY;
      var curPct=Math.round(bar.getBoundingClientRect().height/getVH()*100);
      if(dy>140||(dy>80&&curPct<28)){closeFn();return;}
      var best=0;
      ADD_BAR_SNAPS.forEach(function(s,i){if(Math.abs(s-curPct)<Math.abs(ADD_BAR_SNAPS[best]-curPct))best=i;});
      snapTo(best,true);
    },{passive:true});
  }
}

function openMobileAddBar(){
  closeSubDrawer();
  mobileAddBarOpen=true;
  var bar=document.getElementById('mobileAddBar');
  var ov=document.getElementById('mobileAddOverlay');
  var fab=document.getElementById('fabAdd');
  if(bar){
    bar.classList.add('open');
    setupAddBarDrag(bar,closeMobileAddBar);
    if(bar._addResetSnap)bar._addResetSnap();
  }
  if(ov)ov.classList.add('show');
  if(fab)fab.classList.add('open');
  buildMobileColorPicker();
  setTimeout(function(){var inp=document.getElementById('mobileTaskInput');if(inp)inp.focus();},300);
  // ── Form tour: tampilkan pertama kali buka ──
  if(typeof ftCheckAndStart==='function') ftCheckAndStart(true);
}
function closeMobileAddBar(){
  mobileAddBarOpen=false;
  var bar=document.getElementById('mobileAddBar');
  var ov=document.getElementById('mobileAddOverlay');
  var fab=document.getElementById('fabAdd');
  if(bar){bar.classList.remove('open');setTimeout(function(){bar.style.height='';},300);}
  if(ov)ov.classList.remove('show');
  if(fab)fab.classList.remove('open');
  // Tutup form tour kalau masih aktif
  if(typeof _ftActive!=='undefined'&&_ftActive) ftFinish();
}

// ══════════════════════════════════════════
// SIDEBAR MODE QUICK-ADD (SQA)
// ══════════════════════════════════════════
var _sqaChipState = {habit:false,important:false,nodue:false,shopping:false};

function _isSidebarMode(){
  return document.body.classList.contains('mobile-nav-sidebar') && window.innerWidth <= 700;
}

// Show/hide the sqa bar based on current view
function updateSidebarQuickAdd(){
  var wrap = document.getElementById('sidebarQuickAdd');
  if(!wrap) return;
  if(!_isSidebarMode()){ wrap.style.display='none'; return; }
  // Show only on task views that support adding
  var taskViews = ['myday','important','planned','all'];
  var show = taskViews.indexOf(currentView) >= 0;
  wrap.style.display = show ? 'block' : 'none';
  // Also hide FAB in sidebar mode entirely
  var fab = document.getElementById('fabAdd');
  if(fab) fab.style.display = 'none';
}

function openSidebarQuickAdd(){
  var collapsed = document.getElementById('sqaCollapsed');
  var expanded  = document.getElementById('sqaExpanded');
  if(!collapsed||!expanded) return;
  collapsed.style.display = 'none';
  expanded.style.display  = 'flex';
  // Sync chips with chipState
  ['habit','important','nodue','shopping'].forEach(function(k){
    var el = document.getElementById('sqachip-'+k);
    if(el) el.classList.toggle('active', !!chipState[k]);
  });
  setTimeout(function(){ var inp=document.getElementById('sqaInput'); if(inp) inp.focus(); }, 80);
  buildSqaColorPicker();
}

function closeSidebarQuickAdd(){
  var collapsed = document.getElementById('sqaCollapsed');
  var expanded  = document.getElementById('sqaExpanded');
  if(collapsed) collapsed.style.display = 'flex';
  if(expanded)  expanded.style.display  = 'none';
  // Reset fields
  var inp = document.getElementById('sqaInput'); if(inp) inp.value='';
  var r = document.getElementById('sqa-repeat'); if(r) r.value='';
  var g = document.getElementById('sqa-group');  if(g) g.value='';
  var d = document.getElementById('sqa-due');    if(d) d.value='';
  taskbarDateUpdateLabel('sqa-due','');
  var t = document.getElementById('sqa-reminder');if(t) t.value='';
  taskbarReminderUpdateLabel('sqa-reminder','');
  var st = document.getElementById('sqa-steps'); if(st) st.value='';
  var sx = document.getElementById('sqa-xp');    if(sx) sx.value='';
  var sg = document.getElementById('sqa-gold');  if(sg) sg.value='';
  chipState.color = '';
  buildSqaColorPicker();
  // Reset chips visuals only (don't touch chipState so desktop stays in sync)
  ['habit','important','nodue','shopping'].forEach(function(k){
    var el = document.getElementById('sqachip-'+k);
    if(el) el.classList.remove('active');
  });
}

function toggleSqaChip(key){
  chipState[key] = !chipState[key];
  var el = document.getElementById('sqachip-'+key);
  if(el) el.classList.toggle('active', chipState[key]);
  // Sync desktop chips too
  var dEl = document.getElementById('chip-'+key);
  if(dEl) dEl.classList.toggle('active', chipState[key]);
  var mEl = document.getElementById('mchip-'+key);
  if(mEl) mEl.classList.toggle('active', chipState[key]);
  // Shopping popup — same as toggleChip
  if(key === 'shopping'){
    if(chipState.shopping) openShoppingQuick();
    else closeShoppingQuick();
  }
}

function addTaskSqa(){
  var inp = document.getElementById('sqaInput');
  var mainInp = document.getElementById('taskInput');
  if(!inp||!mainInp) return;
  mainInp.value = inp.value;
  // Sync selects
  var r=document.getElementById('sqa-repeat'); var dr=document.getElementById('chip-repeat');
  if(r&&dr) dr.value=r.value;
  var g=document.getElementById('sqa-group');  var dg=document.getElementById('chip-group');
  if(g&&dg) dg.value=g.value;
  var d=document.getElementById('sqa-due');    var dd=document.getElementById('chip-due');
  if(d&&dd) dd.value=d.value;
  var t=document.getElementById('sqa-reminder');var dt=document.getElementById('chip-reminder');
  if(t&&dt) dt.value=t.value;
  var st=document.getElementById('sqa-steps'); var dst=document.getElementById('chip-steps');
  if(st&&dst) dst.value=st.value;
  var sx=document.getElementById('sqa-xp');    var dx=document.getElementById('chip-xp');
  if(sx&&dx) dx.value=sx.value;
  var sg=document.getElementById('sqa-gold');  var dg2=document.getElementById('chip-gold');
  if(sg&&dg2) dg2.value=sg.value;
  addTask();
  closeSidebarQuickAdd();
}
function syncMobileChips(){
  // Sync mobile chip visual state with chipState
  var keys=['habit','important','shopping','nodue','pomo'];
  keys.forEach(function(k){
    var el=document.getElementById('mchip-'+k);
    if(el)el.classList.toggle('active',!!chipState[k]);
  });
}
function buildMobileColorPicker(){
  var wrap=document.getElementById('mobileColorPicker');
  if(!wrap)return;
  wrap.innerHTML='';
  COLORS.forEach(function(c){
    var dot=document.createElement('div');
    dot.className='color-dot'+(chipState.color===c?' selected':'');
    dot.style.background=c||'rgba(255,255,255,0.25)';
    dot.style.border='2px solid '+(chipState.color===c?'#fff':'transparent');
    dot.style.width='18px';dot.style.height='18px';
    dot.title=COLOR_NAMES[c]||'Tanpa';
    dot.onclick=function(){
      chipState.color=c;
      // also sync desktop color picker
      var dcp=document.getElementById('colorPicker');
      if(dcp){dcp.querySelectorAll('.color-dot').forEach(function(d){d.classList.remove('selected');d.style.border='2px solid transparent';});var dm=dcp.querySelector('[title="'+(COLOR_NAMES[c]||'Tanpa')+'"]');if(dm){dm.classList.add('selected');dm.style.border='2px solid var(--text)';}}
      wrap.querySelectorAll('.color-dot').forEach(function(d){
        d.style.border='2px solid transparent';
        d.classList.remove('selected');
      });
      dot.style.border='2px solid #fff';
      dot.classList.add('selected');
    };
    wrap.appendChild(dot);
  });
}
function buildSqaColorPicker(){
  var wrap=document.getElementById('sqaColorPicker');
  if(!wrap)return;
  wrap.innerHTML='';
  COLORS.forEach(function(c){
    var dot=document.createElement('div');
    dot.className='color-dot'+(chipState.color===c?' selected':'');
    dot.style.background=c||'rgba(128,128,128,0.35)';
    dot.style.border='2px solid '+(chipState.color===c?'var(--text)':'transparent');
    dot.style.width='16px';dot.style.height='16px';
    dot.title=COLOR_NAMES[c]||'Tanpa';
    dot.onclick=function(){
      chipState.color=c;
      var dcp=document.getElementById('colorPicker');
      if(dcp){dcp.querySelectorAll('.color-dot').forEach(function(d){d.classList.remove('selected');d.style.border='2px solid transparent';});var dm=dcp.querySelector('[title="'+(COLOR_NAMES[c]||'Tanpa')+'"]');if(dm){dm.classList.add('selected');dm.style.border='2px solid var(--text)';}}
      wrap.querySelectorAll('.color-dot').forEach(function(d){d.style.border='2px solid transparent';d.classList.remove('selected');});
      dot.style.border='2px solid var(--text)';dot.classList.add('selected');
    };
    wrap.appendChild(dot);
  });
}
function addTaskMobile(){
  // Copy value from mobile input to main input and use addTask
  var mobileInp=document.getElementById('mobileTaskInput');
  var mainInp=document.getElementById('taskInput');
  if(!mobileInp||!mainInp)return;
  mainInp.value=mobileInp.value;
  // Sync the selects
  var mRepeat=document.getElementById('mchip-repeat');
  var dRepeat=document.getElementById('chip-repeat');
  if(mRepeat&&dRepeat)dRepeat.value=mRepeat.value;
  var mGroup=document.getElementById('mchip-group');
  var dGroup=document.getElementById('chip-group');
  if(mGroup&&dGroup)dGroup.value=mGroup.value;
  var mDue=document.getElementById('mchip-due');
  var dDue=document.getElementById('chip-due');
  if(mDue&&dDue){ dDue.value=mDue.value; taskbarDateUpdateLabel('chip-due',mDue.value); }
  var mRem=document.getElementById('mchip-reminder');
  var dRem=document.getElementById('chip-reminder');
  if(mRem&&dRem)dRem.value=mRem.value;
  // Sync steps, xp, color
  var mSteps=document.getElementById('mchip-steps');
  var dSteps=document.getElementById('chip-steps');
  if(mSteps&&dSteps)dSteps.value=mSteps.value;
  var mXp=document.getElementById('mchip-xp');
  var dXp=document.getElementById('chip-xp');
  if(mXp&&dXp)dXp.value=mXp.value;
  var mGold=document.getElementById('mchip-gold');
  var dGold=document.getElementById('chip-gold');
  if(mGold&&dGold)dGold.value=mGold.value;
  addTask();
  // Reset
  mobileInp.value='';
  if(mRepeat)mRepeat.value='';
  if(mGroup)mGroup.value='';
  if(mDue)mDue.value='';
  taskbarDateUpdateLabel('mchip-due','');
  if(mRem)mRem.value='';
  taskbarReminderUpdateLabel('mchip-reminder','');
  if(mXp)mXp.value='';
  var mGold2=document.getElementById('mchip-gold');
  if(mGold2)mGold2.value='';
  // Reset mobile color picker
  chipState.color='';
  buildMobileColorPicker();
  closeMobileAddBar();
}

function updateBottomNav(){
  if(!isMobile())return;
  var els=document.querySelectorAll('.bn-item');
  els.forEach(function(el){el.classList.remove('active','fin-active','maint-active');});
  var taskBtn=document.getElementById('bn-task');
  var finBtn=document.getElementById('bn-fin');
  var maintBtn=document.getElementById('bn-maint');
  var syncBtn=document.getElementById('bn-sync');
  var journalBtn=document.getElementById('bn-journal');
  if(isFinView(currentView)&&finBtn){finBtn.classList.add('fin-active');}
  else if((isMaintView(currentView)||currentView.startsWith('maint-cat-'))&&maintBtn){maintBtn.classList.add('maint-active');}
  else if(isJournalView(currentView)&&journalBtn){journalBtn.classList.add('active');}
  else if(taskBtn){taskBtn.classList.add('active');}
  // update maint badge (on "Lainnya" button)
  var badge=document.getElementById('bn-maint-badge');
  if(badge){var c=getMaintDueCount();badge.textContent=c;badge.style.display=c?'':'none';}
  // update task badge
  var tbadge=document.getElementById('bn-task-badge');
  if(tbadge){var tc=tasks.filter(function(t){return !t.done&&!(t.history&&t.history.indexOf(todayStr)>=0)&&(!t.due||t.due===todayStr);}).length;tbadge.textContent=tc;tbadge.style.display=tc?'':'none';}
  // update sub-drawer active items
  updateSubDrawerActive();
  // update journal count badge
  var jcnt=document.getElementById('sdi-cnt-journal');
  if(jcnt){var jc=journalEntries.length;jcnt.textContent=jc;jcnt.style.display=jc?'':'none';}
  // update sdi counts
  var cntMap={
    'sdi-cnt-myday':tasks.filter(function(t){return !t.done&&!(t.history&&t.history.indexOf(todayStr)>=0)&&(!t.due||t.due===todayStr);}).length,
    'sdi-cnt-important':tasks.filter(function(t){return t.important&&!t.done;}).length,
    'sdi-cnt-planned':tasks.filter(function(t){
      if(t._nextDue && t.done) return true;
      if(!t.due) return false;
      if(isEffectiveDone(t)) return false;
      if(t.due > todayStr) return true;
      return !isDoneForDate(t, t.due);
    }).length,
    'sdi-cnt-completed':tasks.filter(function(t){
      if(t.due&&t.due>todayStr)return false;
      if(t.done&&t.doneDate===todayStr)return true;
      if(!t.done&&t.history&&t.history.indexOf(todayStr)>=0)return true;
      return false;
    }).length
  };
  Object.keys(cntMap).forEach(function(id){
    var el=document.getElementById(id);
    if(el){el.textContent=cntMap[id];el.style.display=cntMap[id]?'':'none';}
  });
  // Finance badges in subdrawer
  var tagihanDue=finTagihan?finTagihan.filter(function(t){
    if(t.status==='paid')return false;
    var d=getTagihanNextDue&&getTagihanNextDue(t);if(!d)return false;
    var diff=Math.round((new Date(d+'T00:00:00')-new Date(todayStr+'T00:00:00'))/86400000);return diff<=7;
  }).length:0;
  var hutangActive=finHutang?finHutang.filter(function(h){return getSisaHutang&&getSisaHutang(h)>0;}).length:0;
  var sdTag=document.getElementById('sdi-cnt-tagihan');
  if(sdTag){sdTag.textContent=tagihanDue;sdTag.style.display=tagihanDue?'':'none';}
  var sdHut=document.getElementById('sdi-cnt-hutang');
  if(sdHut){sdHut.textContent=hutangActive;sdHut.style.display=hutangActive?'':'none';}
  // Maint badge in subdrawer
  var sdMaint=document.getElementById('sdi-cnt-maint');
  if(sdMaint){var mc=getMaintDueCount?getMaintDueCount():0;sdMaint.textContent=mc;sdMaint.style.display=mc?'':'none';}
  updateMobileBackBtn();
}


// ── Mobile Finance Add Bar ──
var mfinType='expense';
function setMFinType(type){
  mfinType=type;
  var styles={
    expense:{out:'rgba(220,38,38,0.35)',outC:'#fca5a5',in:'rgba(255,255,255,0.08)',inC:'rgba(255,255,255,0.4)',tr:'rgba(255,255,255,0.08)',trC:'rgba(255,255,255,0.4)'},
    income:{out:'rgba(255,255,255,0.08)',outC:'rgba(255,255,255,0.4)',in:'rgba(22,163,74,0.35)',inC:'#86efac',tr:'rgba(255,255,255,0.08)',trC:'rgba(255,255,255,0.4)'},
    transfer:{out:'rgba(255,255,255,0.08)',outC:'rgba(255,255,255,0.4)',in:'rgba(255,255,255,0.08)',inC:'rgba(255,255,255,0.4)',tr:'rgba(59,130,246,0.35)',trC:'#93c5fd'}
  };
  var s=styles[type];
  var btnOut=document.getElementById('mfin-type-out');
  var btnIn=document.getElementById('mfin-type-in');
  var btnTr=document.getElementById('mfin-type-transfer');
  if(btnOut){btnOut.style.background=s.out;btnOut.style.color=s.outC;}
  if(btnIn){btnIn.style.background=s.in;btnIn.style.color=s.inC;}
  if(btnTr){btnTr.style.background=s.tr;btnTr.style.color=s.trC;}
  var w2=document.getElementById('mfin-wallet2-row');
  if(w2)w2.style.display=(type==='transfer')?'block':'none';
  // Update category dropdown for type
  var catSel=document.getElementById('mfin-cat');
  if(catSel){
    var typeKey=type==='transfer'?'saving':type==='income'?'income':'expense';
    var cats=finCategories[typeKey]||finCategories['expense']||[];
    catSel.innerHTML=['<option value="">— Pilih Kategori —</option>'].concat(cats.map(function(c){return'<option value="'+c+'">'+c+'</option>';})).join('');
  }
}
function openMobileFinAddBar(){
  closeSubDrawer();
  mobileAddBarOpen=true;
  var bar=document.getElementById('mobileFinAddBar');
  var ov=document.getElementById('mobileFinAddOverlay');
  var fab=document.getElementById('fabAdd');
  if(bar){
    bar.classList.add('open');
    setupAddBarDrag(bar,closeMobileFinAddBar);
    if(bar._addResetSnap)bar._addResetSnap();
  }
  if(ov)ov.classList.add('show');
  if(fab)fab.classList.add('open');
  var catSel=document.getElementById('mfin-cat');
  if(catSel){
    var cats=finCategories['expense']||[];
    catSel.innerHTML=['<option value="">— Pilih Kategori —</option>'].concat(cats.map(function(c){return'<option value="'+c+'">'+c+'</option>';})).join('');
  }
  var walletSel=document.getElementById('mfin-wallet');
  var wallet2Sel=document.getElementById('mfin-wallet2');
  var walletOpts=buildWalletOpts('');
  if(walletSel)walletSel.innerHTML=walletOpts;
  if(wallet2Sel)wallet2Sel.innerHTML=buildWalletOpts('');
  var dateFld=document.getElementById('mfin-date');
  if(dateFld)dateFld.value=todayStr;
  mfinType='expense';
  setMFinType('expense');
  setTimeout(function(){var inp=document.getElementById('mfin-desc');if(inp)inp.focus();},300);
}
function closeMobileFinAddBar(){
  mobileAddBarOpen=false;
  var bar=document.getElementById('mobileFinAddBar');
  var ov=document.getElementById('mobileFinAddOverlay');
  var fab=document.getElementById('fabAdd');
  if(bar){bar.classList.remove('open');setTimeout(function(){bar.style.height='';},300);}
  if(ov)ov.classList.remove('show');
  if(fab)fab.classList.remove('open');
}
function submitMobileFinAdd(){
  var desc=document.getElementById('mfin-desc').value.trim();
  var amount=getRawVal(document.getElementById('mfin-amount'))||0;
  var catSel=document.getElementById('mfin-cat');
  var catId=catSel?catSel.value:'';
  var walSel=document.getElementById('mfin-wallet');
  var walletId=walSel?walSel.value:'';
  var dateFld=document.getElementById('mfin-date');
  var date=dateFld?dateFld.value:todayStr;
  if(!desc){showToast('⚠️ Deskripsi wajib diisi');return;}
  if(!amount){showToast('⚠️ Jumlah wajib diisi');return;}
  // Reuse existing addFinTransaction if available, else build manually
  var tx={id:'f'+finNextId++,type:mfinType,amount:amount,desc:desc,category:catId,walletId:walletId,date:date||todayStr};
  if(mfinType==='transfer'){
    var w2Sel=document.getElementById('mfin-wallet2');
    tx.walletId2=w2Sel?w2Sel.value:'';
  }
  finTransactions.push(tx);
  // Check budget warning
  if(mfinType==='expense'&&catId){
    var txDate=new Date((date||todayStr)+'T00:00:00');
    checkBudgetWarning(catId,amount,txDate.getMonth(),txDate.getFullYear());
  }
  // Adjust wallet balances
  var walletFrom=finWallets.filter(function(ww){return ww.id===walletId;})[0];
  if(mfinType==='expense'){
    if(walletFrom)walletFrom.balance-=amount;
  } else if(mfinType==='income'){
    if(walletFrom)walletFrom.balance+=amount;
  } else if(mfinType==='transfer'){
    var walletTo=finWallets.filter(function(ww){return ww.id===tx.walletId2;})[0];
    if(walletFrom)walletFrom.balance-=amount;
    if(walletTo)walletTo.balance+=amount;
  }
  saveData(true);render();
  closeMobileFinAddBar();
  document.getElementById('mfin-desc').value='';
  document.getElementById('mfin-amount').value='';
  showToast('✅ Transaksi berhasil ditambahkan!');
}

// ── Mobile Maintenance Add Bar ──
function openMobileMaintAddBar(){
  closeSubDrawer();
  mobileAddBarOpen=true;
  var bar=document.getElementById('mobileMaintAddBar');
  var ov=document.getElementById('mobileMaintAddOverlay');
  var fab=document.getElementById('fabAdd');
  if(bar){
    bar.classList.add('open');
    setupAddBarDrag(bar,closeMobileMaintAddBar);
    if(bar._addResetSnap)bar._addResetSnap();
  }
  if(ov)ov.classList.add('show');
  if(fab)fab.classList.add('open');
  // Populate category
  var catSel=document.getElementById('mmaint-cat');
  if(catSel){
    // Pre-select current maint category if on a category view
    var currentCatId=currentView.startsWith('maint-cat-')?currentView.replace('maint-cat-',''):'';
    catSel.innerHTML=maintCategories.map(function(c){
      return'<option value="'+c.id+'"'+(c.id===currentCatId?' selected':'')+'>'+c.icon+' '+c.name+'</option>';
    }).join('');
  }
  var lastFld=document.getElementById('mmaint-last');
  if(lastFld)lastFld.value=todayStr;
  setTimeout(function(){var inp=document.getElementById('mmaint-name');if(inp)inp.focus();},300);
}
function closeMobileMaintAddBar(){
  mobileAddBarOpen=false;
  var bar=document.getElementById('mobileMaintAddBar');
  var ov=document.getElementById('mobileMaintAddOverlay');
  var fab=document.getElementById('fabAdd');
  if(bar){bar.classList.remove('open');setTimeout(function(){bar.style.height='';},300);}
  if(ov)ov.classList.remove('show');
  if(fab)fab.classList.remove('open');
}
function submitMobileMaintAdd(){
  var name=document.getElementById('mmaint-name').value.trim();
  var catSel=document.getElementById('mmaint-cat');
  var catId=catSel?catSel.value:'';
  var lastDate=document.getElementById('mmaint-last').value||todayStr;
  var intervalDays=parseInt(document.getElementById('mmaint-interval').value)||0;
  var cost=getRawVal(document.getElementById('mmaint-cost'))||0;
  var note=document.getElementById('mmaint-note').value.trim();
  if(!name){showToast('⚠️ Nama item wajib diisi');return;}
  if(!intervalDays){showToast('⚠️ Interval hari wajib diisi');return;}
  var nextDate=computeNextDate(lastDate,intervalDays);
  var item={id:'m'+maintNextId++,name:name,categoryId:catId,lastDate:lastDate,intervalDays:intervalDays,nextDate:nextDate,cost:cost||null,note:note||null};
  maintItems.push(item);
  saveData(true);render();
  closeMobileMaintAddBar();
  document.getElementById('mmaint-name').value='';
  document.getElementById('mmaint-interval').value='';
  document.getElementById('mmaint-cost').value='';
  document.getElementById('mmaint-note').value='';
  showToast('✅ Item maintenance berhasil ditambahkan!');
}


// ══════════════════════════════════════════════════════════
// 💰 BUDGET PER KATEGORI
// ══════════════════════════════════════════════════════════

function getBudgetUsed(cat, month, year){
  return getFinMonthTx(month,year)
    .filter(function(tx){return tx.type==='expense'&&tx.category===cat;})
    .reduce(function(s,tx){return s+tx.amount;},0);
}

function getBudgetStatus(cat, month, year){
  var limit=finBudgets[cat]||0;
  if(!limit)return null;
  var used=getBudgetUsed(cat,month,year);
  var pct=used/limit*100;
  return{limit:limit,used:used,pct:pct,safe:pct<80,warn:pct>=80&&pct<100,over:pct>=100};
}

function getBudgetSummary(month, year){
  var cats=Object.keys(finBudgets);
  var safe=0,warn=0,over=0;
  cats.forEach(function(c){
    var s=getBudgetStatus(c,month,year);
    if(!s)return;
    if(s.over)over++;
    else if(s.warn)warn++;
    else safe++;
  });
  return{safe:safe,warn:warn,over:over,total:cats.length};
}

function updateBudgetOverBadge(){
  var s=getBudgetSummary(today.getMonth(),today.getFullYear());
  var el=document.getElementById('cnt-budget-over');
  if(el){
    var hasIssue=s.over>0||s.warn>0;
    el.textContent=s.over>0?'🔴'+(s.over):'⚠️';
    el.style.display=hasIssue?'':'none';
    el.style.background=s.over>0?'rgba(220,38,38,0.3)':'rgba(245,158,11,0.3)';
    el.style.color=s.over>0?'#fca5a5':'#fde68a';
  }
}

function renderFinBudget(fw){
  updateBudgetOverBadge();
  var summary=getBudgetSummary(finViewMonth,finViewYear);
  var expCats=finCategories.expense||[];
  var budgetedCats=Object.keys(finBudgets);

  var html=finMonthNav();

  // Summary cards
  html+='<div class="budget-summary-cards">'
    +'<div class="budget-summary-card"><div class="budget-summary-num" style="color:var(--green)">'+summary.safe+'</div><div class="budget-summary-lbl">✅ Aman</div></div>'
    +'<div class="budget-summary-card"><div class="budget-summary-num" style="color:#f59e0b">'+summary.warn+'</div><div class="budget-summary-lbl">⚠️ Hampir Habis</div></div>'
    +'<div class="budget-summary-card"><div class="budget-summary-num" style="color:var(--red)">'+summary.over+'</div><div class="budget-summary-lbl">🔴 Over Budget</div></div>'
    +'</div>';

  // Budget cards per category that has a limit set
  if(budgetedCats.length){
    html+='<div class="fin-section-title">🎯 Budget Kategori</div>';
    budgetedCats.forEach(function(cat){
      var s=getBudgetStatus(cat,finViewMonth,finViewYear);
      if(!s)return;
      var fillClass=s.over?'over':s.warn?'warn':'safe';
      var fillColor=s.over?'var(--red)':s.warn?'#f59e0b':'var(--green)';
      var usedColor=s.over?'var(--red)':s.warn?'#f59e0b':'var(--green)';
      var sisa=s.limit-s.used;
      html+='<div class="budget-card">'
        +'<div class="budget-cat-header">'
        +'<div class="budget-cat-name">'+cat+'</div>'
        +'<div style="display:flex;gap:8px;align-items:center">'
        +'<div class="budget-amounts"><span class="budget-used" style="color:'+usedColor+'">'+fmtRp(s.used)+'</span><span class="budget-total"> / '+fmtRp(s.limit)+'</span></div>'
        +'<button onclick="openBudgetModal(\''+cat+'\')" style="border:none;background:rgba(0,0,0,0.05);border-radius:5px;cursor:pointer;font-size:11px;padding:3px 8px;color:var(--muted);font-family:DM Sans,sans-serif">Edit</button>'
        +'<button onclick="deleteBudget(\''+cat+'\')" style="border:none;background:none;cursor:pointer;font-size:13px;color:var(--muted);padding:2px 4px">×</button>'
        +'</div></div>'
        +'<div class="budget-bar-wrap"><div class="budget-bar-fill '+fillClass+'" style="width:'+Math.min(100,s.pct).toFixed(1)+'%"></div></div>'
        +'<div class="budget-info-row">'
        +'<span>'+(s.over?'<b style="color:var(--red)">Over '+fmtRp(Math.abs(sisa))+'!</b>':sisa>0?'Sisa: <b style="color:var(--green)">'+fmtRp(sisa)+'</b>':'Tepat budget')+'</span>'
        +'<span style="font-family:DM Mono,monospace">'+s.pct.toFixed(0)+'%</span>'
        +'</div>'
        +'</div>';
    });
  }

  // Categories without budget
  var unbudgeted=expCats.filter(function(c){return !finBudgets[c];});
  html+='<div class="fin-section-title" style="margin-top:14px">➕ Set Budget Kategori Baru</div>';
  html+='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">';
  unbudgeted.forEach(function(c){
    html+='<button onclick="openBudgetModal(\''+c+'\')" style="padding:6px 12px;border:1px dashed var(--border);border-radius:20px;background:var(--card);font-size:12px;cursor:pointer;color:var(--muted);font-family:DM Sans,sans-serif;transition:all 0.15s" onmouseover="this.style.borderColor=\'var(--accent)\'" onmouseout="this.style.borderColor=\'var(--border)\'">+ '+c+'</button>';
  });
  html+='<button onclick="openBudgetModal(\'\')" style="padding:6px 12px;border:1.5px solid var(--accent);border-radius:20px;background:rgba(217,119,6,0.08);font-size:12px;cursor:pointer;color:var(--accent);font-family:DM Sans,sans-serif;font-weight:600">+ Kategori Lain</button>';
  html+='</div>';

  // Budget vs aktual chart
  if(budgetedCats.length){
    html+='<div class="chart-wrap"><div class="chart-title">📊 Budget vs Aktual</div>';
    budgetedCats.forEach(function(cat){
      var s=getBudgetStatus(cat,finViewMonth,finViewYear);
      if(!s)return;
      var pct=Math.min(100,s.pct);
      var color=s.over?'var(--red)':s.warn?'#f59e0b':'var(--green)';
      html+='<div style="margin-bottom:10px">'
        +'<div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px"><span style="font-weight:500">'+cat+'</span><span style="font-family:DM Mono;color:'+color+'">'+s.pct.toFixed(0)+'%</span></div>'
        +'<div style="position:relative;height:10px;background:var(--border);border-radius:5px;overflow:hidden">'
        +'<div style="height:100%;width:'+pct+'%;background:'+color+';border-radius:5px;transition:width 0.4s"></div>'
        +'</div>'
        +'<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--muted);margin-top:2px"><span>Dipakai: '+fmtRp(s.used)+'</span><span>Limit: '+fmtRp(s.limit)+'</span></div>'
        +'</div>';
    });
    html+='</div>';
  }

  fw.innerHTML=html;
}

function openBudgetModal(cat){
  var modal=document.getElementById('budgetSetModal');
  var catSel=document.getElementById('bsm-cat');
  var allCats=(finCategories.expense||[]);
  catSel.innerHTML=allCats.map(function(c){return'<option value="'+c+'"'+(c===cat?' selected':'')+'>'+c+'</option>';}).join('');
  if(cat)catSel.value=cat;
  document.getElementById('bsm-amount').value=cat&&finBudgets[cat]?finBudgets[cat]:'';
  modal.style.display='flex';
  setTimeout(function(){document.getElementById('bsm-amount').focus();},100);
}
function closeBudgetModal(){document.getElementById('budgetSetModal').style.display='none';}
function saveBudget(){
  var cat=document.getElementById('bsm-cat').value;
  var amt=parseFloat(document.getElementById('bsm-amount').value)||0;
  if(!cat){showToast('⚠️ Pilih kategori dulu');return;}
  if(!amt){showToast('⚠️ Masukkan jumlah limit');return;}
  finBudgets[cat]=amt;
  closeBudgetModal();
  saveData(true);render();
  showToast('✅ Budget '+cat+' disimpan: '+fmtRp(amt)+'/bulan');
}
function deleteBudget(cat){
  delete finBudgets[cat];
  saveData(true);render();
  showToast('Budget '+cat+' dihapus');
}

// Budget warning on new transaction
function checkBudgetWarning(category, amount, month, year){
  if(!category||!finBudgets[category])return;
  var limit=finBudgets[category];
  var usedBefore=getBudgetUsed(category,month,year);
  var usedAfter=usedBefore+amount;
  var pctAfter=usedAfter/limit*100;
  if(usedBefore/limit<1&&pctAfter>=100){
    showToast('🔴 Budget '+category+' terlampaui! ('+fmtRp(usedAfter)+' / '+fmtRp(limit)+')');
  } else if(usedBefore/limit<0.8&&pctAfter>=80){
    showToast('⚠️ Budget '+category+' hampir habis ('+pctAfter.toFixed(0)+'%)');
  }
}


// Override addFinTx to check budget after adding
var _origAddFinTx=addFinTx;
addFinTx=function(){
  var typeEl=document.getElementById('fin-tx-type');
  var catEl=document.getElementById('fin-tx-cat');
  var amtEl=document.getElementById('fin-tx-amount');
  var type=typeEl?typeEl.value:'';
  var cat=catEl?catEl.value.trim():'';
  var amount=parseFloat(amtEl?amtEl.value:0)||0;
  if(type==='expense'&&cat&&amount){
    checkBudgetWarning(cat,amount,finViewMonth,finViewYear);
  }
  _origAddFinTx();
};

// ══════════════════════════════════════════════════════════
// 📄 LAPORAN PDF EXPORT
// ══════════════════════════════════════════════════════════

function exportFinPDF(){
  var months=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  var m=finViewMonth,y=finViewYear;
  var monthLabel=months[m]+' '+y;
  var s=getFinSummary(m,y);
  var txs=getFinMonthTx(m,y).sort(function(a,b){return a.date.localeCompare(b.date);});
  var totalBal=getTotalWalletBalance();

  // Category breakdown
  var cats={};
  txs.filter(function(tx){return tx.type==='expense';}).forEach(function(tx){
    var c=tx.category||'Lainnya';cats[c]=(cats[c]||0)+tx.amount;
  });
  var catKeys=Object.keys(cats).sort(function(a,b){return cats[b]-cats[a];});
  var maxCat=catKeys.length?Math.max.apply(null,catKeys.map(function(k){return cats[k];})):1;

  // Budget vs aktual
  var budgetRows='';
  Object.keys(finBudgets).forEach(function(cat){
    var bs=getBudgetStatus(cat,m,y);
    if(!bs)return;
    var statusEmoji=bs.over?'🔴':bs.warn?'⚠️':'✅';
    budgetRows+='<tr><td>'+cat+'</td><td style="text-align:right">'+fmtRp(bs.used)+'</td><td style="text-align:right">'+fmtRp(bs.limit)+'</td><td style="text-align:center">'+statusEmoji+' '+bs.pct.toFixed(0)+'%</td></tr>';
  });

  // Build bar chart SVG for categories
  var barSVG='';
  if(catKeys.length){
    var bh=120,bw=500,barW=Math.min(36,Math.floor(bw/(catKeys.length*1.6)));
    var gap=Math.floor(bw/catKeys.length);
    barSVG='<svg width="'+bw+'" height="'+(bh+50)+'" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">';
    catKeys.forEach(function(k,i){
      var h=Math.round((cats[k]/maxCat)*bh);
      var x=i*gap+gap/2-barW/2;
      barSVG+='<rect x="'+x+'" y="'+(bh-h)+'" width="'+barW+'" height="'+h+'" rx="3" fill="#dc2626" opacity="0.8"/>';
      barSVG+='<text x="'+(x+barW/2)+'" y="'+(bh-h-4)+'" text-anchor="middle" font-size="9" fill="#555">'+fmtRp(cats[k]).replace('Rp ','')+'</text>';
      var label=k.length>8?k.slice(0,8)+'…':k;
      barSVG+='<text x="'+(x+barW/2)+'" y="'+(bh+14)+'" text-anchor="middle" font-size="9" fill="#555">'+label+'</text>';
    });
    barSVG+='<line x1="0" y1="'+bh+'" x2="'+bw+'" y2="'+bh+'" stroke="#e7e5e4" stroke-width="1"/>';
    barSVG+='</svg>';
  }

  // Transaction table rows
  var txRows=txs.slice(0,50).map(function(tx){
    var w=getWalletById(tx.walletId);
    var typeLabel=tx.type==='income'?'📥 Masuk':tx.type==='expense'?'📤 Keluar':'💙 Tabungan';
    var amtColor=tx.type==='income'?'#16a34a':tx.type==='expense'?'#dc2626':'#3b82f6';
    return '<tr><td>'+fmtDate(tx.date)+'</td>'
      +'<td>'+typeLabel+'</td>'
      +'<td>'+(tx.note||tx.category||'-')+'</td>'
      +'<td>'+(tx.category||'-')+'</td>'
      +'<td>'+(w?w.icon+' '+w.name:'-')+'</td>'
      +'<td style="text-align:right;color:'+amtColor+';font-weight:600">'+(tx.type==='expense'?'-':'+')+''+fmtRp(tx.amount)+'</td>'
      +'</tr>';
  }).join('');

  var html='<!DOCTYPE html><html><head><meta charset="UTF-8">'
    +'<title>Laporan Keuangan - '+monthLabel+'</title>'
    +'<style>'
    +'*{box-sizing:border-box;margin:0;padding:0}'
    +'body{font-family:"Segoe UI",Arial,sans-serif;font-size:12px;color:#1c1917;background:#fff;padding:0}'
    +'.page{max-width:794px;margin:0 auto;padding:32px}'
    +'.header{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #d97706;padding-bottom:14px;margin-bottom:24px}'
    +'.app-name{font-size:22px;font-weight:800;color:#1c1917;letter-spacing:-0.5px}'
    +'.app-name span{color:#d97706}'
    +'.period{font-size:13px;color:#78716c;text-align:right}'
    +'.section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#78716c;margin-bottom:10px;margin-top:20px;display:flex;align-items:center;gap:6px}'
    +'.summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:6px}'
    +'.sum-card{background:#f9f7f5;border:1px solid #e7e5e4;border-radius:8px;padding:12px}'
    +'.sum-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#78716c;margin-bottom:4px}'
    +'.sum-val{font-size:15px;font-weight:800;font-family:monospace}'
    +'table{width:100%;border-collapse:collapse;margin-bottom:6px}'
    +'th{background:#f9f7f5;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#78716c;padding:7px 8px;border-bottom:2px solid #e7e5e4}'
    +'td{padding:6px 8px;border-bottom:1px solid #f0ede8;font-size:11px}'
    +'tr:last-child td{border-bottom:none}'
    +'.wallet-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px}'
    +'.wallet-card{background:#f9f7f5;border:1px solid #e7e5e4;border-radius:8px;padding:10px;text-align:center}'
    +'.footer{margin-top:32px;padding-top:12px;border-top:1px solid #e7e5e4;display:flex;justify-content:space-between;font-size:10px;color:#a8a29e}'
    +'@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}'
    +'</style></head><body><div class="page">'
    +'<div class="header">'
    +'<div><div class="app-name">Chi<span>Task</span></div><div style="font-size:11px;color:#78716c;margin-top:2px">Laporan Keuangan</div></div>'
    +'<div class="period"><div style="font-size:16px;font-weight:700;color:#1c1917">'+monthLabel+'</div><div style="margin-top:3px">Dibuat: '+new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})+'</div></div>'
    +'</div>'

    +'<div class="section-title">📊 Ringkasan</div>'
    +'<div class="summary-grid">'
    +'<div class="sum-card"><div class="sum-label">Pemasukan</div><div class="sum-val" style="color:#16a34a">'+fmtRp(s.income)+'</div></div>'
    +'<div class="sum-card"><div class="sum-label">Pengeluaran</div><div class="sum-val" style="color:#dc2626">'+fmtRp(s.expense)+'</div></div>'
    +'<div class="sum-card"><div class="sum-label">Net</div><div class="sum-val" style="color:'+(s.net>=0?'#16a34a':'#dc2626')+'">'+fmtRp(Math.abs(s.net))+'</div></div>'
    +'<div class="sum-card"><div class="sum-label">Total Saldo</div><div class="sum-val" style="color:#3b82f6">'+fmtRp(totalBal)+'</div></div>'
    +'</div>'

    +'<div class="section-title">👛 Status Wallet</div>'
    +'<div class="wallet-grid">'
    +finWallets.map(function(w){return'<div class="wallet-card"><div style="font-size:20px">'+w.icon+'</div><div style="font-weight:600;font-size:12px;margin:3px 0">'+w.name+'</div><div style="font-weight:700;font-family:monospace;color:#3b82f6">'+fmtRp(w.balance)+'</div></div>';}).join('')
    +'</div>'

    +(catKeys.length?'<div class="section-title">🏷️ Pengeluaran per Kategori</div>'
    +'<div style="margin-bottom:8px">'+barSVG+'</div>'
    +'<table><thead><tr><th>Kategori</th><th style="text-align:right">Jumlah</th><th style="text-align:right">%</th></tr></thead><tbody>'
    +catKeys.map(function(k){return'<tr><td>'+k+'</td><td style="text-align:right;font-family:monospace;font-weight:600;color:#dc2626">'+fmtRp(cats[k])+'</td><td style="text-align:right;color:#78716c">'+(s.expense?(cats[k]/s.expense*100).toFixed(1)+'%':'—')+'</td></tr>';}).join('')
    +'</tbody></table>':'')

    +(budgetRows?'<div class="section-title">💰 Budget vs Aktual</div>'
    +'<table><thead><tr><th>Kategori</th><th style="text-align:right">Digunakan</th><th style="text-align:right">Limit</th><th style="text-align:center">Status</th></tr></thead><tbody>'+budgetRows+'</tbody></table>':'')

    +(txs.length?'<div class="section-title">📒 Daftar Transaksi ('+txs.length+' transaksi'+(txs.length>50?' — menampilkan 50 pertama':'')+') </div>'
    +'<table><thead><tr><th>Tanggal</th><th>Tipe</th><th>Keterangan</th><th>Kategori</th><th>Wallet</th><th style="text-align:right">Jumlah</th></tr></thead><tbody>'+txRows+'</tbody></table>':'<div style="color:#78716c;font-size:12px;padding:12px 0">Tidak ada transaksi bulan ini.</div>')

    +'<div class="footer"><span>ChiTask — Laporan '+monthLabel+'</span><span>Dicetak '+new Date().toLocaleString('id-ID')+'</span></div>'
    +'</div>\n</body></html>';

  var win=window.open('','_blank');
  if(win){
    win.document.write(html);
    win.document.close();
    setTimeout(function(){win.print();},600);
  }
}

// ══════════════════════════════════════════════════════════
// 📓 JURNAL HARIAN
// ══════════════════════════════════════════════════════════

var MOODS=['😔','😐','🙂','😊','🤩'];
var MOOD_LABELS=['Sedih','Biasa','Oke','Senang','Bahagia'];

function getJournalEntry(dateStr){
  return journalEntries.filter(function(e){return e.date===dateStr;})[0]||null;
}

function getJournalStreak(){
  var streak=0;
  var d=new Date(today);
  for(var i=0;i<365;i++){
    var ds=localDateStr(d);
    if(getJournalEntry(ds)){streak++;}
    else if(i>0){break;} // Allow today to not yet be written
    d.setDate(d.getDate()-1);
  }
  return streak;
}

function renderJournalView(el){
  switch(currentView){
    case 'journal-today': renderJournalToday(el);break;
    case 'journal-all': renderJournalAll(el);break;
    case 'journal-search': renderJournalSearchView(el);break;
  }
}

function renderJournalToday(el){
  var entry=getJournalEntry(todayStr);
  var streak=getJournalStreak();
  var weekEntries=[];
  for(var i=6;i>=0;i--)weekEntries.push({date:offset(-i),has:!!getJournalEntry(offset(-i))});

  var html='';

  // Streak & week overview
  html+='<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:16px">'
    +'<div class="journal-streak-badge">✍️ '+streak+' hari streak</div>'
    +'<div style="display:flex;gap:4px">';
  weekEntries.forEach(function(w){
    var isToday=w.date===todayStr;
    var bg=w.has?'#8b5cf6':isToday?'rgba(139,92,246,0.15)':'var(--border)';
    var label=new Date(w.date+'T00:00:00').toLocaleDateString('id-ID',{weekday:'short'}).slice(0,2);
    html+='<div style="display:flex;flex-direction:column;align-items:center;gap:3px">'
      +'<div style="width:24px;height:24px;border-radius:5px;background:'+bg+';border:'+(isToday?'2px solid #8b5cf6':'1px solid var(--border)')+';cursor:pointer" onclick="calDayClickJournal(\''+w.date+'\')" title="'+fmtDate(w.date)+'"></div>'
      +'<div style="font-size:9px;color:var(--muted)">'+label+'</div>'
      +'</div>';
  });
  html+='</div></div>';

  // Today entry or prompt
  if(entry){
    html+='<div style="background:linear-gradient(135deg,rgba(139,92,246,0.06),rgba(124,58,237,0.04));border:1.5px solid rgba(139,92,246,0.2);border-radius:var(--radius);padding:16px;margin-bottom:14px">'
      +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">'
      +'<div style="display:flex;align-items:center;gap:8px">'
      +'<span style="font-size:24px">'+(entry.mood>=0?MOODS[entry.mood]:'📓')+'</span>'
      +'<div><div style="font-size:12px;font-weight:600;color:#7c3aed">'+new Date(entry.date+'T00:00:00').toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long'})+'</div>'
      +(entry.mood>=0?'<div style="font-size:10px;color:var(--muted)">Mood: '+MOOD_LABELS[entry.mood]+'</div>':'')
      +'</div></div>'
      +'<button onclick="openJournalModal(\''+entry.date+'\')" style="padding:6px 12px;border:none;border-radius:7px;background:rgba(139,92,246,0.15);color:#7c3aed;cursor:pointer;font-size:12px;font-weight:600;font-family:DM Sans,sans-serif">✏️ Edit</button>'
      +'</div>'
      +(entry.content?'<div style="font-size:13px;line-height:1.7;color:var(--text);white-space:pre-wrap">'+escHtml(entry.content)+'</div>':'')
      +(entry.tags&&entry.tags.length?'<div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:4px">'+entry.tags.map(function(t){return'<span class="journal-tag-pill">'+t+'</span>';}).join('')+'</div>':'')
      +'</div>';
  } else {
    html+='<div style="background:rgba(139,92,246,0.04);border:1.5px dashed rgba(139,92,246,0.25);border-radius:var(--radius);padding:24px;text-align:center;margin-bottom:14px">'
      +'<div style="font-size:32px;margin-bottom:8px">✍️</div>'
      +'<div style="font-size:14px;font-weight:600;color:var(--text);margin-bottom:4px">Belum ada jurnal hari ini</div>'
      +'<div style="font-size:12px;color:var(--muted);margin-bottom:14px">Catat pikiran, perasaan, dan momen berharga hari ini</div>'
      +'<button onclick="openJournalModal(\''+todayStr+'\')" style="padding:10px 24px;border:none;border-radius:8px;background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:#fff;cursor:pointer;font-size:13px;font-weight:700;font-family:DM Sans,sans-serif;box-shadow:0 3px 12px rgba(139,92,246,0.3)">📝 Tulis Jurnal</button>'
      +'</div>';
  }

  // Recent entries preview
  var recent=journalEntries.slice().sort(function(a,b){return b.date.localeCompare(a.date);}).filter(function(e){return e.date!==todayStr;}).slice(0,3);
  if(recent.length){
    html+='<div class="fin-section-title">📖 Entry Terakhir</div>';
    recent.forEach(function(e){
      html+=journalEntryCardHTML(e);
    });
    html+='<button onclick="switchView(\'journal-all\')" style="font-size:11px;color:#8b5cf6;background:none;border:none;cursor:pointer;font-family:DM Sans,sans-serif;padding:4px 0">Lihat semua entry →</button>';
  }

  el.innerHTML=html;
}

function renderJournalCalendar(el){
  var y=journalCalYear,m=journalCalMonth;
  var months=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  var firstDay=new Date(y,m,1).getDay();
  var daysInMonth=new Date(y,m+1,0).getDate();
  var daysInPrev=new Date(y,m,0).getDate();

  var html='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">'
    +'<button onclick="changeJournalCalMonth(-1)" style="padding:6px 12px;border:1px solid var(--border);background:var(--card);border-radius:7px;cursor:pointer;font-size:14px;color:var(--muted)">‹</button>'
    +'<div style="font-size:15px;font-weight:700;color:var(--text)">'+months[m]+' '+y+'</div>'
    +'<button onclick="changeJournalCalMonth(1)" style="padding:6px 12px;border:1px solid var(--border);background:var(--card);border-radius:7px;cursor:pointer;font-size:14px;color:var(--muted)">›</button>'
    +'</div>';

  html+='<div class="cal-grid">';
  ['Min','Sen','Sel','Rab','Kam','Jum','Sab'].forEach(function(d){html+='<div class="cal-head">'+d+'</div>';});

  for(var i=0;i<firstDay;i++){
    var day=daysInPrev-firstDay+i+1;
    html+='<div class="cal-cell other-month"><div class="cal-cell-day">'+day+'</div></div>';
  }
  for(var d=1;d<=daysInMonth;d++){
    var dateStr=y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    var isToday=dateStr===todayStr;
    var entry=getJournalEntry(dateStr);
    var hasTasks=getTasksForDate(dateStr).length>0;
    var cls='cal-cell'+(isToday?' today':'')+(entry?' has-journal':'');
    var moodEmoji = (entry && entry.mood >= 0) ? MOODS[entry.mood] : (entry ? '📓' : '');
    html+='<div class="'+cls+'" onclick="calDayClickJournal(\''+dateStr+'\')" style="position:relative">'
      +(moodEmoji?'<div style="position:absolute;top:-11px;left:-9px;font-size:22px;line-height:1;z-index:2;pointer-events:none;filter:drop-shadow(0 0 1px var(--card)) drop-shadow(0 0 2px var(--card)) drop-shadow(0 0 3px var(--card))">'+moodEmoji+'</div>':'')
      +'<div class="cal-cell-day">'+d+'</div>'
      +'<div class="cal-dots">'
      +(hasTasks?'<div class="cal-dot" style="background:var(--accent)" title="Task ada"></div>':'')
      +'</div>'
      +'</div>';
  }
  var total=firstDay+daysInMonth;
  var nextDays=(7-total%7)%7;
  for(var i=1;i<=nextDays;i++){html+='<div class="cal-cell other-month"><div class="cal-cell-day">'+i+'</div></div>';}
  html+='</div>';

  // Legend
  html+='<div style="display:flex;gap:12px;margin-top:8px;flex-wrap:wrap">'
    +'<div style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--muted)"><span style="font-size:14px;line-height:1">😊</span> Ada jurnal</div>'
    +'<div style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--muted)"><div class="cal-dot" style="background:var(--accent)"></div> Ada task</div>'
    +'</div>';

  // Stat for this month
  var monthEntries=journalEntries.filter(function(e){
    return e.date.startsWith(y+'-'+String(m+1).padStart(2,'0'));
  });
  if(monthEntries.length){
    html+='<div style="margin-top:14px;padding:12px;background:var(--card);border:1px solid var(--border);border-radius:var(--radius)">'
      +'<div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">📊 Statistik '+months[m]+'</div>'
      +'<div style="display:flex;gap:16px;flex-wrap:wrap">'
      +'<div><div style="font-size:20px;font-weight:700;color:#8b5cf6;font-family:DM Mono">'+monthEntries.length+'</div><div style="font-size:10px;color:var(--muted)">Entry bulan ini</div></div>';
    var moodCounts=[0,0,0,0,0];
    monthEntries.forEach(function(e){if(e.mood>=0)moodCounts[e.mood]++;});
    var maxMoodIdx=moodCounts.indexOf(Math.max.apply(null,moodCounts));
    if(moodCounts[maxMoodIdx]>0){
      html+='<div><div style="font-size:20px">'+MOODS[maxMoodIdx]+'</div><div style="font-size:10px;color:var(--muted)">Mood terbanyak</div></div>';
    }
    html+='</div></div>';
  }

  el.innerHTML=html;
}

function changeJournalCalMonth(dir){
  journalCalMonth+=dir;
  if(journalCalMonth>11){journalCalMonth=0;journalCalYear++;}
  if(journalCalMonth<0){journalCalMonth=11;journalCalYear--;}
  render();
}

function calDayClickJournal(dateStr){
  openJournalModal(dateStr);
}

function renderJournalAll(el){
  var sorted=journalEntries.slice().sort(function(a,b){return b.date.localeCompare(a.date);});
  if(!sorted.length){
    el.innerHTML='<div class="empty"><div class="empty-icon">📓</div>Belum ada jurnal.<br>Mulai tulis hari ini! ✍️</div>';
    return;
  }
  var streak=getJournalStreak();
  var html='<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap">'
    +'<div class="journal-streak-badge">✍️ '+streak+' hari streak</div>'
    +'<div style="font-size:12px;color:var(--muted)">'+sorted.length+' total entry</div>'
    +'</div>';
  sorted.forEach(function(e){html+=journalEntryCardHTML(e);});
  el.innerHTML=html;
}

function renderJournalSearchView(el){
  // Only do full render if the search container doesn't exist yet
  var existing=document.getElementById('journal-search-container');
  if(!existing){
    el.innerHTML='<div style="margin-bottom:14px">'
      +'<input class="journal-search-input" id="journal-search-inp" placeholder="🔍 Cari kata kunci atau #tag..." autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">'
      +'</div>'
      +'<div id="journal-search-container"></div>';
    var inp=document.getElementById('journal-search-inp');
    if(inp){
      inp.value=journalSearchQ;
      inp.oninput=function(){
        journalSearchQ=this.value;
        renderJournalSearchResults();
      };
      inp.focus();
    }
  }
  renderJournalSearchResults();
}

function renderJournalSearchResults(){
  var container=document.getElementById('journal-search-container');
  if(!container)return;
  var q=journalSearchQ.toLowerCase().trim();
  var html='';
  if(!q){
    var allTags={};
    journalEntries.forEach(function(e){(e.tags||[]).forEach(function(t){allTags[t]=(allTags[t]||0)+1;});});
    var tagKeys=Object.keys(allTags).sort(function(a,b){return allTags[b]-allTags[a];});
    if(tagKeys.length){
      html+='<div style="font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">🏷️ Tag Populer</div>';
      html+='<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">';
      tagKeys.forEach(function(t){
        html+='<span class="journal-tag-pill" onclick="journalSearchQ=\''+t+'\';document.getElementById(\'journal-search-inp\').value=\''+t+'\';renderJournalSearchResults()">'+t+' <span style="opacity:0.6;font-size:10px">×'+allTags[t]+'</span></span>';
      });
      html+='</div>';
    }
    html+='<div style="color:var(--muted);font-size:13px;text-align:center;padding:24px">Ketik kata kunci atau klik tag untuk mencari</div>';
  } else {
    var results=journalEntries.filter(function(e){
      var inContent=e.content&&e.content.toLowerCase().indexOf(q)>=0;
      var inTags=e.tags&&e.tags.some(function(t){return t.toLowerCase().indexOf(q.replace('#',''))>=0;});
      return inContent||inTags;
    }).sort(function(a,b){return b.date.localeCompare(a.date);});
    html+='<div style="font-size:12px;color:var(--muted);margin-bottom:10px">'+results.length+' hasil untuk "'+escHtml(journalSearchQ)+'"</div>';
    if(!results.length){
      html+='<div style="text-align:center;padding:24px;color:var(--muted)">Tidak ada jurnal yang cocok</div>';
    } else {
      results.forEach(function(e){html+=journalEntryCardHTML(e,q);});
    }
  }
  container.innerHTML=html;
}

function journalEntryCardHTML(e,highlight){
  var content=e.content||'';
  var preview=content.length>120?content.slice(0,120)+'…':content;
  if(highlight){
    var re=new RegExp('('+highlight.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi');
    preview=preview.replace(re,'<mark style="background:#fef08a;border-radius:2px">$1</mark>');
  }
  return '<div class="journal-entry-card" onclick="openJournalModal(\''+e.date+'\')">'
    +'<div style="display:flex;align-items:flex-start;gap:10px">'
    +(e.mood>=0?'<span style="font-size:20px;flex-shrink:0">'+MOODS[e.mood]+'</span>':'<span style="font-size:20px;flex-shrink:0">📓</span>')
    +'<div style="flex:1;min-width:0">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">'
    +'<div style="font-size:12px;font-weight:600;color:var(--text)">'+new Date(e.date+'T00:00:00').toLocaleDateString('id-ID',{weekday:'short',day:'numeric',month:'short',year:'numeric'})+'</div>'
    +(e.mood>=0?'<div style="font-size:10px;color:var(--muted)">'+MOOD_LABELS[e.mood]+'</div>':'')
    +'</div>'
    +(preview?'<div style="font-size:12px;color:var(--muted);line-height:1.5;margin-bottom:6px">'+preview+'</div>':'')
    +(e.tags&&e.tags.length?'<div style="display:flex;flex-wrap:wrap;gap:3px">'+e.tags.map(function(t){return'<span class="journal-tag-pill" style="font-size:10px;padding:2px 6px">'+t+'</span>';}).join('')+'</div>':'')
    +'</div></div></div>';
}

// Journal modal functions
function openJournalModal(dateStr){
  var entry=getJournalEntry(dateStr);
  journalEditDate=dateStr;
  journalEditMood=entry?entry.mood:-1;
  journalEditTags=entry?(entry.tags||[]).slice():[];

  var label=dateStr===todayStr?'Hari Ini':new Date(dateStr+'T00:00:00').toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  document.getElementById('jm-date-label').textContent='📓 Jurnal — '+label;
  document.getElementById('jm-date-sub').textContent=dateStr===todayStr?new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'}):'';
  document.getElementById('jm-content').value=entry?entry.content||'':'';
  document.getElementById('jm-delete-btn').style.display=entry?'':'none';

  // Set mood buttons
  for(var i=0;i<5;i++){
    var btn=document.getElementById('jmood-'+i);
    if(btn)btn.classList.toggle('active',journalEditMood===i);
  }
  renderJournalTagsInModal();

  var modal=document.getElementById('journalModal');
  modal.style.display='flex';
  setTimeout(function(){document.getElementById('jm-content').focus();},200);
}

function closeJournalModal(){
  document.getElementById('journalModal').style.display='none';
  journalEditDate=null;
  journalEditMood=-1;
  journalEditTags=[];
}

function selectMood(idx){
  journalEditMood=journalEditMood===idx?-1:idx;
  for(var i=0;i<5;i++){
    var btn=document.getElementById('jmood-'+i);
    if(btn)btn.classList.toggle('active',journalEditMood===i);
  }
}

function addJournalTag(){
  var inp=document.getElementById('jm-tag-input');
  if(!inp)return;
  var val=inp.value.trim().replace(/^#/,'').replace(/[,;]/g,'').trim();
  if(!val)return;
  var tag='#'+val;
  if(journalEditTags.indexOf(tag)<0)journalEditTags.push(tag);
  inp.value='';
  renderJournalTagsInModal();
}

function removeJournalTag(idx){
  journalEditTags.splice(idx,1);
  renderJournalTagsInModal();
}

function renderJournalTagsInModal(){
  var wrap=document.getElementById('jm-tags-wrap');
  if(!wrap)return;
  wrap.innerHTML=journalEditTags.map(function(t,i){
    return '<span class="journal-tag-pill">'+t+' <span class="rm" onclick="removeJournalTag('+i+')">×</span></span>';
  }).join('');
}

// ── Auto-bullet: ketik "- " di awal baris → "• ", Enter lanjutkan bullet, Backspace remove ──
function journalAutoBullet(el, e) {
  var val = el.value;
  var pos = el.selectionStart;
  var lineStart = val.lastIndexOf('\n', pos - 1) + 1;
  var lineText = val.substring(lineStart, pos);
  var BULLET = '\u2022 ';
  var INDENT = '  '; // 2 spasi indent untuk align teks setelah bullet

  // ── Space setelah "- " → konversi ke bullet ──
  if (e.key === ' ' && lineText === '-') {
    e.preventDefault();
    var before = val.substring(0, lineStart);
    var after = val.substring(pos);
    el.value = before + BULLET + after;
    var np = lineStart + BULLET.length;
    el.setSelectionRange(np, np);
    return;
  }

  // ── Backspace: jika di awal bullet "• " → kembalikan ke "- " ──
  if (e.key === 'Backspace') {
    if (lineText === BULLET) {
      e.preventDefault();
      var before = val.substring(0, lineStart);
      var after = val.substring(lineStart + BULLET.length);
      el.value = before + '- ' + after;
      var np = lineStart + 2;
      el.setSelectionRange(np, np);
      return;
    }
    // Jika di posisi awal "- " → hapus jadi kosong
    if (lineText === '- ') {
      e.preventDefault();
      var before = val.substring(0, lineStart);
      var after = val.substring(lineStart + 2);
      el.value = before + after;
      el.setSelectionRange(lineStart, lineStart);
      return;
    }
    return;
  }

  // ── Enter: lanjutkan bullet atau keluar jika baris bullet kosong ──
  if (e.key === 'Enter') {
    var isBulletLine = lineText.substring(0, 2) === BULLET;
    var isDashLine = lineText.substring(0, 2) === '- ';
    var contentAfterBullet = isBulletLine ? lineText.substring(2).trim() : '';

    if (isBulletLine || isDashLine) {
      e.preventDefault();
      // Baris bullet kosong (hanya "• " atau "- ") → keluar dari bullet mode
      if (!contentAfterBullet && isBulletLine) {
        var before = val.substring(0, lineStart);
        var after = val.substring(pos);
        // Hapus bullet di baris ini, lanjut baris baru normal
        el.value = before.replace(/\u2022 $/, '') + '\n' + after;
        var np = before.replace(/\u2022 $/, '').length + 1;
        el.setSelectionRange(np, np);
        return;
      }
      // Lanjutkan bullet di baris berikutnya
      var prefix = isBulletLine ? BULLET : '- ';
      var before = val.substring(0, pos);
      var after = val.substring(pos);
      el.value = before + '\n' + prefix + after;
      var np = pos + 1 + prefix.length;
      el.setSelectionRange(np, np);
      return;
    }
  }
}

function saveJournalEntry(){
  if(!journalEditDate)return;
  var content=document.getElementById('jm-content').value.trim();
  var existing=getJournalEntry(journalEditDate);
  if(existing){
    existing.content=content;
    existing.mood=journalEditMood;
    existing.tags=journalEditTags.slice();
  } else {
    journalEntries.push({id:'j'+journalNextId++,date:journalEditDate,content:content,mood:journalEditMood,tags:journalEditTags.slice()});
  }
  closeJournalModal();
  saveData(true);render();
  showToast('📓 Jurnal '+fmtDate(journalEditDate)+' tersimpan ✅');
}

function deleteJournalEntry(){
  if(!journalEditDate)return;
  journalEntries=journalEntries.filter(function(e){return e.date!==journalEditDate;});
  closeJournalModal();
  saveData(true);render();
  showToast('Jurnal dihapus');
}

// Update journal subdrawer with live info
function updateJournalDrawer(){
  var streak=getJournalStreak();
  var todayEntry=getJournalEntry(todayStr);
  // Update CTA button label
  var ctaLabel=document.getElementById('sdi-journal-cta-label');
  if(ctaLabel){ctaLabel.textContent=todayEntry?t('sdi_journal_edit'):t('sdi_journal_write');}
  // Update streak label
  var streakEl=document.getElementById('sdi-journal-streak');
  if(streakEl){
    if(streak>0){
      streakEl.textContent='🔥 '+streak+' hari streak'+( todayEntry?' ✓':'');
      streakEl.style.color=streak>=7?'#fbbf24':'rgba(255,255,255,0.5)';
    } else {
      streakEl.textContent='Belum ada streak — mulai hari ini!';
    }
  }
  // Update entry count badge
  var jcnt=document.getElementById('sdi-cnt-journal');
  if(jcnt){var jc=journalEntries.length;jcnt.textContent=jc;jcnt.style.display=jc?'':'none';}
  // Update write button style if already written today
  var writeBtn=document.getElementById('sdi-journal-write-btn');
  if(writeBtn){
    writeBtn.style.background=todayEntry
      ?'linear-gradient(135deg,#059669,#10b981)'
      :'linear-gradient(135deg,#8b5cf6,#7c3aed)';
  }
}


// ══════════════════════════════════════════════
// GOLD SYSTEM
// ══════════════════════════════════════════════
function getTaskGold(t){return t.goldVal||GOLD_PER_TASK;}
function addGold(amount){
  goldBalance+=amount;
  updateGoldDisplay();
  showGoldToast('+'+amount+' 🪙');
}
function showGoldToast(msg){
  var el=document.getElementById('goldToast');if(!el)return;
  el.textContent=msg;el.classList.add('show');
  clearTimeout(el._to);el._to=setTimeout(function(){el.classList.remove('show');},1600);
}
function updateGoldDisplay(){
  var els=['goldLabel','shopGoldDisplay'];
  els.forEach(function(id){var el=document.getElementById(id);if(el)el.textContent=goldBalance;});
  var cnt=document.getElementById('cnt-gold-sidebar');
  if(cnt)cnt.textContent=goldBalance+'🪙';
  var sdiCnt=document.getElementById('sdi-gold-cnt');
  if(sdiCnt)sdiCnt.textContent=goldBalance;
}

// ══════════════════════════════════════════════
// THEME SYSTEM
// ══════════════════════════════════════════════
var THEME_VARS = {
  'theme-light':{'--bg':'#f0ede8','--card':'#ffffff','--accent':'#d97706','--accent2':'#b45309','--sidebar':'#1c1917','--text':'#1c1917','--muted':'#78716c','--border':'rgba(0,0,0,0.08)','--hover':'rgba(0,0,0,0.03)','--pill':'#fef3c7','--pill-text':'#92400e'},
  'theme-dark':{'--bg':'#1a1714','--card':'#252220','--accent':'#f59e0b','--accent2':'#d97706','--sidebar':'#111010','--text':'#e8e0d8','--muted':'#8a7f76','--border':'rgba(255,255,255,0.08)','--hover':'rgba(255,255,255,0.04)'},
  'theme-forest':{'--bg':'#e8f0e4','--card':'#f0f7ed','--accent':'#16a34a','--accent2':'#15803d','--sidebar':'#14532d','--sidebar-text':'#fff','--sidebar-muted':'rgba(255,255,255,0.5)'},
  'theme-ocean':{'--bg':'#e0eaf4','--card':'#eef4fb','--accent':'#0ea5e9','--accent2':'#0284c7','--sidebar':'#0c4a6e','--sidebar-text':'#fff','--sidebar-muted':'rgba(255,255,255,0.5)'},
  'theme-rose':{'--bg':'#fce7f3','--card':'#fdf2f8','--accent':'#ec4899','--accent2':'#db2777','--sidebar':'#831843','--sidebar-text':'#fff','--sidebar-muted':'rgba(255,255,255,0.5)'},
  'theme-midnight':{'--bg':'#1e1b2e','--card':'#2d2a40','--accent':'#8b5cf6','--accent2':'#7c3aed','--sidebar':'#13111e','--text':'#e2e0f0','--muted':'#9490b8','--border':'rgba(255,255,255,0.08)','--hover':'rgba(255,255,255,0.04)'},
  'theme-sunset':{'--bg':'#fef3e2','--card':'#fff8f0','--accent':'#ea580c','--accent2':'#c2410c','--sidebar':'#7c2d12','--sidebar-text':'#fff','--sidebar-muted':'rgba(255,255,255,0.5)'},
  'theme-slytherin':{
    '--bg':'#070f09',
    '--card':'#0c1a0f',
    '--accent':'#2dbb5d',
    '--accent2':'#1f9448',
    '--accent3':'#c0c0c0',
    '--sidebar':'#040c07',
    '--text':'#c8dfc8',
    '--muted':'#5a8a6a',
    '--border':'rgba(45,187,93,0.14)',
    '--hover':'rgba(45,187,93,0.07)',
    '--pill':'rgba(45,187,93,0.14)',
    '--pill-text':'#5ddba0',
    '--gold':'#c0c0c0',
    '--green':'#2dbb5d',
    '--blue':'#3aad88',
    '--purple':'#7adba0',
    '--red':'#e05252',
    '--radius':'10px',
    '--shadow':'0 2px 12px rgba(0,0,0,0.5)'
  },
  'theme-sololeveling':{
    '--bg':'#06060e',
    '--card':'#0d0d1a',
    '--accent':'#7c6af7',
    '--accent2':'#5b4de0',
    '--accent3':'#a89cff',
    '--sidebar':'#040410',
    '--text':'#c8c5f0',
    '--muted':'#6b68a0',
    '--border':'rgba(124,106,247,0.18)',
    '--hover':'rgba(124,106,247,0.09)',
    '--pill':'rgba(124,106,247,0.18)',
    '--pill-text':'#a89cff',
    '--gold':'#a89cff',
    '--green':'#4ade80',
    '--blue':'#60a5fa',
    '--purple':'#c084fc',
    '--red':'#f87171',
    '--radius':'8px',
    '--shadow':'0 2px 16px rgba(0,0,0,0.7), 0 0 8px rgba(124,106,247,0.12)'
  },
  'theme-fluffytown':{
    '--bg':'#fde8f2',
    '--card':'#fff5fa',
    '--accent':'#f472b6',
    '--accent2':'#ec4899',
    '--accent3':'#fda4af',
    '--sidebar':'#4d1230',
    '--text':'#4a1535',
    '--muted':'#b56b8a',
    '--border':'rgba(244,114,182,0.2)',
    '--hover':'rgba(244,114,182,0.08)',
    '--pill':'rgba(253,164,175,0.28)',
    '--pill-text':'#be185d',
    '--gold':'#f59e0b',
    '--green':'#10b981',
    '--blue':'#818cf8',
    '--purple':'#a78bfa',
    '--red':'#f43f5e',
    '--radius':'16px',
    '--shadow':'0 2px 14px rgba(244,114,182,0.18)'
  },
};
function applyTheme(themeId){
  var root=document.documentElement;
  ['--bg','--card','--accent','--accent2','--accent3','--sidebar','--sidebar-text','--sidebar-muted','--text','--muted','--border','--hover','--pill','--pill-text','--gold','--green','--blue','--purple','--red','--radius','--shadow'].forEach(function(v){root.style.removeProperty(v);});
  document.body.classList.toggle('slytherin-theme',    themeId==='theme-slytherin');
  document.body.classList.toggle('fluffytown-theme',   themeId==='theme-fluffytown');
  document.body.classList.toggle('sololeveling-theme', themeId==='theme-sololeveling');
  document.body.classList.toggle('midnight-theme',     themeId==='theme-midnight');
  document.body.classList.toggle('sunset-theme',       themeId==='theme-sunset');
  function _afterTheme(){
    if(typeof bossApplyTheme==='function') bossApplyTheme();
    // Re-render SEMUA komponen aktif supaya perubahan tema langsung terlihat
    var el=document.getElementById('mainContent');
    if(el && typeof currentView!=='undefined'){
      if(currentView==='dashboard'   && typeof renderDashboard==='function')   renderDashboard(el);
      else if(currentView==='habits' && typeof renderHabitFull==='function')   renderHabitFull(el);
      else if(currentView==='habit-analisa' && typeof renderHabitAnalisa==='function') renderHabitAnalisa(el);
      else if(currentView==='fin-overview'  || currentView==='fin-cashflow' ||
              currentView==='fin-transactions' || currentView==='fin-wallets' ||
              currentView==='fin-wishlist' || currentView==='fin-tagihan' ||
              currentView==='fin-hutang'   || currentView==='fin-budget'   ||
              currentView==='fin-categories'){
        if(typeof renderFinView==='function'){
          var fw=document.getElementById('finScroll')||document.getElementById('finWrap')||el;
          renderFinView(fw);
        }
      }
    }
    // Re-render sidebar nav & task list selalu
    if(typeof render==='function') render();
    // Re-render shop kalau sedang terbuka
    var shopOverlay=document.getElementById('shopOverlay');
    if(shopOverlay && shopOverlay.classList.contains('show') && typeof renderShop==='function') renderShop();
    // Re-render habit panel sidebar
    if(typeof renderHabitPanel==='function') renderHabitPanel();
    // Update gold display
    if(typeof updateGoldDisplay==='function') updateGoldDisplay();
  }
  if(themeId==='theme-dark'){darkMode=true;applyDark();setTimeout(_afterTheme,80);_updateThemeLottie(themeId);return;}
  if(themeId==='theme-light'){darkMode=false;applyLight();setTimeout(_afterTheme,80);_updateThemeLottie(themeId);return;}
  var darkThemes=['theme-midnight','theme-slytherin','theme-sololeveling'];
  darkMode=darkThemes.indexOf(themeId)>=0;
  var vars=THEME_VARS[themeId];
  if(!vars){ darkMode=false; applyLight(); setTimeout(_afterTheme,80); _updateThemeLottie(themeId); return; }
  Object.keys(vars).forEach(function(k){root.style.setProperty(k,vars[k]);});
  setTimeout(_afterTheme,80);
  _updateThemeLottie(themeId);
}

function _updateThemeLottie(themeId){
  var isFluffytown = (themeId === 'theme-fluffytown');
  var isSlytherin  = (themeId === 'theme-slytherin');
  // Sidebar lottie (kecil, di samping ChiTask)
  var el = document.getElementById('fluffytown-lottie');
  if(el) el.style.display = isFluffytown ? 'block' : 'none';
  var slEl = document.getElementById('slytherin-lottie');
  if(slEl) slEl.style.display = isSlytherin ? 'block' : 'none';
  // Splash lottie (besar, centerpiece)
  var splashEl = document.getElementById('splash-fluffytown-lottie');
  if(splashEl) splashEl.style.display = isFluffytown ? 'block' : 'none';
  var splashSlEl = document.getElementById('splash-slytherin-lottie');
  if(splashSlEl) splashSlEl.style.display = isSlytherin ? 'block' : 'none';
  // Trigger helper splash jika ada
  if(typeof window._checkSplashLottie === 'function') window._checkSplashLottie();
}

// ══════════════════════════════════════════════
// 🐍 SLYTHERIN SNAKE ACTIVATION SPECTACLE
// ══════════════════════════════════════════════
function triggerSlytherinActivation(){
  // --- Flash overlay ---
  var ov=document.getElementById('slyActivateOverlay');
  if(ov){
    ov.classList.remove('active');
    void ov.offsetWidth;
    ov.classList.add('active');
    clearTimeout(ov._to);
    ov._to=setTimeout(function(){ov.classList.remove('active');},1800);
  }

  // --- Logo pulse ---
  var logoIcon=document.querySelector('.mobile-logo-icon,.brand-icon');
  if(logoIcon){
    logoIcon.style.transition='transform 0.18s ease,box-shadow 0.18s ease';
    logoIcon.style.transform='scale(1.3)';
    logoIcon.style.boxShadow='0 0 0 4px rgba(45,187,93,0.7),0 0 40px rgba(45,187,93,0.6)';
    setTimeout(function(){logoIcon.style.transform='';logoIcon.style.boxShadow='';},500);
  }

  // --- Canvas snake that circles the entire screen ---
  var existing=document.getElementById('slySnakeCanvas');
  if(existing)existing.remove();

  var canvas=document.createElement('canvas');
  canvas.id='slySnakeCanvas';
  canvas.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:9999;pointer-events:none;';
  document.body.appendChild(canvas);

  var W=window.innerWidth, H=window.innerHeight;
  canvas.width=W; canvas.height=H;
  var ctx=canvas.getContext('2d');

  // Build perimeter path (clockwise: top → right → bottom → left)
  var pad=18; // distance from screen edge
  var cornerR=28;
  var perim=[];
  var step=4;

  // Top edge (left→right)
  for(var x=pad+cornerR;x<W-pad-cornerR;x+=step) perim.push([x,pad]);
  // Top-right arc
  for(var a=-Math.PI/2;a<=0;a+=0.08) perim.push([W-pad-cornerR+Math.cos(a)*cornerR, pad+cornerR+Math.sin(a)*cornerR]);
  // Right edge (top→bottom)
  for(var y=pad+cornerR;y<H-pad-cornerR;y+=step) perim.push([W-pad,y]);
  // Bottom-right arc
  for(var a=0;a<=Math.PI/2;a+=0.08) perim.push([W-pad-cornerR+Math.cos(a)*cornerR, H-pad-cornerR+Math.sin(a)*cornerR]);
  // Bottom edge (right→left)
  for(var x=W-pad-cornerR;x>pad+cornerR;x-=step) perim.push([x,H-pad]);
  // Bottom-left arc
  for(var a=Math.PI/2;a<=Math.PI;a+=0.08) perim.push([pad+cornerR+Math.cos(a)*cornerR, H-pad-cornerR+Math.sin(a)*cornerR]);
  // Left edge (bottom→top)
  for(var y=H-pad-cornerR;y>pad+cornerR;y-=step) perim.push([pad,y]);
  // Top-left arc
  for(var a=Math.PI;a<=3*Math.PI/2;a+=0.08) perim.push([pad+cornerR+Math.cos(a)*cornerR, pad+cornerR+Math.sin(a)*cornerR]);

  var total=perim.length;
  var SNAKE_LEN=Math.min(120, Math.floor(total*0.28)); // snake body length in segments
  var headIdx=0;
  var speed=2.2; // segments per frame
  var frac=0;
  var laps=0;
  var MAX_LAPS=2.5;
  var rafId=null;
  var startTime=Date.now();
  var MAX_MS=3800;

  function getIdx(i){ return ((i%total)+total)%total; }

  function draw(){
    ctx.clearRect(0,0,W,H);

    // Draw faint perimeter guide
    ctx.beginPath();
    ctx.strokeStyle='rgba(45,187,93,0.08)';
    ctx.lineWidth=3;
    ctx.lineCap='round';
    ctx.lineJoin='round';
    if(perim.length>1){
      ctx.moveTo(perim[0][0],perim[0][1]);
      for(var i=1;i<perim.length;i++) ctx.lineTo(perim[i][0],perim[i][1]);
      ctx.closePath();
      ctx.stroke();
    }

    // Draw snake body (tail→head, getting brighter)
    var hi=Math.floor(headIdx);
    for(var s=SNAKE_LEN;s>=0;s--){
      var idx=getIdx(hi-s);
      var pt=perim[idx];
      var t=1-(s/SNAKE_LEN); // 0=tail, 1=head
      var alpha=t*t*0.92+0.04;
      var thick=2+t*7; // tail thin, head thick

      // Color: silver tail → bright green head
      var r=Math.round(192*(1-t)+45*t);
      var g=Math.round(192*(1-t)+187*t);
      var b=Math.round(192*(1-t)+93*t);

      ctx.beginPath();
      // Connect to next segment for smooth line
      if(s>0){
        var prevIdx=getIdx(hi-(s-1));
        var prev=perim[prevIdx];
        ctx.moveTo(pt[0],pt[1]);
        ctx.lineTo(prev[0],prev[1]);
        ctx.strokeStyle='rgba('+r+','+g+','+b+','+alpha+')';
        ctx.lineWidth=thick;
        ctx.lineCap='round';
        ctx.stroke();
      }

      // Glow on head segments (last 25%)
      if(t>0.75){
        ctx.beginPath();
        ctx.arc(pt[0],pt[1],thick*0.7,0,Math.PI*2);
        ctx.fillStyle='rgba(45,187,93,'+(alpha*0.4)+')';
        ctx.fill();
      }
    }

    // Draw head: snake face
    var headPt=perim[getIdx(hi)];
    var prevPt=perim[getIdx(hi-2)];
    var angle=Math.atan2(headPt[1]-prevPt[1], headPt[0]-prevPt[0]);

    // Head glow aura
    var grd=ctx.createRadialGradient(headPt[0],headPt[1],0,headPt[0],headPt[1],22);
    grd.addColorStop(0,'rgba(45,187,93,0.55)');
    grd.addColorStop(0.4,'rgba(45,187,93,0.18)');
    grd.addColorStop(1,'transparent');
    ctx.beginPath();
    ctx.arc(headPt[0],headPt[1],22,0,Math.PI*2);
    ctx.fillStyle=grd;
    ctx.fill();

    // Head body (oval)
    ctx.save();
    ctx.translate(headPt[0],headPt[1]);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.ellipse(0,0,10,7,0,0,Math.PI*2);
    ctx.fillStyle='#2dbb5d';
    ctx.shadowColor='rgba(45,187,93,0.8)';
    ctx.shadowBlur=12;
    ctx.fill();
    ctx.shadowBlur=0;

    // Eyes
    var eyeR=2.2;
    ctx.fillStyle='#c8ffd4';
    ctx.beginPath(); ctx.arc(5,-3.5,eyeR,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(5,3.5,eyeR,0,Math.PI*2); ctx.fill();
    // Eye pupils
    ctx.fillStyle='#0a2e10';
    ctx.beginPath(); ctx.arc(5.8,-3.5,1.1,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(5.8,3.5,1.1,0,Math.PI*2); ctx.fill();

    // Forked tongue (flicks)
    var tonguePhase=Math.sin(Date.now()/120);
    if(tonguePhase>-0.3){
      ctx.strokeStyle='#ff4466';
      ctx.lineWidth=1.2;
      ctx.lineCap='round';
      ctx.beginPath();
      ctx.moveTo(10,0);
      ctx.lineTo(17,0);
      ctx.lineTo(21,-3.5);
      ctx.moveTo(17,0);
      ctx.lineTo(21,3.5);
      ctx.stroke();
    }

    // Scales pattern on head
    ctx.strokeStyle='rgba(45,187,93,0.4)';
    ctx.lineWidth=0.6;
    for(var si=-1;si<=1;si+=2){
      ctx.beginPath();
      ctx.arc(-2,si*2.5,3.5,0,Math.PI);
      ctx.stroke();
    }
    ctx.restore();

    // Advance head
    frac+=speed;
    if(frac>=1){
      var steps=Math.floor(frac);
      headIdx=(headIdx+steps)%total;
      frac-=steps;
      if(headIdx<steps) laps++;
    }

    // Spawn green sparkles along body occasionally
    if(Math.random()<0.18){
      var sparkIdx=getIdx(hi-Math.floor(Math.random()*SNAKE_LEN));
      var sp=perim[sparkIdx];
      ctx.beginPath();
      ctx.arc(sp[0],sp[1],1.5+Math.random()*2,0,Math.PI*2);
      ctx.fillStyle='rgba('+(Math.random()>0.5?'45,187,93':'192,192,192')+','+( 0.4+Math.random()*0.5)+')';
      ctx.fill();
    }

    var elapsed=Date.now()-startTime;
    if(laps<MAX_LAPS && elapsed<MAX_MS){
      rafId=requestAnimationFrame(draw);
    } else {
      // Fade out
      fadeOutCanvas(canvas,ctx,W,H,function(){canvas.remove();});
    }
  }

  function fadeOutCanvas(canvas,ctx,W,H,done){
    var op=1;
    var snapshot=canvas.toDataURL();
    var img=new Image();
    img.onload=function(){
      (function fade(){
        ctx.clearRect(0,0,W,H);
        ctx.globalAlpha=op;
        ctx.drawImage(img,0,0);
        ctx.globalAlpha=1;
        op-=0.06;
        if(op>0) requestAnimationFrame(fade);
        else done();
      })();
    };
    img.src=snapshot;
  }

  rafId=requestAnimationFrame(draw);

  // Safety cleanup
  setTimeout(function(){
    if(rafId)cancelAnimationFrame(rafId);
    if(canvas.parentNode)canvas.remove();
  }, MAX_MS+1000);
}
function applyEffect(effectId){
  activeEffect=effectId;
}

// ══════════════════════════════════════════════
// 🐹 FLUFFY TOWN ACTIVATION SPECTACLE
// ══════════════════════════════════════════════

// ══════════════════════════════════════════════
// ⚔️ SOLO LEVELING — ARISE Activation Spectacle
// ══════════════════════════════════════════════
function triggerSoloLevelingActivation(){
  // Flash overlay
  var ov=document.getElementById('slActivateOverlay');
  if(ov){
    ov.classList.remove('active');
    void ov.offsetWidth;
    ov.classList.add('active');
    clearTimeout(ov._to);
    ov._to=setTimeout(function(){ov.classList.remove('active');},2400);
  }

  // Logo pulse
  var logoIcon=document.querySelector('.mobile-logo-icon,.brand-icon');
  if(logoIcon){
    logoIcon.style.transition='transform 0.12s ease,box-shadow 0.12s ease';
    logoIcon.style.transform='scale(1.45)';
    logoIcon.style.boxShadow='0 0 0 6px rgba(124,106,247,0.65),0 0 60px rgba(124,106,247,0.7),0 0 100px rgba(124,106,247,0.3)';
    setTimeout(function(){
      logoIcon.style.transform='scale(1.1)';
      logoIcon.style.boxShadow='0 0 0 3px rgba(124,106,247,0.4),0 0 30px rgba(124,106,247,0.5)';
    },200);
    setTimeout(function(){logoIcon.style.transform='';logoIcon.style.boxShadow='';logoIcon.style.transition='';},900);
  }

  // Canvas: cinematic portal opening + rune particles + shadow soldiers
  var existing=document.getElementById('slPortalCanvas');
  if(existing)existing.remove();
  var canvas=document.createElement('canvas');
  canvas.id='slPortalCanvas';
  canvas.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:9999;pointer-events:none;';
  document.body.appendChild(canvas);
  var W=window.innerWidth,H=window.innerHeight;
  canvas.width=W;canvas.height=H;
  var ctx=canvas.getContext('2d');
  var cx=W/2,cy=H/2;
  var startTime=performance.now();
  var dur=2200;

  // Rune particles — rise from ground like shadows awakening
  var particles=[];
  for(var i=0;i<70;i++){
    var angle=Math.random()*Math.PI*2;
    var speed=1.2+Math.random()*4;
    var isRune=Math.random()>0.65;
    particles.push({
      x:cx+(Math.random()-0.5)*W*0.85,
      y:H*0.65+Math.random()*H*0.35,
      vx:(Math.random()-0.5)*speed*0.8,
      vy:-(0.6+Math.random()*3.2),
      alpha:0,
      maxAlpha:0.7+Math.random()*0.3,
      size:isRune?2.5+Math.random()*3.5:1.2+Math.random()*2.2,
      color:Math.random()>0.4?'124,106,247':Math.random()>0.5?'168,156,255':'80,60,200',
      isRune:isRune,
      rotSpeed:(Math.random()-0.5)*0.08,
      rot:Math.random()*Math.PI*2,
      delay:Math.random()*0.3
    });
  }

  // Spinning rune rings (decorative)
  var runeRings=[
    {r:0,maxR:Math.min(W,H)*0.52,color:'124,106,247',width:2.5,delay:0,dashes:12},
    {r:0,maxR:Math.min(W,H)*0.36,color:'168,156,255',width:1.5,delay:0.08,dashes:8},
    {r:0,maxR:Math.min(W,H)*0.22,color:'210,200,255',width:1,delay:0.18,dashes:6},
    {r:0,maxR:Math.min(W,H)*0.1,color:'255,255,255',width:0.8,delay:0.28,dashes:4},
  ];

  function drawFrame(now){
    var elapsed=now-startTime;
    var t=Math.min(elapsed/dur,1);
    ctx.clearRect(0,0,W,H);

    // Dark vignette overlay during activation
    if(t<0.4){
      var vigAlpha=(0.4-t)/0.4*0.55;
      var vigGrd=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(W,H)*0.7);
      vigGrd.addColorStop(0,'rgba(0,0,0,0)');
      vigGrd.addColorStop(1,'rgba(0,0,10,'+vigAlpha+')');
      ctx.fillStyle=vigGrd;
      ctx.fillRect(0,0,W,H);
    }

    // Expanding rune rings with dashes
    runeRings.forEach(function(ring){
      var rt=Math.max(0,(t-ring.delay)/(1-ring.delay));
      if(rt<=0)return;
      var radius=ring.maxR*Math.pow(rt,0.55);
      var alpha=rt<0.15?rt/0.15:Math.max(0,1-Math.pow((rt-0.15)/0.85,1.4));
      ctx.save();
      ctx.translate(cx,cy);
      ctx.rotate(elapsed*0.0008*(ring.dashes%2===0?1:-1));
      ctx.beginPath();
      var dashLen=(Math.PI*2*radius)/(ring.dashes*2);
      ctx.setLineDash([dashLen,dashLen]);
      ctx.arc(0,0,radius,0,Math.PI*2);
      ctx.strokeStyle='rgba('+ring.color+','+alpha+')';
      ctx.lineWidth=ring.width;
      ctx.shadowColor='rgba('+ring.color+',0.9)';
      ctx.shadowBlur=ring.width*6;
      ctx.stroke();
      ctx.restore();
    });

    // Solid inner glow ring
    if(t>0.05&&t<0.55){
      var igR=Math.min(W,H)*0.06*Math.pow(t/0.55,0.4);
      var igA=(t<0.3)?t/0.3*0.7:Math.max(0,(0.55-t)/0.25*0.7);
      ctx.beginPath();
      ctx.arc(cx,cy,igR,0,Math.PI*2);
      ctx.fillStyle='rgba(124,106,247,'+igA*0.4+')';
      ctx.shadowColor='rgba(124,106,247,0.9)';
      ctx.shadowBlur=40;
      ctx.fill();
      ctx.shadowBlur=0;
    }

    // Central radial burst
    if(t<0.45){
      var bAlpha=(0.45-t)/0.45*0.8;
      var bGrd=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.min(W,H)*0.28*(t*3+0.1));
      bGrd.addColorStop(0,'rgba(180,170,255,'+bAlpha*0.9+')');
      bGrd.addColorStop(0.3,'rgba(124,106,247,'+bAlpha*0.5+')');
      bGrd.addColorStop(0.7,'rgba(80,60,200,'+bAlpha*0.2+')');
      bGrd.addColorStop(1,'rgba(80,60,200,0)');
      ctx.fillStyle=bGrd;
      ctx.fillRect(0,0,W,H);
    }

    // Shadow particles rising
    particles.forEach(function(p){
      if(t<p.delay)return;
      var pt=(t-p.delay)/(1-p.delay);
      if(pt>1)return;
      p.x+=p.vx;
      p.y+=p.vy;
      p.rot+=p.rotSpeed;
      // Fade in then out
      var fadeIn=Math.min(pt*8,1);
      var fadeOut=Math.max(0,1-Math.pow(pt,2)*1.8);
      p.alpha=p.maxAlpha*fadeIn*fadeOut;
      if(p.alpha<=0.01)return;
      ctx.save();
      ctx.globalAlpha=p.alpha;
      ctx.translate(p.x,p.y);
      ctx.rotate(p.rot);
      ctx.shadowColor='rgba('+p.color+',0.9)';
      ctx.shadowBlur=p.isRune?12:8;
      if(p.isRune){
        // Draw rune diamond
        ctx.beginPath();
        ctx.moveTo(0,-p.size);
        ctx.lineTo(p.size*0.6,0);
        ctx.lineTo(0,p.size);
        ctx.lineTo(-p.size*0.6,0);
        ctx.closePath();
        ctx.fillStyle='rgba('+p.color+',1)';
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0,0,p.size,0,Math.PI*2);
        ctx.fillStyle='rgba('+p.color+',1)';
        ctx.fill();
      }
      ctx.restore();
    });

    // Light beams from center (like dungeon gate opening)
    if(t>0.02&&t<0.5){
      var beams=8;
      var beamAlpha=(t<0.15)?t/0.15*0.18:Math.max(0,(0.5-t)/0.35*0.18);
      ctx.save();
      ctx.translate(cx,cy);
      ctx.rotate(elapsed*0.0005);
      for(var b=0;b<beams;b++){
        var ba=(Math.PI*2/beams)*b;
        var grad=ctx.createLinearGradient(0,0,Math.cos(ba)*W,Math.sin(ba)*H);
        grad.addColorStop(0,'rgba(124,106,247,'+beamAlpha+')');
        grad.addColorStop(0.3,'rgba(124,106,247,'+beamAlpha*0.4+')');
        grad.addColorStop(1,'rgba(80,60,200,0)');
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.lineTo(Math.cos(ba-0.06)*W,Math.sin(ba-0.06)*H);
        ctx.lineTo(Math.cos(ba+0.06)*W,Math.sin(ba+0.06)*H);
        ctx.closePath();
        ctx.fillStyle=grad;
        ctx.fill();
      }
      ctx.restore();
    }

    if(elapsed<dur+400){
      requestAnimationFrame(drawFrame);
    } else {
      canvas.remove();
    }
  }
  requestAnimationFrame(drawFrame);

  // "ARISE" toast with delay for drama
  setTimeout(function(){
    showToast('⚔️ ARISE — The Shadow Monarch awakens.');
  },280);

  // Task cards flicker awaken effect
  setTimeout(function(){
    var cards=document.querySelectorAll('.task-card');
    cards.forEach(function(card,i){
      setTimeout(function(){
        card.style.animation='sl-card-awaken 0.7s ease forwards';
        setTimeout(function(){card.style.animation='';},800);
      },i*30);
    });
  },400);
}

function triggerFluffyTownActivation(){
  // --- Flash overlay ---
  var ov=document.getElementById('fluffyActivateOverlay');
  if(ov){
    ov.classList.remove('active');
    void ov.offsetWidth;
    // Clear old hearts
    ov.querySelectorAll('.fluffy-heart').forEach(function(h){h.remove();});
    ov.classList.add('active');
    clearTimeout(ov._to);
    ov._to=setTimeout(function(){ov.classList.remove('active');},2000);
  }
  // Scatter hearts across screen
  var heartEmojis=['🌸','💕','🌷','✨','💖','🍑','🌺','💗','⭐'];
  for(var i=0;i<22;i++){
    (function(i){
      setTimeout(function(){
        var h=document.createElement('div');
        h.className='fluffy-heart';
        h.textContent=heartEmojis[Math.floor(Math.random()*heartEmojis.length)];
        h.style.left=(5+Math.random()*90)+'vw';
        h.style.top=(10+Math.random()*80)+'vh';
        h.style.fontSize=(14+Math.random()*18)+'px';
        h.style.animationDelay=(Math.random()*0.4)+'s';
        if(ov)ov.appendChild(h);
        setTimeout(function(){h.remove();},1200);
      },i*65);
    })(i);
  }
  // --- Logo pulse ---
  var logoIcon=document.querySelector('.mobile-logo-icon,.brand-icon');
  if(logoIcon){
    logoIcon.style.transition='transform 0.2s ease,box-shadow 0.2s ease';
    logoIcon.style.transform='scale(1.35) rotate(-5deg)';
    logoIcon.style.boxShadow='0 0 0 4px rgba(244,114,182,0.7),0 0 40px rgba(244,114,182,0.6)';
    setTimeout(function(){
      logoIcon.style.transform='scale(1.05) rotate(5deg)';
      setTimeout(function(){logoIcon.style.transform='';logoIcon.style.boxShadow='';},200);
    },300);
  }
  // --- Canvas hamster that bounces across screen ---
  var existing=document.getElementById('fluffyActivateCanvas');
  if(existing)existing.remove();
  var canvas=document.createElement('canvas');
  canvas.id='fluffyActivateCanvas';
  canvas.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:9999;pointer-events:none;';
  document.body.appendChild(canvas);
  var W=window.innerWidth, H=window.innerHeight;
  canvas.width=W; canvas.height=H;
  var ctx=canvas.getContext('2d');
  var hamX=W*0.15, hamY=H*0.5;
  var vx=W/180, vy=-H/250;
  var bounces=0, maxBounces=14;
  var startTime=Date.now(), maxMs=3200;
  var angle=0;
  var rafId=null;
  function drawHamster(cx,cy,rot,scale){
    ctx.save();
    ctx.translate(cx,cy);
    ctx.rotate(rot);
    ctx.scale(scale,scale);
    // Body
    ctx.beginPath();
    ctx.ellipse(0,0,22,17,0,0,Math.PI*2);
    ctx.fillStyle='#FECDD3';
    ctx.fill();
    ctx.strokeStyle='rgba(244,114,182,0.4)';
    ctx.lineWidth=1.5;
    ctx.stroke();
    // Belly
    ctx.beginPath();
    ctx.ellipse(0,4,12,9,0,0,Math.PI*2);
    ctx.fillStyle='#FFE4E1';
    ctx.fill();
    // Cheek pouches
    ctx.beginPath();
    ctx.ellipse(-20,2,10,8,0.2,0,Math.PI*2);
    ctx.fillStyle='#FCA5A5';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(20,2,10,8,-0.2,0,Math.PI*2);
    ctx.fillStyle='#FCA5A5';
    ctx.fill();
    // Ears
    ctx.beginPath();
    ctx.ellipse(-14,-16,8,7,-.3,0,Math.PI*2);
    ctx.fillStyle='#FECDD3';
    ctx.fill();
    ctx.strokeStyle='rgba(244,114,182,0.3)';
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(-14,-16,4,3.5,-.3,0,Math.PI*2);
    ctx.fillStyle='#FCA5A5';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(14,-16,8,7,.3,0,Math.PI*2);
    ctx.fillStyle='#FECDD3';
    ctx.fill();
    ctx.strokeStyle='rgba(244,114,182,0.3)';
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(14,-16,4,3.5,.3,0,Math.PI*2);
    ctx.fillStyle='#FCA5A5';
    ctx.fill();
    // Eyes
    ctx.beginPath();
    ctx.arc(-7,-4,4,0,Math.PI*2);
    ctx.fillStyle='#1c1917';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(7,-4,4,0,Math.PI*2);
    ctx.fillStyle='#1c1917';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-5.5,-5.5,1.5,0,Math.PI*2);
    ctx.fillStyle='#fff';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(8.5,-5.5,1.5,0,Math.PI*2);
    ctx.fillStyle='#fff';
    ctx.fill();
    // Nose
    ctx.beginPath();
    ctx.arc(0,1,2.5,0,Math.PI*2);
    ctx.fillStyle='#f472b6';
    ctx.fill();
    // Mouth smile
    ctx.beginPath();
    ctx.arc(0,3,4,0.2,Math.PI-0.2);
    ctx.strokeStyle='#be185d';
    ctx.lineWidth=1.5;
    ctx.stroke();
    // Blush cheeks
    ctx.beginPath();
    ctx.arc(-12,4,5,0,Math.PI*2);
    ctx.fillStyle='rgba(252,165,165,0.55)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(12,4,5,0,Math.PI*2);
    ctx.fillStyle='rgba(252,165,165,0.55)';
    ctx.fill();
    // Sparkle near head
    var sp=Math.sin(Date.now()/200)*0.5+0.5;
    ctx.fillStyle='rgba(244,114,182,'+sp+')';
    ctx.beginPath(); ctx.arc(-28,-22,2,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(28,-22,1.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(0,-28,1.8,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }
  function drawFrame(){
    ctx.clearRect(0,0,W,H);
    var elapsed=Date.now()-startTime;
    vy+=0.18; // gravity
    hamX+=vx; hamY+=vy;
    // Bounce off floor/ceil/walls
    if(hamY>H-40){hamY=H-40;vy*=-0.72;bounces++;vx*=0.97;}
    if(hamY<40){hamY=40;vy*=-0.72;}
    if(hamX>W-30){hamX=W-30;vx*=-0.8;}
    if(hamX<30){hamX=30;vx*=-0.8;}
    angle=Math.atan2(vy,vx)*0.3;
    var sc=1+Math.abs(vy)*0.008;
    drawHamster(hamX,hamY,angle,sc);
    // Trail hearts
    if(Math.random()<0.15){
      ctx.font=(10+Math.random()*8)+'px serif';
      ctx.globalAlpha=0.6+Math.random()*0.4;
      ctx.fillText(['🌸','💕','✨'][Math.floor(Math.random()*3)],hamX-30+Math.random()*60,hamY-20+Math.random()*30);
      ctx.globalAlpha=1;
    }
    if(bounces<maxBounces && elapsed<maxMs){
      rafId=requestAnimationFrame(drawFrame);
    } else {
      // Fade out
      var op=1;
      (function fade(){
        ctx.globalAlpha=op-=0.07;
        if(op>0){requestAnimationFrame(fade);}
        else{canvas.remove();}
      })();
    }
  }
  rafId=requestAnimationFrame(drawFrame);
  setTimeout(function(){if(rafId)cancelAnimationFrame(rafId);if(canvas.parentNode)canvas.remove();},maxMs+1200);
  showToast('🐹 Fluffy Town diaktifkan! So cute~ 🌸');
}

// ══════════════════════════════════════════════
// 🐹 HAMSTER EATING KUACI EFFECT
// ══════════════════════════════════════════════
var _hamsterEatTimeout=null;
var _hamsterRafId=null;
function triggerHamsterEat(){
  var ov=document.getElementById('hamsterEatOverlay');
  var canvas=document.getElementById('hamsterCanvas');
  if(!ov||!canvas)return;
  var speeches=[
    'Nyam nyam kuaci~ 🌻','Enak banget! 😋','Satu lagi dong~ 🌸',
    'Makasih tasknya! 💕','Kamu hebat! ✨','Selesai! Hadiahnya kuaci~ 🐹'
  ];
  document.getElementById('hamsterSpeech').textContent=speeches[Math.floor(Math.random()*speeches.length)];
  ov.classList.add('active');
  clearTimeout(_hamsterEatTimeout);
  if(_hamsterRafId){cancelAnimationFrame(_hamsterRafId);_hamsterRafId=null;}
  var ctx=canvas.getContext('2d');
  var W=120,H=120;
  canvas.width=W;canvas.height=H;
  var startTime=Date.now();
  var duration=2200;
  var seedX=W*0.72, seedY=H*0.52;
  var seedEaten=false;
  var seedPhase=0;
  function drawHamsterEat(t){
    ctx.clearRect(0,0,W,H);
    var nibbleAngle=seedEaten?0:Math.sin(t*18)*0.12;
    var cx=W/2-4, cy=H/2+4;
    var sc=1.0;
    ctx.save();
    ctx.translate(cx,cy);
    ctx.rotate(nibbleAngle);
    ctx.scale(sc,sc);
    // Shadow
    ctx.beginPath();
    ctx.ellipse(0,24,20,6,0,0,Math.PI*2);
    ctx.fillStyle='rgba(244,114,182,0.12)';
    ctx.fill();
    // Body
    ctx.beginPath();
    ctx.ellipse(0,0,24,19,0,0,Math.PI*2);
    ctx.fillStyle='#FECDD3';
    ctx.fill();
    ctx.strokeStyle='rgba(244,114,182,0.35)';
    ctx.lineWidth=1.5;
    ctx.stroke();
    // Belly
    ctx.beginPath();
    ctx.ellipse(0,5,14,10,0,0,Math.PI*2);
    ctx.fillStyle='#FFE4E1';
    ctx.fill();
    // Stuffed cheeks (big because eating!)
    var chk=1+Math.sin(t*12)*0.06;
    ctx.beginPath();
    ctx.ellipse(-22,2,13*chk,11*chk,0.2,0,Math.PI*2);
    ctx.fillStyle='#FCA5A5';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(22,2,13*chk,11*chk,-0.2,0,Math.PI*2);
    ctx.fillStyle='#FCA5A5';
    ctx.fill();
    // Ears
    [['-15','-18',-.3],[14,'-18',.3]].forEach(function(e){
      ctx.beginPath();
      ctx.ellipse(parseInt(e[0]),parseInt(e[1]),9,8,parseFloat(e[2]),0,Math.PI*2);
      ctx.fillStyle='#FECDD3';ctx.fill();
      ctx.strokeStyle='rgba(244,114,182,0.3)';ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(parseInt(e[0]),parseInt(e[1]),4.5,4,parseFloat(e[2]),0,Math.PI*2);
      ctx.fillStyle='#FCA5A5';ctx.fill();
    });
    // Eyes (happy squint when eating)
    var eyeH=seedEaten?1.5:3;
    ctx.beginPath();
    ctx.ellipse(-8,-5,4,eyeH,0,0,Math.PI*2);
    ctx.fillStyle='#1c1917';ctx.fill();
    ctx.beginPath();
    ctx.ellipse(8,-5,4,eyeH,0,0,Math.PI*2);
    ctx.fillStyle='#1c1917';ctx.fill();
    // Eye shine
    ctx.beginPath();ctx.arc(-6,-7,1.5,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();
    ctx.beginPath();ctx.arc(10,-7,1.5,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();
    // Nose
    ctx.beginPath();ctx.arc(0,1,3,0,Math.PI*2);
    ctx.fillStyle='#f472b6';ctx.fill();
    // Mouth (open when eating, smile when done)
    if(!seedEaten){
      ctx.beginPath();
      ctx.arc(0,4,5,-0.1,Math.PI+0.1);
      ctx.fillStyle='#7c3aed';ctx.fill();
      ctx.beginPath();
      ctx.arc(0,4,2.5,0,Math.PI*2);
      ctx.fillStyle='#c4b5fd';ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(0,4,5,0.2,Math.PI-0.2);
      ctx.strokeStyle='#be185d';ctx.lineWidth=2;ctx.stroke();
    }
    // Blush
    ctx.beginPath();ctx.arc(-14,5,6,0,Math.PI*2);
    ctx.fillStyle='rgba(252,165,165,0.6)';ctx.fill();
    ctx.beginPath();ctx.arc(14,5,6,0,Math.PI*2);
    ctx.fillStyle='rgba(252,165,165,0.6)';ctx.fill();
    // Paws holding seed
    if(!seedEaten){
      ctx.beginPath();
      ctx.ellipse(-10,17,6,4,.3,0,Math.PI*2);
      ctx.fillStyle='#FECDD3';ctx.fill();ctx.strokeStyle='rgba(244,114,182,0.3)';ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(10,17,6,4,-.3,0,Math.PI*2);
      ctx.fillStyle='#FECDD3';ctx.fill();ctx.strokeStyle='rgba(244,114,182,0.3)';ctx.stroke();
    }
    ctx.restore();
    // Draw seed (sunflower seed / kuaci)
    if(!seedEaten){
      seedPhase+=0.15;
      var sy=cy+seedY-H/2+Math.sin(seedPhase)*1.5;
      var sx=cx+seedX-W/2;
      ctx.save();
      ctx.translate(sx,sy);
      ctx.rotate(Math.PI/4+Math.sin(seedPhase)*0.1);
      // Seed body
      ctx.beginPath();
      ctx.ellipse(0,0,5,8,0,0,Math.PI*2);
      ctx.fillStyle='#78350f';ctx.fill();
      // Seed stripes
      ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=1;
      for(var i=-1;i<=1;i++){
        ctx.beginPath();ctx.moveTo(i*2,-7);ctx.lineTo(i*2,7);ctx.stroke();
      }
      // Sparkle on seed
      ctx.fillStyle='rgba(245,158,11,0.8)';
      ctx.beginPath();ctx.arc(-7,-9,2,0,Math.PI*2);ctx.fill();
      ctx.restore();
    }
    // Sparkle particles
    if(Math.random()<0.3){
      var px=20+Math.random()*80,py=10+Math.random()*80;
      ctx.font=(8+Math.random()*8)+'px serif';
      ctx.globalAlpha=0.5+Math.random()*0.5;
      ctx.fillText(['🌸','✨','💕','⭐'][Math.floor(Math.random()*4)],px,py);
      ctx.globalAlpha=1;
    }
  }
  var phaseSeed=true;
  function animFrame(){
    var elapsed=Date.now()-startTime;
    var t=elapsed/1000;
    if(elapsed>900&&!seedEaten){seedEaten=true;}
    if(elapsed<duration){
      drawHamsterEat(t);
      _hamsterRafId=requestAnimationFrame(animFrame);
    } else {
      ctx.clearRect(0,0,W,H);
      ov.classList.remove('active');
      _hamsterRafId=null;
    }
  }
  _hamsterRafId=requestAnimationFrame(animFrame);
  _hamsterEatTimeout=setTimeout(function(){
    if(_hamsterRafId){cancelAnimationFrame(_hamsterRafId);_hamsterRafId=null;}
    ov.classList.remove('active');
    ctx.clearRect(0,0,canvas.width,canvas.height);
  },duration+400);
}

// ══════════════════════════════════════════════
// COMPLETION EFFECT
// ══════════════════════════════════════════════
function triggerCompletionEffect(){
  if(activeEffect==='effect-confetti')triggerConfetti();
  else if(activeEffect==='effect-stars')triggerStars();
  else if(activeEffect==='effect-firework')triggerFirework();
  else if(activeEffect==='effect-hamster')triggerHamsterEat();
}
function triggerConfetti(){
  var colors=['#f59e0b','#3b82f6','#16a34a','#ec4899','#8b5cf6'];
  for(var i=0;i<30;i++){
    (function(i){setTimeout(function(){
      var p=document.createElement('div');
      p.style.cssText='position:fixed;width:8px;height:8px;border-radius:2px;pointer-events:none;z-index:9999;top:-10px;left:'+(10+Math.random()*80)+'vw;background:'+colors[Math.floor(Math.random()*colors.length)]+';animation:confettiFall '+(0.8+Math.random()*1.2)+'s ease-in forwards;transform:rotate('+Math.random()*360+'deg)';
      document.body.appendChild(p);
      setTimeout(function(){p.remove();},2000);
    },i*40);})(i);
  }
}
function triggerStars(){
  for(var i=0;i<12;i++){
    (function(i){setTimeout(function(){
      var p=document.createElement('div');
      p.style.cssText='position:fixed;pointer-events:none;z-index:9999;font-size:'+(14+Math.random()*16)+'px;top:'+(20+Math.random()*60)+'vh;left:'+(10+Math.random()*80)+'vw;animation:starPop 1s ease-out forwards;opacity:0';
      p.textContent='⭐';
      document.body.appendChild(p);
      setTimeout(function(){p.remove();},1200);
    },i*60);})(i);
  }
}
function triggerFirework(){
  var colors=['#f59e0b','#ef4444','#3b82f6','#22c55e','#ec4899'];
  for(var i=0;i<50;i++){
    (function(i){setTimeout(function(){
      var p=document.createElement('div');
      var angle=Math.random()*Math.PI*2;
      var dist=30+Math.random()*120;
      p.style.cssText='position:fixed;width:6px;height:6px;border-radius:50%;pointer-events:none;z-index:9999;top:40vh;left:50vw;background:'+colors[Math.floor(Math.random()*colors.length)]+';animation:fireworkParticle 0.8s ease-out forwards;--tx:'+(Math.cos(angle)*dist)+'px;--ty:'+(Math.sin(angle)*dist)+'px';
      document.body.appendChild(p);
      setTimeout(function(){p.remove();},1000);
    },i*15);})(i);
  }
}

// ══════════════════════════════════════════════
// POMODORO TIMER
// ══════════════════════════════════════════════
function openPomoForTask(taskId){
  var t=tasks.filter(function(x){return x.id===taskId;})[0];
  if(t){pomoTaskId=taskId;document.getElementById('pomoTaskName').textContent='🍅 '+t.name;}
  openPomo();
}
function openPomo(){
  document.getElementById('pomoOverlay').classList.add('show');
  renderPomoTime();
}
function closePomo(){
  document.getElementById('pomoOverlay').classList.remove('show');
}
function setPomoMode(mode){
  pomoMode=mode;
  if(!pomoRunning){pomoSecondsLeft=POMO_DURATIONS[mode];renderPomoTime();}
  ['focus','short','long'].forEach(function(m){
    var btn=document.getElementById('pmb-'+m);
    if(btn)btn.classList.toggle('active',m===mode);
  });
}
function togglePomo(){
  if(pomoRunning){
    clearInterval(pomoTimer);pomoRunning=false;
    document.getElementById('pomoStartBtn').textContent='▶ Lanjut';
  } else {
    pomoRunning=true;
    document.getElementById('pomoStartBtn').textContent='⏸ Pause';
    pomoTimer=setInterval(function(){
      if(pomoSecondsLeft>0){
        pomoSecondsLeft--;
        renderPomoTime();
        updatePomoMini();
      } else {
        clearInterval(pomoTimer);pomoRunning=false;
        pomoSession++;
        var msg=pomoMode==='focus'?'🍅 Sesi selesai! Waktunya istirahat.':'☕ Istirahat selesai! Siap fokus lagi?';
        showToast(msg);
        if(pomoMode==='focus'){setPomoMode('short');}else{setPomoMode('focus');}
        // Try ring notification
        try{var a=new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAA');a.volume=0.3;a.play();}catch(e){}
      }
    },1000);
  }
  updatePomoMini();
}
function resetPomo(){
  clearInterval(pomoTimer);pomoRunning=false;
  pomoSecondsLeft=POMO_DURATIONS[pomoMode];
  document.getElementById('pomoStartBtn').textContent='▶ Mulai';
  renderPomoTime();
  updatePomoMini();
}
function renderPomoTime(){
  var total=POMO_DURATIONS[pomoMode];
  var m=Math.floor(pomoSecondsLeft/60),s=pomoSecondsLeft%60;
  var str=(m<10?'0':'')+m+':'+(s<10?'0':'')+s;
  var timeEl=document.getElementById('pomoTime');if(timeEl)timeEl.textContent=str;
  var sesEl=document.getElementById('pomoSession');
  if(sesEl)sesEl.textContent='Sesi '+pomoSession+' • '+(pomoRunning?'Berjalan...':'Siap');
  // SVG ring: circumference = 2*PI*70 ≈ 440
  var pct=pomoSecondsLeft/total;
  var offset=440*(1-pct);
  var fill=document.getElementById('pomoRingFill');
  if(fill)fill.style.strokeDashoffset=offset;
  // Ring color by mode
  var ringColor=pomoMode==='focus'?'var(--accent)':pomoMode==='short'?'var(--green)':'var(--blue)';
  if(fill)fill.style.stroke=ringColor;
}
function updatePomoMini(){
  var mini=document.getElementById('pomoMini');if(!mini)return;
  var pomoOverlayEl=document.getElementById('pomoOverlay');
  var overlayOpen=pomoOverlayEl&&pomoOverlayEl.classList.contains('show');
  if(pomoRunning&&!overlayOpen){mini.classList.add('show');}else{mini.classList.remove('show');}
  var m=Math.floor(pomoSecondsLeft/60),s=pomoSecondsLeft%60;
  var el=document.getElementById('pomoMiniTime');
  if(el)el.textContent=(m<10?'0':'')+m+':'+(s<10?'0':'')+s;
}

// ══════════════════════════════════════════════
// SHOP
// ══════════════════════════════════════════════
var shopCurrentTab='all';
function openShop(){
  document.getElementById('shopOverlay').classList.add('show');
  updateGoldDisplay();
  _shopInitDailyChips();
  renderShop();
}
function closeShop(){document.getElementById('shopOverlay').classList.remove('show');}
function shopSetTab(t){
  shopCurrentTab=t;
  ['all','themes','effects','custom','avatars','history'].forEach(function(tab){
    var el=document.getElementById('stab-'+tab);
    if(el)el.classList.toggle('active',tab===t);
  });
  renderShop();
}
function isOwned(id){
  if(id==='theme-light'||id==='theme-dark'||id==='effect-none')return true;
  var today = new Date().toISOString().slice(0,10);
  return shopPurchases.some(function(p){
    if(p.id!==id) return false;
    // Item lucky dengan expires: cek belum kedaluwarsa
    if(p.source==='lucky' && p.expires) return p.expires >= today;
    return true;
  });
}
// ── Rarity system ──
// Tiap item bisa punya field `rarity` eksplisit, atau otomatis dari harga.
// Class yang tersedia (urutan naik): common, uncommon, rare, epic, legendary, mythic
// Badge hanya muncul kalau rarity >= rare (tidak tampil untuk common & uncommon).
// Kalau nanti ada item baru dengan rarity eksplisit, langsung ikut sistem ini.
function _shopItemRarity(item,isCustom){
  if(isCustom)return '';
  // Prioritas: field rarity eksplisit di data item
  if(item.rarity){
    var valid=['common','uncommon','rare','epic','legendary','mythic'];
    if(valid.indexOf(item.rarity)!==-1)return ' rarity-'+item.rarity;
  }
  // Fallback: harga
  if(item.price>=500)return ' rarity-mythic';
  if(item.price>=200)return ' rarity-legendary';
  if(item.price>=120)return ' rarity-epic';
  if(item.price>=60) return ' rarity-rare';
  if(item.price>=20) return ' rarity-uncommon';
  return ' rarity-common';
}
// Label & icon untuk badge — hanya rare ke atas yang ditampilkan di card
var _RARITY_BADGE={
  'rare':      {label:'Rare',      show:true},
  'epic':      {label:'Epic',      show:true},
  'legendary': {label:'Legendary', show:true},
  'mythic':    {label:'Mythic',    show:true}
  // common & uncommon: show:false — tidak ditampilkan
};
function _shopRarityBadgeHTML(item,isCustom){
  if(isCustom)return '';
  var rarityClass=_shopItemRarity(item,isCustom).trim(); // e.g. "rarity-legendary"
  var key=rarityClass.replace('rarity-','');
  var cfg=_RARITY_BADGE[key];
  if(!cfg||!cfg.show)return '';
  return '<div class="shop-rarity-badge">'+cfg.label+'</div>';
}
function _shopItemCard(item,type,isCustom){
  var owned=isCustom?false:isOwned(item.id);
  var active=isCustom?false:(type==='theme'?activeTheme===item.id:activeEffect===item.id);
  var isFree=!isCustom&&item.price===0;
  var rarity=_shopItemRarity(item,isCustom);
  var onclick=isCustom?'redeemCustomItem(\''+item.id+'\')':'shopClickItem(\''+item.id+'\',\''+type+'\')';
  var cls='shop-item'+rarity+(owned?' owned':'')+(active?' active-item':'');
  var html='<div class="'+cls+'" onclick="'+onclick+'">';
  // Badges
  if(!owned&&!active&&!isFree){
    html+=_shopRarityBadgeHTML(item,isCustom);
  }
  if(isFree&&!owned)html+='<div class="shop-item-free-badge">GRATIS</div>';
  if(active)html+='<div class="shop-item-badge active-badge">✓ Aktif</div>';
  else if(owned)html+='<div class="shop-item-badge owned-badge">Dimiliki</div>';
  // Inner wrapper
  html+='<div class="shop-item-inner">';
  // ── Top row: icon + name & desc ──
  html+='<div class="shop-item-top">';
  html+=item.iconSvg
    ? '<div class="shop-item-icon-wrap"><img src="'+item.iconSvg+'" class="shop-item-icon shop-item-icon-svg" alt="'+item.name+'" style="width:44px;height:44px;object-fit:contain;display:block;"></div>'
    : '<div class="shop-item-icon-wrap"><span class="shop-item-icon">'+item.icon+'</span></div>';
  html+='<div class="shop-item-top-text">';
  html+='<div class="shop-item-name">'+item.name+'</div>';
  if(item.desc)html+='<div class="shop-item-desc">'+item.desc+'</div>';
  html+='</div>';
  html+='</div>';
  // ── Preview block ──
  if(!isCustom){
    html+='<div class="shop-item-preview" onclick="event.stopPropagation()">';
    if(type==='theme'){
      var v=THEME_VARS[item.id]||{};
      var bg=v['--bg']||'#f0ede8';
      var card=v['--card']||'#ffffff';
      var accent=v['--accent']||'#d97706';
      var textCol=v['--text']||'#1c1917';
      var border=v['--border']||'rgba(0,0,0,0.08)';
      var sidebar=v['--sidebar']||'#1c1917';
      var muted=v['--muted']||'#78716c';
      html+='<div class="shop-preview-theme-ui" style="background:'+bg+'">';
      html+='<div class="spt-sidebar" style="background:'+sidebar+'">';
      html+='<div class="spt-dot" style="background:'+accent+'"></div>';
      html+='<div class="spt-line active"></div>';
      html+='<div class="spt-line"></div><div class="spt-line"></div>';
      html+='</div>';
      html+='<div class="spt-body">';
      html+='<div class="spt-topbar">';
      html+='<div class="spt-heading" style="background:'+accent+'"></div>';
      html+='<div class="spt-heading-dot" style="background:'+accent+'"></div>';
      html+='</div>';
      [['78%',accent],['55%',muted],['68%',accent]].forEach(function(row){
        html+='<div class="spt-task" style="background:'+card+';border-color:'+border+'">';
        html+='<div class="spt-check" style="border-color:'+accent+'"></div>';
        html+='<div class="spt-task-bar" style="width:'+row[0]+';background:'+textCol+'"></div>';
        html+='<div class="spt-tag" style="background:'+row[1]+';margin-left:auto"></div>';
        html+='</div>';
      });
      html+='</div></div>';
    } else {
      var effectData={
        'effect-none':  {emojis:'— —',label:'Tanpa efek'},
        'effect-confetti': {emojis:'🎉 🎊 🎉',label:'Konfeti warna-warni'},
        'effect-stars':    {emojis:'⭐ ✨ ⭐',label:'Bintang berterbangan'},
        'effect-firework': {emojis:'🎆 💥 🎆',label:'Kembang api meledak'},
        'effect-hamster':  {emojis:'🐹',label:'Hamster makan kuaci!'}
      };
      var ed=effectData[item.id]||{emojis:item.icon,label:item.desc};
      html+='<div class="shop-preview-effect-ui">';
      html+='<div class="shop-preview-effect-wrap">';
      html+='<div class="shop-preview-effect-emojis">'+ed.emojis+'</div>';
      html+='<div class="shop-preview-effect-label">'+ed.label+'</div>';
      html+='</div></div>';
    }
    html+='</div>';
  }
  // ── Footer ──
  html+='<div class="shop-item-footer">';
  if(isCustom){html+='<div class="shop-item-price">🪙 '+item.cost+'</div>';}
  else if(owned){html+='<div class="shop-item-price owned-label">'+(active?'✓ Sedang Aktif':'▶ Aktifkan')+'</div>';}
  else if(isFree){html+='<div class="shop-item-price free-label">Gratis</div>';}
  else{html+='<div class="shop-item-price">🪙 '+item.price+'</div>';}
  html+='</div>';
  html+='</div>'; // close shop-item-inner
  html+='</div>';
  return html;
}
function _shopStatsBar(){
  var totalOwned=SHOP_THEMES.filter(function(i){return isOwned(i.id);}).length+SHOP_EFFECTS.filter(function(i){return isOwned(i.id);}).length+SHOP_AVATARS.filter(function(i){return isOwned(i.id);}).length;
  var totalItems=SHOP_THEMES.length+SHOP_EFFECTS.length+SHOP_AVATARS.length;
  var pct=Math.round(totalOwned/totalItems*100);
  return '<div class="shop-stats-bar">'
    +'<div class="shop-stats-pct">'+pct+'%</div>'
    +'<div class="shop-stats-right">'
    +'<div class="shop-stats-row">'
    +'<span class="shop-stats-lbl">Koleksi Terbuka</span>'
    +'<span class="shop-stats-count">'+totalOwned+' / '+totalItems+'</span>'
    +'</div>'
    +'<div class="shop-stats-track"><div class="shop-stats-fill" style="width:'+pct+'%"></div></div>'
    +'</div>'
    +'</div>';
}
function _shopRecordLoginToday(){
  // Catat login hari ini ke shopLoginDays, buang entri di luar minggu ini
  var now=new Date();
  var todayIso=now.toISOString().slice(0,10);
  // Hitung awal minggu ini (Minggu)
  var dayOfWeek=now.getDay(); // 0=Sun
  var weekStart=new Date(now);weekStart.setDate(now.getDate()-dayOfWeek);
  var weekStartIso=weekStart.toISOString().slice(0,10);
  // Buang hari di luar minggu ini
  shopLoginDays=shopLoginDays.filter(function(d){return d>=weekStartIso;});
  // Tambah hari ini jika belum ada
  if(shopLoginDays.indexOf(todayIso)<0){
    shopLoginDays.push(todayIso);
    saveData(true);
  }
}
function _shopInitDailyChips(){
  var chips=document.getElementById('shopDailyChips');
  if(!chips)return;
  var days=['S','M','T','W','T','F','S'];
  var now=new Date();
  var today=now.getDay(); // 0=Sun
  // Hitung tanggal ISO untuk setiap hari di minggu ini
  var weekStart=new Date(now);weekStart.setDate(now.getDate()-today);
  var html='';
  days.forEach(function(d,i){
    var dayDate=new Date(weekStart);dayDate.setDate(weekStart.getDate()+i);
    var dayIso=dayDate.toISOString().slice(0,10);
    var isToday=i===today;
    var isDone=shopLoginDays.indexOf(dayIso)>=0;
    var cls=isToday?'today':(isDone?'done':'');
    html+='<div class="shop-day-chip '+cls+'">'+d+'</div>';
  });
  chips.innerHTML=html;
}
function renderShop(){
  var body=document.getElementById('shopBody');if(!body)return;
  // Update tab counts
  var histCount=shopPurchases.length;
  var histTab=document.getElementById('stab-history');
  if(histTab)histTab.innerHTML='📜 Riwayat'+(histCount?'<span class="shop-tab-count">'+histCount+'</span>':'');
  var customCount=shopCustomItems.length;
  var customTab=document.getElementById('stab-custom');
  if(customTab)customTab.innerHTML='⭐ Custom'+(customCount?'<span class="shop-tab-count">'+customCount+'</span>':'');

  if(shopCurrentTab==='all'){
    var html=_shopStatsBar();
    // Legendary featured section
    var legendaries=SHOP_THEMES.concat(SHOP_EFFECTS).filter(function(i){return i.price>=200;});
    if(legendaries.length){
      html+='<div class="shop-section-label">⚡ Item Legendary</div>';
      legendaries.forEach(function(item){
        var isTheme=SHOP_THEMES.some(function(t){return t.id===item.id;});
        var type=isTheme?'theme':'effect';
        var owned=isOwned(item.id);
        var active=isTheme?activeTheme===item.id:activeEffect===item.id;
        var btnLabel=active?'✓ Sedang Aktif':owned?'▶ Aktifkan':'🪙 '+item.price+' Gold';
        var btnStyle=active?'background:rgba(22,163,74,0.2);border:1.5px solid rgba(22,163,74,0.4);color:#4ade80;border-radius:10px;padding:7px 16px;font-weight:700;font-size:12px;font-family:\'DM Sans\',sans-serif;cursor:pointer'
          :owned?'background:rgba(245,158,11,0.15);border:1.5px solid rgba(245,158,11,0.3);color:#fbbf24;border-radius:10px;padding:7px 16px;font-weight:700;font-size:12px;font-family:\'DM Sans\',sans-serif;cursor:pointer'
          :'background:linear-gradient(135deg,#7c3aed,#6d28d9);border:none;color:#fff;border-radius:10px;padding:7px 16px;font-weight:700;font-size:12px;font-family:\'DM Sans\',sans-serif;cursor:pointer;box-shadow:0 3px 12px rgba(109,40,217,0.35)';
        html+='<div class="shop-featured-banner">';
        html+=item.iconSvg ? '<img src="'+item.iconSvg+'" class="shop-featured-icon" style="width:54px;height:54px;object-fit:contain;display:inline-block;" alt="'+item.name+'">' : '<span class="shop-featured-icon">'+item.icon+'</span>';
        html+='<div class="shop-featured-info">';
        html+='<div class="shop-featured-name">'+item.name+'</div>';
        html+='<div class="shop-featured-desc">'+item.desc+'</div>';
        html+='<button onclick="shopClickItem(\''+item.id+'\',\''+type+'\')\" style="'+btnStyle+'">'+btnLabel+'</button>';
        html+='</div></div>';
      });
    }
    html+='<div class="shop-section-label" style="margin-top:8px">🎨 Tema <span onclick="shopSetTab(\'themes\')">Lihat semua →</span></div>';
    html+='<div class="shop-grid">';
    SHOP_THEMES.filter(function(i){return i.price<200;}).forEach(function(item){html+=_shopItemCard(item,'theme',false);});
    html+='</div>';
    html+='<div class="shop-section-label">✨ Efek Animasi <span onclick="shopSetTab(\'effects\')">Lihat semua →</span></div>';
    html+='<div class="shop-grid">';
    SHOP_EFFECTS.filter(function(i){return i.price<200;}).forEach(function(item){html+=_shopItemCard(item,'effect',false);});
    html+='</div>';
    if(shopCustomItems.length){
      html+='<div class="shop-section-label">⭐ Reward Custom <span onclick="shopSetTab(\'custom\')">Kelola →</span></div>';
      html+='<div class="shop-grid">';
      shopCustomItems.forEach(function(item){html+=_shopItemCard(item,'custom',true);});
      html+='</div>';
    }
    body.innerHTML=html;return;
  }
  if(shopCurrentTab==='themes'){
    var html=_shopStatsBar();
    html+='<div class="shop-section-intro">Tema mengubah tampilan keseluruhan aplikasi. Beli sekali, pakai selamanya.</div>';
    // Group by rarity
    var free=SHOP_THEMES.filter(function(i){return i.price===0;});
    var common=SHOP_THEMES.filter(function(i){return i.price>0&&i.price<60;});
    var rare=SHOP_THEMES.filter(function(i){return i.price>=60&&i.price<200;});
    var legend=SHOP_THEMES.filter(function(i){return i.price>=200;});
    if(free.length){html+='<div class="shop-section-label">☀️ Gratis</div><div class="shop-grid">';free.forEach(function(i){html+=_shopItemCard(i,'theme',false);});html+='</div>';}
    if(common.length){html+='<div class="shop-section-label">🎨 Tema Biasa</div><div class="shop-grid">';common.forEach(function(i){html+=_shopItemCard(i,'theme',false);});html+='</div>';}
    if(rare.length){html+='<div class="shop-section-label">💎 Tema Rare</div><div class="shop-grid">';rare.forEach(function(i){html+=_shopItemCard(i,'theme',false);});html+='</div>';}
    if(legend.length){html+='<div class="shop-section-label">⚡ Legendary</div><div class="shop-grid">';legend.forEach(function(i){html+=_shopItemCard(i,'theme',false);});html+='</div>';}
    body.innerHTML=html;return;
  }
  if(shopCurrentTab==='effects'){
    var html=_shopStatsBar();
    html+='<div class="shop-section-intro">Efek animasi keren muncul setiap kali kamu menyelesaikan task.</div>';
    var free=SHOP_EFFECTS.filter(function(i){return i.price===0;});
    var paid=SHOP_EFFECTS.filter(function(i){return i.price>0&&i.price<120;});
    var legend=SHOP_EFFECTS.filter(function(i){return i.price>=120;});
    if(free.length){html+='<div class="shop-section-label">☀️ Gratis</div><div class="shop-grid">';free.forEach(function(i){html+=_shopItemCard(i,'effect',false);});html+='</div>';}
    if(paid.length){html+='<div class="shop-section-label">✨ Efek Biasa</div><div class="shop-grid">';paid.forEach(function(i){html+=_shopItemCard(i,'effect',false);});html+='</div>';}
    if(legend.length){html+='<div class="shop-section-label">💥 Efek Eksklusif</div><div class="shop-grid">';legend.forEach(function(i){html+=_shopItemCard(i,'effect',false);});html+='</div>';}
    body.innerHTML=html;return;
  }
  if(shopCurrentTab==='custom'){
    var html='<div class="shop-custom-form">';
    html+='<div class="shop-custom-title">✏️ Buat Reward Custom</div>';
    html+='<div class="shop-custom-row">';
    html+='<div class="shop-custom-group" style="max-width:68px"><div class="shop-custom-label">Icon</div><input class="shop-custom-input" id="ci-icon" placeholder="🎮" maxlength="4" style="text-align:center;font-size:18px"></div>';
    html+='<div class="shop-custom-group"><div class="shop-custom-label">Nama Item</div><input class="shop-custom-input" id="ci-name" placeholder="Baca manhwa 2 ep"></div>';
    html+='<div class="shop-custom-group"><div class="shop-custom-label">Deskripsi</div><input class="shop-custom-input" id="ci-desc" placeholder="Hadiah untuk diri sendiri"></div>';
    html+='<div class="shop-custom-group" style="max-width:96px"><div class="shop-custom-label">Harga 🪙</div><input type="number" class="shop-custom-input" id="ci-cost" placeholder="10" min="1"></div>';
    html+='<button onclick="addCustomShopItem()" class="shop-custom-add-btn">+ Tambah</button>';
    html+='</div></div>';
    html+='<div class="shop-section-label" style="margin-top:8px">⭐ Reward Tersedia <span onclick="">'+shopCustomItems.length+' item</span></div>';
    if(!shopCustomItems.length){
      html+='<div class="shop-empty"><span class="shop-empty-icon">🎮</span><div class="shop-empty-text">Belum ada reward custom.<br>Buat hadiah untuk dirimu sendiri!</div></div>';
    }else{
      html+='<div class="shop-custom-list">';
      shopCustomItems.forEach(function(item){
        html+='<div class="shop-custom-item">';
        html+='<div class="shop-custom-item-info">'
          +'<div style="width:40px;height:40px;border-radius:10px;background:var(--card);border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">'+item.icon+'</div>'
          +'<div><b>'+item.name+'</b><br><span>'+item.desc+'</span></div>'
          +'</div>';
        html+='<div class="shop-custom-actions">';
        html+='<span class="shop-custom-price">🪙 '+item.cost+'</span>';
        html+='<button onclick="redeemCustomItem(\''+item.id+'\')" class="shop-custom-redeem">Tukar</button>';
        html+='<button onclick="deleteCustomShopItem(\''+item.id+'\')" class="shop-custom-delete">✕</button>';
        html+='</div></div>';
      });
      html+='</div>';
    }
    body.innerHTML=html;return;
  }
  if(shopCurrentTab==='history'){
    var html='<div class="shop-section-intro">Semua item yang pernah kamu beli atau tukar.</div>';
    if(!shopPurchases.length){
      html+='<div class="shop-empty"><span class="shop-empty-icon">💰</span><div class="shop-empty-text">Belum ada pembelian.<br>Kumpulkan gold dari task selesai, lalu belanja!</div></div>';
    }else{
      var typeLabel={'theme':'Tema','effect':'Efek','custom':'Custom'};
      html+='<div class="shop-history-list">';
      shopPurchases.slice().reverse().forEach(function(p){
        var expTag=(p.source==='lucky'&&p.expires)?'<span style="margin-left:4px;color:var(--gold);font-size:9px;font-weight:700;background:rgba(245,158,11,0.1);padding:1px 6px;border-radius:10px">⏳ s/d '+p.expires+'</span>':'';
        var tLabel=typeLabel[p.type]||p.type||'';
        html+='<div class="shop-history-item">';
        html+='<div class="shop-history-icon-wrap">'+(p.icon||'🛒')+'</div>';
        html+='<div class="shop-history-info">'
          +'<div class="shop-history-name">'+p.name+'</div>'
          +'<div class="shop-history-meta">'
          +(tLabel?'<span class="shop-history-type-badge">'+tLabel+'</span>':'')
          +' '+p.date+expTag
          +'</div>'
          +'</div>';
        html+='<div class="shop-history-cost">−🪙'+p.cost+'</div>';
        html+='</div>';
      });
      html+='</div>';
    }
    body.innerHTML=html;return;
  }
  if(shopCurrentTab==='avatars'){
    var html=_shopStatsBar();
    var rarityOrder=['hidden','epic','rare','uncommon','common'];
    var rarityLabel={common:'Common',uncommon:'Uncommon',rare:'Rare',epic:'Epic',hidden:'Hidden'};
    var rarityColor={common:'var(--muted)',uncommon:'var(--green,#22c55e)',rare:'var(--blue,#3b82f6)',epic:'var(--purple,#a855f7)',hidden:'#f59e0b'};
    var grouped={};
    SHOP_AVATARS.forEach(function(item){var r=item.rarity||'common';if(!grouped[r])grouped[r]=[];grouped[r].push(item);});
    rarityOrder.forEach(function(rarity){
      if(!grouped[rarity]||!grouped[rarity].length)return;
      var rc=rarityColor[rarity]||'var(--muted)';
      var rl=rarityLabel[rarity]||rarity;
      var icon={common:'🎭',uncommon:'⭐',rare:'💎',epic:'🔮',hidden:'✨'}[rarity]||'🎭';
      html+='<div class="shop-section-label">'+icon+' '+rl+'</div><div class="shop-grid">';
      grouped[rarity].forEach(function(item){
        var owned=isOwned(item.id);
        var isActive=activeAvatarCard===item.id;
        var maleUrl=item.spriteMale||'';
        var femaleUrl=item.spriteFemale||'';
        // Bug #7: clean display name — strip " - Char N" suffix
        var displayName=item.name.replace(/ - Char \d+/,'');
        var rarityClass=' rarity-'+rarity;
        var cls='shop-item'+rarityClass+(owned?' owned':'')+(isActive?' active-item':'');
        html+='<div class="'+cls+'" onclick="event.stopPropagation()">';
        // Badges
        if(isActive)html+='<div class="shop-item-badge active-badge">✓ Aktif</div>';
        else if(owned)html+='<div class="shop-item-badge owned-badge">Dimiliki</div>';
        else html+=_shopRarityBadgeHTML(item,false);
        html+='<div class="shop-item-inner">';
        // ── Avatar preview: two sprites side by side, larger size ──
        html+='<div class="shop-avatar-preview-wrap">';
        ['male','female'].forEach(function(g){
          var url=g==='male'?maleUrl:femaleUrl;
          var label=g==='male'?'♂':'♀';
          html+='<div style="text-align:center">';
          html+='<div class="shop-avatar-gender-label">'+label+'</div>';
          html+='<div class="job-picker-item-sprite-wrap" style="width:68px;height:68px;overflow:hidden">';
          if(url){
            html+='<div class="job-picker-item-sprite-anim shop-avatar-preview" data-jobid="'+item.jobId+'" data-gender="'+g+'" style="background-image:url(\''+url+'\');width:68px;height:68px"></div>';
          } else {
            html+='<div style="width:68px;height:68px;display:flex;align-items:center;justify-content:center;font-size:26px;color:var(--muted)">'+item.icon+'</div>';
          }
          html+='</div></div>';
        });
        html+='</div>';
        // ── Name & rarity label ──
        html+='<div class="shop-item-name" style="text-align:center;margin-bottom:2px">'+item.icon+' '+displayName+'</div>';
        html+='<div style="font-size:9px;color:'+rc+';font-weight:700;text-transform:uppercase;letter-spacing:0.4px;text-align:center;margin-bottom:4px">'+rl+'</div>';
        if(item.desc)html+='<div class="shop-item-desc" style="text-align:center">'+item.desc+'</div>';
        // ── Footer ──
        html+='<div class="shop-item-footer">';
        if(owned){html+='<div class="shop-item-price owned-label">'+(isActive?'✓ Sedang Aktif':'▶ Aktifkan')+'</div>';}
        else{html+='<div class="shop-item-price"'+(goldBalance<item.price?' style="opacity:0.6"':'')+'>'+(goldBalance<item.price?'🔒':'🪙')+' '+item.price+'</div>';}
        html+='</div>';
        html+='</div>'; // close shop-item-inner
        // ── Action button ──
        if(owned){
          if(isActive){
            html+='<button class="shop-item-btn" style="background:rgba(245,158,11,0.12);color:var(--accent);cursor:default;border-top:1px solid rgba(245,158,11,0.2)">✅ Aktif di Dashboard</button>';
          } else {
            html+='<button class="shop-item-btn" onclick="shopActivateAvatar(\''+item.id+'\')" style="background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff">🎭 Aktifkan</button>';
          }
        } else {
          var cantAfford=goldBalance<item.price;
          html+='<button class="shop-item-btn" onclick="shopBuyAvatar(\''+item.id+'\')" '
            +(cantAfford?'disabled style="background:var(--card);color:var(--muted);cursor:not-allowed;opacity:0.55"'
                        :'style="background:linear-gradient(135deg,var(--accent),#d97706);color:#fff"')
            +'>🪙 Beli — '+item.price+' Gold</button>';
        }
        html+='</div>'; // close shop-item card
      });
      html+='</div>'; // close shop-grid
    });
    if(!SHOP_AVATARS.length)html+='<div style="text-align:center;color:var(--muted);padding:40px 0;font-size:13px">Belum ada Avatar Card tersedia.</div>';
    body.innerHTML=html;
// ── Animate sprite sheets — pakai pixel absolut (konsisten dengan CT_SpriteConfig) ──
setTimeout(function(){
  SHOP_AVATARS.forEach(function(item){
    ['male','female'].forEach(function(g){
      var els = document.querySelectorAll('.shop-avatar-preview[data-jobid="'+item.jobId+'"][data-gender="'+g+'"]');
      if(!els.length) return;
      var cfg = (typeof CT_SpriteConfig !== 'undefined' && CT_SpriteConfig.getConfig(item.jobId, g)) || {};
      var cols = cfg.cols || 6, rows = cfg.rows || 6, fps = cfg.fps || 12, frameCount = cfg.frameCount || 36;
      var displayW = 68, displayH = 68; // ukuran kotak preview shop
      var keyName = 'shopPrev_'+item.jobId+'_'+g;
      var dur = (frameCount/fps).toFixed(3)+'s';
      if(!document.getElementById('kf_'+keyName)){
        var kfSteps = [];
        for(var f = 0; f < frameCount; f++){
          var col = f % cols, row = Math.floor(f / cols);
          var pct = Math.round((f/frameCount)*10000)/100;
          // PAKAI PIXEL ABSOLUT, bukan persentase
          kfSteps.push(pct+'%{background-position:-'+(col*displayW)+'px -'+(row*displayH)+'px}');
        }
        var st = document.createElement('style');
        st.id = 'kf_'+keyName;
        st.textContent = '@keyframes '+keyName+'{'+kfSteps.join('')+'}';
        document.head.appendChild(st);
      }
      for(var i = 0; i < els.length; i++){
        // backgroundSize = total sprite sheet scaled ke preview 68px
        els[i].style.backgroundSize = (cols*displayW)+'px '+(rows*displayH)+'px';
        els[i].style.animation = keyName+' '+dur+' steps(1) infinite';
      }
    });
  });
},80);
    return;
  }
}
var _shopConfirmCallback=null;
function openShopConfirm(icon,title,sub,okLabel,cb){
  document.getElementById('shopConfirmIcon').textContent=icon;
  document.getElementById('shopConfirmTitle').textContent=title;
  document.getElementById('shopConfirmSub').textContent=sub;
  document.getElementById('shopConfirmOkBtn').textContent=okLabel;
  _shopConfirmCallback=cb;
  document.getElementById('shopConfirmOverlay').classList.add('show');
}
function closeShopConfirm(){
  document.getElementById('shopConfirmOverlay').classList.remove('show');
  _shopConfirmCallback=null;
}
function doShopConfirm(){
  var cb=_shopConfirmCallback;
  closeShopConfirm();
  if(cb)cb();
}

function shopBuyAvatar(id){
  var item=SHOP_AVATARS.find(function(i){return i.id===id;});
  if(!item)return;
  if(goldBalance<item.price){showToast('Gold tidak cukup! Butuh 🪙'+item.price);return;}
  openShopConfirm(
    item.icon,
    'Beli '+item.name+'?',
    'Harga: 🪙 '+item.price+' gold  •  Saldo kamu: 🪙 '+goldBalance,
    '🪙 Beli Sekarang',
    function(){
      goldBalance-=item.price;
      shopPurchases.push({id:item.id,date:new Date().toISOString().slice(0,10),price:item.price,name:item.name,icon:item.icon});
      saveData(true);
      showToast(item.icon+' '+item.name+' berhasil dibeli!');
      renderShop();
    }
  );
}
function shopActivateAvatar(id){
  activeAvatarCard=id;
  saveData(true);
  showToast('🎭 Avatar Card diaktifkan!');
  renderShop();
  // ── Avatar = COSMETIC ONLY. Only override sprite appearance, not job state. ──
  var item=SHOP_AVATARS.find(function(i){return i.id===id;});
  if(!item)return;
  var _g=(typeof charGender!=='undefined')?charGender.get():'male';
  var _newSrc=_g==='female'?(item.spriteFemale||''):(item.spriteMale||'');
  // Patch sprite image
  var spriteEl=document.getElementById('char-sprite-img');
  if(spriteEl&&_newSrc){
    if(spriteEl.tagName==='IMG'){spriteEl.src=_newSrc;}
    else{spriteEl.style.backgroundImage="url('"+_newSrc+"')";spriteEl.setAttribute('data-sprite-url',_newSrc);}
  }
  var rarityStripColors={common:'linear-gradient(90deg,var(--border),var(--border))',uncommon:'linear-gradient(90deg,#22c55e,#16a34a)',rare:'linear-gradient(90deg,#3b82f6,#1d4ed8)',epic:'linear-gradient(90deg,#a855f7,#7c3aed)',hidden:'linear-gradient(90deg,#f59e0b,#b45309)'};
  var stripEl=document.querySelector('.char-card-rarity-strip');
  if(stripEl)stripEl.style.background=rarityStripColors[item.rarity]||rarityStripColors.common;
  // Bug #7: clean display name (strip " - Char N")
  var displayName=item.name.replace(/ - Char \d+/,'');
  // Only override the sprite label — DO NOT touch job state or char-job-badge
  // so that charJobs.getActive() still returns the correct gameplay job.
  var labelEl=document.getElementById('char-sprite-label');
  if(labelEl)labelEl.textContent=item.icon+' '+displayName;
  // Apply sprite animation config immediately (cosmetic only)
  // Bug #4 guard: safe fallback if CT_SpriteConfig or config missing
  if(typeof CT_SpriteConfig!=='undefined'){
    try{ CT_SpriteConfig.apply(item.jobId,_g); } catch(e){}
  }
  // Update skills card for paid job (paid avatars have their own jobId)
  var skillsCardEl=document.getElementById('char-skills-card');
  if(skillsCardEl&&typeof buildCharSkillsCard==='function'){
    var tmpDiv=document.createElement('div');
    tmpDiv.innerHTML=buildCharSkillsCard();
    var newCard=tmpDiv.firstChild;
    if(newCard)skillsCardEl.parentNode.replaceChild(newCard,skillsCardEl);
  }
}

function shopActivateAvatarFromPicker(id){
  shopActivateAvatar(id);
  if(typeof charJobs!=='undefined')charJobs.closePicker();
}

function shopClickItem(id,type){
  var catalog=type==='theme'?SHOP_THEMES:SHOP_EFFECTS;
  var item=catalog.filter(function(i){return i.id===id;})[0];if(!item)return;
  var owned=isOwned(id);
  if(owned){
    if(type==='theme'){
      activeTheme=id;applyTheme(id);
      if(id==='theme-slytherin')setTimeout(triggerSlytherinActivation,80);
      if(id==='theme-fluffytown')setTimeout(triggerFluffyTownActivation,80);
      if(id==='theme-sololeveling')setTimeout(triggerSoloLevelingActivation,80);
      showToast('🎨 Tema '+item.name+' diaktifkan!');
    }
    else{activeEffect=id;applyEffect(id);showToast('✨ Efek '+item.name+' diaktifkan!');}
    saveData(true);renderShop();
    // Re-render dashboard supaya radar chart langsung update
    setTimeout(function(){
      var dashEl=document.getElementById('mainContent');
      if(typeof renderDashboard==='function'&&dashEl) renderDashboard(dashEl);
    },120);
    return;
  }
  if(goldBalance<item.price){showToast('Gold tidak cukup! Butuh 🪙'+item.price);return;}
  openShopConfirm(
    item.icon,
    'Beli '+item.name+'?',
    'Harga: 🪙 '+item.price+' gold  •  Saldo kamu: 🪙 '+goldBalance,
    '🪙 Beli '+item.price+' Gold',
    function(){
      goldBalance-=item.price;
      // Hapus entry lama dengan id yang sama (misal dari lucky/boss reward) agar jadi permanen
      shopPurchases=shopPurchases.filter(function(p){return p.id!==id;});
      shopPurchases.push({id:id,name:item.name,icon:item.icon,cost:item.price,date:todayStr,type:type});
      if(type==='theme'){
        activeTheme=id;applyTheme(id);
        if(id==='theme-slytherin')setTimeout(triggerSlytherinActivation,120);
        if(id==='theme-fluffytown')setTimeout(triggerFluffyTownActivation,120);
        if(id==='theme-sololeveling')setTimeout(triggerSoloLevelingActivation,120);
      }
      else{activeEffect=id;applyEffect(id);}
      updateGoldDisplay();showToast('✅ '+item.icon+' '+item.name+' dibeli & diaktifkan!');
      saveData(true);renderShop();
      // Re-render dashboard supaya radar chart langsung update
      setTimeout(function(){
        var dashEl=document.getElementById('mainContent');
        if(typeof renderDashboard==='function'&&dashEl) renderDashboard(dashEl);
      },120);
    }
  );
}
function addCustomShopItem(){
  var icon=document.getElementById('ci-icon').value.trim()||'🎁';
  var name=document.getElementById('ci-name').value.trim();
  var desc=document.getElementById('ci-desc').value.trim();
  var cost=parseInt(document.getElementById('ci-cost').value)||10;
  if(!name){showToast('Isi nama item dulu!');return;}
  shopCustomItems.push({id:'ci'+(Date.now()),name:name,icon:icon,desc:desc,cost:cost});
  document.getElementById('ci-icon').value='';
  document.getElementById('ci-name').value='';
  document.getElementById('ci-desc').value='';
  document.getElementById('ci-cost').value='';
  showToast('Item "'+name+'" ditambahkan! ✅');saveData(true);renderShop();
}
function deleteCustomShopItem(id){
  shopCustomItems=shopCustomItems.filter(function(i){return i.id!==id;});
  showToast('Item dihapus');saveData(true);renderShop();
}
function redeemCustomItem(id){
  var item=shopCustomItems.filter(function(i){return i.id===id;})[0];if(!item)return;
  if(goldBalance<item.cost){showToast('Gold tidak cukup! Butuh 🪙'+item.cost);return;}
  openShopConfirm(
    item.icon,
    'Tukar "'+item.name+'"?',
    'Harga: 🪙 '+item.cost+' gold  •  Saldo kamu: 🪙 '+goldBalance,
    '🪙 Tukar '+item.cost+' Gold',
    function(){
      goldBalance-=item.cost;
      shopPurchases.push({id:'redeem-'+Date.now(),name:item.name,icon:item.icon,cost:item.cost,date:todayStr,type:'custom'});
      updateGoldDisplay();showToast('🎉 Selamat menikmati: '+item.icon+' '+item.name+'!');
      saveData(true);renderShop();
    }
  );
}

// ══════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════
function matchTaskToStat(t){
  var grp=(t.group||'').toLowerCase().trim();
  var nm=(t.name||'').toLowerCase();
  for(var i=0;i<CHAR_STAT_DEF.length-1;i++){
    var d=CHAR_STAT_DEF[i];
    for(var j=0;j<d.groups.length;j++){
      if(d.groups[j]&&grp.indexOf(d.groups[j])>=0)return d.key;
    }
  }
  for(var i=0;i<CHAR_STAT_DEF.length-1;i++){
    var d=CHAR_STAT_DEF[i];
    for(var j=0;j<d.groups.length;j++){
      if(d.groups[j]&&nm.indexOf(d.groups[j])>=0)return d.key;
    }
  }
  return t.type==='Habit'?'discipline':'intelligence';
}

function getRadarThemeConfig(){
  var t=activeTheme||'';
  var configs={
    'theme-dark':{
      cardBg:'linear-gradient(135deg,#1a1714 0%,#211e1a 50%,#1a1714 100%)',
      cardBorder:'rgba(245,158,11,0.3)',cardGlow:'0 4px 24px rgba(0,0,0,0.18)',
      cardTopLine:'linear-gradient(90deg,transparent,rgba(251,191,36,0.5),transparent)',
      polyStroke:'#f59e0b',polyGlow:'rgba(245,158,11,0.4)',ringStroke:'rgba(255,255,255,0.08)',axisStroke:'rgba(255,255,255,0.08)',
      centerBg:'rgba(28,25,23,0.95)',centerRing:'rgba(245,158,11,0.5)',centerTextColor:'#fbbf24',
      labelBg:'rgba(28,25,23,0.88)',classBg:'linear-gradient(135deg,#d97706,#b45309)',
      animation:'pulse',decorationType:'none',textLight:true
    },
    'theme-light':{
      cardBg:'linear-gradient(135deg,#faf8f5 0%,#f5f1eb 50%,#faf8f5 100%)',
      cardBorder:'rgba(180,130,50,0.3)',cardGlow:'0 4px 20px rgba(0,0,0,0.08),0 0 12px rgba(217,119,6,0.08)',
      cardTopLine:'linear-gradient(90deg,transparent,rgba(180,130,50,0.4),rgba(217,119,6,0.6),rgba(180,130,50,0.4),transparent)',
      polyStroke:'#b45309',polyGlow:'rgba(180,83,9,0.35)',ringStroke:'rgba(0,0,0,0.08)',axisStroke:'rgba(0,0,0,0.07)',
      centerBg:'rgba(255,255,255,0.97)',centerRing:'rgba(180,83,9,0.35)',centerTextColor:'#92400e',
      labelBg:'rgba(255,255,255,0.95)',classBg:'linear-gradient(135deg,#d97706,#b45309)',
      animation:'pulse',decorationType:'none',textLight:false
    },
    'theme-sololeveling':{
      cardBg:'linear-gradient(135deg,#04040f 0%,#090920 50%,#04040f 100%)',
      cardBorder:'rgba(124,106,247,0.45)',cardGlow:'0 0 30px rgba(124,106,247,0.2),0 4px 24px rgba(0,0,0,0.6)',
      cardTopLine:'linear-gradient(90deg,transparent,rgba(124,106,247,0.8),rgba(168,156,255,1),rgba(124,106,247,0.8),transparent)',
      polyStroke:'#7c6af7',polyGlow:'rgba(124,106,247,0.5)',ringStroke:'rgba(124,106,247,0.15)',axisStroke:'rgba(168,156,255,0.1)',
      centerBg:'rgba(4,4,16,0.95)',centerRing:'rgba(124,106,247,0.6)',centerTextColor:'#a89cff',
      labelBg:'rgba(4,4,16,0.88)',classBg:'linear-gradient(135deg,#7c6af7,#5b4de0)',
      animation:'sololeveling',decorationType:'runes',textLight:true
    },
    'theme-slytherin':{
      cardBg:'linear-gradient(135deg,#020a04 0%,#060f08 50%,#020a04 100%)',
      cardBorder:'rgba(45,187,93,0.4)',cardGlow:'0 0 30px rgba(45,187,93,0.12),0 4px 24px rgba(0,0,0,0.7)',
      cardTopLine:'linear-gradient(90deg,transparent,rgba(45,187,93,0.6),rgba(192,192,192,0.9),rgba(45,187,93,0.6),transparent)',
      polyStroke:'#2dbb5d',polyGlow:'rgba(45,187,93,0.45)',ringStroke:'rgba(45,187,93,0.12)',axisStroke:'rgba(45,187,93,0.1)',
      centerBg:'rgba(2,10,4,0.95)',centerRing:'rgba(45,187,93,0.5)',centerTextColor:'#5ddba0',
      labelBg:'rgba(2,8,3,0.88)',classBg:'linear-gradient(135deg,#2dbb5d,#1a7a3c)',
      animation:'slytherin',decorationType:'snake',textLight:true
    },
    'theme-fluffytown':{
      cardBg:'linear-gradient(135deg,#fff0f8 0%,#fde8f2 50%,#fff0f8 100%)',
      cardBorder:'rgba(244,114,182,0.5)',cardGlow:'0 0 20px rgba(244,114,182,0.2),0 4px 16px rgba(0,0,0,0.06)',
      cardTopLine:'linear-gradient(90deg,transparent,rgba(244,114,182,0.7),rgba(251,207,232,1),rgba(244,114,182,0.7),transparent)',
      polyStroke:'#f472b6',polyGlow:'rgba(244,114,182,0.5)',ringStroke:'rgba(244,114,182,0.25)',axisStroke:'rgba(244,114,182,0.15)',
      centerBg:'rgba(255,240,248,0.97)',centerRing:'rgba(244,114,182,0.5)',centerTextColor:'#be185d',
      labelBg:'rgba(255,245,250,0.95)',classBg:'linear-gradient(135deg,#f472b6,#ec4899)',
      animation:'fluffytown',decorationType:'stars',textLight:false
    },
    'theme-sunset':{
      cardBg:'linear-gradient(135deg,#2d0a00 0%,#3d1200 50%,#2d0a00 100%)',
      cardBorder:'rgba(234,88,12,0.45)',cardGlow:'0 0 30px rgba(234,88,12,0.15),0 4px 24px rgba(0,0,0,0.5)',
      cardTopLine:'linear-gradient(90deg,transparent,rgba(234,88,12,0.7),rgba(251,146,60,1),rgba(234,88,12,0.7),transparent)',
      polyStroke:'#ea580c',polyGlow:'rgba(251,146,60,0.5)',ringStroke:'rgba(234,88,12,0.15)',axisStroke:'rgba(251,146,60,0.12)',
      centerBg:'rgba(45,10,0,0.95)',centerRing:'rgba(234,88,12,0.6)',centerTextColor:'#fb923c',
      labelBg:'rgba(45,10,0,0.88)',classBg:'linear-gradient(135deg,#ea580c,#c2410c)',
      animation:'sunset',decorationType:'flames',textLight:true
    },
    'theme-midnight':{
      cardBg:'linear-gradient(135deg,#12101e 0%,#1a1730 50%,#12101e 100%)',
      cardBorder:'rgba(139,92,246,0.4)',cardGlow:'0 0 24px rgba(139,92,246,0.15),0 4px 20px rgba(0,0,0,0.5)',
      cardTopLine:'linear-gradient(90deg,transparent,rgba(139,92,246,0.7),rgba(167,139,250,1),rgba(139,92,246,0.7),transparent)',
      polyStroke:'#8b5cf6',polyGlow:'rgba(139,92,246,0.5)',ringStroke:'rgba(139,92,246,0.15)',axisStroke:'rgba(167,139,250,0.12)',
      centerBg:'rgba(18,16,30,0.95)',centerRing:'rgba(139,92,246,0.5)',centerTextColor:'#a78bfa',
      labelBg:'rgba(18,16,30,0.88)',classBg:'linear-gradient(135deg,#8b5cf6,#7c3aed)',
      animation:'pulse',decorationType:'stars',textLight:true
    }
  };
  // ✅ FIX: Cek configs[t] dulu — jika tema punya config khusus, pakai itu (termasuk tema sementara boss reward)
  if(configs[t]) return configs[t];
  // Fallback: beda config untuk light vs dark mode (untuk tema tanpa config khusus seperti forest, ocean, rose)
  if(!darkMode){
    // Light mode — pakai card terang netral agar menyatu dengan UI light
    return {
      cardBg:'linear-gradient(135deg,#faf8f5 0%,#f5f1eb 50%,#faf8f5 100%)',
      cardBorder:'rgba(180,130,50,0.3)',cardGlow:'0 4px 20px rgba(0,0,0,0.08),0 0 12px rgba(217,119,6,0.08)',
      cardTopLine:'linear-gradient(90deg,transparent,rgba(180,130,50,0.4),rgba(217,119,6,0.6),rgba(180,130,50,0.4),transparent)',
      polyStroke:'#b45309',polyGlow:'rgba(180,83,9,0.35)',ringStroke:'rgba(0,0,0,0.08)',axisStroke:'rgba(0,0,0,0.07)',
      centerBg:'rgba(255,255,255,0.97)',centerRing:'rgba(180,83,9,0.35)',centerTextColor:'#92400e',
      labelBg:'rgba(255,255,255,0.95)',classBg:'linear-gradient(135deg,#d97706,#b45309)',
      animation:'pulse',decorationType:'none',textLight:false
    };
  }
  return {
    cardBg:'linear-gradient(135deg,#1a1714 0%,#211e1a 50%,#1a1714 100%)',
    cardBorder:'rgba(245,158,11,0.3)',cardGlow:'0 4px 24px rgba(0,0,0,0.18)',
    cardTopLine:'linear-gradient(90deg,transparent,rgba(251,191,36,0.5),transparent)',
    polyStroke:'#f59e0b',polyGlow:'rgba(245,158,11,0.4)',ringStroke:'rgba(255,255,255,0.08)',axisStroke:'rgba(255,255,255,0.08)',
    centerBg:'rgba(28,25,23,0.95)',centerRing:'rgba(245,158,11,0.5)',centerTextColor:'#fbbf24',
    labelBg:'rgba(28,25,23,0.88)',classBg:'linear-gradient(135deg,#d97706,#b45309)',
    animation:'pulse',decorationType:'none',textLight:true
  };
}

function buildCharStatsCard(){
  var cfg=getRadarThemeConfig();
  var cx=90,cy=90,r=62,sides=6;
  var statLevels=CHAR_STAT_DEF.map(function(d){return getStatLevel(d.key);});
  var statPcts=CHAR_STAT_DEF.map(function(d){return getStatLevelPct(d.key);});
  var maxLv=50;
  var uid='r'+Date.now().toString(36);

  function ang(i){return(Math.PI*2/sides)*i-Math.PI/2;}
  function polarPt(i,val,maxVal,rad){
    var a=ang(i),f=maxVal>0?Math.max(0.07,val/maxVal):0.07;
    return[cx+rad*f*Math.cos(a),cy+rad*f*Math.sin(a)];
  }
  function labelPt(i,dist){var a=ang(i);return[cx+dist*Math.cos(a),cy+dist*Math.sin(a)];}

  var svg='<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg" style="overflow:visible;width:100%;height:100%">';

  // ── DEFS ──
  svg+='<defs>';
  svg+='<filter id="gl'+uid+'" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
  svg+='<filter id="sg'+uid+'" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
  svg+='<radialGradient id="rf'+uid+'" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="'+cfg.polyStroke+'" stop-opacity="0.4"/><stop offset="100%" stop-color="'+cfg.polyStroke+'" stop-opacity="0.04"/></radialGradient>';
  CHAR_STAT_DEF.forEach(function(d,i){
    svg+='<radialGradient id="vg'+uid+i+'" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="'+d.color+'" stop-opacity="0.9"/><stop offset="100%" stop-color="'+d.color+'" stop-opacity="0"/></radialGradient>';
  });
  svg+='</defs>';

  // ── THEME DECORATIONS ──
  if(cfg.decorationType==='snake'){
    // Slytherin: coiled snake orbiting the chart
    // Body segments as circles following circular path
    var segCount=18;
    for(var si=0;si<segCount;si++){
      var sa=ang(si/segCount*6); // evenly around
      var sr=r+15,sx=cx+sr*Math.cos(sa),sy=cy+sr*Math.sin(sa);
      var segAlpha=(0.12+si*0.008).toFixed(3);
      var segR=(si===0?6:si<3?4.5:3).toString();
      svg+='<circle cx="'+sx+'" cy="'+sy+'" r="'+segR+'" fill="'+(si===0?'#2dbb5d':'rgba(45,187,93,'+segAlpha+')')+'" stroke="'+(si===0?'rgba(192,192,192,0.8)':'none')+'" stroke-width="1"'+(si===0?' filter="url(#gl'+uid+')"':'')+' >';
      var dur=(10+si*0.15).toFixed(1)+'s';
      svg+='<animateTransform attributeName="transform" type="rotate" from="'+(si*20)+' '+cx+' '+cy+'" to="'+(si*20+360)+' '+cx+' '+cy+'" dur="'+dur+'" repeatCount="indefinite"/>';
      svg+='</circle>';
      if(si===0){
        // Eyes
        [-2,2].forEach(function(ex){
          svg+='<circle cx="'+(sx+ex)+'" cy="'+(sy-1.5)+'" r="1" fill="#070f09">';
          svg+='<animateTransform attributeName="transform" type="rotate" from="0 '+cx+' '+cy+'" to="360 '+cx+' '+cy+'" dur="10s" repeatCount="indefinite"/>';
          svg+='</circle>';
        });
        // Tongue
        svg+='<path d="M '+sx+' '+(sy+6)+' L '+(sx-2)+' '+(sy+10)+' M '+sx+' '+(sy+6)+' L '+(sx+2)+' '+(sy+10)+'" stroke="#ff4444" stroke-width="1.2" stroke-linecap="round" fill="none">';
        svg+='<animateTransform attributeName="transform" type="rotate" from="0 '+cx+' '+cy+'" to="360 '+cx+' '+cy+'" dur="10s" repeatCount="indefinite"/>';
        svg+='</path>';
      }
    }
    // Slytherin crest shimmer
    svg+='<circle cx="'+cx+'" cy="'+cy+'" r="'+(r+18)+'" fill="none" stroke="rgba(192,192,192,0.08)" stroke-width="2" stroke-dasharray="6,10">';
    svg+='<animateTransform attributeName="transform" type="rotate" from="0 '+cx+' '+cy+'" to="-360 '+cx+' '+cy+'" dur="25s" repeatCount="indefinite"/>';
    svg+='</circle>';
  }

  if(cfg.decorationType==='runes'){
    // Solo Leveling: shadow monarch runes + portal rings
    var runeGlyphs=['ᛟ','ᚾ','ᚱ','ᛊ','ᛏ','ᛁ'];
    for(var ri=0;ri<6;ri++){
      var rp=labelPt(ri,r+20);
      svg+='<text x="'+rp[0]+'" y="'+rp[1]+'" text-anchor="middle" dominant-baseline="middle" font-size="10" fill="rgba(124,106,247,0.55)" font-family="serif" filter="url(#gl'+uid+')">';
      svg+=runeGlyphs[ri];
      svg+='<animate attributeName="opacity" values="0.25;0.7;0.25" dur="'+(2+ri*0.4)+'s" repeatCount="indefinite"/>';
      svg+='<animateTransform attributeName="transform" type="translate" values="0,0;0,-4;0,0" dur="'+(2+ri*0.35)+'s" repeatCount="indefinite"/>';
      svg+='</text>';
    }
    // Dual counter-rotating portal rings
    svg+='<circle cx="'+cx+'" cy="'+cy+'" r="'+(r+16)+'" fill="none" stroke="rgba(124,106,247,0.2)" stroke-width="1.5" stroke-dasharray="5,9">';
    svg+='<animateTransform attributeName="transform" type="rotate" from="0 '+cx+' '+cy+'" to="360 '+cx+' '+cy+'" dur="18s" repeatCount="indefinite"/>';
    svg+='</circle>';
    svg+='<circle cx="'+cx+'" cy="'+cy+'" r="'+(r+22)+'" fill="none" stroke="rgba(168,156,255,0.1)" stroke-width="1" stroke-dasharray="3,14">';
    svg+='<animateTransform attributeName="transform" type="rotate" from="360 '+cx+' '+cy+'" to="0 '+cx+' '+cy+'" dur="24s" repeatCount="indefinite"/>';
    svg+='</circle>';
    // System alert: pulsing crown
    svg+='<text x="'+cx+'" y="'+(cy-r-20)+'" text-anchor="middle" font-size="16" filter="url(#gl'+uid+')">';
    svg+='👑<animate attributeName="opacity" values="0.4;1;0.4" dur="2.2s" repeatCount="indefinite"/></text>';
    // Corner shadow particles
    for(var pi=0;pi<8;pi++){
      var pp=labelPt(pi/8*6,r+8+Math.random()*10);
      svg+='<circle cx="'+pp[0]+'" cy="'+pp[1]+'" r="1.5" fill="rgba(124,106,247,0.6)">';
      svg+='<animate attributeName="opacity" values="0;0.8;0" dur="'+(1.5+pi*0.2)+'s" begin="'+(pi*0.3)+'s" repeatCount="indefinite"/>';
      svg+='<animate attributeName="r" values="1;2.5;1" dur="'+(1.5+pi*0.2)+'s" begin="'+(pi*0.3)+'s" repeatCount="indefinite"/>';
      svg+='</circle>';
    }
  }

  if(cfg.decorationType==='stars'){
    var isFluffy=cfg.animation==='fluffytown';
    // Orbiting dots/stars
    for(var fi=0;fi<(isFluffy?10:6);fi++){
      var fa=ang(fi/(isFluffy?10:6)*6);
      var fr=r+(isFluffy?18:16);
      var fx=cx+fr*Math.cos(fa),fy=cy+fr*Math.sin(fa);
      if(isFluffy){
        svg+='<circle cx="'+fx+'" cy="'+fy+'" r="'+(2+fi%3)+'" fill="rgba(244,114,182,'+(0.3+fi%3*0.15)+')">';
        svg+='<animateTransform attributeName="transform" type="rotate" from="'+(fi*36)+' '+cx+' '+cy+'" to="'+(fi*36+360)+' '+cx+' '+cy+'" dur="'+(7+fi*0.5)+'s" repeatCount="indefinite"/>';
        svg+='</circle>';
      }
      // Sparkle text
      var sp=labelPt(fi,r+22);
      svg+='<text x="'+sp[0]+'" y="'+sp[1]+'" font-size="'+(isFluffy?10:8)+'" text-anchor="middle" opacity="0.7">';
      svg+=(isFluffy?'✨':'⭐');
      svg+='<animate attributeName="opacity" values="0.3;0.9;0.3" dur="'+(1.4+fi*0.35)+'s" repeatCount="indefinite"/>';
      svg+='<animateTransform attributeName="transform" type="translate" values="0,0;'+(fi%2===0?'2,':'-2,')+'-3;0,0" dur="'+(1.6+fi*0.25)+'s" repeatCount="indefinite"/>';
      svg+='</text>';
    }
    if(isFluffy){
      // Big heart at top
      svg+='<text x="'+cx+'" y="'+(cy-r-20)+'" text-anchor="middle" font-size="16">';
      svg+='💖<animate attributeName="opacity" values="0.6;1;0.6" dur="1.2s" repeatCount="indefinite"/>';
      svg+='<animateTransform attributeName="transform" type="scale" values="1,1;1.15,1.15;1,1" additive="sum" dur="1.2s" repeatCount="indefinite"/>';
      svg+='</text>';
    }
  }

  if(cfg.decorationType==='flames'){
    // Sunset: rising embers + flame wisps at base
    for(var fli=0;fli<10;fli++){
      var flx=cx-65+fli*14;
      var fly=cy+r+10;
      svg+='<ellipse cx="'+flx+'" cy="'+fly+'" rx="4" ry="'+(6+fli%3*2)+'" fill="rgba(234,88,12,0.2)" filter="url(#gl'+uid+')">';
      svg+='<animateTransform attributeName="transform" type="translate" values="0,0;'+(fli%2===0?'2,':'-2,')+'-8;0,0" dur="'+(0.7+fli*0.1)+'s" repeatCount="indefinite"/>';
      svg+='<animate attributeName="opacity" values="0.3;0.85;0.3" dur="'+(0.65+fli*0.09)+'s" repeatCount="indefinite"/>';
      svg+='</ellipse>';
    }
    // Rising ember particles
    for(var ei=0;ei<8;ei++){
      var ex=cx-50+ei*14,ey=cy+r;
      svg+='<circle cx="'+ex+'" cy="'+ey+'" r="'+(1.5+ei%2)+'" fill="rgba(251,146,60,0.8)">';
      svg+='<animate attributeName="cy" values="'+ey+';'+(ey-r*0.6)+';'+ey+'" dur="'+(1.2+ei*0.15)+'s" repeatCount="indefinite"/>';
      svg+='<animate attributeName="opacity" values="0.9;0;0.9" dur="'+(1.2+ei*0.15)+'s" repeatCount="indefinite"/>';
      svg+='<animate attributeName="r" values="'+(1.5+ei%2)+';0.5;'+(1.5+ei%2)+'" dur="'+(1.2+ei*0.15)+'s" repeatCount="indefinite"/>';
      svg+='</circle>';
    }
    // Sun halo arc at top
    svg+='<path d="M '+(cx-r-5)+' '+cy+' A '+(r+5)+' '+(r+5)+' 0 0 1 '+(cx+r+5)+' '+cy+'" fill="none" stroke="rgba(251,146,60,0.15)" stroke-width="8" stroke-linecap="round">';
    svg+='<animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite"/>';
    svg+='</path>';
  }

  // ── BACKGROUND HEX ──
  var bgPts=[];
  for(var i=0;i<sides;i++){var bp=polarPt(i,maxLv,maxLv,r);bgPts.push(bp[0]+','+bp[1]);}
  var _hexBgFill=cfg.textLight?'rgba(0,0,0,0.04)':'rgba(0,0,0,0.2)';
  svg+='<polygon points="'+bgPts.join(' ')+'" fill="'+_hexBgFill+'" stroke="'+cfg.ringStroke+'" stroke-width="0.8"/>';

  // ── GRID RINGS ──
  for(var ring=1;ring<=5;ring++){
    var rpts=[];
    for(var i=0;i<sides;i++){var p=polarPt(i,ring,5,r);rpts.push(p[0]+','+p[1]);}
    svg+='<polygon points="'+rpts.join(' ')+'" fill="none" stroke="'+cfg.polyStroke+'" stroke-width="'+(ring===5?'1.2':'0.5')+'" opacity="'+(0.06+ring*0.04)+'"/>';
  }
  // ── AXIS LINES ──
  for(var i=0;i<sides;i++){
    var p=polarPt(i,5,5,r);
    svg+='<line x1="'+cx+'" y1="'+cy+'" x2="'+p[0]+'" y2="'+p[1]+'" stroke="'+cfg.axisStroke+'" stroke-width="0.8" stroke-dasharray="3,4"/>';
  }

  // ── FILLED POLYGON ──
  var filled=[],inner2=[];
  for(var i=0;i<sides;i++){
    var p=polarPt(i,statLevels[i],maxLv,r);filled.push(p[0]+','+p[1]);
    var p2=polarPt(i,statLevels[i]*0.6,maxLv,r);inner2.push(p2[0]+','+p2[1]);
  }
  var fs=filled.join(' ');
  // Glow shadow
  svg+='<polygon points="'+fs+'" fill="none" stroke="'+cfg.polyStroke+'" stroke-width="10" stroke-linejoin="round" opacity="0.15" filter="url(#sg'+uid+')"/>';
  // Fill
  svg+='<polygon points="'+fs+'" fill="url(#rf'+uid+')" stroke="'+cfg.polyStroke+'" stroke-width="1.8" stroke-linejoin="round">';
  svg+='<animate attributeName="opacity" values="0.88;1;0.88" dur="'+(cfg.animation==='fluffytown'?'1.4':'2.2')+'s" repeatCount="indefinite"/>';
  svg+='</polygon>';
  // Inner
  svg+='<polygon points="'+inner2.join(' ')+'" fill="'+cfg.polyStroke+'" opacity="0.07" stroke="none"/>';

  // ── VERTEX DOTS ──
  for(var i=0;i<sides;i++){
    var def=CHAR_STAT_DEF[i],lv=statLevels[i];
    var p=polarPt(i,lv,maxLv,r),hasPoints=lv>0;
    if(hasPoints){
      svg+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="10" fill="url(#vg'+uid+i+')" opacity="0.55"/>';
      var _dotStroke=cfg.textLight?'rgba(255,255,255,0.5)':'rgba(255,255,255,0.9)';
      svg+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="5" fill="'+def.color+'" stroke="'+_dotStroke+'" stroke-width="1.5" filter="url(#gl'+uid+')">';
      svg+='<animate attributeName="r" values="4.5;5.8;4.5" dur="'+(1.6+i*0.25)+'s" repeatCount="indefinite"/>';
      svg+='</circle>';
    } else {
      var _emptyDotFill=cfg.textLight?'rgba(0,0,0,0.06)':'rgba(255,255,255,0.1)';
      var _emptyDotStroke=cfg.textLight?'rgba(0,0,0,0.15)':'rgba(255,255,255,0.18)';
      svg+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="2.5" fill="'+_emptyDotFill+'" stroke="'+_emptyDotStroke+'" stroke-width="1"/>';
    }
  }

  // ── LABELS (pill boxes) ──
  for(var i=0;i<sides;i++){
    var def=CHAR_STAT_DEF[i],lv=statLevels[i],pct=statPcts[i];
    var lp=labelPt(i,r+28);
    svg+='<rect x="'+(lp[0]-20)+'" y="'+(lp[1]-14)+'" width="40" height="28" rx="7" fill="'+cfg.labelBg+'" stroke="'+def.color+'" stroke-width="'+(lv>0?'1.5':'0.5')+'" opacity="'+(lv>0?'1':'0.45')+'"/>';
    var _emptyLvColor=cfg.textLight?'rgba(255,255,255,0.2)':'rgba(0,0,0,0.18)';
    var _miniBarBg=cfg.textLight?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.1)';
    svg+='<text x="'+lp[0]+'" y="'+(lp[1]-3)+'" text-anchor="middle" dominant-baseline="middle" font-size="11">'+def.icon+'</text>';
    var _statRank=getStatRank(def.key);
    svg+='<text x="'+lp[0]+'" y="'+(lp[1]+8)+'" text-anchor="middle" dominant-baseline="middle" font-size="'+(lv>0&&_statRank.rank.length>1?'7':'8')+'" font-weight="800" fill="'+(lv>0?_statRank.color:_emptyLvColor)+'" font-family="DM Mono,monospace">'+(lv>0?_statRank.rank:'—')+'</text>';
    if(lv>0&&pct>0){
      svg+='<rect x="'+(lp[0]-13)+'" y="'+(lp[1]+16)+'" width="26" height="2" rx="1" fill="'+_miniBarBg+'"/>';
      svg+='<rect x="'+(lp[0]-13)+'" y="'+(lp[1]+16)+'" width="'+(26*pct/100).toFixed(1)+'" height="2" rx="1" fill="'+def.color+'" opacity="0.85"/>';
    }
  }

  // ── CENTER MEDALLION ──
  var totalLv=statLevels.reduce(function(a,b){return a+b;},0);
  var _overallRank=getOverallRank();
  svg+='<circle cx="'+cx+'" cy="'+cy+'" r="30" fill="'+cfg.centerBg+'" stroke="'+cfg.centerRing+'" stroke-width="1.5"/>';
  svg+='<circle cx="'+cx+'" cy="'+cy+'" r="26" fill="none" stroke="'+cfg.polyStroke+'" stroke-width="0.8" stroke-dasharray="4,8" opacity="0.45">';
  svg+='<animateTransform attributeName="transform" type="rotate" from="0 '+cx+' '+cy+'" to="360 '+cx+' '+cy+'" dur="20s" repeatCount="indefinite"/>';
  svg+='</circle>';
  svg+='<text x="'+cx+'" y="'+(cy-4)+'" text-anchor="middle" dominant-baseline="middle" font-size="'+(_overallRank.rank.length>1?'13':'17')+'" font-weight="900" fill="'+_overallRank.color+'" font-family="DM Mono,monospace" filter="url(#gl'+uid+')">';
  svg+=_overallRank.rank+'<animate attributeName="opacity" values="0.85;1;0.85" dur="2s" repeatCount="indefinite"/></text>';
  svg+='<text x="'+cx+'" y="'+(cy+10)+'" text-anchor="middle" dominant-baseline="middle" font-size="6" fill="'+cfg.centerTextColor+'" opacity="0.45" font-family="DM Sans,sans-serif" letter-spacing="1">RANK</text>';
  svg+='</svg>';

  // ── HTML WRAPPER ──
  var charClass=getCharClass();
  var textSubColor=cfg.textLight?'rgba(255,255,255,0.25)':'rgba(0,0,0,0.3)';
  var statTextColor=cfg.textLight?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)';
  // Check radar visibility state — hide if radar is disabled
  var radarHidden=isRadarHidden();
  var radarDisplayStyle=radarHidden?'display:none;':'';
  var html='<div id="dashRadarWrap" style="'+radarDisplayStyle+'">';
  html+='<div class="char-stats-card" style="background:'+cfg.cardBg+';border-color:'+cfg.cardBorder+';box-shadow:'+cfg.cardGlow+'">';
  html+='<div style="position:absolute;top:0;left:0;right:0;height:1px;background:'+cfg.cardTopLine+'"></div>';
  html+='<div class="char-title-row">';
  html+='<div style="display:flex;align-items:center;gap:8px">';
  html+='<span style="font-size:16px">⚔️</span>';
  html+='<span style="font-size:11px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:'+cfg.centerTextColor+'">Character Stats</span>';
  html+='</div>';
  var _radarJob=(typeof charJobs!=='undefined')?charJobs.getActive():{name:'Novice',icon:'⚔️'};
  html+='<div style="display:flex;align-items:center;gap:6px">';
  html+='<span style="font-size:14px">'+_radarJob.icon+'</span>';
  html+='<span style="font-size:10px;padding:3px 10px;border-radius:10px;color:#fff;font-weight:800;font-family:DM Mono,monospace;letter-spacing:0.5px;background:'+cfg.classBg+';box-shadow:0 2px 8px rgba(0,0,0,0.3)">'+_radarJob.name+'</span>';
  html+='</div></div>';
  html+='<div class="char-stats-inner">';
  html+='<div style="flex-shrink:0;width:180px;height:180px">'+svg+'</div>';
  html+='<div style="flex:1;min-width:130px;display:flex;flex-direction:column">';
  CHAR_STAT_DEF.forEach(function(def){
    var lv=getStatLevel(def.key),pct=getStatLevelPct(def.key),needed=getStatNextNeeded(def.key);
    var prog=charStatProgress[def.key]||0;
    var clr=lv>0?def.color:(cfg.textLight?'rgba(255,255,255,0.2)':'rgba(0,0,0,0.2)');
    html+='<div style="display:flex;align-items:center;gap:7px;margin-bottom:2px">';
    html+='<span style="font-size:13px;width:18px;text-align:center">'+def.icon+'</span>';
    html+='<span style="font-size:10px;font-weight:700;letter-spacing:0.3px;width:74px;flex-shrink:0;color:'+clr+'">'+def.name+'</span>';
    html+='<div style="flex:1;height:5px;background:'+statTextColor+';border-radius:3px;overflow:hidden">';
    html+='<div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,'+def.color+','+def.color+'aa);border-radius:3px;box-shadow:0 0 5px '+def.color+'66;transition:width 0.6s cubic-bezier(.34,1.56,.64,1)"></div>';
    html+='</div>';
    var _rowRank=getStatRank(def.key);
    html+='<span style="font-size:11px;font-weight:900;font-family:DM Mono,monospace;min-width:28px;text-align:right;color:'+_rowRank.color+'">'+_rowRank.rank+'</span>';
    html+='</div>';
    html+='<div style="padding-left:25px;font-size:8.5px;color:'+textSubColor+';margin-bottom:5px;font-family:DM Mono,monospace">';
    var _nextRank=getStatRank._nextRankLabel(def.key,lv);
    html+=(prog>0?prog+' total · ':'')+needed+' → '+_nextRank;
    html+='</div>';
  });
  html+='</div></div></div>';
  html+='</div>'; // close dashRadarWrap
  return html;
}

// ── CHAR USERNAME STATE ───────────────────────────────────────
var charUsername = '';

function getCharUsername() {
  if (charUsername) return charUsername;
  try { var v = localStorage.getItem('chitask_char_username'); if (v) { charUsername = v; return v; } } catch(e) {}
  return '';
}
function setCharUsername(name) {
  name = (name || '').trim().slice(0, 24);
  if (!name) return;
  charUsername = name;
  try { localStorage.setItem('chitask_char_username', name); } catch(e) {}
  // Sync ke sidebar
  var sidebarNameEl = document.getElementById('sidebar-char-username');
  if (sidebarNameEl) sidebarNameEl.textContent = name;
  // Re-render char name di card jika ada
  var cardNameEl = document.getElementById('char-card-name');
  if (cardNameEl) cardNameEl.textContent = name;
  // Update presence dengan nama baru
  if (typeof fbWritePresence === 'function') setTimeout(fbWritePresence, 200);
}
function promptChangeUsername() {
  var current = getCharUsername() || '';
  var modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.innerHTML = '<div style="background:var(--card);border-radius:16px;padding:24px 20px;width:100%;max-width:340px;box-shadow:0 20px 60px rgba(0,0,0,0.4)">'
    + '<div style="font-size:14px;font-weight:800;color:var(--text);margin-bottom:6px">✏️ Ganti Nama Petualang</div>'
    + '<div style="font-size:11px;color:var(--muted);margin-bottom:14px">Nama ini akan tampil di karakter & sidebar</div>'
    + '<input id="char-username-input" type="text" maxlength="24" placeholder="Nama petualangmu..." value="'+current+'" '
    + 'style="width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg);color:var(--text);font-size:13px;font-family:DM Sans,sans-serif;box-sizing:border-box;outline:none">'
    + '<div style="display:flex;gap:8px;margin-top:14px">'
    + '<button onclick="this.closest(\'div[style*=fixed]\').remove()" style="flex:1;padding:9px;border-radius:9px;border:1.5px solid var(--border);background:transparent;color:var(--muted);font-size:12px;font-weight:600;cursor:pointer;font-family:DM Sans,sans-serif">Batal</button>'
    + '<button onclick="setCharUsername(document.getElementById(\'char-username-input\').value);this.closest(\'div[style*=fixed]\').remove()" style="flex:2;padding:9px;border-radius:9px;border:none;background:var(--accent);color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:DM Sans,sans-serif">Simpan ✓</button>'
    + '</div></div>';
  document.body.appendChild(modal);
  var inp = document.getElementById('char-username-input');
  if (inp) { inp.focus(); inp.select(); }
  inp && inp.addEventListener('keydown', function(e){ if(e.key==='Enter'){ setCharUsername(inp.value); modal.remove(); } });
}
function showUsernameOnboardingPrompt() {
  // Guard: jangan buat modal duplikat
  if (document.getElementById('char-username-onboarding')) return;
  var modal = document.createElement('div');
  modal.id = 'char-username-onboarding';
  // z-index 99985: di atas annOverlay (99980) tapi di bawah tour (99990)
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:99985;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.innerHTML = '<div style="background:var(--card);border-radius:20px;padding:28px 22px;width:100%;max-width:360px;box-shadow:0 24px 80px rgba(0,0,0,0.5);text-align:center">'
    + '<div style="font-size:36px;margin-bottom:10px">⚔️</div>'
    + '<div style="font-size:17px;font-weight:800;color:var(--text);margin-bottom:6px">Siapa nama petualangmu?</div>'
    + '<div style="font-size:12px;color:var(--muted);margin-bottom:18px">Nama ini akan tampil di karakter & sidebar kamu</div>'
    + '<input id="char-username-onboarding-input" type="text" maxlength="24" placeholder="Masukkan nama..." '
    + 'style="width:100%;padding:12px 14px;border-radius:12px;border:1.5px solid var(--border);background:var(--bg);color:var(--text);font-size:14px;font-family:DM Sans,sans-serif;box-sizing:border-box;outline:none;text-align:center">'
    + '<button id="char-username-onboarding-btn" style="width:100%;margin-top:14px;padding:12px;border-radius:12px;border:none;background:#8b5cf6;color:#fff;font-size:14px;font-weight:800;cursor:pointer;font-family:DM Sans,sans-serif">Mulai Petualangan →</button>'
    + '</div>';
  document.body.appendChild(modal);
  // Gunakan querySelector dari modal langsung — hindari getElementById yang bisa ambil elemen salah
  var inp = modal.querySelector('#char-username-onboarding-input');
  var btn = modal.querySelector('#char-username-onboarding-btn');
  if (inp) { setTimeout(function(){ inp.focus(); }, 100); }

  function _submitUsername() {
    var v = inp ? inp.value.trim() : '';
    if (!v) { if(inp) inp.focus(); return; }
    setCharUsername(v);
    modal.remove();
    if (typeof renderDashboard === 'function' && document.getElementById('main-content')) {
      renderDashboard(document.getElementById('main-content'));
    }
    // Setelah nama diisi → coba tampilkan pengumuman yang tertahan, lalu tour
    if (typeof _annDequeueNext === 'function') setTimeout(_annDequeueNext, 300);
  }

  if (btn) btn.addEventListener('click', _submitUsername);
  if (inp) inp.addEventListener('keydown', function(e){
    if (e.key === 'Enter') _submitUsername();
  });
}

// ── JOB STORY DATA ────────────────────────────────────────────
var JOB_STORIES = {
  Novice: 'Tidak ada yang tahu dari mana {name} berasal. Suatu pagi mereka muncul di gerbang kota dengan hanya sebuah ransel lusuh dan tekad yang membara. Bukan karena warisan, bukan karena takdir — tapi karena pilihan. Setiap hari adalah petualangan baru, setiap tantangan adalah batu loncatan. Dunia ini luas, dan {name} baru saja memulai.',
  Hunter: '{name} tumbuh di antara rak-rak buku yang menjulang hingga langit-langit. Sejak kecil, pertanyaan selalu lebih menarik daripada jawaban. Perpustakaan kota menjadi rumah kedua, dan setiap halaman adalah pintu menuju dunia baru. Mereka percaya bahwa ilmu adalah satu-satunya pedang yang semakin tajam saat digunakan.',
  Warrior: 'Di medan latihan yang keras, {name} menemukan dirinya. Bukan melalui kemenangan, tapi melalui bangun kembali setelah jatuh. Ribuan kali gagal, ribuan kali bangkit. Tubuh adalah kanvas, dan disiplin adalah kuasnya. Hari ini lebih kuat dari kemarin — itu satu-satunya prinsip yang dipegang.',
  knight: 'Bertahun-tahun {name} mencari jawaban di luar diri. Kemudian suatu malam yang sunyi, mereka menyadari: semua yang dicari ada di dalam. Ketenangan bukan tentang absennya badai, tapi tentang tidak terguncang di tengah badai. Setiap nafas adalah meditasi, setiap langkah adalah doa.',
  paladin: '{name} pernah kehilangan seseorang yang dicintai karena kurangnya perawatan. Sejak hari itu, mereka bersumpah: selama ada daya, tidak akan ada yang dibiarkan menderita sendiri. Tubuh adalah kuil yang harus dijaga, jiwa adalah api yang harus dipelihara. Menyembuhkan orang lain dimulai dari menyembuhkan diri sendiri.',
  sage: 'Usia hanyalah angka, tapi kebijaksanaan {name} jauh melampaui tahun-tahun yang telah dilalui. Mereka telah melihat kejayaan dan kehancuran, cinta dan kehilangan. Dari semuanya, satu pelajaran yang tersisa: hidup terlalu singkat untuk dilewatkan tanpa makna. Setiap kata {name} ucapkan mengandung bobot seribu pengalaman.',
  bard: 'Musik pertama yang dimainkan {name} begitu buruk hingga anjing-anjing di seluruh kota melolong. Tapi mereka tidak berhenti. Tahun demi tahun, senar demi senar, nada demi nada. Kini ketika {name} bermain, orang-orang berhenti berjalan hanya untuk mendengar. Seni bukan tentang bakat — ini tentang keberanian untuk terus berlatih.',
  crusader: 'Sumpah seorang ksatria bukan diucapkan sekali, tapi dibuktikan setiap hari. {name} mengenakan zirah bukan untuk menakut-nakuti musuh, tapi sebagai pengingat akan tanggung jawab yang dipikul. Pelindung bukan orang yang tidak pernah takut — tapi orang yang memilih melangkah maju meski takut.',
  alchemist: 'Laboratorium {name} penuh dengan kegagalan yang diabadikan dalam jurnal tebal. Tapi bagi mereka, setiap gagal adalah data, setiap ledakan kecil adalah pelajaran. Alkimia sejati bukan mengubah timah menjadi emas — tapi mengubah kebiasaan kecil menjadi perubahan hidup yang besar. Rahasia terbesar {name}: sabar.',
  archmage: 'Ada momen ketika {name} sadar mereka telah melampaui semua guru yang pernah ada. Bukan dengan kesombongan, tapi dengan rasa syukur yang dalam. Kekuatan sejati bukanlah tentang seberapa besar api yang bisa dilempar, tapi tentang kebijaksanaan untuk tahu kapan tidak menggunakannya. Puncak bukan akhir — dari sana, terlihat betapa luasnya yang belum dijelajahi.',
  shadow: 'Tidak ada yang tahu siapa {name} sebenarnya. Dalam gelap, mereka berlatih sendirian — bukan untuk disaksikan, tapi karena disiplin itu sendiri adalah hadiah. 7 malam sempurna tanpa istirahat, tanpa pengecualian. Bayangan tidak berbohong: apa yang kamu lakukan saat tidak ada yang melihat, itulah dirimu yang sesungguhnya.',
  sovereign: 'Level 30 bukan hanya angka — itu adalah 30 tingkat pengorbanan, 30 tingkat konsistensi, 30 tingkat karakter yang dibangun hari demi hari. {name} tidak lahir sebagai pemimpin. Mereka menjadi pemimpin melalui pilihan-pilihan kecil yang tidak ada yang lihat, yang dilakukan berulang kali hingga menjadi siapa mereka sekarang. Mahkota ini pantas.',
};

function showCharStory() {
  var job = (typeof charJobs !== 'undefined') ? charJobs.getActive() : { id:'Novice', name:'Novice', icon:'⚔️' };
  var uname = getCharUsername() || 'Petualang';
  var storyTemplate = JOB_STORIES[job.id] || JOB_STORIES['Novice'];
  var story = storyTemplate.replace(/\{name\}/g, uname);
  var rarityColors = { common:'var(--muted)', uncommon:'var(--green)', rare:'var(--blue)', epic:'var(--purple)', hidden:'#f59e0b' };
  var rarityColor = rarityColors[job.rarity] || 'var(--muted)';
  var modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.innerHTML = '<div style="background:var(--card);border-radius:18px;padding:24px 22px;width:100%;max-width:380px;box-shadow:0 20px 60px rgba(0,0,0,0.5)">'
    + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">'
    + '<span style="font-size:28px">'+job.icon+'</span>'
    + '<div><div style="font-size:15px;font-weight:800;color:var(--text)">'+uname+'</div>'
    + '<div style="font-size:11px;font-weight:700;color:'+rarityColor+';text-transform:uppercase;letter-spacing:0.5px">'+job.name+'</div></div>'
    + '</div>'
    + '<div style="font-size:13px;line-height:1.7;color:var(--text);opacity:0.85;border-left:3px solid '+rarityColor+';padding-left:14px;font-style:italic">'+story+'</div>'
    + '<button onclick="this.closest(\'div[style*=fixed]\').remove()" style="width:100%;margin-top:18px;padding:10px;border-radius:10px;border:1.5px solid var(--border);background:transparent;color:var(--muted);font-size:12px;font-weight:700;cursor:pointer;font-family:DM Sans,sans-serif">Tutup</button>'
    + '</div>';
  document.body.appendChild(modal);
  modal.addEventListener('click', function(e){ if(e.target===modal) modal.remove(); });
}

// ── CHARACTER CARD ────────────────────────────────────────────
function buildCharacterCard(){
  var lv = getLevel();
  var curXP = getLevelXP();
  var needXP = getLevelXpNeeded();
  var pct = needXP > 0 ? Math.round(curXP / needXP * 100) : 100;

  // Username: charUsername state, fallback ke email prefix
  var uname = getCharUsername();
  if (!uname) {
    try {
      if(typeof fbUser !== 'undefined' && fbUser){
        uname = fbUser.displayName || fbUser._userName || fbUser.email || '';
        if(uname.indexOf('@') > -1) uname = uname.split('@')[0];
      }
    } catch(e){}
    if (!uname) uname = 'Petualang';
  }

  // Job aktif
  var job = (typeof charJobs !== 'undefined') ? charJobs.getActive() : { name:'Novice', icon:'⚔️', rarity:'common', sprite:'' };
  // Gender-aware sprite: pakai male.webp / female.webp, fallback ke idle.webp
  var _gender = (typeof charGender !== 'undefined') ? charGender.get() : 'male';
  var _jobFolder = job.sprite ? job.sprite.replace(/\/[^/]+\.webp$/, '/') : '';
  var spriteUrl = _jobFolder ? (_jobFolder + _gender + '.webp') : job.sprite;
  var hasSprite = spriteUrl && spriteUrl.length > 0;

  // Rarity warna & strip
  var rarityColors = { common:'var(--muted)', uncommon:'var(--green)', rare:'var(--blue)', epic:'var(--purple)', hidden:'#f59e0b' };
  var rarityStripColors = { common:'linear-gradient(90deg,var(--border),var(--border))', uncommon:'linear-gradient(90deg,#22c55e,#16a34a)', rare:'linear-gradient(90deg,#3b82f6,#1d4ed8)', epic:'linear-gradient(90deg,#a855f7,#7c3aed)', hidden:'linear-gradient(90deg,#f59e0b,#b45309)' };
  var rarityColor = rarityColors[job.rarity] || 'var(--muted)';
  var rarityStrip = rarityStripColors[job.rarity] || rarityStripColors.common;

  // Char class dari stat
  var charClass = (typeof getCharClass === 'function') ? getCharClass() : '—';

  var html = '<div class="dash-card char-card" id="char-card">';
  html += '<div class="char-card-rarity-strip" style="background:'+rarityStrip+'"></div>';
  // Sprite panel — langsung di dalam char-card (position:absolute relative to char-card)
  html += '<div class="char-sprite-panel">';
  // Job label overlaid top-left
  html += '<div class="char-sprite-label" id="char-sprite-label">'+job.icon+' '+job.name+'</div>';
  html += '<div class="char-sprite-wrap" id="char-sprite-wrap" style="cursor:default">';
  html += '<div class="char-sprite-shine"></div>';
  if (hasSprite) {
    html += '<div class="char-sprite-anim" id="char-sprite-img" style="background-image:url(\''+spriteUrl+'\')" data-sprite-url="'+spriteUrl+'" data-fallback="'+job.sprite+'"></div>';
  }
  html += '<div class="char-sprite-placeholder" id="char-sprite-placeholder" style="display:'+(hasSprite?'none':'flex')+'"><span>'+job.icon+'</span></div>';
  html += '</div>';
  html += '</div>'; // end sprite panel

  html += '<div class="char-card-inner">';
  // Header row — tanpa judul "⚔️ Karakter", langsung action buttons
  html += '<div class="char-card-header">';
  html += '<div style="display:flex;gap:8px">'
    + '<a class="char-card-header-action" onclick="showCharStory()">📜 Cerita</a>'
    + '<a class="char-card-header-action" onclick="typeof charJobs!==\'undefined\'&&charJobs.openPicker()">🔄 Ganti Job</a>'
    + '<a class="char-card-header-action char-gender-toggle" onclick="charGender.toggle()" id="char-gender-btn" title="Ganti Jenis Kelamin">'
    + ((typeof charGender !== 'undefined' && charGender.get() === 'female') ? '♀ Female' : '♂ Male')
    + '</a>'
    + '</div>';
  html += '</div>';

  // Body: info saja (sprite sudah di luar)
  html += '<div class="char-card-body">';
  // Info karakter
  html += '<div class="char-card-info">';
  // Name row with edit button tepat di kanan username
  html += '<div class="char-name-row">'
    + '<span class="char-name" id="char-card-name">'+uname+'</span>'
    + '<button class="char-edit-name-btn" onclick="promptChangeUsername()" title="Ganti nama">✏️</button>'
    + '</div>';
  html += '<div class="char-job-badge rarity-'+job.rarity+'" id="char-job-badge" style="color:'+rarityColor+';border-color:'+rarityColor+'">'
    + '<span>'+job.icon+'</span> '+job.name+'</div>';
  // Class row dihapus — info sudah ada di job badge
  html += '<div class="char-level-row">'
    + '<span class="char-lv-num">Lv&nbsp;<b>'+lv+'</b></span>'
    + '<span class="char-xp-label">'+curXP+' / '+needXP+' XP</span>'
    + '</div>';
  html += '<div class="char-xp-bar"><div class="char-xp-fill" style="width:'+pct+'%"></div></div>';
  html += '<div class="char-gold-row">🪙 <b>'+(typeof goldBalance !== 'undefined' ? goldBalance : 0)+'</b> <span style="font-size:10px;color:var(--muted)">gold</span></div>';
  html += '</div>'; // end char-card-info
  html += '</div>'; // end char-card-body
  html += '</div>'; // end char-card-inner
  html += '</div>'; // end dash-card
  return html;
}

function buildCharSkillsCard(){
  var job = (typeof charJobs !== 'undefined') ? charJobs.getActive() : { id:'Novice', name:'Novice', icon:'⚔️', rarity:'common' };
  var rarityColors = { common:'var(--muted)', uncommon:'var(--green)', rare:'var(--blue)', epic:'var(--purple)', hidden:'#f59e0b' };
  var rarityColor = rarityColors[job.rarity] || 'var(--muted)';
  var skills = (typeof CT_JobSkills !== 'undefined') ? CT_JobSkills.getSkills(job.id) : [];
  // Preserve open/closed state across re-renders (default: closed)
  var isOpen = (typeof _charSkillsOpen !== 'undefined') ? _charSkillsOpen : false;

  var html = '<div class="dash-card char-skills-card" id="char-skills-card">';
  // Clickable header with chevron
  html += '<div class="dash-card-title" onclick="toggleCharSkillsCard()" style="cursor:pointer;display:flex;align-items:center;justify-content:space-between;user-select:none">'
    + '<span>⚡ Skill <span style="font-size:10px;color:'+rarityColor+';font-weight:700;margin-left:4px">'+job.icon+' '+job.name+'</span></span>'
    + '<span id="char-skills-chevron" style="font-size:11px;color:var(--muted);transition:transform 0.2s;display:inline-block;transform:'+(isOpen?'rotate(180deg)':'rotate(0deg)')+'">▼</span>'
    + '</div>';

  html += '<div id="char-skills-body" style="overflow:hidden;transition:max-height 0.25s ease;max-height:'+(isOpen?'1000px':'0px')+'">';
  if (!skills || skills.length === 0) {
    html += '<div style="font-size:11px;color:var(--muted);padding:8px 0">Skill belum tersedia untuk job ini.</div>';
  } else {
    html += '<div class="char-skills-list">';
    skills.forEach(function(sk){
      var dmgMin = sk.damage ? sk.damage[0] : '?';
      var dmgMax = sk.damage ? sk.damage[1] : '?';
      var weightPct = Math.round((sk.weight || 10));
      html += '<div class="char-skill-row">';
      html += '<div class="char-skill-icon">'+sk.icon+'</div>';
      html += '<div class="char-skill-body">';
      html += '<div class="char-skill-name-row">'
        + '<span class="char-skill-name">'+sk.name+'</span>'
        + '<span class="char-skill-dmg">'+dmgMin+'–'+dmgMax+'</span>'
        + '</div>';
      html += '<div class="char-skill-desc">'+sk.description+'</div>';
      if (sk.effects && sk.effects.length) {
        html += '<div class="char-skill-effects">';
        sk.effects.slice(0,2).forEach(function(eff){
          html += '<span class="char-skill-eff-tag">'+eff.label+'</span>';
        });
        html += '</div>';
      }
      html += '</div>'; // skill-body
      // Weight bar
      html += '<div class="char-skill-weight" title="'+weightPct+'% kemungkinan">'
        + '<div class="char-skill-weight-fill" style="height:'+Math.min(100,weightPct)+'%"></div>'
        + '</div>';
      html += '</div>'; // skill-row
    });
    html += '</div>'; // char-skills-list
  }
  html += '</div>'; // char-skills-body (collapsible)
  html += '</div>'; // dash-card
  return html;
}

var _charSkillsOpen = false;
function toggleCharSkillsCard(){
  _charSkillsOpen = !_charSkillsOpen;
  var body = document.getElementById('char-skills-body');
  var chevron = document.getElementById('char-skills-chevron');
  if(body) body.style.maxHeight = _charSkillsOpen ? '1000px' : '0px';
  if(chevron) chevron.style.transform = _charSkillsOpen ? 'rotate(180deg)' : 'rotate(0deg)';
}

function renderDashboard(el){
  var today7=[];for(var i=6;i>=0;i--){today7.push(offset(-i));}
  // Habits today
  var habitTasks=tasks.filter(function(t){return t.type==='Habit'&&isHabitDueToday(t);});
  var habitDoneCount=habitTasks.filter(function(t){return t.done;}).length;
  var habitPct=habitTasks.length?Math.round(habitDoneCount/habitTasks.length*100):0;
  // Tasks pending
  var pendingTasks=tasks.filter(function(t){return !t.done&&t.type!=='Habit';});
  // Finance this month
  var finS=getFinSummary(today.getMonth(),today.getFullYear());
  var totalBal=getTotalWalletBalance();
  // Journal streak
  var jStreak=getJournalStreak();
  // Recent transactions (last 3)
  var recentTx=finTransactions.slice().sort(function(a,b){return b.date.localeCompare(a.date);}).slice(0,4);
  // Weekly habit completion
  var weekHabitData=today7.map(function(d){
    var dayHabits=tasks.filter(function(t){return t.type==='Habit'&&t.history;});
    var done=dayHabits.filter(function(t){return t.history.indexOf(d)>=0;}).length;
    return{date:d,done:done,total:dayHabits.length};
  });

  var radarOff=typeof isRadarHidden==='function'&&isRadarHidden();
  var html='<div class="dash-wrap'+(radarOff?' radar-off':'')+'">';

  // ── ROW 1: Character Card (full width, di paling atas) ──
  html+=buildCharacterCard();
  html+=buildCharSkillsCard();

  // ── ROW 2: Horoscope (kiri) + Character Stats (kanan), stretch sama tinggi ──
  html+='<div class="dash-top-row">';
  if(typeof horoscope !== 'undefined'){
    html+='<div class="dash-top-horoscope">'+horoscope.getCard()+'</div>';
  }
  html+='<div class="dash-top-radar">'+buildCharStatsCard()+'</div>';
  html+='</div>';

  // Gold & XP card — only shown in focus mode (gamer mode has this info in char card)
  html+='<div class="dash-card" id="dash-gold-level-card">';
  html+='<div class="dash-card-title">🪙 Gold & Level <a onclick="openShop()">Toko →</a></div>';
  html+='<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;min-width:0">';
  html+='<div style="min-width:0;flex:1"><div class="dash-big-num" style="color:var(--gold);font-size:22px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+goldBalance+'</div><div class="dash-sub">gold tersisa</div></div>';
  html+='<div style="text-align:right;flex-shrink:0"><div class="dash-big-num" style="font-size:16px;color:var(--accent);white-space:nowrap">'+document.getElementById('xpLevelLabel').textContent+'</div><div class="dash-sub" style="white-space:nowrap">'+xp+' XP</div></div>';
  html+='</div></div>';

  // Habits today card
  html+='<div class="dash-card">';
  html+='<div class="dash-card-title">🔥 Habit Hari Ini <a onclick="switchView(\'habits\')">Lihat →</a></div>';
  html+='<div class="dash-big-num" style="color:'+(habitPct>=80?'var(--green)':habitPct>=50?'var(--gold)':'var(--red)')+'">'+habitPct+'%</div>';
  html+='<div class="dash-sub">'+habitDoneCount+'/'+habitTasks.length+' habit selesai</div>';
  html+='<div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden;margin-top:8px"><div style="height:100%;width:'+habitPct+'%;background:'+(habitPct>=80?'var(--green)':habitPct>=50?'var(--gold)':'var(--red)')+';border-radius:3px;transition:width 0.4s"></div></div>';
  html+='</div>';

  // Task pending
  html+='<div class="dash-card">';
  html+='<div class="dash-card-title">✅ Task Pending <a onclick="switchView(\'all\')">Lihat →</a></div>';
  html+='<div class="dash-big-num" style="color:var(--blue)">'+pendingTasks.length+'</div>';
  html+='<div class="dash-sub">task belum selesai</div>';
  if(pendingTasks.slice(0,3).length){
    html+='<div style="margin-top:8px">';
    pendingTasks.slice(0,3).forEach(function(t){
      html+='<div style="font-size:11px;color:var(--muted);padding:2px 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">• '+t.name+'</div>';
    });
    html+='</div>';
  }
  html+='</div>';

  // Saldo + saving target
  var savingPct=finSavingTarget>0?Math.min(100,Math.round(finS.saving/finSavingTarget*100)):0;
  html+='<div class="dash-card">';
  html+='<div class="dash-card-title">💰 Keuangan <a onclick="switchView(\'fin-overview\')">Detail →</a></div>';
  html+='<div style="font-size:13px;font-weight:700;font-family:DM Mono;color:var(--blue);margin-bottom:4px">'+fmtRp(totalBal)+'</div>';
  html+='<div class="dash-sub" style="margin-bottom:6px">Total saldo wallet</div>';
  html+='<div style="font-size:11px;color:var(--green);font-weight:600">+'+fmtRp(finS.income)+'</div>';
  html+='<div style="font-size:11px;color:var(--red);font-weight:600">-'+fmtRp(finS.expense)+'</div>';
  if(finSavingTarget>0){
    html+='<div style="font-size:10px;color:var(--muted);margin-top:6px">Target tabungan: '+fmtRp(finSavingTarget)+'</div>';
    html+='<div class="saving-target-bar"><div class="saving-target-fill" style="width:'+savingPct+'%"></div></div>';
    html+='<div style="font-size:10px;color:var(--muted);margin-top:2px">'+savingPct+'% tercapai ('+fmtRp(finS.saving)+')</div>';
  }
  html+='</div>';

  // Journal streak
  html+='<div class="dash-card" id="dash-journal-card">';
  html+='<div class="dash-card-title">📓 Jurnal <a onclick="switchView(\'journal-today\')">Tulis →</a></div>';
  html+='<div class="dash-big-num" style="color:var(--purple)">'+jStreak+'</div>';
  html+='<div class="dash-sub">hari streak jurnal</div>';
  var todayJournal=getJournalEntry(todayStr);
  html+='<div style="margin-top:8px;font-size:11px;color:'+(todayJournal?'var(--green)':'var(--muted)')+'">'+(todayJournal?'✅ Sudah tulis hari ini':'✏️ Belum tulis hari ini')+'</div>';
  html+='</div>';

  // Weekly habit mini chart — full width so it never sits orphaned in either mode
  html+='<div class="dash-card full">';
  html+='<div class="dash-card-title">📊 Habit 7 Hari Terakhir</div>';
  html+='<div style="display:flex;align-items:flex-end;gap:6px;height:50px;margin-bottom:6px">';
  var days7=['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
  weekHabitData.forEach(function(d){
    var pct=d.total?d.done/d.total:0;
    var color=pct>=0.8?'var(--green)':pct>=0.5?'var(--gold)':'var(--border)';
    var h=Math.max(4,Math.round(pct*46));
    var dObj=new Date(d.date+'T00:00:00');
    html+='<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px">';
    html+='<div style="width:100%;height:'+h+'px;background:'+color+';border-radius:3px 3px 0 0;transition:height 0.3s"></div>';
    html+='<div style="font-size:9px;color:var(--muted)">'+days7[dObj.getDay()]+'</div>';
    html+='</div>';
  });
  html+='</div></div>';

  // Recent transactions
  html+='<div class="dash-card full">';
  html+='<div class="dash-card-title">💳 Transaksi Terakhir <a onclick="switchView(\'fin-transactions\')">Lihat semua →</a></div>';
  if(!recentTx.length){html+='<div style="color:var(--muted);font-size:12px;text-align:center;padding:12px">Belum ada transaksi</div>';}
  else{
    recentTx.forEach(function(tx){
      var typeIcon=tx.type==='income'?'📥':tx.type==='expense'?'📤':'💙';
      var typeColor=tx.type==='income'?'var(--green)':tx.type==='expense'?'var(--red)':'var(--blue)';
      html+='<div class="dash-tx-row">';
      html+='<span>'+typeIcon+' <span style="font-weight:500">'+(tx.note||tx.category||'-')+'</span><span style="color:var(--muted);font-size:10px;margin-left:6px">'+fmtDate(tx.date)+'</span></span>';
      html+='<span style="font-family:DM Mono;font-weight:700;color:'+typeColor+'">'+(tx.type==='expense'?'-':'+')+''+fmtRp(tx.amount)+'</span>';
      html+='</div>';
    });
  }
  html+='</div>';


  // ── STATISTIK SECTION (merged from stats view) ──
  var days7stat=[];for(var i=6;i>=0;i--)days7stat.push(offset(-i));
  var barData=days7stat.map(function(d){
    var count=tasks.filter(function(t){return t.doneDate===d||(t.type==='Habit'&&t.history&&t.history.indexOf(d)>=0);}).length;
    return{d:d,count:count};
  });
  var maxBar=Math.max.apply(null,barData.map(function(b){return b.count;}))||1;
  var barsHtml='';
  barData.forEach(function(b){
    var ht=Math.round((b.count/maxBar)*60);
    var dayName=new Date(b.d+'T00:00:00').toLocaleDateString('id-ID',{weekday:'short'});
    var isToday=b.d===todayStr;
    barsHtml+='<div class="bar-col">'      +'<div class="bar-val">'+b.count+'</div>'      +'<div class="bar" style="height:'+(ht||2)+'px;background:'+(isToday?'var(--accent)':'#d6b896')+';width:100%"></div>'      +'<div class="bar-lbl" style="font-weight:'+(isToday?'700':'400')+'">'+dayName+'</div>'      +'</div>';
  });
  var habits=tasks.filter(function(t){return t.type==='Habit';});
  var todayHabits2=habits.filter(function(t){return isHabitDueToday(t);});
  var completionPct=todayHabits2.length?Math.round(todayHabits2.filter(function(t){return t.history&&t.history.indexOf(todayStr)>=0;}).length/todayHabits2.length*100):0;
  var maxStreak=habits.reduce(function(m,t){return Math.max(m,calcStreak(t));},0);
  var lv=getLevel();
  var totalTasks=tasks.length;
  var doneTasks=tasks.filter(function(t){return t.done;}).length;
  var totalHabits=habits.length;
  var todayDoneHabits=todayHabits2.filter(function(t){return t.history&&t.history.indexOf(todayStr)>=0;}).length;

  // Stats heading
  html+='<div class="dash-card full" style="padding:0;overflow:hidden">';
  html+='<div style="padding:12px 14px 10px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">';
  html+='<div style="font-size:13px;font-weight:800;color:var(--text)">📊 Statistik</div>';
  html+='</div>';
  html+='<div style="padding:14px">';
  // 4 stat cards
  html+='<div class="stats-grid-4" style="margin-bottom:10px">'    +'<div class="stat-card-sm"><div class="stat-num-sm" style="color:var(--accent)">'+totalDone+'</div><div class="stat-lbl-sm">Total Selesai</div></div>'    +'<div class="stat-card-sm"><div class="stat-num-sm" style="color:var(--green)">'+completionPct+'%</div><div class="stat-lbl-sm">Habit Hari Ini</div></div>'    +'<div class="stat-card-sm"><div class="stat-num-sm" style="color:#c2410c">'+maxStreak+'🔥</div><div class="stat-lbl-sm">Streak Terbaik</div></div>'    +'<div class="stat-card-sm"><div class="stat-num-sm" style="color:var(--purple)">'+lv+'</div><div class="stat-lbl-sm">Level Saat Ini</div></div>'    +'</div>';
  html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">'    +'<div class="stat-card-sm"><div class="stat-num-sm" style="color:var(--blue)">'+totalTasks+'</div><div class="stat-lbl-sm">Total Task</div></div>'    +'<div class="stat-card-sm"><div class="stat-num-sm" style="color:var(--green)">'+doneTasks+'</div><div class="stat-lbl-sm">Task Selesai</div></div>'    +'<div class="stat-card-sm"><div class="stat-num-sm" style="color:var(--gold)">'+totalHabits+'</div><div class="stat-lbl-sm">Total Habit</div></div>'    +'<div class="stat-card-sm"><div class="stat-num-sm" style="color:#15803d">'+todayDoneHabits+'/'+todayHabits2.length+'</div><div class="stat-lbl-sm">Habit Selesai Hari Ini</div></div>'    +'</div>';
  // Bar chart 7 hari
  html+='<div class="chart-title" style="margin-bottom:8px">📅 Task Selesai — 7 Hari Terakhir</div>'    +'<div class="bar-chart" style="margin-bottom:12px">'+barsHtml+'</div>';
  // Habit trend 30 hari
  if(habits.length){
    var days30=[];for(var i=29;i>=0;i--)days30.push(offset(-i));
    var trendData=days30.map(function(d){
      var dueHabits=habits.filter(function(t){
        var dd=getRepeatDays(t.repeat||'Harian');
        var anchor=t.due||todayStr;
        var anchorD=new Date(anchor+'T00:00:00');
        var checkD=new Date(d+'T00:00:00');
        var diff=Math.round((checkD-anchorD)/86400000);
        return diff>=0&&diff%dd===0;
      });
      var doneCount=habits.filter(function(t){return t.history&&t.history.indexOf(d)>=0;}).length;
      var dueCount=dueHabits.length||habits.length;
      return{d:d,done:doneCount,due:dueCount,pct:dueCount?Math.round(doneCount/dueCount*100):0};
    });
    var maxDue=Math.max.apply(null,trendData.map(function(x){return x.due;}))||1;
    html+='<div class="chart-title" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">'      +'🔥 Tren Habit — 30 Hari Terakhir<span style="font-size:10px;font-weight:400;color:var(--muted)">bar=selesai, garis=target</span></div>';
    html+='<div style="display:flex;align-items:flex-end;gap:2px;height:72px;margin-bottom:4px">';
    trendData.forEach(function(b){
      var doneH=Math.round((b.done/maxDue)*60);
      var dueH=Math.round((b.due/maxDue)*60);
      var isToday=b.d===todayStr;
      var pctColor=b.pct>=80?'var(--green)':b.pct>=50?'#f59e0b':'var(--red)';
      html+='<div title="'+fmtShort(b.d)+': '+b.done+'/'+b.due+' ('+b.pct+'%)" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:0;position:relative;height:72px">'        +'<div style="position:absolute;bottom:0;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:72px">'        +'<div style="width:80%;height:'+(doneH||1)+'px;background:'+(isToday?'var(--accent)':pctColor)+';border-radius:2px 2px 0 0;opacity:0.85;transition:height 0.3s"></div>'        +'</div>'        +(dueH>doneH?'<div style="position:absolute;bottom:'+doneH+'px;width:100%;border-top:2px dashed rgba(0,0,0,0.15)"></div>':'')        +(isToday?'<div style="position:absolute;bottom:-14px;font-size:8px;color:var(--accent);font-weight:700">▲</div>':'')        +'</div>';
    });
    html+='</div>';
    html+='<div style="display:flex;gap:2px;margin-top:14px">';
    trendData.forEach(function(b,i){
      var show=i%5===0||b.d===todayStr;
      html+='<div style="flex:1;text-align:center;font-size:8px;color:var(--muted)">'+(show?b.d.slice(8):'')+'</div>';
    });
    html+='</div>';
    var avg=Math.round(trendData.reduce(function(s,b){return s+b.pct;},0)/30);
    var best=Math.max.apply(null,trendData.map(function(b){return b.pct;}));
    html+='<div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap">'      +'<span style="font-size:11px;color:var(--muted)">Rata-rata: <b style="color:var(--text)">'+avg+'%</b></span>'      +'<span style="font-size:11px;color:var(--muted)">Hari terbaik: <b style="color:var(--green)">'+best+'%</b></span>'      +'<span style="font-size:11px;color:var(--muted)">Hari aktif: <b style="color:var(--accent)">'+trendData.filter(function(b){return b.done>0;}).length+'/30</b></span>'      +'</div>';
  }
  // XP progress
  html+='<div style="margin-top:14px"><div class="chart-title" style="margin-bottom:8px">⚡ Progress XP — Level '+lv+'</div>'    +'<div style="display:flex;align-items:center;gap:12px">'    +'<div style="font-size:36px;font-weight:700;font-family:DM Mono,monospace;color:var(--accent)">'+lv+'</div>'    +'<div style="flex:1"><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:5px"><span>Level '+lv+'</span><span>'+getLevelXP()+'/'+getLevelXpNeeded()+' XP</span></div>'    +'<div style="height:12px;background:var(--border);border-radius:6px;overflow:hidden"><div style="height:100%;width:'+(getLevelXpNeeded()>0?(getLevelXP()/getLevelXpNeeded()*100):100)+'%;background:linear-gradient(90deg,var(--accent),#fbbf24);border-radius:6px;transition:width 0.4s"></div></div>'    +'<div style="font-size:11px;color:var(--muted);margin-top:6px">Total XP: <b>'+xp+'</b> &nbsp;|&nbsp; Butuh <b>'+(getLevelXpNeeded()-getLevelXP())+'</b> XP lagi ke Level '+(lv+1)+'</div>'    +'</div></div></div>';
  html+='</div></div>'; // end stats inner padding + card

  html+='</div>'; // end dash-wrap
  el.innerHTML=html;
  // Terapkan sprite config setelah DOM selesai dirender
  // Double-fire: 0ms untuk render awal, 120ms untuk pastikan layout stabil (fix ukuran avatar saat pindah view)
  if (typeof CT_SpriteConfig !== 'undefined' && typeof charGender !== 'undefined') {
    var _applyGender = charGender.get();
    setTimeout(function(){ CT_SpriteConfig.applyAll(_applyGender); }, 0);
    setTimeout(function(){ CT_SpriteConfig.applyAll(_applyGender); }, 120);
  }
}

// ══════════════════════════════════════════════
// WEEKLY REVIEW
// ══════════════════════════════════════════════
function openWeeklyReview(){
  document.getElementById('wrOverlay').classList.add('show');
  renderWeeklyReview();
  weeklyReviewLastSeen=todayStr;
  saveData();
}
function closeWeeklyReview(){document.getElementById('wrOverlay').classList.remove('show');}
function renderWeeklyReview(){
  var body=document.getElementById('wrBody');if(!body)return;
  // Last 7 days
  var days7=[];for(var i=6;i>=0;i--)days7.push(offset(-i));
  var startDate=days7[0],endDate=days7[6];
  document.getElementById('wrSubTitle').textContent=fmtDate(startDate)+' — '+fmtDate(endDate);

  // Habits completion
  var habitTasks=tasks.filter(function(t){return t.type==='Habit'&&t.history;});
  var totalHabitDays=0,doneHabitDays=0;
  habitTasks.forEach(function(t){
    days7.forEach(function(d){
      totalHabitDays++;
      if(t.history.indexOf(d)>=0)doneHabitDays++;
    });
  });
  var habitRate=totalHabitDays?Math.round(doneHabitDays/totalHabitDays*100):0;

  // Tasks completed this week
  var doneThisWeek=tasks.filter(function(t){return t.doneDate&&days7.indexOf(t.doneDate)>=0;}).length;

  // Finance this week
  var weekIncome=0,weekExpense=0;
  finTransactions.forEach(function(tx){
    if(!tx.date)return;
    if(days7.indexOf(tx.date)<0)return;
    if(tx.type==='income')weekIncome+=tx.amount;
    else if(tx.type==='expense')weekExpense+=tx.amount;
  });
  // Top expense category
  var cats={};
  finTransactions.filter(function(tx){return tx.type==='expense'&&days7.indexOf(tx.date)>=0;}).forEach(function(tx){cats[tx.category||'Lainnya']=(cats[tx.category||'Lainnya']||0)+tx.amount;});
  var topCat=Object.keys(cats).sort(function(a,b){return cats[b]-cats[a];})[0];

  // Gold earned
  var goldEarned=doneThisWeek*GOLD_PER_TASK; // approx

  // Journal entries this week
  var journalThisWeek=journalEntries.filter(function(e){return days7.indexOf(e.date)>=0;}).length;

  var html='';
  // Stats row
  html+='<div class="wr-section"><div class="wr-section-title">📋 Ringkasan Minggu Ini</div>';
  html+='<div class="wr-stat-row">';
  html+='<div class="wr-stat"><div class="wr-stat-num" style="color:var(--green)">'+doneThisWeek+'</div><div class="wr-stat-lbl">Task Selesai</div></div>';
  html+='<div class="wr-stat"><div class="wr-stat-num" style="color:var(--accent)">'+habitRate+'%</div><div class="wr-stat-lbl">Habit Rate</div></div>';
  html+='<div class="wr-stat"><div class="wr-stat-num" style="color:var(--gold)">'+goldBalance+'🪙</div><div class="wr-stat-lbl">Gold Total</div></div>';
  html+='</div></div>';

  // Habit breakdown
  html+='<div class="wr-section"><div class="wr-section-title">🔥 Habit Terbaik Minggu Ini</div>';
  var topHabits=habitTasks.map(function(t){
    var done=days7.filter(function(d){return t.history.indexOf(d)>=0;}).length;
    return{name:t.name,done:done,pct:Math.round(done/7*100)};
  }).sort(function(a,b){return b.done-a.done;}).slice(0,4);
  if(!topHabits.length){html+='<div style="color:var(--muted);font-size:12px">Belum ada data habit.</div>';}
  else{
    topHabits.forEach(function(h){
      html+='<div class="dash-habit-row"><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+h.name+'</span><span style="font-weight:700;font-family:DM Mono;font-size:11px;color:var(--accent);margin-left:8px">'+h.done+'/7</span></div>';
      html+='<div class="dash-habit-bar"><div class="dash-habit-fill" style="width:'+h.pct+'%"></div></div>';
    });
  }
  html+='</div>';

  // Finance summary
  html+='<div class="wr-section"><div class="wr-section-title">💰 Keuangan Minggu Ini</div>';
  html+='<div class="wr-stat-row">';
  html+='<div class="wr-stat"><div class="wr-stat-num" style="color:var(--green);font-size:16px">'+fmtRp(weekIncome)+'</div><div class="wr-stat-lbl">Pemasukan</div></div>';
  html+='<div class="wr-stat"><div class="wr-stat-num" style="color:var(--red);font-size:16px">'+fmtRp(weekExpense)+'</div><div class="wr-stat-lbl">Pengeluaran</div></div>';
  html+='</div>';
  if(topCat)html+='<div style="font-size:12px;color:var(--muted);margin-top:6px">💸 Pengeluaran terbesar: <b>'+topCat+'</b> ('+fmtRp(cats[topCat])+')</div>';
  html+='</div>';

  // Jurnal
  html+='<div class="wr-section"><div class="wr-section-title">📓 Jurnal & Refleksi</div>';
  html+='<div style="display:flex;gap:8px">';
  html+='<div class="wr-stat"><div class="wr-stat-num" style="color:var(--purple)">'+journalThisWeek+'</div><div class="wr-stat-lbl">Entri Jurnal</div></div>';
  html+='<div class="wr-stat"><div class="wr-stat-num" style="color:var(--blue)">'+getJournalStreak()+'</div><div class="wr-stat-lbl">Hari Streak</div></div>';
  html+='</div></div>';

  // Motivasi
  var msgs=['Kerja keras kamu minggu ini luar biasa! 🚀','Tetap konsisten, hasilnya pasti terlihat! 💪','Setiap task yang selesai adalah langkah maju! ✨','Kamu lebih baik dari minggu lalu — terus begitu! 🌟'];
  html+='<div style="background:linear-gradient(135deg,var(--accent),#fbbf24);border-radius:10px;padding:12px 14px;color:#fff;font-size:13px;font-weight:600;text-align:center;margin-top:4px">'+msgs[Math.floor(Math.random()*msgs.length)]+'</div>';

  body.innerHTML=html;
}
function checkWeeklyReviewPopup(){
  var now=new Date();
  // Show on Monday (day=1) if not seen today
  if(now.getDay()===1&&weeklyReviewLastSeen!==todayStr){
    // Wait until tour AND onboarding are fully done before showing weekly review
    function _isReadyForWeeklyReview(){
      if(_tourActive) return false;
      var gamiEl=document.getElementById('gamiOnboarding');
      if(gamiEl&&gamiEl.style.display!=='none'&&gamiEl.style.display!=='') return false;
      var navEl=document.getElementById('navOnboarding');
      if(navEl&&navEl.style.display!=='none'&&navEl.style.display!=='') return false;
      return true;
    }
    var _wrPoll=setInterval(function(){
      if(_isReadyForWeeklyReview()){
        clearInterval(_wrPoll);
        setTimeout(function(){openWeeklyReview();},800);
      }
    },300);
    // Safety: show after max 30 detik meskipun kondisi belum terpenuhi
    setTimeout(function(){clearInterval(_wrPoll);if(!document.getElementById('wrOverlay').classList.contains('show'))openWeeklyReview();},30000);
  }
}

// ══════════════════════════════════════════════
// SAVING TARGET (in fin-budget or fin-overview)
// ══════════════════════════════════════════════
function setSavingTarget(){
  var v=prompt('Set target tabungan bulanan (Rp):', finSavingTarget||'');
  if(v===null)return;
  finSavingTarget=parseInt(v.replace(/\D/g,''))||0;
  showToast('Target tabungan: '+fmtRp(finSavingTarget));
  saveData(true);render();
}

// initApp() dipanggil otomatis oleh Firebase setelah user login
// (lihat fbAuth.onAuthStateChanged di bagian atas file)

// ⚔️ Boss Battle — dipindah ke boss.js


