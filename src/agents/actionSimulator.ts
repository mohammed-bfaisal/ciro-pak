import type { Crisis, Action, City, ResourceAllocation } from '../types';
import { SCENARIO_REGISTRY } from '../data/mock';
import { useTraceStore } from '../store/traceStore';

// Action IDs that demonstrate error recovery — the simulator adds extra terminal drama for these
const ERROR_RECOVERY_ACTION_IDS = new Set(['a7', 'isb-a7', 'fsd-a4', 'qta-a2']);

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function actionSimulatorAgent(
  crises: Crisis[],
  _allocations: ResourceAllocation[],
  trace: { log: (msg: string) => void },
  city: City
): Promise<Action[]> {
  const actions = SCENARIO_REGISTRY[city].getActions();

  for (const action of actions) {
    if (action.trace[0]) {
      useTraceStore.getState().setActiveTraceStep(action.trace[0]);
    }
    trace.log(`▸ Executing: ${action.title}`);

    if (ERROR_RECOVERY_ACTION_IDS.has(action.id)) {
      trace.log(`  ⚡ Calling ${action.trace[0]?.toolCalled ?? 'api'}...`);
      await delay(400);
      trace.log(`  ✗ HTTP 503 Service Unavailable`);
      await delay(500);
      trace.log(`  ↻ Retrying with 500ms backoff...`);
      await delay(500);
      trace.log(`  ✗ HTTP 503 again — API unstable during emergency`);
      await delay(300);
      trace.log(`  ↪ Fallback: Loading cached configuration...`);
      await delay(300);
      trace.log(`  ✓ Cached fallback loaded — recovery successful`);
      trace.log(`  ⚠ Status: RECOVERED (flagged for post-incident review)`);
    } else if (action.status === 'completed') {
      await delay(250);
      trace.log(`  ✓ ${action.result ?? 'Completed successfully'}`);
    }

    const crisis = crises.find((c) => c.id === action.crisisId);
    if (crisis) {
      crisis.actions = [...(crisis.actions || []), action];
    }
  }

  return actions;
}
