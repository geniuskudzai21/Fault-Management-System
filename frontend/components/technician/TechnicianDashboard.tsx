import React, { useState, useEffect, useMemo } from 'react';
import { User, Fault } from '../../types';
import { FaultStatus, UserRole } from '../../constants';
import Button from '../common/Button';
import { faultsApi } from '../../src/api';

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
  const [showReportForm, setShowReportForm] = useState<string | null>(null);
  const [showWorkNotes, setShowWorkNotes] = useState<string | null>(null);
  const [workNotes, setWorkNotes] = useState<Record<string, string>>({});
  const [reportData, setReportData] = useState({
    resolutionSteps: '',
    materialsUsed: '',
    timeSpent: '',
    followUpRequired: false,
    followUpNotes: ''
  });
  const [selectedFault, setSelectedFault] = useState<Fault | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Filter faults assigned to this technician
  const myFaults = useMemo(() => {
    return faults.filter(fault => String(fault.technicianId) === String(user.id));
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
    reported: myFaults.filter(f => f.status === FaultStatus.Reported).length,
    inProgress: myFaults.filter(f => f.status === FaultStatus.InProgress).length,
    resolved: myFaults.filter(f => f.status === FaultStatus.Resolved).length,
    highPriority: myFaults.filter(f => f.priority === 'High').length,
    avgResolutionTime: calculateAvgResolutionTime(myFaults)
  }), [myFaults]);

  const calculateAvgResolutionTime = (faults: Fault[]) => {
    const resolvedFaults = faults.filter(f => f.status === FaultStatus.Resolved && f.reportedDate && f.resolvedDate);
    if (resolvedFaults.length === 0) return 'N/A';
    
    const totalTime = resolvedFaults.reduce((acc, fault) => {
      const reported = new Date(fault.reportedDate).getTime();
      const resolved = new Date(fault.resolvedDate!).getTime();
      return acc + (resolved - reported);
    }, 0);
    
    const avgHours = totalTime / resolvedFaults.length / (1000 * 60 * 60);
    return `${avgHours.toFixed(1)}h`;
  };

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

  const saveWorkNotes = async (faultId: string) => {
    try {
      await faultsApi.update(faultId, { 
        resolutionSteps: workNotes[faultId] || '' 
      });
      await onFaultsUpdate();
      setShowWorkNotes(null);
      alert('Work notes saved successfully!');
    } catch (error) {
      console.error('Failed to save work notes:', error);
      alert('Failed to save work notes. Please try again.');
    }
  };

  const viewFaultDetails = (fault: Fault) => {
    setSelectedFault(fault);
  };

  const closeFaultDetails = () => {
    setSelectedFault(null);
  };

  const submitResolutionReport = async (faultId: string) => {
    try {
      await faultsApi.update(faultId, {
        status: FaultStatus.Resolved,
        resolutionSteps: reportData.resolutionSteps,
        materialsUsed: reportData.materialsUsed,
        timeSpent: reportData.timeSpent,
        followUpRequired: reportData.followUpRequired,
        followUpNotes: reportData.followUpNotes
      });
      await onFaultsUpdate();
      setShowReportForm(null);
      setReportData({
        resolutionSteps: '',
        materialsUsed: '',
        timeSpent: '',
        followUpRequired: false,
        followUpNotes: ''
      });
      alert('Resolution report submitted successfully!');
    } catch (error) {
      console.error('Failed to submit resolution report:', error);
      alert('Failed to submit resolution report. Please try again.');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-amber-600 bg-amber-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case FaultStatus.Reported:
        return 'text-blue-600 bg-blue-100';
      case FaultStatus.InProgress:
        return 'text-amber-600 bg-amber-100';
      case FaultStatus.Resolved:
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Technician Dashboard</h1>
                <p className="text-gray-600">Manage your assigned faults</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 text-xs font-medium">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">TOTAL FAULTS</p>
                <p className="text-xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">REPORTED</p>
                <p className="text-xl font-semibold text-gray-900">{stats.reported}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">IN PROGRESS</p>
                <p className="text-xl font-semibold text-gray-900">{stats.inProgress}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-green-500/10">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">RESOLVED</p>
                <p className="text-xl font-semibold text-gray-900">{stats.resolved}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-red-500/10">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">HIGH PRIORITY</p>
                <p className="text-xl font-semibold text-gray-900">{stats.highPriority}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Performance Metrics</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Average Resolution Time</span>
                <span className="text-sm font-medium text-gray-900">{stats.avgResolutionTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Resolution Rate</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Filters</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="Reported">Reported</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Priority</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Faults Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              My Assigned Faults
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fault ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFaults.map((fault) => (
                  <tr key={fault.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {fault.fault_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{fault.address}</div>
                        <div className="text-xs text-gray-500">{fault.area}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {fault.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(fault.priority)}`}>
                        {fault.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(fault.status)}`}>
                        {fault.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(fault.reportedDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewFaultDetails(fault)}
                          className="text-gray-600 hover:text-gray-900"
                          title="View Details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        {fault.status === FaultStatus.Reported && (
                          <>
                            <button
                              onClick={() => updateFaultStatus(fault.id, FaultStatus.InProgress)}
                              className="text-blue-600 hover:text-blue-900"
                              disabled={updatingFault === fault.id}
                              title="Start Work"
                            >
                              {updatingFault === fault.id ? 'Updating...' : 'Start'}
                            </button>
                            <button
                              onClick={() => setShowWorkNotes(fault.id)}
                              className="text-amber-600 hover:text-amber-900"
                              title="Add Work Notes"
                            >
                              Notes
                            </button>
                          </>
                        )}
                        {fault.status === FaultStatus.InProgress && (
                          <>
                            <button
                              onClick={() => setShowWorkNotes(fault.id)}
                              className="text-amber-600 hover:text-amber-900"
                              title="Update Work Notes"
                            >
                              Notes
                            </button>
                            <button
                              onClick={() => setShowReportForm(fault.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Complete Report"
                            >
                              Complete
                            </button>
                          </>
                        )}
                        {fault.status === FaultStatus.Resolved && (
                          <button
                            onClick={() => viewFaultDetails(fault)}
                            className="text-gray-600 hover:text-gray-900"
                            title="View Details"
                          >
                            View
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredFaults.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm">No faults match the current filters</p>
            <p className="text-xs text-gray-500 mt-1">Try adjusting the filters or check back later</p>
          </div>
        )}

        {/* Work Notes Modal */}
        {showWorkNotes && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Work Notes</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Work Progress Notes</label>
                    <textarea
                      value={workNotes[showWorkNotes] || ''}
                      onChange={(e) => setWorkNotes({...workNotes, [showWorkNotes]: e.target.value})}
                      placeholder="Describe your work progress, findings, and next steps..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                      rows={4}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <Button 
                    onClick={() => saveWorkNotes(showWorkNotes)}
                    disabled={updatingFault}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                  >
                    Save Notes
                  </Button>
                  <Button 
                    onClick={() => setShowWorkNotes(null)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fault Details Modal */}
        {selectedFault && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Fault Details - #{selectedFault.fault_number}</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Address</p>
                    <p className="text-sm text-gray-900">{selectedFault.address}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Area</p>
                    <p className="text-sm text-gray-900">{selectedFault.area}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Category</p>
                    <p className="text-sm text-gray-900">{selectedFault.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Priority</p>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(selectedFault.priority)}`}>
                      {selectedFault.priority}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status</p>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedFault.status)}`}>
                      {selectedFault.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Reported Date</p>
                    <p className="text-sm text-gray-900">{formatDate(selectedFault.reportedDate)}</p>
                  </div>
                  {selectedFault.assignedDate && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Assigned Date</p>
                      <p className="text-sm text-gray-900">{formatDate(selectedFault.assignedDate)}</p>
                    </div>
                  )}
                  {selectedFault.resolvedDate && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Resolved Date</p>
                      <p className="text-sm text-gray-900">{formatDate(selectedFault.resolvedDate)}</p>
                    </div>
                  )}
                </div>
                {selectedFault.description && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{selectedFault.description}</p>
                  </div>
                )}
                {selectedFault.resolutionSteps && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Resolution Steps</p>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{selectedFault.resolutionSteps}</p>
                  </div>
                )}
                <div className="flex justify-end mt-6">
                  <Button 
                    onClick={closeFaultDetails}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resolution Report Modal */}
        {showReportForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Complete Fault Report</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Steps</label>
                    <textarea
                      value={reportData.resolutionSteps}
                      onChange={(e) => setReportData({...reportData, resolutionSteps: e.target.value})}
                      placeholder="Describe the steps taken to resolve the fault..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Materials Used</label>
                    <textarea
                      value={reportData.materialsUsed}
                      onChange={(e) => setReportData({...reportData, materialsUsed: e.target.value})}
                      placeholder="List any materials or equipment used..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Spent</label>
                    <input
                      type="text"
                      value={reportData.timeSpent}
                      onChange={(e) => setReportData({...reportData, timeSpent: e.target.value})}
                      placeholder="e.g., 2 hours 30 minutes"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`followup-${showReportForm}`}
                      checked={reportData.followUpRequired}
                      onChange={(e) => setReportData({...reportData, followUpRequired: e.target.checked})}
                      className="w-4 h-4 bg-gray-300 rounded text-gray-600 focus:outline-none focus:border-blue-500"
                    />
                    <label htmlFor={`followup-${showReportForm}`} className="text-sm font-medium text-gray-700">
                      Follow-up Required
                    </label>
                  </div>
                  {reportData.followUpRequired && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Notes</label>
                      <textarea
                        value={reportData.followUpNotes}
                        onChange={(e) => setReportData({...reportData, followUpNotes: e.target.value})}
                        placeholder="Describe follow-up actions needed..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                        rows={2}
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <Button 
                    onClick={() => submitResolutionReport(showReportForm)}
                    disabled={updatingFault}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                  >
                    Submit Report
                  </Button>
                  <Button 
                    onClick={() => setShowReportForm(null)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TechnicianDashboard;
