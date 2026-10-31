// Service worker: keeps the app's files on the phone so it opens with no signal.
// Bump the version in CACHE whenever you change any file, or phones keep the old copy.

const PREFIX = "day-unto-day-";
const CACHE = `${PREFIX}v1`;
const FILES = [
  "./",
  "index.html",
  "style.css",
  "manifest.webmanifest",
  "icon-192.png",
  "icon-512.png",
  "badge-96.png",
  "js/main.js",
];

// Save every file up front. If one is missing the install fails and the previous version keeps working.
// cache: 'reload' skips the browser's HTTP cache (GitHub Pages allows reuse for 10 minutes),
// so a new version always stores the files as they are on the server right now.
// skipWaiting means a new version takes over straight away, so it shows the next time the app opens.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(FILES.map((file) => new Request(file, { cache: "reload" }))))
      .then(() => self.skipWaiting()),
  );
});

// All your apps share mrtwumgh.github.io, so they also share one list of caches.
// Only remove this app's old versions, never another app's.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => keys.filter((k) => k.startsWith(PREFIX) && k !== CACHE))
      .then((old) => Promise.all(old.map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Use the saved copy if there is one, otherwise download the file and save it.
// Saving here is what repairs the app after another app's update has wiped this cache.
async function savedOrDownloaded(request) {
  const cache = await caches.open(CACHE);
  const saved = await cache.match(request);
  if (saved) return saved;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

// Only handle this app's own files. Anything else, like the Bible API, goes straight to the network.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (!event.request.url.startsWith(self.registration.scope)) return;
  event.respondWith(savedOrDownloaded(event.request));
});
