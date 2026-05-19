import type { BackendEnv } from '../config/env.js';
import { fetchJson, type Fetcher } from './http.js';
import { CITY_REGISTRY, type City, type Signal } from '../types.js';

interface OpenWeatherResponse {
  weather?: { description?: string }[];
  main?: {
    temp?: number;
    humidity?: number;
  };
  rain?: {
    '1h'?: number;
  };
}

export async function getWeatherSignal(
  city: City,
  env: Pick<BackendEnv, 'weatherApiKey'>,
  options: { fetcher?: Fetcher; now?: () => Date } = {},
): Promise<Signal> {
  if (!env.weatherApiKey) {
    return getMockWeather(city, 'weather_key_missing', options.now);
  }

  const metadata = CITY_REGISTRY[city];
  const params = new URLSearchParams({
    q: metadata.weatherQuery,
    appid: env.weatherApiKey,
    units: 'metric',
  });

  try {
    const data = await fetchJson<OpenWeatherResponse>(
      `https://api.openweathermap.org/data/2.5/weather?${params.toString()}`,
      {},
      { fetcher: options.fetcher, timeoutMs: 5000 },
    );
    return toSignal(city, data, options.now);
  } catch {
    return getMockWeather(city, 'weather_provider_unavailable', options.now);
  }
}

function toSignal(city: City, data: OpenWeatherResponse, now: (() => Date) | undefined): Signal {
  const metadata = CITY_REGISTRY[city];
  const [lng, lat] = metadata.center;
  const temp = Number(data.main?.temp ?? 30);
  const humidity = Number(data.main?.humidity ?? 55);
  const rainMmHr = Number(data.rain?.['1h'] ?? 0);
  const description = data.weather?.[0]?.description ?? 'weather conditions unavailable';
  const heatWarning = temp > 40 ? 'Extreme heat warning.' : '';
  const rainWarning = rainMmHr > 10 ? 'Heavy rainfall alert.' : '';

  return {
    id: `weather-${city}-live`,
    source: 'weather',
    content: `${description}, ${Math.round(temp)}C, humidity ${Math.round(humidity)}%. ${heatWarning} ${rainWarning}`.trim(),
    location: { lat, lng, label: metadata.label },
    timestamp: (now?.() ?? new Date()).toISOString(),
    credibilityScore: 0.85,
    urgencyScore: Math.min(1, Math.max(0, ((temp - 30) / 20) + (rainMmHr / 50))),
    isFlagged: false,
    rawData: {
      provider: 'OpenWeatherMap',
      temp,
      humidity,
      rainMmHr,
      description,
    },
  };
}

export function getMockWeather(
  city: City,
  fallbackReason: 'weather_key_missing' | 'weather_provider_unavailable',
  now?: () => Date,
): Signal {
  const metadata = CITY_REGISTRY[city];
  const [lng, lat] = metadata.center;

  if (city === 'karachi') {
    return {
      id: 'weather-karachi-mock',
      source: 'weather',
      content: 'Heavy rainfall alert - Karachi. 38mm/hr. Flash flood watch active. Humidity 89%. Temperature 34C.',
      location: { lat, lng, label: 'Karachi' },
      timestamp: (now?.() ?? new Date()).toISOString(),
      credibilityScore: 0.85,
      urgencyScore: 0.75,
      isFlagged: false,
      rawData: {
        provider: 'OpenWeatherMap mock',
        fallbackReason,
        rain_mm_hr: 38,
        humidity: 89,
        temp: 34,
      },
    };
  }

  return {
    id: `weather-${city}-mock`,
    source: 'weather',
    content: `${metadata.label}: Weather feed indicates localized risk for ${metadata.scenarioTitle}. Mock conditions used when API is unavailable.`,
    location: { lat, lng, label: metadata.label },
    timestamp: (now?.() ?? new Date()).toISOString(),
    credibilityScore: 0.85,
    urgencyScore: 0.55,
    isFlagged: false,
    rawData: {
      provider: 'OpenWeatherMap mock',
      fallbackReason,
      city,
      scenario: metadata.scenarioTitle,
    },
  };
}
