import React, { useEffect, useState } from 'react';

/**
 * Alert Component
 * Dismissible alert messages with auto-hide
 */
function Alert({ 
  type = 'info', 
  message, 
  onClose,
  autoHide = true,
  duration = 5000
}) {
  const [visible, setVisible] = useState(!!message);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }

    setVisible(true);

    if (autoHide) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, autoHide, duration, onClose]);

  if (!visible || !message) return null;

  const typeConfig = {
    success: {
      icon: '✓',
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon_color: 'text-green-600',
    },
    error: {
      icon: '✕',
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon_color: 'text-red-600',
    },
    warning: {
      icon: '!',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon_color: 'text-yellow-600',
    },
    info: {
      icon: 'ℹ',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon_color: 'text-blue-600',
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div 
      className={`${config.bg} border-l-4 ${config.border} ${config.text} px-4 py-3 rounded-lg flex items-start gap-3 animate-slideDown`}
      role="alert"
    >
      <span className={`text-lg font-bold ${config.icon_color} flex-shrink-0 mt-0.5`}>
        {config.icon}
      </span>
      <p className="flex-1 text-sm font-medium">{message}</p>
      {onClose && (
        <button
          onClick={() => {
            setVisible(false);
            onClose();
          }}
          className={`flex-shrink-0 ${config.icon_color} hover:opacity-70 transition font-bold`}
          aria-label="Close alert"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default Alert;
