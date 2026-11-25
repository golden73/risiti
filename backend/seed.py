"""Convenience shim: the implementation lives in app/seed.py so app code can import it."""

from app.seed import CITIES, DEMO_LOW, DEMO_OK, DEMO_USED, seed, seed_if_empty

__all__ = ["CITIES", "DEMO_LOW", "DEMO_OK", "DEMO_USED", "seed", "seed_if_empty"]
