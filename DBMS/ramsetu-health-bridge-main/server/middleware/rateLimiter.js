/**
 * Rate limiting middleware and configurations
 * Prevents abuse and DoS attacks
 */

import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 * 100 requests per 15 minutes
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for admin IPs (if needed)
    return process.env.ADMIN_IPS?.includes(req.ip);
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15 minutes
 */
export const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * Signup/Registration limiter
 * 3 requests per hour
 */
export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many accounts created from this IP, please try again after an hour.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Password reset/OTP limiter
 * 5 requests per hour
 */
export const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many OTP requests, please try again after an hour.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Email verification limiter
 * 10 requests per hour
 */
export const emailVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many verification requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Match request limiter
 * 20 match requests per hour
 */
export const matchRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Too many match requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by user ID instead of IP for authenticated requests
    return req.user?._id || req.ip;
  },
});

/**
 * File upload limiter
 * 10 uploads per hour per user
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many file uploads, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?._id || req.ip;
  },
});

/**
 * Create limiter limiter
 * 50 creates per hour
 */
export const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?._id || req.ip;
  },
});

export default {
  generalLimiter,
  strictAuthLimiter,
  signupLimiter,
  otpLimiter,
  emailVerificationLimiter,
  matchRequestLimiter,
  uploadLimiter,
  createLimiter,
};
