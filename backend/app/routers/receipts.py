from fastapi import APIRouter, Depends
from sqlmodel import Session

from ..db import get_session
from ..schemas import VerifyRequest, VerifyResponse
from ..services.verification import verify_receipt

router = APIRouter()


@router.post("/receipts/verify", response_model=VerifyResponse)
def verify(
    payload: VerifyRequest, session: Session = Depends(get_session)
) -> VerifyResponse:
    return verify_receipt(session, payload.receipt_id, payload.phone)
