import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface CurrencyRates {
  [key: string]: number;
}
export interface ApiQuota {
  month: number;
  limit: number;
  remaining: number;
}

interface ApiResponse {
  data: CurrencyRates;
  quotas?: {
    month: {
      total: number;
      used: number;
      remaining: number;
    };
  };
}

export interface CurrencyInfo {
  symbol: string;
  name: string;
  symbol_native: string;
  decimal_digits: number;
  rounding: number;
  code: string;
  name_plural: string;
}

interface CurrenciesResponse {
  data: {
    [key: string]: CurrencyInfo;
  };
}

@Injectable()
export class CurrencyService {
  private readonly apiUrl = 'https://api.freecurrencyapi.com/v1';
  private readonly apiKey: string;
  private lastQuota: ApiQuota | null = null;

  // In-memory cache for rates (saves API quota)
  private ratesCache: Map<string, { data: CurrencyRates; timestamp: number }> =
    new Map();
  private currenciesCache: {
    data: CurrenciesResponse['data'] | null;
    timestamp: number;
  } = { data: null, timestamp: 0 };

  // Cache TTL: 5 minutes for latest rates, 24 hours for historical & currencies
  private readonly LATEST_CACHE_TTL = 5 * 60 * 1000;
  private readonly HISTORICAL_CACHE_TTL = 24 * 60 * 60 * 1000;
  private readonly CURRENCIES_CACHE_TTL = 24 * 60 * 60 * 1000;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('CURRENCY_API_KEY');
    if (!apiKey) {
      throw new Error('CURRENCY_API_KEY is not configured');
    }
    this.apiKey = apiKey;
  }

  private extractQuota(response: any): void {
    // Extract quota from response headers
    const headers = response.headers;
    const limitMonth = headers?.['x-ratelimit-limit-quota-month'];
    const remainingMonth = headers?.['x-ratelimit-remaining-quota-month'];

    if (limitMonth && remainingMonth) {
      const limit = parseInt(limitMonth, 10);
      const remaining = parseInt(remainingMonth, 10);

      this.lastQuota = {
        month: limit,
        limit: limit,
        remaining: remaining,
      };
    }
  }

  getQuota(): ApiQuota | null {
    return this.lastQuota;
  }

  async getCurrencies(): Promise<CurrenciesResponse['data']> {
    // Check cache first
    if (
      this.currenciesCache.data &&
      Date.now() - this.currenciesCache.timestamp < this.CURRENCIES_CACHE_TTL
    ) {
      return this.currenciesCache.data;
    }

    try {
      const response = await axios.get<CurrenciesResponse>(
        `${this.apiUrl}/currencies`,
        {
          params: { apikey: this.apiKey },
        },
      );
      this.extractQuota(response);

      // Update cache
      this.currenciesCache = {
        data: response.data.data,
        timestamp: Date.now(),
      };

      return response.data.data;
    } catch (error) {
      // Return stale cache if available
      if (this.currenciesCache.data) {
        return this.currenciesCache.data;
      }
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getLatestRates(baseCurrency: string = 'USD'): Promise<CurrencyRates> {
    const cacheKey = `latest-${baseCurrency}`;
    const cached = this.ratesCache.get(cacheKey);

    // Return cached data if still valid
    if (cached && Date.now() - cached.timestamp < this.LATEST_CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await axios.get<ApiResponse>(`${this.apiUrl}/latest`, {
        params: {
          apikey: this.apiKey,
          base_currency: baseCurrency,
        },
      });
      this.extractQuota(response);

      // Update cache
      this.ratesCache.set(cacheKey, {
        data: response.data.data,
        timestamp: Date.now(),
      });

      return response.data.data;
    } catch (error) {
      // Return stale cache if available
      if (cached) {
        return cached.data;
      }
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getHistoricalRates(
    date: string,
    baseCurrency: string = 'USD',
  ): Promise<CurrencyRates> {
    const cacheKey = `historical-${date}-${baseCurrency}`;
    const cached = this.ratesCache.get(cacheKey);

    // Historical rates never change, use longer cache
    if (cached && Date.now() - cached.timestamp < this.HISTORICAL_CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await axios.get<any>(`${this.apiUrl}/historical`, {
        params: {
          apikey: this.apiKey,
          base_currency: baseCurrency,
          date,
        },
      });
      this.extractQuota(response);

      // Historical API returns data in format: { 'YYYY-MM-DD': { AUD: 1.5, ... } }
      const responseData = response.data.data;
      let rates: CurrencyRates;

      if (responseData && typeof responseData === 'object') {
        // Check if it's date-keyed format
        const dateKey = Object.keys(responseData)[0];
        if (dateKey && responseData[dateKey]) {
          rates = responseData[dateKey];
        } else {
          rates = responseData;
        }

        // Cache the result
        this.ratesCache.set(cacheKey, {
          data: rates,
          timestamp: Date.now(),
        });

        return rates;
      }

      throw new HttpException(
        'Invalid historical data format',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } catch (error) {
      // Return stale cache if available
      if (cached) {
        return cached.data;
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async convert(
    fromCurrency: string,
    toCurrency: string,
    amount: number,
    date?: string,
  ): Promise<{
    convertedAmount: number;
    exchangeRate: number;
    fromCurrency: string;
    toCurrency: string;
    amount: number;
    date?: string;
    quota?: ApiQuota | null;
  }> {
    try {
      let rates: CurrencyRates;

      if (date) {
        rates = await this.getHistoricalRates(date, fromCurrency);
      } else {
        rates = await this.getLatestRates(fromCurrency);
      }

      const exchangeRate = rates[toCurrency];
      if (!exchangeRate) {
        throw new HttpException(
          `Currency ${toCurrency} not supported`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const convertedAmount = amount * exchangeRate;

      return {
        convertedAmount,
        exchangeRate,
        fromCurrency,
        toCurrency,
        amount,
        date,
        quota: this.getQuota(),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
