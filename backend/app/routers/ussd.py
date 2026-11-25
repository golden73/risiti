from fastapi import APIRouter, Depends
from sqlmodel import Session

from ..db import get_session
from ..schemas import USSDRequest, USSDResponse
from ..services.ussd import handle_ussd

router = APIRouter()


@router.post("/ussd", response_model=USSDResponse)
def ussd(
    payload: USSDRequest, session: Session = Depends(get_session)
) -> USSDResponse:
    return handle_ussd(session, payload.phone, payload.text)
