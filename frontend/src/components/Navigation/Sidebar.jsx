import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, 
  Award, 
  Shield,
  CheckSquare
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useAuth();
  const role = currentUser?.role || 'TEACHER';

  if (role === 'ADMIN') {
    return (
      <aside style={{
        width: '270px',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid var(--border-color)',
        padding: '1.75rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        flexShrink: 0,
        minHeight: 'calc(100vh - 65px)',
        position: 'sticky',
        top: '65px',
        height: 'calc(100vh - 65px)',
        overflowY: 'auto'
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 0.5rem 0.5rem 0.5rem' }}>
          Admin Product Console
        </div>

        <button 
          onClick={() => setActiveTab('admin')} 
          className={`btn ${activeTab === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ justifyContent: 'flex-start', width: '100%', gap: '0.6rem', fontWeight: 700 }}
        >
          <Shield size={18} /> SaaS Monetization Hub
        </button>
      </aside>
    );
  }

  return (
    <aside style={{
      width: '270px',
      background: 'var(--bg-card)',
      backdropFilter: 'blur(16px)',
      borderRight: '1px solid var(--border-color)',
      padding: '1.75rem 1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.65rem',
      flexShrink: 0,
      minHeight: 'calc(100vh - 65px)',
      position: 'sticky',
      top: '65px',
      height: 'calc(100vh - 65px)',
      overflowY: 'auto'
    }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 0.5rem 0.5rem 0.5rem' }}>
        {role} Navigation
      </div>

      <button 
        onClick={() => setActiveTab('classrooms')} 
        className={`btn ${activeTab === 'classrooms' ? 'btn-primary' : 'btn-secondary'}`}
        style={{ justifyContent: 'flex-start', width: '100%', gap: '0.6rem' }}
      >
        <BookOpen size={18} /> My Classrooms
      </button>

      <button 
        onClick={() => setActiveTab('todo')} 
        className={`btn ${activeTab === 'todo' ? 'btn-primary' : 'btn-secondary'}`}
        style={{ justifyContent: 'flex-start', width: '100%', gap: '0.6rem' }}
      >
        <CheckSquare size={18} /> {role === 'STUDENT' ? 'To-do List' : 'To Review Hub'}
      </button>

      <button 
        onClick={() => setActiveTab('certificates')} 
        className={`btn ${activeTab === 'certificates' ? 'btn-primary' : 'btn-secondary'}`}
        style={{ justifyContent: 'flex-start', width: '100%', gap: '0.6rem' }}
      >
        <Award size={18} /> Certificates & Achievements
      </button>
    </aside>
  );
};
