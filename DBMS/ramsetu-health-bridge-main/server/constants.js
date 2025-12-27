/**
 * Application Constants
 * Centralized configuration for enums and constants
 */

// Blood groups
export const BLOOD_GROUPS = {
  O_POSITIVE: 'O+',
  O_NEGATIVE: 'O-',
  A_POSITIVE: 'A+',
  A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+',
  B_NEGATIVE: 'B-',
  AB_POSITIVE: 'AB+',
  AB_NEGATIVE: 'AB-',
};

export const BLOOD_GROUPS_ARRAY = Object.values(BLOOD_GROUPS);

// Organs
export const ORGANS = {
  KIDNEY: 'Kidney',
  LIVER: 'Liver',
  HEART: 'Heart',
  CORNEA: 'Cornea',
};

export const ORGANS_ARRAY = Object.values(ORGANS);

// Roles
export const ROLES = {
  DONOR: 'donor',
  PATIENT: 'patient',
  ADMIN: 'admin',
};

export const ROLES_ARRAY = Object.values(ROLES);

// Match Status
export const MATCH_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const MATCH_STATUS_ARRAY = Object.values(MATCH_STATUS);

// Donation Request Status
export const DONATION_REQUEST_STATUS = {
  PENDING: 'Pending',
  VERIFIED: 'Verified',
  DONATED: 'Donated',
  REJECTED: 'Rejected',
};

export const DONATION_REQUEST_STATUS_ARRAY = Object.values(DONATION_REQUEST_STATUS);

// Donor Type
export const DONOR_TYPE = {
  LIVING_RELATIVE: 'Living Relative',
  LIVING_UNRELATED: 'Living Unrelated',
  DECEASED: 'Deceased',
};

export const DONOR_TYPE_ARRAY = Object.values(DONOR_TYPE);

// Gender
export const GENDER = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
};

export const GENDER_ARRAY = Object.values(GENDER);

// OTP Settings
export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 10,
  MAX_ATTEMPTS: 3,
};

// JWT Settings
export const JWT_CONFIG = {
  EXPIRY: '7d',
  REFRESH_EXPIRY: '30d',
};

// Password Settings
export const PASSWORD_CONFIG = {
  MIN_LENGTH: 8,
  SALT_ROUNDS: 12,
  REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

// Rate Limiting Settings
export const RATE_LIMIT_CONFIG = {
  GENERAL_WINDOW_MS: 15 * 60 * 1000,
  GENERAL_MAX: 100,
  AUTH_WINDOW_MS: 15 * 60 * 1000,
  AUTH_MAX: 5,
  SIGNUP_WINDOW_MS: 60 * 60 * 1000,
  SIGNUP_MAX: 3,
  OTP_WINDOW_MS: 60 * 60 * 1000,
  OTP_MAX: 5,
};

// Blood Group Compatibility Matrix
export const BLOOD_GROUP_COMPATIBILITY = {
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'O-': ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
  'A+': ['A+', 'AB+'],
  'A-': ['A+', 'A-', 'AB+', 'AB-'],
  'B+': ['B+', 'AB+'],
  'B-': ['B+', 'B-', 'AB+', 'AB-'],
  'AB+': ['AB+'],
  'AB-': ['AB+', 'AB-'],
};

// Organ-specific features for ML
export const ORGAN_FEATURES = {
  KIDNEY: [
    'hla_score',
    'renal_score',
    'imaging_score',
    'cardiac_score',
    'distance_km',
    'urgency_level',
  ],
  HEART: [
    'blood_compat_score',
    'echo_score',
    'angiography_score',
    'viral_score',
    'cardiac_risk_score',
    'distance_km',
    'urgency_level',
  ],
  LIVER: [
    'blood_compat_score',
    'liver_function_score',
    'imaging_score',
    'viral_score',
    'coagulation_score',
    'distance_km',
    'urgency_level',
  ],
  CORNEA: [
    'infection_score',
    'eye_health_score',
    'serology_score',
    'distance_km',
    'urgency_level',
  ],
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_EMAIL: 'Invalid email format',
  INVALID_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  EMAIL_EXISTS: 'Email already registered',
  USER_NOT_FOUND: 'User not found',
  INVALID_CREDENTIALS: 'Invalid email or password',
  TOKEN_EXPIRED: 'Token expired or invalid',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access denied',
  INVALID_ORGAN: 'Invalid organ type',
  INVALID_BLOOD_GROUP: 'Invalid blood group',
  ML_SERVICE_UNAVAILABLE: 'ML service temporarily unavailable',
  EMAIL_SEND_FAILED: 'Failed to send email',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  SIGNUP_SUCCESS: 'Signup successful. Please verify your email.',
  LOGIN_SUCCESS: 'Login successful.',
  EMAIL_VERIFIED: 'Email verified successfully.',
  MATCH_CREATED: 'Match request created successfully.',
  MATCH_APPROVED: 'Match approved successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
};

export default {
  BLOOD_GROUPS,
  BLOOD_GROUPS_ARRAY,
  ORGANS,
  ORGANS_ARRAY,
  ROLES,
  ROLES_ARRAY,
  MATCH_STATUS,
  MATCH_STATUS_ARRAY,
  DONATION_REQUEST_STATUS,
  DONATION_REQUEST_STATUS_ARRAY,
  DONOR_TYPE,
  DONOR_TYPE_ARRAY,
  GENDER,
  GENDER_ARRAY,
  OTP_CONFIG,
  JWT_CONFIG,
  PASSWORD_CONFIG,
  RATE_LIMIT_CONFIG,
  BLOOD_GROUP_COMPATIBILITY,
  ORGAN_FEATURES,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
