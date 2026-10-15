// Offline support: the app shell and its libraries are cached so the app opens with no internet.
const V = "rebuilt-scout-v5";
const SHELL = ["./", "./index.html", "./config.js", "./manifest.webmanifest", "./icon.svg", "./icon-192.png", "./icon-512.png"];
const CDN = ["cdn.jsdelivr.net", "cdnjs.cloudflare.com", "fonts.googleapis.com", "fonts.gstatic.com"];
// Libraries the app loads later (QR codes, team sync). Saved at install so they work with no signal.
const LIBS = [
  "https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js",
  "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js",
  "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js",
  ...["app", "auth", "firestore"].map(m => `https://www.gstatic.com/firebasejs/10.12.2/firebase-${m}-compat.js`)
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(async c => {
    await c.addAll(SHELL);
    await Promise.all(LIBS.map(u => fetch(u, { mode: "no-cors" }).then(r => c.put(u, r)).catch(() => {})));
  }).then(() => self.skipWaiting()));
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
