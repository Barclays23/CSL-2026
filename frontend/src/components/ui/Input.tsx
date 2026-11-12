import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-control border border-line bg-glass-strong px-3 text-sm text-fg outline-none placeholder:text-faint focus:border-accent",
        className,
      )}
      {...props}
    />
  );
}
