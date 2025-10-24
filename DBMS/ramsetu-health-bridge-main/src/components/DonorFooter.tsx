import React from "react";

const DonorFooter: React.FC = () => (
  <footer className="bg-gradient-to-r from-blue-900 to-green-700 text-white py-8 mt-auto text-center shadow-inner animate-fade-in">
    <div className="mb-2 text-lg font-semibold">&copy; {new Date().getFullYear()} RamSetu. All rights reserved.</div>
    <div className="text-sm">A secure bridge between donors and patients. <span className="mx-2">|</span> <a href="/about" className="underline hover:text-green-200">About</a> <span className="mx-2">|</span> <a href="/contact" className="underline hover:text-green-200">Contact</a></div>
  </footer>
);

export default DonorFooter;
