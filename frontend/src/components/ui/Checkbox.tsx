import type { InputHTMLAttributes } from "react";

export function Checkbox({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex min-h-11 items-center gap-3 text-sm text-fg">
      <input type="checkbox" className="h-5 w-5 accent-primary" {...props} />
      {label}
    </label>
  );
}
