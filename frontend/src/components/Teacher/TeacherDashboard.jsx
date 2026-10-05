import React, { useState } from 'react';
import { useClassroom } from '../../context/ClassroomContext';
import { useAuth } from '../../context/AuthContext';
import { exportGradebookToCSV, exportSingleAssignmentCSV, exportMasterCourseMatrixCSV } from '../../utils/csvExporter';
import { CreateAssignmentModal } from './CreateAssignmentModal';
import { AIGradingReviewer } from './AIGradingReviewer';
import { DeadlineExtensionModal } from './DeadlineExtensionModal';
import { TeacherCertificatesView } from './TeacherCertificatesView';
import ProUpgradeModal from '../Common/ProUpgradeModal';
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
  Award,
  Filter,
  FileSpreadsheet,
  BookOpen,
  Layers,
  Lock
} from 'lucide-react';

export const TeacherDashboard = ({ classroom, onNavigateBilling }) => {
  const { activeClassroom, assignments, submissions, extensions } = useClassroom();
  const { users, currentUser, isProUser, getRemainingAiCredits } = useAuth();

  const targetClassroom = classroom || activeClassroom;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [extensionTarget, setExtensionTarget] = useState({ assignmentId: '', studentId: '' });
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [activeTab, setActiveTab] = useState('performance'); // 'performance' | 'certificates'
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('ALL');

  // Pro SaaS Gating state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [gatedFeatureTitle, setGatedFeatureTitle] = useState('');

  const isPro = isProUser(currentUser);
  const remainingCredits = getRemainingAiCredits(currentUser);

  const handleReviewSubmission = (sub, asg) => {
    if (!isPro && remainingCredits <= 0) {
      setGatedFeatureTitle('AI Evaluation & Rubric Auto-Grading (0 Free AI Credits Left)');
      setShowUpgradeModal(true);
      return;
    }
    setSelectedSubmission({ submission: sub, assignment: asg });
  };

  const handleExportCSVGated = () => {
    if (!isPro) {
      setGatedFeatureTitle('Master Gradebook & CSV Analytics Export');
      setShowUpgradeModal(true);
      return;
    }
    if (isAll) {
      exportMasterCourseMatrixCSV(
        classAssignments, 
        safeSubmissions, 
        students, 
        targetClassroom?.name || 'Course',
        `${(targetClassroom?.name || 'Class').replace(/[^a-zA-Z0-9]/g, '_')}_Master_Course_Gradebook.csv`
      );
    } else if (activeAssignment) {
      exportSingleAssignmentCSV(
        activeAssignment, 
        safeSubmissions, 
        students, 
        safeExtensions,
        `${activeAssignment.title.replace(/[^a-zA-Z0-9]/g, '_')}_Gradebook.csv`
      );
    }
  };

  // Reset selected scope when classroom changes
  React.useEffect(() => {
    setSelectedAssignmentId('ALL');
  }, [targetClassroom?.id]);

  const safeUsers = users || [];
  const safeAssignments = assignments || [];
  const safeSubmissions = submissions || [];
  const safeExtensions = extensions || [];

  const students = safeUsers.filter(u => 
    u?.role === 'STUDENT' && 
    Array.isArray(targetClassroom?.studentIds) && 
    targetClassroom.studentIds.includes(u.id)
  );
  const studentIds = students.map(u => u.id);
  const classAssignments = safeAssignments.filter(a => a?.classroomId === targetClassroom?.id);

  // Active assignment context safely calculated
  const foundAssignment = (!selectedAssignmentId || selectedAssignmentId === 'ALL') ? null : classAssignments.find(a => a.id === selectedAssignmentId);
  const isAll = selectedAssignmentId === 'ALL' || !foundAssignment;
  const activeAssignment = isAll ? null : foundAssignment;

  // Helper to match a submission to an enrolled student
  const findStudentForSubmission = React.useCallback((sub) => {
    if (!sub) return null;
    return students.find(s => 
      s.id === sub.studentId || 
      (s.email && sub.studentId && s.email.toLowerCase() === sub.studentId.toLowerCase()) ||
      (s.email && sub.studentEmail && s.email.toLowerCase() === sub.studentEmail.toLowerCase())
    );
  }, [students]);

  // Deduplicate submissions: Keep latest submission per (assignmentId, enrolledStudent.id)
  const latestStudentSubmissions = React.useMemo(() => {
    const map = new Map();
    safeSubmissions.forEach(sub => {
      if (!sub || !sub.assignmentId) return;
      const student = findStudentForSubmission(sub);
      if (!student) return; // Only process submissions belonging to enrolled students in this classroom
      
      const key = `${sub.assignmentId}_${student.id}`;
      const existing = map.get(key);
      const subTime = sub.submittedAt ? new Date(sub.submittedAt).getTime() : 0;
      const existingTime = existing?.submittedAt ? new Date(existing.submittedAt).getTime() : 0;
      
      if (!existing || subTime >= existingTime) {
        map.set(key, sub);
      }
    });
    return Array.from(map.values());
  }, [safeSubmissions, findStudentForSubmission]);

  // Filtered dataset for math & table strictly for enrolled students in this classroom
  const relevantAssignments = isAll ? classAssignments : (activeAssignment ? [activeAssignment] : []);
  const relevantSubmissions = isAll 
    ? latestStudentSubmissions.filter(s => classAssignments.some(a => a.id === s.assignmentId))
    : latestStudentSubmissions.filter(s => s.assignmentId === activeAssignment?.id);

  // Aggregated Analytics Math
  const totalStudentsCount = students.length;
  const totalExpectedSubmissions = isAll ? totalStudentsCount * classAssignments.length : totalStudentsCount;
  const submittedCount = relevantSubmissions.length;
  const missingCount = Math.max(0, totalExpectedSubmissions - submittedCount);
  
  const flaggedLowScoreCount = relevantSubmissions.filter(s => s?.isBelowThreshold).length;
  const plagiarismAlertCount = relevantSubmissions.filter(s => s?.plagiarismStatus === 'FLAGGED_PLAGIARISM' || (s?.similarityPercentage || 0) > 15).length;

  const validGrades = relevantSubmissions.map(s => s?.teacherFinalGrade ?? s?.aiSuggestedGrade).filter(g => g !== null && g !== undefined);
  const avgClassScore = validGrades.length > 0 
    ? (validGrades.reduce((a, b) => a + b, 0) / validGrades.length).toFixed(1) + (activeAssignment ? ` / ${activeAssignment.maximumMarks}` : '')
    : 'N/A';

  const handleExportCSV = () => {
    if (isAll) {
      exportMasterCourseMatrixCSV(
        classAssignments, 
        safeSubmissions, 
        safeUsers, 
        targetClassroom?.name || 'Course',
        `${targetClassroom?.name || 'Class'}_Master_Course_Gradebook.csv`
      );
    } else if (activeAssignment) {
      exportSingleAssignmentCSV(
        activeAssignment, 
        safeSubmissions, 
        safeUsers, 
        safeExtensions,
        `${activeAssignment.title.replace(/[^a-zA-Z0-9]/g, '_')}_Gradebook.csv`
      );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Banner & Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {targetClassroom?.name || 'Teacher Classroom Dashboard'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Code: <strong>{targetClassroom?.code || 'CS-2026'}</strong> • Intelligent Student Progress & AI Oversight Hub
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
            <Plus size={16} /> Create Assignment
          </button>
          <button onClick={() => setIsExtensionModalOpen(true)} className="btn btn-secondary">
            <Clock size={16} /> Grant Extension
          </button>
          <button onClick={handleExportCSVGated} className="btn btn-success" title={isAll ? "Export full Master Matrix Excel/CSV" : "Export Single Assignment CSV"}>
            <Download size={16} /> {isAll ? 'Export Master Course Gradebook' : `Export ${activeAssignment?.title || 'Assignment'} CSV`}
          </button>
        </div>
      </div>

      {/* Clean Dashboard Scope Selector Bar */}
      <div className="glass-card" style={{ padding: '0.9rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-indigo)', fontWeight: 700, fontSize: '0.9rem' }}>
            <Filter size={18} /> Select Assignment Dashboard:
          </div>
          
          <select 
            value={selectedAssignmentId} 
            onChange={(e) => setSelectedAssignmentId(e.target.value)}
            className="form-select"
            style={{ minWidth: '280px', width: 'auto', padding: '0.45rem 0.9rem', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}
          >
            <option value="ALL">📊 All Assignments (Overall Course View)</option>
            {classAssignments.map((asg) => (
              <option key={asg.id} value={asg.id}>
                {asg.title}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className={`badge ${isAll ? 'badge-purple' : 'badge-info'}`}>
            {isAll ? <BookOpen size={12} /> : <FileSpreadsheet size={12} />}
            {isAll ? `Overall Course View (${classAssignments.length} Assignments)` : activeAssignment?.title}
          </span>
        </div>
      </div>

      {/* Selected Assignment Detailed Overview Banner */}
      {!isAll && activeAssignment && (
        <div className="glass-card" style={{ padding: '0.85rem 1.2rem', borderLeft: '4px solid var(--accent-indigo)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileSpreadsheet size={16} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Active Assignment: "{activeAssignment.title}"
              </h4>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                <span>Topic: <strong>{activeAssignment.requiredTopic || 'General Coursework'}</strong></span>
                <span>•</span>
                <span>Max Marks: <strong>{activeAssignment.maximumMarks} Pts</strong></span>
                <span>•</span>
                <span>Min Passing: <strong>{activeAssignment.minimumThreshold} Pts</strong></span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {activeAssignment.allowLateSubmissions ? (
              <span className="badge badge-purple">
                ⏰ Late Allowed (-{activeAssignment.latePenaltyPercentage || 10}%)
              </span>
            ) : (
              <span className="badge badge-danger">
                🔒 Strict Deadline
              </span>
            )}
            {activeAssignment.strictTopicCheck && (
              <span className="badge badge-info">
                🎯 AI Topic Check
              </span>
            )}
          </div>
        </div>
      )}

      {/* Aggregated / Assignment-Specific Analytics Metric Cards */}
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
            <div className="stat-lbl">{isAll ? "Total Submissions Handed In" : "Submissions Received"}</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--status-danger)' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="stat-val">{missingCount}</div>
            <div className="stat-lbl">{isAll ? "Total Missing Submissions" : "Students Missing Submission"}</div>
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
            <div className="stat-lbl">{isAll ? "Course Average Score" : "Assignment Average Score"}</div>
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
        <TeacherCertificatesView classroom={targetClassroom} />
      ) : (
        /* Performance & Submissions Table */
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                {isAll ? 'Overall Student Performance & Final Grade Matrix' : `Assignment Performance: "${activeAssignment?.title}"`}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {isAll ? 'Complete overview of all assignments and student scores.' : `Tracking submissions, AI evaluation, and teacher finalized grades for this assignment.`}
              </p>
            </div>
            
            <button onClick={handleExportCSVGated} className="btn btn-sm btn-success" style={{ gap: '0.4rem' }}>
              <Download size={14} /> {isAll ? 'Export Master Matrix CSV' : 'Export Assignment CSV'}
            </button>
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
                  relevantAssignments.flatMap(asg => 
                    students.map(student => {
                      const sub = latestStudentSubmissions.find(s => s.assignmentId === asg.id && findStudentForSubmission(s)?.id === student.id);
                      const ext = safeExtensions.find(e => e.assignmentId === asg.id && (e.studentId === 'ALL' || e.studentId === student.id || (student.email && e.studentId && e.studentId.toLowerCase() === student.email.toLowerCase())));

                      let statusBadge = <span className="badge badge-danger">MISSING</span>;
                      if (ext && !sub) {
                        statusBadge = <span className="badge badge-purple">EXTENDED ({new Date(ext.extendedDueDate).toLocaleDateString()})</span>;
                      } else if (sub) {
                        if (sub.plagiarismStatus === 'FLAGGED_PLAGIARISM' || sub.status === 'REJECTED_PLAGIARISM') {
                          statusBadge = <span className="badge badge-danger">REJECTED (PLAGIARISM)</span>;
                        } else if (sub.status === 'FINALIZED') {
                          statusBadge = sub.isBelowThreshold ? (
                            <span className="badge badge-danger">FINALIZED (LOW SCORE)</span>
                          ) : (
                            <span className="badge badge-success">TEACHER FINALIZED</span>
                          );
                        } else if (sub.isBelowThreshold) {
                          statusBadge = <span className="badge badge-danger">FLAGGED LOW SCORE</span>;
                        } else {
                          statusBadge = <span className="badge badge-info">AI GRADED</span>;
                        }
                      }

                      return (
                        <tr key={`${asg.id}-${student.id}`}>
                          <td style={{ fontWeight: 700 }}>
                            {student.name}
                            <br />
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{student.email}</span>
                          </td>
                          <td style={{ fontWeight: 600 }}>{asg.title}</td>
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
                                onClick={() => handleReviewSubmission(sub, asg)}
                                className={`btn btn-sm ${sub.status === 'FINALIZED' ? 'btn-secondary' : 'btn-primary'}`}
                                style={{ gap: '0.3rem' }}
                              >
                                {sub.status === 'FINALIZED' ? <Eye size={14} /> : <Sparkles size={14} />}
                                {sub.status === 'FINALIZED' ? 'Edit / View Grade' : 'Review & Finalize'}
                              </button>
                            ) : (
                              <button 
                                onClick={() => {
                                  setExtensionTarget({ assignmentId: asg.id, studentId: student.id });
                                  setIsExtensionModalOpen(true);
                                }}
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
        onClose={() => {
          setIsExtensionModalOpen(false);
          setExtensionTarget({ assignmentId: '', studentId: '' });
        }} 
        defaultAssignmentId={extensionTarget.assignmentId}
        defaultStudentId={extensionTarget.studentId}
      />

      {selectedSubmission && (
        <AIGradingReviewer 
          submission={safeSubmissions.find(s => s.id === selectedSubmission.submission.id) || selectedSubmission.submission} 
          assignment={selectedSubmission.assignment} 
          isOpen={!!selectedSubmission} 
          onClose={() => setSelectedSubmission(null)} 
        />
      )}

      <ProUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName={gatedFeatureTitle}
        onNavigateBilling={onNavigateBilling}
      />

    </div>
  );
};

