// ╔══════════════════════════════════════════════════════╗
// ║  ChiTask — Netlify Scheduled Function                ║
// ║  Cek Firestore tiap menit, kirim FCM jika waktunya   ║
// ╚══════════════════════════════════════════════════════╝
//
// Deploy requirements:
//   npm install firebase-admin  (di folder netlify/functions atau root)
//
// Netlify Environment Variables yang harus diset di dashboard:
//   FIREBASE_PROJECT_ID       → project ID Firebase kamu
//   FIREBASE_CLIENT_EMAIL     → dari service account JSON
//   FIREBASE_PRIVATE_KEY      → dari service account JSON (termasuk \n)

const admin = require('firebase-admin');

// ── Init Firebase Admin (lazy, agar tidak re-init tiap cold start) ──
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Netlify env menyimpan \n sebagai literal string — perlu di-replace
      privateKey:  process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const db  = admin.firestore();
const fcm = admin.messaging();

// ── Handler utama ────────────────────────────────────────────────
exports.handler = async function() {
  const now     = Date.now();
  const nowSec  = Math.floor(now / 1000);
  // Window: reminder yang jatuh tempo dalam 60 detik ke belakang s/d sekarang
  // (toleransi keterlambatan 1 siklus)
  const windowStart = nowSec - 60;

  try {
    // ── 1. Ambil semua FCM token aktif dari koleksi 'fcm_tokens' ──
    // Struktur dokumen: { userId, token, updatedAt }
    const tokenSnap = await db.collection('fcm_tokens').get();
    if (tokenSnap.empty) return respond(200, 'No tokens registered');

    // Map userId → token untuk lookup cepat
    const tokenMap = {};
    tokenSnap.forEach(doc => {
      const d = doc.data();
      if (d.userId && d.token) tokenMap[d.userId] = d.token;
    });

    // ── 2. Ambil reminder yang belum terkirim dan sudah waktunya ──
    // Struktur dokumen 'reminders':
    // { userId, taskId, taskName, fireAt (unix seconds), sent (bool) }
    const remSnap = await db.collection('reminders')
      .where('sent', '==', false)
      .where('fireAt', '<=', nowSec)
      .where('fireAt', '>=', windowStart)
      .get();

    if (remSnap.empty) return respond(200, 'No reminders due');

    // ── 3. Kirim FCM untuk setiap reminder ──────────────────────
    const batch   = db.batch();
    const sends   = [];

    remSnap.forEach(doc => {
      const rem   = doc.data();
      const token = tokenMap[rem.userId];

      if (!token) {
        // User belum subscribe FCM — tandai sent agar tidak dicek terus
        batch.update(doc.ref, { sent: true, skipped: true });
        return;
      }

      const message = {
        token,
        // 'data' (bukan 'notification') agar SW yang handle,
        // sehingga bisa custom icon & badge
        data: {
          title:  'ChiTask ⏰ Pengingat',
          body:   rem.taskName || 'Ada task yang menunggu!',
          tag:    'chitask-rem-' + rem.taskId,
          taskId: String(rem.taskId || ''),
        },
        // Android: channel & priority
        android: {
          priority: 'high',
          notification: { channelId: 'chitask_reminders' }
        },
        // Web: VAPID key tidak perlu disini, sudah di client
        webpush: {
          headers: { Urgency: 'high' }
        }
      };

      sends.push(
        fcm.send(message)
          .then(() => batch.update(doc.ref, { sent: true, sentAt: nowSec }))
          .catch(err => {
            console.error('FCM send error for', rem.taskId, err.message);
            // Jika token tidak valid, hapus dari registry
            if (err.code === 'messaging/registration-token-not-registered') {
              db.collection('fcm_tokens')
                .where('userId', '==', rem.userId)
                .get()
                .then(s => s.forEach(d => d.ref.delete()));
            }
          })
      );
    });

    await Promise.all(sends);
    await batch.commit();

    return respond(200, `Sent ${sends.length} reminder(s)`);

  } catch (err) {
    console.error('send-reminders error:', err);
    return respond(500, err.message);
  }
};

function respond(status, message) {
  console.log(`[send-reminders] ${message}`);
  return { statusCode: status, body: message };
}
