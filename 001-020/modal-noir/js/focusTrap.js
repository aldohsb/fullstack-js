/**
 * ============================================
 * FOCUS TRAP MODULE
 * ============================================
 * 
 * Module untuk mengelola focus trap di dalam modal.
 * Focus trap memastikan keyboard navigation (Tab) tetap
 * berada di dalam modal dan tidak "keluar" ke elemen
 * di belakang modal.
 * 
 * Ini penting untuk ACCESSIBILITY dan UX yang baik.
 */

/**
 * Class FocusTrap
 * Mengelola focus trap untuk sebuah container element
 */
class FocusTrap {
    /**
     * Constructor
     * @param {HTMLElement} element - Element container untuk focus trap
     */
    constructor(element) {
        // Simpan reference ke container element
        this.element = element;
        
        // Element yang memiliki focus sebelum trap diaktifkan
        this.previouslyFocusedElement = null;
        
        // Bound function untuk event handler
        // Bind diperlukan agar 'this' tetap merujuk ke instance class
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }
    
    /**
     * Mendapatkan semua focusable elements di dalam container
     * @returns {Array} Array of focusable elements
     */
    getFocusableElements() {
        // Selector untuk semua elemen yang bisa di-focus
        // Menggunakan CSS selector untuk query elements
        const focusableSelectors = [
            'a[href]',                          // Link dengan href
            'button:not([disabled])',           // Button yang tidak disabled
            'textarea:not([disabled])',         // Textarea aktif
            'input:not([disabled])',            // Input aktif
            'select:not([disabled])',           // Select aktif
            '[tabindex]:not([tabindex="-1"])'   // Element dengan tabindex >= 0
        ].join(', '); // Join dengan koma untuk multiple selectors
        
        // Query all focusable elements dalam container
        const focusableElements = this.element.querySelectorAll(focusableSelectors);
        
        // Convert NodeList ke Array untuk kemudahan manipulasi
        // Menggunakan spread operator (...)
        return [...focusableElements];
    }
    
    /**
     * Handle keydown event untuk trap focus
     * @param {KeyboardEvent} event - Keyboard event object
     */
    handleKeyDown(event) {
        // Cek apakah tombol yang ditekan adalah Tab
        // event.key === 'Tab' untuk modern browsers
        if (event.key !== 'Tab') {
            // Jika bukan Tab, abaikan
            return;
        }
        
        // Dapatkan semua focusable elements
        const focusableElements = this.getFocusableElements();
        
        // Jika tidak ada focusable elements, abaikan
        if (focusableElements.length === 0) {
            return;
        }
        
        // Element pertama dan terakhir yang bisa di-focus
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        // Cek apakah Shift key juga ditekan (Tab mundur)
        if (event.shiftKey) {
            // === TAB MUNDUR (Shift + Tab) ===
            
            // Jika focus ada di element pertama
            if (document.activeElement === firstFocusable) {
                // Prevent default behavior (pindah ke element sebelumnya di luar modal)
                event.preventDefault();
                
                // Pindahkan focus ke element terakhir (loop ke belakang)
                lastFocusable.focus();
            }
        } else {
            // === TAB MAJU ===
            
            // Jika focus ada di element terakhir
            if (document.activeElement === lastFocusable) {
                // Prevent default behavior
                event.preventDefault();
                
                // Pindahkan focus ke element pertama (loop ke depan)
                firstFocusable.focus();
            }
        }
    }
    
    /**
     * Aktifkan focus trap
     * Dipanggil saat modal dibuka
     */
    activate() {
        // Simpan element yang sedang di-focus sebelum modal dibuka
        // Untuk di-restore nanti saat modal ditutup
        this.previouslyFocusedElement = document.activeElement;
        
        // Dapatkan focusable elements
        const focusableElements = this.getFocusableElements();
        
        // Jika ada focusable elements
        if (focusableElements.length > 0) {
            // Focus ke element pertama
            // Menggunakan setTimeout untuk memastikan modal sudah visible
            setTimeout(() => {
                focusableElements[0].focus();
            }, 100); // Delay 100ms
        }
        
        // Tambahkan event listener untuk keydown
        // Menggunakan document agar menangkap semua keyboard event
        document.addEventListener('keydown', this.handleKeyDown);
    }
    
    /**
     * Deaktivkan focus trap
     * Dipanggil saat modal ditutup
     */
    deactivate() {
        // Hapus event listener
        document.removeEventListener('keydown', this.handleKeyDown);
        
        // Restore focus ke element sebelumnya
        // Menggunakan optional chaining (?.) untuk safety
        // Jika previouslyFocusedElement null, tidak akan error
        if (this.previouslyFocusedElement && this.previouslyFocusedElement.focus) {
            this.previouslyFocusedElement.focus();
        }
        
        // Reset previously focused element
        this.previouslyFocusedElement = null;
    }
}

/**
 * Export FocusTrap class
 * Menggunakan window object agar bisa diakses dari file lain
 * Karena kita tidak menggunakan module bundler
 */
window.FocusTrap = FocusTrap;