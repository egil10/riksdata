/**
 * Service Worker for Riksdata
 * Provides offline caching and improved performance
 */

const CACHE_NAME = 'riksdata-v1.0.0';
const STATIC_CACHE_NAME = 'riksdata-static-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/src/css/main.css',
    '/src/css/theme.css',
    '/src/js/main.js',
    '/src/js/charts.js',
    '/src/js/utils.js',
    '/src/js/config.js',
    '/src/js/chart-configs.js',
    '/src/js/drilldown.js',
    '/src/js/drilldown-configs.js',
    '/src/js/chart-theme.js',
    '/src/js/registry.js',
    '/src/js/icons.js',
    '/src/js/mood-rating.js',
    '/src/js/request-cache.js',
    '/src/js/progressive-loader.js',
    '/src/js/connection-monitor.js',
    '/src/assets/favicon2.ico'
];

// Data files to cache with longer TTL
const DATA_FILES = [
    '/data/static/political-timeline.json',
    '/data/static/nve-reservoir-fill.json',
    '/data/static/statnett-production-consumption.json',
    '/data/static/stortinget-women-representation.json'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('🔧 Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then(cache => {
                console.log('📦 Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('✅ Static assets cached');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ Failed to cache static assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('🚀 Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
                            console.log('🗑️ Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip external requests
    if (url.origin !== location.origin) {
        return;
    }
    
    event.respondWith(
        handleRequest(request)
    );
});

/**
 * Handle request with appropriate caching strategy
 */
async function handleRequest(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    try {
        // Strategy 1: Static assets - Cache First
        if (isStaticAsset(pathname)) {
            return await cacheFirst(request, STATIC_CACHE_NAME);
        }
        
        // Strategy 2: Data files - Stale While Revalidate
        if (isDataFile(pathname)) {
            return await staleWhileRevalidate(request, CACHE_NAME);
        }
        
        // Strategy 3: API/SSB requests - Network First with fallback
        if (isApiRequest(pathname)) {
            return await networkFirst(request, CACHE_NAME);
        }
        
        // Strategy 4: Everything else - Network First
        return await networkFirst(request, CACHE_NAME);
        
    } catch (error) {
        console.error('❌ Request failed:', request.url, error);
        
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            return await caches.match('/index.html');
        }
        
        throw error;
    }
}

/**
 * Cache First strategy - good for static assets
 */
async function cacheFirst(request, cacheName) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
        const cache = await caches.open(cacheName);
        cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
}

/**
 * Network First strategy - good for dynamic content
 */
async function networkFirst(request, cacheName) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

/**
 * Stale While Revalidate strategy - good for data files
 */
async function staleWhileRevalidate(request, cacheName) {
    const cachedResponse = await caches.match(request);
    
    const networkPromise = fetch(request).then(response => {
        if (response.ok) {
            const cache = caches.open(cacheName);
            cache.then(c => c.put(request, response.clone()));
        }
        return response;
    });
    
    return cachedResponse || networkPromise;
}

/**
 * Check if path is a static asset
 */
function isStaticAsset(pathname) {
    return pathname.startsWith('/src/') || 
           pathname === '/' || 
           pathname === '/index.html' ||
           pathname.endsWith('.ico') ||
           pathname.endsWith('.css') ||
           pathname.endsWith('.js');
}

/**
 * Check if path is a data file
 */
function isDataFile(pathname) {
    return pathname.startsWith('/data/static/') ||
           pathname.startsWith('/data/cached/');
}

/**
 * Check if path is an API request
 */
function isApiRequest(pathname) {
    return pathname.includes('ssb.no') ||
           pathname.includes('norges-bank.no') ||
           pathname.includes('api');
}

// Handle messages from main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_CACHE_STATS') {
        getCacheStats().then(stats => {
            event.ports[0].postMessage(stats);
        });
    }
});

/**
 * Get cache statistics
 */
async function getCacheStats() {
    const cacheNames = await caches.keys();
    const stats = {
        caches: {},
        totalSize: 0
    };
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        stats.caches[cacheName] = {
            count: keys.length,
            urls: keys.map(request => request.url)
        };
    }
    
    return stats;
}
