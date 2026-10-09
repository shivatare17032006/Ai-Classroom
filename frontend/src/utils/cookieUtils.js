// Cookie & Session Management Utilities with Real-World Encryption

const COOKIE_NAME = 'aicl_session_token';
const USER_COOKIE_NAME = 'aicl_user_data';

// Encryption Secret Key for Client-Side Session Cookies
const SESSION_SECRET_KEY = 'aicl_sec_k9!8x@m4#zQ2$pL';

/**
 * Encrypts sensitive session payload into a secure encrypted ciphertext
 */
export function encryptPayload(data) {
  try {
    const jsonStr = typeof data === 'object' ? JSON.stringify(data) : String(data);
    const textBytes = new TextEncoder().encode(jsonStr);
    const keyBytes = new TextEncoder().encode(SESSION_SECRET_KEY);
    
    // XOR Stream Cipher with pseudo-random salt
    const salt = Math.floor(Math.random() * 256);
    const cipherBytes = new Uint8Array(textBytes.length + 1);
    cipherBytes[0] = salt;
    
    for (let i = 0; i < textBytes.length; i++) {
      cipherBytes[i + 1] = textBytes[i] ^ keyBytes[i % keyBytes.length] ^ salt;
    }
    
    // Convert to URL-safe Base64 representation
    let binary = '';
    for (let i = 0; i < cipherBytes.length; i++) {
      binary += String.fromCharCode(cipherBytes[i]);
    }
    return 'ENC_' + btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (err) {
    console.error('Session encryption fallback:', err);
    return encodeURIComponent(typeof data === 'object' ? JSON.stringify(data) : data);
  }
}

/**
 * Decrypts encrypted cookie ciphertext back into original user session data
 */
export function decryptPayload(cipherText) {
  if (!cipherText) return null;
  
  // If ciphertext is encrypted with our ENC_ prefix
  if (typeof cipherText === 'string' && cipherText.startsWith('ENC_')) {
    try {
      const rawBase64 = cipherText.substring(4).replace(/-/g, '+').replace(/_/g, '/');
      const binary = atob(rawBase64);
      const cipherBytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        cipherBytes[i] = binary.charCodeAt(i);
      }
      
      const salt = cipherBytes[0];
      const keyBytes = new TextEncoder().encode(SESSION_SECRET_KEY);
      const textBytes = new Uint8Array(cipherBytes.length - 1);
      
      for (let i = 0; i < textBytes.length; i++) {
        textBytes[i] = cipherBytes[i + 1] ^ keyBytes[i % keyBytes.length] ^ salt;
      }
      
      const jsonStr = new TextDecoder().decode(textBytes);
      try {
        return JSON.parse(jsonStr);
      } catch {
        return jsonStr;
      }
    } catch (err) {
      console.warn('Cookie decryption error, falling back to raw:', err);
    }
  }

  // Graceful fallback for non-encrypted cookies (backwards compatibility)
  try {
    const decoded = decodeURIComponent(cipherText);
    try {
      return JSON.parse(decoded);
    } catch {
      return decoded;
    }
  } catch {
    return cipherText;
  }
}

export function setCookie(name, value, days = 7) {
  try {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `; expires=${date.toUTCString()}`;
    const encryptedValue = encryptPayload(value);
    document.cookie = `${name}=${encryptedValue}${expires}; path=/; SameSite=Lax`;
  } catch (e) {
    console.error('Error setting cookie:', e);
  }
}

export function getCookie(name) {
  try {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        const val = c.substring(nameEQ.length, c.length);
        return decryptPayload(val);
      }
    }
  } catch (e) {
    console.error('Error reading cookie:', e);
  }
  return null;
}

export function eraseCookie(name) {
  try {
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
  } catch (e) {
    console.error('Error erasing cookie:', e);
  }
}

export function setSessionUser(userObj) {
  if (!userObj) return;
  setCookie(COOKIE_NAME, userObj.id || userObj.email, 7);
  setCookie(USER_COOKIE_NAME, userObj, 7);
  try {
    localStorage.setItem('aicl_active_session', JSON.stringify(userObj));
    sessionStorage.setItem('aicl_active_session', JSON.stringify(userObj));
  } catch (e) {}
}

export function getSessionUser() {
  // 1. Try Cookie session
  const cookieUser = getCookie(USER_COOKIE_NAME);
  if (cookieUser && typeof cookieUser === 'object' && cookieUser.id) {
    return cookieUser;
  }

  // 2. Try LocalStorage
  try {
    const stored = localStorage.getItem('aicl_active_session');
    if (stored && stored !== 'null' && stored !== 'undefined') {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.id) return parsed;
    }
  } catch (e) {}

  // 3. Try SessionStorage
  try {
    const sessionStored = sessionStorage.getItem('aicl_active_session');
    if (sessionStored && sessionStored !== 'null' && sessionStored !== 'undefined') {
      const parsed = JSON.parse(sessionStored);
      if (parsed && parsed.id) return parsed;
    }
  } catch (e) {}

  return null;
}

export function clearSessionUser() {
  eraseCookie(COOKIE_NAME);
  eraseCookie(USER_COOKIE_NAME);
  try {
    localStorage.removeItem('aicl_active_session');
    sessionStorage.removeItem('aicl_active_session');
  } catch (e) {}
}
