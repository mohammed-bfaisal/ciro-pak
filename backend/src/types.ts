export type City =
  | 'karachi' | 'islamabad'
  | 'lahore' | 'rawalpindi' | 'faisalabad' | 'multan'
  | 'gujranwala' | 'sialkot' | 'bahawalpur' | 'sargodha'
  | 'peshawar' | 'abbottabad'
  | 'quetta' | 'gwadar'
  | 'hyderabad' | 'sukkur';

export type SignalSource =
  | 'social' | 'weather' | 'traffic'
  | 'field_report' | 'sensor' | 'emergency_call';

export interface GeoPoint {
  lat: number;
  lng: number;
  label: string;
}

export interface Signal {
  id: string;
  source: SignalSource;
  content: string;
  location: GeoPoint;
  timestamp: string;
  credibilityScore: number;
  urgencyScore: number;
  mentionVelocity?: number;
  isFlagged: boolean;
  conflictsWith?: string[];
  rawData: Record<string, unknown>;
}

export interface CityMetadata {
  label: string;
  center: [number, number];
  weatherQuery: string;
  scenarioTitle: string;
}

export interface RouteResult {
  coords: [number, number][];
  etaSeconds: number;
  etaMinutes: number;
  distanceMeters?: number;
  provider: 'tomtom' | 'osrm';
  trafficDelaySeconds?: number;
  freeFlowEtaSeconds?: number;
  trafficUpdatedAt?: string;
  fallbackReason?: 'tomtom_key_missing' | 'tomtom_unavailable' | 'osrm_unavailable';
}

export type CongestionLevel = 'free' | 'moderate' | 'heavy' | 'standstill';

export interface TrafficFlow {
  lat: number;
  lng: number;
  congestionLevel: CongestionLevel;
  currentSpeed: number;
  freeFlowSpeed: number;
  provider: 'tomtom' | 'simulated';
  updatedAt: string;
  fallbackReason?: 'tomtom_key_missing' | 'tomtom_unavailable';
  rawData?: Record<string, unknown>;
}

export const CITY_REGISTRY: Record<City, CityMetadata> = {
  karachi: { label: 'Karachi', center: [67.0011, 24.8607], weatherQuery: 'Karachi,PK', scenarioTitle: 'Flood breach and heat emergency' },
  islamabad: { label: 'Islamabad', center: [73.0479, 33.6844], weatherQuery: 'Islamabad,PK', scenarioTitle: 'Sinkhole and respiratory emergency' },
  lahore: { label: 'Lahore', center: [74.3587, 31.5204], weatherQuery: 'Lahore,PK', scenarioTitle: 'Smog emergency and protest escalation' },
  rawalpindi: { label: 'Rawalpindi', center: [73.0679, 33.6007], weatherQuery: 'Rawalpindi,PK', scenarioTitle: 'Nullah flood and gas rupture' },
  faisalabad: { label: 'Faisalabad', center: [73.1350, 31.4504], weatherQuery: 'Faisalabad,PK', scenarioTitle: 'Chemical spill and heat power outage' },
  multan: { label: 'Multan', center: [71.5249, 30.1575], weatherQuery: 'Multan,PK', scenarioTitle: 'Extreme heat and underpass collapse' },
  gujranwala: { label: 'Gujranwala', center: [74.1945, 32.1877], weatherQuery: 'Gujranwala,PK', scenarioTitle: 'Factory fire and water contamination' },
  sialkot: { label: 'Sialkot', center: [74.5229, 32.4945], weatherQuery: 'Sialkot,PK', scenarioTitle: 'Flash flood and industrial effluent' },
  bahawalpur: { label: 'Bahawalpur', center: [71.6836, 29.3956], weatherQuery: 'Bahawalpur,PK', scenarioTitle: 'Sandstorm and hospital overload' },
  sargodha: { label: 'Sargodha', center: [72.6748, 32.0830], weatherQuery: 'Sargodha,PK', scenarioTitle: 'Canal breach and crop emergency' },
  peshawar: { label: 'Peshawar', center: [71.5249, 34.0150], weatherQuery: 'Peshawar,PK', scenarioTitle: 'Crowd surge and Kabul River flooding' },
  abbottabad: { label: 'Abbottabad', center: [73.2117, 34.1463], weatherQuery: 'Abbottabad,PK', scenarioTitle: 'Tremors and highway landslide' },
  quetta: { label: 'Quetta', center: [66.9750, 30.1798], weatherQuery: 'Quetta,PK', scenarioTitle: 'Earthquake and winter road closure' },
  gwadar: { label: 'Gwadar', center: [62.3254, 25.1216], weatherQuery: 'Gwadar,PK', scenarioTitle: 'Cyclone evacuation and tanker shortage' },
  hyderabad: { label: 'Hyderabad', center: [68.3578, 25.3960], weatherQuery: 'Hyderabad,PK', scenarioTitle: 'Industrial fire and drainage failure' },
  sukkur: { label: 'Sukkur', center: [68.8570, 27.7052], weatherQuery: 'Sukkur,PK', scenarioTitle: 'Indus surge and heat hospital crisis' },
};

export function isCity(value: string): value is City {
  return Object.prototype.hasOwnProperty.call(CITY_REGISTRY, value);
}
