import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function GlassPanel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-card border border-line bg-glass-strong backdrop-blur-xl", className)} {...props} />;
}
