import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface CurrencyRates {
  [key: string]: number;
}

interface ApiResponse {
  data: CurrencyRates;
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

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('CURRENCY_API_KEY');
    if (!apiKey) {
      throw new Error('CURRENCY_API_KEY is not configured');
    }
    this.apiKey = apiKey;
  }

  async getCurrencies(): Promise<CurrenciesResponse['data']> {
    try {
      const response = await axios.get<CurrenciesResponse>(
        `${this.apiUrl}/currencies`,
        {
          params: { apikey: this.apiKey },
        },
      );
      return response.data.data;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch currencies',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getLatestRates(baseCurrency: string = 'USD'): Promise<CurrencyRates> {
    try {
      const response = await axios.get<ApiResponse>(`${this.apiUrl}/latest`, {
        params: {
          apikey: this.apiKey,
          base_currency: baseCurrency,
        },
      });
      return response.data.data;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch latest rates',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getHistoricalRates(
    date: string,
    baseCurrency: string = 'USD',
  ): Promise<CurrencyRates> {
    try {
      const response = await axios.get<ApiResponse>(
        `${this.apiUrl}/historical`,
        {
          params: {
            apikey: this.apiKey,
            base_currency: baseCurrency,
            date,
          },
        },
      );
      return response.data.data;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch historical rates',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to convert currency',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTimeSeriesRates(
    startDate: string,
    endDate: string,
    baseCurrency: string = 'USD',
    currencies: string[] = [],
  ): Promise<{ [date: string]: CurrencyRates }> {
    try {
      // Free API doesn't support time series, so we'll simulate it
      // by fetching historical rates for each date in range
      const dates: string[] = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Limit to 30 days
      const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const maxDays = Math.min(daysDiff, 30);
      const step = Math.max(1, Math.floor(daysDiff / 10));
      
      for (let i = 0; i <= maxDays; i += step) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }
      
      // Add end date if not included
      if (dates[dates.length - 1] !== endDate) {
        dates.push(endDate);
      }

      const results: { [date: string]: CurrencyRates } = {};
      
      for (const date of dates) {
        try {
          const rates = await this.getHistoricalRates(date, baseCurrency);
          if (currencies.length > 0) {
            const filteredRates: CurrencyRates = {};
            currencies.forEach((currency) => {
              if (rates[currency]) {
                filteredRates[currency] = rates[currency];
              }
            });
            results[date] = filteredRates;
          } else {
            results[date] = rates;
          }
        } catch {
          // Skip dates that fail
        }
      }

      return results;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch time series rates',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
