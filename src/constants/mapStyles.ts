import { CITY_REGISTRY } from '../data/cities';

export const DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export const CITY_COORDS = Object.fromEntries(
  Object.entries(CITY_REGISTRY).map(([city, metadata]) => [
    city,
    {
      center: metadata.center,
      zoom: metadata.zoom,
      label: metadata.label,
    },
  ])
) as {
  [K in keyof typeof CITY_REGISTRY]: {
    center: [number, number];
    zoom: number;
    label: string;
  };
};
