import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { jwtDecode } from "jwt-decode";
import { authApi } from "../features/auth/api";
import { setAuthToken } from "../lib/apiClient";

// Shape of context data
const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  error: null,
  login: () => { },
  logout: () => { },
  refresh: () => { },
  setUser: () => { }
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const isTokenExpired = useCallback((accessToken) => {
    try {
      const { exp } = jwtDecode(accessToken);
      // Add 30 second buffer before actual expiration
      return Date.now() >= (exp * 1000) - 30000;
    } catch (error) {
      console.error('Token decode error:', error);
      return true;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refresh_token');
    setAuthToken(null);
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    setError(null);
  }, []);

  const refresh = useCallback(async (storedRefreshToken) => {
    if (!storedRefreshToken) {
      console.warn('No refresh token available');
      logout();
      return false;
    }

    try {
      const data = await authApi.refresh(storedRefreshToken);

      if (data.token) {
        // Update tokens and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
          setRefreshToken(data.refresh_token);
        }

        setAuthToken(data.token);
        setToken(data.token);
        setUser(data.user);
        setError(null);
        return true;
      } else {
        console.error('Token refresh failed: No token returned');
        setError('Token refresh failed');
        logout();
        return false;
      }
    } catch (err) {
      console.error('Failed to refresh token:', err);
      setError(err.message || 'Failed to refresh token');
      logout();
      return false;
    }
  }, [logout]);

  // Load tokens and user from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedRefresh = localStorage.getItem('refresh_token');

      if (storedToken && storedUser && storedRefresh) {
        try {
          const parsedUser = JSON.parse(storedUser);

          // Check if token is expired
          if (isTokenExpired(storedToken)) {
            console.log('Token expired, refreshing...');
            const refreshed = await refresh(storedRefresh);

            if (!refreshed) {
              // Refresh failed, clear state
              setLoading(false);
              return;
            }
          } else {
            // Token is still valid
            setAuthToken(storedToken);
            setToken(storedToken);
            setUser(parsedUser);
            setRefreshToken(storedRefresh);
            setError(null);
          }
        } catch (err) {
          console.error('Error initializing auth:', err);
          logout();
        }
      }

      setLoading(false);
    };

    initAuth();
  }, [isTokenExpired, refresh, logout]);

  // Set up automatic token refresh before expiration
  useEffect(() => {
    if (!token || !refreshToken) return;

    const checkAndRefresh = async () => {
      if (isTokenExpired(token)) {
        console.log('Token expired, auto-refreshing...');
        await refresh(refreshToken);
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkAndRefresh, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [token, refreshToken, isTokenExpired, refresh]);

  // Sync token with apiClient memory cache
  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const data = await authApi.login({ email, password });

      if (data.token && data.user) {
        // Store tokens and user
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
          setRefreshToken(data.refresh_token);
        }

        setAuthToken(data.token);
        setToken(data.token);
        setUser(data.user);
        setError(null);

        return { success: true, user: data.user };
      } else {
        const errorKey = 'auth.loginFailed';
        setError(errorKey);
        return { success: false, error: errorKey };
      }
    } catch (err) {
      console.error('Login error:', err);
      let errorKey = 'auth.networkError';
      const status = err?.status;
      if (status === 401) {
        errorKey = 'auth.invalidCredentials';
      } else if (status === 403) {
        errorKey = 'auth.accountDisabled';
      } else if (status === 429) {
        errorKey = 'auth.tooManyAttempts';
      } else if (status >= 500) {
        errorKey = 'auth.serverError';
      }
      setError(errorKey);
      return { success: false, error: errorKey };
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    setUser,
    loading,
    error,
    login,
    logout,
    refresh: () => refresh(refreshToken)
  }), [user, token, loading, error, login, logout, refresh, refreshToken]);

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;