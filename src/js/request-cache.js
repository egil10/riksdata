/**
 * Request Cache and Retry System
 * Provides robust data fetching with caching, retry logic, and connection quality detection
 */

class RequestCache {
    constructor() {
        this.cache = new Map();
        this.pendingRequests = new Map();
        this.retryAttempts = new Map();
        this.maxRetries = 3;
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.connectionQuality = 'good'; // good, slow, offline
        
        // Detect connection quality
        this.detectConnectionQuality();
        
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.connectionQuality = 'good';
            console.log('🌐 Connection restored');
        });
        
        window.addEventListener('offline', () => {
            this.connectionQuality = 'offline';
            console.log('📴 Connection lost');
        });
    }
    
    /**
     * Detect connection quality based on navigator.connection if available
     */
    detectConnectionQuality() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            const effectiveType = connection.effectiveType;
            
            if (effectiveType === 'slow-2g' || effectiveType === '2g') {
                this.connectionQuality = 'slow';
            } else if (effectiveType === '3g' || effectiveType === '4g') {
                this.connectionQuality = 'good';
            }
            
            console.log(`📶 Connection quality: ${this.connectionQuality} (${effectiveType})`);
        }
    }
    
    /**
     * Fetch data with caching, retry logic, and connection awareness
     */
    async fetchWithCache(url, options = {}) {
        const cacheKey = this.getCacheKey(url, options);
        
        // Check cache first
        const cached = this.getCached(cacheKey);
        if (cached) {
            console.log(`📦 Cache hit: ${url}`);
            return cached;
        }
        
        // Check if request is already pending
        if (this.pendingRequests.has(cacheKey)) {
            console.log(`⏳ Waiting for pending request: ${url}`);
            return await this.pendingRequests.get(cacheKey);
        }
        
        // Create new request promise
        const requestPromise = this.executeRequest(url, options, cacheKey);
        this.pendingRequests.set(cacheKey, requestPromise);
        
        try {
            const result = await requestPromise;
            return result;
        } finally {
            this.pendingRequests.delete(cacheKey);
        }
    }
    
    /**
     * Execute request with retry logic
     */
    async executeRequest(url, options, cacheKey) {
        let lastError;
        
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                console.log(`🌐 Fetching ${url} (attempt ${attempt}/${this.maxRetries})`);
                
                // Adjust timeout based on connection quality
                const timeout = this.getTimeoutForConnection();
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);
                
                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal,
                    cache: 'no-cache', // Always fetch fresh data
                    headers: {
                        'Cache-Control': 'no-cache',
                        ...options.headers
                    }
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                // Cache successful response
                this.setCached(cacheKey, data);
                
                // Reset retry attempts on success
                this.retryAttempts.delete(cacheKey);
                
                console.log(`✅ Successfully loaded: ${url}`);
                return data;
                
            } catch (error) {
                lastError = error;
                console.warn(`❌ Attempt ${attempt} failed for ${url}:`, error.message);
                
                // Don't retry on certain errors
                if (this.shouldNotRetry(error)) {
                    break;
                }
                
                // Wait before retry (exponential backoff)
                if (attempt < this.maxRetries) {
                    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                    console.log(`⏳ Retrying in ${delay}ms...`);
                    await this.sleep(delay);
                }
            }
        }
        
        // All retries failed
        this.retryAttempts.set(cacheKey, this.maxRetries);
        throw new Error(`Failed to load ${url} after ${this.maxRetries} attempts: ${lastError.message}`);
    }
    
    /**
     * Get timeout based on connection quality
     */
    getTimeoutForConnection() {
        switch (this.connectionQuality) {
            case 'slow':
                return 15000; // 15 seconds
            case 'offline':
                return 5000;  // 5 seconds (quick fail)
            default:
                return 10000; // 10 seconds
        }
    }
    
    /**
     * Determine if we should not retry on certain errors
     */
    shouldNotRetry(error) {
        // Don't retry on 404, 403, or network aborts
        if (error.name === 'AbortError') return true;
        if (error.message.includes('404')) return true;
        if (error.message.includes('403')) return true;
        return false;
    }
    
    /**
     * Get cache key for URL and options
     */
    getCacheKey(url, options) {
        return `${url}_${JSON.stringify(options)}`;
    }
    
    /**
     * Get cached data if valid
     */
    getCached(cacheKey) {
        const cached = this.cache.get(cacheKey);
        if (!cached) return null;
        
        const now = Date.now();
        if (now - cached.timestamp > this.cacheTimeout) {
            this.cache.delete(cacheKey);
            return null;
        }
        
        return cached.data;
    }
    
    /**
     * Set cached data
     */
    setCached(cacheKey, data) {
        this.cache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });
    }
    
    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🧹 Cache cleared');
    }
    
    /**
     * Get cache statistics
     */
    getCacheStats() {
        const now = Date.now();
        let validEntries = 0;
        let expiredEntries = 0;
        
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > this.cacheTimeout) {
                expiredEntries++;
            } else {
                validEntries++;
            }
        }
        
        return {
            total: this.cache.size,
            valid: validEntries,
            expired: expiredEntries,
            pendingRequests: this.pendingRequests.size,
            connectionQuality: this.connectionQuality
        };
    }
    
    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Create global instance
export const requestCache = new RequestCache();

/**
 * Enhanced fetch function with caching and retry logic
 */
export async function fetchWithRetry(url, options = {}) {
    return await requestCache.fetchWithCache(url, options);
}

/**
 * Get connection quality info
 */
export function getConnectionInfo() {
    return {
        quality: requestCache.connectionQuality,
        online: navigator.onLine,
        stats: requestCache.getCacheStats()
    };
}
