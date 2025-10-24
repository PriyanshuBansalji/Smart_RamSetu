import React from "react";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact Us" },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-800 to-green-600 shadow-lg py-4 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="h-12 w-12 rounded-full bg-white border-2 border-white shadow" />
          <span className="text-white text-2xl font-extrabold tracking-wide drop-shadow">RamSetu Health Bridge</span>
        </div>
        <nav className="flex gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-lg font-medium transition-colors duration-150 px-2 py-1 rounded hover:bg-white/10 hover:text-white/90 ${location.pathname === link.to ? "text-white underline underline-offset-4" : "text-blue-100"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">{children}</main>
      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-800 to-green-600 text-white py-6 px-8 mt-12 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-8 w-8 rounded-full bg-white border border-white" />
          <span className="font-bold text-lg">RamSetu Health Bridge</span>
        </div>
        <div className="text-sm mt-2 md:mt-0">&copy; {new Date().getFullYear()} RamSetu Health Bridge. All rights reserved.</div>
        <div className="flex gap-4 mt-2 md:mt-0">
          <Link to="/about" className="hover:underline">About Us</Link>
          <Link to="/contact" className="hover:underline">Contact Us</Link>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
