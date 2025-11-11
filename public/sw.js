// public/sw.js

const CACHE_NAME = 'kritika-salon-v2.0.0';
const STATIC_CACHE = 'kritika-static-v2.0.0';
const DYNAMIC_CACHE = 'kritika-dynamic-v2.0.0';

// Core assets that are essential for the app to work
const CORE_ASSETS = [
  '/',
  '/manifest.json',
  '/offline',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
];

// Static assets that can be cached
const STATIC_ASSETS = [
  '/splash/iphone5_splash.png',
  '/splash/iphone6_splash.png',
  '/splash/iphoneplus_splash.png',
  '/splash/iphonex_splash.png',
  '/splash/iphonexr_splash.png',
  '/splash/iphonexsmax_splash.png',
  '/splash/ipad_splash.png',
  '/splash/ipadpro1_splash.png',
  '/splash/ipadpro2_splash.png',
  '/hair_services.json',
  '/makeup_services.json',
  '/nail_services.json',
  '/skin_services.json',
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching Core Assets');
        return cache.addAll([...CORE_ASSETS, ...STATIC_ASSETS]);
      })
      .then(() => {
        console.log('Service Worker: Install Completed');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE && cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache', cache);
            return caches.delete(cache);
          }
        })
      );
    })
    .then(() => {
      console.log('Service Worker: Activate Completed');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and chrome-extension requests
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Skip analytics and tracking requests
  if (event.request.url.includes('google-analytics') || 
      event.request.url.includes('googletagmanager') ||
      event.request.url.includes('facebook.com/tr')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise, fetch from network
        return fetch(event.request)
          .then((fetchResponse) => {
            // Check if we received a valid response
            if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
              return fetchResponse;
            }

            // Clone the response
            const responseToCache = fetchResponse.clone();

            // Cache the fetched response
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                // Only cache same-origin requests
                if (event.request.url.startsWith(self.location.origin)) {
                  cache.put(event.request, responseToCache);
                }
              });

            return fetchResponse;
          })
          .catch((error) => {
            console.log('Fetch failed; returning offline page instead.', error);
            
            // If it's a navigation request, return offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/offline');
            }

            // For API requests, return a fallback response
            if (event.request.url.includes('/api/')) {
              return new Response(
                JSON.stringify({ 
                  error: 'You are offline', 
                  message: 'Please check your internet connection' 
                }),
                { 
                  status: 503,
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            }

            // For images, return a placeholder
            if (event.request.destination === 'image') {
              return caches.match('/icons/icon-192x192.png');
            }

            // For other requests, return a generic offline response
            return new Response('You are offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'New update from Kritika Salon',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    image: data.image || '/icons/icon-512x512.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: [
      {
        action: 'view',
        title: 'View'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Kritika Salon', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
    );
  }
});

// Background sync implementation
async function doBackgroundSync() {
  try {
    // Get all pending requests from IndexedDB or cache
    const pendingRequests = await getPendingRequests();
    
    for (const request of pendingRequests) {
      try {
        const response = await fetch(request.url, request.options);
        if (response.ok) {
          await removePendingRequest(request.id);
          console.log('Background sync: Successfully synced request', request.id);
        }
      } catch (error) {
        console.error('Background sync: Failed to sync request', request.id, error);
      }
    }
  } catch (error) {
    console.error('Background sync error:', error);
  }
}

// Helper functions for background sync
async function getPendingRequests() {
  // In a real implementation, you'd use IndexedDB
  // This is a simplified version
  return [];
}

async function removePendingRequest(id) {
  // Remove from IndexedDB
  console.log('Removing pending request:', id);
}

// Periodic background sync for updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-update') {
    event.waitUntil(updateContent());
  }
});

// Update content in background
async function updateContent() {
  try {
    // Update service data
    const cache = await caches.open(DYNAMIC_CACHE);
    
    // Update JSON data files
    const jsonFiles = [
      '/hair_services.json',
      '/makeup_services.json',
      '/nail_services.json',
      '/skin_services.json'
    ];

    for (const file of jsonFiles) {
      try {
        const response = await fetch(file);
        if (response.ok) {
          await cache.put(file, response);
          console.log('Periodic sync: Updated', file);
        }
      } catch (error) {
        console.error('Periodic sync: Failed to update', file, error);
      }
    }
  } catch (error) {
    console.error('Periodic sync error:', error);
  }
}

// Message handler for communication with client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(STATIC_CACHE)
        .then((cache) => {
          return cache.addAll(event.data.urls);
        })
        .then(() => {
          event.ports[0].postMessage({ success: true });
        })
        .catch((error) => {
          event.ports[0].postMessage({ success: false, error: error.message });
        })
    );
  }
});

// Precache strategy for new assets
// async function precacheNewAssets() {
//   try {
//     const cache = await caches.open(STATIC_CACHE);
//     const allAssets = [...CORE_ASSETS, ...STATIC_ASSETS];
    
//     for (const asset of allAssets) {
//       try {
//         await cache.add(asset);
//       } catch (error) {
//         console.warn('Failed to cache asset:', asset, error);
//       }
//     }
//   } catch (error) {
//     console.error('Precaching error:', error);
//   }
// }

// Cache cleanup for dynamic cache
// async function cleanupOldCache() {
//   try {
//     const cache = await caches.open(DYNAMIC_CACHE);
//     const keys = await cache.keys();
//     const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

//     for (const request of keys) {
//       const response = await cache.match(request);
//       if (response) {
//         const date = response.headers.get('date');
//         if (date && new Date(date).getTime() < weekAgo) {
//           await cache.delete(request);
//         }
//       }
//     }
//   } catch (error) {
//     console.error('Cache cleanup error:', error);
//   }
// }

console.log('Service Worker: Loaded successfully');