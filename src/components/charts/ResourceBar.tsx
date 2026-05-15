import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { colors } from '../../constants/colors';
import type { Resource } from '../../types';

interface ResourceBarProps {
  resources: Resource[];
  height?: number;
}

export function ResourceBarChart({ resources, height = 120 }: ResourceBarProps) {
  const statusCounts = {
    available: resources.filter((r) => r.status === 'available').length,
    dispatched: resources.filter((r) => r.status === 'dispatched').length,
    en_route: resources.filter((r) => r.status === 'en_route').length,
    on_scene: resources.filter((r) => r.status === 'on_scene').length,
  };

  const data = [
    { name: 'Available', value: statusCounts.available, color: colors.success },
    { name: 'Dispatched', value: statusCounts.dispatched, color: colors.amber },
    { name: 'En Route', value: statusCounts.en_route, color: colors.info },
    { name: 'On Scene', value: statusCounts.on_scene, color: '#60a5fa' },
  ];

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={16}>
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: colors.textDim }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
