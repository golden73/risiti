from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from ..db import get_session
from ..schemas import BalanceResponse, CatalogueItem, RedeemRequest, RedeemResponse
from ..services.rewards import get_balance, get_catalogue, redeem

router = APIRouter()


@router.get("/rewards/balance", response_model=BalanceResponse)
def balance(phone: str = Query(...), session: Session = Depends(get_session)):
    return get_balance(session, phone)


@router.get("/rewards/catalogue", response_model=list[CatalogueItem])
def catalogue():
    return get_catalogue()


@router.post("/rewards/redeem", response_model=RedeemResponse)
def redeem_item(
    payload: RedeemRequest, session: Session = Depends(get_session)
):
    return redeem(session, payload.phone, payload.item_code)
