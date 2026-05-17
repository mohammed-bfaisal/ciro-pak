const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

interface RouteResult {
  coords: [number, number][]; // [lng, lat] pairs
  etaMinutes: number;
}

export async function fetchRoute(
  fromLng: number, fromLat: number,
  toLng: number, toLat: number,
): Promise<RouteResult | null> {
  try {
    const url = `${OSRM_BASE}/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json() as {
      code: string;
      routes: { duration: number; geometry: { coordinates: [number, number][] } }[];
    };
    if (data.code !== 'Ok' || !data.routes.length) return null;
    const route = data.routes[0];
    return {
      coords: route.geometry.coordinates,
      etaMinutes: Math.max(1, Math.ceil(route.duration / 60)),
    };
  } catch {
    return null;
  }
}
