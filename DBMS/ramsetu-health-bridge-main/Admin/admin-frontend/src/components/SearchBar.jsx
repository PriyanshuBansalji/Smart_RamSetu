import React, { useCallback } from 'react';
import { SearchIcon, RefreshIcon } from './icons.jsx';

/**
 * SearchBar Component
 * Searchable input with refresh button
 */
function SearchBar({ 
  value,
  onChange,
  onRefresh,
  placeholder = 'Search...',
  loading = false,
  disabled = false
}) {
  return (
    <div className="flex gap-2">
      <div className="flex-1 relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || loading}
          className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
          aria-label="Search"
        />
      </div>
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={loading || disabled}
          className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
          aria-label="Refresh data"
        >
          <RefreshIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      )}
    </div>
  );
}

export default SearchBar;
