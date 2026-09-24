import React, { useState, useRef } from 'react';
import { useClassroom } from '../../context/ClassroomContext';
import { X, Plus, Trash2, Sliders, Shield, Award, Code, Clock, UploadCloud, FileText, CheckCircle2, Loader2, Link as LinkIcon } from 'lucide-react';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { getFileType } from '../../utils/fileExtractor';

export const CreateAssignmentModal = ({ isOpen, onClose }) => {
  const { activeClassroom, addAssignment } = useClassroom();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredTopic, setRequiredTopic] = useState('');
  const [strictTopicCheck, setStrictTopicCheck] = useState(true);
  const [allowLateSubmissions, setAllowLateSubmissions] = useState(true);
  const [latePenaltyPercentage, setLatePenaltyPercentage] = useState(10);
  const [maximumMarks, setMaximumMarks] = useState(10);
  const [minimumThreshold, setMinimumThreshold] = useState(5);
  const [similarityThreshold, setSimilarityThreshold] = useState(15);
  const [dueDate, setDueDate] = useState('2026-09-25T23:59');

  // Cloudinary Attachment state for teacher reference PDF/Doc
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState('');
  const [isUploadingCloudinary, setIsUploadingCloudinary] = useState(false);

  const fileInputRef = useRef(null);

  // Configurable Generic Rubric Criteria List
  const [rubric, setRubric] = useState([
    { id: 'r1', criteria: 'Understanding & Concepts', weightPct: 30, maxScore: 3, description: 'Comprehension of subject domain' },
    { id: 'r2', criteria: 'Correctness & Accuracy', weightPct: 40, maxScore: 4, description: 'Accuracy of answers/solution' },
    { id: 'r3', criteria: 'Structure & Execution', weightPct: 15, maxScore: 1.5, description: 'Organization, formatting & syntax' },
    { id: 'r4', criteria: 'Completeness', weightPct: 15, maxScore: 1.5, description: 'Addressing all prompt instructions' }
  ]);

  if (!isOpen) return null;

  const handleFileSelect = async (file) => {
    if (!file) return;
    setFileName(file.name);
    const cat = getFileType(file.name);
    setFileType(cat);

    setIsUploadingCloudinary(true);
    try {
      const uploadRes = await uploadToCloudinary(file);
      if (uploadRes && uploadRes.url) {
        setFileUrl(uploadRes.url);
      }
    } catch (err) {
      console.error('Cloudinary reference file upload error:', err);
    } finally {
      setIsUploadingCloudinary(false);
    }
  };

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
      requiredTopic,
      strictTopicCheck,
      allowLateSubmissions,
      latePenaltyPercentage: Number(latePenaltyPercentage),
      maximumMarks: Number(maximumMarks),
      minimumThreshold: Number(minimumThreshold),
      similarityThreshold: Number(similarityThreshold),
      dueDate,
      fileName,
      fileUrl,
      fileType,
      rubric
    });

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '680px', width: '90%' }}>
        <div className="modal-header">
          <div className="modal-title">
            <Award color="var(--accent-indigo)" size={24} />
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
              placeholder="e.g. Midterm Lab Assignment or Course Project"
              value={title} 
              onChange={e => setTitle(e.target.value)}
              required 
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Code size={15} color="var(--accent-blue)" /> Subject / Technology Domain (Optional)
              </label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Java, Data Structures, History, Math, Physics..."
                value={requiredTopic} 
                onChange={e => setRequiredTopic(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={strictTopicCheck} 
                  onChange={e => setStrictTopicCheck(e.target.checked)} 
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 600 }}>Enforce Strict Topic Evaluation</span>
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                AI model evaluates student submissions strictly against whatever topic and instructions you write below.
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Instructions & Description</label>
            <textarea 
              className="form-textarea" 
              rows={4}
              placeholder="Enter detailed problem questions, guidelines, expected solutions, and submission rules..."
              value={description} 
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Reference Document / PDF Attachment Field (Cloudinary) */}
          <div className="form-group" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <UploadCloud size={16} color="var(--accent-blue)" /> Reference Study Material / Problem PDF (Cloudinary Upload)
            </label>
            
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".pdf,.docx,.doc,.pptx,.ppt,.png,.jpg,.jpeg,.txt" 
              style={{ display: 'none' }}
              onChange={e => e.target.files && handleFileSelect(e.target.files[0])}
            />

            {fileName ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={16} color="var(--accent-blue)" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{fileName}</span>
                  {isUploadingCloudinary ? (
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Loader2 size={12} className="spin" /> Uploading Cloudinary...
                    </span>
                  ) : fileUrl ? (
                    <span className="badge badge-success" style={{ fontSize: '0.75rem', gap: '0.2rem' }}>
                      <CheckCircle2 size={11} /> Cloudinary Hosted <LinkIcon size={10} />
                    </span>
                  ) : null}
                </div>
                <button type="button" onClick={() => { setFileName(''); setFileUrl(''); setFileType(''); }} className="btn btn-sm btn-secondary">Remove</button>
              </div>
            ) : (
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                className="btn btn-sm btn-secondary" 
                style={{ gap: '0.4rem', fontSize: '0.8rem' }}
              >
                <UploadCloud size={14} /> Attach Reference PDF / Word / Image (Cloudinary)
              </button>
            )}
          </div>

          {/* Late Submission Settings Box */}
          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={allowLateSubmissions} 
                  onChange={e => setAllowLateSubmissions(e.target.checked)} 
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Allow Late Submissions After Deadline</span>
              </label>

              {allowLateSubmissions && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Late Penalty Deduction:</span>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={latePenaltyPercentage} 
                    onChange={e => setLatePenaltyPercentage(e.target.value)}
                    min="0"
                    max="100"
                    style={{ width: '75px', padding: '0.35rem' }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>%</span>
                </div>
              )}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.4rem 0 0 0' }}>
              {allowLateSubmissions 
                ? `Students can hand in work after deadline, but AI model will deduct ${latePenaltyPercentage}% penalty from final grade.`
                : 'Submissions close strictly at deadline. Students will be blocked from submitting late unless granted a personal extension.'}
            </p>
          </div>

          {/* Configurable Thresholds & Parameters Grid */}
          <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
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
                <Sliders size={14} color="var(--status-danger)" /> Min Passing Threshold
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
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Shield size={14} color="var(--status-warning)" /> Allowed Plagiarism Limit (%)
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
          <div style={{ marginBottom: '1.25rem', background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>AI Grading Rubric & Criteria Weights</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={`badge ${totalWeight === 100 ? 'badge-success' : 'badge-warning'}`}>
                  Total Weight: {totalWeight}%
                </span>
                <button type="button" onClick={handleAddCriteria} className="btn btn-sm btn-secondary">
                  <Plus size={14} /> Add Criteria
                </button>
              </div>
            </div>

            {rubric.map((r) => (
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
                  style={{ width: '85px' }}
                />
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Max Marks" 
                  value={r.maxScore} 
                  onChange={e => handleCriteriaChange(r.id, 'maxScore', e.target.value)}
                  style={{ width: '85px' }}
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Publish Assignment</button>
          </div>
        </form>
      </div>
    </div>
  );
};
