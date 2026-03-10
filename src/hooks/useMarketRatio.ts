"use client";

import { useEffect, useMemo, useState } from "react";

export type MarketAssetKey = "gold" | "silver" | "eth" | "nasdaq" | "sp500" | "meta";

export type MarketRatioPoint = {
  datetime: string;
  assetClose: number;
  btcClose: number;
  ratio: number;
};

type ApiResponse = {
  asset: MarketAssetKey;
  interval: string;
  start_date: string;
  asset_symbol: string;
  btc_symbol: string;
  source: "dataset" | "demo" | "twelvedata";
  fetched_at: string;
  points: MarketRatioPoint[];
};

export function useMarketRatio(asset: MarketAssetKey) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const url = useMemo(() => {
    const qs = new URLSearchParams({
      asset,
      interval: "1day",
      start_date: "2009-01-01",
    });
    return `/api/market/ratio?${qs.toString()}`;
  }, [asset]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(body?.error || `HTTP ${res.status}`);
        }

        const json = (await res.json()) as ApiResponse;
        if (!cancelled) setData(json);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Error desconocido";
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, loading, error };
}
