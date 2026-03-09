"use client";

import { StaticAssetCard } from "@/components/StaticAssetCard";

import type { AssetKey } from "@/hooks/useAssetData";

const ASSETS: Array<{
  key: AssetKey;
  title: string;
  icon: string;
}> = [
  { key: "pizza", title: "Pizza grande priced in BTC", icon: "🍕" },
  { key: "auto", title: "Auto nuevo (Jetta) priced in BTC", icon: "🚗" },
  { key: "casa", title: "Casa priced in BTC", icon: "🏠" },
];

export function StaticAssetsSection() {
  return (
    <section className="space-y-6">
      <div className="rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Activos (datos anuales)
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Precios en USD (mercado USA) convertidos a BTC usando el precio
              anual de Bitcoin del JSON.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {ASSETS.map((a) => {
          return (
            <StaticAssetCard
              key={a.key}
              asset={a.key}
              title={a.title}
              icon={a.icon}
            />
          );
        })}
      </div>
    </section>
  );
}
