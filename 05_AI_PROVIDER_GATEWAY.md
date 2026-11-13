# 05 --- AI Provider Gateway Specification

## 1. Objective

Create a provider-independent AI gateway that routes each task to a
compatible configured model and performs controlled fallback when
eligible failures occur.

## 2. Provider adapter contract

Every provider adapter should implement only capabilities it genuinely
supports: - `generate_text(input, options)` -
`analyse_image(image, prompt, options)` -
`generate_structured(input, schema, options)` -
`generate_image(prompt, options)` (optional) -
`create_embedding(texts, options)` (optional) - `health_check()`

Unsupported methods should return a typed `CapabilityNotSupported`
error. Do not fake compatibility.

## 3. Provider candidates

Implement adapters incrementally: - Google Gemini. - OpenAI. - Anthropic
Claude. - Groq. - OpenRouter. - Hugging Face Inference (where
applicable). - Ollama for user-configured local models.

Provider and model capabilities are dynamic. Maintain a capability
registry and verify model/API documentation at implementation time. Do
not hard-code claims that all models from one vendor share the same
capabilities.

## 4. Task taxonomy

-   `text_generation`
-   `brand_analysis`
-   `vision_analysis`
-   `structured_blueprint`
-   `caption_generation`
-   `image_generation`
-   `embedding`
-   `ocr`

OCR may be local PaddleOCR and need not use an LLM provider.

## 5. Routing policy

Inputs: - task type, - required capability set, - workspace's enabled
provider credentials, - per-task model priorities, - provider health and
cooldown, - quota state, - estimated cost and spending limits, -
explicit user fallback consent/configuration.

Select the highest-priority eligible model that supports all required
capabilities. A text-only model cannot be selected for a vision task.

## 6. Failure classification

-   `AUTH_INVALID`: credential invalid/revoked/expired.
-   `QUOTA_EXHAUSTED`: provider account quota exhausted.
-   `RATE_LIMITED`: 429 or provider-specific rate limit.
-   `PROVIDER_UNAVAILABLE`: 5xx/outage.
-   `NETWORK_TIMEOUT`: transient transport failure.
-   `INVALID_OUTPUT`: response fails expected schema.
-   `CAPABILITY_UNSUPPORTED`: model cannot perform task.
-   `POLICY_REJECTED`: provider policy refusal.
-   `REQUEST_INVALID`: malformed request or unsupported parameters.

Fallback: - Auth invalid: mark credential requiring owner action;
another explicitly configured provider may be selected. - Quota
exhausted: cooldown and fallback if policy allows. - Rate limited: honor
Retry-After and bounded retry; fallback if needed. - Provider
unavailable/network timeout: bounded exponential backoff with jitter;
fallback. - Invalid output: one safe repair attempt or fallback. -
Policy rejected: do not use fallback to circumvent policy. - Request
invalid: fail and surface actionable validation error.

## 7. Key management

-   Keys are workspace-scoped.
-   Encrypt at application layer before database storage.
-   Master encryption key stored in secret manager/environment, never in
    DB or Git.
-   Never return full key to frontend.
-   Test key server-side.
-   Support key rotation and deletion.
-   Never log request headers or secret values.
-   Never use a platform operator's or another customer's key without
    explicit consent.

## 8. Usage and cost

Record: - workspace ID, - task ID, - provider and model, - task type, -
token counts when returned, - image units when returned, - latency, -
status, - estimated cost and pricing source/version.

If provider does not return usage, mark it unknown rather than inventing
values. Pricing changes; maintain configurable price metadata and label
costs as estimates.

## 9. Circuit breaker and cooldown

Track provider/model health: - closed: normal traffic. - open:
temporarily stop requests after repeated eligible failures. - half-open:
allow limited test requests. Use configurable thresholds and cooldowns.
Do not globally disable a provider for one workspace's invalid key.

## 10. Output compatibility

-   Define Pydantic schema for each structured task.
-   Normalize provider response into internal schema.
-   Store raw response only when necessary and with sensitive-data
    controls.
-   Validate JSON before saving.
-   Version prompts and output schemas.
-   Keep model/provider metadata for reproducibility.

## 11. Control Center UI

-   Provider cards with connected/not connected/invalid status.
-   Add/test/remove key.
-   Per-task primary and fallback model ordering.
-   Capability labels.
-   Spending ceiling and warning thresholds.
-   Usage history and provider error history.
-   Explain when fallback was used.
-   No secret is displayed after initial entry.

## 12. Testing

Mock each provider adapter. Test: - success, - invalid key, - quota
exhausted, - rate limit and Retry-After, - timeout, - 5xx, - unsupported
capability, - malformed structured output, - no fallback configured, -
spending ceiling reached, - workspace isolation.
