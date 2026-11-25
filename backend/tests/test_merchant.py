from sqlmodel import Session, select

from app.db import engine
from app.models import Receipt


def test_merchant_summary(client):
    with Session(engine) as db:
        used = db.exec(
            select(Receipt).where(
                Receipt.vendor_tpin == "SYN-TPIN-001", Receipt.status == "used"
            )
        ).all()
        expected_total = round(sum(float(r.amount) for r in used), 2)

    body = client.get("/merchant/SYN-TPIN-001/summary").json()
    assert body["verified_count"] == len(used)
    assert body["verified_total"] == expected_total
    assert body["estimated_tax_due"] == round(expected_total * 0.05, 2)
    assert "placeholder" in body["tax_rate_note"].lower()
    assert len(body["last_7_days"]) == 7
    assert all("phone" not in key for key in body)
    assert "+260" not in str(body)


def test_unknown_vendor(client):
    response = client.get("/merchant/NO-SUCH/summary")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "vendor_not_found"
