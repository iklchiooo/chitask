// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyA_erlGbohRGlL0ei8l2RqJLR0sy-kVtvU",
  authDomain: "chitask.firebaseapp.com",
  projectId: "chitask",
  storageBucket: "chitask.firebasestorage.app",
  messagingSenderId: "914322046491",
  appId: "1:914322046491:web:f35fc2b9258b9d710e82be"
});

const messaging = firebase.messaging();

// Handle push notification saat app di background / tab tertutup
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Background message:', payload);
  const title = payload.notification?.title || payload.data?.title || 'ChiTask';
  const body  = payload.notification?.body  || payload.data?.body  || 'Kamu punya reminder!';
  self.registration.showNotification(title, {
    body:    body,
    icon:    '/icons/icon-192x192.png',
    badge:   '/icons/icon-96x96.png',
    tag:     payload.data?.taskId || 'chitask-reminder',
    vibrate: [200, 100, 200],
    data:    payload.data || {}
  });
});
