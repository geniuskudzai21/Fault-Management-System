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
    <header
      className="h-16 sm:h-20 flex items-center gap-2 sm:gap-3 px-3 sm:px-6 sticky top-0 z-20"
      style={{ backgroundColor: 'rgba(2, 9, 29, 1)' }}
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
        <div
          className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-lg flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: '#fed000' }}
        >
          <img src="/images.jpg" alt="ZESA" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm sm:text-lg font-semibold text-white tracking-wide truncate">
            ZESA/ZETDC
          </span>
          <span className="hidden sm:block text-xs truncate" style={{ color: '#ffffffff' }}>
            Fault Management System
          </span>
        </div>
      </div>

      <div className="hidden sm:flex flex-1 max-w-md mx-8 items-center justify-center" />

      <div className="flex items-center gap-2 sm:gap-3 ml-auto shrink-0">
        <button
          onClick={onNotifications}
          aria-label="Notifications"
          title="Notifications"
          className="shrink-0 p-2 sm:p-2.5 rounded-lg transition-colors hover:bg-white/5 relative"
          style={{ color: '#9ca3af' }}
        >
          <BellIcon className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#001a4d' }} />
        </button>
        <div
          className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg min-w-0"
          style={{ backgroundColor: 'rgba(0,51,160,0.2)' }}
        >
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-medium"
            style={{ backgroundColor: '#001a4d' }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:block text-white text-sm font-medium truncate max-w-[7rem] sm:max-w-none">
            {user.name}
          </span>
        </div>
        <button
          onClick={onLogout}
          aria-label="Log out"
          title="Log out"
          className="shrink-0 p-2 sm:p-2.5 rounded-lg transition-colors hover:bg-red-500/20 active:bg-red-500/30"
          style={{ color: '#ef4444' }}
        >
          <LogoutIcon className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default CustomerHeader;