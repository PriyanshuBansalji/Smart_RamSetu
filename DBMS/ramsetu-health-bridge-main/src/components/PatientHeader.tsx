import React from "react";
import { Link } from "react-router-dom";

const PatientHeader: React.FC = () => (
  <header className="bg-gradient-to-r from-rose-700 via-rose-600 to-emerald-700 text-white py-6 shadow-lg flex justify-between items-center px-8">
    <div className="flex items-center gap-3">
  <img src="/logo.png" alt="Ram Setu logo" className="h-12 w-12 rounded-full border-2 border-white bg-white object-contain" />
      <span className="text-2xl font-bold tracking-wide">RamSetu Patient Portal</span>
    </div>
    <nav className="flex gap-6 text-lg">
      <Link to="/patient-dashboard" className="hover:underline">Dashboard</Link>
      <Link to="/about" className="hover:underline">About</Link>
      <Link to="/contact" className="hover:underline">Contact</Link>
    </nav>
  </header>
);

export default PatientHeader;
