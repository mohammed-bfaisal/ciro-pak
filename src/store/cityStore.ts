import { create } from 'zustand';
import type { City } from '../types';

interface CityState {
  city: City;
  setCity: (city: City) => void;
}

export const useCityStore = create<CityState>((set) => ({
  city: 'karachi',
  setCity: (city) => set({ city }),
}));
