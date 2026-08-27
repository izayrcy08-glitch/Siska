/* eslint-disable no-restricted-globals */

// Bump versi ini setiap kali asset PWA (ikon/manifest) berubah
const CACHE_NAME = 'siska-v3';
const RUNTIME_CACHE = 'siska-runtime-v3';
const isLocalhost =
  self.location.hostname === 'localhost' ||
  self.location.hostname === '127.0.0.1';

const PRECACHE_URLS = ['/', '/index.html'];

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

function isAppScriptOrStyle(url) {
  try {
    const path = new URL(url).pathname;
    return path.startsWith('/static/js/') || path.startsWith('/static/css/');
  } catch {
    return false;
  }
}

self.addEventListener('install', (event) => {
  if (isLocalhost) {
    event.waitUntil(self.skipWaiting());
    return;
  }
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      // Di localhost: hapus SEMUA cache. Di production: hapus cache versi lama saja.
      const toDelete = isLocalhost
        ? keys
        : keys.filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE);
      await Promise.all(toDelete.map((name) => caches.delete(name)));

      if (isLocalhost) {
        await self.registration.unregister();
      }

      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  // Jangan intersep apa pun di localhost — biarkan network murni
  if (isLocalhost) return;

  if (
    event.request.method !== 'GET' ||
    !event.request.url.startsWith('http')
  ) {
    return;
  }

  if (isIconOrManifest(event.request.url)) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (event.request.url.includes('/api/')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // JS/CSS app: network-first agar update tidak tertahan cache lama
  if (
    isAppScriptOrStyle(event.request.url) ||
    event.request.destination === 'script' ||
    event.request.destination === 'style'
  ) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (
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
