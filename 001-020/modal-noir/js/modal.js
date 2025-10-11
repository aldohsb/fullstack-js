/**
 * ============================================
 * MODAL CONTROLLER
 * ============================================
 * 
 * Script utama untuk mengelola modal popup.
 * Menghandle:
 * - Buka/tutup modal
 * - ESC key untuk close
 * - Click outside untuk close
 * - Focus trap integration
 * - Accessibility (ARIA attributes)
 */

/**
 * Class Modal
 * Mengelola fungsionalitas modal popup
 */
class Modal {
    /**
     * Constructor
     * @param {string} modalId - ID dari modal element
     */
    constructor(modalId) {
        // Dapatkan modal element berdasarkan ID
        this.modal = document.getElementById(modalId);
        
        // Validasi: pastikan modal element ada
        if (!this.modal) {
            console.error(`Modal dengan ID "${modalId}" tidak ditemukan`);
            return;
        }
        
        // Dapatkan modal container (kotak modal)
        this.modalContainer = this.modal.querySelector('.modal-container');
        
        // Instance FocusTrap untuk modal ini
        // Menggunakan class FocusTrap yang sudah dibuat sebelumnya
        this.focusTrap = new window.FocusTrap(this.modal);
        
        // Flag untuk track status modal (terbuka/tertutup)
        this.isOpen = false;
        
        // Bind methods agar 'this' selalu merujuk ke instance
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this.handleEscKey = this.handleEscKey.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        
        // Initialize event listeners
        this.init();
    }
    
    /**
     * Initialize semua event listeners
     * Dipanggil sekali saat class di-instantiate
     */
    init() {
        // 1. EVENT: Click button untuk OPEN modal
        // Cari semua button yang memiliki data-modal-target attribute
        const openButtons = document.querySelectorAll(`[data-modal-target="${this.modal.id}"]`);
        
        // Loop semua open buttons
        openButtons.forEach(button => {
            // Tambahkan click event listener
            button.addEventListener('click', this.open);
        });
        
        // 2. EVENT: Click button untuk CLOSE modal
        // Cari semua button dengan data-modal-close attribute di dalam modal
        const closeButtons = this.modal.querySelectorAll('[data-modal-close]');
        
        // Loop semua close buttons
        closeButtons.forEach(button => {
            // Tambahkan click event listener
            button.addEventListener('click', this.close);
        });
        
        // 3. EVENT: Click OVERLAY untuk close modal
        // Click di luar modal container akan menutup modal
        this.modal.addEventListener('click', this.handleOutsideClick);
        
        // 4. EVENT: ESC key untuk close modal
        // Event listener akan ditambahkan saat modal dibuka
        // Dan dihapus saat modal ditutup (untuk performa)
    }
    
    /**
     * Buka modal
     * Public method yang bisa dipanggil dari luar
     */
    open() {
        // Cegah scroll di body saat modal terbuka
        // Tambahkan style overflow hidden ke body
        document.body.style.overflow = 'hidden';
        
        // Tambahkan class 'active' untuk trigger animasi CSS
        this.modal.classList.add('active');
        
        // Update ARIA attributes untuk accessibility
        // aria-hidden="false" memberitahu screen reader modal terlihat
        this.modal.setAttribute('aria-hidden', 'false');
        
        // Aktifkan focus trap
        // Focus akan terperangkap di dalam modal
        this.focusTrap.activate();
        
        // Update status flag
        this.isOpen = true;
        
        // Tambahkan event listener untuk ESC key
        // Menggunakan document untuk menangkap keyboard event
        document.addEventListener('keydown', this.handleEscKey);
        
        // Dispatch custom event untuk notifikasi
        // Event ini bisa di-listen oleh code lain jika diperlukan
        const event = new CustomEvent('modalOpened', {
            detail: { modalId: this.modal.id }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * Tutup modal
     * Public method yang bisa dipanggil dari luar
     */
    close() {
        // Kembalikan scroll di body
        document.body.style.overflow = '';
        
        // Hapus class 'active' untuk trigger animasi close
        this.modal.classList.remove('active');
        
        // Update ARIA attributes
        // aria-hidden="true" memberitahu screen reader modal tersembunyi
        this.modal.setAttribute('aria-hidden', 'true');
        
        // Deaktifkan focus trap
        // Focus akan kembali ke element sebelumnya
        this.focusTrap.deactivate();
        
        // Update status flag
        this.isOpen = false;
        
        // Hapus event listener untuk ESC key
        // Untuk menghemat performa
        document.removeEventListener('keydown', this.handleEscKey);
        
        // Dispatch custom event
        const event = new CustomEvent('modalClosed', {
            detail: { modalId: this.modal.id }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * Handle ESC key press
     * @param {KeyboardEvent} event - Keyboard event object
     */
    handleEscKey(event) {
        // Cek apakah tombol yang ditekan adalah Escape
        // Menggunakan event.key (modern) atau event.keyCode (legacy)
        const isEscapeKey = event.key === 'Escape' || event.key === 'Esc' || event.keyCode === 27;
        
        // Jika ESC ditekan dan modal sedang terbuka
        if (isEscapeKey && this.isOpen) {
            // Tutup modal
            this.close();
        }
    }
    
    /**
     * Handle click di luar modal container (pada overlay)
     * @param {MouseEvent} event - Mouse event object
     */
    handleOutsideClick(event) {
        // Cek apakah yang diklik adalah overlay (bukan modal container atau isinya)
        // event.target adalah element yang di-click
        // this.modal adalah overlay element
        
        if (event.target === this.modal) {
            // Click langsung pada overlay (tidak pada container atau children-nya)
            this.close();
        }
    }
    
    /**
     * Toggle modal (buka jika tutup, tutup jika buka)
     * Helper method untuk flexibility
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    /**
     * Destroy instance
     * Membersihkan semua event listeners
     * Berguna jika modal di-remove dari DOM
     */
    destroy() {
        // Tutup modal jika masih terbuka
        if (this.isOpen) {
            this.close();
        }
        
        // Hapus semua event listeners
        const openButtons = document.querySelectorAll(`[data-modal-target="${this.modal.id}"]`);
        openButtons.forEach(button => {
            button.removeEventListener('click', this.open);
        });
        
        const closeButtons = this.modal.querySelectorAll('[data-modal-close]');
        closeButtons.forEach(button => {
            button.removeEventListener('click', this.close);
        });
        
        this.modal.removeEventListener('click', this.handleOutsideClick);
        document.removeEventListener('keydown', this.handleEscKey);
    }
}

/**
 * ============================================
 * INITIALIZATION
 * ============================================
 * 
 * Initialize modal saat DOM sudah siap
 */

// Fungsi untuk initialize semua modal di halaman
function initializeModals() {
    // Cari semua modal elements (yang memiliki class 'modal-overlay')
    const modalElements = document.querySelectorAll('.modal-overlay');
    
    // Array untuk menyimpan instance modal
    // Bisa diakses dari console untuk debugging
    window.modalInstances = [];
    
    // Loop semua modal elements
    modalElements.forEach(modalElement => {
        // Pastikan modal memiliki ID
        if (modalElement.id) {
            // Buat instance Modal baru
            const modalInstance = new Modal(modalElement.id);
            
            // Simpan ke array
            window.modalInstances.push(modalInstance);
            
            // Log untuk debugging (bisa dihapus di production)
            console.log(`✓ Modal "${modalElement.id}" initialized`);
        } else {
            // Warning jika modal tidak memiliki ID
            console.warn('Modal ditemukan tanpa ID:', modalElement);
        }
    });
}

/**
 * DOMContentLoaded Event
 * Pastikan DOM sudah fully loaded sebelum initialize
 */
if (document.readyState === 'loading') {
    // DOM masih loading, tunggu hingga selesai
    document.addEventListener('DOMContentLoaded', initializeModals);
} else {
    // DOM sudah ready, initialize langsung
    initializeModals();
}

/**
 * ============================================
 * EXPORT
 * ============================================
 * 
 * Export Modal class ke window object
 * Agar bisa di-instantiate secara manual jika diperlukan
 */
window.Modal = Modal;

/**
 * ============================================
 * USAGE EXAMPLES (untuk developer)
 * ============================================
 * 
 * // Cara 1: Otomatis (sudah dihandle oleh code di atas)
 * // Modal akan otomatis ter-initialize saat page load
 * 
 * // Cara 2: Manual instantiation
 * const myModal = new Modal('noirModal');
 * myModal.open();  // Buka modal
 * myModal.close(); // Tutup modal
 * 
 * // Cara 3: Akses instance yang sudah ada
 * const firstModal = window.modalInstances[0];
 * firstModal.toggle(); // Toggle open/close
 * 
 * // Cara 4: Listen custom events
 * document.addEventListener('modalOpened', (e) => {
 *     console.log('Modal dibuka:', e.detail.modalId);
 * });
 * 
 * document.addEventListener('modalClosed', (e) => {
 *     console.log('Modal ditutup:', e.detail.modalId);
 * });
 */