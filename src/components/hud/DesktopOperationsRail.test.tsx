import { afterEach, describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { DesktopOperationsRail } from './DesktopOperationsRail';
import { useCrisisStore } from '../../store/crisisStore';
import { useResourceStore } from '../../store/resourceStore';
import { useSessionStore } from '../../store/sessionStore';
import { useSignalStore } from '../../store/signalStore';
import { useTraceStore } from '../../store/traceStore';

describe('DesktopOperationsRail', () => {
  afterEach(() => {
    useSessionStore.getState().reset();
    useSignalStore.getState().reset();
    useCrisisStore.getState().reset();
    useResourceStore.getState().reset();
    useTraceStore.getState().reset();
  });

  it('renders one consolidated desktop command surface', () => {
    useSessionStore.getState().start('karachi');
    useSessionStore.getState().tick(6);

    const html = renderToStaticMarkup(
      <DesktopOperationsRail onSelectCrisis={() => undefined} />,
    );

    expect(html).toContain('Operations');
    expect(html).toContain('Simulate');
    expect(html).toContain('Manual');
    expect(html).toContain('AI Dispatch');
    expect(html).toContain('Units');
    expect(html).toContain('Incidents');
    expect(html).toContain('Trace');
    expect(html).toContain('Impact');
    expect(html).toContain('1x');
    expect(html).toContain('20x');
  });
});
