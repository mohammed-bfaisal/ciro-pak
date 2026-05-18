import { afterEach, describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { Shell } from './Shell';
import { useSettingsStore } from '../../store/settingsStore';

describe('Shell P01 language runtime', () => {
  afterEach(() => {
    useSettingsStore.getState().resetP01Settings();
  });

  it('preserves left-to-right English runtime attributes by default', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <Shell><div>content</div></Shell>
      </MemoryRouter>,
    );

    expect(html).toContain('dir="ltr"');
    expect(html).toContain('lang="en"');
    expect(html).toContain('data-ciro-locale="english"');
  });

});
