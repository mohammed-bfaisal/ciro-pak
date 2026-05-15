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
    <div className="h-screen w-screen overflow-hidden bg-void" style={{ display: 'grid', gridTemplateRows: 'var(--topbar-height) 1fr', gridTemplateColumns: '1fr' }}>
      <TopBar />
      <div className="relative overflow-hidden" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr' }}>
        {/* Desktop sidebar */}
        <div className="hidden desktop:block">
          <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        </div>
        {/* Main content */}
        <main className="relative overflow-hidden">
          {children}
        </main>
      </div>
      {/* Mobile bottom nav */}
      <div className="desktop:hidden fixed bottom-0 left-0 right-0 z-50">
        <BottomNav />
      </div>
    </div>
  );
}
