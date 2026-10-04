import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { getSessionUser, setSessionUser, clearSessionUser } from '../utils/cookieUtils';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => getSessionUser());
  const [loading, setLoading] = useState(true);

  const [licenses, setLicenses] = useState([]);

  const fetchUsers = async () => {
    try {
      const loadedUsers = await ApiService.getUsers();
      const safeUsers = Array.isArray(loadedUsers) ? loadedUsers : [];
      setUsers(safeUsers);

      const loadedLicenses = await ApiService.getLicenses();
      setLicenses(Array.isArray(loadedLicenses) ? loadedLicenses : []);

      // Sync active user session with latest database state
      const active = getSessionUser();
      if (active && active.email) {
        const cleanEmail = active.email.trim().toLowerCase();
        const freshUser = safeUsers.find(u => u.email && u.email.trim().toLowerCase() === cleanEmail);
        if (freshUser) {
          const merged = { ...active, ...freshUser };
          setCurrentUser(merged);
          setSessionUser(merged);
        }
      }
      return safeUsers;
    } catch (err) {
      console.error('Error loading users in AuthContext:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const isProUser = (user = currentUser) => {
    if (!user) return false;
    if (user.role === 'ADMIN' || user.role === 'STUDENT') return true;
    if (user.planType === 'INDIVIDUAL_PRO') return true;

    // Check if institutional domain license exists and is active for teacher's domain
    const domain = user.email?.split('@')[1]?.toLowerCase();
    if (domain && licenses && licenses.length > 0) {
      const activeLicense = licenses.find(l => 
        l.domainExtension && l.domainExtension.toLowerCase().replace('@', '') === domain && 
        (l.status === 'ACTIVE' && (l.aiServicesAllowed !== false))
      );
      if (activeLicense && (user.planType === 'INSTITUTIONAL_ENTERPRISE' || user.hasClaimedInstitutionalBenefit)) {
        return true;
      }
    }

    return false;
  };

  const getUnclaimedInstitutionalLicense = (user = currentUser) => {
    if (!user || user.role !== 'TEACHER') return null;
    if (user.planType === 'INDIVIDUAL_PRO' || user.planType === 'INSTITUTIONAL_ENTERPRISE' || user.hasClaimedInstitutionalBenefit) {
      return null;
    }

    const domain = user.email?.split('@')[1]?.toLowerCase();
    if (!domain) return null;

    const activeLicenses = Array.isArray(licenses) ? licenses : [];
    return activeLicenses.find(l => 
      l.domainExtension && 
      l.domainExtension.toLowerCase().replace('@', '') === domain && 
      l.status === 'ACTIVE' && 
      (l.aiServicesAllowed !== false)
    ) || null;
  };

  const claimInstitutionalBenefit = async (activeLicense) => {
    if (!currentUser) return;
    const updatedData = {
      planType: 'INSTITUTIONAL_ENTERPRISE',
      hasClaimedInstitutionalBenefit: true,
      institutionName: activeLicense?.institutionName || ''
    };
    await updateUserProfile(updatedData);
  };

  const FREE_AI_CREDITS_LIMIT = 3;

  const getRemainingAiCredits = (user = currentUser) => {
    if (!user) return 0;
    if (isProUser(user)) return Infinity;
    const used = user.aiCreditsUsed || 0;
    return Math.max(0, FREE_AI_CREDITS_LIMIT - used);
  };

  const consumeAiCredit = async () => {
    if (!currentUser) return true;
    if (isProUser(currentUser)) return true;

    const remaining = getRemainingAiCredits(currentUser);
    if (remaining <= 0) return false;

    const newCount = (currentUser.aiCreditsUsed || 0) + 1;
    await updateUserProfile({ aiCreditsUsed: newCount });
    return true;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const login = async (email, password) => {
    let userList = Array.isArray(users) ? users : [];
    const cleanEmail = email.trim().toLowerCase();
    let user = userList.find(u => u.email && u.email.toLowerCase() === cleanEmail);

    if (!user) {
      const freshUsers = await fetchUsers();
      user = (freshUsers || []).find(u => u.email && u.email.toLowerCase() === cleanEmail);
    }

    if (user) {
      // Automatic Institutional Domain License Link for Teachers
      if (user.role === 'TEACHER' && user.planType !== 'INDIVIDUAL_PRO') {
        const domain = cleanEmail.split('@')[1]?.toLowerCase();
        const activeLicenses = licenses && licenses.length > 0 ? licenses : await ApiService.getLicenses();
        if (domain && activeLicenses && activeLicenses.length > 0) {
          const matchedLic = activeLicenses.find(l => 
            l.domainExtension && l.domainExtension.toLowerCase().replace('@', '') === domain && l.status === 'ACTIVE'
          );
          if (matchedLic) {
            user.planType = 'INSTITUTIONAL_ENTERPRISE';
          }
        }
      }

      try {
        const storedUsers = localStorage.getItem('aicl_users');
        if (storedUsers) {
          const parsed = JSON.parse(storedUsers);
          const matched = (parsed || []).find(u => u.id === user.id || (u.email && u.email.toLowerCase() === cleanEmail));
          if (matched) {
            user = {
              ...user,
              rollNo: user.rollNo || matched.rollNo || '',
              prnNo: user.prnNo || matched.prnNo || '',
              parentEmail: user.parentEmail || matched.parentEmail || '',
              aiCreditsUsed: user.aiCreditsUsed ?? matched.aiCreditsUsed ?? 0
            };
          }
        }
      } catch (e) {}

      setCurrentUser(user);
      setSessionUser(user);
      return { success: true, user };
    }
    return { success: false, error: 'User not found. Please verify your email or register a new account.' };
  };

  const register = async (userData) => {
    try {
      // Auto-assign institutional plan if email domain matches active institutional license
      let initialPlan = 'FREE';
      if (userData.role === 'TEACHER' && userData.email) {
        const domain = userData.email.trim().split('@')[1]?.toLowerCase();
        const activeLicenses = licenses && licenses.length > 0 ? licenses : await ApiService.getLicenses();
        if (domain && activeLicenses) {
          const matchedLic = activeLicenses.find(l => 
            l.domainExtension && l.domainExtension.toLowerCase().replace('@', '') === domain && l.status === 'ACTIVE'
          );
          if (matchedLic) {
            initialPlan = 'INSTITUTIONAL_ENTERPRISE';
          }
        }
      }

      const newUser = await ApiService.registerUser({ ...userData, planType: initialPlan });
      await fetchUsers();
      if (newUser) {
        setCurrentUser(newUser);
        setSessionUser(newUser);
        return { success: true, user: newUser };
      }
      return { success: false, error: 'Failed to create user account.' };
    } catch (e) {
      return { success: false, error: e.message || 'Registration failed.' };
    }
  };

  const googleLogin = async ({ email, name, picture, role = 'STUDENT', rollNo = '', prnNo = '' }) => {
    let userList = Array.isArray(users) ? users : [];
    const cleanEmail = email.trim().toLowerCase();
    let user = userList.find(u => u.email && u.email.toLowerCase() === cleanEmail);

    if (!user) {
      const freshUsers = await fetchUsers();
      user = (freshUsers || []).find(u => u.email && u.email.toLowerCase() === cleanEmail);
    }

    if (user) {
      // Automatic Institutional Domain License Link for Teachers
      if (user.role === 'TEACHER' && user.planType !== 'INDIVIDUAL_PRO') {
        const domain = cleanEmail.split('@')[1]?.toLowerCase();
        const activeLicenses = licenses && licenses.length > 0 ? licenses : await ApiService.getLicenses();
        if (domain && activeLicenses && activeLicenses.length > 0) {
          const matchedLic = activeLicenses.find(l => 
            l.domainExtension && l.domainExtension.toLowerCase().replace('@', '') === domain && l.status === 'ACTIVE'
          );
          if (matchedLic) {
            user.planType = 'INSTITUTIONAL_ENTERPRISE';
          }
        }
      }

      const updatedUser = {
        ...user,
        avatar: picture || user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        name: user.name || name
      };

      setCurrentUser(updatedUser);
      setSessionUser(updatedUser);
      return { success: true, user: updatedUser, isNew: false };
    } else {
      // Create new user account from Google profile
      const newUserRes = await register({
        name: name || email.split('@')[0],
        email: cleanEmail,
        role: role,
        rollNo: rollNo || `G-${Math.floor(1000 + Math.random() * 9000)}`,
        prnNo: prnNo || `PRN-G${Math.floor(100000 + Math.random() * 900000)}`,
        avatar: picture || 'https://lh3.googleusercontent.com/a/default-user=s96-c'
      });
      return { ...newUserRes, isNew: true };
    }
  };

  const switchRole = (role) => {
    const userList = Array.isArray(users) ? users : [];
    const user = userList.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      setSessionUser(user);
    }
  };

  const updateUserProfile = async (profileData) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...profileData };
    setCurrentUser(updated);
    setSessionUser(updated);

    setUsers(prev => {
      const list = Array.isArray(prev) ? prev : [];
      return list.map(u => u.id === updated.id ? updated : u);
    });

    try {
      await ApiService.updateUser(currentUser.id, updated);
    } catch (e) {
      console.error('Error syncing user profile update to backend:', e);
    }

    try {
      const storedUsers = localStorage.getItem('aicl_users');
      let newUsers = [];
      if (storedUsers) {
        const parsed = JSON.parse(storedUsers);
        if (Array.isArray(parsed)) {
          const idx = parsed.findIndex(u => u.id === updated.id);
          if (idx !== -1) {
            parsed[idx] = { ...parsed[idx], ...profileData };
            newUsers = parsed;
          } else {
            newUsers = [...parsed, updated];
          }
        }
      } else {
        newUsers = [updated];
      }
      localStorage.setItem('aicl_users', JSON.stringify(newUsers));
    } catch (e) {
      console.error('Error persisting user profile update:', e);
    }
  };

  const resetPassword = async (email, newPassword) => {
    const cleanEmail = email.trim().toLowerCase();
    const userList = Array.isArray(users) ? users : [];
    let user = userList.find(u => u.email && u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, error: 'No registered account found with this email address.' };
    }

    user.password = newPassword;
    try {
      await ApiService.updateUser(user.id, { password: newPassword });
    } catch (e) {}

    try {
      const storedUsers = localStorage.getItem('aicl_users');
      if (storedUsers) {
        const parsed = JSON.parse(storedUsers);
        if (Array.isArray(parsed)) {
          const idx = parsed.findIndex(u => u.email && u.email.toLowerCase() === cleanEmail);
          if (idx !== -1) {
            parsed[idx].password = newPassword;
            localStorage.setItem('aicl_users', JSON.stringify(parsed));
          }
        }
      }
    } catch (e) {}

    return { success: true, user };
  };

  const logout = () => {
    clearSessionUser();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, fetchUsers, login, register, googleLogin, resetPassword, logout, switchRole, updateUserProfile, isProUser, getUnclaimedInstitutionalLicense, claimInstitutionalBenefit, getRemainingAiCredits, consumeAiCredit, FREE_AI_CREDITS_LIMIT, licenses, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
