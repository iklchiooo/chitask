(function() {
'use strict';

// ─────────────────────────────────────────────
// § 1. LOCAL STORAGE HELPERS
// ─────────────────────────────────────────────
var LS_KEY = 'chitask_collab_v5';

function _lsLoad() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch(e) { return {}; }
}
function _lsSave(data) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch(e) {}
}
function _lsGet(section, defaultVal) {
  var d = _lsLoad();
  return d[section] !== undefined ? d[section] : defaultVal;
}
function _lsSet(section, val) {
  var d = _lsLoad();
  d[section] = val;
  _lsSave(d);
}

// ─────────────────────────────────────────────
// § 2. DATA LAYER — CollabStore
// ─────────────────────────────────────────────
var CollabStore = (function() {
  // In-memory cache — loaded from localStorage on init
  var _c = { projects:{}, members:{}, activity:{}, projectTasks:{}, assignments:{}, messages:{} };
  var _unsubs = [];
  var _diskCbs = {};
  var _renderCbs = []; // general re-render callbacks

  // ── Bootstrap from localStorage ──
  (function _bootstrap(){
    var stored = _lsLoad();
    if (stored.projects)     _c.projects     = stored.projects;
    if (stored.members)      _c.members      = stored.members;
    if (stored.activity)     _c.activity     = stored.activity;
    if (stored.projectTasks) _c.projectTasks = stored.projectTasks;
    if (stored.assignments)  _c.assignments  = stored.assignments;
    if (stored.messages)     _c.messages     = stored.messages;
  })();

  function _persist() {
    _lsSave({
      projects:     _c.projects,
      members:      _c.members,
      activity:     _c.activity,
      projectTasks: _c.projectTasks,
      assignments:  _c.assignments,
      messages:     _c.messages
    });
  }

  function _db()  { return (typeof fbDb  !== 'undefined' && fbDb)  ? fbDb  : null; }
  function _uid() { return (typeof fbUser !== 'undefined' && fbUser && fbUser.uid) ? fbUser.uid : null; }

  function _notifyRender() {
    _renderCbs.forEach(function(fn){ try{fn();}catch(e){} });
  }

  // ── Projects ──
  function getProjects()   { return Object.values(_c.projects); }
  function getProject(id)  { return _c.projects[id] || null; }

  function upsertProject(proj) {
    var isNew = !_c.projects[proj.id];
    _c.projects[proj.id] = proj;
    // M1 FIX: Pastikan owner selalu masuk ke koleksi members saat project dibuat
    if (isNew && proj.owner_id) {
      var ownerMember = { user_id: proj.owner_id, project_id: proj.id, role: 'owner', status: 'active', joined_at: Date.now() };
      if (!_c.members[proj.id]) _c.members[proj.id] = [];
      var ownerExists = _c.members[proj.id].find(function(m){ return m.user_id === proj.owner_id; });
      if (!ownerExists) _c.members[proj.id].push(ownerMember);
    }
    _persist();
    _notifyRender();
    var db = _db(); if (!db) return Promise.resolve();
    var p = db.collection('projects').doc(proj.id).set(proj)
      .catch(function(e){ console.error('[Collab] upsertProject', e); });
    // M1 FIX: Tulis owner ke project_members di Firestore juga
    if (isNew && proj.owner_id) {
      var me = getCurrentUser();
      var ownerData = { user_id: proj.owner_id, project_id: proj.id, role: 'owner', status: 'active', joined_at: Date.now(), name: (me && me.displayName) || 'Owner', email: (me && me.email) || '' };
      db.collection('project_members').doc(proj.id + '_' + proj.owner_id).set(ownerData)
        .catch(function(e){ console.error('[Collab] upsertProject owner member', e); });
    }
    return p;
  }
  function deleteProject(id) {
    delete _c.projects[id];
    _persist();
    _notifyRender();
    var db = _db(); if (!db) return Promise.resolve();
    return db.collection('projects').doc(id).delete()
      .catch(function(e){ console.error('[Collab] deleteProject', e); });
  }

  // ── Members ──
  function getMembers(pid) { return _c.members[pid] || []; }

  function addMember(pid, memberObj) {
    if (!_c.members[pid]) _c.members[pid] = [];
    var idx = _c.members[pid].findIndex(function(m){ return m.user_id === memberObj.user_id; });
    var data = Object.assign({}, memberObj, { project_id: pid });
    if (idx >= 0) _c.members[pid][idx] = data;
    else _c.members[pid].push(data);
    _persist();
    _notifyRender();
    var db = _db(); if (!db) return Promise.resolve();
    return db.collection('project_members').doc(pid + '_' + memberObj.user_id).set(data)
      .catch(function(e){ console.error('[Collab] addMember', e); });
  }

  function removeMember(pid, userId) {
    if (_c.members[pid]) _c.members[pid] = _c.members[pid].filter(function(m){ return m.user_id !== userId; });
    _persist();
    _notifyRender();
    var db = _db(); if (!db) return Promise.resolve();
    return db.collection('project_members').doc(pid + '_' + userId).delete()
      .catch(function(e){ console.error('[Collab] removeMember', e); });
  }

  function saveMembers(pid, members) {
    _c.members[pid] = members;
    _persist();
    var db = _db(); if (!db) return;
    var batch = db.batch();
    members.forEach(function(m){
      batch.set(db.collection('project_members').doc(pid + '_' + m.user_id), Object.assign({}, m, { project_id: pid }));
    });
    batch.commit().catch(function(e){ console.error('[Collab] saveMembers', e); });
  }

  // ── Activity ──
  function getActivity(pid) { return (_c.activity[pid] || []).slice(0, 100); }
  function addActivity(pid, entry) {
    if (!_c.activity[pid]) _c.activity[pid] = [];
    _c.activity[pid].unshift(entry);
    _persist();
    if (_activityCbs[pid]) _activityCbs[pid]();
    var db = _db(); if (!db) return;
    db.collection('project_activity').doc(entry.id).set(Object.assign({}, entry, { project_id: pid }))
      .catch(function(e){ console.error('[Collab] addActivity', e); });
  }

  // ── Project Tasks ──
  function getProjectTasks(pid) { return _c.projectTasks[pid] || []; }
  function saveProjectTasks(pid, tasks) {
    _c.projectTasks[pid] = tasks;
    _persist();
    var db = _db(); if (!db) return;
    db.collection('projects').doc(pid).collection('tasks').doc('all')
      .set({ tasks: tasks, updated_at: Date.now() })
      .catch(function(e){ console.error('[Collab] saveProjectTasks', e); });
  }
  function addProjectTask(pid, task)           { var t = getProjectTasks(pid).slice(); t.push(task); saveProjectTasks(pid, t); return task; }
  function updateProjectTask(pid, taskId, patch){ saveProjectTasks(pid, getProjectTasks(pid).map(function(t){ return t.id === taskId ? Object.assign({}, t, patch) : t; })); }
  function deleteProjectTask(pid, taskId)       { saveProjectTasks(pid, getProjectTasks(pid).filter(function(t){ return t.id !== taskId; })); }

  // ── Assignments ──
  function getAssignment(taskId) { return _c.assignments[taskId] || null; }
  function getAllAssignments()   { return _c.assignments; }
  function setAssignment(taskId, data, pid) {
    if (data) _c.assignments[taskId] = data;
    else delete _c.assignments[taskId];
    _persist();
    var db = _db(); if (!db) return;
    if (data) {
      db.collection('project_assignments').doc(String(taskId))
        .set(Object.assign({ taskId: taskId, project_id: pid || 'default_project' }, data))
        .catch(function(e){ console.error('[Collab] setAssignment', e); });
    } else {
      db.collection('project_assignments').doc(String(taskId)).delete()
        .catch(function(e){ console.error('[Collab] delAssignment', e); });
    }
  }

  // ── Messages / Diskusi ──
  function getMessages(pid) { return (_c.messages[pid] || []).sort(function(a,b){ return (a.ts||0)-(b.ts||0); }); }

  function sendMessage(pid, msgObj) {
    var docId = 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    var data  = Object.assign({}, msgObj, { id: docId, project_id: pid });
    // Always update local cache first
    if (!_c.messages[pid]) _c.messages[pid] = [];
    _c.messages[pid].push(data);
    _persist();
    if (_diskCbs[pid]) _diskCbs[pid]();

    var db = _db();
    if (!db) return Promise.resolve(); // offline/guest: local only
    return db.collection('projects').doc(pid).collection('messages').doc(docId).set(data)
      .catch(function(e){ console.error('[Collab] sendMessage', e); throw e; }); // M2 FIX: re-throw agar error propagate ke UI
  }

  // ── Invite Links ──
  function createInvite(pid, role) {
    var db = _db(); if (!db) return Promise.reject('no db');
    var inviteId = 'inv_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    var me = getCurrentUser();
    var data = { id: inviteId, project_id: pid, role: role, created_by: me.uid, created_at: Date.now(), exp: Date.now() + 7 * 24 * 3600 * 1000 };
    return db.collection('project_invites').doc(inviteId).set(data).then(function(){ return data; });
  }
  function getInvite(inviteId) {
    var db = _db(); if (!db) return Promise.reject('no db');
    return db.collection('project_invites').doc(inviteId).get().then(function(doc){
      if (!doc.exists) throw new Error('invite_not_found');
      return doc.data();
    });
  }
  function fetchProjectForJoin(pid) {
    var db = _db(); if (!db) return Promise.reject('no db');
    return db.collection('projects').doc(pid).get().then(function(doc){
      if (!doc.exists) throw new Error('project_not_found');
      _c.projects[pid] = doc.data();
      _persist();
      return doc.data();
    });
  }

  // ── Activity callbacks (per-project, for UI auto-refresh) ──
  var _activityCbs = {};

  // ── Firebase Realtime Listeners ──
  var _memberListeners = {}, _msgListeners = {}, _taskListeners = {}, _assignListeners = {}, _activityListeners = {};

  function initListeners() {
    var db = _db(); if (!db) return;
    var uid = _uid(); if (!uid) return;

    _unsubs.forEach(function(u){ try{u();}catch(e){} });
    _unsubs = [];
    _memberListeners = {}; _msgListeners = {}; _taskListeners = {}; _assignListeners = {}; _activityListeners = {};

    // Listen: my projects
    var u1 = db.collection('projects').where('owner_id', '==', uid).onSnapshot(function(snap){
      snap.docs.forEach(function(d){
        _c.projects[d.id] = d.data();
        _listenProject(d.id);
      });
      _persist();
      _notifyRender();
    }, function(e){ console.warn('[Collab] projects listener', e); });
    _unsubs.push(u1);

    // Listen: projects where I'm a member
    var u2 = db.collection('project_members').where('user_id', '==', uid).onSnapshot(function(snap){
      snap.docs.forEach(function(d){
        var m = d.data();
        var pid = m.project_id;
        // M3 FIX: Simpan info member diri sendiri ke cache lokal
        if (!_c.members[pid]) _c.members[pid] = [];
        var idx = _c.members[pid].findIndex(function(x){ return x.user_id === m.user_id; });
        if (idx >= 0) _c.members[pid][idx] = m; else _c.members[pid].push(m);

        if (!_c.projects[pid]) {
          db.collection('projects').doc(pid).get().then(function(pd){
            if (pd.exists) { _c.projects[pid] = pd.data(); _persist(); _notifyRender(); }
          }).catch(function(){});
        }
        _listenProject(pid);
      });
      // M3 FIX: Trigger render setelah snapshot member berubah
      _persist();
      _notifyRender();
    }, function(e){ console.warn('[Collab] member listener', e); });
    _unsubs.push(u2);

    console.log('[CT_Collab v7] Firebase listeners active');
  }

  function _listenProject(pid) {
    _listenProjectMembers(pid);
    _listenProjectMessages(pid);
    _listenProjectTasks(pid);
    _listenProjectAssignments(pid);
    _listenProjectActivity(pid);
  }

  function _listenProjectMembers(pid) {
    if (_memberListeners[pid]) return;
    var db = _db(); if (!db) return;
    _memberListeners[pid] = db.collection('project_members').where('project_id', '==', pid).onSnapshot(function(snap){
      _c.members[pid] = snap.docs.map(function(d){ return d.data(); });
      _persist();
      _notifyRender();
    }, function(e){ console.warn('[Collab] members[' + pid + ']', e); });
    _unsubs.push(_memberListeners[pid]);
  }

  function _listenProjectMessages(pid) {
    if (_msgListeners[pid]) return;
    var db = _db(); if (!db) return;
    _msgListeners[pid] = db.collection('projects').doc(pid).collection('messages')
      .orderBy('ts', 'asc').limit(200)
      .onSnapshot(function(snap){
        _c.messages[pid] = snap.docs.map(function(d){ return d.data(); });
        _persist();
        if (_diskCbs[pid]) _diskCbs[pid]();
      }, function(e){ console.warn('[Collab] messages[' + pid + ']', e); });
    _unsubs.push(_msgListeners[pid]);
  }

  function _listenProjectTasks(pid) {
    if (_taskListeners[pid]) return;
    var db = _db(); if (!db) return;
    _taskListeners[pid] = db.collection('projects').doc(pid).collection('tasks').doc('all')
      .onSnapshot(function(doc){
        _c.projectTasks[pid] = doc.exists ? (doc.data().tasks || []) : [];
        _persist();
        _notifyRender();
      }, function(e){ console.warn('[Collab] tasks[' + pid + ']', e); });
    _unsubs.push(_taskListeners[pid]);
  }

  function _listenProjectAssignments(pid) {
    if (_assignListeners[pid]) return;
    var db = _db(); if (!db) return;
    _assignListeners[pid] = db.collection('project_assignments').where('project_id', '==', pid).onSnapshot(function(snap){
      snap.docChanges().forEach(function(change){
        if (change.type === 'removed') {
          delete _c.assignments[change.doc.id];
        } else {
          _c.assignments[change.doc.id] = change.doc.data();
        }
      });
      _persist();
      _notifyRender();
      // Refresh assignee badges on task cards
      if (typeof _addAssigneeBadges === 'function') setTimeout(_addAssigneeBadges, 50);
    }, function(e){ console.warn('[Collab] assignments[' + pid + ']', e); });
    _unsubs.push(_assignListeners[pid]);
  }

  function _listenProjectActivity(pid) {
    if (_activityListeners[pid]) return;
    var db = _db(); if (!db) return;
    _activityListeners[pid] = db.collection('project_activity')
      .where('project_id', '==', pid).orderBy('ts', 'desc').limit(50)
      .onSnapshot(function(snap){
        _c.activity[pid] = snap.docs.map(function(d){ return d.data(); });
        _persist();
        if (_activityCbs[pid]) _activityCbs[pid]();
      }, function(e){ console.warn('[Collab] activity[' + pid + ']', e); });
    _unsubs.push(_activityListeners[pid]);
  }

  function listenProject(pid) { _listenProject(pid); }

  // Pull activity — now delegates to realtime listener (onSnapshot handles initial load)
  function pullActivity(pid) {
    _listenProjectActivity(pid);
  }

  return {
    getProjects:      getProjects,
    getProject:       getProject,
    upsertProject:    upsertProject,
    deleteProject:    deleteProject,
    getMembers:       getMembers,
    addMember:        addMember,
    removeMember:     removeMember,
    saveMembers:      saveMembers,
    getActivity:      getActivity,
    addActivity:      addActivity,
    pullActivity:     pullActivity,
    getProjectTasks:  getProjectTasks,
    saveProjectTasks: saveProjectTasks,
    addProjectTask:   addProjectTask,
    updateProjectTask:updateProjectTask,
    deleteProjectTask:deleteProjectTask,
    getAssignment:    getAssignment,
    setAssignment:    setAssignment,
    getAllAssignments: getAllAssignments,
    getMessages:      getMessages,
    sendMessage:      sendMessage,
    createInvite:     createInvite,
    getInvite:        getInvite,
    fetchProjectForJoin: fetchProjectForJoin,
    initListeners:    initListeners,
    listenProject:    listenProject,
    setDiskCallback:  function(pid, fn){ _diskCbs[pid] = fn; },
    clearDiskCallback:function(pid){ delete _diskCbs[pid]; },
    setActivityCallback:  function(pid, fn){ _activityCbs[pid] = fn; },
    clearActivityCallback:function(pid){ delete _activityCbs[pid]; },
    onRender:         function(fn){ _renderCbs.push(fn); },
    offRender:        function(fn){ _renderCbs = _renderCbs.filter(function(x){ return x !== fn; }); }
  };
})();

// ─────────────────────────────────────────────
// § 3. ROLE SYSTEM
// ─────────────────────────────────────────────
var Roles = {
  OWNER:'owner', EDITOR:'editor', VIEWER:'viewer',
  label: function(r){ return {owner:'👑 Owner', editor:'✏️ Editor', viewer:'👁️ Viewer'}[r] || r; },
  color: function(r){ return {owner:'#d97706', editor:'#6366f1', viewer:'#78716c'}[r] || '#78716c'; },
  canEdit:          function(r){ return r === 'owner' || r === 'editor'; },
  canDelete:        function(r){ return r === 'owner'; },
  canManageMembers: function(r){ return r === 'owner'; }
};

// ─────────────────────────────────────────────
// § 4. CURRENT USER
// ─────────────────────────────────────────────
function getCurrentUser() {
  if (typeof fbUser !== 'undefined' && fbUser && !fbUser._isGuest && !fbUser._isOffline)
    return { uid: fbUser.uid, name: fbUser.displayName || 'You', email: fbUser.email || '', photo: fbUser.photoURL || null, _isGuest: false };
  try {
    var guestUid = localStorage.getItem('chitask_guest_uid');
    if (!guestUid) {
      guestUid = 'guest_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
      localStorage.setItem('chitask_guest_uid', guestUid);
    }
    var d = JSON.parse(localStorage.getItem('chitask_v6_data') || '{}');
    return { uid: guestUid, name: d._userName || 'Guest', email: '', photo: null, _isGuest: true };
  } catch(e) {
    return { uid: 'local_user', name: 'You', email: '', photo: null, _isGuest: true };
  }
}

// ─────────────────────────────────────────────
// § 5. ACTIVITY LOGGER
// ─────────────────────────────────────────────
function logActivity(pid, action, meta) {
  var u = getCurrentUser();
  CollabStore.addActivity(pid, {
    id: 'act_' + Date.now(), user_id: u.uid, user_name: u.name,
    user_photo: u.photo, action: action, meta: meta || {}, ts: Date.now()
  });
}

// ─────────────────────────────────────────────
// § 6. INVITE LINKS
// ─────────────────────────────────────────────
function generateInviteLink(pid, role) {
  return CollabStore.createInvite(pid, role).then(function(data){
    return window.location.origin + window.location.pathname + '?invite=' + data.id;
  });
}
function generateInviteLinkSync(pid, role, callback) {
  var me = getCurrentUser();
  if (!me || !me.uid || me._isGuest) {
    if (callback) callback('⚠️ Login Google untuk membuat invite link');
    return;
  }
  CollabStore.createInvite(pid, role).then(function(data){
    var url = window.location.origin + window.location.pathname + '?invite=' + data.id;
    if (callback) callback(url);
  }).catch(function(e){
    var msg = (e === 'no db' || (e && e.message === 'no db'))
      ? '⚠️ Login Google untuk membuat invite link'
      : '⚠️ Gagal buat link: ' + (e && e.message ? e.message : e);
    if (callback) callback(msg);
  });
}

// Auto-join via invite URL
(function(){
  var inviteId = new URLSearchParams(window.location.search).get('invite');
  if (!inviteId) return;
  setTimeout(function(){
    CollabStore.getInvite(inviteId).then(function(data){
      if (!data || !data.project_id) { _showToast('⚠️ Link tidak valid', 'warn'); return; }
      if (Date.now() > data.exp)     { _showToast('⚠️ Link sudah expired', 'warn'); return; }
      CollabStore.fetchProjectForJoin(data.project_id)
        .then(function(){ showJoinModal(data.project_id, data.role); })
        .catch(function(){ showJoinModal(data.project_id, data.role); });
    }).catch(function(e){
      console.warn('[Collab] invite fetch', e);
      _showToast('⚠️ Link tidak valid atau sudah expired', 'warn');
    });
  }, 1500);
})();

// ─────────────────────────────────────────────
// § 7. CSS INJECTION
// ─────────────────────────────────────────────
(function(){
  if (document.getElementById('ct-collab-styles')) return;
  var s = document.createElement('style');
  s.id = 'ct-collab-styles';
  s.textContent = `
.ct-overlay{position:fixed;inset:0;background:rgba(0,0,0,.52);z-index:9800;display:none;align-items:center;justify-content:center;backdrop-filter:blur(3px)}
.ct-overlay.active{display:flex}
@keyframes ctSlideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes ctPop{0%{transform:scale(.88);opacity:0}60%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}
@keyframes ct-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.3)}}
.ct-modal{background:var(--card);border-radius:16px;width:min(560px,95vw);max-height:92vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,.28);animation:ctSlideUp .2s ease}
.ct-modal-sm{width:min(380px,95vw)}.ct-modal-lg{width:min(720px,97vw)}
.ct-modal-hdr{display:flex;align-items:center;gap:10px;padding:16px 18px 12px;border-bottom:1px solid var(--border);flex-shrink:0}
.ct-modal-icon{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:17px;background:rgba(217,119,6,.12)}
.ct-modal-title{font-size:15px;font-weight:700;color:var(--text);flex:1}
.ct-modal-close{border:none;background:none;cursor:pointer;font-size:18px;color:var(--muted);width:30px;height:30px;border-radius:7px;display:flex;align-items:center;justify-content:center;transition:background .1s}
.ct-modal-close:hover{background:var(--border);color:var(--text)}
.ct-modal-body{padding:16px 18px;overflow-y:auto;flex:1}
.ct-modal-footer{padding:12px 18px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;flex-shrink:0}
.ct-tabs{display:flex;gap:2px;padding:12px 18px 0;border-bottom:1px solid var(--border);flex-shrink:0;overflow-x:auto}
.ct-tab{padding:7px 13px;font-size:12px;font-weight:600;cursor:pointer;border:none;background:none;color:var(--muted);border-radius:8px 8px 0 0;border-bottom:2px solid transparent;margin-bottom:-1px;transition:all .15s;white-space:nowrap;font-family:inherit}
.ct-tab.active{color:var(--accent);border-bottom-color:var(--accent);background:rgba(217,119,6,.06)}
.ct-tab:hover:not(.active){color:var(--text)}
.ct-tab-content{display:none}.ct-tab-content.active{display:block}
.ct-label{font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.7px;margin-bottom:5px}
.ct-input{width:100%;border:1.5px solid var(--border);border-radius:9px;padding:8px 12px;font-size:13px;font-family:inherit;color:var(--text);background:var(--bg);outline:none;transition:border-color .15s;box-sizing:border-box}
.ct-input:focus{border-color:var(--accent)}
.ct-select{width:100%;border:1.5px solid var(--border);border-radius:9px;padding:8px 12px;font-size:13px;font-family:inherit;color:var(--text);background:var(--bg);outline:none;cursor:pointer}
.ct-field{margin-bottom:12px}.ct-row{display:flex;gap:8px;align-items:flex-end}
.ct-btn{padding:8px 16px;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;border:1.5px solid var(--border);background:var(--bg);color:var(--text);font-family:inherit;transition:all .12s;white-space:nowrap}
.ct-btn:hover{background:var(--hover)}
.ct-btn-primary{background:var(--accent);color:#fff;border-color:var(--accent)}.ct-btn-primary:hover{opacity:.9}
.ct-btn-danger{color:var(--red);border-color:rgba(220,38,38,.2)}.ct-btn-danger:hover{background:rgba(220,38,38,.08)}
.ct-btn-sm{padding:5px 11px;font-size:11px;border-radius:7px}.ct-btn-ghost{border-color:transparent;background:transparent}
.ct-avatar{width:30px;height:30px;border-radius:50%;background:var(--accent);color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden}
.ct-avatar img{width:100%;height:100%;object-fit:cover}
.ct-avatar-sm{width:22px;height:22px;font-size:9px}
.ct-avatar-stack{display:flex;flex-direction:row-reverse}
.ct-avatar-stack .ct-avatar{margin-left:-6px;border:2px solid var(--card)}.ct-avatar-stack .ct-avatar:last-child{margin-left:0}
.ct-member-row{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border)}
.ct-member-row:last-child{border-bottom:none}
.ct-member-info{flex:1;min-width:0}
.ct-member-name{font-size:13px;font-weight:600;color:var(--text)}.ct-member-email{font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ct-role-badge{font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;border:1px solid currentColor;white-space:nowrap}
.ct-invite-box{display:flex;align-items:center;gap:8px;background:var(--bg);border:1.5px solid var(--border);border-radius:9px;padding:8px 10px}
.ct-invite-url{flex:1;font-size:11px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:monospace}
.ct-copy-btn{font-size:11px;font-weight:600;padding:4px 10px;border-radius:7px;border:1.5px solid var(--border);background:var(--bg);cursor:pointer;color:var(--text);white-space:nowrap;transition:all .12s}
.ct-copy-btn.copied{background:#d1fae5;color:#065f46;border-color:#6ee7b7}
.ct-empty{text-align:center;padding:32px 16px;color:var(--muted)}
.ct-empty-icon{font-size:36px;margin-bottom:8px}
.ct-empty-title{font-size:14px;font-weight:600;color:var(--text);margin-bottom:4px}
.ct-empty-sub{font-size:12px}
.ct-proj-card{background:var(--card);border:1.5px solid var(--border);border-radius:12px;padding:14px 16px;margin-bottom:10px;cursor:pointer;transition:border-color .15s;border-left:4px solid var(--tc-color,var(--accent))}
.ct-proj-card:hover{border-color:var(--accent)}
.ct-ptask{display:flex;align-items:flex-start;gap:10px;padding:10px;background:var(--card);border:1px solid var(--border);border-radius:9px;margin-bottom:6px;cursor:pointer;transition:background .12s}
.ct-ptask:hover{background:var(--hover)}
.ct-ptask-done .ct-ptask-title{text-decoration:line-through;color:var(--muted)}
.ct-ptask-check{width:18px;height:18px;border-radius:50%;border:2px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:all .15s;font-size:10px;font-weight:700;color:#fff;margin-top:2px}
.ct-ptask-check.checked{background:var(--green);border-color:var(--green)}
.ct-ptask-title{font-size:13px;font-weight:500;color:var(--text);flex:1}
.ct-ptask-meta{display:flex;align-items:center;gap:6px;margin-top:4px;flex-wrap:wrap}
.ct-activity-item{display:flex;align-items:flex-start;gap:8px;padding:8px 0;border-bottom:1px solid var(--border)}
.ct-activity-item:last-child{border-bottom:none}
.ct-activity-text{flex:1;font-size:12px;color:var(--text);line-height:1.4}
.ct-activity-time{font-size:10px;color:var(--muted);white-space:nowrap;margin-left:auto}
.ct-divider{border:none;border-top:1px solid var(--border);margin:12px 0}
.ct-assign-panel{margin-top:12px;padding-top:12px;border-top:1px solid var(--border)}
.ct-assign-title{font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.7px;margin-bottom:8px}
.ct-assign-pick{display:flex;align-items:center;gap:8px;padding:8px 10px;border:1.5px solid var(--border);border-radius:9px;cursor:pointer;background:var(--bg);transition:border-color .15s}
.ct-assign-pick:hover{border-color:var(--accent)}
.ct-assign-dropdown{position:fixed;z-index:10000;background:var(--card);border:1.5px solid var(--border);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.18);min-width:180px;overflow:hidden}
.ct-assign-opt{display:flex;align-items:center;gap:8px;padding:9px 12px;cursor:pointer;font-size:13px;color:var(--text);transition:background .1s}
.ct-assign-opt:hover,.ct-assign-opt.selected{background:var(--hover)}
.ct-chat-bubble-me{background:var(--accent);color:#fff;border-radius:14px 14px 4px 14px}
.ct-chat-bubble-other{background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:14px 14px 14px 4px}
@media(max-width:500px){.ct-modal{width:100vw;max-height:94vh;border-radius:18px 18px 0 0;margin-top:auto;align-self:flex-end}}
`;
  document.head.appendChild(s);
})();

// ─────────────────────────────────────────────
// § 8. UI HELPERS
// ─────────────────────────────────────────────
function _showToast(msg, type) {
  if (typeof showToast === 'function') { showToast(msg); return; }
  var t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:10px 18px;border-radius:20px;font-size:13px;z-index:99999;pointer-events:none;animation:ctSlideUp .2s ease';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function(){ if(t.parentNode) t.parentNode.removeChild(t); }, 2500);
}

function _relTime(ts) {
  var diff = Date.now() - (ts || 0);
  if (diff < 60000)   return 'Baru saja';
  if (diff < 3600000) return Math.floor(diff/60000) + 'm lalu';
  if (diff < 86400000)return Math.floor(diff/3600000) + 'j lalu';
  return Math.floor(diff/86400000) + 'h lalu';
}

function _makeAvatar(user, cls) {
  var el = document.createElement('div');
  el.className = 'ct-avatar ' + (cls || '');
  var name = (user && user.name) ? user.name : '?';
  if (user && user.photo) {
    var img = document.createElement('img');
    img.src = user.photo;
    img.alt = name;
    img.onerror = function(){ el.textContent = name.charAt(0).toUpperCase(); };
    el.appendChild(img);
  } else {
    el.textContent = name.charAt(0).toUpperCase();
  }
  return el;
}

function _makeAvatarStack(members) {
  var wrap = document.createElement('div');
  wrap.className = 'ct-avatar-stack';
  members.slice(0, 4).forEach(function(m){ wrap.appendChild(_makeAvatar(m, 'ct-avatar-sm')); });
  if (members.length > 4) {
    var more = document.createElement('div');
    more.className = 'ct-avatar ct-avatar-sm';
    more.style.cssText = 'background:var(--border);color:var(--muted);font-size:8px';
    more.textContent = '+' + (members.length - 4);
    wrap.appendChild(more);
  }
  return wrap;
}

function _buildModal(title, icon, sizeClass) {
  var overlay = document.createElement('div'); overlay.className = 'ct-overlay';
  var modal   = document.createElement('div'); modal.className   = 'ct-modal ' + (sizeClass || '');
  var hdr     = document.createElement('div'); hdr.className     = 'ct-modal-hdr';
  var iconDiv = document.createElement('div'); iconDiv.className = 'ct-modal-icon'; iconDiv.textContent = icon;
  var titleDiv = document.createElement('div'); titleDiv.className = 'ct-modal-title'; titleDiv.textContent = title;
  hdr.appendChild(iconDiv); hdr.appendChild(titleDiv);
  var closeBtn  = document.createElement('button'); closeBtn.className = 'ct-modal-close'; closeBtn.innerHTML = '&#x2715;';
  var _close = function(){ if (overlay.parentNode) overlay.parentNode.removeChild(overlay); };
  closeBtn.onclick = _close; hdr.appendChild(closeBtn);
  var body   = document.createElement('div'); body.className   = 'ct-modal-body';
  var footer = document.createElement('div'); footer.className = 'ct-modal-footer';
  modal.appendChild(hdr); modal.appendChild(body); modal.appendChild(footer);
  overlay.appendChild(modal);
  overlay.onclick = function(e){ if (e.target === overlay) _close(); };
  document.body.appendChild(overlay);
  requestAnimationFrame(function(){ overlay.classList.add('active'); });
  return { overlay:overlay, modal:modal, body:body, footer:footer, close:_close };
}

function _getMyRole(pid) {
  var proj = CollabStore.getProject(pid); if (!proj) return null;
  var me   = getCurrentUser();
  // M4 FIX: Cek members collection dulu (lebih akurat, handle race condition)
  var members = CollabStore.getMembers(pid);
  var m = members.find(function(x){ return x.user_id === me.uid; });
  if (m) return m.role === 'owner' ? Roles.OWNER : (m.role || Roles.MEMBER);
  // Fallback: cek owner_id di project object
  if (proj.owner_id === me.uid) return Roles.OWNER;
  return null;
}

// ─────────────────────────────────────────────
// § 9. ACTIVITY FEED RENDERER
// ─────────────────────────────────────────────
var ACTION_LABELS = {
  task_completed:'✅ completed', task_created:'➕ added task', task_edited:'✏️ edited',
  task_deleted:'🗑️ deleted', member_added:'👋 joined', member_removed:'🚫 was removed',
  comment_added:'💬 commented on', member_invited:'✉️ invited'
};

function _renderActivityFeed(pid, container) {
  container.innerHTML = '';
  // Listener sudah aktif via setActivityCallback; tidak perlu pull manual
  var items = CollabStore.getActivity(pid);
  if (!items.length) {
    container.innerHTML = '<div class="ct-empty"><div class="ct-empty-icon">📋</div><div class="ct-empty-title">No activity yet</div><div class="ct-empty-sub" style="font-size:11px;margin-top:4px">🟢 Live — akan muncul otomatis</div></div>';
    return;
  }
  var liveBar = document.createElement('div');
  liveBar.style.cssText = 'display:flex;align-items:center;gap:5px;font-size:10px;color:var(--muted);margin-bottom:10px';
  liveBar.innerHTML = '<span style="width:7px;height:7px;border-radius:50%;background:#22c55e;display:inline-block;animation:ct-pulse 1.5s infinite"></span> Live updates aktif';
  container.appendChild(liveBar);
  items.slice(0, 50).forEach(function(item){
    var row = document.createElement('div'); row.className = 'ct-activity-item';
    var label = ACTION_LABELS[item.action] || item.action;
    var task  = item.meta && item.meta.task_title ? ' <b>"' + item.meta.task_title + '"</b>' : '';
    var text  = document.createElement('div'); text.className = 'ct-activity-text';
    var nameB = document.createElement('b'); nameB.textContent = item.user_name || '?';
    text.appendChild(nameB);
    text.appendChild(document.createTextNode(' ' + label));
    if (item.meta && item.meta.task_title) {
      text.appendChild(document.createTextNode(' '));
      var taskB = document.createElement('b'); taskB.textContent = '"' + item.meta.task_title + '"'; text.appendChild(taskB);
    }
    var time = document.createElement('div'); time.className = 'ct-activity-time'; time.textContent = _relTime(item.ts);
    row.appendChild(_makeAvatar({ name: item.user_name, photo: item.user_photo }, 'ct-avatar-sm'));
    row.appendChild(text); row.appendChild(time); container.appendChild(row);
  });
}

// ─────────────────────────────────────────────
// § 10. MEMBER LIST RENDERER
// ─────────────────────────────────────────────
function _renderMemberList(pid, container) {
  container.innerHTML = '';
  var members = CollabStore.getMembers(pid);
  var myRole  = _getMyRole(pid);
  var me      = getCurrentUser();
  if (!members.length) {
    container.innerHTML = '<div class="ct-empty"><div class="ct-empty-icon">👥</div><div class="ct-empty-title">No members yet</div><div class="ct-empty-sub">Invite via the Invite tab.</div></div>';
    return;
  }
  members.forEach(function(member){
    var row  = document.createElement('div'); row.className = 'ct-member-row';
    var info = document.createElement('div'); info.className = 'ct-member-info';
    var nameDiv = document.createElement('div'); nameDiv.className = 'ct-member-name'; nameDiv.textContent = member.name;
    var emailDiv = document.createElement('div'); emailDiv.className = 'ct-member-email'; emailDiv.textContent = member.email || '';
    info.appendChild(nameDiv); info.appendChild(emailDiv);
    var badge = document.createElement('div');
    badge.className = 'ct-role-badge';
    badge.style.color = Roles.color(member.role);
    badge.textContent = Roles.label(member.role);
    row.appendChild(_makeAvatar(member));
    row.appendChild(info);
    row.appendChild(badge);
    if (Roles.canManageMembers(myRole) && member.user_id !== me.uid) {
      var rm = document.createElement('button'); rm.className = 'ct-btn ct-btn-sm ct-btn-danger ct-btn-ghost'; rm.textContent = '✕';
      rm.onclick = function(){
        if (!confirm('Remove ' + member.name + '?')) return;
        CollabStore.removeMember(pid, member.user_id).then(function(){
          logActivity(pid, 'member_removed', { target_name: member.name });
          _renderMemberList(pid, container);
          _showToast('🚫 Removed', 'warn');
        });
      };
      row.appendChild(rm);
    }
    container.appendChild(row);
  });
}

// ─────────────────────────────────────────────
// § 11. PROJECT TASK MODAL
// ─────────────────────────────────────────────
function showProjectTaskModal(pid, task) {
  // Always pull latest task data from store (in case of remote update)
  var latestTasks = CollabStore.getProjectTasks(pid);
  var fresh = latestTasks.find(function(t){ return t.id === task.id; });
  if (fresh) task = fresh;

  var m = _buildModal(task.title, '📌', 'ct-modal-sm');
  var myRole = _getMyRole(pid);
  var canEdit = !!myRole && Roles.canEdit(myRole);

  m.body.innerHTML = '';

  // Status buttons
  var statusRow = document.createElement('div'); statusRow.style.cssText = 'display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap';
  [{val:'todo',label:'⏳ To Do'},{val:'inprogress',label:'🔄 In Progress'},{val:'done',label:'✅ Done'}].forEach(function(s){
    var btn = document.createElement('button'); btn.className = 'ct-btn ct-btn-sm' + (task.status === s.val ? ' ct-btn-primary' : '');
    btn.textContent = s.label;
    if (canEdit) btn.onclick = function(){
      CollabStore.updateProjectTask(pid, task.id, { status: s.val, updated_at: Date.now() });
      if (s.val === 'done') logActivity(pid, 'task_completed', { task_title: task.title });
      m.close(); showProjectTaskModal(pid, Object.assign({}, task, { status: s.val }));
    };
    statusRow.appendChild(btn);
  });
  m.body.appendChild(statusRow);

  // Description
  if (task.desc) { var desc = document.createElement('div'); desc.style.cssText = 'font-size:13px;color:var(--muted);margin-bottom:12px'; desc.textContent = task.desc; m.body.appendChild(desc); }

  // Assignee picker
  var members = CollabStore.getMembers(pid);
  var me = getCurrentUser();
  var allUsers = [{ user_id: me.uid, name: me.name + ' (kamu)', email: me.email, photo: me.photo }];
  members.forEach(function(x){ if (x.user_id !== me.uid) allUsers.push(x); });

  var asnLbl = document.createElement('div'); asnLbl.className = 'ct-label'; asnLbl.textContent = 'ASSIGNEE';
  var asnSel = document.createElement('select'); asnSel.className = 'ct-select'; asnSel.style.marginBottom = '12px';
  var noOpt  = document.createElement('option'); noOpt.value = ''; noOpt.textContent = '— Unassigned —'; asnSel.appendChild(noOpt);
  allUsers.forEach(function(u){
    var opt = document.createElement('option'); opt.value = u.user_id; opt.textContent = u.name;
    if (task.assignee_id === u.user_id) opt.selected = true;
    asnSel.appendChild(opt);
  });
  if (canEdit) asnSel.onchange = function(){
    var sel = allUsers.find(function(u){ return u.user_id === asnSel.value; });
    CollabStore.updateProjectTask(pid, task.id, {
      assignee_id: sel ? sel.user_id : null,
      assignee_name: sel ? sel.name.replace(' (kamu)', '') : null,
      updated_at: Date.now()
    });
    logActivity(pid, 'task_assigned', { task_title: task.title });
    _showToast('📌 Assigned to ' + (sel ? sel.name.replace(' (kamu)','') : 'nobody'), 'success');
  };
  else asnSel.disabled = true;
  m.body.appendChild(asnLbl); m.body.appendChild(asnSel);

  // Subtasks
  if (task.subtasks && task.subtasks.length) {
    var stLbl = document.createElement('div'); stLbl.className = 'ct-label'; stLbl.textContent = 'SUB-TASKS';
    m.body.appendChild(stLbl);
    task.subtasks.forEach(function(st){
      var row = document.createElement('div'); row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);font-size:13px';
      var chk = document.createElement('span'); chk.style.cssText = 'width:16px;height:16px;border-radius:4px;border:2px solid '+(st.done?'var(--green)':'var(--border)')+';background:'+(st.done?'var(--green)':'transparent')+';display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;color:#fff;font-size:9px';
      chk.textContent = st.done ? '✓' : '';
      if (canEdit) chk.onclick = function(){
        var updated = task.subtasks.map(function(s){ return s.id === st.id ? Object.assign({}, s, { done: !s.done }) : s; });
        CollabStore.updateProjectTask(pid, task.id, { subtasks: updated, updated_at: Date.now() });
        m.close(); showProjectTaskModal(pid, Object.assign({}, task, { subtasks: updated }));
      };
      var ttl = document.createElement('span'); ttl.textContent = st.title; if (st.done) ttl.style.textDecoration = 'line-through';
      row.appendChild(chk); row.appendChild(ttl); m.body.appendChild(row);
    });
  }

  // Due / Reminder meta
  var meta = document.createElement('div'); meta.style.cssText = 'margin-top:12px;font-size:11px;color:var(--muted);display:flex;gap:12px;flex-wrap:wrap';
  function _metaSpan(icon, val) { var s = document.createElement('span'); s.textContent = icon + ' ' + val; meta.appendChild(s); }
  if (task.due) _metaSpan('📅', task.due);
  if (task.reminder_ts) _metaSpan('⏰', _relTime(task.reminder_ts));
  if (task.isShopping && task.price) _metaSpan('🛒', 'Rp ' + Number(task.price).toLocaleString('id'));
  m.body.appendChild(meta);

  if (canEdit) {
    var delBtn = document.createElement('button'); delBtn.className = 'ct-btn ct-btn-sm ct-btn-danger'; delBtn.style.cssText = 'margin-top:16px;width:100%'; delBtn.textContent = '🗑️ Delete Task';
    delBtn.onclick = function(){
      if (!confirm('Delete "' + task.title + '"?')) return;
      CollabStore.deleteProjectTask(pid, task.id);
      logActivity(pid, 'task_deleted', { task_title: task.title });
      m.close(); _showToast('🗑️ Deleted', 'warn');
    };
    m.body.appendChild(delBtn);
  }

  // Auto-refresh modal jika ada update remote dari user lain
  function _onRemoteUpdate() {
    var updated = CollabStore.getProjectTasks(pid).find(function(t){ return t.id === task.id; });
    if (!updated) { m.close(); return; } // task dihapus user lain
    if (JSON.stringify(updated) !== JSON.stringify(task)) {
      m.close();
      showProjectTaskModal(pid, updated);
    }
  }
  CollabStore.onRender(_onRemoteUpdate);
  var origCloseTM = m.close.bind(m);
  m.close = function(){ CollabStore.offRender(_onRemoteUpdate); origCloseTM(); };
}

// ─────────────────────────────────────────────
// § 12. PROJECT DETAIL VIEW
// ─────────────────────────────────────────────
function showProjectDetail(proj) {
  CollabStore.listenProject(proj.id);
  var m = _buildModal(proj.title, '📋', 'ct-modal-lg');
  var myRole = _getMyRole(proj.id);
  var canEdit = !!myRole && Roles.canEdit(myRole);

  var tabDefs    = ['📋 Tasks', '👥 Members', '📈 Activity', '💬 Diskusi', '🔗 Invite'];
  var tabBar     = document.createElement('div'); tabBar.className = 'ct-tabs';
  var tabContents = [];
  tabDefs.forEach(function(name, i){
    var btn     = document.createElement('button'); btn.className = 'ct-tab' + (i===0?' active':''); btn.textContent = name;
    var content = document.createElement('div');   content.className = 'ct-tab-content' + (i===0?' active':'');
    tabContents.push({ btn:btn, content:content });
    btn.onclick = function(){
      tabContents.forEach(function(x){ x.btn.classList.remove('active'); x.content.classList.remove('active'); });
      btn.classList.add('active'); content.classList.add('active');
    };
    tabBar.appendChild(btn);
  });
  m.modal.insertBefore(tabBar, m.body);
  var wrap = document.createElement('div'); wrap.style.cssText = 'overflow-y:auto;max-height:calc(92vh - 115px);padding:16px 18px';
  tabContents.forEach(function(x){ wrap.appendChild(x.content); });
  m.modal.insertBefore(wrap, m.body);
  m.modal.removeChild(m.body); m.modal.removeChild(m.footer);

  // ── TAB 0: TASKS ──
  var STATUS_ORDER  = ['todo', 'inprogress', 'done'];
  var STATUS_LABELS = { todo:'⏳ To Do', inprogress:'🔄 In Progress', done:'✅ Done' };

  function _renderTasks() {
    var tc = tabContents[0].content; tc.innerHTML = '';
    var pTasks = CollabStore.getProjectTasks(proj.id);
    if (canEdit) {
      var addWrap = document.createElement('div');
      addWrap.style.cssText = 'background:var(--card);border:1.5px solid var(--border);border-radius:12px;padding:12px;margin-bottom:14px';
      var titleRow = document.createElement('div'); titleRow.style.cssText = 'display:flex;gap:8px;margin-bottom:8px';
      var inp    = document.createElement('input'); inp.className = 'ct-input'; inp.placeholder = 'Add a new task...'; inp.style.flex = '1';
      var addBtn = document.createElement('button'); addBtn.className = 'ct-btn ct-btn-primary'; addBtn.textContent = '+ Add';
      titleRow.appendChild(inp); titleRow.appendChild(addBtn); addWrap.appendChild(titleRow);

      var chipRow = document.createElement('div'); chipRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px';
      var dueInp = document.createElement('input'); dueInp.type = 'date'; dueInp.className = 'ct-input';
      dueInp.style.cssText = 'font-size:11px;height:28px;padding:4px 8px;max-width:130px';
      var dueLbl = document.createElement('label'); dueLbl.style.cssText = 'display:flex;align-items:center;gap:3px;font-size:11px;color:var(--muted)';
      dueLbl.innerHTML = '📅 '; dueLbl.appendChild(dueInp); chipRow.appendChild(dueLbl);
      addWrap.appendChild(chipRow);
      tc.appendChild(addWrap);

      addBtn.onclick = function(){
        var v = inp.value.trim(); if (!v) return;
        var me = getCurrentUser();
        var task = { id:'ptsk_'+Date.now(), title:v, desc:'', status:'todo', priority:'normal',
          created_by:me.uid, created_by_name:me.name, assignee_id:null, assignee_name:null,
          due:dueInp.value||null, created_at:Date.now(), updated_at:Date.now(), subtasks:[] };
        CollabStore.addProjectTask(proj.id, task);
        logActivity(proj.id, 'task_created', { task_title: v });
        inp.value = ''; dueInp.value = '';
        _renderTasks(); _showToast('✅ Task added', 'success');
      };
      inp.onkeydown = function(e){ if (e.key === 'Enter') addBtn.click(); };
    }

    if (!pTasks.length) {
      tc.insertAdjacentHTML('beforeend', '<div class="ct-empty"><div class="ct-empty-icon">📋</div><div class="ct-empty-title">No tasks yet</div></div>');
      return;
    }
    STATUS_ORDER.forEach(function(status){
      var filtered = pTasks.filter(function(t){ return (t.status || 'todo') === status; });
      if (!filtered.length && status === 'done') return;
      var section = document.createElement('div'); section.style.marginBottom = '14px';
      var shdr = document.createElement('div');
      shdr.style.cssText = 'font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.7px;margin-bottom:8px;display:flex;align-items:center;gap:6px';
      shdr.innerHTML = STATUS_LABELS[status] + '<span style="background:var(--border);border-radius:20px;padding:1px 7px;font-size:10px">' + filtered.length + '</span>';
      section.appendChild(shdr);
      filtered.forEach(function(task){
        var row = document.createElement('div'); row.className = 'ct-ptask' + (task.status === 'done' ? ' ct-ptask-done' : '');
        var chk = document.createElement('div'); chk.className = 'ct-ptask-check' + (task.status === 'done' ? ' checked' : '');
        chk.innerHTML = task.status === 'done' ? '✓' : '';
        chk.onclick = function(e){
          e.stopPropagation();
          if (!canEdit) { _showToast('⚠️ No permission', 'warn'); return; }
          var newStatus = task.status === 'done' ? 'todo' : 'done';
          CollabStore.updateProjectTask(proj.id, task.id, { status: newStatus, updated_at: Date.now() });
          if (newStatus === 'done') logActivity(proj.id, 'task_completed', { task_title: task.title });
          _renderTasks();
        };
        var title = document.createElement('div'); title.className = 'ct-ptask-title'; title.textContent = task.title;
        var meta  = document.createElement('div'); meta.className  = 'ct-ptask-meta';
        if (task.assignee_name) {
          var asgn = CollabStore.getMembers(proj.id).find(function(x){ return x.user_id === task.assignee_id; }) || { name: task.assignee_name };
          meta.appendChild(_makeAvatar(asgn, 'ct-avatar-sm'));
        }
        if (task.due) { var due = document.createElement('span'); due.style.cssText = 'font-size:10px;color:var(--muted)'; due.textContent = '📅 ' + task.due; meta.appendChild(due); }
        row.appendChild(chk); row.appendChild(title); row.appendChild(meta);
        row.onclick = function(){ showProjectTaskModal(proj.id, task); };
        section.appendChild(row);
      });
      tc.appendChild(section);
    });
  }
  _renderTasks();
  tabContents[0].btn.addEventListener('click', _renderTasks);
  // Auto-refresh when Firestore pushes task/member/assignment updates
  CollabStore.onRender(_renderTasks);

  // ── TAB 1: MEMBERS ──
  var ml = document.createElement('div'); tabContents[1].content.appendChild(ml);
  function _refreshMembers() { _renderMemberList(proj.id, ml); }
  _refreshMembers();
  tabContents[1].btn.addEventListener('click', _refreshMembers);
  CollabStore.onRender(_refreshMembers);

  // ── TAB 2: ACTIVITY ──
  var af = document.createElement('div'); tabContents[2].content.appendChild(af);
  function _refreshActivity() { _renderActivityFeed(proj.id, af); }
  CollabStore.setActivityCallback(proj.id, _refreshActivity);
  _renderActivityFeed(proj.id, af);
  tabContents[2].btn.addEventListener('click', _refreshActivity);

  // ── TAB 3: DISKUSI ──
  (function(){
    CollabStore.listenProject(proj.id);
    var dc   = tabContents[3].content;
    var feed = document.createElement('div');
    feed.style.cssText = 'margin-bottom:12px;max-height:360px;overflow-y:auto;display:flex;flex-direction:column;gap:6px';

    function _renderDisk() {
      feed.innerHTML = '';
      var msgs = CollabStore.getMessages(proj.id);
      var me   = getCurrentUser();
      if (!msgs.length) {
        feed.innerHTML = '<div class="ct-empty" style="padding:20px 0"><div class="ct-empty-icon">💬</div><div class="ct-empty-title">Belum ada diskusi</div><div class="ct-empty-sub">Mulai diskusi terkait project ini.</div></div>';
        return;
      }
      msgs.forEach(function(msg){
        var isMe = msg.user_id === me.uid;
        var wrap = document.createElement('div'); wrap.style.cssText = 'display:flex;flex-direction:' + (isMe?'row-reverse':'row') + ';align-items:flex-end;gap:8px';
        var bubble = document.createElement('div');
        bubble.className = isMe ? 'ct-chat-bubble-me' : 'ct-chat-bubble-other';
        bubble.style.cssText = 'max-width:72%;padding:9px 12px;font-size:13px;line-height:1.5';
        var header = document.createElement('div'); header.style.cssText = 'font-size:10px;font-weight:700;margin-bottom:3px;opacity:.75';
        header.textContent = msg.user_name + ' · ' + _relTime(msg.ts);
        var body = document.createElement('div'); body.textContent = msg.text;
        bubble.appendChild(header); bubble.appendChild(body);
        wrap.appendChild(_makeAvatar({ name: msg.user_name, photo: msg.user_photo }, 'ct-avatar-sm'));
        wrap.appendChild(bubble);
        feed.appendChild(wrap);
      });
      feed.scrollTop = feed.scrollHeight;
    }

    // Auto-refresh relTime setiap 60 detik agar timestamp tidak stale
    var _relTimeInterval = setInterval(_renderDisk, 60000);

    // Realtime via setDiskCallback — no polling needed
    CollabStore.setDiskCallback(proj.id, _renderDisk);
    _renderDisk();
    dc.appendChild(feed);

    // Input row
    var inputRow = document.createElement('div'); inputRow.style.cssText = 'display:flex;gap:8px;padding-top:8px;border-top:1px solid var(--border)';
    var inp     = document.createElement('input'); inp.className = 'ct-input'; inp.placeholder = 'Tulis pesan...'; inp.style.flex = '1';
    var sendBtn = document.createElement('button'); sendBtn.className = 'ct-btn ct-btn-primary'; sendBtn.innerHTML = '➤'; sendBtn.style.padding = '8px 14px';

    sendBtn.onclick = function(){
      var v = inp.value.trim(); if (!v) return;
      var me = getCurrentUser();
      var msgObj = { user_id: me.uid, user_name: me.name, user_photo: me.photo || null, text: v, ts: Date.now() };
      inp.value = '';
      sendBtn.disabled = true;
      CollabStore.sendMessage(proj.id, msgObj).then(function(){
        sendBtn.disabled = false;
        _renderDisk();
        logActivity(proj.id, 'comment_added', { task_title: 'diskusi project' });
      }).catch(function(e){
        sendBtn.disabled = false;
        var errMsg = (e && e.message) ? e.message : (typeof e === 'string' ? e : 'Cek koneksi');
        _showToast('⚠️ Gagal kirim: ' + errMsg, 'warn');
      });
    };
    inp.onkeydown = function(e){ if (e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); sendBtn.click(); } };
    inputRow.appendChild(inp); inputRow.appendChild(sendBtn); dc.appendChild(inputRow);

    tabContents[3].btn.addEventListener('click', function(){ CollabStore.listenProject(proj.id); _renderDisk(); });
    // Override m.close: chain semua cleanup (diskusi + tasks + members + activity)
    var origClose = m.close.bind(m);
    m.close = function(){
      clearInterval(_relTimeInterval);
      CollabStore.clearDiskCallback(proj.id);
      CollabStore.clearActivityCallback(proj.id);
      CollabStore.offRender(_renderTasks);
      CollabStore.offRender(_refreshMembers);
      origClose();
    };
  })();

  // ── TAB 4: INVITE ──
  tabContents[4].content.innerHTML = `
    <div class="ct-field">
      <div class="ct-label">Invite by email</div>
      <div class="ct-row">
        <input id="ct-inv-inp" class="ct-input" placeholder="email@example.com" style="flex:1">
        <select id="ct-inv-role" class="ct-select" style="width:110px">
          <option value="editor">✏️ Editor</option>
          <option value="viewer">👁️ Viewer</option>
        </select>
      </div>
    </div>
    <button class="ct-btn ct-btn-primary" id="ct-send-inv" style="width:100%;margin-bottom:16px">✉️ Send Invite</button>
    <hr class="ct-divider">
    <div class="ct-label" style="margin-bottom:8px">Share via link</div>
    <select id="ct-link-role" class="ct-select" style="width:170px;margin-bottom:8px">
      <option value="editor">Link for Editors</option>
      <option value="viewer">Link for Viewers</option>
    </select>
    <div class="ct-invite-box"><div class="ct-invite-url" id="ct-inv-url">Generating...</div><button class="ct-copy-btn" id="ct-copy-inv">Copy</button></div>
    <div style="font-size:10px;color:var(--muted);margin-top:6px">🔒 Expires in 7 days · Requires Firebase</div>`;

  function _initInviteTab() {
    var me    = getCurrentUser();
    var lr    = document.getElementById('ct-link-role');
    var urlEl = document.getElementById('ct-inv-url');
    var cpBtn = document.getElementById('ct-copy-inv');
    var sbBtn = document.getElementById('ct-send-inv');
    if (!urlEl) return;
    if (me._isGuest) {
      urlEl.textContent = '⚠️ Login Google untuk membuat invite link'; urlEl.style.color = '#f59e0b';
      if (cpBtn) { cpBtn.disabled = true; cpBtn.style.opacity = '0.4'; }
      if (sbBtn) { sbBtn.disabled = true; sbBtn.style.opacity = '0.4'; }
      return;
    }
    function _genLink(){ urlEl.textContent = 'Generating...'; generateInviteLinkSync(proj.id, lr ? lr.value : 'editor', function(url){ urlEl.textContent = url; }); }
    if (lr) { lr.onchange = _genLink; _genLink(); }
    if (cpBtn) cpBtn.onclick = function(){
      var txt = urlEl.textContent;
      if (!txt || txt === 'Generating...') return;
      navigator.clipboard.writeText(txt).catch(function(){});
      cpBtn.textContent = '✓ Copied!'; cpBtn.classList.add('copied');
      _showToast('🔗 Copied!', 'success');
    };
    if (sbBtn) sbBtn.onclick = function(){
      var email = (document.getElementById('ct-inv-inp').value || '').trim();
      if (!email) { _showToast('⚠️ Enter email', 'warn'); return; }
      var members = CollabStore.getMembers(proj.id);
      if (members.find(function(x){ return x.email === email; })) { _showToast('ℹ️ Already member', 'warn'); return; }
      var role = document.getElementById('ct-inv-role').value;
      var me2 = getCurrentUser();
      CollabStore.addMember(proj.id, { user_id:'pend_'+Date.now(), name:email.split('@')[0], email:email, role:role, status:'pending', invited_at:Date.now(), invited_by:me2.uid }).then(function(){
        logActivity(proj.id, 'member_invited', { target_name: email });
        document.getElementById('ct-inv-inp').value = '';
        _showToast('✉️ Invited ' + email, 'success');
        _renderMemberList(proj.id, ml);
        tabContents[1].btn.click();
      }).catch(function(e){ _showToast('⚠️ Gagal: ' + (e && e.message ? e.message : e), 'warn'); });
    };
  }
  var _inviteTabInited = false;
  var _initInviteTabOnce = function() { if (_inviteTabInited) return; _inviteTabInited = true; _initInviteTab(); };
  tabContents[4].btn.addEventListener('click', _initInviteTabOnce);
}

// ─────────────────────────────────────────────
// § 13. PROJECTS LIST VIEW
// ─────────────────────────────────────────────
function showProjectsView() {
  var m = _buildModal('🤝 Projects', '🤝', 'ct-modal-lg');
  m.modal.removeChild(m.body); m.modal.removeChild(m.footer);
  var wrap = document.createElement('div'); wrap.style.cssText = 'overflow-y:auto;max-height:calc(92vh - 70px);padding:16px 18px';
  m.modal.appendChild(wrap);

  function _render() {
    wrap.innerHTML = '';
    var newBtn = document.createElement('button'); newBtn.className = 'ct-btn ct-btn-primary';
    newBtn.style.cssText = 'width:100%;margin-bottom:8px'; newBtn.textContent = '＋ New Project';
    newBtn.onclick = function(){ _showNewProjForm(wrap, function(proj){ CollabStore.upsertProject(proj); _render(); }); };
    wrap.appendChild(newBtn);

    var joinBtn = document.createElement('button'); joinBtn.className = 'ct-btn';
    joinBtn.style.cssText = 'width:100%;margin-bottom:14px;border:1.5px dashed var(--border);color:var(--accent);background:rgba(217,119,6,.06)';
    joinBtn.innerHTML = '🔗 Join via Link';
    joinBtn.onclick = function(){ m.close(); showJoinViaLinkModal(); };
    wrap.appendChild(joinBtn);

    var list = CollabStore.getProjects();
    if (!list.length) {
      wrap.insertAdjacentHTML('beforeend', '<div class="ct-empty"><div class="ct-empty-icon">📂</div><div class="ct-empty-title">No projects yet</div><div class="ct-empty-sub">Create a project to collaborate with your team.</div></div>');
      return;
    }
    list.forEach(function(proj){
      var members = CollabStore.getMembers(proj.id);
      var pTasks  = CollabStore.getProjectTasks(proj.id);
      var doneCnt = pTasks.filter(function(t){ return t.status === 'done'; }).length;
      var myRole  = _getMyRole(proj.id);
      var card = document.createElement('div'); card.className = 'ct-proj-card';
      card.style.setProperty('--tc-color', proj.color || '#6366f1');
      var hdr = document.createElement('div'); hdr.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:6px';
      var title = document.createElement('div'); title.style.cssText = 'font-size:15px;font-weight:700;color:var(--text)'; title.textContent = proj.title;
      var right = document.createElement('div'); right.style.cssText = 'display:flex;align-items:center;gap:8px';
      if (members.length) right.appendChild(_makeAvatarStack(members));
      if (myRole) { var rb = document.createElement('div'); rb.className = 'ct-role-badge'; rb.style.color = Roles.color(myRole); rb.textContent = Roles.label(myRole); right.appendChild(rb); }
      hdr.appendChild(title); hdr.appendChild(right);
      var meta = document.createElement('div'); meta.style.cssText = 'font-size:11px;color:var(--muted);margin-bottom:10px';
      meta.textContent = pTasks.length + ' task' + (pTasks.length!==1?'s':'') + ' · ' + doneCnt + ' done · ' + members.length + ' member' + (members.length!==1?'s':'');
      if (pTasks.length) {
        var pct = Math.round(doneCnt / pTasks.length * 100);
        var bar = document.createElement('div'); bar.style.cssText = 'height:4px;background:var(--border);border-radius:4px;margin-bottom:10px;overflow:hidden';
        var fill = document.createElement('div'); fill.style.cssText = 'height:100%;width:' + pct + '%;background:var(--green);border-radius:4px;transition:width .3s';
        bar.appendChild(fill); meta.insertAdjacentElement('afterend', bar);
      }
      var acts = document.createElement('div'); acts.style.cssText = 'display:flex;gap:8px';
      var openBtn = document.createElement('button'); openBtn.className = 'ct-btn ct-btn-sm ct-btn-primary'; openBtn.innerHTML = '📋 Open';
      openBtn.onclick = function(e){ e.stopPropagation(); m.close(); showProjectDetail(proj); };
      acts.appendChild(openBtn);
      if (myRole && Roles.canDelete(myRole)) {
        var delBtn = document.createElement('button'); delBtn.className = 'ct-btn ct-btn-sm ct-btn-danger ct-btn-ghost'; delBtn.innerHTML = '🗑️';
        delBtn.onclick = function(e){ e.stopPropagation(); if(confirm('Delete "'+proj.title+'"?')){ CollabStore.deleteProject(proj.id); _render(); _showToast('🗑️ Deleted','warn'); } };
        acts.appendChild(delBtn);
      }
      card.appendChild(hdr); card.appendChild(meta); card.appendChild(acts);
      card.onclick = function(){ m.close(); showProjectDetail(proj); };
      wrap.appendChild(card);
    });
  }
  _render();
  // Auto-refresh when collab store notifies
  CollabStore.onRender(_render);
  var origClose = m.close.bind(m);
  m.close = function(){ CollabStore.offRender(_render); origClose(); };
}

// ─────────────────────────────────────────────
// § 14. NEW PROJECT FORM
// ─────────────────────────────────────────────
function _showNewProjForm(container, onSave) {
  container.innerHTML = '';
  var me = getCurrentUser();
  var colors = ['#d97706','#6366f1','#ec4899','#10b981','#3b82f6','#f59e0b','#8b5cf6','#ef4444'];
  var selColor = colors[0];
  var form = document.createElement('div');
  form.innerHTML = '<div class="ct-label">PROJECT NAME</div><input id="ct-pc-name" class="ct-input" placeholder="e.g. Q2 Marketing" style="margin-bottom:12px"><div class="ct-label">COLOR</div>';
  var colorRow = document.createElement('div'); colorRow.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px';
  colors.forEach(function(c){
    var dot = document.createElement('div');
    dot.style.cssText = 'width:26px;height:26px;border-radius:50%;background:'+c+';cursor:pointer;border:3px solid '+(c===selColor?'#fff':'transparent')+';box-shadow:0 0 0 2px '+(c===selColor?c:'transparent');
    dot.onclick = function(){ selColor = c; colorRow.querySelectorAll('div').forEach(function(d){ d.style.borderColor='transparent';d.style.boxShadow='none'; }); dot.style.borderColor='#fff';dot.style.boxShadow='0 0 0 2px '+c; };
    colorRow.appendChild(dot);
  });
  form.appendChild(colorRow);
  var saveBtn = document.createElement('button'); saveBtn.className = 'ct-btn ct-btn-primary'; saveBtn.style.cssText = 'width:100%;margin-bottom:8px'; saveBtn.textContent = '✓ Create Project';
  var cancelBtn = document.createElement('button'); cancelBtn.className = 'ct-btn'; cancelBtn.style.cssText = 'width:100%'; cancelBtn.textContent = 'Cancel';
  form.appendChild(saveBtn); form.appendChild(cancelBtn);
  container.appendChild(form);
  setTimeout(function(){ var n=document.getElementById('ct-pc-name'); if(n)n.focus(); }, 50);
  var pcx = document.createElement('button'); pcx.id = 'ct-pcx'; pcx.style.display = 'none'; container.appendChild(pcx);
  saveBtn.onclick = function(){
    var name = (document.getElementById('ct-pc-name').value || '').trim();
    if (!name) { _showToast('⚠️ Enter project name', 'warn'); return; }
    var proj = { id:'proj_'+Date.now(), title:name, color:selColor, owner_id:me.uid, created_at:Date.now() };
    onSave(proj);
  };
  cancelBtn.onclick = function(){ document.getElementById('ct-pcx').click(); };
  setTimeout(function(){ if(document.getElementById('ct-pcx')) document.getElementById('ct-pcx').onclick = function(){ showProjectsView(); }; }, 40);
}

// ─────────────────────────────────────────────
// § 15. JOIN VIA LINK MODAL
// ─────────────────────────────────────────────
function showJoinViaLinkModal() {
  var m = _buildModal('🔗 Join via Invite Link', '🔗', 'ct-modal-sm');
  m.body.innerHTML = `
    <div style="text-align:center;padding:8px 0 4px">
      <div style="font-size:36px;margin-bottom:10px">🔗</div>
      <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:6px">Join sebuah Project</div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:18px">Paste invite link yang dikirim temanmu</div>
    </div>
    <div class="ct-field">
      <div class="ct-label">Invite Link</div>
      <input id="ct-jvl-inp" class="ct-input" placeholder="https://...?invite=..." style="width:100%;box-sizing:border-box">
    </div>
    <div id="ct-jvl-status" style="min-height:18px;font-size:12px;margin-bottom:10px;text-align:center"></div>
    <button class="ct-btn ct-btn-primary" id="ct-jvl-go" style="width:100%;padding:11px">🚀 Join Project</button>`;
  setTimeout(function(){
    var inp    = document.getElementById('ct-jvl-inp');
    var status = document.getElementById('ct-jvl-status');
    var goBtn  = document.getElementById('ct-jvl-go');
    if (navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard.readText().then(function(txt){ if (txt && txt.indexOf('invite=') > -1) inp.value = txt.trim(); }).catch(function(){});
    }
    goBtn.onclick = function(){
      var raw = (inp.value || '').trim(); if (!raw) { _showToast('⚠️ Masukkan invite link', 'warn'); return; }
      var inviteId = null;
      try { inviteId = new URL(raw).searchParams.get('invite'); } catch(e) { var m2 = raw.match(/[?&]invite=([^&]+)/); if (m2) inviteId = m2[1]; }
      if (!inviteId) { status.innerHTML = '<span style="color:var(--red)">⚠️ Link tidak valid.</span>'; return; }
      goBtn.disabled = true; goBtn.textContent = '⏳ Memproses...';
      status.innerHTML = '<span style="color:var(--muted)">Mengecek link...</span>';
      CollabStore.getInvite(inviteId).then(function(data){
        if (!data || !data.project_id) { status.innerHTML='<span style="color:var(--red)">⚠️ Link tidak valid.</span>'; goBtn.disabled=false; goBtn.innerHTML='🚀 Join Project'; return; }
        if (Date.now() > data.exp)    { status.innerHTML='<span style="color:var(--red)">⚠️ Link expired.</span>'; goBtn.disabled=false; goBtn.innerHTML='🚀 Join Project'; return; }
        var me = getCurrentUser();
        var members = CollabStore.getMembers(data.project_id);
        if (members.find(function(x){ return x.user_id === me.uid; })) { status.innerHTML='<span style="color:var(--green)">✅ Sudah jadi member.</span>'; goBtn.disabled=false; goBtn.innerHTML='🚀 Join Project'; return; }
        CollabStore.fetchProjectForJoin(data.project_id).then(function(){ m.close(); showJoinModal(data.project_id, data.role); }).catch(function(){ m.close(); showJoinModal(data.project_id, data.role); });
      }).catch(function(e){ status.innerHTML='<span style="color:var(--red)">⚠️ Link tidak valid atau expired.</span>'; goBtn.disabled=false; goBtn.innerHTML='🚀 Join Project'; console.warn('[Collab] join link', e); });
    };
    inp.onkeydown = function(e){ if (e.key === 'Enter') goBtn.click(); };
  }, 40);
}

// ─────────────────────────────────────────────
// § 16. JOIN MODAL
// ─────────────────────────────────────────────
function showJoinModal(pid, role) {
  var proj  = CollabStore.getProject(pid);
  var title = proj ? proj.title : 'a project';
  var m     = _buildModal("You've been invited!", '🎉', 'ct-modal-sm');
  var jWrap = document.createElement('div'); jWrap.style.cssText = 'text-align:center;padding:12px 0 20px';
  var jEmoji = document.createElement('div'); jEmoji.style.cssText = 'font-size:40px;margin-bottom:12px'; jEmoji.textContent = '🤝';
  var jTitle = document.createElement('div'); jTitle.style.cssText = 'font-size:15px;font-weight:700;color:var(--text);margin-bottom:6px';
  jTitle.textContent = 'Join '; var jTitleB = document.createElement('b'); jTitleB.textContent = title; jTitle.appendChild(jTitleB);
  var jRole = document.createElement('div'); jRole.style.cssText = 'font-size:13px;color:var(--muted);margin-bottom:18px';
  jRole.textContent = 'Role: '; var jRoleB = document.createElement('b'); jRoleB.style.color = 'var(--accent)'; jRoleB.textContent = Roles.label(role); jRole.appendChild(jRoleB);
  var jOk = document.createElement('button'); jOk.className = 'ct-btn ct-btn-primary'; jOk.id = 'ct-join-ok'; jOk.style.cssText = 'width:100%;padding:12px'; jOk.textContent = '✅ Accept Invite';
  var jNo = document.createElement('button'); jNo.className = 'ct-btn'; jNo.id = 'ct-join-no'; jNo.style.cssText = 'width:100%;margin-top:8px'; jNo.textContent = 'Decline';
  jWrap.appendChild(jEmoji); jWrap.appendChild(jTitle); jWrap.appendChild(jRole); jWrap.appendChild(jOk); jWrap.appendChild(jNo);
  m.body.appendChild(jWrap);
  setTimeout(function(){
    document.getElementById('ct-join-ok').onclick = function(){
      var me  = getCurrentUser();
      var btn = document.getElementById('ct-join-ok');
      if (btn) { btn.disabled = true; btn.textContent = 'Joining...'; }
      var db = (typeof fbDb !== 'undefined' && fbDb) ? fbDb : null;
      function _doJoin(freshMembers) {
        if (freshMembers && freshMembers.find(function(x){ return x.user_id === me.uid; })) {
          _showToast('Kamu sudah menjadi member', 'warn');
          m.close(); history.replaceState({}, '', window.location.pathname); return;
        }
        var memberObj = { user_id:me.uid, name:me.name, email:me.email, photo:me.photo, role:role, status:'active', joined_at:Date.now(), project_id:pid };
        CollabStore.addMember(pid, memberObj).then(function(){
          logActivity(pid, 'member_added', { target_name: me.name });
          _showToast('🎉 Joined ' + title + '!', 'success');
          m.close(); history.replaceState({}, '', window.location.pathname);
        }).catch(function(e){ _showToast('Gagal join: ' + (e && e.message ? e.message : e), 'error'); if(btn){btn.disabled=false;btn.textContent='✅ Accept Invite';} });
      }
      if (db) {
        db.collection('project_members').where('project_id', '==', pid).get()
          .then(function(snap){ _doJoin(snap.docs.map(function(d){ return d.data(); })); })
          .catch(function(){ _doJoin(CollabStore.getMembers(pid)); });
      } else { _doJoin(CollabStore.getMembers(pid)); }
    };
    document.getElementById('ct-join-no').onclick = function(){ m.close(); history.replaceState({}, '', window.location.pathname); };
  }, 40);
}

// ─────────────────────────────────────────────
// § 17. SHARE / ASSIGN MODALS (compat shims)
// ─────────────────────────────────────────────
function showShareModal(pid) { showProjectDetail(CollabStore.getProject(pid) || { id: pid || 'default_project', title:'My Tasks', owner_id:getCurrentUser().uid, color:'#d97706', created_at:Date.now() }); }
function showAssignModal() { showProjectsView(); }
function renderCommentsPanel() {}

// ─────────────────────────────────────────────
// § 18. SIDEBAR INJECTION
// ─────────────────────────────────────────────
function _injectSidebar() {
  if (document.getElementById('nav-collab')) return; // already in HTML
  if (document.getElementById('ct-sidebar-nav')) return;
  var navContainer = document.querySelector('#navgroup-task') || document.querySelector('.nav-group');
  if (!navContainer) return;
  var section = document.createElement('div');
  section.id = 'ct-sidebar-nav';
  section.innerHTML = '<div style="font-size:9px;font-weight:700;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:.9px;margin-bottom:6px">🤝 Collaboration</div>';
  function _navItem(icon, label, fn) {
    var el = document.createElement('div'); el.className = 'nav-item'; el.onclick = fn;
    el.innerHTML = '<div class="ic">' + icon + '</div><div class="lbl">' + label + '</div>';
    return el;
  }
  var projNavItem = _navItem('🤝', 'Projects', function(){ showProjectsView(); });
  // Live project count badge
  var projBadge = document.createElement('span');
  projBadge.id = 'ct-proj-badge';
  projBadge.style.cssText = 'margin-left:auto;font-size:9px;font-weight:700;background:var(--accent);color:#fff;border-radius:10px;padding:1px 6px;display:none';
  projNavItem.appendChild(projBadge);
  function _updateBadge() {
    var cnt = CollabStore.getProjects().length;
    if (cnt > 0) { projBadge.textContent = cnt; projBadge.style.display = 'inline'; }
    else projBadge.style.display = 'none';
  }
  _updateBadge();
  CollabStore.onRender(_updateBadge);
  section.appendChild(projNavItem);
  var nextSec = document.querySelector('#navgroup-fin');
  if (nextSec && nextSec.parentNode === navContainer) navContainer.insertBefore(section, nextSec);
  else navContainer.appendChild(section);
}

// ─────────────────────────────────────────────
// § 19. ASSIGNEE BADGES ON TASK CARDS
// ─────────────────────────────────────────────
function _addAssigneeBadges() {
  var assignments = CollabStore.getAllAssignments();
  document.querySelectorAll('[data-task-id]').forEach(function(card){
    var taskId = card.getAttribute('data-task-id');
    if (!taskId) return;
    // Always remove stale badge first so remote changes reflect immediately
    var old = card.querySelector('[data-ct-badge]');
    if (old) old.parentNode.removeChild(old);
    var asgn = assignments[taskId]; if (!asgn) return;
    var badge = document.createElement('div');
    badge.setAttribute('data-ct-badge', '1');
    badge.style.cssText = 'display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:600;color:var(--accent);background:rgba(217,119,6,.08);border:1px solid rgba(217,119,6,.2);border-radius:20px;padding:1px 7px 1px 4px;margin-top:3px;cursor:pointer';
    var bAvatar = document.createElement('span'); bAvatar.style.cssText = 'width:14px;height:14px;border-radius:50%;background:var(--accent);color:#fff;font-size:8px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0'; bAvatar.textContent = asgn.name.charAt(0).toUpperCase();
    var bName = document.createElement('span'); bName.textContent = asgn.name.split(' ')[0];
    badge.appendChild(bAvatar); badge.appendChild(bName);
    badge.onclick = function(e){ e.stopPropagation(); if(typeof openDetail==='function') openDetail(taskId); };
    var meta = card.querySelector('.task-meta');
    if (meta) meta.insertAdjacentElement('afterend', badge);
    else { var body = card.querySelector('.task-body'); if (body) body.appendChild(badge); }
  });
}

// ─────────────────────────────────────────────
// § 20. ASSIGN PANEL IN DETAIL VIEW
// ─────────────────────────────────────────────
var _assignPanelListeners = {}; // track per-taskId to avoid accumulation

// Build the full interactive assign panel element (used both on first inject and on remote refresh)
function _buildAssignPanelEl(taskId) {
  var panel = document.createElement('div'); panel.id = 'ct-assign-panel-' + taskId; panel.className = 'ct-assign-panel';
  var titleEl = document.createElement('div'); titleEl.className = 'ct-assign-title'; titleEl.textContent = '👤 Assign ke'; panel.appendChild(titleEl);
  var projects = CollabStore.getProjects();
  if (!projects.length) {
    var hint = document.createElement('div'); hint.style.cssText = 'font-size:12px;color:var(--muted)';
    hint.innerHTML = 'Belum ada project. <a href="#" onclick="event.preventDefault();showProjectsView()" style="color:var(--accent)">Buat project</a> dulu.';
    panel.appendChild(hint);
  } else {
    var pid = projects[0].id;
    if (projects.length > 1) {
      var psel = document.createElement('select'); psel.className = 'ct-select'; psel.style.cssText = 'margin-bottom:8px;font-size:12px';
      projects.forEach(function(p){ var opt=document.createElement('option');opt.value=p.id;opt.textContent=p.title;psel.appendChild(opt); });
      psel.onchange = function(){ pid = psel.value; _refresh(); }; panel.appendChild(psel);
    }
    var assignRow = document.createElement('div'); assignRow.style.cssText = 'position:relative'; panel.appendChild(assignRow);
    function _refresh() {
      assignRow.innerHTML = '';
      var asgn = CollabStore.getAssignment(taskId);
      var members = CollabStore.getMembers(pid);
      var pick = document.createElement('div'); pick.className = 'ct-assign-pick';
      if (asgn) {
        var av = _makeAvatar({name:asgn.name,photo:asgn.photo},'ct-avatar-sm');
        var nm = document.createElement('span'); nm.textContent = asgn.name;
        var cl = document.createElement('span'); cl.style.cssText = 'margin-left:auto;font-size:11px;color:var(--muted);cursor:pointer'; cl.textContent = '✕ Hapus';
        cl.onclick = function(e){ e.stopPropagation(); CollabStore.setAssignment(taskId,null,pid); _refresh(); _showToast('Assignment dihapus',''); };
        pick.appendChild(av); pick.appendChild(nm); pick.appendChild(cl);
      } else {
        pick.innerHTML = '<span style="color:var(--muted);font-size:13px">Pilih anggota...</span><span style="margin-left:auto;font-size:12px">▾</span>';
      }
      pick.onclick = function(e) {
        e.stopPropagation();
        var old = document.querySelector('.ct-assign-dropdown'); if (old && old.parentNode) old.parentNode.removeChild(old);
        var dd = document.createElement('div'); dd.className = 'ct-assign-dropdown';
        var me = getCurrentUser();
        var allUsers = [{user_id:me.uid,name:me.name+' (kamu)',email:me.email,photo:me.photo}];
        members.forEach(function(x){ if(x.user_id!==me.uid) allUsers.push(x); });
        if (!allUsers.length) { dd.innerHTML='<div style="font-size:12px;color:var(--muted);padding:8px">Belum ada member.</div>'; }
        allUsers.forEach(function(u){
          var opt = document.createElement('div'); opt.className = 'ct-assign-opt' + (asgn && asgn.user_id===u.user_id?' selected':'');
          opt.appendChild(_makeAvatar(u,'ct-avatar-sm'));
          var nm2 = document.createElement('span'); nm2.textContent = u.name; opt.appendChild(nm2);
          opt.onclick = function(e2){
            e2.stopPropagation();
            CollabStore.setAssignment(taskId,{user_id:u.user_id,name:u.name.replace(' (kamu)',''),photo:u.photo||null},pid);
            logActivity(pid,'task_assigned',{task_title:taskId});
            if(dd.parentNode) dd.parentNode.removeChild(dd);
            _refresh(); _showToast('📌 Di-assign ke '+u.name.replace(' (kamu)',''),'success');
          };
          dd.appendChild(opt);
        });
        document.body.appendChild(dd);
        var rect = pick.getBoundingClientRect();
        dd.style.top = (rect.bottom+window.scrollY+4)+'px';
        dd.style.left = Math.min(rect.left, window.innerWidth-190)+'px';
        setTimeout(function(){
          document.addEventListener('click', function _cl(){ if(dd.parentNode) dd.parentNode.removeChild(dd); document.removeEventListener('click',_cl,true); }, true);
        }, 0);
      };
      assignRow.appendChild(pick);
    }
    _refresh();
  }
  return panel;
}

// Inject panel into detailPanel DOM
function _injectAssignPanelEl(taskId, panel) {
  var detailPanel = document.getElementById('detailPanel'); if (!detailPanel) return;
  var existing = document.getElementById('ct-assign-panel-' + taskId);
  if (existing) existing.parentNode.removeChild(existing);
  var detNote = detailPanel.querySelector('#det-note') || detailPanel.querySelector('.det-note-field');
  var injTarget = detNote ? (detNote.closest('.field-group') || detNote.parentNode) : (detailPanel.querySelector('.detail-scroll') || detailPanel);
  if (injTarget) {
    var saveArea = detailPanel.querySelector('.detail-actions') || detailPanel.querySelector('[id*="det-save"]');
    if (saveArea && saveArea.parentNode === injTarget) injTarget.insertBefore(panel, saveArea);
    else injTarget.appendChild(panel);
  }
}

function _injectAssignPanelIntoDetail(taskId) {
  // Cleanup previous listener for this taskId before registering a new one
  if (_assignPanelListeners[taskId]) {
    CollabStore.offRender(_assignPanelListeners[taskId]);
    delete _assignPanelListeners[taskId];
  }
  _injectAssignPanelEl(taskId, _buildAssignPanelEl(taskId));

  // Auto-refresh panel (full rebuild with dropdown) while panel is in DOM
  function _onAssignRemoteUpdate() {
    if (!document.getElementById('ct-assign-panel-' + taskId)) {
      // Panel gone — unsubscribe
      CollabStore.offRender(_onAssignRemoteUpdate);
      delete _assignPanelListeners[taskId];
      return;
    }
    // Rebuild full interactive panel with latest assignment data
    _injectAssignPanelEl(taskId, _buildAssignPanelEl(taskId));
  }
  _assignPanelListeners[taskId] = _onAssignRemoteUpdate;
  CollabStore.onRender(_onAssignRemoteUpdate);
}

// ─────────────────────────────────────────────
// § 21. PUBLIC API
// ─────────────────────────────────────────────
window.CT_Collab = {
  showProjectsView:    showProjectsView,
  showProjectDetail:   showProjectDetail,
  showShareModal:      showShareModal,
  showAssignModal:     showAssignModal,
  showJoinModal:       showJoinModal,
  showJoinViaLinkModal:showJoinViaLinkModal,
  renderCommentsPanel: renderCommentsPanel,
  logActivity:         logActivity,
  getCurrentUser:      getCurrentUser,
  CollabStore:         CollabStore,
  Roles:               Roles,
  generateInviteLink:  generateInviteLink,
  showToast:           _showToast,
  makeAvatar:          _makeAvatar,
  makeAvatarStack:     _makeAvatarStack
};

// ─────────────────────────────────────────────
// § 22. INIT — hook Firebase auth + ensure default project
// ─────────────────────────────────────────────
(function _init() {
  // Ensure default project exists in localStorage
  var me = getCurrentUser();
  if (!CollabStore.getProject('default_project')) {
    CollabStore.upsertProject({ id:'default_project', title:'My Tasks', color:'#d97706', owner_id:me.uid, created_at:Date.now() });
  } else {
    // M5 FIX: Pastikan owner default_project juga ada di members (migrasi data lama)
    var defMembers = CollabStore.getMembers('default_project');
    var ownerInMembers = defMembers.find(function(m){ return m.user_id === me.uid && m.role === 'owner'; });
    if (!ownerInMembers) {
      CollabStore.addMember('default_project', { user_id: me.uid, role: 'owner', status: 'active', joined_at: Date.now(), name: me.displayName || 'Owner', email: me.email || '' });
    }
  }

  // Sidebar injection with retry
  var _uiTries = 0;
  function _tryUi() {
    if (document.body) {
      _injectSidebar();
      // Patch openDetail
      if (typeof openDetail === 'function' && !openDetail._ctPatched) {
        var _origOD = openDetail;
        openDetail = function(id){ _origOD.apply(this,arguments); setTimeout(function(){ _injectAssignPanelIntoDetail(id); }, 80); };
        openDetail._ctPatched = true;
      }
      // Patch render — also refresh badges on every main app render
      if (typeof render === 'function' && !render._ctPatched) {
        var _origR = render;
        render = function(){ _origR.apply(this,arguments); setTimeout(_addAssigneeBadges, 80); };
        render._ctPatched = true;
      }
      _addAssigneeBadges();
      // Named function agar bisa di-offRender jika diperlukan; guard agar tidak double-register
      if (!_tryUi._badgeListenerRegistered) {
        function _globalBadgeRefresh(){ setTimeout(_addAssigneeBadges, 50); }
        CollabStore.onRender(_globalBadgeRefresh);
        _tryUi._badgeListenerRegistered = true;
      }
      console.log('[CT_Collab v7] Loaded ✅');
    } else if (_uiTries++ < 30) { setTimeout(_tryUi, 500); }
  }
  setTimeout(_tryUi, 800);

  // Hook Firebase — retry until fbDb ready, then re-init listeners on auth change
  var _fbTries = 0;
  function _tryFb() {
    if (typeof fbDb !== 'undefined' && fbDb && typeof fbAuth !== 'undefined' && fbAuth) {
      // Listen to auth state changes so listeners auto-restart after login
      fbAuth.onAuthStateChanged(function(user) {
        if (user && !user.isAnonymous) {
          setTimeout(function(){ CollabStore.initListeners(); }, 500);
        }
      });
      // Also try immediately
      CollabStore.initListeners();
    } else if (_fbTries++ < 30) { setTimeout(_tryFb, 500); }
    else { console.warn('[CT_Collab v7] Firebase not available — running in local mode'); }
  }
  setTimeout(_tryFb, 800);
})();

})(); // end IIFE
