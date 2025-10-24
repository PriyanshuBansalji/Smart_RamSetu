import React from "react";

const PatientFooter: React.FC = () => (
  <footer className="bg-gradient-to-r from-rose-700 via-rose-600 to-emerald-700 text-white py-8 mt-auto text-center shadow-inner">
    <div className="flex flex-col items-center gap-3">
      <img src="/logo.png" alt="Ram Setu logo" className="h-12 w-12 rounded-full border-2 border-white bg-white object-contain" />
      <div className="text-lg font-semibold">&copy; {new Date().getFullYear()} RamSetu. All rights reserved.</div>
      <div className="text-sm">
        A compassionate bridge for patients. <span className="mx-2">|</span>
        <a href="/about" className="underline hover:text-rose-100">About</a>
        <span className="mx-2">|</span>
        <a href="/contact" className="underline hover:text-rose-100">Contact</a>
      </div>
    </div>
  </footer>
);

export default PatientFooter;
