"""Generate printable QR codes (URL payload) plus a bare-ID text file."""

import argparse
import sys
from pathlib import Path

import qrcode

BACKEND_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = BACKEND_ROOT.parent
sys.path.insert(0, str(BACKEND_ROOT))

from sqlmodel import Session, select  # noqa: E402

from app.db import create_db_and_tables, engine  # noqa: E402
from app.models import Receipt  # noqa: E402
from app.seed import seed_if_empty  # noqa: E402

PAYLOAD_TEMPLATE = "http://localhost:5173/verify?id={receipt_id}"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--out",
        type=Path,
        default=REPO_ROOT / "demo" / "qr",
        help="Output directory (default: <repo>/demo/qr)",
    )
    args = parser.parse_args()

    create_db_and_tables()
    with Session(engine) as session:
        seed_if_empty(session)
        receipts = session.exec(
            select(Receipt).order_by(Receipt.receipt_id).limit(20)
        ).all()

    args.out.mkdir(parents=True, exist_ok=True)
    for receipt in receipts:
        image = qrcode.make(PAYLOAD_TEMPLATE.format(receipt_id=receipt.receipt_id))
        image.save(args.out / f"{receipt.receipt_id}.png")

    (args.out / "receipt_ids.txt").write_text(
        "\n".join(receipt.receipt_id for receipt in receipts) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(receipts)} QR codes and receipt_ids.txt to {args.out}")


if __name__ == "__main__":
    main()
