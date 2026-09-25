// sw.js - Service Worker Killer & Cache Purge for tedallaly.com
// Purpose: Automatically unregister any legacy service worker and clear all stale caches.

self.addEventListener('install', (event) => {
  // Immediately activate the new service worker without waiting
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // 1. Delete all existing caches (offline page, old assets, stale HTML)
      try {
        const cacheKeys = await caches.keys();
        await Promise.all(
          cacheKeys.map((key) => {
            console.log('[SW Purge] Deleting stale cache:', key);
            return caches.delete(key);
          })
        );
      } catch (err) {
        console.error('[SW Purge] Error deleting caches:', err);
      }

      // 2. Unregister this and all service workers for this registration
      try {
        await self.registration.unregister();
        console.log('[SW Purge] Service worker successfully unregistered');
      } catch (err) {
        console.error('[SW Purge] Error unregistering service worker:', err);
      }

      // 3. Take control of all open client tabs and force reload them once
      try {
        const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        for (const client of clientsList) {
          client.navigate(client.url);
        }
      } catch (err) {
        console.error('[SW Purge] Error reloading clients:', err);
      }
    })()
  );
});

// Pass-through fetch handler in case requests pass through before termination
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
