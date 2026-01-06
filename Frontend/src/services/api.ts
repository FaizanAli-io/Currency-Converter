import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth services
export const authService = {
  register: (email: string, password: string, name?: string) =>
    api.post('/auth/register', { email, password, name }),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  verifyOtp: (email: string, otp: string) =>
    api.post('/auth/verify-otp', { email, otp }),

  resendOtp: (email: string) =>
    api.post('/auth/resend-otp', { email }),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),

  getProfile: () => api.get('/auth/me'),
};

// Currency services
export const currencyService = {
  getCurrencies: () => api.get('/currency/list'),

  getLatestRates: (baseCurrency: string = 'USD') =>
    api.get(`/currency/rates?base=${baseCurrency}`),

  getHistoricalRates: (date: string, baseCurrency: string = 'USD') =>
    api.get(`/currency/historical?date=${date}&base=${baseCurrency}`),

  getTimeSeries: (
    startDate: string,
    endDate: string,
    baseCurrency: string = 'USD',
    currencies: string[] = []
  ) =>
    api.get(
      `/currency/timeseries?start_date=${startDate}&end_date=${endDate}&base=${baseCurrency}&currencies=${currencies.join(',')}`
    ),

  convert: (
    fromCurrency: string,
    toCurrency: string,
    amount: number,
    date?: string,
    guestId?: string
  ) =>
    api.post('/currency/convert', {
      fromCurrency,
      toCurrency,
      amount,
      date,
      guestId,
    }),
};

// History services
export const historyService = {
  getHistory: (guestId?: string, page: number = 1, limit: number = 20) => {
    const params = new URLSearchParams();
    if (guestId) params.append('guestId', guestId);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    return api.get(`/history?${params.toString()}`);
  },

  clearHistory: (guestId?: string) => {
    const params = guestId ? `?guestId=${guestId}` : '';
    return api.delete(`/history${params}`);
  },
};

export default api;
