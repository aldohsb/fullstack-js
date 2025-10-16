/**
 * ============================================
 * HTML SANITIZER MODULE
 * ============================================
 * 
 * File ini berisi fungsi untuk sanitasi (membersihkan) HTML
 * dari potensi serangan XSS (Cross-Site Scripting).
 * 
 * TEKNIK YANG DIPELAJARI:
 * 1. Whitelist approach untuk keamanan
 * 2. DOM manipulation untuk parsing HTML
 * 3. Recursive tree traversal
 * 4. XSS prevention techniques
 * 
 * KONSEP XSS:
 * XSS adalah serangan dimana attacker menyisipkan script jahat
 * ke dalam konten yang akan ditampilkan ke user lain.
 * Contoh: <script>alert('hacked')</script>
 */

const HTMLSanitizer = {
    
    /**
     * WHITELIST: Tag HTML yang diperbolehkan
     * 
     * Hanya tag-tag ini yang akan dirender.
     * Tag lain akan dihapus untuk keamanan.
     */
    allowedTags: [
        'h1', 'h2', 'h3',      // Headings
        'p',                    // Paragraph
        'strong', 'em',         // Bold & Italic
        'a',                    // Link
        'code', 'pre',          // Code
        'ul', 'ol', 'li',       // Lists
        'blockquote',           // Quote
        'hr',                   // Horizontal rule
        'br'                    // Line break
    ],
    
    /**
     * WHITELIST: Atribut HTML yang diperbolehkan per tag
     * 
     * Hanya atribut ini yang diperbolehkan pada tag tertentu.
     * Mencegah atribut berbahaya seperti onclick, onerror, dll.
     */
    allowedAttributes: {
        'a': ['href', 'target', 'rel'],  // Link: hanya href, target, rel
        '*': []                          // Tag lain: tidak ada atribut
    },
    
    /**
     * WHITELIST: Protocol URL yang aman
     * 
     * Hanya URL dengan protocol ini yang diperbolehkan di href.
     * Mencegah javascript:, data:, vbscript:, dll.
     */
    allowedProtocols: ['http:', 'https:', 'mailto:'],
    
    /**
     * FUNGSI UTAMA: Sanitize HTML
     * 
     * @param {string} html - HTML yang akan dibersihkan
     * @returns {string} - HTML yang sudah aman
     * 
     * PROSES:
     * 1. Parse HTML string menjadi DOM
     * 2. Traverse semua node
     * 3. Filter berdasarkan whitelist
     * 4. Kembalikan sebagai safe HTML string
     */
    sanitize: function(html) {
        // Jika input kosong, return kosong
        if (!html || html.trim() === '') {
            return '';
        }
        
        // Buat temporary DOM element untuk parsing
        // Gunakan template element karena tidak execute script
        const template = document.createElement('template');
        
        // Set innerHTML akan parse HTML string menjadi DOM tree
        template.innerHTML = html;
        
        // Ambil content dari template (DocumentFragment)
        const fragment = template.content;
        
        // Sanitize semua node dalam fragment secara recursive
        this.sanitizeNode(fragment);
        
        // Convert kembali DOM menjadi HTML string
        // Buat div temporary untuk serialize
        const div = document.createElement('div');
        div.appendChild(fragment.cloneNode(true));
        
        return div.innerHTML;
    },
    
    /**
     * SANITIZE NODE (Recursive)
     * 
     * Fungsi rekursif untuk membersihkan node dan children-nya.
     * 
     * @param {Node} node - DOM node yang akan dibersihkan
     */
    sanitizeNode: function(node) {
        // Array untuk menyimpan node yang akan dihapus
        // Kita tidak bisa hapus langsung saat iterasi
        const nodesToRemove = [];
        
        // Iterate semua child nodes
        // childNodes include text nodes dan element nodes
        for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];
            
            // Check tipe node
            if (child.nodeType === Node.ELEMENT_NODE) {
                // Ini adalah element node (tag HTML)
                
                const tagName = child.tagName.toLowerCase();
                
                // Check apakah tag diperbolehkan
                if (!this.allowedTags.includes(tagName)) {
                    // Tag tidak diperbolehkan, tandai untuk dihapus
                    nodesToRemove.push(child);
                    continue; // Skip ke node berikutnya
                }
                
                // Tag diperbolehkan, sanitize atributnya
                this.sanitizeAttributes(child);
                
                // Recursive: sanitize children dari element ini
                this.sanitizeNode(child);
                
            } else if (child.nodeType === Node.TEXT_NODE) {
                // Ini adalah text node (pure text, sudah aman)
                // Text node tidak bisa execute code, jadi safe
                // Tidak perlu action
                
            } else {
                // Node type lain (comment, etc), hapus untuk safety
                nodesToRemove.push(child);
            }
        }
        
        // Hapus semua node yang ditandai
        nodesToRemove.forEach(child => {
            node.removeChild(child);
        });
    },
    
    /**
     * SANITIZE ATTRIBUTES
     * 
     * Membersihkan atribut dari element berdasarkan whitelist.
     * 
     * @param {Element} element - DOM element yang akan dibersihkan
     */
    sanitizeAttributes: function(element) {
        const tagName = element.tagName.toLowerCase();
        
        // Ambil daftar atribut yang diperbolehkan untuk tag ini
        // Gunakan '*' sebagai default jika tidak ada entry khusus
        const allowed = this.allowedAttributes[tagName] || this.allowedAttributes['*'];
        
        // Array untuk menyimpan nama atribut yang akan dihapus
        const attrsToRemove = [];
        
        // Iterate semua atribut yang ada di element
        // attributes adalah NamedNodeMap
        for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i];
            const attrName = attr.name.toLowerCase();
            
            // Check apakah atribut diperbolehkan
            if (!allowed.includes(attrName)) {
                // Atribut tidak diperbolehkan, tandai untuk dihapus
                attrsToRemove.push(attrName);
            } else if (attrName === 'href') {
                // Special handling untuk href (check protocol)
                const href = attr.value.trim();
                
                // Check apakah href menggunakan protocol yang aman
                if (!this.isSafeURL(href)) {
                    // URL tidak aman, tandai atribut untuk dihapus
                    attrsToRemove.push(attrName);
                }
            }
        }
        
        // Hapus semua atribut yang ditandai
        attrsToRemove.forEach(attrName => {
            element.removeAttribute(attrName);
        });
    },
    
    /**
     * CHECK SAFE URL
     * 
     * Mengecek apakah URL menggunakan protocol yang aman.
     * 
     * @param {string} url - URL yang akan dicek
     * @returns {boolean} - True jika aman, false jika tidak
     */
    isSafeURL: function(url) {
        // Handle relative URL (tidak ada protocol)
        // Relative URL dianggap aman
        if (!url.includes(':')) {
            return true;
        }
        
        // Extract protocol dari URL
        // Protocol adalah bagian sebelum ':'
        const protocol = url.split(':')[0].toLowerCase() + ':';
        
        // Check apakah protocol ada dalam whitelist
        return this.allowedProtocols.includes(protocol);
    },
    
    /**
     * ESCAPE HTML ENTITIES
     * 
     * Helper function untuk escape special characters.
     * Useful untuk display raw text tanpa parsing HTML.
     * 
     * @param {string} text - Text yang akan di-escape
     * @returns {string} - Text yang sudah di-escape
     */
    escapeHTML: function(text) {
        const map = {
            '&': '&amp;',   // Ampersand harus di-escape duluan
            '<': '&lt;',    // Less than
            '>': '&gt;',    // Greater than
            '"': '&quot;',  // Double quote
            "'": '&#039;'   // Single quote
        };
        
        // Replace semua special characters
        return text.replace(/[&<>"']/g, char => map[char]);
    },
    
    /**
     * STRIP ALL TAGS
     * 
     * Menghapus semua HTML tags, hanya menyisakan text.
     * Berguna untuk plain text output.
     * 
     * @param {string} html - HTML yang akan di-strip
     * @returns {string} - Plain text tanpa tags
     */
    stripTags: function(html) {
        // Buat temporary element
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // textContent akan mengambil hanya text, tanpa tags
        return temp.textContent || temp.innerText || '';
    }
};

/**
 * PENJELASAN KEAMANAN:
 * 
 * 1. WHITELIST APPROACH:
 *    - Hanya allow tag/atribut yang explicit diperbolehkan
 *    - Lebih aman daripada blacklist (block yang berbahaya)
 *    - Karena attacker bisa selalu cari cara baru bypass blacklist
 * 
 * 2. PROTOCOL CHECKING:
 *    - Cegah javascript:, data:, vbscript: di href
 *    - Ini adalah vector XSS umum
 *    - Contoh berbahaya: <a href="javascript:alert('xss')">
 * 
 * 3. ATTRIBUTE FILTERING:
 *    - Cegah event handlers (onclick, onerror, onload, dll)
 *    - Cegah style injection (style attribute)
 *    - Hanya allow atribut yang benar-benar dibutuhkan
 * 
 * 4. RECURSIVE TRAVERSAL:
 *    - Sanitize nested elements
 *    - Attacker bisa nested tag berbahaya dalam tag safe
 *    - Contoh: <p><script>alert('xss')</script></p>
 * 
 * 5. TEXT NODE SAFETY:
 *    - Text nodes (pure text) inherently safe
 *    - Browser tidak execute code dalam text nodes
 *    - Hanya element nodes yang bisa berbahaya
 */

/**
 * CONTOH PENGGUNAAN:
 * 
 * // HTML berbahaya
 * const dangerous = '<script>alert("xss")</script><p>Hello</p>';
 * 
 * // Sanitize
 * const safe = HTMLSanitizer.sanitize(dangerous);
 * 
 * // Result: '<p>Hello</p>'
 * // Script tag dihapus, hanya p tag yang tersisa
 */