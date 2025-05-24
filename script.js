// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const cityName = document.getElementById('city-name');
const currentDate = document.getElementById('current-date');
const weatherIcon = document.getElementById('weather-icon');
const temp = document.getElementById('temp');
const weatherDesc = document.getElementById('weather-desc');
const wind = document.getElementById('wind');
const humidity = document.getElementById('humidity');
const forecast = document.getElementById('forecast');
const errorMessage = document.getElementById('error-message');

// Event Listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    } else {
        showError('Please enter a city name');
    }
});

locationBtn.addEventListener('click', getLocationWeather);

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
        } else {
            showError('Please enter a city name');
        }
    }
});

// Initialize with default city
window.addEventListener('load', () => {
    getWeatherData('Budapest'); // Default city
});

async function getWeatherData(city) {
    try {
        // Current weather
        const currentResponse = await fetch(
            `/.netlify/functions/weather?city=${city}&type=current`
        );
        
        if (!currentResponse.ok) {
            throw new Error('City not found');
        }
        
        const currentData = await currentResponse.json();
        
        // Forecast (5 days)
        const forecastResponse = await fetch(
            `/.netlify/functions/weather?city=${city}&type=forecast`
        );
        const forecastData = await forecastResponse.json();
        
        displayWeather(currentData, forecastData);
        errorMessage.textContent = '';
    } catch (err) {
        showError(err.message);
    }
}

function displayWeather(currentData, forecastData) {
    // Current weather
    cityName.textContent = `${currentData.name}, ${currentData.sys.country}`;
    
    const now = new Date();
    currentDate.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    temp.textContent = Math.round(currentData.main.temp);
    weatherDesc.textContent = currentData.weather[0].description;
    wind.textContent = Math.round(currentData.wind.speed * 3.6); // Convert m/s to km/h
    humidity.textContent = currentData.main.humidity;
    
    weatherIcon.src = `https://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png`;
    weatherIcon.alt = currentData.weather[0].description;
    
    // Forecast
    forecast.innerHTML = '';
    
    // Get daily forecasts (every 24 hours)
    const dailyForecasts = [];
    for (let i = 0; i < forecastData.list.length; i += 8) {
        dailyForecasts.push(forecastData.list[i]);
    }
    
    dailyForecasts.slice(0, 5).forEach(item => {
        const forecastDate = new Date(item.dt * 1000);
        const dayName = forecastDate.toLocaleDateString('en-US', { weekday: 'short' });
        
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <p>${dayName}</p>
            <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}">
            <p>${Math.round(item.main.temp)}°C</p>
        `;
        
        forecast.appendChild(forecastItem);
    });
}

function getLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const geoResponse = await fetch(
                        `/.netlify/functions/weather?lat=${latitude}&lon=${longitude}&type=geocode`
                    );
                    const geoData = await geoResponse.json();
                    
                    if (geoData.length > 0) {
                        const city = geoData[0].name;
                        cityInput.value = city;
                        getWeatherData(city);
                    } else {
                        showError('Unable to determine your location');
                    }
                } catch (err) {
                    showError('Error getting location data');
                }
            },
            (error) => {
                showError('Geolocation error: ' + error.message);
            }
        );
    } else {
        showError('Geolocation is not supported by your browser');
    }
}


function showError(message) {
    errorMessage.textContent = message;
    setTimeout(() => {
        errorMessage.textContent = '';
    }, 5000);
}