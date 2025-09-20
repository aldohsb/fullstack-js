/**
 * =====================================================
 * AURORA SLIDER - Nordic Themed Image Carousel
 * =====================================================
 * Modern JavaScript ES2025 dengan modular programming
 * Fitur: Auto-slide, responsive images, touch gestures
 */

'use strict';

// =====================================================
// CONFIGURATION & DATA
// =====================================================

/**
 * Konfigurasi default slider
 */
const SLIDER_CONFIG = {
    autoPlay: true,
    interval: 3000,
    animationDuration: 500,
    touchThreshold: 50,
    keyboardNavigation: true,
    pauseOnHover: true,
    lazyLoading: true,
    preloadNext: 2
};

/**
 * Data slides - bisa diganti dengan data dinamis
 */
const SLIDES_DATA = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200&h=800&fit=crop&q=80',
        title: 'Northern Lights',
        description: 'Experience the magical aurora borealis dancing across the Nordic sky in ethereal blues and purples.',
        alt: 'Northern Lights Aurora'
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop&q=80',
        title: 'Arctic Wilderness',
        description: 'Pristine frozen landscapes where nature paints the sky with cosmic colors every winter night.',
        alt: 'Arctic Landscape'
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1647292545204-1c537d2ffb71?w=1200&h=800&fit=crop&q=80',
        title: 'Mountain Aurora',
        description: 'Majestic auroras crowning snow-capped peaks in a symphony of celestial light.',
        alt: 'Aurora Over Mountains'
    },
    {
        id: 4,
        image: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=1200&h=800&fit=crop&q=80',
        title: 'Aurora Reflection',
        description: 'Aurora lights perfectly mirrored in crystal clear Nordic lakes, doubling the magic.',
        alt: 'Aurora Reflection'
    },
    {
        id: 5,
        image: 'https://images.unsplash.com/photo-1645235142939-096560a17aab?w=1200&h=800&fit=crop&q=80',
        title: 'Cosmic Dance',
        description: 'Witness the celestial ballet as solar winds create spectacular light shows.',
        alt: 'Aurora Cosmic Dance'
    }
];

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Utility functions untuk operasi umum
 */
const Utils = {
    /**
     * Debounce function untuk optimize performance
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function untuk scroll/resize events
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Check if element is in viewport
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    /**
     * Format time dari milliseconds ke detik
     */
    formatTime(ms) {
        return `${Math.round(ms / 1000)}s`;
    },

    /**
     * Generate unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

// =====================================================
// IMAGE LOADER MODULE
// =====================================================

/**
 * Module untuk lazy loading dan preloading images
 */
const ImageLoader = {
    /**
     * Cache untuk loaded images
     */
    cache: new Map(),

    /**
     * Load image dengan promise
     */
    async loadImage(src) {
        return new Promise((resolve, reject) => {
            // Check cache terlebih dahulu
            if (this.cache.has(src)) {
                resolve(this.cache.get(src));
                return;
            }

            const img = new Image();
            
            img.onload = () => {
                this.cache.set(src, img);
                resolve(img);
            };
            
            img.onerror = () => {
                console.error(`Failed to load image: ${src}`);
                reject(new Error(`Image load failed: ${src}`));
            };
            
            // Set responsive srcset untuk different screen sizes
            img.src = src;
        });
    },

    /**
     * Preload images untuk better performance
     */
    async preloadImages(imageSources, onProgress = null) {
        const total = imageSources.length;
        let loaded = 0;

        const promises = imageSources.map(async (src) => {
            try {
                await this.loadImage(src);
                loaded++;
                if (onProgress) {
                    onProgress(loaded, total);
                }
            } catch (error) {
                console.warn(`Preload failed for: ${src}`, error);
            }
        });

        return Promise.allSettled(promises);
    },

    /**
     * Get responsive image URL based on screen size
     */
    getResponsiveUrl(baseUrl, width = window.innerWidth) {
        // Determine optimal width based on device pixel ratio
        const dpr = window.devicePixelRatio || 1;
        const targetWidth = Math.ceil(width * dpr);
        
        // Add responsive parameters to Unsplash URL
        return baseUrl.replace(/w=\d+/, `w=${targetWidth}`);
    }
};

// =====================================================
// TOUCH GESTURE HANDLER
// =====================================================

/**
 * Module untuk handle touch gestures pada mobile
 */
const TouchHandler = {
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isDragging: false,

    /**
     * Initialize touch events
     */
    init(element, callbacks) {
        this.element = element;
        this.callbacks = callbacks;

        // Touch events
        element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });

        // Mouse events untuk desktop drag
        element.addEventListener('mousedown', this.handleMouseDown.bind(this));
        element.addEventListener('mousemove', this.handleMouseMove.bind(this));
        element.addEventListener('mouseup', this.handleMouseUp.bind(this));
        element.addEventListener('mouseleave', this.handleMouseUp.bind(this));

        // Prevent context menu
        element.addEventListener('contextmenu', (e) => e.preventDefault());
    },

    /**
     * Handle touch start
     */
    handleTouchStart(e) {
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
        this.isDragging = false;
        
        if (this.callbacks.onStart) {
            this.callbacks.onStart();
        }
    },

    /**
     * Handle touch move
     */
    handleTouchMove(e) {
        if (!this.startX) return;

        this.currentX = e.touches[0].clientX;
        this.currentY = e.touches[0].clientY;

        const deltaX = this.currentX - this.startX;
        const deltaY = this.currentY - this.startY;

        // Check if it's horizontal swipe
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
            e.preventDefault(); // Prevent scroll
            this.isDragging = true;
            
            if (this.callbacks.onMove) {
                this.callbacks.onMove(deltaX);
            }
        }
    },

    /**
     * Handle touch end
     */
    handleTouchEnd(e) {
        if (!this.startX || !this.isDragging) {
            this.reset();
            return;
        }

        const deltaX = this.currentX - this.startX;
        const threshold = SLIDER_CONFIG.touchThreshold;

        if (Math.abs(deltaX) > threshold) {
            if (deltaX > 0) {
                this.callbacks.onSwipeRight?.();
            } else {
                this.callbacks.onSwipeLeft?.();
            }
        }

        if (this.callbacks.onEnd) {
            this.callbacks.onEnd();
        }

        this.reset();
    },

    /**
     * Handle mouse events untuk desktop
     */
    handleMouseDown(e) {
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.isDragging = false;
        
        if (this.callbacks.onStart) {
            this.callbacks.onStart();
        }
    },

    handleMouseMove(e) {
        if (!this.startX) return;

        this.currentX = e.clientX;
        this.currentY = e.clientY;

        const deltaX = this.currentX - this.startX;
        const deltaY = this.currentY - this.startY;

        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
            this.isDragging = true;
            
            if (this.callbacks.onMove) {
                this.callbacks.onMove(deltaX);
            }
        }
    },

    handleMouseUp(e) {
        if (!this.startX || !this.isDragging) {
            this.reset();
            return;
        }

        const deltaX = this.currentX - this.startX;
        const threshold = SLIDER_CONFIG.touchThreshold;

        if (Math.abs(deltaX) > threshold) {
            if (deltaX > 0) {
                this.callbacks.onSwipeRight?.();
            } else {
                this.callbacks.onSwipeLeft?.();
            }
        }

        if (this.callbacks.onEnd) {
            this.callbacks.onEnd();
        }

        this.reset();
    },

    /**
     * Reset touch state
     */
    reset() {
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.isDragging = false;
    }
};

// =====================================================
// MAIN AURORA SLIDER CLASS
// =====================================================

/**
 * Main Aurora Slider class dengan semua functionality
 */
class AuroraSlider {
    constructor(element, options = {}) {
        this.container = element;
        this.config = { ...SLIDER_CONFIG, ...options };
        this.slides = [...SLIDES_DATA];
        
        // State management
        this.currentIndex = 0;
        this.isPlaying = this.config.autoPlay;
        this.intervalId = null;
        this.isTransitioning = false;
        
        // DOM elements
        this.wrapper = null;
        this.slideElements = [];
        this.indicators = [];
        this.prevBtn = null;
        this.nextBtn = null;
        this.playPauseBtn = null;
        this.speedRange = null;
        this.speedValue = null;

        // Initialize slider
        this.init();
    }

    /**
     * Initialize slider
     */
    async init() {
        try {
            console.log('🚀 Initializing Aurora Slider...');
            
            // Find DOM elements
            this.findElements();
            
            // Generate slides HTML
            await this.generateSlides();
            
            // Generate indicators
            this.generateIndicators();
            
            // Bind events
            this.bindEvents();
            
            // Setup touch gestures
            this.setupTouchGestures();
            
            // Setup keyboard navigation
            this.setupKeyboardNavigation();
            
            // Preload images
            await this.preloadImages();
            
            // Start autoplay if enabled
            if (this.isPlaying) {
                this.startAutoPlay();
            }
            
            // Update UI
            this.updateUI();
            
            console.log('✅ Aurora Slider initialized successfully!');
        } catch (error) {
            console.error('❌ Failed to initialize Aurora Slider:', error);
        }
    }

    /**
     * Find DOM elements
     */
    findElements() {
        this.wrapper = this.container.querySelector('#sliderWrapper');
        this.prevBtn = this.container.querySelector('#prevBtn');
        this.nextBtn = this.container.querySelector('#nextBtn');
        this.playPauseBtn = document.querySelector('#playPauseBtn');
        this.speedRange = document.querySelector('#speedRange');
        this.speedValue = document.querySelector('#speedValue');
        
        if (!this.wrapper) {
            throw new Error('Slider wrapper not found');
        }
    }

    /**
     * Generate slides HTML
     */
    async generateSlides() {
        this.wrapper.innerHTML = '';
        this.slideElements = [];

        for (let i = 0; i < this.slides.length; i++) {
            const slide = this.slides[i];
            const slideElement = this.createSlideElement(slide, i);
            
            this.wrapper.appendChild(slideElement);
            this.slideElements.push(slideElement);
        }

        // Set first slide as active
        this.slideElements[0]?.classList.add('active');
    }

    /**
     * Create individual slide element
     */
    createSlideElement(slide, index) {
        const slideDiv = document.createElement('div');
        slideDiv.className = 'slide-item';
        slideDiv.dataset.index = index;

        // Get responsive image URL
        const responsiveUrl = ImageLoader.getResponsiveUrl(slide.image);

        slideDiv.innerHTML = `
            <img src="${responsiveUrl}" 
                 alt="${slide.alt}" 
                 class="slide-image"
                 loading="${index === 0 ? 'eager' : 'lazy'}">
            <div class="slide-overlay"></div>
            <div class="slide-content">
                <h2 class="slide-title">${slide.title}</h2>
                <p class="slide-description">${slide.description}</p>
            </div>
        `;

        return slideDiv;
    }

    /**
     * Generate indicators
     */
    generateIndicators() {
        const indicatorsContainer = this.container.querySelector('#sliderIndicators');
        if (!indicatorsContainer) return;

        indicatorsContainer.innerHTML = '';
        this.indicators = [];

        for (let i = 0; i < this.slides.length; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'indicator';
            indicator.dataset.index = i;
            indicator.setAttribute('aria-label', `Go to slide ${i + 1}`);
            
            if (i === 0) {
                indicator.classList.add('active');
            }

            indicatorsContainer.appendChild(indicator);
            this.indicators.push(indicator);
        }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Navigation buttons
        this.prevBtn?.addEventListener('click', () => this.goToPrevious());
        this.nextBtn?.addEventListener('click', () => this.goToNext());

        // Indicators
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });

        // Play/Pause button
        this.playPauseBtn?.addEventListener('click', () => this.togglePlayPause());

        // Speed control
        this.speedRange?.addEventListener('input', (e) => this.updateSpeed(parseInt(e.target.value)));

        // Pause on hover
        if (this.config.pauseOnHover) {
            this.container.addEventListener('mouseenter', () => this.pauseAutoPlay());
            this.container.addEventListener('mouseleave', () => {
                if (this.isPlaying) this.startAutoPlay();
            });
        }

        // Visibility API untuk pause saat tab tidak aktif
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoPlay();
            } else if (this.isPlaying) {
                this.startAutoPlay();
            }
        });

        // Window resize untuk responsive
        window.addEventListener('resize', 
            Utils.throttle(() => this.handleResize(), 250)
        );
    }

    /**
     * Setup touch gestures
     */
    setupTouchGestures() {
        TouchHandler.init(this.container, {
            onStart: () => {
                this.pauseAutoPlay();
            },
            onMove: (deltaX) => {
                // Visual feedback saat dragging
                const percentage = (deltaX / this.container.offsetWidth) * 100;
                this.wrapper.style.transform = `translateX(calc(-${this.currentIndex * 100}% + ${percentage}px))`;
            },
            onSwipeLeft: () => {
                this.goToNext();
            },
            onSwipeRight: () => {
                this.goToPrevious();
            },
            onEnd: () => {
                // Reset transform
                this.wrapper.style.transform = `translateX(-${this.currentIndex * 100}%)`;
                
                // Resume autoplay jika masih playing
                if (this.isPlaying) {
                    this.startAutoPlay();
                }
            }
        });
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        if (!this.config.keyboardNavigation) return;

        document.addEventListener('keydown', (e) => {
            // Only handle jika slider in viewport
            if (!Utils.isInViewport(this.container)) return;

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.goToPrevious();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.goToNext();
                    break;
                case ' ': // Spacebar
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(0);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.slides.length - 1);
                    break;
            }
        });
    }

    /**
     * Preload images untuk better performance
     */
    async preloadImages() {
        const imageSources = this.slides.map(slide => 
            ImageLoader.getResponsiveUrl(slide.image)
        );

        try {
            await ImageLoader.preloadImages(imageSources, (loaded, total) => {
                console.log(`📸 Preloaded ${loaded}/${total} images`);
            });
            console.log('✅ All images preloaded successfully');
        } catch (error) {
            console.warn('⚠️ Some images failed to preload:', error);
        }
    }

    /**
     * Go to specific slide
     */
    goToSlide(index, direction = 'auto') {
        if (this.isTransitioning || index === this.currentIndex) return;
        if (index < 0 || index >= this.slides.length) return;

        this.isTransitioning = true;
        
        // Update state
        const previousIndex = this.currentIndex;
        this.currentIndex = index;

        // Update transform
        this.wrapper.style.transform = `translateX(-${this.currentIndex * 100}%)`;

        // Update active states
        this.updateActiveStates();

        // Update UI
        this.updateUI();

        // Handle transition end
        setTimeout(() => {
            this.isTransitioning = false;
        }, this.config.animationDuration);

        // Emit event
        this.emit('slideChange', {
            from: previousIndex,
            to: this.currentIndex,
            direction
        });
    }

    /**
     * Go to next slide
     */
    goToNext() {
        const nextIndex = (this.currentIndex + 1) % this.slides.length;
        this.goToSlide(nextIndex, 'next');
    }

    /**
     * Go to previous slide
     */
    goToPrevious() {
        const prevIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(prevIndex, 'prev');
    }

    /**
     * Update active states
     */
    updateActiveStates() {
        // Update slide active state
        this.slideElements.forEach((slide, index) => {
            slide.classList.toggle('active', index === this.currentIndex);
        });

        // Update indicator active state
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });
    }

    /**
     * Start auto play
     */
    startAutoPlay() {
        if (!this.config.autoPlay) return;
        
        this.pauseAutoPlay(); // Clear existing interval
        
        this.intervalId = setInterval(() => {
            this.goToNext();
        }, this.config.interval);
    }

    /**
     * Pause auto play
     */
    pauseAutoPlay() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * Toggle play/pause
     */
    togglePlayPause() {
        this.isPlaying = !this.isPlaying;
        
        if (this.isPlaying) {
            this.startAutoPlay();
        } else {
            this.pauseAutoPlay();
        }

        this.updateUI();
    }

    /**
     * Update speed
     */
    updateSpeed(newSpeed) {
        this.config.interval = newSpeed;
        
        if (this.isPlaying) {
            this.startAutoPlay(); // Restart dengan speed baru
        }

        this.updateUI();
    }

    /**
     * Update UI elements
     */
    updateUI() {
        // Update play/pause button
        if (this.playPauseBtn) {
            const icon = this.playPauseBtn.querySelector('.play-icon');
            const text = this.playPauseBtn.querySelector('.control-text');
            
            if (this.isPlaying) {
                icon.textContent = '⏸️';
                text.textContent = 'Pause';
            } else {
                icon.textContent = '▶️';
                text.textContent = 'Play';
            }
        }

        // Update speed display
        if (this.speedValue) {
            this.speedValue.textContent = Utils.formatTime(this.config.interval);
        }

        // Update range value
        if (this.speedRange) {
            this.speedRange.value = this.config.interval;
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Update responsive images
        this.slideElements.forEach((slide, index) => {
            const img = slide.querySelector('.slide-image');
            if (img) {
                const responsiveUrl = ImageLoader.getResponsiveUrl(this.slides[index].image);
                if (img.src !== responsiveUrl) {
                    img.src = responsiveUrl;
                }
            }
        });

        // Reset transform
        this.wrapper.style.transform = `translateX(-${this.currentIndex * 100}%)`;
    }

    /**
     * Simple event emitter
     */
    emit(eventName, data) {
        const event = new CustomEvent(`aurora:${eventName}`, { 
            detail: data 
        });
        this.container.dispatchEvent(event);
    }

    /**
     * Destroy slider
     */
    destroy() {
        this.pauseAutoPlay();
        // Remove event listeners dan cleanup
        console.log('🗑️ Aurora Slider destroyed');
    }
}

// =====================================================
// INITIALIZATION
// =====================================================

/**
 * Initialize Aurora Slider saat DOM ready
 */
document.addEventListener('DOMContentLoaded', () => {
    const sliderElement = document.querySelector('#auroraSlider');
    
    if (sliderElement) {
        // Initialize slider
        const auroraSlider = new AuroraSlider(sliderElement, {
            autoPlay: true,
            interval: 3000,
            pauseOnHover: true,
            keyboardNavigation: true
        });

        // Listen to custom events
        sliderElement.addEventListener('aurora:slideChange', (e) => {
            console.log('🎯 Slide changed:', e.detail);
        });

        // Make globally accessible untuk debugging
        window.auroraSlider = auroraSlider;
        
        console.log('🌟 Aurora Slider ready to rock!');
    } else {
        console.error('❌ Aurora Slider element not found');
    }
});