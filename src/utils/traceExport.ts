import type { Workplan } from '../types';

export function serializeTraceExport(workplan: Workplan) {
  return JSON.stringify(workplan, null, 2);
}

export function buildTraceExportFilename(workplan: Workplan) {
  const safeSession = workplan.sessionId
    .replace(/[^a-z0-9._-]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return `${safeSession || 'ciro-trace'}.json`;
}

export function downloadTraceJson(workplan: Workplan) {
  if (typeof document === 'undefined') return;

  const blob = new Blob([serializeTraceExport(workplan)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = buildTraceExportFilename(workplan);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
