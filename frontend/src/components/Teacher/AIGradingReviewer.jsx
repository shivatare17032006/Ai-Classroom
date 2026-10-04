import React, { useState } from 'react';
import { useClassroom } from '../../context/ClassroomContext';
import { useAuth } from '../../context/AuthContext';
import { EmailNotificationService } from '../../services/emailService';
import { X, Sparkles, CheckCircle2, Edit3, ShieldCheck, AlertTriangle, FileText, Eye, Cloud } from 'lucide-react';
import { DocumentViewerModal } from '../Common/DocumentViewerModal';

export const AIGradingReviewer = ({ submission, assignment, isOpen, onClose }) => {
  const { finalizeAiGrade } = useClassroom();
  const { currentUser, users, consumeAiCredit } = useAuth();

  const [finalScore, setFinalScore] = useState(
    submission ? (submission.teacherFinalGrade ?? submission.aiSuggestedGrade ?? 0) : 0
  );
  const [teacherComments, setTeacherComments] = useState(submission?.teacherFeedback || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  if (!isOpen || !submission || !assignment) return null;

  const handleApprove = async () => {
    await consumeAiCredit();
    await finalizeAiGrade(
      submission.id,
      submission.aiSuggestedGrade,
      teacherComments || '',
      assignment
    );

    // CASE 3: PARENT EMAIL NOTIFICATION ON LOW SCORE / BELOW THRESHOLD
    const score = Number(submission.aiSuggestedGrade ?? 0);
    if (score < assignment.minimumThreshold) {
      const studentUser = (users || []).find(u => u.id === submission.studentId || (u.name && u.name === submission.studentName));
      const parentEmail = studentUser?.parentEmail || 'parent@gmail.com';
      EmailNotificationService.sendParentAcademicAlertEmail(
        submission.studentName,
        parentEmail,
        'Academic Subject',
        assignment.title,
        score,
        assignment.maximumMarks,
        assignment.minimumThreshold,
        teacherComments || 'Student score fell below minimum passing threshold.'
      );
    }

    onClose();
  };

  const handleSaveModification = async () => {
    await consumeAiCredit();
    await finalizeAiGrade(
      submission.id,
      finalScore,
      teacherComments || '',
      assignment
    );

    // CASE 3: PARENT EMAIL NOTIFICATION ON LOW SCORE / BELOW THRESHOLD
    const score = Number(finalScore);
    if (score < assignment.minimumThreshold) {
      const studentUser = (users || []).find(u => u.id === submission.studentId || (u.name && u.name === submission.studentName));
      const parentEmail = studentUser?.parentEmail || 'parent@gmail.com';
      EmailNotificationService.sendParentAcademicAlertEmail(
        submission.studentName,
        parentEmail,
        'Academic Subject',
        assignment.title,
        score,
        assignment.maximumMarks,
        assignment.minimumThreshold,
        teacherComments || 'Student score fell below minimum passing threshold.'
      );
    }

    onClose();
  };

  const isBelow = Number(finalScore) < assignment.minimumThreshold;

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-content" style={{ maxWidth: '850px' }}>
          <div className="modal-header">
            <div className="modal-title">
              <Sparkles color="var(--accent-purple)" size={22} />
              <span>AI-Assisted Evaluation & Human Teacher Review</span>
            </div>
            <button onClick={onClose} className="btn btn-secondary btn-icon"><X size={18} /></button>
          </div>

          {/* Student & Submission Meta Banner */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-primary)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            border: '1px solid var(--border-color)'
          }}>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{submission.studentName}</h4>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Assignment: <strong>{assignment.title}</strong>
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span className={`badge ${submission.similarityPercentage > assignment.similarityThreshold ? 'badge-danger' : 'badge-success'}`}>
                <ShieldCheck size={12} /> Similarity: {submission.similarityPercentage}% (Allowed: {assignment.similarityThreshold}%)
              </span>
              <span className={`badge ${submission.status === 'FINALIZED' ? 'badge-success' : 'badge-warning'}`}>
                {submission.status}
              </span>
            </div>
          </div>

          {/* Side-by-Side Grid: Student Code vs AI Breakdown */}
          <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
            
            {/* Left Column: Student Submitted Content */}
            <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FileText size={14} /> Student Content
                  </h5>

                  {submission.fileUrl && (
                    <button 
                      onClick={() => setIsPreviewModalOpen(true)} 
                      className="btn btn-sm btn-primary"
                      style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem', gap: '0.35rem' }}
                      title="View submission document in preview reader"
                    >
                      <Eye size={13} /> View Submission
                    </button>
                  )}
                </div>

                <pre style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  background: 'var(--bg-secondary)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  color: 'var(--text-primary)'
                }}>
                  {submission.content}
                </pre>
              </div>

              {submission.fileUrl && (
                <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Cloud size={12} /> Cloudinary Hosted Attachment
                  </span>
                  <button onClick={() => setIsPreviewModalOpen(true)} className="btn btn-sm btn-secondary" style={{ fontSize: '0.78rem', gap: '0.35rem' }}>
                    <Eye size={13} /> View Submission
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: AI Criteria Score Breakdown */}
            <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-purple)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={14} /> AI Criteria Breakdown
              </h5>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                {(Array.isArray(assignment?.rubric) ? assignment.rubric : []).map(r => {
                  const score = submission.aiRubricBreakdown ? submission.aiRubricBreakdown[r.id] : 0;
                  return (
                    <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{r.criteria} ({r.weightPct}%)</span>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--accent-blue)' }}>{score} / {r.maxScore}</strong>
                    </div>
                  );
                })}
              </div>

              <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-purple)' }}>AI Suggested Score:</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
                  {submission.aiSuggestedGrade ?? '--'} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ {assignment.maximumMarks}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {submission.aiFeedback}
                </p>
              </div>
            </div>

          </div>

          {/* Teacher Authority & Override Section */}
          <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-highlight)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Teacher Final Grade Decision</h4>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Minimum Threshold: <strong>{assignment.minimumThreshold}/{assignment.maximumMarks}</strong>
              </span>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label className="form-label">Authoritative Final Grade</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={finalScore} 
                  onChange={e => {
                    setFinalScore(e.target.value);
                    setIsEditing(true);
                  }}
                  step="0.5"
                  min="0"
                  max={assignment.maximumMarks}
                  style={{ fontSize: '1.2rem', fontWeight: 'bold' }}
                />
              </div>
              {isBelow && (
                <div className="badge badge-danger" style={{ alignSelf: 'flex-end', padding: '0.6rem 0.9rem' }}>
                  <AlertTriangle size={14} /> FLAGGED BELOW THRESHOLD ({finalScore} &lt; {assignment.minimumThreshold})
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Teacher Feedback / Remarks</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Comments visible to student and parents..."
                value={teacherComments} 
                onChange={e => setTeacherComments(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={onClose} className="btn btn-secondary">Close</button>
              <button onClick={handleApprove} className="btn btn-success" style={{ gap: '0.4rem' }}>
                <CheckCircle2 size={16} /> Approve AI Grade ({submission.aiSuggestedGrade}/{assignment.maximumMarks})
              </button>
              <button onClick={handleSaveModification} className="btn btn-primary" style={{ gap: '0.4rem' }}>
                <Edit3 size={16} /> Finalize Teacher Grade ({finalScore}/{assignment.maximumMarks})
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Cloudinary Document Viewer Modal */}
      {isPreviewModalOpen && (
        <DocumentViewerModal 
          fileUrl={submission.fileUrl} 
          fileName={submission.fileName || 'Student_Submission_Document'} 
          fileType={submission.fileType}
          isOpen={isPreviewModalOpen} 
          onClose={() => setIsPreviewModalOpen(false)} 
        />
      )}
    </>
  );
};
