// Static reference data derived from backend seed.py and contract.
// This is presentation metadata only — no business data is faked here.

export const DEMO_PHONE = "0977000001";

// Vendor TPINs created deterministically by the backend seed (SYN-TPIN-001..010).
export const DEMO_TPINS = Array.from(
  { length: 10 },
  (_, i) => `SYN-TPIN-${String(i + 1).padStart(3, "0")}`,
);

export const DEMO_TPIN = DEMO_TPINS[0];

// Areas known to the backend seed. First ten carry coordinates; the last two
// intentionally have null coordinates per the contract.
export interface AreaInfo {
  name: string;
  lat: number | null;
  lng: number | null;
}

export const AREAS: AreaInfo[] = [
  { name: "Lusaka", lat: -15.3875, lng: 28.3228 },
  { name: "Kitwe", lat: -12.8056, lng: 28.2131 },
  { name: "Ndola", lat: -12.9587, lng: 28.6397 },
  { name: "Kabwe", lat: -14.45, lng: 28.45 },
  { name: "Livingstone", lat: -17.855, lng: 25.855 },
  { name: "Chipata", lat: -13.65, lng: 32.65 },
  { name: "Mansa", lat: -11.2, lng: 28.9 },
  { name: "Kasama", lat: -10.2167, lng: 31.1833 },
  { name: "Solwezi", lat: -12.15, lng: 26.4 },
  { name: "Mongu", lat: -15.3833, lng: 23.05 },
  { name: "Chilanga", lat: null, lng: null },
  { name: "Kafue", lat: null, lng: null },
];

export const AREA_NAMES = AREAS.map((a) => a.name);

export const STORAGE_KEYS = {
  phone: "risiti.phone",
} as const;

export const POINTS_PER_RECEIPT = 10;
export const MIN_RECEIPT_AMOUNT = 20;
export const DAILY_POINTS_CAP = 50;