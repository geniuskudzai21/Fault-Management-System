import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, Fault, Notification } from '../../types';
import { FaultStatus } from '../../constants';
import { faultsApi, schedulesApi } from '../../src/api';
import { ExclamationCircleIcon, ClockIcon, CheckCircleIcon } from '../icons';
import NotificationsPanel from '../common/NotificationsPanel';

interface CustomerDashboardProps {
  user: User;
  faults: Fault[];
  onFaultsUpdate: () => void;
  showNotifications?: boolean;
  onCloseNotifications?: () => void;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ 
  user, 
  faults,
  onFaultsUpdate,
  showNotifications = false,
  onCloseNotifications
}) => {
  const [showReportForm, setShowReportForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationsRef = useRef<Notification[]>([]);
  notificationsRef.current = notifications;
  const [formData, setFormData] = useState({
    address: '',
    category: 'Power Outage',
    priority: 'Medium',
    description: ''
  });

  const myFaults = useMemo(() => {
    return faults.filter(fault => String(fault.customerId) === String(user.id));
  }, [faults, user.id]);

  const stats = useMemo(() => ({
    total: myFaults.length,
    reported: myFaults.filter(f => f.status === FaultStatus.Reported).length,
    inProgress: myFaults.filter(f => f.status === FaultStatus.InProgress).length,
    resolved: myFaults.filter(f => f.status === FaultStatus.Resolved).length,
  }), [myFaults]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await faultsApi.create({
        customerId: user.id,
        address: formData.address,
        category: formData.category,
        priority: formData.priority,
        description: formData.description,
        area: user.area
      });
      
      setFormData({
        address: '',
        category: 'Power Outage',
        priority: 'Medium',
        description: ''
      });
      setShowReportForm(false);
      await onFaultsUpdate();
    } catch (error) {
      console.error('Failed to report fault:', error);
      alert('Failed to report fault. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const generateNotifications = async () => {
    try {
      const newNotifications: Notification[] = [];

      // 1. Load Shedding Notifications
      try {
        const schedulesResponse = await schedulesApi.getAll();
        const loadSheddingSchedules = schedulesResponse.data || [];

        loadSheddingSchedules.forEach(schedule => {
          // Skip if already exists
          if (notificationsRef.current.some(n => n.id.startsWith(`load-shedding-${schedule.id}`))) return;
          
          const userAreaLower = (user.area || '').toLowerCase();
          const scheduleAreaLower = (schedule.area || '').toLowerCase();
          const areaMatches = userAreaLower.includes(scheduleAreaLower) || scheduleAreaLower.includes(userAreaLower);
          
          if (areaMatches) {
            newNotifications.push({
              id: `load-shedding-${schedule.id}`,
              userId: user.id,
              type: 'load_shedding',
              title: 'Load Shedding',
              message: `Load shedding in ${schedule.area} on ${schedule.date} from ${schedule.startTime} to ${schedule.endTime}. Reason: ${schedule.reason || 'Scheduled maintenance'}`,
              timestamp: new Date().toISOString(),
              isRead: false
            });
          }
        });
      } catch (error) {
        console.error('Failed to fetch load shedding schedules:', error);
      }

      // 2. Fault Status Notifications
      myFaults.forEach(fault => {
        if (fault.status === FaultStatus.InProgress && !notificationsRef.current.some(n => n.id.includes(fault.id) && n.type === 'fault_assigned')) {
          newNotifications.push({
            id: `fault-inprogress-${fault.id}`,
            userId: user.id,
            type: 'fault_assigned',
            title: 'Fault In Progress',
            message: `Your fault #${fault.faultNumber || fault.id} in ${fault.area} is now being worked on by a technician.`,
            timestamp: new Date().toISOString(),
            isRead: false
          });
        } else if (fault.status === FaultStatus.Resolved && !notificationsRef.current.some(n => n.id.includes(fault.id) && n.type === 'fault_resolved')) {
          newNotifications.push({
            id: `fault-resolved-${fault.id}`,
            userId: user.id,
            type: 'fault_resolved',
            title: 'Fault Resolved',
            message: `Great news! Your fault #${fault.faultNumber || fault.id} in ${fault.area} has been resolved.`,
            timestamp: new Date().toISOString(),
            isRead: false
          });
        }
      });

      // 3. Power Restoration Notifications
      // REMOVED - was mock data

      // 4. System Maintenance Notifications
      // REMOVED - was mock data

      // Only add new notifications, don't duplicate
      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 50));
      }
    } catch (error) {
      console.error('Failed to generate notifications:', error);
    }
  };

  useEffect(() => {
    generateNotifications();
  }, [user.area, user.id]);

  useEffect(() => {
    if (showNotifications) {
      generateNotifications();
    }
  }, [showNotifications]);

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const handleCloseNotifications = () => {
    if (onCloseNotifications) {
      onCloseNotifications();
    }
  };

  return (
    <div className="flex" style={{ 
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1f3a 25%, #0f172a 50%, #1e293b 75%, #0a0a0f 100%)',
      minHeight: '100vh' 
    }}>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Customer Dashboard</h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            <div className="p-6 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer border" style={{ backgroundColor: 'rgba(2, 9, 29, 1)', borderColor: '#dc2626' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#dc2626' }}>
                  <ExclamationCircleIcon className="w-6 h-6" style={{ color: '#dc2626' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                  <p className="text-sm font-small" style={{ color: '#9ca3af' }}>Total Faults</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer border" style={{ backgroundColor: 'rgba(2, 9, 29, 1)', borderColor: '#8b5cf6' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#8b5cf6' }}>
                  <ClockIcon className="w-6 h-6" style={{ color: '#8b5cf6' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.inProgress}</p>
                  <p className="text-sm font-small" style={{ color: '#9ca3af' }}>In Progress</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer border" style={{ backgroundColor: 'rgba(2, 9, 29, 1)', borderColor: '#10b981' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#10b981' }}>
                  <CheckCircleIcon className="w-6 h-6" style={{ color: '#10b981' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.resolved}</p>
                  <p className="text-sm font-small" style={{ color: '#9ca3af' }}>Resolved</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl mt-8 overflow-hidden border" style={{ backgroundColor: 'rgba(2, 9, 29, 1)', borderColor: 'rgba(0,51,160,0.2)' }}>
            <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(0,51,160,0.15)' }}>
              <h3 className="text-lg font-semibold text-white">Report a New Fault</h3>
            </div>
          
          {showReportForm ? (
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#9ca3af' }}>Address</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-4 py-2.5 text-sm rounded-lg focus:outline-none"
                      style={{ backgroundColor: 'rgba(10,10,15,0.95)', border: '1px solid rgba(0,51,160,0.2)', color: '#fff' }}
                      placeholder="Enter fault location"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#9ca3af' }}>Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-2.5 text-sm rounded-lg focus:outline-none"
                      style={{ backgroundColor: 'rgba(10,10,15,0.95)', border: '1px solid rgba(0,51,160,0.2)', color: '#fff' }}
                    >
                      <option value="Power Outage">Power Outage</option>
                      <option value="Line Damage">Line Damage</option>
                      <option value="Transformer">Transformer</option>
                      <option value="Meter Issue">Meter Issue</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#9ca3af' }}>Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="w-full px-4 py-2.5 text-sm rounded-lg focus:outline-none"
                      style={{ backgroundColor: 'rgba(10,10,15,0.95)', border: '1px solid rgba(0,51,160,0.2)', color: '#fff' }}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#9ca3af' }}>Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2.5 text-sm rounded-lg focus:outline-none"
                    style={{ backgroundColor: 'rgba(10,10,15,0.95)', border: '1px solid rgba(0,51,160,0.2)', color: '#fff' }}
                    rows={3}
                    placeholder="Describe the fault in detail"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button type="submit" disabled={loading} className="px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90" style={{ backgroundColor: '#0033a0', color: '#fed000' }}>
                    {loading ? 'Submitting...' : 'Submit Fault Report'}
                  </button>
                  <button type="button" onClick={() => setShowReportForm(false)} className="px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-all hover:bg-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="text-center py-8">
              <button onClick={() => setShowReportForm(true)} className="px-6 py-3 rounded-lg text-white font-medium transition-all hover:opacity-90" style={{ backgroundColor: '#0033a0', color: '#fed000' }}>
                Report New Fault
              </button>
              <p className="text-gray-400 text-sm mt-3">Click to report electrical faults in your area</p>
            </div>
          )}
          </div>

          <div className="rounded-2xl mt-8 overflow-hidden border" style={{ backgroundColor: 'rgba(2, 9, 29, 1)', borderColor: 'rgba(0,51,160,0.2)' }}>
            <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(0,51,160,0.15)' }}>
              <h3 className="text-lg font-semibold text-white">My Fault Reports</h3>
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
                  </tr>
                </thead>
                <tbody>
                  {myFaults.map((fault) => (
                    <tr key={fault.id} className="border-t transition-colors hover:bg-white/5" style={{ borderColor: 'rgba(0,51,160,0.08)' }}>
                      <td className="px-6 py-4"><span className="text-white text-sm font-medium">{fault.faultNumber || `FLT-${fault.id}`}</span></td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white text-sm">{fault.address}</p>
                          <p className="text-xs" style={{ color: '#9ca3af' }}>{fault.area}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="text-white text-sm">{fault.category}</span></td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1.5 text-xs font-semibold rounded-lg inline-flex" style={{ 
                          backgroundColor: fault.priority === 'High' || fault.priority === 'Critical' ? 'rgba(220,38,38,0.15)' : fault.priority === 'Medium' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                          color: fault.priority === 'High' || fault.priority === 'Critical' ? '#ef4444' : fault.priority === 'Medium' ? '#f59e0b' : '#10b981'
                        }}>{fault.priority}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1.5 text-xs font-semibold rounded-lg inline-flex" style={{ 
                          backgroundColor: fault.status === FaultStatus.Resolved ? 'rgba(16,185,129,0.15)' : fault.status === FaultStatus.InProgress ? 'rgba(139,92,246,0.15)' : 'rgba(245,158,11,0.15)',
                          color: fault.status === FaultStatus.Resolved ? '#10b981' : fault.status === FaultStatus.InProgress ? '#8b5cf6' : '#f59e0b'
                        }}>{fault.status}</span>
                      </td>
                      <td className="px-6 py-4"><span className="text-white text-sm">{formatDate(fault.reportedDate)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {myFaults.length === 0 && (
              <div className="text-center py-8" style={{ color: '#9ca3af' }}>
                <p className="text-sm">No fault reports yet</p>
                <p className="text-xs mt-1">Click "Report New Fault" to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showNotifications && (
        <NotificationsPanel
          notifications={notifications}
          onClose={handleCloseNotifications}
          onMarkRead={handleMarkNotificationRead}
          onClearAll={handleClearAllNotifications}
        />
      )}
    </div>
  );
};

export default CustomerDashboard;