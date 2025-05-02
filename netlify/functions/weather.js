// netlify/functions/weather.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  const { city, lat, lon, type } = event.queryStringParameters;
  const API_KEY = process.env.OPENWEATHER_API_KEY;
  
  try {
    let url;
    if (type === 'current') {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
    } else if (type === 'forecast') {
      url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`;
    } else if (type === 'geocode') {
      url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
    } else {
      throw new Error('Invalid request type');
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};