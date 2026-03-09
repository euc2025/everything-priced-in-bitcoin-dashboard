"use client";

import { RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";

import { useBtcSpot } from "@/components/BtcSpotProvider";
import { useThemeMode } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatSatsMxn(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 8,
  }).format(amount);
}

export function BitcoinHeader() {
  const { data, loading, error, refresh } = useBtcSpot();
  const { theme, toggleTheme } = useThemeMode();
  const updatedAt = data ? new Date(data.fetched_at) : null;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => {
      window.clearTimeout(id);
    };
  }, []);

  return (
    <header className="w-full border-b bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <div className="text-sm text-muted-foreground">
            Everything priced in BTC
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Bitcoin Priced Everything
          </h1>
          <div className="text-xs text-muted-foreground">
            {updatedAt
              ? `Última actualización: ${updatedAt.toLocaleString("es-MX")}`
              : "Cargando..."}
            {data?.source ? ` · Fuente: ${data.source}` : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 rounded-md border bg-card px-3 py-2">
            {mounted ? (
              <>
                <Label
                  htmlFor="theme-toggle"
                  className="text-xs text-muted-foreground"
                >
                  {theme === "dark" ? "Modo oscuro" : "Modo claro"}
                </Label>
                <Switch
                  id="theme-toggle"
                  checked={theme === "dark"}
                  onCheckedChange={() => {
                    toggleTheme();
                  }}
                />
              </>
            ) : (
              <div className="h-[18.4px] w-[120px]" />
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => {
              void refresh();
            }}
            disabled={loading}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-3 px-4 pb-6 sm:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-xs text-muted-foreground">BTC / MXN</div>
          <div className="mt-1 text-xl font-semibold tabular-nums">
            {data ? formatCurrency(data.btc_mxn) : "—"}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="text-xs text-muted-foreground">1 satoshi (MXN)</div>
          <div className="mt-1 text-xl font-semibold tabular-nums">
            {data ? formatSatsMxn(data.sat_mxn) : "—"}
          </div>
        </div>
      </div>

      {error ? (
        <div className="mx-auto w-full max-w-6xl px-4 pb-6">
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Error al actualizar: {error}
          </div>
        </div>
      ) : null}
    </header>
  );
}
