// js/mockFetch.js

/**
 * Mock fetch function untuk mensimulasikan pemanggilan API cuaca.
 * Data dummy sebisa mungkin mewakili kondisi hutan tropis.
 *
 * @param {string} url - alamat endpoint yang dipanggil
 * @returns {Promise} Promise yang menyelesaikan dengan objek data cuaca
 */
export function mockFetch(url) {
  return new Promise((resolve) => {
    // Contoh response data mock
    const mockData = {
      location: "Amazon Rainforest",
      temperature: 28, // derajat Celcius
      condition: "rainy",
      description: "heavy tropical rain",
      humidity: 87, // dalam persen
      windSpeed: 12, // km/h
      icon: "🐒" // Ikon hewan sebagai dummy cuaca
    };

    // Simulasi delay seperti fetch asli sekitar 300ms
    setTimeout(() => {
      resolve({
        json: () => Promise.resolve(mockData)
      });
    }, 300);
  });
}
