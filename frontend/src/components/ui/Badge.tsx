import type { ReactNode } from "react";

type Tone =
  | "brand"
  | "accent"
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info";

const TONES: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-700 ring-brand-600/15",
  accent: "bg-accent-50 text-accent-700 ring-accent-600/20",
  neutral: "bg-ink-100 text-ink-600 ring-ink-500/15",
  success: "bg-brand-50 text-brand-700 ring-brand-600/15",
  warning: "bg-accent-50 text-accent-700 ring-accent-600/20",
  danger: "bg-red-50 text-red-700 ring-red-600/15",
  info: "bg-sky-50 text-sky-700 ring-sky-600/15",
};

export function Badge({
  children,
  tone = "neutral",
  className = "",
  icon,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${TONES[tone]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}