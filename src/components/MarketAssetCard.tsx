"use client";

import { MarketRatioLineChart } from "@/components/MarketRatioLineChart";
import type { MarketAssetKey } from "@/hooks/useMarketRatio";
import { useMarketRatio } from "@/hooks/useMarketRatio";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function formatPct(pct: number) {
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

function formatProvider(source: string) {
  if (source === "dataset") return "Dataset XLSX";
  if (source === "twelvedata") return "Twelve Data";
  if (source === "demo") return "Twelve Data Demo";
  return source;
}

export function MarketAssetCard({
  asset,
  title,
  subtitle,
}: {
  asset: MarketAssetKey;
  title: string;
  subtitle: string;
}) {
  const { data, loading, error } = useMarketRatio(asset);

  const computedSubtitle =
    data?.asset_symbol && data?.btc_symbol
      ? data.source === "dataset"
        ? data.asset_symbol
        : `${data.asset_symbol} ÷ ${data.btc_symbol}`
      : subtitle;

  const points = data?.points ?? [];
  const first = points[0];
  const last = points[points.length - 1];
  const pct =
    first && last ? ((last.ratio - first.ratio) / first.ratio) * 100 : 0;

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center justify-between gap-2">
          <span>{title}</span>
          <span className="text-xs font-normal text-muted-foreground">
            {data?.source ? `Fuente: ${formatProvider(data.source)}` : null}
          </span>
        </CardTitle>
        <CardDescription>{computedSubtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border bg-muted/30 p-3">
            <div className="text-xs text-muted-foreground">Último ratio</div>
            <div className="mt-1 text-base font-semibold tabular-nums">
              {last ? last.ratio.toPrecision(4) : "—"}
            </div>
          </div>
          <div className="rounded-md border bg-muted/30 p-3">
            <div className="text-xs text-muted-foreground">Cambio (desde inicio)</div>
            <div className="mt-1 text-base font-semibold tabular-nums">
              {points.length >= 2 ? formatPct(pct) : "—"}
            </div>
          </div>
        </div>

        <div className="h-44 w-full">
          {loading ? (
            <div className="h-full w-full rounded-md bg-muted/30" />
          ) : error ? (
            <div className="h-full w-full rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          ) : (
            <MarketRatioLineChart points={points} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
