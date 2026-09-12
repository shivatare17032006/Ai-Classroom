import React, { useState } from 'react';
import { useClassroom } from '../../context/ClassroomContext';
import { useAuth } from '../../context/AuthContext';
import { Award, Plus, ExternalLink, ShieldCheck, Upload } from 'lucide-react';

export const CertificateLocker = () => {
  const { certificates, uploadCertificate } = useClassroom();
  const { currentUser } = useAuth();

  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Hackathon');
  const [issuer, setIssuer] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');
  const [description, setDescription] = useState('');

  const myCertificates = (certificates || []).filter(c => c?.studentId === currentUser?.id);

  const handleUpload = (e) => {
    e.preventDefault();
    if (!title || !issuer) return;

    uploadCertificate({
      studentId: currentUser?.id,
      studentName: currentUser?.name || 'Student',
      title,
      category,
      issuer,
      issueDate: issueDate || new Date().toISOString().split('T')[0],
      credentialUrl: credentialUrl || 'https://example.com/credential-preview',
      description
    });

    setIsUploading(false);
    setTitle('');
    setIssuer('');
    setDescription('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award color="var(--accent-purple)" size={24} />
            My Achievements & Certificate Locker
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Upload hackathons, competitions, workshops, and technical credentials. Visible to Teachers & Guardians.
          </p>
        </div>

        <button onClick={() => setIsUploading(!isUploading)} className="btn btn-primary">
          <Plus size={16} /> {isUploading ? 'Close Form' : 'Upload New Certificate'}
        </button>
      </div>

      {/* Upload Form Modal/Drawer */}
      {isUploading && (
        <div className="glass-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-highlight)' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Upload size={16} color="var(--accent-blue)" /> Certificate Details
          </h4>

          <form onSubmit={handleUpload}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Achievement / Event Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Smart India Hackathon Winner 2026"
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Competition">Competition</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Technical Event">Technical Event</option>
                  <option value="Extracurricular">Extracurricular</option>
                  <option value="Academic Distinction">Academic Distinction</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Issuing Organization</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. AWS Academy, IEEE, Google Cloud"
                  value={issuer} 
                  onChange={e => setIssuer(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Issue Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={issueDate} 
                  onChange={e => setIssueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Credential Verification Link / File URL</label>
              <input 
                type="url" 
                className="form-input" 
                placeholder="https://example.com/certificates/credential-id"
                value={credentialUrl} 
                onChange={e => setCredentialUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Brief Description of Project/Achievement</label>
              <textarea 
                className="form-textarea" 
                placeholder="Describe your role, key technical stack, and outcomes..."
                value={description} 
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={() => setIsUploading(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary">Save to Profile</button>
            </div>
          </form>
        </div>
      )}

      {/* Certificates Cards Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {myCertificates.length === 0 ? (
          <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem' }}>
            <Award size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem display' }} />
            <h4 style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>No Certificates Uploaded Yet</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Upload your hackathons, workshops, and competitive programming achievements here.</p>
          </div>
        ) : (
          myCertificates.map(cert => (
            <div key={cert.id} className="glass-card glass-card-interactive" style={{ background: 'var(--bg-secondary)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <span className="badge badge-purple" style={{ marginBottom: '0.4rem' }}>{cert.category}</span>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{cert.title}</h4>
                </div>
                <ShieldCheck color="var(--status-success)" size={22} title="Verified Certificate" />
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.4' }}>
                {cert.description}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Issuer: <strong>{cert.issuer}</strong></span>
                <a 
                  href={cert.credentialUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn btn-sm btn-secondary" 
                  style={{ gap: '0.3rem', padding: '0.2rem 0.6rem' }}
                >
                  View Credential <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
