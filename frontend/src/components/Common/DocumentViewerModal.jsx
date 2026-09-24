import React, { useState } from 'react';
import { 
  X, 
  Download, 
  ExternalLink, 
  FileText, 
  FileCode, 
  Image as ImageIcon, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Cloud, 
  CheckCircle2,
  Eye,
  AlertCircle
} from 'lucide-react';

export const DocumentViewerModal = ({ fileUrl, fileName, fileType, isOpen, onClose }) => {
  const [zoom, setZoom] = useState(100);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  if (!isOpen || (!fileUrl && !fileName)) return null;

  const isCloudinary = fileUrl && fileUrl.includes('cloudinary.com');
  const lowerUrl = (fileUrl || '').toLowerCase();
  const lowerName = (fileName || '').toLowerCase();

  const isPdf = fileType === 'PDF' || lowerName.endsWith('.pdf') || lowerUrl.includes('.pdf') || lowerUrl.startsWith('data:application/pdf');
  const isImage = fileType === 'IMAGE' || /\.(png|jpe?g|webp|gif|svg)$/i.test(lowerName) || lowerUrl.startsWith('data:image/');
  const isOfficeDoc = /\.(docx?|pptx?|xlsx?)$/i.test(lowerName) || fileType === 'DOCX' || fileType === 'PPTX';

  const googleDocsViewerUrl = fileUrl && !fileUrl.startsWith('data:') 
    ? `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true` 
    : null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '920px', 
          width: '95%', 
          maxHeight: '90vh', 
          display: 'flex', 
          flexDirection: 'column',
          padding: '1.25rem',
          gap: '1rem'
        }}
      >
        {/* Header */}
        <div className="modal-header" style={{ marginBottom: 0 }}>
          <div className="modal-title" style={{ gap: '0.6rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isPdf ? <FileText size={18} /> : isImage ? <ImageIcon size={18} /> : <FileCode size={18} />}
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>{fileName || 'Document Viewer'}</span>
                {isCloudinary && (
                  <span className="badge badge-info" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem', gap: '0.2rem' }}>
                    <Cloud size={10} /> Cloudinary Hosted
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {isPdf ? 'Portable Document Format (PDF)' : isOfficeDoc ? 'Microsoft Office Document' : isImage ? 'Image Media Preview' : 'Document File'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {fileUrl && (
              <a 
                href={fileUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-sm btn-secondary" 
                title="Open original Cloudinary media URL in new tab"
                style={{ gap: '0.3rem', fontSize: '0.78rem' }}
              >
                <ExternalLink size={13} /> Cloudinary Direct <Cloud size={11} />
              </a>
            )}
            {fileUrl && (
              <a 
                href={fileUrl} 
                download={fileName || 'document'} 
                className="btn btn-sm btn-primary" 
                title="Download file to computer"
                style={{ gap: '0.3rem', fontSize: '0.78rem' }}
              >
                <Download size={13} /> Download
              </a>
            )}
            <button onClick={onClose} className="btn btn-secondary btn-icon"><X size={18} /></button>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', padding: '0.5rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
            <Eye size={14} color="var(--accent-blue)" /> 
            <span>Cloudinary High-Resolution Document Reader</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button onClick={handleZoomOut} className="btn btn-sm btn-secondary btn-icon" title="Zoom Out"><ZoomOut size={13} /></button>
            <span style={{ fontSize: '0.75rem', minWidth: '42px', textAlign: 'center', fontWeight: 700 }}>{zoom}%</span>
            <button onClick={handleZoomIn} className="btn btn-sm btn-secondary btn-icon" title="Zoom In"><ZoomIn size={13} /></button>
            <button onClick={() => setZoom(100)} className="btn btn-sm btn-secondary" style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }} title="Reset Zoom"><Maximize2 size={11} /> Reset</button>
          </div>
        </div>

        {/* Document Render Viewport Container */}
        <div 
          style={{ 
            flex: 1, 
            minHeight: '480px', 
            background: '#1e293b', 
            borderRadius: 'var(--radius-md)', 
            overflow: 'auto', 
            position: 'relative', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            border: '1px solid var(--border-color)'
          }}
        >
          {isImage ? (
            <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
              <img 
                src={fileUrl} 
                alt={fileName || 'Attached Image'} 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '480px', 
                  objectFit: 'contain', 
                  borderRadius: 'var(--radius-sm)',
                  transform: `scale(${zoom / 100})`,
                  transition: 'transform 0.2s ease'
                }} 
              />
            </div>
          ) : isPdf ? (
            fileUrl.startsWith('data:') ? (
              <iframe 
                src={fileUrl} 
                title={fileName || 'PDF Document Viewer'}
                width="100%" 
                height="500px" 
                style={{ border: 'none', background: '#fff', transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
              />
            ) : (
              <iframe 
                src={googleDocsViewerUrl || fileUrl} 
                title={fileName || 'Cloudinary PDF Viewer'}
                width="100%" 
                height="500px" 
                style={{ border: 'none', background: '#fff', transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
              />
            )
          ) : isOfficeDoc && googleDocsViewerUrl ? (
            <iframe 
              src={googleDocsViewerUrl} 
              title={fileName || 'Microsoft Office Viewer'}
              width="100%" 
              height="500px" 
              style={{ border: 'none', background: '#fff', transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            />
          ) : fileUrl ? (
            <iframe 
              src={fileUrl} 
              title={fileName || 'Document Viewer'}
              width="100%" 
              height="500px" 
              style={{ border: 'none', background: '#fff', transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            />
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
              <AlertCircle size={36} color="var(--status-danger)" style={{ marginBottom: '0.5rem' }} />
              <p>Unable to preview document directly. Click <strong>Download</strong> or <strong>Cloudinary Direct</strong> above to view.</p>
            </div>
          )}
        </div>

        {/* Footer Info Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={12} color="#10b981" /> Verified Cloudinary Media Link
          </div>
          <button onClick={onClose} className="btn btn-sm btn-secondary">Close Viewer</button>
        </div>

      </div>
    </div>
  );
};
