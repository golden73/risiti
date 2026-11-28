import { Loader2 } from "lucide-react";

export function Spinner({
  size = 24,
  className = "",
  label,
}: {
  size?: number;
  className?: string;
  label?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2
        className="animate-spin text-brand-600"
        style={{ width: size, height: size }}
      />
      {label && <p className="text-sm text-ink-500">{label}</p>}
    </div>
  );
}

export function FullPageSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center">
      <Spinner size={32} label={label} />
    </div>
  );
}