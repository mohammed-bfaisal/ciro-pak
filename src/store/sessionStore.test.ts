import { afterEach, describe, expect, it } from 'vitest';
import { useSignalStore } from './signalStore';
import { useCrisisStore } from './crisisStore';
import { useResourceStore } from './resourceStore';
import { useTraceStore } from './traceStore';
import { useSessionStore } from './sessionStore';

describe('session store integration', () => {
  afterEach(() => {
    useSessionStore.getState().reset();
    useSignalStore.getState().reset();
    useCrisisStore.getState().reset();
    useResourceStore.getState().reset();
    useTraceStore.getState().reset();
  });

  it('starts a live dispatch session and ticks signals and incidents into the app stores', () => {
    const session = useSessionStore.getState();

    session.start('lahore');
    expect(useResourceStore.getState().resources.length).toBeGreaterThanOrEqual(6);
    expect(useSignalStore.getState().rawSignals.length).toBeGreaterThanOrEqual(8);
    expect(useTraceStore.getState().isRunning).toBe(true);

    useSessionStore.getState().tick(5);

    expect(useSignalStore.getState().signals.length).toBeGreaterThanOrEqual(5);
    expect(useCrisisStore.getState().crises.length).toBeGreaterThanOrEqual(1);
    expect(useSessionStore.getState().traceEvents.length).toBeGreaterThanOrEqual(1);
  });

  it('tracks P00 runtime status without changing the live dispatch defaults', () => {
    const session = useSessionStore.getState();

    expect(session.p00Status).toBe('idle');
    expect(session.p00LastUpdatedAt).toBeNull();
    expect(session.p00ErrorState).toBeNull();

    session.setP00Status('ready', '2026-05-18T08:00:00.000Z');
    expect(useSessionStore.getState().p00Status).toBe('ready');
    expect(useSessionStore.getState().p00LastUpdatedAt).toBe('2026-05-18T08:00:00.000Z');

    session.setP00ErrorState('backend unavailable');
    expect(useSessionStore.getState().p00Status).toBe('error');
    expect(useSessionStore.getState().p00ErrorState).toBe('backend unavailable');

    useSessionStore.getState().reset();
    expect(useSessionStore.getState().p00Status).toBe('idle');
    expect(useSessionStore.getState().p00ErrorState).toBeNull();
  });

  it('tracks P02 runtime status without changing the live dispatch defaults', () => {
    const session = useSessionStore.getState();

    expect(session.p02Status).toBe('idle');
    expect(session.p02LastUpdatedAt).toBeNull();
    expect(session.p02ErrorState).toBeNull();

    session.setP02Status('ready', '2026-05-19T08:00:00.000Z');
    expect(useSessionStore.getState().p02Status).toBe('ready');
    expect(useSessionStore.getState().p02LastUpdatedAt).toBe('2026-05-19T08:00:00.000Z');

    session.setP02ErrorState('display backend unavailable');
    expect(useSessionStore.getState().p02Status).toBe('error');
    expect(useSessionStore.getState().p02ErrorState).toBe('display backend unavailable');

    useSessionStore.getState().reset();
    expect(useSessionStore.getState().p02Status).toBe('idle');
    expect(useSessionStore.getState().p02ErrorState).toBeNull();
  });
});
