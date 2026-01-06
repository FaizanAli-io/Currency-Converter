import { useState, useEffect, useCallback } from 'react';
import { historyService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ConversionHistory } from '../types';

export const useConversionHistory = () => {
  const { isAuthenticated, guestId } = useAuth();
  const [history, setHistory] = useState<ConversionHistory[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await historyService.getHistory(
        isAuthenticated ? undefined : guestId || undefined,
        page
      );
      setHistory(response.data.data);
      setTotal(response.data.total);
      setError(null);
    } catch (err) {
      setError('Failed to load history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, guestId]);

  useEffect(() => {
    if (isAuthenticated || guestId) {
      fetchHistory();
    }
  }, [isAuthenticated, guestId, fetchHistory]);

  const clearHistory = async () => {
    try {
      await historyService.clearHistory(
        isAuthenticated ? undefined : guestId || undefined
      );
      setHistory([]);
      setTotal(0);
    } catch (err) {
      console.error(err);
    }
  };

  const refresh = () => fetchHistory();

  return { history, total, loading, error, clearHistory, refresh };
};
