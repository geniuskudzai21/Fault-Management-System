import React, { useState, useEffect } from 'react';
import { User, Fault } from '../../types';
import { DashboardIcon, UserIcon, ListIcon, SettingsIcon, DocumentTextIcon, BuildingOfficeIcon, MenuIcon, XMarkIcon, ExclamationCircleIcon, CheckCircleIcon, ClockIcon, Squares2X2Icon } from '../icons';
import { usersApi, faultsApi, schedulesApi } from '../../src/api';
import FaultTrendChart from '../charts/FaultTrendChart';
import PerformancePieChart from '../charts/PerformancePieChart';

interface AdminDashboardProps {
  user: User;
  faults: Fault[];
  onManageUsers: () => void;
  onManageFaults: () => void;
  onManageSchedules: () => void;
  onGenerateReports: () => void;
  onGenerateNewReport: () => void;
  onSystemSettings: () => void;
  onFaultsUpdate?: () => void;
  onViewAllActivities?: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  onClick: () => void;
  active?: boolean;
  badge?: number;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  faults,
  onManageUsers,
  onManageFaults,
  onManageSchedules,
  onGenerateReports,
  onGenerateNewReport,
  onSystemSettings,
  onFaultsUpdate,
  onViewAllActivities
}) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFaults: 0,
    resolvedFaults: 0,
    activeLoadShedding: 0,
    pendingFaults: 0,
    inProgressFaults: 0,
    todayFaults: 0,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [sidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersRes, faultsRes, schedulesRes] = await Promise.allSettled([
          usersApi.getStats(),
          faultsApi.getStats(),
          schedulesApi.getStats(),
        ]);

        const userStats = usersRes.status === 'fulfilled' ? usersRes.value.data : null;
        const faultStats = faultsRes.status === 'fulfilled' ? faultsRes.value.data : null;
        const scheduleStats = schedulesRes.status === 'fulfilled' ? schedulesRes.value.data : null;

        const today = new Date().toDateString();
        const todayFaults = faults?.filter((f: any) => new Date(f.reportedDate).toDateString() === today).length || 0;

        setStats({
          totalUsers: userStats?.total ?? 0,
          totalFaults: faultStats?.total ?? 0,
          resolvedFaults: faultStats?.resolved ?? 0,
          activeLoadShedding: scheduleStats?.active ?? 0,
          pendingFaults: faultStats?.reported ?? 0,
          inProgressFaults: faultStats?.inProgress ?? 0,
          todayFaults,
        });

        const usersRes2 = await usersApi.getAll();
        if (usersRes2.data) {
          setRecentUsers(usersRes2.data.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoadingStats(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const refreshTimer = setInterval(() => onFaultsUpdate?.(), 30000);
    return () => clearInterval(refreshTimer);
  }, [onFaultsUpdate]);

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Overview', icon: DashboardIcon, onClick: () => {}, active: true },
    { id: 'users', label: 'Users', icon: UserIcon, onClick: onManageUsers, badge: stats.totalUsers },
    { id: 'faults', label: 'Faults', icon: ListIcon, onClick: onManageFaults, badge: stats.pendingFaults },
    { id: 'schedules', label: 'Schedules', icon: BuildingOfficeIcon, onClick: onManageSchedules },
    { id: 'reports', label: 'Report Overview', icon: DocumentTextIcon, onClick: onGenerateReports },
    { id: 'generate', label: 'Generate Reports', icon: DocumentTextIcon, onClick: onGenerateNewReport },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, onClick: onSystemSettings },
  ];

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: UserIcon, color: '#0033a0', bgColor: 'rgba(0,51,160,0.15)' },
    { label: 'Total Faults', value: stats.totalFaults, icon: ExclamationCircleIcon, color: '#dc2626', bgColor: 'rgba(220,38,38,0.15)' },
    { label: 'Pending', value: stats.pendingFaults, icon: ClockIcon, color: '#f59e0b', bgColor: 'rgba(245,158,11,0.15)' },
    { label: 'In Progress', value: stats.inProgressFaults, icon: ListIcon, color: '#8b5cf6', bgColor: 'rgba(139,92,246,0.15)' },
    { label: 'Resolved', value: stats.resolvedFaults, icon: CheckCircleIcon, color: '#10b981', bgColor: 'rgba(16,185,129,0.15)' },
  ];

  const recentActivities = [
    ...recentUsers.slice(0, 3).map(user => ({
      id: `user-${user.id}`,
      name: user.name,
      email: user.email,
      type: 'User Registration',
      amount: user.role || 'Customer',
      date: user.registrationDate || new Date().toISOString().split('T')[0],
      status: user.status === 'Active' ? 'Active' : user.status === 'Pending' ? 'Pending' : 'Inactive'
    })),
    ...faults.slice(0, 3).map(fault => {
      const customerName = recentUsers.find(user => String(user.id) === String(fault.customerId))?.name || 'Unknown';
      return {
        id: `fault-${fault.id}`,
        name: `${customerName} - ${fault.category || 'Fault'}`,
        email: `Fault #${fault.faultNumber || fault.id}`,
        type: fault.category || 'Fault Report',
        amount: fault.priority || 'Medium',
        date: fault.reportedDate || new Date().toISOString().split('T')[0],
        status: fault.status || 'Reported'
      };
    })
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex" style={{ backgroundColor: '#0b1326', minHeight: '100vh' }}>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Fixed Sidebar */}
      <aside 
        className={`w-64 flex-shrink-0 fixed inset-y-0 left-0 z-40 overflow-hidden transition-transform duration-300 -translate-x-full lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : ''}`}
        style={{ backgroundColor: '#0d1a33' }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-20 flex items-center px-6 border-b" style={{ borderColor: 'rgba(0,51,160,0.15)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#fed000' }}>
              <img src="/images.jpg" alt="ZESA" className="w-full h-full object-cover" />
            </div>
            <span className="ml-3 text-lg font-bold text-white tracking-wide">ZESA</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-hidden">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white transition-all cursor-pointer font-medium"
              style={{ backgroundColor: '#0033a0' }}
            >
              <DashboardIcon className="w-5 h-5" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => { onManageUsers(); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer font-medium"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <UserIcon className="w-5 h-5" />
              <span>Users</span>
            </button>
            <button
              onClick={() => { onManageFaults(); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer font-medium"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <ListIcon className="w-5 h-5" />
              <span>Faults</span>
            </button>
            <button
              onClick={() => { onManageSchedules(); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer font-medium"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <BuildingOfficeIcon className="w-5 h-5" />
              <span>Schedules</span>
            </button>
            <button
              onClick={() => { onGenerateReports(); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer font-medium"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <DocumentTextIcon className="w-5 h-5" />
              <span>Reports</span>
            </button>
            <button
              onClick={() => { onSystemSettings(); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer font-medium"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <SettingsIcon className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </nav>

          {/* User Info */}
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

      {/* Main Content */}
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
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Admin Dashboard</h1>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mt-8">
            {/* Total Users Card */}
            <div 
              className="p-6 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer border"
              style={{ backgroundColor: '#0d1a33', borderColor: 'rgba(0,51,160,0.2)' }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(0,51,160,0.15)' }}
                >
                  <UserIcon className="w-6 h-6" style={{ color: '#0033a0' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                  <p className="text-sm font-small" style={{ color: '#9ca3af' }}>Total Users</p>
                </div>
              </div>
            </div>

            {/* Active Faults Card */}
            <div 
              className="p-6 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer border"
              style={{ backgroundColor: '#0d1a33', borderColor: 'rgba(245,158,11,0.2)' }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(245,158,11,0.15)' }}
                >
                  <ClockIcon className="w-6 h-6" style={{ color: '#f59e0b' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.inProgressFaults}</p>
                  <p className="text-sm font-small" style={{ color: '#9ca3af' }}>Active Faults</p>
                </div>
              </div>
            </div>

            {/* Total Faults Card */}
            <div 
              className="p-6 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer border"
              style={{ backgroundColor: '#0d1a33', borderColor: 'rgba(220,38,38,0.2)' }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(220,38,38,0.15)' }}
                >
                  <ExclamationCircleIcon className="w-6 h-6" style={{ color: '#dc2626' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalFaults}</p>
                  <p className="text-sm font-small" style={{ color: '#9ca3af' }}>Total Faults</p>
                </div>
              </div>
            </div>

            {/* Resolved Card */}
            <div 
              className="p-6 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer border"
              style={{ backgroundColor: '#0d1a33', borderColor: 'rgba(16,185,129,0.2)' }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(16,185,129,0.15)' }}
                >
                  <CheckCircleIcon className="w-6 h-6" style={{ color: '#10b981' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.resolvedFaults}</p>
                  <p className="text-sm font-small" style={{ color: '#9ca3af' }}>Resolved</p>
                </div>
              </div>
            </div>

            {/* Unresolved Card */}
            <div 
              className="p-6 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer border"
              style={{ backgroundColor: '#0d1a33', borderColor: 'rgba(139,92,246,0.2)' }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(139,92,246,0.15)' }}
                >
                  <ListIcon className="w-6 h-6" style={{ color: '#8b5cf6' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.pendingFaults}</p>
                  <p className="text-sm font-small" style={{ color: '#9ca3af' }}>Unresolved</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
            {/* Fault Trends Chart */}
            <div className="p-6 rounded-2xl" style={{ backgroundColor: '#0d1a33' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Fault Trends</h3>
                  <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>Reported vs Resolved over the past 7 days</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs" style={{ color: '#9ca3af' }}>
                    <span className="w-2 h-2 rounded-full bg-red-500"></span> Reported
                  </span>
                  <span className="flex items-center gap-1 text-xs ml-3" style={{ color: '#9ca3af' }}>
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Resolved
                  </span>
                </div>
              </div>
              <div className="h-64">
                <FaultTrendChart 
                  data={[
                    { date: new Date().getTime(), reported: 12, resolved: 8, inProgress: 3 },
                    { date: new Date(Date.now() - 86400000).getTime(), reported: 15, resolved: 10, inProgress: 5 },
                    { date: new Date(Date.now() - 172800000).getTime(), reported: 8, resolved: 14, inProgress: 2 },
                    { date: new Date(Date.now() - 259200000).getTime(), reported: 18, resolved: 16, inProgress: 4 },
                    { date: new Date(Date.now() - 345600000).getTime(), reported: 22, resolved: 20, inProgress: 6 },
                    { date: new Date(Date.now() - 432000000).getTime(), reported: 25, resolved: 24, inProgress: 8 },
                  ]}
                  height={240}
                />
              </div>
            </div>

            {/* Performance Pie Chart */}
            <div className="p-6 rounded-2xl" style={{ backgroundColor: '#0d1a33' }}>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white">Performance</h3>
                <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>Fault resolution rate</p>
              </div>
              <div className="h-64 flex items-center justify-center">
                <PerformancePieChart 
                  data={[
                    { name: 'Resolved', value: stats.resolvedFaults, percentage: Math.round((stats.resolvedFaults / Math.max(stats.totalFaults, 1)) * 100) },
                    { name: 'In Progress', value: stats.inProgressFaults, percentage: Math.round((stats.inProgressFaults / Math.max(stats.totalFaults, 1)) * 100) },
                    { name: 'Pending', value: stats.pendingFaults, percentage: Math.round((stats.pendingFaults / Math.max(stats.totalFaults, 1)) * 100) },
                  ]}
                  height={240}
                />
              </div>
            </div>
          </div>

          {/* Activities and Grid Section */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-8">
            {/* Recent Activities Table - Takes 2 columns */}
            <div className="xl:col-span-2 rounded-2xl overflow-hidden" style={{ backgroundColor: '#0d1a33' }}>
              <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(0,51,160,0.15)' }}>
                <div>
                  <h3 className="text-lg font-semibold text-white">Recent Activities</h3>
                  <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>Latest updates from the system</p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: '#0b1326' }}>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Type</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivities.map((activity, idx) => (
                      <tr 
                        key={activity.id} 
                        className="border-t transition-colors hover:bg-white/5"
                        style={{ borderColor: 'rgba(0,51,160,0.08)' }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold" style={{ backgroundColor: 'rgba(0,51,160,0.2)', color: '#fed000' }}>
                              {activity.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{activity.name}</p>
                              <p className="text-xs" style={{ color: '#9ca3af' }}>{activity.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1.5 text-xs font-medium rounded-lg inline-flex" style={{ backgroundColor: 'rgba(0,51,160,0.15)', color: '#9ca3af' }}>
                            {activity.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm" style={{ color: '#9ca3af' }}>{formatDate(activity.date)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg inline-flex ${
                            activity.status === 'Completed' || activity.status === 'Resolved' || activity.status === 'Active' 
                              ? 'bg-green-500/20 text-green-400'
                              : activity.status === 'In Progress'
                              ? 'bg-purple-500/20 text-purple-400'
                              : activity.status === 'Pending' || activity.status === 'Reported'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {activity.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Grid Stability Component - Takes 1 column */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: '#0d1a33' }}>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-6">Grid Stability</h3>
                
                {/* Calculate grid stability percentage */}
                {(() => {
                  const totalFaults = Math.max(stats.totalFaults, 1);
                  const resolvedFaults = stats.resolvedFaults;
                  const stabilityPercentage = Math.round((resolvedFaults / totalFaults) * 100);
                  const actualStability = Math.min(Math.max(stabilityPercentage, 85), 98); // Keep between 85-98%
                  
                  // Determine status based on stability
                  let status = 'NORMAL OPERATING RANGE';
                  let statusColor = '#10b981'; // green
                  if (actualStability < 90) {
                    status = 'MODERATE STRESS';
                    statusColor = '#f59e0b'; // yellow
                  } else if (actualStability < 85) {
                    status = 'HIGH STRESS';
                    statusColor = '#ef4444'; // red
                  }
                  
                  // Calculate peak load based on active faults
                  const peakLoad = Math.round((stats.inProgressFaults / Math.max(totalFaults, 1)) * 100);
                  
                  return (
                    <>
                      {/* Gauge */}
                      <div className="relative w-32 h-32 mx-auto mb-6">
                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                          {/* Background circle */}
                          <circle
                            cx="60"
                            cy="60"
                            r="50"
                            fill="none"
                            stroke="rgba(0,51,160,0.2)"
                            strokeWidth="12"
                          />
                          {/* Progress circle */}
                          <circle
                            cx="60"
                            cy="60"
                            r="50"
                            fill="none"
                            stroke={statusColor}
                            strokeWidth="12"
                            strokeDasharray={`${2 * Math.PI * 50 * (actualStability / 100)} ${2 * Math.PI * 50}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-white">{actualStability}%</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Status */}
                      <div className="mb-6">
                        <p className="text-sm font-medium" style={{ color: statusColor }}>{status}</p>
                      </div>
                      
                      {/* Load Info */}
                      <div className="space-y-3">
                        <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(245,158,11,0.15)' }}>
                          <p className="text-xs font-medium" style={{ color: '#f59e0b' }}>PEAK LOAD EXPECTED</p>
                          <p className="text-lg font-bold text-white">{peakLoad}%</p>
                        </div>
                        <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(245,158,11,0.15)' }}>
                          <p className="text-xs font-medium" style={{ color: '#f59e0b' }}>LOAD SHEDDING STATUS</p>
                          <p className="text-lg font-bold text-white">{stats.activeLoadShedding}%</p>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;