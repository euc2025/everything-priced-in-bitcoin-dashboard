"use client";

import { useEffect, useMemo, useRef } from "react";

import { useThemeMode } from "@/components/ThemeProvider";

export function TradingViewMiniSymbolOverview({
  symbol,
  height = 220,
}: {
  symbol: string;
  height?: number;
}) {
  const { theme } = useThemeMode();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const options = useMemo(() => {
    return {
      symbol,
      width: "100%",
      height,
      locale: "es",
      dateRange: "ALL",
      colorTheme: theme,
      isTransparent: true,
      autosize: true,
      largeChartUrl: "",
    };
  }, [height, symbol, theme]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.async = true;
    script.type = "text/javascript";
    script.innerHTML = JSON.stringify(options);

    el.appendChild(script);
  }, [options]);

  return (
    <div className="tradingview-widget-container" ref={containerRef} />
  );
}
