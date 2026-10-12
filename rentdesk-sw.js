// RentDesk service worker — lets the app install to the home screen.
// The app page is always fetched fresh from the network first (so every phone gets the latest
// version straight away); the cached copy is used only when there's no internet.
// Data (Firebase) is never cached here — it always goes straight to the server.
const CACHE='rentdesk-shell-v2';
const SHELL=['./','./rentdesk-manifest.json','./rentdesk-icon-192.png','./rentdesk-icon-512.png','./rentdesk-icon-180.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).catch(()=>{})); self.skipWaiting(); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch',e=>{
  const req=e.request, url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==self.location.origin) return;            // Firebase, fonts, CDNs: untouched
  if(req.mode==='navigate'||req.destination==='document'){
    e.respondWith(fetch(req).then(r=>{ const copy=r.clone(); caches.open(CACHE).then(c=>c.put('./',copy)); return r; })
      .catch(()=>caches.match('./').then(r=>r||caches.match(req))));
    return;
  }
  e.respondWith(caches.match(req).then(r=>r||fetch(req)));
});
