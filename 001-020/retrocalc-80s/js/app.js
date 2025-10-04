/* ========================================
   APP.JS - Application Initialization
   File utama yang menghubungkan semua module
   Menerapkan EVENT DELEGATION pattern
   ======================================== */

/**
 * APP MODULE
 * Module utama aplikasi yang:
 * 1. Initialize semua module lain
 * 2. Setup event delegation untuk button clicks
 * 3. Update UI display
 * 4. Coordinate antara Calculator dan KeyboardHandler
 */
const App = (function() {
    
    /* === PRIVATE STATE === */
    
    // Cache DOM elements untuk performa
    // Lebih cepat daripada query selector berulang kali
    let displayCurrent = null;
    let displayPrevious = null;
    let buttonGrid = null;
    
    /* === PRIVATE FUNCTIONS === */
    
    /**
     * Update display kalkulator
     * Function ini dipanggil setiap kali ada perubahan nilai
     */
    function updateDisplay() {
        // Get nilai dari Calculator module
        const currentValue = Calculator.getCurrentValue();
        const previousValue = Calculator.getPreviousValue();
        
        // Update DOM element
        // textContent lebih aman dari innerHTML (prevent XSS)
        displayCurrent.textContent = currentValue;
        displayPrevious.textContent = previousValue || '0';
    }
    
    /**
     * Handle button click menggunakan EVENT DELEGATION
     * Daripada add listener ke setiap button (16 buttons),
     * kita add 1 listener ke parent container (buttonGrid)
     * 
     * @param {Event} event - Click event object
     */
    function handleButtonClick(event) {
        // Event.target adalah element yang di-click
        const target = event.target;
        
        // Cek apakah target adalah button
        // closest() mencari ancestor terdekat yang match selector
        // Berguna jika user click child element dalam button
        const button = target.closest('.btn');
        
        // Jika bukan button, ignore
        if (!button) return;
        
        // Ambil data-action dari button
        // dataset adalah API untuk akses data-* attributes
        const action = button.dataset.action;
        const value = button.dataset.value;
        
        // Process action
        processAction({ action, value });
        
        // Update display setelah action
        updateDisplay();
        
        // Optional: Add haptic feedback di mobile
        // Vibrate 10ms jika browser support
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    }
    
    /**
     * Process action dari button click atau keyboard
     * Function ini di-share antara button click dan keyboard handler
     * 
     * @param {object} actionData - Object dengan action dan value
     */
    function processAction(actionData) {
        const { action, value } = actionData;
        
        // Switch berdasarkan action type
        switch(action) {
            case 'number':
                // Input digit atau decimal
                Calculator.inputDigit(value);
                break;
                
            case 'operator':
                // Input operator matematika
                Calculator.inputOperator(value);
                break;
                
            case 'equals':
                // Calculate hasil
                Calculator.calculate();
                break;
                
            case 'clear':
                // Clear semua
                Calculator.clear();
                break;
                
            case 'delete':
                // Delete satu digit
                Calculator.deleteDigit();
                break;
                
            default:
                // Unknown action, log warning
                console.warn('Unknown action:', action);
        }
    }
    
    /**
     * Setup event delegation untuk button clicks
     * EVENT DELEGATION PATTERN:
     * - Add 1 event listener ke parent
     * - Leverage event bubbling
     * - Check event.target untuk tahu element mana yang di-click
     * 
     * KEUNTUNGAN:
     * - Lebih efisien memory (1 listener vs 16 listeners)
     * - Otomatis handle button yang ditambah dinamis
     * - Lebih mudah manage (1 function untuk semua button)
     */
    function setupEventDelegation() {
        // Add click listener ke button grid container
        // Event akan bubble up dari button ke buttonGrid
        buttonGrid.addEventListener('click', handleButtonClick);
        
        console.log('🎯 Event delegation setup complete');
    }
    
    /**
     * Setup keyboard support
     * Integrate dengan KeyboardHandler module
     */
    function setupKeyboard() {
        // Initialize keyboard handler dengan callback
        // Callback akan dipanggil saat key ditekan
        KeyboardHandler.init(function(actionData) {
            // Process action sama seperti button click
            processAction(actionData);
            // Update display
            updateDisplay();
        });
        
        console.log('⌨️ Keyboard support enabled');
    }
    
    /**
     * Cache DOM elements
     * Query selector hanya sekali di awal untuk performa
     */
    function cacheDOMElements() {
        displayCurrent = document.getElementById('currentDisplay');
        displayPrevious = document.getElementById('previousDisplay');
        buttonGrid = document.querySelector('.button-grid');
        
        // Validasi: pastikan semua element ditemukan
        if (!displayCurrent || !displayPrevious || !buttonGrid) {
            throw new Error('Required DOM elements not found!');
        }
        
        console.log('📦 DOM elements cached');
    }
    
    /**
     * Initialize animasi intro (optional)
     * Memberikan smooth entrance animation
     */
    function initIntroAnimation() {
        const container = document.querySelector('.calculator-container');
        
        // Start dengan opacity 0 dan transform
        container.style.opacity = '0';
        container.style.transform = 'translateY(20px) scale(0.95)';
        
        // Animate ke visible
        // requestAnimationFrame untuk smooth animation
        requestAnimationFrame(() => {
            container.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            container.style.opacity = '1';
            container.style.transform = 'translateY(0) scale(1)';
        });
    }
    
    /* === PUBLIC FUNCTIONS === */
    
    /**
     * Initialize aplikasi
     * Function ini dipanggil saat DOM ready
     */
    function init() {
        console.log('🚀 Initializing RetroCalc 80s...');
        
        try {
            // 1. Cache DOM elements
            cacheDOMElements();
            
            // 2. Setup event delegation untuk buttons
            setupEventDelegation();
            
            // 3. Setup keyboard support
            setupKeyboard();
            
            // 4. Initial display update
            updateDisplay();
            
            // 5. Intro animation (optional)
            initIntroAnimation();
            
            console.log('✅ App initialized successfully!');
            console.log('💡 Try keyboard: Numbers, +, -, *, /, Enter, Escape, Backspace');
            
        } catch (error) {
            console.error('❌ Initialization error:', error);
            alert('Failed to initialize calculator. Please refresh the page.');
        }
    }
    
    /**
     * Cleanup function (jika diperlukan)
     * Untuk remove event listeners dan cleanup resources
     */
    function destroy() {
        // Remove event listeners
        if (buttonGrid) {
            buttonGrid.removeEventListener('click', handleButtonClick);
        }
        
        // Destroy keyboard handler
        KeyboardHandler.destroy();
        
        console.log('🧹 App cleaned up');
    }
    
    /* === REVEALING MODULE PATTERN === */
    return {
        init,
        destroy
    };
    
})(); // IIFE

/* ========================================
   DOM READY - ENTRY POINT
   ======================================== */

/**
 * Wait sampai DOM fully loaded sebelum initialize app
 * 
 * ADA 3 CARA UTAMA:
 * 
 * 1. DOMContentLoaded (RECOMMENDED - dipakai di sini)
 *    - Trigger saat HTML selesai parsed
 *    - Tidak tunggu images, stylesheets, dll
 *    - Paling cepat
 * 
 * 2. window.onload
 *    - Trigger saat semua resources loaded (images, css, etc)
 *    - Lebih lambat
 * 
 * 3. defer attribute di script tag
 *    - Script dijalankan setelah HTML parsed
 *    - Tidak perlu event listener
 */

// Check apakah document sudah ready
if (document.readyState === 'loading') {
    // Masih loading, tunggu event DOMContentLoaded
    document.addEventListener('DOMContentLoaded', App.init);
} else {
    // Sudah ready, init langsung
    // Ini terjadi jika script diload setelah DOM ready
    App.init();
}

/* ========================================
   GLOBAL ERROR HANDLER (Optional)
   ======================================== */

/**
 * Catch unhandled errors
 * Bagus untuk production debugging
 */
window.addEventListener('error', function(event) {
    console.error('💥 Global error:', event.error);
    // Bisa kirim ke error tracking service (Sentry, LogRocket, etc)
});

/**
 * Catch unhandled promise rejections
 */
window.addEventListener('unhandledrejection', function(event) {
    console.error('💥 Unhandled promise rejection:', event.reason);
});

/* ========================================
   PEMBAHASAN TEKNIK EVENT DELEGATION
   ======================================== */

/*
 * APA ITU EVENT DELEGATION?
 * 
 * Event Delegation adalah teknik di mana kita menambahkan event listener
 * ke PARENT element, bukan ke setiap CHILD element.
 * 
 * CONTOH TANPA DELEGATION (❌ Tidak efisien):
 * 
 * const buttons = document.querySelectorAll('.btn');
 * buttons.forEach(button => {
 *     button.addEventListener('click', handleClick); // 16 listeners!
 * });
 * 
 * DENGAN DELEGATION (✅ Efisien):
 * 
 * const buttonGrid = document.querySelector('.button-grid');
 * buttonGrid.addEventListener('click', handleClick); // 1 listener!
 * 
 * 
 * CARA KERJA:
 * 
 * 1. User click button
 * 2. Event "bubble up" dari button -> buttonGrid -> body -> html
 * 3. Listener di buttonGrid catch event
 * 4. Kita check event.target untuk tahu button mana yang di-click
 * 
 * 
 * KEUNTUNGAN EVENT DELEGATION:
 * 
 * 1. MEMORY EFFICIENT
 *    - 1 listener vs banyak listener
 *    - Hemat memory terutama untuk banyak element
 * 
 * 2. DYNAMIC CONTENT
 *    - Otomatis handle element yang ditambah kemudian
 *    - Tidak perlu re-attach listener
 * 
 * 3. EASIER TO MAINTAIN
 *    - Satu function untuk handle semua clicks
 *    - Lebih mudah debug
 * 
 * 4. BETTER PERFORMANCE
 *    - Browser tidak perlu track banyak listeners
 *    - Faster initialization
 * 
 * 
 * KAPAN PAKAI EVENT DELEGATION?
 * 
 * ✅ Gunakan untuk:
 * - List items (todo list, table rows, dll)
 * - Buttons dalam container
 * - Menu items
 * - Grid/tile systems
 * 
 * ❌ Jangan gunakan untuk:
 * - Events yang tidak bubble (focus, blur, dll)
 * - Single element yang perlu specific handler
 * - Performance-critical interactions (misal game controls)
 * 
 * 
 * BEST PRACTICES:
 * 
 * 1. Gunakan data-* attributes untuk menyimpan info
 *    <button data-action="clear" data-value="AC">
 * 
 * 2. Gunakan event.target.closest() untuk robustness
 *    Handle jika user click child element dalam button
 * 
 * 3. Check null/undefined sebelum process
 *    if (!button) return;
 * 
 * 4. Gunakan event.stopPropagation() jika perlu
 *    Mencegah event bubble lebih jauh
 */

/* ========================================
   PEMBAHASAN KEYBOARD SUPPORT
   ======================================== */

/*
 * KEYBOARD SUPPORT IMPLEMENTATION
 * 
 * Di project ini, keyboard support diimplementasikan dengan:
 * 
 * 1. KEY MAPPING
 *    - Mapping keyboard key ke action kalkulator
 *    - Stored dalam object keyMap
 * 
 * 2. EVENT LISTENER
 *    - Listen ke event 'keydown' di document level
 *    - Check apakah key ada dalam keyMap
 * 
 * 3. VISUAL FEEDBACK
 *    - Highlight button yang sesuai dengan key
 *    - Memberikan confirmation ke user
 * 
 * 4. SHARED LOGIC
 *    - Button click dan keyboard menggunakan function yang sama
 *    - DRY principle (Don't Repeat Yourself)
 * 
 * 
 * ACCESSIBILITY BENEFITS:
 * 
 * - Power users bisa lebih cepat input
 * - Users dengan motor impairments bisa gunakan keyboard
 * - Keyboard-only navigation support
 * - Follows WCAG guidelines
 * 
 * 
 * BEST PRACTICES KEYBOARD SUPPORT:
 * 
 * 1. Support standard keys (Enter, Escape, Arrow keys)
 * 2. Provide visual feedback
 * 3. Document keyboard shortcuts
 * 4. Test dengan screen readers
 * 5. Support numpad keys
 */