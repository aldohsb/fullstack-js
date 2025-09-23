/* ===== COMPONENT SYSTEM - RAINFOREST WEATHER WIDGET ===== */

/**
 * WeatherComponents namespace - handles all UI components and DOM manipulation
 * Menggunakan module pattern untuk clean separation of concerns
 */
const WeatherComponents = (() => {
    'use strict';

    // ===== PRIVATE VARIABLES =====
    
    // DOM element references untuk performance
    let domCache = {
        // Loading elements
        loadingScreen: null,
        
        // Main widget elements
        weatherWidget: null,
        locationName: null,
        locationSubtitle: null,
        refreshBtn: null,
        
        // Current weather elements
        temperature: null,
        feelsLike: null,
        weatherIcon: null,
        animalCompanion: null,
        weatherCondition: null,
        weatherDetail: null,
        
        // Stats elements
        humidityValue: null,
        windValue: null,
        pressureValue: null,
        uvValue: null,
        
        // Hourly forecast
        hourlyItems: null,
        
        // Footer elements
        lastUpdated: null,
        rainforestFact: null,
        
        // Background elements
        rainDrops: null,
        fallingLeaves: null
    };
    
    // Component state
    let isInitialized = false;
    let isLoading = false;
    let currentWeatherData = null;

    // ===== PRIVATE HELPER FUNCTIONS =====

    /**
     * Initialize DOM cache untuk performance optimization
     * Cache semua DOM elements yang sering diakses
     */
    const initializeDOMCache = () => {
        try {
            // Loading elements
            domCache.loadingScreen = WeatherUtils.querySelector('#loading-screen');
            
            // Main widget elements
            domCache.weatherWidget = WeatherUtils.querySelector('#weather-widget');
            domCache.locationName = WeatherUtils.querySelector('#location-name');
            domCache.locationSubtitle = WeatherUtils.querySelector('#location-subtitle');
            domCache.refreshBtn = WeatherUtils.querySelector('#refresh-btn');
            
            // Current weather elements
            domCache.temperature = WeatherUtils.querySelector('#temperature');
            domCache.feelsLike = WeatherUtils.querySelector('#feels-like');
            domCache.weatherIcon = WeatherUtils.querySelector('#weather-icon');
            domCache.animalCompanion = WeatherUtils.querySelector('#animal-companion');
            domCache.weatherCondition = WeatherUtils.querySelector('#weather-condition');
            domCache.weatherDetail = WeatherUtils.querySelector('#weather-detail');
            
            // Stats elements
            domCache.humidityValue = WeatherUtils.querySelector('#humidity-value');
            domCache.windValue = WeatherUtils.querySelector('#wind-value');
            domCache.pressureValue = WeatherUtils.querySelector('#pressure-value');
            domCache.uvValue = WeatherUtils.querySelector('#uv-value');
            
            // Hourly forecast
            domCache.hourlyItems = WeatherUtils.querySelector('#hourly-items');
            
            // Footer elements
            domCache.lastUpdated = WeatherUtils.querySelector('#last-updated');
            domCache.rainforestFact = WeatherUtils.querySelector('#rainforest-fact');
            
            // Background elements
            domCache.rainDrops = WeatherUtils.querySelector('.rain-drops');
            domCache.fallingLeaves = WeatherUtils.querySelector('.falling-leaves');
            
            // Verify critical elements exist
            const criticalElements = [
                'weatherWidget', 'temperature', 'weatherIcon', 'refreshBtn'
            ];
            
            const missingElements = criticalElements.filter(key => !domCache[key]);
            
            if (missingElements.length > 0) {
                throw new Error(`Missing critical DOM elements: ${missingElements.join(', ')}`);
            }
            
            console.log('DOM cache initialized successfully');
            return true;
            
        } catch (error) {
            console.error('Error initializing DOM cache:', error);
            return false;
        }
    };

    /**
     * Update loading state dengan visual feedback
     * @param {boolean} loading - True jika sedang loading
     */
    const updateLoadingState = (loading) => {
        isLoading = loading;
        
        if (domCache.refreshBtn) {
            if (loading) {
                domCache.refreshBtn.classList.add('loading');
                domCache.refreshBtn.setAttribute('aria-label', 'Loading weather data...');
            } else {
                domCache.refreshBtn.classList.remove('loading');
                domCache.refreshBtn.setAttribute('aria-label', 'Refresh weather data');
            }
        }
        
        // Update widget state
        if (domCache.weatherWidget) {
            if (loading) {
                domCache.weatherWidget.classList.add('updating');
            } else {
                // Remove after animation completes
                setTimeout(() => {
                    domCache.weatherWidget.classList.remove('updating');
                }, 1200);
            }
        }
    };

    /**
     * Show/hide loading screen dengan smooth transition
     * @param {boolean} show - True untuk show, false untuk hide
     */
    const toggleLoadingScreen = (show) => {
        if (!domCache.loadingScreen) return;
        
        if (show) {
            domCache.loadingScreen.classList.remove('hidden');
            domCache.loadingScreen.style.display = 'flex';
        } else {
            domCache.loadingScreen.classList.add('hidden');
            // Hide completely after transition
            setTimeout(() => {
                if (domCache.loadingScreen.classList.contains('hidden')) {
                    domCache.loadingScreen.style.display = 'none';
                }
            }, 500);
        }
    };

    /**
     * Update location information dengan smooth transition
     * @param {Object} locationData - Location data object
     */
    const updateLocationInfo = (locationData) => {
        if (!locationData) return;
        
        const { name, subtitle } = locationData;
        
        // Update dengan fade effect
        if (domCache.locationName && name) {
            domCache.locationName.style.opacity = '0';
            setTimeout(() => {
                domCache.locationName.textContent = name;
                domCache.locationName.style.opacity = '1';
            }, 150);
        }
        
        if (domCache.locationSubtitle && subtitle) {
            domCache.locationSubtitle.style.opacity = '0';
            setTimeout(() => {
                domCache.locationSubtitle.textContent = subtitle;
                domCache.locationSubtitle.style.opacity = '1';
            }, 200);
        }
    };

    /**
     * Update temperature dengan smooth number animation
     * @param {Object} temperatureData - Temperature data object
     */
    const updateTemperature = (temperatureData) => {
        if (!temperatureData || !domCache.temperature) return;
        
        const { current, feelsLike } = temperatureData;
        
        // Get current temperature for smooth transition
        const currentTemp = parseInt(domCache.temperature.textContent) || 0;
        
        // Animate temperature change
        domCache.temperature.classList.add('updating');
        
        WeatherUtils.animateNumber(
            domCache.temperature,
            currentTemp,
            current,
            800,
            () => {
                domCache.temperature.classList.remove('updating');
            }
        );
        
        // Update feels like temperature
        if (domCache.feelsLike && feelsLike) {
            setTimeout(() => {
                domCache.feelsLike.textContent = `${feelsLike}°C`;
            }, 400);
        }
    };

    /**
     * Update weather condition dengan icon dan animal animations
     * @param {Object} conditionData - Weather condition data
     */
    const updateWeatherCondition = (conditionData) => {
        if (!conditionData) return;
        
        const { main, detail, icon, animal } = conditionData;
        
        // Update weather icon dengan transition
        if (domCache.weatherIcon && icon) {
            // Add fade out
            domCache.weatherIcon.style.opacity = '0';
            domCache.weatherIcon.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                domCache.weatherIcon.textContent = icon;
                domCache.weatherIcon.setAttribute('data-condition', conditionData.key || '');
                
                // Fade in dengan bounce
                domCache.weatherIcon.style.opacity = '1';
                domCache.weatherIcon.style.transform = 'scale(1)';
            }, 300);
        }
        
        // Update animal companion
        if (domCache.animalCompanion && animal) {
            setTimeout(() => {
                domCache.animalCompanion.style.opacity = '0';
                domCache.animalCompanion.style.transform = 'scale(0.5)';
                
                setTimeout(() => {
                    domCache.animalCompanion.textContent = animal;
                    domCache.animalCompanion.setAttribute('data-animal', animal);
                    domCache.animalCompanion.style.opacity = '1';
                    domCache.animalCompanion.style.transform = 'scale(1)';
                }, 200);
            }, 100);
        }
        
        // Update condition text
        if (domCache.weatherCondition && main) {
            setTimeout(() => {
                domCache.weatherCondition.style.opacity = '0';
                setTimeout(() => {
                    domCache.weatherCondition.textContent = main;
                    domCache.weatherCondition.style.opacity = '1';
                }, 150);
            }, 200);
        }
        
        if (domCache.weatherDetail && detail) {
            setTimeout(() => {
                domCache.weatherDetail.style.opacity = '0';
                setTimeout(() => {
                    domCache.weatherDetail.textContent = detail;
                    domCache.weatherDetail.style.opacity = '1';
                }, 150);
            }, 250);
        }
    };

    /**
     * Update weather stats dengan smooth transitions
     * @param {Object} statsData - Weather stats data
     */
    const updateWeatherStats = (statsData) => {
        if (!statsData) return;
        
        const { humidity, wind, pressure, uvIndex } = statsData;
        
        const statsUpdates = [
            { element: domCache.humidityValue, value: humidity, delay: 100 },
            { element: domCache.windValue, value: wind, delay: 150 },
            { element: domCache.pressureValue, value: pressure, delay: 200 },
            { element: domCache.uvValue, value: uvIndex, delay: 250 }
        ];
        
        statsUpdates.forEach(({ element, value, delay }) => {
            if (element && value !== undefined) {
                setTimeout(() => {
                    element.style.opacity = '0';
                    setTimeout(() => {
                        element.textContent = value;
                        element.style.opacity = '1';
                    }, 150);
                }, delay);
            }
        });
    };

    /**
     * Update hourly forecast dengan staggered animation
     * @param {Array} forecastData - Array of hourly forecast data
     */
    const updateHourlyForecast = (forecastData) => {
        if (!domCache.hourlyItems || !Array.isArray(forecastData)) return;
        
        // Clear existing items
        domCache.hourlyItems.innerHTML = '';
        
        // Create new hourly items dengan staggered animation
        forecastData.forEach((hourData, index) => {
            const { time, temperature, icon, rain } = hourData;
            
            const hourlyItem = WeatherUtils.createElement('div', {
                className: 'hourly-item',
                style: `animation-delay: ${(index * 50) + 100}ms`
            });
            
            // Time
            const timeElement = WeatherUtils.createElement('div', {
                className: 'hourly-time'
            }, time);
            
            // Icon
            const iconElement = WeatherUtils.createElement('div', {
                className: 'hourly-icon'
            }, icon);
            
            // Temperature
            const tempElement = WeatherUtils.createElement('div', {
                className: 'hourly-temp'
            }, temperature);
            
            // Rain probability
            const rainElement = WeatherUtils.createElement('div', {
                className: 'hourly-rain'
            }, `💧 ${rain}`);
            
            // Append elements
            hourlyItem.appendChild(timeElement);
            hourlyItem.appendChild(iconElement);
            hourlyItem.appendChild(tempElement);
            hourlyItem.appendChild(rainElement);
            
            domCache.hourlyItems.appendChild(hourlyItem);
        });
        
        // Enable horizontal scroll dengan smooth behavior
        if (domCache.hourlyItems.scrollWidth > domCache.hourlyItems.clientWidth) {
            domCache.hourlyItems.style.overflowX = 'auto';
        }
    };

    /**
     * Update footer information
     * @param {Object} metadataData - Metadata dari weather data
     */
    const updateFooterInfo = (metadataData) => {
        if (!metadataData) return;
        
        const { lastUpdated, fact } = metadataData;
        
        // Update last updated time
        if (domCache.lastUpdated && lastUpdated) {
            domCache.lastUpdated.textContent = lastUpdated;
        }
        
        // Update rainforest fact dengan typewriter effect
        if (domCache.rainforestFact && fact) {
            const factTextElement = domCache.rainforestFact.querySelector('.fact-text');
            if (factTextElement) {
                factTextElement.style.opacity = '0';
                setTimeout(() => {
                    factTextElement.textContent = fact;
                    factTextElement.style.opacity = '1';
                    
                    // Add typewriter effect jika text cukup panjang
                    if (fact.length > 50) {
                        factTextElement.classList.add('typing');
                        setTimeout(() => {
                            factTextElement.classList.remove('typing');
                        }, 3000);
                    }
                }, 300);
            }
        }
    };

    /**
     * Update background atmospheric effects berdasarkan weather condition
     * @param {string} conditionKey - Weather condition key
     */
    const updateAtmosphericEffects = (conditionKey) => {
        if (!conditionKey) return;
        
        // Control rain drops
        if (domCache.rainDrops) {
            if (conditionKey.includes('rain') || conditionKey === 'thunderstorm') {
                domCache.rainDrops.classList.add('active');
            } else {
                domCache.rainDrops.classList.remove('active');
            }
        }
        
        // Adjust falling leaves berdasarkan weather intensity
        if (domCache.fallingLeaves) {
            const windIntensity = {
                'thunderstorm': 'high',
                'heavy_rain': 'medium',
                'light_rain': 'low',
                'partly_cloudy': 'low',
                'foggy': 'very-low',
                'sunny': 'low'
            };
            
            const intensity = windIntensity[conditionKey] || 'low';
            domCache.fallingLeaves.setAttribute('data-intensity', intensity);
        }
    };

    // ===== PUBLIC METHODS =====

    /**
     * Initialize component system
     * @returns {Promise<boolean>} - Promise yang resolve dengan initialization status
     */
    const initialize = async () => {
        try {
            console.log('Initializing Weather Components...');
            
            // Initialize DOM cache
            if (!initializeDOMCache()) {
                throw new Error('Failed to initialize DOM cache');
            }
            
            // Setup event listeners
            setupEventListeners();
            
            // Mark as initialized
            isInitialized = true;
            
            console.log('Weather Components initialized successfully');
            return true;
            
        } catch (error) {
            console.error('Error initializing Weather Components:', error);
            return false;
        }
    };

    /**
     * Setup event listeners untuk interactivity
     */
    const setupEventListeners = () => {
        // Refresh button click handler
        if (domCache.refreshBtn) {
            WeatherUtils.addEventListenerWithCleanup(
                domCache.refreshBtn,
                'click',
                handleRefreshClick
            );
            
            // Keyboard accessibility
            WeatherUtils.addEventListenerWithCleanup(
                domCache.refreshBtn,
                'keydown',
                (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleRefreshClick();
                    }
                }
            );
        }
        
        // Location name click untuk random location (Easter egg)
        if (domCache.locationName) {
            WeatherUtils.addEventListenerWithCleanup(
                domCache.locationName,
                'dblclick',
                handleLocationDoubleClick
            );
        }
        
        // Hourly forecast scroll dengan smooth behavior
        if (domCache.hourlyItems) {
            WeatherUtils.addEventListenerWithCleanup(
                domCache.hourlyItems,
                'wheel',
                handleHourlyScroll,
                { passive: true }
            );
        }
    };

    /**
     * Handle refresh button click
     */
    const handleRefreshClick = async () => {
        if (isLoading) return; // Prevent multiple simultaneous requests
        
        try {
            // Trigger refresh event
            const refreshEvent = new CustomEvent('weatherRefresh', {
                detail: { timestamp: Date.now() }
            });
            
            document.dispatchEvent(refreshEvent);
            
        } catch (error) {
            console.error('Error handling refresh click:', error);
        }
    };

    /**
     * Handle location double click untuk random location
     */
    const handleLocationDoubleClick = async () => {
        if (isLoading) return;
        
        try {
            // Trigger random location event
            const randomLocationEvent = new CustomEvent('weatherRandomLocation', {
                detail: { timestamp: Date.now() }
            });
            
            document.dispatchEvent(randomLocationEvent);
            
        } catch (error) {
            console.error('Error handling location double click:', error);
        }
    };

    /**
     * Handle horizontal scroll untuk hourly forecast
     * @param {WheelEvent} event - Wheel event
     */
    const handleHourlyScroll = (event) => {
        if (!domCache.hourlyItems) return;
        
        // Convert vertical scroll ke horizontal scroll
        if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
            event.preventDefault();
            domCache.hourlyItems.scrollLeft += event.deltaY;
        }
    };

    /**
     * Update semua components dengan weather data
     * @param {Object} weatherData - Complete weather data object
     * @returns {Promise<void>}
     */
    const updateAllComponents = async (weatherData) => {
        try {
            if (!isInitialized) {
                console.warn('Components not initialized');
                return;
            }
            
            if (!WeatherData.validateWeatherData(weatherData)) {
                throw new Error('Invalid weather data structure');
            }
            
            // Format data untuk display
            const formattedData = WeatherData.formatWeatherForDisplay(weatherData);
            currentWeatherData = weatherData;
            
            // Update components dengan staggered timing untuk smooth UX
            updateLocationInfo(formattedData.location);
            
            setTimeout(() => {
                updateTemperature(formattedData.temperature);
            }, 100);
            
            setTimeout(() => {
                updateWeatherCondition({
                    ...formattedData.condition,
                    key: weatherData.current.conditionKey
                });
            }, 200);
            
            setTimeout(() => {
                updateWeatherStats(formattedData.stats);
            }, 300);
            
            setTimeout(() => {
                updateHourlyForecast(formattedData.forecast);
            }, 400);
            
            setTimeout(() => {
                updateFooterInfo(formattedData.metadata);
            }, 500);
            
            // Update atmospheric effects
            updateAtmosphericEffects(weatherData.current.conditionKey);
            
            console.log('All components updated successfully');
            
        } catch (error) {
            console.error('Error updating components:', error);
            throw error;
        }
    };

    /**
     * Show error state dengan user-friendly message
     * @param {string} message - Error message untuk user
     * @param {Error} error - Original error object untuk logging
     */
    const showErrorState = (message, error = null) => {
        try {
            if (error) {
                console.error('Weather widget error:', error);
            }
            
            // Update temperature dengan error indicator
            if (domCache.temperature) {
                domCache.temperature.textContent = '--';
                domCache.temperature.classList.add('error');
            }
            
            // Update weather condition
            if (domCache.weatherCondition) {
                domCache.weatherCondition.textContent = 'Error';
            }
            
            if (domCache.weatherDetail) {
                domCache.weatherDetail.textContent = message || 'Unable to load weather data';
            }
            
            // Update weather icon dengan error state
            if (domCache.weatherIcon) {
                domCache.weatherIcon.textContent = '⚠️';
            }
            
            // Hide animal companion
            if (domCache.animalCompanion) {
                domCache.animalCompanion.style.opacity = '0';
            }
            
            // Update stats dengan error state
            const statElements = [
                domCache.humidityValue,
                domCache.windValue,
                domCache.pressureValue,
                domCache.uvValue
            ];
            
            statElements.forEach(element => {
                if (element) {
                    element.textContent = '--';
                    element.classList.add('error');
                }
            });
            
            // Clear hourly forecast
            if (domCache.hourlyItems) {
                domCache.hourlyItems.innerHTML = `
                    <div class="hourly-error">
                        <span>⚠️</span>
                        <span>Unable to load forecast</span>
                    </div>
                `;
            }
            
            // Update footer
            if (domCache.lastUpdated) {
                domCache.lastUpdated.textContent = 'Error loading data';
            }
            
        } catch (componentError) {
            console.error('Error showing error state:', componentError);
        }
    };

    /**
     * Clear error state dan restore normal styling
     */
    const clearErrorState = () => {
        try {
            // Remove error classes
            const errorElements = WeatherUtils.querySelectorAll('.error');
            errorElements.forEach(element => {
                element.classList.remove('error');
            });
            
            // Restore animal companion
            if (domCache.animalCompanion) {
                domCache.animalCompanion.style.opacity = '1';
            }
            
        } catch (error) {
            console.error('Error clearing error state:', error);
        }
    };

    /**
     * Get current component state
     * @returns {Object} - Current state object
     */
    const getCurrentState = () => {
        return {
            isInitialized,
            isLoading,
            hasWeatherData: !!currentWeatherData,
            currentWeatherData: currentWeatherData ? { ...currentWeatherData } : null
        };
    };

    /**
     * Cleanup components dan remove event listeners
     */
    const cleanup = () => {
        try {
            // Clear DOM cache
            Object.keys(domCache).forEach(key => {
                domCache[key] = null;
            });
            
            // Reset state
            isInitialized = false;
            isLoading = false;
            currentWeatherData = null;
            
            console.log('Weather Components cleaned up');
            
        } catch (error) {
            console.error('Error cleaning up components:', error);
        }
    };

    /**
     * Force update single component (untuk debugging/testing)
     * @param {string} componentName - Name of component to update
     * @param {any} data - Data untuk component
     */
    const updateSingleComponent = (componentName, data) => {
        try {
            switch (componentName) {
                case 'location':
                    updateLocationInfo(data);
                    break;
                case 'temperature':
                    updateTemperature(data);
                    break;
                case 'condition':
                    updateWeatherCondition(data);
                    break;
                case 'stats':
                    updateWeatherStats(data);
                    break;
                case 'hourly':
                    updateHourlyForecast(data);
                    break;
                case 'footer':
                    updateFooterInfo(data);
                    break;
                default:
                    console.warn(`Unknown component: ${componentName}`);
            }
        } catch (error) {
            console.error(`Error updating component ${componentName}:`, error);
        }
    };

    // ===== PUBLIC API =====
    // Export methods untuk digunakan oleh main app
    return {
        // Core methods
        initialize,
        updateAllComponents,
        showErrorState,
        clearErrorState,
        getCurrentState,
        cleanup,
        
        // Loading state management
        updateLoadingState,
        toggleLoadingScreen,
        
        // Individual component updates (untuk fine-grained control)
        updateSingleComponent,
        updateLocationInfo,
        updateTemperature,
        updateWeatherCondition,
        updateWeatherStats,
        updateHourlyForecast,
        updateFooterInfo,
        updateAtmosphericEffects,
        
        // Event handlers (exposed untuk testing)
        handleRefreshClick,
        handleLocationDoubleClick,
        
        // Utility methods
        setupEventListeners,
        
        // Constants
        DOM_CACHE_KEYS: Object.keys(domCache)
    };
})();