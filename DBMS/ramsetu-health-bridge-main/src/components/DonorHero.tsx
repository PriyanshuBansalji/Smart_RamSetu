import React from "react";

const DonorHero: React.FC = () => (
  <section className="relative w-full flex flex-col items-center justify-center py-20 px-4 bg-gradient-to-br from-blue-800 via-blue-400 to-green-400 overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <svg width="100%" height="100%" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path fill="#fff" fillOpacity="0.2" d="M0,160L60,165.3C120,171,240,181,360,186.7C480,192,600,192,720,186.7C840,181,960,171,1080,176C1200,181,1320,203,1380,213.3L1440,224L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path>
      </svg>
    </div>
    <div className="relative z-10 text-center">
      <div className="relative flex flex-row items-center justify-center gap-16 mb-8 animate-fade-in">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-white/60 backdrop-blur-lg shadow-2xl" style={{ filter: 'blur(2px)' }}></div>
          <img src="/logo.png" alt="RamSetu Logo" className="h-48 w-48 rounded-full shadow-2xl border-4 border-white object-contain animate-float" style={{ position: 'relative', zIndex: 1 }} />
        </div>
        <div className="text-left max-w-xl">
          <h1 className="text-6xl md:text-7xl font-extrabold text-white drop-shadow-lg mb-6 animate-fade-in" style={{ textShadow: '0 4px 24px rgba(0,0,0,0.18)' }}>Be a Hero. Donate Life.</h1>
          <p className="text-2xl md:text-3xl text-blue-100 mb-10 animate-fade-in" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
            Your decision to donate can save lives and inspire hope. Join RamSetu and become a part of a compassionate community of organ donors.
          </p>
          <div className="flex flex-wrap gap-8 mt-8 animate-fade-in">
            <a href="#organs" className="bg-gradient-to-r from-green-500 to-blue-700 text-white font-bold text-xl px-10 py-5 rounded-2xl shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200">Choose Organ to Donate</a>
            <a href="/donor-dashboard" className="bg-white text-blue-900 font-bold text-xl px-10 py-5 rounded-2xl shadow-xl hover:scale-105 hover:bg-blue-100 transition-all duration-200">Go to Dashboard</a>
          </div>
        </div>
      </div>
    </div>
    <style>{`
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-16px); }
      }
      .animate-float {
        animation: float 3s ease-in-out infinite;
      }
    `}</style>
  </section>
);

export default DonorHero;
