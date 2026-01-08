import React, { useState, useCallback, useEffect } from 'react';
import { VALIDATION_RULES, ERROR_MESSAGES } from './config.js';

/**
 * LoginPage Component
 * Handles admin authentication with email/password
 * Features: Form validation, password visibility toggle, accessibility support
 */
function LoginPage({ onLogin, error, isLoading = false }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [attemptCount, setAttemptCount] = useState(0);

  // Reset submission flag when login completes
  useEffect(() => {
    setIsSubmitting(false);
  }, [isLoading]);

  /**
   * Validate form inputs
   */
  const validateForm = useCallback(() => {
    const errors = {};

    // Email validation
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!VALIDATION_RULES.EMAIL_REGEX.test(email)) {
      errors.email = ERROR_MESSAGES.INVALID_EMAIL || 'Please enter a valid email';
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < VALIDATION_RULES.MIN_PASSWORD_LENGTH) {
      errors.password = ERROR_MESSAGES.INVALID_PASSWORD || `Password must be at least ${VALIDATION_RULES.MIN_PASSWORD_LENGTH} characters`;
    }

    return errors;
  }, [email, password]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    // Rate limiting: prevent too many attempts
    if (attemptCount >= 5 && isLoading) {
      setValidationErrors({ form: 'Too many login attempts. Please try again later.' });
      return;
    }

    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setIsSubmitting(true);
    setAttemptCount(prev => prev + 1);
    onLogin(email, password);
  }, [email, password, validateForm, onLogin, attemptCount, isLoading]);

  /**
   * Handle email input change
   */
  const handleEmailChange = useCallback((e) => {
    setEmail(e.target.value);
    if (validationErrors.email) {
      setValidationErrors(prev => ({ ...prev, email: '' }));
    }
  }, [validationErrors.email]);

  /**
   * Handle password input change
   */
  const handlePasswordChange = useCallback((e) => {
    setPassword(e.target.value);
    if (validationErrors.password) {
      setValidationErrors(prev => ({ ...prev, password: '' }));
    }
  }, [validationErrors.password]);

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(v => !v);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-10 -left-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute -bottom-8 right-0 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      
      <div className="bg-white/80 backdrop-blur-2xl rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center border border-white/30 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="relative mb-6 inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-pink-400 rounded-2xl blur opacity-20"></div>
            <img
              src="/logo.png"
              alt="Ram Setu Logo"
              className="relative w-20 h-20 drop-shadow-lg"
              loading="lazy"
            />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent mb-2">RAM SETU</h1>
          <p className="text-xs tracking-widest font-semibold text-pink-500 uppercase letter-spacing-1">Bridging Healthcare</p>
          <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-pink-500 rounded-full mx-auto mt-4"></div>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-6">Admin Portal</h2>

        <form className="w-full space-y-5" onSubmit={handleSubmit} autoComplete="off" noValidate>
          {/* Email Field */}
          <div className="relative group">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition">
              📧 Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={handleEmailChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-3 border-2 rounded-xl transition duration-200 bg-white text-gray-700 placeholder-gray-400 font-medium ${
                  validationErrors.email
                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : focusedField === 'email'
                    ? 'border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-md'
                    : 'border-gray-200 focus:border-blue-400 hover:border-gray-300'
                }`}
                required
                autoFocus
                disabled={isLoading}
                aria-invalid={!!validationErrors.email}
                aria-describedby={validationErrors.email ? 'email-error' : undefined}
              />
            </div>
            {validationErrors.email && (
              <p id="email-error" className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <span>⚠️</span> {validationErrors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="relative group">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 group-focus-within:text-blue-600 transition">
                🔐 Password
              </label>
              <button
                type="button"
                className="text-xs font-medium text-blue-500 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition disabled:opacity-50"
                onClick={togglePasswordVisibility}
                tabIndex={-1}
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️ Hide' : '👁️ Show'}
              </button>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-3 border-2 rounded-xl transition duration-200 bg-white text-gray-700 placeholder-gray-400 font-medium ${
                  validationErrors.password
                    ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : focusedField === 'password'
                    ? 'border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-md'
                    : 'border-gray-200 focus:border-blue-400 hover:border-gray-300'
                }`}
                required
                disabled={isLoading}
                aria-invalid={!!validationErrors.password}
                aria-describedby={validationErrors.password ? 'password-error' : undefined}
              />
            </div>
            {validationErrors.password && (
              <p id="password-error" className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <span>⚠️</span> {validationErrors.password}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm animate-slideDown font-medium flex items-start gap-3" role="alert">
              <span className="text-lg mt-0.5">❌</span>
              <div>
                <p className="font-semibold">Login Failed</p>
                <p className="text-red-600 text-xs mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:from-blue-700 active:to-blue-800 text-white font-bold py-3 px-4 rounded-xl transition duration-300 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
            disabled={isLoading || isSubmitting}
          >
            {isLoading || isSubmitting ? (
              <>
                <span className="animate-spin text-lg">⚙️</span>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>🔓</span>
                <span>Login to Admin Panel</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 w-full text-center">
          <p className="text-xs text-gray-600 mb-2 font-medium">Need Help?</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Contact system administrator for access or password reset
          </p>
        </div>
      </div>
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        input:disabled {
          background-color: #f9fafb;
          cursor: not-allowed;
        }
        input::placeholder {
          color: #d1d5db;
        }
        label {
          letter-spacing: 0.3px;
        }
      `}</style>
    </div>
  );
}

export default LoginPage;
