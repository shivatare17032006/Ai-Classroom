import React, { useState } from 'react';
import { useClassroom } from '../../context/ClassroomContext';
import { useAuth } from '../../context/AuthContext';
import { X, Send, ShieldCheck, AlertCircle, UploadCloud } from 'lucide-react';

export const SubmitAssignmentModal = ({ assignment, isOpen, onClose }) => {
  const { submitStudentAssignment } = useClassroom();
  const { currentUser } = useAuth();

  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState(null);

  if (!isOpen || !assignment) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content) return;

    setSubmitting(true);
    
    // Process Submission
    setTimeout(() => {
      const res = submitStudentAssignment({
        assignmentId: assignment.id,
        studentId: currentUser.id,
        studentName: currentUser.name,
        content,
        fileName: fileName || `${assignment.title.replace(/\s+/g, '_')}_Submission.txt`
      }, assignment);

      setSubmitting(false);

      if (res.plagiarismStatus === 'FLAGGED_PLAGIARISM') {
        setResultMessage({
          type: 'danger',
          text: `Submission Flagged/Rejected! Similarity detected (${res.similarityPercentage}%) exceeds allowed threshold (${assignment.similarityThreshold}%).`
        });
      } else {
        setResultMessage({
          type: 'success',
          text: `Submission Accepted! Passed plagiarism check (${res.similarityPercentage}% similarity). routed to AI grading queue for teacher review.`
        });
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    }, 800);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title">
            <UploadCloud color="var(--accent-blue)" size={22} />
            <span>Submit Assignment: {assignment.title}</span>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon"><X size={18} /></button>
        </div>

        {/* Assignment Briefing */}
        <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Maximum Marks: {assignment.maximumMarks}</span>
            <span className="badge badge-warning">Plagiarism Limit: {assignment.similarityThreshold}%</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{assignment.description}</p>
        </div>

        {resultMessage && (
          <div className={`badge badge-${resultMessage.type}`} style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', fontSize: '0.85rem', textTransform: 'none', justifyContent: 'center' }}>
            {resultMessage.type === 'danger' ? <AlertCircle size={16} /> : <ShieldCheck size={16} />}
            {resultMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Submission Content / Code Solution</label>
            <textarea 
              className="form-textarea" 
              rows={8}
              placeholder="Paste your source code, report text, or solution answers..."
              value={content} 
              onChange={e => setContent(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">File Attachment Name (Optional)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Solution_Rahul.cpp or OperatingSystems_Assignment.pdf"
              value={fileName} 
              onChange={e => setFileName(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Send size={16} /> {submitting ? 'Checking Plagiarism & Submitting...' : 'Submit Work'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
