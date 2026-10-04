import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { initializeGoogleGsi, promptGoogleGsi, getStoredGoogleClientId, setStoredGoogleClientId } from '../../utils/googleAuth';
import { EmailNotificationService } from '../../services/emailService';
import { 
  Sparkles, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  UserPlus, 
  LogIn,
  Users,
  Settings,
  KeyRound,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

export const LoginPage = () => {
  const { login, register, googleLogin, resetPassword, users } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleRole, setGoogleRole] = useState('STUDENT');
  const [pendingGoogleAccount, setPendingGoogleAccount] = useState(null); // { email, name, picture } if new user
  const [gsiInitialized, setGsiInitialized] = useState(false);
  const [showClientIdSettings, setShowClientIdSettings] = useState(false);
  const [clientIdInput, setClientIdInput] = useState(() => getStoredGoogleClientId());

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1 = Enter Email, 2 = Enter OTP & New Password
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const googleBtnRef = useRef(null);

  // Initialize official Google Identity Services (GSI) OAuth 2.0 SDK
  useEffect(() => {
    const initGsi = () => {
      const storedKey = getStoredGoogleClientId();
      if (!storedKey) return;

      if (typeof window !== 'undefined' && window.google && window.google.accounts) {
        const ok = initializeGoogleGsi(storedKey, (googleProfile) => {
          handleGoogleSelect(googleProfile.email, googleProfile.name, googleProfile.picture);
        });

        if (ok && window.google.accounts.id) {
          setGsiInitialized(true);
          try {
            if (googleBtnRef.current) {
              googleBtnRef.current.innerHTML = '';
              window.google.accounts.id.renderButton(googleBtnRef.current, {
                type: 'standard',
                theme: 'outline',
                size: 'large',
                text: 'continue_with',
                shape: 'pill',
                logo_alignment: 'left',
                width: 380
              });
            }
          } catch (e) {
            console.error('Error rendering official Google GSI button:', e);
          }
        }
      }
    };

    initGsi();
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && window.google && window.google.accounts) {
        initGsi();
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [clientIdInput]);

  const handleSaveClientId = (e) => {
    e.preventDefault();
    setStoredGoogleClientId(clientIdInput);
    setShowClientIdSettings(false);
    setSuccessMsg(clientIdInput ? 'Google OAuth Client ID saved!' : 'Cleared Google Client ID.');
  };

  // Sign In State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Registration State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState('STUDENT'); // STUDENT | TEACHER
  const [regRollNo, setRegRollNo] = useState('');
  const [regPrnNo, setRegPrnNo] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // FORGOT PASSWORD HANDLERS
  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!forgotEmail) {
      setError('Please enter your registered email address.');
      return;
    }

    const clean = forgotEmail.trim().toLowerCase();
    const matchedUser = (users || []).find(u => u.email && u.email.trim().toLowerCase() === clean);
    
    // Generate 6-Digit OTP Code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);

    setIsSendingOtp(true);
    try {
      await EmailNotificationService.sendForgotPasswordOtpEmail(
        clean, 
        matchedUser ? matchedUser.name : clean.split('@')[0], 
        otp
      );
      setSuccessMsg(`Security OTP Code has been dispatched to ${clean}. Check your Gmail inbox!`);
      setForgotStep(2);
    } catch (err) {
      setError('Failed to dispatch password reset email. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyAndResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!forgotOtp || !newPassword) {
      setError('Please enter both the OTP code and your new password.');
      return;
    }

    if (forgotOtp.trim() !== generatedOtp.trim()) {
      setError('Invalid OTP code. Please check your Gmail inbox and enter the 6-digit code.');
      return;
    }

    const res = await resetPassword(forgotEmail, newPassword);
    if (res.success) {
      setSuccessMsg('Password reset successful! Logging into your portal...');
      setTimeout(async () => {
        await login(forgotEmail, newPassword);
      }, 1000);
    } else {
      setError(res.error || 'Password reset failed.');
    }
  };

  const handleGoogleSelect = async (accountEmail, accountName, accountAvatar) => {
    setError('');
    setSuccessMsg('');
    const targetEmail = (accountEmail || googleEmailInput).trim().toLowerCase();
    if (!targetEmail) return;

    const name = accountName || targetEmail.split('@')[0];
    const picture = accountAvatar || 'https://lh3.googleusercontent.com/a/default-user=s96-c';

    // Check if user already exists in platform
    const existing = (users || []).find(u => u.email && u.email.trim().toLowerCase() === targetEmail);

    if (existing) {
      // Existing user -> Direct 1-click Google Sign-In with their existing role
      const res = await googleLogin({ email: targetEmail, name, picture, role: existing.role });
      if (res.success) {
        setSuccessMsg(`Welcome back, ${existing.name || targetEmail}! Logged in via Google.`);
        setShowGoogleModal(false);
      } else {
        setError(res.error || 'Failed to authenticate via Google.');
      }
    } else {
      // New user -> Prompt for role selection (Student or Teacher)
      setPendingGoogleAccount({ email: targetEmail, name, picture });
    }
  };

  const handleCompleteGoogleRegistration = async (selectedRole) => {
    if (!pendingGoogleAccount) return;
    setError('');
    const res = await googleLogin({
      email: pendingGoogleAccount.email,
      name: pendingGoogleAccount.name,
      picture: pendingGoogleAccount.picture,
      role: selectedRole
    });

    if (res.success) {
      setSuccessMsg(`Welcome to AI-Enabled Classroom, ${pendingGoogleAccount.name}! Account created as ${selectedRole}.`);
      setPendingGoogleAccount(null);
      setShowGoogleModal(false);
    } else {
      setError(res.error || 'Registration failed.');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !password) {
      setError('Please enter your email address and password.');
      return;
    }

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!regName || !regEmail || !regPassword) {
      setError('Please complete all required fields.');
      return;
    }

    const result = await register({
      name: regName,
      email: regEmail,
      role: regRole,
      rollNo: regRollNo.trim(),
      prnNo: regPrnNo.trim(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    });

    if (!result.success) {
      setError(result.error);
    } else {
      setSuccessMsg('Account created successfully! Redirecting...');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 10%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 90% 90%, rgba(56, 189, 248, 0.12) 0%, transparent 50%), var(--bg-primary)',
      padding: '2rem'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '2.5rem',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-md)',
        borderRadius: 'var(--radius-xl)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            background: 'linear-gradient(135deg, #163a5f 0%, #1d4ed8 100%)',
            padding: '0.85rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 12px 24px rgba(22,58,95,0.12)',
            marginBottom: '0.85rem'
          }}>
            <Sparkles color="#ffffff" size={32} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#162033' }}>
            AI Enabled Classroom
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Academic Management & Learning Operations Platform
          </p>
        </div>

        {/* Mode Selector (Sign In vs Register) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.4rem',
          background: 'var(--bg-secondary)',
          padding: '0.35rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          border: '1px solid var(--border-color)'
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
            style={{
              padding: '0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: mode === 'login' ? 'var(--accent-indigo)' : 'transparent',
              color: mode === 'login' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'var(--transition)'
            }}
          >
            <LogIn size={16} /> Sign In
          </button>

          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
            style={{
              padding: '0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: mode === 'register' ? 'var(--accent-indigo)' : 'transparent',
              color: mode === 'register' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'var(--transition)'
            }}
          >
            <UserPlus size={16} /> Register Account
          </button>
        </div>

        {/* OFFICIAL GOOGLE IDENTITY SERVICES (GSI) OAUTH2 BUTTON */}
        <div style={{ width: '100%', marginBottom: '1.25rem' }}>
          <div ref={googleBtnRef} style={{ display: 'flex', justifyContent: 'center', width: '100%' }}></div>

          {/* FALLBACK / CUSTOM GOOGLE TRIGGER BUTTON */}
          {(!gsiInitialized || !googleBtnRef.current) && (
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined' && window.google?.accounts?.id) {
                  promptGoogleGsi();
                }
                setShowGoogleModal(true);
              }}
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: '#ffffff',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.65rem',
                boxShadow: '0 8px 20px rgba(15, 23, 42, 0.04)',
                transition: 'var(--transition)'
              }}
              className="google-signin-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Continue with Google
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>OR EMAIL SIGN IN</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        </div>

        {error && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '0.65rem', marginBottom: '1.25rem', textTransform: 'none', justifyContent: 'center', fontSize: '0.82rem' }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div className="badge badge-success" style={{ width: '100%', padding: '0.65rem', marginBottom: '1.25rem', textTransform: 'none', justifyContent: 'center', fontSize: '0.82rem' }}>
            {successMsg}
          </div>
        )}

        {/* SIGN IN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Mail size={14} color="var(--accent-blue)" /> Institutional Email
              </label>
              <input 
                type="email" 
                className="form-input" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                placeholder="name@university.edu"
                required 
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: 0 }}>
                  <Lock size={14} color="var(--accent-purple)" /> Password
                </label>
                <button 
                  type="button" 
                  onClick={() => { setMode('forgot'); setForgotStep(1); setError(''); setSuccessMsg(''); setForgotEmail(email); }}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-indigo)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Forgot Password?
                </button>
              </div>
              <input 
                type="password" 
                className="form-input" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required 
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', gap: '0.5rem', marginTop: '0.5rem' }}
            >
              Sign In <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {mode === 'forgot' && (
          <div>
            {forgotStep === 1 ? (
              <form onSubmit={handleSendResetOtp}>
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'inline-flex', background: 'rgba(99, 102, 241, 0.15)', padding: '0.65rem', borderRadius: '50%', marginBottom: '0.5rem' }}>
                    <KeyRound size={24} color="var(--accent-indigo)" />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Reset Portal Password</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Enter your registered email to receive a 6-digit security OTP code via Gmail.
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">Registered Email Address</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="name@university.edu"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem', fontSize: '0.92rem', gap: '0.5rem' }}
                  disabled={isSendingOtp}
                >
                  {isSendingOtp ? 'Sending OTP to Gmail...' : 'Send Security Code (OTP)'} <ArrowRight size={16} />
                </button>

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <button 
                    type="button"
                    onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.82rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <RotateCcw size={13} /> Back to Sign In
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndResetPassword}>
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'inline-flex', background: 'rgba(56, 189, 248, 0.15)', padding: '0.65rem', borderRadius: '50%', marginBottom: '0.5rem' }}>
                    <ShieldCheck size={24} color="#38bdf8" />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Verify OTP & Set Password</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Check your inbox at <strong>{forgotEmail}</strong> for the 6-digit code.
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">6-Digit Security OTP Code</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. 584920"
                    maxLength={6}
                    value={forgotOtp}
                    onChange={e => setForgotOtp(e.target.value)}
                    style={{ letterSpacing: '4px', fontWeight: 800, fontSize: '1.1rem', textAlign: 'center' }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem', fontSize: '0.92rem', gap: '0.5rem' }}
                >
                  Reset Password & Sign In <ArrowRight size={16} />
                </button>

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <button 
                    type="button"
                    onClick={() => { setForgotStep(1); setError(''); setSuccessMsg(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.82rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <RotateCcw size={13} /> Resend Security OTP Code
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={14} color="var(--accent-blue)" /> Full Name
              </label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Alex Johnson"
                value={regName}
                onChange={e => setRegName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Mail size={14} color="var(--accent-purple)" /> Email Address
              </label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="alex.j@university.edu"
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Users size={14} color="var(--accent-green)" /> Select Role
              </label>
              <select 
                className="form-select" 
                value={regRole} 
                onChange={e => setRegRole(e.target.value)}
              >
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
              </select>
            </div>

            {regRole === 'STUDENT' && (
              <div className="grid-2" style={{ marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Roll No</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. 2201045"
                    value={regRollNo}
                    onChange={e => setRegRollNo(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">PRN No</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. 122B1B045"
                    value={regPrnNo}
                    onChange={e => setRegPrnNo(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Lock size={14} color="var(--accent-indigo)" /> Create Password
              </label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••••••"
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', gap: '0.5rem', marginTop: '0.5rem' }}
            >
              Create Account <ArrowRight size={16} />
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Protected by Enterprise Authentication Protocol
        </div>
      </div>

      {/* GOOGLE ACCOUNT ONE-TAP POPUP MODAL */}
      {showGoogleModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: '440px', width: '90%', borderRadius: 'var(--radius-xl)', padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                  {pendingGoogleAccount ? 'Select Your Academic Role' : 'Sign in with Google'}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => { setShowGoogleModal(false); setPendingGoogleAccount(null); }} 
                className="btn btn-secondary btn-icon"
                style={{ padding: '0.35rem' }}
              >
                ✕
              </button>
            </div>

            {/* STEP 2: ROLE PROMPT FOR NEW GOOGLE USERS */}
            {pendingGoogleAccount ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
                  <img src={pendingGoogleAccount.picture} alt="Google Avatar" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{pendingGoogleAccount.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{pendingGoogleAccount.email}</div>
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', textAlign: 'center' }}>
                  Welcome! How will you be using <strong>AI-Enabled Classroom</strong>?
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => handleCompleteGoogleRegistration('STUDENT')}
                    style={{
                      padding: '1.25rem 0.75rem',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid rgba(51, 65, 85, 0.16)',
                      background: '#ffffff',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'var(--transition)'
                    }}
                    className="role-select-card"
                  >
                    <div style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>🎓</div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--accent-indigo)' }}>Student</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Join classes & submit AI graded work</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCompleteGoogleRegistration('TEACHER')}
                    style={{
                      padding: '1.25rem 0.75rem',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid rgba(51, 65, 85, 0.16)',
                      background: '#ffffff',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'var(--transition)'
                    }}
                    className="role-select-card"
                  >
                    <div style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>👨‍🏫</div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--accent-purple)' }}>Teacher</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Create classes & set AI rubric limits</div>
                  </button>
                </div>
              </div>
            ) : (
              /* STEP 1: SELECT OR ENTER GOOGLE ACCOUNT */
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  Choose an account to continue to <strong>AI-Enabled Classroom</strong>
                </p>

                {/* Quick Google Account Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
                  <div 
                    onClick={() => handleGoogleSelect('aryanshivatare35@gmail.com', 'Aryan Shivatare', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                    className="google-acc-card"
                  >
                    <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150" alt="Avatar" style={{ width: 36, height: 36, borderRadius: '50%' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Aryan Shivatare</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>aryanshivatare35@gmail.com</div>
                    </div>
                    <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>Primary</span>
                  </div>

                  <div 
                    onClick={() => handleGoogleSelect('aryan.shivatare@vjti.ac.in', 'Aryan (VJTI Campus)', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-highlight)',
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                    className="google-acc-card"
                  >
                    <img src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150" alt="Avatar" style={{ width: 36, height: 36, borderRadius: '50%' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        Aryan Shivatare <span style={{ fontSize: '0.7rem', background: '#38bdf820', color: '#38bdf8', padding: '0.1rem 0.4rem', borderRadius: 4 }}>B2B VJTI</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>aryan.shivatare@vjti.ac.in</div>
                    </div>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>AI Unlocked</span>
                  </div>
                </div>

                {/* Custom Google Email Input */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Or Use Another Google Account</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <input 
                      type="email" 
                      className="form-input"
                      placeholder="your.name@gmail.com or @univ.edu" 
                      value={googleEmailInput}
                      onChange={e => setGoogleEmailInput(e.target.value)}
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleGoogleSelect()} 
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.65rem' }}
                    disabled={!googleEmailInput.trim()}
                  >
                    Continue with Google Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GOOGLE CLIENT ID CONFIG SETTINGS MODAL */}
      {showClientIdSettings && (
        <div className="modal-overlay" style={{ zIndex: 99999 }}>
          <div className="modal-content" style={{ maxWidth: '480px', width: '90%', borderRadius: 'var(--radius-xl)', padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-indigo)' }}>
                <Settings size={20} />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Google OAuth Client ID Settings</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowClientIdSettings(false)} 
                className="btn btn-secondary btn-icon"
                style={{ padding: '0.35rem' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
              To connect live Google Cloud GSI OAuth logins, paste your Web Application Client ID created from <strong>Google Cloud Console (console.cloud.google.com)</strong>.
            </p>

            <form onSubmit={handleSaveClientId}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Google OAuth Client ID</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. 1234567890-abc123xyz.apps.googleusercontent.com"
                  value={clientIdInput}
                  onChange={e => setClientIdInput(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '0.65rem' }}
                >
                  Save Key & Initialize GSI
                </button>
                <button 
                  type="button"
                  onClick={() => { setClientIdInput(''); setStoredGoogleClientId(''); setShowClientIdSettings(false); }}
                  className="btn btn-secondary"
                  style={{ padding: '0.65rem' }}
                >
                  Clear Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
