import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-control border border-line bg-glass-strong px-3 text-sm text-fg outline-none focus:border-accent",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
