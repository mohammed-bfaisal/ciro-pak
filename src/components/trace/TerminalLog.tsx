import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTraceStore } from '../../store/traceStore';
import { colors } from '../../constants/colors';

export function TerminalLog() {
  const logs = useTraceStore((s) => s.logs);
  const isRunning = useTraceStore((s) => s.isRunning);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLineColor = (line: string): string => {
    if (line.includes('✓') || line.includes('Complete') || line.includes('success')) return colors.success;
    if (line.includes('✗') || line.includes('FAILED') || line.includes('503') || line.includes('HTTP 5')) return colors.danger;
    if (line.includes('⚠') || line.includes('FLAGGED') || line.includes('RECOVERED') || line.includes('Retry') || line.includes('↻')) return colors.warning;
    if (line.includes('▶') || line.includes('═══')) return colors.amber;
    if (line.includes('▸') || line.includes('↪') || line.includes('Fallback')) return colors.info;
    return colors.textSecondary;
  };

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-y-auto font-mono text-xs leading-relaxed p-4"
      style={{ background: colors.void }}
    >
      {logs.length === 0 ? (
        <div className="flex items-center gap-2" style={{ color: colors.textDim }}>
          <span style={{ color: colors.amber }}>{'>'}</span>
          <span>Awaiting pipeline execution...</span>
          <span className="terminal-cursor" />
        </div>
      ) : (
        <AnimatePresence>
          {logs.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className="py-0.5 flex"
            >
              <span style={{ color: colors.amber, marginRight: 8 }}>{'>'}</span>
              <span style={{ color: getLineColor(line), wordBreak: 'break-word' }}>{line}</span>
            </motion.div>
          ))}
          {isRunning && (
            <div className="py-0.5 flex">
              <span style={{ color: colors.amber, marginRight: 8 }}>{'>'}</span>
              <span className="terminal-cursor" />
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
