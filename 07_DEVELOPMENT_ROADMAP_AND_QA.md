# 07 --- Development Roadmap and Quality Assurance

## 1. Build sequence

### Milestone 0 --- Repository and foundation

Deliver: - Monorepo or clearly separated frontend/backend directories. -
Frontend and backend run locally. - Environment configuration and
`.env.example`. - Health endpoint. - Linting, formatting and basic
tests. - README with setup instructions.

Exit criteria: - Fresh clone can run using documented commands. - No
secrets committed. - Frontend and backend health checks work.

### Milestone 1 --- Authentication and workspace

Deliver: - Supabase Auth integration. - Protected routes. - Workspace
creation and switcher. - Membership and roles. - RLS and backend
authorization tests.

Exit criteria: - Two test users cannot read each other's workspace
data. - Unauthorized role actions return 403.

### Milestone 2 --- Brand Studio

Deliver: - Brand CRUD. - Structured knowledge forms. - Brand asset
upload. - Brand profile view.

Exit criteria: - Brand records persist and reload. - Validation and
permissions work.

### Milestone 3 --- Reference Studio

Deliver: - Secure upload flow. - Reference list/detail. - Processing job
state. - OCR and visual analysis adapter. - Retry and deletion.

Exit criteria: - Upload is validated. - Failed analysis can be
retried. - Source/permission metadata is retained.

### Milestone 4 --- Visual DNA

Deliver: - Analysis normalization. - Aggregation across references. -
Versioned Visual DNA. - Editable approval UI.

Exit criteria: - User can review and edit inferred rules. - Profile
version history is preserved.

### Milestone 5 --- AI Gateway

Deliver: - Provider interface and registry. - At least one text provider
and one vision-capable provider. - Capability-aware routing. - Error
classification and fallback. - Usage logging and Control Center
foundation.

Exit criteria: - Mocked fallback tests pass. - No secret appears in
browser or logs. - Unsupported capability is rejected.

### Milestone 6 --- Design Blueprint and renderer

Deliver: - Versioned Pydantic blueprint schema. - Controlled component
registry. - HTML/CSS/SVG rendering. - Playwright export. - Render
validation.

Exit criteria: - Same blueprint produces reproducible dimensions. -
Malicious/unknown blueprint fields are rejected. - Text and elements
remain editable.

### Milestone 7 --- AI Studio and editor

Deliver: - Content brief form. - Caption and blueprint generation. -
Static post generation. - Carousel generation. - Editor with core
editing tools. - Export and versioning.

Exit criteria: - User can generate, edit, save and export a post. -
Carousel slide order is correct. - Generation can be retried safely.

### Milestone 8 --- Calendar and social integration

Deliver: - Official OAuth flow. - Social account management. - Calendar
and approval. - Durable publishing worker. - Idempotency and retry
behavior.

Exit criteria: - Publishing only occurs after approval. - Duplicate jobs
do not duplicate posts. - Expired token pauses publishing and requests
reconnection.

### Milestone 9 --- Analytics and hardening

Deliver: - Available metric sync. - Analytics dashboard. - Audit logs. -
Security review. - Backup and operational runbooks.

Exit criteria: - Metrics have source timestamps. - Security and tenant
isolation tests pass. - Known limitations are documented.

## 2. Definition of done

A feature is done only when: - UI is connected to a real backend
operation. - Backend validation and authorization exist. - Database
migration is included. - Loading, empty, success and error states
exist. - Automated tests cover key behavior. - No secret is exposed. -
Documentation is updated. - Feature is manually verified in browser.

## 3. Test strategy

### Frontend

-   Component tests for forms and states.
-   Route protection.
-   Editor state and undo/redo.
-   Calendar timezone behavior.
-   Accessibility smoke tests.
-   End-to-end onboarding and post generation.

### Backend

-   Unit tests for services and schemas.
-   API tests with authenticated users.
-   Workspace isolation and role tests.
-   File upload validation.
-   Blueprint schema and rendering tests.
-   Job retry/idempotency tests.
-   Provider fallback tests.
-   OAuth state and token handling tests.

### Security

-   Cross-tenant IDOR tests.
-   RLS tests.
-   Secret redaction tests.
-   SSRF tests for URL ingestion.
-   File type spoofing tests.
-   Rate-limit tests.
-   OAuth CSRF/state tests.
-   Permission checks on every sensitive endpoint.

## 4. Demo mode

If external credentials are not configured: - Provide clearly labelled
demo data and mock provider adapters. - Do not pretend a mock post was
published. - Mark demo output as sample. - Make setup steps visible. -
Keep demo data isolated from real user data.

## 5. Environment variables

Frontend: - `VITE_API_BASE_URL` - `VITE_SUPABASE_URL` -
`VITE_SUPABASE_ANON_KEY`

Backend examples: - `DATABASE_URL` - `SUPABASE_URL` -
`SUPABASE_SERVICE_ROLE_KEY` - `SUPABASE_JWT_SECRET` or configured JWT
verification keys - `APP_ENCRYPTION_KEY` - `CORS_ORIGINS` -
`GEMINI_API_KEY` (optional server-level development key) -
`OPENAI_API_KEY` (optional) - `ANTHROPIC_API_KEY` (optional) -
`META_APP_ID` (optional) - `META_APP_SECRET` (optional) -
`META_REDIRECT_URI` (optional) - `PUBLIC_MEDIA_BASE_URL` or storage
configuration - `WORKER_POLL_INTERVAL_SECONDS`

Never put real values in `.env.example`. Workspace BYOK keys should be
stored encrypted in the database, not in frontend environment variables.

## 6. Release gates

Do not launch public publishing until: - Official platform API flow is
verified against current docs. - App review/permissions are complete
where required. - Token security and refresh are tested. - Publishing
worker is durable and monitored. - Duplicate publishing protection is
tested. - User approval and audit logs work.
