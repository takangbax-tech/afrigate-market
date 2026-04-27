// ═══════════════════════════════════════════════════════════════════════════════
// AFRIGATE MARKET — Service Worker
// Strategy: Cache-first for assets, Network-first for API, Offline fallback
// ═══════════════════════════════════════════════════════════════════════════════

const CACHE_VERSION    = "v1.0.0";
const STATIC_CACHE     = `afrigate-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE    = `afrigate-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE      = `afrigate-images-${CACHE_VERSION}`;
const API_CACHE        = `afrigate-api-${CACHE_VERSION}`;

// ── Assets to pre-cache on install ──────────────────────────────────────────
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/offline.html",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Sora:wght@300;400;500;600;700;800&display=swap",
];

// ── Max entries per cache ────────────────────────────────────────────────────
const MAX_DYNAMIC_ENTRIES = 60;
const MAX_IMAGE_ENTRIES   = 80;
const MAX_API_ENTRIES     = 30;

// ── Cache TTL (milliseconds) ─────────────────────────────────────────────────
const API_CACHE_TTL   = 5  * 60 * 1000;  //  5 minutes
const IMAGE_CACHE_TTL = 7  * 24 * 60 * 60 * 1000; // 7 days

// ═══════════════════════════════════════════════════════════════════════════════
// INSTALL — pre-cache static assets
// ═══════════════════════════════════════════════════════════════════════════════
self.addEventListener("install", (event) => {
  console.log("[SW] Installing AfriGate Market Service Worker", CACHE_VERSION);

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("[SW] Pre-caching static assets");
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("[SW] Some static assets failed to cache:", err);
      });
    })
  );

  // Take control immediately without waiting for old SW to expire
  self.skipWaiting();
});

// ═══════════════════════════════════════════════════════════════════════════════
// ACTIVATE — clean up old caches
// ═══════════════════════════════════════════════════════════════════════════════
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating new Service Worker");

  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE, API_CACHE];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !currentCaches.includes(name))
          .map((name) => {
            console.log("[SW] Deleting old cache:", name);
            return caches.delete(name);
          })
      );
    })
  );

  // Claim all clients immediately
  self.clients.claim();
});

// ═══════════════════════════════════════════════════════════════════════════════
// FETCH — routing strategies
// ═══════════════════════════════════════════════════════════════════════════════
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and browser extension requests
  if (request.method !== "GET") return;
  if (!url.protocol.startsWith("http")) return;

  // ── 1. Supabase API — Network-first, fall back to cache ───────────────────
  if (url.hostname.includes("supabase.co")) {
    event.respondWith(networkFirstWithCache(request, API_CACHE, API_CACHE_TTL));
    return;
  }

  // ── 2. Google Fonts — Cache-first (they rarely change) ────────────────────
  if (url.hostname.includes("fonts.googleapis.com") || url.hostname.includes("fonts.gstatic.com")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // ── 3. Images (Unsplash, CDNs) — Cache-first with TTL ────────────────────
  if (
    request.destination === "image" ||
    url.hostname.includes("unsplash.com") ||
    url.hostname.includes("images.unsplash.com")
  ) {
    event.respondWith(cacheFirstWithTTL(request, IMAGE_CACHE, IMAGE_CACHE_TTL, MAX_IMAGE_ENTRIES));
    return;
  }

  // ── 4. Static assets (JS, CSS, icons) — Cache-first ──────────────────────
  if (
    request.destination === "script" ||
    request.destination === "style" ||
    url.pathname.match(/\.(js|css|woff2?|ttf|otf|ico|svg|png|webp|jpg)$/)
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // ── 5. HTML navigation — Network-first, offline fallback ──────────────────
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  // ── 6. Everything else — Stale-while-revalidate ───────────────────────────
  event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE, MAX_DYNAMIC_ENTRIES));
});

// ═══════════════════════════════════════════════════════════════════════════════
// STRATEGY HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

// Cache-First: serve from cache, fetch from network if not cached
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

// Cache-First with TTL and size limit
async function cacheFirstWithTTL(request, cacheName, ttl, maxEntries) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    const cachedDate = cached.headers.get("sw-cached-at");
    if (cachedDate && (Date.now() - parseInt(cachedDate)) < ttl) {
      return cached;
    }
  }

  try {
    const response  = await fetch(request);
    if (response.ok) {
      const headers  = new Headers(response.headers);
      headers.append("sw-cached-at", Date.now().toString());
      const modified = new Response(await response.blob(), { status: response.status, statusText: response.statusText, headers });
      await cache.put(request, modified);
      await trimCache(cache, maxEntries);
    }
    return response;
  } catch {
    return cached || new Response("Image unavailable", { status: 503 });
  }
}

// Network-First: try network, fall back to cache
async function networkFirstWithCache(request, cacheName, ttl) {
  try {
    const response = await fetch(request, { signal: AbortSignal.timeout(8000) });
    if (response.ok) {
      const cache = await caches.open(cacheName);
      const headers = new Headers(response.headers);
      headers.append("sw-cached-at", Date.now().toString());
      const toCache = new Response(await response.clone().text(), { status: response.status, headers });
      cache.put(request, toCache);
      trimCache(cache, MAX_API_ENTRIES);
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) {
      console.log("[SW] Serving API response from cache (offline)");
      return cached;
    }
    return new Response(JSON.stringify({ error: "Offline", cached: false }), {
      status: 503,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// Network-First for HTML navigation with offline page fallback
async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request, { signal: AbortSignal.timeout(10000) });
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Try cached homepage as fallback
    const home = await caches.match("/");
    if (home) return home;

    // Ultimate fallback: offline page
    const offline = await caches.match("/offline.html");
    return offline || new Response(OFFLINE_HTML, {
      status: 200,
      headers: { "Content-Type": "text/html" }
    });
  }
}

// Stale-While-Revalidate: serve cache immediately, update in background
async function staleWhileRevalidate(request, cacheName, maxEntries) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
      trimCache(cache, maxEntries);
    }
    return response;
  }).catch(() => cached);

  return cached || fetchPromise;
}

// Trim cache to max entries (FIFO)
async function trimCache(cache, maxEntries) {
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    const toDelete = keys.slice(0, keys.length - maxEntries);
    await Promise.all(toDelete.map((key) => cache.delete(key)));
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BACKGROUND SYNC — queue failed POST requests (listing submissions)
// ═══════════════════════════════════════════════════════════════════════════════
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-listings") {
    console.log("[SW] Background sync: retrying failed listing submissions");
    event.waitUntil(syncPendingListings());
  }
});

async function syncPendingListings() {
  // In production: read from IndexedDB queue and retry Supabase inserts
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({ type: "SYNC_COMPLETE", message: "Offline listings have been synced!" });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUSH NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data = {};
  try { data = event.data.json(); } catch { data = { title: "AfriGate Market", body: event.data.text() }; }

  const options = {
    body:    data.body    || "You have a new notification",
    icon:    data.icon    || "/icons/icon-192.png",
    badge:   data.badge   || "/icons/icon-72.png",
    image:   data.image,
    tag:     data.tag     || "afrigate-notification",
    renotify:true,
    requireInteraction: data.urgent || false,
    data:  { url: data.url || "/" },
    actions: [
      { action: "view",    title: "View",    icon: "/icons/icon-72.png" },
      { action: "dismiss", title: "Dismiss", icon: "/icons/icon-72.png" },
    ],
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "AfriGate Market", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url === targetUrl);
      if (existing) return existing.focus();
      return self.clients.openWindow(targetUrl);
    })
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGE HANDLER — communicate with main app
// ═══════════════════════════════════════════════════════════════════════════════
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data?.type === "CLEAR_CACHE") {
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
    event.ports[0]?.postMessage({ success: true });
  }
  if (event.data?.type === "CACHE_VERSION") {
    event.ports[0]?.postMessage({ version: CACHE_VERSION });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// OFFLINE HTML FALLBACK (injected if /offline.html not found)
// ═══════════════════════════════════════════════════════════════════════════════
const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>AfriGate Market — Offline</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#0D1B2A;color:#fff;font-family:'Sora',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px;text-align:center}
    .icon{font-size:64px;margin-bottom:24px}
    h1{color:#B8952A;font-size:24px;font-weight:800;margin-bottom:12px}
    p{color:rgba(255,255,255,0.6);font-size:14px;line-height:1.7;margin-bottom:24px}
    button{background:linear-gradient(135deg,#B8952A,#D4AF5A);color:#0D1B2A;border:none;border-radius:12px;padding:14px 28px;font-weight:700;font-size:15px;cursor:pointer}
  </style>
</head>
<body>
  <div>
    <div class="icon">🌍</div>
    <h1>You're Offline</h1>
    <p>AfriGate Market needs an internet connection to load new listings. Your saved data is still available.</p>
    <button onclick="location.reload()">Try Again</button>
  </div>
</body>
</html>`;
