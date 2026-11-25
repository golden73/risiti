from fastapi import APIRouter, Depends
from sqlmodel import Session

from ..db import get_session
from ..schemas import ReportRequest, ReportResponse
from ..services.reports import create_report

router = APIRouter()


@router.post("/reports/no-receipt", response_model=ReportResponse)
def no_receipt(
    payload: ReportRequest, session: Session = Depends(get_session)
) -> ReportResponse:
    return create_report(
        session, payload.phone, payload.area, payload.vendor_name, payload.note
    )
