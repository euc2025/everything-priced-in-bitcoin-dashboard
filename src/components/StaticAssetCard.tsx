"use client";

import dynamic from "next/dynamic";

import type { AssetKey } from "@/hooks/useAssetData";
import { useAssetData } from "@/hooks/useAssetData";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatBtc(amount: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 8,
  }).format(amount);
}

function formatPct(pct: number) {
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

function TrendBadge({ pct }: { pct: number }) {
  const down = pct < 0;
  return (
    <Badge variant={down ? "destructive" : "default"}>
      {down ? "↓" : "↑"} {formatPct(pct)}
    </Badge>
  );
}

const StaticAssetLineChart = dynamic(
  () => import("@/components/StaticAssetLineChart"),
  {
    ssr: false,
    loading: () => <div className="h-full w-full rounded-md bg-muted/30" />,
  },
);

export function StaticAssetCard({
  asset,
  title,
  icon,
}: {
  asset: AssetKey;
  title: string;
  icon: string;
}) {
  const { getComputedSeries, getFirstYear, getLastYear, getRangeLabel } =
    useAssetData();

  const series = getComputedSeries(asset);
  const firstYear = getFirstYear(asset);
  const lastYear = getLastYear(asset);

  const first = series.find((p) => p.year === firstYear);
  const last = series.find((p) => p.year === lastYear);

  const pctChangeBtc =
    first && last ? ((last.priceBtc - first.priceBtc) / first.priceBtc) * 100 : 0;

  const currentUsd = last?.priceUsd ?? 0;
  const currentBtc = last?.priceBtc ?? 0;

  const chartData = series.map((p) => ({
    ...p,
    y: p.priceBtc,
  }));

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center justify-between gap-3">
          <span>
            <span className="mr-2">{icon}</span>
            {title}
          </span>
          <TrendBadge pct={pctChangeBtc} />
        </CardTitle>
        <CardDescription>
          Datos para mercado USA · {getRangeLabel(asset)}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border bg-muted/30 p-3">
            <div className="text-xs text-muted-foreground">
              Precio actual (USD, {lastYear})
            </div>
            <div className="mt-1 text-base font-semibold tabular-nums">
              {formatUsd(currentUsd)}
            </div>
          </div>

          <div className="rounded-md border bg-muted/30 p-3">
            <div className="text-xs text-muted-foreground">
              Precio actual (BTC, {lastYear})
            </div>
            <div className="mt-1 text-base font-semibold tabular-nums">
              {`${formatBtc(currentBtc)} BTC`}
            </div>
          </div>
        </div>

        <div className="h-44 w-full">
          <StaticAssetLineChart data={chartData} unit="btc" />
        </div>

        <div className="text-xs text-muted-foreground">
          Datos anuales: cada punto representa el precio promedio del año. El
          precio en BTC se calcula como: (precio del activo en USD) / (precio de
          Bitcoin en USD del mismo año).
        </div>
      </CardContent>
    </Card>
  );
}
