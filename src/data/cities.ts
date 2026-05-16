import type { City } from '../types';

export interface CityMeta {
  label: string;
  province: string;
  lat: number;
  lng: number;
  zoom: number;
  weatherQuery: string;
  scenarioTitle: string;
  scenarioHint: string;
}

export const CITY_REGISTRY: Record<City, CityMeta> = {
  karachi: {
    label: 'Karachi',
    province: 'Sindh',
    lat: 24.8607, lng: 67.0011, zoom: 11,
    weatherQuery: 'Karachi,PK',
    scenarioTitle: 'Lyari Flood + DHA Heatwave',
    scenarioHint: '9 signals · 2 crises · CRITICAL + HIGH',
  },
  islamabad: {
    label: 'Islamabad',
    province: 'Federal',
    lat: 33.6844, lng: 73.0479, zoom: 12,
    weatherQuery: 'Islamabad,PK',
    scenarioTitle: 'G-10 Sinkhole + I-8 Smog Emergency',
    scenarioHint: '9 signals · 2 crises · HIGH + HIGH',
  },
  lahore: {
    label: 'Lahore',
    province: 'Punjab',
    lat: 31.5204, lng: 74.3587, zoom: 11,
    weatherQuery: 'Lahore,PK',
    scenarioTitle: 'Smog Emergency + Liberty Market Flood',
    scenarioHint: '9 signals · 2 crises · CRITICAL + HIGH',
  },
  rawalpindi: {
    label: 'Rawalpindi',
    province: 'Punjab',
    lat: 33.6007, lng: 73.0679, zoom: 12,
    weatherQuery: 'Rawalpindi,PK',
    scenarioTitle: 'Leh Nullah Flash Flood + Gas Rupture',
    scenarioHint: '9 signals · 2 crises · CRITICAL + HIGH',
  },
  faisalabad: {
    label: 'Faisalabad',
    province: 'Punjab',
    lat: 31.4504, lng: 73.1350, zoom: 12,
    weatherQuery: 'Faisalabad,PK',
    scenarioTitle: 'Chemical Spill + Heatwave Power Outage',
    scenarioHint: '9 signals · 2 crises · HIGH + HIGH',
  },
  multan: {
    label: 'Multan',
    province: 'Punjab',
    lat: 30.1575, lng: 71.5249, zoom: 12,
    weatherQuery: 'Multan,PK',
    scenarioTitle: 'Extreme Heatwave (47°C) + Underpass Collapse',
    scenarioHint: '9 signals · 2 crises · CRITICAL + HIGH',
  },
  gujranwala: {
    label: 'Gujranwala',
    province: 'Punjab',
    lat: 32.1877, lng: 74.1945, zoom: 12,
    weatherQuery: 'Gujranwala,PK',
    scenarioTitle: 'Factory Fire + Water Contamination',
    scenarioHint: '9 signals · 2 crises · HIGH + HIGH',
  },
  sialkot: {
    label: 'Sialkot',
    province: 'Punjab',
    lat: 32.4945, lng: 74.5229, zoom: 12,
    weatherQuery: 'Sialkot,PK',
    scenarioTitle: 'River Aik Flash Flood + Industrial Effluent',
    scenarioHint: '9 signals · 2 crises · HIGH + MEDIUM',
  },
  bahawalpur: {
    label: 'Bahawalpur',
    province: 'Punjab',
    lat: 29.3956, lng: 71.6836, zoom: 12,
    weatherQuery: 'Bahawalpur,PK',
    scenarioTitle: 'Desert Sandstorm + Hospital Overcrowding',
    scenarioHint: '9 signals · 2 crises · HIGH + HIGH',
  },
  sargodha: {
    label: 'Sargodha',
    province: 'Punjab',
    lat: 32.0830, lng: 72.6748, zoom: 12,
    weatherQuery: 'Sargodha,PK',
    scenarioTitle: 'Canal Breach + Dust Storm Crop Emergency',
    scenarioHint: '9 signals · 2 crises · CRITICAL + MEDIUM',
  },
  peshawar: {
    label: 'Peshawar',
    province: 'KPK',
    lat: 34.0150, lng: 71.5249, zoom: 12,
    weatherQuery: 'Peshawar,PK',
    scenarioTitle: 'Crowd Emergency + Kabul River Flash Flood',
    scenarioHint: '9 signals · 2 crises · HIGH + CRITICAL',
  },
  abbottabad: {
    label: 'Abbottabad',
    province: 'KPK',
    lat: 34.1463, lng: 73.2117, zoom: 13,
    weatherQuery: 'Abbottabad,PK',
    scenarioTitle: 'Earthquake Building Damage + KKH Landslide',
    scenarioHint: '9 signals · 2 crises · CRITICAL + HIGH',
  },
  quetta: {
    label: 'Quetta',
    province: 'Balochistan',
    lat: 30.1798, lng: 66.9750, zoom: 12,
    weatherQuery: 'Quetta,PK',
    scenarioTitle: 'Earthquake (5.8 mag) + Winter Storm Road Closures',
    scenarioHint: '9 signals · 2 crises · CRITICAL + HIGH',
  },
  gwadar: {
    label: 'Gwadar',
    province: 'Balochistan',
    lat: 25.1216, lng: 62.3254, zoom: 13,
    weatherQuery: 'Gwadar,PK',
    scenarioTitle: 'Cyclone Warning + Water Scarcity Emergency',
    scenarioHint: '9 signals · 2 crises · CRITICAL + HIGH',
  },
  hyderabad: {
    label: 'Hyderabad',
    province: 'Sindh',
    lat: 25.3960, lng: 68.3578, zoom: 12,
    weatherQuery: 'Hyderabad,PK',
    scenarioTitle: 'SITE Industrial Fire + Qasimabad Flood',
    scenarioHint: '9 signals · 2 crises · HIGH + HIGH',
  },
  sukkur: {
    label: 'Sukkur',
    province: 'Sindh',
    lat: 27.7052, lng: 68.8570, zoom: 12,
    weatherQuery: 'Sukkur,PK',
    scenarioTitle: 'Indus Flood Surge + Heatwave Hospital Crisis',
    scenarioHint: '9 signals · 2 crises · CRITICAL + HIGH',
  },
};

export const CITIES_BY_PROVINCE: Record<string, City[]> = {
  Sindh: ['karachi', 'hyderabad', 'sukkur'],
  Federal: ['islamabad'],
  Punjab: ['lahore', 'rawalpindi', 'faisalabad', 'multan', 'gujranwala', 'sialkot', 'bahawalpur', 'sargodha'],
  KPK: ['peshawar', 'abbottabad'],
  Balochistan: ['quetta', 'gwadar'],
};
