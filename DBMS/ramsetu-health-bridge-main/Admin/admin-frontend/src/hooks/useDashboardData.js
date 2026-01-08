import { useState, useCallback, useEffect } from 'react';
import { apiClient, ApiError } from '../utils/apiClient.js';
import { STORAGE_KEYS } from '../config.js';

/**
 * useDashboardData Hook
 * Manages dashboard data fetching, filtering, and export
 */
export function useDashboardData() {
  const [apiBase, setApiBase] = useState(() => 
    sessionStorage.getItem('apiBase') || 'http://localhost:5000'
  );
  const [adminToken, setAdminToken] = useState(() => 
    sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken') || ''
  );

  // Persist settings
  useEffect(() => {
    sessionStorage.setItem('apiBase', apiBase);
  }, [apiBase]);

  useEffect(() => {
    if (adminToken) sessionStorage.setItem('adminToken', adminToken);
  }, [adminToken]);

  /**
   * Build headers with auth token
   */
  const withAuthHeaders = useCallback((extra = {}) => ({
    ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
    ...extra
  }), [adminToken]);

  /**
   * Build API URL with optional query params
   */
  const buildUrl = useCallback((path, opts = {}) => {
    const base = opts.baseUrl || apiBase;
    const url = new URL(path, base);
    if (opts.params) {
      Object.entries(opts.params).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '') {
          url.searchParams.append(k, v);
        }
      });
    }
    return url.toString();
  }, [apiBase]);

  return {
    apiBase,
    setApiBase,
    adminToken,
    setAdminToken,
    withAuthHeaders,
    buildUrl
  };
}

/**
 * useDataFetchWithRefresh Hook
 * Fetches data with auto-refresh capability
 */
export function useDataFetchWithRefresh(fetchFn, initialData = []) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchFn();
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      const message = err instanceof ApiError 
        ? err.message 
        : 'Failed to fetch data';
      setError(message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  // Initial fetch
  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    data,
    setData,
    loading,
    error,
    refresh: fetch
  };
}

/**
 * useFiltered Hook
 * Filter and search data
 */
export function useFiltered(data, filterFn) {
  return useCallback(() => {
    if (typeof filterFn === 'function') {
      return data.filter(filterFn);
    }
    return data;
  }, [data, filterFn])();
}

/**
 * usePaginated Hook
 * Paginate data
 */
export function usePaginated(data, pageSize = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil((data?.length || 0) / pageSize);
  const paginatedData = data?.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  ) || [];

  return {
    paginatedData,
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize
  };
}
