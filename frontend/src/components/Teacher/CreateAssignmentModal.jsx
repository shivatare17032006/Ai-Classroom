import React, { useState } from 'react';
import { useClassroom } from '../../context/ClassroomContext';
import { X, Plus, Trash2, Sliders, Shield, Award } from 'lucide-react';

export const CreateAssignmentModal = ({ isOpen, onClose }) => {
  const { activeClassroom, addAssignment } = useClassroom();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maximumMarks, setMaximumMarks] = useState(10);
  const [minimumThreshold, setMinimumThreshold] = useState(5);
  const [similarityThreshold, setSimilarityThreshold] = useState(15);
  const [dueDate, setDueDate] = useState('2026-09-25T23:59');

  // Configurable Rubric Criteria List
  const [rubric, setRubric] = useState([
    { id: 'r1', criteria: 'Understanding', weightPct: 30, maxScore: 3, description: 'Core conceptual comprehension' },
    { id: 'r2', criteria: 'Correctness', weightPct: 30, maxScore: 3, description: 'Accuracy and correctness of code/answer' },
    { id: 'r3', criteria: 'Implementation', weightPct: 20, maxScore: 2, description: 'Structure, optimization & syntax' },
    { id: 'r4', criteria: 'Explanation', weightPct: 20, maxScore: 2, description: 'Clarity of documentation and comments' }
  ]);

  if (!isOpen) return null;

  const handleAddCriteria = () => {
    setRubric([
      ...rubric,
      { id: `r-${Date.now()}`, criteria: 'New Criteria', weightPct: 10, maxScore: 1, description: 'Evaluation criteria details' }
    ]);
  };

  const handleRemoveCriteria = (id) => {
    if (rubric.length <= 1) return;
    setRubric(rubric.filter(r => r.id !== id));
  };

  const handleCriteriaChange = (id, field, value) => {
    setRubric(rubric.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const totalWeight = rubric.reduce((sum, r) => sum + Number(r.weightPct || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !activeClassroom) return;

    addAssignment({
      classroomId: activeClassroom.id,
      title,
      description,
      maximumMarks: Number(maximumMarks),
      minimumThreshold: Number(minimumThreshold),
      similarityThreshold: Number(similarityThreshold),
      dueDate,
      rubric
    });

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title">
            <Award color="var(--accent-indigo)" size={22} />
            <span>Create AI-Graded Assignment</span>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Assignment Basics */}
          <div className="form-group">
            <label className="form-label">Assignment Title</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Operating Systems Kernel Assignment"
              value={title} 
              onChange={e => setTitle(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Instructions & Description</label>
            <textarea 
              className="form-textarea" 
              placeholder="Detailed instructions for student submission..."
              value={description} 
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Configurable Thresholds & Parameters Grid */}
          <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sliders size={14} color="var(--accent-blue)" /> Maximum Marks
              </label>
              <input 
                type="number" 
                className="form-input" 
                value={maximumMarks} 
                onChange={e => setMaximumMarks(e.target.value)}
                min="1"
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sliders size={14} color="var(--status-danger)" /> Min Passing/Flagging Threshold
              </label>
              <input 
                type="number" 
                className="form-input" 
                value={minimumThreshold} 
                onChange={e => setMinimumThreshold(e.target.value)}
                min="0"
                max={maximumMarks}
                required 
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Scores below {minimumThreshold}/{maximumMarks} trigger automatic parent/teacher alerts.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Shield size={14} color="var(--status-warning)" /> Allowed Plagiarism Threshold (%)
              </label>
              <input 
                type="number" 
                className="form-input" 
                value={similarityThreshold} 
                onChange={e => setSimilarityThreshold(e.target.value)}
                min="0"
                max="100"
                required 
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Similarity &gt; {similarityThreshold}% flags/rejects submission automatically.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Global Class Due Date</label>
              <input 
                type="datetime-local" 
                className="form-input" 
                value={dueDate} 
                onChange={e => setDueDate(e.target.value)}
                required 
              />
            </div>
          </div>

          {/* Configurable Rubric Criteria Section */}
          <div style={{ marginBottom: '1.5rem', background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>AI Grading Rubric & Criteria Weights</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={`badge ${totalWeight === 100 ? 'badge-success' : 'badge-warning'}`}>
                  Total Weight: {totalWeight}%
                </span>
                <button type="button" onClick={handleAddCriteria} className="btn btn-sm btn-secondary">
                  <Plus size={14} /> Add Criteria
                </button>
              </div>
            </div>

            {rubric.map((r, index) => (
              <div key={r.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Criteria Name" 
                  value={r.criteria} 
                  onChange={e => handleCriteriaChange(r.id, 'criteria', e.target.value)}
                  style={{ flex: 2 }}
                />
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Weight %" 
                  value={r.weightPct} 
                  onChange={e => handleCriteriaChange(r.id, 'weightPct', e.target.value)}
                  style={{ width: '90px' }}
                />
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Max Score" 
                  value={r.maxScore} 
                  onChange={e => handleCriteriaChange(r.id, 'maxScore', e.target.value)}
                  style={{ width: '90px' }}
                />
                <button 
                  type="button" 
                  onClick={() => handleRemoveCriteria(r.id)} 
                  className="btn btn-sm btn-danger btn-icon"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Publish Assignment</button>
          </div>
        </form>
      </div>
    </div>
  );
};
