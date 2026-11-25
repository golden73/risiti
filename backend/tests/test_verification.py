import pytest
from sqlmodel import Session, select

from app.config import settings
from app.db import engine
from app.models import Receipt, RewardLedger, Scan
from app.seed import DEMO_LOW, DEMO_OK, DEMO_USED
from app.utils import utcnow


def valid_ids(limit: int = 8) -> list[str]:
    with Session(engine) as db:
        rows = db.exec(
            select(Receipt)
            .where(
                Receipt.status == "issued",
                Receipt.amount >= settings.MIN_RECEIPT_AMOUNT,
                Receipt.receipt_id != DEMO_OK,
            )
            .limit(limit)
        ).all()
    return [row.receipt_id for row in rows]


def test_valid_verify(client):
    response = client.post(
        "/receipts/verify", json={"receipt_id": DEMO_OK, "phone": "0977000001"}
    )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "valid"
    assert body["points_awarded"] == 10
    assert body["balance"] == 10
    assert body["message"] == "Receipt verified! +10 points earned."
    assert body["simulated"] is True
    assert body["amount_band"] == "K50-K100"


def test_verify_extracts_id_from_url(client):
    response = client.post(
        "/receipts/verify",
        json={
            "receipt_id": "http://localhost:5173/verify?id=RCP-DEMO-OK&src=qr",
            "phone": "+260977000001",
        },
    )
    assert response.json()["status"] == "valid"


def test_invalid_used_and_below_minimum(client):
    assert client.post(
        "/receipts/verify", json={"receipt_id": "NO-SUCH", "phone": "0977000001"}
    ).json()["status"] == "invalid"
    assert client.post(
        "/receipts/verify", json={"receipt_id": DEMO_USED, "phone": "0977000001"}
    ).json()["status"] == "used"
    below = client.post(
        "/receipts/verify", json={"receipt_id": DEMO_LOW, "phone": "0977000001"}
    ).json()
    assert below["status"] == "below_minimum"
    assert below["points_awarded"] == 0
    assert below["message"] == "Receipt amount is below the K20 minimum."


def test_daily_cap_after_five_receipts(client):
    ids = valid_ids(6)
    assert len(ids) >= 6
    statuses = [
        client.post(
            "/receipts/verify", json={"receipt_id": rid, "phone": "0977000001"}
        ).json()["status"]
        for rid in ids[:6]
    ]
    assert statuses[:5] == ["valid"] * 5
    assert statuses[5] == "cap_reached"
    balance = client.get(
        "/rewards/balance", params={"phone": "0977000001"}
    ).json()
    assert balance["points"] == settings.DAILY_POINTS_CAP


def test_rule_order_cap_vs_below_minimum_and_invalid(client):
    for rid in valid_ids(5):
        client.post(
            "/receipts/verify", json={"receipt_id": rid, "phone": "0977000001"}
        )
    assert client.post(
        "/receipts/verify", json={"receipt_id": DEMO_LOW, "phone": "0977000001"}
    ).json()["status"] == "below_minimum"
    assert client.post(
        "/receipts/verify", json={"receipt_id": "NO-SUCH", "phone": "0977000001"}
    ).json()["status"] == "invalid"


def test_rule_order_used_beats_below_minimum(client, session):
    session.add(
        Receipt(
            receipt_id="USED-CHEAP",
            vendor_tpin="SYN-TPIN-001",
            amount=10.0,
            issued_at=utcnow(),
            status="used",
        )
    )
    session.commit()
    assert client.post(
        "/receipts/verify", json={"receipt_id": "USED-CHEAP", "phone": "0977000001"}
    ).json()["status"] == "used"


def test_one_reward_per_receipt_and_scan_rows(client, session):
    payload = {"receipt_id": DEMO_OK, "phone": "0977000001"}
    assert client.post("/receipts/verify", json=payload).json()["status"] == "valid"
    second = client.post("/receipts/verify", json=payload).json()
    assert second["status"] == "used"
    assert second["balance"] == 10
    assert len(session.exec(select(RewardLedger)).all()) == 1
    assert len(session.exec(select(Scan)).all()) == 2


def test_phone_normalisation(client):
    for raw in ("0977000001", "260977000001", "+260977000001"):
        response = client.get("/rewards/balance", params={"phone": raw})
        assert response.json()["phone"] == "+260977000001"


@pytest.mark.parametrize("bad", ["12345", "0800123456", "+254712345678"])
def test_invalid_phone(client, bad):
    response = client.post(
        "/receipts/verify", json={"receipt_id": DEMO_OK, "phone": bad}
    )
    assert response.status_code == 400
    assert response.json()["error"]["code"] == "invalid_phone"


def test_empty_receipt_id(client):
    response = client.post(
        "/receipts/verify", json={"receipt_id": "", "phone": "0977000001"}
    )
    assert response.status_code == 400
    assert response.json()["error"]["code"] == "invalid_receipt_id"
