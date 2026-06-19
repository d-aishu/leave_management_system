import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { login as loginApi } from '../api/authApi';

const AuthContext = createContext(null);

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await axiosLogin(email, password);
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  // Wrapped separately so we can keep loginApi import clean
  const axiosLogin = async (email, password) => {
    const response = await loginApi(email, password);
    const apiResponse = response.data; // ApiResponse<AuthResponse>

    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'Login failed');
    }

    const authData = apiResponse.data; // { token, type, employeeId, name, email, role }
    const userData = {
      id: authData.employeeId,
      name: authData.name,
      email: authData.email,
      role: authData.role
    };

    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(userData));

    setToken(authData.token);
    setUser(userData);

    return userData;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!token;

  const hasRole = useCallback(
    (...roles) => {
      if (!user || !user.role) return false;
      // Normalize roles like ROLE_EMPLOYEE -> EMPLOYEE for comparison flexibility
      const normalized = user.role.replace('ROLE_', '');
      return roles.some((r) => r.replace('ROLE_', '') === normalized);
    },
    [user]
  );

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated,
      login,
      logout,
      hasRole
    }),
    [token, user, loading, isAuthenticated, login, logout, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
