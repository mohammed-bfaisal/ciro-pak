import { describe, expect, it, vi } from 'vitest';
import { checkDisplayAccessibilityStatus, simulateDisplayAccessibilitySettings } from './displayAccessibility';

describe('display accessibility API client', () => {
  it('uses the hosted backend status route when a safe base URL is configured', async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        status: 'ready',
        checkedAt: '2026-05-19T08:00:00.000Z',
        backendReachable: true,
        mobileParity: true,
        message: 'Display settings backend ready',
      }),
    })) as unknown as typeof fetch;

    const result = await checkDisplayAccessibilityStatus({
      baseUrl: 'https://ciro-api.example.com',
      fetcher,
      now: () => new Date('2026-05-19T08:00:00.000Z'),
    });

    expect(fetcher).toHaveBeenCalledWith(
      'https://ciro-api.example.com/api/display-accessibility-settings/status',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result.status).toBe('ready');
    expect(result.backendReachable).toBe(true);
  });

  it('falls back when no backend base URL is configured', async () => {
    const fetcher = vi.fn() as unknown as typeof fetch;

    const result = await checkDisplayAccessibilityStatus({
      baseUrl: null,
      fetcher,
      now: () => new Date('2026-05-19T08:00:00.000Z'),
    });

    expect(fetcher).not.toHaveBeenCalled();
    expect(result.status).toBe('fallback');
    expect(result.backendReachable).toBe(false);
  });

  it('posts a simulate request through the backend or falls back safely', async () => {
    const fetcher = vi.fn(async () => ({
      ok: false,
      json: async () => ({}),
    })) as unknown as typeof fetch;

    const result = await simulateDisplayAccessibilitySettings({
      baseUrl: 'https://ciro-api.example.com',
      fetcher,
      now: () => new Date('2026-05-19T08:00:00.000Z'),
      request: {
        city: 'karachi',
        requestedAt: '2026-05-19T08:00:00.000Z',
        source: 'settings',
      },
    });

    expect(fetcher).toHaveBeenCalledWith(
      'https://ciro-api.example.com/api/display-accessibility-settings/simulate',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result.status).toBe('fallback');
    expect(result.events).toContain('Applied larger text display preset');
  });
});
