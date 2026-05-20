import { afterEach, describe, expect, it } from 'vitest';
import { useCrisisStore } from '../store/crisisStore';
import { useLiveDataStore } from '../store/liveDataStore';
import { useResourceStore } from '../store/resourceStore';
import { useSessionStore } from '../store/sessionStore';
import { useSignalStore } from '../store/signalStore';
import { useTraceStore } from '../store/traceStore';
import { ensureDashboardCityState, resetDashboardRun } from './dashboardRunState';

describe('dashboard run state', () => {
  afterEach(() => {
    resetAllStores();
  });

  it('preserves an existing run when the dashboard remounts for the same city', () => {
    useSessionStore.getState().start('karachi');
    useSessionStore.getState().tick(6);
    useResourceStore.setState({ simulationRunning: true, isPaused: false });
    useTraceStore.getState().log('keep this trace line');

    const beforeLive = useSessionStore.getState().live;
    const beforeSignals = useSignalStore.getState().signals.length;
    const beforeCrises = useCrisisStore.getState().crises.length;
    const beforeLogs = useTraceStore.getState().logs.length;

    ensureDashboardCityState('karachi', null);

    expect(useSessionStore.getState().live).toBe(beforeLive);
    expect(useSignalStore.getState().signals.length).toBe(beforeSignals);
    expect(useCrisisStore.getState().crises.length).toBe(beforeCrises);
    expect(useTraceStore.getState().logs.length).toBe(beforeLogs);
    expect(useResourceStore.getState().simulationRunning).toBe(true);
  });

  it('clears a run only when reset is requested explicitly', () => {
    useSessionStore.getState().start('islamabad');
    useSessionStore.getState().tick(6);
    useResourceStore.setState({
      simulationRunning: true,
      isPaused: true,
      dispatchMode: 'manual',
      selectedUnitId: 'unit-1',
    });
    useTraceStore.getState().log('clear this trace line');
    useLiveDataStore.getState().setTrafficDisabled();

    resetDashboardRun('islamabad');

    expect(useSessionStore.getState().live).toBeNull();
    expect(useSignalStore.getState().signals).toEqual([]);
    expect(useCrisisStore.getState().crises).toEqual([]);
    expect(useTraceStore.getState().logs).toEqual([]);
    expect(useLiveDataStore.getState().trafficStatus.state).toBe('idle');
    expect(useResourceStore.getState().simulationRunning).toBe(false);
    expect(useResourceStore.getState().isPaused).toBe(false);
    expect(useResourceStore.getState().dispatchMode).toBe('off');
    expect(useResourceStore.getState().selectedUnitId).toBeNull();
    expect(useResourceStore.getState().resources.length).toBeGreaterThan(0);
  });
});

function resetAllStores() {
  useSessionStore.getState().reset();
  useSignalStore.getState().reset();
  useCrisisStore.getState().reset();
  useLiveDataStore.getState().reset();
  useResourceStore.getState().reset();
  useTraceStore.getState().reset();
}
