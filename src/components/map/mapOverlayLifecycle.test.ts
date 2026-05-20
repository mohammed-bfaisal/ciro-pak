import { describe, expect, it } from 'vitest';
import type maplibregl from 'maplibre-gl';
import { runWhenStyleReady } from './mapOverlayLifecycle';

describe('map overlay lifecycle', () => {
  it('runs immediately for a loaded style and again after every style reload', () => {
    const listeners = new Map<string, () => void>();
    const calls: string[] = [];
    const map = {
      isStyleLoaded: () => true,
      once: (eventName: string, callback: () => void) => {
        listeners.set(`once:${eventName}`, callback);
      },
      on: (eventName: string, callback: () => void) => {
        listeners.set(eventName, callback);
      },
      off: (eventName: string, callback: () => void) => {
        if (listeners.get(eventName) === callback) {
          listeners.delete(eventName);
        }
      },
    } as unknown as maplibregl.Map;

    const cleanup = runWhenStyleReady(map, () => {
      calls.push('sync');
    });

    expect(calls).toEqual(['sync']);

    listeners.get('style.load')?.();
    expect(calls).toEqual(['sync', 'sync']);

    cleanup();
    expect(listeners.has('style.load')).toBe(false);
  });
});
