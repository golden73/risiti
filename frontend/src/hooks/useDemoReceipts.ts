import { api } from "@/lib/api";
import { useAsync } from "@/hooks/useAsync";
import type { DemoReceipts } from "@/types/api";

// Deterministic fallbacks (match backend seed) if /demo/receipts is unreachable.
const FALLBACK: DemoReceipts = {
  valid: ["RCP-DEMO-OK"],
  already_used: ["RCP-DEMO-USED"],
  below_minimum: ["RCP-DEMO-LOW"],
};

/** Loads demo receipt identifiers from the backend, with a safe fallback. */
export function useDemoReceipts() {
  const { data } = useAsync<DemoReceipts>(() => api.demoReceipts(), []);
  const source = data ?? FALLBACK;
  return {
    valid: source.valid,
    already_used: source.already_used,
    below_minimum: source.below_minimum,
    all: [...source.valid, ...source.already_used, ...source.below_minimum],
  };
}