# 01 --- Product Requirements Document (PRD)

## 1. Product overview

### 1.1 Product name

XYZ (working name; retain until the owner approves a final name).

### 1.2 Product vision

XYZ is an AI-powered social media management platform that learns a
brand's identity and visual style from brand information and
user-provided visual references, then helps users create original social
media graphics, captions and carousels, manage a content calendar,
publish through supported official APIs, and understand performance.

XYZ should reduce repetitive creative work while preserving brand
consistency and human control.

### 1.3 Core value proposition

"Teach XYZ your brand and visual direction once. Use it to create
consistent, editable, original social content and manage publishing from
one workspace."

### 1.4 Target users

-   Small businesses and local brands.
-   Social media managers and marketing agencies.
-   Freelancers managing several client brands.
-   Founders and creators who need repeatable brand-consistent content.
-   Teams that need content approval and scheduling.

### 1.5 Product principles

1.  Brand memory: persist structured brand knowledge and visual rules.
2.  Originality: learn high-level visual patterns; do not copy reference
    artwork wholesale.
3.  Editability: generated designs must be editable as structured
    elements.
4.  Human control: users review and approve content before publishing by
    default.
5.  Provider independence: AI services must be replaceable through a
    gateway.
6.  Security: workspace isolation, encrypted secrets and least
    privilege.
7.  Honest status: never show a post as published until the platform
    confirms it.
8.  Incremental delivery: working V1 before advanced automation.

## 2. V1 scope

### 2.1 Included

-   Authentication and workspace management.
-   Multiple brand profiles per workspace.
-   Brand knowledge: niche, products/services, audience, tone, language,
    objectives, claims/restrictions, logo, brand colours and fonts.
-   Reference image upload and permitted source URL metadata.
-   Reference image analysis: layout, palette, typography
    characteristics, composition, text hierarchy, imagery and CTA
    placement.
-   OCR extraction with approximate text locations.
-   Persistent Visual DNA profile and design archetypes.
-   Content ideas, briefs, captions, descriptions and hashtags.
-   Static social post generation.
-   Multi-slide carousel generation.
-   Structured Design Blueprint JSON.
-   Controlled visual editor for text, images, shapes, colours and
    positions.
-   PNG/JPEG export.
-   Draft management and content calendar.
-   AI provider settings, capability-aware routing, fallback and usage
    logs.
-   Social account connection foundation; Instagram/Facebook publishing
    when credentials, account eligibility and required platform
    permissions are configured.
-   Audit logs and basic analytics integration structure.

### 2.2 Explicitly out of scope for V1

-   Video generation.
-   Reels generation or video editing.
-   FFmpeg/video rendering pipeline.
-   Automated likes, follows, comments, DMs or engagement manipulation.
-   Scraping private pages or bypassing platform restrictions.
-   Training foundation models from scratch.
-   Complex enterprise approval workflows, billing and white-labeling
    unless added in a later approved phase.

## 3. User roles

-   Owner: full workspace control, billing-ready settings, integrations
    and member management.
-   Admin: manage brands, members, integrations and content.
-   Editor: create/edit content and submit for approval.
-   Viewer: read-only access.

Enforce roles on the backend; hiding UI controls is not authorization.

## 4. Main user journeys

### Journey A --- First-time onboarding

1.  User signs up and verifies identity according to auth configuration.
2.  User creates a workspace.
3.  User creates a brand.
4.  User enters brand information and uploads logo/assets.
5.  User uploads reference images.
6.  System creates asynchronous analysis jobs.
7.  User reviews extracted brand and Visual DNA suggestions.
8.  User approves or edits the saved profile.

Acceptance: - User cannot access another workspace's records. - Analysis
status is visible. - User can retry failed analysis. - No unreviewed AI
inference is silently treated as verified brand fact.

### Journey B --- Generate a post

1.  User selects workspace and brand.
2.  User selects platform/format, objective, content topic, language and
    optional CTA.
3.  System retrieves relevant brand knowledge and Visual DNA.
4.  Content engine drafts copy and a design brief.
5.  Blueprint generator returns schema-valid JSON.
6.  Renderer generates preview.
7.  Validation checks dimensions, bounds, missing assets, text overflow
    and required brand elements.
8.  User edits, regenerates selected parts, saves draft or exports.

Acceptance: - A generated post is linked to its brand and project. -
Design elements are editable individually. - The exact text supplied to
the renderer is retained. - The system does not invent product claims or
unsupported statistics. - Generation errors are visible and logged.

### Journey C --- Generate a carousel

1.  User specifies topic, objective and slide count.
2.  AI produces a narrative outline and slide-by-slide copy.
3.  Each slide gets its own blueprint and ordered slide number.
4.  Renderer generates each slide.
5.  User can reorder, edit, duplicate or delete slides.
6.  Export produces ordered image files.

Acceptance: - Slide order is stable. - All slides share appropriate
visual rules. - Each slide is independently editable. - Exported
dimensions are consistent.

### Journey D --- Schedule and publish

1.  User connects an eligible professional social account through
    official OAuth.
2.  User selects an approved post and target account.
3.  User selects date/time and timezone.
4.  System validates media format, account permissions and publishing
    eligibility.
5.  A durable publishing job is created.
6.  Worker executes the platform API workflow.
7.  Platform response is stored; status becomes published only after
    confirmation.
8.  Failures are logged with actionable messages; user can reconnect or
    retry safely.

Acceptance: - Never ask for social passwords. - Never publish without
explicit user action/approval. - Prevent duplicate publishing with
idempotency keys. - Respect platform limits and retry guidance. - If
token expires/revokes, pause jobs and request reconnection.

### Journey E --- Configure AI providers

1.  Workspace owner opens AI Control Center.
2.  Adds a provider API key.
3.  Backend validates the key without returning it to the browser.
4.  Owner selects models by task and configures fallback order.
5.  System records usage and errors per workspace.
6.  On eligible failures, gateway selects another compatible configured
    provider.

Acceptance: - No cross-workspace key sharing. - No silent use of a paid
provider without explicit workspace configuration/consent. - Fallback
respects model capability and output schema. - Credential-invalid and
quota-exhausted states are distinct.

## 5. Functional requirements

### FR-01 Authentication and workspace

-   Sign up, sign in, sign out and session handling through Supabase
    Auth.
-   Workspace creation and membership.
-   Role-based access control.
-   Workspace switcher.
-   Backend checks workspace membership on every protected operation.

### FR-02 Brand Studio

Fields should include: - Brand name, description, website, industry and
category. - Products/services and product attributes. - Target audience
and audience pain points. - Brand voice, tone attributes and writing
examples. - Preferred languages. - Content goals and content pillars. -
Primary/secondary colours and typography. - Logo and approved assets. -
Prohibited phrases, legal restrictions and claims requiring evidence. -
Platform-specific guidelines.

Brand knowledge should be stored as structured records. Embeddings are
supplementary retrieval indexes, not the sole source of truth.

### FR-03 Reference Studio

-   Upload JPEG, PNG and WebP within configurable size limits.
-   Store original file in object storage.
-   Validate MIME type and actual file content.
-   Save source URL, attribution/permission notes and uploader.
-   Show processing status: uploaded, queued, processing, completed,
    failed.
-   Allow removal and re-analysis.
-   Do not fetch arbitrary private URLs or bypass access controls.

### FR-04 Visual Intelligence

Extract: - Dominant and supporting palette. - Approximate typography
categories and hierarchy. - Composition and layout patterns. - Text
density and hierarchy. - Image treatment and background style. - CTA and
logo placement patterns. - Repeated shapes, borders and decorative
motifs. - Aspect ratio and safe margins.

Aggregate multiple references into a versioned Visual DNA profile. Show
evidence/preview and allow user edits. Treat model outputs as
suggestions.

### FR-05 Design archetypes

Initial archetypes: - Product promotion. - Educational/informational. -
Announcement. - Testimonial/social proof. - Storytelling. -
Offer/campaign. - Quote/tip. - Event/promotion.

Each archetype is a controlled layout family, not a hard-coded copy of a
reference.

### FR-06 Content strategy

-   Generate content ideas and content pillars.
-   Generate post briefs.
-   Generate captions, descriptions and hashtags.
-   Support selected language and tone.
-   Offer platform-specific copy length guidance.
-   Avoid fabricated facts, guarantees or unsupported claims.
-   Allow regeneration of caption only, headline only or CTA only.

### FR-07 Creative engine

-   Generate static posts and carousels.
-   Use schema-validated Design Blueprint JSON.
-   Use controlled components and a renderer.
-   Support editable text, image, shape, background, logo and layout
    elements.
-   Export PNG/JPEG at supported dimensions.
-   Store versions and generation metadata.
-   Never execute arbitrary AI-generated HTML, JS or React.

Suggested starting dimensions: - Instagram portrait feed: 1080 × 1350. -
Square: 1080 × 1080. - Landscape: 1080 × 566 (validate current platform
requirements before publishing). - Story format is not a V1 priority
unless specifically added; do not infer video support from it.

### FR-08 Creative editor

-   Select an element and edit its properties.
-   Add/edit text and shapes.
-   Replace/crop/fit images.
-   Change colours, font size, alignment and spacing.
-   Move/resize/duplicate/delete elements.
-   Undo/redo.
-   Preview at export size.
-   Save revisions.
-   Re-render after changes.
-   Warn about out-of-bounds and overflow elements.

### FR-09 Calendar and publishing

-   Draft, awaiting approval, approved, scheduled, publishing,
    published, failed and cancelled states.
-   Timezone-aware scheduling.
-   Durable job record and idempotency key.
-   Bounded retry with exponential backoff for transient failures.
-   Pause account queue on authentication or permission errors.
-   Store platform post ID and response metadata.
-   Use official APIs only.

### FR-10 Analytics

-   Store available metrics and timestamped snapshots.
-   Display only metrics supported by the connected platform and granted
    permissions.
-   Distinguish unavailable metrics from zero.
-   Provide simple trends and top-performing content.
-   Do not imply real-time analytics if platform data is delayed.

### FR-11 AI Control Center

-   Provider and model configuration.
-   Encrypted workspace-scoped API keys.
-   Capability labels: text, vision, image generation, embeddings,
    structured output.
-   Primary and fallback priorities per task.
-   Health status and cooldown.
-   Usage and estimated costs.
-   Spending limit configuration.
-   Test connection.
-   Show provider/model used for each task.

### FR-12 Audit and safety

-   Audit sensitive actions.
-   Track publishing and AI task errors.
-   Sanitize logs; never log secrets.
-   Provide pause publishing control.
-   Support user data deletion/export workflows.
-   Add content checks for duplicate content, unsupported claims and
    asset/source permissions.

## 6. Non-functional requirements

-   Security: HTTPS, secure cookies/session handling, secret encryption,
    RLS and backend authorization.
-   Reliability: durable jobs; retries must be bounded and idempotent.
-   Performance: paginated lists; asynchronous AI/image processing;
    avoid blocking HTTP requests on long tasks.
-   Accessibility: keyboard navigation, visible focus, labels, contrast
    and responsive layouts.
-   Maintainability: modular monolith, typed schemas, migrations and
    automated tests.
-   Observability: structured logs, correlation IDs, job state and
    provider latency.
-   Portability: provider adapters and storage abstraction.
-   Data integrity: foreign keys, constraints and transactions.
-   Privacy: workspace isolation and minimal collection of personal
    data.

## 7. Status models

### Content status

`draft`, `in_review`, `approved`, `scheduled`, `publishing`,
`published`, `failed`, `archived`.

### Processing job status

`queued`, `running`, `succeeded`, `failed`, `cancelled`, `retry_wait`.

### Social account status

`connected`, `reauth_required`, `permission_error`, `disabled`.

## 8. Success metrics for V1

-   Time from brand setup to first approved creative.
-   Percentage of generated creatives accepted with minor edits.
-   Successful render rate.
-   Successful publishing rate for eligible connected accounts.
-   AI task success and fallback success rates.
-   Average generation latency and cost per task.
-   User retention and number of active brands. Do not fabricate target
    values; establish baselines during beta.

## 9. Open decisions / configuration

-   Final product name and domain.
-   Launch platforms and exact Meta API login flow.
-   Supported languages for initial launch.
-   Free vs paid plans and billing.
-   Maximum upload size and retention policy.
-   Whether image generation is included in initial beta or uses
    user-provided assets.
-   Commercial hosting and production worker provider.

These decisions must be surfaced as configuration or documented
assumptions, not silently invented.
