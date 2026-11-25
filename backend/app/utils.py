import re
from datetime import datetime, timezone
from urllib.parse import parse_qs, urlparse

from zoneinfo import ZoneInfo

LUSAKA = ZoneInfo("Africa/Lusaka")
UTC = timezone.utc


def utcnow() -> datetime:
    """Naive UTC datetime for storage (works identically on SQLite and Postgres)."""
    return datetime.now(UTC).replace(tzinfo=None)


def as_utc(value: datetime) -> datetime:
    return value.replace(tzinfo=UTC) if value.tzinfo is None else value


def lusaka_date(value: datetime):
    return as_utc(value).astimezone(LUSAKA).date()


def iso_utc(value: datetime) -> str:
    return as_utc(value).astimezone(UTC).isoformat().replace("+00:00", "Z")


def normalize_phone(value: str) -> str | None:
    if value is None:
        return None
    cleaned = re.sub(r"[\s\-()]", "", str(value))

    local = None
    if re.fullmatch(r"0\d{9}", cleaned):
        local = cleaned[1:]
    elif re.fullmatch(r"260\d{9}", cleaned):
        local = cleaned[3:]
    elif re.fullmatch(r"\+260\d{9}", cleaned):
        local = cleaned[4:]

    # Zambian mobile subscriber numbers start with 9 (09xxxxxxxx in local form).
    if local and re.fullmatch(r"9\d{8}", local):
        return "+260" + local
    return None


def require_phone(value: str) -> str:
    phone = normalize_phone(value)
    if phone is None:
        from .errors import AppError

        raise AppError(
            400,
            "invalid_phone",
            "Phone must be 09xxxxxxxx, 260xxxxxxxxx or +260xxxxxxxxx",
        )
    return phone


def extract_receipt_id(value: str) -> str:
    if value is None:
        return ""
    raw = str(value).strip()
    if "?id=" in raw:
        values = parse_qs(urlparse(raw).query).get("id", [])
        return values[0].strip() if values else ""
    return raw


def amount_band(amount: float) -> str:
    amount = float(amount)
    if amount < 20:
        return "Below K20"
    if amount < 50:
        return "K20-K50"
    if amount < 100:
        return "K50-K100"
    if amount < 200:
        return "K100-K200"
    return "K200+"
