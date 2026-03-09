import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type BtcApiResponse = {
  btc_usd: number;
  btc_mxn: number;
  sat_usd: number;
  sat_mxn: number;
  source: "coingecko" | "bitso";
  fetched_at: string;
};

async function fetchCoinGecko(): Promise<{ usd: number; mxn: number }> {
  const url =
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,mxn&include_last_updated_at=true";

  const res = await fetch(url, {
    headers: {
      accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`CoinGecko error: ${res.status}`);
  }

  const json = (await res.json()) as {
    bitcoin?: { usd?: number; mxn?: number };
  };

  const usd = json.bitcoin?.usd;
  const mxn = json.bitcoin?.mxn;

  if (typeof usd !== "number" || typeof mxn !== "number") {
    throw new Error("CoinGecko payload inválido");
  }

  return { usd, mxn };
}

async function fetchBitsoTicker(book: string): Promise<number> {
  const url = `https://api.bitso.com/v3/ticker/?book=${encodeURIComponent(book)}`;
  const res = await fetch(url, {
    headers: {
      accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Bitso error: ${res.status}`);
  }

  const json = (await res.json()) as {
    success?: boolean;
    payload?: { last?: string };
  };

  const last = json.payload?.last;
  const parsed = last ? Number.parseFloat(last) : Number.NaN;

  if (!Number.isFinite(parsed)) {
    throw new Error("Bitso payload inválido");
  }

  return parsed;
}

async function fetchBitso(): Promise<{ usd: number; mxn: number }> {
  const [usd, mxn] = await Promise.all([
    fetchBitsoTicker("btc_usd"),
    fetchBitsoTicker("btc_mxn"),
  ]);

  return { usd, mxn };
}

export async function GET() {
  const fetched_at = new Date().toISOString();

  try {
    const { usd, mxn } = await fetchCoinGecko();

    const response: BtcApiResponse = {
      btc_usd: usd,
      btc_mxn: mxn,
      sat_usd: usd / 100_000_000,
      sat_mxn: mxn / 100_000_000,
      source: "coingecko",
      fetched_at,
    };

    return NextResponse.json(response);
  } catch {
    try {
      const { usd, mxn } = await fetchBitso();

      const response: BtcApiResponse = {
        btc_usd: usd,
        btc_mxn: mxn,
        sat_usd: usd / 100_000_000,
        sat_mxn: mxn / 100_000_000,
        source: "bitso",
        fetched_at,
      };

      return NextResponse.json(response);
    } catch {
      return NextResponse.json(
        {
          error: "No se pudo obtener el precio de Bitcoin (CoinGecko/Bitso)",
        },
        { status: 502 },
      );
    }
  }
}
