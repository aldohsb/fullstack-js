/* ===== UTILITY FUNCTIONS - RAINFOREST WEATHER WIDGET ===== */

/**
 * Namespace untuk utility functions
 * Menggunakan IIFE (Immediately Invoked Function Expression) untuk menghindari global pollution
 */
const WeatherUtils = (() => {
    'use strict';

    /**
     * Debounce function untuk mengurangi frequency function calls
     * Berguna untuk event handlers yang dipanggil berulang-ulang seperti resize, scroll
     * @param {Function} func - Function yang akan di-debounce
     * @param {number} wait - Waktu tunggu dalam milliseconds
     * @param {boolean} immediate - Apakah function dijalankan di awal atau akhir
     * @returns {Function} - Debounced function
     */
    const debounce = (func, wait, immediate) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    };

    /**
     * Throttle function untuk membatasi frequency function calls
     * Berbeda dengan debounce, throttle memastikan function dipanggil secara berkala
     * @param {Function} func - Function yang akan di-throttle  
     * @param {number} limit - Interval dalam milliseconds
     * @returns {Function} - Throttled function
     */
    const throttle = (func, limit) => {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    /**
     * Generate random number dalam range tertentu
     * @param {number} min - Nilai minimum (inclusive)
     * @param {number} max - Nilai maximum (inclusive)
     * @param {boolean} isInteger - Apakah hasil harus integer
     * @returns {number} - Random number
     */
    const randomBetween = (min, max, isInteger = false) => {
        const random = Math.random() * (max - min) + min;
        return isInteger ? Math.floor(random) : Math.round(random * 100) / 100;
    };

    /**
     * Format timestamp menjadi readable time string
     * @param {number|Date} timestamp - Timestamp atau Date object
     * @param {boolean} includeSeconds - Apakah include seconds
     * @returns {string} - Formatted time string
     */
    const formatTime = (timestamp, includeSeconds = false) => {
        try {
            const date = new Date(timestamp);
            const options = {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false // 24-hour format
            };
            
            if (includeSeconds) {
                options.second = '2-digit';
            }
            
            return new Intl.DateTimeFormat('id-ID', options).format(date);
        } catch (error) {
            console.warn('Error formatting time:', error);
            return '--:--';
        }
    };

    /**
     * Format tanggal menjadi readable date string  
     * @param {number|Date} timestamp - Timestamp atau Date object
     * @param {string} locale - Locale string (default: 'id-ID')
     * @returns {string} - Formatted date string
     */
    const formatDate = (timestamp, locale = 'id-ID') => {
        try {
            const date = new Date(timestamp);
            const options = {
                weekday: 'long',
                year: 'numeric', 
                month: 'long',
                day: 'numeric'
            };
            
            return new Intl.DateTimeFormat(locale, options).format(date);
        } catch (error) {
            console.warn('Error formatting date:', error);
            return 'Unknown Date';
        }
    };

    /**
     * Clamp number dalam range min-max
     * @param {number} value - Nilai yang akan di-clamp
     * @param {number} min - Nilai minimum
     * @param {number} max - Nilai maximum  
     * @returns {number} - Clamped value
     */
    const clamp = (value, min, max) => {
        return Math.min(Math.max(value, min), max);
    };

    /**
     * Linear interpolation antara dua nilai
     * @param {number} start - Nilai start
     * @param {number} end - Nilai end
     * @param {number} t - Factor interpolation (0-1)
     * @returns {number} - Interpolated value
     */
    const lerp = (start, end, t) => {
        return start + (end - start) * clamp(t, 0, 1);
    };

    /**
     * Convert temperature dari Celsius ke Fahrenheit
     * @param {number} celsius - Temperature dalam Celsius
     * @returns {number} - Temperature dalam Fahrenheit
     */
    const celsiusToFahrenheit = (celsius) => {
        return Math.round((celsius * 9/5) + 32);
    };

    /**
     * Convert wind speed dari km/h ke different units
     * @param {number} kmh - Wind speed dalam km/h
     * @param {string} unit - Target unit ('ms', 'mph', 'knots')
     * @returns {number} - Converted wind speed
     */
    const convertWindSpeed = (kmh, unit) => {
        switch (unit.toLowerCase()) {
            case 'ms':
            case 'm/s':
                return Math.round((kmh / 3.6) * 10) / 10;
            case 'mph':
                return Math.round((kmh / 1.609) * 10) / 10;
            case 'knots':
                return Math.round((kmh / 1.852) * 10) / 10;
            default:
                return kmh;
        }
    };

    /**
     * Get wind direction dari degree
     * @param {number} degrees - Wind direction dalam degrees (0-360)
     * @returns {string} - Wind direction (N, NE, E, etc.)
     */
    const getWindDirection = (degrees) => {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const index = Math.round(degrees / 45) % 8;
        return directions[index];
    };

    /**
     * Animate number dengan smooth transition
     * @param {HTMLElement} element - DOM element yang akan diupdate
     * @param {number} start - Starting value
     * @param {number} end - Ending value  
     * @param {number} duration - Duration dalam milliseconds
     * @param {Function} callback - Optional callback setelah animation selesai
     */
    const animateNumber = (element, start, end, duration, callback) => {
        if (!element) {
            console.warn('Element not found for number animation');
            return;
        }

        const startTime = performance.now();
        const difference = end - start;

        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out-cubic)
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            
            const currentValue = start + (difference * easedProgress);
            
            // Update element text
            if (Number.isInteger(end)) {
                element.textContent = Math.round(currentValue);
            } else {
                element.textContent = Math.round(currentValue * 10) / 10;
            }

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                // Animation completed
                element.textContent = end;
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }
        };

        requestAnimationFrame(step);
    };

    /**
     * DOM helper - Query selector dengan error handling
     * @param {string} selector - CSS selector
     * @param {HTMLElement} parent - Parent element (optional)
     * @returns {HTMLElement|null} - Selected element
     */
    const querySelector = (selector, parent = document) => {
        try {
            return parent.querySelector(selector);
        } catch (error) {
            console.warn(`Invalid selector: ${selector}`, error);
            return null;
        }
    };

    /**
     * DOM helper - Query all selectors dengan error handling
     * @param {string} selector - CSS selector
     * @param {HTMLElement} parent - Parent element (optional)
     * @returns {NodeList|Array} - Selected elements
     */
    const querySelectorAll = (selector, parent = document) => {
        try {
            return parent.querySelectorAll(selector);
        } catch (error) {
            console.warn(`Invalid selector: ${selector}`, error);
            return [];
        }
    };

    /**
     * Add event listener dengan auto cleanup
     * @param {HTMLElement} element - Target element
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     * @param {Object} options - Event options
     * @returns {Function} - Cleanup function
     */
    const addEventListenerWithCleanup = (element, event, handler, options = {}) => {
        if (!element || !event || typeof handler !== 'function') {
            console.warn('Invalid parameters for event listener');
            return () => {};
        }

        element.addEventListener(event, handler, options);
        
        // Return cleanup function
        return () => {
            element.removeEventListener(event, handler, options);
        };
    };

    /**
     * Create element dengan attributes dan children
     * @param {string} tag - HTML tag name
     * @param {Object} attributes - Element attributes
     * @param {Array|string} children - Child elements atau text content
     * @returns {HTMLElement} - Created element
     */
    const createElement = (tag, attributes = {}, children = []) => {
        try {
            const element = document.createElement(tag);
            
            // Set attributes
            Object.entries(attributes).forEach(([key, value]) => {
                if (key === 'className') {
                    element.className = value;
                } else if (key === 'dataset') {
                    Object.entries(value).forEach(([dataKey, dataValue]) => {
                        element.dataset[dataKey] = dataValue;
                    });
                } else if (key.startsWith('on') && typeof value === 'function') {
                    element.addEventListener(key.slice(2).toLowerCase(), value);
                } else {
                    element.setAttribute(key, value);
                }
            });
            
            // Add children
            if (typeof children === 'string') {
                element.textContent = children;
            } else if (Array.isArray(children)) {
                children.forEach(child => {
                    if (typeof child === 'string') {
                        element.appendChild(document.createTextNode(child));
                    } else if (child instanceof HTMLElement) {
                        element.appendChild(child);
                    }
                });
            }
            
            return element;
        } catch (error) {
            console.error('Error creating element:', error);
            return document.createElement('div');
        }
    };

    /**
     * Check apakah user menggunakan mobile device
     * @returns {boolean} - True jika mobile device
     */
    const isMobile = () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               window.innerWidth <= 768;
    };

    /**
     * Check apakah user menggunakan touch device
     * @returns {boolean} - True jika touch device
     */
    const isTouchDevice = () => {
        return ('ontouchstart' in window) || 
               (navigator.maxTouchPoints > 0) || 
               (navigator.msMaxTouchPoints > 0);
    };

    /**
     * Get user's preferred color scheme
     * @returns {string} - 'dark', 'light', atau 'no-preference'
     */
    const getPreferredColorScheme = () => {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }
        return 'no-preference';
    };

    /**
     * Validate apakah nilai adalah valid number
     * @param {any} value - Nilai yang akan divalidate
     * @returns {boolean} - True jika valid number
     */
    const isValidNumber = (value) => {
        return !isNaN(value) && isFinite(value) && typeof value === 'number';
    };

    /**
     * Safe parsing untuk JSON
     * @param {string} jsonString - JSON string
     * @param {any} defaultValue - Default value jika parsing gagal
     * @returns {any} - Parsed object atau default value
     */
    const safeJsonParse = (jsonString, defaultValue = null) => {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            console.warn('JSON parsing failed:', error);
            return defaultValue;
        }
    };

    /**
     * Copy text ke clipboard (modern approach)
     * @param {string} text - Text yang akan dicopy
     * @returns {Promise<boolean>} - Promise yang resolve dengan status success
     */
    const copyToClipboard = async (text) => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback untuk browser lama
                const textArea = createElement('textarea', {
                    value: text,
                    style: 'position: absolute; left: -999999px; top: -999999px;'
                });
                document.body.appendChild(textArea);
                textArea.select();
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                return successful;
            }
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            return false;
        }
    };

    // Export public methods
    // Menggunakan object destructuring untuk clean API
    return {
        debounce,
        throttle,
        randomBetween,
        formatTime,
        formatDate,
        clamp,
        lerp,
        celsiusToFahrenheit,
        convertWindSpeed,
        getWindDirection,
        animateNumber,
        querySelector,
        querySelectorAll,
        addEventListenerWithCleanup,
        createElement,
        isMobile,
        isTouchDevice,
        getPreferredColorScheme,
        isValidNumber,
        safeJsonParse,
        copyToClipboard
    };
})();