import React, { useState } from 'react';
import { useClassroom } from '../../context/ClassroomContext';
import { useAuth } from '../../context/AuthContext';
import { EmailNotificationService } from '../../services/emailService';
import { SystemPerformanceView } from './SystemPerformanceView';
import { DocumentViewerModal } from '../Common/DocumentViewerModal';
import { 
  Shield, 
  Settings, 
  Sliders, 
  CheckCircle2, 
  Building2, 
  TrendingUp, 
  Ban, 
  Play, 
  Sparkles, 
  Globe, 
  Crown, 
  Cpu,
  FileCheck,
  Clock,
  AlertCircle,
  UserCheck,
  Mail,
  Zap,
  User,
  Activity,
  RotateCcw,
  Trash2
} from 'lucide-react';

export const AdminDashboard = () => {
  const { systemConfig, updateConfig, licenses, toggleLicense, approveLicense, rejectLicense, deleteLicense } = useClassroom();
  const { users } = useAuth();
  const [activeDocPreview, setActiveDocPreview] = useState(null);

  const handleApproveLicense = async (lic) => {
    await approveLicense(lic.id);
    if (lic.contactEmail) {
      EmailNotificationService.sendInstitutionalApprovalEmail(
        lic.contactEmail,
        lic.contactName || 'Faculty Manager',
        lic.institutionName,
        lic.domainExtension
      );
    }
  };

  // Tab State for Licensing List View
  const [activeLicTab, setActiveLicTab] = useState('INSTITUTIONAL'); // 'INSTITUTIONAL' or 'INDIVIDUAL'

  // Policy Settings State
  const [similarityDefault, setSimilarityDefault] = useState(systemConfig.globalDefaultSimilarityThreshold || 15);
  const [autoEmail, setAutoEmail] = useState(systemConfig.autoEmailParents ?? true);
  const [saved, setSaved] = useState(false);

  // Filter pending vs whitelisted/suspended/expired licenses
  const realLicenses = licenses || [];
  const pendingLicenses = realLicenses.filter(l => l.status === 'PENDING_VERIFICATION');
  const activeB2bLicenses = realLicenses.filter(l => l.status !== 'PENDING_VERIFICATION' && l.status !== 'REJECTED');

  // Individual Pro Teachers
  const teacherUsers = users.filter(u => u.role === 'TEACHER');
  const individualProTeachers = teacherUsers.filter(u => 
    u.planType === 'INDIVIDUAL_PRO' || u.isProUser === true || u.tier === 'PRO'
  );

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateConfig({
      ...systemConfig,
      globalDefaultSimilarityThreshold: Number(similarityDefault),
      autoEmailParents: autoEmail
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Revenue Calculations
  const b2bRevenueInr = activeB2bLicenses.reduce((sum, l) => sum + (l.priceInInr || 49999), 0);
  const individualRevenueInr = individualProTeachers.length * 4999;
  const totalARR = b2bRevenueInr + individualRevenueInr;
  const mrrInr = Math.round(totalARR / 12);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.12))', 
        padding: '1.75rem', 
        borderRadius: '16px',
        border: '1px solid var(--border-highlight)',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <Crown color="var(--accent-purple)" size={28} />
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              SaaS Business Management & Domain Licensing Hub
            </h2>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
            Institutional subscription metrics, B2B domain verification queue, and AI grading tier controls.
          </p>
        </div>

        <span className="badge badge-purple" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 800 }}>
          👑 Admin Verification Console
        </span>
      </div>

      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
        
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--status-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-success)', fontWeight: 800, fontSize: '1.3rem' }}>
            ₹
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Annual Revenue (ARR)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--status-success)' }}>
              ₹{totalARR.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              B2B + Pro Individual
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Est. MRR</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
              ₹{mrrInr.toLocaleString('en-IN')}/mo
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Monthly recurring run-rate
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-purple)' }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Verified B2B Campuses</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-purple)' }}>
              {activeB2bLicenses.length} Institutions
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Whitelisted campus domains
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--status-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-success)' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Pro Teachers</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--status-success)' }}>
              {individualProTeachers.length} Active
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Individual Pro Licenses
            </div>
          </div>
        </div>

      </div>

      {/* ENTERPRISE SYSTEM ARCHITECTURE & OBSERVABILITY (PROMINENTLY DISPLAYED) */}
      <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-indigo)', marginBottom: '1.75rem' }}>
        <SystemPerformanceView />
      </div>

      {/* PENDING INSTITUTIONAL B2B VERIFICATION QUEUE */}
      <div className="glass-card" style={{ borderLeft: '4px solid var(--status-warning)', background: 'linear-gradient(180deg, var(--status-warning-bg) 0%, transparent 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-warning)' }}>
              <Building2 size={22} /> B2B Domain License Verification Queue ({pendingLicenses.length})
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
              Review submitted institutional application details & document proof. Approving whitelists the domain extension automatically.
            </p>
          </div>
          {pendingLicenses.length > 0 && (
            <span className="badge badge-warning" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
              Action Required ({pendingLicenses.length})
            </span>
          )}
        </div>

        {pendingLicenses.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Institution Name</th>
                  <th>Domain Extension</th>
                  <th>Contact Person & Email</th>
                  <th>Submitted Document Proof</th>
                  <th>Approval Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingLicenses.map(lic => (
                  <tr key={lic.id}>
                    <td style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Building2 size={16} color="var(--accent-purple)" />
                        {lic.institutionName}
                      </div>
                    </td>
                    <td>
                      <code style={{ background: 'rgba(99, 102, 241, 0.12)', padding: '0.25rem 0.6rem', borderRadius: '6px', color: 'var(--accent-indigo)', fontWeight: 700 }}>
                        @{lic.domainExtension.replace('@', '')}
                      </code>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{lic.contactName || 'Faculty Manager'}</strong>
                      <span style={{ display: 'block', color: 'var(--text-muted)' }}>{lic.contactEmail || `contact@${lic.domainExtension.replace('@', '')}`}</span>
                    </td>
                    <td>
                      <button 
                        type="button"
                        onClick={() => setActiveDocPreview({
                          fileUrl: lic.proofDocumentUrl || '',
                          fileName: lic.proofDocumentName || 'Institutional_Proof.pdf',
                          fileType: 'pdf',
                          institutionName: lic.institutionName,
                          domainExtension: lic.domainExtension,
                          contactName: lic.contactName,
                          contactEmail: lic.contactEmail,
                          submittedAt: lic.createdAt ? new Date(lic.createdAt).toLocaleString() : new Date().toLocaleDateString()
                        })}
                        className="badge badge-info" 
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', cursor: 'pointer', border: 'none', padding: '0.45rem 0.85rem', fontWeight: 800 }}
                        title="Click to view submitted proof document"
                      >
                        <FileCheck size={14} /> 📄 {lic.proofDocumentName || 'Institutional_Proof.pdf'} (Click to View Proof)
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-sm btn-primary"
                          style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem', gap: '0.3rem', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', fontWeight: 700 }}
                          onClick={() => handleApproveLicense(lic)}
                        >
                          <CheckCircle2 size={14} /> Approve & Whitelist Domain (1 Year)
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', gap: '0.3rem' }}
                          onClick={() => rejectLicense(lic.id)}
                        >
                          <Ban size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: 'var(--status-warning-bg)', borderRadius: '12px', border: '1px dashed var(--status-warning)' }}>
            <AlertCircle size={32} color="var(--status-warning)" style={{ margin: '0 auto 0.5rem auto', display: 'block', opacity: 0.9 }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--status-warning)' }}>
              No Pending Verification Applications
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              When a university or college submits an institutional domain license request with proof document, it will appear here for Admin review and approval.
            </p>
          </div>
        )}
      </div>

      {/* ACTIVE LICENSES DIRECTORY WITH TABS */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <Shield color="var(--accent-indigo)" size={22} /> Software Licensing Purchases & Whitelist Directory
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
              Inspect active Institutional B2B Campus Domain Whitelists (1-Year Duration) and Individual Pro Teacher Purchases.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.3rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <button 
              className={`btn btn-sm ${activeLicTab === 'INSTITUTIONAL' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveLicTab('INSTITUTIONAL')}
              style={{ fontWeight: 800, padding: '0.45rem 1rem', gap: '0.4rem', border: 'none' }}
            >
              <Building2 size={16} /> Verified Institutional Campuses ({activeB2bLicenses.length})
            </button>
            <button 
              className={`btn btn-sm ${activeLicTab === 'INDIVIDUAL' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveLicTab('INDIVIDUAL')}
              style={{ fontWeight: 800, padding: '0.45rem 1rem', gap: '0.4rem', border: 'none' }}
            >
              <Crown size={16} /> Individual Pro Teachers ({individualProTeachers.length})
            </button>
            <button 
              className={`btn btn-sm ${activeLicTab === 'SYSTEM_METRICS' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveLicTab('SYSTEM_METRICS')}
              style={{ fontWeight: 800, padding: '0.45rem 1rem', gap: '0.4rem', border: 'none' }}
            >
              <Activity size={16} /> Architecture & System Observability
            </button>
          </div>
        </div>

        {/* TAB 1: INSTITUTIONAL B2B CAMPUS WHITELIST */}
        {activeLicTab === 'INSTITUTIONAL' && (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Institution Name</th>
                  <th>Domain Extension</th>
                  <th>Pricing Tier</th>
                  <th>1-Year Expiry Status</th>
                  <th>AI Services Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeB2bLicenses.map((lic) => {
                  const isActive = lic.status === 'ACTIVE';
                  const isExpired = lic.status === 'EXPIRED';

                  let expiryText = '1 Year (Active)';
                  if (lic.expiresAt) {
                    const daysLeft = Math.ceil((new Date(lic.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
                    expiryText = daysLeft > 0 ? `${daysLeft} Days Left (${new Date(lic.expiresAt).toLocaleDateString()})` : `Expired on ${new Date(lic.expiresAt).toLocaleDateString()}`;
                  }

                  return (
                    <tr key={lic.id || lic.domainExtension}>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Building2 size={16} color="var(--accent-purple)" />
                          {lic.institutionName}
                        </div>
                      </td>
                      <td>
                        <code style={{ 
                          background: 'rgba(99, 102, 241, 0.12)', 
                          padding: '0.2rem 0.5rem', 
                          borderRadius: '6px', 
                          color: 'var(--accent-indigo)',
                          fontWeight: 600 
                        }}>
                          @{lic.domainExtension.replace('@', '')}
                        </code>
                      </td>
                      <td>
                        <span className="badge badge-info">
                          INSTITUTION B2B
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>
                        {isExpired ? (
                          <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={12} /> Expiry: {expiryText}
                          </span>
                        ) : (
                          <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={12} /> {expiryText}
                          </span>
                        )}
                      </td>
                      <td>
                        {isActive ? (
                          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <CheckCircle2 size={12} /> AI Unlocked
                          </span>
                        ) : (
                          <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Ban size={12} /> {lic.status || 'Suspended'}
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          {isExpired ? (
                            <button 
                              className="btn btn-sm btn-primary"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}
                              onClick={() => handleApproveLicense(lic)}
                            >
                              <RotateCcw size={12} /> Renew 1 Year
                            </button>
                          ) : (
                            <button 
                              className={`btn ${isActive ? 'btn-danger' : 'btn-primary'}`}
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                              onClick={() => toggleLicense(lic.id)}
                            >
                              {isActive ? <><Ban size={12} /> Suspend</> : <><Play size={12} /> Activate</>}
                            </button>
                          )}
                          <button 
                            className="btn btn-sm btn-secondary"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.35)', background: 'rgba(244, 63, 94, 0.08)' }}
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to permanently remove/delete the institutional license for "${lic.institutionName}" (@${lic.domainExtension})?`)) {
                                deleteLicense(lic.id);
                              }
                            }}
                            title="Permanently delete institutional license"
                          >
                            <Trash2 size={12} /> Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {activeB2bLicenses.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      <Building2 size={32} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem auto', display: 'block', opacity: 0.5 }} />
                      No active institutional domain licenses whitelisted yet.<br />
                      Applications approved from the verification queue above will automatically appear here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: INDIVIDUAL PRO TEACHER PURCHASES LIST */}
        {activeLicTab === 'INDIVIDUAL' && (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Educator / Teacher Name</th>
                  <th>Teacher Email</th>
                  <th>Purchased License Plan</th>
                  <th>Annual / Monthly Rate</th>
                  <th>Payment & Approval Status</th>
                  <th>AI Services</th>
                </tr>
              </thead>
              <tbody>
                {individualProTeachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={16} color="var(--accent-indigo)" />
                        {teacher.name}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{teacher.email}</span>
                    </td>
                    <td>
                      <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Crown size={12} /> INDIVIDUAL PRO TEACHER
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--status-success)' }}>
                      ₹4,999/yr (or ₹499/mo)
                    </td>
                    <td>
                      <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle2 size={12} /> Active Approved (Auto-Approved)
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Zap size={12} /> Unlimited AI Unlocked
                      </span>
                    </td>
                  </tr>
                ))}
                {individualProTeachers.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      <Crown size={32} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem auto', display: 'block', opacity: 0.5 }} />
                      No individual pro teacher licenses purchased yet.<br />
                      When an educator purchases an individual license (Option 1), their subscription will automatically appear here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: SYSTEM ARCHITECTURE & PERFORMANCE OBSERVABILITY */}
        {activeLicTab === 'SYSTEM_METRICS' && (
          <SystemPerformanceView />
        )}

      </div>

      {/* Subscription Pricing Tiers Showcase (2 Official Options Approach) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <Sparkles color="var(--accent-purple)" size={20} /> SaaS Monetization & Licensing Tiers (2 Official Options)
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
              The platform operates strictly on 2 licensing modes: Individual Pro Teacher and Institutional Campus B2B.
            </p>
          </div>
          <span className="badge badge-purple" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>
            2-Option Licensing Model
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          
          {/* OPTION 1: INDIVIDUAL PRO TEACHER */}
          <div className="glass-card" style={{ borderTop: '4px solid var(--accent-indigo)', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-indigo)', letterSpacing: '0.05em' }}>
                  OPTION 1: INDIVIDUAL TEACHER
                </span>
                <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>INSTANT ACCESS</span>
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.4rem 0', color: 'var(--text-primary)' }}>
                Individual Pro Teacher License
              </h4>
              <div style={{ fontSize: '2rem', fontWeight: 800, margin: '0.4rem 0', color: 'var(--accent-indigo)' }}>
                ₹499 <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/ month (or ₹4,999/yr)</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Purchased by individual educators for immediate software unlock & AI grading access.
              </p>
              <hr style={{ borderColor: 'var(--border-color)', margin: '1rem 0' }} />
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                <li><strong style={{ color: 'var(--text-primary)' }}>Instant automatic approval</strong> upon login & payment</li>
                <li>Unlimited Spring AI rubric evaluation & code grading</li>
                <li>Multi-algorithm plagiarism & similarity detection</li>
                <li>Automated parent email alerts & gradebook exports</li>
                <li>Individual student deadline extensions</li>
              </ul>
            </div>
            <div style={{ marginTop: '1.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Active Pro Teachers: <strong style={{ color: 'var(--text-primary)' }}>{individualProTeachers.length} Active</strong>
            </div>
          </div>

          {/* OPTION 2: INSTITUTIONAL B2B CAMPUS */}
          <div className="glass-card" style={{ borderTop: '4px solid var(--accent-purple)', background: 'linear-gradient(180deg, rgba(168, 85, 247, 0.06), transparent)', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-purple)', letterSpacing: '0.05em' }}>
                  OPTION 2: INSTITUTIONAL B2B
                </span>
                <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>DOMAIN WHITELIST</span>
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.4rem 0', color: 'var(--text-primary)' }}>
                Institutional Campus License
              </h4>
              <div style={{ fontSize: '2rem', fontWeight: 800, margin: '0.4rem 0', color: 'var(--accent-purple)' }}>
                ₹49,999 <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/ year per campus</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                For universities and colleges. Auto-unlocks all faculty matching the verified campus domain extension.
              </p>
              <hr style={{ borderColor: 'var(--border-color)', margin: '1rem 0' }} />
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                <li><strong style={{ color: 'var(--text-primary)' }}>Whole-campus `@domain.edu` auto-unlock</strong> for all faculty</li>
                <li>Document proof upload & Admin verification queue</li>
                <li>Unlimited Gemini 3.5 Pro AI Grading Tokens</li>
                <li>Parent Guardian notification engine & custom SLA</li>
                <li>Site-wide academic integrity compliance report</li>
              </ul>
            </div>
            <div style={{ marginTop: '1.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Verified B2B Campuses: <strong style={{ color: 'var(--text-primary)' }}>{activeB2bLicenses.length} Whitelisted</strong>
            </div>
          </div>

        </div>
      </div>

      {/* Global AI Policy Configuration Card */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
          <Settings size={18} color="var(--accent-blue)" /> Academic Integrity & AI Policy Controls
        </h3>

        {saved && (
          <div className="badge badge-success" style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', textTransform: 'none', justifyContent: 'center' }}>
            <CheckCircle2 size={14} /> System Policy Saved!
          </div>
        )}

        <form onSubmit={handleSaveSettings}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sliders size={14} color="var(--status-warning)" /> Default Similarity Threshold (%)
              </label>
              <input 
                type="number" 
                className="form-input" 
                value={similarityDefault} 
                onChange={e => setSimilarityDefault(e.target.value)}
                min="0"
                max="100"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Applied as initial default for similarity detection.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">AI Grading Model Allocation</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.8rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                <Cpu size={16} color="var(--accent-purple)" />
                {systemConfig.aiModelProvider || 'Gemini 3.5 Pro Enterprise Engine'}
              </div>
            </div>

          </div>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
            <input 
              type="checkbox" 
              id="autoEmail"
              checked={autoEmail} 
              onChange={e => setAutoEmail(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="autoEmail" className="form-label" style={{ margin: 0, cursor: 'pointer', color: 'var(--text-primary)' }}>
              Automated Parent Email Alerts (Low Score & Missed Work)
            </label>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Save Policy Changes
          </button>
        </form>
      </div>

      {/* Proof Document Viewer Modal */}
      {activeDocPreview && (
        <DocumentViewerModal
          fileUrl={activeDocPreview.fileUrl}
          fileName={activeDocPreview.fileName}
          fileType={activeDocPreview.fileType}
          docData={activeDocPreview}
          isOpen={!!activeDocPreview}
          onClose={() => setActiveDocPreview(null)}
        />
      )}
    </div>
  );
};
