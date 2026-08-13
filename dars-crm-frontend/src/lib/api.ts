import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Request Interceptor: Attach the JWT token
api.interceptors.request.use(
  (config) => {
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
    
    // Handle 403 Forbidden (e.g., Zakat compliance or Super Admin escalation violation)
    if (error.response?.status === 403) {
      console.error("Permission Denied: ", error.response.data?.detail || error.response.data?.message);
    }

    return Promise.reject(error);
  }
);

export default api;
