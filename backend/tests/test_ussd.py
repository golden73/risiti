from sqlmodel import Session, select

from app.models import Report, RewardAccount
from app.seed import DEMO_OK

MENU = (
    "Risiti Loop\n1 Verify receipt\n2 My points\n3 Redeem\n"
    "4 Report no receipt\n5 Merchant sales"
)


def ussd(client, text, phone="0977000001"):
    return client.post(
        "/ussd", json={"session_id": "s1", "phone": phone, "text": text}
    ).json()


def assert_short(body):
    assert len(body["response_text"]) <= 160


def test_menu_and_bad_top_level(client):
    body = ussd(client, "")
    assert body == {"response_text": MENU, "end": False}
    assert ussd(client, "9") == body
    assert_short(body)


def test_verify_path(client):
    assert ussd(client, "1") == {"response_text": "Enter receipt number:", "end": False}
    assert ussd(client, "1*")["response_text"] == "Enter receipt number:"
    body = ussd(client, f"1*{DEMO_OK}")
    assert "Verified +10 pts" in body["response_text"]
    assert body["end"] is True
    assert_short(body)


def test_balance_path(client):
    body = ussd(client, "2")
    assert body == {"response_text": "Balance: 0 pts", "end": True}
    assert ussd(client, "2*extra")["response_text"] == MENU


def test_redeem_path(client, session):
    prompt = ussd(client, "3")
    assert "Airtime K5" in prompt["response_text"]
    assert prompt["end"] is False
    assert ussd(client, "3*9") == prompt
    body = ussd(client, "3*1")
    assert "Not enough points" in body["response_text"]
    assert body["end"] is True

    session.add(RewardAccount(phone="+260977000001", points=50))
    session.commit()
    success = ussd(client, "3*1")
    assert success["response_text"] == "Redeemed. Bal 0 pts"
    assert success["end"] is True
    assert_short(success)


def test_report_path(client, session):
    assert ussd(client, "4") == {"response_text": "Enter area:", "end": False}
    assert ussd(client, "4*Lusaka")["response_text"] == "Vendor name (0 to skip):"
    body = ussd(client, "4*Lusaka*0")
    assert body == {"response_text": "Report saved.", "end": True}
    with Session(session.get_bind()) as db:
        rows = db.exec(select(Report).where(Report.area == "Lusaka")).all()
    assert rows[-1].vendor_name is None


def test_merchant_path(client):
    assert ussd(client, "5") == {"response_text": "Enter TPIN:", "end": False}
    assert ussd(client, "5*BAD")["response_text"] == "Enter TPIN:"
    body = ussd(client, "5*SYN-TPIN-001")
    assert body["end"] is True
    assert "7d sales K" in body["response_text"]
    assert_short(body)


def test_ussd_normalises_phone(client):
    body = client.post(
        "/ussd",
        json={"session_id": "s1", "phone": "260977000001", "text": "2"},
    ).json()
    assert body["response_text"] == "Balance: 0 pts"
