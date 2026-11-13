from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_endpoints():
    print("--- Testing Health Endpoints ---")
    r = client.get("/health")
    assert r.status_code == 200, f"Root health failed: {r.text}"
    print("✓ /health passed:", r.json()["status"])

    r = client.get("/api/v1/health")
    assert r.status_code == 200, f"API v1 health failed: {r.text}"
    print("✓ /api/v1/health passed:", r.json()["data"]["status"])

    print("\n--- Testing Brands API ---")
    r = client.get("/api/v1/brands")
    assert r.status_code == 200, f"Brands failed: {r.text}"
    brands = r.json()["data"]
    print(f"✓ /api/v1/brands passed: {len(brands)} brand(s) found ({brands[0]['name']})")
    brand_id = brands[0]["id"]

    print("\n--- Testing AI Studio Creative Generation ---")
    gen_payload = {
        "brand_id": brand_id,
        "topic_brief": "5 reasons runners should prioritize hydration during winter tempo workouts",
        "platform": "Instagram",
        "format": "1080x1350 (Portrait Carousel)",
        "content_type": "carousel",
        "slides_count": 5,
        "objective": "Educational & Authority",
        "tone": "Direct & Science-Backed",
        "cta_type": "Save Post / Link in Bio"
    }
    r = client.post("/api/v1/ai/generate", json=gen_payload)
    assert r.status_code == 200, f"AI generation failed: {r.text}"
    gen_data = r.json()["data"]
    print("✓ /api/v1/ai/generate passed:")
    print("  Title:", gen_data["title"])
    print("  Slides Generated:", gen_data["slides_count"])
    print("  First Slide Headline:", gen_data["blueprint"]["slides"][0]["headline"])
    print("  Provider Used:", gen_data["metrics"]["provider"])

    print("\n--- Testing Creatives Retrieval ---")
    r = client.get("/api/v1/creatives")
    assert r.status_code == 200, f"Creatives failed: {r.text}"
    creatives = r.json()["data"]
    print(f"✓ /api/v1/creatives passed: {len(creatives)} creative(s) retrieved from database")

    print("\n✓ ALL TESTS PASSED CLEANLY!")

if __name__ == "__main__":
    test_endpoints()

