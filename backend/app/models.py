from datetime import datetime
from typing import Optional

from sqlalchemy import Column, Numeric
from sqlmodel import Field, SQLModel


class Vendor(SQLModel, table=True):
    tpin: str = Field(primary_key=True)
    name: str
    area: str


class Area(SQLModel, table=True):
    name: str = Field(primary_key=True)
    lat: Optional[float] = None
    lng: Optional[float] = None


class Receipt(SQLModel, table=True):
    receipt_id: str = Field(primary_key=True)
    vendor_tpin: str
    amount: float = Field(sa_column=Column(Numeric(10, 2), nullable=False))
    issued_at: datetime
    status: str = "issued"


class Scan(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    receipt_id: str
    phone: str
    result: str
    created_at: datetime


class RewardAccount(SQLModel, table=True):
    phone: str = Field(primary_key=True)
    points: int = 0


class RewardLedger(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    phone: str
    change: int
    reason: str
    created_at: datetime


class Report(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    phone: str
    area: str
    vendor_name: Optional[str] = None
    note: Optional[str] = None
    created_at: datetime
