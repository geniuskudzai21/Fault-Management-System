import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaultStatus } from '../../constants';

interface FaultTrendChartProps {
  data: any[];
  height?: number;
}

const FaultTrendChart: React.FC<FaultTrendChartProps> = ({ data, height = 300 }) => {
  // Generate dynamic date labels based on current month
  const generateDateLabels = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const labels = [];
    for (let i = 0; i < daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i + 1);
      if (date.getDate() === today.getDate()) {
        labels.push(`Today`);
      } else if (i === daysInMonth - 1) {
        labels.push(`${date.getDate()}th`);
      } else {
        labels.push(`${date.getDate()}`);
      }
    }
    return labels;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className={`w-3 h-3 rounded-full ${
                  entry.status === FaultStatus.Resolved ? 'bg-green-500' 
                  : entry.status === FaultStatus.InProgress ? 'bg-amber-500' 
                  : 'bg-red-500'
                }`}
              />
              <div className="text-sm">
                <p className="font-medium text-gray-900">
                  {entry.value} {entry.status}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(entry.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const status = payload?.[0]?.status;
    
    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={4}
          fill={
            status === FaultStatus.Resolved ? '#10B981' 
            : status === FaultStatus.InProgress ? '#F59E0B' 
            : '#EF4444'
          }
          className="stroke-white"
          strokeWidth={2}
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            transition: 'all 0.3s ease'
          }}
        />
        <circle
          cx={cx}
          cy={cy}
          r={8}
          fill={
            status === FaultStatus.Resolved ? '#10B981' 
            : status === FaultStatus.InProgress ? '#F59E0B' 
            : '#EF4444'
          }
          opacity={0.3}
          className="animate-ping"
        />
      </g>
    );
  };

  return (
    <div className="w-full chart-container">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          className="font-sans chart-line"
        >
          <defs>
            <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F87171" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0.8}/>
            </linearGradient>
            <linearGradient id="colorInProgress" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FCD34D" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.8}/>
            </linearGradient>
            <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#059669" stopOpacity={0.8}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#f0f0f0" 
            strokeOpacity={0.3}
          />
          
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.getDate() === new Date().getDate() ? 'Today' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }}
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
          
          <Line 
            type="monotone" 
            dataKey="reported" 
            stroke="url(#colorReported)" 
            strokeWidth={3}
            strokeDasharray="0"
            dot={<CustomDot />}
            name="Reported Faults"
            animationDuration={2000}
            animationBegin={0}
            animationEasing="ease-in-out"
          />
          
          <Line 
            type="monotone" 
            dataKey="resolved" 
            stroke="url(#colorResolved)" 
            strokeWidth={3}
            strokeDasharray="0"
            dot={<CustomDot />}
            name="Resolved Faults"
            animationDuration={2000}
            animationBegin={300}
            animationEasing="ease-in-out"
          />
          
          <Line 
            type="monotone" 
            dataKey="inProgress" 
            stroke="url(#colorInProgress)" 
            strokeWidth={3}
            strokeDasharray="0"
            dot={<CustomDot />}
            name="In Progress"
            animationDuration={2000}
            animationBegin={600}
            animationEasing="ease-in-out"
          />
          
          <Legend 
            wrapperStyle={{
              paddingTop: '20px',
            }}
            iconType="line"
            formatter={(value, entry) => {
              let color = '#000000';
              if (value === 'Reported Faults') color = '#EF4444';
              else if (value === 'Resolved Faults') color = '#10B981';
              else if (value === 'In Progress') color = '#F59E0B';
              
              return (
                <span style={{ color }}>
                  {value}
                </span>
              );
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FaultTrendChart;
