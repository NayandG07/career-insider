import axios from 'axios';

export const getApiBaseUrl = () => {
  const rawUrl = import.meta.env.VITE_API_URL || '';
  if (!rawUrl) return '/api';
  const cleanUrl = rawUrl.replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
});

// Request interceptor: attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do NOT intercept auth routes (login, register).
    // A 401 from /auth/login or /auth/register means bad credentials — let the
    // calling code handle that error via the thrown exception, not a redirect.
    const isAuthRoute = originalRequest.url?.includes('/auth/');
    if (isAuthRoute) {
      return Promise.reject(error);
    }

    // If 401 on a protected route and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          // Attempt refresh
          const res = await axios.post(`${getApiBaseUrl()}/auth/refresh-token`, { refreshToken });
          localStorage.setItem('accessToken', res.data.accessToken);
          localStorage.setItem('refreshToken', res.data.refreshToken);

          originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed — clear tokens. The AppContext will detect the missing
          // token on next render and return to unauthenticated state.
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      } else {
        // No refresh token available — clear any stale access token
        localStorage.removeItem('accessToken');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
