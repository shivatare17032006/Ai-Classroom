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
  Clock
} from 'lucide-react';

export const TeacherBillingView = () => {
  const { currentUser, updateUserProfile, licenses: authLicenses, isProUser, getRemainingAiCredits, FREE_AI_CREDITS_LIMIT } = useAuth();
  const { addLicense, licenses: classroomLicenses } = useClassroom();
  
  const licenses = classroomLicenses && classroomLicenses.length > 0 ? classroomLicenses : (authLicenses || []);
  
  const [selectedPlan, setSelectedPlan] = useState(null); // 'MONTHLY_PRO' | 'ANNUAL_PRO' | 'ENTERPRISE'
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CARD'); // 'CARD' | 'UPI' | 'NETBANKING'
  const [cardHolder, setCardHolder] = useState(currentUser?.name || '');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [upiId, setUpiId] = useState('teacher@okaxis');
  const [instDomain, setInstDomain] = useState('');
  
  // Institutional B2B Proof Upload State
  const userDomain = currentUser?.email ? currentUser.email.split('@')[1]?.toLowerCase() : '';
  const [instName, setInstName] = useState('');
  const [instDomainExt, setInstDomainExt] = useState(userDomain || '');
  const [contactName, setContactName] = useState(currentUser?.name || '');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || '');
  const [proofFile, setProofFile] = useState(null);
  const [proofFileName, setProofFileName] = useState('');
  const [proofFileDataUrl, setProofFileDataUrl] = useState(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState(null);
  const [message, setMessage] = useState(null);

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

  const isPro = isProUser(currentUser);
  const remainingCredits = getRemainingAiCredits(currentUser);
  const creditsUsed = currentUser?.aiCreditsUsed || 0;

  const currentTeacherDomain = currentUser?.email ? currentUser.email.split('@')[1]?.toLowerCase() : '';

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

  const handleOpenCheckout = (planKey) => {
    setSelectedPlan(planKey);
    setIsCheckoutOpen(true);
    setCompletedInvoice(null);
    setMessage(null);
  };

  const handleConfirmCancelSubscription = async () => {
    setIsProcessing(true);
    setMessage(null);
    try {
      await new Promise(res => setTimeout(res, 600));
      await updateUserProfile({ planType: 'FREE' });
      setMessage({ type: 'success', text: 'Subscription cancelled successfully. Your account plan has returned to Educator Free Tier.' });
      setIsCancelModalOpen(false);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to cancel subscription. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setMessage(null);

    try {
      if (selectedPlan === 'ENTERPRISE') {
        const cleanDomain = (instDomainExt || userDomain || 'campus.edu').trim().toLowerCase().replace('@', '');
        const targetInstName = instName || `${cleanDomain.toUpperCase()} Institution`;

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

        const invoice = {
          invoiceNo: `INV-2026-${Math.floor(100000 + Math.random() * 900000)}`,
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          planTitle: 'Institutional B2B Campus License (Pending Verification)',
          amountInr: 49999,
          gstAmount: Math.round(49999 * 0.18),
          totalAmount: Math.round(49999 * 1.18),
          paymentMethod: paymentMethod === 'CARD' ? 'Credit / Debit Card' : paymentMethod === 'UPI' ? `UPI (${upiId})` : 'NetBanking',
          transactionId: `TXN-B2B-${Date.now()}`,
          billedTo: contactName || currentUser?.name || 'Educator',
          email: contactEmail || currentUser?.email || '',
          institution: instName || cleanDomain,
          approvalStatus: 'Pending Admin Verification'
        };

        setCompletedInvoice(invoice);
        setMessage({ type: 'warning', text: `📋 Institutional License Payment (₹49,999) & Proof Document (${proofFileName || 'Proof.pdf'}) submitted to Admin for Verification!` });
      } else {
        let planTitle = 'Individual Teacher Pro (Monthly)';
        let amountInr = 499;

        if (selectedPlan === 'ANNUAL_PRO') {
          planTitle = 'Individual Teacher Pro (Annual Saver)';
          amountInr = 4999;
        }

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
          paymentMethod: paymentMethod === 'CARD' ? 'Credit / Debit Card' : paymentMethod === 'UPI' ? `UPI (${upiId})` : 'NetBanking',
          transactionId: `TXN-${Date.now()}`,
          billedTo: currentUser?.name || 'Educator',
          email: currentUser?.email || '',
          institution: currentUser?.email?.split('@')[1] || 'Academic Institution'
        };

        setCompletedInvoice(invoice);
        setMessage({ type: 'success', text: `🎉 Payment Successful! Your ${planTitle} is now ACTIVE.` });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Payment processing failed. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitDomainForAdminApproval = async (domainToSubmit) => {
    setIsProcessing(true);
    setMessage(null);
    try {
      const cleanDomain = domainToSubmit.trim().toLowerCase().replace('@', '');
      await addLicense({
        institutionName: instName || `${cleanDomain.toUpperCase()} Campus`,
        domainExtension: cleanDomain,
        planType: 'ENTERPRISE_ANNUAL',
        priceInInr: 49999.0,
        status: 'PENDING_VERIFICATION',
        aiServicesAllowed: false,
        contactName: contactName || currentUser?.name || 'Educator',
        contactEmail: contactEmail || currentUser?.email || '',
        proofDocumentName: proofFileName || 'Campus_Authorization_Letter.pdf',
        proofDocumentUrl: proofFileDataUrl || ''
      });
      setMessage({
        type: 'warning',
        text: `📋 Institutional License Application for '@${cleanDomain}' has been submitted to the Admin Verification Queue! Log in as System Admin (admin@classroom.edu) to approve and whitelist.`
      });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to submit license application for Admin approval.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyEnterpriseDomain = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setMessage(null);

    const input = instDomain.trim().toLowerCase().replace('@', '');
    const userDomain = (currentUser?.email || '').split('@')[1]?.toLowerCase() || '';
    const checkDomain = input || userDomain;

    if (!checkDomain) {
      setMessage({ type: 'error', text: 'Please enter a valid university or college domain (e.g. vit.edu).' });
      setIsProcessing(false);
      return;
    }

    try {
      const activeLicenses = licenses && licenses.length > 0 ? licenses : await ApiService.getLicenses();
      const matched = (activeLicenses || []).find(l => 
        l.domainExtension && l.domainExtension.toLowerCase().replace('@', '') === checkDomain && 
        (l.status === 'ACTIVE' && l.aiServicesAllowed !== false)
      );

      const pendingMatched = (activeLicenses || []).find(l => 
        l.domainExtension && l.domainExtension.toLowerCase().replace('@', '') === checkDomain && 
        (l.status === 'PENDING_VERIFICATION')
      );

      if (matched) {
        await updateUserProfile({ planType: 'INSTITUTIONAL_ENTERPRISE' });
        setMessage({ type: 'success', text: `✨ Verified Active Institutional Enterprise License for ${matched.institutionName}! All AI features unlocked for ${checkDomain}.` });
      } else if (pendingMatched) {
        setMessage({ 
          type: 'warning', 
          text: `⏳ A license request for domain '@${checkDomain}' is currently in the Admin Verification Queue waiting for approval. Log in as System Admin to approve.` 
        });
      } else {
        // Automatically submit license request for Admin approval
        await handleSubmitDomainForAdminApproval(checkDomain);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error verifying institutional domain.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderLeft: '4px solid var(--accent-purple)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
            <Crown color="var(--accent-purple)" size={24} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Billing, Subscriptions & B2B Licensing</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Choose an educator plan or activate your university's B2B Enterprise license to unlock Spring AI grading, plagiarism checks, parent alerts, and gradebook exports.
          </p>
        </div>

        {/* Current Active Plan Status Pill */}
        <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
              Current Subscription Status
            </span>
            <strong style={{ fontSize: '1rem', color: activeDomainLicense ? 'var(--status-success)' : currentUser?.planType === 'INDIVIDUAL_PRO' ? 'var(--status-success)' : pendingDomainLicense ? 'var(--status-warning)' : 'var(--status-danger)' }}>
              {activeDomainLicense 
                ? `🏫 Institutional Enterprise B2B (${activeDomainLicense.institutionName || currentTeacherDomain})` 
                : currentUser?.planType === 'INDIVIDUAL_PRO' 
                ? '⭐ Individual Teacher Pro' 
                : pendingDomainLicense 
                ? '⏳ License Pending Verification' 
                : '🔒 Unlicensed (License Required)'}
            </strong>
          </div>
          {isPro ? (
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="btn btn-sm btn-secondary"
              style={{ color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.4)', fontSize: '0.78rem' }}
            >
              Cancel Subscription
            </button>
          ) : (
            <span className="badge badge-error" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
              🔒 License Required
            </span>
          )}
        </div>
      </div>

      {message && (
        <div className={`glass-card`} style={{ padding: '1rem', borderColor: message.type === 'success' ? 'var(--status-success)' : 'var(--status-danger)', background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: message.type === 'success' ? 'var(--status-success)' : 'var(--status-danger)', fontWeight: 600 }}>
          {message.text}
        </div>
      )}

      {/* 2 Exclusive Licensing Options Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        
        {/* Card 1: Option 1 - Individual Teacher Pro (Monthly / Annual) */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '2px solid var(--accent-purple)', background: 'linear-gradient(180deg, rgba(168, 85, 247, 0.08) 0%, transparent 100%)', position: 'relative', borderRadius: 'var(--radius-xl)', padding: '1.75rem' }}>
          <div style={{ position: 'absolute', top: '-12px', right: '20px', background: 'linear-gradient(90deg, #a855f7, #6366f1)', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.75rem', borderRadius: '12px', textTransform: 'uppercase' }}>
            OPTION 1: INDIVIDUAL TEACHER
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span className="badge badge-purple"><Sparkles size={12} /> TEACHER PRO</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontWeight: 700 }}>Save 20% on Annual</span>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.2rem' }}>Individual Teacher License</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Instant automatic access for individual educators across all your classrooms and courses.</p>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-purple)' }}>₹499</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ month (or ₹4,999/yr)</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--accent-purple)" /> <strong>Automatic Access Upon Login</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--accent-purple)" /> <strong>Unlimited Spring AI Rubric Evaluation</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--accent-purple)" /> <strong>Multi-Algorithm Plagiarism Scanning</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--accent-purple)" /> <strong>Automated Parent Email Alerts & Gradebook Export</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {currentUser?.planType === 'INDIVIDUAL_PRO' ? (
              <button 
                onClick={() => setIsCancelModalOpen(true)} 
                className="btn btn-secondary" 
                style={{ width: '100%', justifyContent: 'center', color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.4)' }}
              >
                ✓ Active Plan (Click to Cancel)
              </button>
            ) : (
              <>
                <button 
                  onClick={() => handleOpenCheckout('MONTHLY_PRO')} 
                  className="btn btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Zap size={16} /> Buy Individual License (₹499/mo)
                </button>
                <button 
                  onClick={() => handleOpenCheckout('ANNUAL_PRO')} 
                  className="btn btn-secondary" 
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', gap: '0.4rem' }}
                >
                  <Crown size={14} color="var(--status-warning)" /> Buy Annual License (₹4,999/yr)
                </button>
              </>
            )}
          </div>
        </div>

        {/* Card 2: Option 2 - Institutional Enterprise B2B Domain License */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '2px solid var(--accent-blue)', background: 'linear-gradient(180deg, rgba(56, 189, 248, 0.08) 0%, transparent 100%)', position: 'relative', borderRadius: 'var(--radius-xl)', padding: '1.75rem' }}>
          <div style={{ position: 'absolute', top: '-12px', right: '20px', background: 'linear-gradient(90deg, #38bdf8, #0284c7)', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.75rem', borderRadius: '12px', textTransform: 'uppercase' }}>
            OPTION 2: INSTITUTION PURCHASED
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span className="badge badge-info"><Building2 size={12} /> B2B ENTERPRISE</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 700 }}>Domain Email Match</span>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.2rem' }}>Institution Domain License</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Full campus license. Teachers registering/logging in with institutional email domain get automatic software access.</p>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent-blue)' }}>₹49,999</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ year per campus</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--accent-blue)" /> <strong>Automatic Email Domain Recognition</strong> for Whitelisted Campus
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--accent-blue)" /> <strong>Unlimited Teachers & Faculty Members</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--accent-blue)" /> Official B2B GST Tax Receipt & Invoice
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="var(--accent-blue)" /> Dedicated Institutional Support
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {currentUser?.planType === 'INSTITUTIONAL_ENTERPRISE' ? (
              <button 
                disabled 
                className="btn btn-secondary" 
                style={{ width: '100%', justifyContent: 'center', color: 'var(--status-success)', borderColor: 'var(--status-success)' }}
              >
                ✓ Active Institutional Domain Access
              </button>
            ) : (
              <button 
                onClick={() => handleOpenCheckout('ENTERPRISE')} 
                className="btn btn-secondary" 
                style={{ width: '100%', justifyContent: 'center', borderColor: 'var(--accent-blue)', color: 'var(--accent-blue)', fontWeight: 700 }}
              >
                <Building2 size={16} /> Purchase Institutional License (₹49,999)
              </button>
            )}
          </div>
        </div>

      </div>

      {/* University Domain License Verification Tool */}
      <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderLeft: '4px solid var(--accent-blue)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <Building2 size={22} color="var(--accent-blue)" />
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Claim Your Institutional B2B License</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              If your university/college holds an active enterprise license in our database, enter your domain extension to claim instant access.
            </p>
          </div>
        </div>

        <form onSubmit={handleVerifyEnterpriseDomain} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder={currentUser?.email ? `@${currentUser.email.split('@')[1]}` : 'e.g. university.edu or campus.ac.in'}
              value={instDomain}
              onChange={e => setInstDomain(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.5rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          <button type="submit" disabled={isProcessing} className="btn btn-primary" style={{ gap: '0.5rem' }}>
            {isProcessing ? 'Verifying...' : 'Verify Institutional License'} <ArrowRight size={16} />
          </button>
        </form>
      </div>

      {/* Payment & Invoice Checkout Modal */}
      {isCheckoutOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px', width: '100%', padding: 0, overflow: 'hidden', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-purple))', padding: '1.25rem 1.5rem', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <span className="badge badge-purple" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#fff', marginBottom: '0.4rem' }}>
                  <CreditCard size={12} /> Secure Checkout
                </span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                  {selectedPlan === 'MONTHLY_PRO' ? 'Individual Teacher Pro (Monthly)' : selectedPlan === 'ANNUAL_PRO' ? 'Individual Teacher Pro (Annual)' : 'Institutional Enterprise B2B License'}
                </h3>
              </div>
              <button onClick={() => setIsCheckoutOpen(false)} className="btn btn-secondary btn-icon" style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: 'none' }}>
                ✕
              </button>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {completedInvoice ? (
                /* Invoice & Payment Receipt Download Screen */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid var(--status-success)', borderRadius: 'var(--radius-md)', padding: '1.25rem', textAlign: 'center' }}>
                    <Receipt size={40} color="var(--status-success)" style={{ margin: '0 auto 0.5rem' }} />
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--status-success)', margin: 0 }}>Payment Successful!</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                      Invoice <strong>{completedInvoice.invoiceNo}</strong> generated. Plan is now active.
                    </p>
                  </div>

                  <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Billed To:</span>
                      <strong>{completedInvoice.billedTo} ({completedInvoice.email})</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Transaction ID:</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{completedInvoice.transactionId}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Plan:</span>
                      <strong>{completedInvoice.planTitle}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem', fontWeight: 800, fontSize: '0.95rem' }}>
                      <span>Total Paid (incl 18% GST):</span>
                      <span style={{ color: 'var(--status-success)' }}>₹{completedInvoice.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => window.print()} className="btn btn-secondary" style={{ gap: '0.4rem' }}>
                      <Download size={14} /> Print / Download Tax Invoice
                    </button>
                    <button onClick={() => setIsCheckoutOpen(false)} className="btn btn-primary">
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                /* Payment & B2B Document Proof Form */
                <form onSubmit={handleProcessPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '78vh', overflowY: 'auto', paddingRight: '0.25rem' }}>
                  
                  {selectedPlan === 'ENTERPRISE' && (
                    <>
                      <div style={{ background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.35)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-lg)', fontSize: '0.82rem', color: 'var(--accent-blue)' }}>
                        <strong>ℹ️ Mandatory Proof Upload Required:</strong> To activate an Institutional B2B Campus License (₹49,999/yr), you must upload your official document proof (Domain Ownership Certificate / University Authorization Letter) for Admin verification.
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontWeight: 800 }}>Institution / University Name</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="e.g. Vishwakarma Institute of Technology (VIT Pune)" 
                          value={instName}
                          onChange={e => setInstName(e.target.value)}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontWeight: 800 }}>Campus Domain Extension</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="e.g. vit.edu or university.edu" 
                          value={instDomainExt}
                          onChange={e => setInstDomainExt(e.target.value)}
                        />
                      </div>

                      {/* Optional Document Proof Upload Box */}
                      <div>
                        <label className="form-label" style={{ fontWeight: 800, color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                          <Upload size={16} color="var(--accent-purple)" /> Document Proof Upload <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(Optional)</span>
                        </label>
                        <div style={{
                          border: proofFileName ? '2px solid var(--status-success)' : '2px dashed var(--accent-purple)',
                          borderRadius: 'var(--radius-lg)',
                          padding: '1.25rem',
                          textAlign: 'center',
                          background: proofFileName ? 'rgba(16, 185, 129, 0.08)' : 'rgba(168, 85, 247, 0.05)',
                          position: 'relative',
                          cursor: 'pointer'
                        }}>
                          <input 
                            type="file" 
                            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                            onChange={handleFileUpload}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                          />
                          {proofFileName ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--status-success)', fontWeight: 800 }}>
                              <FileCheck size={28} color="var(--status-success)" />
                              <div style={{ textAlign: 'left' }}>
                                <span style={{ fontSize: '0.9rem', display: 'block' }}>✓ Document Proof Attached:</span>
                                <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{proofFileName}</strong>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <Upload size={30} color="var(--accent-purple)" style={{ margin: '0 auto 0.35rem' }} />
                              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block' }}>
                                Click to Upload Domain Ownership Certificate / Letterhead
                              </span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                PDF, PNG, JPG or DOCX (Max 10MB)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* Payment Method Tabs */}
                  <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.35rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <button type="button" onClick={() => setPaymentMethod('CARD')} className={`btn btn-sm ${paymentMethod === 'CARD' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }}>
                      💳 Credit / Debit Card
                    </button>
                    <button type="button" onClick={() => setPaymentMethod('UPI')} className={`btn btn-sm ${paymentMethod === 'UPI' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }}>
                      ⚡ Instant UPI / GPay
                    </button>
                  </div>

                  {paymentMethod === 'CARD' ? (
                    <>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Cardholder Name</label>
                        <input type="text" className="form-input" value={cardHolder} onChange={e => setCardHolder(e.target.value)} required />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Card Number</label>
                        <input type="text" className="form-input" value={cardNumber} onChange={e => setCardNumber(e.target.value)} required />
                      </div>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                          <label className="form-label">Expiry Date</label>
                          <input type="text" className="form-input" defaultValue="08/28" required />
                        </div>
                        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                          <label className="form-label">CVV / CVC</label>
                          <input type="password" className="form-input" defaultValue="482" maxLength={4} required />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">UPI VPA Address</label>
                      <input type="text" className="form-input" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="e.g. name@okaxis or mobile@upi" required />
                    </div>
                  )}

                  {/* Pricing Summary Box */}
                  <div style={{ background: 'var(--bg-secondary)', padding: '0.9rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Amount Payable:</span>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-purple)' }}>
                        ₹{selectedPlan === 'MONTHLY_PRO' ? '588.82' : selectedPlan === 'ANNUAL_PRO' ? '5,898.82' : '58,998.82'}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> (incl 18% GST)</span>
                      </div>
                    </div>
                    <span className="badge badge-success"><ShieldCheck size={12} /> 256-Bit SSL Encrypted</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button type="button" onClick={() => setIsCheckoutOpen(false)} className="btn btn-secondary">Cancel</button>
                    <button type="submit" disabled={isProcessing} className="btn btn-primary" style={{ gap: '0.5rem', fontWeight: 900 }}>
                      {isProcessing 
                        ? 'Processing...' 
                        : selectedPlan === 'ENTERPRISE'
                        ? 'Submit B2B Payment & Proof for Admin Verification'
                        : 'Complete Payment & Activate Pro'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subscription Cancellation Modal */}
      {isCancelModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--status-danger)' }}>
                Cancel Educator Subscription?
              </h3>
              <button onClick={() => setIsCancelModalOpen(false)} className="btn btn-secondary btn-icon">✕</button>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: '1.5' }}>
              Are you sure you want to cancel your <strong>{currentUser?.planType === 'INSTITUTIONAL_ENTERPRISE' ? 'Institutional Enterprise' : 'Individual Pro Teacher'}</strong> subscription?
            </p>

            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', margin: '1rem 0', fontSize: '0.8rem', color: 'var(--status-danger)' }}>
              <strong>⚠️ What happens when you cancel:</strong>
              <ul style={{ paddingLeft: '1.2rem', marginTop: '0.35rem', lineHeight: '1.4' }}>
                <li>Your account will return to the Standard Free Tier.</li>
                <li>Spring AI auto-grading, plagiarism scans, and gradebook CSV exports will be locked when your 3 free credits run out.</li>
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setIsCancelModalOpen(false)} className="btn btn-secondary">Keep Active Plan</button>
              <button onClick={handleConfirmCancelSubscription} disabled={isProcessing} className="btn btn-danger">
                {isProcessing ? 'Cancelling Plan...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
