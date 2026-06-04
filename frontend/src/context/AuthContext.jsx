import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const fetchUser = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await authAPI.getMe();
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [token]); // eslint-disable-line

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // ── Role helpers ──
  const isAdmin   = user?.role === 'ADMIN';
  const isOwner   = user?.role === 'OWNER';
  const isAgent   = user?.role === 'AGENT';
  const isBuyer   = user?.role === 'BUYER';
  const isSupport = user?.role === 'SUPPORT';

  // Combined helpers
  const canListProperty = isOwner || isAgent || isAdmin;
  const canApprove      = isAdmin;
  const canManageUsers  = isAdmin;
  const canViewSupport  = isAdmin || isSupport;

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, logout, updateUser, fetchUser,
      isAdmin, isOwner, isAgent, isBuyer, isSupport,
      canListProperty, canApprove, canManageUsers, canViewSupport,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
