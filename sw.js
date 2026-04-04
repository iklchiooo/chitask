// ╔══════════════════════════════════════════════════════╗
// ║   ChiTask Service Worker v6                          ║
// ║   Offline-first PWA — Cache & Network Strategy      ║
// ║   + FCM Background Push Support                     ║
// ╚══════════════════════════════════════════════════════╝

// ── FCM: Import harus di baris paling atas SW ────────────────────
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// ── Inisialisasi Firebase di SW ──────────────────────────────────
firebase.initializeApp({
  apiKey:            "AIzaSyA_erlGbohRGlL0ei8l2RqJLR0sy-kVtvU",
  authDomain:        "chitask.firebaseapp.com",
  projectId:         "chitask",
  storageBucket:     "chitask.firebasestorage.app",
  messagingSenderId: "914322046491",
  appId:             "1:914322046491:web:f35fc2b9258b9d710e82be"
});

const messaging = firebase.messaging();

// ── FCM: Tangani push saat app background / ditutup ─────────────
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

// ────────────────────────────────────────────────────────────────
const CACHE_NAME   = 'chitask-v6';
const CACHE_STATIC = 'chitask-static-v6';
const CACHE_CDN    = 'chitask-cdn-v6';

// Firebase & Google Auth — JANGAN di-cache
// ⚠️ www.gstatic.com DIHAPUS dari sini karena dipakai importScripts FCM
const FIREBASE_HOSTS = [
  'firestore.googleapis.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'accounts.google.com',
  'www.googleapis.com',
  'firebase.googleapis.com',
  'oauth2.googleapis.com'
];

// GCal Worker — network only
const WORKER_HOSTS = [
  'workers.dev'
];

// CDN assets — cache aggressively
// ✅ www.gstatic.com masuk CDN supaya Firebase SDK di-cache dengan benar
const CDN_HOSTS = [
  'cdnjs.cloudflare.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'www.gstatic.com'
];

// App shell files to pre-cache on install
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/sw.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-144x144.png',
  '/icons/icon-96x96.png'
];

// ── INSTALL: Pre-cache app shell ──────────────────────────────────
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_STATIC).then(cache => {
      return cache.addAll(APP_SHELL).catch(err => {
        console.warn('[SW] Pre-cache sebagian gagal (OK):', err);
      });
    })
  );
});

// ── ACTIVATE: Bersihkan cache lama ───────────────────────────────
self.addEventListener('activate', e => {
  const validCaches = [CACHE_NAME, CACHE_STATIC, CACHE_CDN];
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => !validCaches.includes(k))
          .map(k => {
            console.log('[SW] Hapus cache lama:', k);
            return caches.delete(k);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: Strategi per jenis request ────────────────────────────
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  let url;
  try { url = new URL(e.request.url); } catch { return; }

  // 1. Firebase API → network only, tidak di-cache sama sekali
  if (FIREBASE_HOSTS.some(h => url.hostname.includes(h))) return;

  // 2. GCal Worker → network only
  if (WORKER_HOSTS.some(h => url.hostname.includes(h))) return;

  // 3. CDN (fonts, libraries, gstatic) → cache first, fallback network
  if (CDN_HOSTS.some(h => url.hostname.includes(h))) {
    e.respondWith(
      caches.open(CACHE_CDN).then(cache =>
        cache.match(e.request).then(cached => {
          if (cached) return cached;
          return fetch(e.request).then(res => {
            if (res && res.status === 200) {
              cache.put(e.request, res.clone());
            }
            return res;
          }).catch(() => cached || new Response('', { status: 503 }));
        })
      )
    );
    return;
  }

  // 4. App shell (same origin) → network first, fallback cache → fallback /
  if (url.origin === self.location.origin) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_STATIC).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() =>
          caches.match(e.request).then(cached =>
            cached || caches.match('/index.html') || caches.match('/')
          )
        )
    );
    return;
  }
});

// ── MESSAGE: Force update & notifikasi dari UI ───────────────────
self.addEventListener('message', e => {
  if (!e.data) return;
  if (e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (e.data.type === 'CLEAR_CACHE') {
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
  }
  if (e.data.type === 'SHOW_NOTIFICATION') {
    const d = e.data;
    self.registration.showNotification(d.title, {
      body:    d.body,
      icon:    d.icon  || '/icons/icon-192x192.png',
      badge:   '/icons/icon-96x96.png',
      tag:     d.tag   || 'chitask-reminder',
      renotify: true,
      vibrate: [200, 100, 200],
      requireInteraction: false,
      data:    { taskId: d.taskId, url: '/' }
    });
  }
  if (e.data.type === 'SCHEDULE_NOTIFICATION') {
    const d = e.data;
    const delay = d.fireAt - Date.now();
    if (delay <= 0) return;
    if (delay < 5 * 60 * 1000) {
      setTimeout(() => {
        self.registration.showNotification(d.title, {
          body:    d.body,
          icon:    '/icons/icon-192x192.png',
          badge:   '/icons/icon-96x96.png',
          tag:     d.tag || 'chitask-reminder',
          renotify: true,
          vibrate: [200, 100, 200],
          requireInteraction: false,
          data:    { taskId: d.taskId, url: '/' }
        });
      }, delay);
    }
  }
});

// ── NOTIFICATION CLICK: Buka/focus tab app ───────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const targetUrl = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

// ── PUSH: Tangani raw push event (fallback jika FCM tidak handle) ─
self.addEventListener('push', e => {
  if (!e.data) return;
  try {
    const d = e.data.json();
    const title = (d.notification && d.notification.title) || (d.data && d.data.title) || d.title || 'ChiTask ⏰ Pengingat';
    const body  = (d.notification && d.notification.body)  || (d.data && d.data.body)  || d.body  || '';
    const tag   = (d.data && d.data.tag) || d.tag || 'chitask-push';
    e.waitUntil(
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
