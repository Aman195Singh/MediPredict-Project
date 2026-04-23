import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { FeatureImportance } from '@/lib/predictions';

interface FeatureBarChartProps {
  features: FeatureImportance[];
  showAll?: boolean;
}

export const FeatureBarChart = ({ features, showAll = false }: FeatureBarChartProps) => {
  const displayed = showAll ? features : features.slice(0, 5);
  const data = displayed.map(f => ({
    name: f.displayName,
    impact: Math.round(Math.abs(f.impact) * 100),
    positive: f.impact > 0,
  }));

  return (
    <div style={{ height: Math.max(200, data.length * 45) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, 'auto']} tickFormatter={v => `${v}%`} />
          <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value: number) => [`${value}%`, 'Impact']} />
          <Bar dataKey="impact" radius={[0, 4, 4, 0]} animationDuration={800}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.positive ? 'hsl(0, 84%, 60%)' : 'hsl(142, 71%, 45%)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
