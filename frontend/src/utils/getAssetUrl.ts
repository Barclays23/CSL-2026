import type { Asset } from "@/types/api.types";

export function getAssetUrl(asset: Asset | null | undefined) {
  return asset?.url || "";
}
