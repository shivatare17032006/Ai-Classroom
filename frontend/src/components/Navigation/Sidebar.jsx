import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, 
  Award, 
  Shield 
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useAuth();
  const role = currentUser?.role || 'TEACHER';

  return (
    <aside style={{
      width: '240px',
      background: 'var(--bg-card)',
      borderRight: '1px solid var(--border-color)',
      padding: '1.5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      flexShrink: 0
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
        onClick={() => setActiveTab('certificates')} 
        className={`btn ${activeTab === 'certificates' ? 'btn-primary' : 'btn-secondary'}`}
        style={{ justifyContent: 'flex-start', width: '100%', gap: '0.6rem' }}
      >
        <Award size={18} /> Certificates & Achievements
      </button>

      {role === 'ADMIN' && (
        <button 
          onClick={() => setActiveTab('admin')} 
          className={`btn ${activeTab === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ justifyContent: 'flex-start', width: '100%', gap: '0.6rem' }}
        >
          <Shield size={18} /> System Governance
        </button>
      )}
    </aside>
  );
};
