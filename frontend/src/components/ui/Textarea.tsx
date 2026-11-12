import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-control border border-line bg-glass-strong px-3 py-2 text-sm text-fg outline-none placeholder:text-faint focus:border-accent",
        className,
      )}
      {...props}
    />
  );
}
