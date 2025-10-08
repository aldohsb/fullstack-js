/* ====================================
   QUIZ CARNIVAL - MAIN APPLICATION
   Entry point dan orchestration logic
   ==================================== */

/**
 * APPLICATION ARCHITECTURE
 * ========================
 * File ini adalah "controller" yang menghubungkan semua module
 * 
 * Flow Aplikasi:
 * 1. User masuk → Welcome Screen
 * 2. Input nama → Validasi → Mulai Quiz
 * 3. Jawab pertanyaan → Update State → Next Question
 * 4. Quiz selesai → Hitung hasil → Show Result
 * 5. Play again → Reset → Kembali ke Welcome
 * 
 * Pelajaran Teknik React yang Diterapkan:
 * - Component Lifecycle: Initialize → Mount → Update → Unmount
 * - Event Driven: Semua aksi triggered by events
 * - Unidirectional Data Flow: State → UI (one way)
 */

/**
 * initializeApp
 * Fungsi utama untuk inisialisasi aplikasi
 * Dipanggil saat DOM sudah ready
 */
function initializeApp() {
    console.log('🎪 Quiz Carnival Starting...');
    
    // Step 1: Initialize state management
    initializeState();
    
    // Step 2: Initialize DOM elements
    initializeDOM();
    
    // Step 3: Setup event listeners
    setupEventListeners();
    
    // Step 4: Show welcome screen
    showScreen('welcome');
    
    console.log('✅ App initialized successfully!');
}

/**
 * setupEventListeners
 * Mendaftarkan semua event listeners
 * Centralized event handling untuk maintainability
 */
function setupEventListeners() {
    // Welcome Screen Events
    DOM_ELEMENTS.startBtn.addEventListener('click', handleStartQuiz);
    
    // Tambah event listener untuk Enter key di input nama
    DOM_ELEMENTS.playerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleStartQuiz();
        }
    });
    
    // Quiz Screen Events
    DOM_ELEMENTS.prevBtn.addEventListener('click', handlePreviousQuestion);
    DOM_ELEMENTS.nextBtn.addEventListener('click', handleNextQuestion);
    
    // Result Screen Events
    DOM_ELEMENTS.restartBtn.addEventListener('click', handleRestart);
    
    console.log('Event listeners setup complete');
}

/**
 * handleStartQuiz
 * Handler untuk tombol "Mulai Quiz"
 * Validasi input dan mulai quiz
 */
function handleStartQuiz() {
    // Ambil nilai input nama
    const nameInput = DOM_ELEMENTS.playerNameInput.value.trim();
    
    // Validasi: Nama tidak boleh kosong
    if (nameInput === '') {
        showError('Mohon masukkan nama kamu terlebih dahulu! 😊');
        // Tambah animasi shake ke input
        DOM_ELEMENTS.playerNameInput.classList.add('shake');
        setTimeout(() => {
            DOM_ELEMENTS.playerNameInput.classList.remove('shake');
        }, 500);
        return;
    }
    
    // Validasi: Nama minimal 2 karakter
    if (nameInput.length < 2) {
        showError('Nama terlalu pendek! Minimal 2 karakter ya. 😊');
        return;
    }
    
    // Simpan nama ke state
    setPlayerName(nameInput);
    
    // Update UI dengan nama pemain
    updatePlayerName();
    
    // Reset score display
    updateScore();
    
    // Render pertanyaan pertama
    renderQuestion();
    
    // Pindah ke quiz screen
    showScreen('quiz');
    
    console.log('Quiz started for player:', nameInput);
}

/**
 * handlePreviousQuestion
 * Handler untuk tombol "Sebelumnya"
 * Kembali ke pertanyaan sebelumnya
 */
function handlePreviousQuestion() {
    // Panggil fungsi state management
    const success = previousQuestion();
    
    if (success) {
        // Re-render pertanyaan
        renderQuestion();
        
        // Scroll ke atas untuk UX lebih baik
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * handleNextQuestion
 * Handler untuk tombol "Selanjutnya" atau "Selesai"
 * Validasi jawaban dan navigasi
 */
function handleNextQuestion() {
    // Check apakah pertanyaan sudah dijawab
    const currentAnswer = getAnswer();
    
    if (!currentAnswer) {
        // Jika belum dijawab, tampilkan peringatan
        showAnswerWarning();
        return;
    }
    
    // Check apakah ini pertanyaan terakhir
    const currentIndex = getCurrentQuestionIndex();
    const totalQuestions = getTotalQuestions();
    
    if (currentIndex === totalQuestions - 1) {
        // Jika pertanyaan terakhir, tampilkan hasil
        finishQuiz();
    } else {
        // Jika bukan, lanjut ke pertanyaan berikutnya
        const success = nextQuestion();
        
        if (success) {
            // Re-render pertanyaan baru
            renderQuestion();
            
            // Scroll ke atas
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
}

/**
 * showAnswerWarning
 * Menampilkan peringatan jika user belum pilih jawaban
 */
function showAnswerWarning() {
    // Tambah animasi shake ke container jawaban
    const answersContainer = DOM_ELEMENTS.answersContainer;
    answersContainer.classList.add('animate-shake');
    
    // Buat element peringatan
    const warningDiv = document.createElement('div');
    warningDiv.className = 'answer-warning';
    warningDiv.style.color = '#F38181';
    warningDiv.style.textAlign = 'center';
    warningDiv.style.marginTop = '16px';
    warningDiv.style.fontWeight = '600';
    warningDiv.style.fontSize = '1rem';
    warningDiv.textContent = '⚠️ Pilih salah satu jawaban terlebih dahulu!';
    
    // Hapus warning yang lama jika ada
    const oldWarning = document.querySelector('.answer-warning');
    if (oldWarning) {
        oldWarning.remove();
    }
    
    // Insert warning setelah answers container
    answersContainer.parentNode.insertBefore(
        warningDiv, 
        answersContainer.nextSibling
    );
    
    // Remove animasi shake setelah selesai
    setTimeout(() => {
        answersContainer.classList.remove('animate-shake');
        warningDiv.remove();
    }, 2000);
}

/**
 * finishQuiz
 * Menyelesaikan quiz dan tampilkan hasil
 */
function finishQuiz() {
    console.log('Quiz completed!');
    
    // Hitung dan render hasil
    renderResults();
    
    // Pindah ke result screen
    showScreen('result');
    
    // Scroll ke atas
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Log hasil untuk debugging
    const results = calculateResults();
    console.log('Final Results:', results);
}

/**
 * handleRestart
 * Handler untuk tombol "Main Lagi"
 * Reset semua dan mulai dari awal
 */
function handleRestart() {
    // Konfirmasi dari user (opsional, bisa dihapus jika tidak perlu)
    const confirm = window.confirm('Yakin ingin main lagi? Progress akan direset.');
    
    if (!confirm) {
        return;
    }
    
    // Reset state
    resetState();
    
    // Reset UI
    resetUI();
    
    // Clear confetti
    clearConfetti();
    
    console.log('App restarted');
}

/**
 * DOMContentLoaded Event
 * Entry point aplikasi
 * Tunggu sampai DOM selesai loading sebelum initialize
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    // Initialize aplikasi
    initializeApp();
    
    // Tambahan: Log info untuk developer
    console.log('%c🎪 Quiz Carnival 🎪', 'color: #FF6B6B; font-size: 24px; font-weight: bold;');
    console.log('%cWelcome to Quiz Carnival!', 'color: #4ECDC4; font-size: 16px;');
    console.log('%cTips: Buka Console untuk melihat state changes', 'color: #FFE66D; font-size: 12px;');
});

/**
 * ADDITIONAL FEATURES (Optional Enhancement)
 * Fitur tambahan yang bisa ditambahkan di masa depan:
 * 
 * 1. Timer per Pertanyaan
 *    - Tambah countdown timer untuk setiap pertanyaan
 *    - Auto submit jika waktu habis
 * 
 * 2. Leaderboard
 *    - Simpan high scores ke localStorage
 *    - Tampilkan top 10 players
 * 
 * 3. Kategori Quiz
 *    - Multiple kategori (Sains, Sejarah, Olahraga, dll)
 *    - User bisa pilih kategori
 * 
 * 4. Difficulty Levels
 *    - Easy, Medium, Hard
 *    - Scoring berbeda per level
 * 
 * 5. Sound Effects
 *    - Sound saat jawab benar/salah
 *    - Background music
 * 
 * 6. Social Sharing
 *    - Share hasil ke social media
 *    - Challenge friends
 * 
 * 7. Review Answers
 *    - Screen khusus untuk review semua jawaban
 *    - Lihat penjelasan jawaban yang benar
 * 
 * 8. Animations
 *    - Lebih banyak micro-interactions
 *    - Page transitions yang smooth
 */

/**
 * ERROR HANDLING
 * Global error handler untuk catch unexpected errors
 */
window.addEventListener('error', (event) => {
    console.error('Global Error:', event.error);
    
    // Tampilkan pesan user-friendly
    alert('Oops! Terjadi kesalahan. Silakan refresh halaman.');
});

/**
 * PERFORMANCE MONITORING (Development)
 * Monitor performa aplikasi
 */
if (window.performance) {
    window.addEventListener('load', () => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        
        console.log(`📊 Page Load Time: ${pageLoadTime}ms`);
    });
}

/**
 * KEYBOARD SHORTCUTS (Easter Egg)
 * Tambahan keyboard shortcuts untuk power users
 */
document.addEventListener('keydown', (e) => {
    // Hanya aktif di quiz screen
    if (!DOM_ELEMENTS.quizScreen.classList.contains('active')) {
        return;
    }
    
    // Number keys 1-4 untuk pilih jawaban
    if (e.key >= '1' && e.key <= '4') {
        const answerIndex = parseInt(e.key) - 1;
        const answerButtons = document.querySelectorAll('.answer-option');
        
        if (answerButtons[answerIndex]) {
            answerButtons[answerIndex].click();
        }
    }
    
    // Arrow Left untuk previous
    if (e.key === 'ArrowLeft' && !DOM_ELEMENTS.prevBtn.disabled) {
        handlePreviousQuestion();
    }
    
    // Arrow Right atau Enter untuk next
    if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNextQuestion();
    }
});

/**
 * MOBILE OPTIMIZATIONS
 * Optimasi untuk pengalaman mobile yang lebih baik
 */
// Prevent double-tap zoom pada buttons
document.addEventListener('touchend', (e) => {
    if (e.target.classList.contains('btn') || 
        e.target.classList.contains('answer-option')) {
        e.preventDefault();
        e.target.click();
    }
}, { passive: false });

// Prevent pull-to-refresh pada mobile
let startY = 0;
document.addEventListener('touchstart', (e) => {
    startY = e.touches[0].pageY;
}, { passive: true });

document.addEventListener('touchmove', (e) => {
    const y = e.touches[0].pageY;
    // Prevent pull-to-refresh jika scroll di posisi top
    if (window.scrollY === 0 && y > startY) {
        e.preventDefault();
    }
}, { passive: false });

/**
 * ACCESSIBILITY ENHANCEMENTS
 * Meningkatkan accessibility untuk semua user
 */
// Announce screen changes untuk screen readers
function announceScreenChange(screenName) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only'; // Screen reader only class
    announcement.textContent = `Navigated to ${screenName} screen`;
    document.body.appendChild(announcement);
    
    setTimeout(() => announcement.remove(), 1000);
}

// Focus management untuk keyboard navigation
function manageFocus(screenName) {
    setTimeout(() => {
        if (screenName === 'welcome') {
            DOM_ELEMENTS.playerNameInput.focus();
        } else if (screenName === 'quiz') {
            DOM_ELEMENTS.questionText.focus();
        } else if (screenName === 'result') {
            DOM_ELEMENTS.resultTitle.focus();
        }
    }, 100);
}

console.log('✅ Quiz Carnival App Loaded Successfully!');