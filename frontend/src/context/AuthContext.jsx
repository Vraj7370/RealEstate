import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authAPI } from '../utils/api';
import { getPermissions } from '../config/roles';

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

  const permissions = useMemo(() => getPermissions(user?.role), [user?.role]);
  const {
    isAdmin, isOwner, isAgent, isBuyer, isSupport,
    canListProperty, canUseBuyerJourney, canManageLeads,
    canAccessAdmin, canManageSupport,
  } = permissions;

  const canApprove = isAdmin;
  const canManageUsers = isAdmin;
  const canViewSupport = canManageSupport;

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, logout, updateUser, fetchUser,
      permissions,
      isAdmin, isOwner, isAgent, isBuyer, isSupport,
      canListProperty, canUseBuyerJourney, canManageLeads,
      canApprove, canManageUsers, canViewSupport, canAccessAdmin, canManageSupport,
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
