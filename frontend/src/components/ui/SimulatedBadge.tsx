import { FlaskConical } from "lucide-react";

/** Clearly labels any simulated (non-real) integration per project rules. */
export function SimulatedBadge({
  label = "Simulated",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-accent-300/60 bg-accent-50 px-2.5 py-1 text-xs font-semibold text-accent-700 ${className}`}
      title="This integration is simulated for the hackathon demo."
    >
      <FlaskConical className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}