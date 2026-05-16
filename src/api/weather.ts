import axios from 'axios';
import type { Signal } from '../types';
import type { City } from '../types';
import { CITY_REGISTRY } from '../data/cities';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

const MOCK_WEATHER: Partial<Record<City, { content: string; urgency: number; rawData: Record<string, unknown> }>> = {
  karachi:    { content: 'Heavy rainfall — Karachi. 38mm/hr. Flash flood watch active. Humidity 89%. Temperature 34°C.', urgency: 0.75, rawData: { rain_mm_hr: 38, humidity: 89, temp: 34 } },
  islamabad:  { content: 'Islamabad: 28°C, Humidity 45%. Light winds 5km/h — poor pollutant dispersion. No rainfall.', urgency: 0.40, rawData: { temp: 28, humidity: 45, wind_speed: 5 } },
  lahore:     { content: 'Lahore: 14°C, calm winds 2km/h, humidity 82%. Smog trapping conditions — AQI alert expected.', urgency: 0.72, rawData: { temp: 14, humidity: 82, wind_speed: 2 } },
  rawalpindi: { content: 'Rawalpindi: Heavy rain 42mm/hr, temperature 22°C. Nullah overflow risk — flood watch active.', urgency: 0.80, rawData: { rain_mm_hr: 42, humidity: 91, temp: 22 } },
  faisalabad: { content: 'Faisalabad: 45°C, humidity 18%, wind 4km/h. Extreme heat advisory. Power grid under stress.', urgency: 0.82, rawData: { temp: 45, humidity: 18, wind_speed: 4 } },
  multan:     { content: 'Multan: 47°C, humidity 12%, wind 3km/h. Life-threatening heat emergency. Shade mandatory.', urgency: 0.95, rawData: { temp: 47, humidity: 12, wind_speed: 3 } },
  gujranwala: { content: 'Gujranwala: 38°C, humidity 55%, wind 6km/h SE. Hot and hazy — smoke dispersal risk low.', urgency: 0.55, rawData: { temp: 38, humidity: 55, wind_speed: 6 } },
  sialkot:    { content: 'Sialkot: 28mm/hr rain, 24°C, humidity 88%. Flooding risk — River Aik near bank-full stage.', urgency: 0.70, rawData: { rain_mm_hr: 28, humidity: 88, temp: 24 } },
  bahawalpur: { content: 'Bahawalpur: Sandstorm warning. Wind 65km/h SW. Visibility 200m. Temperature 41°C.', urgency: 0.78, rawData: { temp: 41, wind_speed: 65, visibility_m: 200 } },
  sargodha:   { content: 'Sargodha: Dust storm approaching from west. 55km/h winds. Canal levels rising — 31°C.', urgency: 0.65, rawData: { temp: 31, wind_speed: 55, humidity: 40 } },
  peshawar:   { content: 'Peshawar: 35mm/hr rain, 26°C, humidity 85%. Kabul River at danger mark — flood warning.', urgency: 0.77, rawData: { rain_mm_hr: 35, humidity: 85, temp: 26 } },
  abbottabad: { content: 'Abbottabad: Recent seismic activity. 18°C, heavy rain 20mm/hr — landslide risk elevated.', urgency: 0.68, rawData: { temp: 18, rain_mm_hr: 20, seismic_alert: true } },
  quetta:     { content: 'Quetta: Earthquake 5.8 magnitude recorded. Aftershock risk. Temperature -2°C, snowfall.', urgency: 0.90, rawData: { temp: -2, snowfall_cm: 15, seismic_magnitude: 5.8 } },
  gwadar:     { content: 'Gwadar: Cyclone YUKI approaching. Wind 120km/h, storm surge 3.2m expected. Evacuate coastal zones.', urgency: 0.98, rawData: { wind_speed: 120, storm_surge_m: 3.2, cyclone: 'YUKI' } },
  hyderabad:  { content: 'Hyderabad: 32mm/hr rain, 29°C, humidity 87%. SITE area drainage at capacity — flood risk.', urgency: 0.68, rawData: { rain_mm_hr: 32, humidity: 87, temp: 29 } },
  sukkur:     { content: 'Sukkur: 50°C heat emergency. Indus River 4.2m above danger level. Barrage stress — evacuation alert.', urgency: 0.96, rawData: { temp: 50, river_m_above_danger: 4.2, humidity: 22 } },
};

export async function fetchWeather(city: City): Promise<Signal> {
  const meta = CITY_REGISTRY[city];

  if (!API_KEY) {
    return getMockWeather(city);
  }

  try {
    const { data } = await axios.get(
      'https://api.openweathermap.org/data/2.5/weather',
      { params: { q: meta.weatherQuery, appid: API_KEY, units: 'metric' }, timeout: 5000 }
    );
    return {
      id: `weather-${city}-live`,
      source: 'weather' as const,
      content: `${meta.label}: ${data.weather[0].description}, ${Math.round(data.main.temp)}°C, humidity ${data.main.humidity}%.${data.main.temp > 42 ? ' Extreme heat warning.' : ''}${(data.rain?.['1h'] ?? 0) > 10 ? ' Heavy rainfall alert.' : ''}`,
      location: { lat: meta.lat, lng: meta.lng, label: meta.label },
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
  const meta = CITY_REGISTRY[city];
  const mock = MOCK_WEATHER[city] ?? { content: `${meta.label}: weather data unavailable.`, urgency: 0.3, rawData: {} };

  return {
    id: `weather-${city}-mock`,
    source: 'weather',
    content: mock.content,
    location: { lat: meta.lat, lng: meta.lng, label: meta.label },
    timestamp: new Date().toISOString(),
    credibilityScore: 0.85,
    urgencyScore: mock.urgency,
    isFlagged: false,
    rawData: { source: 'OpenWeatherMap (mock)', ...mock.rawData },
  };
}
