/* ====================================
   QUIZ CARNIVAL - STATE MANAGEMENT
   Mengelola state/kondisi aplikasi
   ==================================== */

/**
 * STATE MANAGEMENT PATTERN
 * ========================
 * Konsep: Semua data aplikasi disimpan dalam satu object (single source of truth)
 * Benefit: Mudah tracking perubahan data, debugging lebih mudah, predictable
 * 
 * Pelajaran Teknik React yang Diterapkan:
 * - Centralized State: Mirip dengan useState di React
 * - Immutability: Tidak mengubah state langsung, tapi membuat copy baru
 * - State Updates: Fungsi khusus untuk update state (seperti setState)
 */

/**
 * APP_STATE
 * Object utama yang menyimpan semua state aplikasi
 * 
 * Struktur State:
 * - playerName: nama pemain
 * - currentQuestionIndex: index pertanyaan saat ini (0-based)
 * - score: skor pemain saat ini
 * - answers: array menyimpan jawaban user untuk setiap pertanyaan
 * - isQuizCompleted: boolean apakah quiz sudah selesai
 * - questions: array semua pertanyaan (di-load dari questions.js)
 */
const APP_STATE = {
    playerName: '',
    currentQuestionIndex: 0,
    score: 0,
    answers: [], // Format: [{ questionId, selectedAnswer, isCorrect }, ...]
    isQuizCompleted: false,
    questions: []
};

/**
 * initializeState
 * Fungsi untuk inisialisasi state di awal aplikasi
 * Memuat data pertanyaan dan reset semua nilai
 */
function initializeState() {
    // Load pertanyaan dari questions.js
    APP_STATE.questions = getAllQuestions();
    
    // Initialize array answers dengan null untuk setiap pertanyaan
    // Array.from() membuat array baru dengan panjang tertentu
    // fill(null) mengisi semua element dengan null
    APP_STATE.answers = Array.from(
        { length: APP_STATE.questions.length }, 
        () => null
    );
    
    console.log('State initialized:', APP_STATE);
}

/**
 * setPlayerName
 * Update nama pemain dalam state
 * 
 * @param {string} name - Nama pemain
 */
function setPlayerName(name) {
    // Trim untuk menghapus spasi di awal/akhir
    APP_STATE.playerName = name.trim();
    console.log('Player name set:', APP_STATE.playerName);
}

/**
 * getPlayerName
 * Mendapatkan nama pemain dari state
 * 
 * @returns {string} Nama pemain
 */
function getPlayerName() {
    return APP_STATE.playerName;
}

/**
 * getCurrentQuestion
 * Mendapatkan pertanyaan yang sedang aktif
 * 
 * @returns {Object} Object pertanyaan saat ini
 */
function getCurrentQuestion() {
    return APP_STATE.questions[APP_STATE.currentQuestionIndex];
}

/**
 * getCurrentQuestionIndex
 * Mendapatkan index pertanyaan saat ini
 * 
 * @returns {number} Index pertanyaan (0-based)
 */
function getCurrentQuestionIndex() {
    return APP_STATE.currentQuestionIndex;
}

/**
 * setAnswer
 * Menyimpan jawaban user untuk pertanyaan tertentu
 * 
 * @param {number} questionId - ID pertanyaan
 * @param {number} selectedAnswer - Index jawaban yang dipilih
 */
function setAnswer(questionId, selectedAnswer) {
    const question = getCurrentQuestion();
    
    // Check apakah jawaban benar
    const isCorrect = selectedAnswer === question.correctAnswer;
    
    // Simpan jawaban di array answers sesuai index pertanyaan
    APP_STATE.answers[APP_STATE.currentQuestionIndex] = {
        questionId: questionId,
        selectedAnswer: selectedAnswer,
        isCorrect: isCorrect
    };
    
    // Update score jika jawaban benar
    if (isCorrect) {
        APP_STATE.score += 10; // Setiap jawaban benar +10 poin
    }
    
    console.log('Answer saved:', APP_STATE.answers[APP_STATE.currentQuestionIndex]);
}

/**
 * getAnswer
 * Mendapatkan jawaban user untuk pertanyaan saat ini
 * 
 * @returns {Object|null} Object jawaban atau null jika belum dijawab
 */
function getAnswer() {
    return APP_STATE.answers[APP_STATE.currentQuestionIndex];
}

/**
 * nextQuestion
 * Pindah ke pertanyaan selanjutnya
 * 
 * @returns {boolean} true jika berhasil, false jika sudah pertanyaan terakhir
 */
function nextQuestion() {
    // Check apakah masih ada pertanyaan berikutnya
    if (APP_STATE.currentQuestionIndex < APP_STATE.questions.length - 1) {
        APP_STATE.currentQuestionIndex++;
        console.log('Moved to question:', APP_STATE.currentQuestionIndex + 1);
        return true;
    }
    
    // Jika sudah pertanyaan terakhir, tandai quiz completed
    APP_STATE.isQuizCompleted = true;
    console.log('Quiz completed!');
    return false;
}

/**
 * previousQuestion
 * Kembali ke pertanyaan sebelumnya
 * 
 * @returns {boolean} true jika berhasil, false jika sudah pertanyaan pertama
 */
function previousQuestion() {
    if (APP_STATE.currentQuestionIndex > 0) {
        APP_STATE.currentQuestionIndex--;
        console.log('Moved back to question:', APP_STATE.currentQuestionIndex + 1);
        return true;
    }
    return false;
}

/**
 * getScore
 * Mendapatkan skor saat ini
 * 
 * @returns {number} Skor pemain
 */
function getScore() {
    return APP_STATE.score;
}

/**
 * calculateResults
 * Menghitung statistik hasil quiz
 * 
 * @returns {Object} Object berisi statistik hasil
 */
function calculateResults() {
    // Filter jawaban yang benar
    const correctAnswers = APP_STATE.answers.filter(answer => 
        answer && answer.isCorrect
    );
    
    const totalQuestions = APP_STATE.questions.length;
    const correctCount = correctAnswers.length;
    
    // Hitung persentase akurasi
    const accuracy = Math.round((correctCount / totalQuestions) * 100);
    
    return {
        playerName: APP_STATE.playerName,
        totalQuestions: totalQuestions,
        correctCount: correctCount,
        wrongCount: totalQuestions - correctCount,
        score: APP_STATE.score,
        accuracy: accuracy
    };
}

/**
 * resetState
 * Reset state ke kondisi awal untuk main lagi
 */
function resetState() {
    APP_STATE.playerName = '';
    APP_STATE.currentQuestionIndex = 0;
    APP_STATE.score = 0;
    APP_STATE.isQuizCompleted = false;
    
    // Reset answers array
    APP_STATE.answers = Array.from(
        { length: APP_STATE.questions.length }, 
        () => null
    );
    
    console.log('State reset');
}

/**
 * isQuizCompleted
 * Check apakah quiz sudah selesai
 * 
 * @returns {boolean} true jika selesai
 */
function isQuizCompleted() {
    return APP_STATE.isQuizCompleted;
}

/**
 * getProgressPercentage
 * Menghitung persentase progress quiz
 * 
 * @returns {number} Persentase progress (0-100)
 */
function getProgressPercentage() {
    const total = APP_STATE.questions.length;
    const current = APP_STATE.currentQuestionIndex + 1;
    return Math.round((current / total) * 100);
}

/**
 * Debug function untuk melihat state (development only)
 */
function debugState() {
    console.log('=== CURRENT STATE ===');
    console.log('Player:', APP_STATE.playerName);
    console.log('Question:', APP_STATE.currentQuestionIndex + 1);
    console.log('Score:', APP_STATE.score);
    console.log('Answers:', APP_STATE.answers);
    console.log('Completed:', APP_STATE.isQuizCompleted);
    console.log('====================');
}