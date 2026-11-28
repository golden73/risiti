import { Link } from "react-router-dom";
import { ReceiptText } from "lucide-react";

export function Logo({
  size = "md",
  to = "/",
  showWordmark = true,
}: {
  size?: "sm" | "md";
  to?: string;
  showWordmark?: boolean;
}) {
  const iconSize = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const textSize = size === "sm" ? "text-base" : "text-lg";
  return (
    <Link to={to} className="group inline-flex items-center gap-2.5">
      <span
        className={`relative flex ${iconSize} items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft transition group-hover:shadow-glow`}
      >
        <ReceiptText className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-accent-400 ring-2 ring-white" />
      </span>
      {showWordmark && (
        <span className={`${textSize} font-display font-extrabold tracking-tight text-ink-900`}>
          Risiti<span className="text-brand-600">Loop</span>
        </span>
      )}
    </Link>
  );
}