import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useClassroom } from '../../context/ClassroomContext';
import { UserAvatar } from '../Common/UserAvatar';
import ProUpgradeModal from '../Common/ProUpgradeModal';
import { 
  Sparkles,
  Bell, 
  Moon, 
  Sun, 
  BookOpen, 
  LogOut,
  ShieldAlert,
  ChevronDown,
  Zap,
  Crown,
  Cookie
} from 'lucide-react';

export const Navbar = ({ onNavigateBilling }) => {
  const { currentUser, logout, isProUser, getRemainingAiCredits } = useAuth();
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

  // Filter notifications strictly for the individual logged-in user
  const userEmail = (currentUser?.email || '').trim().toLowerCase();
  const userId = currentUser?.id;
  const userRole = currentUser?.role;

  const userNotifs = (notifications || []).filter(n => {
    if (!n) return false;

    // Never show guardian/parent alerts on teacher or student in-app notification bell
    if (n.recipientRole === 'PARENT') return false;

    if (userRole === 'ADMIN') {
      return n.recipientRole === 'ADMIN';
    }

    if (userRole === 'TEACHER') {
      // Must be intended for this specific teacher
      if (n.recipientRole && n.recipientRole !== 'TEACHER') return false;

      const idMatch = userId && n.recipientId && n.recipientId === userId;
      const emailMatch = userEmail && n.recipientEmail && n.recipientEmail.trim().toLowerCase() === userEmail;

      return Boolean(idMatch || emailMatch);
    }

    if (userRole === 'STUDENT') {
      if (n.recipientRole && n.recipientRole !== 'STUDENT') return false;

      const idMatch = userId && n.recipientId && n.recipientId === userId;
      const emailMatch = userEmail && n.recipientEmail && n.recipientEmail.trim().toLowerCase() === userEmail;
      const studentMatch = userId && n.studentId && n.studentId === userId;

      return Boolean(idMatch || emailMatch || studentMatch);
    }

    return false;
  });

  const isPro = isProUser(currentUser);

  return (
    <header className="app-navbar" style={{
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
      <div className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          background: 'var(--accent-blue)',
          padding: '0.6rem',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          boxShadow: '0 3px 8px rgba(36,91,115,0.18)'
        }}>
          <Sparkles color="#ffffff" size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.01em' }}>
            CLASSROOM HUB
          </h1>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Teaching and learning workspace
          </span>
        </div>
      </div>

      {/* Classroom Dropdown Selector */}
      {userClassrooms.length > 0 && (
        <div className="navbar-classroom-selector" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
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
      <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        
        {/* SaaS Role Badge */}
        {currentUser?.role === 'ADMIN' ? (
          <span style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.45rem', 
            padding: '0.45rem 1.1rem', 
            borderRadius: '20px', 
            background: 'rgba(15, 118, 110, 0.10)', 
            border: '1px solid rgba(15, 118, 110, 0.18)', 
            color: '#0f766e', 
            fontSize: '0.78rem', 
            fontWeight: 800 
          }}>
            <Crown size={15} color="#0f766e" />
            <span>SYSTEM ADMIN</span>
          </span>
        ) : currentUser?.role === 'STUDENT' ? (
          <span style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            padding: '0.4rem 0.9rem', 
            borderRadius: '20px', 
            background: 'rgba(29, 78, 216, 0.08)', 
            border: '1px solid rgba(29, 78, 216, 0.16)', 
            color: 'var(--accent-blue)', 
            fontSize: '0.78rem', 
            fontWeight: 700 
          }}>
            <BookOpen size={14} color="var(--accent-blue)" />
            <span>Student Portal</span>
          </span>
        ) : isPro ? (
          <button
            onClick={() => onNavigateBilling && onNavigateBilling()}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.45rem 1rem', 
              borderRadius: '20px', 
              background: 'rgba(15, 118, 110, 0.08)', 
              border: '1px solid rgba(15, 118, 110, 0.16)', 
              color: 'var(--status-success)', 
              fontSize: '0.78rem', 
              fontWeight: 800,
              cursor: 'pointer'
            }}
            title="Click to view Billing & Subscriptions page"
          >
            <Crown size={15} color="var(--status-success)" />
            <span>{currentUser?.planType === 'INSTITUTIONAL_ENTERPRISE' ? 'INSTITUTION LICENSE' : 'PRO TEACHER'}</span>
          </button>
        ) : (
          <button
            onClick={() => onNavigateBilling && onNavigateBilling()}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.5rem 1.15rem', 
              borderRadius: '24px', 
              background: 'linear-gradient(135deg, #163a5f 0%, #1d4ed8 100%)', 
              color: '#ffffff', 
              fontSize: '0.8rem', 
              fontWeight: 900, 
              border: 'none',
              cursor: 'pointer',
              letterSpacing: '0.03em',
              transition: 'all 0.25s ease'
            }}
            title="Click to view Software Licensing options"
          >
            <Sparkles size={15} color="#ffffff" />
            <span>GET LICENSE</span>
            <span style={{
              background: 'rgba(255, 255, 255, 0.18)',
              padding: '0.15rem 0.5rem',
              borderRadius: '12px',
              fontSize: '0.68rem',
              fontWeight: 800,
              letterSpacing: '0.04em'
            }}>
              ACTIVATE
            </span>
          </button>
        )}

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
            {userNotifs.length > 0 && (
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
                {userNotifs.length}
              </span>
            )}
          </button>

          {/* Notifications Drawer */}
          {showNotifications && (
            <div className="glass-card" style={{
              position: 'absolute',
              right: 0,
              top: '48px',
              width: '380px',
              maxHeight: '440px',
              overflowY: 'auto',
              zIndex: 200,
              padding: '1rem',
              boxShadow: '0 12px 35px rgba(0, 0, 0, 0.25)',
              borderRadius: 'var(--radius-lg)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Bell size={16} color="var(--accent-blue)" />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>Notifications</h4>
                </div>
                <span className="badge badge-info" style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}>
                  {userNotifs.length} {userNotifs.length === 1 ? 'Alert' : 'Alerts'}
                </span>
              </div>

              {userNotifs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', border: '1px solid var(--border-color)' }}>
                    <Bell size={20} color="var(--text-muted)" style={{ opacity: 0.6 }} />
                  </div>
                  <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    You're all caught up!
                  </strong>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>
                    No notifications for your account. Alerts for your submissions and courses will appear here.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {userNotifs.slice(0, 8).map(n => (
                    <div key={n.id} style={{
                      padding: '0.75rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      background: n.type === 'LOW_SCORE_FLAG' 
                        ? 'rgba(239, 68, 68, 0.08)' 
                        : n.type === 'PLAGIARISM_ALERT'
                        ? 'rgba(245, 158, 11, 0.08)'
                        : 'var(--bg-secondary)',
                      border: n.type === 'LOW_SCORE_FLAG'
                        ? '1px solid rgba(239, 68, 68, 0.25)'
                        : n.type === 'PLAGIARISM_ALERT'
                        ? '1px solid rgba(245, 158, 11, 0.25)'
                        : '1px solid var(--border-color)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <ShieldAlert size={14} color={n.type === 'LOW_SCORE_FLAG' ? '#ef4444' : n.type === 'PLAGIARISM_ALERT' ? '#f59e0b' : '#38bdf8'} />
                          <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>{n.title}</strong>
                        </div>
                        {n.createdAt && (
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
                        {n.message}
                      </p>
                    </div>
                  ))}
                </div>
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
              width: '240px',
              zIndex: 200,
              padding: '0.75rem'
            }}>
              <div style={{ paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <UserAvatar name={currentUser?.name || 'User'} avatar={currentUser?.avatar} size={36} />
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block' }}>{currentUser?.name}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>{currentUser?.email}</span>
                  {currentUser?.role === 'STUDENT' && (
                    <span style={{ fontSize: '0.68rem', color: 'var(--accent-indigo)', fontWeight: 600, display: 'block', marginTop: '0.1rem' }}>
                      Roll: {currentUser?.rollNo || 'N/A'} • PRN: {currentUser?.prnNo || 'N/A'}
                    </span>
                  )}
                </div>
              </div>

              {currentUser?.role === 'ADMIN' ? (
                <div style={{ padding: '0.4rem 0.6rem', marginBottom: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: '8px', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>System Management:</span>
                  <strong style={{ color: '#c084fc' }}>👑 Platform Admin Console</strong>
                </div>
              ) : currentUser?.role === 'TEACHER' ? (
                <>
                  <div style={{ padding: '0.4rem 0.6rem', marginBottom: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: '8px', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Active Subscription:</span>
                    <strong style={{ color: isPro ? 'var(--status-success)' : 'var(--status-danger)' }}>
                      {isPro ? (currentUser?.planType === 'INSTITUTIONAL_ENTERPRISE' ? 'Institutional Enterprise' : 'Individual Pro Teacher') : '🔒 Unlicensed (License Required)'}
                    </strong>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      if (onNavigateBilling) onNavigateBilling();
                    }}
                    className="w-full mb-2 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Zap size={14} /> {isPro ? 'Billing & Subscriptions' : 'Get Software License'}
                  </button>
                </>
              ) : (
                <div style={{ padding: '0.4rem 0.6rem', marginBottom: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: '8px', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Access Status:</span>
                  <strong style={{ color: 'var(--status-success)' }}>Student Access Provided</strong>
                </div>
              )}

              <button 
                type="button"
                onClick={() => {
                  setShowUserMenu(false);
                  window.dispatchEvent(new CustomEvent('aicl:open-cookie-modal'));
                }}
                className="btn btn-sm btn-secondary"
                style={{ width: '100%', justifyContent: 'center', gap: '0.45rem', marginBottom: '0.5rem', fontSize: '0.75rem' }}
              >
                <Cookie size={14} /> Cookie & Privacy Settings
              </button>

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
