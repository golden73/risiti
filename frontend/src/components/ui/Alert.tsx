import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

type Variant = "success" | "error" | "warning" | "info";

const CONFIG: Record<
  Variant,
  { icon: typeof Info; wrap: string; iconColor: string }
> = {
  success: {
    icon: CheckCircle2,
    wrap: "border-brand-200 bg-brand-50 text-brand-800",
    iconColor: "text-brand-600",
  },
  error: {
    icon: XCircle,
    wrap: "border-red-200 bg-red-50 text-red-800",
    iconColor: "text-red-600",
  },
  warning: {
    icon: AlertTriangle,
    wrap: "border-accent-200 bg-accent-50 text-accent-800",
    iconColor: "text-accent-600",
  },
  info: {
    icon: Info,
    wrap: "border-sky-200 bg-sky-50 text-sky-800",
    iconColor: "text-sky-600",
  },
};

export function Alert({
  variant = "info",
  title,
  children,
  action,
  className = "",
}: {
  variant?: Variant;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const cfg = CONFIG[variant];
  const Icon = cfg.icon;
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-xl border p-4 ${cfg.wrap} ${className}`}
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${cfg.iconColor}`} />
      <div className="min-w-0 flex-1">
        {title && <p className="text-sm font-semibold">{title}</p>}
        {children && <div className="text-sm opacity-90">{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}