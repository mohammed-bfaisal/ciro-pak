import { useState } from 'react';
import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex flex-col w-full overflow-hidden bg-void" style={{ height: '100%' }}>
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
