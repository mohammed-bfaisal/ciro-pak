import { useLocation, useNavigate } from 'react-router-dom';
import { Map, Radio, AlertTriangle, Truck, Terminal, GitCompare, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { colors } from '../../constants/colors';

const navItems = [
  { path: '/',          icon: Map,            label: 'Dashboard' },
  { path: '/signals',   icon: Radio,          label: 'Signals'   },
  { path: '/crises',    icon: AlertTriangle,  label: 'Crises'    },
  { path: '/resources', icon: Truck,          label: 'Resources' },
  { path: '/trace',     icon: Terminal,        label: 'Agent Trace'},
  { path: '/compare',   icon: GitCompare,     label: 'Compare'   },
  { path: '/settings',  icon: Settings,       label: 'Settings'  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const width = collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)';

  return (
    <nav
      className="h-full flex flex-col border-r transition-all duration-300 relative"
      style={{
        width,
        background: colors.base,
        borderColor: 'rgba(255,255,255,0.09)',
      }}
    >
      {/* Logo area */}
      <div className="flex items-center gap-3 px-4 py-5" style={{ minHeight: 64 }}>
        {/* Radar crosshair icon — matches APK launcher */}
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
          <rect width="48" height="48" rx="10" fill="#080808"/>
          <circle cx="24" cy="24" r="18" stroke="#F59E0B" strokeWidth="1.2" strokeOpacity="0.35"/>
          <line x1="24" y1="6"  x2="24" y2="10" stroke="#F59E0B" strokeWidth="1.2" strokeOpacity="0.35" strokeLinecap="round"/>
          <line x1="24" y1="38" x2="24" y2="42" stroke="#F59E0B" strokeWidth="1.2" strokeOpacity="0.35" strokeLinecap="round"/>
          <line x1="6"  y1="24" x2="10" y2="24" stroke="#F59E0B" strokeWidth="1.2" strokeOpacity="0.35" strokeLinecap="round"/>
          <line x1="38" y1="24" x2="42" y2="24" stroke="#F59E0B" strokeWidth="1.2" strokeOpacity="0.35" strokeLinecap="round"/>
          <circle cx="24" cy="24" r="11" stroke="#F59E0B" strokeWidth="1.6" strokeOpacity="0.7"/>
          <line x1="24" y1="13" x2="24" y2="16" stroke="#F59E0B" strokeWidth="1.6" strokeOpacity="0.7" strokeLinecap="round"/>
          <line x1="24" y1="32" x2="24" y2="35" stroke="#F59E0B" strokeWidth="1.6" strokeOpacity="0.7" strokeLinecap="round"/>
          <line x1="13" y1="24" x2="16" y2="24" stroke="#F59E0B" strokeWidth="1.6" strokeOpacity="0.7" strokeLinecap="round"/>
          <line x1="32" y1="24" x2="35" y2="24" stroke="#F59E0B" strokeWidth="1.6" strokeOpacity="0.7" strokeLinecap="round"/>
          <circle cx="24" cy="24" r="5.5" stroke="#F59E0B" strokeWidth="1.8"/>
          <circle cx="24" cy="24" r="2.2" fill="#F59E0B"/>
          <circle cx="24" cy="24" r="2.2" fill="#FCD34D" fillOpacity="0.5"/>
        </svg>
        {!collapsed && (
          <span className="font-display text-lg tracking-wide" style={{ color: colors.textPrimary }}>
            CIRO
          </span>
        )}
      </div>

      {/* Nav items */}
      <div className="flex-1 flex flex-col gap-1 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => navigate(item.path)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left w-full group"
              style={{
                background: isActive ? colors.amberMuted : 'transparent',
                borderLeft: isActive ? `3px solid ${colors.amber}` : '3px solid transparent',
                color: isActive ? colors.amber : colors.textSecondary,
              }}
            >
              <Icon size={20} style={{ minWidth: 20 }} />
              {!collapsed && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center p-3 mx-2 mb-3 rounded-lg transition-colors"
        style={{ color: colors.textDim }}
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </nav>
  );
}
