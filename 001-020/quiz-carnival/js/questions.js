/* ====================================
   QUIZ CARNIVAL - QUESTIONS DATA
   Data bank soal quiz
   ==================================== */

/**
 * QUESTIONS_DATA
 * Array berisi semua pertanyaan quiz
 * 
 * Struktur setiap pertanyaan:
 * - id: identifier unik untuk pertanyaan
 * - question: teks pertanyaan
 * - options: array berisi 4 pilihan jawaban
 * - correctAnswer: index jawaban yang benar (0-3)
 * - explanation: penjelasan jawaban (opsional)
 */

const QUESTIONS_DATA = [
    {
        id: 1,
        question: "Apa ibukota negara Indonesia?",
        options: [
            "Bandung",
            "Jakarta",
            "Surabaya",
            "Medan"
        ],
        correctAnswer: 1, // Index 1 = Jakarta
        explanation: "Jakarta adalah ibukota Indonesia sejak kemerdekaan."
    },
    {
        id: 2,
        question: "Berapa hasil dari 15 + 27?",
        options: [
            "40",
            "42",
            "43",
            "45"
        ],
        correctAnswer: 1, // 42
        explanation: "15 + 27 = 42"
    },
    {
        id: 3,
        question: "Planet terbesar dalam tata surya kita adalah?",
        options: [
            "Mars",
            "Saturnus",
            "Jupiter",
            "Uranus"
        ],
        correctAnswer: 2, // Jupiter
        explanation: "Jupiter adalah planet terbesar dengan diameter 142,984 km."
    },
    {
        id: 4,
        question: "Siapa penemu lampu pijar?",
        options: [
            "Thomas Edison",
            "Nikola Tesla",
            "Albert Einstein",
            "Alexander Graham Bell"
        ],
        correctAnswer: 0, // Thomas Edison
        explanation: "Thomas Edison menemukan lampu pijar praktis pada tahun 1879."
    },
    {
        id: 5,
        question: "Berapa jumlah pemain dalam satu tim sepak bola?",
        options: [
            "9 pemain",
            "10 pemain",
            "11 pemain",
            "12 pemain"
        ],
        correctAnswer: 2, // 11 pemain
        explanation: "Setiap tim sepak bola terdiri dari 11 pemain termasuk kiper."
    },
    {
        id: 6,
        question: "Apa lambang kimia untuk air?",
        options: [
            "H2O",
            "CO2",
            "O2",
            "NaCl"
        ],
        correctAnswer: 0, // H2O
        explanation: "Air memiliki rumus kimia H2O (2 atom Hidrogen + 1 atom Oksigen)."
    },
    {
        id: 7,
        question: "Berapa lama bumi mengelilingi matahari?",
        options: [
            "30 hari",
            "90 hari",
            "180 hari",
            "365 hari"
        ],
        correctAnswer: 3, // 365 hari
        explanation: "Bumi membutuhkan sekitar 365 hari untuk mengelilingi matahari."
    },
    {
        id: 8,
        question: "Apa nama mata uang Jepang?",
        options: [
            "Won",
            "Yuan",
            "Yen",
            "Rupiah"
        ],
        correctAnswer: 2, // Yen
        explanation: "Mata uang Jepang adalah Yen (¥)."
    },
    {
        id: 9,
        question: "Siapa pelukis terkenal yang melukis Mona Lisa?",
        options: [
            "Vincent van Gogh",
            "Pablo Picasso",
            "Leonardo da Vinci",
            "Michelangelo"
        ],
        correctAnswer: 2, // Leonardo da Vinci
        explanation: "Leonardo da Vinci melukis Mona Lisa sekitar tahun 1503-1519."
    },
    {
        id: 10,
        question: "Apa benua terbesar di dunia?",
        options: [
            "Afrika",
            "Amerika",
            "Asia",
            "Eropa"
        ],
        correctAnswer: 2, // Asia
        explanation: "Asia adalah benua terbesar dengan luas sekitar 44,58 juta km²."
    }
];

/**
 * Fungsi untuk mendapatkan semua pertanyaan
 * @returns {Array} Array berisi semua pertanyaan
 */
function getAllQuestions() {
    // Return copy dari array agar data asli tidak dimodifikasi
    return [...QUESTIONS_DATA];
}

/**
 * Fungsi untuk mendapatkan pertanyaan berdasarkan ID
 * @param {number} id - ID pertanyaan yang dicari
 * @returns {Object|null} Object pertanyaan atau null jika tidak ditemukan
 */
function getQuestionById(id) {
    return QUESTIONS_DATA.find(q => q.id === id) || null;
}

/**
 * Fungsi untuk mendapatkan total jumlah pertanyaan
 * @returns {number} Jumlah total pertanyaan
 */
function getTotalQuestions() {
    return QUESTIONS_DATA.length;
}