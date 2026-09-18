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

  const logout = () => {
    localStorage.removeItem('aicl_active_session');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, login, register, logout, switchRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
