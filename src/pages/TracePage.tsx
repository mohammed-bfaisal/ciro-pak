import { PipelineTimeline } from '../components/trace/PipelineTimeline';
import { TerminalLog } from '../components/trace/TerminalLog';
import { colors } from '../constants/colors';
import { useTraceStore } from '../store/traceStore';
import type { Workplan } from '../types';

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
      {workplan && <TraceSummaryFooter workplan={workplan} />}
    </div>
  );
}

export function TraceSummaryFooter({ workplan }: { workplan: Workplan }) {
  const summary = workplan.summary;
  const sessionTotalMs = summary.totalLatencyMs || workplan.phases.reduce((total, phase) => total + (phase.durationMs ?? 0), 0);
  const averageLatencyMs = summary.actionsExecuted > 0
    ? Math.round(summary.totalLatencyMs / summary.actionsExecuted)
    : 0;

  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t px-4 py-2 text-[11px]"
      style={{ borderColor: colors.borderDefault, color: colors.textSecondary, background: colors.base }}
    >
      <span style={{ color: colors.textPrimary }}>Session total: {formatDuration(sessionTotalMs)}</span>
      <span>|</span>
      <span>{summary.actionsExecuted} actions</span>
      <span>|</span>
      <span>{summary.actionsRecovered} recovered</span>
      <span>|</span>
      <span>Est. cost: PKR ~{formatNumber(summary.totalCostPKR)}</span>
      <span>|</span>
      <span>Avg latency: {averageLatencyMs}ms/action</span>
    </div>
  );
}

function formatDuration(ms: number) {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

function formatNumber(value: number) {
  return Math.round(value).toLocaleString('en-PK');
}
