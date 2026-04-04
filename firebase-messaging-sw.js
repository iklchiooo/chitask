importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            "AIzaSyA_erlGbohRGlL0ei8l2RqJLR0sy-kVtvU",
  authDomain:        "chitask.firebaseapp.com",
  projectId:         "chitask",
  storageBucket:     "chitask.firebasestorage.app",
  messagingSenderId: "914322046491",
  appId:             "1:914322046491:web:f35fc2b9258b9d710e82be"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const data = payload.data || payload.notification || {};
  const title = data.title || 'ChiTask ⏰ Pengingat';
  const body  = data.body  || '';
  const tag   = data.tag   || 'chitask-fcm-' + Date.now();
  return self.registration.showNotification(title, {
    body,
    icon:    '/icons/icon-192x192.png',
    badge:   '/icons/icon-96x96.png',
    tag,
    renotify: true,
    vibrate: [200, 100, 200],
    data: { url: '/' }
  });
});
