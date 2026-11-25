from fastapi import APIRouter, Header
from sqlmodel import Session, select, SQLModel

from ..config import settings
from ..db import create_db_and_tables, drop_db_and_tables, engine
from ..errors import AppError
from ..models import Receipt, Report, Vendor
from ..schemas import DemoReceipts, HealthResponse, ResetResponse
from ..seed import DEMO_LOW, DEMO_OK, DEMO_USED, seed

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@router.get("/demo/receipts", response_model=DemoReceipts)
def demo_receipts() -> DemoReceipts:
    return DemoReceipts(
        valid=[DEMO_OK], already_used=[DEMO_USED], below_minimum=[DEMO_LOW]
    )


@router.post("/admin/reset-demo", response_model=ResetResponse)
def reset_demo(x_admin_token: str | None = Header(default=None, alias="X-Admin-Token")):
    if x_admin_token != settings.ADMIN_TOKEN:
        raise AppError(401, "invalid_admin_token", "Invalid or missing X-Admin-Token")

    drop_db_and_tables()
    create_db_and_tables()
    with Session(engine) as session:
        seed(session)
        return ResetResponse(
            status="ok",
            vendors=len(session.exec(select(Vendor)).all()),
            receipts=len(session.exec(select(Receipt)).all()),
            reports=len(session.exec(select(Report)).all()),
        )
