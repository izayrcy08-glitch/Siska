/* eslint-disable no-restricted-globals */

// Bump versi ini setiap kali asset PWA (ikon/manifest) berubah
const CACHE_NAME = 'siska-v2';
const RUNTIME_CACHE = 'siska-runtime-v2';

// Resource yang di-precache saat service worker di-install
const PRECACHE_URLS = [
  '/',
  '/index.html',
];

function isIconOrManifest(url) {
  try {
    const path = new URL(url).pathname;
    return (
      path.startsWith('/icons/') ||
      path === '/manifest.json' ||
      path === '/favicon.ico' ||
      path.startsWith('/favicon')
    );
  } catch {
    return false;
  }
}

// Install event: precache resource statis
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event: hapus SEMUA cache lama (termasuk ikon lama di runtime cache)
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        cacheNames.filter((cacheName) => !currentCaches.includes(cacheName))
      )
      .then((cachesToDelete) =>
        Promise.all(cachesToDelete.map((cacheToDelete) => caches.delete(cacheToDelete)))
      )
      .then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  if (
    event.request.method !== 'GET' ||
    !event.request.url.startsWith('http')
  ) {
    return;
  }

  // Ikon & manifest: selalu coba network dulu agar logo PWA tidak macet di cache lama
  if (isIconOrManifest(event.request.url)) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (event.request.url.includes('/api/')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (
    event.request.destination === 'script' ||
    event.request.destination === 'style' ||
    event.request.destination === 'font' ||
    event.request.destination === 'image'
  ) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request));
  } else {
    event.respondWith(cacheFirst(event.request));
  }
});

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
    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }
    throw error;
  }
}

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
    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }
    throw error;
  }
}
