import { useState, useEffect, useCallback } from "react";
import { historyService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { ConversionHistory } from "../types";

export const useConversionHistory = () => {
  const { isAuthenticated, guestId } = useAuth();
  const [history, setHistory] = useState<ConversionHistory[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = isAuthenticated
    ? "history-cache-user"
    : `history-cache-${guestId || "guest"}`;
  const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  const fetchHistory = useCallback(
    async (pageNum: number = 1, forceRefresh: boolean = false) => {
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
          }: ${identifier}, page: ${pageNum}`
        );
        const response = await historyService.getHistory(pageNum);
        console.log("Fetched history:", response.data);
        setHistory(response.data.data);
        setTotal(response.data.total);
        setPage(pageNum);
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
      await historyService.clearHistory();
      setHistory([]);
      setTotal(0);
      localStorage.removeItem(cacheKey);
    } catch (err) {
      console.error(err);
    }
  };

  const refresh = () => {
    console.log("Force refreshing history...");
    fetchHistory(page, true);
  };

  const nextPage = () => {
    if (page * 5 < total) {
      fetchHistory(page + 1, true);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      fetchHistory(page - 1, true);
    }
  };

  const goToPage = (pageNum: number) => {
    fetchHistory(pageNum, true);
  };

  return {
    history,
    total,
    page,
    loading,
    error,
    clearHistory,
    refresh,
    nextPage,
    prevPage,
    goToPage,
    hasNextPage: page * 5 < total,
    hasPrevPage: page > 1,
    totalPages: Math.ceil(total / 5)
  };
};
