import React, { useState, useEffect } from 'react';
import { User, Fault } from '../../types';
import { FaultStatus, UserRole } from '../../constants';
import Button from '../common/Button';
import { faultsApi, usersApi } from '../../src/api';
import { ArrowLeftIcon, ListIcon, PlusIcon, TrashIcon, MagnifyingGlassIcon, Squares2X2Icon, XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, ClockIcon } from '../icons';

interface FaultManagementProps {
  user: User;
  faults: Fault[];
  onFaultsUpdate: () => void;
  onBack: () => void;
}

const FaultManagement: React.FC<FaultManagementProps> = ({ 
  user, 
  faults,
  onFaultsUpdate,
  onBack
}) => {
  const [loading, setLoading] = useState(true);
  const [updatingFault, setUpdatingFault] = useState<string | null>(null);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loadTechnicians = async () => {
      try {
        const response = await usersApi.getAll();
        if (response.data) {
          setTechnicians(response.data.filter((u: User) => u.role === UserRole.Technician));
        }
      } catch (error) {
        console.error('Failed to load technicians:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTechnicians();
  }, []);

  const filteredFaults = faults.filter(fault => {
    const matchesSearch = fault.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fault.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (fault.fault_number || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || fault.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || fault.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const assignFault = async (faultId: string, technicianId: string) => {
    setUpdatingFault(faultId);
    try {
      await faultsApi.assign(faultId, technicianId);
      await onFaultsUpdate();
    } catch (error) {
      console.error('Failed to assign fault:', error);
    } finally {
      setUpdatingFault(null);
    }
  };

  const updateFaultStatus = async (faultId: string, status: FaultStatus) => {
    setUpdatingFault(faultId);
    try {
      await faultsApi.update(faultId, { status });
      await onFaultsUpdate();
    } catch (error) {
      console.error('Failed to update fault status:', error);
    } finally {
      setUpdatingFault(null);
    }
  };

  const deleteFault = async (faultId: string) => {
    if (!window.confirm('Are you sure you want to delete this fault?')) return;
    setUpdatingFault(faultId);
    try {
      await faultsApi.delete(faultId);
      await onFaultsUpdate();
    } catch (error) {
      console.error('Failed to delete fault:', error);
    } finally {
      setUpdatingFault(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const stats = {
    total: faults.length,
    reported: faults.filter(f => f.status === FaultStatus.Reported).length,
    inProgress: faults.filter(f => f.status === FaultStatus.InProgress).length,
    resolved: faults.filter(f => f.status === FaultStatus.Resolved).length,
  };

  if (loading) {
    return (
      <div className="flex" style={{ backgroundColor: 'rgba(10,10,15,0.95)', minHeight: '100vh' }}>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex" style={{ backgroundColor: 'rgba(10,10,15,0.95)', minHeight: '100vh' }}>
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside 
        className={`w-64 flex-shrink-0 fixed inset-y-0 left-0 z-40 overflow-hidden transition-transform duration-300 -translate-x-full lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : ''}`}
        style={{ backgroundColor: 'rgba(2, 9, 29, 1)' }}
      >
        <div className="flex flex-col h-full">
          <div className="h-20 flex items-center px-6 border-b" style={{ borderColor: 'rgba(0,51,160,0.15)' }}>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-hidden">
            <button
              onClick={onBack}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white transition-all cursor-pointer font-medium"
              style={{ backgroundColor: '#0033a0' }}
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer font-medium"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <ListIcon className="w-5 h-5" />
              <span>Faults</span>
            </button>
          </nav>

          <div className="p-4 border-t" style={{ borderColor: 'rgba(0,51,160,0.15)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold" style={{ backgroundColor: '#0033a0', color: '#fed000' }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs" style={{ color: '#fed000' }}>Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto transition-all duration-300 lg:ml-64">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          <div className="flex items-center gap-4 mb-6 lg:mb-8">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden flex p-2 rounded-lg transition-colors hover:bg-white/10"
              style={{ color: '#fed000' }}
              title="Open menu"
            >
              <Squares2X2Icon className="w-6 h-6" />
            </button>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Fault Management</h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div 
              className="p-6 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer border"
              style={{ backgroundColor: 'rgba(2, 9, 29, 1)', borderColor: '#dc2626' }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: '#dc2626' }}
                >
                  <ListIcon className="w-6 h-6" style={{ color: '#dc2626' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                  <p className="text-sm font-small" style={{ color: '#9ca3af' }}>Total Faults</p>
                </div>
              </div>
            </div>

            <div 
              className="p-6 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer border"
              style={{ backgroundColor: 'rgba(2, 9, 29, 1)', borderColor: '#f59e0b' }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: '#f59e0b' }}
                >
                  <ExclamationCircleIcon className="w-6 h-6" style={{ color: '#f59e0b' }} />
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

          <div className="rounded-2xl p-4 mb-6" style={{ backgroundColor: 'rgba(2, 9, 29, 1)' }}>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#9ca3af' }} />
                <input
                  type="text"
                  placeholder="Search faults..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border focus:outline-none"
                  style={{ backgroundColor: 'rgba(10,10,15,0.95)', borderColor: 'rgba(0,51,160,0.2)', color: 'white', borderWidth: '1px' }}
                />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2.5 rounded-lg border focus:outline-none"
                style={{ backgroundColor: 'rgba(10,10,15,0.95)', borderColor: 'rgba(0,51,160,0.2)', color: 'white', borderWidth: '1px' }}
              >
                <option value="all" style={{ color: 'white' }}>All Status</option>
                <option value="Reported" style={{ color: 'white' }}>Reported</option>
                <option value="In Progress" style={{ color: 'white' }}>In Progress</option>
                <option value="Resolved" style={{ color: 'white' }}>Resolved</option>
              </select>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-4 py-2.5 rounded-lg border focus:outline-none"
                style={{ backgroundColor: 'rgba(10,10,15,0.95)', borderColor: 'rgba(0,51,160,0.2)', color: 'white', borderWidth: '1px' }}
              >
                <option value="all" style={{ color: 'white' }}>All Priorities</option>
                <option value="High" style={{ color: 'white' }}>High</option>
                <option value="Medium" style={{ color: 'white' }}>Medium</option>
                <option value="Low" style={{ color: 'white' }}>Low</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'rgba(2, 9, 29, 1)' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#0b1326' }}>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Fault ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Address</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Priority</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Actions</th>
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
                        <span className="text-sm font-medium text-white">{fault.fault_number || fault.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm" style={{ color: '#9ca3af' }}>{fault.address}</p>
                          <p className="text-xs" style={{ color: '#6b7280' }}>{fault.area}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm" style={{ color: '#9ca3af' }}>{fault.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1.5 text-xs font-medium rounded-lg inline-flex" style={{ 
                          backgroundColor: fault.priority === 'High' ? 'rgba(220,38,38,0.15)' 
                          : fault.priority === 'Medium' ? 'rgba(245,158,11,0.15)' 
                          : 'rgba(16,185,129,0.15)',
                          color: fault.priority === 'High' ? '#dc2626' 
                          : fault.priority === 'Medium' ? '#f59e0b' 
                          : '#10b981'
                        }}>
                          {fault.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1.5 text-xs font-medium rounded-lg inline-flex" style={{ 
                          backgroundColor: fault.status === FaultStatus.Reported ? 'rgba(59,130,246,0.15)' 
                          : fault.status === FaultStatus.InProgress ? 'rgba(245,158,11,0.15)' 
                          : 'rgba(16,185,129,0.15)',
                          color: fault.status === FaultStatus.Reported ? '#3b82f6' 
                          : fault.status === FaultStatus.InProgress ? '#f59e0b' 
                          : '#10b981'
                        }}>
                          {fault.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm" style={{ color: '#9ca3af' }}>{formatDate(fault.reportedDate)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                assignFault(fault.id, e.target.value);
                              }
                            }}
                            className="px-2 py-1.5 rounded-lg border text-xs"
                            style={{ backgroundColor: 'rgba(10,10,15,0.95)', borderColor: 'rgba(0,51,160,0.2)', color: 'white' }}
                            disabled={updatingFault === fault.id}
                          >
                            <option value="">
                              {fault.technicianId ? 'Reassign' : 'Assign Tech'}
                            </option>
                            {technicians.map((tech) => (
                              <option key={tech.id} value={tech.id}>
                                {tech.name}
                              </option>
                            ))}
                          </select>
                          {fault.technicianId && (
                            <span className="px-2 py-1 text-xs font-medium rounded-lg inline-flex" style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                              Assigned
                            </span>
                          )}
                          <button
                            onClick={() => deleteFault(fault.id)}
                            disabled={updatingFault === fault.id}
                            className="p-2 rounded-lg transition-colors hover:bg-red-500/20 text-red-400 ml-2"
                            title="Delete fault"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredFaults.length === 0 && (
            <div className="text-center py-12" style={{ color: '#6b7280' }}>
              <ListIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No faults found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaultManagement;