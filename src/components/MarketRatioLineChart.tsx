"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MarketRatioPoint } from "@/hooks/useMarketRatio";

type ChartPoint = {
  datetime: string;
  ratio: number;
};

function formatRatio(v: number) {
  if (v >= 1) return v.toFixed(2);
  if (v >= 0.1) return v.toFixed(3);
  if (v >= 0.01) return v.toFixed(4);
  return v.toExponential(2);
}

type TooltipProps = {
  active?: boolean;
  label?: string | number;
  payload?: Array<{ payload?: unknown }>;
};

function RatioTooltip({
  active,
  payload,
  label,
}: TooltipProps & { unitLabel: string }) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload as ChartPoint | undefined;
  if (!p) return null;

  return (
    <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-sm">
      <div className="font-medium">{label}</div>
      <div className="mt-1 text-muted-foreground">Ratio: {formatRatio(p.ratio)}</div>
    </div>
  );
}

export function MarketRatioLineChart({
  points,
}: {
  points: MarketRatioPoint[];
}) {
  const data: ChartPoint[] = points
    .filter((p) => Number.isFinite(p.ratio) && p.ratio > 0)
    .map((p) => ({ datetime: p.datetime, ratio: p.ratio }));

  const minPositive = data.reduce<number>((acc, p) => {
    if (!Number.isFinite(p.ratio) || p.ratio <= 0) return acc;
    return acc === 0 ? p.ratio : Math.min(acc, p.ratio);
  }, 0);

  const safeMin = minPositive > 0 ? minPositive : 1e-12;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ left: 8, right: 12, top: 4, bottom: 0 }}>
        <XAxis
          dataKey="datetime"
          tick={{ fontSize: 11 }}
          minTickGap={24}
          tickFormatter={(v: string) => v.slice(0, 4)}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          width={70}
          scale="log"
          type="number"
          domain={[safeMin, "dataMax"]}
          allowDataOverflow
          tickFormatter={(v: number) => formatRatio(v)}
        />
        <Tooltip
          content={(props) => (
            <RatioTooltip {...(props as unknown as TooltipProps)} unitLabel="" />
          )}
        />
        <Line
          type="monotone"
          dataKey="ratio"
          stroke="#0ea5e9"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
