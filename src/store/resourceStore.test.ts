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

  it('advances one real route minute after sixty 1x seconds', () => {
    const store = useResourceStore.getState();

    store.setResources([unit]);
    store.dispatchUnit(
      unit.id,
      'crisis-1',
      { lat: 0, lng: 10, label: 'Incident' },
      600,
      [
        [0, 0],
        [10, 0],
      ],
    );

    expect(useResourceStore.getState().simulationRunning).toBe(true);
    expect(useResourceStore.getState().resources[0].etaSeconds).toBe(600);
    expect(useResourceStore.getState().resources[0].etaMinutes).toBe(10);

    useResourceStore.getState().tick(60);

    const moved = useResourceStore.getState().resources[0];
    expect(moved.status).toBe('en_route');
    expect(moved.movementProgress).toBeCloseTo(0.1);
    expect(moved.currentPosition.lng).toBeCloseTo(1);
    expect(moved.currentPosition.lat).toBeCloseTo(0);
  });

  it('uses the selected speed as a real-time multiplier when no explicit delta is passed', () => {
    const store = useResourceStore.getState();

    store.setResources([unit]);
    store.dispatchUnit(
      unit.id,
      'crisis-1',
      { lat: 0, lng: 10, label: 'Incident' },
      600,
      [
        [0, 0],
        [10, 0],
      ],
    );

    store.setSimulationSpeed(20);
    useResourceStore.getState().tick();

    const moved = useResourceStore.getState().resources[0];
    expect(moved.movementProgress).toBeCloseTo(20 / 600);
    expect(moved.currentPosition.lng).toBeCloseTo(10 * (20 / 600));
  });

  it('uses a stable straight-line route when a road route is unavailable', () => {
    const store = useResourceStore.getState();

    store.setResources([unit]);
    store.dispatchUnit(
      unit.id,
      'crisis-1',
      { lat: 0, lng: 10, label: 'Incident' },
      600,
    );

    useResourceStore.getState().tick(120);

    const moved = useResourceStore.getState().resources[0];
    expect(moved.routeCoordinates).toEqual([
      [0, 0],
      [10, 0],
    ]);
    expect(moved.movementProgress).toBeCloseTo(0.2);
    expect(moved.currentPosition.lng).toBeCloseTo(2);
  });

  it('accepts fractional second deltas for smooth time-speed controls', () => {
    const store = useResourceStore.getState();

    store.setResources([unit]);
    store.dispatchUnit(
      unit.id,
      'crisis-1',
      { lat: 0, lng: 10, label: 'Incident' },
      600,
      [
        [0, 0],
        [10, 0],
      ],
    );

    useResourceStore.getState().tick(0.25);

    const moved = useResourceStore.getState().resources[0];
    expect(moved.movementProgress).toBeCloseTo(0.25 / 600);
    expect(moved.currentPosition.lng).toBeCloseTo(10 * (0.25 / 600));
  });

  it('moves units through en route, on scene, returning, and available states', () => {
    const store = useResourceStore.getState();

    store.setResources([{ ...unit, availabilityCooldownMinutes: 1 }]);
    store.dispatchUnit(
      unit.id,
      'crisis-1',
      { lat: 0, lng: 10, label: 'Incident' },
      60,
      [
        [0, 0],
        [10, 0],
      ],
    );

    useResourceStore.getState().tick(60);
    expect(useResourceStore.getState().resources[0].status).toBe('on_scene');

    useResourceStore.getState().tick(60);
    expect(useResourceStore.getState().resources[0].status).toBe('returning');

    useResourceStore.getState().tick(600);
    const returned = useResourceStore.getState().resources[0];
    expect(returned.status).toBe('available');
    expect(returned.assignedCrisisId).toBeNull();
    expect(returned.currentPosition).toEqual(unit.location);
  });
});
