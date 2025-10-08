/* ========================================
   SAKURA PETAL ANIMATION
   File ini mengatur animasi kelopak sakura jatuh
   
   TEKNIK YANG DIPELAJARI:
   1. DOM Creation - createElement dan appendChild
   2. Random generation - Math.random()
   3. CSS manipulation via JavaScript
   4. setInterval untuk spawn animation
   5. Memory management - cleanup elements
   ======================================== */

// ========================================
// KONFIGURASI ANIMASI
// ========================================

/**
 * SAKURA_CONFIG: Object untuk konfigurasi animasi
 * Centralized configuration untuk mudah di-adjust
 */
const SAKURA_CONFIG = {
    // Jumlah kelopak yang spawn per interval
    petalsPerSpawn: 1,
    
    // Interval spawn kelopak baru (dalam milidetik)
    // 300ms = spawn 1 kelopak setiap 0.3 detik
    spawnInterval: 300,
    
    // Durasi animasi jatuh (dalam detik)
    // Random antara min dan max untuk variasi
    fallDurationMin: 8,
    fallDurationMax: 15,
    
    // Delay horizontal untuk efek angin (dalam detik)
    // Membuat kelopak bergerak ke samping
    horizontalDelayMin: 0,
    horizontalDelayMax: 5,
    
    // Array emoji sakura untuk variasi
    // Bisa tambahkan emoji lain jika mau
    petalEmojis: ['🌸', '🌸', '🌸', '💮', '🏵️']
};


// ========================================
// CACHE DOM ELEMENTS
// ========================================

/**
 * Container untuk semua kelopak sakura
 * getElementById lebih cepat dari querySelector
 */
const sakuraContainer = document.getElementById('sakura-container');


// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Generate random number dalam range
 * 
 * @param {number} min - Nilai minimum
 * @param {number} max - Nilai maksimum
 * @returns {number} - Random number antara min dan max
 * 
 * CARA KERJA Math.random():
 * - Math.random() menghasilkan float 0 (inclusive) hingga 1 (exclusive)
 * - Contoh: 0, 0.234, 0.789, 0.999
 * - Kita kalikan dengan (max - min) untuk dapatkan range
 * - Tambah min untuk shift ke range yang diinginkan
 */
function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Generate random integer dalam range
 * 
 * @param {number} min - Nilai minimum
 * @param {number} max - Nilai maksimum
 * @returns {number} - Random integer antara min dan max
 * 
 * Math.floor() membulatkan ke bawah
 * Contoh: Math.floor(3.7) = 3
 */
function randomInt(min, max) {
    return Math.floor(randomRange(min, max + 1));
}

/**
 * Pilih random item dari array
 * 
 * @param {Array} array - Array untuk dipilih
 * @returns {*} - Random item dari array
 * 
 * CARA KERJA:
 * - array.length memberikan jumlah item
 * - randomInt(0, length - 1) memberikan index random
 * - array[index] mengambil item di index tersebut
 */
function randomItem(array) {
    return array[randomInt(0, array.length - 1)];
}


// ========================================
// SAKURA PETAL CREATION
// ========================================

/**
 * Buat elemen kelopak sakura baru
 * Fungsi ini membuat DOM element dan set styling
 * 
 * @returns {HTMLElement} - Elemen div kelopak sakura
 * 
 * KONSEP DOM MANIPULATION:
 * 1. createElement() membuat elemen HTML baru di memory
 * 2. classList.add() menambah CSS class
 * 3. style property untuk inline styling
 * 4. textContent untuk isi content
 */
function createSakuraPetal() {
    // Create div element baru
    const petal = document.createElement('div');
    
    // Tambah class untuk CSS styling
    petal.classList.add('sakura-petal');
    
    // Pilih emoji random dari config
    const emoji = randomItem(SAKURA_CONFIG.petalEmojis);
    petal.textContent = emoji;
    
    // ===== POSITIONING =====
    // left: posisi horizontal random (0% - 100% dari lebar layar)
    // Kelopak akan muncul di posisi horizontal random
    const leftPosition = randomRange(0, 100);
    petal.style.left = `${leftPosition}%`;
    
    // top: mulai dari atas layar (sebelum visible)
    // -100px agar kelopak muncul smooth dari atas
    petal.style.top = '-100px';
    
    // ===== ANIMATION TIMING =====
    // animationDuration: berapa lama kelopak jatuh
    // Random untuk variasi kecepatan
    const duration = randomRange(
        SAKURA_CONFIG.fallDurationMin,
        SAKURA_CONFIG.fallDurationMax
    );
    petal.style.animationDuration = `${duration}s`;
    
    // animationDelay: delay sebelum animasi mulai
    // Membuat kelopak tidak semua mulai bersamaan
    const delay = randomRange(
        SAKURA_CONFIG.horizontalDelayMin,
        SAKURA_CONFIG.horizontalDelayMax
    );
    petal.style.animationDelay = `${delay}s`;
    
    // ===== VISUAL VARIATIONS =====
    // opacity: transparansi random untuk depth effect
    // Kelopak yang lebih transparan terlihat lebih jauh
    const opacity = randomRange(0.5, 0.9);
    petal.style.opacity = opacity;
    
    // transform scale: ukuran random untuk variasi
    // Beberapa kelopak lebih besar, beberapa lebih kecil
    const scale = randomRange(0.7, 1.3);
    petal.style.transform = `scale(${scale})`;
    
    // Return elemen yang sudah dikonfigurasi
    return petal;
}


// ========================================
// SPAWNING & CLEANUP
// ========================================

/**
 * Spawn kelopak sakura baru ke container
 * Fungsi ini dipanggil secara interval
 * 
 * KONSEP:
 * - appendChild() menambahkan element ke DOM
 * - Element baru akan langsung visible dan animated
 */
function spawnSakuraPetals() {
    // Spawn sejumlah petalsPerSpawn
    for (let i = 0; i < SAKURA_CONFIG.petalsPerSpawn; i++) {
        // Create kelopak baru
        const petal = createSakuraPetal();
        
        // Tambahkan ke container
        // appendChild() memasukkan element ke dalam parent
        sakuraContainer.appendChild(petal);
        
        // ===== CLEANUP AUTOMATION =====
        // Hapus kelopak setelah animasi selesai untuk prevent memory leak
        // Hitung total waktu animasi (duration + delay)
        const totalDuration = parseFloat(petal.style.animationDuration) + 
                             parseFloat(petal.style.animationDelay);
        
        // setTimeout: eksekusi fungsi setelah waktu tertentu
        // Konversi detik ke milidetik (*1000)
        // Tambah 500ms buffer untuk ensure animasi selesai
        setTimeout(() => {
            // Cek apakah element masih ada di DOM
            if (petal.parentNode === sakuraContainer) {
                // removeChild() hapus element dari DOM
                sakuraContainer.removeChild(petal);
            }
        }, (totalDuration + 0.5) * 1000);
    }
}

/**
 * Manual cleanup function
 * Bersihkan semua kelopak dari container
 * Berguna untuk reset atau destroy animation
 */
function cleanupSakuraPetals() {
    // innerHTML = '' menghapus semua child elements
    // Lebih cepat dari removeChild() satu per satu
    sakuraContainer.innerHTML = '';
    console.log('🧹 Sakura petals cleaned up');
}


// ========================================
// INITIALIZATION
// ========================================

/**
 * Inisialisasi animasi sakura
 * Setup interval untuk spawn kelopak secara otomatis
 * 
 * @returns {number} - Interval ID untuk cleanup nanti
 */
function initSakuraAnimation() {
    // Spawn initial batch untuk langsung ada animasi
    spawnSakuraPetals();
    
    // Setup interval untuk spawn kelopak baru secara continuous
    // setInterval() memanggil fungsi berulang dengan interval tertentu
    // Return value adalah ID yang bisa digunakan untuk clearInterval()
    const spawnInterval = setInterval(
        spawnSakuraPetals, 
        SAKURA_CONFIG.spawnInterval
    );
    
    // Log untuk debugging
    console.log('🌸 Sakura animation initialized');
    console.log(`⏱️  Spawning ${SAKURA_CONFIG.petalsPerSpawn} petal(s) every ${SAKURA_CONFIG.spawnInterval}ms`);
    
    // Return interval ID jika perlu stop nanti
    return spawnInterval;
}


// ========================================
// PERFORMANCE OPTIMIZATION
// ========================================

/**
 * Pause animation ketika tab tidak active
 * Menghemat CPU/battery ketika user tidak lihat page
 * 
 * visibilitychange event: fire ketika tab visibility berubah
 * document.hidden: boolean, true jika tab tidak visible
 */
let sakuraInterval = null;

function handleVisibilityChange() {
    if (document.hidden) {
        // Tab hidden, stop spawning
        if (sakuraInterval) {
            clearInterval(sakuraInterval);
            sakuraInterval = null;
            console.log('⏸️  Sakura animation paused (tab hidden)');
        }
    } else {
        // Tab visible, resume spawning
        if (!sakuraInterval) {
            sakuraInterval = initSakuraAnimation();
            console.log('▶️  Sakura animation resumed (tab visible)');
        }
    }
}


// ========================================
// EVENT LISTENERS
// ========================================

/**
 * DOMContentLoaded: Fire ketika HTML selesai di-parse
 * Event ini lebih cepat dari 'load' event
 * 
 * addEventListener: modern way untuk register event handlers
 * - Bisa register multiple handlers untuk event yang sama
 * - Mendukung options seperti once, passive, capture
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize animation
    sakuraInterval = initSakuraAnimation();
    
    // Setup visibility change handler untuk performance
    document.addEventListener('visibilitychange', handleVisibilityChange);
});

/**
 * Optional: Cleanup on page unload
 * beforeunload: fire sebelum user leave page
 * Bagus untuk cleanup resources
 */
window.addEventListener('beforeunload', function() {
    // Stop interval
    if (sakuraInterval) {
        clearInterval(sakuraInterval);
    }
    
    // Cleanup DOM elements
    cleanupSakuraPetals();
    
    console.log('👋 Sakura animation cleanup completed');
});


// ========================================
// EXPORTS (untuk testing atau debugging)
// ========================================

/**
 * Export functions jika menggunakan ES6 modules
 * Uncomment jika file ini dijadikan module
 */
// export { 
//     initSakuraAnimation, 
//     cleanupSakuraPetals, 
//     SAKURA_CONFIG 
// };