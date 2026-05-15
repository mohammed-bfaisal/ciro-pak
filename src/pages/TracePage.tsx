import { PipelineTimeline } from '../components/trace/PipelineTimeline';
import { TerminalLog } from '../components/trace/TerminalLog';
import { colors } from '../constants/colors';
import { useTraceStore } from '../store/traceStore';

export function TracePage() {
  const workplan = useTraceStore((s) => s.workplan);

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: colors.void }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: colors.borderDefault }}>
        <h1 className="font-display text-xl" style={{ color: colors.textPrimary }}>Agent Trace</h1>
        {workplan && (
          <p className="text-xs mt-1" style={{ color: colors.textDim }}>
            Session: {workplan.sessionId} • {workplan.city.toUpperCase()}
          </p>
        )}
      </div>

      {/* Pipeline timeline */}
      <div className="border-b" style={{ borderColor: colors.borderDefault }}>
        <PipelineTimeline />
      </div>

      {/* Terminal log */}
      <div className="flex-1 overflow-hidden">
        <TerminalLog />
      </div>
    </div>
  );
}
