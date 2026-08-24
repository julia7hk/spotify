"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DashboardData, TimeRange } from "@/types/spotify";
import { fetchDashboardData, getAuthUrl } from "@/lib/api";

interface UseSpotifyDataReturn {
  data: DashboardData | null;
  /** True only on the very first load — drives the full-page spinner. */
  loading: boolean;
  /** True while re-fetching for a new range — keeps stale data on screen. */
  refreshing: boolean;
  error: Error | null;
  range: TimeRange;
  setRange: (range: TimeRange) => void;
  login: () => Promise<void>;
  logout: () => void;
  refetch: () => Promise<void>;
}

export function useSpotifyData(): UseSpotifyDataReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [range, setRange] = useState<TimeRange>("medium_term");

  // Guards against a slow earlier range response landing after a newer one.
  const requestId = useRef(0);

  const fetchData = useCallback(
    async (nextRange: TimeRange, isInitial: boolean) => {
      const id = ++requestId.current;
      isInitial ? setLoading(true) : setRefreshing(true);
      setError(null);

      try {
        const dashboardData = await fetchDashboardData(nextRange);
        if (id !== requestId.current) return; // a newer request superseded this one
        setData(dashboardData);
      } catch (err) {
        if (id !== requestId.current) return;
        setError(err instanceof Error ? err : new Error("Failed to fetch data"));
        if (isInitial) setData(null);
      } finally {
        if (id === requestId.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    fetchData("medium_term", true);
  }, [fetchData]);

  const changeRange = useCallback(
    (next: TimeRange) => {
      setRange((current) => {
        if (current === next) return current;
        fetchData(next, false);
        return next;
      });
    },
    [fetchData]
  );

  const login = async () => {
    const url = await getAuthUrl();
    window.location.href = url;
  };

  const logout = () => {
    window.location.href = "/logout";
  };

  return {
    data,
    loading,
    refreshing,
    error,
    range,
    setRange: changeRange,
    login,
    logout,
    refetch: () => fetchData(range, false),
  };
}
