from sqlmodel import Session

from ..errors import AppError
from ..schemas import USSDResponse
from .merchant import get_summary
from .rewards import CATALOGUE, get_balance, redeem
from .reports import create_report
from .verification import MESSAGES, verify_receipt

MENU = (
    "Risiti Loop\n1 Verify receipt\n2 My points\n3 Redeem\n"
    "4 Report no receipt\n5 Merchant sales"
)
CATALOGUE_PROMPT = "1 Airtime K5 (50pt)\n2 Data 100MB (80pt)\nReply 3*1 or 3*2"


def _continue(text: str) -> USSDResponse:
    return USSDResponse(response_text=text, end=False)


def _end(text: str) -> USSDResponse:
    return USSDResponse(response_text=text, end=True)


def _verify_short(status: str, points: int, balance: int) -> str:
    if status == "valid":
        return f"Verified +{points} pts. Bal {balance}."
    return MESSAGES[status]


def handle_ussd(session: Session, phone: str, text: str) -> USSDResponse:
    from ..utils import require_phone

    phone = require_phone(phone)
    parts = text.split("*") if text else []

    if not parts:
        return _continue(MENU)

    step = parts[0]

    if step == "1":
        if len(parts) == 1:
            return _continue("Enter receipt number:")
        if len(parts) != 2 or not parts[1].strip():
            return _continue("Enter receipt number:")
        try:
            result = verify_receipt(session, parts[1], phone)
        except AppError:
            return _continue("Enter receipt number:")
        return _end(
            _verify_short(
                result.status, result.points_awarded, result.balance
            )
        )

    if step == "2":
        if len(parts) != 1:
            return _continue(MENU)
        result = get_balance(session, phone)
        return _end(f"Balance: {result.points} pts")

    if step == "3":
        if len(parts) == 1:
            return _continue(CATALOGUE_PROMPT)
        if len(parts) != 2 or parts[1] not in {"1", "2"}:
            return _continue(CATALOGUE_PROMPT)
        code = CATALOGUE[int(parts[1]) - 1]["code"]
        result = redeem(session, phone, code)
        if result.status == "ok":
            return _end(f"Redeemed. Bal {result.new_balance} pts")
        if result.status == "insufficient_points":
            return _end(f"Not enough points. Bal {result.new_balance} pts")
        return _end("Unknown item.")

    if step == "4":
        if len(parts) == 1 or not parts[1].strip():
            return _continue("Enter area:")
        if len(parts) == 2:
            return _continue("Vendor name (0 to skip):")
        if len(parts) != 3:
            return _continue("Enter area:")
        vendor = None if parts[2] == "0" else parts[2]
        create_report(session, phone, parts[1], vendor)
        return _end("Report saved.")

    if step == "5":
        if len(parts) == 1:
            return _continue("Enter TPIN:")
        if len(parts) != 2 or not parts[1].strip():
            return _continue("Enter TPIN:")
        try:
            summary = get_summary(session, parts[1])
        except AppError:
            return _continue("Enter TPIN:")
        text = (
            f"7d sales K{summary.verified_total:,.0f}. "
            f"Est tax K{summary.estimated_tax_due:,.0f}."
        )
        return _end(text[:160])

    return _continue(MENU)
