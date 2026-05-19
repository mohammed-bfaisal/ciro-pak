import { afterEach, describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SettingsPage } from './SettingsPage';
import { useSettingsStore } from '../store/settingsStore';
import { useSessionStore } from '../store/sessionStore';

describe('SettingsPage', () => {
  afterEach(() => {
    useSettingsStore.getState().resetP00Settings();
    useSettingsStore.getState().resetP02Settings();
    useSessionStore.getState().reset();
  });

  it('renders P00 foundation settings without sensitive credential fields', () => {
    useSessionStore.getState().setP00Status('fallback', '2026-05-18T08:00:00.000Z');

    const html = renderToStaticMarkup(<SettingsPage />);

    expect(html).toContain('Foundation Settings');
    expect(html).toContain('Backend Contracts');
    expect(html).toContain('Mobile parity');
    expect(html).toContain('Bundled fallback');
    expect(html).not.toMatch(/api key/i);
    expect(html).not.toMatch(/secret/i);
    expect(html).not.toMatch(/token/i);
  });

  it('renders P02 display accessibility settings without sensitive credential fields', () => {
    useSessionStore.getState().setP02Status('fallback', '2026-05-19T08:00:00.000Z');
    useSettingsStore.getState().setP02Enabled(true);

    const html = renderToStaticMarkup(<SettingsPage />);

    expect(html).toContain('Display Accessibility');
    expect(html).toContain('Larger text');
    expect(html).toContain('Colorblind-safe');
    expect(html).toContain('Text density');
    expect(html).not.toMatch(/api key/i);
    expect(html).not.toMatch(/secret/i);
    expect(html).not.toMatch(/token/i);
  });
});
