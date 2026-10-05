import React, { useState, useEffect } from 'react';
import { useClassroom } from '../../context/ClassroomContext';
import { useAuth } from '../../context/AuthContext';
import { X, Calendar, Clock, UserCheck, CheckCircle, Users, Sparkles, AlertCircle } from 'lucide-react';

export const DeadlineExtensionModal = ({ isOpen, onClose, defaultAssignmentId, defaultStudentId }) => {
  const { activeClassroom, assignments, grantIndividualExtension, extensions } = useClassroom();
  const { users } = useAuth();

  const students = (users || []).filter(u => 
    u?.role === 'STUDENT' && 
    Array.isArray(activeClassroom?.studentIds) && 
    activeClassroom.studentIds.includes(u.id)
  );

  const [assignmentId, setAssignmentId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [extendedDueDate, setExtendedDueDate] = useState('');
  const [reason, setReason] = useState('Medical leave / documented emergency extension');
  const [extensionMode, setExtensionMode] = useState('INDIVIDUAL'); // 'INDIVIDUAL' | 'ALL'

  // Ensure state is correctly populated whenever modal opens or props change
  useEffect(() => {
    if (isOpen) {
      const initialAsgId = defaultAssignmentId || (assignments.length > 0 ? assignments[0].id : '');
      setAssignmentId(initialAsgId);

      if (defaultStudentId === 'ALL') {
        setExtensionMode('ALL');
        setStudentId('ALL');
      } else {
        const targetStudentId = defaultStudentId || (students.length > 0 ? students[0].id : 'ALL');
        setStudentId(targetStudentId);
        setExtensionMode(targetStudentId === 'ALL' ? 'ALL' : 'INDIVIDUAL');
      }

      // Default extended date to 7 days after assignment due date or now
      const targetAsg = assignments.find(a => a.id === initialAsgId);
      const baseDate = targetAsg?.dueDate ? new Date(targetAsg.dueDate) : new Date();
      const extendedDate = new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const year = extendedDate.getFullYear();
      const month = String(extendedDate.getMonth() + 1).padStart(2, '0');
      const day = String(extendedDate.getDate()).padStart(2, '0');
      const hours = String(extendedDate.getHours()).padStart(2, '0');
      const minutes = String(extendedDate.getMinutes()).padStart(2, '0');
      setExtendedDueDate(`${year}-${month}-${day}T${hours}:${minutes}`);
    }
  }, [isOpen, defaultAssignmentId, defaultStudentId, assignments, activeClassroom]);

  if (!isOpen) return null;

  const selectedAssignment = assignments.find(a => a.id === assignmentId);
  const selectedStudent = students.find(s => s.id === studentId);

  const handleModeChange = (mode) => {
    setExtensionMode(mode);
    if (mode === 'ALL') {
      setStudentId('ALL');
    } else {
      setStudentId(students[0]?.id || '');
    }
  };

  const handleGrant = (targetStudentId = studentId) => {
    if (!assignmentId || !targetStudentId || !extendedDueDate) return;

    if (targetStudentId === 'ALL') {
      grantIndividualExtension({
        assignmentId,
        studentId: 'ALL',
        studentName: '🌟 ALL STUDENTS (Classwide Extension)',
        originalDueDate: selectedAssignment?.dueDate,
        extendedDueDate,
        reason: reason || 'Classwide deadline extension granted by instructor'
      });
    } else {
      const studentObj = students.find(s => s.id === targetStudentId);
      grantIndividualExtension({
        assignmentId,
        studentId: targetStudentId,
        studentName: studentObj?.name || studentObj?.email || 'Student',
        originalDueDate: selectedAssignment?.dueDate,
        extendedDueDate,
        reason
      });
    }

    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleGrant(studentId);
  };

  const activeExtensionsForAsg = extensions.filter(e => e.assignmentId === assignmentId);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '580px', width: '92%' }}>
        <div className="modal-header">
          <div className="modal-title">
            <Clock color="var(--accent-purple)" size={22} />
            <span>Grant Deadline Extension</span>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon"><X size={18} /></button>
        </div>

        {/* Extension Scope Switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.35rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
          <button 
            type="button"
            onClick={() => handleModeChange('INDIVIDUAL')} 
            className={`btn btn-sm ${extensionMode === 'INDIVIDUAL' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, justifyContent: 'center', gap: '0.4rem' }}
          >
            <UserCheck size={15} /> Individual Student
          </button>
          <button 
            type="button"
            onClick={() => handleModeChange('ALL')} 
            className={`btn btn-sm ${extensionMode === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, justifyContent: 'center', gap: '0.4rem', background: extensionMode === 'ALL' ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-indigo))' : undefined }}
          >
            <Users size={15} /> Extend For All Students
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.45' }}>
          {extensionMode === 'ALL' ? (
            <span>🌟 Granting a classwide extension updates the effective submission deadline <strong>for all enrolled students</strong> in this classroom.</span>
          ) : (
            <span>Granting an individual extension overrides the deadline <strong>only for the selected student</strong>. Other students' deadlines remain unchanged.</span>
          )}
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

          {extensionMode === 'INDIVIDUAL' ? (
            <div className="form-group">
              <label className="form-label">Select Specific Student</label>
              <select 
                className="form-select" 
                value={studentId} 
                onChange={e => setStudentId(e.target.value)}
                required
              >
                {students.length === 0 ? (
                  <option value="">No enrolled students found</option>
                ) : (
                  students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                  ))
                )}
              </select>
            </div>
          ) : (
            <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid rgba(168, 85, 247, 0.25)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Users size={20} color="var(--accent-purple)" />
              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                Targeting: <strong>All {students.length} Enrolled Students</strong> in <em>{activeClassroom?.name || 'Classroom'}</em>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={14} color="var(--accent-purple)" /> Extended Due Date & Time
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
              placeholder="e.g. Classwide extension / Emergency / Medical leave..."
              required 
            />
          </div>

          {/* Active Extensions List */}
          <div style={{ background: 'var(--bg-primary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
            <h5 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={13} color="var(--accent-purple)" /> Active Extensions for Selected Assignment
            </h5>
            {activeExtensionsForAsg.length === 0 ? (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No extensions currently granted for this assignment.</span>
            ) : (
              activeExtensionsForAsg.map(ext => (
                <div key={ext.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', padding: '0.35rem 0', borderBottom: '1px dashed var(--border-color)' }}>
                  <span>
                    {ext.studentId === 'ALL' ? (
                      <strong style={{ color: 'var(--accent-purple)' }}>🌟 ALL STUDENTS (Classwide)</strong>
                    ) : (
                      <span><UserCheck size={12} style={{ marginRight: 4, display: 'inline' }} /> <strong>{ext.studentName}</strong></span>
                    )}
                  </span>
                  <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
                    Extended: {new Date(ext.extendedDueDate).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>

            {/* Dedicated Extend For All Quick Button */}
            {extensionMode === 'INDIVIDUAL' && (
              <button 
                type="button" 
                onClick={() => handleGrant('ALL')} 
                className="btn btn-secondary"
                style={{ gap: '0.4rem', borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)' }}
                title="Grant this extension to all enrolled students"
              >
                <Users size={15} /> Extend For All
              </button>
            )}

            <button type="submit" className="btn btn-primary" style={{ gap: '0.4rem' }}>
              <CheckCircle size={16} /> {extensionMode === 'ALL' ? 'Approve Extension for All' : 'Approve Individual Extension'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

