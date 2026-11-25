from sqlmodel import select

from app.models import RewardAccount, RewardLedger
from app.seed import DEMO_OK


def test_catalogue(client):
    body = client.get("/rewards/catalogue").json()
    assert [item["code"] for item in body] == ["AIRTIME_K5", "DATA_100MB"]
    assert body[0]["cost_points"] == 50
    assert body[1]["cost_points"] == 80


def test_unknown_phone_balance(client):
    body = client.get("/rewards/balance", params={"phone": "0977000999"}).json()
    assert body["points"] == 0
    assert body["history"] == []


def test_redeem_insufficient_points(client):
    client.post(
        "/receipts/verify", json={"receipt_id": DEMO_OK, "phone": "0977000001"}
    )
    body = client.post(
        "/rewards/redeem",
        json={"phone": "0977000001", "item_code": "AIRTIME_K5"},
    ).json()
    assert body["status"] == "insufficient_points"
    assert body["new_balance"] == 10
    assert body["simulated"] is True


def test_redeem_success(client, session):
    session.add(RewardAccount(phone="+260977000001", points=50))
    session.commit()
    body = client.post(
        "/rewards/redeem",
        json={"phone": "0977000001", "item_code": "AIRTIME_K5"},
    ).json()
    assert body["status"] == "ok"
    assert body["new_balance"] == 0
    assert body["item"] == "AIRTIME_K5"
    ledger = session.exec(select(RewardLedger)).all()
    assert len(ledger) == 1
    assert ledger[0].change == -50
    assert ledger[0].reason == "redeem:AIRTIME_K5"


def test_redeem_unknown_item(client):
    body = client.post(
        "/rewards/redeem",
        json={"phone": "0977000001", "item_code": "GIFT_CARD"},
    ).json()
    assert body["status"] == "unknown_item"
    assert body["new_balance"] == 0
    assert body["item"] == "GIFT_CARD"
