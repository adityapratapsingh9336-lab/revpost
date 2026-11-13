# 02 --- Technical Architecture

## 1. Architecture style

Use a **modular monolith** for V1. One FastAPI application with domain
modules and separate worker processes/commands. Keep module boundaries
clean so high-load modules can be extracted later.

## 2. Technology choices

### Frontend

-   React + Vite + JavaScript.
-   Tailwind CSS and shadcn/ui.
-   React Router.
-   Zustand for cross-page UI state.
-   TanStack Query for server state and caching.
-   React Hook Form + Zod for forms.
-   Fabric.js or Konva for canvas editing; select one after a small
    proof of concept.
-   Recharts for analytics.
-   Vitest + React Testing Library + Playwright for tests.

### Backend

-   Python 3.12+ (choose supported stable version at implementation
    time).
-   FastAPI.
-   Pydantic.
-   SQLAlchemy 2.x.
-   Alembic.
-   Supabase PostgreSQL.
-   pgvector extension.
-   Supabase Auth and Storage initially.
-   Pillow and OpenCV for image processing.
-   Playwright for controlled HTML/CSS rendering.
-   Durable database-backed job queue initially; APScheduler may trigger
    polling in a single-instance development setup.
-   For production, use a dedicated always-on worker and durable queue.
    Do not rely on an ephemeral web process or sleeping free-tier
    service for reliable publishing.

## 3. System components

### Frontend responsibilities

-   Render workspace and brand UI.
-   Validate form input.
-   Upload files using short-lived signed upload URLs or authenticated
    storage policies.
-   Call API and show job status.
-   Keep canvas editing state locally; persist canonical blueprint via
    API.
-   Never store provider secrets or social tokens.
-   Never call privileged provider APIs directly from the browser.

### API/backend responsibilities

-   Authenticate requests and resolve current user.
-   Authorize workspace membership and role.
-   Validate payloads.
-   Create database records and durable jobs.
-   Coordinate domain services.
-   Return job IDs for long operations.
-   Keep secrets server-side.
-   Apply rate limits and audit sensitive actions.

### Worker responsibilities

-   Reference image analysis.
-   OCR and visual processing.
-   AI content generation.
-   Blueprint validation and rendering.
-   Publishing and analytics sync.
-   Retry, idempotency, cancellation and job logging.

### Data layer

-   PostgreSQL is the source of truth.
-   pgvector stores embeddings for relevant brand knowledge chunks.
-   Object storage stores originals, previews and exports.
-   Do not store large binary images in database rows.

## 4. Suggested repository layout

``` text
xyz/
  frontend/
    src/
      app/
      components/
      pages/
      features/
      hooks/
      services/
      store/
      schemas/
      utils/
  backend/
    app/
      main.py
      config.py
      api/v1/
      core/
      modules/
        auth/
        workspaces/
        brands/
        references/
        visual_intelligence/
        content_strategy/
        creative_engine/
        rendering/
        social_integrations/
        scheduler/
        analytics/
      ai_engine/
        gateway.py
        router.py
        capability_registry.py
        fallback.py
        providers/
      database/
        models/
        repositories/
      workers/
      integrations/
    migrations/
    tests/
  docs/
  .env.example
  README.md
```

## 5. Core backend design patterns

-   Router → service → repository separation.
-   Pydantic request/response models.
-   SQLAlchemy models separate from API schemas.
-   Provider adapter interface.
-   Task/job abstraction for long operations.
-   Transactional writes for state transitions.
-   Correlation ID propagated from API to worker and logs.
-   Outbox or transactional job creation pattern where practical, so
    database writes and job dispatch cannot silently diverge.

## 6. Creative rendering architecture

### Principle

AI returns a validated Design Blueprint JSON. The application renders
that blueprint using a controlled component registry. Never execute
arbitrary AI-generated source code.

### Blueprint example

``` json
{
  "schema_version": "1.0",
  "format": "instagram_portrait",
  "width": 1080,
  "height": 1350,
  "background": {"type": "solid", "color": "#F4F0E5"},
  "elements": [
    {
      "id": "headline-1",
      "type": "text",
      "text": "A better way to care",
      "x": 72, "y": 120, "width": 700, "height": 180,
      "style": {
        "font_family": "brand_heading",
        "font_size": 64,
        "font_weight": 700,
        "color": "#234B35",
        "align": "left"
      }
    },
    {
      "id": "product-1",
      "type": "image",
      "asset_id": "uuid",
      "x": 500, "y": 500, "width": 500, "height": 600,
      "fit": "contain"
    }
  ]
}
```

### Required blueprint validation

-   `schema_version` supported.
-   Format and dimensions in allowed list.
-   Element types in allowlist.
-   Unique element IDs.
-   Numeric positions and dimensions within configured limits.
-   Colours validated.
-   Font names from approved font registry.
-   Asset IDs belong to same workspace.
-   Text length limits.
-   No executable code, URLs in arbitrary render attributes, event
    handlers or scripts.
-   Reject unknown keys unless schema explicitly permits extension
    metadata.

### Rendering pipeline

1.  Validate blueprint using Pydantic/JSON Schema.
2.  Resolve workspace-owned assets.
3.  Render using controlled templates/components.
4.  Capture using Playwright at exact dimensions.
5.  Run image validation: dimensions, non-empty output, bounds, overflow
    and OCR text comparison where configured.
6.  Store output and render metadata.
7.  Return asset ID and signed download URL.

Keep renderer isolated from untrusted network access. Disable arbitrary
remote resource loading; only load approved asset URLs/fonts.

## 7. Visual intelligence pipeline

1.  Validate image upload and file signature.
2.  Save original asset.
3.  Create normalized analysis copy/thumbnail.
4.  Run OCR (PaddleOCR or replaceable OCR adapter).
5.  Run vision model for high-level design interpretation.
6.  Extract palette and image properties using OpenCV/Pillow.
7.  Normalize outputs into a stable analysis schema.
8.  Aggregate across references into a versioned Visual DNA profile.
9.  Present results for user review.
10. Persist approved profile.

Do not copy reference artwork. Extract reusable high-level patterns,
then create original designs. Keep source URL, attribution and
permission metadata.

## 8. AI gateway

All AI tasks must call one internal interface: - `generate_text` -
`analyse_image` - `generate_structured` - `generate_image` (only if
supported and enabled) - `create_embedding`

Each adapter declares supported capabilities. The router must not send
vision tasks to text-only models or image-generation tasks to text-only
models.

### Routing inputs

-   Task type.
-   Required capabilities.
-   Workspace provider configuration.
-   Model priority.
-   Provider health/cooldown.
-   Quota/usage policy.
-   Estimated cost limits.
-   User consent and configured fallback rules.

### Error handling

-   401/403 invalid credentials: mark credential invalid; notify owner;
    use only another explicitly configured permitted provider.
-   429: respect Retry-After; cooldown; fallback if policy allows.
-   5xx/network timeout: bounded retries with exponential backoff and
    jitter; then fallback.
-   Invalid output: schema validation; one bounded repair attempt if
    safe; then fallback.
-   Policy rejection: do not route around the rejection to obtain
    prohibited output.
-   Never infinite retry.

## 9. Social integrations

-   OAuth authorization code flow.
-   State parameter and PKCE where supported.
-   Verify redirect URI and state.
-   Exchange authorization code server-side.
-   Encrypt access/refresh tokens at rest.
-   Store scopes, expiry and platform account ID.
-   Implement refresh/re-auth logic according to provider documentation.
-   Never ask users for social passwords.
-   Use official platform APIs only.
-   Verify current platform requirements before implementation; APIs,
    permissions and account prerequisites change.
-   For Instagram, support only eligible professional accounts and
    permitted publishing formats. App review/advanced access may be
    required for public customers.
-   Store platform response and post ID.
-   Do not automate likes, follows, comments or artificial engagement.

## 10. Scheduling and job processing

A scheduled post is not itself a job execution. Store: - scheduled time
in UTC, - original timezone, - target account, - approved content
revision, - idempotency key, - next attempt, - attempt count, - state
and error.

Worker claims jobs safely using row locks/lease semantics. It must
handle process restarts and duplicate wakeups. A job must not publish
twice. Pause account queue on expired token or permission errors.

For production use a durable queue/worker and always-on infrastructure.
Free-tier sleep/cold starts cannot guarantee precise publishing.

## 11. Security

-   Supabase Auth JWT verification on backend.
-   RLS on tenant-owned tables.
-   Backend authorization on every route.
-   Workspace ID derived from authorized context; do not trust
    client-supplied workspace IDs alone.
-   Encrypt API keys and OAuth tokens using envelope encryption or
    managed KMS where available.
-   Keep encryption master key outside database and source control.
-   Redact secrets from logs and error traces.
-   Restrict CORS to configured frontend origins.
-   Validate upload MIME and file signature; set size limits.
-   Rate limit auth, AI generation, uploads and publishing endpoints.
-   Prevent SSRF when processing URLs; allowlist supported domains or
    use approved platform APIs.
-   Audit key changes, OAuth events, publishing and membership changes.
-   Apply retention and deletion workflows.

## 12. Observability

Structured logs should include: - request_id / correlation_id -
workspace_id - actor_user_id where appropriate - task_id - module -
provider/model (not credentials) - status - latency_ms - error_code

Metrics: - API latency and error rate. - Worker queue depth and oldest
job age. - AI success/fallback rate. - Provider latency and cooldown. -
Rendering failure rate. - Publishing success/failure rate. - Estimated
AI spend.

## 13. Deployment

Development: - Frontend local Vite server. - Backend local Uvicorn. -
Supabase development project. - Local worker. - `.env` ignored by Git;
`.env.example` contains placeholders only.

Production: - Frontend on a commercial-appropriate host. - FastAPI API
service. - Dedicated always-on worker. - Managed PostgreSQL and object
storage. - HTTPS, backups, migrations and monitoring. - Separate staging
and production environments.

Do not assume free-tier hosting is commercially permitted or reliable
for scheduled publishing. Verify current provider terms and limits
before launch.
