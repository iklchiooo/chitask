// ╔══════════════════════════════════════════════════════════════════════╗
// ║  CHITASK SERVICE WORKER                                             ║
// ║  Offline Cache & Asset Caching + FCM Background Push Support       ║
// ║                                                                     ║
// ║  Strategi Cache:                                                    ║
// ║  • CRITICAL  → pre-cache saat install (shell app)                  ║
// ║  • LAZY      → cache on-demand saat pertama diakses                ║
// ║  • NETWORK   → selalu fresh dari network (Firebase, API)           ║
// ║                                                                     ║
// ║  Boss files & theme CSS hanya di-cache saat dibutuhkan             ║
// ╚══════════════════════════════════════════════════════════════════════╝

// ── FCM: Import Firebase untuk push notification background ──────────
// Dibungkus try-catch agar SW tetap bisa berjalan saat offline.
// Tanpa ini, importScripts yang gagal (no network) akan membuat SW
// crash total → tidak ada fetch handler → blank putih saat offline.
var _fcmReady = false;
try {
  importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

  // ── Inisialisasi Firebase di SW ────────────────────────────────────
  firebase.initializeApp({
    apiKey:            "AIzaSyA_erlGbohRGlL0ei8l2RqJLR0sy-kVtvU",
    authDomain:        "chitask.firebaseapp.com",
    projectId:         "chitask",
    storageBucket:     "chitask.firebasestorage.app",
    messagingSenderId: "914322046491",
    appId:             "1:914322046491:web:f35fc2b9258b9d710e82be"
  });

  const messaging = firebase.messaging();

  // ── FCM: Tangani push saat app background / ditutup ───────────────
  messaging.onBackgroundMessage(function(payload) {
    console.log('[sw.js] FCM background message:', payload);
    const data   = payload.data || payload.notification || {};
    const title  = data.title  || 'ChiTask ⏰ Pengingat';
    const body   = data.body   || '';
    const tag    = data.tag    || 'chitask-fcm-' + Date.now();
    const taskId = data.taskId || '';

    return self.registration.showNotification(title, {
      body,
      icon:    '/icons/icon-192x192.png',
      badge:   '/icons/icon-96x96.png',
      tag,
      renotify: true,
      vibrate: [200, 100, 200],
      requireInteraction: false,
      data: { taskId, url: '/' }
    });
  });

  _fcmReady = true;
} catch (e) {
  // Firebase tidak tersedia (offline atau CDN gagal) — SW tetap jalan normal,
  // hanya fitur push notification background yang nonaktif sementara.
  console.warn('[SW] Firebase FCM tidak tersedia, push notification background dinonaktifkan.', e.message);
}

// ════════════════════════════════════════════════════════════════════════
// VERSI & NAMA CACHE
// Bump CACHE_VERSION setiap deploy untuk force update SW
// ════════════════════════════════════════════════════════════════════════
const CACHE_VERSION = 'chitask-v10'; // v10: fix offline blank putih (FCM try-catch + cacheFirst HTML)
const STATIC_CACHE  = CACHE_VERSION + '-static';   // critical shell
const LAZY_CACHE    = CACHE_VERSION + '-lazy';     // boss, themes, extras
const DYNAMIC_CACHE = CACHE_VERSION + '-dynamic';  // CDN, fonts, runtime

// ════════════════════════════════════════════════════════════════════════
// HOST RULES
// ════════════════════════════════════════════════════════════════════════

// Firebase API → network only, jangan pernah cache
const FIREBASE_HOSTS = [
  'firestore.googleapis.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'accounts.google.com',
  'www.googleapis.com',
  'firebase.googleapis.com',
  'oauth2.googleapis.com'
];

// GCal Worker → network only
const WORKER_HOSTS = ['workers.dev'];

// CDN → cache aggressively di DYNAMIC_CACHE
// ✅ www.gstatic.com masuk CDN supaya Firebase SDK di-cache dengan benar
const CDN_HOSTS = [
  'cdnjs.cloudflare.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'www.gstatic.com',
  'unpkg.com'
];

// ════════════════════════════════════════════════════════════════════════
// CRITICAL ASSETS — pre-cache saat install
// Hanya file yang WAJIB ada untuk app shell berjalan offline.
// Boss files & theme CSS TIDAK masuk sini (lazy load).
// ════════════════════════════════════════════════════════════════════════
const CRITICAL_ASSETS = [
  './',
  './index.html',
  './manifest.json',

  // Ikon minimal untuk install prompt & notifikasi
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',

  // CSS utama — wajib ada sebelum render
  './css/main.css',

  // JS core — urutan sesuai dependensi di index.html
  './js/lang.js',
  './js/constants-helpers.js',
  './js/chipstate.js',
  './js/app.js',
  './js/nlp.js',
  './js/mobile-nav.js',
  './js/onboarding.js',
  './js/announcement.js',
  './js/sholat.js',
  './js/horoscope.js',

  // Character system — wajib ada untuk job & skill berjalan
  './character/jobs/sprite-config.js',
  './character/jobs/jobs.js',
  './character/jobs/skills/skills-engine.js',

  // Skill files semua job — tanpa ini skill fallback ke Basic Attack offline
  './character/jobs/normal/Novice/skills/novice.js',
  './character/jobs/normal/Hunter/skills/hunter.js',
  './character/jobs/normal/Warrior/skills/warrior.js',
  './character/jobs/normal/Knight/skills/knight.js',
  './character/jobs/normal/Paladin/skills/paladin.js',
  './character/jobs/normal/sage/skills/sage.js',
  './character/jobs/normal/bard/skills/bard.js',
  './character/jobs/normal/crusader/skills/crusader.js',
  './character/jobs/normal/alchemist/skills/alchemist.js',
  './character/jobs/normal/archmage/skills/archmage.js',
  './character/jobs/hidden/shadow/skills/shadow.js',
  './character/jobs/hidden/sovereign/skills/sovereign.js',
  './character/jobs/paid/Slytherin/Char 1/skills/slytherin.js',
];

// ════════════════════════════════════════════════════════════════════════
// LAZY PATH PREFIXES — di-cache on-demand saat pertama diakses
// Boss files: hanya dipakai jika gamer mode aktif
// Theme CSS: hanya tema aktif yang dipakai user
// ════════════════════════════════════════════════════════════════════════
const LAZY_PATHS = [
  '/boss/',
  '/css/themes/',
  '/css/efek/',
  '/character/',          // sprites semua job (webp)
  '/icons/icon-96x96.png',
  '/icons/icon-144x144.png',
  '/icons/icon-128x128.png',
  '/icons/icon-152x152.png',
  '/icons/icon-384x384.png',
];

// ════════════════════════════════════════════════════════════════════════
// INSTALL — pre-cache CRITICAL_ASSETS saja
// ════════════════════════════════════════════════════════════════════════
self.addEventListener('install', function(event) {
  console.log('[SW] Installing — pre-caching critical assets...');
  self.skipWaiting();

  event.waitUntil(
    caches.open(STATIC_CACHE).then(function(cache) {
      return Promise.allSettled(
        CRITICAL_ASSETS.map(function(url) {
          return cache.add(url).catch(function(err) {
            console.warn('[SW] Gagal pre-cache:', url, err.message);
          });
        })
      );
    }).then(function() {
      console.log('[SW] Install selesai. Boss & theme files akan di-cache saat diakses.');
    })
  );
});

// ════════════════════════════════════════════════════════════════════════
// ACTIVATE — hapus cache lama, ambil alih semua client
// ════════════════════════════════════════════════════════════════════════
self.addEventListener('activate', function(event) {
  console.log('[SW] Activating — membersihkan cache lama...');
  const validCaches = [STATIC_CACHE, LAZY_CACHE, DYNAMIC_CACHE];

  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys
          .filter(function(key) {
            return key.startsWith('chitask-') && !validCaches.includes(key);
          })
          .map(function(key) {
            console.log('[SW] Hapus cache lama:', key);
            return caches.delete(key);
          })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// ════════════════════════════════════════════════════════════════════════
// FETCH — routing utama
// ════════════════════════════════════════════════════════════════════════
self.addEventListener('fetch', function(event) {
  var req = event.request;
  var url;
  try { url = new URL(req.url); } catch { return; }

  if (req.method !== 'GET') return;

  // Network-only: Firebase API
  if (FIREBASE_HOSTS.some(function(h) { return url.hostname.includes(h); })) return;

  // Network-only: GCal Worker
  if (WORKER_HOSTS.some(function(h) { return url.hostname.includes(h); })) return;

  // Network-only: Firebase Storage
  if (url.hostname.includes('storage.googleapis.com')) return;

  event.respondWith(route(req, url));
});

// ════════════════════════════════════════════════════════════════════════
// ROUTING LOGIC
// ════════════════════════════════════════════════════════════════════════
function route(req, url) {
  var isSameOrigin = url.origin === self.location.origin;
  var path = url.pathname;

  // 1. CDN → cache first di DYNAMIC_CACHE
  if (CDN_HOSTS.some(function(h) { return url.hostname.includes(h); })) {
    return cacheFirst(req, DYNAMIC_CACHE);
  }

  if (isSameOrigin) {
    // 2. Critical JS/CSS/icons → cache first di STATIC_CACHE
    if (isCritical(path)) {
      return cacheFirst(req, STATIC_CACHE);
    }

    // 3. Lazy paths (boss, themes, extra icons) → lazy cache first
    if (isLazyPath(path)) {
      return lazyCacheFirst(req, LAZY_CACHE);
    }

    // 4. HTML navigation → cache first, fallback ke network
    // networkFirst dulu menyebabkan blank putih saat offline karena hard reload
    // memaksa request baru ke network. cacheFirst langsung serve dari cache.
    if (path.endsWith('.html') || path === '/' || !path.includes('.')) {
      return cacheFirst(req, STATIC_CACHE);
    }

    // 5. Aset statis lain same-origin → lazy cache
    if (isStaticAsset(path)) {
      return lazyCacheFirst(req, LAZY_CACHE);
    }
  }

  // 6. Semua lainnya → network first
  return networkFirst(req, DYNAMIC_CACHE);
}

// ════════════════════════════════════════════════════════════════════════
// PATH HELPERS
// ════════════════════════════════════════════════════════════════════════

function isCritical(path) {
  return CRITICAL_ASSETS.some(function(asset) {
    if (asset.startsWith('http')) return false;
    var normalized = asset.replace('./', '/');
    return path === normalized || path === normalized + 'index.html';
  });
}

function isLazyPath(path) {
  return LAZY_PATHS.some(function(prefix) {
    return path.startsWith(prefix) || path === prefix;
  });
}

function isStaticAsset(path) {
  return (
    path.endsWith('.js')     || path.endsWith('.css')   ||
    path.endsWith('.svg')    || path.endsWith('.png')   ||
    path.endsWith('.jpg')    || path.endsWith('.jpeg')  ||
    path.endsWith('.webp')   || path.endsWith('.gif')   ||
    path.endsWith('.ico')    || path.endsWith('.woff')  ||
    path.endsWith('.woff2')  || path.endsWith('.ttf')   ||
    path.endsWith('.lottie')
  );
}

// ════════════════════════════════════════════════════════════════════════
// CACHE STRATEGIES
// ════════════════════════════════════════════════════════════════════════

// Cache First — serve dari cache, refresh di background untuk JS/CSS
function cacheFirst(req, cacheName) {
  return caches.open(cacheName).then(function(cache) {
    return cache.match(req).then(function(cached) {
      if (cached) {
        backgroundRefresh(req, cache);
        return cached;
      }
      return fetchAndStore(req, cache);
    });
  });
}

// Lazy Cache First — identik dengan cacheFirst tapi semantiknya berbeda:
// tidak ada pre-warming, file baru di-fetch saat pertama kali diakses
function lazyCacheFirst(req, cacheName) {
  return caches.open(cacheName).then(function(cache) {
    return cache.match(req).then(function(cached) {
      if (cached) {
        backgroundRefresh(req, cache);
        return cached;
      }
      return fetchAndStore(req, cache);
    });
  });
}

// Network First — coba network dengan timeout 4s, fallback ke cache jika offline/lambat
function networkFirst(req, cacheName) {
  var timeoutPromise = new Promise(function(_, reject) {
    setTimeout(function() { reject(new Error('timeout')); }, 4000);
  });
  return Promise.race([fetch(req), timeoutPromise]).then(function(response) {
    if (response && response.status === 200) {
      var clone = response.clone();
      caches.open(cacheName).then(function(cache) { cache.put(req, clone); });
    }
    return response;
  }).catch(function() {
    return caches.match(req).then(function(cached) {
      return cached || offlineFallback(req);
    });
  });
}

// Fetch lalu simpan ke cache
function fetchAndStore(req, cache) {
  return fetch(req).then(function(response) {
    if (response && (response.status === 200 || response.type === 'opaque')) {
      cache.put(req, response.clone());
    }
    return response;
  }).catch(function(err) {
    console.warn('[SW] Fetch gagal:', req.url, err.message);
    return offlineFallback(req);
  });
}

// Background refresh — update cache diam-diam untuk semua aset statis
function backgroundRefresh(req, cache) {
  var url = req.url;
  var shouldRefresh = (
    url.endsWith('.js')     || url.endsWith('.css')    ||
    url.endsWith('.html')   || url.endsWith('.webp')   ||
    url.endsWith('.png')    || url.endsWith('.lottie')
  );
  if (shouldRefresh) {
    fetch(req).then(function(response) {
      if (response && response.status === 200) {
        cache.put(req, response);
      }
    }).catch(function() {});
  }
}

// Fallback saat offline
function offlineFallback(req) {
  var accept = req.headers.get('accept') || '';
  if (accept.includes('text/html')) {
    return caches.match('./index.html').then(function(r) {
      return r || caches.match('/');
    });
  }
  return new Response('', { status: 503, statusText: 'Service Unavailable' });
}

// ════════════════════════════════════════════════════════════════════════
// MESSAGE — kontrol dari halaman utama
// ════════════════════════════════════════════════════════════════════════
self.addEventListener('message', function(event) {
  if (!event.data) return;

  // Force update SW
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Hapus semua cache (misal setelah logout / clear data)
  if (event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) { return caches.delete(k); }));
    }).then(function() {
      event.ports[0] && event.ports[0].postMessage({ cleared: true });
    });
  }

  // Pre-warm cache untuk lazy assets secara opsional
  // Kirim dari app: navigator.serviceWorker.controller.postMessage({
  //   type: 'WARM_CACHE',
  //   paths: ['./boss/boss.js', './boss/iblis-kemalasan.js', ...]
  // })
  if (event.data.type === 'WARM_CACHE') {
    var paths = event.data.paths || [];
    caches.open(LAZY_CACHE).then(function(cache) {
      paths.forEach(function(path) {
        cache.match(path).then(function(hit) {
          if (!hit) {
            fetch(path).then(function(res) {
              if (res && res.status === 200) cache.put(path, res);
            }).catch(function() {});
          }
        });
      });
    });
  }

  // Tampilkan notifikasi langsung
  if (event.data.type === 'SHOW_NOTIFICATION') {
    var d = event.data;
    self.registration.showNotification(d.title, {
      body:     d.body,
      icon:     d.icon || '/icons/icon-192x192.png',
      badge:    '/icons/icon-96x96.png',
      tag:      d.tag  || 'chitask-reminder',
      renotify: true,
      vibrate:  [200, 100, 200],
      requireInteraction: false,
      data:     { taskId: d.taskId, url: '/' }
    });
  }

  // Jadwalkan notifikasi (hanya untuk < 5 menit ke depan)
  if (event.data.type === 'SCHEDULE_NOTIFICATION') {
    var d = event.data;
    var delay = d.fireAt - Date.now();
    if (delay <= 0) return;
    if (delay < 5 * 60 * 1000) {
      setTimeout(function() {
        self.registration.showNotification(d.title, {
          body:     d.body,
          icon:     '/icons/icon-192x192.png',
          badge:    '/icons/icon-96x96.png',
          tag:      d.tag || 'chitask-reminder',
          renotify: true,
          vibrate:  [200, 100, 200],
          requireInteraction: false,
          data:     { taskId: d.taskId, url: '/' }
        });
      }, delay);
    }
  }
});

// ════════════════════════════════════════════════════════════════════════
// NOTIFICATION CLICK — buka / focus tab app
// ════════════════════════════════════════════════════════════════════════
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
      for (var i = 0; i < list.length; i++) {
        var client = list[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

// ════════════════════════════════════════════════════════════════════════
// PUSH — tangani raw push event (fallback jika FCM tidak handle)
// ════════════════════════════════════════════════════════════════════════
self.addEventListener('push', function(event) {
  if (!event.data) return;
  try {
    var d     = event.data.json();
    var title = (d.notification && d.notification.title) || (d.data && d.data.title) || d.title || 'ChiTask ⏰ Pengingat';
    var body  = (d.notification && d.notification.body)  || (d.data && d.data.body)  || d.body  || '';
    var tag   = (d.data && d.data.tag) || d.tag || 'chitask-push';

    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon:    '/icons/icon-192x192.png',
        badge:   '/icons/icon-96x96.png',
        tag,
        renotify: true,
        vibrate: [200, 100, 200],
        requireInteraction: false,
        data:    { taskId: (d.data && d.data.taskId) || '', url: '/' }
      })
    );
  } catch(err) {}
});
