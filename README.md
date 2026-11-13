# XYZ — AI-Powered Social Media Management SaaS

**XYZ** is a professional, modular SaaS platform engineered for brands to turn brand knowledge and visual references into original, editable multi-slide carousels and static social media posts through structured **Design Blueprints**, published via official platform APIs.

---

## Architecture Overview

```text
XYZ_PRD_Documentation/
├── frontend/                     # React + Vite + Tailwind CSS + Lucide Icons
│   ├── src/
│   │   ├── components/layout/    # AppLayout, Sidebar, Navbar
│   │   ├── components/ui/        # Reusable Button, Card, Badge, Modal
│   │   ├── pages/                # All 14 PRD SaaS Modules
│   │   │   ├── HeroPage.jsx      # Clean Hero with hover-reveal taskbar
│   │   │   ├── OverviewPage.jsx  # Dashboard & onboarding checklist
│   │   │   ├── BrandsPage.jsx    # Brand Studio & structured knowledge
│   │   │   ├── ReferenceStudioPage.jsx # OCR & visual benchmark extraction
│   │   │   ├── VisualDNAPage.jsx # Inferred design rules & typography scale
│   │   │   ├── AIStudioPage.jsx  # Multi-slide carousel generator
│   │   │   ├── CreativeEditorPage.jsx # Canvas editor with layers tree
│   │   │   ├── CreativeLibraryPage.jsx # Filterable asset gallery
│   │   │   ├── ContentCalendarPage.jsx # Scheduling grid with timezones
│   │   │   ├── PublishingPage.jsx # Durable queue & pause controls
│   │   │   ├── SocialAccountsPage.jsx # Official OAuth connections
│   │   │   ├── AnalyticsPage.jsx # Performance metrics & leaderboard
│   │   │   ├── AIControlCenterPage.jsx # Capability routing & keys
│   │   │   └── SettingsPage.jsx  # Workspace RBAC & team management
│   │   ├── services/api.js       # Full-stack API client
│   │   └── data/mockData.js      # Initial seed & fallback data
│   └── vite.config.js            # Reverse proxy `/api` -> `localhost:8000`
│
├── backend/                      # Python + FastAPI + SQLAlchemy
│   ├── app/
│   │   ├── main.py               # Application entry point & CORS
│   │   ├── config.py             # Environment settings
│   │   ├── database.py           # Dual SQLite/PostgreSQL engine
│   │   ├── models/               # SQLAlchemy ORM models
│   │   ├── schemas/              # Pydantic request/response validation
│   │   ├── services/             # AI Gateway & Blueprint Engine
│   │   ├── routers/              # 12 REST API modules under `/api/v1`
│   │   └── workers/              # Durable publishing queue worker
│   ├── tests/                    # Automated regression test suite
│   ├── run.py                    # Uvicorn launcher
│   └── .env.example              # Environment configuration template
```

---

## Live Development Servers

When running locally, both services operate simultaneously:

| Service | Port | Local URL |
| :--- | :--- | :--- |
| **Frontend Webapp** | `5173` | [http://localhost:5173/](http://localhost:5173/) |
| **Backend REST API** | `8000` | [http://localhost:8000/](http://localhost:8000/) |
| **Interactive API Docs** | `8000` | [http://localhost:8000/docs](http://localhost:8000/docs) |

---

## Running the Project

### 1. Start the Frontend
```powershell
cd frontend
npm install
npm run dev
```

### 2. Start the Backend API
```powershell
cd backend
python -m pip install -r requirements.txt
python run.py
```

### 3. Run the Automated Test Suite
```powershell
cd backend
python tests/run_all_tests.py
```

### 4. Run the Durable Publishing Worker
```powershell
cd backend
python app/workers/publishing_worker.py --run-once
```

---

## Design System & Security Principles

1. **Design System:** White color theme (`#ffffff` surfaces, `#f8fafc` canvas, `#e2e8f0` subtle borders, and `#0f172a` charcoal text). Smoother buttons with soft borders and active scaling (`active:scale-[0.98]`).
2. **Hero Interaction:** Minimal top taskbar that smoothly reveals action buttons and navigation links upon hover.
3. **No Arbitrary Code Execution:** The AI synthesizes structured **Design Blueprint JSON** validated against strict Pydantic schemas, rendered exclusively through controlled component registries.
4. **Official OAuth Integration:** Only official platform APIs (Meta Graph API, LinkedIn V2, X v2 API) are used. User passwords are never requested or stored.
5. **Server-Side Secret Isolation:** AI provider keys and social tokens are encrypted at rest and never exposed to the client bro