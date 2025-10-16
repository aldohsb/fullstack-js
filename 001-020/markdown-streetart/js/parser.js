/**
 * ============================================
 * MARKDOWN PARSER MODULE
 * ============================================
 * 
 * File ini berisi fungsi untuk parsing (mengubah) markdown syntax
 * menjadi HTML yang bisa ditampilkan di browser.
 * 
 * TEKNIK YANG DIPELAJARI:
 * 1. Regular Expression (RegEx) untuk pattern matching
 * 2. String replacement dengan fungsi callback
 * 3. Parsing multi-line dan inline elements
 * 4. Modular function design
 */

// Namespace untuk parser agar tidak konflik dengan code lain
const MarkdownParser = {
    
    /**
     * FUNGSI UTAMA: Parse markdown ke HTML
     * 
     * @param {string} markdown - Text markdown yang akan di-convert
     * @returns {string} - HTML hasil conversion
     * 
     * Proses parsing:
     * 1. Parse block elements (heading, paragraph, list)
     * 2. Parse inline elements (bold, italic, link, code)
     */
    parse: function(markdown) {
        // Jika input kosong, return string kosong
        if (!markdown || markdown.trim() === '') {
            return '';
        }
        
        // Konversi markdown ke HTML dengan urutan tertentu
        // Urutan penting: block elements dulu, baru inline elements
        let html = markdown;
        
        // 1. Parse block-level elements
        html = this.parseHeaders(html);        // # Heading
        html = this.parseHorizontalRule(html); // --- atau ***
        html = this.parseBlockquote(html);     // > Quote
        html = this.parseCodeBlock(html);      // ``` code ```
        html = this.parseUnorderedList(html);  // - item atau * item
        html = this.parseOrderedList(html);    // 1. item
        html = this.parseParagraphs(html);     // Paragraf biasa
        
        // 2. Parse inline elements
        html = this.parseInlineCode(html);     // `code`
        html = this.parseBold(html);           // **bold** atau __bold__
        html = this.parseItalic(html);         // *italic* atau _italic_
        html = this.parseLinks(html);          // [text](url)
        
        return html;
    },
    
    /**
     * PARSE HEADERS (H1, H2, H3)
     * 
     * Syntax:
     * # H1
     * ## H2
     * ### H3
     * 
     * Menggunakan RegEx dengan multiline flag (m)
     */
    parseHeaders: function(text) {
        // Pattern: ^ = awal baris, (#{1,3}) = 1-3 karakter #
        // \s+ = spasi, (.+) = text heading, $ = akhir baris
        return text.replace(/^(#{1,3})\s+(.+)$/gm, function(match, hashes, content) {
            // Hitung jumlah # untuk menentukan level heading
            const level = hashes.length; // 1, 2, atau 3
            
            // Return tag HTML heading sesuai level
            return `<h${level}>${content.trim()}</h${level}>`;
        });
    },
    
    /**
     * PARSE HORIZONTAL RULE (garis pemisah)
     * 
     * Syntax:
     * ---
     * ***
     * ___
     * 
     * Minimal 3 karakter berturut-turut
     */
    parseHorizontalRule: function(text) {
        // Pattern: ^ = awal baris, [-*_]{3,} = minimal 3 karakter -, *, atau _
        // $ = akhir baris
        return text.replace(/^[-*_]{3,}$/gm, '<hr>');
    },
    
    /**
     * PARSE BLOCKQUOTE (kutipan)
     * 
     * Syntax:
     * > This is a quote
     * > Bisa multi-line
     */
    parseBlockquote: function(text) {
        // Pattern: ^> = dimulai dengan >
        // (.+) = capture text setelah >
        return text.replace(/^>\s*(.+)$/gm, function(match, content) {
            return `<blockquote>${content.trim()}</blockquote>`;
        });
    },
    
    /**
     * PARSE CODE BLOCK (blok kode)
     * 
     * Syntax:
     * ```
     * const x = 10;
     * ```
     * 
     * Menggunakan flag 's' untuk dotall (. match newline juga)
     */
    parseCodeBlock: function(text) {
        // Pattern: ``` ... ```
        // ([\s\S]+?) = capture apapun (termasuk newline), non-greedy
        return text.replace(/```([\s\S]+?)```/g, function(match, code) {
            // Escape HTML entities dalam code untuk keamanan
            const escaped = code
                .trim()
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            
            return `<pre><code>${escaped}</code></pre>`;
        });
    },
    
    /**
     * PARSE UNORDERED LIST (list tidak berurut)
     * 
     * Syntax:
     * - Item 1
     * - Item 2
     * * Item 3
     * 
     * Support karakter - atau *
     */
    parseUnorderedList: function(text) {
        // Split text menjadi baris-baris
        const lines = text.split('\n');
        let result = [];
        let inList = false; // Flag apakah sedang dalam list
        
        // Loop setiap baris
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Check apakah baris ini adalah list item
            // Pattern: dimulai dengan - atau * lalu spasi
            const listMatch = line.match(/^[-*]\s+(.+)$/);
            
            if (listMatch) {
                // Ini adalah list item
                if (!inList) {
                    // Mulai list baru
                    result.push('<ul>');
                    inList = true;
                }
                // Tambahkan list item
                result.push(`<li>${listMatch[1].trim()}</li>`);
            } else {
                // Bukan list item
                if (inList) {
                    // Tutup list yang sedang berjalan
                    result.push('</ul>');
                    inList = false;
                }
                // Tambahkan baris original
                result.push(line);
            }
        }
        
        // Jika masih dalam list di akhir, tutup list
        if (inList) {
            result.push('</ul>');
        }
        
        // Join kembali menjadi string
        return result.join('\n');
    },
    
    /**
     * PARSE ORDERED LIST (list berurut)
     * 
     * Syntax:
     * 1. Item pertama
     * 2. Item kedua
     * 3. Item ketiga
     */
    parseOrderedList: function(text) {
        const lines = text.split('\n');
        let result = [];
        let inList = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Pattern: dimulai dengan angka, titik, spasi
            // \d+ = satu atau lebih digit
            const listMatch = line.match(/^\d+\.\s+(.+)$/);
            
            if (listMatch) {
                if (!inList) {
                    result.push('<ol>');
                    inList = true;
                }
                result.push(`<li>${listMatch[1].trim()}</li>`);
            } else {
                if (inList) {
                    result.push('</ol>');
                    inList = false;
                }
                result.push(line);
            }
        }
        
        if (inList) {
            result.push('</ol>');
        }
        
        return result.join('\n');
    },
    
    /**
     * PARSE PARAGRAPHS
     * 
     * Wrap text yang bukan element lain menjadi <p>
     * Deteksi paragraph dari baris kosong
     */
    parseParagraphs: function(text) {
        // Split berdasarkan 2+ newline (paragraph break)
        const paragraphs = text.split(/\n\n+/);
        
        return paragraphs.map(para => {
            para = para.trim();
            
            // Skip jika kosong
            if (!para) return '';
            
            // Skip jika sudah merupakan HTML tag
            // Cek apakah dimulai dengan < (sudah HTML)
            if (para.startsWith('<')) {
                return para;
            }
            
            // Wrap dalam <p> tag
            return `<p>${para}</p>`;
        }).join('\n\n');
    },
    
    /**
     * PARSE INLINE CODE
     * 
     * Syntax:
     * `code here`
     * 
     * PENTING: Parse ini dulu sebelum bold/italic
     * agar ` tidak terganggu dengan * atau _
     */
    parseInlineCode: function(text) {
        // Pattern: `...`
        // [^`]+ = karakter apapun kecuali `
        return text.replace(/`([^`]+)`/g, function(match, code) {
            // Escape HTML entities untuk keamanan
            const escaped = code
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            
            return `<code>${escaped}</code>`;
        });
    },
    
    /**
     * PARSE BOLD TEXT
     * 
     * Syntax:
     * **bold text**
     * __bold text__
     * 
     * Menggunakan non-greedy quantifier (+?) agar tidak greedy
     */
    parseBold: function(text) {
        // Pattern 1: **...**
        // [^*]+ = karakter apapun kecuali *
        text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // Pattern 2: __...__
        // [^_]+ = karakter apapun kecuali _
        text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');
        
        return text;
    },
    
    /**
     * PARSE ITALIC TEXT
     * 
     * Syntax:
     * *italic text*
     * _italic text_
     * 
     * CATATAN: Parse setelah bold agar ** tidak match dengan *
     */
    parseItalic: function(text) {
        // Pattern 1: *...*
        // Tapi pastikan bukan ** (bold)
        // (?<!\*) = negative lookbehind, tidak didahului *
        // (?!\*) = negative lookahead, tidak diikuti *
        text = text.replace(/(?<!\*)\*(?!\*)([^*]+)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
        
        // Pattern 2: _..._
        // Tapi pastikan bukan __ (bold)
        text = text.replace(/(?<!_)_(?!_)([^_]+)(?<!_)_(?!_)/g, '<em>$1</em>');
        
        return text;
    },
    
    /**
     * PARSE LINKS
     * 
     * Syntax:
     * [link text](https://url.com)
     * 
     * Capture text dan URL, lalu buat <a> tag
     */
    parseLinks: function(text) {
        // Pattern: [text](url)
        // \[([^\]]+)\] = capture text dalam []
        // \(([^)]+)\) = capture URL dalam ()
        return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function(match, linkText, url) {
            // Tambahkan rel dan target untuk keamanan
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
        });
    }
};

/**
 * EXPORT MODULE
 * 
 * Karena tidak pakai ES6 modules (import/export),
 * kita expose MarkdownParser ke global scope
 * agar bisa diakses dari file lain
 */

// Sudah otomatis available di window karena var/const di top level