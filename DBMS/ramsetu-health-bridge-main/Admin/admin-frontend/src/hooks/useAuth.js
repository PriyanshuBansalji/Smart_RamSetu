import { useState, useCallback, useEffect } from 'react';
import { apiClient, ApiError } from '../utils/apiClient.js';
import { API_CONFIG, STORAGE_KEYS, ERROR_MESSAGES } from '../config.js';

/**
 * useAuth Hook
 * Manages authentication state and operations
 */
export function useAuth() {
  const [loggedIn, setLoggedIn] = useState(() => {
    const flag = sessionStorage.getItem(STORAGE_KEYS.LOGGED_IN_FLAG) === 'true';
    const token = sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return Boolean(flag && token);
  });

  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [sessionWarning, setSessionWarning] = useState('');

  /**
   * Check if token is valid and not expired
   */
  const isTokenValid = useCallback(() => {
    const token = sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) return false;
    
    try {
      const [, payload] = token.split('.');
      if (!payload) return false;
      const decoded = JSON.parse(atob(payload));
      const exp = decoded.exp;
      if (!exp) return true;
      return exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }, []);

  /**
   * Logout user and clear session
   */
  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEYS.LOGGED_IN_FLAG);
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    setLoggedIn(false);
    setError('');
    setSessionWarning('');
  }, []);

  /**
   * Handle login
   */
  const handleLogin = useCallback(async (email, password) => {
    setError('');
    setSessionWarning('');
    
    if (!email?.trim() || !password?.trim()) {
      setError('Email and password are required');
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    setIsLoggingIn(true);
    try {
      const data = await apiClient.post(
        API_CONFIG.ENDPOINTS.ADMIN_LOGIN,
        { email, password },
        { baseUrl: API_CONFIG.ADMIN_API_URL }
      );
      
      if (data.success || data.token) {
        if (data.token) {
          sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
        }
        sessionStorage.setItem(STORAGE_KEYS.LOGGED_IN_FLAG, 'true');
        setLoggedIn(true);
        return true;
      } else {
        setError(data.message || ERROR_MESSAGES.LOGIN_FAILED);
        return false;
      }
    } catch (err) {
      if (err?.status === 401) {
        setError('Invalid email or password');
      } else if (err?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        const message = err instanceof ApiError 
          ? err.message 
          : ERROR_MESSAGES.SERVER_ERROR;
        setError(message);
      }
      console.error('Login error:', err);
      return false;
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  /**
   * Set up token expiry check on login
   */
  useEffect(() => {
    if (!loggedIn) {
      sessionStorage.removeItem(STORAGE_KEYS.LOGGED_IN_FLAG);
      return;
    }

    if (!isTokenValid()) {
      logout();
      return;
    }

    sessionStorage.setItem(STORAGE_KEYS.LOGGED_IN_FLAG, 'true');

    // Check token expiry periodically (every 5 minutes)
    const tokenCheckInterval = setInterval(() => {
      if (!isTokenValid()) {
        setSessionWarning('Your session has expired. Please log in again.');
        logout();
        clearInterval(tokenCheckInterval);
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(tokenCheckInterval);
  }, [loggedIn, isTokenValid, logout]);

  return {
    loggedIn,
    setLoggedIn,
    error,
    isLoggingIn,
    sessionWarning,
    setSessionWarning,
    handleLogin,
    logout,
    isTokenValid
  };
}
