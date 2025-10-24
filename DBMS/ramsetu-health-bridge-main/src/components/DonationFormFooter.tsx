import React from "react";

const DonationFormFooter = () => (
  <footer className="w-full bg-gradient-to-r from-blue-900 to-green-700 text-white py-6 mt-12 text-center rounded-b-3xl shadow-inner animate-fade-in">
    <div className="mb-2 text-lg font-semibold">&copy; {new Date().getFullYear()} RamSetu. All rights reserved.</div>
    <div className="text-sm">A secure bridge between donors and patients.</div>
  </footer>
);

export default DonationFormFooter;
