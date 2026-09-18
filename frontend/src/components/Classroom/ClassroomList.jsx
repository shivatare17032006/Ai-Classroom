import React, { useState } from 'react';
import { useClassroom } from '../../context/ClassroomContext';
import { useAuth } from '../../context/AuthContext';
import { CreateClassroomModal } from './CreateClassroomModal';
import { JoinClassroomModal } from './JoinClassroomModal';
import { 
  BookOpen, 
  Plus, 
  Users, 
  Copy, 
  Check, 
  ArrowRight, 
  KeyRound,
  GraduationCap
} from 'lucide-react';

const GRADIENTS = [
  'linear-gradient(135deg, #1e3a8a, #3b82f6)',
  'linear-gradient(135deg, #4c1d95, #8b5cf6)',
  'linear-gradient(135deg, #065f46, #10b981)',
  'linear-gradient(135deg, #831843, #ec4899)',
  'linear-gradient(135deg, #78350f, #f59e0b)'
];

export const ClassroomList = ({ onSelectClassroom }) => {
  const { classrooms, setActiveClassroom } = useClassroom();
  const { currentUser } = useAuth();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');

  // Strict filtering based on user role and enrollment
  const userClassrooms = (classrooms || []).filter(c => {
    if (!c) return false;
    if (currentUser?.role === 'TEACHER') {
      return c.teacherId === currentUser.id;
    }
    if (currentUser?.role === 'STUDENT') {
      return Array.isArray(c.studentIds) && c.studentIds.includes(currentUser.id);
    }
    return true; // ADMIN sees all
  });

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Banner & Join/Create Classroom Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>My Classrooms</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {currentUser?.role === 'TEACHER' 
              ? 'Manage your courses, create assignments, and review AI-graded student submissions.' 
              : 'View your enrolled courses, submit assignments, and track grades.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {currentUser?.role === 'TEACHER' && (
            <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary">
              <Plus size={16} /> Create Classroom
            </button>
          )}

          {currentUser?.role === 'STUDENT' && (
            <button onClick={() => setIsJoinOpen(true)} className="btn btn-primary">
              <KeyRound size={16} /> Join Classroom with Code
            </button>
          )}
        </div>
      </div>

      {/* Empty State when User is Not Enrolled in Any Class */}
      {userClassrooms.length === 0 ? (
        <div className="glass-card" style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          maxWidth: '560px',
          margin: '2rem auto'
        }}>
          <div style={{
            background: 'rgba(99, 102, 241, 0.15)',
            padding: '1.25rem',
            borderRadius: '50%',
            color: 'var(--accent-indigo)'
          }}>
            <BookOpen size={42} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>No Enrolled Classrooms Yet</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            {currentUser?.role === 'STUDENT' ? (
              <>You haven't joined any classrooms yet. Click <strong>"Join Classroom with Code"</strong> above and enter the class code provided by your instructor (e.g. <code>OS-2026-X</code> or <code>DBMS-2026-A</code>).</>
            ) : (
              <>You haven't created any classrooms yet. Click <strong>"Create Classroom"</strong> above to set up your first course.</>
            )}
          </p>
          {currentUser?.role === 'STUDENT' && (
            <button onClick={() => setIsJoinOpen(true)} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              <KeyRound size={16} /> Join Classroom Now
            </button>
          )}
          {currentUser?.role === 'TEACHER' && (
            <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              <Plus size={16} /> Create Classroom Now
            </button>
          )}
        </div>
      ) : (
        /* Classroom Cards Grid */
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {userClassrooms.map((c, index) => {
            const bgGradient = GRADIENTS[index % GRADIENTS.length];
            const studentCount = c.studentIds ? c.studentIds.length : 0;

            return (
              <div 
                key={c.id} 
                className="glass-card glass-card-interactive" 
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                {/* Card Google Classroom Banner Header */}
                <div style={{
                  background: bgGradient,
                  padding: '1.25rem',
                  color: '#ffffff',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(255, 255, 255, 0.2)', padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
                      {c.section || 'Course Section'}
                    </span>
                    {currentUser?.role === 'TEACHER' && (
                      <button 
                        onClick={() => handleCopyCode(c.code)}
                        title="Click to copy Class Join Code"
                        style={{
                          background: 'rgba(0,0,0,0.3)',
                          border: 'none',
                          color: '#ffffff',
                          padding: '0.3rem 0.6rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        {copiedCode === c.code ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                        Code: {c.code}
                      </button>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.75rem', lineHeight: '1.2' }}>{c.name}</h3>
                  <p style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.25rem' }}>{c.teacherName}</p>
                </div>

                {/* Card Content Details */}
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, justifyContent: 'space-between' }}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {c.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Users size={14} color="var(--accent-blue)" /> {studentCount} Enrolled Students
                    </span>

                    <button 
                      onClick={() => {
                        setActiveClassroom(c);
                        onSelectClassroom(c);
                      }}
                      className="btn btn-sm btn-primary"
                      style={{ gap: '0.35rem' }}
                    >
                      Open Class <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CreateClassroomModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <JoinClassroomModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} />

    </div>
  );
};
