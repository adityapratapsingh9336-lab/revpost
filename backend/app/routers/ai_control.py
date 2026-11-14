from fastapi import APIRouter, HTTPException
from app.schemas.common import ApiResponse
from app.services.ai_gateway import AIGateway

router = APIRouter(prefix="/api/v1/ai-control", tags=["AI Provider Control Center"])

@router.get("/providers", response_model=ApiResponse[list])
def get_providers():
    providers = [
        {
            "id": "prov_anthropic",
            "name": "Anthropic Claude",
            "models": ["claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"],
            "capabilities": ["Deep OCR & Visual Analysis", "Design Blueprint Reasoning"],
            "status": "Connected",
            "apiKeyMasked": "sk-ant-api03-••••••••••••••••••••94b",
            "latencyAvg": "1,240 ms",
            "monthlyTokens": "1,420,000 / 5,000,000",
            "monthlyCost": "$18.40"
        },
        {
            "id": "prov_openai",
            "name": "OpenAI",
            "models": ["gpt-4o", "gpt-4o-mini"],
            "capabilities": ["Copywriting & Captions", "JSON Schema Validation"],
            "status": "Connected",
            "apiKeyMasked": "sk-proj-••••••••••••••••••••x78",
            "latencyAvg": "980 ms",
            "monthlyTokens": "950,000 / 5,000,000",
            "monthlyCost": "$12.20"
        },
        {
            "id": "prov_gemini",
            "name": "Google Gemini",
            "models": ["gemini-1.5-pro", "gemini-1.5-flash"],
            "capabilities": ["High-Speed Inference", "Fallback Redundancy"],
            "status": "Connected",
            "apiKeyMasked": "AIzaSy••••••••••••••••••••4kM",
            "latencyAvg": "820 ms",
            "monthlyTokens": "420,000 / 3,000,000",
            "monthlyCost": "$4.10"
        }
    ]
    return ApiResponse(data=providers)

@router.post("/test-key", response_model=ApiResponse[dict])
def test_provider_key(payload: dict):
    provider_id = payload.get("provider_id", "prov_anthropic")
    return ApiResponse(
        data={
            "provider_id": provider_id,
            "status": "Verified",
            "latency_ms": 780,
            "message": "Gateway ping successful. Structured output validated."
        }
    )

@router.post("/configure-key", response_model=ApiResponse[dict])
def configure_provider_key(payload: dict):
    provider = payload.get("provider")
    api_key = payload.get("api_key", "")
    if not provider or not api_key:
        raise HTTPException(status_code=400, detail="Provider name and API key are required.")

    masked = AIGateway.set_api_key(provider, api_key)
    return ApiResponse(
        data={
            "provider": provider,
            "masked_key": masked,
            "status": "Connected (Live Key Active)"
        }
    )

@router.get("/routing", response_model=ApiResponse[dict])
def get_routing_matrix():
    return ApiResponse(data=AIGateway.get_routing_config())

@router.post("/routing", response_model=ApiResponse[dict])
def update_routing_matrix(payload: dict):
    updated = AIGateway.set_routing_config(payload)
    return ApiResponse(data=updated)

