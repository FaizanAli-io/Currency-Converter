import { useState, useEffect } from 'react';
import { currencyService } from '../services/api';

interface CurrencyInfo {
  symbol: string;
  name: string;
  symbol_native: string;
  decimal_digits: number;
  rounding: number;
  code: string;
  name_plural: string;
}

export const useCurrencies = () => {
  const [currencies, setCurrencies] = useState<{ [key: string]: CurrencyInfo }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setLoading(true);
        const response = await currencyService.getCurrencies();
        setCurrencies(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load currencies');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  const currencyList = Object.entries(currencies).map(([code, info]) => ({
    code,
    name: info.name,
    symbol: info.symbol,
  }));

  return { currencies, currencyList, loading, error };
};
