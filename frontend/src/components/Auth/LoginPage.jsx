import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, UserCheck, GraduationCap, Shield, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export const LoginPage = () => {
  const { login, users } = useAuth();

  const [selectedRole, setSelectedRole] = useState('TEACHER');
  const [email, setEmail] = useState('sarah.jenkins@university.edu');
  const [password, setPassword] = useState('••••••••••••');
  const [error, setError] = useState('');

  const roleUsers = users.filter(u => u.role === selectedRole);

  const handleRoleTabChange = (role) => {
    setSelectedRole(role);
    const firstUser = users.find(u => u.role === role);
    if (firstUser) {
      setEmail(firstUser.email);
    }
    setError('');
  };

  const handleQuickUserSelect = (user) => {
    setEmail(user.email);
    setPassword('••••••••••••');
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const result = login(email, password);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 10%, rgba(99, 102, 241, 0.12) 0%, transparent 50%), radial-gradient(circle at 90% 90%, rgba(56, 189, 248, 0.1) 0%, transparent 50%), var(--bg-primary)',
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
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-purple))',
            padding: '0.85rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
            marginBottom: '1rem'
          }}>
            <Sparkles color="#ffffff" size={30} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(90deg, #38bdf8, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AI-ENABLED CLASSROOM
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Academic Management & Automated Integrity Platform
          </p>
        </div>

        {/* Role Tab Selector */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.4rem',
          background: 'var(--bg-secondary)',
          padding: '0.3rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          border: '1px solid var(--border-color)'
        }}>
          <button 
            type="button"
            onClick={() => handleRoleTabChange('TEACHER')}
            style={{
              padding: '0.6rem 0.4rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: selectedRole === 'TEACHER' ? 'var(--accent-indigo)' : 'transparent',
              color: selectedRole === 'TEACHER' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              transition: 'var(--transition)'
            }}
          >
            <UserCheck size={14} /> Teacher
          </button>
          
          <button 
            type="button"
            onClick={() => handleRoleTabChange('STUDENT')}
            style={{
              padding: '0.6rem 0.4rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: selectedRole === 'STUDENT' ? 'var(--accent-indigo)' : 'transparent',
              color: selectedRole === 'STUDENT' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              transition: 'var(--transition)'
            }}
          >
            <GraduationCap size={14} /> Student
          </button>

          <button 
            type="button"
            onClick={() => handleRoleTabChange('ADMIN')}
            style={{
              padding: '0.6rem 0.4rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: selectedRole === 'ADMIN' ? 'var(--accent-indigo)' : 'transparent',
              color: selectedRole === 'ADMIN' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              transition: 'var(--transition)'
            }}
          >
            <Shield size={14} /> Admin
          </button>
        </div>

        {/* Account Demo Selector */}
        <div style={{ marginBottom: '1.5rem', background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
            Select Demo Account ({selectedRole}):
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {roleUsers.map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickUserSelect(u)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  background: email === u.email ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-secondary)',
                  border: email === u.email ? '1px solid var(--accent-indigo)' : '1px solid transparent',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span><strong>{u.name}</strong> ({u.email})</span>
                {email === u.email && <CheckCircle2 size={14} color="var(--accent-indigo)" />}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem', textTransform: 'none', justifyContent: 'center' }}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Mail size={14} color="var(--accent-blue)" /> Institutional Email
            </label>
            <input 
              type="email" 
              className="form-input" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
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
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', gap: '0.5rem', marginTop: '0.5rem' }}
          >
            Sign In to Portal <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Enterprise Single Sign-On • Encrypted Session
        </div>
      </div>
    </div>
  );
};
