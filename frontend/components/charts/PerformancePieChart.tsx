import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PerformancePieChartProps {
  data: any[];
  height?: number;
}

const PerformancePieChart: React.FC<PerformancePieChartProps> = ({ data, height = 180 }) => {
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900 mb-1">
            {payload[0].name}
          </p>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: payload[0].payload.fill }}
            />
            <p className="text-sm font-semibold text-gray-900">
              {payload[0].value} ({payload[0].payload.percentage}%)
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show label for very small slices

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-semibold"
        style={{
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
          animation: 'fadeIn 0.5s ease-in-out'
        }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="w-full chart-container">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart className="chart-pie">
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={70}
            fill="#8884d8"
            dataKey="value"
            animationBegin={0}
            animationDuration={1500}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                style={{
                  filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </Pie>
          <Tooltip 
            content={<CustomTooltip />}
            animationDuration={300}
            animationEasing="ease-in-out"
          />
          <Legend 
            wrapperStyle={{
              paddingTop: '10px',
              fontSize: '12px'
            }}
            iconType="circle"
            formatter={(value, entry: any) => (
              <span 
                style={{ 
                  color: entry.color,
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
              >
                {value} ({entry.payload.percentage}%)
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformancePieChart;
