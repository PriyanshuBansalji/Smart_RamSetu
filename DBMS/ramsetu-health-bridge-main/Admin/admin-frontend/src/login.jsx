import React, { useState } from 'react';

function LoginPage({ onLogin, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
      <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 w-full max-w-md flex flex-col items-center border border-blue-200 animate-fade-in">
        <img
          src="/logo.png"
          alt="Ram Setu Logo"
          className="w-24 h-24 mb-4 animate-logo-flip"
          style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}
        />
        <h1 className="text-3xl font-extrabold text-blue-900 tracking-wide mb-1 animate-slide-up">RAM SETU</h1>
        <span className="text-xs text-pink-500 tracking-widest font-medium animate-fade-in mb-4">BRIDGING HEALTHCARE</span>
        <h2 className="text-lg font-bold mb-6 text-blue-700 tracking-wide animate-fade-in">Admin Panel Login</h2>
        <form className="w-full" onSubmit={handleSubmit} autoComplete="off">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-gray-700 transition"
            required
            autoFocus
          />
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-gray-700 transition"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-2 text-xs text-blue-500 hover:underline"
              onClick={() => setShowPassword(v => !v)}
              tabIndex={-1}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {error && <div className="text-red-500 mb-2 animate-shake">{error}</div>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white py-2 rounded font-semibold hover:from-green-500 hover:to-blue-600 transition shadow-lg animate-fade-in"
          >
            Login
          </button>
        </form>
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
