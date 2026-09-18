import React, { useState } from 'react';
import { useClassroom } from '../../context/ClassroomContext';
import { useAuth } from '../../context/AuthContext';
import { exportGradebookToCSV } from '../../utils/csvExporter';
import { CreateAssignmentModal } from './CreateAssignmentModal';
import { AIGradingReviewer } from './AIGradingReviewer';
import { DeadlineExtensionModal } from './DeadlineExtensionModal';
import { TeacherCertificatesView } from './TeacherCertificatesView';
import { 
  Users, 
  FileCheck, 
  AlertTriangle, 
  ShieldAlert, 
  TrendingUp, 
  Plus, 
  Clock, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  Eye,
  Award
} from 'lucide-react';

export const TeacherDashboard = () => {
  const { activeClassroom, assignments, submissions, extensions } = useClassroom();
  const { users } = useAuth();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [activeTab, setActiveTab] = useState('performance'); // 'performance' | 'certificates'

  const safeUsers = users || [];
  const safeAssignments = assignments || [];
  const safeSubmissions = submissions || [];
  const safeExtensions = extensions || [];

  const students = safeUsers.filter(u => 
    u?.role === 'STUDENT' && 
    Array.isArray(activeClassroom?.studentIds) && 
    activeClassroom.studentIds.includes(u.id)
  );
  const classAssignments = safeAssignments.filter(a => a?.classroomId === activeClassroom?.id);

  // Aggregated Analytics Math
  const totalStudentsCount = students.length;
  const totalExpectedSubmissions = totalStudentsCount * classAssignments.length;
  const submittedCount = safeSubmissions.length;
  const missingCount = Math.max(0, totalExpectedSubmissions - submittedCount);
  
  const flaggedLowScoreCount = safeSubmissions.filter(s => s?.isBelowThreshold).length;
  const plagiarismAlertCount = safeSubmissions.filter(s => s?.plagiarismStatus === 'FLAGGED_PLAGIARISM' || (s?.similarityPercentage || 0) > 15).length;

  const validGrades = safeSubmissions.map(s => s?.teacherFinalGrade ?? s?.aiSuggestedGrade).filter(g => g !== null && g !== undefined);
  const avgClassScore = validGrades.length > 0 ? (validGrades.reduce((a, b) => a + b, 0) / validGrades.length).toFixed(1) : 'N/A';

  const handleExportCSV = () => {
    exportGradebookToCSV(safeSubmissions, classAssignments, safeUsers, safeExtensions, `${activeClassroom?.name || 'Class'}_Gradebook.csv`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Banner & Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {activeClassroom?.name || 'Teacher Classroom Dashboard'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Code: <strong>{activeClassroom?.code || 'CS-2026'}</strong> • Intelligent Student Progress & AI Oversight Hub
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
            <Plus size={16} /> Create Assignment
          </button>
          <button onClick={() => setIsExtensionModalOpen(true)} className="btn btn-secondary">
            <Clock size={16} /> Grant Extension
          </button>
          <button onClick={handleExportCSV} className="btn btn-success">
            <Download size={16} /> Export CSV Gradebook
          </button>
        </div>
      </div>

      {/* Aggregated Analytics Metric Cards */}
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-blue)' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-val">{totalStudentsCount}</div>
            <div className="stat-lbl">Enrolled Students</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--status-success)' }}>
            <FileCheck size={24} />
          </div>
          <div>
            <div className="stat-val">{submittedCount} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ {totalExpectedSubmissions}</span></div>
            <div className="stat-lbl">Submissions Handed In</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--status-danger)' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="stat-val">{flaggedLowScoreCount}</div>
            <div className="stat-lbl">Flagged Below Threshold</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--status-warning)' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <div className="stat-val">{plagiarismAlertCount}</div>
            <div className="stat-lbl">Plagiarism Alerts</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(168, 85, 247, 0.15)', color: 'var(--accent-purple)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="stat-val">{avgClassScore}</div>
            <div className="stat-lbl">Average Score</div>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setActiveTab('performance')} 
          className={`btn btn-sm ${activeTab === 'performance' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <TrendingUp size={14} /> Student Performance & AI Review Queue
        </button>
        <button 
          onClick={() => setActiveTab('certificates')} 
          className={`btn btn-sm ${activeTab === 'certificates' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Award size={14} /> Student Certificates & Achievements
        </button>
      </div>

      {activeTab === 'certificates' ? (
        <TeacherCertificatesView />
      ) : (
        /* Performance & Submissions Table */
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Student-wise & Assignment-wise Performance Matrix</h3>
            <span className="badge badge-info">Real-time DB Aggregation</span>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Assignment</th>
                  <th>Submission Status</th>
                  <th>Similarity %</th>
                  <th>AI Suggested</th>
                  <th>Teacher Final</th>
                  <th>Threshold</th>
                  <th>Action / Review</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                      No enrolled students in this classroom yet. Share the class code (<strong>{activeClassroom?.code}</strong>) with your students to let them join.
                    </td>
                  </tr>
                ) : classAssignments.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                      No assignments created yet. Click <strong>"Create Assignment"</strong> above to assign coursework.
                    </td>
                  </tr>
                ) : (
                  classAssignments.flatMap(asg => 
                    students.map(student => {
                      const sub = safeSubmissions.find(s => s.assignmentId === asg.id && s.studentId === student.id);
                      const ext = safeExtensions.find(e => e.assignmentId === asg.id && e.studentId === student.id);

                      let statusBadge = <span className="badge badge-danger">MISSING</span>;
                      if (ext && !sub) {
                        statusBadge = <span className="badge badge-purple">EXTENDED ({new Date(ext.extendedDueDate).toLocaleDateString()})</span>;
                      } else if (sub) {
                        if (sub.plagiarismStatus === 'FLAGGED_PLAGIARISM' || sub.status === 'REJECTED_PLAGIARISM') {
                          statusBadge = <span className="badge badge-danger">REJECTED (PLAGIARISM)</span>;
                        } else if (sub.isBelowThreshold) {
                          statusBadge = <span className="badge badge-danger">FLAGGED LOW SCORE</span>;
                        } else if (sub.status === 'FINALIZED') {
                          statusBadge = <span className="badge badge-success">PASS / FINALIZED</span>;
                        } else {
                          statusBadge = <span className="badge badge-warning">PENDING AI REVIEW</span>;
                        }
                      }

                      return (
                        <tr key={`${asg.id}-${student.id}`}>
                          <td style={{ fontWeight: 700 }}>
                            {student.name}
                            <br />
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{student.email}</span>
                          </td>
                          <td>{asg.title}</td>
                          <td>{statusBadge}</td>
                          <td>
                            {sub ? (
                              <span style={{ color: sub.similarityPercentage > asg.similarityThreshold ? 'var(--status-danger)' : 'var(--status-success)', fontWeight: 700 }}>
                                {sub.similarityPercentage}%
                              </span>
                            ) : '--'}
                          </td>
                          <td>
                            {sub && sub.aiSuggestedGrade !== null ? (
                              <strong style={{ color: 'var(--accent-purple)' }}>{sub.aiSuggestedGrade} / {asg.maximumMarks}</strong>
                            ) : '--'}
                          </td>
                          <td>
                            {sub && sub.teacherFinalGrade !== null ? (
                              <strong style={{ color: 'var(--status-success)', fontSize: '1rem' }}>{sub.teacherFinalGrade} / {asg.maximumMarks}</strong>
                            ) : '--'}
                          </td>
                          <td>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Min: {asg.minimumThreshold}</span>
                          </td>
                          <td>
                            {sub ? (
                              <button 
                                onClick={() => setSelectedSubmission({ submission: sub, assignment: asg })}
                                className={`btn btn-sm ${sub.status === 'PENDING_REVIEW' ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ gap: '0.3rem' }}
                              >
                                {sub.status === 'PENDING_REVIEW' ? <Sparkles size={14} /> : <Eye size={14} />}
                                {sub.status === 'PENDING_REVIEW' ? 'Review AI' : 'View Grade'}
                              </button>
                            ) : (
                              <button 
                                onClick={() => setIsExtensionModalOpen(true)}
                                className="btn btn-sm btn-secondary" 
                                style={{ fontSize: '0.75rem', gap: '0.2rem' }}
                              >
                                <Clock size={12} /> Give Extension
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateAssignmentModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />

      <DeadlineExtensionModal 
        isOpen={isExtensionModalOpen} 
        onClose={() => setIsExtensionModalOpen(false)} 
      />

      {selectedSubmission && (
        <AIGradingReviewer 
          submission={selectedSubmission.submission} 
          assignment={selectedSubmission.assignment} 
          isOpen={!!selectedSubmission} 
          onClose={() => setSelectedSubmission(null)} 
        />
      )}

    </div>
  );
};
