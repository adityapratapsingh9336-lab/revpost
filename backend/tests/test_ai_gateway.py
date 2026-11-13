from app.services.ai_gateway import AIGateway

def test_capability_aware_routing():
    # Vision analysis should route to vision-capable provider (Anthropic)
    vision_provider = AIGateway.route_task("vision_analysis")
    assert vision_provider in ["anthropic", "openai", "gemini"]
    assert "vision_analysis" in AIGateway.PROVIDERS[vision_provider]["capabilities"]

    # Copywriting should route to copywriting provider (OpenAI)
    copy_provider = AIGateway.route_task("copywriting")
    assert "copywriting" in AIGateway.PROVIDERS[copy_provider]["capabilities"]

    # Fallback should route to Gemini
    fallback_provider = AIGateway.route_task("fallback")
    assert fallback_provider == "gemini"

def test_generate_copy_and_hooks():
    result = AIGateway.generate_copy_and_hooks(
        topic_brief="5 principles of high-cadence marathon pacing",
        brand_name="PulseFit Athletics",
        brand_voice="Direct & Science-Backed",
        platform="Instagram",
        objective="Educational"
    )

    assert "title" in result
    assert "caption" in result
    assert "hashtags" in result
    assert len(result["hashtags"]) >= 3
    assert result["tokens_used"] > 0
    assert result["latency_ms"] > 0
    assert "PulseFit" in result["caption"]
