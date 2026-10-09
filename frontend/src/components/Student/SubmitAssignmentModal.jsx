import React, { useState, useRef } from 'react';
import { useClassroom } from '../../context/ClassroomContext';
import { useAuth } from '../../context/AuthContext';
import { X, Send, ShieldCheck, AlertCircle, UploadCloud, FileText, Image, FileCode, CheckCircle2, Loader2, Link, File } from 'lucide-react';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { extractTextFromFile, getFileType } from '../../utils/fileExtractor';

export const SubmitAssignmentModal = ({ assignment, isOpen, onClose }) => {
  const { submitStudentAssignment } = useClassroom();
  const { currentUser } = useAuth();

  const [extractedContent, setExtractedContent] = useState('');
  const [studentNotes, setStudentNotes] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileCategory, setFileCategory] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isUploadingCloudinary, setIsUploadingCloudinary] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef(null);

  if (!isOpen || !assignment) return null;

  const handleFileSelect = async (file) => {
    if (!file) return;

    setFileName(file.name);
    const cat = getFileType(file.name);
    setFileCategory(cat);

    // 1. Internal text extraction from Word, PDF, PPT, Image, or Code/Text file (behind scenes)
    setIsExtracting(true);
    try {
      const extractedText = await extractTextFromFile(file);
      setExtractedContent(extractedText || `[Attached file: ${file.name}]`);
    } catch (err) {
      console.error('Extraction error:', err);
      setExtractedContent(`[Attached file: ${file.name}]`);
    } finally {
      setIsExtracting(false);
    }

    // 2. Upload file to Cloudinary
    setIsUploadingCloudinary(true);
    try {
      const uploadRes = await uploadToCloudinary(file);
      if (uploadRes && uploadRes.url) {
        setFileUrl(uploadRes.url);
      }
    } catch (err) {
      console.error('Cloudinary error:', err);
    } finally {
      setIsUploadingCloudinary(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Combine extracted content + optional student notes
    const combinedContent = (extractedContent ? extractedContent + '\n\n' : '') + 
      (studentNotes ? `[Student Notes]: ${studentNotes}` : '');

    const finalContent = (combinedContent.trim() || (fileName ? `[Attached File Submission: ${fileName}]` : ''))
      .replace(/\0/g, '')
      .replace(/\u0000/g, '');

    if (!finalContent) {
      setResultMessage({
        type: 'danger',
        text: 'Please attach a file or enter solution text before submitting.'
      });
      return;
    }

    setSubmitting(true);
    setResultMessage(null);

    try {
      const res = await submitStudentAssignment({
        assignmentId: assignment.id,
        studentId: currentUser.id,
        studentName: currentUser.name,
        content: finalContent,
        fileName: fileName || `${assignment.title.replace(/\s+/g, '_')}_Submission.txt`,
        fileUrl: fileUrl || null,
        fileType: fileCategory || 'TEXT'
      }, assignment);

      setSubmitting(false);

      if (res && res.plagiarismStatus === 'FLAGGED_PLAGIARISM') {
        setResultMessage({
          type: 'danger',
          text: `Submission Flagged/Rejected! Similarity detected (${res.similarityPercentage}%) exceeds allowed threshold (${assignment.similarityThreshold}%).`
        });
      } else {
        setResultMessage({
          type: 'success',
          text: `Submission Accepted & AI Graded! Score: ${res?.aiSuggestedGrade ?? 0}/${assignment.maximumMarks}. Routed to teacher dashboard.`
        });
        setTimeout(() => {
          onClose();
        }, 2200);
      }
    } catch (err) {
      setSubmitting(false);
      setResultMessage({
        type: 'danger',
        text: 'Submission failed. Please check backend connection or try again.'
      });
    }
  };

  const getFormatBadge = () => {
    switch (fileCategory) {
      case 'DOCX': return <span className="badge badge-primary" style={{ background: '#2b579a', color: '#fff' }}><FileText size={12} style={{ marginRight: 4 }} /> Word (.docx)</span>;
      case 'PPTX': return <span className="badge badge-warning" style={{ background: '#d24726', color: '#fff' }}><FileText size={12} style={{ marginRight: 4 }} /> PowerPoint (.pptx)</span>;
      case 'PDF': return <span className="badge badge-danger" style={{ background: '#b30b00', color: '#fff' }}><FileText size={12} style={{ marginRight: 4 }} /> PDF Document</span>;
      case 'IMAGE': return <span className="badge badge-info" style={{ background: '#8e44ad', color: '#fff' }}><Image size={12} style={{ marginRight: 4 }} /> Image / OCR</span>;
      default: return <span className="badge badge-secondary"><FileCode size={12} style={{ marginRight: 4 }} /> File Attachment</span>;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '640px', width: '90%' }}>
        <div className="modal-header">
          <div className="modal-title">
            <UploadCloud color="var(--accent-blue)" size={24} />
            <span>Submit Assignment: {assignment.title}</span>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon"><X size={18} /></button>
        </div>

        {/* Assignment Briefing */}
        <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Maximum Marks: {assignment.maximumMarks}</span>
            <span className="badge badge-warning">Plagiarism Limit: {assignment.similarityThreshold}%</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>{assignment.description}</p>
        </div>

        {resultMessage && (
          <div className={`badge badge-${resultMessage.type}`} style={{ width: '100%', padding: '0.85rem', marginBottom: '1rem', fontSize: '0.85rem', textTransform: 'none', justifyContent: 'center', borderRadius: 'var(--radius-sm)' }}>
            {resultMessage.type === 'danger' ? <AlertCircle size={18} style={{ marginRight: 6 }} /> : <ShieldCheck size={18} style={{ marginRight: 6 }} />}
            {resultMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* File Drag & Drop Upload Zone */}
          <div 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragActive ? 'var(--accent-blue)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragActive ? 'rgba(59, 130, 246, 0.05)' : 'var(--bg-secondary)',
              marginBottom: '1.25rem',
              transition: 'all 0.2s ease'
            }}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".pdf,.docx,.doc,.pptx,.ppt,.png,.jpg,.jpeg,.webp,.txt,.py,.java,.cpp,.js,.html,.css,.json" 
              style={{ display: 'none' }}
              onChange={e => e.target.files && handleFileSelect(e.target.files[0])}
            />

            <UploadCloud size={40} color="var(--accent-blue)" style={{ marginBottom: '0.5rem', opacity: 0.85 }} />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.25rem 0' }}>
              Click or drag & drop assignment file to attach
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
              Supports Word (.docx), PowerPoint (.pptx), PDF (.pdf), Images (.png/.jpg OCR), & Source Code
            </p>
          </div>

          {/* Attached File Card */}
          {fileName && (
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
                <File size={22} color="var(--accent-blue)" />
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>{fileName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                    {getFormatBadge()}
                    {isUploadingCloudinary ? (
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Loader2 size={12} className="spin" /> Uploading Cloudinary...
                      </span>
                    ) : fileUrl ? (
                      <a href={fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}>
                        <CheckCircle2 size={12} /> Cloudinary Hosted <Link size={11} />
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>

              {isExtracting ? (
                <span className="badge badge-info" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Loader2 size={12} className="spin" /> Reading Content...
                </span>
              ) : (
                <span className="badge badge-success" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CheckCircle2 size={12} /> Ready for AI
                </span>
              )}
            </div>
          )}

          {/* Optional Student Notes / Direct Answer Field */}
          <div className="form-group">
            <label className="form-label">Additional Solution Notes / Comments (Optional)</label>
            <textarea 
              className="form-textarea" 
              rows={4}
              placeholder="Add optional notes, solution explanation, or text response for your instructor..."
              value={studentNotes} 
              onChange={e => setStudentNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={submitting || isExtracting || isUploadingCloudinary || (!fileName && !studentNotes.trim())}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="spin" style={{ marginRight: 6 }} /> Evaluating Plagiarism & AI Grading...
                </>
              ) : (
                <>
                  <Send size={16} style={{ marginRight: 6 }} /> Submit Assignment
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
