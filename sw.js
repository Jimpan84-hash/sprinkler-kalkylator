

const CACHE_NAME = 'sprinkler-quote-cache-v5'; // Bump version for clean install
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './index.js',
  './manifest.json',
  './icon.svg',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://esm.sh/react@18.3.1',
  'https://esm.sh/react-dom@18.3.1/client',
  'https://esm.sh/jspdf@2.5.1',
  'https://esm.sh/jspdf-autotable@3.8.2'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Use addAll with a catch block to prevent installation failure if one asset fails
        return cache.addAll(ASSETS_TO_CACHE).catch(err => {
            console.error('Failed to cache assets during install:', err);
        });
      })
  );
});

self.addEventListener('fetch', (event) => {
  // We only want to cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request because it's a stream and can only be consumed once.
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || (response.type !== 'basic' && !response.url.startsWith('https://'))) {
              return response;
            }

            // Clone the response because it's a stream and can only be consumed once.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(err => {
            console.error('Fetch failed; returning offline page instead.', err);
            // Optional: return a fallback offline page, e.g., caches.match('/offline.html');
        });
      }
    )
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});