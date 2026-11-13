// frontend/src/components/ui/Checkbox.tsx
import { forwardRef, type InputHTMLAttributes } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = "", id, ...props }, ref) => {
    return (
      <div className="flex items-center">
        <label
          htmlFor={id}
          className="inline-flex w-fit cursor-pointer select-none items-center gap-2.5 text-sm font-medium text-fg"
        >
          <input
            ref={ref}
            id={id}
            type="checkbox"
            className={`h-4 w-4 cursor-pointer rounded border-line accent-accent ${className}`}
            {...props}
          />
          <span>{label}</span>
        </label>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";