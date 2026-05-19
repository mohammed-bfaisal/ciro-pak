import { apiFetch, type ApiClientOptions } from './client';
import { CITY_REGISTRY } from '../data/cities';
import type { City, Signal } from '../types';

export async function fetchWeather(
  city: City,
  options: ApiClientOptions & { now?: () => Date } = {},
): Promise<Signal> {
  try {
    return await apiFetch<Signal>(`/api/weather/${city}`, {}, options);
  } catch (error) {
    const fallbackReason = error instanceof Error && error.name === 'BackendNotConfiguredError'
      ? 'backend_not_configured'
      : 'backend_unavailable';
    return getMockWeather(city, fallbackReason, options.now);
  }
}

export function getMockWeather(
  city: City,
  fallbackReason: 'backend_not_configured' | 'backend_unavailable' = 'backend_not_configured',
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
      rawData: { source: 'OpenWeatherMap (mock)', fallbackReason, rain_mm_hr: 38, humidity: 89, temp: 34 },
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
    rawData: { source: 'OpenWeatherMap (mock)', fallbackReason, city, scenario: metadata.scenarioTitle },
  };
}
