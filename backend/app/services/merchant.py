from datetime import timedelta

from sqlmodel import Session, select

from ..config import settings
from ..errors import AppError
from ..models import Receipt, Vendor
from ..schemas import DaySummary, MerchantSummary
from ..utils import lusaka_date, utcnow

TAX_RATE_NOTE = (
    "Estimate only — rate is a placeholder pending finance confirmation."
)


def get_summary(session: Session, tpin: str) -> MerchantSummary:
    vendor = session.get(Vendor, tpin)
    if vendor is None:
        raise AppError(404, "vendor_not_found", f"No vendor found for TPIN {tpin}")

    receipts = session.exec(
        select(Receipt).where(
            Receipt.vendor_tpin == tpin, Receipt.status == "used"
        )
    ).all()

    verified_total = round(sum(float(r.amount) for r in receipts), 2)
    today = lusaka_date(utcnow())
    days: list[DaySummary] = []
    for offset in range(6, -1, -1):
        day = today - timedelta(days=offset)
        matching = [r for r in receipts if lusaka_date(r.issued_at) == day]
        days.append(
            DaySummary(
                date=day.isoformat(),
                count=len(matching),
                total=round(sum(float(r.amount) for r in matching), 2),
            )
        )

    return MerchantSummary(
        vendor_name=vendor.name,
        verified_count=len(receipts),
        verified_total=verified_total,
        estimated_tax_due=round(verified_total * settings.TURNOVER_TAX_RATE, 2),
        tax_rate_note=TAX_RATE_NOTE,
        last_7_days=days,
    )
