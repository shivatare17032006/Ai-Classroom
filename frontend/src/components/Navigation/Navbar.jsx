import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useClassroom } from '../../context/ClassroomContext';
import { UserAvatar } from '../Common/UserAvatar';
import { 
  Sparkles, 
  Bell, 
  Moon, 
  Sun, 
  BookOpen, 
  LogOut,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';

export const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { classrooms, activeClassroom, setActiveClassroom, notifications } = useClassroom();
  
  const [theme, setTheme] = useState('dark');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const userClassrooms = (classrooms || []).filter(c => {
    if (!c) return false;
    if (currentUser?.role === 'ADMIN') return false;
    if (currentUser?.role === 'TEACHER') {
      return c.teacherId === currentUser.id;
    }
    if (currentUser?.role === 'STUDENT') {
      return Array.isArray(c.studentIds) && c.studentIds.includes(currentUser.id);
    }
    return false;
  });

  const unreadNotifs = (notifications || []).filter(n => !n?.read);

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.9rem 2rem',
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-purple))',
          padding: '0.6rem',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <Sparkles color="#ffffff" size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 800, background: 'linear-gradient(90deg, #38bdf8, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AI-ENABLED CLASSROOM
          </h1>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Academic Management & Evaluation Portal
          </span>
        </div>
      </div>

      {/* Classroom Dropdown Selector */}
      {userClassrooms.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <BookOpen size={16} color="var(--accent-blue)" />
          <select 
            value={activeClassroom && userClassrooms.some(c => c.id === activeClassroom.id) ? activeClassroom.id : ''} 
            onChange={(e) => setActiveClassroom(userClassrooms.find(c => c.id === e.target.value))}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', outline: 'none' }}
          >
            {userClassrooms.map(c => (
              <option key={c.id} value={c.id} style={{ background: 'var(--bg-secondary)' }}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Right User Actions & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          className="btn btn-secondary btn-icon"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
        </button>

        {/* Notifications Hub */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn btn-secondary btn-icon"
          >
            <Bell size={18} />
            {unreadNotifs.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: 'var(--status-danger)',
                color: '#fff',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {/* Notifications Drawer */}
          {showNotifications && (
            <div className="glass-card" style={{
              position: 'absolute',
              right: 0,
              top: '48px',
              width: '360px',
              maxHeight: '400px',
              overflowY: 'auto',
              zIndex: 200,
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Notifications</h4>
                <span className="badge badge-info">{notifications.length} Total</span>
              </div>
              {notifications.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                  No notifications.
                </p>
              ) : (
                notifications.slice(0, 5).map(n => (
                  <div key={n.id} style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: n.type === 'LOW_SCORE_FLAG' ? 'var(--status-danger-bg)' : 'var(--bg-secondary)',
                    marginBottom: '0.5rem',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                      <ShieldAlert size={14} color={n.type === 'LOW_SCORE_FLAG' ? '#ef4444' : '#38bdf8'} />
                      <strong style={{ fontSize: '0.8rem' }}>{n.title}</strong>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>{n.message}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User Profile Dropdown Menu */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer'
            }}
          >
            <UserAvatar name={currentUser?.name || 'User'} avatar={currentUser?.avatar} size={32} />
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentUser?.name}</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--accent-purple)', fontWeight: 600 }}>{currentUser?.role}</span>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="glass-card" style={{
              position: 'absolute',
              right: 0,
              top: '52px',
              width: '220px',
              zIndex: 200,
              padding: '0.75rem'
            }}>
              <div style={{ paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <UserAvatar name={currentUser?.name || 'User'} avatar={currentUser?.avatar} size={36} />
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block' }}>{currentUser?.name}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{currentUser?.email}</span>
                </div>
              </div>
              <button 
                onClick={logout}
                className="btn btn-sm btn-danger"
                style={{ width: '100%', justifyContent: 'center', gap: '0.4rem' }}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
