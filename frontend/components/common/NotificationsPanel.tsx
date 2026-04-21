import React, { useState } from 'react';
import { Notification } from '../../types';
import { BellIcon, XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, ClockIcon, PowerIcon } from '../icons';

interface NotificationsPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ 
  notifications, 
  onClose, 
  onMarkRead, 
  onClearAll 
}) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'load_shedding':
        return <PowerIcon className="w-5 h-5" style={{ color: '#f59e0b' }} />;
      case 'power_restored':
        return <CheckCircleIcon className="w-5 h-5" style={{ color: '#10b981' }} />;
      case 'fault_assigned':
        return <ClockIcon className="w-5 h-5" style={{ color: '#8b5cf6' }} />;
      case 'fault_resolved':
        return <CheckCircleIcon className="w-5 h-5" style={{ color: '#10b981' }} />;
      case 'new_fault':
        return <ExclamationCircleIcon className="w-5 h-5" style={{ color: '#dc2626' }} />;
      default:
        return <BellIcon className="w-5 h-5" style={{ color: '#9ca3af' }} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'load_shedding':
        return 'rgba(245,158,11,0.15)';
      case 'power_restored':
        return 'rgba(16,185,129,0.15)';
      case 'fault_assigned':
        return 'rgba(139,92,246,0.15)';
      case 'fault_resolved':
        return 'rgba(16,185,129,0.15)';
      case 'new_fault':
        return 'rgba(220,38,38,0.15)';
      default:
        return 'rgba(107,114,128,0.15)';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-20 pr-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <div 
        className="relative w-96 max-h-[70vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'rgba(2, 9, 29, 1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(0,51,160,0.15)' }}>
          <div className="flex items-center gap-3">
            <BellIcon className="w-5 h-5" style={{ color: '#fed000' }} />
            <h3 className="text-lg font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: '#0033a0', color: '#fed000' }}>
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: '#9ca3af' }}
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg transition-colors hover:bg-white/10"
              style={{ color: '#9ca3af' }}
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-[500px]">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <BellIcon className="w-12 h-12 mx-auto mb-4 opacity-50" style={{ color: '#9ca3af' }} />
              <p className="text-sm" style={{ color: '#9ca3af' }}>No notifications</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgba(0,51,160,0.08)' }}>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 transition-colors cursor-pointer hover:bg-white/5 ${
                    !notification.isRead ? 'border-l-2' : ''
                  }`}
                  style={{ 
                    borderLeftColor: !notification.isRead ? '#fed000' : 'transparent',
                    backgroundColor: !notification.isRead ? 'rgba(0,51,160,0.05)' : 'transparent'
                  }}
                  onClick={() => onMarkRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`} style={{ backgroundColor: getNotificationColor(notification.type) }}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{notification.title}</p>
                          <p className="text-xs mt-1" style={{ color: '#9ca3af', lineHeight: '1.4' }}>
                            {notification.message}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: '#fed000' }} />
                        )}
                      </div>
                      <p className="text-xs mt-2" style={{ color: '#6b7280' }}>
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;
