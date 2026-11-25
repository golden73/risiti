def test_health_and_demo_receipts(client):
    assert client.get("/health").json() == {"status": "ok"}
    assert client.get("/demo/receipts").json() == {
        "valid": ["RCP-DEMO-OK"],
        "already_used": ["RCP-DEMO-USED"],
        "below_minimum": ["RCP-DEMO-LOW"],
    }


def test_admin_reset(client):
    bad = client.post("/admin/reset-demo")
    assert bad.status_code == 401
    assert bad.json()["error"]["code"] == "invalid_admin_token"

    good = client.post(
        "/admin/reset-demo", headers={"X-Admin-Token": "dev-admin-token"}
    )
    assert good.status_code == 200
    assert good.json() == {
        "status": "ok",
        "vendors": 10,
        "receipts": 70,
        "reports": 15,
    }


def test_validation_error_envelope(client):
    response = client.post("/receipts/verify", json={"receipt_id": "RCP-DEMO-OK"})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"
