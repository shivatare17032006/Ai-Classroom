// Cookie & Session Management Utilities for Real-World Persistence

const COOKIE_NAME = 'aicl_session_token';
const USER_COOKIE_NAME = 'aicl_user_data';

export function setCookie(name, value, days = 7) {
  try {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `; expires=${date.toUTCString()}`;
    const encodedValue = encodeURIComponent(typeof value === 'object' ? JSON.stringify(value) : value);
    document.cookie = `${name}=${encodedValue}${expires}; path=/; SameSite=Lax`;
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
        const decoded = decodeURIComponent(val);
        try {
          return JSON.parse(decoded);
        } catch {
          return decoded;
        }
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
