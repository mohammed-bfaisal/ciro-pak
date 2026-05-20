import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp, Share2 } from 'lucide-react';
import { useState } from 'react';
import { Share } from '@capacitor/share';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as RTooltip } from 'recharts';
import { useCrisisStore } from '../../store/crisisStore';
import { useSignalStore } from '../../store/signalStore';
import { useResourceStore } from '../../store/resourceStore';
import { Badge } from '../ui/Badge';
import { SeverityGauge } from '../charts/SeverityGauge';
import { SourceDonut } from '../charts/SourceDonut';
import { ConfidenceSparkline } from '../charts/ConfidenceSparkline';
import { ResourceBarChart } from '../charts/ResourceBar';
import { SignalCard } from '../cards/SignalCard';
import { colors, getCrisisColor } from '../../constants/colors';
import { capitalize, formatCurrency } from '../../utils/formatting';

interface CrisisPanelProps {
  crisisId: string | null;
  onClose: () => void;
}

export function CrisisPanel({ crisisId, onClose }: CrisisPanelProps) {
  const crisis = useCrisisStore((s) => s.crises.find((c) => c.id === crisisId));
  const signals = useSignalStore((s) => s.fusedSignals.length > 0 ? s.fusedSignals : s.signals);
  const resources = useResourceStore((s) => s.resources);
  const [activeTab, setActiveTab] = useState('overview');
  const [reasoningOpen, setReasoningOpen] = useState(false);

  if (!crisis) return null;

  const crisisSignals = signals.filter((s) => crisis.signalIds.includes(s.id));
  const crisisResources = resources.filter((r) => r.assignedCrisisId === crisis.id);
  const crisisColor = getCrisisColor(crisis.type);

  const shareIncident = async () => {
    const latestConf = crisis.confidenceHistory.at(-1)?.v ?? 0;
    const text = [
      `CIRO Incident Report`,
      `${crisis.title}`,
      `Type: ${crisis.type} | Severity: ${crisis.severity} | Status: ${crisis.status}`,
      `Signals: ${crisisSignals.length} | Resources: ${crisisResources.length}`,
      `Confidence: ${Math.round(latestConf * 100)}%`,
    ].join('\n');
    try {
      await Share.share({ title: crisis.title, text, dialogTitle: 'Share Incident' });
    } catch { /* cancelled or web */ }
  };

  const tabs = ['overview', 'signals', 'resources', 'actions', 'messages'];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-[var(--topbar-height)] right-0 bottom-0 z-30 border-l overflow-y-auto
                   mobile:top-auto mobile:left-0 mobile:right-0 mobile:bottom-[var(--bottomnav-height)] mobile:border-l-0 mobile:border-t mobile:rounded-t-2xl"
        style={{
          width: 'var(--panel-width)',
          background: 'rgba(17,17,17,0.95)',
          backdropFilter: 'blur(20px)',
          borderColor: colors.borderDefault,
        }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 p-4 border-b" style={{ background: 'rgba(17,17,17,0.95)', borderColor: colors.borderDefault }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full animate-pulse-dot" style={{ background: crisisColor }} />
              <span className="text-sm font-semibold">{capitalize(crisis.type)}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => void shareIncident()} className="p-1 rounded" style={{ color: colors.textDim }} aria-label="Share incident">
                <Share2 size={16} />
              </button>
              <button onClick={onClose} className="p-1 rounded" style={{ color: colors.textDim }}>
                <X size={18} />
              </button>
            </div>
          </div>
          <h2 className="text-base font-semibold mb-1">{crisis.title}</h2>
          <div className="flex gap-2">
            <Badge label={crisis.severity} variant="severity" severity={crisis.severity} />
            <Badge label={crisis.status} variant="status" />
            <Badge label={crisis.verificationStatus} variant="status" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b overflow-x-auto hide-scrollbar" style={{ borderColor: colors.borderDefault }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-3 py-2 text-xs font-medium capitalize whitespace-nowrap border-b-2 transition-colors"
              style={{
                borderColor: activeTab === tab ? colors.amber : 'transparent',
                color: activeTab === tab ? colors.amber : colors.textDim,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={crisisId}
            className="p-4"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center gap-1">
                  <SeverityGauge severity={crisis.severity} size={80} />
                  <span className="text-[10px]" style={{ color: colors.textDim }}>Severity</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ConfidenceSparkline history={crisis.confidenceHistory} width={90} height={50} />
                  <span className="text-[10px] mt-1" style={{ color: colors.textDim }}>Confidence</span>
                  {crisis.confidenceHistory.length >= 2 && (() => {
                    const h = crisis.confidenceHistory;
                    const latest = h[h.length - 1].v;
                    const prev = h[h.length - 2].v;
                    const delta = latest - prev;
                    const reason = delta > 0.1
                      ? 'Rose — new corroborating signals added'
                      : delta < -0.1
                      ? 'Fell — conflicting or low-credibility signals flagged'
                      : 'Stable — no significant new signal data';
                    return (
                      <span className="text-[9px] text-center leading-tight mt-0.5" style={{ color: colors.textDim }}>
                        {delta > 0 ? '↑' : delta < 0 ? '↓' : '→'} {reason}
                      </span>
                    );
                  })()}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center">
                  <SourceDonut signals={crisisSignals} size={100} />
                </div>
                <div className="flex flex-col items-center">
                  <ResourceBarChart resources={resources} height={90} />
                  <span className="text-[10px] mt-1" style={{ color: colors.textDim }}>Resources</span>
                </div>
              </div>

              {/* Agent reasoning */}
              <div className="rounded-lg border" style={{ borderColor: colors.borderDefault }}>
                <button
                  onClick={() => setReasoningOpen(!reasoningOpen)}
                  className="w-full flex items-center justify-between p-3 text-sm font-medium"
                  style={{ color: colors.amber }}
                >
                  <span>🧠 Agent Reasoning</span>
                  {reasoningOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {reasoningOpen && (
                  <div className="px-3 pb-3">
                    <pre className="text-[11px] leading-relaxed whitespace-pre-wrap font-mono" style={{ color: colors.textSecondary }}>
                      {crisis.agentReasoning}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'signals' && (
            <div className="space-y-2">
              {crisisSignals.length > 1 && (
                <div className="mb-3">
                  <div className="text-[10px] font-semibold mb-1" style={{ color: colors.textDim }}>Signal Arrival Timeline</div>
                  <div style={{ height: 56 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={crisisSignals
                          .slice()
                          .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
                          .map((s) => ({
                            t: new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            score: Math.round(s.credibilityScore * 100),
                          }))}
                        barSize={8}
                      >
                        <XAxis dataKey="t" tick={{ fontSize: 8, fill: colors.textDim }} axisLine={false} tickLine={false} />
                        <YAxis hide domain={[0, 100]} />
                        <RTooltip
                          contentStyle={{ background: colors.overlay, border: `1px solid ${colors.borderDefault}`, fontSize: 10 }}
                          formatter={(v) => [`${v}% credibility`]}
                        />
                        <Bar dataKey="score" fill={colors.amber} radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              {crisisSignals.map((s, i) => <SignalCard key={s.id} signal={s} index={i} />)}
              {crisis.conflictingSignalIds.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-xs font-semibold mb-2" style={{ color: colors.danger }}>⚠ Conflicting Signals</h4>
                  {signals.filter((s) => crisis.conflictingSignalIds.includes(s.id)).map((s, i) => (
                    <SignalCard key={s.id} signal={s} index={i} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-2">
              {crisisResources.length === 0 ? (
                <p className="text-sm" style={{ color: colors.textDim }}>No resources assigned yet</p>
              ) : (
                crisisResources.map((r) => (
                  <div key={r.id} className="p-2 rounded-lg border text-sm" style={{ borderColor: colors.borderDefault, background: colors.raised }}>
                    <div className="flex justify-between">
                      <span style={{ color: colors.textPrimary }}>{r.label}</span>
                      <Badge label={r.status} variant="status" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-3">
              {(crisis.actions || []).map((action) => (
                <div key={action.id} className="p-3 rounded-lg border" style={{ borderColor: colors.borderDefault, background: colors.raised }}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>{action.title}</span>
                    <Badge label={action.status} variant="status" />
                  </div>
                  <p className="text-xs mb-2" style={{ color: colors.textSecondary }}>{action.description}</p>
                  <div className="flex gap-3 text-[10px]" style={{ color: colors.textDim }}>
                    <span>{formatCurrency(action.costPKR)}</span>
                    <span>{action.latencyMs}ms</span>
                  </div>
                  {action.trace.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {action.trace.map((step) => (
                        <div key={step.step} className="text-[10px] font-mono py-0.5" style={{
                          color: step.toolResult?.includes('503') ? colors.danger :
                                 step.phase === 'Recovery' ? colors.warning :
                                 colors.textDim
                        }}>
                          [{step.phase}] {step.decision}
                          {step.toolResult && <span className="ml-1">→ {step.toolResult}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  {(Object.keys(action.beforeState).length > 0 || Object.keys(action.afterState).length > 0) && (
                    <div className="mt-2 rounded border overflow-hidden" style={{ borderColor: colors.borderSubtle }}>
                      <div className="grid grid-cols-2 divide-x text-[10px]" style={{ borderColor: colors.borderSubtle }}>
                        <div className="p-2" style={{ background: 'rgba(248,113,113,0.05)' }}>
                          <div className="font-semibold mb-1" style={{ color: colors.danger }}>Before</div>
                          {Object.entries(action.beforeState).map(([k, v]) => (
                            <div key={k} style={{ color: colors.textSecondary }}>{k}: <span style={{ color: colors.textDim }}>{String(v)}</span></div>
                          ))}
                        </div>
                        <div className="p-2" style={{ background: 'rgba(52,211,153,0.05)' }}>
                          <div className="font-semibold mb-1" style={{ color: colors.success }}>After</div>
                          {Object.entries(action.afterState).map(([k, v]) => (
                            <div key={k} style={{ color: colors.textSecondary }}>{k}: <span style={{ color: colors.success }}>{String(v)}</span></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-2">
              {(crisis.stakeholderMessages || []).map((msg, i) => (
                <div key={i} className="p-3 rounded-lg border" style={{
                  borderColor: msg.isRetraction ? 'rgba(248,113,113,0.3)' : colors.borderDefault,
                  background: msg.isRetraction ? 'rgba(248,113,113,0.05)' : colors.raised,
                }}>
                  <div className="flex justify-between mb-1">
                    <Badge label={msg.audience} variant="default" />
                    <Badge label={msg.status} variant="status" />
                  </div>
                  <h4 className="text-xs font-semibold mb-1" style={{ color: colors.textPrimary }}>{msg.subject}</h4>
                  <p className="text-[11px]" style={{ color: colors.textSecondary }}>{msg.body}</p>
                  {msg.isRetraction && (
                    <span className="inline-block mt-1 text-[10px] font-semibold" style={{ color: colors.danger }}>⚠ RETRACTION</span>
                  )}
                </div>
              ))}
            </div>
          )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
