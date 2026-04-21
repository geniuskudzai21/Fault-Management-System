import React from 'react';
import { User } from '../../types';
import { BellIcon, LogoutIcon } from '../icons';

interface CustomerHeaderProps {
  user: User;
  onLogout: () => void;
  onNotifications?: () => void;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({ user, onLogout, onNotifications }) => {
  return (
    <header className="h-20 flex items-center justify-between px-6 sticky top-0 z-20" style={{ backgroundColor: '#0d1a33' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#fed000' }}>
          <img src="/images.jpg" alt="ZESA" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-white tracking-wide">ZESA</span>
          <span className="text-xs" style={{ color: '#ffffffff' }}>Fault Management System</span>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2.5 pl-10 text-sm rounded-lg focus:outline-none"
            style={{ backgroundColor: 'rgba(0,51,160,0.1)', border: '1px solid rgba(0,51,160,0.3)', color: '#9ca3af' }}
          />
          <svg className="w-4 h-4 absolute left-3 top-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
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

export default CustomerHeader;
