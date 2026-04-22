import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PerformancePieChartProps {
  data: any[];
  height?: number;
}

const PerformancePieChart: React.FC<PerformancePieChartProps> = ({ data, height = 180 }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  const COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899',
    '#06B6D4', '#84CC16', '#F97316', '#A855F7', '#14B8A6', '#F43F5E'
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-xl p-4 rounded-xl shadow-xl border border-gray-200/50 transform transition-all duration-200 scale-105">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-4 h-4 rounded-full shadow-md"
              style={{ backgroundColor: payload[0].payload.fill }}
            />
            <p className="text-sm font-bold text-gray-900">
              {payload[0].name}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-lg font-bold text-gray-900">
              {payload[0].value}
            </p>
            <p className="text-sm font-semibold text-gray-600">
              {payload[0].payload.percentage}% of total
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    const isActive = activeIndex === index;
    const fontSize = isActive ? '14px' : '12px';
    const fontWeight = isActive ? 'bold' : '600';

    return (
      <g>
        <text 
          x={x} 
          y={y} 
          fill="white" 
          textAnchor={x > cx ? 'start' : 'end'} 
          dominantBaseline="central"
          className="transition-all duration-300"
          style={{
            fontSize,
            fontWeight,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
            transform: isActive ? 'scale(1.1)' : 'scale(1)',
            transformOrigin: `${x}px ${y}px`
          }}
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
        {isActive && (
          <circle
            cx={x}
            cy={y}
            r="20"
            fill="none"
            stroke="white"
            strokeWidth="2"
            opacity="0.3"
            className="animate-pulse"
          />
        )}
      </g>
    );
  };

  const handlePieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const handlePieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className="w-full chart-container relative">
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        .chart-pie {
          filter: drop-shadow(0 10px 25px rgba(0, 0, 0, 0.1));
        }
      `}</style>
      
      <ResponsiveContainer width="100%" height={height}>
        <PieChart className="chart-pie">
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={75}
            innerRadius={25}
            fill="#8884d8"
            dataKey="value"
            animationBegin={0}
            animationDuration={2000}
            animationEasing="ease-out"
            onMouseEnter={handlePieEnter}
            onMouseLeave={handlePieLeave}
          >
            {data.map((entry, index) => {
              const isActive = activeIndex === index;
              return (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  style={{
                    filter: isActive 
                      ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.2)) brightness(1.1)' 
                      : 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    transformOrigin: 'center'
                  }}
                />
              );
            })}
          </Pie>
          <Tooltip 
            content={<CustomTooltip />}
            animationDuration={300}
            animationEasing="ease-in-out"
            cursor="pointer"
          />
          <Legend 
            wrapperStyle={{
              paddingTop: '15px',
              fontSize: '13px',
              fontWeight: '500'
            }}
            iconType="circle"
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: any) => {
              const isActive = activeIndex === entry.payload.index;
              return (
                <span 
                  style={{ 
                    color: isActive ? entry.color : '#6B7280',
                    fontWeight: isActive ? 'bold' : '500',
                    transition: 'all 0.2s ease',
                    fontSize: isActive ? '14px' : '13px'
                  }}
                >
                  {value} ({entry.payload.percentage}%)
                </span>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-400 text-sm">No data available</p>
        </div>
      )}
    </div>
  );
};

export default PerformancePieChart;
