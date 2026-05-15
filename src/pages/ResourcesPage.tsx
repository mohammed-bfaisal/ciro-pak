import { useResourceStore } from '../store/resourceStore';
import { ResourceCard } from '../components/cards/ResourceCard';
import { ResourceBarChart } from '../components/charts/ResourceBar';
import { colors } from '../constants/colors';
import { CheckCircle, Truck, Navigation, Shield } from 'lucide-react';

export function ResourcesPage() {
  const resources = useResourceStore((s) => s.resources);

  const stats = {
    available: resources.filter((r) => r.status === 'available').length,
    dispatched: resources.filter((r) => r.status === 'dispatched').length,
    on_scene: resources.filter((r) => r.status === 'on_scene').length,
    total: resources.length,
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: colors.void }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: colors.borderDefault }}>
        <h1 className="font-display text-xl mb-3" style={{ color: colors.textPrimary }}>Resources</h1>

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Total', value: stats.total, icon: Shield, color: colors.textSecondary },
            { label: 'Available', value: stats.available, icon: CheckCircle, color: colors.success },
            { label: 'Dispatched', value: stats.dispatched, icon: Truck, color: colors.amber },
            { label: 'On Scene', value: stats.on_scene, icon: Navigation, color: colors.info },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-2 rounded-lg text-center"
              style={{ background: colors.raised }}
            >
              <stat.icon size={16} className="mx-auto mb-1" style={{ color: stat.color }} />
              <div className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-[10px]" style={{ color: colors.textDim }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {resources.length > 0 && (
        <div className="px-4 py-3 border-b" style={{ borderColor: colors.borderDefault }}>
          <ResourceBarChart resources={resources} height={100} />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-20">
        {resources.length === 0 ? (
          <div className="text-center py-12 text-sm" style={{ color: colors.textDim }}>
            Run pipeline to load resources
          </div>
        ) : (
          resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))
        )}
      </div>
    </div>
  );
}
