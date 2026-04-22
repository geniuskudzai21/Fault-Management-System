import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import Button from '../common/Button';
import { usersApi } from '../../src/api';
import { ArrowLeftIcon, UserIcon, PlusIcon, TrashIcon, MagnifyingGlassIcon, Squares2X2Icon, XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, MenuIcon } from '../icons';

interface UserManagementProps {
  user: User;
  onBack: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ user, onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Customer',
    area: ''
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await usersApi.getAll();
        if (response.data) {
          setUsers(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = async () => {
    try {
      const response = await usersApi.create(newUser);
      if (response.success) {
        // Fetch updated user list
        const usersResponse = await usersApi.getAll();
        if (usersResponse.data) {
          setUsers(usersResponse.data);
        }
        setNewUser({ name: '', email: '', password: '', role: 'Customer', area: '' });
        setShowAddUser(false);
      }
    } catch (error: any) {
      console.error('Failed to add user:', error);
      alert(error.message || 'Failed to add user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await usersApi.delete(userId);
        setUsers(users.filter(u => u.id !== userId));
      } catch (error: any) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string | undefined) => {
    try {
      const normalizedStatus = currentStatus?.toLowerCase() || 'active';
      const newStatus = normalizedStatus === 'active' ? 'Inactive' : 'Active';
      await usersApi.updateStatus(userId, newStatus);
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (error: any) {
      console.error('Failed to update user status:', error);
    }
  };

  const stats = {
    totalUsers: users.length,
    admins: users.filter(u => u.role === 'Admin').length,
    technicians: users.filter(u => u.role === 'Technician').length,
    customers: users.filter(u => u.role === 'Customer').length,
    activeUsers: users.filter(u => (u.status || '').toLowerCase() === 'active').length,
  };

  if (loading) {
    return (
      <div className="flex" style={{ backgroundColor: 'rgba(10,10,15,0.95)', minHeight: '100vh' }}>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex" style={{ backgroundColor: 'rgba(10,10,15,0.95)', minHeight: '100vh' }}>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Fixed Sidebar */}
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
              <UserIcon className="w-5 h-5" />
              <span>Users</span>
            </button>
          </nav>

          <div className="p-4 border-t" style={{ borderColor: 'rgba(0,51,160,0.15)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold" style={{ backgroundColor: '#0033a0', color: '#fed000' }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs" style={{ color: '#9ca3af' }}>Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto transition-all duration-300 lg:ml-64">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          <div className="flex items-center gap-4 mb-6 lg:mb-8">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden flex p-2 rounded-lg transition-colors hover:bg-white/10"
              style={{ color: '#9ca3af' }}
              title="Open menu"
            >
              <Squares2X2Icon className="w-6 h-6" />
            </button>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">User Management</h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
            <div 
              className="p-6 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer border"
              style={{ backgroundColor: 'rgba(2, 9, 29, 1)', borderColor: '#0033a0' }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: '#0033a0' }}
                >
                  <UserIcon className="w-6 h-6" style={{ color: '#0033a0' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                  <p className="text-sm font-small" style={{ color: '#9ca3af' }}>Total Users</p>
                </div>
              </div>
            </div>

            <div 
              className="p-6 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer border"
              style={{ backgroundColor: 'rgba(2, 9, 29, 1)', borderColor: '#8b5cf6' }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: '#8b5cf6' }}
                >
                  <UserIcon className="w-6 h-6" style={{ color: '#8b5cf6' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.admins}</p>
                  <p className="text-sm font-small" style={{ color: '#9ca3af' }}>Admins</p>
                </div>
              </div>
            </div>

            <div 
              className="p-6 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer border"
              style={{ backgroundColor: 'rgba(2, 9, 29, 1)', borderColor: '#3b82f6' }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: '#3b82f6' }}
                >
                  <UserIcon className="w-6 h-6" style={{ color: '#3b82f6' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.technicians}</p>
                  <p className="text-sm font-small" style={{ color: '#9ca3af' }}>Technicians</p>
                </div>
              </div>
            </div>

            <div 
              className="p-6 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer border"
              style={{ backgroundColor: 'rgba(2, 9, 29, 1)', borderColor: '#10b981' }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: '#10b981' }}
                >
                  <UserIcon className="w-6 h-6" style={{ color: '#10b981' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.customers}</p>
                  <p className="text-sm font-small" style={{ color: '#9ca3af' }}>Customers</p>
                </div>
              </div>
            </div>

            <div 
              className="p-6 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer border"
              style={{ backgroundColor: 'rgba(2, 9, 29, 1)', borderColor: '#22c55e' }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: '#22c55e' }}
                >
                  <CheckCircleIcon className="w-6 h-6" style={{ color: '#22c55e' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
                  <p className="text-sm font-small" style={{ color: '#9ca3af' }}>Active</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters & Actions Bar */}
          <div className="rounded-2xl p-4 mb-6" style={{ backgroundColor: 'rgba(2, 9, 29, 1)' }}>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#9ca3af' }} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border focus:outline-none"
                  style={{ backgroundColor: 'rgba(10,10,15,0.95)', borderColor: 'rgba(0,51,160,0.2)', color: 'white', borderWidth: '1px' }}
                />
              </div>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-2.5 rounded-lg border focus:outline-none"
                style={{ backgroundColor: 'rgba(10,10,15,0.95)', borderColor: 'rgba(0,51,160,0.2)', color: 'white', borderWidth: '1px' }}
              >
                <option value="all" style={{ color: 'white' }}>All Roles</option>
                <option value="Admin" style={{ color: 'white' }}>Admin</option>
                <option value="Technician" style={{ color: 'white' }}>Technician</option>
                <option value="Customer" style={{ color: 'white' }}>Customer</option>
              </select>
              <button
                onClick={() => setShowAddUser(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: '#0033a0', color: '#fed000' }}
              >
                <PlusIcon className="w-5 h-5" />
                Add User
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'rgba(2, 9, 29, 1)' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#0b1326' }}>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Role</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Area</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((userData) => (
                    <tr 
                      key={userData.id} 
                      className="border-t transition-colors hover:bg-white/5"
                      style={{ borderColor: 'rgba(0,51,160,0.08)' }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold" style={{ backgroundColor: 'rgba(0,51,160,0.2)', color: '#fed000' }}>
                            {userData.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{userData.name}</p>
                            <p className="text-xs" style={{ color: '#9ca3af' }}>{userData.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1.5 text-xs font-medium rounded-lg inline-flex" style={{ 
                          backgroundColor: userData.role === 'Admin' ? 'rgba(139,92,246,0.15)' 
                          : userData.role === 'Technician' ? 'rgba(59,130,246,0.15)' 
                          : 'rgba(16,185,129,0.15)',
                          color: userData.role === 'Admin' ? '#8b5cf6' 
                          : userData.role === 'Technician' ? '#3b82f6' 
                          : '#10b981'
                        }}>
                          {userData.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm" style={{ color: '#9ca3af' }}>{userData.area || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg inline-flex ${
                          (userData.status || 'active').toLowerCase() === 'active' 
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {userData.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(userData.id, userData.status)}
                            className="p-2 rounded-lg transition-colors hover:bg-white/10"
                            style={{ color: (userData.status || 'active').toLowerCase() === 'active' ? '#22c55e' : '#ef4444' }}
                            title={(userData.status || 'active').toLowerCase() === 'active' ? 'Deactivate' : 'Activate'}
                          >
                            {(userData.status || 'active').toLowerCase() === 'active' ? (
                              <CheckCircleIcon className="w-5 h-5" />
                            ) : (
                              <ExclamationCircleIcon className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(userData.id)}
                            className="p-2 rounded-lg transition-colors hover:bg-red-500/20 text-red-400"
                            title="Delete"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/70" onClick={() => setShowAddUser(false)} />
            <div className="relative p-6 border rounded-2xl w-full max-w-md shadow-xl" style={{ backgroundColor: 'rgba(2, 9, 29, 1)', borderColor: 'rgba(0,51,160,0.2)' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Add New User</h3>
                <button
                  onClick={() => setShowAddUser(false)}
                  className="p-2 rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: '#9ca3af' }}
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#9ca3af' }}>Name</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border focus:outline-none"
                    style={{ backgroundColor: '#0b1326', borderColor: 'rgba(0,51,160,0.2)', color: 'white', borderWidth: '1px' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#9ca3af' }}>Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border focus:outline-none"
                    style={{ backgroundColor: '#0b1326', borderColor: 'rgba(0,51,160,0.2)', color: 'white', borderWidth: '1px' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#9ca3af' }}>Password</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border focus:outline-none"
                    style={{ backgroundColor: '#0b1326', borderColor: 'rgba(0,51,160,0.2)', color: 'white', borderWidth: '1px' }}
                    placeholder="Default: password123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#9ca3af' }}>Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border focus:outline-none"
                    style={{ backgroundColor: '#0b1326', borderColor: 'rgba(0,51,160,0.2)', color: 'white', borderWidth: '1px' }}
                  >
                    <option value="Customer" style={{ color: 'white' }}>Customer</option>
                    <option value="Technician" style={{ color: 'white' }}>Technician</option>
                    <option value="Admin" style={{ color: 'white' }}>Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#9ca3af' }}>Address</label>
                  <input
                    type="text"
                    value={newUser.area}
                    onChange={(e) => setNewUser({...newUser, area: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border focus:outline-none"
                    style={{ backgroundColor: '#0b1326', borderColor: 'rgba(0,51,160,0.2)', color: 'white', borderWidth: '1px' }}
                    placeholder="Enter address"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddUser(false)}
                  className="px-4 py-2.5 rounded-lg font-medium transition-colors hover:bg-white/10"
                  style={{ color: '#9ca3af' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  className="px-4 py-2.5 rounded-lg font-medium transition-all hover:opacity-90"
                  style={{ backgroundColor: '#0033a0', color: '#fed000' }}
                >
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;