// Utility for Official Google Identity Services (GSI) OAuth 2.0 Integration

export const decodeGoogleJwt = (credential) => {
  try {
    if (!credential) return null;
    const base64Url = credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to decode Google JWT credential:', e);
    return null;
  }
};

export const DEFAULT_GOOGLE_CLIENT_ID = '194134173840-8aj6cvhjjgb4qjlf13vtobq0mr2bn1sp.apps.googleusercontent.com';

export const getStoredGoogleClientId = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('gsi_client_id');
    if (saved && saved.trim()) return saved.trim();
  }
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;
};

export const setStoredGoogleClientId = (clientId) => {
  if (typeof window !== 'undefined') {
    if (clientId && clientId.trim()) {
      localStorage.setItem('gsi_client_id', clientId.trim());
    } else {
      localStorage.removeItem('gsi_client_id');
    }
  }
};

export const initializeGoogleGsi = (customClientId, handleCallback) => {
  if (typeof window === 'undefined' || !window.google || !window.google.accounts) {
    console.warn('Google GSI SDK not loaded yet.');
    return false;
  }

  const clientId = customClientId || getStoredGoogleClientId();
  if (!clientId) {
    return false;
  }

  try {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (response && response.credential) {
          const profile = decodeGoogleJwt(response.credential);
          if (profile && profile.email) {
            handleCallback({
              email: profile.email,
              name: profile.name || profile.given_name || profile.email.split('@')[0],
              picture: profile.picture,
              googleSub: profile.sub
            });
          }
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true
    });
    return true;
  } catch (err) {
    console.error('Google GSI Initialization Error:', err);
    return false;
  }
};

export const promptGoogleGsi = () => {
  if (typeof window !== 'undefined' && window.google && window.google.accounts) {
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        console.log('Google One-Tap prompt notice:', notification.getNotDisplayedReason() || notification.getSkippedReason());
      }
    });
  }
};
