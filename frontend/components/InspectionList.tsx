
import React from 'react';
import { Inspection, User } from '../types';
import { InspectionStatus } from '../constants';
import Button from './common/Button';
import { ArrowLeftIcon, LocationIcon, CalendarIcon } from './icons';
import { inspectionsApi } from '../src/api';

interface InspectionListProps {
  inspections: Inspection[];
  user: User;
  onSelectInspection: (inspection: Inspection) => void;
  onBack: () => void;
  onInspectionsUpdate?: () => void;
}

const statusConfig: { [key in InspectionStatus]: { bg: string; border: string; text: string; label: string } } = {
  [InspectionStatus.Pending]: { bg: 'bg-amber-500/10', border: 'border-amber-500/40', text: 'text-amber-400', label: 'Pending' },
  [InspectionStatus.InProgress]: { bg: 'bg-blue-500/10', border: 'border-blue-500/40', text: 'text-blue-400', label: 'In Progress' },
  [InspectionStatus.Completed]: { bg: 'bg-green-500/10', border: 'border-green-500/40', text: 'text-green-400', label: 'Completed' },
  [InspectionStatus.FollowUpRequired]: { bg: 'bg-red-500/10', border: 'border-red-500/40', text: 'text-red-400', label: 'Follow-up' },
};

const InspectionItem: React.FC<{ 
  inspection: Inspection, 
  onSelect: () => void,
  onUpdateStatus: (id: string, status: InspectionStatus) => Promise<void>,
  updatingStatus: string | null
}> = ({ inspection, onSelect, onUpdateStatus, updatingStatus }) => {
  const status = statusConfig[inspection.status];
  
  const handleStatusUpdate = async (status: InspectionStatus) => {
    await onUpdateStatus(inspection.id, status);
  };
  
  return (
    <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-3 hover:border-cyan-500/30 transition-all">
      <div className="flex justify-between items-start">
        <div className="flex-1" onClick={onSelect}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-dark-500">#{inspection.id.slice(0, 8)}</span>
            <span className={`px-2 py-0.5 text-xs rounded border ${status.bg} ${status.border} ${status.text}`}>
              {status.label}
            </span>
          </div>
          <p className="text-cyan-100 font-medium text-sm cursor-pointer hover:text-cyan-300">{inspection.address}</p>
          <div className="flex items-center gap-4 mt-2 text-dark-500 text-xs">
            <span className="flex items-center gap-1">
              <CalendarIcon className="w-3 h-3" />
              {inspection.date || 'No date set'}
            </span>
            <span className="flex items-center gap-1">
              <LocationIcon className="w-3 h-3" />
              {inspection.department}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {inspection.status === InspectionStatus.Pending && (
            <Button 
              onClick={(e) => { e.stopPropagation(); handleStatusUpdate(InspectionStatus.InProgress); }}
              disabled={updatingStatus === inspection.id}
              className="bg-blue-600 hover:bg-blue-500 text-dark-950 text-xs py-1 px-3 border-0 disabled:opacity-50"
            >
              {updatingStatus === inspection.id ? '...' : 'START'}
            </Button>
          )}
          {inspection.status === InspectionStatus.InProgress && (
            <Button 
              onClick={(e) => { e.stopPropagation(); handleStatusUpdate(InspectionStatus.Completed); }}
              disabled={updatingStatus === inspection.id}
              className="bg-green-600 hover:bg-green-500 text-dark-950 text-xs py-1 px-3 border-0 disabled:opacity-50"
            >
              {updatingStatus === inspection.id ? '...' : 'DONE'}
            </Button>
          )}
          <Button 
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className="bg-cyan-600 hover:bg-cyan-500 text-dark-950 text-xs py-1 px-3 border-0"
          >
            View
          </Button>
        </div>
      </div>
    </div>
  );
};

const InspectionList: React.FC<InspectionListProps> = ({ 
  inspections, 
  user, 
  onSelectInspection, 
  onBack,
  onInspectionsUpdate 
}) => {
  const [updatingStatus, setUpdatingStatus] = React.useState<string | null>(null);
  
  // Filter inspections assigned to this inspector
  const myInspections = inspections.filter(inspection => 
    String(inspection.inspector) === String(user.id)
  );
  
  const updateInspectionStatus = async (inspectionId: string, status: InspectionStatus) => {
    setUpdatingStatus(inspectionId);
    try {
      await inspectionsApi.update(inspectionId, { status });
      if (onInspectionsUpdate) {
        onInspectionsUpdate();
      }
    } catch (err) {
      console.error('Failed to update inspection status:', err);
    } finally {
      setUpdatingStatus(null);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-dark-900/80 border border-cyan-500/20 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.05)] overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-900/30 to-transparent p-4 border-b border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                onClick={onBack}
                className="bg-dark-800 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 p-2"
              >
                <ArrowLeftIcon className="w-4 h-4" />
              </Button>
              <div>
                <h2 className="text-xl font-bold text-cyan-100 flex items-center gap-2">
                  <LocationIcon className="w-5 h-5 text-cyan-400" />
                  My Assigned Inspections
                </h2>
                <p className="text-dark-500 text-sm mt-1">{myInspections.length} inspection{myInspections.length !== 1 ? 's' : ''} assigned to you</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          {myInspections.length > 0 ? (
            <div className="space-y-2">
              {myInspections.map(inspection => (
                <InspectionItem 
                  key={inspection.id} 
                  inspection={inspection} 
                  onSelect={() => onSelectInspection(inspection)}
                  onUpdateStatus={updateInspectionStatus}
                  updatingStatus={updatingStatus}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <LocationIcon className="w-12 h-12 text-dark-600 mx-auto mb-3" />
              <p className="text-dark-500 text-sm">No inspections assigned to you</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InspectionList;
