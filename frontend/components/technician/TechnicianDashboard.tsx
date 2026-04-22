import React, { useState, useMemo } from 'react';
import { User, Fault } from '../../types';
import { FaultStatus } from '../../constants';
import { faultsApi } from '../../src/api';
import { ExclamationCircleIcon, ClockIcon, CheckCircleIcon, WrenchIcon } from '../icons';

interface TechnicianDashboardProps {
  user: User;
  faults: Fault[];
  onFaultsUpdate: () => void;
}

const TechnicianDashboard: React.FC<TechnicianDashboardProps> = ({ 
  user, 
  faults,
  onFaultsUpdate
}) => {
  const [loading, setLoading] = useState(false);
  const [updatingFault, setUpdatingFault] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const myFaults = useMemo(() => {
        return faults.filter(fault => 
      String(fault.technicianId) === String(user.id)
    );
  }, [faults, user.id]);

  const filteredFaults = useMemo(() => {
    return myFaults.filter(fault => {
      const statusMatch = filterStatus === 'all' || fault.status === filterStatus;
      const priorityMatch = filterPriority === 'all' || fault.priority === filterPriority;
      return statusMatch && priorityMatch;
    });
  }, [myFaults, filterStatus, filterPriority]);

  const stats = useMemo(() => ({
    total: myFaults.length,
    inProgress: myFaults.filter(f => f.status === FaultStatus.InProgress).length,
    resolved: myFaults.filter(f => f.status === FaultStatus.Resolved).length,
  }), [myFaults]);

  const updateFaultStatus = async (faultId: string, status: FaultStatus) => {
    setUpdatingFault(faultId);
    try {
      const updateData: any = { status };
      if (status === FaultStatus.InProgress) {
        updateData.assignedDate = new Date().toISOString();
      } else if (status === FaultStatus.Resolved) {
        updateData.resolvedDate = new Date().toISOString();
      }
      await faultsApi.update(faultId, updateData);
      await onFaultsUpdate();
    } catch (error) {
      console.error('Failed to update fault status:', error);
      alert('Failed to update fault status. Please try again.');
    } finally {
      setUpdatingFault(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex" style={{ 
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1f3a 25%, #0f172a 50%, #1e293b 75%, #0a0a0f 100%)',
      minHeight: '100vh' 
    }}>
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Technician Dashboard</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-8">
            <div 
              className="p-6 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer border"
              style={{ backgroundColor: 'rgba(2, 9, 29, 1)', borderColor: '#dc2626' }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: '#dc2626' }}
                >
                  <ExclamationCircleIcon className="w-6 h-6" style={{ color: '#dc2626' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                  <p className="text-sm font-small" style={{ color: '#9ca3af' }}>Total Faults</p>
                </div>
              </div>
            </div>

            <div 
              className="p-6 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer border"
              style={{ backgroundColor: 'rgba(2, 9, 29, 1)', borderColor: '#8b5cf6' }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: '#8b5cf6' }}
                >
                  <WrenchIcon className="w-6 h-6" style={{ color: '#8b5cf6' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.inProgress}</p>
                  <p className="text-sm font-small" style={{ color: '#9ca3af' }}>In Progress</p>
                </div>
              </div>
            </div>

            <div 
              className="p-6 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer border"
              style={{ backgroundColor: 'rgba(2, 9, 29, 1)', borderColor: '#10b981' }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: '#10b981' }}
                >
                  <CheckCircleIcon className="w-6 h-6" style={{ color: '#10b981' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.resolved}</p>
                  <p className="text-sm font-small" style={{ color: '#9ca3af' }}>Resolved</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div 
            className="rounded-2xl p-4 mt-8"
            style={{ backgroundColor: 'rgba(2, 9, 29, 1)' }}
          >
            <div className="flex flex-col lg:flex-row gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 rounded-lg border focus:outline-none"
                style={{ backgroundColor: 'rgba(10,10,15,0.95)', borderColor: 'rgba(0,51,160,0.2)', color: 'white', borderWidth: '1px' }}
              >
                <option value="all" style={{ color: 'white' }}>All Status</option>
                <option value="Reported" style={{ color: 'white' }}>Reported</option>
                <option value="In Progress" style={{ color: 'white' }}>In Progress</option>
                <option value="Resolved" style={{ color: 'white' }}>Resolved</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-4 py-2.5 rounded-lg border focus:outline-none"
                style={{ backgroundColor: 'rgba(10,10,15,0.95)', borderColor: 'rgba(0,51,160,0.2)', color: 'white', borderWidth: '1px' }}
              >
                <option value="all" style={{ color: 'white' }}>All Priority</option>
                <option value="High" style={{ color: 'white' }}>High</option>
                <option value="Medium" style={{ color: 'white' }}>Medium</option>
                <option value="Low" style={{ color: 'white' }}>Low</option>
              </select>
            </div>
          </div>

          {/* Faults Table */}
          <div 
            className="rounded-2xl mt-8 overflow-hidden border"
            style={{ backgroundColor: 'rgba(2, 9, 29, 1)', borderColor: 'rgba(0,51,160,0.2)' }}
          >
            <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(0,51,160,0.15)' }}>
              <h3 className="text-lg font-semibold text-white">My Assigned Faults</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#0b1326' }}>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase" style={{ color: '#9ca3af' }}>Fault ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase" style={{ color: '#9ca3af' }}>Address</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase" style={{ color: '#9ca3af' }}>Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase" style={{ color: '#9ca3af' }}>Priority</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase" style={{ color: '#9ca3af' }}>Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase" style={{ color: '#9ca3af' }}>Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase" style={{ color: '#9ca3af' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFaults.map((fault) => (
                    <tr 
                      key={fault.id} 
                      className="border-t transition-colors hover:bg-white/5"
                      style={{ borderColor: 'rgba(0,51,160,0.08)' }}
                    >
                      <td className="px-6 py-4">
                        <span className="text-white text-sm font-medium">{fault.faultNumber || `FLT-${fault.id}`}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white text-sm">{fault.address}</p>
                          <p className="text-xs" style={{ color: '#9ca3af' }}>{fault.area}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white text-sm">{fault.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg inline-flex"
                          style={{ 
                            backgroundColor: fault.priority === 'High' ? 'rgba(220,38,38,0.15)' : fault.priority === 'Medium' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                            color: fault.priority === 'High' ? '#ef4444' : fault.priority === 'Medium' ? '#f59e0b' : '#10b981'
                          }}
                        >
                          {fault.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg inline-flex"
                          style={{ 
                            backgroundColor: fault.status === FaultStatus.Resolved ? 'rgba(16,185,129,0.15)' : fault.status === FaultStatus.InProgress ? 'rgba(139,92,246,0.15)' : 'rgba(245,158,11,0.15)',
                            color: fault.status === FaultStatus.Resolved ? '#10b981' : fault.status === FaultStatus.InProgress ? '#8b5cf6' : '#f59e0b'
                          }}
                        >
                          {fault.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white text-sm">{formatDate(fault.reportedDate)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {(fault.status === 'Reported' || fault.status === 'Assigned' || fault.status === FaultStatus.Reported) && (
                            <button
                              onClick={() => updateFaultStatus(fault.id, FaultStatus.InProgress)}
                              disabled={updatingFault === fault.id}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer hover:opacity-80"
                              style={{ backgroundColor: '#8b5cf6', color: 'white' }}
                            >
                              <WrenchIcon className="w-3 h-3" />
                              {updatingFault === fault.id ? 'Starting...' : 'Start Work'}
                            </button>
                          )}
                          {(fault.status === 'In Progress' || fault.status === FaultStatus.InProgress) && (
                            <button
                              onClick={() => updateFaultStatus(fault.id, FaultStatus.Resolved)}
                              disabled={updatingFault === fault.id}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer hover:opacity-80"
                              style={{ backgroundColor: '#10b981', color: 'white' }}
                            >
                              <CheckCircleIcon className="w-3 h-3" />
                              {updatingFault === fault.id ? 'Resolving...' : 'Mark Resolved'}
                            </button>
                          )}
                          {(fault.status === 'Resolved' || fault.status === FaultStatus.Resolved) && (
                            <span className="flex items-center gap-1 text-xs font-medium" style={{ color: '#10b981' }}>
                              <CheckCircleIcon className="w-3 h-3" />
                              Completed
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredFaults.length === 0 && (
              <div className="text-center py-8" style={{ color: '#9ca3af' }}>
                <p className="text-sm">No faults assigned to you</p>
                <p className="text-xs mt-1">Check back later for new assignments</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;