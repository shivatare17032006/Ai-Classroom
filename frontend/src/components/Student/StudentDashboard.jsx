import React, { useState } from 'react';
import { useClassroom } from '../../context/ClassroomContext';
import { useAuth } from '../../context/AuthContext';
import { SubmitAssignmentModal } from './SubmitAssignmentModal';
import { CertificateLocker } from './CertificateLocker';
import { 
  BookOpen, 
  Clock, 
  FileCheck, 
  UploadCloud, 
  AlertTriangle, 
  Award, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  Bell
} from 'lucide-react';

export const StudentDashboard = () => {
  const { activeClassroom, assignments, submissions, extensions, notifications } = useClassroom();
  const { currentUser } = useAuth();

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [activeTab, setActiveTab] = useState('assignments'); // 'assignments' | 'certificates'

  const safeAssignments = assignments || [];
  const safeSubmissions = submissions || [];
  const safeExtensions = extensions || [];
  const safeNotifications = notifications || [];
  const studentId = currentUser?.id || '';

  const classAssignments = safeAssignments.filter(a => a?.classroomId === activeClassroom?.id);
  const studentNotifs = safeNotifications.filter(n => n?.studentId === studentId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            Welcome, {currentUser?.name || 'Student'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Role: Student • Enrolled in <strong>{activeClassroom?.name || 'Classroom'}</strong>
          </p>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => setActiveTab('assignments')} 
            className={`btn ${activeTab === 'assignments' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <BookOpen size={16} /> Course Assignments & Grades
          </button>
          <button 
            onClick={() => setActiveTab('certificates')} 
            className={`btn ${activeTab === 'certificates' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Award size={16} /> Certificate Locker
          </button>
        </div>
      </div>

      {/* Notifications Alert Hub for Student */}
      {studentNotifs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {studentNotifs.slice(0, 2).map(n => (
            <div key={n.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: n.type === 'LOW_SCORE_FLAG' ? 'var(--status-danger-bg)' : 'var(--status-info-bg)',
              border: `1px solid ${n.type === 'LOW_SCORE_FLAG' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(6, 182, 212, 0.4)'}`,
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-md)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <AlertTriangle color={n.type === 'LOW_SCORE_FLAG' ? '#ef4444' : '#06b6d4'} size={18} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{n.message}</span>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Parent & Teacher Notified via Automated Mail
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'certificates' ? (
        <CertificateLocker />
      ) : (
        /* Assignments Grid View */
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}>
          {classAssignments.map(asg => {
            const sub = safeSubmissions.find(s => s.assignmentId === asg.id && s.studentId === studentId);
            const ext = safeExtensions.find(e => e.assignmentId === asg.id && e.studentId === studentId);

            const effectiveDueDate = ext ? ext.extendedDueDate : asg.dueDate;
            const isLate = new Date() > new Date(effectiveDueDate) && !sub;

            return (
              <div key={asg.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                
                {/* Assignment Title & Meta */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{asg.title}</h3>
                    {sub ? (
                      sub.isBelowThreshold ? (
                        <span className="badge badge-danger">FLAGGED BELOW THRESHOLD</span>
                      ) : sub.status === 'FINALIZED' ? (
                        <span className="badge badge-success">GRADED / PASS</span>
                      ) : (
                        <span className="badge badge-warning">PENDING TEACHER REVIEW</span>
                      )
                    ) : isLate ? (
                      <span className="badge badge-danger">MISSING / OVERDUE</span>
                    ) : (
                      <span className="badge badge-info">UPCOMING</span>
                    )}
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.4' }}>
                    {asg.description}
                  </p>

                  {/* Coursework Information */}
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                      Coursework Assignment
                    </span>
                  </div>

                  {/* Deadline & Approved Extension */}
                  <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                      <span>Class Deadline:</span>
                      <strong>{new Date(asg.dueDate).toLocaleString()}</strong>
                    </div>
                    {ext && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-purple)', marginTop: '0.2rem', fontWeight: 700 }}>
                        <span>Approved Personal Extension:</span>
                        <span>{new Date(ext.extendedDueDate).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Submission Evaluation Status (No numerical marks shown to student) */}
                  {sub && (
                    <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Evaluation Status:</span>
                        <span className={`badge ${sub.status === 'FINALIZED' ? 'badge-success' : 'badge-warning'}`}>
                          {sub.status === 'FINALIZED' ? 'GRADED / COMPLETED' : 'SUBMITTED / PENDING REVIEW'}
                        </span>
                      </div>

                      {sub.teacherFeedback && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem', fontStyle: 'italic', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem' }}>
                          Instructor Feedback: "{sub.teacherFeedback}"
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Submission Action Button */}
                <div>
                  {!sub ? (
                    <button 
                      onClick={() => setSelectedAssignment(asg)}
                      className="btn btn-primary" 
                      style={{ width: '100%', gap: '0.4rem' }}
                    >
                      <UploadCloud size={16} /> Submit Solution
                    </button>
                  ) : (
                    <button 
                      onClick={() => setSelectedAssignment(asg)}
                      className="btn btn-secondary" 
                      style={{ width: '100%', gap: '0.4rem' }}
                    >
                      <FileCheck size={16} /> Resubmit Work
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      {selectedAssignment && (
        <SubmitAssignmentModal 
          assignment={selectedAssignment} 
          isOpen={!!selectedAssignment} 
          onClose={() => setSelectedAssignment(null)} 
        />
      )}

    </div>
  );
  
};
