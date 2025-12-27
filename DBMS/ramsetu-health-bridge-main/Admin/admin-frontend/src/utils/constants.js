/**
 * Application constants for Admin Dashboard
 */

export const ADMIN_CONFIG = {
  DEFAULT_API_BASE: 'http://localhost:5000',
  DEFAULT_ADMIN_AUTH_URL: 'http://localhost:5001',
  ADMIN_EMAIL: 'teamtechzy@gmail.com',
  ADMIN_PASSWORD: 'Matasree',
};

export const MODERATION_STATUS = {
  PENDING: 'Pending',
  VERIFIED: 'Verified',
  DONATED: 'Donated',
  REJECTED: 'Rejected',
};

export const ORGANS = ['Kidney', 'Liver', 'Heart', 'Cornea'];

export const MATCH_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const FLASH_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
};

export const FLASH_DURATION = 3000; // milliseconds

export const API_ENDPOINTS = {
  DONOR_BY_ID: (id) => `/api/donor/by-id/${id}`,
  DONATION_REQUEST_BY_DONOR: (id) => `/api/donation-request/by-donor/${id}`,
  DONATION_REQUEST_UPDATE_STATUS: '/api/donation-request/status',
  MATCH_ALL: '/api/match/all',
  MATCH_APPROVE: '/api/match/approve',
  MATCH_REJECT: '/api/match/reject',
  PATIENT_BY_ID: (id) => `/api/patient/by-id/${id}`,
  PATIENT_UPDATE: '/api/patient/update',
};

export const ERROR_MESSAGES = {
  NO_DONOR_SELECTED: 'No donor selected.',
  NO_PATIENT_SELECTED: 'No patient selected.',
  NO_DONORS_TO_EXPORT: 'No donors to export.',
  NO_PATIENTS_TO_EXPORT: 'No patients to export.',
  FETCH_DONOR_FAILED: 'Unable to fetch donor details.',
  FETCH_PATIENT_FAILED: 'Unable to fetch patient details.',
  FETCH_REQUESTS_FAILED: 'Unable to fetch donation requests.',
  FETCH_MATCHES_FAILED: 'Unable to load match requests.',
  AUTH_FAILED: 'Auth failed. Set admin token in Settings and retry.',
  UPDATE_STATUS_FAILED: 'Failed to update request status.',
  APPROVE_MATCH_FAILED: 'Failed to approve match.',
  REJECT_MATCH_FAILED: 'Failed to reject match.',
  SAVE_PATIENT_FAILED: 'Failed to save patient details.',
  ADMIN_LOGIN_FAILED: 'Admin login failed.',
};

export const SUCCESS_MESSAGES = {
  STATUS_UPDATED: 'Status updated successfully.',
  MATCH_APPROVED: 'Match approved.',
  MATCH_REJECTED: 'Match rejected.',
  PATIENT_SAVED: 'Patient details saved.',
  ADMIN_TOKEN_SET: 'Admin token set from login.',
};

export const VALIDATION_RULES = {
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_PATTERN: /^[\d\s\-\+\(\)]{10,}$/,
  URL_PATTERN: /^https?:\/\/.+/,
};

export const DEBOUNCE_DELAY = 300; // milliseconds for search

export const CSV_FILENAME = {
  DONORS: (date) => `donors-${date}.csv`,
  PATIENTS: (date) => `patients-${date}.csv`,
  DONOR_DETAIL: (id) => `donor-${id}.csv`,
  PATIENT_DETAIL: (id) => `patient-${id}.csv`,
};
