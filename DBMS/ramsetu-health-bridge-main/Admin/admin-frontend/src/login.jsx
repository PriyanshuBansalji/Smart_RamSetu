import React, { useState, useCallback, useEffect } from 'react';
import { VALIDATION_RULES, ERROR_MESSAGES } from './config.js';

function LoginPage({ onLogin, error, isLoading = false }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = useCallback(() => {
    const errors = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!VALIDATION_RULES.EMAIL_REGEX.test(email)) {
      errors.email = ERROR_MESSAGES.INVALID_EMAIL || 'Please enter a valid email';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < VALIDATION_RULES.MIN_PASSWORD_LENGTH) {
      errors.password = ERROR_MESSAGES.INVALID_PASSWORD || `Password must be at least ${VALIDATION_RULES.MIN_PASSWORD_LENGTH} characters`;
    }

    return errors;
  }, [email, password]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setIsSubmitting(true);
    onLogin(email, password);
  };

  useEffect(() => {
    setIsSubmitting(false);
  }, [isLoading]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (validationErrors.email) {
      setValidationErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (validationErrors.password) {
      setValidationErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(v => !v);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-4">
      <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 w-full max-w-md flex flex-col items-center border border-blue-200 animate-fade-in">
        <img
          src="/logo.png"
          alt="Ram Setu Logo"
          className="w-24 h-24 mb-4 animate-logo-flip"
          style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}
          loading="lazy"
        />
        <h1 className="text-3xl font-extrabold text-blue-900 tracking-wide mb-1 animate-slide-up">RAM SETU</h1>
        <span className="text-xs text-pink-500 tracking-widest font-medium animate-fade-in mb-4">BRIDGING HEALTHCARE</span>
        <h2 className="text-lg font-bold mb-6 text-blue-700 tracking-wide animate-fade-in">Admin Panel Login</h2>

        <form className="w-full" onSubmit={handleSubmit} autoComplete="off" noValidate>
          {/* Email Field */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={handleEmailChange}
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 transition bg-blue-50 text-gray-700 ${
                validationErrors.email
                  ? 'border-red-500 focus:ring-red-400'
                  : 'border-gray-300 focus:ring-blue-400'
              }`}
              required
              autoFocus
              disabled={isLoading}
              aria-invalid={!!validationErrors.email}
              aria-describedby={validationErrors.email ? 'email-error' : undefined}
            />
            {validationErrors.email && (
              <p id="email-error" className="text-red-500 text-sm mt-1">
                {validationErrors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <button
                type="button"
                className="text-xs text-blue-500 hover:text-blue-700 transition disabled:opacity-50"
                onClick={togglePasswordVisibility}
                tabIndex={-1}
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={handlePasswordChange}
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 transition bg-blue-50 text-gray-700 ${
                validationErrors.password
                  ? 'border-red-500 focus:ring-red-400'
                  : 'border-gray-300 focus:ring-blue-400'
              }`}
              required
              disabled={isLoading}
              aria-invalid={!!validationErrors.password}
              aria-describedby={validationErrors.password ? 'password-error' : undefined}
            />
            {validationErrors.password && (
              <p id="password-error" className="text-red-500 text-sm mt-1">
                {validationErrors.password}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-4 text-sm animate-shake" role="alert">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white py-2 rounded font-semibold hover:from-green-500 hover:to-blue-600 transition shadow-lg animate-fade-in disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={isLoading || isSubmitting}
          >
            {isLoading || isSubmitting ? (
              <>
                <span className="animate-spin">⚙️</span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* Dev Helper */}
        <p className="text-xs text-gray-500 mt-6 text-center">
          Demo: teamtechzy@gmail.com / Matasree
        </p>
      </div>
      <style>{`
        @keyframes logoFlip {
          0% { transform: rotateY(0deg) scale(1); }
          40% { transform: rotateY(180deg) scale(1.1); }
          60% { transform: rotateY(180deg) scale(1.1); }
          100% { transform: rotateY(360deg) scale(1); }
        }
        .animate-logo-flip {
          animation: logoFlip 2.5s cubic-bezier(.4,0,.2,1) infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 1s cubic-bezier(.4,0,.2,1) both; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slideUp 1.2s cubic-bezier(.4,0,.2,1) both; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>
    </div>
  );
}

export default LoginPage;
