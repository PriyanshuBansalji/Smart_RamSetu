import React from 'react';

/**
 * DataTable Component
 * Displays tabular data with loading and empty states
 */
function DataTable({ 
  columns,
  rows,
  loading = false,
  error = null,
  onRowClick = null,
  className = ''
}) {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-lg text-center">
        <p className="font-semibold mb-2">⚠️ Error loading data</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-slate-800 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 text-slate-400 px-6 py-12 rounded-lg text-center">
        <p className="text-lg font-semibold mb-1">📭 No data found</p>
        <p className="text-sm">Try adjusting your search filters</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-lg border border-slate-700 ${className}`}>
      <table className="w-full text-sm text-slate-200">
        <thead>
          <tr className="bg-slate-800 border-b border-slate-700">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-3 text-left font-semibold text-slate-300"
                style={col.width ? { width: col.width } : {}}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={idx}
              className={`border-b border-slate-700 hover:bg-slate-800/50 transition ${
                onRowClick ? 'cursor-pointer' : ''
              }`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
