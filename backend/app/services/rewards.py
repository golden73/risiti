from sqlmodel import Session, select

from ..models import RewardAccount, RewardLedger
from ..schemas import BalanceResponse, CatalogueItem, RedeemResponse
from ..utils import iso_utc, require_phone, utcnow

CATALOGUE: list[dict] = [
    {
        "code": "AIRTIME_K5",
        "name": "Zamtel airtime K5",
        "cost_points": 50,
        "type": "airtime",
    },
    {
        "code": "DATA_100MB",
        "name": "Zamtel data 100MB",
        "cost_points": 80,
        "type": "data",
    },
]


def get_catalogue() -> list[CatalogueItem]:
    return [CatalogueItem(**item) for item in CATALOGUE]


def get_balance(session: Session, phone: str) -> BalanceResponse:
    phone = require_phone(phone)
    account = session.get(RewardAccount, phone)
    points = account.points if account else 0
    history = []
    if account:
        rows = session.exec(
            select(RewardLedger)
            .where(RewardLedger.phone == phone)
            .order_by(RewardLedger.id.desc())
            .limit(10)
        ).all()
        history = [
            {
                "id": row.id,
                "change": row.change,
                "reason": row.reason,
                "created_at": iso_utc(row.created_at),
            }
            for row in rows
        ]
    return BalanceResponse(phone=phone, points=points, history=history)


def redeem(session: Session, phone: str, item_code: str) -> RedeemResponse:
    phone = require_phone(phone)
    account = session.get(RewardAccount, phone)
    balance = account.points if account else 0
    item = next((entry for entry in CATALOGUE if entry["code"] == item_code), None)

    if item is None:
        status = "unknown_item"
    elif balance < item["cost_points"]:
        status = "insufficient_points"
    else:
        status = "ok"
        account.points = balance - item["cost_points"]
        balance = account.points
        session.add(
            RewardLedger(
                phone=phone,
                change=-item["cost_points"],
                reason=f"redeem:{item_code}",
                created_at=utcnow(),
            )
        )
        session.commit()

    return RedeemResponse(
        status=status, new_balance=balance, item=item_code
    )
