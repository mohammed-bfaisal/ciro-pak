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
});
