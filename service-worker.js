const CACHE_VERSION = 'healthylife-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const HTML_CACHE = `${CACHE_VERSION}-html`;
const OFFLINE_URL = './index.html';

const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './logo.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const staticCache = await caches.open(STATIC_CACHE);
    await staticCache.addAll(STATIC_ASSETS);
    const htmlCache = await caches.open(HTML_CACHE);
    await htmlCache.add(OFFLINE_URL);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => ![STATIC_CACHE, HTML_CACHE].includes(key))
        .map((key) => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(HTML_CACHE);
  const cached = await cache.match(request);
  const networkFetch = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    return cached;
  }

  const network = await networkFetch;
  if (network) return network;

  return cache.match(OFFLINE_URL) || Response.error();
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  if (!isSameOrigin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(staleWhileRevalidate(new Request(OFFLINE_URL)));
    return;
  }

  if (url.pathname.endsWith('/index.html')) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  event.respondWith(
    cacheFirst(event.request).catch(async () => {
      const htmlCache = await caches.open(HTML_CACHE);
      return htmlCache.match(OFFLINE_URL) || Response.error();
    })
  );
});
