import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Request interceptor to attach access token
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access');
      if (token && config.headers) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 errors and token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        if (typeof window !== 'undefined') {
          const refreshToken = localStorage.getItem('refresh');
          if (refreshToken) {
            const res = await axios.post(`${API_URL}token/refresh/`, {
              refresh: refreshToken,
            });
            localStorage.setItem('access', res.data.access);
            
            // Update the original request's authorization header
            if (originalRequest.headers) {
              originalRequest.headers.set('Authorization', `Bearer ${res.data.access}`);
            }
            return axiosInstance(originalRequest);
          }
        }
      } catch (refreshError) {
        // If refresh token fails, clear local storage and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
