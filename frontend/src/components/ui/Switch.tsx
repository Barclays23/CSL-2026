import type { InputHTMLAttributes } from "react";

export function Switch({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex min-h-11 items-center justify-between gap-3 rounded-control border border-line bg-glass px-3 text-sm text-fg">
      {label}
      <input type="checkbox" role="switch" className="h-5 w-5 accent-primary" {...props} />
    </label>
  );
}
