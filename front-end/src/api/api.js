import axios from 'axios';

// Base URL for all API requests
const API_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  // Include credentials with requests (important for CSRF)
  withCredentials: true,
  // Set proper content type
  headers: {
    'Content-Type': 'application/json',
  }
});

// Function to get CSRF token from cookie
function getCsrfToken() {
  const tokenCookieName = 'csrftoken'; // Django's default CSRF cookie name
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === tokenCookieName) {
      return value;
    }
  }
  return null;
}

// Add request interceptor to include CSRF token in headers
api.interceptors.request.use(
  (config) => {
    // Only add the X-CSRFToken header for non-GET requests
    if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;