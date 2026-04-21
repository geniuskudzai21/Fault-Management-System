import React from 'react';
import { User } from '../../types';
import { BellIcon, LogoutIcon } from '../icons';

interface TechnicianHeaderProps {
  user: User;
  onLogout: () => void;
  onNotifications?: () => void;
}

const TechnicianHeader: React.FC<TechnicianHeaderProps> = ({ user, onLogout, onNotifications }) => {
  return (
    <header className="h-20 flex items-center justify-between px-6 sticky top-0 z-20" style={{ backgroundColor: 'rgba(10,10,15,0.95)' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#fed000' }}>
          <img src="/images.jpg" alt="ZESA" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-white tracking-wide">ZESA</span>
          <span className="text-xs" style={{ color: '#ffffffff' }}>Fault Management System</span>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-8 flex items-center justify-center">

      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={onNotifications}
          className="p-2.5 rounded-lg transition-colors hover:bg-white/5 relative" 
          style={{ color: '#9ca3af' }}
        >
          <BellIcon className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#001a4d' }}></span>
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(0,51,160,0.2)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: '#001a4d' }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-white text-sm font-medium">{user.name}</span>
        </div>
        <button 
          onClick={onLogout}
          className="p-2.5 rounded-lg transition-colors hover:bg-red-500/20" 
          style={{ color: '#ef4444' }}
        >
          <LogoutIcon className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default TechnicianHeader;
