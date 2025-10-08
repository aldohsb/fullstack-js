/* ====================================
   QUIZ CARNIVAL - UI FUNCTIONS
   Fungsi-fungsi untuk manipulasi tampilan
   ==================================== */

/**
 * UI MANAGEMENT PATTERN
 * =====================
 * Semua fungsi yang berhubungan dengan DOM manipulation
 * Memisahkan logic UI dari business logic (separation of concerns)
 * 
 * Pelajaran Teknik React yang Diterapkan:
 * - Component Thinking: Setiap fungsi handle satu bagian UI spesifik
 * - Declarative UI: Render UI berdasarkan state, bukan imperative commands
 * - Event Handling: Centralized event listeners
 */

/**
 * DOM_ELEMENTS
 * Cache semua DOM elements yang sering digunakan
 * Lebih efisien daripada query selector berulang kali
 */
const DOM_ELEMENTS = {
    // Screens
    welcomeScreen: null,
    quizScreen: null,
    resultScreen: null,
    
    // Welcome elements
    playerNameInput: null,
    startBtn: null,
    
    // Quiz elements
    displayName: null,
    currentScore: null,
    progressBar: null,
    progressText: null,
    questionNumber: null,
    questionText: null,
    answersContainer: null,
    prevBtn: null,
    nextBtn: null,
    
    // Result elements
    resultIcon: null,
    resultTitle: null,
    finalName: null,
    finalScore: null,
    correctAnswers: null,
    accuracy: null,
    resultMessage: null,
    restartBtn: null,
    
    // Confetti container
    confettiContainer: null
};

/**
 * initializeDOM
 * Inisialisasi dan cache semua DOM elements
 * Dipanggil saat aplikasi pertama kali load
 */
function initializeDOM() {
    // Screens
    DOM_ELEMENTS.welcomeScreen = document.getElementById('welcomeScreen');
    DOM_ELEMENTS.quizScreen = document.getElementById('quizScreen');
    DOM_ELEMENTS.resultScreen = document.getElementById('resultScreen');
    
    // Welcome elements
    DOM_ELEMENTS.playerNameInput = document.getElementById('playerName');
    DOM_ELEMENTS.startBtn = document.getElementById('startBtn');
    
    // Quiz elements
    DOM_ELEMENTS.displayName = document.getElementById('displayName');
    DOM_ELEMENTS.currentScore = document.getElementById('currentScore');
    DOM_ELEMENTS.progressBar = document.getElementById('progressBar');
    DOM_ELEMENTS.progressText = document.getElementById('progressText');
    DOM_ELEMENTS.questionNumber = document.getElementById('questionNumber');
    DOM_ELEMENTS.questionText = document.getElementById('questionText');
    DOM_ELEMENTS.answersContainer = document.getElementById('answersContainer');
    DOM_ELEMENTS.prevBtn = document.getElementById('prevBtn');
    DOM_ELEMENTS.nextBtn = document.getElementById('nextBtn');
    
    // Result elements
    DOM_ELEMENTS.resultIcon = document.getElementById('resultIcon');
    DOM_ELEMENTS.resultTitle = document.getElementById('resultTitle');
    DOM_ELEMENTS.finalName = document.getElementById('finalName');
    DOM_ELEMENTS.finalScore = document.getElementById('finalScore');
    DOM_ELEMENTS.correctAnswers = document.getElementById('correctAnswers');
    DOM_ELEMENTS.accuracy = document.getElementById('accuracy');
    DOM_ELEMENTS.resultMessage = document.getElementById('resultMessage');
    DOM_ELEMENTS.restartBtn = document.getElementById('restartBtn');
    
    // Confetti container
    DOM_ELEMENTS.confettiContainer = document.getElementById('confettiContainer');
    
    console.log('DOM elements initialized');
}

/**
 * showScreen
 * Menampilkan screen tertentu dan hide yang lain
 * 
 * @param {string} screenName - Nama screen: 'welcome', 'quiz', 'result'
 */
function showScreen(screenName) {
    // Remove class 'active' dari semua screens
    DOM_ELEMENTS.welcomeScreen.classList.remove('active');
    DOM_ELEMENTS.quizScreen.classList.remove('active');
    DOM_ELEMENTS.resultScreen.classList.remove('active');
    
    // Tambahkan class 'active' ke screen yang dipilih
    switch(screenName) {
        case 'welcome':
            DOM_ELEMENTS.welcomeScreen.classList.add('active');
            break;
        case 'quiz':
            DOM_ELEMENTS.quizScreen.classList.add('active');
            break;
        case 'result':
            DOM_ELEMENTS.resultScreen.classList.add('active');
            break;
    }
    
    console.log('Showing screen:', screenName);
}

/**
 * renderQuestion
 * Render pertanyaan ke UI berdasarkan state saat ini
 */
function renderQuestion() {
    const question = getCurrentQuestion();
    const questionIndex = getCurrentQuestionIndex();
    const savedAnswer = getAnswer();
    
    // Update nomor pertanyaan
    DOM_ELEMENTS.questionNumber.textContent = questionIndex + 1;
    
    // Update teks pertanyaan
    DOM_ELEMENTS.questionText.textContent = question.question;
    
    // Clear container jawaban
    DOM_ELEMENTS.answersContainer.innerHTML = '';
    
    // Render setiap pilihan jawaban
    question.options.forEach((option, index) => {
        // Buat element button untuk setiap jawaban
        const answerBtn = document.createElement('button');
        answerBtn.className = 'answer-option';
        answerBtn.textContent = option;
        
        // Tambahkan class 'selected' jika ini jawaban yang dipilih sebelumnya
        if (savedAnswer && savedAnswer.selectedAnswer === index) {
            answerBtn.classList.add('selected');
        }
        
        // Event listener untuk pilih jawaban
        answerBtn.addEventListener('click', () => handleAnswerClick(index));
        
        // Append ke container
        DOM_ELEMENTS.answersContainer.appendChild(answerBtn);
    });
    
    // Update progress
    updateProgress();
    
    // Update tombol navigasi
    updateNavigationButtons();
}

/**
 * updateProgress
 * Update progress bar dan teks progress
 */
function updateProgress() {
    const percentage = getProgressPercentage();
    const current = getCurrentQuestionIndex() + 1;
    const total = getTotalQuestions();
    
    // Update width progress bar dengan animasi smooth
    DOM_ELEMENTS.progressBar.style.width = percentage + '%';
    
    // Update teks progress
    DOM_ELEMENTS.progressText.textContent = `Pertanyaan ${current} dari ${total}`;
}

/**
 * updateNavigationButtons
 * Update state tombol Previous dan Next
 */
function updateNavigationButtons() {
    const currentIndex = getCurrentQuestionIndex();
    const totalQuestions = getTotalQuestions();
    
    // Disable tombol Previous di pertanyaan pertama
    if (currentIndex === 0) {
        DOM_ELEMENTS.prevBtn.disabled = true;
    } else {
        DOM_ELEMENTS.prevBtn.disabled = false;
    }
    
    // Ubah teks tombol Next di pertanyaan terakhir
    if (currentIndex === totalQuestions - 1) {
        DOM_ELEMENTS.nextBtn.textContent = 'Selesai 🎊';
    } else {
        DOM_ELEMENTS.nextBtn.textContent = 'Selanjutnya →';
    }
}

/**
 * updateScore
 * Update tampilan skor di UI
 */
function updateScore() {
    const score = getScore();
    DOM_ELEMENTS.currentScore.textContent = `Skor: ${score}`;
}

/**
 * updatePlayerName
 * Update tampilan nama pemain di quiz screen
 */
function updatePlayerName() {
    const name = getPlayerName();
    DOM_ELEMENTS.displayName.textContent = name;
}

/**
 * renderResults
 * Render hasil quiz di result screen
 */
function renderResults() {
    const results = calculateResults();
    
    // Update semua field hasil
    DOM_ELEMENTS.finalName.textContent = results.playerName;
    DOM_ELEMENTS.finalScore.textContent = results.score;
    DOM_ELEMENTS.correctAnswers.textContent = 
        `${results.correctCount}/${results.totalQuestions}`;
    DOM_ELEMENTS.accuracy.textContent = `${results.accuracy}%`;
    
    // Tentukan icon dan pesan berdasarkan performa
    let icon, title, message;
    
    if (results.accuracy >= 80) {
        icon = '🏆';
        title = 'Luar Biasa!';
        message = 'Kamu benar-benar ahli! Pertahankan terus performamu yang sempurna!';
    } else if (results.accuracy >= 60) {
        icon = '🎉';
        title = 'Bagus Sekali!';
        message = 'Hasil yang memuaskan! Sedikit lagi kamu bisa sempurna!';
    } else if (results.accuracy >= 40) {
        icon = '👍';
        title = 'Tidak Buruk!';
        message = 'Kamu sudah cukup baik, tapi masih ada ruang untuk improvement!';
    } else {
        icon = '💪';
        title = 'Tetap Semangat!';
        message = 'Jangan menyerah! Practice makes perfect. Coba lagi ya!';
    }
    
    // Update UI dengan hasil
    DOM_ELEMENTS.resultIcon.textContent = icon;
    DOM_ELEMENTS.resultTitle.textContent = title;
    DOM_ELEMENTS.resultMessage.textContent = message;
    
    // Trigger confetti animation untuk celebration
    createConfetti();
}

/**
 * createConfetti
 * Membuat animasi confetti jatuh
 */
function createConfetti() {
    // Clear confetti yang ada
    DOM_ELEMENTS.confettiContainer.innerHTML = '';
    
    // Array warna confetti
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'];
    
    // Buat 50 partikel confetti
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        // Random warna
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.backgroundColor = randomColor;
        
        // Random posisi horizontal (0-100% dari lebar layar)
        const randomLeft = Math.random() * 100;
        confetti.style.left = randomLeft + '%';
        
        // Random delay untuk efek bergelombang
        const randomDelay = Math.random() * 2;
        confetti.style.animationDelay = randomDelay + 's';
        
        // Random durasi jatuh
        const randomDuration = 3 + Math.random() * 2; // 3-5 detik
        confetti.style.animationDuration = randomDuration + 's';
        
        // Apply animation
        confetti.style.animation = `confettiFall ${randomDuration}s linear ${randomDelay}s infinite`;
        
        // Append ke container
        DOM_ELEMENTS.confettiContainer.appendChild(confetti);
    }
}

/**
 * clearConfetti
 * Menghapus semua confetti
 */
function clearConfetti() {
    DOM_ELEMENTS.confettiContainer.innerHTML = '';
}

/**
 * showError
 * Menampilkan pesan error (untuk validasi input)
 * 
 * @param {string} message - Pesan error
 */
function showError(message) {
    // Buat element error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message animate-shake';
    errorDiv.style.color = '#F38181';
    errorDiv.style.marginTop = '10px';
    errorDiv.style.fontWeight = '600';
    errorDiv.textContent = message;
    
    // Tambahkan ke welcome card
    const welcomeCard = document.querySelector('.welcome-card');
    
    // Hapus error message yang lama jika ada
    const oldError = welcomeCard.querySelector('.error-message');
    if (oldError) {
        oldError.remove();
    }
    
    // Append error baru
    welcomeCard.appendChild(errorDiv);
    
    // Auto remove setelah 3 detik
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

/**
 * handleAnswerClick
 * Handler saat user klik pilihan jawaban
 * 
 * @param {number} selectedIndex - Index jawaban yang dipilih
 */
function handleAnswerClick(selectedIndex) {
    const question = getCurrentQuestion();
    
    // Simpan jawaban ke state
    setAnswer(question.id, selectedIndex);
    
    // Update tampilan skor
    updateScore();
    
    // Re-render question untuk update visual pilihan
    renderQuestion();
    
    console.log('Answer selected:', selectedIndex);
}

/**
 * resetUI
 * Reset UI ke kondisi awal
 */
function resetUI() {
    // Reset input nama
    DOM_ELEMENTS.playerNameInput.value = '';
    
    // Clear confetti
    clearConfetti();
    
    // Kembali ke welcome screen
    showScreen('welcome');
}