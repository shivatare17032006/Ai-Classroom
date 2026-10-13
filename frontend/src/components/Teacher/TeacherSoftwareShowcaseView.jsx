import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useClassroom } from '../../context/ClassroomContext';
import { ApiService } from '../../services/api';
import { EmailNotificationService } from '../../services/emailService';
import {
  Sparkles,
  Crown,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Search,
  CreditCard,
  FileText,
  Mail,
  Lock,
  Receipt,
  Upload,
  FileCheck,
  Clock,
  Shield,
  Eye,
  Check,
  Award,
  BookOpen,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  QrCode,
  Layers,
  X
} from 'lucide-react';
import { DocumentViewerModal } from '../Common/DocumentViewerModal';
import { OfficialTaxInvoiceModal } from '../Common/OfficialTaxInvoiceModal';

export const TeacherSoftwareShowcaseView = ({ onUnlocked }) => {
  const { currentUser, updateUserProfile, licenses: authLicenses, fetchUsers } = useAuth();
  const { addLicense, licenses: classroomLicenses, refreshData } = useClassroom();

  const licenses = classroomLicenses && classroomLicenses.length > 0 ? classroomLicenses : (authLicenses || []);

  const currentTeacherDomain = currentUser?.email ? currentUser.email.split('@')[1]?.toLowerCase() : '';
  const pendingDomainLicense = Array.isArray(licenses) ? licenses.find(l =>
    l.domainExtension &&
    l.domainExtension.toLowerCase().replace('@', '') === currentTeacherDomain &&
    l.status === 'PENDING_VERIFICATION'
  ) : null;

  const activeDomainLicense = Array.isArray(licenses) ? licenses.find(l =>
    l.domainExtension &&
    l.domainExtension.toLowerCase().replace('@', '') === currentTeacherDomain &&
    l.status === 'ACTIVE'
  ) : null;

  // Billing Cycle Toggle: 'MONTHLY' | 'ANNUAL'
  const [billingCycle, setBillingCycle] = useState('ANNUAL');

  // Modal States
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isInstModalOpen, setIsInstModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('ANNUAL_PRO'); // 'MONTHLY_PRO' | 'ANNUAL_PRO'
  const [activeDocPreview, setActiveDocPreview] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Payment Checkout States
  const [paymentMethod, setPaymentMethod] = useState('CARD'); // 'CARD' | 'UPI' | 'NETBANKING'
  const [cardHolder, setCardHolder] = useState(currentUser?.name || 'Educator');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('482');
  const [upiId, setUpiId] = useState('teacher@okaxis');

  // Domain Verification States
  const [domainInput, setDomainInput] = useState(currentTeacherDomain || '');

  // Institutional Application & Payment Form States
  const [instName, setInstName] = useState(pendingDomainLicense?.institutionName || '');
  const [instDomainExt, setInstDomainExt] = useState(currentTeacherDomain || '');
  const [contactName, setContactName] = useState(currentUser?.name || '');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || '');
  const [proofFile, setProofFile] = useState(null);
  const [proofFileName, setProofFileName] = useState('');
  const [proofFileDataUrl, setProofFileDataUrl] = useState(null);
  const [instPaymentMethod, setInstPaymentMethod] = useState('CARD');

  // Status & Processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState(null);
  const [applicationSubmitted, setApplicationSubmitted] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleOpenCheckout = (planKey) => {
    setSelectedPlan(planKey);
    setIsCheckoutOpen(true);
    setCompletedInvoice(null);
    setStatusMessage(null);
  };

  // Instant Individual Payment Processing
  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setStatusMessage(null);

    try {
      await new Promise(res => setTimeout(res, 850));

      const isAnnual = selectedPlan === 'ANNUAL_PRO';
      const planTitle = isAnnual ? 'Individual Faculty Pro License (Annual Saver)' : 'Individual Faculty Pro License (Monthly)';
      const amountInr = isAnnual ? 4999 : 499;

      // AUTOMATIC INSTANT APPROVAL UPON INDIVIDUAL PAYMENT
      await updateUserProfile({
        planType: 'INDIVIDUAL_PRO',
        isProUser: true,
        tier: 'PRO',
        proPurchasedAt: new Date().toISOString()
      });

      const invoice = {
        invoiceNo: `INV-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        planTitle,
        amountInr,
        gstAmount: Math.round(amountInr * 0.18),
        totalAmount: Math.round(amountInr * 1.18),
        paymentMethod: paymentMethod === 'CARD' ? `Credit Card (ending ${cardNumber.slice(-4)})` : paymentMethod === 'UPI' ? `UPI (${upiId})` : 'NetBanking',
        transactionId: `TXN-AUTO-${Date.now()}`,
        billedTo: currentUser?.name || 'Educator',
        email: currentUser?.email || ''
      };

      setCompletedInvoice(invoice);

      EmailNotificationService.sendTeacherLicenseInvoice(
        currentUser?.email,
        currentUser?.name,
        planTitle,
        amountInr,
        invoice.invoiceNo,
        invoice.transactionId
      );

      setStatusMessage({
        type: 'success',
        text: `Payment confirmed. Your ${planTitle} is now active. Tax invoice generated.`
      });

      setTimeout(() => {
        if (onUnlocked) onUnlocked();
      }, 2200);

    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Payment processing was unsuccessful. Please check details and try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Refresh Institutional Application Status from Server
  const handleRefreshVerificationStatus = async () => {
    setIsRefreshingStatus(true);
    try {
      await fetchUsers();
      if (refreshData) await refreshData();
      const freshLicenses = await ApiService.getLicenses();
      const activeLic = (freshLicenses || []).find(l =>
        l.domainExtension && l.domainExtension.toLowerCase().replace('@', '') === currentTeacherDomain && l.status === 'ACTIVE'
      );

      if (activeLic) {
        await updateUserProfile({ planType: 'INSTITUTIONAL_ENTERPRISE' });
        setStatusMessage({
          type: 'success',
          text: `Verified. Domain @${currentTeacherDomain} has been approved by the System Administrator. Access is now unlocked.`
        });
        setTimeout(() => {
          if (onUnlocked) onUnlocked();
        }, 1500);
      } else {
        setStatusMessage({
          type: 'info',
          text: `Application for @${currentTeacherDomain} is currently in the Administrator verification queue. Typical turnaround is within 24 business hours.`
        });
        setTimeout(() => setStatusMessage(null), 5000);
      }
    } catch (e) {
      setStatusMessage({ type: 'error', text: 'Unable to check verification status right now.' });
    } finally {
      setIsRefreshingStatus(false);
    }
  };

  // Verify If An Academic Domain Is Whitelisted
  const handleVerifyApprovedDomain = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setStatusMessage(null);

    const checkDomain = domainInput.trim().toLowerCase().replace('@', '');

    if (!checkDomain) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid institution domain (e.g., mit.edu).' });
      setIsProcessing(false);
      return;
    }

    try {
      const activeLicenses = licenses && licenses.length > 0 ? licenses : await ApiService.getLicenses();
      const matched = (activeLicenses || []).find(l =>
        l.domainExtension && l.domainExtension.toLowerCase().replace('@', '') === checkDomain &&
        l.status === 'ACTIVE'
      );

      if (matched) {
        await updateUserProfile({ planType: 'INSTITUTIONAL_ENTERPRISE' });
        setStatusMessage({
          type: 'success',
          text: `Verified. Active campus license found for ${matched.institutionName}. Software access unlocked.`
        });
        setTimeout(() => {
          if (onUnlocked) onUnlocked();
        }, 1500);
      } else {
        const pendingMatch = (activeLicenses || []).find(l =>
          l.domainExtension && l.domainExtension.toLowerCase().replace('@', '') === checkDomain &&
          l.status === 'PENDING_VERIFICATION'
        );

        if (pendingMatch) {
          setStatusMessage({
            type: 'info',
            text: `Domain '@${checkDomain}' is registered and currently pending administrator review. Software access unlocks automatically once approved.`
          });
        } else {
          setStatusMessage({
            type: 'error',
            text: `Domain '@${checkDomain}' does not have an active institutional license. You can purchase a campus license or activate an individual faculty license below.`
          });
        }
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Error querying domain directory.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofFile(file);
      setProofFileName(file.name);

      const reader = new FileReader();
      reader.onload = (event) => {
        setProofFileDataUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitInstitutionalRequest = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setStatusMessage(null);

    const cleanDomain = instDomainExt.trim().toLowerCase().replace('@', '');

    if (!instName || !cleanDomain || !contactName || !contactEmail) {
      setStatusMessage({ type: 'error', text: 'Please fill in all required institution fields.' });
      setIsProcessing(false);
      return;
    }

    if (!proofFile && !proofFileName) {
      setStatusMessage({ type: 'error', text: 'Please attach official documentation proof (Authorization letter or Domain certificate).' });
      setIsProcessing(false);
      return;
    }

    try {
      await new Promise(res => setTimeout(res, 900));

      await addLicense({
        institutionName: instName,
        domainExtension: cleanDomain,
        planType: 'ENTERPRISE_ANNUAL',
        priceInInr: 49999.0,
        status: 'PENDING_VERIFICATION',
        aiServicesAllowed: false,
        contactName: contactName,
        contactEmail: contactEmail,
        proofDocumentName: proofFileName || (proofFile ? proofFile.name : 'Domain_Authorization_Proof.pdf'),
        proofDocumentUrl: proofFileDataUrl || ''
      });

      await fetchUsers();

      const appDetails = {
        reqId: `LIC-REQ-${Math.floor(100000 + Math.random() * 900000)}`,
        instName,
        domain: cleanDomain,
        contactName,
        contactEmail,
        fileName: proofFileName || (proofFile ? proofFile.name : 'Domain_Authorization_Proof.pdf'),
        amountPaid: 49999
      };

      setApplicationSubmitted(appDetails);
      setIsInstModalOpen(false);
      setStatusMessage({
        type: 'info',
        text: `Institutional domain request (${appDetails.reqId}) for ${instName} (@${cleanDomain}) submitted to Administrator Verification Queue.`
      });

    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Submission failed. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Breadcrumb Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
          <span>Academic Portal</span>
          <ChevronRight size={13} />
          <span>Faculty Workspace</span>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>Software Licensing & Verification</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
              Faculty Software License
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
              Activate individual teacher access or manage institutional campus-wide domain verification for your department.
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: pendingDomainLicense ? 'var(--status-warning)' : 'var(--status-danger)',
              display: 'inline-block'
            }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Status:
            </span>
            <strong style={{ fontSize: '0.82rem', color: pendingDomainLicense ? 'var(--status-warning)' : 'var(--status-danger)' }}>
              {pendingDomainLicense ? 'Institutional Verification In Progress' : 'License Required'}
            </strong>
          </div>
        </div>
      </div>

      {/* Toast Alert Banner */}
      {statusMessage && (
        <div style={{
          padding: '0.9rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          fontWeight: 600,
          fontSize: '0.88rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: statusMessage.type === 'success' 
            ? 'var(--status-success-bg)' 
            : statusMessage.type === 'info' 
            ? 'var(--status-info-bg)' 
            : 'var(--status-danger-bg)',
          border: statusMessage.type === 'success'
            ? '1px solid var(--status-success)'
            : statusMessage.type === 'info'
            ? '1px solid var(--accent-blue)'
            : '1px solid var(--status-danger)',
          color: statusMessage.type === 'success'
            ? 'var(--status-success)'
            : statusMessage.type === 'info'
            ? 'var(--accent-blue)'
            : 'var(--status-danger)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>{statusMessage.text}</span>
          </div>
          <button 
            onClick={() => setStatusMessage(null)} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '0.2rem' }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* ENTERPRISE VERIFICATION CONSOLE (VISIBLE IF APPLICATION PENDING) */}
      {/* ============================================================ */}
      {(pendingDomainLicense || applicationSubmitted) && (
        <div className="glass-card" style={{
          borderLeft: '4px solid var(--status-warning)',
          background: 'var(--bg-card)',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.35rem'
        }}>
          {/* Top Status Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                <span className="badge badge-warning" style={{ fontSize: '0.72rem', fontWeight: 800 }}>
                  <Clock size={12} /> VERIFICATION AUDIT IN PROGRESS
                </span>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Ref: {pendingDomainLicense?.id || applicationSubmitted?.reqId || 'LIC-2026-ACTIVE'}
                </span>
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                {pendingDomainLicense?.institutionName || applicationSubmitted?.instName || 'Institution'} • Campus Domain Verification
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                Official institutional whitelist request for domain <strong style={{ color: 'var(--accent-blue)' }}>@{currentTeacherDomain}</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefreshVerificationStatus}
              disabled={isRefreshingStatus}
              className="btn btn-secondary"
              style={{ gap: '0.45rem', fontSize: '0.84rem', fontWeight: 700 }}
              title="Query administrative approval status"
            >
              <RefreshCw size={14} className={isRefreshingStatus ? 'spin-animation' : ''} />
              {isRefreshingStatus ? 'Checking Status...' : 'Check Approval Status'}
            </button>
          </div>

          {/* Real-World Enterprise Audit Pipeline Stepper */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
            background: 'var(--bg-secondary)',
            padding: '1.1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            {/* Step 1: Complete */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--status-success)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.82rem',
                fontWeight: 800,
                flexShrink: 0,
                marginTop: '0.1rem'
              }}>
                ✓
              </div>
              <div>
                <strong style={{ fontSize: '0.84rem', color: 'var(--text-primary)', display: 'block' }}>
                  1. Application Logged
                </strong>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: '1.3', display: 'block' }}>
                  Campus domain registered & proof document uploaded.
                </span>
              </div>
            </div>

            {/* Step 2: In Review */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--status-warning)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.82rem',
                fontWeight: 800,
                flexShrink: 0,
                marginTop: '0.1rem'
              }}>
                <Clock size={14} />
              </div>
              <div>
                <strong style={{ fontSize: '0.84rem', color: 'var(--status-warning)', display: 'block' }}>
                  2. Administrator Audit
                </strong>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: '1.3', display: 'block' }}>
                  Under review in the System Administrator verification dashboard.
                </span>
              </div>
            </div>

            {/* Step 3: Pending */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', opacity: 0.65 }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--border-color)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.82rem',
                fontWeight: 800,
                flexShrink: 0,
                marginTop: '0.1rem'
              }}>
                3
              </div>
              <div>
                <strong style={{ fontSize: '0.84rem', color: 'var(--text-primary)', display: 'block' }}>
                  3. Campus Whitelist Activation
                </strong>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: '1.3', display: 'block' }}>
                  Automatic access granted for all faculty under @{currentTeacherDomain}.
                </span>
              </div>
            </div>
          </div>

          {/* Metadata Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                Campus Domain Extension
              </span>
              <strong style={{ fontSize: '0.92rem', color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>
                @{currentTeacherDomain}
              </strong>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                Submitted Proof Document
              </span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                  {pendingDomainLicense?.proofDocumentName || applicationSubmitted?.fileName || 'Institutional_Proof.pdf'}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveDocPreview({
                    fileUrl: pendingDomainLicense?.proofDocumentUrl || proofFileDataUrl || '',
                    fileName: pendingDomainLicense?.proofDocumentName || applicationSubmitted?.fileName || 'Institutional_Proof.pdf',
                    fileType: 'pdf',
                    docData: {
                      institutionName: pendingDomainLicense?.institutionName || applicationSubmitted?.instName || 'Institution',
                      domainExtension: pendingDomainLicense?.domainExtension || applicationSubmitted?.domain || currentTeacherDomain,
                      contactName: pendingDomainLicense?.contactName || applicationSubmitted?.contactName || currentUser?.name,
                      contactEmail: pendingDomainLicense?.contactEmail || applicationSubmitted?.contactEmail || currentUser?.email,
                      fileName: pendingDomainLicense?.proofDocumentName || applicationSubmitted?.fileName || 'Institutional_Proof.pdf',
                      submittedAt: pendingDomainLicense?.createdAt ? new Date(pendingDomainLicense.createdAt).toLocaleString() : new Date().toLocaleString()
                    }
                  })}
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: '0.74rem', padding: '0.2rem 0.55rem', gap: '0.3rem' }}
                >
                  <Eye size={12} /> View Document
                </button>
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                Designated Representative
              </span>
              <strong style={{ fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                {pendingDomainLicense?.contactEmail || currentUser?.email}
              </strong>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                Review SLA Window
              </span>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Within 24-48 business hours
              </span>
            </div>
          </div>

          {/* Context Advisory Notice */}
          <div style={{
            background: 'var(--bg-secondary)',
            borderLeft: '3px solid var(--accent-blue)',
            padding: '0.85rem 1.15rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.5'
          }}>
            <strong style={{ color: 'var(--text-primary)' }}>Need immediate software access for active classes?</strong> While your campus administrator review is underway, you can activate an instant <strong>Individual Faculty License</strong> below. Individual licenses activate immediately upon checkout with zero administrative wait time.
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 2: ACADEMIC CAPABILITIES (Professional 4-Card Overview) */}
      {/* ============================================================ */}
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Software Capabilities Included in License
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
            Full suite of AI-assisted grading, academic integrity audits, and student communication tools.
          </p>
        </div>

        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <div style={{ background: 'rgba(36, 91, 115, 0.1)', color: 'var(--accent-blue)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
                <Sparkles size={18} />
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Automated Rubric Grading</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.45' }}>
              Criterion-based submission assessment. Evaluates code and written essays against customized rubrics with inline feedback.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <div style={{ background: 'rgba(15, 118, 110, 0.1)', color: 'var(--status-success)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
                <ShieldCheck size={18} />
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Integrity & Plagiarism Scans</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.45' }}>
              Multi-vector similarity analysis using Levenshtein distance and Jaccard tokens with customizable threshold controls.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <div style={{ background: 'rgba(180, 83, 9, 0.1)', color: 'var(--status-warning)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
                <Mail size={18} />
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Automated Parent Alerts</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.45' }}>
              Direct email notices dispatched automatically to registered parent emails when students fall below passing grade thresholds.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-indigo)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
                <FileText size={18} />
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Registrar Gradebook Export</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.45' }}>
              Full student marksheets, submission histories, and PRN/Roll records exportable in standard CSV and Excel formats.
            </p>
          </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 3: THE 2 LICENSING OPTIONS (Grounded SaaS Layout) */}
      {/* ============================================================ */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Choose a Licensing Option
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
              Select between an individual instructor license or institution-wide domain verification.
            </p>
          </div>

          {/* Billing Switcher Toggle */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '0.25rem'
          }}>
            <button
              type="button"
              onClick={() => setBillingCycle('MONTHLY')}
              style={{
                background: billingCycle === 'MONTHLY' ? 'var(--bg-card)' : 'transparent',
                color: billingCycle === 'MONTHLY' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: billingCycle === 'MONTHLY' ? 700 : 500,
                border: 'none',
                padding: '0.45rem 0.95rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: billingCycle === 'MONTHLY' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('ANNUAL')}
              style={{
                background: billingCycle === 'ANNUAL' ? 'var(--bg-card)' : 'transparent',
                color: billingCycle === 'ANNUAL' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: billingCycle === 'ANNUAL' ? 700 : 500,
                border: 'none',
                padding: '0.45rem 0.95rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: billingCycle === 'ANNUAL' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              Annual Billing
              <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* 2 Plan Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>

          {/* CARD 1: INDIVIDUAL TEACHER LICENSE */}
          <div className="glass-card" style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '2px solid var(--accent-blue)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem',
            position: 'relative'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="badge badge-primary" style={{ fontSize: '0.74rem', fontWeight: 800 }}>
                  <Crown size={12} /> INDIVIDUAL FACULTY LICENSE
                </span>
                <span className="badge badge-success" style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                  ✓ Instant Activation
                </span>
              </div>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.2rem 0', color: 'var(--text-primary)' }}>
                Faculty Pro License
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.45' }}>
                Personal account license for individual professors and instructors. Unlocks immediately upon checkout with zero administrative waiting.
              </p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                  {billingCycle === 'ANNUAL' ? '₹4,999' : '₹499'}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {billingCycle === 'ANNUAL' ? '/ year (Save ₹989)' : '/ month'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                  <CheckCircle2 size={16} color="var(--accent-blue)" /> Instant access unlocked immediately upon checkout
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--accent-blue)" /> Unlimited Spring AI rubric evaluation & feedback
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--accent-blue)" /> Multi-algorithm similarity & plagiarism audits
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--accent-blue)" /> Automated parent email alerts & marksheet exports
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--accent-blue)" /> Official GST-compliant tax receipt & invoice PDF
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenCheckout(billingCycle === 'ANNUAL' ? 'ANNUAL_PRO' : 'MONTHLY_PRO')}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.92rem',
                fontWeight: 700,
                gap: '0.5rem',
                justifyContent: 'center'
              }}
            >
              <Zap size={16} /> Activate Faculty License ({billingCycle === 'ANNUAL' ? '₹4,999/yr' : '₹499/mo'})
            </button>
          </div>

          {/* CARD 2: INSTITUTIONAL CAMPUS LICENSE */}
          <div className="glass-card" style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem',
            position: 'relative'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="badge badge-info" style={{ fontSize: '0.74rem', fontWeight: 800 }}>
                  <Building2 size={12} /> INSTITUTIONAL B2B
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Domain Whitelist
                </span>
              </div>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.2rem 0', color: 'var(--text-primary)' }}>
                Campus Domain Whitelist
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.45' }}>
                For universities, colleges, and academic departments. Whitelists your entire campus domain so all faculty gain automatic access.
              </p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                  ₹49,999
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  / year per campus (Unlimited faculty)
                </span>
              </div>

              {/* Check Domain Search Form */}
              <div style={{
                background: 'var(--bg-secondary)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                marginBottom: '1.25rem'
              }}>
                <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '0.4rem', display: 'block' }}>
                  Check if your campus domain is already registered:
                </label>
                <form onSubmit={handleVerifyApprovedDomain} style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. university.edu"
                      value={domainInput}
                      onChange={e => setDomainInput(e.target.value)}
                      style={{ paddingLeft: '2.2rem', fontSize: '0.85rem' }}
                      required
                    />
                    <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                  <button type="submit" disabled={isProcessing} className="btn btn-secondary" style={{ fontSize: '0.82rem', padding: '0.5rem 0.85rem' }}>
                    Verify
                  </button>
                </form>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--accent-blue)" /> Site-wide whitelist for all faculty with matching @domain
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--accent-blue)" /> Unlimited faculty accounts and course cohorts
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--accent-blue)" /> University Purchase Order (PO) and institutional GST tax invoice
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsInstModalOpen(true)}
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.92rem',
                fontWeight: 700,
                gap: '0.5rem',
                justifyContent: 'center'
              }}
            >
              <Building2 size={16} /> Purchase Campus License & Submit Proof
            </button>
          </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: CHECKOUT MODAL (REAL-WORLD FINTECH DESIGN) */}
      {/* ============================================================ */}
      {isCheckoutOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px', padding: 0, overflow: 'hidden' }}>
            
            {/* Modal Header */}
            <div style={{
              background: 'var(--accent-blue)',
              color: '#ffffff',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.75)', fontWeight: 700 }}>
                  Secure Payment Checkout
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0.15rem 0 0 0', color: '#ffffff' }}>
                  {selectedPlan === 'ANNUAL_PRO' ? 'Faculty Pro License (Annual Saver)' : 'Faculty Pro License (Monthly)'}
                </h3>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="btn btn-secondary btn-icon"
                style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', border: 'none' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', maxHeight: '75vh', overflowY: 'auto' }}>
              {completedInvoice ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'var(--status-success-bg)', color: 'var(--status-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: 'var(--text-primary)' }}>
                      License Activated Successfully
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Invoice <strong>{completedInvoice.invoiceNo}</strong> has been generated and sent to {completedInvoice.email}.
                    </p>
                  </div>

                  <div style={{ background: 'var(--bg-secondary)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.82rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Transaction Reference:</span>
                      <strong style={{ fontFamily: 'var(--font-mono)' }}>{completedInvoice.transactionId}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Licensed Educator:</span>
                      <strong>{completedInvoice.billedTo}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.45rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Total Amount (incl 18% GST):</span>
                      <strong style={{ color: 'var(--status-success)', fontSize: '0.95rem' }}>₹{completedInvoice.totalAmount.toLocaleString()}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setIsInvoiceModalOpen(true)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.84rem', gap: '0.35rem' }}
                    >
                      <Receipt size={14} /> View Tax Invoice
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        if (onUnlocked) onUnlocked();
                      }}
                      className="btn btn-primary"
                      style={{ fontSize: '0.84rem' }}
                    >
                      Go to Classroom Dashboard
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleProcessPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Payment Methods */}
                  <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CARD')}
                      className={`btn btn-sm ${paymentMethod === 'CARD' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1, fontWeight: 700 }}
                    >
                      <CreditCard size={13} /> Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('UPI')}
                      className={`btn btn-sm ${paymentMethod === 'UPI' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1, fontWeight: 700 }}
                    >
                      <Zap size={13} /> UPI / QR
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('NETBANKING')}
                      className={`btn btn-sm ${paymentMethod === 'NETBANKING' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1, fontWeight: 700 }}
                    >
                      <Building2 size={13} /> NetBanking
                    </button>
                  </div>

                  {/* Card Form */}
                  {paymentMethod === 'CARD' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Name on Card</label>
                        <input
                          type="text"
                          className="form-input"
                          value={cardHolder}
                          onChange={e => setCardHolder(e.target.value)}
                          placeholder="Dr. Full Name"
                          required
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Card Number</label>
                        <input
                          type="text"
                          className="form-input"
                          value={cardNumber}
                          onChange={e => setCardNumber(e.target.value)}
                          placeholder="4532 8892 1049 8892"
                          required
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '0.85rem' }}>
                        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                          <label className="form-label">Expiration (MM/YY)</label>
                          <input
                            type="text"
                            className="form-input"
                            value={cardExpiry}
                            onChange={e => setCardExpiry(e.target.value)}
                            placeholder="08/28"
                            required
                          />
                        </div>
                        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                          <label className="form-label">CVV / Security Code</label>
                          <input
                            type="password"
                            className="form-input"
                            value={cardCvv}
                            onChange={e => setCardCvv(e.target.value)}
                            placeholder="•••"
                            maxLength={4}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* UPI Form */}
                  {paymentMethod === 'UPI' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center' }}>
                      <div style={{
                        background: '#ffffff',
                        padding: '0.85rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        <svg width="130" height="130" viewBox="0 0 100 100" fill="none">
                          <rect width="100" height="100" fill="white" />
                          <path d="M10 10h30v30H10V10zm6 6v18h18V16H16z" fill="#0f172a" />
                          <path d="M22 22h6v6h-6v-6z" fill="#245b73" />
                          <path d="M60 10h30v30H60V10zm6 6v18h18V16H66z" fill="#0f172a" />
                          <path d="M72 22h6v6h-6v-6z" fill="#245b73" />
                          <path d="M10 60h30v30H10V60zm6 6v18h18V66H16z" fill="#0f172a" />
                          <path d="M22 72h6v6h-6v-6z" fill="#245b73" />
                          <path d="M45 10h10v10H45V10zm10 20h10v10H55V30zm-10 20h20v10H45V50zm25 10h15v15H70V60zm-20 20h30v10H50V80z" fill="#0f172a" />
                        </svg>
                        <span style={{ fontSize: '0.72rem', color: '#0f172a', fontWeight: 700, display: 'block', marginTop: '0.35rem' }}>
                          Scan using GPay, PhonePe or Paytm
                        </span>
                      </div>

                      <div className="form-group" style={{ width: '100%', textAlign: 'left', marginBottom: 0 }}>
                        <label className="form-label">Or enter UPI Virtual Address (VPA)</label>
                        <input
                          type="text"
                          className="form-input"
                          value={upiId}
                          onChange={e => setUpiId(e.target.value)}
                          placeholder="e.g. yourname@okaxis"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* NetBanking Form */}
                  {paymentMethod === 'NETBANKING' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      <label className="form-label">Select Recognized Banking Partner</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.5rem' }}>
                        {['HDFC Bank', 'ICICI Bank', 'SBI Bank', 'Axis Bank', 'Kotak Bank'].map(b => (
                          <div
                            key={b}
                            style={{
                              background: 'var(--bg-secondary)',
                              padding: '0.65rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-color)',
                              textAlign: 'center',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            {b}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Breakdown & Tax Calculation */}
                  <div style={{
                    background: 'var(--bg-secondary)',
                    padding: '0.9rem 1.15rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Payable (Base + 18% GST):</span>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--accent-blue)', fontFamily: 'var(--font-heading)' }}>
                        ₹{selectedPlan === 'ANNUAL_PRO' ? '5,898.82' : '588.82'}
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '0.35rem' }}>incl. GST</span>
                      </div>
                    </div>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                      <ShieldCheck size={12} /> 256-Bit SSL Encrypted
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.35rem' }}>
                    <button type="button" onClick={() => setIsCheckoutOpen(false)} className="btn btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" disabled={isProcessing} className="btn btn-primary" style={{ fontWeight: 700 }}>
                      {isProcessing ? 'Processing Transaction...' : 'Complete Payment & Activate'}
                    </button>
                  </div>

                </form>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: INSTITUTIONAL APPLICATION & PROOF UPLOAD */}
      {/* ============================================================ */}
      {isInstModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px', padding: 0, overflow: 'hidden' }}>
            
            <div style={{
              background: 'var(--accent-blue)',
              color: '#ffffff',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.75)', fontWeight: 700 }}>
                  Campus Procurement Request
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0.15rem 0 0 0', color: '#ffffff' }}>
                  Institutional Campus License (₹49,999/yr)
                </h3>
              </div>
              <button
                onClick={() => setIsInstModalOpen(false)}
                className="btn btn-secondary btn-icon"
                style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', border: 'none' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', maxHeight: '75vh', overflowY: 'auto' }}>
              <form onSubmit={handleSubmitInstitutionalRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                <div style={{
                  background: 'var(--status-info-bg)',
                  border: '1px solid rgba(37, 99, 235, 0.25)',
                  padding: '0.85rem 1.15rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  color: 'var(--text-primary)',
                  lineHeight: '1.45'
                }}>
                  <strong>Campus Verification Workflow:</strong> Submit your department/university details, payment authorization, and official documentation proof. Requests are queued for administrator verification and domain whitelist activation.
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">University / Institution Full Legal Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Veermata Jijabai Technological Institute (VJTI)"
                    value={instName}
                    onChange={e => setInstName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Official Campus Domain Extension (e.g. vjti.ac.in or university.edu)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. vjti.ac.in"
                    value={instDomainExt}
                    onChange={e => setInstDomainExt(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                    All faculty creating accounts with @{instDomainExt || 'institution.edu'} will automatically unlock access upon approval.
                  </span>
                </div>

                <div className="grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Department Representative Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Dr. K. S. Sharma"
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Representative Official Email</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="dean@campus.edu"
                      value={contactEmail}
                      onChange={e => setContactEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Upload Proof */}
                <div>
                  <label className="form-label" style={{ marginBottom: '0.35rem', display: 'block' }}>
                    Upload Official Domain Ownership Proof or Authorization Letter <span style={{ color: 'var(--status-danger)' }}>*</span>
                  </label>
                  <div style={{
                    border: proofFileName ? '2px solid var(--status-success)' : '2px dashed var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    textAlign: 'center',
                    background: proofFileName ? 'var(--status-success-bg)' : 'var(--bg-secondary)',
                    position: 'relative',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.docx"
                      onChange={handleFileUpload}
                      required={!proofFileName}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                    />
                    {proofFileName ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem' }}>
                        <FileCheck size={24} color="var(--status-success)" />
                        <div style={{ textAlign: 'left' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--status-success)', display: 'block' }}>
                            ✓ Document Attached
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                            {proofFileName}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Upload size={24} color="var(--accent-blue)" style={{ margin: '0 auto 0.35rem' }} />
                        <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block' }}>
                          Click or drag official document proof here
                        </strong>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
                          PDF, PNG, or JPG (Accreditation letter, domain certificate, or university letterhead)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Amount note */}
                <div style={{
                  background: 'var(--bg-secondary)',
                  padding: '0.9rem 1.15rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Institutional Annual Fee (incl. 18% GST):</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--accent-blue)' }}>
                      ₹58,998.82 <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>(₹49,999 Base + ₹8,999.82 GST)</span>
                    </div>
                  </div>
                  <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                    B2B Tax Invoice
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <button type="button" onClick={() => setIsInstModalOpen(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={isProcessing} className="btn btn-primary" style={{ fontWeight: 700 }}>
                    {isProcessing ? 'Submitting Application...' : 'Submit Campus Application for Admin Audit'}
                  </button>
                </div>

              </form>
            </div>

          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {activeDocPreview && (
        <DocumentViewerModal
          fileUrl={activeDocPreview.fileUrl}
          fileName={activeDocPreview.fileName}
          fileType={activeDocPreview.fileType}
          docData={activeDocPreview.docData || activeDocPreview}
          isOpen={!!activeDocPreview}
          onClose={() => setActiveDocPreview(null)}
        />
      )}

      {/* Official GST Tax Invoice Modal */}
      {completedInvoice && (
        <OfficialTaxInvoiceModal
          invoice={completedInvoice}
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
        />
      )}

    </div>
  );
};

export default TeacherSoftwareShowcaseView;
