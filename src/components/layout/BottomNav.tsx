import { useLocation, useNavigate } from 'react-router-dom';
import { Map, Radio, AlertTriangle, Truck, Terminal } from 'lucide-react';
import { colors } from '../../constants/colors';

const mobileTabs = [
  { path: '/',          icon: Map,            label: 'Map'      },
  { path: '/signals',   icon: Radio,          label: 'Signals'  },
  { path: '/crises',    icon: AlertTriangle,  label: 'Crises'   },
  { path: '/resources', icon: Truck,          label: 'Resources'},
  { path: '/trace',     icon: Terminal,        label: 'Trace'    },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className="bottom-nav flex items-center justify-around border-t"
      style={{
        background: 'rgba(8,8,8,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: 'rgba(255,255,255,0.09)',
      }}
    >
      {mobileTabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        const Icon = tab.icon;
        return (
          <button
            key={tab.path}
            id={`mobile-nav-${tab.label.toLowerCase()}`}
            onClick={() => navigate(tab.path)}
            className="flex flex-col items-center gap-1 py-1.5 px-3 transition-colors relative"
            style={{ color: isActive ? colors.amber : colors.textDim }}
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium">{tab.label}</span>
            {isActive && (
              <div
                className="absolute -bottom-0 w-5 h-0.5 rounded-full"
                style={{ background: colors.amber }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
