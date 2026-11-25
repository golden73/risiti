from sqlalchemy import update
from sqlmodel import Session, select

from ..config import settings
from ..errors import AppError
from ..models import Receipt, RewardAccount, RewardLedger, Scan, Vendor
from ..schemas import VerifyResponse
from ..utils import amount_band, extract_receipt_id, lusaka_date, require_phone, utcnow

MESSAGES = {
    "valid": "Receipt verified! +{points} points earned.",
    "invalid": "Receipt not found in the simulated ZRA register.",
    "used": "This receipt has already been verified.",
    "below_minimum": "Receipt amount is below the K20 minimum.",
    "cap_reached": "Daily points cap reached. Try again tomorrow.",
}


def earned_today(session: Session, phone: str) -> int:
    rows = session.exec(
        select(RewardLedger).where(RewardLedger.phone == phone)
    ).all()
    today = lusaka_date(utcnow())
    return sum(
        row.change
        for row in rows
        if row.change > 0
        and row.reason.startswith("verify:")
        and lusaka_date(row.created_at) == today
    )


def _get_or_create_account(session: Session, phone: str) -> RewardAccount:
    account = session.get(RewardAccount, phone)
    if account is None:
        account = RewardAccount(phone=phone, points=0)
        session.add(account)
        session.flush()
    return account


def verify_receipt(session: Session, receipt_id: str, phone: str) -> VerifyResponse:
    phone = require_phone(phone)
    rid = extract_receipt_id(receipt_id)
    if not rid:
        raise AppError(400, "invalid_receipt_id", "receipt_id is required")

    receipt = session.get(Receipt, rid)
    vendor_name = None
    band = None
    if receipt is not None:
        band = amount_band(receipt.amount)
        vendor = session.get(Vendor, receipt.vendor_tpin)
        vendor_name = vendor.name if vendor else None

    status = "valid"
    if receipt is None:
        status = "invalid"
    elif receipt.status == "used":
        status = "used"
    elif float(receipt.amount) < settings.MIN_RECEIPT_AMOUNT:
        status = "below_minimum"
    elif earned_today(session, phone) >= settings.DAILY_POINTS_CAP:
        status = "cap_reached"
    else:
        result = session.exec(
            update(Receipt)
            .where(Receipt.receipt_id == rid, Receipt.status == "issued")
            .values(status="used")
        )
        if result.rowcount == 0:
            status = "used"

    points_awarded = 0
    if status == "valid":
        account = _get_or_create_account(session, phone)
        account.points += settings.POINTS_PER_RECEIPT
        session.add(
            RewardLedger(
                phone=phone,
                change=settings.POINTS_PER_RECEIPT,
                reason=f"verify:{rid}",
                created_at=utcnow(),
            )
        )
        points_awarded = settings.POINTS_PER_RECEIPT
        balance = account.points
    else:
        account = session.get(RewardAccount, phone)
        balance = account.points if account else 0

    session.add(
        Scan(
            receipt_id=rid,
            phone=phone,
            result=status,
            created_at=utcnow(),
        )
    )
    session.commit()

    message = MESSAGES[status].format(points=points_awarded)
    return VerifyResponse(
        status=status,
        vendor_name=vendor_name,
        amount_band=band,
        points_awarded=points_awarded,
        balance=balance,
        message=message,
    )
