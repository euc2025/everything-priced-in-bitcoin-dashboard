"use client";

import { MarketAssetCard } from "@/components/MarketAssetCard";

export function FinancialAssetsSection() {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">
          Mercados (relativo a Bitcoin)
        </h2>
        <p className="text-sm text-muted-foreground">
          Cada gráfica muestra el ratio (precio del activo en USD) / (precio de BTC en
          USD), con eje Y en escala logarítmica.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <MarketAssetCard asset="gold" title="Oro priced in BTC" subtitle="XAU/USD ÷ BTC/USD" />
        <MarketAssetCard asset="silver" title="Plata priced in BTC" subtitle="XAG/USD ÷ BTC/USD" />
        <MarketAssetCard asset="eth" title="Ethereum priced in BTC" subtitle="ETH/USD ÷ BTC/USD" />
        <MarketAssetCard asset="nasdaq" title="NASDAQ priced in BTC" subtitle="NDX ÷ BTC/USD" />
        <MarketAssetCard asset="sp500" title="S&P 500 priced in BTC" subtitle="SPX ÷ BTC/USD" />
        <MarketAssetCard asset="meta" title="META priced in BTC" subtitle="META ÷ BTC/USD" />
      </div>
    </section>
  );
}
