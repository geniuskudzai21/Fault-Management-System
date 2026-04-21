import React, { useState, useEffect } from 'react';
import { User, LicenseRequest, License } from '../../types';
import { LicenseStatus } from '../../constants';
import Button from '../common/Button';
import { UserIcon, ListIcon } from '../icons';
import { licensesApi, requestsApi } from '../../src/api';

interface ApplicantDashboardProps {
  user: User;
  onRequestLicense: () => void;
  onLicensesUpdate?: () => void;
}

const ApplicantDashboard: React.FC<ApplicantDashboardProps> = ({ 
  user, 
  onRequestLicense,
  onLicensesUpdate
}) => {
  const [requests, setRequests] = useState<LicenseRequest[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [licenseRes, reqRes] = await Promise.all([
          licensesApi.getAll(),
          requestsApi.getAll()
        ]);
        
        if (licenseRes.data) setLicenses(licenseRes.data);
        if (reqRes.data) {
          const myRequests = reqRes.data.filter((r: any) => String(r.applicantId) === String(user.id));
          setRequests(myRequests);
        }
      } catch (err) {
        console.error('Failed to load applicant data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user.id]);

  const requestStatusCounts = {
    pending: requests.filter(r => r.status === 'Pending').length,
    approved: requests.filter(r => r.status === 'Approved').length,
    rejected: requests.filter(r => r.status === 'Rejected').length,
    assigned: requests.filter(r => r.status === 'Assigned').length,
  };

  const statusCounts = {
    pending: licenses.filter(i => i.status === LicenseStatus.Pending).length,
    issued: licenses.filter(i => i.status === LicenseStatus.Issued).length,
    inProgress: licenses.filter(i => i.status === LicenseStatus.InProgress).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="bg-dark-900/80 border border-cyan-500/20 rounded-xl p-3 mb-4 shadow-[0_0_15px_rgba(6,182,212,0.05)]">
        <h3 className="text-xs font-semibold text-cyan-400 mb-2 tracking-wider">REQUEST OVERVIEW</h3>
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-dark-800/50 border border-amber-500/30 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-amber-400">{requestStatusCounts.pending}</p>
            <p className="text-xs text-dark-500">Pending</p>
          </div>
          <div className="bg-dark-800/50 border border-green-500/30 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-green-400">{requestStatusCounts.approved}</p>
            <p className="text-xs text-dark-500">Approved</p>
          </div>
          <div className="bg-dark-800/50 border border-purple-500/30 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-purple-400">{requestStatusCounts.assigned}</p>
            <p className="text-xs text-dark-500">Assigned</p>
          </div>
          <div className="bg-dark-800/50 border border-red-500/30 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-red-400">{requestStatusCounts.rejected}</p>
            <p className="text-xs text-dark-500">Rejected</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-dark-900/80 border border-cyan-500/20 rounded-xl p-3 shadow-[0_0_15px_rgba(6,182,212,0.05)]">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-semibold text-cyan-400 tracking-wider flex items-center gap-2">
              <ListIcon className="w-3 h-3" />
              RECENT REQUESTS
            </h3>
            <Button onClick={onRequestLicense} className="bg-cyan-600 text-dark-950 hover:bg-cyan-500 border-0 text-xs py-1">
              + NEW
            </Button>
          </div>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {requests.length > 0 ? requests.map((request) => (
              <div key={request.id} className="bg-dark-800/50 border border-dark-700 rounded-lg p-2 hover:border-cyan-500/30 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="text-xs text-cyan-100 font-medium">{request.licenseType}</p>
                    <p className="text-xs text-dark-500">{request.address}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded border ${
                    request.status === 'Approved' ? 'border-green-500/40 text-green-400 bg-green-500/10'
                    : request.status === 'Pending' ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                    : request.status === 'Assigned' ? 'border-purple-500/40 text-purple-400 bg-purple-500/10'
                    : 'border-red-500/40 text-red-400 bg-red-500/10'
                  }`}>
                    {request.status}
                  </span>
                </div>
                <p className="text-xs text-dark-600">{request.description}</p>
              </div>
            )) : (
              <div className="text-center py-6 text-dark-500 text-xs">
                No requests yet. Click "New" to start.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-dark-900/80 border border-cyan-500/20 rounded-xl p-3 shadow-[0_0_15px_rgba(6,182,212,0.05)]">
            <h3 className="text-xs font-semibold text-cyan-400 mb-2 tracking-wider">LICENSE STATS</h3>
            <div className="space-y-1">
              <div className="flex justify-between items-center p-2 bg-dark-800/50 border border-amber-500/20 rounded-lg">
                <span className="text-amber-400 text-xs">Pending</span>
                <span className="font-bold text-amber-400 text-sm">{statusCounts.pending}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-dark-800/50 border border-green-500/20 rounded-lg">
                <span className="text-green-400 text-xs">Issued</span>
                <span className="font-bold text-green-400 text-sm">{statusCounts.issued}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-dark-800/50 border border-blue-500/20 rounded-lg">
                <span className="text-blue-400 text-xs">In Progress</span>
                <span className="font-bold text-blue-400 text-sm">{statusCounts.inProgress}</span>
              </div>
            </div>
          </div>

          <div className="bg-dark-900/80 border border-cyan-500/20 rounded-xl p-3 shadow-[0_0_15px_rgba(6,182,212,0.05)]">
            <h3 className="text-xs font-semibold text-cyan-400 mb-2 tracking-wider">QUICK LICENSE REQUEST</h3>
            <div className="space-y-1">
              <Button onClick={onRequestLicense} className="w-full bg-dark-800 border border-cyan-500/30 text-cyan-100 hover:bg-cyan-500/10 hover:border-cyan-400 text-xs py-2 justify-start">
                + Health License
              </Button>
              <Button onClick={onRequestLicense} className="w-full bg-dark-800 border border-cyan-500/30 text-cyan-100 hover:bg-cyan-500/10 hover:border-cyan-400 text-xs py-2 justify-start">
                + Building License
              </Button>
              <Button onClick={onRequestLicense} className="w-full bg-dark-800 border border-cyan-500/30 text-cyan-100 hover:bg-cyan-500/10 hover:border-cyan-400 text-xs py-2 justify-start">
                + Environmental License
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDashboard;
