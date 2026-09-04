// MBI Signal Logger field service worker v6.4.4 — network-only, clears legacy caches.
const CACHE_PREFIX='mbi-';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key.toLowerCase().startsWith(CACHE_PREFIX)).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});
self.addEventListener('fetch',event=>{
  if(event.request.method==='GET') event.respondWith(fetch(event.request));
});
