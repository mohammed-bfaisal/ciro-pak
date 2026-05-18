import { describe, expect, it } from 'vitest';
import { getBackendBaseUrl } from './backendConfig';

describe('backend config', () => {
  it('normalizes a hosted backend base URL and removes trailing slashes', () => {
    expect(getBackendBaseUrl({
      rawBaseUrl: 'https://ciro-api.example.com/',
      isNativePlatform: false,
    })).toBe('https://ciro-api.example.com');
  });

  it('returns null for an empty backend base URL', () => {
    expect(getBackendBaseUrl({ rawBaseUrl: '', isNativePlatform: false })).toBeNull();
  });

  it('rejects localhost and insecure origins for native APK runtime', () => {
    expect(getBackendBaseUrl({
      rawBaseUrl: 'http://localhost:8787',
      isNativePlatform: true,
    })).toBeNull();
    expect(getBackendBaseUrl({
      rawBaseUrl: 'http://api.example.com',
      isNativePlatform: true,
    })).toBeNull();
  });
});
