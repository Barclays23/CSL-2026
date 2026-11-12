import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const variants = {
  primary: "bg-primary text-primary-fg hover:brightness-110",
  accent: "bg-accent text-accent-fg hover:brightness-110",
  gold: "bg-gold text-gold-fg hover:brightness-110",
  danger: "bg-danger text-danger-fg hover:brightness-110",
  surface: "border border-line bg-glass-strong text-fg hover:border-accent",
  ghost: "bg-transparent text-fg hover:bg-surface",
};

const sizes = {
  sm: "h-10 px-3 text-sm",
  md: "h-11 px-4 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants; size?: keyof typeof sizes }) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
