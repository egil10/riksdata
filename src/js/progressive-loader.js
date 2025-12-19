/**
 * Progressive Loading System
 * Provides smooth, staged loading experience with better user feedback
 */

class ProgressiveLoader {
    constructor() {
        this.loadingStates = new Map();
        this.totalCharts = 0;
        this.loadedCharts = 0;
        this.failedCharts = 0;
        this.loadingCallbacks = [];
        this.isInitialLoad = true;

        this.setupProgressTracking();
    }

    /**
     * Setup progress tracking for the loading experience
     */
    setupProgressTracking() {
        // Track all chart cards
        const chartCards = document.querySelectorAll('.chart-card');
        this.totalCharts = chartCards.length;

        console.log(`📊 Progressive loader tracking ${this.totalCharts} charts`);

        // Update progress bar
        this.updateProgressBar();
    }

    /**
     * Register a chart for loading tracking
     */
    registerChart(chartId) {
        this.loadingStates.set(chartId, 'pending');
        this.updateProgressBar();
    }

    /**
     * Mark chart as loading
     */
    markLoading(chartId) {
        this.loadingStates.set(chartId, 'loading');
        this.updateProgressBar();
        this.updateChartState(chartId, 'loading');
    }

    /**
     * Mark chart as loaded successfully
     */
    markLoaded(chartId) {
        this.loadingStates.set(chartId, 'loaded');
        this.loadedCharts++;
        this.updateProgressBar();
        this.updateChartState(chartId, 'loaded');
        this.checkLoadingComplete();
    }

    /**
     * Mark chart as failed
     */
    markFailed(chartId, error) {
        this.loadingStates.set(chartId, 'failed');
        this.failedCharts++;
        this.updateProgressBar();
        this.updateChartState(chartId, 'failed', error);
        this.checkLoadingComplete();
    }

    /**
     * Update the progress bar
     */
    updateProgressBar() {
        const progressBar = document.getElementById('load-progress-bar');
        if (!progressBar) return;

        const total = this.totalCharts;
        const completed = this.loadedCharts + this.failedCharts;
        const percentage = total > 0 ? (completed / total) * 100 : 0;

        progressBar.style.width = `${percentage}%`;

        // Update loading status text with translation
        const statusElement = document.getElementById('loading-status');
        if (statusElement) {
            if (this.isInitialLoad) {
                // Import translation function dynamically
                import('./main.js').then(({ getLoadingMessage }) => {
                    let messageKey;
                    if (completed === 0) {
                        messageKey = 'Initializing charts...';
                    } else if (completed < total) {
                        const baseMessage = getLoadingMessage('Loading charts...');
                        statusElement.innerHTML = `${baseMessage} ${completed}/${total}<span class="loading-dots">...</span>`;
                        return;
                    } else {
                        messageKey = 'Finalizing...';
                    }

                    const message = getLoadingMessage(messageKey);
                    statusElement.innerHTML = message + '<span class="loading-dots">...</span>';
                }).catch(() => {
                    // Fallback to English if import fails
                    if (completed === 0) {
                        statusElement.textContent = 'Initializing charts...';
                    } else if (completed < total) {
                        statusElement.textContent = `Loading charts... ${completed}/${total}`;
                    } else {
                        statusElement.textContent = 'Finalizing...';
                    }
                });
            }
        }

        console.log(`📈 Progress: ${completed}/${total} (${percentage.toFixed(1)}%)`);
    }

    /**
     * Update individual chart loading state
     */
    updateChartState(chartId, state, error = null) {
        const chartCard = document.querySelector(`[data-chart-id="${chartId}"]`);
        if (!chartCard) return;

        const skeleton = chartCard.querySelector('.skeleton-chart');
        const canvas = chartCard.querySelector('canvas');

        switch (state) {
            case 'loading':
                if (skeleton) {
                    skeleton.style.display = 'block';
                    skeleton.classList.add('loading');
                }
                if (canvas) {
                    canvas.style.display = 'none';
                }
                break;

            case 'loaded':
                if (skeleton) {
                    skeleton.style.display = 'none';
                }
                if (canvas) {
                    canvas.style.display = 'block';
                    // Add smooth fade-in animation
                    canvas.style.opacity = '0';
                    canvas.style.transition = 'opacity 0.3s ease';
                    requestAnimationFrame(() => {
                        canvas.style.opacity = '1';
                    });
                }
                break;

            case 'failed':
                if (skeleton) {
                    skeleton.style.display = 'none';
                }
                // Chart card will be hidden by error handler
                console.warn(`Chart ${chartId} failed to load:`, error);
                break;
        }
    }

    /**
     * Check if all charts have finished loading (success or failure)
     */
    checkLoadingComplete() {
        const total = this.totalCharts;
        const completed = this.loadedCharts + this.failedCharts;

        if (completed >= total && this.isInitialLoad) {
            this.isInitialLoad = false;
            this.onLoadingComplete();
        }
    }

    /**
     * Handle loading completion
     */
    onLoadingComplete() {
        console.log(`✅ Initial loading complete: ${this.loadedCharts} loaded, ${this.failedCharts} failed`);

        // Hide loading screen after a short delay
        setTimeout(() => {
            this.hideLoadingScreen();
        }, 500);

        // Notify callbacks
        this.loadingCallbacks.forEach(callback => callback({
            loaded: this.loadedCharts,
            failed: this.failedCharts,
            total: this.totalCharts
        }));
    }

    /**
     * Hide loading screen with animation
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            document.body.classList.add('loaded');

            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    /**
     * Add callback for loading completion
     */
    onLoadingComplete(callback) {
        this.loadingCallbacks.push(callback);
    }

    /**
     * Get loading statistics
     */
    getStats() {
        return {
            total: this.totalCharts,
            loaded: this.loadedCharts,
            failed: this.failedCharts,
            pending: this.totalCharts - this.loadedCharts - this.failedCharts,
            percentage: this.totalCharts > 0 ?
                ((this.loadedCharts + this.failedCharts) / this.totalCharts) * 100 : 0
        };
    }

    /**
     * Reset for new loading session
     */
    reset() {
        this.loadingStates.clear();
        this.loadedCharts = 0;
        this.failedCharts = 0;
        this.isInitialLoad = true;
        this.loadingCallbacks = [];
        this.setupProgressTracking();
    }
}

// Create global instance
export const progressiveLoader = new ProgressiveLoader();

/**
 * Enhanced chart loading with progressive feedback
 */
export async function loadChartWithProgress(chartId, apiUrl, chartTitle, chartType = 'line') {
    // Import loadChartData dynamically to avoid circular dependencies
    const { loadChartData } = await import('./charts.js');

    // Register chart for tracking
    progressiveLoader.registerChart(chartId);

    try {
        // Mark as loading
        progressiveLoader.markLoading(chartId);

        // Load the chart
        const result = await loadChartData(chartId, apiUrl, chartTitle, chartType);

        if (result) {
            progressiveLoader.markLoaded(chartId);
        } else {
            progressiveLoader.markFailed(chartId, new Error('Chart returned null'));
        }

        return result;

    } catch (error) {
        progressiveLoader.markFailed(chartId, error);
        throw error;
    }
}
