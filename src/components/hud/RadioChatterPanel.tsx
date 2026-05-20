import { useEffect, useRef, useState } from 'react';
import { Radio, Volume2, VolumeX } from 'lucide-react';
import { useRadioStore } from '../../store/radioStore';
import { useSettingsStore } from '../../store/settingsStore';
import { colors } from '../../constants/colors';
import { apiUrl } from '../../api/client';

async function fetchSpeechAudio(text: string): Promise<string | null> {
  try {
    const url = apiUrl('/api/openrouter/speech');
    if (!url) return null;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

export function RadioChatterPanel() {
  const lines = useRadioStore((s) => s.lines);
  const enabled = useRadioStore((s) => s.enabled);
  const toggleEnabled = useRadioStore((s) => s.toggleEnabled);
  const preferBackend = useSettingsStore((s) => s.preferBackendData);
  const [spokenEnabled, setSpokenEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevLenRef = useRef(0);

  useEffect(() => {
    if (!spokenEnabled || !preferBackend) return;
    const newLines = lines.slice(prevLenRef.current);
    prevLenRef.current = lines.length;
    if (newLines.length === 0) return;

    const latestLine = newLines[newLines.length - 1];
    void fetchSpeechAudio(latestLine.text).then((url) => {
      if (!url) return;
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      void audio.play().catch(() => {});
    });
  }, [lines, spokenEnabled, preferBackend]);

  if (!enabled || lines.length === 0) return null;

  const latest = lines[lines.length - 1];

  return (
    <div
      className="fixed bottom-10 left-1/2 z-40 flex items-start gap-3 rounded-xl border px-4 py-3 max-w-sm"
      style={{
        transform: 'translateX(-50%)',
        background: 'rgba(8,8,8,0.92)',
        borderColor: colors.borderAmber,
        backdropFilter: 'blur(14px)',
        boxShadow: '0 0 24px rgba(245,158,11,0.1)',
      }}
    >
      <Radio size={16} style={{ color: colors.amber, flexShrink: 0, marginTop: 2 }} className="animate-blink" />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: colors.amber }}>
          Radio · {latest.eventType.replace('_', ' ')}
        </div>
        <p className="text-xs leading-snug" style={{ color: colors.textPrimary }}>
          {latest.text}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setSpokenEnabled((v) => !v)}
          title={spokenEnabled ? 'Mute spoken audio' : 'Enable spoken audio'}
          style={{ color: spokenEnabled ? colors.amber : colors.textDim }}
        >
          {spokenEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
        </button>
        <button onClick={toggleEnabled} style={{ color: colors.textDim }} title="Hide radio">
          ×
        </button>
      </div>
    </div>
  );
}
