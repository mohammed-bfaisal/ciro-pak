import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { useTraceStore } from '../../store/traceStore';
import { colors } from '../../constants/colors';

function getLineColor(line: string): string {
  if (line.includes('✓') || line.includes('Complete') || line.includes('success')) return colors.success;
  if (line.includes('✗') || line.includes('FAILED') || line.includes('503') || line.includes('HTTP 5')) return colors.danger;
  if (line.includes('⚠') || line.includes('FLAGGED') || line.includes('RECOVERED') || line.includes('Retry') || line.includes('↻')) return colors.warning;
  if (line.includes('▶') || line.includes('═══')) return colors.amber;
  if (line.includes('▸') || line.includes('↪') || line.includes('Fallback')) return colors.info;
  return colors.textSecondary;
}

function getFlashClass(line: string): string {
  if (line.includes('503') || line.includes('HTTP 5') || line.includes('✗') || line.includes('FAILED')) return 'terminal-flash-red';
  if (line.includes('RECOVERED') || line.includes('↻')) return 'terminal-flash-amber';
  return '';
}

export function TerminalLog() {
  const logs = useTraceStore((s) => s.logs);
  const isRunning = useTraceStore((s) => s.isRunning);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [replayLogs, setReplayLogs] = useState<string[] | null>(null);
  const [isReplaying, setIsReplaying] = useState(false);

  useEffect(() => {
    if (!isReplaying && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isReplaying]);

  const handleReplay = () => {
    if (isReplaying || logs.length === 0) return;
    setReplayLogs([]);
    setIsReplaying(true);
    logs.forEach((line, i) => {
      setTimeout(() => {
        setReplayLogs((prev) => (prev ? [...prev, line] : [line]));
        if (i === logs.length - 1) setIsReplaying(false);
      }, i * 80);
    });
  };

  const displayLogs = replayLogs ?? logs;

  return (
    <div className="h-full flex flex-col" style={{ background: colors.void }}>
      {logs.length > 0 && (
        <div className="flex justify-end px-3 py-1 border-b" style={{ borderColor: colors.borderDefault }}>
          <button
            onClick={handleReplay}
            disabled={isReplaying}
            className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded"
            style={{ color: isReplaying ? colors.textDim : colors.amber, opacity: isReplaying ? 0.5 : 1 }}
          >
            <RotateCcw size={11} />
            {isReplaying ? 'Replaying…' : 'Replay'}
          </button>
        </div>
      )}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto font-mono text-xs leading-relaxed p-4"
      >
        {displayLogs.length === 0 ? (
          <div className="flex items-center gap-2" style={{ color: colors.textDim }}>
            <span style={{ color: colors.amber }}>{'>'}</span>
            <span>Awaiting pipeline execution...</span>
            <span className="terminal-cursor" />
          </div>
        ) : (
          <AnimatePresence>
            {displayLogs.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className={`py-0.5 flex rounded ${getFlashClass(line)}`}
              >
                <span style={{ color: colors.amber, marginRight: 8 }}>{'>'}</span>
                <span style={{ color: getLineColor(line), wordBreak: 'break-word' }}>{line}</span>
              </motion.div>
            ))}
            {(isRunning || isReplaying) && (
              <div className="py-0.5 flex">
                <span style={{ color: colors.amber, marginRight: 8 }}>{'>'}</span>
                <span className="terminal-cursor" />
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
