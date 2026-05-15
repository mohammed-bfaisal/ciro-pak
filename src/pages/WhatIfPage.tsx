import { useState } from 'react';
import { motion } from 'framer-motion';
import { colors } from '../constants/colors';
import { ToggleLeft, ToggleRight, RefreshCw, AlertTriangle } from 'lucide-react';

interface ScenarioVar {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  impact: string;
}

const defaultVars: ScenarioVar[] = [
  {
    id: 'field_reports',
    label: 'Field Reports Available',
    description: 'PDMA/NEPRA field verification reports',
    enabled: true,
    impact: 'Without field reports: confidence drops to 74%, crisis type may be misclassified',
  },
  {
    id: 'weather_api',
    label: 'Weather API Online',
    description: 'OpenWeatherMap real-time data',
    enabled: true,
    impact: 'Without weather: flood correlation weakened, rainfall context missing',
  },
  {
    id: 'traffic_data',
    label: 'Traffic Data Available',
    description: 'Real-time traffic speed data',
    enabled: true,
    impact: 'Without traffic: road flooding undetected, response routing suboptimal',
  },
  {
    id: 'social_media',
    label: 'Social Media Signals',
    description: 'Twitter/X, Facebook citizen reports',
    enabled: true,
    impact: 'Without social: early detection delayed by 30+ min (relies on field reports only)',
  },
  {
    id: 'cached_fallback',
    label: 'Cached Fallback Enabled',
    description: 'Local cache for API failures',
    enabled: true,
    impact: 'Without cache: Action a7 (traffic reroute) fails completely — no recovery possible',
  },
  {
    id: 'multi_crisis',
    label: 'Multiple Simultaneous Crises',
    description: 'Both flood + heatwave active',
    enabled: true,
    impact: 'Single crisis mode: all resources to one event, heatwave victims unserved',
  },
];

export function WhatIfPage() {
  const [vars, setVars] = useState(defaultVars);
  const [results, setResults] = useState<null | {
    confidence: number;
    detectionTime: string;
    resourceEfficiency: number;
    falseAlarmRate: number;
    actionsRecovered: number;
    notes: string[];
  }>(null);

  const toggleVar = (id: string) => {
    setVars((prev) => prev.map((v) => v.id === id ? { ...v, enabled: !v.enabled } : v));
    setResults(null);
  };

  const runSimulation = () => {
    const enabled = new Set(vars.filter((v) => v.enabled).map((v) => v.id));
    const notes: string[] = [];

    let confidence = 0.91;
    let detectionMin = 8;
    let resourceEff = 87;
    let falseAlarm = 8;
    let recoveries = 1;

    if (!enabled.has('field_reports')) {
      confidence -= 0.17;
      falseAlarm += 20;
      notes.push('⚠ No field verification — confidence dropped, false alarm rate increased');
      notes.push('Crisis type likely misclassified (general flood vs localised breach)');
    }
    if (!enabled.has('weather_api')) {
      confidence -= 0.06;
      notes.push('⚠ No weather corroboration — flood context missing');
    }
    if (!enabled.has('traffic_data')) {
      confidence -= 0.04;
      resourceEff -= 12;
      notes.push('⚠ No traffic data — road conditions unknown, routing suboptimal');
    }
    if (!enabled.has('social_media')) {
      detectionMin = 40;
      notes.push('⚠ No early warning — detection delayed to first field report arrival');
    }
    if (!enabled.has('cached_fallback')) {
      recoveries = 0;
      notes.push('✗ Action a7 FAILED — traffic reroute impossible without cached fallback');
    }
    if (!enabled.has('multi_crisis')) {
      resourceEff = 50;
      notes.push('⚠ Single crisis mode — heatwave victims receive NO resources');
    }

    setResults({
      confidence: Math.max(0, confidence),
      detectionTime: `${detectionMin} min`,
      resourceEfficiency: Math.max(0, resourceEff),
      falseAlarmRate: Math.min(100, falseAlarm),
      actionsRecovered: recoveries,
      notes,
    });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: colors.void }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: colors.borderDefault }}>
        <h1 className="font-display text-xl" style={{ color: colors.textPrimary }}>What-If Analysis</h1>
        <p className="text-xs mt-1" style={{ color: colors.textDim }}>
          Toggle scenario variables to see how CIRO's output changes
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-4">
        {/* Toggle switches */}
        <div className="space-y-2">
          {vars.map((v) => (
            <motion.div
              key={v.id}
              className="p-3 rounded-lg border flex items-center gap-3"
              style={{
                background: v.enabled ? colors.raised : 'rgba(248,113,113,0.05)',
                borderColor: v.enabled ? colors.borderDefault : 'rgba(248,113,113,0.2)',
              }}
            >
              <button onClick={() => toggleVar(v.id)} style={{ color: v.enabled ? colors.amber : colors.danger }}>
                {v.enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
              </button>
              <div className="flex-1">
                <div className="text-sm font-medium" style={{ color: v.enabled ? colors.textPrimary : colors.danger }}>
                  {v.label}
                </div>
                <div className="text-[11px]" style={{ color: colors.textDim }}>{v.description}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Run button */}
        <button
          onClick={runSimulation}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold"
          style={{ background: colors.amber, color: colors.void }}
        >
          <RefreshCw size={16} />
          Run What-If Simulation
        </button>

        {/* Results */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-semibold" style={{ color: colors.amber }}>Simulation Results</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Confidence', value: `${(results.confidence * 100).toFixed(0)}%`, good: results.confidence > 0.8 },
                { label: 'Detection', value: results.detectionTime, good: parseInt(results.detectionTime) < 15 },
                { label: 'Resource Eff.', value: `${results.resourceEfficiency}%`, good: results.resourceEfficiency > 70 },
                { label: 'False Alarm', value: `${results.falseAlarmRate}%`, good: results.falseAlarmRate < 15 },
              ].map((m) => (
                <div key={m.label} className="p-3 rounded-lg text-center" style={{ background: colors.raised }}>
                  <div className="text-lg font-bold" style={{ color: m.good ? colors.success : colors.danger }}>
                    {m.value}
                  </div>
                  <div className="text-[10px]" style={{ color: colors.textDim }}>{m.label}</div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg border space-y-1" style={{ borderColor: colors.borderDefault, background: colors.raised }}>
              <h4 className="text-xs font-semibold flex items-center gap-1" style={{ color: colors.warning }}>
                <AlertTriangle size={12} /> Impact Notes
              </h4>
              {results.notes.map((note, i) => (
                <p key={i} className="text-[11px]" style={{ color: note.startsWith('✗') ? colors.danger : colors.textSecondary }}>
                  {note}
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
