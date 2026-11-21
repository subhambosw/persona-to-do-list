const CACHE_NAME = 'take-your-time-offline-v2';

self.addEventListener('install', (event) => {
  const scope = self.registration.scope;
  const relativeAssets = [
    scope,
    `${scope}index.html`,
    `${scope}manifest.json`,
    `${scope}p5b.jpg`,
    `${scope}hat.png`,
    `${scope}joker.png`,
    `${scope}tytpfp.png`,
    `${scope}godzilla_roar.mp3`,
    `${scope}godzilla_totm_run1.png`,
    `${scope}godzilla_totm_run2.png`,
    `${scope}godzilla_totm_jump.png`,
    `${scope}godzilla_totm_duck.png`,
    `${scope}godzilla_totm_fire.png`,
    `${scope}totm_spikes.png`,
    `${scope}totm_tank.png`,
    `${scope}totm_bat1.png`,
    `${scope}totm_bat2.png`,
    `${scope}totm_dot.png`,
    `${scope}redCross.png`,
    `${scope}sun.png`,
    `${scope}moon.png`,
    `${scope}arrowLeft.png`,
    `${scope}arrowRight.png`,
    `${scope}tracker.png`,
    `${scope}tyt2.png`,
    `${scope}cursor.cur`,
    `${scope}k32.cur`,
    `${scope}bondoni.ttf`,
    `${scope}helveticanowdisplay-black.ttf`,
    `${scope}Times New Roman Bold.ttf`,
    `${scope}fonts/BebasNeue-Regular.ttf`,
    `${scope}fonts/LuckiestGuy-Regular.ttf`
  ];

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(relativeAssets).catch((err) => {
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
        if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
          return caches.match(self.registration.scope);
        }
      });
    })
  );
});

// Listen for background reminder push/message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_REMINDER_NOTIFICATION') {
    const { title, body } = event.data;
    const scope = self.registration.scope;
    self.registration.showNotification(title || 'TAKE YOUR TIME // MISSION CALLING CARD', {
      body: body || 'The deadline has arrived! Prepare for infiltration.',
      icon: `${scope}hat.png`,
      badge: `${scope}hat.png`,
      vibrate: [200, 100, 200, 100, 400],
      tag: 'persona-calling-card-reminder',
      requireInteraction: true,
      data: { url: scope }
    });
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || self.registration.scope;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
