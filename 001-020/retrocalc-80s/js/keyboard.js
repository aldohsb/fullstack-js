/* ========================================
   KEYBOARD.JS - Keyboard Support Module
   Module untuk menangani input dari keyboard
   Menerapkan MODULAR PROGRAMMING pattern
   ======================================== */

/**
 * KEYBOARD MODULE
 * Module untuk handle semua keyboard input
 * Menggunakan Revealing Module Pattern
 */
const KeyboardHandler = (function() {
    
    /* === PRIVATE STATE === */
    
    // Mapping key keyboard ke action kalkulator
    const keyMap = {
        // Angka 0-9
        '0': { action: 'number', value: '0' },
        '1': { action: 'number', value: '1' },
        '2': { action: 'number', value: '2' },
        '3': { action: 'number', value: '3' },
        '4': { action: 'number', value: '4' },
        '5': { action: 'number', value: '5' },
        '6': { action: 'number', value: '6' },
        '7': { action: 'number', value: '7' },
        '8': { action: 'number', value: '8' },
        '9': { action: 'number', value: '9' },
        
        // Desimal
        '.': { action: 'number', value: '.' },
        ',': { action: 'number', value: '.' }, // Comma juga untuk desimal (keyboard numpad)
        
        // Operator
        '+': { action: 'operator', value: '+' },
        '-': { action: 'operator', value: '-' },
        '*': { action: 'operator', value: '×' }, // Asterisk mapping ke multiply
        'x': { action: 'operator', value: '×' }, // X juga untuk multiply
        'X': { action: 'operator', value: '×' }, // X kapital
        '/': { action: 'operator', value: '÷' }, // Slash mapping ke divide
        '%': { action: 'operator', value: '%' },
        
        // Function keys
        'Enter': { action: 'equals' },          // Enter untuk calculate
        '=': { action: 'equals' },              // Equals
        'Escape': { action: 'clear' },          // ESC untuk clear
        'Backspace': { action: 'delete' },      // Backspace untuk delete
        'Delete': { action: 'delete' }          // Delete key juga untuk delete
    };
    
    // Callback yang akan dipanggil saat ada key press
    let onKeyPressCallback = null;
    
    /* === PRIVATE FUNCTIONS === */
    
    /**
     * Handler untuk event keydown
     * @param {KeyboardEvent} event - Event object dari keyboard
     */
    function handleKeyDown(event) {
        // Ambil key yang ditekan
        const key = event.key;
        
        // Cek apakah key ada dalam keyMap
        if (keyMap[key]) {
            // Prevent default behavior (misalnya space scrolling page)
            event.preventDefault();
            
            // Ambil mapping action dari keyMap
            const mapping = keyMap[key];
            
            // Jika ada callback, panggil dengan data mapping
            if (onKeyPressCallback) {
                onKeyPressCallback(mapping);
            }
            
            // Visual feedback: highlight tombol yang sesuai
            highlightButton(mapping);
        }
    }
    
    /**
     * Highlight tombol yang sesuai dengan key yang ditekan
     * Memberikan visual feedback ke user
     * @param {object} mapping - Object dengan action dan value
     */
    function highlightButton(mapping) {
        // Selector untuk mencari tombol yang sesuai
        let selector = '';
        
        // Build selector berdasarkan action
        if (mapping.action === 'number') {
            // Cari button dengan data-action="number" dan data-value="x"
            selector = `button[data-action="number"][data-value="${mapping.value}"]`;
        } else if (mapping.action === 'operator') {
            // Cari button dengan data-action="operator" dan data-value="x"
            selector = `button[data-action="operator"][data-value="${mapping.value}"]`;
        } else if (mapping.action === 'equals') {
            // Cari button dengan data-action="equals"
            selector = 'button[data-action="equals"]';
        } else if (mapping.action === 'clear') {
            // Cari button dengan data-action="clear"
            selector = 'button[data-action="clear"]';
        } else if (mapping.action === 'delete') {
            // Cari button dengan data-action="delete"
            selector = 'button[data-action="delete"]';
        }
        
        // Cari element dengan selector
        const button = document.querySelector(selector);
        
        if (button) {
            // Tambahkan class untuk highlight (bisa ditambahkan di CSS)
            button.style.transform = 'scale(0.95)';
            button.style.filter = 'brightness(1.3)';
            
            // Hapus highlight setelah 150ms
            setTimeout(() => {
                button.style.transform = '';
                button.style.filter = '';
            }, 150);
        }
    }
    
    /* === PUBLIC FUNCTIONS === */
    
    /**
     * Initialize keyboard handler
     * Menambahkan event listener ke document
     * @param {function} callback - Function yang dipanggil saat key ditekan
     */
    function init(callback) {
        // Simpan callback
        onKeyPressCallback = callback;
        
        // Add event listener ke document untuk keydown
        // Menggunakan addEventListener (modern way)
        document.addEventListener('keydown', handleKeyDown);
        
        // Log untuk debugging (bisa dihapus di production)
        console.log('⌨️ Keyboard handler initialized');
    }
    
    /**
     * Destroy keyboard handler
     * Menghapus event listener (untuk cleanup)
     */
    function destroy() {
        // Remove event listener
        document.removeEventListener('keydown', handleKeyDown);
        onKeyPressCallback = null;
        
        console.log('⌨️ Keyboard handler destroyed');
    }
    
    /**
     * Get semua key yang supported
     * @returns {array} - Array of supported keys
     */
    function getSupportedKeys() {
        return Object.keys(keyMap);
    }
    
    /* === REVEALING MODULE PATTERN === */
    return {
        init,              // Initialize handler
        destroy,           // Cleanup handler
        getSupportedKeys   // Get list supported keys
    };
    
})(); // IIFE

/*
 * CARA KERJA KEYBOARD MODULE:
 * 
 * 1. Saat user menekan key, browser trigger event 'keydown'
 * 2. Handler handleKeyDown() akan dipanggil
 * 3. Key yang ditekan dicek di keyMap
 * 4. Jika key valid, callback dipanggil dengan mapping data
 * 5. Button di UI juga di-highlight untuk visual feedback
 * 
 * KEUNTUNGAN MODULE PATTERN:
 * - Encapsulation: keyMap dan handler function private
 * - Reusable: bisa digunakan di project lain
 * - Maintainable: logika keyboard terpisah dari logika kalkulator
 * - Testable: mudah untuk unit testing
 */