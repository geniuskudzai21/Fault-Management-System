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
    if (!email || !password) {
      setError('Please enter email and password');
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
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: '#0a0a0f' }}>
      {/* Cyberpunk grid background */}
      <div className="absolute inset-0" style={{ 
        backgroundImage: `linear-gradient(rgba(0,150,255,0.03) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(0,150,255,0.03) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }} />
      {/* Glow effects */}
      <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,150,255,0.15) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,100,255,0.15) 0%, transparent 70%)' }} />
      
      <div className="w-full max-w-sm p-6 relative z-10" style={{ 
        backgroundColor: 'rgba(10,10,15,0.95)', 
        borderRadius: '0.5rem', 
        border: '1px solid rgba(0,150,255,0.4)',
        boxShadow: '0 0 20px rgba(0,150,255,0.2), inset 0 0 20px rgba(0,150,255,0.05)'
      }}>
        {/* Top neon line */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #0096ff, transparent)' }} />
        
        <div className="text-center mb-4">
          <div className="w-14 h-14 mx-auto mb-3 rounded-lg flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#fed000', boxShadow: '0 0 15px rgba(254,208,0,0.5)' }}>
            <img src="/images.jpg" alt="ZESA Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-lg font-bold tracking-wider" style={{ color: '#0096ff', textShadow: '0 0 10px rgba(0,150,255,0.5)' }}>NEW USER</h1>
          <p className="text-xs mt-1" style={{ color: '#0096ff', opacity: 0.6, letterSpacing: '2px' }}>// REGISTRATION</p>
        </div>

        {error && (
          <div className="mb-3 p-2 rounded text-xs font-mono" style={{ backgroundColor: 'rgba(255,0,0,0.2)', color: '#ff0000', border: '1px solid #ff0000' }}>
            ⚠ {error}
          </div>
        )}
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-mono mb-1" style={{ color: '#0096ff' }}>// FULL NAME</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded text-sm font-mono"
              style={{ backgroundColor: 'rgba(0,150,255,0.05)', border: '1px solid rgba(0,150,255,0.3)', color: '#0096ff' }}
              placeholder="Enter name"
            />
          </div>

          <div>
            <label className="block text-xs font-mono mb-1" style={{ color: '#0096ff' }}>// EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded text-sm font-mono"
              style={{ backgroundColor: 'rgba(0,150,255,0.05)', border: '1px solid rgba(0,150,255,0.3)', color: '#0096ff' }}
              placeholder="your@email"
            />
          </div>

          <div>
            <label className="block text-xs font-mono mb-1" style={{ color: '#0096ff' }}>// PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded text-sm font-mono"
              style={{ backgroundColor: 'rgba(0,150,255,0.05)', border: '1px solid rgba(0,150,255,0.3)', color: '#0096ff' }}
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-mono mb-1" style={{ color: '#0096ff' }}>// CONFIRM</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded text-sm font-mono"
              style={{ backgroundColor: 'rgba(0,150,255,0.05)', border: '1px solid rgba(0,150,255,0.3)', color: '#0096ff' }}
              placeholder="••••••••"
            />
          </div>

          <Button onClick={handleRegister} disabled={loading} className="w-full py-2 font-mono rounded transition-all text-sm hover:scale-105" style={{ backgroundColor: '#0096ff', color: '#0a0a0f', fontWeight: 'bold', boxShadow: '0 0 15px rgba(0,150,255,0.5)' }}>
            {loading ? '>> PROCESSING...' : '>> REGISTER'}
          </Button>

          <div className="text-center pt-2">
            <button onClick={() => setIsLogin(true)} className="text-xs font-mono transition-colors hover:underline" style={{ color: '#0096ff' }}>
              // LOGIN
            </button>
          </div>
        </div>
        
        {/* Bottom neon line */}
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #0096ff, transparent)' }} />
      </div>
    </div>
  );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: '#0a0a0f' }}>
      {/* Cyberpunk grid background */}
      <div className="absolute inset-0" style={{ 
        backgroundImage: `linear-gradient(rgba(0,150,255,0.03) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(0,150,255,0.03) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }} />
      {/* Glow effects */}
      <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,150,255,0.15) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,100,255,0.15) 0%, transparent 70%)' }} />
      
      <div className="w-full max-w-sm p-6 relative z-10" style={{ 
        backgroundColor: 'rgba(10,10,15,0.95)', 
        borderRadius: '0.5rem', 
        border: '1px solid rgba(0,150,255,0.4)',
        boxShadow: '0 0 20px rgba(0,150,255,0.2), inset 0 0 20px rgba(0,150,255,0.05)'
      }}>
        {/* Top neon line */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #0096ff, transparent)' }} />
        
        <div className="text-center mb-4">
          <div className="w-14 h-14 mx-auto mb-3 rounded-lg flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#fed000', boxShadow: '0 0 15px rgba(254,208,0,0.5)' }}>
            <img src="/images.jpg" alt="ZESA Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-lg font-bold tracking-wider" style={{ color: '#0096ff', textShadow: '0 0 10px rgba(0,150,255,0.5)' }}>ZESA SYSTEM</h1>
          <p className="text-xs mt-1" style={{ color: '#0096ff', opacity: 0.6, letterSpacing: '2px' }}>// ACCESS PORTAL</p>
        </div>

        {error && (
          <div className="mb-3 p-2 rounded text-xs font-mono" style={{ backgroundColor: 'rgba(255,0,0,0.2)', color: '#ff0000', border: '1px solid #ff0000' }}>
            ⚠ {error}
          </div>
        )}
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-mono mb-2" style={{ color: '#0096ff' }}>// EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mb-2 rounded text-sm font-mono"
              style={{ backgroundColor: 'rgba(0,150,255,0.05)', border: '1px solid rgba(0,150,255,0.3)', color: '#0096ff' }}
              placeholder="user@domain.com"
            />
          </div>

          <div>
            <label className="block text-xs font-mono mb-2" style={{ color: '#0096ff' }}>// PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mb-2 rounded text-sm font-mono"
              style={{ backgroundColor: 'rgba(0,150,255,0.05)', border: '1px solid rgba(0,150,255,0.3)', color: '#0096ff' }}
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded" style={{ accentColor: '#0096ff' }} />
              <span className="text-xs font-mono" style={{ color: '#0096ff', opacity: 0.7 }}>REMEMBER ME</span>
            </label>
            <button className="text-xs font-mono transition-colors hover:underline" style={{ color: '#0096ff' }}>
             Forgot Password?
            </button>
          </div>

          <Button onClick={handleLogin} disabled={loading} className="w-full py-2 font-mono rounded transition-all text-sm hover:scale-105" style={{ backgroundColor: '#0096ff', color: '#0a0a0f', fontWeight: 'bold', boxShadow: '0 0 15px rgba(0,150,255,0.5)' }}>
            {loading ? '>> CONNECTING...' : '>> LOGIN'}
          </Button>

          <div className="text-center pt-2">
            <button onClick={() => setIsLogin(false)} className="text-xs font-mono transition-colors hover:underline" style={{ color: '#ff0000' }}>
              // CREATE NEW ACCOUNT
            </button>
          </div>
        </div>
        
        {/* Bottom neon line */}
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #ff0000, transparent)' }} />
      </div>
    </div>
  );
};

export default LoginScreen;