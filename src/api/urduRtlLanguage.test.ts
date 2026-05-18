import { describe, expect, it, vi } from 'vitest';
import { checkUrduRtlLanguageStatus, simulateUrduRtlLanguage } from './urduRtlLanguage';

describe('Urdu RTL language API client', () => {
  it('uses the hosted backend status route when a safe base URL is configured', async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        status: 'ready',
        checkedAt: '2026-05-18T08:00:00.000Z',
        backendReachable: true,
        mobileParity: true,
        activeMode: 'urdu',
        direction: 'rtl',
        message: 'Language backend ready',
      }),
    })) as unknown as typeof fetch;

    const result = await checkUrduRtlLanguageStatus({
      baseUrl: 'https://ciro-api.example.com',
      fetcher,
      now: () => new Date('2026-05-18T08:00:00.000Z'),
    });

    expect(fetcher).toHaveBeenCalledWith(
      'https://ciro-api.example.com/api/urdu-rtl-language-foundation/status',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result.status).toBe('ready');
    expect(result.direction).toBe('rtl');
  });

  it('falls back without calling fetch when no backend base URL is configured', async () => {
    const fetcher = vi.fn() as unknown as typeof fetch;

    const result = await checkUrduRtlLanguageStatus({
      baseUrl: null,
      fetcher,
      now: () => new Date('2026-05-18T08:00:00.000Z'),
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

    const result = await simulateUrduRtlLanguage({
      baseUrl: 'https://ciro-api.example.com',
      fetcher,
      now: () => new Date('2026-05-18T08:00:00.000Z'),
      request: {
        city: 'lahore',
        requestedAt: '2026-05-18T08:00:00.000Z',
        source: 'settings',
        mode: 'urdu',
      },
    });

    expect(fetcher).toHaveBeenCalledWith(
      'https://ciro-api.example.com/api/urdu-rtl-language-foundation/simulate',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result.status).toBe('fallback');
    expect(result.events).toContain('Applied Urdu right-to-left runtime attributes');
  });

  it('keeps the requested language mode when a simulate request falls back offline', async () => {
    const result = await simulateUrduRtlLanguage({
      baseUrl: null,
      now: () => new Date('2026-05-18T08:00:00.000Z'),
      request: {
        city: 'lahore',
        requestedAt: '2026-05-18T08:00:00.000Z',
        source: 'settings',
        mode: 'english',
      },
    });

    expect(result.activeMode).toBe('english');
    expect(result.direction).toBe('ltr');
  });
});
