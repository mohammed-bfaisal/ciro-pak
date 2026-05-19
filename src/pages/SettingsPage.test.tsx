import { afterEach, describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SettingsPage } from './SettingsPage';
import { useSettingsStore } from '../store/settingsStore';
import { useSessionStore } from '../store/sessionStore';

describe('SettingsPage', () => {
  afterEach(() => {
    useSettingsStore.getState().resetP00Settings();
    useSettingsStore.getState().resetP01Settings();
    useSettingsStore.getState().resetP04Settings();
    useSessionStore.getState().reset();
  });

  it('renders P00 foundation settings without sensitive credential fields', () => {
    useSessionStore.getState().setP00Status('fallback', '2026-05-18T08:00:00.000Z');
    useSessionStore.getState().setP01Status('fallback', '2026-05-18T08:00:00.000Z');

    const html = renderToStaticMarkup(<SettingsPage />);

    expect(html).toContain('Foundation Settings');
    expect(html).toContain('Backend Contracts');
    expect(html).toContain('Mobile parity');
    expect(html).toContain('Bundled fallback');
    expect(html).toContain('Urdu &amp; RTL Language');
    expect(html).toContain('Roman Urdu');
    expect(html).toContain('dir=&quot;rtl&quot;');
    expect(html).toContain('اردو');
    expect(html).toContain('Triggered Mission Briefing');
    expect(html).toContain('Simulate briefing');
    expect(html).toContain('Mission briefing enabled');
    expect(html).not.toMatch(/api key/i);
    expect(html).not.toMatch(/secret/i);
    expect(html).not.toMatch(/token/i);
  });
});
