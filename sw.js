const CACHE_NAME = 'cbc-training-v1';
const ASSETS = [
  '/cbc-training/',
  '/cbc-training/index.html',
  '/cbc-training/manifest.json'
];

// ─── INSTALL: cache assets ───
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).catch(()=>{})
  );
  self.skipWaiting();
});

// ─── ACTIVATE: clean old caches ───
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ─── FETCH: network first, fallback to cache ───
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

// ─── PUSH NOTIFICATION ───
self.addEventListener('push', e => {
  let data = { title: "CBC Training", body: "Tienes un mensaje nuevo 🥊", icon: '/cbc-training/logo-trainer.png', badge: '/cbc-training/logo-trainer.png' };
  try { if (e.data) data = { ...data, ...e.data.json() }; } catch(err) {}

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      vibrate: [200, 100, 200],
      data: { url: data.url || '/cbc-training/' },
      actions: [
        { action: 'open', title: '💪 Ver rutina' },
        { action: 'dismiss', title: 'Después' }
      ]
    })
  );
});

// ─── NOTIFICATION CLICK ───
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'dismiss') return;
  const url = e.notification.data?.url || '/cbc-training/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes('cbc-training') && 'focus' in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});
