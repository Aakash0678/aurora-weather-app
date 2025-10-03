// --- Constants ---
const weatherInfoDiv = document.getElementById('weatherInfo');
const cityInput = document.getElementById('city');
const loader = document.getElementById('loader');
const weatherFxDiv = document.getElementById('weather-fx');



const PEXELS_API_KEY = null; // Set to null for secure push to GitHub

const PEXELS_BASE_URL = 'https://api.pexels.com/v1/search';

// API Endpoints
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

// Fallback Image API (Using Unsplash Source)
const UNSPLASH_BASE_URL = 'https://source.unsplash.com/random/1600x900';


// --- WMO Weather Code Mapping (unchanged) ---
function getWeatherDescription(code) {
    const descriptions = {
        0: { text: "Clear Sky", icon: "fas fa-sun", type: "clear" },
        1: { text: "Mainly Clear", icon: "fas fa-cloud-sun", type: "clear" },
        2: { text: "Partly Cloudy", icon: "fas fa-cloud-sun", type: "clear" },
        3: { text: "Overcast", icon: "fas fa-cloud", type: "cloudy" },
        45: { text: "Fog", icon: "fas fa-smog", type: "cloudy" },
        48: { text: "Rime Fog", icon: "fas fa-smog", type: "cloudy" },
        51: { text: "Light Drizzle", icon: "fas fa-cloud-showers-heavy", type: "rain" },
        53: { text: "Moderate Drizzle", icon: "fas fa-cloud-showers-heavy", type: "rain" },
        55: { text: "Dense Drizzle", icon: "fas fa-cloud-showers-heavy", type: "rain" },
        61: { text: "Slight Rain", icon: "fas fa-cloud-rain", type: "rain" },
        63: { text: "Moderate Rain", icon: "fas fa-cloud-rain", type: "rain" },
        65: { text: "Heavy Rain", icon: "fas fa-cloud-showers-heavy", type: "rain" },
        71: { text: "Slight Snow", icon: "fas fa-snowflake", type: "snow" },
        73: { text: "Moderate Snow", icon: "fas fa-snowflake", type: "snow" },
        75: { text: "Heavy Snow", icon: "fas fa-snowflake", type: "snow" },
        77: { text: "Snow Grains", icon: "fas fa-snowflake", type: "snow" },
        80: { text: "Slight Showers", icon: "fas fa-cloud-showers-heavy", type: "rain" },
        81: { text: "Moderate Showers", icon: "fas fa-cloud-showers-heavy", type: "rain" },
        82: { text: "Violent Showers", icon: "fas fa-cloud-showers-heavy", type: "rain" },
        95: { text: "Thunderstorm", icon: "fas fa-bolt", type: "rain" },
        96: { text: "Thunderstorm with Hail", icon: "fas fa-bolt", type: "rain" },
        99: { text: "Thunderstorm with Heavy Hail", icon: "fas fa-bolt", type: "rain" },
    };

    const defaultDesc = { text: "Unknown Weather", icon: "fas fa-question-circle", type: "clear" };
    return descriptions[code] || defaultDesc;
}

// --- Main Function to get Weather (unchanged logic) ---
async function getWeather() {
    const city = cityInput.value.trim();
    if (city === '') {
        alert('Please enter a city name');
        return;
    }

    showLoading();
    
    const geoUrl = `${GEOCODING_URL}?name=${city}&count=1`;
    try {
        const response = await fetch(geoUrl);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const { latitude, longitude, name, country } = data.results[0];
            const fullName = `${name}, ${country}`;
            await getWeatherByCoords(latitude, longitude, fullName);
            await changeBackground(fullName);
        } else {
            weatherInfoDiv.innerHTML = '<p class="error-message">City not found. Please check spelling.</p>';
            toggleWeatherEffect(null); 
            document.body.style.backgroundImage = `url('${UNSPLASH_BASE_URL}/?cityscape')`; 
        }

    } catch (error) {
        console.error("Geocoding Error:", error);
        weatherInfoDiv.innerHTML = '<p class="error-message">Could not connect to location service. Please try again.</p>';
        toggleWeatherEffect(null);
        document.body.style.backgroundImage = `url('${UNSPLASH_BASE_URL}/?default')`;
    } finally {
        hideLoading();
    }
}

// --- Function to get Weather Data (unchanged) ---
async function getWeatherByCoords(lat, lon, city) {
    const weatherUrl = `${FORECAST_URL}?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius&wind_speed_unit=kmh`;

    try {
        const response = await fetch(weatherUrl);
        const data = await response.json();

        if (!data.current_weather) {
            weatherInfoDiv.innerHTML = '<p class="error-message">Weather data not available for this location.</p>';
            toggleWeatherEffect(null);
            return;
        }

        const { temperature, windspeed, weathercode } = data.current_weather;
        const { text, icon, type } = getWeatherDescription(weathercode);

        const weatherHtml = `
            <div class="weather-details">
                <h2>${city}</h2>
                <i class="weather-icon ${icon}"></i>
                <p><strong>Condition:</strong> ${text}</p>
                <p><strong>Temperature:</strong> ${temperature}°C</p>
                <p><strong>Wind Speed:</strong> ${windspeed} km/h</p>
            </div>
        `;

        weatherInfoDiv.innerHTML = weatherHtml;
        toggleWeatherEffect(type); // Apply rain/snow effects

    } catch (error) {
        console.error("Weather API Error:", error);
        weatherInfoDiv.innerHTML = '<p class="error-message">Failed to fetch weather data. Check API status.</p>';
        toggleWeatherEffect(null);
    }
}

// --- Function to change Background (PEXELS API - FIXED TO AVOID IRRELEVANT IMAGES) ---
async function changeBackground(city) {
    // Check if the key is available from the environment/constant
    if (!PEXELS_API_KEY) { 
        console.warn("Pexels API Key not found. Using generic Unsplash background.");
        document.body.style.backgroundImage = `url('${UNSPLASH_BASE_URL}/?cityscape')`; 
        return;
    }

    // FIXED QUERY: Search for the city name PLUS "cityscape" to prioritize relevant backgrounds
    const keyword = city.split(',')[0].trim() + " cityscape"; 
    const url = `${PEXELS_BASE_URL}?query=${keyword}&per_page=1&orientation=landscape`;

    try {
        const response = await fetch(url, {
            headers: {
                // Pass the key in the Authorization header
                Authorization: PEXELS_API_KEY 
            }
        });

        const data = await response.json();

        if (data.photos && data.photos.length > 0) {
            const imageUrl = data.photos[0].src.landscape;
            
            // Pre-load the image to prevent flash/flicker
            const img = new Image();
            img.onload = () => {
                document.body.style.backgroundImage = `url('${imageUrl}')`;
            };
            img.src = imageUrl;

        } else {
            console.log("No specific photo found. Using generic fallback.");
            document.body.style.backgroundImage = `url('${UNSPLASH_BASE_URL}/?cityscape,skyline')`;
        }
    } catch (error) {
        console.error("Pexels API Error:", error);
        document.body.style.backgroundImage = `url('${UNSPLASH_BASE_URL}/?cityscape,view')`;
    }
}


// --- Function to toggle Weather Animations ---
function toggleWeatherEffect(type) {
    weatherFxDiv.classList.remove('is-raining', 'is-snowing');

    if (type === 'rain') {
        weatherFxDiv.classList.add('is-raining');
    } else if (type === 'snow') {
        weatherFxDiv.classList.add('is-snowing');
    }
}

// --- Helper Functions for UX ---
function showLoading() {
    weatherInfoDiv.innerHTML = '';
    loader.style.display = 'block';
}

function hideLoading() {
    loader.style.display = 'none';
}

// --- Initial Setup ---
document.addEventListener('DOMContentLoaded', () => {
    // Clear the input field for a clean start
    cityInput.value = '';
});