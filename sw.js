// Offline support: the app shell and its libraries are cached so the app opens with no internet.
const V = "rebuilt-scout-v3";
const SHELL = ["./", "./index.html", "./config.js", "./manifest.webmanifest", "./icon.svg", "./icon-192.png", "./icon-512.png"];
const CDN = ["cdn.jsdelivr.net", "fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const firebaseLib = url.hostname === "www.gstatic.com" && url.pathname.startsWith("/firebasejs/");
  if (url.origin === location.origin) {
    // Network first so updates reach everyone, but give up after 3 s on bad venue Wi-Fi.
    e.respondWith((async () => {
      const cache = await caches.open(V);
      try {
        const res = await Promise.race([fetch(req), new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 3000))]);
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      } catch {
        return (await cache.match(req, { ignoreSearch: true }))
          || (req.mode === "navigate" ? await cache.match("./index.html") : undefined)
          || Response.error();
      }
    })());
  } else if (firebaseLib || CDN.includes(url.hostname)) {
    // Versioned libraries and fonts never change: cache first.
    e.respondWith(caches.open(V).then(async cache => {
      const hit = await cache.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok || res.type === "opaque") cache.put(req, res.clone());
      return res;
    }));
  }
  // Everything else (Firestore, The Blue Alliance) goes straight to the network.
});
