import React, { useState } from 'react';
import { useClassroom } from '../../context/ClassroomContext';
import { useAuth } from '../../context/AuthContext';
import { X, Calendar, Clock, UserCheck, CheckCircle } from 'lucide-react';

export const DeadlineExtensionModal = ({ isOpen, onClose, defaultAssignmentId }) => {
  const { assignments, grantIndividualExtension, extensions } = useClassroom();
  const { users } = useAuth();

  const students = users.filter(u => u.role === 'STUDENT');

  const [assignmentId, setAssignmentId] = useState(defaultAssignmentId || (assignments[0]?.id || ''));
  const [studentId, setStudentId] = useState(students[0]?.id || '');
  const [extendedDueDate, setExtendedDueDate] = useState('2026-09-23T23:59');
  const [reason, setReason] = useState('Medical leave / documented emergency extension');

  if (!isOpen) return null;

  const selectedAssignment = assignments.find(a => a.id === assignmentId);
  const selectedStudent = students.find(s => s.id === studentId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!assignmentId || !studentId || !extendedDueDate) return;

    grantIndividualExtension({
      assignmentId,
      studentId,
      studentName: selectedStudent?.name || 'Student',
      originalDueDate: selectedAssignment?.dueDate,
      extendedDueDate,
      reason
    });

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title">
            <Clock color="var(--accent-blue)" size={22} />
            <span>Grant Individual Student Deadline Extension</span>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon"><X size={18} /></button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Granting an extension overrides the deadline <strong>only for the selected student</strong>. The main class deadline remains unchanged for all other students.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select Assignment</label>
            <select 
              className="form-select" 
              value={assignmentId} 
              onChange={e => setAssignmentId(e.target.value)}
            >
              {assignments.map(a => (
                <option key={a.id} value={a.id}>{a.title} (Original Due: {new Date(a.dueDate).toLocaleDateString()})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Select Specific Student</label>
            <select 
              className="form-select" 
              value={studentId} 
              onChange={e => setStudentId(e.target.value)}
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={14} color="var(--accent-purple)" /> Extended Individual Deadline
            </label>
            <input 
              type="datetime-local" 
              className="form-input" 
              value={extendedDueDate} 
              onChange={e => setExtendedDueDate(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Reason for Extension Approval</label>
            <input 
              type="text" 
              className="form-input" 
              value={reason} 
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Sickness certificate, competition attendance..."
              required 
            />
          </div>

          {/* Active Extensions List */}
          <div style={{ background: 'var(--bg-primary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
            <h5 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Active Extensions for Selected Assignment</h5>
            {extensions.filter(e => e.assignmentId === assignmentId).length === 0 ? (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No individual extensions currently granted.</span>
            ) : (
              extensions.filter(e => e.assignmentId === assignmentId).map(ext => (
                <div key={ext.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.25rem 0' }}>
                  <span><UserCheck size={12} inline /> <strong>{ext.studentName}</strong></span>
                  <span className="badge badge-purple">Extended: {new Date(ext.extendedDueDate).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Approve Extension</button>
          </div>
        </form>

      </div>
    </div>
  );
};
