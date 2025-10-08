/* ========================================
   COUNTDOWN SAKURA EVENT
   File ini mengatur logika countdown timer
   
   TEKNIK YANG DIPELAJARI:
   1. Date API - untuk menghitung waktu
   2. setInterval - untuk update otomatis
   3. DOM Manipulation - update HTML
   4. Modular Functions - code yang reusable
   ======================================== */

// ========================================
// KONFIGURASI EVENT
// ========================================

/**
 * TARGET_DATE: Tanggal dan waktu event dimulai
 * Format: 'YYYY-MM-DD HH:MM:SS'
 * 
 * Date API akan parse string ini menjadi Date object
 * Ubah tanggal ini sesuai event Anda
 */
const TARGET_DATE = new Date('2025-12-31 00:00:00');

/**
 * UPDATE_INTERVAL: Interval update countdown (dalam milidetik)
 * 1000ms = 1 detik
 * 
 * setInterval akan memanggil fungsi setiap interval ini
 */
const UPDATE_INTERVAL = 1000;


// ========================================
// CACHE DOM ELEMENTS
// Menyimpan referensi elemen untuk performa
// ========================================

/**
 * Mengambil semua elemen yang akan di-update
 * querySelector/getElementById lebih cepat dari getElementsByClassName
 * 
 * Cache ini mencegah DOM lookup berulang kali
 */
const elements = {
    days: document.getElementById('days'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    eventMessage: document.getElementById('event-message'),
    eventDate: document.getElementById('event-date')
};


// ========================================
// HELPER FUNCTIONS
// Fungsi-fungsi pembantu yang reusable
// ========================================

/**
 * Fungsi untuk menambahkan leading zero
 * Contoh: 5 -> "05", 15 -> "15"
 * 
 * @param {number} num - Angka yang akan diformat
 * @returns {string} - String dengan 2 digit
 * 
 * CARA KERJA:
 * - String(num) mengubah angka jadi string
 * - padStart(2, '0') menambahkan '0' di depan jika kurang dari 2 digit
 */
function formatNumber(num) {
    return String(num).padStart(2, '0');
}

/**
 * Fungsi untuk menghitung selisih waktu
 * Menggunakan Date API untuk kalkulasi
 * 
 * @param {Date} targetDate - Tanggal target event
 * @returns {Object} - Object berisi days, hours, minutes, seconds
 * 
 * CARA KERJA DATE API:
 * 1. new Date() membuat Date object waktu sekarang
 * 2. targetDate.getTime() mengubah date jadi milidetik sejak 1970 (Unix timestamp)
 * 3. Selisih timestamp = sisa waktu dalam milidetik
 */
function calculateTimeRemaining(targetDate) {
    // Dapatkan waktu sekarang
    const now = new Date();
    
    // Hitung selisih dalam milidetik
    // getTime() return jumlah milidetik sejak 1 Jan 1970 00:00:00 UTC
    const difference = targetDate.getTime() - now.getTime();
    
    // Jika waktu sudah lewat, return 0 untuk semua
    if (difference <= 0) {
        return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            isExpired: true
        };
    }
    
    // Konversi milidetik ke unit waktu
    // Math.floor() untuk bulatkan ke bawah (hilangkan desimal)
    
    // 1 detik = 1000 milidetik
    const seconds = Math.floor((difference / 1000) % 60);
    
    // 1 menit = 60 detik = 60000 milidetik
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    
    // 1 jam = 60 menit = 3600 detik = 3600000 milidetik
    const hours = Math.floor((difference / 1000 / 60 / 60) % 24);
    
    // 1 hari = 24 jam = 1440 menit = 86400 detik
    const days = Math.floor(difference / 1000 / 60 / 60 / 24);
    
    // Operator % (modulo) untuk dapatkan sisa pembagian
    // Contoh: 125 detik = 2 menit 5 detik, maka 125 % 60 = 5
    
    return {
        days,
        hours,
        minutes,
        seconds,
        isExpired: false
    };
}

/**
 * Fungsi untuk format tanggal ke format yang readable
 * 
 * @param {Date} date - Date object yang akan diformat
 * @returns {string} - String tanggal terformat
 * 
 * METODE DATE API:
 * - getDate() -> tanggal (1-31)
 * - getMonth() -> bulan (0-11, maka perlu +1)
 * - getFullYear() -> tahun penuh (2025)
 * - getHours() -> jam (0-23)
 * - getMinutes() -> menit (0-59)
 * - toLocaleDateString() -> format tanggal sesuai locale
 */
function formatEventDate(date) {
    // Options untuk format tanggal Indonesia
    const options = {
        weekday: 'long',  // Nama hari lengkap
        year: 'numeric',   // Tahun 4 digit
        month: 'long',     // Nama bulan lengkap
        day: 'numeric',    // Tanggal
        hour: '2-digit',   // Jam 2 digit
        minute: '2-digit'  // Menit 2 digit
    };
    
    // toLocaleDateString() format date sesuai locale dan options
    return date.toLocaleDateString('id-ID', options);
}


// ========================================
// MAIN COUNTDOWN FUNCTION
// Fungsi utama untuk update countdown display
// ========================================

/**
 * Update tampilan countdown di DOM
 * Fungsi ini akan dipanggil setiap detik oleh setInterval
 * 
 * ALUR:
 * 1. Hitung sisa waktu dengan calculateTimeRemaining()
 * 2. Update setiap elemen dengan nilai baru
 * 3. Cek apakah event sudah dimulai
 * 4. Update message sesuai status
 */
function updateCountdown() {
    // Dapatkan sisa waktu
    const timeRemaining = calculateTimeRemaining(TARGET_DATE);
    
    // Update setiap elemen countdown
    // textContent lebih cepat dari innerHTML untuk text sederhana
    elements.days.textContent = formatNumber(timeRemaining.days);
    elements.hours.textContent = formatNumber(timeRemaining.hours);
    elements.minutes.textContent = formatNumber(timeRemaining.minutes);
    elements.seconds.textContent = formatNumber(timeRemaining.seconds);
    
    // Cek apakah event sudah dimulai
    if (timeRemaining.isExpired) {
        // Update message untuk event yang sudah dimulai
        elements.eventMessage.innerHTML = '<p>🎉 <strong>Event Sakura Telah Dimulai!</strong> 🎉</p>';
        
        // Tambah class untuk styling khusus
        elements.eventMessage.classList.add('event-started');
        
        // Optional: Stop interval jika event sudah dimulai
        // Uncomment line di bawah jika ingin stop countdown
        // clearInterval(countdownInterval);
    } else {
        // Event belum dimulai, tampilkan message normal
        elements.eventMessage.innerHTML = '<p>Event dimulai dalam...</p>';
        elements.eventMessage.classList.remove('event-started');
    }
}


// ========================================
// INITIALIZATION
// Inisialisasi dan setup countdown
// ========================================

/**
 * Fungsi untuk inisialisasi countdown
 * Dipanggil saat halaman selesai load
 * 
 * ALUR:
 * 1. Set tanggal event di footer
 * 2. Update countdown pertama kali
 * 3. Set interval untuk update otomatis
 */
function initCountdown() {
    // Display tanggal event di footer
    elements.eventDate.textContent = `📅 ${formatEventDate(TARGET_DATE)}`;
    
    // Update countdown immediately (jangan tunggu 1 detik pertama)
    updateCountdown();
    
    // Setup interval untuk update otomatis setiap detik
    // setInterval mengembalikan ID yang bisa digunakan untuk clearInterval
    const countdownInterval = setInterval(updateCountdown, UPDATE_INTERVAL);
    
    // Log ke console untuk debugging
    console.log('✅ Countdown initialized');
    console.log('🎯 Target date:', TARGET_DATE);
    console.log('⏱️  Update interval:', UPDATE_INTERVAL, 'ms');
}


// ========================================
// EVENT LISTENERS
// Mendengarkan event dari browser
// ========================================

/**
 * DOMContentLoaded: Event yang fire ketika HTML selesai di-parse
 * Lebih cepat dari 'load' yang tunggu semua resource (gambar, css, dll)
 * 
 * addEventListener lebih baik dari onload karena:
 * - Bisa register multiple listeners
 * - Lebih modern dan flexible
 * - Support semua browser modern
 */
document.addEventListener('DOMContentLoaded', initCountdown);

/**
 * Optional: Update countdown ketika tab kembali active
 * Berguna jika user switch tab dan kembali lagi
 * Mencegah countdown tertinggal
 */
document.addEventListener('visibilitychange', function() {
    // visibilityState check apakah tab visible atau hidden
    if (!document.hidden) {
        // Tab kembali visible, update countdown
        updateCountdown();
        console.log('🔄 Tab active - countdown updated');
    }
});


// ========================================
// EXPORTS (untuk testing atau debugging)
// ========================================

/**
 * Export functions jika file ini digunakan sebagai module
 * Berguna untuk testing atau import di file lain
 * 
 * Uncomment jika menggunakan ES6 modules
 */
// export { calculateTimeRemaining, formatNumber, formatEventDate };