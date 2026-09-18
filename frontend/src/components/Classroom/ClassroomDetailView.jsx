import React, { useState } from 'react';
import { useClassroom } from '../../context/ClassroomContext';
import { useAuth } from '../../context/AuthContext';
import { TeacherDashboard } from '../Teacher/TeacherDashboard';
import { StudentDashboard } from '../Student/StudentDashboard';
import { UserAvatar } from '../Common/UserAvatar';
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
  Send,
  Sparkles
} from 'lucide-react';

export const ClassroomDetailView = ({ classroom, onBack }) => {
  const { assignments, announcements, postAnnouncement } = useClassroom();
  const { currentUser, users } = useAuth();
  
  const [activeTab, setActiveTab] = useState('stream'); // 'stream' | 'classwork' | 'people' | 'analytics'
  const [copied, setCopied] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const classAssignments = assignments.filter(a => a.classroomId === classroom?.id);
  const enrolledStudents = (users || []).filter(u => u.role === 'STUDENT' && Array.isArray(classroom?.studentIds) && classroom.studentIds.includes(u.id));
  const classAnnouncements = (announcements || []).filter(a => a.classroomId === classroom?.id);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classroom?.code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementText.trim()) return;

    setIsPosting(true);
    await postAnnouncement({
      classroomId: classroom?.id,
      authorId: currentUser?.id,
      authorName: currentUser?.name || 'Instructor',
      authorRole: currentUser?.role || 'TEACHER',
      content: announcementText.trim(),
      createdAt: new Date().toISOString()
    });

    setAnnouncementText('');
    setIsPosting(false);
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
            <Users size={16} /> People ({enrolledStudents.length})
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
        <div className="grid-2" style={{ gridTemplateColumns: '260px 1fr' }}>
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

          {/* Stream Announcement Composer & Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Teacher Announcement Post Composer */}
            {currentUser?.role === 'TEACHER' && (
              <div className="glass-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-highlight)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <UserAvatar name={currentUser?.name || 'Teacher'} size={36} />
                  <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Announce something to your class</span>
                </div>

                <form onSubmit={handlePostAnnouncement}>
                  <textarea 
                    className="form-textarea" 
                    placeholder={`Share an update, syllabus note, or assignment instruction with ${classroom?.name || 'the class'}...`}
                    value={announcementText}
                    onChange={e => setAnnouncementText(e.target.value)}
                    style={{ minHeight: '85px', fontSize: '0.85rem' }}
                    required
                  />

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                    <button type="submit" disabled={isPosting} className="btn btn-primary btn-sm" style={{ gap: '0.4rem' }}>
                      <Send size={14} /> {isPosting ? 'Posting...' : 'Post Announcement'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Live Announcements Stream Feed */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MessageSquare size={16} color="var(--accent-purple)" /> Class Announcements & Stream
              </h3>

              {classAnnouncements.length === 0 ? (
                <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
                    <UserAvatar name={classroom?.teacherName || 'Instructor'} size={34} />
                    <div>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--accent-purple)' }}>{classroom?.teacherName}</strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Primary Instructor • Course Announcement</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.35rem', lineHeight: '1.5' }}>
                    Welcome to <strong>{classroom?.name}</strong>! Please review assignment rubrics, minimum threshold requirements, and submission policies before handing in coursework.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {classAnnouncements.map(ann => (
                    <div key={ann.id} style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <UserAvatar name={ann.authorName} size={34} />
                          <div>
                            <strong style={{ fontSize: '0.88rem', color: 'var(--accent-purple)' }}>{ann.authorName}</strong>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{ann.authorRole} • Posted on {new Date(ann.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                        {ann.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
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
            <UserAvatar name={classroom?.teacherName || 'Teacher'} size={40} />
            <div>
              <strong style={{ fontSize: '0.95rem' }}>{classroom?.teacherName}</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Primary Instructor</span>
            </div>
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Classmates ({enrolledStudents.length})</span>
          </h3>
          
          {enrolledStudents.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '1rem 0' }}>
              No enrolled students yet.
            </p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Institutional Email</th>
                  </tr>
                </thead>
                <tbody>
                  {enrolledStudents.map(student => (
                    <tr key={student.id}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700 }}>
                        <UserAvatar name={student.name} size={30} />
                        {student.name}
                      </td>
                      <td>{student.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Gradebook & AI Analytics View */}
      {activeTab === 'analytics' && currentUser?.role === 'TEACHER' && (
        <TeacherDashboard />
      )}

    </div>
  );
};
