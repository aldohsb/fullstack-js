/* ========================================
   CALCULATOR.JS - Logika Kalkulator
   Module untuk menangani semua operasi matematika
   Menggunakan MODULAR PROGRAMMING pattern
   ======================================== */

/**
 * CALCULATOR MODULE
 * Menggunakan Revealing Module Pattern untuk encapsulation
 * Semua state dan fungsi private dibungkus dalam IIFE (Immediately Invoked Function Expression)
 * Hanya expose fungsi public yang diperlukan
 */
const Calculator = (function() {
    
    /* === PRIVATE STATE === */
    /* Variabel ini tidak bisa diakses dari luar module */
    
    let currentValue = '0';        // Nilai yang sedang ditampilkan
    let previousValue = '';        // Nilai sebelumnya untuk operasi
    let operator = null;           // Operator yang dipilih (+, -, ×, ÷, %)
    let waitingForOperand = false; // Flag apakah menunggu input angka baru
    
    /* === PRIVATE HELPER FUNCTIONS === */
    
    /**
     * Format angka dengan pemisah ribuan dan desimal
     * @param {string|number} num - Angka yang akan diformat
     * @returns {string} - Angka yang sudah diformat
     */
    function formatNumber(num) {
        // Convert ke string terlebih dahulu
        const numStr = String(num);
        
        // Cek apakah ada desimal
        if (numStr.includes('.')) {
            const [integer, decimal] = numStr.split('.');
            // Format bagian integer dengan pemisah ribuan
            // Tambahkan kembali desimal
            return integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + decimal;
        }
        
        // Jika tidak ada desimal, format saja dengan pemisah ribuan
        return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    /**
     * Eksekusi operasi matematika
     * @param {number} a - Operand pertama
     * @param {number} b - Operand kedua
     * @param {string} op - Operator (+, -, ×, ÷, %)
     * @returns {number} - Hasil operasi
     */
    function executeOperation(a, b, op) {
        // Switch untuk memilih operasi berdasarkan operator
        switch(op) {
            case '+':
                return a + b;
            case '-':
                return a - b;
            case '×':
                return a * b;
            case '÷':
                // Cegah pembagian dengan nol
                if (b === 0) {
                    return 'Error';
                }
                return a / b;
            case '%':
                // Persen: a % dari 100
                return (a / 100) * b;
            default:
                return b;
        }
    }
    
    /**
     * Bersihkan nilai yang memiliki koma sebagai pemisah ribuan
     * @param {string} value - Nilai dengan format display
     * @returns {string} - Nilai bersih tanpa koma
     */
    function cleanValue(value) {
        // Hapus semua koma dari string
        return value.replace(/,/g, '');
    }
    
    /* === PUBLIC FUNCTIONS === */
    /* Fungsi-fungsi ini akan di-expose keluar module */
    
    /**
     * Input angka atau desimal
     * @param {string} digit - Digit yang diinput (0-9 atau '.')
     */
    function inputDigit(digit) {
        // Jika sedang menunggu operand baru, reset current value
        if (waitingForOperand) {
            currentValue = digit;
            waitingForOperand = false;
        } else {
            // Jika current value adalah '0', replace dengan digit baru
            // Kecuali jika digit adalah '.' (untuk input 0.5 dsb)
            if (currentValue === '0' && digit !== '.') {
                currentValue = digit;
            } else {
                // Cegah input desimal ganda
                if (digit === '.' && currentValue.includes('.')) {
                    return; // Tidak lakukan apa-apa
                }
                // Append digit ke current value
                currentValue = currentValue + digit;
            }
        }
    }
    
    /**
     * Input operator matematika
     * @param {string} nextOperator - Operator yang dipilih
     */
    function inputOperator(nextOperator) {
        // Parse current value (hapus koma terlebih dahulu)
        const inputValue = parseFloat(cleanValue(currentValue));
        
        // Jika ada previous value dan operator
        if (previousValue === '' || previousValue === null) {
            // Ini operasi pertama, simpan current value sebagai previous
            previousValue = inputValue;
        } else if (operator) {
            // Ada operasi sebelumnya yang belum dihitung
            // Parse previous value
            const prevValue = parseFloat(cleanValue(String(previousValue)));
            
            // Eksekusi operasi sebelumnya
            const result = executeOperation(prevValue, inputValue, operator);
            
            // Cek jika error (misal pembagian nol)
            if (result === 'Error') {
                currentValue = 'Error';
                previousValue = '';
                operator = null;
                waitingForOperand = true;
                return;
            }
            
            // Round hasil ke 10 desimal untuk menghindari floating point error
            // Contoh: 0.1 + 0.2 = 0.30000000000000004
            const roundedResult = Math.round(result * 10000000000) / 10000000000;
            
            // Simpan hasil
            currentValue = String(roundedResult);
            previousValue = roundedResult;
        }
        
        // Tunggu operand berikutnya
        waitingForOperand = true;
        // Simpan operator untuk operasi berikutnya
        operator = nextOperator;
    }
    
    /**
     * Hitung hasil akhir (tombol =)
     */
    function calculate() {
        // Parse current value
        const inputValue = parseFloat(cleanValue(currentValue));
        
        // Jika ada previous value dan operator
        if (previousValue !== '' && operator) {
            const prevValue = parseFloat(cleanValue(String(previousValue)));
            
            // Eksekusi operasi
            const result = executeOperation(prevValue, inputValue, operator);
            
            // Cek error
            if (result === 'Error') {
                currentValue = 'Error';
                previousValue = '';
                operator = null;
                waitingForOperand = true;
                return;
            }
            
            // Round hasil
            const roundedResult = Math.round(result * 10000000000) / 10000000000;
            
            // Update display
            currentValue = String(roundedResult);
            previousValue = ''; // Reset previous
            operator = null;    // Reset operator
            waitingForOperand = true; // Tunggu input baru
        }
    }
    
    /**
     * Hapus satu digit dari belakang (backspace)
     */
    function deleteDigit() {
        // Jika current value hanya 1 digit atau '0', set ke '0'
        if (currentValue.length <= 1 || currentValue === '0') {
            currentValue = '0';
        } else {
            // Hapus karakter terakhir
            currentValue = currentValue.slice(0, -1);
        }
    }
    
    /**
     * Reset semua nilai (Clear All)
     */
    function clear() {
        currentValue = '0';
        previousValue = '';
        operator = null;
        waitingForOperand = false;
    }
    
    /**
     * Get nilai current untuk ditampilkan
     * @returns {string} - Nilai current yang sudah diformat
     */
    function getCurrentValue() {
        // Jika error, return as-is
        if (currentValue === 'Error') {
            return currentValue;
        }
        // Format dengan pemisah ribuan
        return formatNumber(currentValue);
    }
    
    /**
     * Get nilai previous untuk ditampilkan
     * @returns {string} - String yang menampilkan previous value + operator
     */
    function getPreviousValue() {
        // Jika tidak ada previous value, return empty
        if (previousValue === '' || previousValue === null) {
            return '';
        }
        
        // Format: "123 +"
        const formattedPrev = formatNumber(previousValue);
        return operator ? `${formattedPrev} ${operator}` : formattedPrev;
    }
    
    /**
     * Get state lengkap kalkulator (untuk debugging)
     * @returns {object} - Object berisi semua state
     */
    function getState() {
        return {
            currentValue,
            previousValue,
            operator,
            waitingForOperand
        };
    }
    
    /* === REVEALING MODULE PATTERN === */
    /* Return object dengan fungsi public yang bisa diakses dari luar */
    return {
        inputDigit,      // Untuk input angka
        inputOperator,   // Untuk input operator
        calculate,       // Untuk menghitung hasil
        deleteDigit,     // Untuk delete
        clear,           // Untuk clear all
        getCurrentValue, // Get nilai display current
        getPreviousValue,// Get nilai display previous
        getState         // Get state (untuk debugging)
    };
    
})(); // IIFE - langsung dieksekusi

/* 
 * MODULE SEKARANG SIAP DIGUNAKAN
 * Contoh penggunaan:
 * Calculator.inputDigit('5');
 * Calculator.inputOperator('+');
 * Calculator.inputDigit('3');
 * Calculator.calculate();
 * console.log(Calculator.getCurrentValue()); // Output: "8"
 */