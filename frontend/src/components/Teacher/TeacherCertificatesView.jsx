import React, { useState } from 'react';
import { useClassroom } from '../../context/ClassroomContext';
import { useAuth } from '../../context/AuthContext';
import { Award, CheckCircle, ExternalLink, ShieldCheck, Eye, Filter, Search, BookOpen } from 'lucide-react';
import { DocumentViewerModal } from '../Common/DocumentViewerModal';

export const TeacherCertificatesView = ({ classroom }) => {
  const { certificates, classrooms } = useClassroom();
  const { users, currentUser } = useAuth();

  const safeCertificates = certificates || [];
  const safeClassrooms = classrooms || [];
  const safeUsers = users || [];

  // Teacher's classrooms
  const teacherClassrooms = safeClassrooms.filter(c => c.teacherId === currentUser?.id);

  // Selected classroom state if not passed via props
  const [selectedClassId, setSelectedClassId] = useState(classroom?.id || 'ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCertPreview, setActiveCertPreview] = useState(null);

  // Determine active classroom context
  const activeClass = classroom || (selectedClassId !== 'ALL' ? safeClassrooms.find(c => c.id === selectedClassId) : null);

  // Compute set of enrolled student IDs and Emails
  const enrolledStudentIdsSet = React.useMemo(() => {
    const set = new Set();

    const targetClassrooms = activeClass ? [activeClass] : teacherClassrooms;
    targetClassrooms.forEach(cls => {
      if (Array.isArray(cls.studentIds)) {
        cls.studentIds.forEach(id => {
          if (id) set.add(id.toString().toLowerCase());
        });
      }
    });

    safeUsers.forEach(u => {
      if (u.role === 'STUDENT') {
        const uId = (u.id || '').toString().toLowerCase();
        const uEmail = (u.email || '').toString().toLowerCase();
        if (set.has(uId) || set.has(uEmail)) {
          if (uId) set.add(uId);
          if (uEmail) set.add(uEmail);
        }
      }
    });

    return set;
  }, [activeClass, teacherClassrooms, safeUsers]);

  const enrolledStudentsCount = React.useMemo(() => {
    const set = new Set();
    const targetClassrooms = activeClass ? [activeClass] : teacherClassrooms;
    targetClassrooms.forEach(cls => {
      if (Array.isArray(cls.studentIds)) {
        cls.studentIds.forEach(id => {
          if (id) set.add(id.toString().toLowerCase());
        });
      }
    });
    return set.size;
  }, [activeClass, teacherClassrooms]);

  // Filter certificates: ONLY show certificates of students who are ENROLLED in the active classroom context
  const classroomCertificates = safeCertificates.filter(c => {
    if (!c) return false;
    const certStudentId = (c.studentId || '').toString().toLowerCase();
    const certStudentEmail = (c.studentEmail || '').toString().toLowerCase();

    // Fallback: If teacher has no classrooms created yet, display certificates
    if (teacherClassrooms.length === 0) return true;

    return (certStudentId && enrolledStudentIdsSet.has(certStudentId)) || 
           (certStudentEmail && enrolledStudentIdsSet.has(certStudentEmail));
  });

  const filteredCertificates = classroomCertificates.filter(c => {
    const matchesCat = selectedCategory === 'ALL' || c.category === selectedCategory;
    const matchesSearch = !searchTerm.trim() || 
      (c.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (c.issuer || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header Banner */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award color="var(--accent-purple)" size={20} />
              Enrolled Student Certificates & Achievements
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Viewing uploaded credentials for students enrolled in <strong>{activeClass ? activeClass.name : 'your classrooms'}</strong> ({enrolledStudentsCount} enrolled students).
            </p>
          </div>
          <span className="badge badge-purple">{filteredCertificates.length} Enrolled Certificates</span>
        </div>

        {/* Classroom & Category Filter Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            
            {/* Class Dropdown (if not forced by classroom prop) */}
            {!classroom && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <BookOpen size={16} color="var(--accent-indigo)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Classroom:</span>
                <select 
                  value={selectedClassId}
                  onChange={e => setSelectedClassId(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto', padding: '0.35rem 0.8rem', fontSize: '0.85rem' }}
                >
                  <option value="ALL">All My Classrooms ({teacherClassrooms.length})</option>
                  {teacherClassrooms.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-purple)', fontWeight: 700, fontSize: '0.85rem' }}>
              <Filter size={16} /> Category:
            </div>
            
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '0.35rem 0.8rem', fontSize: '0.85rem' }}
            >
              <option value="ALL">All Categories ({classroomCertificates.length})</option>
              <option value="Hackathon">🏆 Hackathons</option>
              <option value="Competition">🥇 Competitions</option>
              <option value="Workshop">💻 Workshops</option>
              <option value="Technical Certification">📜 Certifications</option>
              <option value="Academic Distinction">⭐ Academic</option>
              <option value="Extracurricular">🎯 Extracurricular</option>
            </select>
          </div>

          <div style={{ position: 'relative', width: '250px' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search student or title..."
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2rem', padding: '0.35rem 0.6rem 0.35rem 2rem', fontSize: '0.83rem' }}
            />
          </div>
        </div>
      </div>

      {/* Certificate Cards Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {filteredCertificates.length === 0 ? (
          <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3.5rem 1rem' }}>
            <Award size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', display: 'block' }} />
            <h4 style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>No Student Certificates Found</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              {enrolledStudentsCount === 0 
                ? 'There are no enrolled students in this classroom yet.' 
                : 'Enrolled students in this class have not uploaded any certificates yet.'}
            </p>
          </div>
        ) : (
          filteredCertificates.map(cert => (
            <div key={cert.id} className="glass-card glass-card-interactive" style={{ background: 'var(--bg-secondary)', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span className="badge badge-info" style={{ marginBottom: '0.4rem' }}>{cert.category}</span>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{cert.title}</h4>
                    <span style={{ fontSize: '0.82rem', color: 'var(--accent-blue)', fontWeight: 700 }}>
                      Student: {cert.studentName}
                    </span>
                  </div>
                  <ShieldCheck color="var(--status-success)" size={22} title="Verified Credential" />
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.4' }}>
                  {cert.description || 'Student verified achievement certificate.'}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <span>Issuer: <strong>{cert.issuer}</strong></span>
                  <span>{cert.issueDate}</span>
                </div>

                <button 
                  onClick={() => setActiveCertPreview({ fileUrl: cert.fileUrl || cert.credentialUrl, fileName: cert.fileName || `${cert.studentName}_${cert.title}`, fileType: cert.fileType || 'PDF' })}
                  className="btn btn-sm btn-secondary" 
                  style={{ width: '100%', gap: '0.4rem', fontSize: '0.8rem', justifyContent: 'center' }}
                >
                  <Eye size={14} /> View Certificate
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cloudinary Document / Certificate Reader Modal */}
      {activeCertPreview && (
        <DocumentViewerModal 
          fileUrl={activeCertPreview.fileUrl} 
          fileName={activeCertPreview.fileName} 
          fileType={activeCertPreview.fileType} 
          isOpen={!!activeCertPreview} 
          onClose={() => setActiveCertPreview(null)} 
        />
      )}

    </div>
  );
};
