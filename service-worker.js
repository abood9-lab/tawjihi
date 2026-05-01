const CACHE_NAME = 'tawjihiguide-v1';
const APP_SHELL = [
  '/',
  '/dashboard.html',
  '/signup.html',
  '/courses.html',
  '/course-detail.html',
  '/quiz.html',
  '/profile.html',
  '/messages.html',
  '/search-users.html',
  '/leaderboard.html',
  '/notifications.html',
  '/site-shell.js',
  '/manifest.webmanifest',
  '/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (!request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          const cacheable = response.ok && (response.type === 'basic' || response.type === 'cors');
          if (cacheable) {
            return cache.put(request, responseClone);
          }
          return undefined;
        });
        return response;
      }).catch(() => caches.match('/dashboard.html'));
    })
  );
});

self.addEventListener('push', (event) => {
  let payload = {
    title: 'TawjihiGuide',
    body: 'وصلت لك إشعارات جديدة من المنصة',
    url: '/notifications.html'
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    } catch (error) {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icon.svg',
      badge: '/icon.svg',
      dir: 'rtl',
      data: { url: payload.url || '/notifications.html' }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/notifications.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
      return undefined;
    })
  );
});
