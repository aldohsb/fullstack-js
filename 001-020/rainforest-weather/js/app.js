/* ===== MAIN APPLICATION - RAINFOREST WEATHER WIDGET ===== */

/**
 * WeatherApp - Main application controller
 * Menghandle initialization, state management, dan koordinasi antara semua modules
 */
const WeatherApp = (() => {
    'use strict';

    // ===== APPLICATION CONSTANTS =====
    const CONFIG = {
        // Performance settings
        INITIAL_LOAD_DELAY: 1500,      // Delay sebelum hide loading screen
        CACHE_DURATION: 10 * 60 * 1000, // 10 minutes cache duration
        RETRY_ATTEMPTS: 3,              // Jumlah retry untuk failed requests
        RETRY_DELAY: 2000,              // Delay antar retry attempts
        
        // Auto refresh settings
        AUTO_REFRESH_ENABLED: true,     // Enable auto refresh
        AUTO_REFRESH_INTERVAL: 15 * 60 * 1000, // 15 minutes auto refresh
        
        // Animation settings
        COMPONENT_UPDATE_DELAY: 100,    // Delay antar component updates
        ERROR_DISPLAY_DURATION: 5000,   // Duration untuk error messages
        
        // Feature flags
        ENABLE_LOCATION_CYCLING: true,  // Enable random location changes
        ENABLE_ATMOSPHERIC_EFFECTS: true, // Enable background animations
        ENABLE_SOUND_EFFECTS: false,    // Future: sound effects
        
        // Debug settings
        DEBUG_MODE: false,              // Enable debug logging
        PERFORMANCE_MONITORING: true    // Monitor performance metrics
    };

    // ===== APPLICATION STATE =====
    let appState = {
        isInitialized: false,
        isLoading: false,
        hasError: false,
        currentWeatherData: null,
        lastUpdateTime: null,
        retryCount: 0,
        autoRefreshTimer: null,
        performanceMetrics: {
            initTime: null,
            loadTimes: [],
            errorCount: 0,
            refreshCount: 0
        }
    };

    // Event listeners cleanup functions
    let eventCleanupFunctions = [];

    // ===== PRIVATE HELPER FUNCTIONS =====

    /**
     * Debug logger yang hanya aktif jika DEBUG_MODE enabled
     * @param {string} message - Debug message
     * @param {...any} data - Additional data untuk logging
     */
    const debugLog = (message, ...data) => {
        if (CONFIG.DEBUG_MODE) {
            console.log(`[WeatherApp Debug] ${message}`, ...data);
        }
    };

    /**
     * Performance monitor untuk tracking app performance
     * @param {string} operation - Name of operation
     * @param {number} startTime - Start time dari performance.now()
     */
    const recordPerformance = (operation, startTime) => {
        if (!CONFIG.PERFORMANCE_MONITORING) return;
        
        const duration = performance.now() - startTime;
        
        switch (operation) {
            case 'init':
                appState.performanceMetrics.initTime = duration;
                break;
            case 'load':
                appState.performanceMetrics.loadTimes.push(duration);
                break;
        }
        
        debugLog(`Performance: ${operation} took ${duration.toFixed(2)}ms`);
    };

    /**
     * Error handler dengan retry logic dan user feedback
     * @param {Error} error - Error object
     * @param {string} operation - Operation yang gagal
     * @param {Function} retryFunction - Function untuk retry
     */
    const handleError = async (error, operation, retryFunction = null) => {
        console.error(`WeatherApp Error in ${operation}:`, error);
        
        appState.hasError = true;
        appState.performanceMetrics.errorCount++;
        
        // Show error state ke user
        const userMessage = getUserFriendlyErrorMessage(error, operation);
        WeatherComponents.showErrorState(userMessage, error);
        
        // Retry logic jika retry function tersedia
        if (retryFunction && appState.retryCount < CONFIG.RETRY_ATTEMPTS) {
            appState.retryCount++;
            debugLog(`Retrying ${operation}, attempt ${appState.retryCount}`);
            
            setTimeout(async () => {
                try {
                    await retryFunction();
                    appState.retryCount = 0; // Reset retry count on success
                } catch (retryError) {
                    await handleError(retryError, `${operation} (retry)`, 
                        appState.retryCount < CONFIG.RETRY_ATTEMPTS ? retryFunction : null);
                }
            }, CONFIG.RETRY_DELAY);
        } else {
            // Max retries reached atau no retry function
            appState.retryCount = 0;
            
            // Auto-clear error state setelah delay
            setTimeout(() => {
                if (appState.hasError) {
                    clearErrorAndRefresh();
                }
            }, CONFIG.ERROR_DISPLAY_DURATION);
        }
    };

    /**
     * Convert technical error ke user-friendly message
     * @param {Error} error - Original error
     * @param {string} operation - Operation context
     * @returns {string} - User-friendly error message
     */
    const getUserFriendlyErrorMessage = (error, operation) => {
        const errorMessages = {
            'initialization': 'Failed to start weather widget',
            'weather_fetch': 'Unable to fetch weather data',
            'component_update': 'Display update failed',
            'location_change': 'Location change failed',
            'default': 'Something went wrong'
        };
        
        // Check untuk specific error types
        if (error.message.includes('fetch')) {
            return 'Connection problem - please check your internet';
        }
        
        if (error.message.includes('timeout')) {
            return 'Request timed out - please try again';
        }
        
        return errorMessages[operation] || errorMessages.default;
    };

    /**
     * Clear error state dan attempt refresh
     */
    const clearErrorAndRefresh = async () => {
        try {
            appState.hasError = false;
            WeatherComponents.clearErrorState();
            
            // Attempt to refresh data
            await refreshWeatherData();
            
        } catch (error) {
            debugLog('Auto-refresh after error failed:', error);
        }
    };

    /**
     * Setup auto-refresh timer
     */
    const setupAutoRefresh = () => {
        if (!CONFIG.AUTO_REFRESH_ENABLED) return;
        
        // Clear existing timer
        if (appState.autoRefreshTimer) {
            clearInterval(appState.autoRefreshTimer);
        }
        
        // Setup new timer
        appState.autoRefreshTimer = setInterval(async () => {
            if (!appState.isLoading && !appState.hasError) {
                debugLog('Auto-refresh triggered');
                await refreshWeatherData(true); // Silent refresh
            }
        }, CONFIG.AUTO_REFRESH_INTERVAL);
        
        debugLog(`Auto-refresh setup: every ${CONFIG.AUTO_REFRESH_INTERVAL / 60000} minutes`);
    };

    /**
     * Setup global event listeners
     */
    const setupGlobalEventListeners = () => {
        // Custom event untuk refresh request
        const refreshCleanup = WeatherUtils.addEventListenerWithCleanup(
            document,
            'weatherRefresh',
            async (event) => {
                debugLog('Refresh event received', event.detail);
                await refreshWeatherData();
            }
        );
        eventCleanupFunctions.push(refreshCleanup);
        
        // Custom event untuk random location request
        const randomLocationCleanup = WeatherUtils.addEventListenerWithCleanup(
            document,
            'weatherRandomLocation',
            async (event) => {
                if (!CONFIG.ENABLE_LOCATION_CYCLING) return;
                
                debugLog('Random location event received', event.detail);
                await changeToRandomLocation();
            }
        );
        eventCleanupFunctions.push(randomLocationCleanup);
        
        // Window visibility change (pause auto-refresh when tab not visible)
        const visibilityCleanup = WeatherUtils.addEventListenerWithCleanup(
            document,
            'visibilitychange',
            () => {
                if (document.hidden) {
                    debugLog('Tab hidden - pausing auto-refresh');
                    if (appState.autoRefreshTimer) {
                        clearInterval(appState.autoRefreshTimer);
                        appState.autoRefreshTimer = null;
                    }
                } else {
                    debugLog('Tab visible - resuming auto-refresh');
                    setupAutoRefresh();
                }
            }
        );
        eventCleanupFunctions.push(visibilityCleanup);
        
        // Window unload cleanup
        const unloadCleanup = WeatherUtils.addEventListenerWithCleanup(
            window,
            'beforeunload',
            () => {
                cleanup();
            }
        );
        eventCleanupFunctions.push(unloadCleanup);
        
        // Error handling untuk uncaught errors
        const errorCleanup = WeatherUtils.addEventListenerWithCleanup(
            window,
            'error',
            (event) => {
                console.error('Uncaught error in Weather Widget:', event.error);
                handleError(event.error, 'uncaught_error');
            }
        );
        eventCleanupFunctions.push(errorCleanup);
        
        // Promise rejection handling
        const rejectionCleanup = WeatherUtils.addEventListenerWithCleanup(
            window,
            'unhandledrejection',
            (event) => {
                console.error('Unhandled promise rejection in Weather Widget:', event.reason);
                handleError(new Error(event.reason), 'unhandled_promise');
            }
        );
        eventCleanupFunctions.push(rejectionCleanup);
    };

    // ===== CORE APPLICATION FUNCTIONS =====

    /**
     * Initialize weather app
     * @returns {Promise<boolean>} - Success status
     */
    const initialize = async () => {
        const initStartTime = performance.now();
        
        try {
            debugLog('Starting WeatherApp initialization...');
            
            // Show loading screen
            WeatherComponents.toggleLoadingScreen(true);
            
            // Initialize components system
            const componentsInitialized = await WeatherComponents.initialize();
            if (!componentsInitialized) {
                throw new Error('Failed to initialize UI components');
            }
            
            // Setup global event listeners
            setupGlobalEventListeners();
            
            // Load initial weather data
            const initialLoadStartTime = performance.now();
            await loadInitialWeatherData();
            recordPerformance('load', initialLoadStartTime);
            
            // Setup auto-refresh
            setupAutoRefresh();
            
            // Hide loading screen dengan delay untuk smooth UX
            setTimeout(() => {
                WeatherComponents.toggleLoadingScreen(false);
            }, CONFIG.INITIAL_LOAD_DELAY);
            
            // Mark as initialized
            appState.isInitialized = true;
            appState.hasError = false;
            
            recordPerformance('init', initStartTime);
            debugLog('WeatherApp initialized successfully', appState.performanceMetrics);
            
            return true;
            
        } catch (error) {
            await handleError(error, 'initialization');
            return false;
        }
    };

    /**
     * Load initial weather data
     */
    const loadInitialWeatherData = async () => {
        try {
            appState.isLoading = true;
            WeatherComponents.updateLoadingState(true);
            
            // Check untuk cached data first
            let weatherData = WeatherData.getCachedWeather();
            
            if (!weatherData) {
                debugLog('No cached data, fetching fresh weather data');
                weatherData = await WeatherData.fetchCurrentWeather();
            } else {
                debugLog('Using cached weather data');
            }
            
            // Update all components dengan weather data
            await WeatherComponents.updateAllComponents(weatherData);
            
            // Update app state
            appState.currentWeatherData = weatherData;
            appState.lastUpdateTime = new Date();
            appState.performanceMetrics.refreshCount++;
            
            debugLog('Initial weather data loaded successfully');
            
        } catch (error) {
            throw error; // Re-throw to be handled by caller
        } finally {
            appState.isLoading = false;
            WeatherComponents.updateLoadingState(false);
        }
    };

    /**
     * Refresh weather data
     * @param {boolean} silent - Jika true, tidak show loading indicator
     */
    const refreshWeatherData = async (silent = false) => {
        try {
            if (appState.isLoading) {
                debugLog('Refresh skipped - already loading');
                return;
            }
            
            const loadStartTime = performance.now();
            
            appState.isLoading = true;
            if (!silent) {
                WeatherComponents.updateLoadingState(true);
            }
            
            // Fetch fresh weather data
            const weatherData = await WeatherData.fetchCurrentWeather();
            
            // Update components
            await WeatherComponents.updateAllComponents(weatherData);
            
            // Update app state
            appState.currentWeatherData = weatherData;
            appState.lastUpdateTime = new Date();
            appState.hasError = false;
            appState.performanceMetrics.refreshCount++;
            
            recordPerformance('load', loadStartTime);
            debugLog('Weather data refreshed successfully');
            
        } catch (error) {
            await handleError(error, 'weather_fetch', () => refreshWeatherData(silent));
        } finally {
            appState.isLoading = false;
            if (!silent) {
                WeatherComponents.updateLoadingState(false);
            }
        }
    };

    /**
     * Change ke random rainforest location
     */
    const changeToRandomLocation = async () => {
        try {
            if (appState.isLoading) {
                debugLog('Location change skipped - already loading');
                return;
            }
            
            appState.isLoading = true;
            WeatherComponents.updateLoadingState(true);
            
            // Get random location weather data
            const weatherData = await WeatherData.getRandomLocation();
            
            // Update components dengan new location data
            await WeatherComponents.updateAllComponents(weatherData);
            
            // Update app state
            appState.currentWeatherData = weatherData;
            appState.lastUpdateTime = new Date();
            appState.performanceMetrics.refreshCount++;
            
            debugLog('Random location loaded successfully', 
                weatherData.location.name);
            
        } catch (error) {
            await handleError(error, 'location_change', changeToRandomLocation);
        } finally {
            appState.isLoading = false;
            WeatherComponents.updateLoadingState(false);
        }
    };

    /**
     * Get current application state (untuk debugging/monitoring)
     * @returns {Object} - Current app state
     */
    const getCurrentAppState = () => {
        return {
            ...appState,
            config: { ...CONFIG },
            uptime: appState.isInitialized ? 
                Date.now() - appState.performanceMetrics.initTime : 0,
            componentsState: WeatherComponents.getCurrentState()
        };
    };

    /**
     * Update application configuration
     * @param {Object} newConfig - New configuration options
     */
    const updateConfig = (newConfig) => {
        Object.assign(CONFIG, newConfig);
        
        debugLog('Config updated:', newConfig);
        
        // Re-setup auto-refresh jika interval berubah
        if (newConfig.hasOwnProperty('AUTO_REFRESH_INTERVAL') || 
            newConfig.hasOwnProperty('AUTO_REFRESH_ENABLED')) {
            setupAutoRefresh();
        }
    };

    /**
     * Simulate weather condition change (untuk demo/testing)
     * @param {string} conditionKey - Weather condition key
     */
    const simulateWeatherCondition = async (conditionKey) => {
        try {
            if (!appState.isInitialized) {
                throw new Error('App not initialized');
            }
            
            appState.isLoading = true;
            WeatherComponents.updateLoadingState(true);
            
            // Simulate weather change
            const weatherData = await WeatherData.simulateWeatherChange(conditionKey);
            
            // Update components
            await WeatherComponents.updateAllComponents(weatherData);
            
            // Update app state
            appState.currentWeatherData = weatherData;
            appState.lastUpdateTime = new Date();
            
            debugLog(`Weather condition simulated: ${conditionKey}`);
            
        } catch (error) {
            await handleError(error, 'weather_simulation');
        } finally {
            appState.isLoading = false;
            WeatherComponents.updateLoadingState(false);
        }
    };

    /**
     * Cleanup aplikasi dan release resources
     */
    const cleanup = () => {
        try {
            debugLog('Starting app cleanup...');
            
            // Clear auto-refresh timer
            if (appState.autoRefreshTimer) {
                clearInterval(appState.autoRefreshTimer);
                appState.autoRefreshTimer = null;
            }
            
            // Cleanup event listeners
            eventCleanupFunctions.forEach(cleanup => cleanup());
            eventCleanupFunctions = [];
            
            // Cleanup components
            WeatherComponents.cleanup();
            
            // Reset app state
            appState = {
                isInitialized: false,
                isLoading: false,
                hasError: false,
                currentWeatherData: null,
                lastUpdateTime: null,
                retryCount: 0,
                autoRefreshTimer: null,
                performanceMetrics: {
                    initTime: null,
                    loadTimes: [],
                    errorCount: 0,
                    refreshCount: 0
                }
            };
            
            debugLog('App cleanup completed');
            
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    };

    // ===== PUBLIC API =====
    return {
        // Core methods
        initialize,
        refreshWeatherData,
        changeToRandomLocation,
        simulateWeatherCondition,
        cleanup,
        
        // State management
        getCurrentAppState,
        updateConfig,
        
        // Error handling
        handleError,
        clearErrorAndRefresh,
        
        // Utility methods (untuk testing dan debugging)
        setupAutoRefresh,
        loadInitialWeatherData,
        
        // Constants
        CONFIG: { ...CONFIG }
    };
})();

// ===== APPLICATION INITIALIZATION =====

/**
 * Auto-initialize app ketika DOM ready
 * Menggunakan modern event handling dengan fallback
 */
(() => {
    'use strict';
    
    const initApp = async () => {
        try {
            console.log('🌿 Rainforest Weather Widget - Starting initialization...');
            
            const success = await WeatherApp.initialize();
            
            if (success) {
                console.log('🌿 Rainforest Weather Widget - Initialized successfully!');
                
                // Expose WeatherApp ke global scope untuk debugging (development only)
                if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
                    window.WeatherApp = WeatherApp;
                    window.WeatherData = WeatherData;
                    window.WeatherComponents = WeatherComponents;
                    window.WeatherUtils = WeatherUtils;
                    console.log('🔧 Debug: WeatherApp exposed to window object');
                }
            } else {
                console.error('❌ Rainforest Weather Widget - Initialization failed');
            }
            
        } catch (error) {
            console.error('❌ Fatal error initializing Rainforest Weather Widget:', error);
        }
    };
    
    // Initialize berdasarkan document ready state
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        // DOM already loaded
        initApp();
    }
    
    // Backup initialization dengan window load event
    window.addEventListener('load', () => {
        // Check jika app belum initialized setelah 3 seconds
        setTimeout(() => {
            const appState = WeatherApp.getCurrentAppState();
            if (!appState.isInitialized) {
                console.warn('🔄 Backup initialization triggered');
                initApp();
            }
        }, 3000);
    });
})();