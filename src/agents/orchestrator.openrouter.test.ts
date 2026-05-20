import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getCityData } from '../data/cityData';
import { useCrisisStore } from '../store/crisisStore';
import { useResourceStore } from '../store/resourceStore';
import { useSessionStore } from '../store/sessionStore';
import { useSignalStore } from '../store/signalStore';
import { useTraceStore } from '../store/traceStore';
import { chatWithOpenRouter } from '../api/openRouter';
import { fetchRoute } from '../api/routing';
import { runAIDispatch } from './orchestrator';

vi.mock('../api/openRouter', () => ({
  chatWithOpenRouter: vi.fn(),
}));

vi.mock('../api/routing', () => ({
  fetchRoute: vi.fn(),
}));

describe('runAIDispatch OpenRouter integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    const cityData = getCityData('karachi');
    useTraceStore.getState().startSession('karachi');
    cityData.crises.forEach((crisis) => useCrisisStore.getState().addCrisis(crisis));
    useResourceStore.getState().setResources(cityData.resources);
    vi.mocked(fetchRoute).mockResolvedValue({
      coords: [
        [67.0011, 24.8607],
        [67.0211, 24.8707],
      ],
      etaSeconds: 600,
      etaMinutes: 10,
      distanceMeters: 2400,
      provider: 'tomtom',
      trafficDelaySeconds: 90,
      freeFlowEtaSeconds: 510,
      trafficUpdatedAt: '2026-05-20T12:00:00.000Z',
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    useSessionStore.getState().reset();
    useSignalStore.getState().reset();
    useCrisisStore.getState().reset();
    useResourceStore.getState().reset();
    useTraceStore.getState().reset();
  });

  it('requests a backend AI dispatch briefing before executing deterministic allocations', async () => {
    vi.mocked(chatWithOpenRouter).mockResolvedValue({
      provider: 'openrouter',
      model: 'mistralai/mistral-nemo',
      content: 'Prioritise Lyari rescue boats and ambulance access around the river breach.',
    });

    const dispatch = runAIDispatch('karachi');
    await vi.runAllTimersAsync();
    await dispatch;

    expect(chatWithOpenRouter).toHaveBeenCalledOnce();
    expect(vi.mocked(chatWithOpenRouter).mock.calls[0]?.[0].prompt).toContain('Karachi');
    expect(vi.mocked(chatWithOpenRouter).mock.calls[0]?.[0].prompt).toContain('active crises');
    expect(useTraceStore.getState().logs.some((log) => log.includes('OpenRouter dispatch briefing'))).toBe(true);
    expect(useResourceStore.getState().resources.some((resource) => resource.status === 'en_route')).toBe(true);
  });
});
