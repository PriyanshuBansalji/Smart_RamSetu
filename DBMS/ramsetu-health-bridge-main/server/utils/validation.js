/**
 * Validation utilities for RamSetu Health Bridge
 * Provides secure validation and sanitization of user inputs
 */

// Email validation pattern (RFC 5322 simplified)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password requirements: min 8 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special char
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Blood group validation
const VALID_BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

// Valid organs
const VALID_ORGANS = ['Kidney', 'Liver', 'Heart', 'Cornea'];

// Valid roles
const VALID_ROLES = ['donor', 'patient', 'admin'];

// Valid match statuses
const VALID_MATCH_STATUSES = ['pending', 'approved', 'rejected'];

// Valid donation statuses
const VALID_DONATION_STATUSES = ['Pending', 'Verified', 'Donated', 'Rejected'];

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  return EMAIL_REGEX.test(trimmed) && trimmed.length <= 254;
};

/**
 * Get password strength details
 */
export const getPasswordStrength = (password) => {
  if (!password || typeof password !== 'string') {
    return {
      score: 0,
      strength: 'weak',
      requirements: {
        minLength: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
      },
      missing: ['Password is required']
    };
  }

  const requirements = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password)
  };

  const met = Object.values(requirements).filter(Boolean).length;
  let score = Math.round((met / 5) * 100);

  let strength = 'weak';
  if (score >= 80) strength = 'strong';
  else if (score >= 60) strength = 'good';
  else if (score >= 40) strength = 'fair';

  const missing = [];
  if (!requirements.minLength) missing.push('At least 8 characters');
  if (!requirements.uppercase) missing.push('At least 1 uppercase letter');
  if (!requirements.lowercase) missing.push('At least 1 lowercase letter');
  if (!requirements.number) missing.push('At least 1 number');
  if (!requirements.special) missing.push('At least 1 special character (@$!%*?&)');

  return { score, strength, requirements, missing };
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  if (password.length < 8) return false;
  return PASSWORD_REGEX.test(password);
};

/**
 * Validate blood group
 */
export const validateBloodGroup = (bg) => {
  if (!bg || typeof bg !== 'string') return false;
  return VALID_BLOOD_GROUPS.includes(bg.trim().toUpperCase());
};

/**
 * Validate organ type
 */
export const validateOrgan = (organ) => {
  if (!organ || typeof organ !== 'string') return false;
  return VALID_ORGANS.includes(organ.trim());
};

/**
 * Validate role
 */
export const validateRole = (role) => {
  if (!role || typeof role !== 'string') return false;
  return VALID_ROLES.includes(role.toLowerCase());
};

/**
 * Validate match status
 */
export const validateMatchStatus = (status) => {
  if (!status || typeof status !== 'string') return false;
  return VALID_MATCH_STATUSES.includes(status.toLowerCase());
};

/**
 * Validate donation status
 */
export const validateDonationStatus = (status) => {
  if (!status || typeof status !== 'string') return false;
  return VALID_DONATION_STATUSES.includes(status);
};

/**
 * Sanitize string input - remove HTML, trim whitespace
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/<[^>]*>/g, '');
};

/**
 * Validate phone number (basic international format)
 */
export const validatePhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  // Accept 10-15 digits, optional + prefix
  return /^\+?\d{10,15}$/.test(cleaned);
};

/**
 * Validate age (reasonable range)
 */
export const validateAge = (age) => {
  const num = parseInt(age, 10);
  return !isNaN(num) && num >= 18 && num <= 120;
};

/**
 * Validate date format (YYYY-MM-DD)
 */
export const validateDateFormat = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Validate MongoDB ObjectId
 */
export const validateObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return /^[a-f\d]{24}$/i.test(id);
};

/**
 * Validate user signup request
 */
export const validateSignupRequest = (data) => {
  const errors = [];

  if (!data.email) {
    errors.push('Email is required');
  } else if (!validateEmail(data.email)) {
    errors.push('Invalid email format');
  }

  if (!data.password) {
    errors.push('Password is required');
  } else if (!validatePassword(data.password)) {
    errors.push('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
  }

  if (!data.role) {
    errors.push('Role is required');
  } else if (!validateRole(data.role)) {
    errors.push('Invalid role');
  }

  if (!data.name || !data.name.trim()) {
    errors.push('Name is required');
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Validate login request
 */
export const validateLoginRequest = (data) => {
  const errors = [];

  if (!data.email) {
    errors.push('Email is required');
  } else if (!validateEmail(data.email)) {
    errors.push('Invalid email format');
  }

  if (!data.password) {
    errors.push('Password is required');
  }

  if (!data.role) {
    errors.push('Role is required');
  } else if (!validateRole(data.role)) {
    errors.push('Invalid role');
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Validate OTP format
 */
export const validateOTP = (otp) => {
  if (!otp || typeof otp !== 'string') return false;
  return /^\d{6}$/.test(otp.trim());
};

/**
 * Get password strength hint
 */
export const getPasswordStrengthHint = () => {
  return 'Password must be at least 8 characters with uppercase letter, lowercase letter, number, and special character (@$!%*?&)';
};

export default {
  validateEmail,
  validatePassword,
  validateBloodGroup,
  validateOrgan,
  validateRole,
  validateMatchStatus,
  validateDonationStatus,
  sanitizeString,
  validatePhoneNumber,
  validateAge,
  validateDateFormat,
  validateObjectId,
  validateSignupRequest,
  validateLoginRequest,
  validateOTP,
  getPasswordStrengthHint,
};
