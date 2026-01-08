import React from 'react';

/**
 * Icon Components
 * Reusable SVG icons for the dashboard
 */

export function SearchIcon({ className = '', label = 'Search' }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      width="1em" 
      height="1em" 
      aria-label={label}
      role="img"
    >
      <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 4.11 12.12l4.26 4.26a.75.75 0 1 0 1.06-1.06l-4.26-4.26A6.75 6.75 0 0 0 10.5 3.75Zm-5.25 6.75a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0Z" clipRule="evenodd" />
    </svg>
  );
}

export function TrendingIcon({ className = '', label = 'Trending' }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor"
      aria-label={label}
      role="img"
    >
      <path d="M2.75 12a1.25 1.25 0 1 0 2.5 0 1.25 1.25 0 0 0-2.5 0ZM8.75 6.75a1.25 1.25 0 1 0 2.5 0 1.25 1.25 0 0 0-2.5 0ZM15 2.75a1.25 1.25 0 1 0 2.5 0 1.25 1.25 0 0 0-2.5 0Z" />
      <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" d="M2 13v6m5.25-9.5L9.75 8m5.25-3.75L17 5.5" />
    </svg>
  );
}

export function UserGroupIcon({ className = '', label = 'Users' }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor"
      aria-label={label}
      role="img"
    >
      <path d="M12 1a5 5 0 1 0 0 10A5 5 0 0 0 12 1zm0 13c-5.33 0-8 2.67-8 8v2h16v-2c0-5.33-2.67-8-8-8z" />
    </svg>
  );
}

export function HeartIcon({ className = '', label = 'Health' }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor"
      aria-label={label}
      role="img"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function RefreshIcon({ className = '', label = 'Refresh' }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-label={label}
      role="img"
    >
      <polyline points="1 4 1 10 7 10"></polyline>
      <path d="M3.51 15a9 9 0 0 1 14.85-3.36L22 10M23 20v-6h-6"></path>
      <path d="M20.49 9a9 9 0 0 0-14.85 3.36L2 14m0 6v6h6"></path>
    </svg>
  );
}

export function DownloadIcon({ className = '', label = 'Download' }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-label={label}
      role="img"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  );
}

export function CheckIcon({ className = '', label = 'Check' }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor"
      aria-label={label}
      role="img"
    >
      <polyline points="20 6 9 17 4 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></polyline>
    </svg>
  );
}

export function CloseIcon({ className = '', label = 'Close' }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor"
      aria-label={label}
      role="img"
    >
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );
}
