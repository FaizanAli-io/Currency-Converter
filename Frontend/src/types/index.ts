export interface User {
  id: string;
  email: string;
  name?: string;
}
export interface ApiQuota {
  month: number;
  limit: number;
  remaining: number;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface ConversionHistory {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  convertedAmount: number;
  exchangeRate: number;
  historicalDate?: string;
  createdAt: string;
}

export interface ConversionResult {
  convertedAmount: number;
  exchangeRate: number;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  date?: string;
  quota?: ApiQuota | null;
}
