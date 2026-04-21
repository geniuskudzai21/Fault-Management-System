import React, { useState, useMemo } from 'react';
import { User, Fault } from '../../types';
import { FaultStatus } from '../../constants';
import Button from '../common/Button';
import { ArrowLeftIcon, DocumentTextIcon, MagnifyingGlassIcon, Squares2X2Icon, CheckCircleIcon, ExclamationCircleIcon, ClockIcon } from '../icons';

interface ReportsProps {
  user: User;
  faults: Fault[];
  onBack: () => void;
}

const Reports: React.FC<ReportsProps> = ({ 
  user, 
  faults,
  onBack
}) => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [selectedReport, setSelectedReport] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const stats = useMemo(() => {
    const totalFaults = faults.length;
    const resolvedFaults = faults.filter(f => f.status === FaultStatus.Resolved).length;
    const inProgressFaults = faults.filter(f => f.status === FaultStatus.InProgress).length;
    const reportedFaults = faults.filter(f => f.status === FaultStatus.Reported).length;
    
    const resolutionRate = totalFaults > 0 ? Math.round((resolvedFaults / totalFaults) * 100) : 0;
    
    const highPriority = faults.filter(f => f.priority === 'High').length;
    const mediumPriority = faults.filter(f => f.priority === 'Medium').length;
    const lowPriority = faults.filter(f => f.priority === 'Low').length;
    
    const categoryBreakdown = faults.reduce((acc, fault) => {
      acc[fault.category] = (acc[fault.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalFaults,
      resolvedFaults,
      inProgressFaults,
      reportedFaults,
      resolutionRate,
      highPriority,
      mediumPriority,
      lowPriority,
      categoryBreakdown
    };
  }, [faults]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
              <DocumentTextIcon className="w-5 h-5" />
              <span>Reports</span>
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
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Reports</h1>
          </div>

          <div className="rounded-2xl p-4 mb-6" style={{ backgroundColor: 'rgba(2, 9, 29, 1)' }}>
            <div className="flex flex-col lg:flex-row gap-4">
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="px-4 py-2.5 rounded-lg border focus:outline-none flex-1"
                style={{ backgroundColor: 'rgba(10,10,15,0.95)', borderColor: 'rgba(0,51,160,0.2)', color: 'white', borderWidth: '1px' }}
              >
                <option value="overview" style={{ color: 'white' }}>Overview Report</option>
                <option value="faults" style={{ color: 'white' }}>Fault Report</option>
                <option value="performance" style={{ color: 'white' }}>Performance Report</option>
                <option value="users" style={{ color: 'white' }}>User Report</option>
              </select>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                className="px-4 py-2.5 rounded-lg border focus:outline-none"
                style={{ backgroundColor: 'rgba(10,10,15,0.95)', borderColor: 'rgba(0,51,160,0.2)', color: 'white', borderWidth: '1px' }}
              />
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                className="px-4 py-2.5 rounded-lg border focus:outline-none"
                style={{ backgroundColor: 'rgba(10,10,15,0.95)', borderColor: 'rgba(0,51,160,0.2)', color: 'white', borderWidth: '1px' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <div 
              className="p-6 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer border"
              style={{ backgroundColor: 'rgba(2, 9, 29, 1)', borderColor: '#dc2626' }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: '#dc2626' }}
                >
                  <DocumentTextIcon className="w-6 h-6" style={{ color: '#dc2626' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalFaults}</p>
                  <p className="text-sm font-small" style={{ color: '#9ca3af' }}>Total Faults</p>
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
                  <p className="text-2xl font-bold text-white">{stats.resolvedFaults}</p>
                  <p className="text-sm font-small" style={{ color: '#9ca3af' }}>Resolved</p>
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
                  <ClockIcon className="w-6 h-6" style={{ color: '#f59e0b' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.inProgressFaults}</p>
                  <p className="text-sm font-small" style={{ color: '#9ca3af' }}>In Progress</p>
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
                  <ExclamationCircleIcon className="w-6 h-6" style={{ color: '#8b5cf6' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.resolutionRate}%</p>
                  <p className="text-sm font-small" style={{ color: '#9ca3af' }}>Resolution Rate</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="rounded-2xl p-6" style={{ backgroundColor: 'rgba(2, 9, 29, 1)' }}>
              <h3 className="text-lg font-semibold text-white mb-4">Priority Breakdown</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: '#9ca3af' }}>High Priority</span>
                  <span className="px-3 py-1.5 text-xs font-medium rounded-lg" style={{ backgroundColor: 'rgba(220,38,38,0.15)', color: '#dc2626' }}>
                    {stats.highPriority}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: '#9ca3af' }}>Medium Priority</span>
                  <span className="px-3 py-1.5 text-xs font-medium rounded-lg" style={{ backgroundColor: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                    {stats.mediumPriority}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: '#9ca3af' }}>Low Priority</span>
                  <span className="px-3 py-1.5 text-xs font-medium rounded-lg" style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                    {stats.lowPriority}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-6" style={{ backgroundColor: 'rgba(2, 9, 29, 1)' }}>
              <h3 className="text-lg font-semibold text-white mb-4">Category Breakdown</h3>
              <div className="space-y-4">
                {Object.entries(stats.categoryBreakdown).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: '#9ca3af' }}>{category}</span>
                    <span className="px-3 py-1.5 text-xs font-medium rounded-lg" style={{ backgroundColor: 'rgba(0,51,160,0.15)', color: '#fed000' }}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'rgba(2, 9, 29, 1)' }}>
            <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(0,51,160,0.15)' }}>
              <h3 className="text-lg font-semibold text-white">Recent Faults</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#0b1326' }}>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Fault ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Address</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Category</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {faults.slice(0, 10).map((fault) => (
                    <tr 
                      key={fault.id} 
                      className="border-t transition-colors hover:bg-white/5"
                      style={{ borderColor: 'rgba(0,51,160,0.08)' }}
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-white">{fault.fault_number || fault.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm" style={{ color: '#9ca3af' }}>{fault.address}</span>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {faults.length === 0 && (
            <div className="text-center py-12" style={{ color: '#6b7280' }}>
              <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No fault data available for reporting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;