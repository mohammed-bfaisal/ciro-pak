import { describe, expect, it, vi } from 'vitest';
import { checkMissionBriefingStatus, simulateMissionBriefing } from './missionBriefing';

describe('mission briefing API client', () => {
  it('uses the hosted backend status route when a safe base URL is configured', async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        status: 'ready',
        checkedAt: '2026-05-19T08:00:00.000Z',
        backendReachable: true,
        mobileParity: true,
        message: 'Mission briefing backend ready',
      }),
    })) as unknown as typeof fetch;

    const result = await checkMissionBriefingStatus({
      baseUrl: 'https://ciro-api.example.com',
      fetcher,
      now: () => new Date('2026-05-19T08:00:00.000Z'),
    });

    expect(fetcher).toHaveBeenCalledWith(
      'https://ciro-api.example.com/api/triggered-mission-briefing-panel/status',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result.status).toBe('ready');
    expect(result.backendReachable).toBe(true);
  });

  it('falls back without calling fetch when no backend base URL is configured', async () => {
    const fetcher = vi.fn() as unknown as typeof fetch;

    const result = await checkMissionBriefingStatus({
      baseUrl: null,
      fetcher,
      now: () => new Date('2026-05-19T08:00:00.000Z'),
    });

    expect(fetcher).not.toHaveBeenCalled();
    expect(result.status).toBe('fallback');
    expect(result.backendReachable).toBe(false);
  });

  it('posts the requested mission action through the backend or falls back safely', async () => {
    const fetcher = vi.fn(async () => ({
      ok: false,
      json: async () => ({}),
    })) as unknown as typeof fetch;

    const result = await simulateMissionBriefing({
      baseUrl: 'https://ciro-api.example.com',
      fetcher,
      now: () => new Date('2026-05-19T08:00:00.000Z'),
      request: {
        city: 'karachi',
        requestedAt: '2026-05-19T08:00:00.000Z',
        source: 'operator',
        action: 'simulate',
      },
    });

    expect(fetcher).toHaveBeenCalledWith(
      'https://ciro-api.example.com/api/triggered-mission-briefing-panel/simulate',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result.status).toBe('fallback');
    expect(result.events).toContain('Prepared operator briefing before simulation');
  });
});
