import React from 'react';
import { useClassroom } from '../../context/ClassroomContext';
import { Award, CheckCircle, ExternalLink, ShieldCheck } from 'lucide-react';

export const TeacherCertificatesView = () => {
  const { certificates } = useClassroom();
  const safeCertificates = certificates || [];

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award color="var(--accent-purple)" size={20} />
            Student Certificates & Extracurricular Achievements
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Comprehensive profile of student hackathons, competitions, workshops, and technical events.
          </p>
        </div>
        <span className="badge badge-purple">{safeCertificates.length} Total Verification Records</span>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {safeCertificates.length === 0 ? (
          <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem' }}>
            <Award size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem display' }} />
            <h4 style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>No Student Verification Records Submitted Yet</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>When students upload hackathon, competition, or workshop certificates, they will appear here for verification.</p>
          </div>
        ) : (
          safeCertificates.map(cert => (
            <div key={cert.id} className="glass-card glass-card-interactive" style={{ background: 'var(--bg-secondary)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <span className="badge badge-info" style={{ marginBottom: '0.4rem' }}>{cert.category}</span>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{cert.title}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', fontWeight: 600 }}>{cert.studentName}</span>
                </div>
                <ShieldCheck color="var(--status-success)" size={20} title="Verified Credential" />
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.4' }}>
                {cert.description}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Issuer: <strong>{cert.issuer}</strong> ({cert.issueDate})</span>
                <a 
                  href={cert.credentialUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn btn-sm btn-secondary" 
                  style={{ gap: '0.3rem', padding: '0.2rem 0.6rem' }}
                >
                  View <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
