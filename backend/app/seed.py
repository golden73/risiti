"""Deterministic demo data. Safe to call repeatedly and from admin reset."""

import random
from datetime import timedelta

from faker import Faker
from sqlmodel import Session, select

from .models import Area, Receipt, Report, Vendor
from .utils import utcnow

CITIES: list[tuple[str, float, float]] = [
    ("Lusaka", -15.3875, 28.3228),
    ("Kitwe", -12.8056, 28.2131),
    ("Ndola", -12.9587, 28.6397),
    ("Kabwe", -14.4500, 28.4500),
    ("Livingstone", -17.8550, 25.8550),
    ("Chipata", -13.6500, 32.6500),
    ("Mansa", -11.2000, 28.9000),
    ("Kasama", -10.2167, 31.1833),
    ("Solwezi", -12.1500, 26.4000),
    ("Mongu", -15.3833, 23.0500),
]

DEMO_OK = "RCP-DEMO-OK"
DEMO_USED = "RCP-DEMO-USED"
DEMO_LOW = "RCP-DEMO-LOW"

AMOUNTS = [15, 18, 20, 25, 35, 45, 50, 60, 75, 90, 120, 150, 200, 250, 300, 450, 500]
UNKNOWN_AREAS = ["Chilanga", "Kafue"]


def seed(session: Session) -> None:
    if session.exec(select(Vendor)).first() is not None:
        return

    rng = random.Random(11)
    fake = Faker()
    fake.seed_instance(42)
    now = utcnow()

    for name, lat, lng in CITIES:
        session.add(Area(name=name, lat=lat, lng=lng))
    for name in UNKNOWN_AREAS:
        session.add(Area(name=name, lat=None, lng=None))

    vendors: list[Vendor] = []
    for index, (city, _lat, _lng) in enumerate(CITIES, start=1):
        vendor = Vendor(
            tpin=f"SYN-TPIN-{index:03d}",
            name=f"Synthetic Traders {city}",
            area=city,
        )
        session.add(vendor)
        vendors.append(vendor)
    session.flush()

    receipts: list[Receipt] = [
        Receipt(
            receipt_id=DEMO_OK,
            vendor_tpin=vendors[0].tpin,
            amount=50.0,
            issued_at=now - timedelta(days=1),
            status="issued",
        ),
        Receipt(
            receipt_id=DEMO_USED,
            vendor_tpin=vendors[0].tpin,
            amount=120.0,
            issued_at=now - timedelta(days=2),
            status="used",
        ),
        Receipt(
            receipt_id=DEMO_LOW,
            vendor_tpin=vendors[0].tpin,
            amount=15.0,
            issued_at=now - timedelta(days=1),
            status="issued",
        ),
    ]

    for index in range(1, 68):
        used = index <= 9
        days_ago = rng.randint(0, 6) if used else rng.randint(0, 13)
        receipts.append(
            Receipt(
                receipt_id=f"RCP-{index:04d}",
                vendor_tpin=vendors[(index - 1) % len(vendors)].tpin,
                amount=float(rng.choice(AMOUNTS)),
                issued_at=now - timedelta(days=days_ago, hours=rng.randint(0, 20)),
                status="used" if used else "issued",
            )
        )
    session.add_all(receipts)

    area_names = [city for city, _lat, _lng in CITIES] + UNKNOWN_AREAS
    for index in range(15):
        session.add(
            Report(
                phone=f"+26097700{index + 1:04d}",
                area=area_names[index % len(area_names)],
                vendor_name=None if index % 3 == 0 else f"Street vendor {index + 1}",
                note=fake.sentence(nb_words=6),
                created_at=now - timedelta(days=rng.randint(0, 13)),
            )
        )

    session.commit()


def seed_if_empty(session: Session) -> None:
    seed(session)
