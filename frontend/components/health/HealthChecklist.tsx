
import React from 'react';
import { HealthData, HealthChecklistItem } from '../../types';
import { ComplianceRating } from '../../constants';
import { ClipboardDocumentCheckIcon } from '../icons';

interface HealthChecklistProps {
  data: HealthData;
  onChange: (data: HealthData) => void;
}

const ratingConfig: { [key in ComplianceRating]: { bg: string; border: string; text: string; label: string } } = {
  [ComplianceRating.Compliant]: { bg: 'bg-green-500/10', border: 'border-green-500/40', text: 'text-green-400', label: 'Compliant' },
  [ComplianceRating.NonCompliant]: { bg: 'bg-red-500/10', border: 'border-red-500/40', text: 'text-red-400', label: 'Non-Compliant' },
  [ComplianceRating.Partial]: { bg: 'bg-amber-500/10', border: 'border-amber-500/40', text: 'text-amber-400', label: 'Partial' },
  [ComplianceRating.NotApplicable]: { bg: 'bg-dark-700/50', border: 'border-dark-600', text: 'text-dark-400', label: 'N/A' },
};

const HealthChecklist: React.FC<HealthChecklistProps> = ({ data, onChange }) => {
  const handleRatingChange = (id: string, rating: ComplianceRating) => {
    const updatedChecklists = data.checklists.map(item =>
      item.id === id ? { ...item, rating } : item
    );
    onChange({ ...data, checklists: updatedChecklists });
  };
  
  const handleCommentChange = (id: string, comment: string) => {
    const updatedChecklists = data.checklists.map(item =>
      item.id === id ? { ...item, comment } : item
    );
    onChange({ ...data, checklists: updatedChecklists });
  };

  return (
    <div className="bg-dark-800/30 border border-cyan-500/20 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardDocumentCheckIcon className="w-5 h-5 text-cyan-400" />
        <h3 className="text-sm font-semibold text-cyan-400 tracking-wider">HEALTH INSPECTION CHECKLIST</h3>
      </div>
      <p className="text-dark-500 text-sm mb-4">
        Establishment: <span className="text-cyan-100 font-medium">{data.establishmentType}</span>
      </p>

      <div className="space-y-4">
        {data.checklists.map((item) => {
          const currentRating = ratingConfig[item.rating];
          return (
            <div key={item.id} className="bg-dark-800/50 border border-dark-700 rounded-lg p-3">
              <p className="text-cyan-100 font-medium text-sm mb-3">{item.text}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {(Object.values(ComplianceRating)).map(ratingValue => {
                  const config = ratingConfig[ratingValue];
                  const isSelected = item.rating === ratingValue;
                  return (
                    <button
                      key={ratingValue}
                      onClick={() => handleRatingChange(item.id, ratingValue)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
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
              <textarea
                value={item.comment}
                onChange={(e) => handleCommentChange(item.id, e.target.value)}
                placeholder="Add detailed observations..."
                className="w-full px-3 py-2 bg-dark-800/50 border border-dark-700 rounded-lg text-cyan-100 placeholder-dark-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm"
                rows={2}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HealthChecklist;
