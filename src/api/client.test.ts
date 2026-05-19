import { describe, expect, it, vi } from 'vitest';
import { apiFetch, apiUrl, BackendNotConfiguredError, getConfiguredApiBaseUrl } from './client';

describe('backend API client', () => {
  it('normalizes configured backend base URLs', () => {
    expect(getConfiguredApiBaseUrl('https://example.com///')).toBe('https://example.com');
    expect(getConfiguredApiBaseUrl('   ')).toBeNull();
  });

  it('builds backend URLs only when a base URL is configured', () => {
    expect(apiUrl('/api/health', 'https://example.com')).toBe('https://example.com/api/health');
    expect(() => apiUrl('/api/health', null)).toThrow(BackendNotConfiguredError);
  });

  it('uses a bound default fetch receiver through injected fetch compatibility', async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      json: async () => ({ status: 'ok' }),
    })) as unknown as typeof fetch;

    const result = await apiFetch<{ status: string }>('/api/health', {}, {
      baseUrl: 'https://example.com',
      fetcher,
    });

    expect(result.status).toBe('ok');
    expect(fetcher).toHaveBeenCalledWith('https://example.com/api/health', {});
  });
});
