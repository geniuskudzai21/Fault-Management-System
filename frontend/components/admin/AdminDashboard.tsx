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
        const [usersRes, schedulesRes] = await Promise.allSettled([
          usersApi.getStats(),
          schedulesApi.getStats(),
        ]);

        const userStats = usersRes.status === 'fulfilled' ? usersRes.value.data : null;
        const scheduleStats = schedulesRes.status === 'fulfilled' ? schedulesRes.value.data : null;

        const today = new Date().toDateString();
        const todayFaults = faults?.filter((f: any) => new Date(f.reportedDate).toDateString() === today).length || 0;

        setStats({
          totalUsers: userStats?.total ?? 0,
          totalFaults: faults?.length ?? 0,
          resolvedFaults: faults?.filter((f: any) => f.status === 'Resolved').length ?? 0,
          activeLoadShedding: scheduleStats?.active ?? 0,
          pendingFaults: faults?.filter((f: any) => f.status === 'Reported').length ?? 0,
          inProgressFaults: faults?.filter((f: any) => f.status === 'In Progress').length ?? 0,
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
  }, [faults]);

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
    { id: 'settings', label: 'Settings', icon: SettingsIcon, onClick: onSystemSettings },
  ];

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: UserIcon, color: '#0033a0', bgColor: 'rgba(10,10,15,0.95)' },
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

  // Generate real fault trend data from actual faults
  const generateFaultTrendData = () => {
    const today = new Date();
    const trendData = [];
    
    // Generate data for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      
      // Filter faults for this specific day
      const dayFaults = faults.filter(fault => {
        const faultDate = new Date(fault.reportedDate);
        return faultDate >= date && faultDate < nextDate;
      });
      
      // Count faults by status for this day
      const reported = dayFaults.length;
      const resolved = dayFaults.filter(f => f.status === 'Resolved').length;
      const inProgress = dayFaults.filter(f => f.status === 'In Progress').length;
      
      trendData.push({
        date: date.getTime(),
        reported,
        resolved,
        inProgress
      });
    }
    
    return trendData;
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex" style={{ 
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1f3a 25%, #0f172a 50%, #1e293b 75%, #0a0a0f 100%)',
      minHeight: '100vh' 
    }}>
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
        style={{ backgroundColor: 'rgba(2, 9, 29, 1)' }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-20 flex items-center px-6 border-b" style={{ borderColor: 'rgba(113, 145, 216, 1) 0.15)' }}>
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
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">Admin Dashboard</h1>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mt-8">
            {/* Total Users Card */}
            <div 
              className="p-6 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer border"
              style={{ backgroundColor: 'rgba(2, 9, 29, 1)', borderColor: '#0033a0' }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: '#0033a0' }}
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
                  <p className="text-sm font-small" style={{ color: '#9ca3af' }}>Active Faults</p>
                </div>
              </div>
            </div>

            {/* Total Faults Card */}
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
                  <p className="text-2xl font-bold text-white">{stats.totalFaults}</p>
                  <p className="text-sm font-small" style={{ color: '#9ca3af' }}>Total Faults</p>
                </div>
              </div>
            </div>

            {/* Resolved Card */}
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

            {/* Unresolved Card */}
            <div 
              className="p-6 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer border"
              style={{ backgroundColor: 'rgba(2, 9, 29, 1)', borderColor: '#8b5cf6' }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: '#8b5cf6' }}
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
            <div className="p-6 rounded-2xl" style={{ backgroundColor: 'rgba(2, 9, 29, 1)', borderColor: 'rgba(0,51,160,0.2)' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Fault Trends</h3>
                  <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>Real-time fault trends over the past 7 days</p>
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
                  data={generateFaultTrendData()}
                  height={240}
                />
              </div>
            </div>

            {/* Performance Pie Chart */}
            <div className="p-6 rounded-2xl" style={{ backgroundColor: 'rgba(2, 9, 29, 1)' }}>
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
            <div className="xl:col-span-2 rounded-2xl overflow-hidden" style={{ backgroundColor: 'rgba(2, 9, 29, 1)' }}>
              <div className="px-4 py-4 border-b" style={{ borderColor: 'rgba(0,51,160,0.15)' }}>
                <div>
                  <h3 className="text-lg font-semibold text-white">Recent Activities</h3>
                  <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>Latest updates from the system</p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: '#0b1326' }}>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase" style={{ color: '#9ca3af' }}>Activity</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase" style={{ color: '#9ca3af' }}>Type</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase" style={{ color: '#9ca3af' }}>Date</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold uppercase" style={{ color: '#9ca3af' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivities.map((activity, idx) => (
                      <tr 
                        key={activity.id} 
                        className="border-t transition-colors hover:bg-white/5"
                        style={{ borderColor: 'rgba(0,51,160,0.08)' }}
                      >
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: 'rgba(0,51,160,0.2)', color: '#fed000' }}>
                              {activity.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-white truncate">{activity.name}</p>
                              <p className="text-xs" style={{ color: '#9ca3af' }} title={activity.email}>{activity.email.length > 20 ? activity.email.substring(0, 20) + '...' : activity.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className="px-2 py-1 text-xs font-medium rounded inline-block" style={{ backgroundColor: 'rgba(0,51,160,0.15)', color: '#9ca3af' }}>
                            {activity.type}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-xs" style={{ color: '#9ca3af' }}>{formatDate(activity.date)}</span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`px-2 py-1 text-xs font-semibold rounded inline-block ${
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
            <div className="rounded-2xl p-6" style={{ backgroundColor: 'rgba(2, 9, 29, 1)' }}>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center justify-center gap-2">
                  <span className="relative">
                    <span className="absolute inset-0 animate-pulse" style={{ color: '#fbbf24', filter: 'blur(8px)' }}>⚡</span>
                    <span style={{ color: '#fbbf24' }}>⚡</span>
                  </span>
                  Grid Stability
                </h3>
                
                {/* Calculate real grid stability based on multiple factors */}
                {(() => {
                  const totalFaults = Math.max(stats.totalFaults, 1);
                  const resolvedFaults = stats.resolvedFaults;
                  const inProgressFaults = stats.inProgressFaults;
                  const pendingFaults = stats.pendingFaults;
                  
                  // Real stability calculation based on fault resolution and active issues
                  const resolutionRate = (resolvedFaults / totalFaults) * 100;
                  const activeIssueRate = (inProgressFaults / totalFaults) * 100;
                  const pendingIssueRate = (pendingFaults / totalFaults) * 100;
                  
                  // More realistic stability calculation
                  // Base score starts at 50%, then we adjust based on performance
                  let stabilityScore = 50;
                  
                  // Add points for good resolution performance
                  stabilityScore += (resolutionRate * 0.4); // Max 40 points for 100% resolution
                  
                  // Subtract points for active issues (but not too harshly)
                  stabilityScore -= (activeIssueRate * 0.3); // Max 30 points deduction
                  stabilityScore -= (pendingIssueRate * 0.2); // Max 20 points deduction
                  
                  // Bonus for having few total faults (indicates good system health)
                  if (totalFaults < 10) stabilityScore += 10;
                  else if (totalFaults < 25) stabilityScore += 5;
                  
                  // Ensure score stays within bounds
                  stabilityScore = Math.max(10, Math.min(100, stabilityScore));
                  
                  // Determine status and colors based on real stability
                  let status = 'OPTIMAL';
                  let statusColor = '#10b981'; // green
                  let electricColor = '#10b981';
                  let pulseColor = 'rgba(16, 185, 129, 0.3)';
                  
                  if (stabilityScore < 70) {
                    status = 'CRITICAL';
                    statusColor = '#dc2626'; // red
                    electricColor = '#ef4444';
                    pulseColor = 'rgba(239, 68, 68, 0.3)';
                  } else if (stabilityScore < 80) {
                    status = 'MODERATE';
                    statusColor = '#f59e0b'; // yellow
                    electricColor = '#fbbf24';
                    pulseColor = 'rgba(251, 191, 36, 0.3)';
                  } else if (stabilityScore < 95) {
                    status = 'STABLE';
                    statusColor = '#3b82f6'; // blue
                    electricColor = '#60a5fa';
                    pulseColor = 'rgba(96, 165, 250, 0.3)';
                  }
                  
                  // Calculate grid load metrics
                  const gridLoad = Math.round(((inProgressFaults + pendingFaults) / totalFaults) * 100);
                  const capacityUtilization = Math.round((totalFaults / Math.max(totalFaults + stats.resolvedFaults, 1)) * 100);
                  
                  return (
                    <>
                      {/* Electric Grid Visualization */}
                      <div className="relative w-40 h-40 mx-auto mb-6">
                        {/* Animated electric pulse background */}
                        <div 
                          className="absolute inset-0 rounded-full animate-pulse"
                          style={{ 
                            backgroundColor: pulseColor,
                            animationDuration: '2s'
                          }}
                        />
                        
                        {/* Center display */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="text-center">
                            <p className="text-3xl font-bold text-white mb-1">{Math.round(stabilityScore)}%</p>
                            <p className="text-xs font-medium" style={{ color: statusColor }}>{status}</p>
                          </div>
                        </div>
                        
                        {/* Electric bolts around the circle */}
                        <div className="absolute inset-0">
                          {[...Array(8)].map((_, i) => (
                            <div
                              key={i}
                              className="absolute text-lg"
                              style={{
                                top: '50%',
                                left: '50%',
                                transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-65px)`,
                                color: electricColor,
                                opacity: 0.6 + (stabilityScore / 250),
                                animation: `pulse ${2 + (i % 2)}s infinite`
                              }}
                            >
                              ⚡
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Status indicator with electric theme */}
                      <div className="mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full" style={{ backgroundColor: `${statusColor}20` }}>
                          <div 
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{ backgroundColor: statusColor }}
                          />
                          <p className="text-sm font-medium" style={{ color: statusColor }}>{status}</p>
                        </div>
                      </div>
                      
                      {/* Grid Metrics */}
                      <div className="space-y-3">
                        <div className="px-4 py-3 rounded-lg border-l-4" style={{ 
                          backgroundColor: 'rgba(251, 191, 36, 0.1)', 
                          borderColor: '#88ff00ff' 
                        }}>
                       
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-medium" style={{ color: '#60a5fa' }}>CAPACITY UTILIZATION</p>
                            <span className="text-xs">⚡</span>
                          </div>
                          <p className="text-lg font-bold text-white">{capacityUtilization}%</p>
                          <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                            <div 
                              className="h-1.5 rounded-full transition-all duration-500 bg-blue-400"
                              style={{ width: `${capacityUtilization}%` }}
                            />
                          </div>
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