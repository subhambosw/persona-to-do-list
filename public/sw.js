const CACHE_NAME = 'take-your-time-offline-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/p5b.jpg',
  '/hat.png',
  '/joker.png',
  '/tytpfp.png',
  '/godzilla_roar.mp3',
  '/redCross.png',
  '/save.png',
  '/sun.png',
  '/moon.png',
  '/arrowLeft.png',
  '/arrowRight.png',
  '/tracker.png',
  '/tyt2.png',
  '/cursor.cur',
  '/k32.cur',
  '/bondoni.ttf',
  '/helveticanowdisplay-black.ttf',
  '/Times New Roman Bold.ttf',
  '/fonts/BebasNeue-Regular.ttf',
  '/fonts/LuckiestGuy-Regular.ttf'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Some assets could not be precached during install:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests for our app
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // If offline and request is HTML, return cached root/index.html
        if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/');
        }
      });
    })
  );
});

// Listen for background reminder push/message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_REMINDER_NOTIFICATION') {
    const { title, body } = event.data;
    self.registration.showNotification(title || 'TAKE YOUR TIME // MISSION CALLING CARD', {
      body: body || 'The deadline has arrived! Prepare for infiltration.',
      icon: '/hat.png',
      badge: '/hat.png',
      vibrate: [200, 100, 200, 100, 400],
      tag: 'persona-calling-card-reminder',
      requireInteraction: true,
      data: { url: '/' }
    });
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
