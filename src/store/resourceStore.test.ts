import { afterEach, describe, expect, it } from 'vitest';
import { useResourceStore } from './resourceStore';
import type { Resource } from '../types';

const unit: Resource = {
  id: 'amb-1',
  type: 'ambulance',
  label: 'Ambulance 1',
  status: 'available',
  location: { lat: 0, lng: 0, label: 'Station' },
  assignedCrisisId: null,
  capacity: 2,
  currentLoad: 0,
  currentPosition: { lat: 0, lng: 0, label: 'Station' },
  movementProgress: 0,
};

describe('resource dispatch movement', () => {
  afterEach(() => {
    useResourceStore.getState().reset();
  });

  it('starts the simulation clock and advances a dispatched unit along its route', () => {
    const store = useResourceStore.getState();

    store.setResources([unit]);
    store.dispatchUnit(
      unit.id,
      'crisis-1',
      { lat: 0, lng: 10, label: 'Incident' },
      10,
      [
        [0, 0],
        [10, 0],
      ],
    );

    expect(useResourceStore.getState().simulationRunning).toBe(true);

    useResourceStore.getState().tick();

    const moved = useResourceStore.getState().resources[0];
    expect(moved.status).toBe('en_route');
    expect(moved.movementProgress).toBeCloseTo(0.1);
    expect(moved.currentPosition.lng).toBeCloseTo(1);
    expect(moved.currentPosition.lat).toBeCloseTo(0);
  });

  it('uses a stable straight-line route when a road route is unavailable', () => {
    const store = useResourceStore.getState();

    store.setResources([unit]);
    store.dispatchUnit(
      unit.id,
      'crisis-1',
      { lat: 0, lng: 10, label: 'Incident' },
      10,
    );

    useResourceStore.getState().tick();
    useResourceStore.getState().tick();

    const moved = useResourceStore.getState().resources[0];
    expect(moved.routeCoordinates).toEqual([
      [0, 0],
      [10, 0],
    ]);
    expect(moved.movementProgress).toBeCloseTo(0.2);
    expect(moved.currentPosition.lng).toBeCloseTo(2);
  });

  it('accepts fractional clock deltas for smooth time-speed controls', () => {
    const store = useResourceStore.getState();

    store.setResources([unit]);
    store.dispatchUnit(
      unit.id,
      'crisis-1',
      { lat: 0, lng: 10, label: 'Incident' },
      10,
      [
        [0, 0],
        [10, 0],
      ],
    );

    useResourceStore.getState().tick(0.25);

    const moved = useResourceStore.getState().resources[0];
    expect(moved.movementProgress).toBeCloseTo(0.025);
    expect(moved.currentPosition.lng).toBeCloseTo(0.25);
  });

  it('moves units through en route, on scene, returning, and available states', () => {
    const store = useResourceStore.getState();

    store.setResources([{ ...unit, availabilityCooldownMinutes: 1 }]);
    store.dispatchUnit(
      unit.id,
      'crisis-1',
      { lat: 0, lng: 10, label: 'Incident' },
      1,
      [
        [0, 0],
        [10, 0],
      ],
    );

    useResourceStore.getState().tick(1);
    expect(useResourceStore.getState().resources[0].status).toBe('on_scene');

    useResourceStore.getState().tick(1);
    expect(useResourceStore.getState().resources[0].status).toBe('returning');

    useResourceStore.getState().tick(10);
    const returned = useResourceStore.getState().resources[0];
    expect(returned.status).toBe('available');
    expect(returned.assignedCrisisId).toBeNull();
    expect(returned.currentPosition).toEqual(unit.location);
  });
});
