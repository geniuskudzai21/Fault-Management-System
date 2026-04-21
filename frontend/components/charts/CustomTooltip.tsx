import React from 'react';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
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

export default CustomTooltip;
