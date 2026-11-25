from sqlmodel import Session, select

from ..errors import AppError
from ..models import Area, Report
from ..schemas import ReportResponse
from ..utils import require_phone, utcnow


def create_report(
    session: Session,
    phone: str,
    area: str,
    vendor_name: str | None = None,
    note: str | None = None,
) -> ReportResponse:
    phone = require_phone(phone)
    area = (area or "").strip()
    if not area:
        raise AppError(422, "validation_error", "area is required")

    if session.get(Area, area) is None:
        session.add(Area(name=area, lat=None, lng=None))
        session.flush()

    report = Report(
        phone=phone,
        area=area,
        vendor_name=(vendor_name or "").strip() or None,
        note=(note or "").strip() or None,
        created_at=utcnow(),
    )
    session.add(report)
    session.commit()
    session.refresh(report)
    return ReportResponse(report_id=report.id)


def report_count(session: Session) -> int:
    return len(session.exec(select(Report)).all())
