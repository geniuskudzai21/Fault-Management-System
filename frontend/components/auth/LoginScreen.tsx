import React, { useState } from 'react';
import { UserRole } from '../../constants';
import Button from '../common/Button';

interface LoginScreenProps {
  onLogin: (email: string, password: string, role: string) => Promise<{ success: boolean; error?: string }>;
  onRegister: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');

  const handleLogin = async () => {
    if (!email || !password || !selectedRole) {
      setError('Please fill in all fields and select your role');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    const result = await onLogin(email, password, selectedRole);
    
    setLoading(false);
    
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { authApi } = await import('../../src/api');
      await authApi.register({
        email,
        password,
        name,
        role: UserRole.Customer,
        area: 'Avenues'
      });
      alert('Registration successful! You can now login as a Customer.');
      setIsLogin(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#0b1326' }}>
        <div className="w-full max-w-sm p-5" style={{ backgroundColor: '#0d1a33', borderRadius: '0.75rem', border: '1px solid rgba(0,51,160,0.2)' }}>
          <div className="text-center mb-4">
            <div className="w-14 h-14 mx-auto mb-3 rounded-lg flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#fed000' }}>
              <img src="/images.jpg" alt="ZESA Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-lg font-bold text-white">Create Account</h1>
            <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>Join ZESA System</p>
          </div>
          
          {error && (
            <div className="mb-3 p-2 rounded-lg text-xs" style={{ backgroundColor: 'rgba(220,38,38,0.15)', color: '#ef4444' }}>
              {error}
            </div>
          )}
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#9ca3af' }}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-white text-sm"
                style={{ backgroundColor: '#0b1326', border: '1px solid rgba(0,51,160,0.3)' }}
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#9ca3af' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-white text-sm"
                style={{ backgroundColor: '#0b1326', border: '1px solid rgba(0,51,160,0.3)' }}
                placeholder="your@email"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#9ca3af' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-white text-sm"
                style={{ backgroundColor: '#0b1326', border: '1px solid rgba(0,51,160,0.3)' }}
                placeholder="Password"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#9ca3af' }}>Confirm</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-white text-sm"
                style={{ backgroundColor: '#0b1326', border: '1px solid rgba(0,51,160,0.3)' }}
                placeholder="Confirm"
              />
            </div>

            <Button onClick={handleRegister} disabled={loading} className="w-full py-2 font-medium rounded-lg transition-all text-sm" style={{ backgroundColor: '#0033a0', color: '#fed000' }}>
              {loading ? 'Processing...' : 'Register'}
            </Button>

            <div className="text-center pt-2">
              <button onClick={() => setIsLogin(true)} className="text-xs transition-colors" style={{ color: '#fed000' }}>
                Have account? Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#0b1326' }}>
      <div className="w-full max-w-sm p-5" style={{ backgroundColor: '#0d1a33', borderRadius: '0.75rem', border: '1px solid rgba(0,51,160,0.2)' }}>
        <div className="text-center mb-4">
          <div className="w-14 h-14 mx-auto mb-3 rounded-lg flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#fed000' }}>
            <img src="/images.jpg" alt="ZESA Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-lg font-bold text-white">Welcome Back</h1>
          <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>Login to ZESA</p>
        </div>

        {error && (
          <div className="mb-3 p-2 rounded-lg text-xs" style={{ backgroundColor: 'rgba(220,38,38,0.15)', color: '#ef4444' }}>
            {error}
          </div>
        )}
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#9ca3af' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-white text-sm"
              style={{ backgroundColor: '#0b1326', border: '1px solid rgba(0,51,160,0.3)' }}
              placeholder="user@domain.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#9ca3af' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-white text-sm"
              style={{ backgroundColor: '#0b1326', border: '1px solid rgba(0,51,160,0.3)' }}
              placeholder="Enter password"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#9ca3af' }}>Role</label>
            <select
              value={selectedRole || ''}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 rounded-lg text-white text-sm"
              style={{ backgroundColor: '#0b1326', border: '1px solid rgba(0,51,160,0.3)' }}
            >
              <option value="">Select role</option>
              <option value={UserRole.Customer}>Customer</option>
              <option value={UserRole.Technician}>Technician</option>
              <option value={UserRole.Admin}>Admin</option>
            </select>
          </div>

          <Button onClick={handleLogin} disabled={loading} className="w-full py-2 font-medium rounded-lg transition-all text-sm" style={{ backgroundColor: '#0033a0', color: '#fed000' }}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>

          <div className="text-center pt-2">
            <button onClick={() => setIsLogin(false)} className="text-xs transition-colors" style={{ color: '#fed000' }}>
              Create account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;