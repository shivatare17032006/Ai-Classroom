import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Sparkles, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  UserPlus, 
  LogIn,
  Users
} from 'lucide-react';

export const LoginPage = () => {
  const { login, register } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register'

  // Sign In State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Registration State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState('STUDENT'); // STUDENT | TEACHER
  const [regPassword, setRegPassword] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !password) {
      setError('Please enter your email address and password.');
      return;
    }

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!regName || !regEmail || !regPassword) {
      setError('Please complete all required fields.');
      return;
    }

    const result = await register({
      name: regName,
      email: regEmail,
      role: regRole,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    });

    if (!result.success) {
      setError(result.error);
    } else {
      setSuccessMsg('Account created successfully! Redirecting...');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 10%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 90% 90%, rgba(56, 189, 248, 0.12) 0%, transparent 50%), var(--bg-primary)',
      padding: '2rem'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '2.5rem',
        border: '1px solid var(--border-highlight)',
        boxShadow: 'var(--shadow-glow)',
        borderRadius: 'var(--radius-xl)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-purple))',
            padding: '0.85rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 0 24px rgba(99, 102, 241, 0.45)',
            marginBottom: '0.85rem'
          }}>
            <Sparkles color="#ffffff" size={32} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, background: 'linear-gradient(90deg, #38bdf8, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AI-ENABLED CLASSROOM
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Academic Management & Automated Integrity Platform
          </p>
        </div>

        {/* Mode Selector (Sign In vs Register) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.4rem',
          background: 'var(--bg-secondary)',
          padding: '0.35rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          border: '1px solid var(--border-color)'
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
            style={{
              padding: '0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: mode === 'login' ? 'var(--accent-indigo)' : 'transparent',
              color: mode === 'login' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'var(--transition)'
            }}
          >
            <LogIn size={16} /> Sign In
          </button>

          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
            style={{
              padding: '0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: mode === 'register' ? 'var(--accent-indigo)' : 'transparent',
              color: mode === 'register' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'var(--transition)'
            }}
          >
            <UserPlus size={16} /> Register Account
          </button>
        </div>

        {error && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '0.65rem', marginBottom: '1.25rem', textTransform: 'none', justifyContent: 'center', fontSize: '0.82rem' }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div className="badge badge-success" style={{ width: '100%', padding: '0.65rem', marginBottom: '1.25rem', textTransform: 'none', justifyContent: 'center', fontSize: '0.82rem' }}>
            {successMsg}
          </div>
        )}

        {/* SIGN IN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Mail size={14} color="var(--accent-blue)" /> Institutional Email
              </label>
              <input 
                type="email" 
                className="form-input" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                placeholder="name@university.edu"
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Lock size={14} color="var(--accent-purple)" /> Password
              </label>
              <input 
                type="password" 
                className="form-input" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required 
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', gap: '0.5rem', marginTop: '0.5rem' }}
            >
              Sign In <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={14} color="var(--accent-blue)" /> Full Name
              </label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Alex Johnson"
                value={regName}
                onChange={e => setRegName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Mail size={14} color="var(--accent-purple)" /> Email Address
              </label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="alex.j@university.edu"
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Users size={14} color="var(--accent-green)" /> Select Role
              </label>
              <select 
                className="form-select" 
                value={regRole} 
                onChange={e => setRegRole(e.target.value)}
              >
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Lock size={14} color="var(--accent-indigo)" /> Create Password
              </label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••••••"
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', gap: '0.5rem', marginTop: '0.5rem' }}
            >
              Create Account <ArrowRight size={16} />
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Protected by Enterprise Authentication Protocol
        </div>
      </div>
    </div>
  );
};
