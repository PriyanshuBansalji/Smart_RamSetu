import React from "react";

const DonationFormHeader = ({ organ }: { organ: string }) => (
  <header className="w-full bg-gradient-to-r from-blue-900 to-green-700 py-6 px-8 flex items-center gap-6 rounded-t-3xl shadow-lg mb-8">
    <img src="/logo.png" alt="Logo" className="h-14 w-14 rounded-full border-2 border-white bg-white" />
    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-wide">{organ} Donation - Test Reports & Consent</h1>
  </header>
);

export default DonationFormHeader;
