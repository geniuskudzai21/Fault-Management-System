import React, { useState } from 'react';
import { User } from '../types';
import { UserRole } from '../constants';
import { MenuIcon, XMarkIcon, HomeIcon, DocumentTextIcon, ArrowRightOnRectangleIcon, LogoutIcon } from './icons';
import { AdminHeader, TechnicianHeader, CustomerHeader } from './headers';

interface MainLayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  onNavigate: (view: 'technician-dashboard' | 'customer-dashboard') => void;
  onSettings?: () => void;
  onNotifications?: () => void;
  activeView: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, user, onLogout, onSettings, onNotifications, activeView }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const renderHeader = () => {
    switch (user.role) {
      case UserRole.Admin:
        return <AdminHeader user={user} onLogout={onLogout} onNotifications={onNotifications} />;
      case UserRole.Technician:
        return <TechnicianHeader user={user} onLogout={onLogout} onNotifications={onNotifications} />;
      case UserRole.Customer:
        return <CustomerHeader user={user} onLogout={onLogout} onNotifications={onNotifications} />;
      default:
        return <AdminHeader user={user} onLogout={onLogout} onNotifications={onNotifications} />;
    }
  };

  const getRoleColor = () => {
    switch (user.role) {
      case UserRole.Admin:
        return 'purple';
      case UserRole.Technician:
        return 'blue';
      case UserRole.Customer:
        return 'green';
      default:
        return 'purple';
    }
  };

  const roleColor = getRoleColor();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0b1326' }}>
      {renderHeader()}

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 sm:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-64" style={{ backgroundColor: '#0d1a33' }}>
            <div className="p-4 border-b" style={{ borderColor: 'rgba(0,51,160,0.2)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold bg-${roleColor}-500/20 text-${roleColor}-400 border border-${roleColor}-500/30`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{user.name}</p>
                    <p className={`text-xs text-${roleColor}-400`}>{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-2">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 transition-colors"
              >
                <HomeIcon className="w-5 h-5" />
                Dashboard
              </button>
              
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-white/5 transition-colors"
              >
                <DocumentTextIcon className="w-5 h-5" />
                Faults
              </button>
              
              <div className="pt-4 mt-4 border-t" style={{ borderColor: 'rgba(0,51,160,0.2)' }}>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <main className="flex-1 relative z-10">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
