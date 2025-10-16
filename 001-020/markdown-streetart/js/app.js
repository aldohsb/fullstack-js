/**
 * ============================================
 * MAIN APPLICATION MODULE
 * ============================================
 * 
 * File ini adalah entry point aplikasi yang mengintegrasikan
 * MarkdownParser dan HTMLSanitizer untuk membuat live preview.
 * 
 * TEKNIK YANG DIPELAJARI:
 * 1. Event handling (input event untuk real-time)
 * 2. DOM manipulation (update preview)
 * 3. Debouncing untuk performance
 * 4. Module integration
 * 5. Error handling
 */

/**
 * APP CONTROLLER
 * 
 * Object utama yang mengatur aplikasi
 */
const App = {
    
    /**
     * CACHE DOM ELEMENTS
     * 
     * Simpan referensi ke DOM elements yang sering diakses
     * untuk performance (tidak perlu query berulang-ulang)
     */
    elements: {
        editor: null,    // Textarea editor
        preview: null    // Div preview
    },
    
    /**
     * DEBOUNCE TIMER
     * 
     * Untuk debouncing update preview
     * Mencegah update terlalu sering saat user mengetik cepat
     */
    debounceTimer: null,
    
    /**
     * DEBOUNCE DELAY (ms)
     * 
     * Waktu tunggu setelah user berhenti mengetik
     * sebelum update preview
     */
    debounceDelay: 300,
    
    /**
     * INIT: Initialize aplikasi
     * 
     * Dipanggil saat DOM sudah ready
     */
    init: function() {
        console.log('🎨 Markdown StreetArt - Initializing...');
        
        // Cache DOM elements
        this.cacheElements();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initial render (jika ada default content)
        this.updatePreview();
        
        console.log('✅ Markdown StreetArt - Ready!');
    },
    
    /**
     * CACHE ELEMENTS
     * 
     * Simpan referensi ke DOM elements
     */
    cacheElements: function() {
        // Query selector untuk mendapatkan element
        this.elements.editor = document.getElementById('editor');
        this.elements.preview = document.getElementById('preview');
        
        // Validasi: pastikan elements ditemukan
        if (!this.elements.editor || !this.elements.preview) {
            console.error('❌ Required elements not found!');
            return;
        }
        
        console.log('✓ DOM elements cached');
    },
    
    /**
     * SETUP EVENT LISTENERS
     * 
     * Attach event handlers ke elements
     */
    setupEventListeners: function() {
        // Event listener untuk textarea
        // 'input' event: fires setiap kali value berubah
        this.elements.editor.addEventListener('input', (e) => {
            // Arrow function untuk preserve 'this' context
            this.handleEditorInput(e);
        });
        
        // Event listener untuk keyboard shortcuts (bonus)
        this.elements.editor.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        console.log('✓ Event listeners attached');
    },
    
    /**
     * HANDLE EDITOR INPUT
     * 
     * Dipanggil setiap kali user mengetik di editor.
     * Menggunakan debouncing untuk performance.
     * 
     * @param {Event} event - Input event
     */
    handleEditorInput: function(event) {
        // Clear timer sebelumnya jika ada
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        
        // Set timer baru
        // Update preview hanya setelah user berhenti mengetik
        this.debounceTimer = setTimeout(() => {
            this.updatePreview();
        }, this.debounceDelay);
    },
    
    /**
     * UPDATE PREVIEW
     * 
     * Fungsi utama untuk update preview panel.
     * 
     * FLOW:
     * 1. Ambil markdown dari editor
     * 2. Parse markdown ke HTML (MarkdownParser)
     * 3. Sanitize HTML (HTMLSanitizer)
     * 4. Render ke preview
     */
    updatePreview: function() {
        try {
            // 1. Ambil value dari textarea
            const markdownText = this.elements.editor.value;
            
            // 2. Check jika kosong, tampilkan empty state
            if (!markdownText || markdownText.trim() === '') {
                this.showEmptyState();
                return;
            }
            
            // 3. Parse markdown ke HTML
            // Gunakan MarkdownParser dari parser.js
            const html = MarkdownParser.parse(markdownText);
            
            // Debug: log HTML sebelum sanitize
            console.log('Parsed HTML:', html.substring(0, 100) + '...');
            
            // 4. Sanitize HTML untuk keamanan
            // Gunakan HTMLSanitizer dari sanitizer.js
            const safeHTML = HTMLSanitizer.sanitize(html);
            
            // Debug: log HTML setelah sanitize
            console.log('Safe HTML:', safeHTML.substring(0, 100) + '...');
            
            // 5. Render ke preview
            // Gunakan innerHTML karena HTML sudah di-sanitize
            this.elements.preview.innerHTML = safeHTML;
            
            // 6. Update class untuk styling
            // Hapus empty-state class jika ada
            this.elements.preview.classList.remove('empty');
            
        } catch (error) {
            // Error handling: tangkap error dan tampilkan
            console.error('❌ Error updating preview:', error);
            this.showError(error.message);
        }
    },
    
    /**
     * SHOW EMPTY STATE
     * 
     * Tampilkan pesan saat editor kosong
     */
    showEmptyState: function() {
        this.elements.preview.innerHTML = `
            <p class="empty-state">
                Mulai menulis untuk melihat preview...
            </p>
        `;
        
        // Tambahkan class untuk styling khusus
        this.elements.preview.classList.add('empty');
    },
    
    /**
     * SHOW ERROR
     * 
     * Tampilkan error message di preview
     * 
     * @param {string} message - Error message
     */
    showError: function(message) {
        this.elements.preview.innerHTML = `
            <div style="color: #ff6b6b; padding: 20px; border: 2px solid #ff6b6b; border-radius: 8px;">
                <h3 style="margin-top: 0;">⚠️ Error</h3>
                <p>${HTMLSanitizer.escapeHTML(message)}</p>
                <p style="font-size: 0.9em; opacity: 0.7;">Check console for details</p>
            </div>
        `;
    },
    
    /**
     * HANDLE KEYBOARD SHORTCUTS (BONUS)
     * 
     * Tambahkan keyboard shortcuts untuk UX lebih baik
     * 
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyboardShortcuts: function(event) {
        // Ctrl/Cmd + B = Bold
        if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
            event.preventDefault(); // Prevent browser default
            this.insertMarkdown('**', '**');
        }
        
        // Ctrl/Cmd + I = Italic
        if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
            event.preventDefault();
            this.insertMarkdown('*', '*');
        }
        
        // Ctrl/Cmd + K = Link
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            this.insertMarkdown('[', '](url)');
        }
        
        // Ctrl/Cmd + E = Inline Code
        if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
            event.preventDefault();
            this.insertMarkdown('`', '`');
        }
    },
    
    /**
     * INSERT MARKDOWN
     * 
     * Helper untuk insert markdown syntax di posisi cursor
     * 
     * @param {string} before - Text sebelum selection
     * @param {string} after - Text setelah selection
     */
    insertMarkdown: function(before, after) {
        const textarea = this.elements.editor;
        
        // Ambil posisi cursor
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        
        // Ambil text yang di-select
        const selectedText = textarea.value.substring(start, end);
        
        // Buat replacement text
        const replacement = before + (selectedText || 'text') + after;
        
        // Replace text
        textarea.value = 
            textarea.value.substring(0, start) +
            replacement +
            textarea.value.substring(end);
        
        // Set cursor position
        // Jika ada selection, select text yang baru
        // Jika tidak, taruh cursor di tengah
        if (selectedText) {
            textarea.selectionStart = start;
            textarea.selectionEnd = start + replacement.length;
        } else {
            const newPos = start + before.length;
            textarea.selectionStart = newPos;
            textarea.selectionEnd = newPos + 4; // Select 'text'
        }
        
        // Focus kembali ke textarea
        textarea.focus();
        
        // Trigger update preview
        this.updatePreview();
    }
};

/**
 * ============================================
 * APPLICATION BOOTSTRAP
 * ============================================
 * 
 * Initialize aplikasi setelah DOM ready
 */

// Check apakah DOM sudah ready
if (document.readyState === 'loading') {
    // DOM masih loading, tunggu DOMContentLoaded event
    document.addEventListener('DOMContentLoaded', () => {
        App.init();
    });
} else {
    // DOM sudah ready, init langsung
    App.init();
}

/**
 * ============================================
 * TEKNIK DEBOUNCING EXPLAINED
 * ============================================
 * 
 * Debouncing adalah teknik untuk membatasi seberapa sering
 * sebuah fungsi dipanggil.
 * 
 * TANPA DEBOUNCING:
 * User mengetik "Hello"
 * - H -> update preview
 * - He -> update preview
 * - Hel -> update preview
 * - Hell -> update preview
 * - Hello -> update preview
 * Total: 5 updates
 * 
 * DENGAN DEBOUNCING (300ms):
 * User mengetik "Hello" dalam < 300ms
 * - H -> start timer 300ms
 * - He -> cancel timer, start new timer 300ms
 * - Hel -> cancel timer, start new timer 300ms
 * - Hell -> cancel timer, start new timer 300ms
 * - Hello -> cancel timer, start new timer 300ms
 * - (user berhenti mengetik)
 * - 300ms kemudian -> update preview
 * Total: 1 update
 * 
 * KEUNTUNGAN DEBOUNCING:
 * 1. Performance: Mengurangi jumlah DOM manipulation
 * 2. UX: Lebih smooth, tidak lag saat mengetik cepat
 * 3. Resource: Hemat CPU dan memory
 */

/**
 * ============================================
 * FLOW APLIKASI LENGKAP
 * ============================================
 * 
 * 1. USER ACTION:
 *    User mengetik di textarea editor
 * 
 * 2. EVENT TRIGGERED:
 *    'input' event fired
 * 
 * 3. DEBOUNCING:
 *    handleEditorInput() -> set timer 300ms
 * 
 * 4. TIMER SELESAI:
 *    updatePreview() dipanggil
 * 
 * 5. PARSING:
 *    MarkdownParser.parse() -> convert markdown ke HTML
 * 
 * 6. SANITIZING:
 *    HTMLSanitizer.sanitize() -> bersihkan HTML dari XSS
 * 
 * 7. RENDERING:
 *    innerHTML update -> tampilkan di preview
 * 
 * 8. USER SEES:
 *    Preview updated dengan styling graffiti
 */

/**
 * ============================================
 * ERROR HANDLING STRATEGY
 * ============================================
 * 
 * 1. TRY-CATCH:
 *    Semua operasi yang bisa error dibungkus try-catch
 * 
 * 2. VALIDATION:
 *    Check input sebelum processing
 * 
 * 3. USER FEEDBACK:
 *    Tampilkan error message yang user-friendly
 * 
 * 4. LOGGING:
 *    Console.log untuk debugging
 * 
 * 5. GRACEFUL DEGRADATION:
 *    Jika error, aplikasi tetap jalan (show error state)
 */

/**
 * ============================================
 * KEYBOARD SHORTCUTS REFERENCE
 * ============================================
 * 
 * Ctrl/Cmd + B: Wrap dengan **bold**
 * Ctrl/Cmd + I: Wrap dengan *italic*
 * Ctrl/Cmd + K: Wrap dengan [text](url)
 * Ctrl/Cmd + E: Wrap dengan `code`
 * 
 * Shortcuts ini meningkatkan UX dengan memudahkan
 * user untuk insert markdown syntax tanpa harus mengetik manual.
 */

/**
 * ============================================
 * PERFORMANCE CONSIDERATIONS
 * ============================================
 * 
 * 1. DOM CACHING:
 *    Elements di-cache di App.elements untuk avoid repeated queries
 * 
 * 2. DEBOUNCING:
 *    Update preview di-debounce untuk avoid excessive updates
 * 
 * 3. EFFICIENT SELECTORS:
 *    Gunakan ID selectors (fastest) untuk elements utama
 * 
 * 4. MINIMAL REFLOW:
 *    Update innerHTML sekali, bukan multiple times
 * 
 * 5. EVENT DELEGATION:
 *    Bisa digunakan jika ada dynamic elements (tidak ada di app ini)
 */

/**
 * ============================================
 * SECURITY NOTES
 * ============================================
 * 
 * 1. SANITIZATION REQUIRED:
 *    SELALU sanitize HTML sebelum render dengan innerHTML
 * 
 * 2. NO EVAL:
 *    Tidak pernah gunakan eval() atau Function() dengan user input
 * 
 * 3. NO INLINE HANDLERS:
 *    Tidak gunakan onclick, onerror, etc dalam HTML
 * 
 * 4. CONTENT SECURITY POLICY:
 *    Production app harus gunakan CSP headers
 * 
 * 5. INPUT VALIDATION:
 *    Validate semua user input sebelum processing
 */