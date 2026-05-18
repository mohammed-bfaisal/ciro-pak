import { Capacitor } from '@capacitor/core';

interface BackendBaseUrlOptions {
  rawBaseUrl?: string;
  isNativePlatform?: boolean;
}

export function getBackendBaseUrl(options: BackendBaseUrlOptions = {}): string | null {
  const raw = options.rawBaseUrl ?? import.meta.env.VITE_CIRO_API_BASE_URL ?? '';
  const trimmed = raw.trim().replace(/\/+$/, '');
  if (!trimmed) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  const native = options.isNativePlatform ?? Capacitor.isNativePlatform();
  if (native && parsed.protocol !== 'https:') return null;
  if (native && ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname)) return null;

  return parsed.toString().replace(/\/+$/, '');
}
