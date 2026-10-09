import React, { useState, useMemo } from 'react';
import { useClassroom } from '../../context/ClassroomContext';
import { useAuth } from '../../context/AuthContext';
import { EmailNotificationService } from '../../services/emailService';
import { SystemPerformanceView } from './SystemPerformanceView';
import { DocumentViewerModal } from '../Common/DocumentViewerModal';
import { OfficialTaxInvoiceModal } from '../Common/OfficialTaxInvoiceModal';
import { UserAvatar } from '../Common/UserAvatar';
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
  Trash2,
  Eye,
  Download,
  Search,
  DollarSign,
  GraduationCap,
  Layers,
  Users,
  Check,
  BookOpen,
  ChevronRight,
  Server,
  FileText,
  Filter,
  ArrowUpRight,
  RefreshCw,
  QrCode
} from 'lucide-react';

export const AdminDashboard = () => {
  const { systemConfig, updateConfig, licenses, toggleLicense, approveLicense, rejectLicense, deleteLicense, classrooms } = useClassroom();
  const { users } = useAuth();
  
  // 5 Dedicated Admin Workspaces
  // 'APPROVALS' | 'INSTITUTIONS' | 'ACTIVE_TEACHERS' | 'FINANCIALS' | 'SYSTEM_HEALTH'
  const [activeTab, setActiveTab] = useState('APPROVALS');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [institutionFilter, setInstitutionFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED'
  const [activeDocPreview, setActiveDocPreview] = useState(null);
  const [activeInvoicePreview, setActiveInvoicePreview] = useState(null);

  // Policy Settings State
  const [similarityDefault, setSimilarityDefault] = useState(systemConfig.globalDefaultSimilarityThreshold || 15);
  const [autoEmail, setAutoEmail] = useState(systemConfig.autoEmailParents ?? true);
  const [savedPolicy, setSavedPolicy] = useState(false);

  // Filter licenses
  const realLicenses = licenses || [];
  const pendingLicenses = realLicenses.filter(l => l.status && l.status.toUpperCase() === 'PENDING_VERIFICATION');
  const activeB2bLicenses = realLicenses.filter(l => l.status && (l.status.toUpperCase() === 'ACTIVE' || l.status.toUpperCase() === 'SUSPENDED' || l.status.toUpperCase() === 'EXPIRED'));

  // Teachers directory
  const teacherUsers = (users || []).filter(u => u.role === 'TEACHER');
  
  const individualProTeachers = teacherUsers.filter(u => 
    u.planType === 'INDIVIDUAL_PRO' || u.isProUser === true || u.tier === 'PRO'
  );

  // Revenue & Profit Calculations (Executive Level)
  const b2bRevenueInr = activeB2bLicenses.reduce((sum, l) => sum + (l.priceInInr || 49999), 0);
  const individualRevenueInr = individualProTeachers.length * 4999;
  const totalARR = b2bRevenueInr + individualRevenueInr;
  const mrrInr = Math.round(totalARR / 12);
  const totalGstCollected = Math.round(totalARR * 0.18);
  const grossProfitInr = Math.round(totalARR * 0.82); // Net after infrastructure & payment gateway (82% margin)

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

  const handleSavePolicySettings = (e) => {
    e.preventDefault();
    updateConfig({
      ...systemConfig,
      globalDefaultSimilarityThreshold: Number(similarityDefault),
      autoEmailParents: autoEmail
    });
    setSavedPolicy(true);
    setTimeout(() => setSavedPolicy(false), 2500);
  };

  const handleExportCSV = () => {
    const rows = [
      ['Transaction_ID', 'Date', 'Type', 'Entity_Name', 'Domain', 'Amount_INR', 'Tax_GST_INR', 'Status'],
      ...activeB2bLicenses.map(l => [
        `TXN-B2B-${l.id}`,
        l.createdAt ? new Date(l.createdAt).toLocaleDateString() : '2026-10-01',
        'B2B_CAMPUS_LICENSE',
        `"${l.institutionName}"`,
        l.domainExtension,
        l.priceInInr || 49999,
        Math.round((l.priceInInr || 49999) * 0.18),
        l.status
      ]),
      ...individualProTeachers.map(t => [
        `TXN-PRO-${t.id}`,
        '2026-10-01',
        'INDIVIDUAL_PRO_FACULTY',
        `"${t.name}"`,
        (t.email || '').split('@')[1] || 'domain.edu',
        4999,
        Math.round(4999 * 0.18),
        'ACTIVE'
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AICLASSROOM_FINANCIAL_LEDGER_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered lists for search bars
  const filteredInstitutions = useMemo(() => {
    let list = activeB2bLicenses;
    if (institutionFilter !== 'ALL') {
      list = list.filter(lic => lic.status && lic.status.toUpperCase() === institutionFilter);
    }
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(lic => 
      (lic.institutionName && lic.institutionName.toLowerCase().includes(term)) ||
      (lic.domainExtension && lic.domainExtension.toLowerCase().includes(term)) ||
      (lic.contactName && lic.contactName.toLowerCase().includes(term))
    );
  }, [activeB2bLicenses, searchTerm, institutionFilter]);

  const filteredTeachers = useMemo(() => {
    if (!searchTerm.trim()) return teacherUsers;
    const term = searchTerm.toLowerCase();
    return teacherUsers.filter(t => 
      (t.name && t.name.toLowerCase().includes(term)) ||
      (t.email && t.email.toLowerCase().includes(term)) ||
      (t.planType && t.planType.toLowerCase().includes(term))
    );
  }, [teacherUsers, searchTerm]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* ==================================================================== */}
      {/* EXECUTIVE SAAS OPERATIONS COCKPIT BANNER                             */}
      {/* ==================================================================== */}
      <div style={{ 
        background: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)', 
        padding: '2rem 2.25rem', 
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
        boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative glow */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '220px', height: '220px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '16px', 
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)'
          }}>
            <Crown size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: 0, color: '#ffffff', letterSpacing: '-0.02em' }}>
                Enterprise Operations Command
              </h1>
              <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.25)', color: '#c7d2fe', border: '1px solid rgba(99, 102, 241, 0.5)', fontSize: '0.72rem', fontWeight: 800 }}>
                TIER-1 SUPERADMIN
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.35rem', flexWrap: 'wrap', fontSize: '0.82rem', color: '#94a3b8' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontWeight: 700 }}>
                <span className="radar-pulse-dot" /> AWS ap-south-1 Cluster Active
              </span>
              <span>•</span>
              <span>PostgreSQL 16 High-Availability</span>
              <span>•</span>
              <span>Spring Boot 3.3.4 Enterprise Service</span>
            </div>
          </div>
        </div>

        {/* Global Action Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <button 
            type="button"
            onClick={handleExportCSV}
            className="btn btn-secondary"
            style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#f8fafc', borderColor: 'rgba(255, 255, 255, 0.2)', fontSize: '0.82rem', gap: '0.45rem', fontWeight: 700 }}
          >
            <Download size={14} /> Export Financial CSV
          </button>

          <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '0.55rem 1rem', borderRadius: '12px', fontSize: '0.85rem', color: '#fbbf24', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Clock size={15} /> Pending Approvals: <strong>{pendingLicenses.length}</strong>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* EXECUTIVE KPI COCKPIT (Top 4 Metrics Grid with Trends)               */}
      {/* ==================================================================== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        
        {/* KPI 1: ARR */}
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Annual Recurring Revenue (ARR)
            </span>
            <span className="badge badge-success" style={{ fontSize: '0.68rem', fontWeight: 800, gap: '0.2rem' }}>
              <ArrowUpRight size={12} /> +24.8% MoM
            </span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
            ₹{totalARR.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Gross contracted SaaS subscription volume
          </div>
        </div>

        {/* KPI 2: MRR */}
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-blue)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Monthly Run Rate (MRR)
            </span>
            <span className="badge badge-info" style={{ fontSize: '0.68rem', fontWeight: 800 }}>
              Normalized
            </span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>
            ₹{mrrInr.toLocaleString('en-IN')}<span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>/mo</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Smooth monthly recurring cash flow
          </div>
        </div>

        {/* KPI 3: B2B Campuses */}
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-purple)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Institutional Campuses
            </span>
            <span className="badge badge-purple" style={{ fontSize: '0.68rem', fontWeight: 800 }}>
              Enterprise
            </span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--accent-purple)' }}>
            {activeB2bLicenses.length} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Whitelisted Domains</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            ₹{b2bRevenueInr.toLocaleString('en-IN')} Total B2B ARR
          </div>
        </div>

        {/* KPI 4: Active Faculty */}
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #ec4899', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Faculty Educator Accounts
            </span>
            <span className="badge badge-purple" style={{ fontSize: '0.68rem', fontWeight: 800 }}>
              {individualProTeachers.length} Pro
            </span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ec4899' }}>
            {teacherUsers.length} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Active Teachers</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            ₹{individualRevenueInr.toLocaleString('en-IN')} Individual Pro ARR
          </div>
        </div>

      </div>

      {/* ==================================================================== */}
      {/* 5 DEDICATED ADMIN WORKSPACE NAVIGATION TABS                          */}
      {/* ==================================================================== */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        background: 'var(--bg-secondary)', 
        padding: '0.45rem', 
        borderRadius: '16px', 
        border: '1px solid var(--border-color)',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={() => { setActiveTab('APPROVALS'); setSearchTerm(''); }}
          className={`btn ${activeTab === 'APPROVALS' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1, minWidth: '210px', fontWeight: 800, padding: '0.8rem 1.15rem', gap: '0.55rem', fontSize: '0.9rem', justifyContent: 'center' }}
        >
          <Building2 size={17} /> 
          License Approvals
          {pendingLicenses.length > 0 && (
            <span className="badge" style={{ background: '#f59e0b', color: '#000', fontSize: '0.72rem', padding: '0.15rem 0.55rem', fontWeight: 900, borderRadius: '12px' }}>
              {pendingLicenses.length}
            </span>
          )}
        </button>

        <button 
          onClick={() => { setActiveTab('INSTITUTIONS'); setSearchTerm(''); }}
          className={`btn ${activeTab === 'INSTITUTIONS' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1, minWidth: '190px', fontWeight: 800, padding: '0.8rem 1.15rem', gap: '0.55rem', fontSize: '0.9rem', justifyContent: 'center' }}
        >
          <Globe size={17} /> 
          Institutions Directory ({activeB2bLicenses.length})
        </button>

        <button 
          onClick={() => { setActiveTab('ACTIVE_TEACHERS'); setSearchTerm(''); }}
          className={`btn ${activeTab === 'ACTIVE_TEACHERS' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1, minWidth: '190px', fontWeight: 800, padding: '0.8rem 1.15rem', gap: '0.55rem', fontSize: '0.9rem', justifyContent: 'center' }}
        >
          <Users size={17} /> 
          Active Faculty ({teacherUsers.length})
        </button>

        <button 
          onClick={() => { setActiveTab('FINANCIALS'); setSearchTerm(''); }}
          className={`btn ${activeTab === 'FINANCIALS' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1, minWidth: '180px', fontWeight: 800, padding: '0.8rem 1.15rem', gap: '0.55rem', fontSize: '0.9rem', justifyContent: 'center' }}
        >
          <DollarSign size={17} /> 
          Profit & Revenue Analytics
        </button>

        <button 
          onClick={() => { setActiveTab('SYSTEM_HEALTH'); setSearchTerm(''); }}
          className={`btn ${activeTab === 'SYSTEM_HEALTH' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1, minWidth: '180px', fontWeight: 800, padding: '0.8rem 1.15rem', gap: '0.55rem', fontSize: '0.9rem', justifyContent: 'center' }}
        >
          <Activity size={17} /> 
          Cluster Health & Policies
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INSTITUTION LICENSE APPROVALS (PENDING PROOF VERIFICATION QUEUE)   */}
      {/* ========================================================================= */}
      {activeTab === 'APPROVALS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-card" style={{ borderLeft: '4px solid #f59e0b', background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.05) 0%, transparent 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b' }}>
                  <Building2 size={24} /> Institutional B2B Verification Queue ({pendingLicenses.length})
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                  Incoming campus applications awaiting compliance review. Click to inspect the uploaded letterhead / ownership document, then approve to whitelist the campus domain for 1 year.
                </p>
              </div>

              {pendingLicenses.length > 0 && (
                <span className="badge badge-warning" style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem', fontWeight: 800 }}>
                  <AlertCircle size={14} /> Action Required ({pendingLicenses.length} Pending)
                </span>
              )}
            </div>

            {pendingLicenses.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingLicenses.map(lic => (
                  <div 
                    key={lic.id} 
                    style={{ 
                      background: 'var(--bg-secondary)', 
                      borderRadius: '16px', 
                      padding: '1.5rem', 
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1.25rem',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    {/* Left: Campus Avatar & Submitter Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <div style={{ 
                        width: '54px', 
                        height: '54px', 
                        borderRadius: '14px', 
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
                        color: '#fff', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '1.25rem',
                        boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)'
                      }}>
                        {lic.institutionName ? lic.institutionName.slice(0, 2).toUpperCase() : 'UI'}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <h4 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, color: 'var(--text-primary)' }}>
                            {lic.institutionName}
                          </h4>
                          <code style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-indigo)', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.82rem' }}>
                            @{lic.domainExtension ? lic.domainExtension.replace('@', '') : 'campus.edu'}
                          </code>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          Authorized Contact: <strong style={{ color: 'var(--text-primary)' }}>{lic.contactName || 'Faculty Dean'}</strong> ({lic.contactEmail || 'dean@campus.edu'})
                        </div>
                      </div>
                    </div>

                    {/* Middle: Verification Audit Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Contract Fee</span>
                        <strong style={{ fontSize: '1.05rem', color: 'var(--status-success)', fontFamily: 'var(--font-mono)' }}>
                          ₹{(lic.priceInInr || 49999).toLocaleString('en-IN')}/yr
                        </strong>
                      </div>

                      {/* Clickable Proof Document Viewer Button */}
                      <button 
                        type="button"
                        onClick={() => setActiveDocPreview({
                          id: lic.id,
                          licenseObj: lic,
                          fileUrl: lic.proofDocumentUrl || '',
                          fileName: lic.proofDocumentName || 'Campus_Authorization_Proof.pdf',
                          fileType: 'pdf',
                          docData: {
                            institutionName: lic.institutionName,
                            domainExtension: lic.domainExtension,
                            contactName: lic.contactName,
                            contactEmail: lic.contactEmail,
                            fileName: lic.proofDocumentName || 'Campus_Authorization_Proof.pdf',
                            submittedAt: lic.createdAt ? new Date(lic.createdAt).toLocaleString() : new Date().toLocaleDateString()
                          }
                        })}
                        className="btn btn-sm btn-secondary"
                        style={{ 
                          padding: '0.55rem 1rem', 
                          fontWeight: 800, 
                          color: 'var(--accent-blue)', 
                          borderColor: 'rgba(59, 130, 246, 0.4)', 
                          background: 'rgba(59, 130, 246, 0.08)',
                          gap: '0.45rem'
                        }}
                        title="Inspect uploaded letterhead proof"
                      >
                        <Eye size={15} /> 📄 {lic.proofDocumentName || 'View Proof Doc'}
                      </button>
                    </div>

                    {/* Right: Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-primary"
                        style={{ fontSize: '0.85rem', padding: '0.6rem 1.15rem', gap: '0.4rem', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', fontWeight: 900 }}
                        onClick={() => handleApproveLicense(lic)}
                      >
                        <CheckCircle2 size={16} /> Approve & Whitelist
                      </button>
                      <button 
                        className="btn btn-danger"
                        style={{ fontSize: '0.85rem', padding: '0.6rem 0.95rem', gap: '0.35rem', fontWeight: 800 }}
                        onClick={() => rejectLicense(lic.id)}
                      >
                        <Ban size={15} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: 'rgba(245, 158, 11, 0.04)', borderRadius: '16px', border: '1px dashed rgba(245, 158, 11, 0.3)' }}>
                <CheckCircle2 size={46} color="#10b981" style={{ margin: '0 auto 0.75rem auto', display: 'block' }} />
                <h4 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '0 0 0.35rem 0', color: 'var(--text-primary)' }}>
                  All License Requests Up to Date!
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '520px', marginInline: 'auto' }}>
                  There are zero pending applications waiting in the queue. When an educator or institution submits campus registration proof, it will appear here instantly for verification.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: REGISTERED INSTITUTIONS DIRECTORY (ACTIVE/SUSPENDED/EXPIRED)       */}
      {/* ========================================================================= */}
      {activeTab === 'INSTITUTIONS' && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Globe size={22} color="var(--accent-purple)" /> Registered Institutions Directory ({activeB2bLicenses.length})
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                Active campus domain whitelists. Any educator signing up with these email domains receives automated software unlock.
              </p>
            </div>

            {/* Filter Pills & Search */}
            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-secondary)', padding: '0.25rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                {['ALL', 'ACTIVE', 'SUSPENDED'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setInstitutionFilter(f)}
                    className={`btn btn-sm ${institutionFilter === f ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', fontWeight: 700 }}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div style={{ position: 'relative', minWidth: '260px' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search institution or domain..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '2.4rem', fontSize: '0.85rem' }}
                />
                <Search size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Institution Campus</th>
                  <th>Domain Extension</th>
                  <th>Contract Rate</th>
                  <th>1-Year Validity</th>
                  <th>AI Services</th>
                  <th>Proof Document</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInstitutions.map((lic) => {
                  const isActive = lic.status === 'ACTIVE';
                  const isExpired = lic.status === 'EXPIRED';

                  let expiryText = '1 Year (Active)';
                  if (lic.expiresAt) {
                    const daysLeft = Math.ceil((new Date(lic.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
                    expiryText = daysLeft > 0 ? `${daysLeft} Days Left` : `Expired`;
                  }

                  return (
                    <tr key={lic.id || lic.domainExtension}>
                      <td style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                            {lic.institutionName ? lic.institutionName.slice(0, 2).toUpperCase() : 'UI'}
                          </div>
                          <div>
                            <span style={{ fontSize: '0.92rem', display: 'block' }}>{lic.institutionName}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Rep: {lic.contactName || 'Faculty Dean'}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <code style={{ background: 'rgba(99, 102, 241, 0.12)', padding: '0.25rem 0.6rem', borderRadius: '6px', color: 'var(--accent-indigo)', fontWeight: 800 }}>
                          @{lic.domainExtension ? lic.domainExtension.replace('@', '') : 'domain.edu'}
                        </code>
                      </td>

                      <td>
                        <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--status-success)' }}>
                          ₹{(lic.priceInInr || 49999).toLocaleString('en-IN')}/yr
                        </strong>
                      </td>

                      <td style={{ fontSize: '0.82rem' }}>
                        <span className={`badge ${isExpired ? 'badge-danger' : 'badge-purple'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Clock size={12} /> {expiryText}
                        </span>
                      </td>

                      <td>
                        {isActive ? (
                          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <CheckCircle2 size={12} /> Whitelisted
                          </span>
                        ) : (
                          <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Ban size={12} /> Suspended
                          </span>
                        )}
                      </td>

                      {/* Clickable Proof Document button */}
                      <td>
                        {lic.proofDocumentName ? (
                          <button 
                            type="button"
                            onClick={() => setActiveDocPreview({
                              id: lic.id,
                              licenseObj: lic,
                              fileUrl: lic.proofDocumentUrl || '',
                              fileName: lic.proofDocumentName || 'Proof.pdf',
                              fileType: 'pdf',
                              docData: {
                                institutionName: lic.institutionName,
                                domainExtension: lic.domainExtension,
                                contactName: lic.contactName,
                                contactEmail: lic.contactEmail,
                                fileName: lic.proofDocumentName,
                                submittedAt: lic.approvedAt ? new Date(lic.approvedAt).toLocaleDateString() : 'Active'
                              }
                            })}
                            className="btn btn-sm btn-secondary"
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', gap: '0.3rem' }}
                            title="Inspect submitted proof document"
                          >
                            <Eye size={13} /> View Proof
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified Direct</span>
                        )}
                      </td>

                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <button 
                            className={`btn btn-sm ${isActive ? 'btn-danger' : 'btn-primary'}`}
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', gap: '0.3rem' }}
                            onClick={() => toggleLicense(lic.id)}
                          >
                            {isActive ? <><Ban size={12} /> Suspend</> : <><Play size={12} /> Activate</>}
                          </button>
                          <button 
                            className="btn btn-sm btn-secondary"
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.35)' }}
                            onClick={() => {
                              if (window.confirm(`Permanently remove institutional license for "${lic.institutionName}" (@${lic.domainExtension})?`)) {
                                deleteLicense(lic.id);
                              }
                            }}
                            title="Delete institutional license"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredInstitutions.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      <Building2 size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem auto', display: 'block', opacity: 0.5 }} />
                      No registered campus licenses matching current query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ACTIVE TEACHERS & FACULTY DIRECTORY                                */}
      {/* ========================================================================= */}
      {activeTab === 'ACTIVE_TEACHERS' && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={22} color="var(--accent-indigo)" /> Active Faculty Directory ({teacherUsers.length})
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                All faculty active on the platform, their classroom footprints, student enrollments, and real-time AI quota states.
              </p>
            </div>

            <div style={{ position: 'relative', minWidth: '280px' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Search teacher by name or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.4rem', fontSize: '0.85rem' }}
              />
              <Search size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Educator / Teacher</th>
                  <th>Institutional Email</th>
                  <th>Active Classrooms</th>
                  <th>Students Taught</th>
                  <th>License Tier</th>
                  <th>AI Grading Engine</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map((teacher) => {
                  const teacherEmailDomain = (teacher.email || '').split('@')[1]?.toLowerCase() || '';
                  const matchingInst = activeB2bLicenses.find(l => 
                    l.domainExtension && l.domainExtension.toLowerCase().replace('@', '') === teacherEmailDomain && l.status === 'ACTIVE'
                  );

                  const isIndividualPro = teacher.planType === 'INDIVIDUAL_PRO' || teacher.isProUser === true || teacher.tier === 'PRO';
                  const isInstitutional = !!matchingInst || teacher.planType === 'INSTITUTIONAL_ENTERPRISE';

                  const teacherCourses = (classrooms || []).filter(c => c.teacherId === teacher.id || c.teacherName === teacher.name);
                  const totalStudents = teacherCourses.reduce((sum, c) => sum + (Array.isArray(c.studentIds) ? c.studentIds.length : 0), 0);

                  return (
                    <tr key={teacher.id}>
                      <td style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <UserAvatar name={teacher.name} size={38} />
                          <div>
                            <span style={{ fontSize: '0.92rem', display: 'block' }}>{teacher.name}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ID: {teacher.id}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                          {teacher.email}
                        </span>
                      </td>

                      <td>
                        <span className="badge badge-purple" style={{ fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <BookOpen size={12} /> {teacherCourses.length} Courses
                        </span>
                      </td>

                      <td>
                        <span className="badge badge-info" style={{ fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Users size={12} /> {totalStudents} Enrolled
                        </span>
                      </td>

                      <td>
                        {isInstitutional ? (
                          <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 800 }}>
                            <Building2 size={12} /> Campus Whitelist ({matchingInst?.institutionName || `@${teacherEmailDomain}`})
                          </span>
                        ) : isIndividualPro ? (
                          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 800 }}>
                            <Crown size={12} /> Individual Pro (Active)
                          </span>
                        ) : (
                          <span className="badge badge-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <User size={12} /> Free Starter Tier
                          </span>
                        )}
                      </td>

                      <td>
                        {(isIndividualPro || isInstitutional) ? (
                          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700 }}>
                            <CheckCircle2 size={12} /> Unlimited Evaluations
                          </span>
                        ) : (
                          <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={12} /> Free Tier ({teacher.aiCreditsUsed || 0} Used)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredTeachers.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      <User size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem auto', display: 'block', opacity: 0.5 }} />
                      No matching faculty found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: OVERALL PROFIT & FINANCIAL ANALYTICS                               */}
      {/* ========================================================================= */}
      {activeTab === 'FINANCIALS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* Revenue Breakdown Progress Bar */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>
                  ARR Revenue Distribution: B2B Enterprise vs B2C Faculty
                </h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Total ARR: <strong>₹{totalARR.toLocaleString('en-IN')}</strong> (Net Gross Profit: <strong>₹{grossProfitInr.toLocaleString('en-IN')}</strong> after cloud & gateway overhead)
                </span>
              </div>

              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-purple)', fontWeight: 800 }}>
                  ● B2B Campuses: ₹{b2bRevenueInr.toLocaleString('en-IN')}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ec4899', fontWeight: 800 }}>
                  ● B2C Faculty: ₹{individualRevenueInr.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Split Bar */}
            <div style={{ height: '14px', borderRadius: '9999px', background: 'rgba(148, 163, 184, 0.2)', overflow: 'hidden', display: 'flex' }}>
              <div 
                style={{ 
                  width: totalARR > 0 ? `${(b2bRevenueInr / totalARR) * 100}%` : '50%', 
                  background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                  transition: 'width 0.5s ease'
                }} 
              />
              <div 
                style={{ 
                  width: totalARR > 0 ? `${(individualRevenueInr / totalARR) * 100}%` : '50%', 
                  background: 'linear-gradient(90deg, #ec4899, #f43f5e)',
                  transition: 'width 0.5s ease'
                }} 
              />
            </div>
          </div>

          {/* Pricing Model Comparison Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            
            <div style={{ background: 'var(--bg-secondary)', padding: '1.75rem', borderRadius: '16px', border: '1px solid var(--accent-indigo)' }}>
              <span className="badge badge-info" style={{ marginBottom: '0.5rem', fontWeight: 800 }}>B2C EDUCATORS</span>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '0.25rem 0' }}>Individual Pro Faculty</h4>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--accent-indigo)', margin: '0.5rem 0', fontFamily: 'var(--font-mono)' }}>
                ₹499 <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ month or ₹4,999 / year</span>
              </div>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.84rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '1rem' }}>
                <li><strong>Instant Auto-Approval</strong> upon payment confirmation</li>
                <li>Stripe / Razorpay 256-bit encrypted checkout</li>
                <li>Unlimited Spring AI evaluations & parent alert dispatchers</li>
                <li>Total Active Subscribers: <strong>{individualProTeachers.length} Faculty Members</strong></li>
              </ul>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '1.75rem', borderRadius: '16px', border: '1px solid var(--accent-purple)' }}>
              <span className="badge badge-purple" style={{ marginBottom: '0.5rem', fontWeight: 800 }}>B2B ENTERPRISE</span>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '0.25rem 0' }}>Campus Domain License</h4>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--accent-purple)', margin: '0.5rem 0', fontFamily: 'var(--font-mono)' }}>
                ₹49,999 <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ year per campus</span>
              </div>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.84rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '1rem' }}>
                <li><strong>Mandatory Letterhead Proof Upload</strong> & Admin Compliance Audit</li>
                <li>Auto-whitelists all faculty with matching <code>@campus.edu</code> email</li>
                <li>Official GST Tax Invoice & Dedicated Account Manager</li>
                <li>Active Campus Deployments: <strong>{activeB2bLicenses.length} Universities</strong></li>
              </ul>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: CLUSTER TELEMETRY & AI POLICIES                                    */}
      {/* ========================================================================= */}
      {activeTab === 'SYSTEM_HEALTH' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* SYSTEM ARCHITECTURE & PERFORMANCE OBSERVABILITY VIEW (ISOLATED IN DEDICATED TAB) */}
          <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-indigo)' }}>
            <SystemPerformanceView />
          </div>

          {/* Academic Integrity & Global AI Policy Configuration Card */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
              <Settings size={18} color="var(--accent-blue)" /> Global Academic Integrity & AI Policy Controls
            </h3>

            {savedPolicy && (
              <div className="badge badge-success" style={{ width: '100%', padding: '0.65rem', marginBottom: '1rem', textTransform: 'none', justifyContent: 'center' }}>
                <CheckCircle2 size={16} /> System Policy Settings Saved & Propagated across all cluster nodes!
              </div>
            )}

            <form onSubmit={handleSavePolicySettings}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                    <Sliders size={14} color="var(--status-warning)" /> Default Similarity Plagiarism Threshold (%)
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
                    Trigger automated plagiarism warnings if cross-submission similarity exceeds this mark.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>Active LLM Provider Engine</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 0.85rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    <Cpu size={16} color="var(--accent-purple)" />
                    {systemConfig.aiModelProvider || 'Gemini 3.8 Flash (Spring Boot Enterprise)'}
                  </div>
                </div>

              </div>

              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem', marginTop: '1.25rem' }}>
                <input 
                  type="checkbox" 
                  id="autoEmail"
                  checked={autoEmail} 
                  onChange={e => setAutoEmail(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="autoEmail" className="form-label" style={{ margin: 0, cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 600 }}>
                  Automated Parent Email Alerts for Low Scores & Academic Warning Flags
                </label>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', fontWeight: 800 }}>
                Save Policy Changes
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Proof Document Viewer Modal */}
      {activeDocPreview && (
        <DocumentViewerModal
          fileUrl={activeDocPreview.fileUrl}
          fileName={activeDocPreview.fileName}
          fileType={activeDocPreview.fileType}
          docData={activeDocPreview.docData || activeDocPreview}
          isOpen={!!activeDocPreview}
          onClose={() => setActiveDocPreview(null)}
          onApprove={() => handleApproveLicense(activeDocPreview.licenseObj || activeDocPreview)}
          onReject={() => rejectLicense(activeDocPreview.id)}
        />
      )}

      {/* Official GST Tax Invoice Modal */}
      {activeInvoicePreview && (
        <OfficialTaxInvoiceModal
          invoice={activeInvoicePreview}
          isOpen={!!activeInvoicePreview}
          onClose={() => setActiveInvoicePreview(null)}
        />
      )}

    </div>
  );
};

export default AdminDashboard;
