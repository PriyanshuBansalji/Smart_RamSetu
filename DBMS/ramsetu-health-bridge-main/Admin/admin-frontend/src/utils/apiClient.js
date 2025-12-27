// Centralized API client with common utilities
import { API_CONFIG, STORAGE_KEYS, ERROR_MESSAGES } from '../config.js';

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export const apiClient = {
  /**
   * Fetch with authentication headers and error handling
   */
  async request(endpoint, options = {}) {
    const token = sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const baseUrl = options.baseUrl || API_CONFIG.MAIN_API_URL;

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const url = `${baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || ERROR_MESSAGES.SERVER_ERROR,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error.message || ERROR_MESSAGES.NETWORK_ERROR,
        null,
        error
      );
    }
  },

  /**
   * GET request
   */
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  /**
   * POST request
   */
  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  /**
   * PUT request
   */
  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  /**
   * DELETE request
   */
  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  },
};
