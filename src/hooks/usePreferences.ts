"use client";

import { useCallback, useMemo } from "react";

import type { AssetKey } from "@/hooks/useAssetData";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";

export type Unit = "btc" | "sats";

type HiddenAssets = Record<AssetKey, boolean>;

const DEFAULT_HIDDEN: HiddenAssets = {
  pizza: false,
  auto: false,
  casa: false,
};

export function usePreferences() {
  const [unit, setUnit] = useLocalStorageState<Unit>(
    "bpe:unit",
    "btc",
  );
  const [hiddenAssets, setHiddenAssets] = useLocalStorageState<HiddenAssets>(
    "bpe:hiddenAssets",
    DEFAULT_HIDDEN,
  );

  const toggleUnit = useCallback(() => {
    setUnit((prev) => (prev === "btc" ? "sats" : "btc"));
  }, [setUnit]);

  const setHidden = useCallback(
    (asset: AssetKey, hidden: boolean) => {
      setHiddenAssets((prev) => ({ ...prev, [asset]: hidden }));
    },
    [setHiddenAssets],
  );

  const visibleAssets = useMemo(() => {
    const assets: AssetKey[] = ["pizza", "auto", "casa"];
    return assets.filter((a) => !hiddenAssets[a]);
  }, [hiddenAssets]);

  return {
    unit,
    toggleUnit,
    hiddenAssets,
    setHidden,
    visibleAssets,
  };
}
