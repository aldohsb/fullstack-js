/* ===== WEATHER DATA SYSTEM - RAINFOREST WEATHER WIDGET ===== */

/**
 * WeatherData namespace - handles all weather-related data and mock API calls
 * Menggunakan module pattern untuk encapsulation dan clean API
 */
const WeatherData = (() => {
    'use strict';

    // ===== MOCK DATABASE - RAINFOREST WEATHER CONDITIONS =====
    
    /**
     * Weather conditions dengan icon dan animal companions
     * Setiap condition memiliki probability untuk realistic random generation
     */
    const WEATHER_CONDITIONS = {
        'heavy_rain': {
            condition: 'Heavy Rain',
            detail: 'Typical rainforest shower',
            icon: '🌧️',
            animals: ['🐸', '🦜', '🐒', '🦎'],
            probability: 0.35, // 35% chance - most common in rainforest
            tempRange: [24, 28],
            humidityRange: [85, 95],
            windRange: [8, 15]
        },
        'light_rain': {
            condition: 'Light Rain',
            detail: 'Gentle forest drizzle',
            icon: '🌦️',
            animals: ['🦋', '🐸', '🦜', '🐒'],
            probability: 0.25, // 25% chance
            tempRange: [26, 30],
            humidityRange: [75, 85],
            windRange: [5, 12]
        },
        'thunderstorm': {
            condition: 'Thunderstorm',
            detail: 'Intense jungle storm',
            icon: '⛈️',
            animals: ['🐒', '🦎', '🕷️', '🐍'],
            probability: 0.15, // 15% chance
            tempRange: [22, 26],
            humidityRange: [90, 98],
            windRange: [15, 25]
        },
        'partly_cloudy': {
            condition: 'Partly Cloudy',
            detail: 'Filtered sunlight through canopy',
            icon: '⛅',
            animals: ['🦋', '🐦', '🦜', '🐨'],
            probability: 0.15, // 15% chance
            tempRange: [28, 32],
            humidityRange: [70, 80],
            windRange: [3, 10]
        },
        'foggy': {
            condition: 'Foggy',
            detail: 'Misty morning canopy',
            icon: '🌫️',
            animals: ['🦋', '🐸', '🕷️', '🐒'],
            probability: 0.08, // 8% chance
            tempRange: [25, 29],
            humidityRange: [88, 95],
            windRange: [2, 8]
        },
        'sunny': {
            condition: 'Sunny',
            detail: 'Rare clear jungle day',
            icon: '☀️',
            animals: ['🦋', '🐦', '🦜', '🐨'],
            probability: 0.02, // 2% chance - very rare in rainforest
            tempRange: [30, 35],
            humidityRange: [60, 75],
            windRange: [5, 12]
        }
    };

    /**
     * Rainforest locations dengan karakteristik unik masing-masing
     */
    const RAINFOREST_LOCATIONS = [
        {
            name: 'Amazon Rainforest',
            subtitle: 'Heart of the Jungle',
            country: 'Brazil',
            timezone: 'America/Manaus',
            coordinates: [-3.4653, -62.2159]
        },
        {
            name: 'Congo Basin',
            subtitle: 'African Green Heart',
            country: 'Democratic Republic of Congo',
            timezone: 'Africa/Kinshasa',
            coordinates: [-0.7893, 18.1472]
        },
        {
            name: 'Borneo Rainforest',
            subtitle: 'Ancient Tropical Paradise',
            country: 'Malaysia',
            timezone: 'Asia/Kuching',
            coordinates: [0.9619, 114.5548]
        },
        {
            name: 'Costa Rica Cloud Forest',
            subtitle: 'Misty Mountain Jungle',
            country: 'Costa Rica',
            timezone: 'America/Costa_Rica',
            coordinates: [10.2581, -84.1623]
        },
        {
            name: 'Madagascar Rainforest',
            subtitle: 'Island of Unique Species',
            country: 'Madagascar',
            timezone: 'Indian/Antananarivo',
            coordinates: [-18.7669, 46.8691]
        }
    ];

    /**
     * Rainforest facts untuk educational content
     */
    const RAINFOREST_FACTS = [
        "🌱 Did you know? Rainforests produce 20% of the world's oxygen!",
        "🦋 Over 50% of all plant and animal species live in rainforests!",
        "🌿 A single rainforest tree can be home to thousands of species!",
        "💧 Rainforests help regulate the global water cycle!",
        "🐒 One hectare of rainforest contains more tree species than all of North America!",
        "🌧️ Rainforests create their own weather patterns through evapotranspiration!",
        "🦜 The Amazon alone is home to over 1,300 bird species!",
        "🌳 Some rainforest trees are over 1,000 years old!",
        "🐸 New species are still being discovered in rainforests every year!",
        "🦎 Rainforest soil is surprisingly nutrient-poor - all nutrients are in the vegetation!",
        "🕷️ A single rainforest tree can host over 400 insect species!",
        "🌿 Many common medicines originated from rainforest plants!"
    ];

    // ===== PRIVATE VARIABLES =====
    let currentLocation = RAINFOREST_LOCATIONS[0]; // Default to Amazon
    let currentWeatherData = null;
    let lastUpdateTime = null;

    // ===== PRIVATE HELPER FUNCTIONS =====

    /**
     * Generate random weather condition berdasarkan probability
     * @returns {Object} - Weather condition object
     */
    const generateRandomWeatherCondition = () => {
        const random = Math.random();
        let cumulativeProbability = 0;
        
        for (const [key, condition] of Object.entries(WEATHER_CONDITIONS)) {
            cumulativeProbability += condition.probability;
            if (random <= cumulativeProbability) {
                return { key, ...condition };
            }
        }
        
        // Fallback to heavy_rain jika tidak ada yang terpilih
        return { key: 'heavy_rain', ...WEATHER_CONDITIONS.heavy_rain };
    };

    /**
     * Generate random animal companion dari weather condition
     * @param {Array} animals - Array of available animals for the condition
     * @returns {string} - Random animal emoji
     */
    const getRandomAnimal = (animals) => {
        return animals[WeatherUtils.randomBetween(0, animals.length - 1, true)];
    };

    /**
     * Generate realistic temperature dengan variasi berdasarkan time of day
     * @param {Array} tempRange - [min, max] temperature range
     * @param {number} hour - Current hour (0-23)
     * @returns {number} - Temperature in Celsius
     */
    const generateTemperature = (tempRange, hour) => {
        const [minTemp, maxTemp] = tempRange;
        let baseTemp = WeatherUtils.randomBetween(minTemp, maxTemp);
        
        // Temperature variation berdasarkan waktu
        // Paling dingin jam 6 pagi, paling panas jam 2 siang
        const timeVariation = Math.sin((hour - 6) * Math.PI / 12) * 3;
        
        return Math.round((baseTemp + timeVariation) * 10) / 10;
    };

    /**
     * Generate feels like temperature
     * @param {number} actualTemp - Actual temperature
     * @param {number} humidity - Humidity percentage
     * @param {number} windSpeed - Wind speed in km/h
     * @returns {number} - Feels like temperature
     */
    const calculateFeelsLike = (actualTemp, humidity, windSpeed) => {
        // Simplified heat index calculation untuk tropical climate
        const humidityFactor = (humidity - 40) / 60; // Normalize humidity effect
        const windFactor = Math.max(0, (10 - windSpeed) / 10); // Wind cooling effect
        
        const feelsLike = actualTemp + (humidityFactor * 4) + (windFactor * 2);
        return Math.round(feelsLike * 10) / 10;
    };

    /**
     * Generate atmospheric pressure (realistic untuk tropical regions)
     * @returns {number} - Pressure in hPa
     */
    const generatePressure = () => {
        // Tropical regions biasanya 1008-1018 hPa
        return WeatherUtils.randomBetween(1008, 1018, true);
    };

    /**
     * Generate UV Index berdasarkan weather condition dan time
     * @param {string} conditionKey - Weather condition key
     * @param {number} hour - Current hour
     * @returns {number} - UV Index (0-11+)
     */
    const generateUVIndex = (conditionKey, hour) => {
        // UV index variation berdasarkan waktu (peak jam 12)
        let timeMultiplier = 0;
        if (hour >= 8 && hour <= 16) {
            timeMultiplier = Math.sin((hour - 8) * Math.PI / 8);
        }
        
        // UV reduction berdasarkan weather condition
        const uvReduction = {
            'heavy_rain': 0.2,
            'thunderstorm': 0.1,
            'light_rain': 0.4,
            'foggy': 0.3,
            'partly_cloudy': 0.7,
            'sunny': 1.0
        };
        
        const maxUV = 8; // Tropical maximum
        const uvIndex = maxUV * timeMultiplier * (uvReduction[conditionKey] || 0.5);
        
        return Math.max(0, Math.round(uvIndex));
    };

    /**
     * Generate hourly forecast data
     * @param {number} baseHour - Starting hour
     * @returns {Array} - Array of hourly forecast objects
     */
    const generateHourlyForecast = (baseHour) => {
        const forecast = [];
        const currentCondition = generateRandomWeatherCondition();
        
        for (let i = 1; i <= 12; i++) { // Next 12 hours
            const hour = (baseHour + i) % 24;
            const time = `${hour.toString().padStart(2, '0')}:00`;
            
            // Slight variations dari current condition untuk realism
            const tempVariation = WeatherUtils.randomBetween(-3, 3);
            const temp = generateTemperature(currentCondition.tempRange, hour) + tempVariation;
            
            // Rain probability berdasarkan condition
            const rainProb = currentCondition.key.includes('rain') ? 
                WeatherUtils.randomBetween(60, 90, true) : 
                WeatherUtils.randomBetween(10, 40, true);
            
            // Kondisi cuaca bisa berubah sedikit setiap jam
            let hourlyCondition = currentCondition;
            if (Math.random() < 0.2) { // 20% chance kondisi berubah
                hourlyCondition = generateRandomWeatherCondition();
            }
            
            forecast.push({
                time: time,
                hour: hour,
                temperature: Math.round(temp),
                condition: hourlyCondition.key,
                icon: hourlyCondition.icon,
                rainProbability: rainProb
            });
        }
        
        return forecast;
    };

    // ===== PUBLIC METHODS =====

    /**
     * Fetch current weather data (mock API call)
     * @returns {Promise<Object>} - Promise yang resolve dengan weather data
     */
    const fetchCurrentWeather = async () => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, WeatherUtils.randomBetween(800, 1500, true)));
        
        try {
            const now = new Date();
            const currentHour = now.getHours();
            const condition = generateRandomWeatherCondition();
            
            // Generate semua data weather
            const temperature = generateTemperature(condition.tempRange, currentHour);
            const humidity = WeatherUtils.randomBetween(condition.humidityRange[0], condition.humidityRange[1], true);
            const windSpeed = WeatherUtils.randomBetween(condition.windRange[0], condition.windRange[1]);
            const pressure = generatePressure();
            const uvIndex = generateUVIndex(condition.key, currentHour);
            const feelsLike = calculateFeelsLike(temperature, humidity, windSpeed);
            const animalCompanion = getRandomAnimal(condition.animals);
            const hourlyForecast = generateHourlyForecast(currentHour);
            const rainforestFact = RAINFOREST_FACTS[WeatherUtils.randomBetween(0, RAINFOREST_FACTS.length - 1, true)];
            
            // Create weather data object
            currentWeatherData = {
                location: {
                    name: currentLocation.name,
                    subtitle: currentLocation.subtitle,
                    country: currentLocation.country,
                    coordinates: currentLocation.coordinates
                },
                current: {
                    temperature: temperature,
                    feelsLike: feelsLike,
                    condition: condition.condition,
                    conditionDetail: condition.detail,
                    conditionKey: condition.key,
                    icon: condition.icon,
                    animalCompanion: animalCompanion,
                    humidity: humidity,
                    windSpeed: windSpeed,
                    windDirection: WeatherUtils.getWindDirection(WeatherUtils.randomBetween(0, 359, true)),
                    pressure: pressure,
                    uvIndex: uvIndex
                },
                forecast: {
                    hourly: hourlyForecast
                },
                metadata: {
                    lastUpdated: now.toISOString(),
                    timezone: currentLocation.timezone,
                    rainforestFact: rainforestFact
                }
            };
            
            lastUpdateTime = now;
            return currentWeatherData;
            
        } catch (error) {
            console.error('Error fetching weather data:', error);
            throw new Error('Failed to fetch weather data');
        }
    };

    /**
     * Get cached weather data jika masih fresh (< 10 minutes)
     * @returns {Object|null} - Cached weather data atau null
     */
    const getCachedWeather = () => {
        if (!currentWeatherData || !lastUpdateTime) {
            return null;
        }
        
        const now = new Date();
        const timeDiff = now - lastUpdateTime;
        const maxCacheTime = 10 * 60 * 1000; // 10 minutes
        
        if (timeDiff < maxCacheTime) {
            return currentWeatherData;
        }
        
        return null;
    };

    /**
     * Change location dan fetch new weather data
     * @param {number} locationIndex - Index dari RAINFOREST_LOCATIONS
     * @returns {Promise<Object>} - Promise dengan weather data untuk lokasi baru
     */
    const changeLocation = async (locationIndex) => {
        if (locationIndex >= 0 && locationIndex < RAINFOREST_LOCATIONS.length) {
            currentLocation = RAINFOREST_LOCATIONS[locationIndex];
            return await fetchCurrentWeather();
        } else {
            throw new Error('Invalid location index');
        }
    };

    /**
     * Get random location untuk variation
     * @returns {Promise<Object>} - Promise dengan weather data untuk random location
     */
    const getRandomLocation = async () => {
        const randomIndex = WeatherUtils.randomBetween(0, RAINFOREST_LOCATIONS.length - 1, true);
        return await changeLocation(randomIndex);
    };

    /**
     * Get all available locations
     * @returns {Array} - Array of location objects
     */
    const getAvailableLocations = () => {
        return [...RAINFOREST_LOCATIONS]; // Return copy to prevent mutation
    };

    /**
     * Get current location info
     * @returns {Object} - Current location object
     */
    const getCurrentLocation = () => {
        return { ...currentLocation }; // Return copy
    };

    /**
     * Simulate weather condition change (untuk demonstrasi)
     * @param {string} conditionKey - Key dari WEATHER_CONDITIONS
     * @returns {Promise<Object>} - Promise dengan updated weather data
     */
    const simulateWeatherChange = async (conditionKey) => {
        if (!WEATHER_CONDITIONS[conditionKey]) {
            throw new Error('Invalid weather condition key');
        }
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const now = new Date();
        const currentHour = now.getHours();
        const condition = { key: conditionKey, ...WEATHER_CONDITIONS[conditionKey] };
        
        // Update current weather dengan condition yang dipilih
        if (currentWeatherData) {
            const temperature = generateTemperature(condition.tempRange, currentHour);
            const humidity = WeatherUtils.randomBetween(condition.humidityRange[0], condition.humidityRange[1], true);
            const windSpeed = WeatherUtils.randomBetween(condition.windRange[0], condition.windRange[1]);
            const feelsLike = calculateFeelsLike(temperature, humidity, windSpeed);
            const animalCompanion = getRandomAnimal(condition.animals);
            
            currentWeatherData.current = {
                ...currentWeatherData.current,
                temperature: temperature,
                feelsLike: feelsLike,
                condition: condition.condition,
                conditionDetail: condition.detail,
                conditionKey: condition.key,
                icon: condition.icon,
                animalCompanion: animalCompanion,
                humidity: humidity,
                windSpeed: windSpeed,
                uvIndex: generateUVIndex(conditionKey, currentHour)
            };
            
            currentWeatherData.metadata.lastUpdated = now.toISOString();
            lastUpdateTime = now;
            
            return currentWeatherData;
        } else {
            return await fetchCurrentWeather();
        }
    };

    /**
     * Get weather condition info berdasarkan key
     * @param {string} conditionKey - Weather condition key
     * @returns {Object|null} - Weather condition info atau null
     */
    const getWeatherConditionInfo = (conditionKey) => {
        return WEATHER_CONDITIONS[conditionKey] || null;
    };

    /**
     * Get all available weather conditions
     * @returns {Object} - All weather conditions
     */
    const getAllWeatherConditions = () => {
        return { ...WEATHER_CONDITIONS }; // Return copy
    };

    /**
     * Get random rainforest fact
     * @returns {string} - Random educational fact
     */
    const getRandomRainforestFact = () => {
        return RAINFOREST_FACTS[WeatherUtils.randomBetween(0, RAINFOREST_FACTS.length - 1, true)];
    };

    /**
     * Validate weather data structure
     * @param {Object} weatherData - Weather data object to validate
     * @returns {boolean} - True jika valid
     */
    const validateWeatherData = (weatherData) => {
        try {
            const requiredFields = [
                'location.name',
                'current.temperature',
                'current.condition',
                'current.icon',
                'current.humidity',
                'current.windSpeed',
                'forecast.hourly',
                'metadata.lastUpdated'
            ];
            
            return requiredFields.every(field => {
                const keys = field.split('.');
                let obj = weatherData;
                
                for (const key of keys) {
                    if (!obj || !obj.hasOwnProperty(key)) {
                        return false;
                    }
                    obj = obj[key];
                }
                
                return obj !== undefined && obj !== null;
            });
        } catch (error) {
            return false;
        }
    };

    /**
     * Format weather data untuk display
     * @param {Object} weatherData - Raw weather data
     * @returns {Object} - Formatted weather data
     */
    const formatWeatherForDisplay = (weatherData) => {
        if (!validateWeatherData(weatherData)) {
            throw new Error('Invalid weather data structure');
        }
        
        return {
            location: {
                name: weatherData.location.name,
                subtitle: weatherData.location.subtitle,
                country: weatherData.location.country
            },
            temperature: {
                current: Math.round(weatherData.current.temperature),
                feelsLike: Math.round(weatherData.current.feelsLike),
                unit: '°C'
            },
            condition: {
                main: weatherData.current.condition,
                detail: weatherData.current.conditionDetail,
                icon: weatherData.current.icon,
                animal: weatherData.current.animalCompanion
            },
            stats: {
                humidity: `${weatherData.current.humidity}%`,
                wind: `${Math.round(weatherData.current.windSpeed)} km/h`,
                windDirection: weatherData.current.windDirection,
                pressure: `${weatherData.current.pressure} hPa`,
                uvIndex: weatherData.current.uvIndex
            },
            forecast: weatherData.forecast.hourly.map(hour => ({
                time: hour.time,
                temperature: `${hour.temperature}°`,
                icon: hour.icon,
                rain: `${hour.rainProbability}%`
            })),
            metadata: {
                lastUpdated: WeatherUtils.formatTime(new Date(weatherData.metadata.lastUpdated), true),
                fact: weatherData.metadata.rainforestFact
            }
        };
    };

    // ===== PUBLIC API =====
    // Export methods yang akan digunakan oleh komponen lain
    return {
        // Core data methods
        fetchCurrentWeather,
        getCachedWeather,
        
        // Location methods
        changeLocation,
        getRandomLocation,
        getAvailableLocations,
        getCurrentLocation,
        
        // Weather simulation methods
        simulateWeatherChange,
        getWeatherConditionInfo,
        getAllWeatherConditions,
        
        // Utility methods
        getRandomRainforestFact,
        validateWeatherData,
        formatWeatherForDisplay,
        
        // Constants for external use
        WEATHER_CONDITIONS: { ...WEATHER_CONDITIONS },
        RAINFOREST_LOCATIONS: [...RAINFOREST_LOCATIONS],
        RAINFOREST_FACTS: [...RAINFOREST_FACTS]
    };
})();