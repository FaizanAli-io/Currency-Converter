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
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
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
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
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
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
