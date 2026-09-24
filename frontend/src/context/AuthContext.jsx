import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('aicl_active_session');
      if (storedUser && storedUser !== 'null' && storedUser !== 'undefined') {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.id) return parsed;
      }
    } catch (e) {
      localStorage.removeItem('aicl_active_session');
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const loadedUsers = await ApiService.getUsers();
      const safeUsers = Array.isArray(loadedUsers) ? loadedUsers : [];
      setUsers(safeUsers);
      return safeUsers;
    } catch (err) {
      console.error('Error loading users in AuthContext:', err);
      return [];
    } finally {
      setLoading(false);
    }
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
      // Check stored credentials map for preserved rollNo & prnNo
      try {
        const storedUsers = localStorage.getItem('aicl_users');
        if (storedUsers) {
          const parsed = JSON.parse(storedUsers);
          const matched = (parsed || []).find(u => u.id === user.id || (u.email && u.email.toLowerCase() === cleanEmail));
          if (matched) {
            user = {
              ...user,
              rollNo: user.rollNo || matched.rollNo || '',
              prnNo: user.prnNo || matched.prnNo || ''
            };
          }
        }
      } catch (e) {}

      setCurrentUser(user);
      localStorage.setItem('aicl_active_session', JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, error: 'User not found. Please verify your email or register a new account.' };
  };

  const register = async (userData) => {
    try {
      const newUser = await ApiService.registerUser(userData);
      await fetchUsers();
      if (newUser) {
        setCurrentUser(newUser);
        localStorage.setItem('aicl_active_session', JSON.stringify(newUser));
        return { success: true, user: newUser };
      }
      return { success: false, error: 'Failed to create user account.' };
    } catch (e) {
      return { success: false, error: e.message || 'Registration failed.' };
    }
  };

  const switchRole = (role) => {
    const userList = Array.isArray(users) ? users : [];
    const user = userList.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('aicl_active_session', JSON.stringify(user));
    }
  };

  const updateUserProfile = async (profileData) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...profileData };
    setCurrentUser(updated);
    localStorage.setItem('aicl_active_session', JSON.stringify(updated));

    setUsers(prev => {
      const list = Array.isArray(prev) ? prev : [];
      return list.map(u => u.id === updated.id ? updated : u);
    });

    // Send PUT request to Spring Boot backend and sync localStorage
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

  const logout = () => {
    localStorage.removeItem('aicl_active_session');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, login, register, logout, switchRole, updateUserProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
