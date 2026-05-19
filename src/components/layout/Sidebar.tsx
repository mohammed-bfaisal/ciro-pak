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
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
          style={{ background: colors.amberMuted, color: colors.amber }}
        >
          C
        </div>
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
