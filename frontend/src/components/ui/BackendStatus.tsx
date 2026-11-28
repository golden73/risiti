import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Status = "checking" | "online" | "offline";

/** Lightweight live backend health indicator backed by GET /health. */
export function BackendStatus() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        await api.health();
        if (!cancelled) setStatus("online");
      } catch {
        if (!cancelled) setStatus("offline");
      }
    };
    void check();
    const id = window.setInterval(check, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const config: Record<Status, { label: string; dot: string; text: string }> = {
    checking: { label: "Checking backend…", dot: "bg-ink-300", text: "text-ink-500" },
    online: { label: "Backend online", dot: "bg-brand-500", text: "text-brand-700" },
    offline: { label: "Backend offline", dot: "bg-red-500", text: "text-red-600" },
  };
  const c = config[status];

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium shadow-soft"
      title={
        status === "offline"
          ? "Cannot reach the API on port 8000. Start the backend to enable live data."
          : "Connected to the FastAPI backend."
      }
    >
      <span className="relative flex h-2.5 w-2.5">
        {status === "online" && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
        )}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${c.dot}`} />
      </span>
      <span className={c.text}>{c.label}</span>
    </span>
  );
}