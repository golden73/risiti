from fastapi import APIRouter, Depends
from sqlmodel import Session

from ..db import get_session
from ..schemas import Hotspot
from ..services.hotspots import get_hotspots

router = APIRouter()


@router.get("/zra/hotspots", response_model=list[Hotspot])
def hotspots(session: Session = Depends(get_session)) -> list[Hotspot]:
    return get_hotspots(session)
