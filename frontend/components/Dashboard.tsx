
import React from 'react';
import { User, Inspection } from '../types';
import { InspectionStatus, UserRole } from '../constants';
import Card from './common/Card';
import Button from './common/Button';

interface DashboardProps {
  user: User;
  inspections: Inspection[];
  onNavigateToList: () => void;
  onManageUsers?: () => void;
  onGenerateReports?: () => void;
  onSystemSettings?: () => void;
  onAuditLogs?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  inspections, 
  onNavigateToList, 
  onManageUsers, 
  onGenerateReports, 
  onSystemSettings, 
  onAuditLogs 
}) => {
  const pending = inspections.filter(i => i.status === InspectionStatus.Pending).length;
  const completed = inspections.filter(i => i.status === InspectionStatus.Completed).length;
  const followUp = inspections.filter(i => i.status === InspectionStatus.FollowUpRequired).length;

  const stats = [
    { label: 'Pending', value: pending, color: 'text-warning' },
    { label: 'Completed', value: completed, color: 'text-success' },
    { label: 'Follow-up', value: followUp, color: 'text-danger' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-dark">Welcome, {user.name}</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
            user.role === UserRole.Admin 
              ? 'bg-purple-100 text-purple-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {user.role}
          </span>
          <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-gray-100 text-gray-800">
            {user.department}
          </span>
        </div>
      </div>
      
      <Card>
        <h3 className="text-lg font-semibold mb-4">Inspection Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-center">
          {stats.map(stat => (
            <div key={stat.label} className="p-4 bg-light rounded-lg">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {user.role === UserRole.Admin && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Admin Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button variant="secondary" className="w-full" onClick={onManageUsers}>
              Manage Users
            </Button>
            <Button variant="secondary" className="w-full" onClick={onGenerateReports}>
              Generate Reports
            </Button>
            <Button variant="secondary" className="w-full" onClick={onSystemSettings}>
              System Settings
            </Button>
            <Button variant="secondary" className="w-full" onClick={onAuditLogs}>
              Audit Logs
            </Button>
          </div>
        </Card>
      )}

      <Card>
        <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
        <p className="text-gray-500 mb-4">Start your day by viewing your assigned tasks.</p>
        <Button onClick={onNavigateToList}>
          View All Inspections
        </Button>
      </Card>
      
      <Card>
        <h3 className="text-lg font-semibold mb-4">Sync Status</h3>
        <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-success animate-pulse"></div>
            <div>
                <p className="text-dark font-medium">Data Synced</p>
                <p className="text-sm text-gray-500">Last sync: Just now</p>
            </div>
        </div>
        <p className="text-xs text-gray-400 mt-4">Offline capability is active. Changes will be synced automatically when online.</p>
      </Card>
    </div>
  );
};

export default Dashboard;
