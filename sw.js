// BTC Lookup — offline shell.
//
// Keeps a copy of the app on the device so it starts even when the network is
// slow or unreachable. Only the page itself is cached: Bitcoin data is
// cross-origin (mempool.space / CoinGecko) and always goes straight to the
// network, so figures are never served stale.
//
// Strategy for the page: network-first with a short timeout. A healthy
// connection gets the freshest deploy; a struggling one falls back to the
// cached copy after NET_TIMEOUT instead of hanging. The cache is refreshed in
// the background either way.

const CACHE = 'btc-lookup-v1';
const SHELL = './index.html';
const NET_TIMEOUT = 2500;

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(['./', SHELL])).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;  // live BTC data
  if (req.mode !== 'navigate') return;                           // only the page itself

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);

    const network = fetch(req)
      .then((res) => { if (res && res.ok) cache.put(SHELL, res.clone()); return res; })
      .catch(() => null);

    const cached = await cache.match(SHELL);
    if (!cached) {
      return (await network) || new Response(
        'Offline — reconnect and reload.',
        { status: 503, headers: { 'content-type': 'text/plain' } }
      );
    }

    // cache is available: give the network a brief head start, then stop waiting
    const winner = await Promise.race([
      network,
      new Promise((resolve) => setTimeout(() => resolve(null), NET_TIMEOUT))
    ]);
    event.waitUntil(network);          // let the refresh finish even if we served cache
    return (winner && winner.ok) ? winner : cached;
  })());
});
