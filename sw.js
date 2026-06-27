const CACHE='cen-biblemaps-test-v1';
const ASSETS=['./','./index.html','./app.js','./manifest.json','./data/places-master.json','./data/map-master.json','./data/place-map-links-master.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
