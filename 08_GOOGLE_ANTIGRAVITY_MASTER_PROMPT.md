# 08 --- Google Antigravity Master Build Prompt

You are the senior product engineer and full-stack architect responsible
for building **XYZ**, an AI-powered social media management SaaS.

Read every document in this documentation pack before coding: -
01_PRODUCT_REQUIREMENTS.md - 02_TECHNICAL_ARCHITECTURE.md -
03_DATABASE_SCHEMA.sql - 04_API_SPECIFICATION.md -
05_AI_PROVIDER_GATEWAY.md - 06_UI_UX_SPECIFICATION.md -
07_DEVELOPMENT_ROADMAP_AND_QA.md

These files are the source of truth. If a requirement is ambiguous,
document the assumption and ask before making a product-level decision.
Keep the product name XYZ until explicitly changed.

## Product goal

Build a professional web app where a user creates a workspace and brand,
supplies brand knowledge and visual references, and uses AI to create
original, editable static social media posts and multi-slide carousels.
The user can manage drafts, a calendar, official social connections,
publishing and analytics.

## Mandatory scope boundaries

-   V1 supports static images and carousels only.
-   Do not build video generation, reels editing, video processing or
    FFmpeg functionality.
-   Do not build fake engagement automation (likes, follows, comments,
    DMs).
-   Do not scrape restricted content or bypass platform access controls.
-   Use official OAuth and platform APIs for social integration.
-   Never request or store social account passwords.
-   Do not execute arbitrary AI-generated code.

## Required stack

Frontend: - React + Vite + JavaScript. - Tailwind CSS and shadcn/ui. -
React Router. - Zustand. - TanStack Query. - React Hook Form + Zod. -
Fabric.js or Konva for canvas editor; evaluate and choose one. -
Recharts for analytics.

Backend: - Python + FastAPI. - Pydantic. - SQLAlchemy 2.x and Alembic. -
Supabase PostgreSQL and pgvector. - Supabase Auth and Storage. -
Pillow/OpenCV. - Playwright for rendering. - Durable job processing with
a worker process.

## Core architectural requirements

1.  Modular monolith, not microservices.
2.  Tenant/workspace isolation from the beginning.
3.  Backend authorization on every protected operation.
4.  PostgreSQL is source of truth; object storage holds files.
5.  AI gateway is independent from creative engine.
6.  Capability-aware AI routing and explicit fallback configuration.
7.  Versioned, schema-validated Design Blueprint JSON.
8.  Controlled renderer with an allowlisted component registry.
9.  Long tasks run asynchronously and return job IDs.
10. Publishing is durable, idempotent and only after explicit approval.
11. Secrets are encrypted and never returned to frontend.
12. Add migrations, tests, setup docs and `.env.example`.

## Implementation process

Do not attempt to generate the entire application in one unverified
pass.

### First: inspect and plan

-   Inspect the existing repository before changing it.
-   Identify existing code and preserve useful work.
-   Create an implementation plan mapped to the milestones.
-   Identify missing credentials and external dependencies.
-   Do not overwrite files without understanding their purpose.

### Then build milestone by milestone

Milestone 0: repository, frontend/backend scaffolding, health checks,
environment setup. Milestone 1: Supabase Auth, workspaces, membership,
roles, RLS and authorization. Milestone 2: Brand Studio and structured
brand knowledge. Milestone 3: Reference upload, processing jobs, OCR and
visual analysis. Milestone 4: Visual DNA and design archetypes.
Milestone 5: AI Gateway, provider adapters, capability registry,
fallback and usage tracking. Milestone 6: Design Blueprint schema and
controlled renderer. Milestone 7: AI Studio, static posts, carousels,
editor and exports. Milestone 8: content calendar, official social OAuth
and publishing worker. Milestone 9: analytics, security hardening and
production readiness.

After each milestone: - Run frontend and backend. - Run tests and fix
failures. - Verify the main user journey in browser. - Update README and
implementation status. - Report files changed, migrations, commands,
environment variables and remaining limitations. - Keep the app in a
working state.

## UI requirements

Build a premium, clean, responsive SaaS interface with a left navigation
sidebar, workspace switcher, clear page hierarchy, consistent design
tokens, useful empty/loading/error states and accessible controls.

Navigation: Overview, Brands, Reference Studio, Visual DNA, AI Studio,
Creative Library, Content Calendar, Publishing, Social Accounts,
Analytics, AI Control Center, Settings.

Do not create decorative dead buttons. Every visible control must work
or be clearly marked as coming soon.

## AI Gateway requirements

Start with provider adapters for the providers selected in
configuration. The gateway must: - classify task type, - check required
capabilities, - choose configured workspace provider/model, - enforce
cost/usage limits, - handle
auth/quota/rate-limit/outage/timeout/invalid-output errors distinctly, -
perform bounded fallback only to explicitly configured compatible
providers, - record usage, latency, model and fallback reason, - never
expose keys in the browser or logs.

A text-only model must never be used as a vision or image-generation
fallback.

## Creative engine requirements

AI outputs JSON validated by Pydantic. Renderer uses controlled
components for text, image, shape, logo and background. Provide editor
operations for moving, resizing, changing typography, replacing images,
changing colours, layer ordering, undo/redo, slide reordering and
export.

## Social integration requirements

Implement only against current official platform documentation. Meta API
requirements and permissions can change; verify account eligibility,
login flow, scopes, app review and publishing formats before coding. If
credentials or app approval are unavailable, build a clearly labelled
integration setup screen and mocked test adapter. Never claim a mock
post was published.

## Security requirements

-   Use workspace-aware authorization and RLS.
-   Test cross-workspace access denial.
-   Encrypt provider and social tokens at rest.
-   Keep service-role keys server-side only.
-   Validate file content and size.
-   Protect OAuth state.
-   Restrict CORS.
-   Prevent SSRF in URL ingestion.
-   Rate-limit expensive endpoints.
-   Add audit logs.
-   Do not log secrets.

## Quality bar

The app must be genuinely functional, not just a Figma-like mockup.
Prioritize a complete end-to-end path: sign up → create workspace →
create brand → add brand knowledge → upload references → review Visual
DNA → generate post → edit → export.

Do not start with analytics or advanced publishing before this core path
works.

## Initial response expected from you

Before making changes, inspect the repository and return: 1. Existing
project structure and stack. 2. A milestone implementation plan. 3.
Required credentials and services. 4. Any conflicts between existing
code and this specification.

Then begin Milestone 0 and continue in small verified increments. Do not
ask the user to make decisions that can safely remain configurable. Do
ask before irreversible changes or scope changes.
