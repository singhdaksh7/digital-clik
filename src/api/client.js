const API_BASE_URL = 'http://localhost:5000/api';

export function getAuthToken() {
  return localStorage.getItem('dc_admin_token') || '';
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('dc_admin_token', token);
  } else {
    localStorage.removeItem('dc_admin_token');
  }
}

export async function fetchApi(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.error?.message || `HTTP ${res.status} Error`);
    }

    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}
