import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => ApiService.getUsers() || []);
  
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
    // Default logged in user: Teacher (Prof. Sarah Jenkins)
    const loadedUsers = ApiService.getUsers() || [];
    return loadedUsers.find(u => u.role === 'TEACHER') || loadedUsers[0] || null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadedUsers = ApiService.getUsers() || [];
    setUsers(loadedUsers);
  }, []);

  const login = (email, password) => {
    const user = (users || []).find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('aicl_active_session', JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, error: 'Invalid email address or credentials.' };
  };

  const switchRole = (role) => {
    const user = (users || []).find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('aicl_active_session', JSON.stringify(user));
    }
  };

  const logout = () => {
    localStorage.removeItem('aicl_active_session');
    // Fallback to default teacher so UI remains visible and interactive
    const loadedUsers = ApiService.getUsers() || [];
    const teacherUser = loadedUsers.find(u => u.role === 'TEACHER') || loadedUsers[0];
    setCurrentUser(teacherUser);
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, login, logout, switchRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
