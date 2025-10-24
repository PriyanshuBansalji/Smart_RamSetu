import React from "react";
import { Link } from "react-router-dom";

const DonorHeader: React.FC = () => (
  <header className="bg-gradient-to-r from-blue-900 to-green-700 text-white py-6 shadow-lg flex justify-between items-center px-8">
    <div className="flex items-center gap-3">
      <img src="/logo.png" alt="Logo" className="h-12 w-12 rounded-full border-2 border-white" />
      <span className="text-2xl font-bold tracking-wide">RamSetu Donor Portal</span>
    </div>
    <nav className="flex gap-6 text-lg">
      <Link to="/donor-dashboard" className="hover:underline">Dashboard</Link>
      <Link to="/about" className="hover:underline">About</Link>
      <Link to="/contact" className="hover:underline">Contact</Link>
    </nav>
  </header>
);

export default DonorHeader;
