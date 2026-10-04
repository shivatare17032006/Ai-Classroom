import React, { useState, useRef } from 'react';
import { useClassroom } from '../../context/ClassroomContext';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/api';
import { TeacherDashboard } from '../Teacher/TeacherDashboard';
import { StudentDashboard } from '../Student/StudentDashboard';
import { TeacherCertificatesView } from '../Teacher/TeacherCertificatesView';
import { CertificateLocker } from '../Student/CertificateLocker';
import { DocumentViewerModal } from '../Common/DocumentViewerModal';
import { UserAvatar } from '../Common/UserAvatar';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { getFileType } from '../../utils/fileExtractor';
import { exportParentEmailRosterTemplateCSV, parseParentEmailCSV } from '../../utils/csvExporter';
import { EmailNotificationService } from '../../services/emailService';
import { 
  BookOpen, 
  MessageSquare, 
  FileText, 
  Users, 
  TrendingUp, 
  ArrowLeft, 
  Copy, 
  Check, 
  Clock,
  Send,
  Sparkles,
  Award,
  UploadCloud,
  Paperclip,
  Eye,
  Loader2,
  CheckCircle2,
  Link as LinkIcon,
  Download,
  Mail,
  Save
} from 'lucide-react';

export const ClassroomDetailView = ({ classroom, onBack, onNavigateBilling }) => {
  const { assignments, announcements, postAnnouncement, refreshData } = useClassroom();
  const { currentUser, users } = useAuth();
  
  const [activeTab, setActiveTab] = useState('stream'); // 'stream' | 'classwork' | 'people' | 'certificates' | 'analytics'
  const [copied, setCopied] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Cloudinary Attachment state for announcement document/PPT/PDF/Doc
  const [announcementFileName, setAnnouncementFileName] = useState('');
  const [announcementFileUrl, setAnnouncementFileUrl] = useState('');
  const [announcementFileType, setAnnouncementFileType] = useState('');
  const [isUploadingAnnouncementFile, setIsUploadingAnnouncementFile] = useState(false);
  const [activeDocPreview, setActiveDocPreview] = useState(null);

  // Parent Email Bulk Upload & Roster State
  const [editingParentEmails, setEditingParentEmails] = useState({});
  const [bulkUploadMessage, setBulkUploadMessage] = useState(null);

  const announcementFileInputRef = useRef(null);
  const bulkCsvInputRef = useRef(null);

  const classAssignments = assignments.filter(a => a.classroomId === classroom?.id);
  const enrolledStudents = (users || []).filter(u => u.role === 'STUDENT' && Array.isArray(classroom?.studentIds) && classroom.studentIds.includes(u.id));
  const classAnnouncements = (announcements || []).filter(a => a.classroomId === classroom?.id);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classroom?.code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAnnouncementFileSelect = async (file) => {
    if (!file) return;
    setAnnouncementFileName(file.name);
    const cat = getFileType(file.name);
    setAnnouncementFileType(cat);

    setIsUploadingAnnouncementFile(true);
    try {
      const uploadRes = await uploadToCloudinary(file);
      if (uploadRes && uploadRes.url) {
        setAnnouncementFileUrl(uploadRes.url);
      }
    } catch (err) {
      console.error('Cloudinary announcement attachment error:', err);
    } finally {
      setIsUploadingAnnouncementFile(false);
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementText.trim()) return;

    setIsPosting(true);
    const newAnnouncement = {
      classroomId: classroom?.id,
      authorId: currentUser?.id,
      authorName: currentUser?.name || 'Instructor',
      authorRole: currentUser?.role || 'TEACHER',
      content: announcementText.trim(),
      fileName: announcementFileName,
      fileUrl: announcementFileUrl,
      fileType: announcementFileType,
      createdAt: new Date().toISOString()
    };

    await postAnnouncement(newAnnouncement);

    // CASE 1B: TRIGGER AUTOMATED STREAM ANNOUNCEMENT EMAIL TO ENROLLED STUDENTS
    EmailNotificationService.sendAnnouncementEmails(classroom, newAnnouncement, currentUser, enrolledStudents);

    setAnnouncementText('');
    setAnnouncementFileName('');
    setAnnouncementFileUrl('');
    setAnnouncementFileType('');
    setIsPosting(false);
  };

  const handleSaveParentEmail = async (studentId, parentEmailVal) => {
    if (!studentId) return;
    try {
      await ApiService.updateUser(studentId, { parentEmail: parentEmailVal.trim() });
      await refreshData();
      setBulkUploadMessage({ type: 'success', text: 'Updated parent notification email successfully!' });
      setTimeout(() => setBulkUploadMessage(null), 3000);
    } catch (err) {
      console.error('Error saving parent email:', err);
      setBulkUploadMessage({ type: 'error', text: 'Failed to update parent email.' });
    }
  };

  const handleBulkCSVUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const records = parseParentEmailCSV(text);

        if (!records || records.length === 0) {
          setBulkUploadMessage({ type: 'error', text: 'No valid student records found in CSV file. Please use the Sample CSV template.' });
          return;
        }

        let updatedCount = 0;
        const allUsers = users || [];

        for (const rec of records) {
          const matched = allUsers.find(u => 
            u.role === 'STUDENT' && (
              (rec.studentEmail && u.email && u.email.toLowerCase() === rec.studentEmail.toLowerCase()) ||
              (rec.rollNo && u.rollNo && u.rollNo.toString().trim() === rec.rollNo.toString().trim()) ||
              (rec.prnNo && u.prnNo && u.prnNo.toString().trim() === rec.prnNo.toString().trim())
            )
          );

          if (matched) {
            const updatePayload = {};
            if (rec.parentEmail) updatePayload.parentEmail = rec.parentEmail;
            if (rec.rollNo) updatePayload.rollNo = rec.rollNo;
            if (rec.prnNo) updatePayload.prnNo = rec.prnNo;

            if (Object.keys(updatePayload).length > 0) {
              await ApiService.updateUser(matched.id, updatePayload);
              updatedCount++;
            }
          }
        }

        await refreshData();
        setBulkUploadMessage({ 
          type: 'success', 
          text: `Bulk import successful! Updated parent emails & student credentials for ${updatedCount} student(s).` 
        });

      } catch (err) {
        console.error('Error processing bulk parent email CSV:', err);
        setBulkUploadMessage({ type: 'error', text: 'Failed to parse CSV file. Please verify column formatting.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Back Button & Banner Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button onClick={onBack} className="btn btn-secondary btn-sm" style={{ gap: '0.3rem' }}>
          <ArrowLeft size={16} /> Back to Courses
        </button>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Classrooms / {classroom?.name}</span>
      </div>

      {/* Google Classroom Hero Header Card */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #4f46e5 100%)',
        color: '#ffffff',
        padding: '2rem',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-glow)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', marginBottom: '0.5rem' }}>
              {classroom?.section || 'Section A'}
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{classroom?.name}</h2>
            <p style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '0.25rem' }}>
              Instructor: <strong>{classroom?.teacherName}</strong> • {classroom?.description}
            </p>
          </div>

          {/* Class Code Widget */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                Class Join Code
              </span>
              <strong style={{ fontSize: '1.2rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
                {classroom?.code}
              </strong>
            </div>
            <button 
              onClick={handleCopyCode} 
              className="btn btn-sm btn-secondary" 
              style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
            >
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* 5 Google Classroom Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginTop: '1.75rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          paddingTop: '1rem',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={() => setActiveTab('stream')}
            style={{
              background: activeTab === 'stream' ? '#ffffff' : 'transparent',
              color: activeTab === 'stream' ? '#0f172a' : '#ffffff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <MessageSquare size={16} /> Stream
          </button>

          <button 
            onClick={() => setActiveTab('classwork')}
            style={{
              background: activeTab === 'classwork' ? '#ffffff' : 'transparent',
              color: activeTab === 'classwork' ? '#0f172a' : '#ffffff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <FileText size={16} /> Classwork & Assignments
          </button>

          <button 
            onClick={() => setActiveTab('people')}
            style={{
              background: activeTab === 'people' ? '#ffffff' : 'transparent',
              color: activeTab === 'people' ? '#0f172a' : '#ffffff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Users size={16} /> People ({enrolledStudents.length})
          </button>

          <button 
            onClick={() => setActiveTab('certificates')}
            style={{
              background: activeTab === 'certificates' ? '#ffffff' : 'transparent',
              color: activeTab === 'certificates' ? '#0f172a' : '#ffffff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Award size={16} /> Student Certificates
          </button>

          {currentUser?.role === 'TEACHER' && (
            <button 
              onClick={() => setActiveTab('analytics')}
              style={{
                background: activeTab === 'analytics' ? '#ffffff' : 'transparent',
                color: activeTab === 'analytics' ? '#0f172a' : '#ffffff',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <TrendingUp size={16} /> AI Gradebook & Analytics
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Stream View */}
      {activeTab === 'stream' && (
        <div className="grid-2" style={{ gridTemplateColumns: '260px 1fr' }}>
          {/* Upcoming Work Widget */}
          <div className="glass-card" style={{ height: 'fit-content' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={16} color="var(--accent-blue)" /> Upcoming Due Dates
            </h3>
            {classAssignments.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No upcoming assignments.</p>
            ) : (
              classAssignments.map(asg => (
                <div key={asg.id} style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.82rem' }}>
                  <strong style={{ display: 'block' }}>{asg.title}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Due: {new Date(asg.dueDate).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Stream Announcement Composer & Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Teacher Announcement Post Composer */}
            {currentUser?.role === 'TEACHER' && (
              <div className="glass-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-highlight)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <UserAvatar name={currentUser?.name || 'Teacher'} size={36} />
                  <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Announce something to your class</span>
                </div>

                <form onSubmit={handlePostAnnouncement}>
                  <textarea 
                    className="form-textarea" 
                    placeholder={`Share an update, syllabus note, sample doc, or assignment instruction with ${classroom?.name || 'the class'}...`}
                    value={announcementText}
                    onChange={e => setAnnouncementText(e.target.value)}
                    style={{ minHeight: '85px', fontSize: '0.85rem' }}
                    required
                  />

                  {/* Hidden File Input for Announcement PPT / PDF / DOC Attachment */}
                  <input 
                    ref={announcementFileInputRef}
                    type="file" 
                    accept=".pdf,.docx,.doc,.pptx,.ppt,.png,.jpg,.jpeg,.txt,.zip"
                    style={{ display: 'none' }}
                    onChange={e => e.target.files && handleAnnouncementFileSelect(e.target.files[0])}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {announcementFileName ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-primary)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                        <FileText size={14} color="var(--accent-blue)" />
                        <span style={{ fontWeight: 600 }}>{announcementFileName}</span>
                        {isUploadingAnnouncementFile ? (
                          <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <Loader2 size={12} className="spin" /> Uploading...
                          </span>
                        ) : announcementFileUrl ? (
                          <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                            <CheckCircle2 size={10} /> Cloudinary Hosted
                          </span>
                        ) : null}
                        <button type="button" onClick={() => { setAnnouncementFileName(''); setAnnouncementFileUrl(''); setAnnouncementFileType(''); }} className="btn btn-sm btn-secondary" style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem' }}>Remove</button>
                      </div>
                    ) : (
                      <button 
                        type="button" 
                        onClick={() => announcementFileInputRef.current?.click()} 
                        className="btn btn-secondary btn-sm"
                        style={{ gap: '0.35rem', fontSize: '0.8rem' }}
                      >
                        <Paperclip size={14} /> Attach PPT, PDF, DOC, Image
                      </button>
                    )}

                    <button type="submit" disabled={isPosting || isUploadingAnnouncementFile} className="btn btn-primary btn-sm" style={{ gap: '0.4rem' }}>
                      <Send size={14} /> {isPosting ? 'Posting...' : 'Post Announcement'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Live Announcements Stream Feed */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MessageSquare size={16} color="var(--accent-purple)" /> Class Announcements & Stream
              </h3>

              {classAnnouncements.length === 0 ? (
                <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
                    <UserAvatar name={classroom?.teacherName || 'Instructor'} size={34} />
                    <div>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--accent-purple)' }}>{classroom?.teacherName}</strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Primary Instructor • Course Announcement</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.35rem', lineHeight: '1.5' }}>
                    Welcome to <strong>{classroom?.name}</strong>! Please review assignment rubrics, minimum threshold requirements, and submission policies before handing in coursework.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {classAnnouncements.map(ann => (
                    <div key={ann.id} style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <UserAvatar name={ann.authorName} size={34} />
                          <div>
                            <strong style={{ fontSize: '0.88rem', color: 'var(--accent-purple)' }}>{ann.authorName}</strong>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{ann.authorRole} • Posted on {new Date(ann.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                        {ann.content}
                      </p>

                      {/* Display Attached File button if attached to Announcement */}
                      {ann.fileUrl && (
                        <div style={{ marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px dashed var(--border-color)' }}>
                          <button 
                            onClick={() => setActiveDocPreview({ fileUrl: ann.fileUrl, fileName: ann.fileName || `${ann.authorName}_Attachment.pdf`, fileType: ann.fileType })}
                            className="btn btn-sm btn-secondary" 
                            style={{ gap: '0.4rem', fontSize: '0.8rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-indigo)', borderColor: 'rgba(99, 102, 241, 0.25)', fontWeight: 600 }}
                          >
                            <Eye size={14} /> View Attached Material ({ann.fileName || 'Attachment'})
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Tab 2: Classwork View */}
      {activeTab === 'classwork' && (
        currentUser?.role === 'TEACHER' ? (
          <TeacherDashboard classroom={classroom} onNavigateBilling={onNavigateBilling} />
        ) : (
          <StudentDashboard classroom={classroom} />
        )
      )}

      {/* Tab 3: People View */}
      {activeTab === 'people' && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Teachers & Instructors</h3>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
            <UserAvatar name={classroom?.teacherName || 'Teacher'} size={40} />
            <div>
              <strong style={{ fontSize: '0.95rem' }}>{classroom?.teacherName}</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Primary Instructor</span>
            </div>
          </div>

          {/* Student Roster Header & Bulk CSV Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                Classmates & Student Roster ({enrolledStudents.length})
              </h3>
              {currentUser?.role === 'TEACHER' && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Manage student credentials and parent notification email addresses for automated AI alerts.
                </span>
              )}
            </div>

            {/* Teacher Bulk Upload & Sample Template Buttons */}
            {currentUser?.role === 'TEACHER' && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => exportParentEmailRosterTemplateCSV(enrolledStudents, classroom?.name)}
                  className="btn btn-sm btn-secondary" 
                  style={{ gap: '0.4rem', fontSize: '0.8rem' }}
                  title="Download pre-filled CSV format to enter parent emails in bulk"
                >
                  <Download size={14} /> Download Sample Parent CSV
                </button>

                <button 
                  onClick={() => bulkCsvInputRef.current?.click()}
                  className="btn btn-sm btn-primary" 
                  style={{ gap: '0.4rem', fontSize: '0.8rem' }}
                >
                  <UploadCloud size={14} /> Bulk Upload Parent Emails CSV
                </button>

                <input 
                  ref={bulkCsvInputRef}
                  type="file" 
                  accept=".csv"
                  style={{ display: 'none' }}
                  onChange={handleBulkCSVUpload}
                />
              </div>
            )}
          </div>

          {/* Bulk Upload Message Feedback Alert */}
          {bulkUploadMessage && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: bulkUploadMessage.type === 'success' ? 'var(--status-success-bg)' : 'var(--status-danger-bg)',
              color: bulkUploadMessage.type === 'success' ? 'var(--status-success)' : 'var(--status-danger)',
              border: `1px solid ${bulkUploadMessage.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>{bulkUploadMessage.text}</span>
              <button onClick={() => setBulkUploadMessage(null)} className="btn btn-sm btn-secondary" style={{ padding: '0.1rem 0.4rem', fontSize: '0.75rem' }}>Dismiss</button>
            </div>
          )}
          
          {enrolledStudents.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '1rem 0' }}>
              No enrolled students in this classroom yet. Share the class code (<strong>{classroom?.code}</strong>) with your students to let them join.
            </p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Roll No</th>
                    <th>PRN No</th>
                    <th>Institutional Email</th>
                    {currentUser?.role === 'TEACHER' && <th>Parent Notification Email</th>}
                  </tr>
                </thead>
                <tbody>
                  {enrolledStudents.map(student => {
                    const currentParentEmail = editingParentEmails[student.id] !== undefined 
                      ? editingParentEmails[student.id] 
                      : (student.parentEmail || '');

                    return (
                      <tr key={student.id}>
                        <td style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700 }}>
                          <UserAvatar name={student.name} size={30} />
                          {student.name}
                        </td>
                        <td><span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>{student.rollNo || 'Not Set'}</span></td>
                        <td><span className="badge badge-info" style={{ fontSize: '0.75rem' }}>{student.prnNo || 'Not Set'}</span></td>
                        <td style={{ fontSize: '0.85rem' }}>{student.email}</td>
                        
                        {currentUser?.role === 'TEACHER' && (
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <Mail size={14} color="var(--accent-indigo)" />
                              <input 
                                type="email"
                                className="form-input"
                                placeholder="e.g. parent@gmail.com"
                                value={currentParentEmail}
                                onChange={e => setEditingParentEmails({ ...editingParentEmails, [student.id]: e.target.value })}
                                style={{ padding: '0.3rem 0.5rem', fontSize: '0.82rem', width: '210px' }}
                              />
                              <button 
                                onClick={() => handleSaveParentEmail(student.id, currentParentEmail)}
                                className="btn btn-sm btn-primary"
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', gap: '0.2rem' }}
                                title="Save parent email"
                              >
                                <Save size={12} /> Save
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Student Certificates View */}
      {activeTab === 'certificates' && (
        currentUser?.role === 'TEACHER' ? (
          <TeacherCertificatesView classroom={classroom} />
        ) : (
          <CertificateLocker classroom={classroom} />
        )
      )}

      {/* Tab 5: Gradebook & AI Analytics View */}
      {activeTab === 'analytics' && currentUser?.role === 'TEACHER' && (
        <TeacherDashboard classroom={classroom} onNavigateBilling={onNavigateBilling} />
      )}

      {/* Cloudinary Document / PDF Reader Modal */}
      {activeDocPreview && (
        <DocumentViewerModal 
          fileUrl={activeDocPreview.fileUrl} 
          fileName={activeDocPreview.fileName} 
          fileType={activeDocPreview.fileType} 
          isOpen={!!activeDocPreview} 
          onClose={() => setActiveDocPreview(null)} 
        />
      )}

    </div>
  );
};
