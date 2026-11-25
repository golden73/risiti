from typing import Optional

from pydantic import BaseModel, Field


class VerifyRequest(BaseModel):
    receipt_id: str
    phone: str


class VerifyResponse(BaseModel):
    status: str
    vendor_name: Optional[str] = None
    amount_band: Optional[str] = None
    points_awarded: int = 0
    balance: int = 0
    message: str
    simulated: bool = True


class LedgerItem(BaseModel):
    id: int
    change: int
    reason: str
    created_at: str


class BalanceResponse(BaseModel):
    phone: str
    points: int
    history: list[LedgerItem] = Field(default_factory=list)


class CatalogueItem(BaseModel):
    code: str
    name: str
    cost_points: int
    type: str


class RedeemRequest(BaseModel):
    phone: str
    item_code: str


class RedeemResponse(BaseModel):
    status: str
    new_balance: int
    item: str
    simulated: bool = True


class ReportRequest(BaseModel):
    phone: str
    area: str
    vendor_name: Optional[str] = None
    note: Optional[str] = None


class ReportResponse(BaseModel):
    report_id: int


class DaySummary(BaseModel):
    date: str
    count: int
    total: float


class MerchantSummary(BaseModel):
    vendor_name: str
    verified_count: int
    verified_total: float
    estimated_tax_due: float
    tax_rate_note: str
    last_7_days: list[DaySummary]


class Hotspot(BaseModel):
    area: str
    report_count: int
    lat: Optional[float] = None
    lng: Optional[float] = None


class USSDRequest(BaseModel):
    session_id: str = ""
    phone: str
    text: str = ""


class USSDResponse(BaseModel):
    response_text: str
    end: bool


class HealthResponse(BaseModel):
    status: str


class DemoReceipts(BaseModel):
    valid: list[str]
    already_used: list[str]
    below_minimum: list[str]


class ResetResponse(BaseModel):
    status: str
    vendors: int
    receipts: int
    reports: int


class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    error: ErrorDetail
