import fs from 'node:fs';
import path from 'node:path';

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const CITY_CENTERS = {
  karachi: { label: 'Karachi', center: [67.0011, 24.8607] },
  islamabad: { label: 'Islamabad', center: [73.0479, 33.6844] },
  lahore: { label: 'Lahore', center: [74.3587, 31.5204] },
  rawalpindi: { label: 'Rawalpindi', center: [73.0679, 33.6007] },
  faisalabad: { label: 'Faisalabad', center: [73.135, 31.4504] },
  multan: { label: 'Multan', center: [71.5249, 30.1575] },
  gujranwala: { label: 'Gujranwala', center: [74.1945, 32.1877] },
  sialkot: { label: 'Sialkot', center: [74.5229, 32.4945] },
  bahawalpur: { label: 'Bahawalpur', center: [71.6836, 29.3956] },
  sargodha: { label: 'Sargodha', center: [72.6748, 32.083] },
  peshawar: { label: 'Peshawar', center: [71.5249, 34.015] },
  abbottabad: { label: 'Abbottabad', center: [73.2215, 34.1688] },
  quetta: { label: 'Quetta', center: [66.975, 30.1798] },
  gwadar: { label: 'Gwadar', center: [62.3254, 25.1264] },
  hyderabad: { label: 'Hyderabad', center: [68.3578, 25.396] },
  sukkur: { label: 'Sukkur', center: [68.8574, 27.7139] },
};

const RESOURCE_SPECS = [
  ['rescue_team', 'Rescue Team', ['rescue'], ['fire', 'police', 'medical'], 12],
  ['police_unit', 'Police Unit', ['police'], ['fire', 'medical'], 6],
  ['ambulance', 'Ambulance', ['medical'], ['rescue'], 4],
  ['fire_truck', 'Fire Unit', ['fire'], ['rescue', 'police', 'medical'], 6],
  ['medical_outreach', 'Medical Outreach', ['medical'], ['rescue'], 8],
  ['water_tanker', 'Water Support', ['water'], ['fire', 'rescue', 'medical', 'police'], 1],
  ['drone', 'Recon Drone', ['rescue', 'fire', 'police'], ['medical'], 0],
];

const SOURCE_UPDATED_AT = new Date().toISOString();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function distanceKm(lat1, lon1, lat2, lon2) {
  const earthKm = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos((lat1 * Math.PI) / 180)
    * Math.cos((lat2 * Math.PI) / 180)
    * Math.sin(dLon / 2) ** 2;
  return 2 * earthKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function classify(element) {
  const tags = element.tags ?? {};
  const text = [
    tags.name,
    tags.operator,
    tags.amenity,
    tags.emergency,
    tags.healthcare,
    tags.man_made,
  ].filter(Boolean).join(' ').toLowerCase();
  const classes = new Set();

  if (tags.amenity === 'police' || text.includes('police') || text.includes('chowki')) classes.add('police');
  if (tags.amenity === 'fire_station' || text.includes('fire')) classes.add('fire');
  if (tags.emergency === 'rescue_station' || text.includes('rescue') || text.includes('1122')) classes.add('rescue');
  if (
    tags.emergency === 'ambulance_station'
    || ['hospital', 'clinic', 'doctors'].includes(tags.amenity)
    || ['hospital', 'clinic'].includes(tags.healthcare)
    || text.includes('hospital')
    || text.includes('clinic')
    || text.includes('ambulance')
  ) classes.add('medical');
  if (
    tags.man_made === 'water_works'
    || tags.man_made === 'water_tower'
    || text.includes('wasa')
    || text.includes('water')
  ) classes.add('water');

  return [...classes];
}

function normalizeElement(element, city) {
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;
  return {
    id: `${element.type}/${element.id}`,
    name: element.tags?.name || element.tags?.operator || `${city.label} public facility`,
    lat,
    lng,
    classes: classify(element),
    distanceKm: distanceKm(city.center[1], city.center[0], lat, lng),
  };
}

function buildQuery(cityKey, city) {
  const [lng, lat] = city.center;
  const radius = ['gwadar', 'abbottabad', 'quetta'].includes(cityKey) ? 50000 : 35000;
  const around = `around:${radius},${lat},${lng}`;
  return `[out:json][timeout:45];(
node(${around})[amenity~"^(police|fire_station|hospital|clinic|doctors)$"];
way(${around})[amenity~"^(police|fire_station|hospital|clinic|doctors)$"];
node(${around})[emergency~"^(ambulance_station|rescue_station)$"];
way(${around})[emergency~"^(ambulance_station|rescue_station)$"];
node(${around})[healthcare~"^(hospital|clinic)$"];
way(${around})[healthcare~"^(hospital|clinic)$"];
node(${around})[man_made~"^(water_works|water_tower)$"];
way(${around})[man_made~"^(water_works|water_tower)$"];
);out center tags 140;`;
}

async function fetchOverpass(query, cityKey) {
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const url = `${endpoint}?${new URLSearchParams({ data: query })}`;
      const response = await fetch(url, { headers: { 'User-Agent': 'CIRO-Pak/1.0 station snapshot generator' } });
      const text = await response.text();
      if (!response.ok || !text.trim().startsWith('{')) throw new Error(text.slice(0, 120));
      return JSON.parse(text);
    } catch (error) {
      console.warn(`Retrying ${cityKey} with next Overpass endpoint: ${error.message}`);
      await sleep(3000);
    }
  }
  throw new Error(`All Overpass endpoints failed for ${cityKey}`);
}

function pickFacility(candidates, preferred, usedIds, fallback) {
  let pool = candidates.filter((candidate) =>
    preferred.some((klass) => candidate.classes.includes(klass)) && !usedIds.has(candidate.id)
  );
  let confidence = 0.95;
  let isFallback = false;

  if (!pool.length) {
    pool = candidates.filter((candidate) =>
      fallback.some((klass) => candidate.classes.includes(klass)) && !usedIds.has(candidate.id)
    );
    confidence = 0.75;
    isFallback = true;
  }

  if (!pool.length) {
    pool = candidates;
    confidence = 0.6;
    isFallback = true;
  }

  const chosen = [...pool].sort((a, b) => a.distanceKm - b.distanceKm)[0];
  usedIds.add(chosen.id);
  return { chosen, confidence, isFallback };
}

function makeResource(cityKey, city, spec, selection) {
  const [type, label, , , capacity] = spec;
  const facility = selection.chosen;
  return {
    id: `${cityKey}-${type.replace('_', '-')}`,
    type,
    label: `${city.label} ${label} - ${facility.name}`,
    status: 'available',
    location: {
      lat: Number(facility.lat.toFixed(6)),
      lng: Number(facility.lng.toFixed(6)),
      label: selection.isFallback ? `${facility.name} (sourced fallback)` : facility.name,
    },
    assignedCrisisId: null,
    capacity,
    currentLoad: 0,
    source: 'OpenStreetMap/Overpass snapshot',
    sourceId: facility.id,
    sourceConfidence: selection.confidence,
    sourceUpdatedAt: SOURCE_UPDATED_AT,
  };
}

async function main() {
  const snapshot = {};

  for (const [cityKey, city] of Object.entries(CITY_CENTERS)) {
    const response = await fetchOverpass(buildQuery(cityKey, city), cityKey);
    const seenIds = new Set();
    const candidates = response.elements
      .map((element) => normalizeElement(element, city))
      .filter((candidate) =>
        Number.isFinite(candidate.lat)
        && Number.isFinite(candidate.lng)
        && candidate.classes.length > 0
        && !seenIds.has(candidate.id)
        && seenIds.add(candidate.id)
      )
      .sort((a, b) => a.distanceKm - b.distanceKm);

    const usedIds = new Set();
    snapshot[cityKey] = RESOURCE_SPECS.map((spec) =>
      makeResource(cityKey, city, spec, pickFacility(candidates, spec[2], usedIds, spec[3]))
    );
    console.log(`Generated ${snapshot[cityKey].length} resources for ${city.label}`);
    await sleep(1500);
  }

  const content = `import type { City, Resource } from '../types';\n\n`
    + `type ResourceSeed = Omit<Resource, 'currentPosition' | 'movementProgress'>;\n\n`
    + `export const STATION_RESOURCE_SNAPSHOT: Record<City, ResourceSeed[]> = ${JSON.stringify(snapshot, null, 2)};\n\n`
    + `export function getStationResources(city: City): Resource[] {\n`
    + `  return STATION_RESOURCE_SNAPSHOT[city].map((resource) => ({\n`
    + `    ...resource,\n`
    + `    currentPosition: resource.location,\n`
    + `    movementProgress: 0,\n`
    + `  }));\n`
    + `}\n`;

  fs.writeFileSync(path.join('src', 'data', 'stationResources.ts'), content);
}

await main();
