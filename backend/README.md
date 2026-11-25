# Risiti Loop — Backend

FastAPI backend for a hackathon prototype. Customers verify simulated ZRA Smart Invoice
receipts, earn points, redeem simulated Zamtel airtime/data, and report vendors who gave no
receipt. Merchants and ZRA get read-only summaries.

> **All ZRA and Zamtel connections are simulated.** Verify and redeem responses always
> include `"simulated": true`. `POINTS_PER_RECEIPT`, `MIN_RECEIPT_AMOUNT`,
> `DAILY_POINTS_CAP`, the catalogue prices and `TURNOVER_TAX_RATE` are placeholders for
> the demo; the tax rate (0.05) is pending confirmation from the finance teammate and every
> tax figure is labelled as an estimate.

## Setup

Requires Python 3.11+ and a Supabase project.

1. In Supabase, open **Project Settings → Database → Connection string → URI**. Use the
   **session/direct** connection (port 5432). Free-tier projects may be IPv6-only; if your
   network cannot reach it, use the transaction pooler (port 6543) — `db.py` already disables
   server-side prepared statements and uses `NullPool` for that port. Free-tier projects also
   pause when idle, so the first request after a pause may be slow.
2. Install and run:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # then edit DATABASE_URL with your real credentials
uvicorn app.main:app --reload      # http://localhost:8000
```

Tables are created automatically on first start (`SQLModel.metadata.create_all`) and demo data
is seeded if the `vendors` table is empty. No local SQLite file is used in normal operation.
For a production system you would replace `create_all` with Alembic migrations; that is out of
scope for this prototype.

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | Supabase placeholder (must be set) | SQLAlchemy/psycopg connection URI with `sslmode=require` |
| `POINTS_PER_RECEIPT` | `10` | Points awarded per valid receipt |
| `MIN_RECEIPT_AMOUNT` | `20` | Minimum receipt amount in ZMW |
| `DAILY_POINTS_CAP` | `50` | Max points earned per phone per Lusaka day |
| `TURNOVER_TAX_RATE` | `0.05` | **Placeholder** estimate rate pending finance |
| `ADMIN_TOKEN` | `dev-admin-token` | Value required in `X-Admin-Token` |
| `CORS_ORIGINS` | `*` | Comma-separated allowed origins (open for development) |

Never commit `.env`; it contains the database password.

## Contract

[`../contract/api-contract.md`](../contract/api-contract.md) is the single source of truth for
request/response shapes. Example JSON files live in `../contract/examples/`.

## curl examples

```bash
BASE=http://localhost:8000

# Health
curl $BASE/health

# Demo receipt IDs (deterministic — safe after resets)
curl $BASE/demo/receipts

# Verify a receipt (bare ID or a URL containing ?id=...)
curl -X POST $BASE/receipts/verify -H 'Content-Type: application/json' \
  -d '{"receipt_id":"RCP-DEMO-OK","phone":"0977000001"}'
curl -X POST $BASE/receipts/verify -H 'Content-Type: application/json' \
  -d '{"receipt_id":"http://localhost:5173/verify?id=RCP-DEMO-OK","phone":"0977000001"}'

# Balance and catalogue
curl "$BASE/rewards/balance?phone=0977000001"
curl $BASE/rewards/catalogue

# Redeem (costs 50 / 80 points)
curl -X POST $BASE/rewards/redeem -H 'Content-Type: application/json' \
  -d '{"phone":"0977000001","item_code":"AIRTIME_K5"}'

# Report a vendor with no receipt
curl -X POST $BASE/reports/no-receipt -H 'Content-Type: application/json' \
  -d '{"phone":"0977000001","area":"Lusaka","vendor_name":"Street vendor","note":"No QR"}'

# Merchant summary and ZRA hotspots
curl $BASE/merchant/SYN-TPIN-001/summary
curl $BASE/zra/hotspots

# USSD simulator (text is accumulated input joined by *)
curl -X POST $BASE/ussd -H 'Content-Type: application/json' \
  -d '{"session_id":"s1","phone":"0977000001","text":""}'
curl -X POST $BASE/ussd -H 'Content-Type: application/json' \
  -d '{"session_id":"s1","phone":"0977000001","text":"1*RCP-DEMO-OK"}'

# Reset demo data (destructive for this project's tables)
curl -X POST $BASE/admin/reset-demo -H 'X-Admin-Token: dev-admin-token'
```

## USSD flow

Stateless: the `text` field is the accumulated input joined by `*`. `end: true` finishes a
session; bad input re-prompts the current step.

| Input | Response |
|---|---|
| `""` | Main menu: verify / my points / redeem / report / merchant |
| `1` → `1*<id>` | `Enter receipt number:` → verification result |
| `2` | `Balance: <n> pts` |
| `3` → `3*1` / `3*2` | Catalogue → airtime K5 / data 100MB |
| `4` → `4*<area>` → `4*<area>*<vendor>` | Report flow; `0` skips the vendor name |
| `5` → `5*<tpin>` | Compact 7-day merchant summary |

## QR codes

```bash
python scripts/make_qr_codes.py
# optional: python scripts/make_qr_codes.py --out /tmp/qr
```

Writes 20 PNGs to `../demo/qr/` with payload
`http://localhost:5173/verify?id=<receipt_id>` (which exercises the `?id=` extraction rule),
plus `../demo/qr/receipt_ids.txt` containing the bare IDs for manual entry demos.

## Resetting demo data

`POST /admin/reset-demo` with the `X-Admin-Token` header drops and recreates **only this
project's SQLModel tables** and reseeds 10 vendors, 70 receipts and 15 reports. Receipt IDs and
TPINs are fixed, so printed QR codes and frontend fixtures stay valid after a reset.

## Tests

```bash
pytest -q
```

Tests use an in-memory SQLite database via a dependency override and never connect to
Supabase. Models are deliberately DB-agnostic (no Postgres-only types or DB-side `now()`).

## Assumptions

- "Points earned today" is the sum of positive `verify:` ledger entries on the Africa/Lusaka
  date; redeeming does not reduce it. Partial points are not awarded when the cap is near.
- `scans.receipt_id` is a plain string, not a foreign key, so not-found attempts can be logged.
- Single uvicorn worker; concurrent duplicate verifies are prevented by a conditional update.
- No Alembic, no Supabase Auth/Storage/Realtime and no `supabase-py` client in this prototype.
- Phone normalisation requires a Zambian mobile subscriber number starting with `9`
  (`09xxxxxxxx` locally); other 10-digit `0...` numbers are rejected as `invalid_phone`.
- `seed.py` at the backend root is a thin shim; the implementation lives in `app/seed.py`
  so all app modules can import it as `app.seed`.
- Dependency pins were chosen to provide binary wheels on Python 3.14 (the runtime used here);
  they remain compatible with Python 3.11+.
