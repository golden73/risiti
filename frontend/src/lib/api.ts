import axios, { AxiosError } from "axios";
import type {
  ApiErrorBody,
  BalanceResponse,
  CatalogueItem,
  DemoReceipts,
  HealthResponse,
  Hotspot,
  MerchantSummary,
  RedeemRequest,
  RedeemResponse,
  ReportRequest,
  ReportResponse,
  USSDRequest,
  USSDResponse,
  VerifyRequest,
  VerifyResponse,
} from "@/types/api";

const baseURL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://localhost:8000";

export const http = axios.create({
  baseURL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

/** Normalised error shape surfaced to the UI. */
export class ApiError extends Error {
  code: string;
  status: number | null;
  constructor(code: string, message: string, status: number | null) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorBody>;
    const body = axiosError.response?.data;
    if (body?.error?.message) {
      return new ApiError(
        body.error.code ?? "http_error",
        body.error.message,
        axiosError.response?.status ?? null,
      );
    }
    if (error.code === "ECONNABORTED") {
      return new ApiError(
        "timeout",
        "The request timed out. Please try again.",
        null,
      );
    }
    if (!axiosError.response) {
      return new ApiError(
        "network",
        "Cannot reach the server. Make sure the backend is running on port 8000.",
        null,
      );
    }
    return new ApiError(
      "http_error",
      axiosError.message || "Something went wrong.",
      axiosError.response.status,
    );
  }
  return new ApiError("unknown", "An unexpected error occurred.", null);
}

export const api = {
  async health(): Promise<HealthResponse> {
    try {
      const { data } = await http.get<HealthResponse>("/health");
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async demoReceipts(): Promise<DemoReceipts> {
    try {
      const { data } = await http.get<DemoReceipts>("/demo/receipts");
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async verifyReceipt(payload: VerifyRequest): Promise<VerifyResponse> {
    try {
      const { data } = await http.post<VerifyResponse>(
        "/receipts/verify",
        payload,
      );
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async getBalance(phone: string): Promise<BalanceResponse> {
    try {
      const { data } = await http.get<BalanceResponse>("/rewards/balance", {
        params: { phone },
      });
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async getCatalogue(): Promise<CatalogueItem[]> {
    try {
      const { data } = await http.get<CatalogueItem[]>("/rewards/catalogue");
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async redeem(payload: RedeemRequest): Promise<RedeemResponse> {
    try {
      const { data } = await http.post<RedeemResponse>(
        "/rewards/redeem",
        payload,
      );
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async reportNoReceipt(payload: ReportRequest): Promise<ReportResponse> {
    try {
      const { data } = await http.post<ReportResponse>(
        "/reports/no-receipt",
        payload,
      );
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async merchantSummary(tpin: string): Promise<MerchantSummary> {
    try {
      const { data } = await http.get<MerchantSummary>(
        `/merchant/${encodeURIComponent(tpin)}/summary`,
      );
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async hotspots(): Promise<Hotspot[]> {
    try {
      const { data } = await http.get<Hotspot[]>("/zra/hotspots");
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async ussd(payload: USSDRequest): Promise<USSDResponse> {
    try {
      const { data } = await http.post<USSDResponse>("/ussd", payload);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },
};