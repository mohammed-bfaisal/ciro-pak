import { afterEach, describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MobileOperationsDock } from './MobileOperationsDock';
import { useCrisisStore } from '../../store/crisisStore';
import { useResourceStore } from '../../store/resourceStore';
import { useSessionStore } from '../../store/sessionStore';
import { useSignalStore } from '../../store/signalStore';
import { useTraceStore } from '../../store/traceStore';

describe('MobileOperationsDock', () => {
  afterEach(() => {
    useSessionStore.getState().reset();
    useSignalStore.getState().reset();
    useCrisisStore.getState().reset();
    useResourceStore.getState().reset();
    useTraceStore.getState().reset();
  });

  it('renders one compact APK command surface with units, incidents, trace, impact, and speed controls', () => {
    useSessionStore.getState().start('lahore');
    useSessionStore.getState().tick(6);
    useSessionStore.getState().addImpactSnapshots([
      {
        actionId: 'impact-1',
        crisisId: 'lhr-c1',
        beforeState: { congestion: 'critical' },
        afterState: { congestion: 'reduced' },
        sideEffects: ['fallback ready'],
      },
    ]);

    const html = renderToStaticMarkup(
      <MobileOperationsDock
        showSignals={false}
        onToggleSignals={() => undefined}
        onSelectCrisis={() => undefined}
      />,
    );

    expect(html).toContain('OPS DOCK');
    expect(html).toContain('Units');
    expect(html).toContain('Incidents');
    expect(html).toContain('Trace');
    expect(html).toContain('Impact');
    expect(html).toContain('1x');
    expect(html).toContain('2x');
    expect(html).toContain('4x');
    expect(html).toContain('handled');
  });
});
