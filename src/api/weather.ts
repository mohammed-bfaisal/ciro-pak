import axios from 'axios';
import { CITY_REGISTRY } from '../data/cities';
import type { City, Signal } from '../types';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export async function fetchWeather(city: City): Promise<Signal> {
  const metadata = CITY_REGISTRY[city];
  const [lng, lat] = metadata.center;

  if (!API_KEY) {
    return getMockWeather(city);
  }

  try {
    const { data } = await axios.get(
      'https://api.openweathermap.org/data/2.5/weather',
      { params: { q: metadata.weatherQuery, appid: API_KEY, units: 'metric' }, timeout: 5000 }
    );
    return {
      id: `weather-${city}-live`,
      source: 'weather',
      content: `${data.weather[0].description}, ${Math.round(data.main.temp)}C, humidity ${data.main.humidity}%. ${data.main.temp > 40 ? 'Extreme heat warning.' : ''} ${(data.rain?.['1h'] ?? 0) > 10 ? 'Heavy rainfall alert.' : ''}`,
      location: { lat, lng, label: metadata.label },
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

function getMockWeather(city: City): Signal {
  const metadata = CITY_REGISTRY[city];
  const [lng, lat] = metadata.center;

  if (city === 'karachi') {
    return {
      id: 'weather-karachi-mock',
      source: 'weather',
      content: 'Heavy rainfall alert - Karachi. 38mm/hr. Flash flood watch active. Humidity 89%. Temperature 34C.',
      location: { lat, lng, label: 'Karachi' },
      timestamp: new Date().toISOString(),
      credibilityScore: 0.85,
      urgencyScore: 0.75,
      isFlagged: false,
      rawData: { source: 'OpenWeatherMap (mock)', rain_mm_hr: 38, humidity: 89, temp: 34 },
    };
  }

  return {
    id: `weather-${city}-mock`,
    source: 'weather',
    content: `${metadata.label}: Weather feed indicates localized risk for ${metadata.scenarioTitle}. Mock conditions used when API is unavailable.`,
    location: { lat, lng, label: metadata.label },
    timestamp: new Date().toISOString(),
    credibilityScore: 0.85,
    urgencyScore: 0.55,
    isFlagged: false,
    rawData: { source: 'OpenWeatherMap (mock)', city, scenario: metadata.scenarioTitle },
  };
}
