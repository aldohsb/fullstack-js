/*
  FILE: app.js
  FUNGSI: Logic aplikasi Tip Barista
  TEKNIK UTAMA:
    1. Form Validation - memastikan input valid
    2. Number Formatting - format angka ke Rupiah
  STANDAR: ES2024+ (syntax terbaru 2025)
*/

/* ====== SECTION 1: SETUP & INITIALIZATION ====== */

/*
  Penjelasan: Menangkap semua element HTML yang dibutuhkan
  - document.getElementById(): cara mengambil element dari HTML
  - Nama variable harus deskriptif agar mudah dipahami
*/

// Input elements - tempat user memasukkan data
const billInput = document.getElementById('bill');
const tipPercentageInput = document.getElementById('tipPercentage');
const percentageDisplay = document.getElementById('percentageDisplay');
const peopleInput = document.getElementById('people');

// Result elements - tempat menampilkan hasil
const tipAmountDisplay = document.getElementById('tipAmount');
const totalAmountDisplay = document.getElementById('totalAmount');
const tipPerPersonDisplay = document.getElementById('tipPerPerson');

// Breakdown elements - detail perhitungan
const breakdownBill = document.getElementById('breakdownBill');
const breakdownPercentage = document.getElementById('breakdownPercentage');
const breakdownTip = document.getElementById('breakdownTip');
const breakdownTotal = document.getElementById('breakdownTotal');

// Error elements
const billError = document.getElementById('billError');

// Button
const resetBtn = document.getElementById('resetBtn');

/* ====== SECTION 2: FORMATTER - NUMBER FORMATTING ====== */

/*
  PENJELASAN INTL.NUMBERFORMAT (Modern Approach 2024+):
  
  Intl.NumberFormat adalah built-in JavaScript API untuk format angka
  dengan support internasional. Ini adalah cara MODERN yang recommended.
  
  Keuntungan:
  - Otomatis handle currency symbol
  - Support semua negara & currency
  - Automatic decimal places
  - Best practice 2025
  
  Sintaks:
  new Intl.NumberFormat(locale, options)
  - locale: 'id-ID' = Indonesia locale
  - options: pengaturan (style, currency, dll)
*/

// Buat formatter untuk Rupiah IDR
// 'id-ID' = menggunakan format Indonesia (Rp, desimal comma, dll)
const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',        // Format jenis currency
  currency: 'IDR',         // Mata uang: Indonesian Rupiah
  minimumFractionDigits: 0, // Minimal desimal = 0 (Rp 10.000, bukan Rp 10.000,00)
  maximumFractionDigits: 0  // Maksimal desimal = 0
});

/*
  Fungsi formatNumber: wrapper untuk format angka ke Rupiah
  Penjelasan:
  - Parameter: number = angka yang ingin diformat
  - Return: string dengan format Rupiah
  - Contoh: 50000 → "Rp 50.000"
  
  Arrow function: () => {} adalah syntax ES6+ terbaru
*/
const formatNumber = (number) => {
  // Pastikan input adalah angka, jika tidak return "Rp 0"
  if (isNaN(number) || number === null) {
    return rupiah.format(0);
  }
  // Format menggunakan rupiah formatter
  return rupiah.format(number);
};

/* ====== SECTION 3: VALIDATION - FORM VALIDATION ====== */

/*
  PENJELASAN FORM VALIDATION:
  
  Validation adalah proses memastikan data yang dimasukkan user valid.
  Ada 2 jenis:
  1. HTML Validation: type="number", min, max (browser handle)
  2. JavaScript Validation: custom logic di JS (kita kontrol)
  
  Di proyek ini kita gunakan KEDUANYA untuk best practice.
*/

/*
  Fungsi validateBill: validasi input bill
  Penjelasan:
  - Cek apakah bill kosong
  - Cek apakah bill valid angka
  - Cek apakah bill >= 0
  - Tampilkan error atau clear
  - Return: boolean (true = valid, false = invalid)
*/
const validateBill = () => {
  // Ambil nilai dari input
  const bill = billInput.value.trim();
  
  // Kondisi 1: Bill kosong
  if (bill === '') {
    billError.textContent = '⚠️ Masukkan jumlah bill terlebih dahulu';
    return false;
  }
  
  // Kondisi 2: Bill bukan angka atau NaN
  // isNaN() = "is Not a Number" - cek apakah bukan angka
  if (isNaN(bill)) {
    billError.textContent = '❌ Bill harus berupa angka';
    return false;
  }
  
  // Ubah ke number untuk pengecekan numerik
  const billNumber = parseFloat(bill);
  
  // Kondisi 3: Bill negatif atau 0
  if (billNumber < 0) {
    billError.textContent = '❌ Bill tidak boleh negatif';
    return false;
  }
  
  if (billNumber === 0) {
    billError.textContent = '⚠️ Bill tidak boleh 0';
    return false;
  }
  
  // Jika semua kondisi lolos, clear error message
  billError.textContent = '';
  
  // Return true = data valid
  return true;
};

/*
  Fungsi validateTipPercentage: validasi persentase tip
  Penjelasan:
  - Slider sudah validate HTML level (min/max)
  - Tapi kita tetap validasi di JS untuk extra safety
*/
const validateTipPercentage = () => {
  const percentage = parseInt(tipPercentageInput.value);
  
  // Cek range 0-100
  if (percentage < 0 || percentage > 100) {
    return false;
  }
  
  return true;
};

/*
  Fungsi validatePeople: validasi jumlah orang
  Penjelasan:
  - Minimal 1 orang
  - Harus angka positif
*/
const validatePeople = () => {
  const people = parseInt(peopleInput.value);
  
  // Cek minimal 1 orang
  if (people < 1) {
    return false;
  }
  
  return true;
};

/* ====== SECTION 4: CALCULATION - HITUNG TIP ====== */

/*
  Fungsi calculateTip: hitung jumlah tip berdasarkan bill & percentage
  Penjelasan:
  - Formula: (Bill × Persentase Tip) ÷ 100
  - Contoh: (100.000 × 15) ÷ 100 = 15.000
  
  Penjelasan Matematika:
  - 15% dari 100.000 = (100.000 × 15) ÷ 100
  - Atau: 100.000 × 0.15 = 15.000
  Kita pakai metode pertama untuk clarity.
*/
const calculateTip = (bill, percentage) => {
  // Validasi input
  if (!bill || !percentage) {
    return 0;
  }
  
  // Hitung: (Bill × Percentage) / 100
  // Contoh: (50000 × 20) / 100 = 10000
  const tip = (bill * percentage) / 100;
  
  // Return hasil (akan diformat di tempat lain)
  return tip;
};

/*
  Fungsi calculateTotal: hitung total pembayaran (bill + tip)
  Penjelasan:
  - Total = Bill + Tip
  - User bayar: tagihan + tip
*/
const calculateTotal = (bill, tip) => {
  // Validasi
  if (!bill || !tip) {
    return 0;
  }
  
  // Total = bill + tip
  const total = bill + tip;
  
  return total;
};

/*
  Fungsi calculateTipPerPerson: hitung tip per orang
  Penjelasan:
  - Tip dibagi rata ke jumlah orang
  - Formula: Total Tip ÷ Jumlah Orang
  - Contoh: 15.000 ÷ 3 orang = 5.000 per orang
*/
const calculateTipPerPerson = (tip, people) => {
  // Validasi
  if (!tip || !people || people < 1) {
    return 0;
  }
  
  // Bagi tip dengan jumlah orang
  const tipPerson = tip / people;
  
  return tipPerson;
};

/* ====== SECTION 5: UPDATE DISPLAY - TAMPILKAN HASIL ====== */

/*
  Fungsi updateDisplay: update semua display hasil
  Ini adalah "pusat kontrol" yang menampilkan semua hasil perhitungan
  
  Flow:
  1. Ambil nilai dari input
  2. Validasi
  3. Hitung
  4. Format
  5. Tampilkan
*/
const updateDisplay = () => {
  // STEP 1: Ambil nilai dari input
  const bill = parseFloat(billInput.value) || 0;
  const percentage = parseInt(tipPercentageInput.value) || 0;
  const people = parseInt(peopleInput.value) || 1;
  
  // STEP 2: Validasi (cek apakah bill valid dulu)
  if (!validateBill()) {
    // Jika bill tidak valid, reset display
    resetDisplay();
    return;
  }
  
  // STEP 3: Hitung
  const tip = calculateTip(bill, percentage);
  const total = calculateTotal(bill, tip);
  const tipPerson = calculateTipPerPerson(tip, people);
  
  // STEP 4: Format (ubah ke Rupiah)
  const formattedTip = formatNumber(tip);
  const formattedTotal = formatNumber(total);
  const formattedTipPerson = formatNumber(tipPerson);
  const formattedBill = formatNumber(bill);
  
  // STEP 5: Tampilkan di HTML
  
  // Update result cards
  tipAmountDisplay.textContent = formattedTip;
  tipAmountDisplay.dataset.value = tip;
  
  totalAmountDisplay.textContent = formattedTotal;
  totalAmountDisplay.dataset.value = total;
  
  tipPerPersonDisplay.textContent = formattedTipPerson;
  tipPerPersonDisplay.dataset.value = tipPerson;
  
  // Update breakdown table
  breakdownBill.textContent = formattedBill;
  breakdownPercentage.textContent = `${percentage}%`;
  breakdownTip.textContent = formattedTip;
  breakdownTotal.textContent = formattedTotal;
};

/*
  Fungsi resetDisplay: reset semua display ke nilai default
  Dipakai saat error atau saat reset button diklik
*/
const resetDisplay = () => {
  // Reset result cards
  tipAmountDisplay.textContent = 'Rp 0';
  tipAmountDisplay.dataset.value = 0;
  
  totalAmountDisplay.textContent = 'Rp 0';
  totalAmountDisplay.dataset.value = 0;
  
  tipPerPersonDisplay.textContent = 'Rp 0';
  tipPerPersonDisplay.dataset.value = 0;
  
  // Reset breakdown
  breakdownBill.textContent = 'Rp 0';
  breakdownPercentage.textContent = '0%';
  breakdownTip.textContent = 'Rp 0';
  breakdownTotal.textContent = 'Rp 0';
};

/* ====== SECTION 6: EVENT LISTENERS - LISTEN USER INPUT ====== */

/*
  Event Listener: "dengarkan" aksi user
  Ketika user melakukan aksi (input, change, click), jalankan function
  
  Event yang kita pakai:
  - 'blur': saat user selesai ketik & keluar dari input (good UX)
  - 'input': saat user sedang ketik (real-time)
  - 'change': saat slider value berubah
  - 'click': saat button diklik
*/

// Listener untuk bill input - validasi saat blur
// Penjelasan: addEventListener('event', callback_function)
billInput.addEventListener('blur', () => {
  // Validasi bill
  validateBill();
  // Update display
  updateDisplay();
});

// Listener untuk bill input - update display real-time saat ketik
billInput.addEventListener('input', () => {
  updateDisplay();
});

// Listener untuk tip percentage slider - update real-time
// 'input' event trigger saat slider drag
tipPercentageInput.addEventListener('input', (event) => {
  // Update display persentase di label
  // event.target.value = nilai slider yang baru
  percentageDisplay.textContent = event.target.value;
  // Update display hasil
  updateDisplay();
});

// Listener untuk people input - update real-time
peopleInput.addEventListener('input', () => {
  updateDisplay();
});

// Listener untuk reset button
resetBtn.addEventListener('click', () => {
  // Clear semua input value
  billInput.value = '';
  tipPercentageInput.value = '15';
  percentageDisplay.textContent = '15';
  peopleInput.value = '1';
  
  // Clear error message
  billError.textContent = '';
  
  // Reset display
  resetDisplay();
  
  // Focus ke bill input untuk UX yang baik
  billInput.focus();
});

/* ====== SECTION 7: ACCESSIBILITY ENHANCEMENT ====== */

/*
  Accessibility: membuat aplikasi mudah digunakan semua orang
  termasuk pengguna dengan disabilities
*/

// Keyboard navigation: Enter key di input = hitung
billInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    updateDisplay();
  }
});

/*
  PENJELASAN TEKNIK YANG DIPELAJARI:
  
  1. FORM VALIDATION:
     ✓ Pengecekan input kosong
     ✓ Pengecekan tipe data (isNaN)
     ✓ Pengecekan range (min/max)
     ✓ Error message user-friendly
     ✓ Early return untuk clarity
  
  2. NUMBER FORMATTING:
     ✓ Intl.NumberFormat API (modern 2024+)
     ✓ Locale-specific formatting (id-ID)
     ✓ Currency formatting (IDR)
     ✓ Consistent formatting di semua display
  
  3. EVENT HANDLING:
     ✓ addEventListener dengan event types
     ✓ Event bubbling dan delegation
     ✓ Real-time update (input event)
     ✓ Deferred update (blur event)
  
  4. DOM MANIPULATION:
     ✓ getElementById untuk select element
     ✓ textContent untuk set text
     ✓ dataset untuk store data
     ✓ classList untuk conditional styling
  
  5. MODULAR PROGRAMMING:
     ✓ Fungsi-fungsi kecil dengan single responsibility
     ✓ Reusable functions
     ✓ Clear naming convention
     ✓ Comments untuk dokumentasi
*/