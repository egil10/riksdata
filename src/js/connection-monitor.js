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
     * Create connection quality indicator in footer
     */
    createQualityIndicator() {
        // Don't create if already exists
        if (document.getElementById('connection-indicator')) return;
        
        const indicator = document.createElement('div');
        indicator.id = 'connection-indicator';
        indicator.className = 'connection-indicator footer-connection';
        indicator.innerHTML = `
            <div class="connection-icon">
                <i data-lucide="wifi-high" class="connection-icon-lucide"></i>
            </div>
            <div class="connection-status">
                <span class="connection-text">Good connection</span>
                <div class="connection-bars">
                    <div class="bar"></div>
                    <div class="bar"></div>
                    <div class="bar"></div>
                    <div class="bar"></div>
                </div>
            </div>
        `;
        
        // Add to footer under mood rating section
        const moodSection = document.querySelector('footer .footer-section:has(.mood-rating)');
        if (moodSection) {
            // Add connection indicator directly to mood section
            moodSection.appendChild(indicator);
        } else {
            // Fallback: find any footer section and add it
            const footer = document.querySelector('footer .footer-content');
            if (footer) {
                footer.appendChild(indicator);
            }
        }
        
        // Add CSS styles
        this.addConnectionIndicatorStyles();
        
        console.log('📶 Connection indicator added to footer');
    }
    
    /**
     * Add CSS styles for connection indicator
     */
    addConnectionIndicatorStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Footer connection indicator styles */
            .connection-indicator.footer-connection {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem;
                background: var(--glass-bg);
                border-radius: 8px;
                font-size: 0.8rem;
                opacity: 0.9;
                transition: all 0.3s ease;
                border: 1px solid var(--border);
                margin-top: 0.75rem;
            }
            
            .connection-indicator.footer-connection:hover {
                opacity: 1;
                background: var(--bg-elev);
            }
            
            .connection-icon {
                display: flex;
                align-items: center;
            }
            
            .connection-icon-lucide {
                width: 16px;
                height: 16px;
                color: var(--text-muted);
                transition: color 0.3s ease;
            }
            
            .connection-status {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                flex: 1;
            }
            
            .connection-text {
                font-size: 0.75rem;
                color: var(--text-muted);
                font-weight: 500;
            }
            
            .connection-bars {
                display: flex;
                gap: 2px;
                align-items: end;
            }
            
            .connection-bars .bar {
                width: 3px;
                background: var(--text-muted);
                border-radius: 2px;
                transition: all 0.3s ease;
            }
            
            .connection-bars .bar:nth-child(1) { height: 6px; }
            .connection-bars .bar:nth-child(2) { height: 8px; }
            .connection-bars .bar:nth-child(3) { height: 10px; }
            .connection-bars .bar:nth-child(4) { height: 12px; }
            
            /* Quality-specific styles */
            .connection-indicator.quality-good .connection-text {
                color: var(--success);
            }
            
            .connection-indicator.quality-good .connection-icon-lucide {
                color: var(--success);
            }
            
            .connection-indicator.quality-good .bar {
                background: var(--success);
            }
            
            .connection-indicator.quality-medium .connection-text {
                color: var(--warning);
            }
            
            .connection-indicator.quality-medium .connection-icon-lucide {
                color: var(--warning);
            }
            
            .connection-indicator.quality-medium .bar {
                background: var(--warning);
            }
            
            .connection-indicator.quality-medium .bar:nth-child(3),
            .connection-indicator.quality-medium .bar:nth-child(4) {
                opacity: 0.4;
            }
            
            .connection-indicator.quality-slow .connection-text {
                color: var(--error);
            }
            
            .connection-indicator.quality-slow .connection-icon-lucide {
                color: var(--error);
            }
            
            .connection-indicator.quality-slow .bar {
                background: var(--error);
            }
            
            .connection-indicator.quality-slow .bar:nth-child(2),
            .connection-indicator.quality-slow .bar:nth-child(3),
            .connection-indicator.quality-slow .bar:nth-child(4) {
                opacity: 0.3;
            }
            
            .connection-indicator.quality-offline .connection-text {
                color: var(--error);
            }
            
            .connection-indicator.quality-offline .connection-icon-lucide {
                color: var(--error);
            }
            
            .connection-indicator.quality-offline .bar {
                background: var(--error);
                opacity: 0.3;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Update connection quality indicator
     */
    updateQualityIndicator() {
        const indicator = document.getElementById('connection-indicator');
        if (!indicator) return;
        
        const textElement = indicator.querySelector('.connection-text');
        const iconElement = indicator.querySelector('.connection-icon-lucide');
        
        // Update class for styling
        indicator.className = `connection-indicator footer-connection quality-${this.quality}`;
        
        // Update text and icon
        if (textElement && iconElement) {
            switch (this.quality) {
                case 'good':
                    textElement.textContent = 'Good connection';
                    iconElement.setAttribute('data-lucide', 'wifi-high');
                    break;
                case 'medium':
                    textElement.textContent = 'Medium connection';
                    iconElement.setAttribute('data-lucide', 'wifi');
                    break;
                case 'slow':
                    textElement.textContent = 'Slow connection';
                    iconElement.setAttribute('data-lucide', 'wifi-low');
                    break;
                case 'offline':
                    textElement.textContent = 'Offline';
                    iconElement.setAttribute('data-lucide', 'wifi-off');
                    break;
                default:
                    textElement.textContent = 'Unknown';
                    iconElement.setAttribute('data-lucide', 'help-circle');
                    break;
            }
            
            // Refresh Lucide icons if available
            if (window.lucide) {
                window.lucide.createIcons();
            }
        }
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
