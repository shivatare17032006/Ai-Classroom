import React, { useState } from 'react';
import { useClassroom } from '../../context/ClassroomContext';
import { useAuth } from '../../context/AuthContext';
import { SubmitAssignmentModal } from './SubmitAssignmentModal';
import { CertificateLocker } from './CertificateLocker';
import { DocumentViewerModal } from '../Common/DocumentViewerModal';
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
  FileText,
  User,
  Edit3,
  Save,
  X,
  Eye,
  Cloud,
  Layers,
  GraduationCap,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

export const StudentDashboard = () => {
  const { classrooms, activeClassroom, assignments, submissions, extensions, notifications } = useClassroom();
  const { currentUser, updateUserProfile } = useAuth();

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [activeTab, setActiveTab] = useState('assignments'); // 'assignments' | 'certificates'
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeDocPreview, setActiveDocPreview] = useState(null); // { fileUrl, fileName, fileType }
  const [rollNo, setRollNo] = useState(currentUser?.rollNo || '');
  const [prnNo, setPrnNo] = useState(currentUser?.prnNo || '');

  const safeClassrooms = classrooms || [];
  const safeAssignments = assignments || [];
  const safeSubmissions = submissions || [];
  const safeExtensions = extensions || [];
  const safeNotifications = notifications || [];
  const studentId = currentUser?.id || '';

  const enrolledClassroomIds = safeClassrooms
    .filter(c => Array.isArray(c.studentIds) && c.studentIds.includes(studentId))
    .map(c => c.id);

  // Show assignments matching activeClassroom OR all enrolled classrooms if activeClassroom not set
  const classAssignments = activeClassroom 
    ? safeAssignments.filter(a => a?.classroomId === activeClassroom?.id)
    : safeAssignments.filter(a => enrolledClassroomIds.length === 0 || enrolledClassroomIds.includes(a?.classroomId));

  const studentNotifs = safeNotifications.filter(n => n?.studentId === studentId);

  // Computed metrics for Student Analytics Header
  const totalSubmitted = classAssignments.filter(a => safeSubmissions.some(s => s.assignmentId === a.id && s.studentId === studentId)).length;
  const totalPassed = classAssignments.filter(a => {
    const sub = safeSubmissions.find(s => s.assignmentId === a.id && s.studentId === studentId);
    return sub && !sub.isBelowThreshold;
  }).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <GraduationCap color="var(--accent-indigo)" size={28} />
            Welcome, {currentUser?.name || 'Student'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Student Portal • Enrolled in <strong>{activeClassroom?.name || 'Active Coursework'}</strong>
          </p>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => setActiveTab('assignments')} 
            className={`btn ${activeTab === 'assignments' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ gap: '0.4rem' }}
          >
            <BookOpen size={16} /> Coursework & Submissions
          </button>
          <button 
            onClick={() => setActiveTab('certificates')} 
            className={`btn ${activeTab === 'certificates' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ gap: '0.4rem' }}
          >
            <Award size={16} /> Certificate Locker
          </button>
        </div>
      </div>

      {/* Analytics Overview Metrics Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-indigo)' }}>
            <BookOpen size={22} />
          </div>
          <div>
            <div className="stat-val">{classAssignments.length}</div>
            <div className="stat-lbl">Active Assignments</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--status-success)' }}>
            <FileCheck size={22} />
          </div>
          <div>
            <div className="stat-val">{totalSubmitted} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ {classAssignments.length}</span></div>
            <div className="stat-lbl">Handed In</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-blue)' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="stat-val">{totalPassed}</div>
            <div className="stat-lbl">Passed Coursework</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(168, 85, 247, 0.15)', color: 'var(--accent-purple)' }}>
            <Award size={22} />
          </div>
          <div>
            <div className="stat-val">{(currentUser?.rollNo && currentUser?.prnNo) ? 'Verified' : 'Pending'}</div>
            <div className="stat-lbl">Academic Credentials</div>
          </div>
        </div>
      </div>

      {/* Student Academic Credentials Profile Card */}
      <div className="glass-card" style={{ padding: '0.9rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', borderLeft: '4px solid var(--accent-indigo)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Academic Profile: {currentUser?.name}
            </h4>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
              <span>Roll No: <strong style={{ color: 'var(--text-primary)' }}>{currentUser?.rollNo || 'Not Set'}</strong></span>
              <span>•</span>
              <span>PRN No: <strong style={{ color: 'var(--text-primary)' }}>{currentUser?.prnNo || 'Not Set'}</strong></span>
              <span>•</span>
              <span>Email: <strong>{currentUser?.email}</strong></span>
            </div>
          </div>
        </div>

        <button onClick={() => setIsProfileModalOpen(true)} className="btn btn-sm btn-secondary" style={{ gap: '0.35rem' }}>
          <Edit3 size={14} /> Update Roll No & PRN
        </button>
      </div>

      {activeTab === 'certificates' ? (
        <CertificateLocker />
      ) : (
        /* Assignments Grid View */
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}>
          {classAssignments.length === 0 ? (
            <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3.5rem 1rem' }}>
              <BookOpen size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', display: 'block' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No assignments created yet</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Assignments published by your teacher will appear here in real time.</p>
            </div>
          ) : (
            classAssignments.map(asg => {
              const sub = safeSubmissions.find(s => s.assignmentId === asg.id && s.studentId === studentId);
              const ext = safeExtensions.find(e => e.assignmentId === asg.id && e.studentId === studentId);

              const effectiveDueDate = ext ? ext.extendedDueDate : asg.dueDate;
              const isLate = new Date() > new Date(effectiveDueDate) && !sub;

              return (
                <div key={asg.id} className="glass-card glass-card-interactive" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                  
                  {/* Assignment Title & Meta */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem', gap: '0.5rem' }}>
                      <div>
                        {asg.requiredTopic && (
                          <span className="badge badge-purple" style={{ marginBottom: '0.35rem', fontSize: '0.68rem' }}>
                            {asg.requiredTopic}
                          </span>
                        )}
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: '1.3' }}>{asg.title}</h3>
                      </div>

                      {sub ? (
                        sub.status === 'FINALIZED' ? (
                          <span className="badge badge-success">GRADED</span>
                        ) : (
                          <span className="badge badge-info">SUBMITTED</span>
                        )
                      ) : isLate ? (
                        <span className="badge badge-danger">OVERDUE</span>
                      ) : (
                        <span className="badge badge-info">UPCOMING</span>
                      )}
                    </div>

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.5' }}>
                      {asg.description}
                    </p>

                    {/* Teacher Attached Reference PDF / Document Button */}
                    {asg.fileUrl && (
                      <div style={{ marginBottom: '0.85rem' }}>
                        <button 
                          onClick={() => setActiveDocPreview({ fileUrl: asg.fileUrl, fileName: asg.fileName || `${asg.title}_Reference.pdf`, fileType: asg.fileType })}
                          className="btn btn-sm btn-secondary" 
                          style={{ width: '100%', gap: '0.4rem', fontSize: '0.8rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-indigo)', borderColor: 'rgba(99, 102, 241, 0.25)', justifyContent: 'center', fontWeight: 600 }}
                        >
                          <Eye size={14} /> View Reference Material
                        </button>
                      </div>
                    )}

                    {/* Deadline & Extension Bar */}
                    <div style={{ 
                      background: 'rgba(99, 102, 241, 0.05)', 
                      padding: '0.75rem 0.9rem', 
                      borderRadius: 'var(--radius-md)', 
                      marginBottom: '1rem', 
                      fontSize: '0.8rem', 
                      border: '1px solid rgba(99, 102, 241, 0.15)',
                      backdropFilter: 'blur(8px)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                          <Clock size={14} color="var(--accent-indigo)" /> Class Deadline:
                        </span>
                        <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                          {new Date(asg.dueDate).toLocaleString()}
                        </strong>
                      </div>
                      {ext && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-purple)', marginTop: '0.4rem', fontWeight: 700, paddingTop: '0.35rem', borderTop: '1px dashed rgba(139, 92, 246, 0.25)' }}>
                          <span>Approved Extension:</span>
                          <span>{new Date(ext.extendedDueDate).toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Submission Evaluation Status Card */}
                    {sub && (
                      <div 
                        style={{ 
                          background: 'var(--bg-glass)', 
                          padding: '1.1rem', 
                          borderRadius: 'var(--radius-md)', 
                          border: `1px solid ${sub.status === 'FINALIZED' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(99, 102, 241, 0.35)'}`,
                          borderLeft: `4px solid ${sub.status === 'FINALIZED' ? '#10b981' : '#38bdf8'}`,
                          marginBottom: '1.1rem',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <span className={`badge ${sub.status === 'FINALIZED' ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '0.78rem', padding: '0.35rem 0.8rem' }}>
                            <CheckCircle2 size={13} /> {sub.status === 'FINALIZED' ? 'GRADED & FINALIZED' : 'SUBMITTED / IN REVIEW'}
                          </span>
                          
                          <span className={`badge ${sub.similarityPercentage > asg.similarityThreshold ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '0.75rem', padding: '0.28rem 0.7rem' }}>
                            <ShieldCheck size={12} /> Plagiarism: {sub.similarityPercentage || 0}%
                          </span>
                        </div>

                        {sub.fileUrl && (
                          <div style={{ marginBottom: (sub.teacherFeedback && !sub.teacherFeedback.startsWith('Approved AI') && !sub.teacherFeedback.startsWith('Grade modified')) ? '0.75rem' : 0 }}>
                            <button 
                              onClick={() => setActiveDocPreview({ fileUrl: sub.fileUrl, fileName: sub.fileName || 'Submitted_Solution.pdf', fileType: sub.fileType })}
                              className="btn btn-sm" 
                              style={{ 
                                width: '100%', 
                                gap: '0.5rem', 
                                fontSize: '0.82rem', 
                                padding: '0.5rem 0.9rem', 
                                justifyContent: 'center',
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.25) 100%)',
                                border: '1px solid rgba(99, 102, 241, 0.4)',
                                color: 'var(--accent-blue)',
                                fontWeight: 700,
                                borderRadius: 'var(--radius-md)',
                                boxShadow: '0 2px 10px rgba(59, 130, 246, 0.12)'
                              }}
                            >
                              <Eye size={15} /> View Submission
                            </button>
                          </div>
                        )}

                        {sub.teacherFeedback && 
                         !sub.teacherFeedback.startsWith('Approved AI') && 
                         !sub.teacherFeedback.startsWith('Grade modified') && (
                          <div style={{ 
                            background: 'rgba(99, 102, 241, 0.08)', 
                            padding: '0.7rem 0.9rem', 
                            borderRadius: 'var(--radius-sm)', 
                            borderLeft: '3px solid var(--accent-indigo)', 
                            marginTop: '0.65rem' 
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-indigo)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              <MessageSquare size={12} /> Instructor Remarks:
                            </div>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontStyle: 'italic', margin: '0.25rem 0 0 0', lineHeight: '1.45' }}>
                              "{sub.teacherFeedback}"
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Submission Action Button */}
                  <div>
                    {sub && sub.status === 'FINALIZED' ? (
                      <button 
                        className="btn btn-secondary" 
                        disabled
                        style={{ width: '100%', gap: '0.4rem', opacity: 0.65, cursor: 'not-allowed' }}
                      >
                        <FileCheck size={16} /> Grade Finalized (Resubmissions Locked)
                      </button>
                    ) : isLate && asg.allowLateSubmissions === false ? (
                      <button 
                        className="btn btn-secondary" 
                        disabled
                        style={{ width: '100%', gap: '0.4rem', opacity: 0.65, cursor: 'not-allowed' }}
                      >
                        <AlertTriangle size={16} /> Submissions Closed (No Late Submissions)
                      </button>
                    ) : !sub ? (
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
            })
          )}
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

      {/* Academic Credentials Update Modal */}
      {isProfileModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <div className="modal-title">
                <User color="var(--accent-indigo)" size={20} />
                <span>Update Academic Credentials</span>
              </div>
              <button onClick={() => setIsProfileModalOpen(false)} className="btn btn-secondary btn-icon"><X size={18} /></button>
            </div>

            <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Your Roll No and PRN No are attached to your student profile and exported on official teacher gradebook CSVs.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              updateUserProfile({ rollNo: rollNo.trim(), prnNo: prnNo.trim() });
              setIsProfileModalOpen(false);
            }}>
              <div className="form-group">
                <label className="form-label">Student Roll No</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. 2201045 or CS-12"
                  value={rollNo} 
                  onChange={e => setRollNo(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Student PRN No</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. 122B1B045"
                  value={prnNo} 
                  onChange={e => setPrnNo(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsProfileModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ gap: '0.4rem' }}><Save size={14} /> Save Credentials</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cloudinary Document / PDF Preview Reader Modal */}
      {activeDocPreview && (
        <DocumentViewerModal 
          fileUrl={activeDocPreview.fileUrl} 
          fileName={activeDocPreview.fileName} 
          fileType={activeDocPreview.fileType} 
          isOpen={!!activeDocPreview} 
          onClose={() => setActiveDocPreview(null)} 
        />
      )}

    </div>
  );
};
