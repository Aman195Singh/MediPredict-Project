import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface RiskDoughnutProps {
  percentage: number;
  size?: number;
  showLabel?: boolean;
}

export const RiskDoughnut = ({ percentage, size = 200, showLabel = true }: RiskDoughnutProps) => {
  const data = [
    { name: 'risk', value: percentage },
    { name: 'safe', value: 100 - percentage },
  ];

  const riskColor = percentage >= 60 ? 'hsl(0, 84%, 60%)' : percentage >= 30 ? 'hsl(38, 92%, 50%)' : 'hsl(142, 71%, 45%)';
  const riskLabel = percentage >= 60 ? 'High Risk' : percentage >= 30 ? 'Moderate Risk' : 'Low Risk';
  const riskLabelClass = percentage >= 60 ? 'text-danger' : percentage >= 30 ? 'text-warning' : 'text-success';

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={size * 0.33}
              outerRadius={size * 0.45}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              animationDuration={1200}
              animationBegin={0}
            >
              <Cell fill={riskColor} />
              <Cell fill="#E5E7EB" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-bold text-foreground" style={{ fontSize: size * 0.16 }}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      {showLabel && (
        <span className={`text-sm font-semibold mt-1 ${riskLabelClass}`}>{riskLabel}</span>
      )}
    </div>
  );
};
