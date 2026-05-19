import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { resolveP02DisplayPreferences } from '../../displayAccessibility/contracts';
import { useSettingsStore } from '../../store/settingsStore';

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const p02 = useSettingsStore((state) => state.p02);
  const loadP02Settings = useSettingsStore((state) => state.loadP02Settings);

  useEffect(() => {
    loadP02Settings();
  }, [loadP02Settings]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const preferences = resolveP02DisplayPreferences(p02);
    const root = document.documentElement;
    root.dataset.ciroP02Enabled = String(p02.enabled);
    root.dataset.ciroP02Density = preferences.textDensity;
    root.dataset.ciroP02LargeText = String(preferences.largeText);
    root.dataset.ciroP02ColorblindSafe = String(preferences.colorblindSafe);
  }, [p02]);

  return (
    <div className="app-shell flex flex-col w-full overflow-hidden bg-void">
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
