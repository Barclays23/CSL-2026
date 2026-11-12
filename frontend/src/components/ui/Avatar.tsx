import { getAssetUrl } from "@/utils/getAssetUrl";
import type { Asset } from "@/types/api.types";
import { cn } from "@/lib/cn";

export function Avatar({
  name,
  asset,
  className,
}: {
  name: string;
  asset?: Asset | null;
  className?: string;
}) {
  const url = getAssetUrl(asset);
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  if (url) {
    return <img src={url} alt="" className={cn("h-12 w-12 rounded-full object-cover", className)} />;
  }
  return (
    <span
      className={cn(
        "inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-fg",
        className,
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}
