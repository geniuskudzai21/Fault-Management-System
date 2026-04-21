import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import Button from '../common/Button';
import { schedulesApi } from '../../src/api';
import { ArrowLeftIcon, BuildingOfficeIcon, Squares2X2Icon, PlusIcon, TrashIcon, MagnifyingGlassIcon, XMarkIcon } from '../icons';

interface LoadSheddingManagementProps {
  user: User;
  onBack: () => void;
}

interface LoadSheddingSchedule {
  id: string;
  area: string;
  start_time: string;
  end_time: string;
  days_of_week: string[];
  status: 'active' | 'inactive';
  priority: 'high' | 'medium' | 'low';
  created_at: string;
}

const LoadSheddingManagement: React.FC<LoadSheddingManagementProps> = ({ user, onBack }) => {
  const [schedules, setSchedules] = useState<LoadSheddingSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    area: '',
    start_time: '',
    end_time: '',
    days_of_week: [] as string[],
    priority: 'medium'
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [daysOfWeek] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

  useEffect(() => {
    setLoading(false);
    setSchedules([
      { id: '1', area: 'Avenues', start_time: '06:00', end_time: '10:00', days_of_week: ['Mon', 'Wed', 'Fri'], status: 'active', priority: 'high', created_at: new Date().toISOString() },
      { id: '2', area: 'Greenside', start_time: '10:00', end_time: '14:00', days_of_week: ['Tue', 'Thu', 'Sat'], status: 'active', priority: 'medium', created_at: new Date().toISOString() },
      { id: '3', area: 'Sakubva', start_time: '14:00', end_time: '18:00', days_of_week: ['Mon', 'Fri'], status: 'inactive', priority: 'low', created_at: new Date().toISOString() },
    ]);
  }, []);

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.area.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || schedule.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddSchedule = async () => {
    try {
      const newId = String(schedules.length + 1);
      setSchedules([...schedules, { ...newSchedule, id: newId, status: 'active', created_at: new Date().toISOString() }]);
      setNewSchedule({ area: '', start_time: '', end_time: '', days_of_week: [], priority: 'medium' });
      setShowAddSchedule(false);
    } catch (error: any) {
      console.error('Failed to add schedule:', error);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      setSchedules(schedules.filter(s => s.id !== scheduleId));
    }
  };

  const handleToggleDay = (day: string) => {
    const days = newSchedule.days_of_week.includes(day)
      ? newSchedule.days_of_week.filter(d => d !== day)
      : [...newSchedule.days_of_week, day];
    setNewSchedule({ ...newSchedule, days_of_week: days });
  };

  const stats = {
    total: schedules.length,
    active: schedules.filter(s => s.status === 'active').length,
    inactive: schedules.filter(s => s.status === 'inactive').length,
  };

  if (loading) {
    return (
      <div className="flex" style={{ backgroundColor: '#0b1326', minHeight: '100vh' }}>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex" style={{ backgroundColor: '#0b1326', minHeight: '100vh' }}>
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
      )}

      <aside 
        className={`w-64 flex-shrink-0 fixed inset-y-0 left-0 z-40 overflow-hidden transition-transform duration-300 -translate-x-full lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : ''}`}
        style={{ backgroundColor: '#0d1a33' }}
      >
        <div className="flex flex-col h-full">
          <div className="h-20 flex items-center px-6 border-b" style={{ borderColor: 'rgba(0,51,160,0.15)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#fed000' }}>
              <img src="/images.jpg" alt="ZESA" className="w-full h-full object-cover" />
            </div>
            <span className="ml-3 text-lg font-bold text-white tracking-wide">ZESA</span>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-hidden">
            <button
              onClick={onBack}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-white transition-all"
              style={{ backgroundColor: '#0033a0' }}
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Dashboard</span>
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
            >
              <Squares2X2Icon className="w-6 h-6" />
            </button>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Load Shedding Management</h1>
            <button
              onClick={() => setShowAddSchedule(true)}
              className="ml-auto px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: '#0033a0', color: '#fed000' }}
            >
              <PlusIcon className="w-5 h-5 inline mr-2" />
              Add Schedule
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="p-6 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer border" style={{ backgroundColor: '#0d1a33', borderColor: 'rgba(0,51,160,0.2)' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(0,51,160,0.15)' }}>
                  <BuildingOfficeIcon className="w-6 h-6" style={{ color: '#0033a0' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                  <p className="text-sm font-small" style={{ color: '#9ca3af' }}>Total Schedules</p>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer border" style={{ backgroundColor: '#0d1a33', borderColor: 'rgba(16,185,129,0.2)' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(16,185,129,0.15)' }}>
                  <BuildingOfficeIcon className="w-6 h-6" style={{ color: '#10b981' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.active}</p>
                  <p className="text-sm font-small" style={{ color: '#9ca3af' }}>Active</p>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer border" style={{ backgroundColor: '#0d1a33', borderColor: 'rgba(107,114,128,0.2)' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(107,114,128,0.15)' }}>
                  <BuildingOfficeIcon className="w-6 h-6" style={{ color: '#6b7280' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.inactive}</p>
                  <p className="text-sm font-small" style={{ color: '#9ca3af' }}>Inactive</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-4 mb-6" style={{ backgroundColor: '#0d1a33' }}>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#9ca3af' }} />
                <input
                  type="text"
                  placeholder="Search schedules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border focus:outline-none"
                  style={{ backgroundColor: '#0b1326', borderColor: 'rgba(0,51,160,0.2)', color: 'white', borderWidth: '1px' }}
                />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2.5 rounded-lg border focus:outline-none"
                style={{ backgroundColor: '#0b1326', borderColor: 'rgba(0,51,160,0.2)', color: 'white', borderWidth: '1px' }}
              >
                <option value="all" style={{ color: 'white' }}>All Status</option>
                <option value="active" style={{ color: 'white' }}>Active</option>
                <option value="inactive" style={{ color: 'white' }}>Inactive</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#0d1a33' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#0b1326' }}>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Area</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Time</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Days</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Priority</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchedules.map((schedule) => (
                    <tr key={schedule.id} className="border-t transition-colors hover:bg-white/5" style={{ borderColor: 'rgba(0,51,160,0.08)' }}>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-white">{schedule.area}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm" style={{ color: '#9ca3af' }}>{schedule.start_time} - {schedule.end_time}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {schedule.days_of_week.map(day => (
                            <span key={day} className="px-2 py-0.5 text-xs rounded" style={{ backgroundColor: 'rgba(0,51,160,0.15)', color: '#fed000' }}>{day}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1.5 text-xs font-medium rounded-lg" style={{ 
                          backgroundColor: schedule.priority === 'high' ? 'rgba(220,38,38,0.15)' : schedule.priority === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                          color: schedule.priority === 'high' ? '#dc2626' : schedule.priority === 'medium' ? '#f59e0b' : '#10b981'
                        }}>{schedule.priority}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg inline-flex ${
                          schedule.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>{schedule.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="p-2 rounded-lg transition-colors hover:bg-red-500/20 text-red-400"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showAddSchedule && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/70" onClick={() => setShowAddSchedule(false)} />
            <div className="relative p-6 border rounded-2xl w-full max-w-md shadow-xl" style={{ backgroundColor: '#0d1a33', borderColor: 'rgba(0,51,160,0.2)' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Add Load Shedding Schedule</h3>
                <button onClick={() => setShowAddSchedule(false)} className="p-2 rounded-lg hover:bg-white/10" style={{ color: '#9ca3af' }}>
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#9ca3af' }}>Area</label>
                  <input
                    type="text"
                    value={newSchedule.area}
                    onChange={(e) => setNewSchedule({...newSchedule, area: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border focus:outline-none"
                    style={{ backgroundColor: '#0b1326', borderColor: 'rgba(0,51,160,0.2)', color: 'white', borderWidth: '1px' }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#9ca3af' }}>Start Time</label>
                    <input
                      type="time"
                      value={newSchedule.start_time}
                      onChange={(e) => setNewSchedule({...newSchedule, start_time: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg border focus:outline-none"
                      style={{ backgroundColor: '#0b1326', borderColor: 'rgba(0,51,160,0.2)', color: 'white', borderWidth: '1px' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#9ca3af' }}>End Time</label>
                    <input
                      type="time"
                      value={newSchedule.end_time}
                      onChange={(e) => setNewSchedule({...newSchedule, end_time: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg border focus:outline-none"
                      style={{ backgroundColor: '#0b1326', borderColor: 'rgba(0,51,160,0.2)', color: 'white', borderWidth: '1px' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#9ca3af' }}>Days of Week</label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map(day => (
                      <button
                        key={day}
                        onClick={() => handleToggleDay(day)}
                        className="px-3 py-1.5 text-xs rounded-lg transition-colors"
                        style={{ 
                          backgroundColor: newSchedule.days_of_week.includes(day) ? '#0033a0' : '#0b1326',
                          borderColor: 'rgba(0,51,160,0.2)',
                          color: newSchedule.days_of_week.includes(day) ? '#fed000' : '#9ca3af',
                          borderWidth: '1px'
                        }}
                      >{day}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#9ca3af' }}>Priority</label>
                  <select
                    value={newSchedule.priority}
                    onChange={(e) => setNewSchedule({...newSchedule, priority: e.target.value as 'low' | 'medium' | 'high'})}
                    className="w-full px-4 py-2.5 rounded-lg border focus:outline-none"
                    style={{ backgroundColor: '#0b1326', borderColor: 'rgba(0,51,160,0.2)', color: 'white', borderWidth: '1px' }}
                  >
                    <option value="low" style={{ color: 'white' }}>Low</option>
                    <option value="medium" style={{ color: 'white' }}>Medium</option>
                    <option value="high" style={{ color: 'white' }}>High</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowAddSchedule(false)} className="px-4 py-2.5 rounded-lg font-medium" style={{ color: '#9ca3af' }}>Cancel</button>
                <button onClick={handleAddSchedule} className="px-4 py-2.5 rounded-lg font-medium transition-all hover:opacity-90" style={{ backgroundColor: '#0033a0', color: '#fed000' }}>Add Schedule</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadSheddingManagement;