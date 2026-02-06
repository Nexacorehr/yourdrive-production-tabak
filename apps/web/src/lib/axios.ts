import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // CRITICAL - ensures cookies are sent
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor dependencies and helpers for token refresh
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const noRetryEndpoints = [
      "/auth/refresh",
      "/auth/me",
      "/auth/login",
      "/auth/register",
    ];
    if (
      noRetryEndpoints.some((endpoint) =>
        originalRequest.url?.includes(endpoint),
      )
    ) {
      return Promise.reject(error);
    }
    // If 401 and we haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        try {
          const refreshResponse = await api.post("/auth/refresh");
          const newAccessToken = refreshResponse.data.accessToken;

          // Update access token in localStorage
          localStorage.setItem("accessToken", newAccessToken);

          // Process any queued failed requests with new token
          processQueue(null, newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return api(originalRequest);
        } catch (refreshError) {
          // Process failed queue
          processQueue(refreshError, null);

          // Remove token and redirect to login
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
