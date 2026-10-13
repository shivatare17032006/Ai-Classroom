import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useClassroom } from '../../context/ClassroomContext';
import { ApiService } from '../../services/api';
import { 
  Crown, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Building2, 
  CreditCard, 
  FileText, 
  Download, 
  Search,
  ArrowRight,
  Shield,
  HelpCircle,
  Receipt,
  Upload,
  FileCheck,
  Clock,
  Eye,
  Check,
  AlertCircle,
  Copy,
  ChevronRight,
  QrCode,
  Calendar,
  Layers,
  Percent,
  X
} from 'lucide-react';
import { DocumentViewerModal } from '../Common/DocumentViewerModal';
import { OfficialTaxInvoiceModal } from '../Common/OfficialTaxInvoiceModal';

export const TeacherBillingView = () => {
  const { currentUser, updateUserProfile, licenses: authLicenses, isProUser, getRemainingAiCredits, FREE_AI_CREDITS_LIMIT } = useAuth();
  const { addLicense, licenses: classroomLicenses } = useClassroom();
  
  const licenses = classroomLicenses && classroomLicenses.length > 0 ? classroomLicenses : (authLicenses || []);
  
  // Billing cycle switcher: 'ANNUAL' (Save 20%) | 'MONTHLY'
  const [billingCycle, setBillingCycle] = useState('ANNUAL');
  
  // Modal states
  const [selectedPlan, setSelectedPlan] = useState(null); // 'MONTHLY_PRO' | 'ANNUAL_PRO' | 'ENTERPRISE'
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [activeDocPreview, setActiveDocPreview] = useState(null);
  const [activeInvoicePreview, setActiveInvoicePreview] = useState(null);

  // Payment rail states
  const [paymentRail, setPaymentRail] = useState('CARD'); // 'CARD' | 'UPI' | 'PO'
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardHolder, setCardHolder] = useState(currentUser?.name || 'Educator');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('482');
  const [upiId, setUpiId] = useState('faculty@okaxis');
  const [poNumber, setPoNumber] = useState('PO-2026-CAMPUS-9418');

  // Coupon / Promo code state
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); // in INR
  const [couponStatus, setCouponStatus] = useState(null); // { type: 'success' | 'error', message: string }

  // Institutional B2B Claim / Search state
  const userDomain = currentUser?.email ? currentUser.email.split('@')[1]?.toLowerCase() : '';
  const [instDomainSearch, setInstDomainSearch] = useState('');
  const [instName, setInstName] = useState('');
  const [instDomainExt, setInstDomainExt] = useState(userDomain || '');
  const [contactName, setContactName] = useState(currentUser?.name || '');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || '');
  const [proofFile, setProofFile] = useState(null);
  const [proofFileName, setProofFileName] = useState('');
  const [proofFileDataUrl, setProofFileDataUrl] = useState(null);

  // Status & processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusNotification, setStatusNotification] = useState(null);

  const isPro = isProUser(currentUser);
  const creditsUsed = currentUser?.aiCreditsUsed || 0;
  const currentTeacherDomain = userDomain;

  const activeDomainLicense = Array.isArray(licenses) ? licenses.find(l => 
    l.domainExtension && 
    l.domainExtension.toLowerCase().replace('@', '') === currentTeacherDomain && 
    l.status === 'ACTIVE' && 
    l.aiServicesAllowed !== false
  ) : null;

  const pendingDomainLicense = Array.isArray(licenses) ? licenses.find(l => 
    l.domainExtension && 
    l.domainExtension.toLowerCase().replace('@', '') === currentTeacherDomain && 
    l.status === 'PENDING_VERIFICATION'
  ) : null;

  // Real-world dynamic invoice history
  const [billingHistory, setBillingHistory] = useState([
    {
      invoiceNo: 'INV-2026-09418',
      date: 'Oct 01, 2026',
      planTitle: isPro ? 'Individual Pro Educator Annual Cloud License' : 'Educator Starter Trial Activation',
      amountInr: isPro ? 4999 : 0,
      paymentMethod: 'Mastercard ending in 8892',
      status: 'PAID',
      billedTo: currentUser?.name || 'Educator',
      email: currentUser?.email || 'faculty@campus.edu',
      institution: activeDomainLicense?.institutionName || 'Academic Campus',
      transactionId: 'TXN-RAZORPAY-941829'
    }
  ]);

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

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (clean === 'DIWALI2026' || clean === 'CAMPUS20' || clean === 'PRO20') {
      setAppliedDiscount(500);
      setCouponStatus({ type: 'success', message: '🎉 Promo code applied! ₹500 instant discount deducted.' });
    } else if (clean === 'FREEMONTH') {
      setAppliedDiscount(499);
      setCouponStatus({ type: 'success', message: '🎉 1 Month Free Educator credit applied!' });
    } else {
      setAppliedDiscount(0);
      setCouponStatus({ type: 'error', message: 'Invalid or expired promotional coupon code.' });
    }
  };

  const handleOpenCheckout = (planKey) => {
    setSelectedPlan(planKey);
    setIsCheckoutOpen(true);
    setCouponCode('');
    setAppliedDiscount(0);
    setCouponStatus(null);
  };

  const handleConfirmCancelSubscription = async () => {
    setIsProcessing(true);
    try {
      await new Promise(res => setTimeout(res, 600));
      await updateUserProfile({ planType: 'FREE' });
      setStatusNotification({ type: 'success', text: 'Subscription cancelled. Account reverted to Educator Free Tier.' });
      setIsCancelModalOpen(false);
    } catch (err) {
      setStatusNotification({ type: 'error', text: 'Failed to cancel subscription.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      await new Promise(res => setTimeout(res, 900));

      if (selectedPlan === 'ENTERPRISE') {
        const cleanDomain = (instDomainExt || userDomain || 'campus.edu').trim().toLowerCase().replace('@', '');
        const targetInstName = instName || `${cleanDomain.toUpperCase()} Campus`;

        await addLicense({
          institutionName: targetInstName,
          domainExtension: cleanDomain,
          planType: 'ENTERPRISE_ANNUAL',
          priceInInr: 49999.0,
          status: 'PENDING_VERIFICATION',
          aiServicesAllowed: false,
          contactName: contactName || currentUser?.name || 'Educator',
          contactEmail: contactEmail || currentUser?.email || '',
          proofDocumentName: proofFileName || (proofFile ? proofFile.name : 'Campus_Domain_Ownership_Proof.pdf'),
          proofDocumentUrl: proofFileDataUrl || ''
        });

        const newInv = {
          invoiceNo: `INV-2026-${Math.floor(100000 + Math.random() * 900000)}`,
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          planTitle: 'Institutional Campus License (1 Year)',
          amountInr: 49999,
          discountInr: appliedDiscount,
          paymentMethod: paymentRail === 'CARD' ? `Card (ending ${cardNumber.slice(-4)})` : paymentRail === 'UPI' ? `UPI (${upiId})` : `PO (${poNumber})`,
          status: 'PAID',
          billedTo: contactName || currentUser?.name || 'Educator',
          email: contactEmail || currentUser?.email || '',
          institution: targetInstName,
          transactionId: `TXN-CAMPUS-${Date.now()}`
        };

        setBillingHistory(prev => [newInv, ...prev]);
        setIsCheckoutOpen(false);
        setActiveInvoicePreview(newInv);
        setStatusNotification({ type: 'warning', text: '📋 Institutional License payment & proof submitted to Admin Verification Queue!' });

      } else {
        const isAnnual = selectedPlan === 'ANNUAL_PRO';
        const planTitle = isAnnual ? 'Individual Pro Educator (Annual Saver)' : 'Individual Pro Educator (Monthly)';
        const amountInr = isAnnual ? 4999 : 499;

        await updateUserProfile({ 
          planType: 'INDIVIDUAL_PRO',
          isProUser: true,
          tier: 'PRO',
          proPurchasedAt: new Date().toISOString()
        });

        const newInv = {
          invoiceNo: `INV-2026-${Math.floor(100000 + Math.random() * 900000)}`,
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          planTitle,
          amountInr,
          discountInr: appliedDiscount,
          paymentMethod: paymentRail === 'CARD' ? `Card (ending ${cardNumber.slice(-4)})` : `UPI (${upiId})`,
          status: 'PAID',
          billedTo: currentUser?.name || 'Educator',
          email: currentUser?.email || '',
          institution: currentUser?.email?.split('@')[1] || 'Academic Institution',
          transactionId: `TXN-PRO-${Date.now()}`
        };

        setBillingHistory(prev => [newInv, ...prev]);
        setIsCheckoutOpen(false);
        setActiveInvoicePreview(newInv);
        setStatusNotification({ type: 'success', text: `🎉 Payment Confirmed! Your ${planTitle} is now ACTIVE.` });
      }

    } catch (err) {
      setStatusNotification({ type: 'error', text: 'Payment transaction failed. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyEnterpriseDomain = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    const checkDomain = (instDomainSearch || userDomain).trim().toLowerCase().replace('@', '');

    if (!checkDomain) {
      setStatusNotification({ type: 'error', text: 'Please enter a valid academic domain (e.g. vit.edu).' });
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
        setStatusNotification({ type: 'success', text: `✨ Verified Active Institutional License for ${matched.institutionName}! All software features unlocked.` });
      } else {
        setStatusNotification({ type: 'error', text: `Domain @${checkDomain} is not currently registered under an active Campus License. You can purchase a campus license below.` });
      }
    } catch (err) {
      setStatusNotification({ type: 'error', text: 'Error verifying domain.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Base and tax calculations for checkout
  const currentPlanBasePrice = selectedPlan === 'MONTHLY_PRO' ? 499 : selectedPlan === 'ANNUAL_PRO' ? 4999 : 49999;
  const taxableSubtotal = Math.max(0, currentPlanBasePrice - appliedDiscount);
  const checkoutCgst = Math.round(taxableSubtotal * 0.09 * 100) / 100;
  const checkoutSgst = Math.round(taxableSubtotal * 0.09 * 100) / 100;
  const checkoutTotalDue = Math.round((taxableSubtotal + checkoutCgst + checkoutSgst) * 100) / 100;

  return (
    <div className="billing-page" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1380px', margin: '0 auto' }}>

      {/* Breadcrumbs & Enterprise Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            <span>Organization Settings</span>
            <ChevronRight size={13} />
            <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>Billing, Quotas & Invoicing</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            Billing and plans
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
            Manage your plan, payment details, invoices, and institution access.
          </p>
        </div>

        {/* Live Active Status Pill */}
        <div className="billing-status" style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '14px',
          padding: '0.65rem 1.15rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <span className="radar-pulse-dot" />
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>
              Current plan
            </span>
            <strong style={{ fontSize: '0.95rem', color: isPro || activeDomainLicense ? 'var(--status-success)' : pendingDomainLicense ? 'var(--status-warning)' : 'var(--text-primary)' }}>
              {activeDomainLicense 
                ? `🏛️ Institutional Campus (${activeDomainLicense.institutionName || currentTeacherDomain})`
                : currentUser?.planType === 'INDIVIDUAL_PRO'
                ? '⭐ Pro Educator (Active)'
                : pendingDomainLicense
                ? '⏳ Verification Pending'
                : '🔒 License Required'}
            </strong>
          </div>
          {isPro && (
            <button 
              onClick={() => setIsCancelModalOpen(true)} 
              className="btn btn-sm btn-secondary"
              style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem', color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Global Status Notifications */}
      {statusNotification && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          fontWeight: 700,
          fontSize: '0.9rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: statusNotification.type === 'success' ? '#ecfdf5' : statusNotification.type === 'warning' ? '#fffbeb' : '#fef2f2',
          border: statusNotification.type === 'success' ? '1px solid #10b981' : statusNotification.type === 'warning' ? '1px solid #f59e0b' : '1px solid #ef4444',
          color: statusNotification.type === 'success' ? '#065f46' : statusNotification.type === 'warning' ? '#92400e' : '#991b1b'
        }}>
          <span>{statusNotification.text}</span>
          <button onClick={() => setStatusNotification(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Institutional B2B Verification Stepper (Visible if Pending Application) */}
      {pendingDomainLicense && (
        <div className="glass-card" style={{ borderLeft: '5px solid #f59e0b', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, transparent 100%)', padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <span className="badge badge-warning" style={{ fontWeight: 800, marginBottom: '0.3rem' }}>
                ⏳ STEP 2 OF 3: ADMIN VERIFICATION IN PROGRESS
              </span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0 }}>
                Campus Domain Whitelist Request for @{pendingDomainLicense.domainExtension}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                Your institution registration and payment of ₹49,999 have been received. System Administrators are reviewing your proof of domain ownership.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveDocPreview({
                fileUrl: pendingDomainLicense.proofDocumentUrl || '',
                fileName: pendingDomainLicense.proofDocumentName || 'Campus_Proof.pdf',
                fileType: 'pdf',
                docData: {
                  institutionName: pendingDomainLicense.institutionName,
                  domainExtension: pendingDomainLicense.domainExtension,
                  contactName: pendingDomainLicense.contactName,
                  contactEmail: pendingDomainLicense.contactEmail,
                  fileName: pendingDomainLicense.proofDocumentName || 'Campus_Proof.pdf',
                  submittedAt: pendingDomainLicense.createdAt ? new Date(pendingDomainLicense.createdAt).toLocaleString() : new Date().toLocaleDateString()
                }
              })}
              className="btn btn-primary"
              style={{ gap: '0.45rem', fontSize: '0.85rem', fontWeight: 800, background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
            >
              <Eye size={15} /> 📄 Inspect Uploaded Proof Document
            </button>
          </div>

          {/* Stepper Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', background: 'var(--bg-secondary)', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.82rem' }}>
                ✓
              </div>
              <div>
                <strong style={{ fontSize: '0.82rem', display: 'block', color: 'var(--text-primary)' }}>1. Application & Proof</strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Attached: {pendingDomainLicense.proofDocumentName || 'Proof.pdf'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f59e0b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.82rem' }}>
                ⏳
              </div>
              <div>
                <strong style={{ fontSize: '0.82rem', display: 'block', color: '#f59e0b' }}>2. Admin Compliance Audit</strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Pending in Admin Verification Queue</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', opacity: 0.6 }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--border-color)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.82rem' }}>
                3
              </div>
              <div>
                <strong style={{ fontSize: '0.82rem', display: 'block', color: 'var(--text-primary)' }}>3. Domain Whitelisted</strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Automated unlock for all faculty</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: RESOURCE CONSUMPTION & AI QUOTA COCKPIT (Real-world feel!) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} color="var(--accent-indigo)" /> Current Billing Cycle Resource Usage
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Billing Cycle: <strong>Oct 01 - Oct 31, 2026</strong> (Resets on 1st of month)
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          
          {/* Card 1: AI Grading Evaluations */}
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
                  Spring AI Grading Engine
                </span>
                <div style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {isPro || activeDomainLicense ? 'Unlimited' : `${creditsUsed} / ${FREE_AI_CREDITS_LIMIT}`}
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '0.35rem' }}>
                    {isPro || activeDomainLicense ? 'Evaluations Available' : 'Tokens Used'}
                  </span>
                </div>
              </div>
              <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                {isPro || activeDomainLicense ? '⚡ UNLIMITED PRO' : 'TRIAL CREDITS'}
              </span>
            </div>

            <div className="quota-progress-track">
              <div 
                className="quota-progress-fill" 
                style={{ 
                  width: isPro || activeDomainLicense ? '100%' : `${Math.min(100, (creditsUsed / FREE_AI_CREDITS_LIMIT) * 100)}%`,
                  background: isPro || activeDomainLicense ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #f59e0b, #ef4444)'
                }} 
              />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Multi-Rubric Evaluation Pipeline</span>
              <span>100% SLA Uptime</span>
            </div>
          </div>

          {/* Card 2: Plagiarism Detection Scans */}
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
                  Plagiarism & Academic Integrity
                </span>
                <div style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {isPro || activeDomainLicense ? 'Multi-Vector' : 'Basic Vector'}
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '0.35rem' }}>
                    Dual Levenshtein + Jaccard
                  </span>
                </div>
              </div>
              <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
                <ShieldCheck size={12} /> Real-Time
              </span>
            </div>

            <div className="quota-progress-track">
              <div className="quota-progress-fill" style={{ width: '85%', background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Cross-Batch Student Comparison</span>
              <span>Audited</span>
            </div>
          </div>

          {/* Card 3: Active Classroom Seats */}
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
                  Enrolled Students & Courses
                </span>
                <div style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {isPro || activeDomainLicense ? 'Unlimited' : 'Up to 30'}
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '0.35rem' }}>
                    Student Capacity
                  </span>
                </div>
              </div>
              <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
                Active Cohorts
              </span>
            </div>

            <div className="quota-progress-track">
              <div className="quota-progress-fill" style={{ width: '42%', background: 'linear-gradient(90deg, #a855f7, #ec4899)' }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Automated Parent Email Alerts</span>
              <span>Enabled</span>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 2: PRICING PLANS WITH REAL-WORLD BILLING SWITCHER */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0 }}>
              Choose a plan
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
              All plans include an official GST invoice. You can change or cancel your plan at any time.
            </p>
          </div>

          {/* Interactive Monthly / Annual Switcher */}
          <div className="billing-switcher-container">
            <button 
              type="button"
              onClick={() => setBillingCycle('MONTHLY')}
              className={`billing-switcher-btn ${billingCycle === 'MONTHLY' ? 'active' : ''}`}
            >
              Monthly Billing
            </button>
            <button 
              type="button"
              onClick={() => setBillingCycle('ANNUAL')}
              className={`billing-switcher-btn ${billingCycle === 'ANNUAL' ? 'active' : ''}`}
            >
              Annual Billing
              <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem', marginLeft: '0.2rem' }}>
                SAVE 20% + 2 MO FREE ✨
              </span>
            </button>
          </div>
        </div>

        {/* 2 Official Academic SaaS Licensing Models */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.75rem' }}>

          {/* TIER 2: Pro Educator (Recommended) */}
          <div className="glass-card plan-card featured" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between', 
            padding: '1.75rem', 
            borderRadius: '16px',
            border: '2px solid var(--accent-indigo)',
            background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.06) 0%, transparent 100%)',
            position: 'relative',
            boxShadow: '0 12px 30px -10px rgba(99, 102, 241, 0.3)'
          }}>
            <div className="plan-ribbon" style={{ position: 'absolute', top: '-12px', right: '20px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', fontSize: '0.68rem', fontWeight: 900, padding: '0.25rem 0.8rem', borderRadius: '20px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Recommended
            </div>

            <div>
              <span className="badge badge-purple" style={{ marginBottom: '0.75rem', fontWeight: 800 }}>
                <Sparkles size={12} /> PRO EDUCATOR LICENSE
              </span>
              <h4 style={{ fontSize: '1.3rem', fontWeight: 900, margin: '0.2rem 0' }}>Individual Pro Faculty</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.25rem 0 1.25rem 0' }}>
                Full automatic access to Spring AI rubric grading, multi-vector plagiarism scans, and gradebook exports.
              </p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--accent-indigo)' }}>
                  {billingCycle === 'ANNUAL' ? '₹4,999' : '₹499'}
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {billingCycle === 'ANNUAL' ? '/ year (Save ₹989)' : '/ month'}
                </span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.84rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                  <CheckCircle2 size={16} color="var(--accent-indigo)" /> Starts immediately after payment
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--accent-indigo)" /> Unlimited Spring AI Rubric Evaluations
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--accent-indigo)" /> Dual-Algorithm Plagiarism Audits
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--accent-indigo)" /> Automated Parent Notifications for Low Marks
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--accent-indigo)" /> Instant GST Compliant Tax Invoice & PDF
                </li>
              </ul>
            </div>

            {currentUser?.planType === 'INDIVIDUAL_PRO' ? (
              <button 
                onClick={() => setIsCancelModalOpen(true)}
                className="btn btn-secondary" 
                style={{ width: '100%', color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.4)', fontWeight: 800 }}
              >
                ✓ Active Pro Plan (Manage / Cancel)
              </button>
            ) : (
              <button 
                onClick={() => handleOpenCheckout(billingCycle === 'ANNUAL' ? 'ANNUAL_PRO' : 'MONTHLY_PRO')}
                className="btn btn-primary" 
                style={{ width: '100%', gap: '0.5rem', fontWeight: 900 }}
              >
                <Zap size={16} /> Upgrade to Pro ({billingCycle === 'ANNUAL' ? '₹4,999/yr' : '₹499/mo'})
              </button>
            )}
          </div>

          {/* TIER 3: Institutional Campus License (B2B Enterprise) */}
          <div className="glass-card plan-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.75rem', borderRadius: '16px', border: '1px solid var(--accent-blue)', background: 'linear-gradient(180deg, rgba(56, 189, 248, 0.05) 0%, transparent 100%)' }}>
            <div>
              <span className="badge badge-info" style={{ marginBottom: '0.75rem', fontWeight: 800 }}>
                <Building2 size={12} /> B2B ENTERPRISE
              </span>
              <h4 style={{ fontSize: '1.3rem', fontWeight: 900, margin: '0.2rem 0' }}>Institutional Campus</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.25rem 0 1.25rem 0' }}>
                Full campus deployment. Every teacher signing up with your domain gets automatic instant software unlock.
              </p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--accent-blue)' }}>₹49,999</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>/ year per university</span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.84rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                  <CheckCircle2 size={16} color="var(--accent-blue)" /> Auto-whitelists all faculty with matching @domain
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--accent-blue)" /> Unlimited faculty & classroom seats
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--accent-blue)" /> Mandatory Document Proof Upload & Admin Review
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--accent-blue)" /> Official University PO & Purchase Order Support
                </li>
              </ul>
            </div>

            <button 
              onClick={() => handleOpenCheckout('ENTERPRISE')}
              className="btn btn-secondary" 
              style={{ width: '100%', borderColor: 'var(--accent-blue)', color: 'var(--accent-blue)', fontWeight: 800, gap: '0.4rem' }}
            >
              <Building2 size={16} /> Purchase Campus License & Submit Proof
            </button>
          </div>

        </div>
      </div>

      {/* SECTION 3: CLAIM CAMPUS DOMAIN TOOL */}
      <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderLeft: '4px solid var(--accent-blue)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <Building2 size={24} color="var(--accent-blue)" />
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Check / Claim Existing Campus Domain Whitelist</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              If your university/college already purchased a campus license, enter your campus domain to unlock full access immediately.
            </p>
          </div>
        </div>

        <form onSubmit={handleVerifyEnterpriseDomain} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder={userDomain ? `@${userDomain}` : 'e.g. vit.edu or campus.ac.in'}
              value={instDomainSearch}
              onChange={e => setInstDomainSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.5rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          <button type="submit" disabled={isProcessing} className="btn btn-primary" style={{ gap: '0.5rem', fontWeight: 800 }}>
            {isProcessing ? 'Verifying Domain...' : 'Verify Domain License'} <ArrowRight size={16} />
          </button>
        </form>
      </div>

      {/* SECTION 4: REAL-WORLD BILLING & INVOICE HISTORY TABLE */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Receipt size={20} color="var(--status-success)" /> Official Billing & Tax Invoices
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
              GST compliant digital tax invoices. Download PDF receipts for your institutional reimbursement or expense filing.
            </p>
          </div>

          <span className="badge badge-success" style={{ fontWeight: 800, fontSize: '0.75rem' }}>
            <ShieldCheck size={14} /> 100% Tax Compliant
          </span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Billing Date</th>
                <th>Plan Description</th>
                <th>Amount (INR)</th>
                <th>Payment Rail</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {billingHistory.map((inv) => (
                <tr key={inv.invoiceNo}>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--accent-blue)', fontSize: '0.85rem' }}>
                      {inv.invoiceNo}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>{inv.date}</td>
                  <td>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block' }}>{inv.planTitle}</strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>HSN/SAC: 998314</span>
                  </td>
                  <td>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      ₹{inv.amountInr.toLocaleString('en-IN')}.00
                    </strong>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {inv.paymentMethod}
                  </td>
                  <td>
                    <span className="badge badge-success" style={{ fontSize: '0.72rem', fontWeight: 800 }}>
                      ✓ {inv.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button 
                        type="button"
                        onClick={() => setActiveInvoicePreview(inv)}
                        className="btn btn-sm btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', gap: '0.3rem' }}
                      >
                        <Eye size={12} /> View Tax Invoice
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* REAL-WORLD 2-COLUMN FINTECH CHECKOUT MODAL                           */}
      {/* ==================================================================== */}
      {isCheckoutOpen && (
        <div className="modal-overlay">
          <div 
            className="modal-content" 
            style={{ 
              maxWidth: '920px', 
              width: '95%', 
              padding: 0, 
              overflow: 'hidden', 
              maxHeight: '92vh', 
              display: 'flex', 
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Modal Header */}
            <div className="checkout-header" style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
              padding: '1.25rem 1.75rem',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div>
                <span className="badge badge-purple" style={{ background: 'rgba(168, 85, 247, 0.25)', color: '#d8b4fe', marginBottom: '0.3rem', fontWeight: 800 }}>
                  <ShieldCheck size={12} /> PCI-DSS 256-Bit Encrypted Payment
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0, color: '#f8fafc' }}>
                  {selectedPlan === 'MONTHLY_PRO' ? 'Pro Educator License (Monthly)' : selectedPlan === 'ANNUAL_PRO' ? 'Pro Educator License (Annual Saver)' : 'Institutional Campus B2B License'}
                </h3>
              </div>
              <button onClick={() => setIsCheckoutOpen(false)} className="btn btn-secondary btn-icon" style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: 'none' }}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: 2 Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', overflowY: 'auto', flex: 1, background: 'var(--bg-card)' }}>
              
              {/* Left Column: Interactive Payment Rail */}
              <div style={{ padding: '1.75rem', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Payment Rail Selector */}
                <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--bg-secondary)', padding: '0.3rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <button 
                    type="button" 
                    onClick={() => setPaymentRail('CARD')} 
                    className={`btn btn-sm ${paymentRail === 'CARD' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, fontWeight: 800, fontSize: '0.78rem' }}
                  >
                    💳 Card
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPaymentRail('UPI')} 
                    className={`btn btn-sm ${paymentRail === 'UPI' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, fontWeight: 800, fontSize: '0.78rem' }}
                  >
                    ⚡ Instant UPI
                  </button>
                  {selectedPlan === 'ENTERPRISE' && (
                    <button 
                      type="button" 
                      onClick={() => setPaymentRail('PO')} 
                      className={`btn btn-sm ${paymentRail === 'PO' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1, fontWeight: 800, fontSize: '0.78rem' }}
                    >
                      🏛️ PO / Proof
                    </button>
                  )}
                </div>

                <form onSubmit={handleProcessPayment} id="checkout-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  {/* RAIL 1: INTERACTIVE CREDIT CARD */}
                  {paymentRail === 'CARD' && (
                    <>
                      {/* Visual 3D Credit Card Graphic */}
                      <div className="fintech-card-visual" style={{ margin: '0 auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', letterSpacing: '0.1em', fontWeight: 800, opacity: 0.8 }}>
                            EDUCATOR PRO ACCESS
                          </span>
                          <span style={{ fontSize: '1.1rem', fontWeight: 900, fontStyle: 'italic', letterSpacing: '0.05em' }}>
                            VISA
                          </span>
                        </div>

                        <div className="fintech-chip" />

                        <div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', letterSpacing: '0.18em', textShadow: '0 2px 4px rgba(0,0,0,0.4)', marginBottom: '0.65rem' }}>
                            {cardNumber || '•••• •••• •••• ••••'}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', opacity: 0.85, textTransform: 'uppercase' }}>
                            <div>
                              <span style={{ fontSize: '0.55rem', display: 'block', opacity: 0.7 }}>CARDHOLDER</span>
                              <strong>{cardHolder || 'EDUCATOR NAME'}</strong>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.55rem', display: 'block', opacity: 0.7 }}>EXPIRES</span>
                              <strong>{cardExpiry || 'MM/YY'}</strong>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Input Fields */}
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Name on Card</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={cardHolder} 
                          onChange={e => setCardHolder(e.target.value)} 
                          required 
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Card Number (16 Digits)</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={cardNumber} 
                          onChange={e => setCardNumber(e.target.value)} 
                          placeholder="4532 8819 2049 8892" 
                          required 
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Expiry (MM/YY)</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            value={cardExpiry} 
                            onChange={e => setCardExpiry(e.target.value)} 
                            placeholder="08/28" 
                            required 
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
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
                    </>
                  )}

                  {/* RAIL 2: INSTANT DYNAMIC UPI QR */}
                  {paymentRail === 'UPI' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
                      <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '16px', border: '2px solid var(--accent-indigo)', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
                        <QrCode size={160} color="#0f172a" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', display: 'block', marginTop: '0.5rem' }}>
                          BHARAT DYNAMIC UPI QR
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          Scan with GPay, PhonePe, Paytm or CRED
                        </span>
                      </div>

                      <div style={{ width: '100%', textAlign: 'left' }}>
                        <label className="form-label">Or Enter Custom UPI VPA ID</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input 
                            type="text" 
                            className="form-input" 
                            value={upiId} 
                            onChange={e => setUpiId(e.target.value)} 
                            placeholder="username@okaxis" 
                            required 
                          />
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                          Instant 2-second automated payment confirmation hook
                        </span>
                      </div>
                    </div>
                  )}

                  {/* RAIL 3: ENTERPRISE PROOF UPLOAD & PO */}
                  {selectedPlan === 'ENTERPRISE' && paymentRail === 'PO' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">University / Institution Legal Name</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="e.g. Pune Institute of Computer Technology"
                          value={instName}
                          onChange={e => setInstName(e.target.value)}
                          required 
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Campus Email Domain (@extension)</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="e.g. pict.edu"
                          value={instDomainExt}
                          onChange={e => setInstDomainExt(e.target.value)}
                          required 
                        />
                      </div>

                      {/* Proof Document File Drop */}
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Mandatory Domain Proof Document (Letterhead / Certificate)</label>
                        <div style={{ border: '2px dashed var(--accent-purple)', padding: '1rem', borderRadius: '12px', textAlign: 'center', position: 'relative', cursor: 'pointer', background: 'var(--bg-secondary)' }}>
                          <input 
                            type="file" 
                            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                            onChange={handleFileUpload}
                            required={!proofFileName}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                          />
                          {proofFileName ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--status-success)', fontWeight: 800 }}>
                              <FileCheck size={24} />
                              <span style={{ fontSize: '0.85rem' }}>{proofFileName}</span>
                            </div>
                          ) : (
                            <div>
                              <Upload size={28} color="var(--accent-purple)" style={{ margin: '0 auto 0.25rem' }} />
                              <span style={{ fontSize: '0.82rem', fontWeight: 800, display: 'block' }}>Click or Drop Proof Document Here</span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PDF, PNG, DOCX (Max 10MB)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                </form>
              </div>

              {/* Right Column: Order Summary, Coupon, & Tax Calculation */}
              <div className="checkout-summary" style={{ padding: '1.75rem', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                    Itemized Order Summary
                  </h4>

                  {/* Plan Line Item */}
                  <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <strong style={{ fontSize: '0.95rem' }}>
                        {selectedPlan === 'MONTHLY_PRO' ? 'Pro Faculty (Monthly)' : selectedPlan === 'ANNUAL_PRO' ? 'Pro Faculty (Annual)' : 'Campus Domain B2B License'}
                      </strong>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                        ₹{currentPlanBasePrice.toLocaleString('en-IN')}.00
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      SAC 998314 | Unlimited AI Evaluation Engine
                    </span>
                  </div>

                  {/* Coupon Code Input */}
                  <form onSubmit={handleApplyCoupon} style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>Have a Promo / Institutional Discount Code?</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Try: DIWALI2026 or CAMPUS20"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value)}
                        style={{ fontSize: '0.82rem', textTransform: 'uppercase' }}
                      />
                      <button type="submit" className="btn btn-sm btn-secondary" style={{ fontWeight: 800, padding: '0 0.9rem' }}>
                        Apply
                      </button>
                    </div>
                    {couponStatus && (
                      <span style={{ fontSize: '0.75rem', color: couponStatus.type === 'success' ? '#10b981' : '#ef4444', fontWeight: 700, marginTop: '0.3rem', display: 'block' }}>
                        {couponStatus.message}
                      </span>
                    )}
                  </form>

                  {/* Itemized Calculation */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.84rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Subtotal (Base Value):</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>₹{currentPlanBasePrice.toLocaleString('en-IN')}.00</span>
                    </div>

                    {appliedDiscount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 800 }}>
                        <span>Promotional Coupon Discount:</span>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>-₹{appliedDiscount.toLocaleString('en-IN')}.00</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>CGST (9.0%):</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>₹{checkoutCgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>SGST (9.0%):</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>₹{checkoutSgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.4rem 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                      <span>Total Due Today:</span>
                      <span style={{ color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>
                        ₹{checkoutTotalDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <button 
                    type="submit" 
                    form="checkout-form"
                    disabled={isProcessing}
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '0.85rem', fontWeight: 900, fontSize: '0.98rem', gap: '0.5rem', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}
                  >
                    {isProcessing ? 'Processing Transaction...' : `🔒 Confirm & Pay ₹${checkoutTotalDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                  </button>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Instant automatic invoice generation upon transaction completion.
                  </span>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* Subscription Cancellation Modal */}
      {isCancelModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ef4444' }}>
                Cancel Educator Subscription?
              </h3>
              <button onClick={() => setIsCancelModalOpen(false)} className="btn btn-secondary btn-icon">✕</button>
            </div>
            
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Are you sure you want to cancel your active Pro educator plan? Your access to unlimited Spring AI grading and parent email dispatches will be revoked at the end of the billing period.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={() => setIsCancelModalOpen(false)} className="btn btn-secondary">
                Keep Active Plan
              </button>
              <button onClick={handleConfirmCancelSubscription} disabled={isProcessing} className="btn btn-danger">
                {isProcessing ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
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
        />
      )}

      {/* Authentic GST Tax Invoice Modal */}
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
