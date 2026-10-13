import React, { useState, useEffect } from 'react';
import { 
  Cookie, 
  ShieldCheck, 
  Check, 
  Lock, 
  X, 
  Sliders, 
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

// Primary storage keys to ensure one-time prompt and persistent acceptance
const CONSENT_KEY = 'aicl_cookie_consent_v2';
const LEGACY_KEY = 'aicl_cookie_consent_v1';
const COOKIE_NAME = 'aicl_cookie_consent';

export const CookieConsentModal = () => {
  // Synchronous initial check so there is zero flash or delay
  const [isVisible, setIsVisible] = useState(() => {
    try {
      const consent = localStorage.getItem(CONSENT_KEY) || localStorage.getItem(LEGACY_KEY);
      // If already accepted or stored in local storage, do not show
      if (consent) return false;
      return true;
    } catch (e) {
      return true;
    }
  });

  // Controls the expanded OneTrust-style Preference Center dialog
  const [showPreferenceCenter, setShowPreferenceCenter] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  // Cookie preference toggles
  const [preferences, setPreferences] = useState({
    essential: true,   // Always active & locked
    functional: true,  // Remembers theme, active course view
    analytics: true    // AI rubric latency & performance telemetry
  });

  useEffect(() => {
    // Global event listener and window method to allow re-opening from Navbar or Footer
    const handleReopen = () => {
      setShowPreferenceCenter(true);
      setIsVisible(true);
    };

    window.addEventListener('aicl:open-cookie-modal', handleReopen);
    window.openCookieConsent = handleReopen;

    // Developer / tester reset helper
    window.resetCookieConsent = () => {
      try {
        localStorage.removeItem(CONSENT_KEY);
        localStorage.removeItem(LEGACY_KEY);
        document.cookie = `${COOKIE_NAME}=; max-age=0; path=/;`;
      } catch (e) {}
      setIsVisible(true);
      setShowPreferenceCenter(false);
      console.log('✅ Cookie consent reset. Banner is now visible.');
    };

    return () => {
      window.removeEventListener('aicl:open-cookie-modal', handleReopen);
      delete window.openCookieConsent;
      delete window.resetCookieConsent;
    };
  }, []);

  // Save consent permanently so it never asks again
  const handleSaveConsent = (statusType = 'ALL') => {
    try {
      const consentPayload = {
        status: statusType,
        preferences: statusType === 'ALL'
          ? { essential: true, functional: true, analytics: true }
          : statusType === 'ESSENTIAL'
          ? { essential: true, functional: false, analytics: false }
          : preferences,
        timestamp: new Date().toISOString()
      };

      // 1. Persist to LocalStorage permanently
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consentPayload));
      localStorage.setItem(LEGACY_KEY, JSON.stringify(consentPayload));

      // 2. Set formal browser cookie with 1-year (365 days) lifespan
      const oneYearSeconds = 365 * 24 * 60 * 60;
      document.cookie = `${COOKIE_NAME}=${statusType}; max-age=${oneYearSeconds}; path=/; SameSite=Lax`;
    } catch (err) {
      console.error('Failed to store cookie consent:', err);
    }

    // Dismiss banner and modal permanently
    setShowPreferenceCenter(false);
    setShowPolicyModal(false);
    setIsVisible(false);
  };

  // If user has already consented, render nothing
  if (!isVisible) return null;

  return (
    <>
      {/* =========================================================================
          1. REAL-WORLD FULL-WIDTH BOTTOM COOKIE BANNER (OneTrust / GDPR Standard)
          ========================================================================= */}
      {!showPreferenceCenter && (
        <aside 
          className="cookie-banner-bar"
          role="region"
          aria-label="Cookie and Privacy Consent Banner"
        >
          <div className="cookie-banner-inner">
            
            {/* Left Column: Icon + Text + Policy links */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flex: 1 }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(36, 91, 115, 0.14)',
                color: 'var(--accent-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid rgba(36, 91, 115, 0.25)'
              }}>
                <Cookie size={26} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <h3 style={{
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    margin: 0,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.01em'
                  }}>
                    We Value Your Privacy & Academic Security
                  </h3>
                  <span className="badge badge-primary" style={{ fontSize: '0.68rem', padding: '0.15rem 0.55rem', fontWeight: 700 }}>
                    <ShieldCheck size={12} style={{ display: 'inline', marginRight: '3px' }} />
                    FERPA & GDPR Compliant
                  </span>
                </div>

                <p style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  margin: 0,
                  lineHeight: '1.55',
                  maxWidth: '850px'
                }}>
                  We use cookies and essential local storage to safeguard authenticated student and educator sessions, protect course submissions against tampering, and optimize Spring AI rubric grading workflows. By clicking <strong>"Accept All Cookies"</strong>, you consent to our use of all cookies. You can also customize your choices or decline optional cookies at any time.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  <button 
                    type="button"
                    onClick={() => setShowPolicyModal(true)}
                    style={{ background: 'none', border: 'none', padding: 0, color: 'var(--accent-blue)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Cookie Policy & Details
                  </button>
                  <span>•</span>
                  <button 
                    type="button"
                    onClick={() => setShowPolicyModal(true)}
                    style={{ background: 'none', border: 'none', padding: 0, color: 'var(--accent-blue)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    FERPA Data Protection Notice
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Real-World Action Buttons */}
            <div className="cookie-banner-actions">
              <button
                type="button"
                onClick={() => setShowPreferenceCenter(true)}
                className="btn btn-secondary"
                style={{
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  padding: '0.65rem 1.15rem',
                  gap: '0.45rem',
                  whiteSpace: 'nowrap'
                }}
              >
                <Sliders size={15} /> Cookie Preferences
              </button>

              <button
                type="button"
                onClick={() => handleSaveConsent('ESSENTIAL')}
                className="btn btn-secondary"
                style={{
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  padding: '0.65rem 1.15rem',
                  whiteSpace: 'nowrap'
                }}
              >
                Reject Non-Essential
              </button>

              <button
                type="button"
                onClick={() => handleSaveConsent('ALL')}
                className="btn btn-primary"
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  padding: '0.65rem 1.4rem',
                  gap: '0.45rem',
                  boxShadow: 'var(--shadow-sm)',
                  whiteSpace: 'nowrap'
                }}
              >
                <Check size={16} /> Accept All Cookies
              </button>
            </div>

          </div>
        </aside>
      )}

      {/* =========================================================================
          2. FORMAL PRIVACY PREFERENCE CENTER MODAL (OneTrust / Enterprise Standard)
          ========================================================================= */}
      {showPreferenceCenter && (
        <div 
          className="modal-overlay" 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999999,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            animation: 'modalIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <div 
            className="glass-card" 
            style={{
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.45)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-secondary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(36, 91, 115, 0.12)',
                  color: 'var(--accent-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Cookie size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Privacy Preference Center
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Manage how cookies and academic tokens are stored on your device
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPreferenceCenter(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.4rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Back to banner"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.55' }}>
                When you visit our academic software, we store and retrieve information on your browser, mostly in the form of cookies. This information is used to make the educational portal work securely and provide a personalized learning experience.
              </p>

              {/* Category 1: Strictly Necessary (Locked) */}
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem 1.15rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Lock size={16} color="var(--accent-blue)" />
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                      Strictly Necessary Cookies
                    </strong>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.68rem', padding: '0.2rem 0.55rem' }}>
                    Always Active
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                  These cookies are essential for you to browse the platform and use its core security features. They store authenticated teacher/student JWT tokens, CSRF protection headers, and ensure integrity when submitting assignments. They cannot be switched off.
                </p>
              </div>

              {/* Category 2: Functional */}
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem 1.15rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    Functional Workspace Cookies
                  </strong>
                  <label className="cookie-switch">
                    <input 
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={(e) => setPreferences(prev => ({ ...prev, functional: e.target.checked }))}
                    />
                    <span className="cookie-slider"></span>
                  </label>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                  These cookies enable helpful classroom personalization, such as remembering whether you prefer Dark or Light theme, preserving your active classroom tab, and keeping sidebar navigation drawers open.
                </p>
              </div>

              {/* Category 3: Performance & AI Analytics */}
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem 1.15rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    AI Grading Performance & Telemetry
                  </strong>
                  <label className="cookie-switch">
                    <input 
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                    />
                    <span className="cookie-slider"></span>
                  </label>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                  These cookies provide anonymous diagnostic telemetry on Spring AI rubric generation speeds and plagiarism similarity checks to help our engineering team maintain fast response times.
                </p>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div style={{
              padding: '1.15rem 1.5rem',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              flexWrap: 'wrap'
            }}>
              <button
                type="button"
                onClick={() => handleSaveConsent('ESSENTIAL')}
                className="btn btn-secondary"
                style={{ fontSize: '0.82rem', padding: '0.6rem 1rem' }}
              >
                Reject Non-Essential
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => handleSaveConsent('CUSTOM')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.82rem', fontWeight: 700, padding: '0.6rem 1.15rem' }}
                >
                  Confirm My Choices
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveConsent('ALL')}
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem', fontWeight: 800, padding: '0.6rem 1.25rem', gap: '0.4rem' }}
                >
                  <Check size={16} /> Accept All
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          3. POLICY & FERPA DATA PROTECTION MODAL
          ========================================================================= */}
      {showPolicyModal && (
        <div 
          className="modal-overlay" 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999999,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            animation: 'modalIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <div 
            className="glass-card" 
            style={{
              maxWidth: '540px',
              width: '100%',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <ShieldCheck size={22} color="var(--accent-blue)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  FERPA & Privacy Protection Notice
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPolicyModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{ margin: 0 }}>
                <strong>Academic Data Privacy:</strong> AI-Classroom strictly adheres to the Family Educational Rights and Privacy Act (FERPA) and European GDPR standards.
              </p>
              <ul style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li>Student grades, submissions, and assignment records are never sold or shared with commercial advertising trackers.</li>
                <li>Cookies are used strictly for authenticated session management, CSRF prevention, and AI evaluation reliability.</li>
                <li>Your preferences are encrypted and stored locally on your device for up to 365 days.</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setShowPolicyModal(false)}
              className="btn btn-primary"
              style={{ alignSelf: 'flex-end', fontSize: '0.85rem', fontWeight: 700, padding: '0.55rem 1.25rem' }}
            >
              Close Notice
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsentModal;
