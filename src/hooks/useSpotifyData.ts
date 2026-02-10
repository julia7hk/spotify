"use client";

import { useState, useEffect } from "react";
import type { DashboardData } from "@/types/spotify";
import { fetchDashboardData, getAuthUrl } from "@/lib/api";

interface UseSpotifyDataReturn {
  data: DashboardData | null;
  loading: boolean;
  error: Error | null;
  login: () => Promise<void>;
  logout: () => void;
  refetch: () => Promise<void>;
}

export function useSpotifyData(): UseSpotifyDataReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await fetchDashboardData();
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch data"));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    error,
    login,
    logout,
    refetch: fetchData,
  };
}
