import React from 'react';

/**
 * LoadingSpinner Component
 * Reusable loading indicator
 */
function LoadingSpinner({ 
  size = 'md', 
  text = 'Loading...', 
  fullScreen = false,
  overlay = false 
}) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}></div>
      {text && <p className="text-gray-600 text-sm font-medium">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center ${overlay ? 'bg-black/30' : 'bg-white'} z-50`}>
        {spinner}
      </div>
    );
  }

  return spinner;
}

export default LoadingSpinner;
