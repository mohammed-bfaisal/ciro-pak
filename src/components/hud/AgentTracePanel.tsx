import { useState } from 'react';
import { BrainCircuit, ChevronDown, ChevronUp } from 'lucide-react';
import { useSessionStore } from '../../store/sessionStore';
import { colors } from '../../constants/colors';
import type { AgentTraceEvent } from '../../types';

export function AgentTracePanel() {
  const [collapsed, setCollapsed] = useState(false);
  const traceEvents = useSessionStore((s) => s.traceEvents);

  if (traceEvents.length === 0) return null;

  const latest = traceEvents.slice(-6).reverse();

  return (
    <div
      className="hidden desktop:block absolute z-20 rounded-xl overflow-hidden"
      style={{
        top: 172,
        right: 12,
        width: 300,
        maxHeight: collapsed ? 42 : 330,
        background: 'rgba(17,17,17,0.92)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${colors.borderDefault}`,
        transition: 'max-height 0.2s ease',
      }}
    >
      <button
        onClick={() => setCollapsed((value) => !value)}
        className="w-full flex items-center justify-between px-3 py-2.5"
        style={{ color: colors.textPrimary }}
      >
        <span className="flex items-center gap-2 text-xs font-semibold tracking-wide">
          <BrainCircuit size={14} style={{ color: colors.amber }} />
          AGENT TRACE
        </span>
        {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {!collapsed && (
        <div className="px-3 pb-3 space-y-2 overflow-y-auto hide-scrollbar" style={{ maxHeight: 284 }}>
          {latest.map((event) => (
            <div key={event.id} className="rounded-lg border p-2" style={{ borderColor: colors.borderSubtle, background: colors.raised }}>
              <div className="text-[10px] font-semibold mb-1" style={{ color: colors.amber }}>
                {event.phase}
              </div>
              <TraceReasoningFields event={event} />
              <TraceLine label="Observation" value={event.observation} />
              <TraceLine label="Inference" value={event.inference} />
              <TraceLine label="Decision" value={event.decision} />
              <TraceLine label="Execution" value={event.execution} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TraceReasoningFields({ event }: { event: AgentTraceEvent }) {
  const hasScore = typeof event.deterministicScore === 'number';
  const hasReasoning = Boolean(event.aiReasoning);

  if (!hasScore && !hasReasoning) return null;

  return (
    <div className="mb-2 grid grid-cols-1 desktop:grid-cols-2 gap-1.5 text-[10px] leading-snug">
      {hasScore && (
        <div className="rounded-md px-2 py-1" style={{ background: 'rgba(245,158,11,0.10)', border: `1px solid ${colors.borderSubtle}` }}>
          <div className="font-semibold" style={{ color: colors.textDim }}>Deterministic Score</div>
          <div style={{ color: colors.textPrimary }}>{event.deterministicScore?.toFixed(2)}</div>
        </div>
      )}
      {hasReasoning && (
        <div className="rounded-md px-2 py-1" style={{ background: 'rgba(59,130,246,0.10)', border: `1px solid ${colors.borderSubtle}` }}>
          <div className="font-semibold" style={{ color: colors.textDim }}>AI Reasoning</div>
          <div style={{ color: colors.textSecondary }}>{event.aiReasoning}</div>
        </div>
      )}
    </div>
  );
}

function TraceLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-[10px] leading-snug mb-1" style={{ color: colors.textSecondary }}>
      <span className="font-semibold" style={{ color: colors.textDim }}>{label}: </span>
      {value}
    </div>
  );
}
