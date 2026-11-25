# Risiti Loop API Contract

Single source of truth shared by backend and frontend. All request/response bodies are JSON.
Base URL for local development: `http://localhost:8000`.

## Global conventions

- **Errors** always use `{"error": {"code": "...", "message": "..."}}`.
  Codes: `invalid_phone` (400), `invalid_receipt_id` (400), `vendor_not_found` (404),
  `invalid_admin_token` (401), `validation_error` (422), `not_found` (404), `internal_error` (500).
- **Phones** are normalised to `+260XXXXXXXXX`. Accepted inputs: `09xxxxxxxx`, `260xxxxxxxxx`,
  `+260xxxxxxxxx`, where the 9-digit subscriber number starts with `9`. Anything else is a
  400 `invalid_phone`.
- **Receipt IDs** may be bare (`RCP-DEMO-OK`) or a URL containing `?id=...`; the first `id`
  query value is extracted.
- **`simulated: true`** is present in every verify and redeem response, for all statuses.
- Money is a JSON number rounded to 2 decimals. Dates are ISO-8601 UTC (`...Z`).
- "Today" means the Africa/Lusaka calendar date.
- No phone numbers are returned by merchant or hotspot endpoints.

## Endpoints

### POST /receipts/verify
Request: `{"receipt_id": "RCP-DEMO-OK", "phone": "0977000001"}`
Response 200:
```json
{"status":"valid","vendor_name":"Synthetic Traders Lusaka","amount_band":"K50-K100","points_awarded":10,"balance":10,"message":"Receipt verified! +10 points earned.","simulated":true}
```
`status` is one of `valid | invalid | used | below_minimum | cap_reached`. For non-valid statuses
`points_awarded` is 0 and `message` is one of:
- `invalid`: "Receipt not found in the simulated ZRA register."
- `used`: "This receipt has already been verified."
- `below_minimum`: "Receipt amount is below the K20 minimum."
- `cap_reached`: "Daily points cap reached. Try again tomorrow."

`vendor_name` and `amount_band` are `null` only when no receipt matched.
Bands: `Below K20` (<20), `K20-K50` (20-49.99), `K50-K100`, `K100-K200`, `K200+`.

### GET /rewards/balance?phone=+260977000001
```json
{"phone":"+260977000001","points":10,"history":[{"id":1,"change":10,"reason":"verify:RCP-DEMO-OK","created_at":"2026-11-25T10:00:00Z"}]}
```
Unknown phone returns 200 with `points: 0`, `history: []`.

### GET /rewards/catalogue
```json
[{"code":"AIRTIME_K5","name":"Zamtel airtime K5","cost_points":50,"type":"airtime"},{"code":"DATA_100MB","name":"Zamtel data 100MB","cost_points":80,"type":"data"}]
```

### POST /rewards/redeem
Request: `{"phone":"0977000001","item_code":"AIRTIME_K5"}`
Response: `{"status":"ok","new_balance":0,"item":"AIRTIME_K5","simulated":true}`
`status` is `ok | insufficient_points | unknown_item`; `item` echoes the submitted code.

### POST /reports/no-receipt
Request: `{"phone":"0977000001","area":"Lusaka","vendor_name":"Street vendor","note":"No QR"}`
Response: `{"report_id":1}`. Unknown areas are stored with null coordinates.

### GET /merchant/SYN-TPIN-001/summary
```json
{"vendor_name":"Synthetic Traders Lusaka","verified_count":3,"verified_total":500.0,"estimated_tax_due":25.0,"tax_rate_note":"Estimate only — rate is a placeholder pending finance confirmation.","last_7_days":[{"date":"2026-11-19","count":0,"total":0.0}]}
```
`last_7_days` always has 7 rows including zero-sale days. Unknown TPIN → 404 `vendor_not_found`.

### GET /zra/hotspots
```json
[{"area":"Lusaka","report_count":5,"lat":-15.3875,"lng":28.3228}]
```
Sorted by `report_count` desc then `area` asc. Unknown areas return `lat: null, lng: null`.

### POST /ussd
Request: `{"session_id":"s1","phone":"0977000001","text":""}`
Response: `{"response_text":"Risiti Loop\n1 Verify receipt\n2 My points\n3 Redeem\n4 Report no receipt\n5 Merchant sales","end":false}`

Flow (stateless, derived from `text` joined by `*`):
| text | response | end |
|---|---|---|
| `""` | main menu (above) | false |
| `1` | `Enter receipt number:` | false |
| `1*<id>` | verify result, e.g. `Verified +10 pts. Bal 40.` | true |
| `2` | `Balance: 40 pts` | true |
| `3` | `1 Airtime K5 (50pt)\n2 Data 100MB (80pt)\nReply 3*1 or 3*2` | false |
| `3*1` / `3*2` | redeem result | true |
| `4` | `Enter area:` | false |
| `4*<area>` | `Vendor name (0 to skip):` | false |
| `4*<area>*<vendor>` | `Report saved.` (`0` → null vendor) | true |
| `5` | `Enter TPIN:` | false |
| `5*<tpin>` | `7d sales K5,200. Est tax K260.` | true |

Bad input re-prompts the current step with `end: false`. Responses stay under ~160 chars.

### GET /health
`{"status":"ok"}`

### GET /demo/receipts
`{"valid":["RCP-DEMO-OK"],"already_used":["RCP-DEMO-USED"],"below_minimum":["RCP-DEMO-LOW"]}`

### POST /admin/reset-demo
Header `X-Admin-Token: dev-admin-token`. Response:
`{"status":"ok","vendors":10,"receipts":70,"reports":15}`
