import React from 'react';

/**
 * StatCard Component
 * Displays statistics with icon and loading state
 */
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  loading = false,
  trend = null,
  color = 'blue'
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600',
  };

  return (
    <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-400 text-sm font-medium mb-2">{label}</p>
          {loading ? (
            <div className="h-8 bg-slate-800 rounded animate-pulse w-20"></div>
          ) : (
            <h3 className="text-4xl font-bold text-white">{value}</h3>
          )}
          {trend && (
            <p className={`text-xs mt-2 flex items-center gap-1 ${
              trend.positive ? 'text-green-400' : 'text-red-400'
            }`}>
              <span>{trend.positive ? '↑' : '↓'}</span>
              {trend.text}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`bg-gradient-to-br ${colorClasses[color]} p-4 rounded-xl`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
