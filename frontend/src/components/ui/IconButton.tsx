import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function IconButton({ className, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-glass text-fg transition hover:border-accent",
        className,
      )}
      {...props}
    />
  );
}
