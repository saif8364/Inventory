/**
 * Centralized API client for standardizing requests, headers, token attachment,
 * and standard error response formatting across the frontend.
 */

const API_BASE_URL = '/api';

class ApiClient {
  /**
   * Helper to perform HTTP fetch requests.
   * @param {string} endpoint - e.g. '/items' or '/auth/login'
   * @param {object} options - fetch options (method, body, headers, etc.)
   */
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('inventory_token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // If 401 Unauthorized, token might be invalid or expired
        if (response.status === 401 && !endpoint.includes('/auth/login')) {
          localStorage.removeItem('inventory_token');
          localStorage.removeItem('inventory_user');
          window.location.href = '/login.html';
          return;
        }

        const error = new Error(data.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  }

  get(endpoint, params = {}) {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    ).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  }

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  }

  patch(endpoint, body) {
    return this.request(endpoint, { method: 'PATCH', body });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

const api = new ApiClient();
