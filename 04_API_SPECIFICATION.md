# 04 --- API Specification

Base path: `/api/v1` Content type: `application/json` except multipart
or signed storage uploads. Authentication: Supabase access token sent as
`Authorization: Bearer <token>`. The backend validates the JWT and
derives user identity. Workspace access is checked server-side.

## 1. Common response conventions

Success:

``` json
{
  "data": {},
  "meta": {
    "request_id": "uuid"
  }
}
```

Error:

``` json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid fields.",
    "details": [{"field": "name", "issue": "Required"}],
    "request_id": "uuid"
  }
}
```

Use appropriate HTTP status codes: 200, 201, 202, 204, 400, 401, 403,
404, 409, 422, 429 and 500/502/503.

## 2. Authentication and workspace

Supabase Auth handles sign-in/sign-up. Backend endpoints: - `GET /me` -
`GET /workspaces` - `POST /workspaces` -
`GET /workspaces/{workspace_id}` -
`POST /workspaces/{workspace_id}/members` -
`PATCH /workspaces/{workspace_id}/members/{member_id}` -
`DELETE /workspaces/{workspace_id}/members/{member_id}`

Workspace membership and role must be checked for every endpoint.

## 3. Brands

-   `GET /brands`
-   `POST /brands`
-   `GET /brands/{brand_id}`
-   `PATCH /brands/{brand_id}`
-   `DELETE /brands/{brand_id}`
-   `GET /brands/{brand_id}/knowledge`
-   `POST /brands/{brand_id}/knowledge`
-   `PATCH /brands/{brand_id}/knowledge/{knowledge_id}`
-   `DELETE /brands/{brand_id}/knowledge/{knowledge_id}`

Create brand request:

``` json
{
  "name": "Example Brand",
  "industry": "Retail",
  "description": "Brand description",
  "default_language": "en",
  "brand_profile": {
    "audience": ["small business owners"],
    "tone": ["clear", "helpful"],
    "primary_colors": ["#234B35"],
    "restrictions": ["Do not make unsupported performance claims"]
  }
}
```

## 4. References and Visual DNA

-   `POST /references/upload-url` --- create a signed upload target.
-   `POST /references/complete-upload` --- verify uploaded object and
    create asset record.
-   `GET /brands/{brand_id}/references`
-   `GET /references/{reference_id}`
-   `POST /references/{reference_id}/analyse` --- returns 202 and job
    ID.
-   `DELETE /references/{reference_id}`
-   `GET /brands/{brand_id}/visual-dna`
-   `POST /brands/{brand_id}/visual-dna/rebuild`
-   `PATCH /visual-dna/{profile_id}` --- user-approved edits.

Analysis response:

``` json
{
  "data": {
    "job_id": "uuid",
    "status": "queued"
  }
}
```

## 5. Content and creative generation

-   `POST /content/projects`
-   `GET /content/projects`
-   `GET /content/projects/{project_id}`
-   `POST /content/generate`
-   `POST /content/{post_id}/regenerate-copy`
-   `POST /content/{post_id}/generate-blueprint`
-   `POST /creatives/{post_id}/render`
-   `GET /creatives/{post_id}`
-   `PATCH /creatives/{post_id}/blueprint`
-   `POST /creatives/{post_id}/export`
-   `POST /content/{post_id}/duplicate`
-   `POST /content/{post_id}/submit-review`
-   `POST /content/{post_id}/approve`

Generation request:

``` json
{
  "brand_id": "uuid",
  "project_id": "uuid",
  "platform": "instagram",
  "format": "instagram_portrait",
  "content_type": "static_post",
  "objective": "product_awareness",
  "topic": "Introduce a product benefit",
  "language": "en",
  "tone": "practical and trustworthy",
  "cta": "Learn more",
  "slide_count": 1
}
```

Generation should return a job ID. Worker output should include post ID,
copy, blueprint and render asset IDs when completed.

## 6. Carousel

Use `content_type: "carousel"` and `slide_count` within configured
limits. - `GET /content/{post_id}/slides` -
`POST /content/{post_id}/slides` -
`PATCH /content/{post_id}/slides/{slide_id}` -
`DELETE /content/{post_id}/slides/{slide_id}` -
`POST /content/{post_id}/slides/reorder` -
`POST /content/{post_id}/export-carousel`

Ensure slide numbers are unique and ordered.

## 7. Social accounts

-   `GET /social/accounts`
-   `POST /social/{platform}/oauth/start`
-   `GET /social/{platform}/oauth/callback`
-   `POST /social/accounts/{account_id}/reconnect`
-   `DELETE /social/accounts/{account_id}`

OAuth start returns an authorization URL. Callback must validate state
and exchange credentials server-side. Do not expose tokens in API
responses.

## 8. Calendar and publishing

-   `GET /calendar?from=...&to=...`
-   `POST /calendar`
-   `PATCH /calendar/{calendar_id}`
-   `DELETE /calendar/{calendar_id}`
-   `POST /calendar/{calendar_id}/cancel`
-   `POST /publishing/{calendar_id}/publish-now`
-   `GET /publishing/jobs`
-   `GET /publishing/jobs/{job_id}`
-   `POST /publishing/jobs/{job_id}/retry`

Schedule request:

``` json
{
  "post_id": "uuid",
  "social_account_id": "uuid",
  "scheduled_at": "2026-12-01T10:00:00Z",
  "timezone": "Asia/Kolkata"
}
```

Only approved content can be scheduled/published. Backend validates
account status, token status, media requirements, and platform
permissions before queuing.

## 9. Analytics

-   `GET /analytics/overview?from=...&to=...`
-   `GET /analytics/posts/{published_post_id}`
-   `POST /analytics/sync/{social_account_id}`

Return metric availability and source timestamps. Do not convert
unavailable metrics into zero.

## 10. AI settings

-   `GET /ai/providers`
-   `POST /ai/providers`
-   `PATCH /ai/providers/{provider_config_id}`
-   `DELETE /ai/providers/{provider_config_id}`
-   `POST /ai/providers/{provider_config_id}/test`
-   `GET /ai/models`
-   `POST /ai/routing-rules`
-   `GET /ai/routing-rules`
-   `PATCH /ai/routing-rules/{rule_id}`
-   `GET /ai/usage`
-   `GET /ai/jobs`

Never return raw API keys. On save, return masked display such as
`••••••••abcd`.

## 11. Jobs

-   `GET /jobs/{job_id}`
-   `POST /jobs/{job_id}/cancel`

Job response:

``` json
{
  "data": {
    "id": "uuid",
    "type": "reference_analysis",
    "status": "running",
    "progress": 45,
    "message": "Extracting visual properties",
    "result": null,
    "error": null
  }
}
```

Progress is optional and should be meaningful. Do not fake progress
values.

## 12. Idempotency and concurrency

-   Accept `Idempotency-Key` for publishing and other non-repeatable
    actions.
-   Enforce unique idempotency keys in database.
-   Use optimistic versioning or `updated_at` checks for editing.
-   Use transactions for multi-record operations.
-   Prevent duplicate calendar jobs.
-   Use pagination (`limit`, `cursor`) for list endpoints.

## 13. Rate limits

Implement configurable per-user/workspace limits for uploads, AI
generation, exports and publishing. Return HTTP 429 with a retry hint
when applicable.
