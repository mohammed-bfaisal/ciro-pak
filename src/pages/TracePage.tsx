import { Download } from 'lucide-react';
import { PipelineTimeline } from '../components/trace/PipelineTimeline';
import { TerminalLog } from '../components/trace/TerminalLog';
import { TracePhaseDurationChart } from '../components/trace/TracePhaseDurationChart';
import { colors } from '../constants/colors';
import { useTraceStore } from '../store/traceStore';
import type { Workplan } from '../types';
import { downloadTraceJson } from '../utils/traceExport';

export function TracePage() {
  const workplan = useTraceStore((s) => s.workplan);

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: colors.void }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: colors.borderDefault }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl" style={{ color: colors.textPrimary }}>Agent Trace</h1>
            {workplan && (
              <p className="text-xs mt-1" style={{ color: colors.textDim }}>
                Session: {workplan.sessionId} | {workplan.city.toUpperCase()}
              </p>
            )}
          </div>
          {workplan && (
            <button
              type="button"
              onClick={() => downloadTraceJson(workplan)}
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold"
              style={{ borderColor: colors.borderStrong, color: colors.textPrimary, background: colors.raised }}
            >
              <Download size={14} />
              Copy trace as JSON
            </button>
          )}
        </div>
      </div>

      <div className="border-b" style={{ borderColor: colors.borderDefault }}>
        <PipelineTimeline />
      </div>
      {workplan && <TracePhaseDurationChart workplan={workplan} />}

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
