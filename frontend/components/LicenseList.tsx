import React from 'react';
import { License, User } from '../types';
import { LicenseStatus } from '../constants';
import Button from './common/Button';
import { ArrowLeftIcon, LocationIcon, CalendarIcon } from './icons';
import { licensesApi } from '../src/api';

interface LicenseListProps {
  licenses: License[];
  user: User;
  onSelectLicense: (license: License) => void;
  onBack: () => void;
  onLicensesUpdate?: () => void;
}

const statusConfig: { [key in LicenseStatus]: { bg: string; border: string; text: string; label: string } } = {
  [LicenseStatus.Pending]: { bg: 'bg-amber-500/10', border: 'border-amber-500/40', text: 'text-amber-400', label: 'Pending' },
  [LicenseStatus.InProgress]: { bg: 'bg-blue-500/10', border: 'border-blue-500/40', text: 'text-blue-400', label: 'In Progress' },
  [LicenseStatus.Issued]: { bg: 'bg-green-500/10', border: 'border-green-500/40', text: 'text-green-400', label: 'Issued' },
  [LicenseStatus.Expired]: { bg: 'bg-red-500/10', border: 'border-red-500/40', text: 'text-red-400', label: 'Expired' },
  [LicenseStatus.Rejected]: { bg: 'bg-red-500/10', border: 'border-red-500/40', text: 'text-red-400', label: 'Rejected' },
};

const LicenseItem: React.FC<{ 
  license: License, 
  onSelect: () => void,
  onUpdateStatus: (id: string, status: LicenseStatus) => Promise<void>,
  updatingStatus: string | null,
  user: User
}> = ({ license, onSelect, onUpdateStatus, updatingStatus, user }) => {
  const status = statusConfig[license.status];
  
  const handleStatusUpdate = async (status: LicenseStatus) => {
    await onUpdateStatus(license.id, status);
  };
  
  return (
    <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-3 hover:border-cyan-500/30 transition-all">
      <div className="flex justify-between items-start">
        <div className="flex-1" onClick={onSelect}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-dark-500">#{license.id.slice(0, 8)}</span>
            <span className={`px-2 py-0.5 text-xs rounded border ${status.bg} ${status.border} ${status.text}`}>
              {status.label}
            </span>
            {license.licenseNumber && (
              <span className="text-xs text-cyan-400 font-mono">{license.licenseNumber}</span>
            )}
          </div>
          <p className="text-cyan-100 font-medium text-sm cursor-pointer hover:text-cyan-300">{license.address}</p>
          <div className="flex items-center gap-4 mt-2 text-dark-500 text-xs">
            <span className="flex items-center gap-1">
              <CalendarIcon className="w-3 h-3" />
              {license.requestedDate ? new Date(license.requestedDate).toLocaleDateString() : 'No date set'}
            </span>
            {license.issuedDate && (
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                Issued: {new Date(license.issuedDate).toLocaleDateString()}
              </span>
            )}
            {license.expiryDate && (
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                Expires: {new Date(license.expiryDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {user.role === 'Inspector' && license.status === LicenseStatus.Pending && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleStatusUpdate(LicenseStatus.InProgress)}
              disabled={updatingStatus === license.id}
              loading={updatingStatus === license.id}
            >
              Start
            </Button>
          )}
          {user.role === 'Inspector' && license.status === LicenseStatus.InProgress && (
            <Button
              size="sm"
              variant="success"
              onClick={() => handleStatusUpdate(LicenseStatus.Issued)}
              disabled={updatingStatus === license.id}
              loading={updatingStatus === license.id}
            >
              Issue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const LicenseList: React.FC<LicenseListProps> = ({ 
  licenses, 
  user, 
  onSelectLicense, 
  onBack,
  onLicensesUpdate 
}) => {
  const [updatingStatus, setUpdatingStatus] = React.useState<string | null>(null);

  const handleUpdateStatus = async (id: string, status: LicenseStatus) => {
    setUpdatingStatus(id);
    try {
      await licensesApi.update(id, { status });
      onLicensesUpdate?.();
    } catch (error) {
      console.error('Failed to update license status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeftIcon className="w-4 h-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-cyan-100">Licenses</h1>
          </div>
        </div>

        {licenses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-dark-400 mb-2">No licenses found</div>
            <div className="text-dark-500 text-sm">Licenses will appear here once they are created</div>
          </div>
        ) : (
          <div className="space-y-3">
            {licenses.map((license) => (
              <LicenseItem
                key={license.id}
                license={license}
                onSelect={() => onSelectLicense(license)}
                onUpdateStatus={handleUpdateStatus}
                updatingStatus={updatingStatus}
                user={user}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LicenseList;
