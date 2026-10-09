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
  Download,
  BookOpen,
  Award,
  FileText,
  Mail,
  Lock,
  Receipt,
  Upload,
  FileCheck,
  Clock,
  Shield,
  Star,
  Check,
  ChevronRight,
  HelpCircle,
  Eye
} from 'lucide-react';
import { DocumentViewerModal } from '../Common/DocumentViewerModal';
import { OfficialTaxInvoiceModal } from '../Common/OfficialTaxInvoiceModal';

export const TeacherSoftwareShowcaseView = ({ onUnlocked }) => {
  const { currentUser, updateUserProfile, licenses: authLicenses, fetchUsers } = useAuth();
  const { addLicense, licenses: classroomLicenses } = useClassroom();

  const licenses = classroomLicenses && classroomLicenses.length > 0 ? classroomLicenses : (authLicenses || []);

  const currentTeacherDomain = currentUser?.email ? currentUser.email.split('@')[1]?.toLowerCase() : '';
  const pendingDomainLicense = Array.isArray(licenses) ? licenses.find(l =>
    l.domainExtension &&
    l.domainExtension.toLowerCase().replace('@', '') === currentTeacherDomain &&
    l.status === 'PENDING_VERIFICATION'
  ) : null;

  // Modal States
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isInstModalOpen, setIsInstModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('MONTHLY_PRO'); // 'MONTHLY_PRO' | 'ANNUAL_PRO'
  const [activeDocPreview, setActiveDocPreview] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Option 1: Individual Payment Checkout State
  const [paymentMethod, setPaymentMethod] = useState('CARD'); // 'CARD' | 'UPI' | 'NETBANKING'
  const [cardHolder, setCardHolder] = useState(currentUser?.name || '');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [upiId, setUpiId] = useState('teacher@okaxis');

  // Option 2: Domain Check State
  const userDomain = currentUser?.email ? currentUser.email.split('@')[1]?.toLowerCase() : '';
  const [domainInput, setDomainInput] = useState(userDomain || '');

  // Institutional Application & Payment Form State
  const [instName, setInstName] = useState('');
  const [instDomainExt, setInstDomainExt] = useState(userDomain || '');
  const [contactName, setContactName] = useState(currentUser?.name || '');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || '');
  const [proofFile, setProofFile] = useState(null);
  const [proofFileName, setProofFileName] = useState('');
  const [proofFileDataUrl, setProofFileDataUrl] = useState(null);
  const [instPaymentMethod, setInstPaymentMethod] = useState('CARD'); // 'CARD' | 'UPI' | 'NETBANKING'

  // Processing & Status Messages
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState(null);
  const [applicationSubmitted, setApplicationSubmitted] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleOpenCheckout = (planKey) => {
    setSelectedPlan(planKey);
    setIsCheckoutOpen(true);
    setCompletedInvoice(null);
    setStatusMessage(null);
  };

  // Option 1: Individual Purchase (100% AUTOMATIC INSTANT APPROVAL UPON PAYMENT)
  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setStatusMessage(null);

    try {
      await new Promise(res => setTimeout(res, 850));

      let planTitle = 'Individual Teacher Pro License (Monthly)';
      let amountInr = 499;

      if (selectedPlan === 'ANNUAL_PRO') {
        planTitle = 'Individual Teacher Pro License (Annual Saver)';
        amountInr = 4999;
      }

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
        paymentMethod: paymentMethod === 'CARD' ? 'Credit / Debit Card' : `UPI (${upiId})`,
        transactionId: `TXN-AUTO-${Date.now()}`,
        billedTo: currentUser?.name || 'Educator',
        email: currentUser?.email || ''
      };

      setCompletedInvoice(invoice);

      // CASE 4A: TRIGGER AUTOMATED INVOICE & PAYMENT CONFIRMATION EMAIL TO TEACHER
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
        text: `🎉 Payment Confirmed & Automatically Approved! Your ${planTitle} is now ACTIVE. Receipt emailed to ${currentUser?.email || 'your email'}.`
      });

      setTimeout(() => {
        if (onUnlocked) onUnlocked();
      }, 2000);

    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Payment processing failed. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Option 2A: Check Approved Domain
  const handleVerifyApprovedDomain = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setStatusMessage(null);

    const checkDomain = domainInput.trim().toLowerCase().replace('@', '');

    if (!checkDomain) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid university/school domain (e.g. vit.edu).' });
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
          text: `✨ Verified Approved Institutional License for ${matched.institutionName}! Software access automatically granted for domain @${checkDomain}.`
        });

        setTimeout(() => {
          if (onUnlocked) onUnlocked();
        }, 1800);
      } else {
        const pendingMatch = (activeLicenses || []).find(l =>
          l.domainExtension && l.domainExtension.toLowerCase().replace('@', '') === checkDomain &&
          l.status === 'PENDING_VERIFICATION'
        );

        if (pendingMatch) {
          setStatusMessage({
            type: 'warning',
            text: `⏳ Institutional License application for '@${checkDomain}' is currently PENDING ADMIN APPROVAL. Once approved by Admin, software access will automatically unlock for all @${checkDomain} faculty.`
          });
        } else {
          setStatusMessage({
            type: 'error',
            text: `Domain '@${checkDomain}' is not yet registered under an active Institutional License. Click 'Buy Campus License (₹49,999/yr) & Submit Proof' below to purchase and submit your document proof for Admin approval.`
          });
        }
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Error verifying domain license.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Option 2B: Submit Institutional License Payment + Document Proof (Requires Admin Approval)
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
      setStatusMessage({ type: 'error', text: 'Please complete all required institution details.' });
      setIsProcessing(false);
      return;
    }

    if (!proofFile && !proofFileName) {
      setStatusMessage({ type: 'error', text: 'Please attach a proof document (Domain ownership certificate or University letterhead authorization).' });
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
        proofDocumentName: proofFileName || (proofFile ? proofFile.name : 'Institutional_Domain_Proof.pdf'),
        proofDocumentUrl: proofFileDataUrl || ''
      });

      await fetchUsers();

      const appDetails = {
        reqId: `LIC-REQ-${Math.floor(100000 + Math.random() * 900000)}`,
        instName,
        domain: cleanDomain,
        contactName,
        contactEmail,
        fileName: proofFileName || (proofFile ? proofFile.name : 'Institutional_Domain_Proof.pdf'),
        amountPaid: 49999,
        gstPaid: Math.round(49999 * 0.18),
        totalPaid: Math.round(49999 * 1.18)
      };

      setApplicationSubmitted(appDetails);
      setIsInstModalOpen(false);
      setStatusMessage({
        type: 'warning',
        text: `📋 Institutional License Payment (₹49,999) & Proof Document (${appDetails.reqId}) for ${instName} (@${cleanDomain}) submitted to Admin for Verification!`
      });

    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to submit institutional application.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '1rem 1.5rem 4rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

      {/* Top Banner: Sleek High-Contrast Alert for Account License State */}
      <div style={{
        background: pendingDomainLicense
          ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'
          : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        border: pendingDomainLicense ? '1px solid #6366f1' : '1px solid #334155',
        boxShadow: pendingDomainLicense ? '0 10px 35px rgba(99, 102, 241, 0.25)' : '0 10px 30px rgba(15, 23, 42, 0.2)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            background: pendingDomainLicense ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
            padding: '1rem',
            borderRadius: 'var(--radius-lg)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            boxShadow: pendingDomainLicense ? '0 0 25px rgba(245, 158, 11, 0.5)' : '0 0 25px rgba(239, 68, 68, 0.4)'
          }}>
            {pendingDomainLicense ? <Clock size={28} /> : <Lock size={28} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>
                {pendingDomainLicense ? 'Institutional License Application Pending Verification' : 'Teacher Software License Required'}
              </h3>
            </div>
            <p style={{ fontSize: '0.92rem', color: '#cbd5e1', margin: 0, lineHeight: '1.5' }}>
              {pendingDomainLicense ? (
                <>Your application for <strong style={{ color: '#fbbf24', fontWeight: 800 }}>@{currentTeacherDomain}</strong> is registered and currently under System Admin verification. Access will unlock automatically upon Admin approval.</>
              ) : (
                <>Welcome <strong style={{ color: '#ffffff' }}>{currentUser?.name}</strong>! Your account requires a software license to access classrooms, AI rubric tools, parent alerts, & gradebooks.</>
              )}
            </p>
          </div>
        </div>
        <span className="badge" style={{
          background: pendingDomainLicense ? '#fef3c7' : '#fee2e2',
          color: pendingDomainLicense ? '#92400e' : '#991b1b',
          border: pendingDomainLicense ? '1px solid #fcd34d' : '1px solid #fca5a5',
          fontSize: '0.85rem',
          padding: '0.55rem 1.1rem',
          fontWeight: 900,
          letterSpacing: '0.04em'
        }}>
          {pendingDomainLicense ? '⏳ PENDING ADMIN VERIFICATION' : '🔒 UNLICENSED TEACHER'}
        </span>
      </div>

      {/* Global Alert Notification Banner */}
      {statusMessage && (
        <div style={{
          padding: '1.25rem 1.5rem',
          border: statusMessage.type === 'success' ? '2px solid #10b981' : statusMessage.type === 'warning' ? '2px solid #f59e0b' : '2px solid #ef4444',
          background: statusMessage.type === 'success' ? '#ecfdf5' : statusMessage.type === 'warning' ? '#fffbeb' : '#fef2f2',
          color: statusMessage.type === 'success' ? '#065f46' : statusMessage.type === 'warning' ? '#92400e' : '#991b1b',
          fontWeight: 800,
          textAlign: 'center',
          fontSize: '1rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {statusMessage.text}
        </div>
      )}

      {/* Persistent High-Contrast B2B Application Status Tracking Card */}
      {(pendingDomainLicense || applicationSubmitted) && (
        <div style={{
          padding: '2rem',
          borderLeft: '6px solid #f59e0b',
          border: '1px solid #fde68a',
          background: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 12px 35px -10px rgba(245, 158, 11, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', padding: '1rem', borderRadius: 'var(--radius-lg)', color: '#d97706', display: 'flex' }}>
                <Clock size={34} />
              </div>
              <div>
                <span className="badge" style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5', fontSize: '0.78rem', fontWeight: 900, marginBottom: '0.35rem' }}>
                  ⏳ B2B APPLICATION WAITING FOR ADMIN APPROVAL
                </span>
                <h4 style={{ fontSize: '1.45rem', fontWeight: 900, margin: '0.15rem 0', color: '#0f172a' }}>
                  {pendingDomainLicense?.institutionName || applicationSubmitted?.instName || 'Institutional Campus'}
                </h4>
                <p style={{ fontSize: '0.92rem', color: '#475569', margin: 0, fontWeight: 500 }}>
                  Official B2B Domain Whitelist Request for Campus Email Domain
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                await fetchUsers();
                const freshLicenses = await ApiService.getLicenses();
                const activeLic = (freshLicenses || []).find(l =>
                  l.domainExtension && l.domainExtension.toLowerCase().replace('@', '') === currentTeacherDomain && l.status === 'ACTIVE'
                );
                if (activeLic) {
                  await updateUserProfile({ planType: 'INSTITUTIONAL_ENTERPRISE' });
                  if (onUnlocked) onUnlocked();
                } else {
                  setStatusMessage({ type: 'warning', text: '⏳ Application is still pending in System Admin Verification Queue. Please allow time for Admin review.' });
                  setTimeout(() => setStatusMessage(null), 4000);
                }
              }}
              className="btn"
              style={{ gap: '0.55rem', fontWeight: 900, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#ffffff', border: 'none', padding: '0.85rem 1.5rem', fontSize: '0.95rem', borderRadius: 'var(--radius-md)', boxShadow: '0 6px 20px rgba(245, 158, 11, 0.35)' }}
            >
              🔄 Refresh Approval Status
            </button>
          </div>

          {/* Metadata Chips Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            background: '#f8fafc',
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid #e2e8f0'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.25rem' }}>
                Campus Domain Extension
              </span>
              <code style={{ background: '#e0e7ff', color: '#3730a3', padding: '0.3rem 0.75rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.95rem' }}>
                @{currentTeacherDomain}
              </code>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.25rem' }}>
                Submitted Proof Document
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  📄 {pendingDomainLicense?.proofDocumentName || applicationSubmitted?.fileName || 'Institutional_Proof.pdf'}
                </strong>
                <button
                  type="button"
                  onClick={() => setActiveDocPreview({
                    fileUrl: pendingDomainLicense?.proofDocumentUrl || proofFileDataUrl || '',
                    fileName: pendingDomainLicense?.proofDocumentName || applicationSubmitted?.fileName || 'Institutional_Proof.pdf',
                    fileType: 'pdf',
                    docData: {
                      institutionName: pendingDomainLicense?.institutionName || applicationSubmitted?.instName || 'Campus',
                      domainExtension: pendingDomainLicense?.domainExtension || applicationSubmitted?.domain || currentTeacherDomain,
                      contactName: pendingDomainLicense?.contactName || applicationSubmitted?.contactName || currentUser?.name,
                      contactEmail: pendingDomainLicense?.contactEmail || applicationSubmitted?.contactEmail || currentUser?.email,
                      fileName: pendingDomainLicense?.proofDocumentName || applicationSubmitted?.fileName || 'Institutional_Proof.pdf',
                      submittedAt: pendingDomainLicense?.createdAt ? new Date(pendingDomainLicense.createdAt).toLocaleString() : new Date().toLocaleString()
                    }
                  })}
                  className="btn btn-sm btn-secondary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.78rem',
                    padding: '0.3rem 0.75rem',
                    fontWeight: 800,
                    color: 'var(--accent-blue)',
                    borderColor: 'rgba(59, 130, 246, 0.4)',
                    background: 'rgba(59, 130, 246, 0.08)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                  title="Click to view full uploaded proof document"
                >
                  <Eye size={13} /> View Uploaded Proof
                </button>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.25rem' }}>
                Representative Contact
              </span>
              <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>
                ✉️ {pendingDomainLicense?.contactEmail || currentUser?.email}
              </strong>
            </div>
          </div>

          {/* Explanation Footer Box */}
          <div style={{
            background: '#fffbeb',
            border: '1px solid #fef3c7',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.88rem',
            color: '#78350f',
            lineHeight: '1.5'
          }}>
            💡 <strong>What happens next?</strong> The System Administrator reviews submitted campus domain proof documents in the <strong>Admin Dashboard</strong>. As soon as Admin approves, the domain <strong>@{currentTeacherDomain}</strong> will be whitelisted and software access will unlock automatically for all faculty!
          </div>
        </div>
      )}

{/* Hero Section */ }
<div style={{ textAlign: 'center', padding: '1rem 0 0' }}>
  <div style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.6rem',
    background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
    border: '1px solid rgba(168, 85, 247, 0.35)',
    padding: '0.5rem 1.25rem',
    borderRadius: '30px',
    color: 'var(--accent-purple)',
    fontSize: '0.85rem',
    fontWeight: 800,
    letterSpacing: '0.04em',
    marginBottom: '1rem',
    boxShadow: '0 0 25px rgba(168, 85, 247, 0.2)'
  }}>
    <Sparkles size={18} /> NEXT-GEN AI ACADEMIC SOFTWARE FOR EDUCATORS
  </div>

  <h1 style={{
    fontSize: '2.8rem',
    fontWeight: 900,
    background: 'linear-gradient(90deg, #38bdf8 0%, #a855f7 50%, #ec4899 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    lineHeight: '1.2',
    letterSpacing: '-0.02em',
    marginBottom: '0.85rem'
  }}>
    Transform Teaching with Automated AI Tools
  </h1>
  <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
    Get full access to automated Spring AI rubric evaluation, multi-algorithm plagiarism scans, parent email alerts, and exportable gradebooks. Choose one of our 2 licensing options below.
  </p>
</div>

{/* 6 Feature Showcase Cards Grid */ }
<div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.35rem' }}>

  <div className="glass-card" style={{
    borderTop: '4px solid var(--accent-purple)',
    padding: '1.5rem',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    background: 'linear-gradient(180deg, rgba(168, 85, 247, 0.05) 0%, transparent 100%)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.75rem' }}>
      <div style={{ background: 'rgba(168, 85, 247, 0.15)', padding: '0.65rem', borderRadius: '12px', color: 'var(--accent-purple)' }}>
        <Sparkles size={24} />
      </div>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Spring AI Rubric Grading</h3>
    </div>
    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
      Automated essay and code evaluation powered by Gemini AI. Evaluates submissions against customized criteria rubrics, producing detailed feedback & criterion scores.
    </p>
  </div>

  <div className="glass-card" style={{
    borderTop: '4px solid var(--accent-blue)',
    padding: '1.5rem',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    background: 'linear-gradient(180deg, rgba(56, 189, 248, 0.05) 0%, transparent 100%)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.75rem' }}>
      <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '0.65rem', borderRadius: '12px', color: 'var(--accent-blue)' }}>
        <ShieldCheck size={24} />
      </div>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Integrity & Plagiarism Scan</h3>
    </div>
    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
      Multi-algorithm similarity scanner. Detects copy-pasting, external sources, and structural content matches with custom threshold controls.
    </p>
  </div>

  <div className="glass-card" style={{
    borderTop: '4px solid var(--status-success)',
    padding: '1.5rem',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.75rem' }}>
      <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.65rem', borderRadius: '12px', color: 'var(--status-success)' }}>
        <Mail size={24} />
      </div>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Automated Parent Alerts</h3>
    </div>
    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
      Instant email alerts dispatched automatically to parents when students miss homework deadlines or fall below grade thresholds.
    </p>
  </div>

  <div className="glass-card" style={{
    borderTop: '4px solid var(--status-warning)',
    padding: '1.5rem',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.05) 0%, transparent 100%)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.75rem' }}>
      <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '0.65rem', borderRadius: '12px', color: 'var(--status-warning)' }}>
        <FileText size={24} />
      </div>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Master Gradebook Export</h3>
    </div>
    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
      Export complete student grade matrices, performance stats, and submission history in CSV and Excel formats ready for registrar LMS sync.
    </p>
  </div>

  <div className="glass-card" style={{
    borderTop: '4px solid #ec4899',
    padding: '1.5rem',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    background: 'linear-gradient(180deg, rgba(236, 72, 153, 0.05) 0%, transparent 100%)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.75rem' }}>
      <div style={{ background: 'rgba(236, 72, 153, 0.15)', padding: '0.65rem', borderRadius: '12px', color: '#ec4899' }}>
        <Award size={24} />
      </div>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Digital Certificate Engine</h3>
    </div>
    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
      Issue custom verifiable digital certificates of achievement to top-performing students complete with cryptographic credentials.
    </p>
  </div>

  <div className="glass-card" style={{
    borderTop: '4px solid var(--accent-indigo)',
    padding: '1.5rem',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.05) 0%, transparent 100%)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.75rem' }}>
      <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '0.65rem', borderRadius: '12px', color: 'var(--accent-indigo)' }}>
        <BookOpen size={24} />
      </div>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Classrooms & Extensions</h3>
    </div>
    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
      Create virtual course sections, schedule assignments, grant individual student deadline extensions, and post stream announcements.
    </p>
  </div>

</div>

{/* THE 2 LICENSING OPTIONS SECTION */ }
<div style={{ marginTop: '1rem' }}>
  <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
    <span className="badge badge-purple" style={{ fontSize: '0.82rem', padding: '0.4rem 1.1rem', marginBottom: '0.5rem', fontWeight: 800 }}>
      LICENSING OPTIONS
    </span>
    <h2 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0.25rem 0' }}>
      Only 2 Licensing Options to Unlock Software Access
    </h2>
    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
      Select whether you are purchasing an individual teacher license or verifying your institution’s campus domain license.
    </p>
  </div>

  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2.25rem' }}>

    {/* OPTION 1: INDIVIDUAL TEACHER LICENSE (INSTANT AUTOMATIC APPROVAL) */}
    <div className="glass-card" style={{
      display: 'flex',
      flexDirection: 'column',
      justify: 'space-between',
      border: '2px solid var(--accent-purple)',
      background: 'linear-gradient(180deg, rgba(168, 85, 247, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)',
      borderRadius: 'var(--radius-xl)',
      padding: '2.25rem',
      position: 'relative',
      boxShadow: '0 12px 40px rgba(168, 85, 247, 0.15)'
    }}>
      <div style={{
        position: 'absolute',
        top: '-15px',
        left: '28px',
        background: 'linear-gradient(90deg, #a855f7, #6366f1)',
        color: '#fff',
        fontSize: '0.75rem',
        fontWeight: 900,
        padding: '0.3rem 1rem',
        borderRadius: '20px',
        letterSpacing: '0.06em',
        boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)'
      }}>
        OPTION 1: INDIVIDUAL TEACHER LICENSE
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', marginTop: '0.5rem' }}>
          <span className="badge badge-purple" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', fontWeight: 800 }}>
            <Crown size={14} /> INDIVIDUAL PRO
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--status-success)', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            ⚡ 100% AUTOMATIC INSTANT APPROVAL
          </span>
        </div>

        <h3 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '0.5rem' }}>
          Individual Teacher License
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
          Purchase an individual teacher license for your account. **Approved automatically and instantly** upon payment — no waiting for admin review! Access stays active forever when you log in.
        </p>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1.75rem' }}>
          <span style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--accent-purple)' }}>₹499</span>
          <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>/ month (or ₹4,999/year)</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '2.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle2 size={18} color="var(--accent-purple)" /> <strong>Automatic Instant Approval upon payment</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle2 size={18} color="var(--accent-purple)" /> <strong>Unlimited Spring AI rubric evaluation</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle2 size={18} color="var(--accent-purple)" /> Multi-algorithm plagiarism & integrity scanning
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle2 size={18} color="var(--accent-purple)" /> Automated parent email alerts & CSV gradebook export
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <button
          onClick={() => handleOpenCheckout('MONTHLY_PRO')}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '1rem',
            justify: 'center',
            fontSize: '1rem',
            fontWeight: 900,
            gap: '0.6rem',
            background: 'linear-gradient(135deg, #a855f7, #6366f1)',
            boxShadow: '0 0 25px rgba(168, 85, 247, 0.4)'
          }}
        >
          <Zap size={20} /> Buy Monthly License (₹499/mo) — Instant Approval
        </button>

        <button
          onClick={() => handleOpenCheckout('ANNUAL_PRO')}
          className="btn btn-secondary"
          style={{ width: '100%', padding: '0.85rem', justifyContent: 'center', fontSize: '0.88rem', fontWeight: 800, gap: '0.5rem' }}
        >
          <Crown size={16} color="var(--status-warning)" /> Buy Annual License (₹4,999/yr — Save 20%)
        </button>
      </div>
    </div>

    {/* OPTION 2: INSTITUTION PURCHASED DOMAIN LICENSE (REQUIRES PROOF & ADMIN APPROVAL) */}
    <div className="glass-card" style={{
      display: 'flex',
      flexDirection: 'column',
      justify: 'space-between',
      border: '2px solid var(--accent-blue)',
      background: 'linear-gradient(180deg, rgba(56, 189, 248, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)',
      borderRadius: 'var(--radius-xl)',
      padding: '2.25rem',
      position: 'relative',
      boxShadow: '0 12px 40px rgba(56, 189, 248, 0.15)'
    }}>
      <div style={{
        position: 'absolute',
        top: '-15px',
        left: '28px',
        background: 'linear-gradient(90deg, #38bdf8, #0284c7)',
        color: '#fff',
        fontSize: '0.75rem',
        fontWeight: 900,
        padding: '0.3rem 1rem',
        borderRadius: '20px',
        letterSpacing: '0.06em',
        boxShadow: '0 4px 15px rgba(56, 189, 248, 0.4)'
      }}>
        OPTION 2: INSTITUTION PURCHASED LICENSE
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', marginTop: '0.5rem' }}>
          <span className="badge badge-info" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', fontWeight: 800 }}>
            <Building2 size={14} /> INSTITUTIONAL B2B
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', fontWeight: 900 }}>
            Domain Whitelist Access
          </span>
        </div>

        <h3 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '0.5rem' }}>
          Institution Domain Access
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
          For universities & schools. Check if your domain is ALREADY approved, or purchase a campus license (₹49,999/yr) + submit document proof for Admin approval.
        </p>

        {/* Check Approved Domain Form */}
        <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-blue)', marginBottom: '0.5rem', display: 'block' }}>
            1. Check If Your Institution Domain Is Already Approved:
          </label>

          <form onSubmit={handleVerifyApprovedDomain} style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '180px', position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. university.edu or campus.ac.in"
                value={domainInput}
                onChange={e => setDomainInput(e.target.value)}
                style={{ paddingLeft: '2.4rem', width: '100%', fontSize: '0.9rem' }}
                required
              />
              <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
            <button type="submit" disabled={isProcessing} className="btn btn-primary" style={{ fontSize: '0.88rem', gap: '0.4rem', padding: '0.65rem 1.1rem', fontWeight: 800 }}>
              Verify Domain <ArrowRight size={15} />
            </button>
          </form>

          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.65rem' }}>
            💡 Automatic domain license detection runs on login for all registered campus domains.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle2 size={18} color="var(--accent-blue)" /> Campus-wide domain email whitelist for all teachers
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle2 size={18} color="var(--accent-blue)" /> Requires proof document upload & Admin Approval
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle2 size={16} color="var(--accent-blue)" /> Official B2B Tax GST Receipt (₹49,999/yr)
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsInstModalOpen(true)}
        className="btn btn-secondary"
        style={{
          width: '100%',
          padding: '1rem',
          justify: 'center',
          borderColor: 'var(--accent-blue)',
          color: 'var(--accent-blue)',
          fontWeight: 900,
          fontSize: '0.95rem',
          gap: '0.6rem',
          background: 'rgba(56, 189, 248, 0.1)'
        }}
      >
        <Building2 size={20} /> Buy Campus License (₹49,999/yr) & Submit Proof
      </button>
    </div>

  </div>
</div>

{/* Option 1: Payment Checkout Modal (INSTANT AUTOMATIC APPROVAL) */ }
{
  isCheckoutOpen && (
    <div className="modal-overlay" style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)' }}>
      <div className="modal-content" style={{ maxWidth: '650px', width: '100%', padding: 0, overflow: 'hidden', maxHeight: '88vh', display: 'flex', flexDirection: 'column', borderRadius: 'var(--radius-xl)', border: '2px solid var(--accent-purple)', boxShadow: '0 25px 70px rgba(168, 85, 247, 0.3)', background: 'var(--bg-primary)' }}>
        <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #d946ef 100%)', padding: '1.5rem 1.6rem', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <span className="badge badge-purple" style={{ background: 'rgba(255, 255, 255, 0.25)', color: '#fff', marginBottom: '0.4rem', fontWeight: 900 }}>
              <CreditCard size={13} /> Instant Checkout — Automatic Approval
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0, color: '#fff' }}>
              {selectedPlan === 'MONTHLY_PRO' ? 'Individual Teacher Pro License (Monthly)' : 'Individual Teacher Pro License (Annual Saver)'}
            </h3>
          </div>
          <button onClick={() => setIsCheckoutOpen(false)} className="btn btn-secondary btn-icon" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#fff', border: 'none', borderRadius: '50%' }}>
            ✕
          </button>
        </div>

        <div style={{ padding: '1.5rem 1.75rem 1.75rem', overflowY: 'auto', flex: 1 }}>
          {completedInvoice ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--status-success)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', textAlign: 'center' }}>
                <Receipt size={48} color="var(--status-success)" style={{ margin: '0 auto 0.5rem' }} />
                <h4 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--status-success)', margin: 0 }}>Payment Confirmed & Approved!</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                  Invoice <strong>{completedInvoice.invoiceNo}</strong> generated. Full software access is unlocked automatically.
                </p>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Billed To:</span>
                  <strong>{completedInvoice.billedTo} ({completedInvoice.email})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Transaction ID:</span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>{completedInvoice.transactionId}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Approval Status:</span>
                  <strong style={{ color: 'var(--status-success)' }}>Instant Automatic Approval (Active)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', fontWeight: 800 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total Amount Paid (incl 18% GST):</span>
                  <strong style={{ color: 'var(--status-success)', fontSize: '1rem' }}>₹{completedInvoice.totalAmount.toLocaleString()}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button 
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(true)} 
                  className="btn btn-secondary" 
                  style={{ gap: '0.4rem', fontWeight: 800, color: 'var(--accent-blue)', borderColor: 'rgba(59, 130, 246, 0.4)' }}
                >
                  <Eye size={14} /> View Official GST Tax Invoice
                </button>
                <button onClick={() => { setIsCheckoutOpen(false); if (onUnlocked) onUnlocked(); }} className="btn btn-primary" style={{ fontWeight: 800 }}>
                  Launch Full Dashboard Now
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleProcessPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>

              {/* Payment Method Selector Tabs */}
              <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.35rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                <button type="button" onClick={() => setPaymentMethod('CARD')} className={`btn btn-sm ${paymentMethod === 'CARD' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, fontWeight: 800, padding: '0.6rem' }}>
                  💳 Credit / Debit Card
                </button>
                <button type="button" onClick={() => setPaymentMethod('UPI')} className={`btn btn-sm ${paymentMethod === 'UPI' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, fontWeight: 800, padding: '0.6rem' }}>
                  ⚡ Instant UPI / GPay
                </button>
                <button type="button" onClick={() => setPaymentMethod('NETBANKING')} className={`btn btn-sm ${paymentMethod === 'NETBANKING' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, fontWeight: 800, padding: '0.6rem' }}>
                  🏦 NetBanking
                </button>
              </div>

              {paymentMethod === 'CARD' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Card Visual Mockup */}
                  <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', color: '#fff', boxShadow: '0 8px 25px rgba(49, 46, 129, 0.4)', position: 'relative', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.7)' }}>PREMIUM EDUCATOR CARD</span>
                      <span style={{ fontWeight: 900, fontSize: '0.95rem', letterSpacing: '0.05em' }}>VISA / MASTERCARD</span>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.15em', marginBottom: '1rem', fontWeight: 800 }}>
                      {cardNumber || '4532 •••• •••• 8892'}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                      <div>
                        <span style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.6)', display: 'block', textTransform: 'uppercase' }}>Cardholder</span>
                        <strong>{cardHolder || currentUser?.name || 'Educator Name'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.6)', display: 'block', textTransform: 'uppercase' }}>Expires</span>
                        <strong>08/28</strong>
                      </div>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Cardholder Name</label>
                    <input type="text" className="form-input" value={cardHolder} onChange={e => setCardHolder(e.target.value)} placeholder="Name on card" required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Card Number</label>
                    <input type="text" className="form-input" value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="4532 8892 1049 8892" required />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                      <label className="form-label">Expiry Date</label>
                      <input type="text" className="form-input" defaultValue="08/28" required />
                    </div>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                      <label className="form-label">CVV / CVC Code</label>
                      <input type="password" className="form-input" defaultValue="482" maxLength={4} required />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'UPI' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ background: '#ffffff', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '2px solid var(--accent-purple)', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
                    {/* Dynamic Mockup QR Code SVG */}
                    <svg width="150" height="150" viewBox="0 0 100 100" fill="none">
                      <rect width="100" height="100" fill="white" />
                      <path d="M10 10h30v30H10V10zm6 6v18h18V16H16z" fill="#0f172a" />
                      <path d="M22 22h6v6h-6v-6z" fill="#a855f7" />
                      <path d="M60 10h30v30H60V10zm6 6v18h18V16H66z" fill="#0f172a" />
                      <path d="M72 22h6v6h-6v-6z" fill="#a855f7" />
                      <path d="M10 60h30v30H10V60zm6 6v18h18V66H16z" fill="#0f172a" />
                      <path d="M22 72h6v6h-6v-6z" fill="#a855f7" />
                      <path d="M45 10h10v10H45V10zm10 20h10v10H55V30zm-10 20h20v10H45V50zm25 10h15v15H70V60zm-20 20h30v10H50V80z" fill="#0f172a" />
                    </svg>
                    <span style={{ fontSize: '0.72rem', color: '#0f172a', fontWeight: 800, display: 'block', marginTop: '0.4rem' }}>Scan with GPay / PhonePe / Paytm</span>
                  </div>

                  <div className="form-group" style={{ width: '100%', textAlign: 'left', marginBottom: 0 }}>
                    <label className="form-label">Or Enter Your Instant UPI VPA Address</label>
                    <input type="text" className="form-input" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="e.g. name@okaxis or 9876543210@paytm" required />
                  </div>
                </div>
              )}

              {paymentMethod === 'NETBANKING' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <label className="form-label">Select Your Bank for Direct NetBanking Checkout</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.6rem' }}>
                    {['HDFC Bank', 'ICICI Bank', 'SBI Bank', 'Axis Bank', 'Kotak Bank'].map(bank => (
                      <div key={bank} style={{ background: 'var(--bg-secondary)', padding: '0.75rem 0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }} className="google-acc-card">
                        🏦 {bank}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing Breakdown Box */}
              <div style={{ background: 'var(--bg-secondary)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Breakdown: Base Fee + 18% GST</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent-purple)' }}>
                    ₹{selectedPlan === 'MONTHLY_PRO' ? '588.82' : '5,898.82'} <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>(incl GST)</span>
                  </div>
                </div>
                <span className="badge badge-success" style={{ fontWeight: 800, padding: '0.45rem 0.85rem' }}><ShieldCheck size={14} /> 256-Bit SSL Encrypted</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsCheckoutOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={isProcessing} className="btn btn-primary" style={{ gap: '0.5rem', fontWeight: 900, padding: '0.85rem 1.5rem', fontSize: '0.95rem' }}>
                  {isProcessing ? 'Processing Payment...' : 'Complete Payment & Activate Pro'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

{/* Option 2: Institutional B2B Campus License Payment Checkout + Document Proof Upload Modal (REQUIRES ADMIN APPROVAL) */ }
{
  isInstModalOpen && (
    <div className="modal-overlay" style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)' }}>
      <div className="modal-content" style={{ maxWidth: '720px', width: '100%', padding: 0, overflow: 'hidden', maxHeight: '88vh', display: 'flex', flexDirection: 'column', borderRadius: 'var(--radius-xl)', border: '2px solid var(--accent-blue)', boxShadow: '0 25px 70px rgba(56, 189, 248, 0.3)', background: 'var(--bg-primary)' }}>
        <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 50%, #6366f1 100%)', padding: '1.5rem 1.6rem', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <span className="badge badge-info" style={{ background: 'rgba(255, 255, 255, 0.25)', color: '#fff', marginBottom: '0.4rem', fontWeight: 900 }}>
              <Building2 size={13} /> B2B Campus License Purchase & Document Proof Verification
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0, color: '#fff' }}>
              Institutional B2B Campus License (₹49,999/yr)
            </h3>
          </div>
          <button onClick={() => setIsInstModalOpen(false)} className="btn btn-secondary btn-icon" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#fff', border: 'none', borderRadius: '50%' }}>
            ✕
          </button>
        </div>

        <div style={{ padding: '1.5rem 1.75rem 1.75rem', overflowY: 'auto', flex: 1 }}>
          <form onSubmit={handleSubmitInstitutionalRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>

            <div style={{ background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.35)', padding: '1rem', borderRadius: 'var(--radius-lg)', fontSize: '0.85rem', color: 'var(--accent-blue)', lineHeight: '1.5' }}>
              <strong>ℹ️ B2B Campus Procurement Protocol:</strong> Submit your B2B campus license payment (₹49,999/yr + 18% GST) and attach your mandatory official document proof (Domain Ownership Certificate / University Authorization Letter). Requests are routed to Admin for document verification and 1-year domain activation.
            </div>

            {/* Section 1: Institution Details */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Building2 size={18} color="var(--accent-blue)" /> 1. Institution & Domain Details
              </h4>

              <div className="form-group">
                <label className="form-label">Institution / University Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Veermata Jijabai Technological Institute (VJTI)"
                  value={instName}
                  onChange={e => setInstName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Official Campus Domain Extension (e.g. vjti.ac.in)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. vjti.ac.in or university.edu"
                  value={instDomainExt}
                  onChange={e => setInstDomainExt(e.target.value)}
                  required
                />
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                  Once Admin verifies the uploaded document proof, all faculty registering with @{instDomainExt || 'campus.edu'} emails will automatically unlock access.
                </span>
              </div>

              <div className="grid-2">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Representative Contact Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Dr. K. S. Sharma"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Official Contact Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="dean@campus.ac.in"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <hr style={{ borderColor: 'var(--border-color)', margin: '0.25rem 0' }} />

            {/* Section 2: Upload Proof Document (STRICTLY MANDATORY) */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Upload size={18} color="var(--accent-purple)" /> 2. Upload Mandatory Document Proof <span style={{ color: 'var(--status-danger)', fontSize: '0.8rem' }}>*Required</span>
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                Attach Domain Ownership Certificate, Accreditation Certificate, or Authorized University Letterhead (PDF / Image up to 10MB).
              </p>

              <div className="form-group">
                <div style={{
                  border: proofFileName ? '2px solid var(--status-success)' : '2px dashed var(--accent-purple)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.6rem',
                  textAlign: 'center',
                  background: proofFileName ? 'rgba(16, 185, 129, 0.08)' : 'rgba(168, 85, 247, 0.05)',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    onChange={handleFileUpload}
                    required={!proofFileName}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                  />
                  {proofFileName ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--status-success)', fontWeight: 800, flexWrap: 'wrap' }}>
                      <FileCheck size={32} color="var(--status-success)" />
                      <div style={{ textAlign: 'left' }}>
                        <span style={{ fontSize: '0.98rem', display: 'block' }}>✓ Document Proof Attached:</span>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{proofFileName}</strong>
                      </div>
                      {proofFileDataUrl && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDocPreview({
                              fileUrl: proofFileDataUrl,
                              fileName: proofFileName,
                              fileType: 'pdf',
                              docData: {
                                institutionName: instName || 'Campus',
                                domainExtension: instDomainExt || currentTeacherDomain,
                                contactName: contactName || currentUser?.name,
                                contactEmail: contactEmail || currentUser?.email,
                                fileName: proofFileName,
                                submittedAt: new Date().toLocaleString()
                              }
                            });
                          }}
                          className="btn btn-sm btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', gap: '0.3rem', zIndex: 5 }}
                        >
                          <Eye size={12} /> Preview
                        </button>
                      )}
                    </div>
                  ) : (
                    <div>
                      <Upload size={36} color="var(--accent-purple)" style={{ margin: '0 auto 0.5rem' }} />
                      <span style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--text-primary)', display: 'block' }}>
                        Click or Drag & Drop Mandatory Proof Document Here
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                        Supported formats: PDF, PNG, JPG, DOCX (Max 10MB)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <hr style={{ borderColor: 'var(--border-color)', margin: '0.25rem 0' }} />

            {/* Section 3: B2B Payment Method Selection */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CreditCard size={18} color="var(--status-success)" /> 3. B2B License Payment (₹49,999/yr + 18% GST)
              </h4>

              <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.35rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                <button type="button" onClick={() => setInstPaymentMethod('CARD')} className={`btn btn-sm ${instPaymentMethod === 'CARD' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, fontWeight: 800 }}>
                  💳 Corporate Credit Card
                </button>
                <button type="button" onClick={() => setInstPaymentMethod('UPI')} className={`btn btn-sm ${instPaymentMethod === 'UPI' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, fontWeight: 800 }}>
                  ⚡ Instant UPI / GPay
                </button>
                <button type="button" onClick={() => setInstPaymentMethod('NETBANKING')} className={`btn btn-sm ${instPaymentMethod === 'NETBANKING' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, fontWeight: 800 }}>
                  🏦 NetBanking / PO
                </button>
              </div>

              {instPaymentMethod === 'CARD' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Corporate / University Cardholder Name</label>
                    <input type="text" className="form-input" defaultValue={contactName || 'University Procurement Accounts'} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Corporate Card Number</label>
                    <input type="text" className="form-input" defaultValue="4532 •••• •••• 8892" required />
                  </div>
                </div>
              )}

              {instPaymentMethod === 'UPI' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', alignItems: 'center', textTransform: 'center' }}>
                  <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: 'var(--radius-lg)', border: '2px solid var(--accent-blue)', textAlign: 'center' }}>
                    <svg width="130" height="130" viewBox="0 0 100 100" fill="none">
                      <rect width="100" height="100" fill="white" />
                      <path d="M10 10h30v30H10V10zm6 6v18h18V16H16z" fill="#0f172a" />
                      <path d="M22 22h6v6h-6v-6z" fill="#38bdf8" />
                      <path d="M60 10h30v30H60V10zm6 6v18h18V16H66z" fill="#0f172a" />
                      <path d="M72 22h6v6h-6v-6z" fill="#38bdf8" />
                      <path d="M10 60h30v30H10V60zm6 6v18h18V66H16z" fill="#0f172a" />
                      <path d="M22 72h6v6h-6v-6z" fill="#38bdf8" />
                      <path d="M45 10h10v10H45V10zm10 20h10v10H55V30zm-10 20h20v10H45V50zm25 10h15v15H70V60zm-20 20h30v10H50V80z" fill="#0f172a" />
                    </svg>
                    <span style={{ fontSize: '0.72rem', color: '#0f172a', fontWeight: 800, display: 'block', marginTop: '0.3rem' }}>B2B Corporate UPI QR Code</span>
                  </div>
                  <div className="form-group" style={{ width: '100%', textAlign: 'left', marginBottom: 0 }}>
                    <label className="form-label">Corporate VPA Address</label>
                    <input type="text" className="form-input" defaultValue="campus.accounts@okicici" required />
                  </div>
                </div>
              )}

              {instPaymentMethod === 'NETBANKING' && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">University Purchase Order (PO) / Bank Reference</label>
                  <input type="text" className="form-input" defaultValue="PO-2026-CAMPUS-9482" required />
                </div>
              )}

              <div style={{ background: 'var(--bg-secondary)', padding: '1.1rem 1.35rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>1-Year Campus B2B Tax Invoice Breakdown:</span>
                  <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--accent-blue)' }}>
                    ₹58,998.82 <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>(₹49,999 Base + ₹8,999.82 18% GST)</span>
                  </div>
                </div>
                <span className="badge badge-info" style={{ fontWeight: 800, padding: '0.45rem 0.85rem' }}><ShieldCheck size={14} /> B2B GST Tax Receipt</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => setIsInstModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={isProcessing} className="btn btn-primary" style={{ gap: '0.5rem', fontWeight: 900, padding: '0.95rem 1.6rem', fontSize: '0.98rem', background: 'linear-gradient(135deg, #0284c7, #38bdf8)' }}>
                {isProcessing ? 'Submitting Application & Payment...' : 'Submit B2B Payment & Proof for Admin Verification'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}

      {/* Proof Document Viewer Modal */}
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
