/**
 * Connection Quality Monitor
 * Monitors connection quality and adapts loading behavior accordingly
 */

class ConnectionMonitor {
    constructor() {
        this.quality = 'unknown';
        this.isOnline = navigator.onLine;
        this.lastCheck = Date.now();
        this.qualityHistory = [];
        
        this.setupEventListeners();
        this.detectInitialQuality();
        this.createQualityIndicator();
    }
    
    /**
     * Setup event listeners for connection changes
     */
    setupEventListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.detectQuality();
            this.showConnectionStatus('online', 'Connection restored');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.quality = 'offline';
            this.showConnectionStatus('offline', 'Connection lost');
        });
        
        // Monitor connection changes if available
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', () => {
                this.detectQuality();
            });
        }
    }
    
    /**
     * Detect initial connection quality
     */
    detectInitialQuality() {
        this.detectQuality();
        console.log(`🌐 Initial connection quality: ${this.quality}`);
    }
    
    /**
     * Detect current connection quality
     */
    detectQuality() {
        if (!this.isOnline) {
            this.quality = 'offline';
            return;
        }
        
        if ('connection' in navigator) {
            const connection = navigator.connection;
            const effectiveType = connection.effectiveType;
            const downlink = connection.downlink;
            const rtt = connection.rtt;
            
            // Determine quality based on multiple factors
            if (effectiveType === 'slow-2g' || effectiveType === '2g') {
                this.quality = 'slow';
            } else if (effectiveType === '3g' || (downlink && downlink < 1.5)) {
                this.quality = 'medium';
            } else if (effectiveType === '4g' || (downlink && downlink >= 1.5)) {
                this.quality = 'good';
            } else {
                this.quality = 'unknown';
            }
            
            // Adjust based on RTT
            if (rtt && rtt > 500) {
                this.quality = 'slow';
            }
            
            console.log(`📶 Connection: ${effectiveType}, ${downlink}Mbps, ${rtt}ms RTT → Quality: ${this.quality}`);
        } else {
            // Fallback: assume good connection
            this.quality = 'good';
        }
        
        this.lastCheck = Date.now();
        this.qualityHistory.push({
            quality: this.quality,
            timestamp: this.lastCheck
        });
        
        // Keep only last 10 measurements
        if (this.qualityHistory.length > 10) {
            this.qualityHistory.shift();
        }
        
        this.updateQualityIndicator();
    }
    
    /**
     * Create connection quality indicator (DISABLED - too much visual clutter)
     */
    createQualityIndicator() {
        // Connection indicator disabled to keep header clean
        console.log('📶 Connection monitoring active (indicator hidden for clean UI)');
    }
    
    /**
     * Add CSS styles for connection indicator
     */
    addConnectionIndicatorStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .connection-indicator {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.25rem 0.5rem;
                background: var(--glass-bg);
                border-radius: 6px;
                font-size: 0.75rem;
                opacity: 0.8;
                transition: all 0.3s ease;
            }
            
            .connection-indicator:hover {
                opacity: 1;
            }
            
            .connection-icon {
                display: flex;
                align-items: center;
            }
            
            .connection-status {
                display: flex;
                align-items: center;
                gap: 0.25rem;
            }
            
            .connection-text {
                font-size: 0.7rem;
                color: var(--text-muted);
            }
            
            .connection-bars {
                display: flex;
                gap: 1px;
                align-items: end;
            }
            
            .connection-bars .bar {
                width: 2px;
                background: var(--text-muted);
                border-radius: 1px;
                transition: all 0.3s ease;
            }
            
            .connection-bars .bar:nth-child(1) { height: 4px; }
            .connection-bars .bar:nth-child(2) { height: 6px; }
            .connection-bars .bar:nth-child(3) { height: 8px; }
            .connection-bars .bar:nth-child(4) { height: 10px; }
            
            .connection-indicator.quality-good .connection-text {
                color: var(--success);
            }
            
            .connection-indicator.quality-good .bar {
                background: var(--success);
            }
            
            .connection-indicator.quality-medium .connection-text {
                color: var(--warning);
            }
            
            .connection-indicator.quality-medium .bar:nth-child(3),
            .connection-indicator.quality-medium .bar:nth-child(4) {
                opacity: 0.3;
            }
            
            .connection-indicator.quality-slow .connection-text {
                color: var(--error);
            }
            
            .connection-indicator.quality-slow .bar:nth-child(2),
            .connection-indicator.quality-slow .bar:nth-child(3),
            .connection-indicator.quality-slow .bar:nth-child(4) {
                opacity: 0.3;
            }
            
            .connection-indicator.quality-offline .connection-text {
                color: var(--error);
            }
            
            .connection-indicator.quality-offline .bar {
                opacity: 0.3;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Update connection quality indicator (DISABLED)
     */
    updateQualityIndicator() {
        // Connection indicator disabled - no visual update needed
        // Quality monitoring still works in background for adaptive loading
    }
    
    /**
     * Show connection status notification
     */
    showConnectionStatus(status, message) {
        // Create notification if it doesn't exist
        let notification = document.getElementById('connection-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'connection-notification';
            notification.className = 'connection-notification';
            document.body.appendChild(notification);
        }
        
        notification.textContent = message;
        notification.className = `connection-notification ${status}`;
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    /**
     * Get current connection quality
     */
    getQuality() {
        return {
            quality: this.quality,
            isOnline: this.isOnline,
            lastCheck: this.lastCheck,
            history: this.qualityHistory
        };
    }
    
    /**
     * Get recommended loading strategy based on connection quality
     */
    getLoadingStrategy() {
        switch (this.quality) {
            case 'slow':
                return {
                    batchSize: 3,
                    delay: 1000,
                    retries: 2,
                    preloadDistance: 400
                };
            case 'medium':
                return {
                    batchSize: 5,
                    delay: 500,
                    retries: 3,
                    preloadDistance: 600
                };
            case 'good':
                return {
                    batchSize: 8,
                    delay: 200,
                    retries: 3,
                    preloadDistance: 800
                };
            default:
                return {
                    batchSize: 5,
                    delay: 500,
                    retries: 3,
                    preloadDistance: 600
                };
        }
    }
}

// Create global instance
export const connectionMonitor = new ConnectionMonitor();

/**
 * Get connection-aware loading strategy
 */
export function getConnectionAwareStrategy() {
    return connectionMonitor.getLoadingStrategy();
}

/**
 * Get current connection quality
 */
export function getConnectionQuality() {
    return connectionMonitor.getQuality();
}
