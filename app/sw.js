/* Club del Truco — service worker: la app abre rápido y funciona sin conexión.
   Cuando cambies archivos, subí el número de versión para renovar el caché. */
const CACHE = "club-truco-v2";
const FILES = ["./", "./index.html", "./styles.css?v=15", "./app.js?v=15", "./dieta-platos.js?v=15", "./noche-data.js?v=15", "./manifest.json", "./assets/logo.jpg", "./icons/icon-192.png", "./icons/icon-512.png", "./evolucion.html"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(f => c.add(f).catch(() => undefined)))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
const guardar = (req, res) => { if (res && res.ok) { const c = res.clone(); caches.open(CACHE).then(k => k.put(req, c)); } return res; };
const conTope = (req, ms) => Promise.race([fetch(req), new Promise((_, rej) => setTimeout(() => rej(new Error("tope")), ms))]);
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  // 1) La app en sí (index.html): red primero con tope de 3 s, si no, caché. Así llegan las versiones nuevas sin trabar el arranque.
  if (e.request.mode === "navigate") {
    e.respondWith(conTope(e.request, 3000).then(r => guardar(e.request, r)).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html"))));
    return;
  }
  // 2) Páginas internas (días, materiales, dieta), fotos, css/js: caché primero y se refrescan en segundo plano.
  e.respondWith(caches.match(e.request).then(cacheado => {
    const red = fetch(e.request).then(r => guardar(e.request, r)).catch(() => cacheado);
    return cacheado || red;
  }));
});
