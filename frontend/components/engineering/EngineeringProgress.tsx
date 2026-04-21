
import React from 'react';
import { EngineeringData, EngineeringProgressItem } from '../../types';
import { EngineeringPhase } from '../../constants';
import { ChartBarIcon } from '../icons';

interface EngineeringProgressProps {
  data: EngineeringData;
  onChange: (data: EngineeringData) => void;
}

const workmanshipConfig: { [key: string]: { bg: string; border: string; text: string; label: string } } = {
  'Good': { bg: 'bg-green-500/10', border: 'border-green-500/40', text: 'text-green-400', label: 'Good' },
  'Fair': { bg: 'bg-amber-500/10', border: 'border-amber-500/40', text: 'text-amber-400', label: 'Fair' },
  'Poor': { bg: 'bg-red-500/10', border: 'border-red-500/40', text: 'text-red-400', label: 'Poor' },
};

const EngineeringProgress: React.FC<EngineeringProgressProps> = ({ data, onChange }) => {

  const handleProgressChange = (phase: EngineeringPhase, progress: number) => {
    const updatedItems = data.progressItems.map(item => 
      item.phase === phase ? { ...item, progress } : item
    );
    onChange({...data, progressItems: updatedItems });
  }
  
  const handleWorkmanshipChange = (phase: EngineeringPhase, workmanship: 'Good' | 'Fair' | 'Poor') => {
    const updatedItems = data.progressItems.map(item => 
      item.phase === phase ? { ...item, workmanship } : item
    );
    onChange({...data, progressItems: updatedItems });
  }

  const handleCommentChange = (phase: EngineeringPhase, comment: string) => {
    const updatedItems = data.progressItems.map(item => 
      item.phase === phase ? { ...item, comment } : item
    );
    onChange({...data, progressItems: updatedItems });
  }

  const handleMaterialsVerifiedChange = (phase: EngineeringPhase, materialsVerified: boolean) => {
    const updatedItems = data.progressItems.map(item => 
      item.phase === phase ? { ...item, materialsVerified } : item
    );
    onChange({...data, progressItems: updatedItems });
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-cyan-500';
    if (progress >= 25) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-dark-800/30 border border-cyan-500/20 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <ChartBarIcon className="w-5 h-5 text-cyan-400" />
        <h3 className="text-sm font-semibold text-cyan-400 tracking-wider">CONSTRUCTION PROGRESS TRACKING</h3>
      </div>
      <p className="text-dark-500 text-sm mb-4">
        Site: <span className="text-cyan-100 font-medium">{data.siteName}</span>
      </p>

      <div className="space-y-4">
        {data.progressItems.map((item) => (
          <div key={item.phase} className="bg-dark-800/50 border border-dark-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <label htmlFor={`progress-${item.phase}`} className="font-medium text-cyan-100 text-sm">
                {item.phase}
              </label>
              <span className={`px-2 py-1 text-xs font-bold rounded ${getProgressColor(item.progress)} text-dark-950`}>
                {item.progress}%
              </span>
            </div>
            <div className="mb-4">
              <input
                id={`progress-${item.phase}`}
                type="range"
                min="0"
                max="100"
                step="5"
                value={item.progress}
                onChange={(e) => handleProgressChange(item.phase, parseInt(e.target.value, 10))}
                className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-xs text-dark-500 mt-1">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-xs font-medium text-dark-400 mb-2">Workmanship Quality</p>
              <div className="flex gap-2">
                {(['Good', 'Fair', 'Poor'] as const).map(quality => {
                  const config = workmanshipConfig[quality];
                  const isSelected = item.workmanship === quality;
                  return (
                    <button
                      key={quality}
                      onClick={() => handleWorkmanshipChange(item.phase, quality)}
                      className={`flex-1 px-3 py-1.5 text-xs rounded-lg border transition-all ${
                        isSelected
                          ? `${config.bg} ${config.border} ${config.text}`
                          : 'bg-dark-700/50 border-dark-600 text-dark-400 hover:border-dark-500'
                      }`}
                    >
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mb-4">
              <label className="flex items-center gap-2 text-xs text-cyan-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.materialsVerified || false}
                  onChange={(e) => handleMaterialsVerifiedChange(item.phase, e.target.checked)}
                  className="w-4 h-4 text-cyan-500 bg-dark-700 border-dark-600 rounded focus:ring-cyan-500 focus:ring-2"
                />
                Materials Verified and Approved
              </label>
            </div>
            <div>
              <p className="text-xs font-medium text-dark-400 mb-2">Observations & Comments</p>
              <textarea
                value={item.comment || ''}
                onChange={(e) => handleCommentChange(item.phase, e.target.value)}
                placeholder="Add detailed observations about this phase..."
                className="w-full px-3 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-cyan-100 placeholder-dark-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm"
                rows={2}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EngineeringProgress;
