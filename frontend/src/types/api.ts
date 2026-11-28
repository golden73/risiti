// API types mirroring contract/api-contract.md exactly.

export type VerifyStatus =
  | "valid"
  | "invalid"
  | "used"
  | "below_minimum"
  | "cap_reached";

export interface VerifyRequest {
  receipt_id: string;
  phone: string;
}

export interface VerifyResponse {
  status: VerifyStatus;
  vendor_name: string | null;
  amount_band: string | null;
  points_awarded: number;
  balance: number;
  message: string;
  simulated: boolean;
}

export interface LedgerItem {
  id: number;
  change: number;
  reason: string;
  created_at: string;
}

export interface BalanceResponse {
  phone: string;
  points: number;
  history: LedgerItem[];
}

export type RewardType = "airtime" | "data";

export interface CatalogueItem {
  code: string;
  name: string;
  cost_points: number;
  type: RewardType | string;
}

export interface RedeemRequest {
  phone: string;
  item_code: string;
}

export type RedeemStatus = "ok" | "insufficient_points" | "unknown_item";

export interface RedeemResponse {
  status: RedeemStatus;
  new_balance: number;
  item: string;
  simulated: boolean;
}

export interface ReportRequest {
  phone: string;
  area: string;
  vendor_name?: string | null;
  note?: string | null;
}

export interface ReportResponse {
  report_id: number;
}

export interface DaySummary {
  date: string;
  count: number;
  total: number;
}

export interface MerchantSummary {
  vendor_name: string;
  verified_count: number;
  verified_total: number;
  estimated_tax_due: number;
  tax_rate_note: string;
  last_7_days: DaySummary[];
}

export interface Hotspot {
  area: string;
  report_count: number;
  lat: number | null;
  lng: number | null;
}

export interface USSDRequest {
  session_id: string;
  phone: string;
  text: string;
}

export interface USSDResponse {
  response_text: string;
  end: boolean;
}

export interface HealthResponse {
  status: string;
}

export interface DemoReceipts {
  valid: string[];
  already_used: string[];
  below_minimum: string[];
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}