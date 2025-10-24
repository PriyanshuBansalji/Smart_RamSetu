import React, { useState, useEffect } from 'react';
import Dashboard from './landing.jsx';
import LoginPage from './login.jsx';

function App() {
  // Always start with login page on initial load
  const [loggedIn, setLoggedIn] = useState(() => {
    // Require both flag and token to consider the admin logged in
    const flag = sessionStorage.getItem('adminLoggedIn') === 'true';
    const token = sessionStorage.getItem('adminToken');
    return Boolean(flag && token);
  });
  const [error, setError] = useState('');
  const [donors, setDonors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loadingDonors, setLoadingDonors] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [donorError, setDonorError] = useState('');
  const [patientError, setPatientError] = useState('');

  const refreshDonors = () => {
    setLoadingDonors(true);
    fetch('http://localhost:5000/api/donor/all', { cache: 'no-store' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch donor data');
        return res.json();
      })
      .then(data => {
        setDonors(Array.isArray(data) ? data : []);
        setDonorError('');
      })
      .catch(() => {
        setDonorError('Unable to fetch donor data. Please check backend.');
      })
      .finally(() => setLoadingDonors(false));
  };

  const refreshPatients = () => {
    setLoadingPatients(true);
    fetch('http://localhost:5000/api/patient/all', { cache: 'no-store' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch patient data');
        return res.json();
      })
      .then(data => {
        setPatients(Array.isArray(data) ? data : []);
        setPatientError('');
      })
      .catch(() => {
        setPatientError('Unable to fetch patient data. Please check backend.');
      })
      .finally(() => setLoadingPatients(false));
  };

  useEffect(() => {
    if (loggedIn) {
      // Guard: if token is missing or empty, force logout
      const token = sessionStorage.getItem('adminToken');
      if (!token) {
        setLoggedIn(false);
        return;
      }
      sessionStorage.setItem('adminLoggedIn', 'true');
      refreshDonors();
      refreshPatients();
    } else {
      sessionStorage.removeItem('adminLoggedIn');
      // Do not remove token automatically to let user retry; only clear on explicit logout in future
    }
  }, [loggedIn]);

  const handleLogin = async (email, password) => {
    setError('');
    try {
      const res = await fetch('http://localhost:5001/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setLoggedIn(true);
        sessionStorage.setItem('adminLoggedIn', 'true');
        if (data.token) {
          sessionStorage.setItem('adminToken', data.token);
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  return loggedIn
    ? <Dashboard
        donors={donors}
        patients={patients}
        loadingDonors={loadingDonors}
        loadingPatients={loadingPatients}
        donorError={donorError}
        patientError={patientError}
        onRefreshDonors={refreshDonors}
        onRefreshPatients={refreshPatients}
      />
    : <LoginPage onLogin={handleLogin} error={error} />;
}

export default App;
