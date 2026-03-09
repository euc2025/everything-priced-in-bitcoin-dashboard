"use client";

import { useAssetData } from "@/hooks/useAssetData";
import { useBtcSpot } from "@/components/BtcSpotProvider";

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

function formatMxn(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function EducationSection() {
  const { data } = useBtcSpot();
  const { getLastYear, getUsdPrice } = useAssetData();

  const pizzaYear = getLastYear("pizza");
  const pizzaUsd = getUsdPrice("pizza", pizzaYear);

  const btcUsd = data?.btc_usd ?? null;
  const btcMxn = data?.btc_mxn ?? null;

  const tenThousandBtcUsd = btcUsd ? 10_000 * btcUsd : null;
  const tenThousandBtcMxn = btcMxn ? 10_000 * btcMxn : null;

  const pizzasToday = tenThousandBtcUsd ? tenThousandBtcUsd / pizzaUsd : null;

  return (
    <section className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>¿Qué es esta herramienta?</CardTitle>
          <CardDescription>
            Un dashboard para ver precios en BTC en lugar de en moneda fiat.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div>
            La idea central es comparar todo contra Bitcoin. Cuando BTC se aprecia
            más rápido que otros activos, el ratio (activo/BTC) tiende a bajar a
            largo plazo.
          </div>
          <div>
            Esto ayuda a pensar en poder adquisitivo y en cómo cambia el valor de
            los bienes cuando la unidad de cuenta es un activo escaso.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>¿Por qué todo baja frente a Bitcoin?</CardTitle>
          <CardDescription>
            Si Bitcoin se aprecia más rápido que otros activos, entonces medir
            esos activos en BTC tiende a mostrar una tendencia bajista.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div>
            Para activos con datos anuales, calculamos:
            <span className="ml-1 font-medium text-foreground">
              precio_en_BTC = precio_USD_del_activo / precio_USD_de_Bitcoin_del_mismo_año
            </span>
            .
          </div>
          <div>
            Nota: los precios del JSON están en USD y corresponden al mercado
            estadounidense.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>La pizza de 10,000 BTC (2010)</CardTitle>
          <CardDescription>
            En 2010 se pagaron 10,000 BTC por 2 pizzas. Hoy lo usamos como ejemplo
            icónico del poder de medir en BTC.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Usando el precio spot actual de Bitcoin:
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-md border bg-muted/30 p-3">
              <div className="text-xs text-muted-foreground">Valor de 10,000 BTC (USD)</div>
              <div className="mt-1 text-base font-semibold tabular-nums">
                {tenThousandBtcUsd ? formatUsd(tenThousandBtcUsd) : "—"}
              </div>
            </div>
            <div className="rounded-md border bg-muted/30 p-3">
              <div className="text-xs text-muted-foreground">Valor de 10,000 BTC (MXN)</div>
              <div className="mt-1 text-base font-semibold tabular-nums">
                {tenThousandBtcMxn ? formatMxn(tenThousandBtcMxn) : "—"}
              </div>
            </div>
          </div>

          <div className="rounded-md border bg-muted/30 p-3">
            <div className="text-xs text-muted-foreground">
              ¿Cuántas pizzas (a precio {pizzaYear}) se podrían comprar hoy?
            </div>
            <div className="mt-1 text-base font-semibold tabular-nums">
              {pizzasToday ? pizzasToday.toLocaleString("es-MX", { maximumFractionDigits: 0 }) : "—"}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              (Se usa precio de pizza {pizzaYear}: {formatUsd(pizzaUsd)})
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
