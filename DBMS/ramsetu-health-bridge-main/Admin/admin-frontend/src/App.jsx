import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Dashboard from './landing.jsx';
import LoginPage from './login.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { apiClient, ApiError } from './utils/apiClient.js';
import { API_CONFIG, STORAGE_KEYS, ERROR_MESSAGES, SUCCESS_MESSAGES } from './config.js';

/**
 * ErrorBoundary component to catch React errors
 */
class ErrorBoundaryImpl extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-6 text-sm">{this.state.error?.message || 'An unexpected error occurred'}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  // Authentication state
  const [loggedIn, setLoggedIn] = useState(() => {
    const flag = sessionStorage.getItem(STORAGE_KEYS.LOGGED_IN_FLAG) === 'true';
    const token = sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return Boolean(flag && token);
  });

  // UI state
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [sessionWarning, setSessionWarning] = useState('');

  // Data state
  const [donors, setDonors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loadingDonors, setLoadingDonors] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [donorError, setDonorError] = useState('');
  const [patientError, setPatientError] = useState('');

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
      if (!exp) return true; // No expiration
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

  const refreshDonors = useCallback(async () => {
    setLoadingDonors(true);
    setDonorError('');
    try {
      const token = sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) {
        setDonorError('Session expired. Please log in again.');
        logout();
        return;
      }
      const data = await apiClient.get(API_CONFIG.ENDPOINTS.DONOR_ALL);
      setDonors(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = err instanceof ApiError 
        ? err.message 
        : ERROR_MESSAGES.FETCH_DONOR_FAILED;
      
      // Check for 401/403 auth errors
      if (err?.status === 401 || err?.status === 403) {
        logout();
        setDonorError('Authentication failed. Please log in again.');
      } else {
        setDonorError(message);
      }
      console.error('Donor fetch error:', err);
    } finally {
      setLoadingDonors(false);
    }
  }, [logout]);

  const refreshPatients = useCallback(async () => {
    setLoadingPatients(true);
    setPatientError('');
    try {
      const token = sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) {
        setPatientError('Session expired. Please log in again.');
        logout();
        return;
      }
      const data = await apiClient.get(API_CONFIG.ENDPOINTS.PATIENT_ALL);
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = err instanceof ApiError 
        ? err.message 
        : ERROR_MESSAGES.FETCH_PATIENT_FAILED;
      
      // Check for 401/403 auth errors
      if (err?.status === 401 || err?.status === 403) {
        logout();
        setPatientError('Authentication failed. Please log in again.');
      } else {
        setPatientError(message);
      }
      console.error('Patient fetch error:', err);
    } finally {
      setLoadingPatients(false);
    }
  }, [logout]);

  useEffect(() => {
    if (loggedIn) {
      // Guard: if token is missing or invalid, force logout
      const token = sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token || !isTokenValid()) {
        logout();
        return;
      }
      sessionStorage.setItem(STORAGE_KEYS.LOGGED_IN_FLAG, 'true');
      
      // Load data
      refreshDonors();
      refreshPatients();
      
      // Check token expiry periodically (every 5 minutes)
      const tokenCheckInterval = setInterval(() => {
        if (!isTokenValid()) {
          setSessionWarning('Your session has expired. Please log in again.');
          logout();
          clearInterval(tokenCheckInterval);
        }
      }, 5 * 60 * 1000);
      
      return () => clearInterval(tokenCheckInterval);
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.LOGGED_IN_FLAG);
    }
  }, [loggedIn, isTokenValid, logout, refreshDonors, refreshPatients]);

  const handleLogin = useCallback(async (email, password) => {
    setError('');
    setSessionWarning('');
    
    if (!email?.trim() || !password?.trim()) {
      setError('Email and password are required');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
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
      } else {
        setError(data.message || ERROR_MESSAGES.LOGIN_FAILED);
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
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  return (
    <ErrorBoundaryImpl>
      {sessionWarning && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-yellow-50 to-orange-50 border-b-2 border-orange-400 p-4">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="text-orange-900 font-semibold">{sessionWarning}</p>
            </div>
            <button
              onClick={() => setSessionWarning('')}
              className="text-orange-600 hover:text-orange-800 font-semibold transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {loggedIn ? (
        <Dashboard
          donors={donors}
          patients={patients}
          loadingDonors={loadingDonors}
          loadingPatients={loadingPatients}
          donorError={donorError}
          patientError={patientError}
          onRefreshDonors={refreshDonors}
          onRefreshPatients={refreshPatients}
          onLogout={logout}
        />
      ) : (
        <LoginPage
          onLogin={handleLogin}
          error={error}
          isLoading={isLoggingIn}
        />
      )}
    </ErrorBoundaryImpl>
  );
}

export default App;
