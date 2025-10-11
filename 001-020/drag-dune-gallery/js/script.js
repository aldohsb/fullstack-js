/* ========================================
   DRAG DUNE GALLERY - JAVASCRIPT
   ======================================== */

// ========================================
// 1. DATA MANAGEMENT - Array untuk menyimpan data galeri
// ========================================

/**
 * Array berisi data gambar galeri
 * Menggunakan Unsplash API dengan parameter tema desert
 * Width: 400px, Height: 300px (4:3 ratio)
 */
const galleryData = [
    {
        id: 1,
        title: 'Desert Dunes',
        imageUrl: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&h=300&fit=crop'
    },
    {
        id: 2,
        title: 'Golden Sands',
        imageUrl: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop'
    },
    {
        id: 3,
        title: 'Sand Patterns',
        imageUrl: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=400&h=300&fit=crop'
    },
    {
        id: 4,
        title: 'Desert Wind',
        imageUrl: 'https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=400&h=300&fit=crop'
    },
    {
        id: 5,
        title: 'Sahara Vista',
        imageUrl: 'https://images.unsplash.com/photo-1559586616-361e18714958?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1374'
    },
    {
        id: 6,
        title: 'Desert Sunset',
        imageUrl: 'https://images.unsplash.com/photo-1613109526778-27605f1f27d2?w=400&h=300&fit=crop'
    }
];

// ========================================
// 2. STATE MANAGEMENT - Variabel untuk tracking drag state
// ========================================

/**
 * Variable untuk menyimpan element yang sedang di-drag
 * Null ketika tidak ada yang di-drag
 */
let draggedElement = null;

/**
 * Variable untuk menyimpan ID dari element yang sedang di-drag
 * Digunakan untuk identifikasi saat drop
 */
let draggedId = null;

// ========================================
// 3. DOM MANIPULATION - Render galeri ke HTML
// ========================================

/**
 * Fungsi untuk merender galeri dari array data
 * Dipanggil saat halaman pertama kali dimuat
 */
function renderGallery() {
    // Ambil reference ke container galeri
    const galleryGrid = document.getElementById('galleryGrid');
    
    // Clear existing content (untuk re-render)
    galleryGrid.innerHTML = '';
    
    // Loop melalui setiap item di galleryData
    galleryData.forEach(item => {
        // Buat element div untuk setiap item galeri
        const galleryItem = createGalleryItem(item);
        
        // Tambahkan item ke grid
        galleryGrid.appendChild(galleryItem);
    });
}

/**
 * Fungsi helper untuk membuat single gallery item
 * @param {Object} item - Object berisi data gambar (id, title, imageUrl)
 * @returns {HTMLElement} - Element div yang sudah lengkap dengan gambar
 */
function createGalleryItem(item) {
    // Buat container div untuk item
    const itemDiv = document.createElement('div');
    
    // Tambahkan class untuk styling
    itemDiv.className = 'gallery-item';
    
    // Set atribut draggable agar bisa di-drag
    // PENTING: ini adalah kunci dari Drag & Drop API
    itemDiv.draggable = true;
    
    // Set data attribute untuk identifikasi
    // data-id akan digunakan untuk tracking element
    itemDiv.dataset.id = item.id;
    
    // Buat element img
    const img = document.createElement('img');
    img.src = item.imageUrl;
    img.alt = item.title; // Alt text untuk accessibility
    
    // Buat element caption
    const caption = document.createElement('div');
    caption.className = 'gallery-caption';
    caption.textContent = item.title;
    
    // Append img dan caption ke item div
    itemDiv.appendChild(img);
    itemDiv.appendChild(caption);
    
    // ========================================
    // ATTACH EVENT LISTENERS - Drag & Drop Events
    // ========================================
    
    // Attach touch handlers untuk mobile support
    itemDiv.addEventListener('touchstart', handleTouchStart, { passive: false });
    itemDiv.addEventListener('touchmove', handleTouchMove, { passive: false });
    itemDiv.addEventListener('touchend', handleTouchEnd);
    
    // Attach error handler untuk image
    img.addEventListener('error', () => handleImageError(img));
    
    /**
     * DRAGSTART EVENT
     * Triggered saat user mulai drag element
     * Ini adalah event pertama dalam drag lifecycle
     */
    itemDiv.addEventListener('dragstart', handleDragStart);
    
    /**
     * DRAGEND EVENT
     * Triggered saat user selesai drag (lepas mouse)
     * Event terakhir dalam drag lifecycle
     */
    itemDiv.addEventListener('dragend', handleDragEnd);
    
    /**
     * DRAGOVER EVENT
     * Triggered terus-menerus saat dragged element berada di atas drop target
     * HARUS preventDefault() agar drop bisa terjadi
     */
    itemDiv.addEventListener('dragover', handleDragOver);
    
    /**
     * DRAGENTER EVENT
     * Triggered sekali saat dragged element masuk area drop target
     * Digunakan untuk visual feedback
     */
    itemDiv.addEventListener('dragenter', handleDragEnter);
    
    /**
     * DRAGLEAVE EVENT
     * Triggered saat dragged element keluar dari area drop target
     * Digunakan untuk menghapus visual feedback
     */
    itemDiv.addEventListener('dragleave', handleDragLeave);
    
    /**
     * DROP EVENT
     * Triggered saat user drop (lepas) element di drop target
     * Di sini kita lakukan swap posisi
     */
    itemDiv.addEventListener('drop', handleDrop);
    
    // Return element yang sudah lengkap
    return itemDiv;
}

// ========================================
// 4. DRAG EVENT HANDLERS - Handler untuk semua drag events
// ========================================

/**
 * HANDLER: Drag Start
 * Dipanggil saat mulai drag
 * @param {DragEvent} e - Event object dari dragstart
 */
function handleDragStart(e) {
    // Simpan reference ke element yang di-drag
    draggedElement = e.currentTarget;
    
    // Simpan ID element untuk tracking
    draggedId = e.currentTarget.dataset.id;
    
    // Set data ke dataTransfer object (required untuk browser compatibility)
    // effectAllowed = 'move' menunjukkan ini adalah operasi move, bukan copy
    e.dataTransfer.effectAllowed = 'move';
    
    // Set data ID ke dataTransfer (optional, karena kita sudah pakai variable)
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
    
    // Tambah class 'dragging' untuk styling
    // setTimeout diperlukan karena class akan langsung apply ke ghost image
    setTimeout(() => {
        e.currentTarget.classList.add('dragging');
    }, 0);
    
    // Log untuk debugging (optional)
    console.log('Drag started:', draggedId);
}

/**
 * HANDLER: Drag End
 * Dipanggil saat selesai drag (lepas mouse)
 * @param {DragEvent} e - Event object dari dragend
 */
function handleDragEnd(e) {
    // Hapus class 'dragging' untuk reset styling
    e.currentTarget.classList.remove('dragging');
    
    // Hapus semua class 'drag-over' dari semua element
    // Ini cleanup untuk memastikan tidak ada visual feedback yang tertinggal
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.classList.remove('drag-over');
    });
    
    // Reset state variables
    draggedElement = null;
    draggedId = null;
    
    console.log('Drag ended');
}

/**
 * HANDLER: Drag Over
 * Dipanggil terus-menerus saat element di-drag over drop target
 * @param {DragEvent} e - Event object dari dragover
 */
function handleDragOver(e) {
    // CRITICAL: preventDefault() WAJIB dipanggil
    // Tanpa ini, drop event tidak akan trigger
    // Default behavior browser adalah menolak drop
    e.preventDefault();
    
    // Set dropEffect untuk visual cursor feedback
    e.dataTransfer.dropEffect = 'move';
    
    // Return false juga mencegah default behavior (optional)
    return false;
}

/**
 * HANDLER: Drag Enter
 * Dipanggil saat dragged element masuk ke drop target
 * @param {DragEvent} e - Event object dari dragenter
 */
function handleDragEnter(e) {
    // Cek apakah element yang dimasuki bukan element yang di-drag sendiri
    if (e.currentTarget !== draggedElement) {
        // Tambah class 'drag-over' untuk visual feedback
        e.currentTarget.classList.add('drag-over');
    }
}

/**
 * HANDLER: Drag Leave
 * Dipanggil saat dragged element keluar dari drop target
 * @param {DragEvent} e - Event object dari dragleave
 */
function handleDragLeave(e) {
    // Hapus class 'drag-over' saat cursor keluar dari area
    e.currentTarget.classList.remove('drag-over');
}

/**
 * HANDLER: Drop
 * Dipanggil saat element di-drop ke target
 * Di sini logic swap posisi terjadi
 * @param {DragEvent} e - Event object dari drop
 */
function handleDrop(e) {
    // Prevent default behavior (penting untuk browser compatibility)
    e.preventDefault();
    e.stopPropagation(); // Stop event bubbling
    
    // Hapus visual feedback class
    e.currentTarget.classList.remove('drag-over');
    
    // Ambil element target (tempat di-drop)
    const dropTarget = e.currentTarget;
    
    // Cek apakah drop target berbeda dengan dragged element
    // Tidak perlu swap jika drop di tempat yang sama
    if (draggedElement !== dropTarget) {
        // Ambil ID dari drop target
        const targetId = dropTarget.dataset.id;
        
        // SWAP LOGIC - Tukar posisi di array data
        swapGalleryItems(parseInt(draggedId), parseInt(targetId));
        
        // Re-render gallery dengan urutan baru
        renderGallery();
        
        console.log(`Swapped item ${draggedId} with ${targetId}`);
    }
    
    return false;
}

// ========================================
// 5. UTILITY FUNCTIONS - Helper functions
// ========================================

/**
 * Fungsi untuk menukar posisi dua item di array galleryData
 * @param {number} id1 - ID item pertama
 * @param {number} id2 - ID item kedua
 */
function swapGalleryItems(id1, id2) {
    // Cari index item pertama di array
    const index1 = galleryData.findIndex(item => item.id === id1);
    
    // Cari index item kedua di array
    const index2 = galleryData.findIndex(item => item.id === id2);
    
    // Validasi: pastikan kedua item ditemukan
    if (index1 !== -1 && index2 !== -1) {
        // Teknik swap menggunakan destructuring array
        // Ini adalah cara modern ES6+ untuk swap dua variable
        [galleryData[index1], galleryData[index2]] = [galleryData[index2], galleryData[index1]];
        
        console.log('Gallery data swapped successfully');
    } else {
        console.error('Item not found for swapping');
    }
}

// ========================================
// 6. INITIALIZATION - Jalankan saat DOM ready
// ========================================

/**
 * Event listener untuk DOMContentLoaded
 * Dipanggil saat DOM sudah siap, sebelum semua resource (img, css) selesai load
 * Lebih cepat dari window.onload
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing gallery...');
    
    // Render galeri pertama kali
    renderGallery();
    
    console.log('Gallery initialized with', galleryData.length, 'items');
});

// ========================================
// 7. ADDITIONAL FEATURES (Optional Enhancement)
// ========================================

/**
 * Tambahan: Keyboard accessibility untuk drag & drop
 * User bisa menggunakan keyboard untuk reorder
 * Arrow keys untuk navigate, Space untuk select/drop
 */

// Variable untuk tracking keyboard selection
let selectedItemIndex = null;

/**
 * Fungsi untuk handle keyboard navigation
 * @param {KeyboardEvent} e - Event object dari keydown
 */
function handleKeyboardNavigation(e) {
    const items = Array.from(document.querySelectorAll('.gallery-item'));
    
    // Jika belum ada yang selected, select item pertama
    if (selectedItemIndex === null) {
        selectedItemIndex = 0;
        items[0].focus();
        return;
    }
    
    const currentItem = items[selectedItemIndex];
    
    switch(e.key) {
        case 'ArrowRight':
            // Pindah ke item sebelah kanan
            e.preventDefault();
            if (selectedItemIndex < items.length - 1) {
                selectedItemIndex++;
                items[selectedItemIndex].focus();
            }
            break;
            
        case 'ArrowLeft':
            // Pindah ke item sebelah kiri
            e.preventDefault();
            if (selectedItemIndex > 0) {
                selectedItemIndex--;
                items[selectedItemIndex].focus();
            }
            break;
            
        case 'ArrowDown':
            // Pindah ke baris bawah (approx 3 items per row on desktop)
            e.preventDefault();
            const nextRow = selectedItemIndex + 3;
            if (nextRow < items.length) {
                selectedItemIndex = nextRow;
                items[selectedItemIndex].focus();
            }
            break;
            
        case 'ArrowUp':
            // Pindah ke baris atas
            e.preventDefault();
            const prevRow = selectedItemIndex - 3;
            if (prevRow >= 0) {
                selectedItemIndex = prevRow;
                items[selectedItemIndex].focus();
            }
            break;
            
        case ' ':
        case 'Enter':
            // Space atau Enter untuk select/deselect
            e.preventDefault();
            currentItem.classList.toggle('selected');
            break;
    }
}

// Attach keyboard listener ke document
document.addEventListener('keydown', handleKeyboardNavigation);

/**
 * Fungsi untuk save state ke localStorage (optional)
 * Menyimpan urutan galeri saat ini
 */
function saveGalleryState() {
    try {
        // Convert array ke JSON string
        const galleryState = JSON.stringify(galleryData);
        
        // Save ke localStorage dengan key 'dragDuneGallery'
        localStorage.setItem('dragDuneGallery', galleryState);
        
        console.log('Gallery state saved');
    } catch (error) {
        console.error('Failed to save gallery state:', error);
    }
}

/**
 * Fungsi untuk load state dari localStorage (optional)
 * Memulihkan urutan galeri dari session sebelumnya
 */
function loadGalleryState() {
    try {
        // Ambil data dari localStorage
        const savedState = localStorage.getItem('dragDuneGallery');
        
        // Jika ada data tersimpan, parse dan gunakan
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            
            // Replace array galleryData dengan saved state
            galleryData.length = 0; // Clear array
            galleryData.push(...parsedState); // Add saved items
            
            console.log('Gallery state loaded from localStorage');
            return true;
        }
    } catch (error) {
        console.error('Failed to load gallery state:', error);
    }
    
    return false;
}

/**
 * Fungsi untuk reset galeri ke urutan awal
 * Berguna jika user ingin reset customization
 */
function resetGallery() {
    // Konfirmasi dulu sebelum reset
    if (confirm('Reset galeri ke urutan awal?')) {
        // Sort array berdasarkan ID original
        galleryData.sort((a, b) => a.id - b.id);
        
        // Re-render gallery
        renderGallery();
        
        // Clear localStorage
        localStorage.removeItem('dragDuneGallery');
        
        console.log('Gallery reset to original order');
    }
}

// ========================================
// 8. PERFORMANCE OPTIMIZATION
// ========================================

/**
 * Debounce function untuk optimize frequent events
 * Mencegah function dipanggil terlalu sering
 * @param {Function} func - Function yang akan di-debounce
 * @param {number} wait - Waktu delay dalam ms
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
    let timeout;
    
    return function executedFunction(...args) {
        // Clear timeout sebelumnya
        clearTimeout(timeout);
        
        // Set timeout baru
        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    };
}

// Contoh penggunaan: auto-save state setelah drag selesai
const debouncedSave = debounce(saveGalleryState, 500);

// ========================================
// 9. ERROR HANDLING & FALLBACK
// ========================================

/**
 * Fungsi untuk handle error loading image
 * Menampilkan placeholder jika gambar gagal load
 */
function handleImageError(imgElement) {
    // Set placeholder image atau background color
    imgElement.style.backgroundColor = 'var(--sand-medium)';
    imgElement.alt = 'Image failed to load';
    
    console.warn('Image failed to load:', imgElement.src);
}

/**
 * Check browser support untuk Drag & Drop API
 * Display warning jika browser tidak support
 */
function checkBrowserSupport() {
    // Check apakah browser support draggable attribute
    const div = document.createElement('div');
    const isDraggableSupported = 'draggable' in div;
    
    if (!isDraggableSupported) {
        console.error('Browser does not support Drag & Drop API');
        
        // Display user-friendly message
        const warningDiv = document.createElement('div');
        warningDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ff6b6b;
            color: white;
            padding: 15px 30px;
            border-radius: 8px;
            z-index: 9999;
        `;
        warningDiv.textContent = '⚠️ Browser Anda tidak mendukung fitur drag & drop';
        document.body.appendChild(warningDiv);
    }
    
    return isDraggableSupported;
}

// Run browser check saat initialization
checkBrowserSupport();

// ========================================
// 10. TOUCH DEVICE SUPPORT (Mobile Enhancement)
// ========================================

/**
 * Variabel untuk tracking touch events
 * Drag & Drop API tidak bekerja sempurna di mobile
 * Kita perlu implement custom touch handlers
 */
let touchStartX = 0;
let touchStartY = 0;
let touchElement = null;

/**
 * Handle touch start untuk mobile devices
 * @param {TouchEvent} e - Touch event object
 */
function handleTouchStart(e) {
    // Ambil touch pertama (support single touch)
    const touch = e.touches[0];
    
    // Simpan posisi awal
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    
    // Simpan element yang disentuh
    touchElement = e.currentTarget;
    
    // Tambah visual feedback
    touchElement.style.opacity = '0.7';
    
    console.log('Touch started');
}

/**
 * Handle touch move untuk mobile devices
 * @param {TouchEvent} e - Touch event object
 */
function handleTouchMove(e) {
    if (!touchElement) return;
    
    // Prevent default scrolling
    e.preventDefault();
    
    const touch = e.touches[0];
    
    // Calculate offset dari posisi awal
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    
    // Apply transform untuk visual feedback
    touchElement.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.95)`;
}

/**
 * Handle touch end untuk mobile devices
 * @param {TouchEvent} e - Touch event object
 */
function handleTouchEnd(e) {
    if (!touchElement) return;
    
    // Reset visual
    touchElement.style.opacity = '';
    touchElement.style.transform = '';
    
    // Get touch position
    const touch = e.changedTouches[0];
    
    // Find element di posisi drop
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Check apakah drop target adalah gallery item
    if (dropTarget && dropTarget.classList.contains('gallery-item')) {
        const draggedId = touchElement.dataset.id;
        const targetId = dropTarget.dataset.id;
        
        if (draggedId !== targetId) {
            // Swap items
            swapGalleryItems(parseInt(draggedId), parseInt(targetId));
            renderGallery();
            
            console.log('Touch swap completed');
        }
    }
    
    // Reset
    touchElement = null;
    
    console.log('Touch ended');
}

// Note: Touch handlers akan di-attach saat render
// (sudah include di createGalleryItem function)

// ========================================
// EXPORT (Jika menggunakan module system)
// ========================================

// Uncomment jika menggunakan ES6 modules
// export { renderGallery, resetGallery, saveGalleryState, loadGalleryState };

console.log('✅ Drag Dune Gallery script loaded successfully');