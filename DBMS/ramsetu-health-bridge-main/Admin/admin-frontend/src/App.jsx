import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Dashboard from './landing.jsx';
import LoginPage from './login.jsx';
import { apiClient, ApiError } from './utils/apiClient.js';
import { API_CONFIG, STORAGE_KEYS, ERROR_MESSAGES, SUCCESS_MESSAGES } from './config.js';

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

  // Data state
  const [donors, setDonors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loadingDonors, setLoadingDonors] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [donorError, setDonorError] = useState('');
  const [patientError, setPatientError] = useState('');

  const refreshDonors = useCallback(async () => {
    setLoadingDonors(true);
    setDonorError('');
    try {
      const token = sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) {
        setDonorError('Session expired. Please log in again.');
        setLoadingDonors(false);
        return;
      }
      const data = await apiClient.get(API_CONFIG.ENDPOINTS.DONOR_ALL);
      setDonors(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : ERROR_MESSAGES.FETCH_DONOR_FAILED;
      setDonorError(message);
      console.error('Donor fetch error:', err);
    } finally {
      setLoadingDonors(false);
    }
  }, []);

  const refreshPatients = useCallback(async () => {
    setLoadingPatients(true);
    setPatientError('');
    try {
      const token = sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) {
        setPatientError('Session expired. Please log in again.');
        setLoadingPatients(false);
        return;
      }
      const data = await apiClient.get(API_CONFIG.ENDPOINTS.PATIENT_ALL);
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : ERROR_MESSAGES.FETCH_PATIENT_FAILED;
      setPatientError(message);
      console.error('Patient fetch error:', err);
    } finally {
      setLoadingPatients(false);
    }
  }, []);

  useEffect(() => {
    if (loggedIn) {
      // Guard: if token is missing or empty, force logout
      const token = sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) {
        setLoggedIn(false);
        return;
      }
      sessionStorage.setItem(STORAGE_KEYS.LOGGED_IN_FLAG, 'true');
      refreshDonors();
      refreshPatients();
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.LOGGED_IN_FLAG);
    }
  }, [loggedIn, refreshDonors, refreshPatients]);

  const handleLogin = useCallback(async (email, password) => {
    setError('');
    if (!email?.trim() || !password?.trim()) {
      setError('Email and password are required');
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
        }
        sessionStorage.setItem(STORAGE_KEYS.LOGGED_IN_FLAG, 'true');
        setLoggedIn(true);
      } else {
        setError(data.message || ERROR_MESSAGES.LOGIN_FAILED);
      }
    } catch (err) {
      const message = err instanceof ApiError 
        ? err.message 
        : ERROR_MESSAGES.SERVER_ERROR;
      setError(message);
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  return loggedIn ? (
    <Dashboard
      donors={donors}
      patients={patients}
      loadingDonors={loadingDonors}
      loadingPatients={loadingPatients}
      donorError={donorError}
      patientError={patientError}
      onRefreshDonors={refreshDonors}
      onRefreshPatients={refreshPatients}
    />
  ) : (
    <LoginPage
      onLogin={handleLogin}
      error={error}
      isLoading={isLoggingIn}
    />
  );
}

export default App;
