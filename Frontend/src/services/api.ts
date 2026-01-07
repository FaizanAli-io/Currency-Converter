import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Simple in-memory cache for API responses
const apiCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

const getCached = <T>(key: string): T | null => {
  const cached = apiCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }
  return null;
};

const setCache = (key: string, data: unknown) => {
  apiCache.set(key, { data, timestamp: Date.now() });
};

// Auth services
export const authService = {
  register: (email: string, password: string, name?: string) =>
    api.post("/auth/register", { email, password, name }),

  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),

  verifyOtp: (email: string, otp: string) =>
    api.post("/auth/verify-otp", { email, otp }),

  resendOtp: (email: string) => api.post("/auth/resend-otp", { email }),

  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post("/auth/reset-password", { token, newPassword }),

  getProfile: () => api.get("/auth/me")
};

// Currency services with caching
export const currencyService = {
  getCurrencies: async () => {
    const cacheKey = "currencies";
    const cached = getCached<{ data: unknown }>(cacheKey);
    if (cached) return cached;
    const response = await api.get("/currency/list");
    setCache(cacheKey, response);
    return response;
  },

  getLatestRates: async (baseCurrency: string = "USD") => {
    const cacheKey = `rates-${baseCurrency}`;
    const cached = getCached<{ data: unknown }>(cacheKey);
    if (cached) return cached;
    const response = await api.get(`/currency/rates?base=${baseCurrency}`);
    setCache(cacheKey, response);
    return response;
  },

  getHistoricalRates: async (date: string, baseCurrency: string = "USD") => {
    const cacheKey = `historical-${date}-${baseCurrency}`;
    const cached = getCached<{ data: unknown }>(cacheKey);
    if (cached) return cached;
    const response = await api.get(
      `/currency/historical?date=${date}&base=${baseCurrency}`
    );
    setCache(cacheKey, response);
    return response;
  },

  convert: (
    fromCurrency: string,
    toCurrency: string,
    amount: number,
    date?: string
  ) =>
    api.post("/currency/convert", {
      fromCurrency,
      toCurrency,
      amount,
      date
    }),

  clearCache: () => apiCache.clear()
};

// History services
export const historyService = {
  getHistory: (page: number = 1, limit: number = 5) => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    return api.get(`/history?${params.toString()}`);
  },

  clearHistory: () => {
    return api.delete(`/history`);
  }
};

export default api;
