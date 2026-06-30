/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'siska-v1';
const RUNTIME_CACHE = 'siska-runtime-v1';

// Resource yang di-precache saat service worker di-install
const PRECACHE_URLS = [
  '/',
  '/index.html',
];

// Install event: precache resource statis
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event: hapus cache lama
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return cacheNames.filter(
          (cacheName) => !currentCaches.includes(cacheName)
        );
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => caches.delete(cacheToDelete))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event: strategi Network First dengan fallback ke cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests dan Chrome extensions
  if (
    event.request.method !== 'GET' ||
    !event.request.url.startsWith('http')
  ) {
    return;
  }

  // Untuk request API, gunakan Network First
  if (event.request.url.includes('/api/')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Untuk static assets (JS, CSS, fonts, images), gunakan Cache First
  if (
    event.request.destination === 'script' ||
    event.request.destination === 'style' ||
    event.request.destination === 'font' ||
    event.request.destination === 'image'
  ) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // Default: Network First untuk navigasi, Cache First untuk lainnya
  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request));
  } else {
    event.respondWith(cacheFirst(event.request));
  }
});

// Strategi Cache First: ambil dari cache dulu, fallback ke network
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return offline fallback untuk navigasi
    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }
    throw error;
  }
}

// Strategi Network First: ambil dari network dulu, fallback ke cache
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Fallback ke index.html untuk navigasi
    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }
    throw error;
  }
}