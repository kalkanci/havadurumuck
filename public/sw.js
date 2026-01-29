
// Service Worker v2 - Offline First with Caching Strategies
const CACHE_VERSION = 'v2';
const CACHE_NAME = `atmosfer-ai-${CACHE_VERSION}`;
const RUNTIME_CACHE = `atmosfer-runtime-${CACHE_VERSION}`;
const API_CACHE = `atmosfer-api-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

const API_URLS = [
  'https://api.open-meteo.com',
  'https://air-quality-api.open-meteo.com',
  'https://nominatim.openstreetmap.org',
  'https://date.nager.at'
];

// Install Event - Cache Static Assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch(err => console.error('[SW] Install error:', err))
  );
});

// Activate Event - Clean Up Old Caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheName.includes(CACHE_VERSION)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Multi-Strategy Caching
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Strategy 1: Cache First for Static Assets (HTML, CSS, JS)
  if (url.pathname.match(/\.(js|css|woff2|png|jpg|jpeg|svg|ico)$/)) {
    event.respondWith(
      caches.match(request)
        .then(response => response || fetch(request)
          .then(response => {
            if (!response || response.status !== 200) return response;
            const cloned = response.clone();
            caches.open(RUNTIME_CACHE).then(cache => cache.put(request, cloned));
            return response;
          })
        )
        .catch(() => new Response('Offline', { status: 503 }))
    );
    return;
  }

  // Strategy 2: Stale-While-Revalidate for API Calls
  if (url.hostname.match(/open-meteo|nominatim|nager/)) {
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {
          const fetchPromise = fetch(request)
            .then(response => {
              if (!response || response.status !== 200) return response;
              const cloned = response.clone();
              caches.open(API_CACHE).then(cache => cache.put(request, cloned));
              return response;
            })
            .catch(() => cachedResponse || new Response('API Offline', { status: 503 }));

          return cachedResponse || fetchPromise;
        })
        .catch(() => new Response('Network Error', { status: 503 }))
    );
    return;
  }

  // Strategy 3: Network First for HTML (index)
  if (request.mode === 'navigate' || url.pathname === '/') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (!response || response.status !== 200) return response;
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, cloned));
          return response;
        })
        .catch(() => 
          caches.match(request)
            .then(cached => cached || caches.match('/index.html'))
        )
    );
    return;
  }

  // Default: Network First
  event.respondWith(
    fetch(request)
      .then(response => {
        if (!response || response.status !== 200) return response;
        const cloned = response.clone();
        caches.open(RUNTIME_CACHE).then(cache => cache.put(request, cloned));
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Background Sync (Optional - for future features)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-weather') {
    event.waitUntil(
      fetch('/api/refresh-weather')
        .then(response => console.log('[SW] Weather synced:', response.status))
        .catch(err => console.error('[SW] Sync failed:', err))
    );
  }
});

// Push Notifications (Optional - for weather alerts)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'Yeni hava durumu güncellemesi',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'weather-alert',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification('Atmosfer AI', options)
  );
});
