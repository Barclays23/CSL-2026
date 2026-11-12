import type { ReactNode } from "react";
import { FieldError } from "@/components/forms/FieldError";

export function FormField({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="mb-1.5 block text-sm font-medium text-fg">
        {label}
        {required ? <span className="text-accent"> *</span> : null}
      </span>
      {children}
      {hint && !error ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
      <FieldError message={error} />
    </label>
  );
}
