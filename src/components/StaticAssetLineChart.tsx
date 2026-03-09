"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartPoint = {
  year: number;
  y: number;
  priceUsd: number;
  priceBtc: number;
  priceSats: number;
};

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

function formatSats(amount: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(amount);
}

type TooltipProps = {
  active?: boolean;
  label?: string | number;
  payload?: Array<{ payload?: unknown }>;
};

function AssetTooltip({
  active,
  payload,
  label,
  unit,
}: TooltipProps & { unit: "btc" | "sats" }) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload as ChartPoint | undefined;
  if (!p) return null;

  return (
    <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-sm">
      <div className="font-medium">{label}</div>
      <div className="mt-1 text-muted-foreground">USD: {formatUsd(p.priceUsd)}</div>
      <div className="text-muted-foreground">BTC: {formatBtc(p.priceBtc)}</div>
      {unit === "sats" ? (
        <div className="text-muted-foreground">Sats: {formatSats(p.priceSats)}</div>
      ) : null}
    </div>
  );
}

export default function StaticAssetLineChart({
  data,
  unit,
}: {
  data: ChartPoint[];
  unit: "btc" | "sats";
}) {
  const minPositive = data.reduce<number>((acc, p) => {
    if (!Number.isFinite(p.y) || p.y <= 0) return acc;
    return acc === 0 ? p.y : Math.min(acc, p.y);
  }, 0);

  const safeMin = minPositive > 0 ? minPositive : unit === "btc" ? 1e-8 : 1;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ left: 8, right: 12 }}>
        <XAxis
          dataKey="year"
          tick={{ fontSize: 11 }}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11 }}
          width={70}
          scale="log"
          type="number"
          domain={[safeMin, "dataMax"]}
          allowDataOverflow
          tickFormatter={(v: number) =>
            unit === "btc" ? v.toFixed(4) : Math.round(v).toString()
          }
        />
        <Tooltip
          content={(props) => (
            <AssetTooltip {...(props as unknown as TooltipProps)} unit={unit} />
          )}
        />
        <Line
          type="monotone"
          dataKey="y"
          stroke="#0ea5e9"
          strokeWidth={2}
          dot={{ r: 2 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
