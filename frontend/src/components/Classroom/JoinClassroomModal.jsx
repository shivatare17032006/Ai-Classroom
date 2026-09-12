import React, { useState } from 'react';
import { useClassroom } from '../../context/ClassroomContext';
import { useAuth } from '../../context/AuthContext';
import { X, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

export const JoinClassroomModal = ({ isOpen, onClose }) => {
  const { joinClassroom } = useClassroom();
  const { currentUser } = useAuth();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!code) return;

    const res = joinClassroom(code, currentUser.id);
    if (!res.success) {
      setError(res.error);
    } else {
      setSuccess(res.message);
      setTimeout(() => {
        setCode('');
        setSuccess('');
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <KeyRound color="var(--accent-purple)" size={22} />
            <span>Join Google Classroom</span>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon"><X size={18} /></button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Ask your teacher for the 6-character <strong>Class Code</strong>, then enter it below to access course assignments and grades.
        </p>

        {error && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '0.65rem', marginBottom: '1rem', textTransform: 'none', justifyContent: 'center' }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {success && (
          <div className="badge badge-success" style={{ width: '100%', padding: '0.65rem', marginBottom: '1rem', textTransform: 'none', justifyContent: 'center' }}>
            <CheckCircle2 size={14} /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Class Code</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. OS-2026-X or DBMS-2026-A"
              value={code} 
              onChange={e => setCode(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
              required 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Join Course</button>
          </div>
        </form>

      </div>
    </div>
  );
};
