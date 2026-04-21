import React, { useState, useEffect } from 'react';
import LoginScreen from './components/auth/LoginScreen';
import AdminDashboard from './components/admin/AdminDashboard';
import TechnicianDashboard from './components/technician/TechnicianDashboard';
import CustomerDashboard from './components/customer/CustomerDashboard';
import FaultManagement from './components/admin/FaultManagement';
import Reports from './components/admin/Reports';
import GenerateReports from './components/admin/GenerateReports';
import UserManagement from './components/admin/UserManagement';
import LoadSheddingManagement from './components/admin/LoadSheddingManagement';
import Settings from './components/admin/Settings';
import MainLayout from './components/MainLayout';
import { Area, UserRole, FaultStatus } from './constants';
import { Fault, User } from './types';
import { authApi, faultsApi, setAuthToken, getAuthToken } from './src/api';

type View = 'login' | 'admin-dashboard' | 'technician-dashboard' | 'customer-dashboard' | 'fault-management' | 'reports' | 'user-management' | 'load-shedding' | 'settings';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('login');
  const [faults, setFaults] = useState<Fault[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFaults = async () => {
    try {
      const response = await faultsApi.getAll();
      if (response.data) {
        setFaults(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch faults:', error);
    }
  };
  
  const handleLogin = async (email: string, password: string, role: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApi.login(email, password);
      if (response.data?.user) {
        setUser(response.data.user as User);
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setUser(null);
    setFaults([]);
    setView('login');
  };

  const handleNavigate = (newView: 'technician-dashboard' | 'customer-dashboard') => {
    setView(newView);
  };

  const handleManageUsers = () => {
    setView('user-management');
  };

  const handleManageFaults = () => {
    setView('fault-management');
  };

  const handleManageSchedules = () => {
    setView('load-shedding');
  };

  const handleGenerateReports = () => {
    setView('reports');
  };

  const handleGenerateNewReport = () => {
    setView('generate-reports');
  };

  const handleSystemSettings = () => {
    setView('settings');
  };

  const handleAuditLogs = () => {
    alert('Audit logs functionality coming soon!');
  };

  const handleBackToAdminDashboard = () => {
    setView('admin-dashboard');
  };

  const handleBackFromFaultManagement = () => {
    setView('admin-dashboard');
  };

  const handleBackFromReports = () => {
    setView('admin-dashboard');
  };

  const handleBackFromUserManagement = () => {
    setView('admin-dashboard');
  };

  const handleBackFromLoadShedding = () => {
    setView('admin-dashboard');
  };

  const handleBackFromSettings = () => {
    setView('admin-dashboard');
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const response = await authApi.getMe();
          if (response.data) {
            setUser(response.data as User);
          }
        } catch (error) {
          setAuthToken(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (user) {
      if (user.role === UserRole.Technician) {
        setView('technician-dashboard');
      } else if (user.role === UserRole.Customer) {
        setView('customer-dashboard');
      } else if (user.role === UserRole.Admin) {
        setView('admin-dashboard');
      }
      fetchFaults();
    } else {
      setView('login');
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        fetchFaults();
      }, 30000); // Poll every 30 seconds for real-time updates

      return () => clearInterval(interval);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderContent = () => {
    if (!user) {
      return <LoginScreen onLogin={handleLogin} onRegister={() => {}} />;
    }

    switch (view) {
      case 'admin-dashboard':
        return (
          <AdminDashboard 
            user={user}
            faults={faults}
            onManageUsers={handleManageUsers}
            onManageFaults={handleManageFaults}
            onManageSchedules={handleManageSchedules}
            onGenerateReports={handleGenerateReports}
            onGenerateNewReport={handleGenerateNewReport}
            onSystemSettings={handleSystemSettings}
            onAuditLogs={handleAuditLogs}
            onFaultsUpdate={fetchFaults}
          />
        );
      case 'technician-dashboard':
        return (
          <TechnicianDashboard 
            user={user}
            faults={faults}
            onFaultsUpdate={fetchFaults}
          />
        );
      case 'customer-dashboard':
        return (
          <CustomerDashboard 
            user={user}
            faults={faults}
            onFaultsUpdate={fetchFaults}
          />
        );
      case 'fault-management':
        return (
          <FaultManagement 
            user={user}
            faults={faults}
            onFaultsUpdate={fetchFaults}
            onBack={handleBackFromFaultManagement}
          />
        );
      case 'reports':
        return (
          <Reports 
            user={user}
            faults={faults}
            onBack={handleBackFromReports}
            onGenerateReports={handleGenerateNewReport}
          />
        );
      case 'generate-reports':
        return (
          <GenerateReports 
            user={user}
            faults={faults}
            onBack={handleBackFromReports}
          />
        );
      case 'user-management':
        return (
          <UserManagement 
            user={user}
            onBack={handleBackFromUserManagement}
          />
        );
      case 'load-shedding':
        return (
          <LoadSheddingManagement 
            user={user}
            onBack={handleBackFromLoadShedding}
          />
        );
      case 'settings':
        return (
          <Settings 
            user={user}
            onBack={handleBackFromSettings}
          />
        );
      default:
        return <LoginScreen onLogin={handleLogin} onRegister={() => {}} />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-950">
      {user && view !== 'login' ? (
        <MainLayout user={user} onLogout={handleLogout} onNavigate={handleNavigate} activeView={view}>
          {renderContent()}
        </MainLayout>
      ) : (
        renderContent()
      )}
    </div>
  );
};

export default App;
