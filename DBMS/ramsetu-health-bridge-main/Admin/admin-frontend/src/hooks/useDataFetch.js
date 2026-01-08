import { useState, useCallback } from 'react';
import { apiClient, ApiError } from '../utils/apiClient.js';
import { STORAGE_KEYS, ERROR_MESSAGES } from '../config.js';

/**
 * useDataFetch Hook
 * Manages data fetching with loading and error states
 */
export function useDataFetch(endpoint, onAuthFailed) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) {
        setError('Session expired. Please log in again.');
        if (onAuthFailed) onAuthFailed();
        setLoading(false);
        return;
      }

      const result = await apiClient.get(endpoint);
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      if (err?.status === 401 || err?.status === 403) {
        setError('Authentication failed. Please log in again.');
        if (onAuthFailed) onAuthFailed();
      } else {
        const message = err instanceof ApiError 
          ? err.message 
          : ERROR_MESSAGES.FETCH_FAILED || 'Failed to fetch data';
        setError(message);
      }
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, onAuthFailed]);

  return { data, loading, error, fetch, setData };
}
