const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('store_rating_token');
  const headers = new Headers(options.headers || {});

  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = { success: false, message: 'The server returned an invalid response.' };
  }

  if (!response.ok) {
    const error = new Error(payload.message || 'Request failed.');
    error.status = response.status;
    error.details = payload.details;
    throw error;
  }

  return payload;
}

export const api = {
  register: (data) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  changePassword: (data) => apiRequest('/auth/password', { method: 'PUT', body: JSON.stringify(data) }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),

  stores: (params) => apiRequest(`/stores?${new URLSearchParams(params).toString()}`),
  store: (id) => apiRequest(`/stores/${id}`),
  createRating: (data) => apiRequest('/ratings', { method: 'POST', body: JSON.stringify(data) }),
  updateRating: (id, data) => apiRequest(`/ratings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  adminDashboard: () => apiRequest('/admin/dashboard'),
  adminUsers: (params) => apiRequest(`/admin/users?${new URLSearchParams(params).toString()}`),
  adminUser: (id) => apiRequest(`/admin/users/${id}`),
  createAdminUser: (data) => apiRequest('/admin/users', { method: 'POST', body: JSON.stringify(data) }),
  adminStores: (params) => apiRequest(`/admin/stores?${new URLSearchParams(params).toString()}`),
  createAdminStore: (data) => apiRequest('/admin/stores', { method: 'POST', body: JSON.stringify(data) }),

  ownerDashboard: () => apiRequest('/owner/dashboard')
};
