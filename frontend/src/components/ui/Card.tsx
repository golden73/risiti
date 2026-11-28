import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export function Card({
  children,
  hover = false,
  className = "",
  ...rest
}: CardProps) {
  return (
    <div
      className={`card-surface ${hover ? "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift" : ""} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className = "",
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-4 border-b border-ink-100 px-5 py-4 sm:px-6 ${className}`}
    >
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-ink-900">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-5 py-5 sm:px-6 ${className}`}>{children}</div>
  );
}