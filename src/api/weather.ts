import axios from 'axios';
import type { Signal } from '../types';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

const CITY_COORDS = {
  karachi:   { q: 'Karachi,PK',   lat: 24.8607, lng: 67.0011 },
  islamabad: { q: 'Islamabad,PK', lat: 33.6844, lng: 73.0479 },
};

export async function fetchWeather(city: 'karachi' | 'islamabad'): Promise<Signal> {
  const { q, lat, lng } = CITY_COORDS[city];

  if (!API_KEY) {
    return getMockWeather(city);
  }

  try {
    const { data } = await axios.get(
      'https://api.openweathermap.org/data/2.5/weather',
      { params: { q, appid: API_KEY, units: 'metric' }, timeout: 5000 }
    );
    return {
      id: `weather-${city}-live`,
      source: 'weather' as const,
      content: `${data.weather[0].description}, ${Math.round(data.main.temp)}°C, humidity ${data.main.humidity}%. ${data.main.temp > 40 ? 'Extreme heat warning.' : ''} ${(data.rain?.['1h'] ?? 0) > 10 ? 'Heavy rainfall alert.' : ''}`,
      location: { lat, lng, label: city === 'karachi' ? 'Karachi' : 'Islamabad' },
      timestamp: new Date().toISOString(),
      credibilityScore: 0.85,
      urgencyScore: Math.min(1, Math.max(0, ((data.main.temp - 30) / 20) + ((data.rain?.['1h'] ?? 0) / 50))),
      isFlagged: false,
      rawData: data,
    };
  } catch {
    return getMockWeather(city);
  }
}

function getMockWeather(city: 'karachi' | 'islamabad'): Signal {
  const { lat, lng } = CITY_COORDS[city];

  if (city === 'karachi') {
    return {
      id: 'weather-karachi-mock',
      source: 'weather',
      content: 'Heavy rainfall alert — Karachi. 38mm/hr. Flash flood watch active. Humidity 89%. Temperature 34°C.',
      location: { lat, lng, label: 'Karachi' },
      timestamp: new Date().toISOString(),
      credibilityScore: 0.85,
      urgencyScore: 0.75,
      isFlagged: false,
      rawData: { source: 'OpenWeatherMap (mock)', rain_mm_hr: 38, humidity: 89, temp: 34 },
    };
  }

  return {
    id: 'weather-islamabad-mock',
    source: 'weather',
    content: 'Islamabad: Temperature 28°C, Humidity 45%. Light winds 5km/h — poor dispersion conditions. No rainfall expected.',
    location: { lat, lng, label: 'Islamabad' },
    timestamp: new Date().toISOString(),
    credibilityScore: 0.85,
    urgencyScore: 0.40,
    isFlagged: false,
    rawData: { source: 'OpenWeatherMap (mock)', temp: 28, humidity: 45, wind_speed: 5 },
  };
}
