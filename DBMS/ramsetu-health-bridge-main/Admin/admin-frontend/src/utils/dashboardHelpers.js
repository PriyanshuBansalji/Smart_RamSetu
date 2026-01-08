/**
 * Dashboard Helper Functions
 * Utility functions for data formatting and normalization
 */

/**
 * Normalize ID from various formats
 * Handles MongoDB ObjectId, string, and object formats
 */
export const normalizeId = (val) => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    const cand = val._id || val.id || val.$oid || val.value || '';
    if (cand) return String(cand);
    try { return String(val); } catch { return ''; }
  }
  try { return String(val); } catch { return ''; }
};

/**
 * Format date and time
 * Returns localized string or dash if invalid
 */
export const formatDateTime = (d) => { 
  try { 
    return d ? new Date(d).toLocaleString() : '—'; 
  } catch { 
    return String(d || '—'); 
  } 
};

/**
 * Format date only (no time)
 */
export const formatDate = (d) => {
  try {
    return d ? new Date(d).toLocaleDateString() : '—';
  } catch {
    return String(d || '—');
  }
};

/**
 * Calculate age from date of birth
 * Returns age in format "25y" or empty string if invalid
 */
export const calcAge = (dob) => { 
  try { 
    const b = new Date(dob); 
    if (isNaN(b)) return ''; 
    return `${Math.floor((Date.now() - b) / 31557600000)}y`; 
  } catch { 
    return ''; 
  } 
};

/**
 * Get blood group display text with color
 */
export const getBloodGroupColor = (bloodGroup) => {
  const colors = {
    'O+': 'bg-red-100 text-red-800',
    'O-': 'bg-red-200 text-red-900',
    'A+': 'bg-blue-100 text-blue-800',
    'A-': 'bg-blue-200 text-blue-900',
    'B+': 'bg-yellow-100 text-yellow-800',
    'B-': 'bg-yellow-200 text-yellow-900',
    'AB+': 'bg-purple-100 text-purple-800',
    'AB-': 'bg-purple-200 text-purple-900',
  };
  return colors[bloodGroup] || 'bg-gray-100 text-gray-800';
};

/**
 * Format phone number
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Get status badge color
 */
export const getStatusColor = (status) => {
  const colors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'verified': 'bg-green-100 text-green-800',
    'approved': 'bg-blue-100 text-blue-800',
    'rejected': 'bg-red-100 text-red-800',
    'donated': 'bg-green-200 text-green-900',
    'matched': 'bg-purple-100 text-purple-800',
    'in-progress': 'bg-blue-100 text-blue-800',
  };
  return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text, length = 50) => {
  if (!text) return '';
  return text.length > length ? text.slice(0, length) + '...' : text;
};

/**
 * CSV Export helper
 */
export const isBinaryLike = (v) => v && typeof v === 'object' && (
  (v.data && (v.contentType || typeof v.data === 'object')) ||
  (Array.isArray(v) && v.length > 0 && typeof v[0] === 'object' && (v[0].data || v[0].buffer))
);

export const flatten = (obj, prefix = '') => {
  const result = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const val = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (val === null || val === undefined) {
        result[newKey] = '';
      } else if (typeof val === 'object' && !Array.isArray(val) && !isBinaryLike(val)) {
        Object.assign(result, flatten(val, newKey));
      } else if (!isBinaryLike(val)) {
        result[newKey] = String(val);
      }
    }
  }
  return result;
};

export const toCSV = (rows) => {
  if (!rows || rows.length === 0) return '';
  const flat = rows.map(r => flatten(r));
  const keys = [...new Set(flat.flatMap(Object.keys))];
  const header = keys.map(k => `"${k.replace(/"/g, '""')}"`).join(',');
  const body = flat.map(row =>
    keys.map(k => {
      const val = row[k] || '';
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',')
  ).join('\n');
  return header + '\n' + body;
};

export const downloadCSV = (filename, text) => {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};
