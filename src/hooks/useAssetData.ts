"use client";

import annualPrices from "../../data/precios_anuales.json";

export type AnnualPoint = {
  year: number;
  price_usd: number;
};

export type AnnualDataset = {
  bitcoin: AnnualPoint[];
  pizza: AnnualPoint[];
  auto: AnnualPoint[];
  casa: AnnualPoint[];
};

export type AssetKey = Exclude<keyof AnnualDataset, "bitcoin">;

export type AnnualComputedPoint = {
  year: number;
  priceUsd: number;
  priceBtc: number;
  priceSats: number;
};

function requireFinite(n: number, message: string) {
  if (!Number.isFinite(n)) throw new Error(message);
  return n;
}

function getBtcUsdForYear(dataset: AnnualDataset, year: number): number {
  const point = dataset.bitcoin.find((p) => p.year === year);
  if (!point) throw new Error(`No hay precio de Bitcoin para el año ${year}`);
  return requireFinite(point.price_usd, `BTC USD inválido para ${year}`);
}

function usdToBtc(dataset: AnnualDataset, year: number, usd: number): number {
  const btcUsd = getBtcUsdForYear(dataset, year);
  return usd / btcUsd;
}

export function useAssetData() {
  const dataset = annualPrices as AnnualDataset;

  function getAvailableYears(asset: AssetKey): number[] {
    return dataset[asset].map((p) => p.year);
  }

  function getLastYear(asset: AssetKey): number {
    const years = getAvailableYears(asset);
    return years[years.length - 1];
  }

  function getFirstYear(asset: AssetKey): number {
    const years = getAvailableYears(asset);
    return years[0];
  }

  function getUsdPrice(asset: AssetKey, year: number): number {
    const point = dataset[asset].find((p) => p.year === year);
    if (!point) throw new Error(`No hay precio USD para ${asset} en ${year}`);
    return requireFinite(point.price_usd, `USD inválido para ${asset} ${year}`);
  }

  function getBtcPrice(asset: AssetKey, year: number): number {
    return usdToBtc(dataset, year, getUsdPrice(asset, year));
  }

  function getComputedSeries(asset: AssetKey): AnnualComputedPoint[] {
    return dataset[asset].map((p) => {
      const priceBtc = usdToBtc(dataset, p.year, p.price_usd);
      return {
        year: p.year,
        priceUsd: p.price_usd,
        priceBtc,
        priceSats: priceBtc * 100_000_000,
      };
    });
  }

  function getRangeLabel(asset: AssetKey): string {
    const from = getFirstYear(asset);
    const to = getLastYear(asset);
    return `${from}-${to}`;
  }

  return {
    dataset,
    getAvailableYears,
    getFirstYear,
    getLastYear,
    getUsdPrice,
    getBtcPrice,
    getComputedSeries,
    getRangeLabel,
  };
}
