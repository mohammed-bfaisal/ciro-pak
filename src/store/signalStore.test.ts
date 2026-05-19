import { beforeEach, describe, expect, it } from 'vitest';
import type { Signal } from '../types';
import { useSignalStore } from './signalStore';

const baseSignal: Signal = {
  id: 'weather-karachi-mock',
  source: 'weather',
  content: 'Initial weather status',
  location: { lat: 24.86, lng: 67.01, label: 'Karachi' },
  timestamp: '2026-05-19T09:00:00.000Z',
  credibilityScore: 0.85,
  urgencyScore: 0.7,
  isFlagged: false,
  rawData: { source: 'mock' },
};

describe('signal store', () => {
  beforeEach(() => {
    useSignalStore.getState().reset();
  });

  it('upserts live weather updates without duplicating the signal row', () => {
    useSignalStore.getState().upsertSignal(baseSignal);
    useSignalStore.getState().upsertSignal({
      ...baseSignal,
      content: 'Updated weather status',
      timestamp: '2026-05-19T09:02:00.000Z',
    });

    expect(useSignalStore.getState().signals).toEqual([
      {
        ...baseSignal,
        content: 'Updated weather status',
        timestamp: '2026-05-19T09:02:00.000Z',
      },
    ]);
  });
});
