// Configuration and constants for the admin panel
export const API_CONFIG = {
  MAIN_API_URL: import.meta.env.VITE_MAIN_API_URL || 'http://localhost:5000',
  ADMIN_API_URL: import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:5001',
  ENDPOINTS: {
    DONOR_ALL: '/api/donor/all',
    PATIENT_ALL: '/api/patient/all',
    ADMIN_LOGIN: '/api/admin/login',
  },
};

export const STORAGE_KEYS = {
  LOGGED_IN_FLAG: 'adminLoggedIn',
  AUTH_TOKEN: 'adminToken',
  API_BASE: 'apiBase',
  ADMIN_AUTH_URL: 'adminAuthUrl',
};

export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MIN_PASSWORD_LENGTH: 6,
};

export const ERROR_MESSAGES = {
  FETCH_DONOR_FAILED: 'Unable to fetch donor data. Please check the backend.',
  FETCH_PATIENT_FAILED: 'Unable to fetch patient data. Please check the backend.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  LOGIN_FAILED: 'Login failed. Please check your credentials.',
  SERVER_ERROR: 'Server error. Please try again later.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PASSWORD: 'Password must be at least 6 characters.',
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Logged in successfully!',
  DATA_REFRESHED: 'Data refreshed successfully.',
};
