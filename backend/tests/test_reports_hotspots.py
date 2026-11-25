from sqlmodel import select

from app.models import Area, Report


def test_report_known_area_and_hotspot(client, session):
    response = client.post(
        "/reports/no-receipt",
        json={
            "phone": "0977000001",
            "area": "Lusaka",
            "vendor_name": "Street vendor",
            "note": "No QR",
        },
    )
    assert response.status_code == 200
    assert isinstance(response.json()["report_id"], int)
    hotspots = client.get("/zra/hotspots").json()
    lusaka = next(item for item in hotspots if item["area"] == "Lusaka")
    assert lusaka["lat"] == -15.3875
    assert "+260" not in str(hotspots)


def test_unknown_area_stored_with_null_coordinates(client, session):
    client.post(
        "/reports/no-receipt",
        json={"phone": "0977000001", "area": "New Town", "vendor_name": "0"},
    )
    area = session.get(Area, "New Town")
    assert area is not None
    assert area.lat is None and area.lng is None
    hotspot = next(
        item for item in client.get("/zra/hotspots").json() if item["area"] == "New Town"
    )
    assert hotspot["lat"] is None


def test_hotspots_sorted_by_count_desc_then_area(client):
    for area in ("Zonal", "Alpha", "Alpha", "Alpha"):
        client.post(
            "/reports/no-receipt", json={"phone": "0977000001", "area": area}
        )
    hotspots = client.get("/zra/hotspots").json()
    pairs = [(item["report_count"], item["area"]) for item in hotspots]
    assert pairs == sorted(pairs, key=lambda pair: (-pair[0], pair[1]))
    assert pairs[0] == (3, "Alpha")


def test_report_requires_area(client):
    response = client.post(
        "/reports/no-receipt", json={"phone": "0977000001", "area": "  "}
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"
