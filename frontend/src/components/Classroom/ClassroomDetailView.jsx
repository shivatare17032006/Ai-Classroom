import React, { useState } from 'react';
import { useClassroom } from '../../context/ClassroomContext';
import { useAuth } from '../../context/AuthContext';
import { TeacherDashboard } from '../Teacher/TeacherDashboard';
import { StudentDashboard } from '../Student/StudentDashboard';
import { 
  BookOpen, 
  MessageSquare, 
  FileText, 
  Users, 
  TrendingUp, 
  ArrowLeft, 
  Copy, 
  Check, 
  Clock,
  Sparkles,
  ShieldCheck,
  Plus
} from 'lucide-react';

export const ClassroomDetailView = ({ classroom, onBack }) => {
  const { assignments, submissions, extensions } = useClassroom();
  const { currentUser, users } = useAuth();
  
  const [activeTab, setActiveTab] = useState('stream'); // 'stream' | 'classwork' | 'people' | 'analytics'
  const [copied, setCopied] = useState(false);

  const classAssignments = assignments.filter(a => a.classroomId === classroom?.id);
  const enrolledStudents = users.filter(u => u.role === 'STUDENT' && (classroom?.studentIds?.includes(u.id) || true));

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classroom?.code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Back Button & Banner Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button onClick={onBack} className="btn btn-secondary btn-sm" style={{ gap: '0.3rem' }}>
          <ArrowLeft size={16} /> Back to Courses
        </button>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Classrooms / {classroom?.name}</span>
      </div>

      {/* Google Classroom Hero Header Card */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #4f46e5 100%)',
        color: '#ffffff',
        padding: '2rem',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-glow)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', marginBottom: '0.5rem' }}>
              {classroom?.section || 'Section A'}
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{classroom?.name}</h2>
            <p style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '0.25rem' }}>
              Instructor: <strong>{classroom?.teacherName}</strong> • {classroom?.description}
            </p>
          </div>

          {/* Class Code Widget */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                Class Join Code
              </span>
              <strong style={{ fontSize: '1.2rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
                {classroom?.code}
              </strong>
            </div>
            <button 
              onClick={handleCopyCode} 
              className="btn btn-sm btn-secondary" 
              style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
            >
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* 4 Google Classroom Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginTop: '1.75rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          paddingTop: '1rem'
        }}>
          <button 
            onClick={() => setActiveTab('stream')}
            style={{
              background: activeTab === 'stream' ? '#ffffff' : 'transparent',
              color: activeTab === 'stream' ? '#0f172a' : '#ffffff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <MessageSquare size={16} /> Stream
          </button>

          <button 
            onClick={() => setActiveTab('classwork')}
            style={{
              background: activeTab === 'classwork' ? '#ffffff' : 'transparent',
              color: activeTab === 'classwork' ? '#0f172a' : '#ffffff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <FileText size={16} /> Classwork & Assignments
          </button>

          <button 
            onClick={() => setActiveTab('people')}
            style={{
              background: activeTab === 'people' ? '#ffffff' : 'transparent',
              color: activeTab === 'people' ? '#0f172a' : '#ffffff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Users size={16} /> People ({enrolledStudents.length + 1})
          </button>

          {currentUser?.role === 'TEACHER' && (
            <button 
              onClick={() => setActiveTab('analytics')}
              style={{
                background: activeTab === 'analytics' ? '#ffffff' : 'transparent',
                color: activeTab === 'analytics' ? '#0f172a' : '#ffffff',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <TrendingUp size={16} /> AI Gradebook & Analytics
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Stream View */}
      {activeTab === 'stream' && (
        <div className="grid-2">
          {/* Upcoming Work Widget */}
          <div className="glass-card" style={{ height: 'fit-content' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={16} color="var(--accent-blue)" /> Upcoming Due Dates
            </h3>
            {classAssignments.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No upcoming assignments.</p>
            ) : (
              classAssignments.map(asg => (
                <div key={asg.id} style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.82rem' }}>
                  <strong style={{ display: 'block' }}>{asg.title}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Due: {new Date(asg.dueDate).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Stream Announcement Box */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Class Stream & Announcements</h3>
            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--accent-purple)' }}>{classroom?.teacherName}</strong>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                Welcome to {classroom?.name}! Please review assignment rubrics, minimum threshold requirements, and plagiarism policies before submitting work.
              </p>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem', display: 'block' }}>
                Posted today at 9:00 AM
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Classwork View */}
      {activeTab === 'classwork' && (
        currentUser?.role === 'TEACHER' ? (
          <TeacherDashboard />
        ) : (
          <StudentDashboard />
        )
      )}

      {/* Tab 3: People View */}
      {activeTab === 'people' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>Teachers & Instructors</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff' }}>
              P
            </div>
            <div>
              <strong style={{ fontSize: '0.95rem' }}>{classroom?.teacherName}</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Primary Instructor</span>
            </div>
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Classmates ({enrolledStudents.length})</span>
          </h3>
          
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Institutional Email</th>
                  <th>Parent / Guardian Email</th>
                </tr>
              </thead>
              <tbody>
                {enrolledStudents.map(student => (
                  <tr key={student.id}>
                    <td style={{ fontWeight: 700 }}>{student.name}</td>
                    <td>{student.email}</td>
                    <td>
                      <span className="badge badge-purple">{student.parentEmail || 'Linked Guardian'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Gradebook & AI Analytics View */}
      {activeTab === 'analytics' && currentUser?.role === 'TEACHER' && (
        <TeacherDashboard />
      )}

    </div>
  );
};
