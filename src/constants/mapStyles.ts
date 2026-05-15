export const DARK_STYLE = 'https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json';

export const CITY_COORDS = {
  karachi: {
    center: [67.0011, 24.8607] as [number, number],
    zoom: 11,
    label: 'Karachi',
  },
  islamabad: {
    center: [73.0479, 33.6844] as [number, number],
    zoom: 12,
    label: 'Islamabad',
  },
} as const;
