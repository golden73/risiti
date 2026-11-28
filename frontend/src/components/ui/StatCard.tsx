import type { ReactNode } from "react";

type Tone = "brand" | "accent" | "neutral" | "info" | "danger";

const TONE_STYLES: Record<Tone, { ring: string; icon: string }> = {
  brand: { ring: "bg-brand-50 ring-brand-600/10", icon: "text-brand-600" },
  accent: { ring: "bg-accent-50 ring-accent-600/10", icon: "text-accent-600" },
  neutral: { ring: "bg-ink-100 ring-ink-500/10", icon: "text-ink-600" },
  info: { ring: "bg-sky-50 ring-sky-600/10", icon: "text-sky-600" },
  danger: { ring: "bg-red-50 ring-red-600/10", icon: "text-red-600" },
};

export function StatCard({
  label,
  value,
  icon,
  tone = "brand",
  hint,
  className = "",
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  tone?: Tone;
  hint?: ReactNode;
  className?: string;
}) {
  const t = TONE_STYLES[tone];
  return (
    <div className={`card-surface p-5 ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-500">{label}</p>
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${t.ring}`}
        >
          <span className={t.icon}>{icon}</span>
        </span>
      </div>
      <div className="mt-3 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
        {value}
      </div>
      {hint && <div className="mt-1 text-sm text-ink-500">{hint}</div>}
    </div>
  );
}