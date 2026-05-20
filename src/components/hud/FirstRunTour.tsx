import { useState } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { colors } from '../../constants/colors';

const STORAGE_KEY = 'ciro.tour.v1.done';

const STEPS = [
  {
    title: 'Welcome to CIRO',
    body: 'CIRO is a multi-agent crisis-response platform for Pakistan. It fuses signals from multiple sources, scores their credibility, and dispatches resources intelligently.',
  },
  {
    title: 'Simulate a Session',
    body: 'Press S (or the Simulate button) to start the live shift clock. Signals stream in, crises are detected automatically, and CIRO tracks every decision.',
  },
  {
    title: 'AI Dispatch',
    body: 'Press D (or AI Dispatch) to let the agent allocate resources. It weighs severity, confidence, ETA, and resource type — all explained in the Trace tab.',
  },
  {
    title: 'Signal Feed',
    body: 'Click Signals (top-left) to see incoming reports. Flagged signals have low credibility or conflict with other sources — they\'re down-weighted automatically.',
  },
  {
    title: 'Map Controls',
    body: 'Yellow dashed lines are active routes with km labels. Signal pins pulse red if flagged. Click a vehicle for its allocation reasoning. Press Escape to close panels.',
  },
  {
    title: 'Agent Trace',
    body: 'The Trace page shows every pipeline phase, timing, AI reasoning per action, and a JSON export. Replay lets you re-watch logs at 80ms per line.',
  },
];

function safeLocalStorage(key: string): boolean {
  try { return localStorage.getItem(key) === 'true'; } catch { return false; }
}
function safeSetLocalStorage(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* noop */ }
}

export function FirstRunTour() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(() => !safeLocalStorage(STORAGE_KEY));

  const dismiss = () => {
    safeSetLocalStorage(STORAGE_KEY, 'true');
    setVisible(false);
  };

  if (!visible) return null;

  const current = STEPS[step];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div
        className="relative w-[90vw] max-w-sm rounded-2xl border p-6"
        style={{
          background: colors.raised,
          borderColor: colors.borderAmber,
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
      >
        <button
          onClick={dismiss}
          className="absolute top-4 right-4"
          style={{ color: colors.textDim }}
        >
          <X size={18} />
        </button>

        <div className="mb-1 flex gap-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full"
              style={{ background: i <= step ? colors.amber : colors.overlay2 }}
            />
          ))}
        </div>

        <h2 className="mt-4 text-base font-bold" style={{ color: colors.amber }}>{current.title}</h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: colors.textSecondary }}>{current.body}</p>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg"
            style={{ color: step === 0 ? colors.textDim : colors.textPrimary, background: colors.overlay }}
          >
            <ChevronLeft size={14} /> Back
          </button>

          <span className="text-[11px]" style={{ color: colors.textDim }}>
            {step + 1} / {STEPS.length}
          </span>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg font-semibold"
              style={{ background: colors.amber, color: colors.void }}
            >
              Next <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={dismiss}
              className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg font-semibold"
              style={{ background: colors.amber, color: colors.void }}
            >
              Get started
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
