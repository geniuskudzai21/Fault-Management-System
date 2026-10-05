import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import Button from '../common/Button';
import { ArrowLeftIcon, SettingsIcon, Squares2X2Icon, PlusIcon, TrashIcon } from '../icons';

interface SettingsProps {
  user: User;
  onBack: () => void;
}

interface SystemSettings {
  site_name: string;
  contact_email: string;
  contact_phone: string;
  maintenance_mode: boolean;
  auto_assign_technicians: boolean;
  notification_email: string;
  fault_categories: string[];
  default_priority: 'low' | 'medium' | 'high';
}

const Settings: React.FC<SettingsProps> = ({ user, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({
    site_name: 'ZESA Fault Management',
    contact_email: 'support@zesa.co.zw',
    contact_phone: '+263 4 777 777',
    maintenance_mode: false,
    auto_assign_technicians: true,
    notification_email: 'admin@zesa.co.zw',
    fault_categories: ['Power Outage', 'Line Damage', 'Transformer Fault', 'Meter Issue', 'Connection Problem'],
    default_priority: 'medium'
  });
  const [activeTab, setActiveTab] = useState('general');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error: any) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = () => {
    if (newCategory && newCategory.trim()) {
      setSettings({
        ...settings,
        fault_categories: [...settings.fault_categories, newCategory.trim()]
      });
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (category: string) => {
    setSettings({
      ...settings,
      fault_categories: settings.fault_categories.filter(c => c !== category)
    });
  };

  if (loading) {
    return (
      <div className="flex" style={{ 
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1f3a 25%, #0f172a 50%, #1e293b 75%, #0a0a0f 100%)',
        minHeight: '100vh' 
      }}>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex" style={{ 
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1f3a 25%, #0f172a 50%, #1e293b 75%, #0a0a0f 100%)',
      minHeight: '100vh' 
    }}>
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside 
        className={`w-64 flex-shrink-0 fixed inset-y-0 left-0 z-40 overflow-hidden transition-transform duration-300 -translate-x-full lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : ''}`}
        style={{ backgroundColor: 'rgba(2, 9, 29, 1)' }}
      >
        <div className="flex flex-col h-full">
          <div className="h-20 flex items-center px-6 border-b" style={{ borderColor: 'rgba(0,51,160,0.15)' }}>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-hidden">
            <button
              onClick={onBack}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white transition-all cursor-pointer font-medium"
              style={{ backgroundColor: '#0033a0' }}
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer font-medium"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <SettingsIcon className="w-5 h-5" />
              <span>Settings</span>
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
              title="Open menu"
            >
              <Squares2X2Icon className="w-6 h-6" />
            </button>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">System Settings</h1>
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="ml-auto px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: '#0033a0', color: '#fed000' }}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

          <div className="rounded-2xl mb-6" style={{ backgroundColor: 'rgba(2, 9, 29, 1)' }}>
            <div className="flex border-b" style={{ borderColor: 'rgba(0,51,160,0.15)' }}>
              {['general', 'notifications', 'categories', 'advanced'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-6 py-3 text-sm font-medium border-b-2 transition-colors capitalize"
                  style={{ 
                    borderColor: activeTab === tab ? '#0033a0' : 'transparent',
                    color: activeTab === tab ? '#fed000' : '#9ca3af'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'general' && (
            <div className="rounded-2xl p-6" style={{ backgroundColor: 'rgba(2, 9, 29, 1)' }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#9ca3af' }}>Site Name</label>
                  <input
                    type="text"
                    value={settings.site_name}
                    onChange={(e) => setSettings({...settings, site_name: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border focus:outline-none"
                    style={{ backgroundColor: 'rgba(10,10,15,0.95)', borderColor: 'rgba(0,51,160,0.2)', color: 'white', borderWidth: '1px' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#9ca3af' }}>Contact Email</label>
                  <input
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => setSettings({...settings, contact_email: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border focus:outline-none"
                    style={{ backgroundColor: 'rgba(10,10,15,0.95)', borderColor: 'rgba(0,51,160,0.2)', color: 'white', borderWidth: '1px' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#9ca3af' }}>Contact Phone</label>
                  <input
                    type="text"
                    value={settings.contact_phone}
                    onChange={(e) => setSettings({...settings, contact_phone: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border focus:outline-none"
                    style={{ backgroundColor: 'rgba(10,10,15,0.95)', borderColor: 'rgba(0,51,160,0.2)', color: 'white', borderWidth: '1px' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#9ca3af' }}>Default Priority</label>
                  <select
                    value={settings.default_priority}
                    onChange={(e) => setSettings({...settings, default_priority: e.target.value as 'low' | 'medium' | 'high'})}
                    className="w-full px-4 py-2.5 rounded-lg border focus:outline-none"
                    style={{ backgroundColor: 'rgba(10,10,15,0.95)', borderColor: 'rgba(0,51,160,0.2)', color: 'white', borderWidth: '1px' }}
                  >
                    <option value="low" style={{ color: 'white' }}>Low</option>
                    <option value="medium" style={{ color: 'white' }}>Medium</option>
                    <option value="high" style={{ color: 'white' }}>High</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="rounded-2xl p-6" style={{ backgroundColor: 'rgba(2, 9, 29, 1)' }}>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#0b1326' }}>
                  <div>
                    <p className="text-sm font-medium text-white">Notification Email</p>
                    <p className="text-xs" style={{ color: '#9ca3af' }}>Email address for system notifications</p>
                  </div>
                  <input
                    type="email"
                    value={settings.notification_email}
                    onChange={(e) => setSettings({...settings, notification_email: e.target.value})}
                    className="px-4 py-2.5 rounded-lg border focus:outline-none w-64"
                    style={{ backgroundColor: 'rgba(10,10,15,0.95)', borderColor: 'rgba(0,51,160,0.2)', color: 'white', borderWidth: '1px' }}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#0b1326' }}>
                  <div>
                    <p className="text-sm font-medium text-white">Auto-assign Technicians</p>
                    <p className="text-xs" style={{ color: '#9ca3af' }}>Automatically assign available technicians to faults</p>
                  </div>
                  <button
                    onClick={() => setSettings({...settings, auto_assign_technicians: !settings.auto_assign_technicians})}
                    className="w-12 h-6 rounded-full transition-colors"
                    style={{ backgroundColor: settings.auto_assign_technicians ? '#10b981' : '#4b5563' }}
                  >
                    <div className="w-5 h-5 rounded-full bg-white transform transition-transform" style={{ marginLeft: settings.auto_assign_technicians ? '26px' : '2px' }} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="rounded-2xl p-6" style={{ backgroundColor: 'rgba(2, 9, 29, 1)' }}>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter new category..."
                  className="flex-1 px-4 py-2.5 rounded-lg border focus:outline-none"
                  style={{ backgroundColor: 'rgba(10,10,15,0.95)', borderColor: 'rgba(0,51,160,0.2)', color: 'white', borderWidth: '1px' }}
                />
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2.5 rounded-lg font-medium transition-all hover:opacity-90"
                  style={{ backgroundColor: '#0033a0', color: '#fed000' }}
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                {settings.fault_categories.map((category) => (
                  <div key={category} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgba(10,10,15,0.95)' }}>
                    <span className="text-sm text-white">{category}</span>
                    <button
                      onClick={() => handleRemoveCategory(category)}
                      className="p-2 rounded-lg transition-colors hover:bg-red-500/20 text-red-400"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="rounded-2xl p-6" style={{ backgroundColor: 'rgba(2, 9, 29, 1)' }}>
              <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#0b1326' }}>
                <div>
                  <p className="text-sm font-medium text-white">Maintenance Mode</p>
                  <p className="text-xs" style={{ color: '#9ca3af' }}>Put the system in maintenance mode</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, maintenance_mode: !settings.maintenance_mode})}
                  className="w-12 h-6 rounded-full transition-colors"
                  style={{ backgroundColor: settings.maintenance_mode ? '#10b981' : '#4b5563' }}
                >
                  <div className="w-5 h-5 rounded-full bg-white transform transition-transform" style={{ marginLeft: settings.maintenance_mode ? '26px' : '2px' }} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;