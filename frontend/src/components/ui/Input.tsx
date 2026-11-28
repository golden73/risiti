import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className = "", id, ...rest }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-ink-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`input-base ${leftIcon ? "pl-10" : ""} ${
              rightIcon ? "pr-10" : ""
            } ${error ? "border-red-400 focus:border-red-500 focus:ring-red-500/30" : ""} ${className}`}
            aria-invalid={error ? true : undefined}
            {...rest}
          />
          {rightIcon && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400">
              {rightIcon}
            </span>
          )}
        </div>
        {error ? (
          <p className="mt-1.5 text-sm font-medium text-red-600">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-sm text-ink-500">{hint}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";