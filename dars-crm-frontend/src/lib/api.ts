import axios from 'axios';
import Cookies from 'js-cookie';

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;
    if (port === '3000') {
      return `${protocol}//${host}:8000/api/v1`;
    }
    return `${protocol}//${host}${port ? `:${port}` : ''}/api/v1`;
  }
  return 'http://localhost:8000/api/v1';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Request Interceptor: Attach JWT token and set dynamic API target
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      config.baseURL = getBaseUrl();
    }
    const token = Cookies.get('dars_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Response Interceptor: Handle global errors (e.g., Token Expiry & 403 Forbidden)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      Cookies.remove('dars_auth_token');
      Cookies.remove('user_role');
      
      // Redirect to login (only executes in the browser)
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error("Permission Denied: ", error.response.data?.detail || error.response.data?.message);
    }

    return Promise.reject(error);
  }
);

export default api;
