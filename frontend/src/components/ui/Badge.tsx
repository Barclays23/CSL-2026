import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const tones = {
  neutral: "bg-surface text-fg",
  accent: "bg-accent text-accent-fg",
  gold: "bg-gold text-gold-fg",
  primary: "bg-primary text-primary-fg",
  danger: "bg-danger text-danger-fg",
  info: "bg-info text-info-fg",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof tones }) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", tones[tone], className)}
      {...props}
    />
  );
}
