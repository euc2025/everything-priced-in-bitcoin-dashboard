"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type BtcSpot = {
  btc_usd: number;
  btc_mxn: number;
  sat_usd: number;
  sat_mxn: number;
  source: "coingecko" | "bitso";
  fetched_at: string;
};

type BtcSpotContextValue = {
  data: BtcSpot | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const BtcSpotContext = createContext<BtcSpotContextValue | null>(null);

export function BtcSpotProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] = useState<BtcSpot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const lastGoodRef = useRef<BtcSpot | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/btc", { cache: "no-store" });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(body?.error || `HTTP ${res.status}`);
      }

      const json = (await res.json()) as BtcSpot;
      lastGoodRef.current = json;
      setData(json);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Error desconocido";
      setError(message);
      if (lastGoodRef.current) {
        setData(lastGoodRef.current);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();

    const id = window.setInterval(() => {
      void refresh();
    }, 60_000);

    return () => {
      window.clearInterval(id);
    };
  }, [refresh]);

  const value = useMemo<BtcSpotContextValue>(
    () => ({ data, loading, error, refresh }),
    [data, error, loading, refresh],
  );

  return (
    <BtcSpotContext.Provider value={value}>{children}</BtcSpotContext.Provider>
  );
}

export function useBtcSpot() {
  const ctx = useContext(BtcSpotContext);
  if (!ctx) {
    throw new Error("useBtcSpot debe usarse dentro de BtcSpotProvider");
  }
  return ctx;
}
