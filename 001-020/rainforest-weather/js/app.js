// js/app.js

// Import mockFetch dari file modular mockFetch.js
import { mockFetch } from './mockFetch.js';

/**
 * Fungsi untuk membuat HTML widget cuaca menggunakan template literal.
 * Semua data diinput dan HTML dibangun secara modular rapi.
 *
 * @param {Object} data - Objek data cuaca
 * @param {string} data.location - Nama lokasi/cuaca
 * @param {number} data.temperature - Suhu dalam derajat Celcius
 * @param {string} data.condition - Kondisi cuaca (misal: rainy)
 * @param {string} data.description - Deskripsi kondisi cuaca
 * @param {number} data.humidity - Kelembapan dalam persen
 * @param {number} data.windSpeed - Kecepatan angin dalam km/h
 * @param {string} data.icon - Ikon hewan untuk representasi cuaca
 * @returns {string} HTML string widget cuaca
 */
function createWeatherHTML(data) {
  return `
    <h2 class="widget-title">Rainforest Weather</h2>
    <div class="weather-main">
      <div class="weather-icon" aria-label="weather icon">${data.icon}</div>
      <div class="temperature">${data.temperature}&deg;C</div>
    </div>
    <div class="weather-description">${data.description}</div>
    <div class="weather-details">
      <div>
        <span>Humidity</span>
        <strong>${data.humidity}%</strong>
      </div>
      <div>
        <span>Wind</span>
        <strong>${data.windSpeed} km/h</strong>
      </div>
    </div>
    <div class="location">${data.location}</div>
  `;
}

/**
 * Fungsi utama init yang melakukan fetch data mock kemudian render di DOM.
 * Menggunakan async/await agar mudah dibaca dan modular.
 */
async function init() {
  try {
    // Panggil mockFetch yang mensimulasikan API fetch ubah menjadi objek JSON
    const response = await mockFetch('/weather');
    const weatherData = await response.json();

    // Cari elemen container widget
    const widgetContainer = document.getElementById('weather-widget');

    // Render HTML widget ke container
    widgetContainer.innerHTML = createWeatherHTML(weatherData);
  } catch (error) {
    console.error('Error loading weather data:', error);
  }
}

// Jalankan fungsi init saat modul di-load
init();
