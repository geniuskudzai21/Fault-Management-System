import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RegionalPerformanceBarProps {
  data: any[];
  height?: number;
}

const RegionalPerformanceBar: React.FC<RegionalPerformanceBarProps> = ({ data, height = 300 }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className={`w-3 h-3 rounded-full ${
                  entry.status === 'Resolved' ? 'bg-green-500' 
                  : entry.status === 'In Progress' ? 'bg-amber-500' 
                  : 'bg-red-500'
                }`}
              />
              <div className="text-sm">
                <p className="font-medium text-gray-900">
                  {entry.value} {entry.status}
                </p>
                <p className="text-xs text-gray-500">
                  {entry.region} • {entry.category}
                </p>
              </div>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          className="font-sans"
        >
          <defs>
            <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#059669" stopOpacity={0.8}/>
            </linearGradient>
            <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#D97706" stopOpacity={0.8}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          
          <XAxis 
            dataKey="region" 
            tick={{ fontSize: 12 }}
            tickLine={false}
            stroke="#6b7280"
          />
          
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={false}
            stroke="#6b7280"
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Bar 
            dataKey="resolved" 
            stackId="a" 
            fill="url(#colorResolved)"
            name="Resolved"
          />
          
          <Bar 
            dataKey="pending" 
            stackId="a" 
            fill="url(#colorPending)"
            name="Pending"
          />
          
          <Legend 
            wrapperStyle={{
              paddingTop: '20px',
            }}
            iconType="rect"
            formatter={(value, entry) => (
              <span style={{ color: entry.color }}>
                {value}
              </span>
            )}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RegionalPerformanceBar;
