<div align="center">

```
██╗   ██╗ █████╗ ██╗   ██╗██╗  ████████╗    ███████╗███████╗███╗   ██╗████████╗██╗███╗   ██╗███████╗██╗
██║   ██║██╔══██╗██║   ██║██║  ╚══██╔══╝    ██╔════╝██╔════╝████╗  ██║╚══██╔══╝██║████╗  ██║██╔════╝██║
██║   ██║███████║██║   ██║██║     ██║       ███████╗█████╗  ██╔██╗ ██║   ██║   ██║██╔██╗ ██║█████╗  ██║
╚██╗ ██╔╝██╔══██║██║   ██║██║     ██║       ╚════██║██╔══╝  ██║╚██╗██║   ██║   ██║██║╚██╗██║██╔══╝  ██║
 ╚████╔╝ ██║  ██║╚██████╔╝███████╗██║       ███████║███████╗██║ ╚████║   ██║   ██║██║ ╚████║███████╗███████╗
  ╚═══╝  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝       ╚══════╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝
```

### *Because every door in your bank deserves a guardian.*

**Zombie API Detection · Protection · Removal**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis)](https://redis.io)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)

**Team: Param · Riddhi · Siddhi · Ishant**

</div>

---

## What is Vault Sentinel?

Every bank in India has APIs it has forgotten about. Not deprecated. Not shut down. Just **forgotten** — running silently, unpatched, with no authentication and no owner. Hackers call these **Zombie APIs**. Right now, they know exactly where yours are.

Vault Sentinel is the only platform that asks a question no other API security tool asks:

> **"Should this API exist at all?"**

Every competitor secures APIs they already know about. We find the ones nobody knows about — and we eliminate them.

---

## Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   LAYER 1 — DETECT                                                      │
│   ─────────────────                                                     │
│   Discovers every API (documented or shadow)                            │
│   Assigns composite 0–100 Zombie Risk Score                             │
│   40% Traffic Analysis + 30% Static Analysis + 30% ML Model            │
│                                                                         │
│   LAYER 2 — DEFEND                                                      │
│   ─────────────────                                                     │
│   QuarantineMiddleware intercepts EVERY request                         │
│   Redis blocklist check → 403 returned in under 0.3 seconds            │
│   Gemini AI generates plain-English risk summaries for CISOs            │
│                                                                         │
│   LAYER 3 — REMOVE                                                      │
│   ─────────────────                                                     │
│   OWASP Top 10 Scanner — all 10 rules, async, per endpoint              │
│   Auto-Quarantine Engine — GHOST APIs blocked without human input       │
│   HoneyTrap System — zero false positives, guaranteed attacker capture  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Risk Classification

| Score | Class | What It Means | Automated Action |
|:---:|:---:|---|---|
| 0 – 30 | 🟢 **ACTIVE** | Healthy endpoint, regular traffic | Monitor · weekly scan |
| 31 – 60 | 🟡 **DORMANT** | Low traffic, getting stale | Email alert to security team |
| 61 – 85 | 🟠 **ZOMBIE** | Inactive, unowned, potentially dangerous | Slack alert + mandatory human review |
| 86 – 100 | 🔴 **GHOST** | Shadow API, no auth, critical risk | **Instant auto-quarantine** + incident report |

---

## Monorepo Structure

```
VaultSentinel/
│
├── app/                              ← Landing Page (Next.js 14)
├── components/                       ← Landing Page components
├── next.config.mjs                   ← Landing Page config
│
├── vault-sentinel-backend/           ← FastAPI Backend (Python 3.11)
│   ├── main.py                       ← App entry point + middleware
│   ├── config.py                     ← Single pydantic-settings source
│   ├── database.py                   ← SQLAlchemy engine
│   ├── auth/                         ← Two-token JWT system
│   ├── models/                       ← DB models + Pydantic schemas
│   ├── routers/                      ← 10 HTTP/WS routers
│   ├── services/                     ← All business logic
│   ├── middleware/                   ← QuarantineMiddleware
│   └── data/                         ← Seed, faker, victim server
│
├── vault-sentinel-dashboard/         ← React 18 Dashboard (TypeScript)
│   └── src/
│       ├── pages/                    ← 8 security dashboard pages
│       ├── components/               ← Sidebar, TopBar, ScoreRing
│       ├── api/                      ← Typed API client (Axios)
│       └── context/                  ← Auth state (JWT)
│
└── docker-compose.yml
```

---

## How The Landing Page Works

The landing page (`app/`) is a **public-facing Next.js 14 site**. It has one job: present Vault Sentinel to prospective bank clients and capture demo requests.

### What's on it
- Hero section with the tagline and "Book a Demo" CTA
- Feature sections explaining the three-layer architecture
- Risk classification explainer
- Demo request form (Name · Bank · Email · Phone · API count estimate)

### What's NOT on it
**There is no login link anywhere on the landing page.** No login button in the navbar. No login link in the footer. No "Sign In" anywhere. This is intentional.

```
Landing Page → "Book a Demo" → Form submits to POST /demo/book
                                        ↓
                             Vault Sentinel team receives notification
                                        ↓
                             Google Meet scheduled with the bank
                                        ↓
                             Admin runs seed.py → two emails sent
                                        ↓
                             Email 1: Private dashboard link (JWT token in URL)
                             Email 2: Password only (separate email)
                                        ↓
                             Dashboard accessible ONLY via that link
```

### Why no public login page?
A login page anyone can find can be brute-forced. A link known only to the client cannot. This mirrors how serious banking SaaS products onboard clients.

---

## How The Auth System Works

Vault Sentinel uses a **two-token architecture**. Most systems have one token. We use two, each with a completely different purpose.

### Token 1 — Link Token (`lt`)
```
Created when:  Admin provisions a new client account
Lives in:      Email 1 URL as ?lt=eyJhbGc...
Purpose:       Proves this person received our private email
               Unlocks the login form
               NOT a session — cannot authenticate API calls
Expires:       Never (access revoked by deleting the account)
```

### Token 2 — Session JWT
```
Created when:  Successful password login
Lives in:      httpOnly cookie + Authorization: Bearer header
Purpose:       Authenticates every single API request
               Contains client_id, bank_name, email, role
Expires:       7 days
```

### Full Login Flow

```
Step 1   Admin calls POST /admin/clients
         { bank_name, email, password }

Step 2   Backend hashes password with bcrypt
         Generates Link Token (JWT, no expiry)

Step 3   Email 1 sent → https://dashboard/login?lt=eyJhbGc...
         Email 2 sent → Password only, no link

Step 4   Client clicks Email 1 link
         Browser opens /login?lt=eyJhbGc...
         React reads the ?lt= param

Step 5   Frontend calls GET /auth/verify-link-token?lt=...
         Backend decodes token → returns { email, bank_name, valid: true }
         Email field pre-filled and LOCKED (read-only)
         Password field shown

Step 6   Client types password from Email 2
         Frontend calls POST /auth/login { email, password, link_token }

Step 7   Backend verifies BOTH:
         ✓ Link token is valid and matches email
         ✓ bcrypt.verify(password, hashed_password)

Step 8   Session JWT created → httpOnly cookie set
         Dashboard loads — bank name shown in top bar

Step 9   Every subsequent request carries Session JWT
         get_current_user() Depends() validates on every route
```

### What users see at /login

| Scenario | What renders |
|---|---|
| `/login?lt=valid_token` | Email pre-filled (locked) + password input |
| `/login` (no token) | "Access requires a private link. Contact your account manager." — no form |
| `/login?lt=tampered` | "This link is invalid or revoked." — no form |
| Any dashboard page, no session | Redirect to /login → no-access message |

---

## How The Backend Works

### Request Lifecycle

```
Incoming Request
      │
      ▼
QuarantineMiddleware          ← Runs FIRST, before everything
  └─ Check Redis blocklist    ← O(1) lookup
  └─ If blocked → 403 in <0.3s (endpoint is dead)
  └─ If clear → continue
      │
      ▼
Auth (Depends injection)
  └─ get_current_user()
  └─ Decode Session JWT
  └─ Inject user dict into route handler
      │
      ▼
Router                        ← HTTP only, no business logic
  └─ Validate Pydantic input
  └─ Call exactly one service function
      │
      ▼
Service                       ← All business logic lives here
  └─ Query PostgreSQL
  └─ Call Redis
  └─ Call external APIs
  └─ Return result
      │
      ▼
Response                      ← Pydantic serialization → JSON
```

### Design Rules (strictly enforced)

| Rule | How it's applied |
|---|---|
| Router → Service → DB | Routers call one service. Services access DB. Never mixed. |
| Single config source | `config.py` via pydantic-settings. Zero `os.getenv()` elsewhere. |
| One file, one job | `scorer.py` scores. `email_svc.py` sends emails. Never mixed. |
| Models strictly separated | `db_models.py` = SQLAlchemy only. `schemas.py` = Pydantic only. |
| Auth via Depends() | `get_current_user()` is always injected — never manually checked. |
| Middleware for cross-cutting | QuarantineMiddleware fires on every request, guaranteed. |

---

## How The Hybrid Scoring Engine Works

Every discovered API gets a **composite risk score from 0 to 100**, calculated from three independent analyzers.

```
┌──────────────────────────────────────────────────────┐
│              COMPOSITE SCORE (0–100)                  │
│                                                        │
│   Traffic Analysis   ████████████████  40%            │
│   Static Analysis    ████████████      30%            │
│   ML Model           ████████████      30%            │
│                                                        │
│   Final = (traffic × 0.40) + (static × 0.30)          │
│          + (ml × 0.30)                                 │
│                                                        │
│   Resurrection bonus: +25 if dormant API suddenly     │
│   receives traffic (Isolation Forest detects this)    │
└──────────────────────────────────────────────────────┘
```

### Traffic Analyzer (40%)

Measures how the API is actually used:

| Signal | Weight | Logic |
|---|---|---|
| **Recency** | 0–50 pts | 180+ days inactive → max score |
| **Volume** | 0–30 pts | 0 calls in 30 days → max score |
| **Consistency** | 0–20 pts | 0 unique callers → max score |

### Static Analyzer (30%)

Measures what we know about the endpoint without calling it:

| Signal | Weight | Logic |
|---|---|---|
| **Auth type** | 0–35 pts | `none`=35, `basic`=20, `api_key`=15, `jwt`=5, `oauth`=0 |
| **Documentation** | 0–25 pts | Not in OpenAPI spec → 25 pts |
| **Owner team** | 0–20 pts | No owner assigned → 20 pts |
| **CVE count** | 0–15 pts | 5+ CVEs → 15 pts |
| **HTTP method** | 0–5 pts | DELETE/PATCH → 5 pts |

### ML Model (30%) — with safe fallback chain

```
Try 1 → Local HTTP backend (localhost:8001/predict)
            ↓ fails or unavailable
Try 2 → Gemini AI generative scoring
            ↓ no API key or fails
Try 3 → Fallback: 0.5 (neutral score — pipeline NEVER breaks)
```

The ML backend is also exposed as a proper API endpoint:
- `POST /ml/predict` — score a single endpoint
- `POST /ml/ingest` — record a traffic event for training

---

## How The Cybersecurity Tools Work

### 1. OWASP Top 10 Scanner

All 10 OWASP API Security rules run **concurrently** via `asyncio.gather()` — not sequentially. Each returns `PASS`, `FAIL`, or `WARN`.

```python
rules = await asyncio.gather(
    _rule_api1_broken_auth(endpoint),
    _rule_api2_broken_authn(endpoint),
    _rule_api3_broken_object_property(endpoint),
    _rule_api4_unrestricted_resource(endpoint),
    _rule_api5_broken_func_auth(endpoint),
    _rule_api6_unrestricted_access_sensitive(endpoint),
    _rule_api7_ssrf(endpoint),
    _rule_api8_security_misconfiguration(endpoint),
    _rule_api9_improper_inventory(endpoint),
    _rule_api10_unsafe_api_consumption(endpoint),
)
```

### 2. Auto-Quarantine Engine

```
GHOST API detected (score ≥ 86)
        │
        ▼
quarantine_svc.block_endpoint()
  └─ Redis HSET vault_sentinel:quarantine {method}:{path} → metadata
        │
        ▼
Every future request to this endpoint:
  └─ QuarantineMiddleware checks Redis HEXISTS
  └─ Match found → return 403 in < 0.3 seconds
  └─ Response headers include X-Vault-Sentinel: quarantined
```

Human operators can also manually quarantine via the dashboard slider (set threshold from 50–100).

### 3. HoneyTrap System

Decoy endpoints are deployed with paths that look like real banking APIs:

```
/api/v0/admin/export-all
/api/internal/debug/users
/api/legacy/account-dump
/api/v0/kyc/bulk-download
/api/internal/master-key
...
```

These paths appear **nowhere** in any documentation, SDK, or OpenAPI spec. No legitimate system has any reason to call them. Therefore:

```
Any request received = mathematically guaranteed malicious
False positive rate  = 0% (by definition, not by measurement)
```

When an attacker hits a decoy:
1. Their IP, headers, user-agent, and payload are logged
2. A convincing fake response is returned (keeps them engaged)
3. The alert is pushed via Redis pub/sub → WebSocket → dashboard

### 4. Attack Simulator

A live 5-stage attack simulation against the victim server (`localhost:8001`), streamed in real time via Server-Sent Events:

```
Stage 1 — Reconnaissance         Scans for zombie endpoints
Stage 2 — Auth Bypass             Attempts unauthenticated access
Stage 3 — Data Extraction         Pulls fake sensitive records
Stage 4 — Lateral Movement        Uses extracted tokens on adjacent services
Stage 5 — Exfiltration            Transmits data to attacker

If endpoint is quarantined → Vault Sentinel blocks at that stage
                           → "0 records leaked"
If endpoint is NOT quarantined → Attack succeeds
                               → "24,000 records exfiltrated"
```

---

## How The Dashboard Works

The dashboard is a **private React SPA** — it cannot be accessed without the seed-generated URL.

### 8 Pages

| Page | What it shows |
|---|---|
| **Overview** | Stats bar · risk distribution chart · live alert feed · full API risk table |
| **API Registry** | Every discovered endpoint · filters · score breakdown · CVE list · Gemini AI summary |
| **OWASP Scanner** | All 10 rules per API · aggregate view across entire inventory · per-rule pass/fail/warn counts |
| **Quarantine** | Threshold slider (50–100) · active blocked endpoints · one-click unblock |
| **HoneyTrap** | Active decoy list · real-time attacker hit log · zero-false-positive explainer |
| **Simulation** | Target selector · 5-stage progress tracker · damage meter · Vault Sentinel intercept moment |
| **Compliance** | RBI IT Framework 2021 · PCI-DSS 4.0 coverage bars · one-click PDF download |
| **Alerts** | WebSocket live feed · stored alert history · unread count · mark-all-read |

### Real-time Alerts

```
Backend detects GHOST/ZOMBIE API
        │
        ▼
Alert saved to PostgreSQL
        │
        ▼
Redis PUBLISH vault_sentinel:alerts:{client_id}
        │
        ▼
WebSocket /alerts/ws (authenticated with Session JWT)
        │
        ▼
React receives message → alert appears in feed instantly
```

---

## All API Endpoints

### Auth
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/auth/verify-link-token?lt=` | None | Validate link token from email URL |
| `POST` | `/auth/login` | Link Token | Login with link token + password |
| `GET` | `/auth/me` | Session JWT | Get current user |
| `POST` | `/auth/logout` | Session JWT | Clear session cookie |

### API Discovery & Scoring
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/apis` | Session JWT | List all endpoints (filter by risk, search) |
| `GET` | `/apis/stats` | Session JWT | Dashboard summary counts |
| `POST` | `/apis/scan` | Session JWT | Full discovery + scoring pipeline |
| `GET` | `/apis/{id}` | Session JWT | Single endpoint detail |
| `GET` | `/apis/{id}/explain` | Session JWT | Gemini AI risk summary |
| `PATCH` | `/apis/{id}` | Session JWT | Update owner/auth/documented |

### Cybersecurity Tools
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/quarantine` | Session JWT | List quarantined endpoints |
| `POST` | `/quarantine` | Session JWT | Block an endpoint |
| `DELETE` | `/quarantine/{id}` | Session JWT | Unblock an endpoint |
| `POST` | `/honeypot/deploy-defaults` | Session JWT | Deploy banking decoy endpoints |
| `GET` | `/honeypot/active` | Session JWT | List active decoys |
| `GET` | `/honeypot/hits` | Session JWT | Attacker capture log |
| `POST` | `/simulation/start` | Session JWT | Launch SSE attack simulation |

### Alerts & Reports
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `WS` | `/alerts/ws` | JWT in first message | Real-time WebSocket alert stream |
| `GET` | `/alerts` | Session JWT | Stored alert history |
| `PATCH` | `/alerts/{id}/read` | Session JWT | Mark alert as read |
| `GET` | `/reports/compliance` | Session JWT | JSON compliance summary |
| `GET` | `/reports/rbi` | Session JWT | Download RBI IT Framework PDF |
| `GET` | `/reports/pci` | Session JWT | Download PCI-DSS 4.0 PDF |

### ML
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/ml/predict` | None | Score a single endpoint |
| `POST` | `/ml/ingest` | None | Ingest a traffic event |

### Admin & Demo
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/admin/clients` | None* | Create client + send both emails |
| `POST` | `/admin/clients/{id}/resend` | None* | Resend access link |
| `POST` | `/demo/book` | None | Book a demo request |

*Protect with VPN or internal network in production.

---

## Tech Stack

### Landing Page

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14 | SSR framework, file-based routing |
| TypeScript | 5.x | Type safety |
| TailwindCSS | 3.x | Utility-first styling |
| Framer Motion | 10.x | Animations and scroll reveals |

### Dashboard

| Technology | Version | Purpose |
|---|---|---|
| React | 18 | Component-based SPA |
| TypeScript | 5.x | Type safety |
| TailwindCSS | 3.x | Styling |
| Recharts | 2.x | Risk score and compliance charts |
| D3.js | 7.x | Network topology graph |
| Socket.io Client | 4.x | WebSocket real-time alerts |
| React Query | 5.x | Data fetching and caching |
| Axios | 1.x | HTTP client with JWT injection |

### Backend

| Technology | Purpose |
|---|---|
| Python 3.11 | Primary backend language |
| FastAPI 0.104 | REST + WebSocket + SSE framework |
| pydantic-settings | Centralised config from .env |
| SQLAlchemy 2.x | ORM for PostgreSQL |
| Pandas 2.x | API gateway log parsing |
| python-jose | JWT creation and verification |
| passlib + bcrypt | Password hashing |
| httpx | Async HTTP for simulation |
| sse-starlette | Server-Sent Events stream |
| reportlab | RBI/PCI-DSS PDF generation |

### Database & Infrastructure

| Technology | Purpose |
|---|---|
| PostgreSQL 16 | Primary DB — API inventory, alerts, clients |
| Redis 7 | Quarantine blocklist · alert pub/sub · CVE cache |

### ML / AI

| Technology | Purpose | Cost |
|---|---|---|
| scikit-learn | Isolation Forest anomaly detection | Free |
| SHAP | Explainable AI score breakdown | Free |
| Google Gemini API | Plain-English risk summaries | Free tier |
| NVD CVE API | Real-time vulnerability lookup | Free |

---

## Local Setup (Windows)

### Prerequisites

```
Python 3.11+       python --version
Node.js 18+        node --version
PostgreSQL 16      psql --version
Redis / Memurai    (Memurai runs as Windows service)
```

### Step 1 — Create the database

```cmd
psql -U postgres -c "CREATE DATABASE vault_sentinel;"
```

### Step 2 — Backend (Terminal 1)

```cmd
cd vault-sentinel-backend

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Wait for: `Application startup complete.`

### Step 3 — Victim Server (Terminal 2)

```cmd
cd vault-sentinel-backend
venv\Scripts\activate
python data/victim_server.py
```

This runs the deliberately vulnerable sandbox on `:8001` — used as the attack target in the simulation demo.

### Step 4 — Dashboard (Terminal 3)

```cmd
cd vault-sentinel-dashboard
npm install
npm run dev
```

Wait for: `Local: http://localhost:5173/`

### Step 5 — Seed the demo account (Terminal 1)

```cmd
python data/seed.py
```

You will see:

```
════════════════════════════════════════════════════════════
  ⬡  VAULT SENTINEL — DEMO ACCOUNT READY
════════════════════════════════════════════════════════════

  Bank    : SBI Demo Bank
  Email   : demo@vaultsentinel.com
  Password: Hackathon@2026

  ┌─ DASHBOARD ACCESS URL (the ONLY way in) ──────────────
  │
  │  http://localhost:5173/login?lt=eyJhbGciOiJIUzI1NiIs...
  │
  └────────────────────────────────────────────────────────

  Copy that URL into your browser.
  Navigating to localhost:5173 directly will show LOCKED.
════════════════════════════════════════════════════════════
```

**Copy the full URL → paste in browser → enter password → dashboard opens.**

> ⚠️ Navigating to `localhost:5173` or `localhost:5173/login` without the `?lt=` token shows the locked screen. This is intentional.

### Step 6 — Run your first scan

Once inside the dashboard, click **"Run Full Scan"** on the Overview page. Vault Sentinel will:

1. Parse the 10,000 pre-generated gateway logs
2. Cross-reference against the OpenAPI spec (40% gap = zombie APIs)
3. Score every endpoint with the hybrid engine
4. Run all 10 OWASP rules
5. Auto-quarantine GHOST APIs
6. Push alerts to your WebSocket feed

---

## Docker Setup

```cmd
docker-compose up --build -d

REM Seed the demo account
docker-compose exec backend python data/seed.py

REM Dashboard (always run locally for hot-reload)
cd vault-sentinel-dashboard
npm install && npm run dev
```

| Service | Port | Notes |
|---|---|---|
| Backend (FastAPI) | 8000 | All API routes |
| Victim Server | 8001 | Simulation target |
| PostgreSQL | 5432 | Internal |
| Redis | 6379 | Internal |
| Dashboard | 5173 | Run locally |

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/vault_sentinel

# Redis
REDIS_URL=redis://localhost:6379

# JWT — change this in production
JWT_SECRET_KEY=your-minimum-32-character-secret-key

# Gemini AI (optional — fallback works without it)
GEMINI_API_KEY=

# Email (optional — seed.py prints URL to console without it)
SMTP_USER=
SMTP_PASSWORD=

# URLs
DASHBOARD_BASE_URL=http://localhost:5173
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]
```

---

## Compliance Coverage

Vault Sentinel maps every finding to four regulatory frameworks out of the box:

| Framework | Controls Mapped | PDF Report |
|---|---|---|
| RBI IT Framework 2021 | 8 controls | ✅ One click |
| PCI-DSS 4.0 | 6 controls | ✅ One click |
| DPDP Act 2023 | 5 controls | Dashboard view |
| OWASP API Top 10 | 10 rules | Dashboard view |

---

## Key Differentiators

| Feature | Vault Sentinel | Salt Security | 42Crunch |
|---|---|---|---|
| Zombie API detection | ✅ Core feature | ❌ | ❌ |
| Questions if API should exist | ✅ | ❌ | ❌ |
| Sub-0.3s quarantine | ✅ Redis middleware | ❌ | ❌ |
| Zero false positive honeypot | ✅ Mathematical guarantee | ❌ | ❌ |
| OWASP + Quarantine + Honeypot | ✅ All three, one platform | Partial | Partial |
| RBI + PCI-DSS built-in | ✅ Indian banking native | ❌ | ❌ |
| Gemini AI CISO summaries | ✅ | ❌ | ❌ |
| Price | Lakhs/month | Crores/year | Crores/year |

---

<div align="center">

**⬡ VAULT SENTINEL**

Param · Riddhi · Siddhi · Ishant

*Because every door in your bank deserves a guardian.*

</div>
