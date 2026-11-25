from fastapi import APIRouter, Depends
from sqlmodel import Session

from ..db import get_session
from ..schemas import MerchantSummary
from ..services.merchant import get_summary

router = APIRouter()


@router.get("/merchant/{tpin}/summary", response_model=MerchantSummary)
def merchant_summary(
    tpin: str, session: Session = Depends(get_session)
) -> MerchantSummary:
    return get_summary(session, tpin)
