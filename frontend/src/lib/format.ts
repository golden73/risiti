// Formatting and small pure helpers.

export function formatPoints(value: number): string {
  return new Intl.NumberFormat("en-ZM").format(value);
}

export function formatMoney(value: number): string {
  return `K${new Intl.NumberFormat("en-ZM", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}`;
}

export function formatMoneyCompact(value: number): string {
  return `K${new Intl.NumberFormat("en-ZM", {
    maximumFractionDigits: 0,
  }).format(value)}`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-ZM", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-ZM", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Short weekday label for a YYYY-MM-DD string. */
export function weekdayShort(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-ZM", { weekday: "short" });
}

/** Human friendly label for a ledger reason, e.g. verify:RCP-DEMO-OK */
export function describeReason(reason: string): string {
  if (reason.startsWith("verify:")) {
    return `Receipt verified · ${reason.slice("verify:".length)}`;
  }
  if (reason.startsWith("redeem:")) {
    return `Redeemed · ${reason.slice("redeem:".length)}`;
  }
  return reason;
}

/** Normalise loose phone input for display; returns null if clearly invalid shape. */
export function isValidPhoneShape(input: string): boolean {
  const cleaned = input.replace(/[\s\-()]/g, "");
  return (
    /^0\d{9}$/.test(cleaned) ||
    /^260\d{9}$/.test(cleaned) ||
    /^\+260\d{9}$/.test(cleaned)
  );
}