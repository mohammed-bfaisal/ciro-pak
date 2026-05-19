import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { resolveP01Runtime } from '../../foundation/urduRtlLanguage';
import { useSettingsStore } from '../../store/settingsStore';

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const p01 = useSettingsStore((state) => state.p01);
  const p01Runtime = resolveP01Runtime(p01);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const root = document.documentElement;
    const previousLang = root.lang;
    const previousDir = root.dir;
    root.lang = p01Runtime.lang;
    root.dir = p01Runtime.dir;
    root.dataset.ciroLocale = p01Runtime.mode;
    root.dataset.ciroP01Enabled = String(p01.enabled);
    return () => {
      root.lang = previousLang || 'en';
      root.dir = previousDir || 'ltr';
      delete root.dataset.ciroLocale;
      delete root.dataset.ciroP01Enabled;
    };
  }, [p01.enabled, p01Runtime.dir, p01Runtime.lang, p01Runtime.mode]);

  return (
    <div
      className="app-shell flex flex-col w-full overflow-hidden bg-void"
      dir={p01Runtime.dir}
      lang={p01Runtime.lang}
      data-ciro-locale={p01Runtime.mode}
      data-ciro-p01-enabled={p01.enabled}
    >
      <TopBar />
      {/* Content row: sidebar + main */}
      <div className="relative flex flex-1 overflow-hidden min-h-0">
        {/* Desktop sidebar */}
        <div className="hidden desktop:block flex-shrink-0">
          <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        </div>
        {/* Main content — flex-1 + min-h-0/min-w-0 so children can use height:100% */}
        <main className="relative flex-1 overflow-hidden min-h-0 min-w-0">
          {children}
        </main>
      </div>
      {/* Mobile bottom nav — in flow (not fixed) so it doesn't overlap the map */}
      <div className="desktop:hidden flex-shrink-0 z-50">
        <BottomNav />
      </div>
    </div>
  );
}
