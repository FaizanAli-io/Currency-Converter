import { useState, useEffect } from "react";
import { currencyService } from "../services/api";

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
  const [currencies, setCurrencies] = useState<{ [key: string]: CurrencyInfo }>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const CACHE_KEY = "currencies-cache-v1";
  const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as {
            timestamp: number;
            data: { [k: string]: CurrencyInfo };
          };
          if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
            setCurrencies(parsed.data);
            setLoading(false);
            return;
          }
        }

        setLoading(true);
        const response = await currencyService.getCurrencies();
        setCurrencies(response.data);
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ timestamp: Date.now(), data: response.data })
        );
        setError(null);
      } catch (err) {
        setError("Failed to load currencies");
        // Use stale cache if available to save API hits
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as {
            data: { [k: string]: CurrencyInfo };
          };
          setCurrencies(parsed.data);
        }
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
    symbol: info.symbol
  }));

  return { currencies, currencyList, loading, error };
};
