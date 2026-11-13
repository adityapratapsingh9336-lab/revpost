import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.routers.health import root_health, api_v1_health
from app.routers.brands import get_brands
from app.routers.ai_studio import generate_creative
from app.routers.creatives import get_creatives
from app.schemas.creative import CreativeGenerateRequest

def test():
    db = SessionLocal()
    try:
        print("1. Testing root_health()...")
        h1 = root_health()
        print("✓ Health status:", h1["status"])

        print("2. Testing api_v1_health()...")
        h2 = api_v1_health()
        print("✓ API V1 status:", h2.data["status"])

        print("3. Testing get_brands()...")
        brands_res = get_brands(db=db)
        brands = brands_res.data
        print(f"✓ Brands found: {len(brands)}, First brand: {brands[0]['name']}")
        brand_id = brands[0]["id"]

        print("4. Testing generate_creative()...")
        req = CreativeGenerateRequest(
            brand_id=brand_id,
            topic_brief="4 kinetic drills to unlock stride depth and hip hinge mobility",
            platform="Instagram",
            format="1080x1350 (Portrait Carousel)",
            content_type="carousel",
            slides_count=5,
            objective="Educational",
            tone="Science-Backed",
            cta_type="Save Post"
        )
        gen_res = generate_creative(payload=req, db=db)
        gen = gen_res.data
        print(f"✓ Creative Title: {gen['title']}")
        print(f"✓ Slides count: {gen['slides_count']}")
        print(f"✓ Slide 1 Headline: {gen['blueprint']['slides'][0]['headline']}")
        print(f"✓ Provider: {gen['metrics']['provider']}")

        print("5. Testing get_creatives()...")
        creatives_res = get_creatives(db=db)
        print(f"✓ Total creatives in database: {len(creatives_res.data)}")

        print("\nALL BACKEND SERVICES AND DATABASE ENDPOINTS WORKING PERFECTLY!")
    finally:
        db.close()

if __name__ == "__main__":
    test()

