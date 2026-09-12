import React, { useState } from 'react';
import { useClassroom } from '../../context/ClassroomContext';
import { useAuth } from '../../context/AuthContext';
import { X, BookPlus, Sparkles } from 'lucide-react';

export const CreateClassroomModal = ({ isOpen, onClose }) => {
  const { addClassroom } = useClassroom();
  const { currentUser } = useAuth();

  const [name, setName] = useState('');
  const [section, setSection] = useState('Section A');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;

    addClassroom({ name, section, description }, currentUser);
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <BookPlus color="var(--accent-indigo)" size={22} />
            <span>Create Google Classroom Course</span>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Class / Course Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. CS402 - Operating Systems Kernel Design"
              value={name} 
              onChange={e => setName(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Section / Batch</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Section B - Batch 2026"
              value={section} 
              onChange={e => setSection(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Course Description</label>
            <textarea 
              className="form-textarea" 
              placeholder="Overview of syllabus, modules, and grading policy..."
              value={description} 
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(99, 102, 241, 0.3)', marginBottom: '1.25rem', fontSize: '0.8rem', color: 'var(--accent-blue)' }}>
            <Sparkles size={14} style={{ display: 'inline', marginRight: '0.3rem' }} />
            A unique 6-character <strong>Class Join Code</strong> will automatically be generated for students to enroll.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Create Class</button>
          </div>
        </form>
      </div>
    </div>
  );
};
