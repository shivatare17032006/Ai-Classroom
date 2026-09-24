import React, { useState } from 'react';
import { useClassroom } from '../../context/ClassroomContext';
import { Award, CheckCircle, ExternalLink, ShieldCheck, Eye, Filter, Search } from 'lucide-react';
import { DocumentViewerModal } from '../Common/DocumentViewerModal';

export const TeacherCertificatesView = () => {
  const { certificates } = useClassroom();
  const safeCertificates = certificates || [];

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCertPreview, setActiveCertPreview] = useState(null);

  const filteredCertificates = safeCertificates.filter(c => {
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award color="var(--accent-purple)" size={20} />
              Student Certificates & Extracurricular Achievements
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Comprehensive profile of student hackathons, competitions, workshops, and technical credentials.
            </p>
          </div>
          <span className="badge badge-purple">{safeCertificates.length} Total Verification Records</span>
        </div>

        {/* Filter & Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-purple)', fontWeight: 700, fontSize: '0.88rem' }}>
              <Filter size={16} /> Filter Category:
            </div>
            
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '0.35rem 0.8rem', fontSize: '0.85rem' }}
            >
              <option value="ALL">All Categories ({safeCertificates.length})</option>
              <option value="Hackathon">🏆 Hackathons</option>
              <option value="Competition">🥇 Competitions</option>
              <option value="Workshop">💻 Workshops</option>
              <option value="Technical Certification">📜 Certifications</option>
              <option value="Academic Distinction">⭐ Academic</option>
              <option value="Extracurricular">🎯 Extracurricular</option>
            </select>
          </div>

          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search student or certificate..."
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
            <h4 style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>No Student Verification Records Found</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>When students upload hackathon, competition, or workshop certificates, they will appear here for verification.</p>
          </div>
        ) : (
          filteredCertificates.map(cert => (
            <div key={cert.id} className="glass-card glass-card-interactive" style={{ background: 'var(--bg-secondary)', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span className="badge badge-info" style={{ marginBottom: '0.4rem' }}>{cert.category}</span>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{cert.title}</h4>
                    <span style={{ fontSize: '0.82rem', color: 'var(--accent-blue)', fontWeight: 700 }}>{cert.studentName}</span>
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
