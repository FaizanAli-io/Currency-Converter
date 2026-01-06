import { useState, useEffect, useCallback } from "react";
import { historyService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { ConversionHistory } from "../types";

export const useConversionHistory = () => {
  const { isAuthenticated, guestId } = useAuth();
  const [history, setHistory] = useState<ConversionHistory[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = isAuthenticated
    ? "history-cache-user"
    : `history-cache-${guestId || "guest"}`;
  const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  const fetchHistory = useCallback(
    async (page: number = 1, forceRefresh: boolean = false) => {
      try {
        setLoading(true);

        if (!forceRefresh) {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            const parsed = JSON.parse(cached) as {
              timestamp: number;
              data: ConversionHistory[];
              total: number;
            };
            if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
              console.log("Using cached history:", parsed.data);
              setHistory(parsed.data);
              setTotal(parsed.total);
              setError(null);
              setLoading(false);
              return;
            }
          }
        }

        const identifier = isAuthenticated ? "user" : guestId;
        console.log(
          `Fetching history for ${
            isAuthenticated ? "authenticated user" : "guest"
          }: ${identifier}`
        );
        const response = await historyService.getHistory(
          isAuthenticated ? undefined : guestId || undefined,
          page
        );
        console.log("Fetched history:", response.data);
        setHistory(response.data.data);
        setTotal(response.data.total);
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            timestamp: Date.now(),
            data: response.data.data,
            total: response.data.total
          })
        );
        setError(null);
      } catch (err) {
        setError("Failed to load history");
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached) as {
            data: ConversionHistory[];
            total: number;
          };
          setHistory(parsed.data);
          setTotal(parsed.total);
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [cacheKey, isAuthenticated, guestId]
  );

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
      localStorage.removeItem(cacheKey);
    } catch (err) {
      console.error(err);
    }
  };

  const refresh = () => {
    console.log("Force refreshing history...");
    fetchHistory(1, true);
  };

  return { history, total, loading, error, clearHistory, refresh };
};
