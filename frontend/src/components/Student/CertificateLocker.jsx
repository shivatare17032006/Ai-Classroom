import React, { useState, useRef } from 'react';
import { useClassroom } from '../../context/ClassroomContext';
import { useAuth } from '../../context/AuthContext';
import { Award, Plus, ExternalLink, ShieldCheck, Upload, UploadCloud, FileText, CheckCircle2, Loader2, Link as LinkIcon, Eye, Filter, Search } from 'lucide-react';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { getFileType } from '../../utils/fileExtractor';
import { DocumentViewerModal } from '../Common/DocumentViewerModal';

export const CertificateLocker = ({ classroom }) => {
  const { certificates, uploadCertificate } = useClassroom();
  const { currentUser } = useAuth();

  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Hackathon');
  const [issuer, setIssuer] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [credentialUrl, setCredentialUrl] = useState('');
  const [description, setDescription] = useState('');

  // Cloudinary Attachment state for certificate document / PDF
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState('');
  const [isUploadingCloudinary, setIsUploadingCloudinary] = useState(false);

  // Filter & Viewer state
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCertPreview, setActiveCertPreview] = useState(null);

  const fileInputRef = useRef(null);

  const myCertificates = (certificates || []).filter(c => c?.studentId === currentUser?.id);

  const filteredCertificates = myCertificates.filter(c => {
    const matchesCat = selectedCategory === 'ALL' || c.category === selectedCategory;
    const matchesSearch = !searchTerm.trim() || 
      (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (c.issuer || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

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
      console.error('Cloudinary certificate upload error:', err);
    } finally {
      setIsUploadingCloudinary(false);
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!title || !issuer) return;

    const finalUrl = fileUrl || credentialUrl || 'https://example.com/credential-preview';

    uploadCertificate({
      studentId: currentUser?.id,
      studentName: currentUser?.name || 'Student',
      title,
      category,
      issuer,
      issueDate: issueDate || new Date().toISOString().split('T')[0],
      credentialUrl: finalUrl,
      fileUrl: finalUrl,
      fileName: fileName || `${title.replace(/\s+/g, '_')}_Certificate`,
      fileType: fileType || 'PDF',
      description
    });

    setIsUploading(false);
    setTitle('');
    setIssuer('');
    setCredentialUrl('');
    setFileName('');
    setFileUrl('');
    setFileType('');
    setDescription('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award color="var(--accent-purple)" size={24} />
            My Achievements & Certificate Locker {classroom ? `• ${classroom.name}` : ''}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Upload your certificates once. They will be visible <strong>only to instructors of classrooms in which you are enrolled</strong>.
          </p>
        </div>

        <button onClick={() => setIsUploading(!isUploading)} className="btn btn-primary" style={{ gap: '0.4rem' }}>
          <Plus size={16} /> {isUploading ? 'Close Form' : 'Upload Hackathon / Certificate'}
        </button>
      </div>

      {/* Upload Form Modal/Drawer */}
      {isUploading && (
        <div className="glass-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-highlight)' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Upload size={16} color="var(--accent-blue)" /> Hackathon & Achievement Details
          </h4>

          <form onSubmit={handleUpload}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Achievement / Hackathon Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Smart India Hackathon Winner 2026 or AWS Certified Developer"
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="Hackathon">🏆 Hackathon (Winner / Participant)</option>
                  <option value="Competition">🥇 Competition & Contest</option>
                  <option value="Workshop">💻 Workshop & Seminar</option>
                  <option value="Technical Certification">📜 Technical Certification (AWS/Google/Microsoft)</option>
                  <option value="Academic Distinction">⭐ Academic Distinction</option>
                  <option value="Extracurricular">🎯 Extracurricular Event</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Issuing Organization / Host</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Ministry of Education, IEEE, Google Cloud, VIT Pune"
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

            {/* Cloudinary File Upload Box */}
            <div className="form-group" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginBottom: '1rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <UploadCloud size={16} color="var(--accent-blue)" /> Certificate Document / PDF Upload (Cloudinary)
              </label>
              
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".pdf,.png,.jpg,.jpeg,.webp" 
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
                  <UploadCloud size={14} /> Upload Certificate File (PDF / Image)
                </button>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Optional Verification Link (URL)</label>
              <input 
                type="url" 
                className="form-input" 
                placeholder="https://credential.net/verify/12345 or https://hackathon.org/winners"
                value={credentialUrl} 
                onChange={e => setCredentialUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Brief Description of Achievement / Project</label>
              <textarea 
                className="form-textarea" 
                rows={3}
                placeholder="Describe your project, team ranking, key tech stack used, and hackathon accomplishments..."
                value={description} 
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={() => setIsUploading(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isUploadingCloudinary}>Save to Profile</button>
            </div>
          </form>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="glass-card" style={{ padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
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
            <option value="ALL">All Categories ({myCertificates.length})</option>
            <option value="Hackathon">🏆 Hackathons</option>
            <option value="Competition">🥇 Competitions</option>
            <option value="Workshop">💻 Workshops</option>
            <option value="Technical Certification">📜 Certifications</option>
            <option value="Academic Distinction">⭐ Academic</option>
            <option value="Extracurricular">🎯 Extracurricular</option>
          </select>
        </div>

        <div style={{ position: 'relative', width: '240px' }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search certificate title..."
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2rem', padding: '0.35rem 0.6rem 0.35rem 2rem', fontSize: '0.83rem' }}
          />
        </div>
      </div>

      {/* Certificates Cards Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {filteredCertificates.length === 0 ? (
          <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3.5rem 1rem' }}>
            <Award size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', display: 'block' }} />
            <h4 style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>No Certificates Found</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Click <strong>"Upload Hackathon / Certificate"</strong> above to record your achievements.</p>
          </div>
        ) : (
          filteredCertificates.map(cert => (
            <div key={cert.id} className="glass-card glass-card-interactive" style={{ background: 'var(--bg-secondary)', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span className="badge badge-purple" style={{ marginBottom: '0.4rem' }}>{cert.category}</span>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{cert.title}</h4>
                  </div>
                  <ShieldCheck color="var(--status-success)" size={22} title="Verified Cloudinary Credential" />
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.4' }}>
                  {cert.description || 'Verified student achievement document.'}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <span>Issuer: <strong>{cert.issuer}</strong></span>
                  <span>{cert.issueDate}</span>
                </div>

                <button 
                  onClick={() => setActiveCertPreview({ fileUrl: cert.fileUrl || cert.credentialUrl, fileName: cert.fileName || `${cert.title}_Certificate`, fileType: cert.fileType || 'PDF' })}
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
