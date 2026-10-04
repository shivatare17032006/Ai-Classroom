import React, { useState } from 'react';
import { Building2, Sparkles, CheckCircle2, Crown, Zap, ArrowRight, X } from 'lucide-react';

export const InstitutionalBenefitModal = ({ isOpen, onClose, activeLicense, onClaim }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !activeLicense) return null;

  const handleClaimBenefit = async () => {
    setLoading(true);
    try {
      await onClaim(activeLicense);
    } catch (e) {
      console.error('Error claiming institutional benefit:', e);
    } finally {
      setLoading(false);
    }
  };

  const instName = activeLicense.institutionName || 'Your Institution';
  const domain = (activeLicense.domainExtension || '').toLowerCase().replace('@', '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, backgroundColor: 'rgba(15, 23, 42, 0.82)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-card" style={{ maxWidth: '540px', width: '100%', borderRadius: 'var(--radius-xl)', padding: 0, overflow: 'hidden', border: '2px solid var(--accent-blue)', boxShadow: '0 20px 60px rgba(56, 189, 248, 0.25)', background: 'var(--bg-primary)' }}>
        
        {/* Glowing Banner Header */}
        <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 50%, #6366f1 100%)', padding: '1.75rem 1.5rem', color: '#ffffff', position: 'relative' }}>
          <button 
            onClick={onClose}
            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255, 255, 255, 0.18)', border: 'none', color: '#fff', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.2)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
            <Building2 size={14} /> Institutional Access Detected
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, color: '#ffffff', lineHeight: 1.2 }}>
            You Have Institute Access!
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.9)', marginTop: '0.35rem', marginBotton: 0 }}>
            Your university/college email domain <strong style={{ color: '#fff', textDecoration: 'underline' }}>@{domain}</strong> is linked to an active B2B Enterprise License.
          </p>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.75rem' }}>
          
          <div style={{ background: 'var(--bg-secondary)', padding: '1.1rem 1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '0.75rem', borderRadius: '12px', color: 'var(--accent-blue)', display: 'flex' }}>
              <Building2 size={30} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>
                Licensed Institution
              </span>
              <strong style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 800 }}>
                {instName}
              </strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--accent-blue)', display: 'block', fontWeight: 700 }}>
                Domain: @{domain} (Active Enterprise License)
              </span>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
              Included Enterprise Features:
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', fontSize: '0.82rem', color: 'var(--text-primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', background: 'var(--bg-tertiary)', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <CheckCircle2 size={16} color="var(--accent-blue)" />
                <strong>Spring AI Rubric Grading</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', background: 'var(--bg-tertiary)', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <CheckCircle2 size={16} color="var(--accent-blue)" />
                <strong>Plagiarism Integrity Scan</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', background: 'var(--bg-tertiary)', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <CheckCircle2 size={16} color="var(--accent-blue)" />
                <strong>Automated Parent Alerts</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', background: 'var(--bg-tertiary)', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <CheckCircle2 size={16} color="var(--accent-blue)" />
                <strong>Master Gradebook CSV Export</strong>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <button
              onClick={handleClaimBenefit}
              disabled={loading}
              className="btn btn-primary"
              style={{ 
                width: '100%', 
                padding: '0.95rem', 
                justify: 'center', 
                fontSize: '1rem', 
                fontWeight: 900, 
                gap: '0.6rem',
                background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                boxShadow: '0 8px 25px rgba(56, 189, 248, 0.35)'
              }}
            >
              <Zap size={18} /> {loading ? 'Activating Enterprise Benefits...' : 'Get Benefit (Activate Free Campus Access)'} <ArrowRight size={18} />
            </button>

            <button
              onClick={onClose}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '0.65rem', justifyContent: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}
            >
              Maybe Later
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
