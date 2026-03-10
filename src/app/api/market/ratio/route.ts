import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type AssetKey = "gold" | "silver" | "eth" | "nasdaq" | "sp500" | "meta";

type RatioPoint = {
  datetime: string;
  assetClose: number;
  btcClose: number;
  ratio: number;
};

type ApiResponse = {
  asset: AssetKey;
  interval: string;
  start_date: string;
  asset_symbol: string;
  btc_symbol: string;
  source: "demo" | "twelvedata";
  fetched_at: string;
  points: RatioPoint[];
};

type TwelveDataTimeSeriesResponse = {
  status?: "error";
  message?: string;
  code?: number;
  meta?: unknown;
  values?: Array<{
    datetime: string;
    close: string;
  }>;
};

const ASSET_SYMBOLS: Record<AssetKey, string[]> = {
  gold: ["XAU/USD"],
  silver: ["XAG/USD"],
  eth: ["ETH/USD"],
  nasdaq: ["NDX", "QQQ"],
  sp500: ["SPX", "SPY"],
  meta: ["META"],
};

const BTC_SYMBOL = "BTC/USD";

const lastGood = new Map<string, ApiResponse>();

type TwelveSeries = {
  symbol: string;
  values: Array<{ datetime: string; close: number }>;
};

const seriesCache = new Map<
  string,
  { fetchedAt: number; series: TwelveSeries }
>();

const seriesInFlight = new Map<string, Promise<TwelveSeries>>();

const SERIES_TTL_MS = 55_000;

const DEMO_PARAMS: Record<
  AssetKey,
  { startRatio: number; monthlyDrift: number; monthlyVol: number }
> = {
  gold: { startRatio: 0.05, monthlyDrift: 0.990, monthlyVol: 0.07 },
  silver: { startRatio: 0.0006, monthlyDrift: 0.989, monthlyVol: 0.12 },
  eth: { startRatio: 0.12, monthlyDrift: 0.993, monthlyVol: 0.28 },
  nasdaq: { startRatio: 0.015, monthlyDrift: 0.991, monthlyVol: 0.10 },
  sp500: { startRatio: 0.012, monthlyDrift: 0.991, monthlyVol: 0.09 },
  meta: { startRatio: 0.012, monthlyDrift: 0.989, monthlyVol: 0.22 },
};

const DEMO_TARGET_LATEST_BTC_USD = 67_235;

const DEMO_TARGET_LATEST_ASSET_USD: Record<AssetKey, number> = {
  gold: 2150,
  silver: 24.5,
  eth: 3500,
  nasdaq: 430,
  sp500: 510,
  meta: 500,
};

const DEMO_TARGET_LATEST_RATIO: Record<AssetKey, number> = {
  gold: DEMO_TARGET_LATEST_ASSET_USD.gold / DEMO_TARGET_LATEST_BTC_USD,
  silver: DEMO_TARGET_LATEST_ASSET_USD.silver / DEMO_TARGET_LATEST_BTC_USD,
  eth: DEMO_TARGET_LATEST_ASSET_USD.eth / DEMO_TARGET_LATEST_BTC_USD,
  nasdaq: DEMO_TARGET_LATEST_ASSET_USD.nasdaq / DEMO_TARGET_LATEST_BTC_USD,
  sp500: DEMO_TARGET_LATEST_ASSET_USD.sp500 / DEMO_TARGET_LATEST_BTC_USD,
  meta: DEMO_TARGET_LATEST_ASSET_USD.meta / DEMO_TARGET_LATEST_BTC_USD,
};

function requireFinite(n: number, label: string) {
  if (!Number.isFinite(n)) {
    throw new Error(`${label} inválido`);
  }
  return n;
}

function parseTwelveDataValues(
  values: TwelveDataTimeSeriesResponse["values"],
  label: string,
) {
  if (!Array.isArray(values)) {
    throw new Error(`Respuesta Twelve Data inválida (${label})`);
  }

  return values
    .map((v) => {
      const close = Number.parseFloat(v.close);
      return {
        datetime: v.datetime,
        close: requireFinite(close, `${label}.close`),
      };
    })
    .filter((v) => v.close > 0);
}

async function fetchTimeSeries(params: {
  symbol: string;
  interval: string;
  start_date: string;
  outputsize: string;
  apikey: string;
}) {
  const url = new URL("https://api.twelvedata.com/time_series");
  url.searchParams.set("symbol", params.symbol);
  url.searchParams.set("interval", params.interval);
  url.searchParams.set("start_date", params.start_date);
  url.searchParams.set("outputsize", params.outputsize);
  url.searchParams.set("timezone", "UTC");
  url.searchParams.set("format", "JSON");
  url.searchParams.set("apikey", params.apikey);

  const res = await fetch(url.toString(), {
    headers: { accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Twelve Data HTTP ${res.status}`);
  }

  const json = (await res.json()) as TwelveDataTimeSeriesResponse;
  if (json.status === "error") {
    throw new Error(json.message || "Twelve Data error");
  }

  return json;
}

async function fetchParsedSeries(params: {
  symbol: string;
  interval: string;
  start_date: string;
  outputsize: string;
  apikey: string;
}): Promise<TwelveSeries> {
  const cacheKey = `${params.symbol}:${params.interval}:${params.start_date}:${params.outputsize}`;
  const cached = seriesCache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.fetchedAt < SERIES_TTL_MS) {
    return cached.series;
  }

  const inflight = seriesInFlight.get(cacheKey);
  if (inflight) return inflight;

  const p = (async () => {
    const json = await fetchTimeSeries(params);
    const values = parseTwelveDataValues(json.values, params.symbol);
    const series: TwelveSeries = { symbol: params.symbol, values };
    seriesCache.set(cacheKey, { fetchedAt: now, series });
    return series;
  })();

  seriesInFlight.set(cacheKey, p);
  try {
    return await p;
  } finally {
    seriesInFlight.delete(cacheKey);
  }
}

async function fetchTimeSeriesWithFallback(params: {
  symbols: string[];
  interval: string;
  start_date: string;
  outputsize: string;
  apikey: string;
}) {
  let lastErr: unknown = null;
  for (const symbol of params.symbols) {
    try {
      const series = await fetchParsedSeries({
        symbol,
        interval: params.interval,
        start_date: params.start_date,
        outputsize: params.outputsize,
        apikey: params.apikey,
      });
      return { symbol, series };
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("No se pudo obtener series");
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateDemoSeries(asset: AssetKey, start_date: string): RatioPoint[] {
  const start = new Date(`${start_date}T00:00:00.000Z`);
  const end = new Date();
  const seed =
    asset.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) +
    start.getUTCFullYear();
  const rand = mulberry32(seed);

  const points: RatioPoint[] = [];

  let t = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  const p = DEMO_PARAMS[asset];
  let ratio = p.startRatio * (0.85 + rand() * 0.3);

  let btcClose = 0.5 * (0.8 + rand() * 0.4);

  while (t <= end) {
    const btcGrowth = 1.04 + rand() * 0.06;
    btcClose = Math.max(0.0001, btcClose * btcGrowth);

    const shock = 1 + (rand() - 0.5) * p.monthlyVol;
    ratio = Math.max(1e-12, ratio * p.monthlyDrift * shock);

    const assetClose = ratio * btcClose;

    points.push({
      datetime: t.toISOString().slice(0, 10),
      assetClose,
      btcClose,
      ratio,
    });

    t = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 1));
  }

  const last = points.at(-1);
  if (last && last.ratio > 0 && last.btcClose > 0) {
    const btcScale = DEMO_TARGET_LATEST_BTC_USD / last.btcClose;
    if (Number.isFinite(btcScale) && btcScale > 0) {
      for (const pt of points) {
        pt.btcClose = Math.max(0.0001, pt.btcClose * btcScale);
        pt.assetClose = pt.ratio * pt.btcClose;
      }
    }

    const targetLatestRatio = DEMO_TARGET_LATEST_RATIO[asset];
    const scaleRatio = targetLatestRatio / last.ratio;
    if (Number.isFinite(scaleRatio) && scaleRatio > 0) {
      for (const pt of points) {
        pt.ratio = Math.max(1e-12, pt.ratio * scaleRatio);
        pt.assetClose = pt.ratio * pt.btcClose;
      }
    }
  }

  return points;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const asset = (searchParams.get("asset") || "") as AssetKey;
  const interval = searchParams.get("interval") || "1day";
  const start_date = searchParams.get("start_date") || "2009-01-01";
  const outputsize = searchParams.get("outputsize") || "5000";

  const fetched_at = new Date().toISOString();

  if (!asset || !(asset in ASSET_SYMBOLS)) {
    return NextResponse.json(
      { error: "Parámetro 'asset' inválido" },
      { status: 400 },
    );
  }

  const cacheKey = `${asset}:${interval}:${start_date}`;

  const forceDemo = process.env.BPE_FORCE_DEMO === "1";
  const useTwelveData = process.env.BPE_USE_TWELVEDATA === "1";
  const apikey = forceDemo
    ? undefined
    : useTwelveData
      ? process.env.TWELVEDATA_API_KEY
      : undefined;
  if (!apikey) {
    const demoSymbol =
      asset === "nasdaq"
        ? "QQQ"
        : asset === "sp500"
          ? "SPY"
          : ASSET_SYMBOLS[asset]?.[0] || asset;
    const response: ApiResponse = {
      asset,
      interval,
      start_date,
      asset_symbol: demoSymbol,
      btc_symbol: BTC_SYMBOL,
      source: "demo",
      fetched_at,
      points: generateDemoSeries(asset, start_date),
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }

  try {
    const assetSymbols = ASSET_SYMBOLS[asset];
    const [{ symbol: asset_symbol, series: assetSeries }, btcSeries] =
      await Promise.all([
        fetchTimeSeriesWithFallback({
          symbols: assetSymbols,
          interval,
          start_date,
          outputsize,
          apikey,
        }),
        fetchParsedSeries({
          symbol: BTC_SYMBOL,
          interval,
          start_date,
          outputsize,
          apikey,
        }),
      ]);

    const assetValues = assetSeries.values;
    const btcValues = btcSeries.values;

    const btcByDatetime = new Map(btcValues.map((v) => [v.datetime, v.close]));

    const points = assetValues
      .map((v) => {
        const btcClose = btcByDatetime.get(v.datetime);
        if (!btcClose || btcClose <= 0) return null;
        const ratio = v.close / btcClose;
        if (!Number.isFinite(ratio) || ratio <= 0) return null;
        return {
          datetime: v.datetime,
          assetClose: v.close,
          btcClose,
          ratio,
        } satisfies RatioPoint;
      })
      .filter((p): p is RatioPoint => Boolean(p))
      .reverse();

    const response: ApiResponse = {
      asset,
      interval,
      start_date,
      asset_symbol,
      btc_symbol: BTC_SYMBOL,
      source: "twelvedata",
      fetched_at,
      points,
    };

    lastGood.set(cacheKey, response);

    return NextResponse.json(response);
  } catch (e) {
    const cached = lastGood.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, fetched_at });
    }

    const message = e instanceof Error ? e.message : "Error desconocido";

    const lower = message.toLowerCase();
    if (lower.includes("api credits") || lower.includes("limit")) {
      return NextResponse.json(
        {
          error:
            "Twelve Data: límite de créditos por minuto alcanzado. Espera ~60s y recarga. Si quieres histórico largo para 6 activos, considera un plan de pago o reduce el rango (start_date) / outputsize.",
        },
        { status: 429 },
      );
    }

    return NextResponse.json(
      { error: `No se pudo obtener series de mercado: ${message}` },
      { status: 502 },
    );
  }
}
