import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function GlassCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-card border border-line bg-glass shadow-glass backdrop-blur-xl", className)}
      {...props}
    />
  );
}
