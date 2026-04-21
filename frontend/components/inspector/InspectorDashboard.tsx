import React, { useState, useEffect, useMemo } from 'react';
import { User, License, LicenseRequest } from '../../types';
import { LicenseStatus } from '../../constants';
import Button from '../common/Button';
import { LocationIcon, CheckCircleIcon, ClipboardDocumentCheckIcon, UserIcon, ExclamationCircleIcon } from '../icons';
import { licensesApi, requestsApi } from '../../src/api';

interface InspectorDashboardProps {
  user: User;
  licenses: License[];
  onViewLicenses: () => void;
  onStartLicense: (licenseId: string) => void;
  onLicensesUpdate?: () => void;
}

const InspectorDashboard: React.FC<InspectorDashboardProps> = ({ 
  user, 
  licenses,
  onViewLicenses,
  onStartLicense,
  onLicensesUpdate
}) => {
  const [assignedRequests, setAssignedRequests] = useState<LicenseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [showStartOptions, setShowStartOptions] = useState<string | null>(null);
  const [creating, setCreating] = useState<string | null>(null);

  const myLicenses = useMemo(() => {
    return licenses.filter(i => i.inspectorId === user.id);
  }, [licenses, user.id]);

  const stats = useMemo(() => ({
    pending: myLicenses.filter(i => i.status === LicenseStatus.Pending).length,
    inProgress: myLicenses.filter(i => i.status === LicenseStatus.InProgress).length,
    issued: myLicenses.filter(i => i.status === LicenseStatus.Issued).length,
    assigned: assignedRequests.length,
  }), [myLicenses, assignedRequests]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const reqRes = await requestsApi.getAll();
        
        if (reqRes.data) {
          const myRequests = reqRes.data.filter((r: any) => String(r.assignedInspectorId) === String(user.id));
          setAssignedRequests(myRequests);
        }
      } catch (err) {
        console.error('Failed to load inspector data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user.id]);

  useEffect(() => {
    if (licenses) {
      const loadRequests = async () => {
        try {
          const reqRes = await requestsApi.getAll();
          if (reqRes.data) {
            const myRequests = reqRes.data.filter((r: any) => String(r.assignedInspectorId) === String(user.id));
            setAssignedRequests(myRequests);
          }
        } catch (err) {
          console.error('Failed to refresh requests', err);
        }
      };
      loadRequests();
    }
  }, [licenses, user.id]);

  const updateLicenseStatus = async (licenseId: string, status: LicenseStatus) => {
    setUpdatingStatus(licenseId);
    try {
      const statusValue = status === LicenseStatus.InProgress ? 'InProgress' : status;
      await licensesApi.update(licenseId, { status: statusValue });
      
      // First update the main licenses list
      if (onLicensesUpdate) {
        await onLicensesUpdate();
      }
    } catch (err) {
      console.error('Failed to update license status:', err);
      console.error('Failed to update inspection status:', err);
      // You could add a toast notification here for better UX
    } finally {
      setUpdatingStatus(null);
    }
  };

  const startLicenseWithStatus = async (request: LicenseRequest, status: LicenseStatus) => {
    setCreating(request.id);
    try {
      const statusValue = status === LicenseStatus.InProgress ? 'InProgress' : status;
      await licensesApi.create({
        applicantId: request.applicantId,
        inspectorId: user.id,
        status: statusValue,
        address: request.address,
        licenseType: request.licenseType,
        description: request.description,
        department: request.department,
      });
      setShowStartOptions(null);
      
      if (onLicensesUpdate) {
        onLicensesUpdate();
      }
      const reqRes = await requestsApi.getAll();
      if (reqRes.data) {
        const myRequests = reqRes.data.filter((r: any) => String(r.assignedInspectorId) === String(user.id));
        setAssignedRequests(myRequests);
      }
    } catch (err) {
      console.error('Failed to start license:', err);
    } finally {
      setCreating(null);
    }
  };

  const getDepartmentInfo = (dept: string) => {
    const deptMap: Record<string, { name: string; desc: string; color: string }> = {
      Health: { name: 'Health', desc: 'Food safety, hygiene & sanitation licenses', color: 'green' },
      Engineering: { name: 'Engineering', desc: 'Structural, roads & infrastructure licenses', color: 'blue' },
      Environmental: { name: 'Environmental', desc: 'Pollution, waste & environmental compliance licenses', color: 'purple' },
    };
    return deptMap[dept] || { name: dept, desc: 'General municipal licenses', color: 'cyan' };
  };

  const deptInfo = getDepartmentInfo(user.department as string);

  const statCards = [
    { label: 'PENDING', value: stats.pending, color: 'amber', icon: ExclamationCircleIcon },
    { label: 'IN PROGRESS', value: stats.inProgress, color: 'blue', icon: ClipboardDocumentCheckIcon },
    { label: 'ISSUED', value: stats.issued, color: 'green', icon: CheckCircleIcon },
    { label: 'ASSIGNED', value: stats.assigned, color: 'purple', icon: UserIcon },
  ];

  const colorMap: Record<string, { bg: string; border: string; text: string; hover: string }> = {
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', hover: 'hover:border-amber-400 hover:bg-amber-500/10' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', hover: 'hover:border-blue-400 hover:bg-blue-500/10' },
    green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', hover: 'hover:border-green-400 hover:bg-green-500/10' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', hover: 'hover:border-purple-400 hover:bg-purple-500/10' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', hover: 'hover:border-cyan-400 hover:bg-cyan-500/10' },
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
      <div className="bg-dark-900/80 border border-cyan-500/20 rounded-xl p-4 mb-4 shadow-[0_0_15px_rgba(6,182,212,0.05)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500/30 to-cyan-600/30 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xl">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-cyan-100">Welcome, {user.name}</h3>
              <p className="text-dark-500 text-sm flex items-center gap-1">
                <LocationIcon className="w-4 h-4" />
                {user.department} Department
              </p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-lg ${colorMap[deptInfo.color].bg} ${colorMap[deptInfo.color].border} border`}>
            <p className={`text-xs ${colorMap[deptInfo.color].text}`}>{deptInfo.name} Inspector</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {statCards.map((stat) => {
          const colors = colorMap[stat.color];
          const Icon = stat.icon;
          return (
            <div 
              key={stat.label}
              className={`bg-dark-900/80 border ${colors.border} rounded-xl p-4 shadow-[0_0_10px_rgba(6,182,212,0.03)]`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-dark-500 font-medium">{stat.label}</span>
                <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${colors.text}`} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${colors.text}`}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <div className="bg-dark-900/80 border border-cyan-500/20 rounded-xl p-3 shadow-[0_0_15px_rgba(6,182,212,0.05)]">
            <h3 className="text-xs font-semibold text-cyan-400 mb-3 flex items-center gap-2 tracking-wider">
              <ClipboardDocumentCheckIcon className="w-3 h-3" />
              MY ASSIGNED REQUESTS
            </h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {assignedRequests.length > 0 ? assignedRequests.map((request) => {
                const license = licenses.find(i => i.address === request.address);
                
                return (
                  <div key={request.id} className="bg-dark-800/50 border border-dark-700 rounded-lg p-3 hover:border-cyan-500/30 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-sm text-cyan-100 font-medium truncate">{request.licenseType}</p>
                          <span className={`px-2 py-0.5 text-[10px] rounded border ${
                            request.status === 'Approved' ? 'border-green-500/40 text-green-400 bg-green-500/10'
                            : request.status === 'Pending' ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                            : request.status === 'Assigned' ? 'border-purple-500/40 text-purple-400 bg-purple-500/10'
                            : 'border-red-500/40 text-red-400 bg-red-500/10'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                        <p className="text-xs text-dark-500">{request.address}</p>
                        <p className="text-xs text-dark-500 mt-1">{request.description}</p>
                        {license && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-0.5 text-xs rounded border ${
                              license.status === 'Pending' 
                                ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                                : license.status === 'InProgress'
                                ? 'border-blue-500/40 text-blue-400 bg-blue-500/10'
                                : license.status === 'Issued'
                                ? 'border-green-500/40 text-green-400 bg-green-500/10'
                                : 'border-red-500/40 text-red-400 bg-red-500/10'
                            }`}>
                              {license.status}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-1">
                        {license && (
                          <>
                            {license.status === 'Pending' && (
                              <div className="flex gap-1">
                                <Button 
                                  onClick={() => updateLicenseStatus(license.id, LicenseStatus.InProgress)} 
                                  disabled={updatingStatus === license.id}
                                  className="bg-blue-600 text-dark-950 hover:bg-blue-500 text-xs py-1 px-2 sm:px-3 border-0 disabled:opacity-50 flex-1 sm:flex-none"
                                >
                                  {updatingStatus === license.id ? '...' : 'IP'}
                                </Button>
                                <Button 
                                  onClick={() => updateLicenseStatus(license.id, LicenseStatus.Issued)} 
                                  disabled={updatingStatus === license.id}
                                  className="bg-green-600 text-dark-950 hover:bg-green-500 text-xs py-1 px-2 sm:px-3 border-0 disabled:opacity-50 flex-1 sm:flex-none"
                                >
                                  {updatingStatus === license.id ? '...' : 'ISSUE'}
                                </Button>
                              </div>
                            )}
                            {license.status === 'InProgress' && (
                              <Button 
                                onClick={() => updateLicenseStatus(license.id, LicenseStatus.Issued)} 
                                disabled={updatingStatus === license.id}
                                className="bg-green-600 text-dark-950 hover:bg-green-500 text-xs py-1 px-2 sm:px-3 border-0 disabled:opacity-50 w-full sm:w-auto"
                              >
                                {updatingStatus === license.id ? '...' : 'ISSUE'}
                              </Button>
                            )}
                          </>
                        )}
                        {!license && (
                          <>
                            {showStartOptions === request.id ? (
                              <div className="flex gap-1">
                                <Button 
                                  onClick={() => startLicenseWithStatus(request, LicenseStatus.InProgress)} 
                                  disabled={creating === request.id}
                                  className="bg-blue-600 text-dark-950 hover:bg-blue-500 text-xs py-1 px-2 sm:px-3 border-0 disabled:opacity-50 flex-1 sm:flex-none"
                                >
                                  {creating === request.id ? '...' : 'IP'}
                                </Button>
                                <Button 
                                  onClick={() => startLicenseWithStatus(request, LicenseStatus.Issued)} 
                                  disabled={creating === request.id}
                                  className="bg-green-600 text-dark-950 hover:bg-green-500 text-xs py-1 px-2 sm:px-3 border-0 disabled:opacity-50 flex-1 sm:flex-none"
                                >
                                  {creating === request.id ? '...' : 'ISSUE'}
                                </Button>
                              </div>
                            ) : (
                              <Button 
                                onClick={() => setShowStartOptions(request.id)} 
                                className="bg-cyan-600 text-dark-950 hover:bg-cyan-500 text-xs py-1 px-2 border-0"
                              >
                                START
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-8 text-dark-500 text-sm bg-dark-800/30 rounded-lg">
                  No assigned requests
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-dark-900/80 border border-cyan-500/20 rounded-xl p-4 shadow-[0_0_15px_rgba(6,182,212,0.05)]">
          <h3 className="text-xs font-semibold text-cyan-400 mb-3 flex items-center gap-2 tracking-wider">
            <UserIcon className="w-3 h-3" />
            MY DEPARTMENT
          </h3>
          <div className={`${colorMap[deptInfo.color].bg} ${colorMap[deptInfo.color].border} border rounded-xl p-4 mb-4`}>
            <div className="flex items-center gap-3 mb-2">
              <LocationIcon className={`w-5 h-5 ${colorMap[deptInfo.color].text}`} />
              <span className={`text-sm font-semibold ${colorMap[deptInfo.color].text}`}>{deptInfo.name}</span>
            </div>
            <p className="text-xs text-dark-400">{deptInfo.desc}</p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-cyan-300">QUICK STATS</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-dark-800/50 rounded-lg">
                <span className="text-xs text-dark-500">Total Assigned</span>
                <span className="text-sm font-bold text-cyan-400">{stats.assigned}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-dark-800/50 rounded-lg">
                <span className="text-xs text-dark-500">Pending</span>
                <span className="text-sm font-bold text-amber-400">{stats.pending}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-dark-800/50 rounded-lg">
                <span className="text-xs text-dark-500">In Progress</span>
                <span className="text-sm font-bold text-blue-400">{stats.inProgress}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-dark-800/50 rounded-lg">
                <span className="text-xs text-dark-500">Completed</span>
                <span className="text-sm font-bold text-green-400">{stats.completed}</span>
              </div>
            </div>
            <div className="border-t border-cyan-500/20 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-dark-500">Completion Rate</span>
                <span className="text-sm font-bold text-green-400">
                  {stats.assigned > 0 
                    ? Math.round((stats.completed / stats.assigned) * 100)
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-dark-800 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${stats.assigned > 0 ? (stats.completed / stats.assigned) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectorDashboard;
