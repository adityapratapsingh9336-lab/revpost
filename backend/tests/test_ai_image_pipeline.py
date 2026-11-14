import os
import sys
import time
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import engine, Base, SessionLocal, ensure_sqlite_columns
from app.models.brand import Brand
from app.models.creative import Creative
from app.schemas.creative import CreativeGenerateRequest
from app.routers.ai_studio import generate_creative

class TestAIImageGenerationPipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        ensure_sqlite_columns()
        cls.db = SessionLocal()
        cls.brand = cls.db.query(Brand).first()
        if not cls.brand:
            cls.brand = Brand(
                id="br_apex_realty",
                workspace_id="ws_default",
                name="Apex Luxury Estates",
                industry="Real Estate",
                tone="Authoritative"
            )
            cls.db.add(cls.brand)
            cls.db.commit()

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_end_to_end_real_estate_generation(self):
        print("\n--- PHASE 6 TEST 1: Generating Post 1 (Beachfront Villa) ---")
        p1 = CreativeGenerateRequest(
            brand_id=self.brand.id,
            topic_brief="Ultra-luxury beachfront villa in Malibu with panoramic ocean sunset views and infinity pool",
            platform="Instagram",
            format="1080x1350 (Portrait Carousel)",
            content_type="static",
            slides_count=1,
            tone="Authoritative",
            objective="Educational & Authority",
            archetype="High-Contrast Technical Minimalist"
        )
        r1 = generate_creative(p1, self.db)
        data1 = r1.data

        self.assertIsNotNone(data1["id"])
        self.assertIsNotNone(data1["image_url"])
        self.assertIsNotNone(data1["raw_image_url"])
        self.assertIsNotNone(data1["visual_prompt"])
        self.assertIsNotNone(data1["generation_id"])
        self.assertIn("ocean", data1["visual_prompt"].lower())
        print(f"Post 1 Generated: ID={data1['id']}")
        print(f"Composite Image URL: {data1['image_url']}")
        print(f"Raw AI Image URL: {data1['raw_image_url']}")
        print(f"Visual Prompt: {data1['visual_prompt']}")

        # Verify DB persistence
        c1 = self.db.query(Creative).filter(Creative.id == data1["id"]).first()
        self.assertIsNotNone(c1)
        self.assertEqual(c1.image_url, data1["image_url"])
        self.assertEqual(c1.generation_id, data1["generation_id"])

        # Verify disk files
        gen_id1 = data1["generation_id"]
        local_composite1 = os.path.join("storage_uploads", "generated", f"{gen_id1}_slide_01.png")
        local_raw1 = os.path.join("storage_uploads", "generated", f"{gen_id1}_raw.jpg")
        self.assertTrue(os.path.exists(local_composite1), f"File {local_composite1} must exist on disk")
        self.assertTrue(os.path.exists(local_raw1), f"File {local_raw1} must exist on disk")
        self.assertGreater(os.path.getsize(local_composite1), 10000)
        self.assertGreater(os.path.getsize(local_raw1), 10000)

        # Allow 45s interval for Pollinations free tier IP rate limit window to clear
        print("Waiting 45s for free tier rate-limit window to clear before Post 2...")
        time.sleep(45)

        print("\n--- PHASE 6 TEST 2: Generating Post 2 (Penthouse Loft) ---")
        p2 = CreativeGenerateRequest(
            brand_id=self.brand.id,
            topic_brief="Ultra-luxury modern high-rise penthouse loft overlooking glowing panoramic metropolis skyline at twilight",
            platform="Instagram",
            format="1080x1350 (Portrait Carousel)",
            content_type="static",
            slides_count=1,
            tone="Authoritative",
            objective="Educational & Authority",
            archetype="High-Contrast Technical Minimalist"
        )
        r2 = generate_creative(p2, self.db)
        data2 = r2.data

        self.assertIsNotNone(data2["id"])
        self.assertIsNotNone(data2["image_url"])
        self.assertIsNotNone(data2["raw_image_url"])
        self.assertIsNotNone(data2["visual_prompt"])
        self.assertIn("skyline", data2["visual_prompt"].lower())
        print(f"Post 2 Generated: ID={data2['id']}")
        print(f"Composite Image URL: {data2['image_url']}")
        print(f"Visual Prompt: {data2['visual_prompt']}")

        # Verify uniqueness
        self.assertNotEqual(data1["id"], data2["id"], "Creative IDs must be unique")
        self.assertNotEqual(data1["image_url"], data2["image_url"], "Composite Image URLs must be distinct")
        self.assertNotEqual(data1["raw_image_url"], data2["raw_image_url"], "Raw Image URLs must be distinct")
        self.assertNotEqual(data1["generation_id"], data2["generation_id"], "Generation IDs must be distinct")
        self.assertNotEqual(data1["visual_prompt"], data2["visual_prompt"], "Visual Prompts must be distinct")

        print("\n--- SUCCESS: ALL TESTS PASSED! Genuine AI pipeline verified end-to-end. ---")

if __name__ == "__main__":
    unittest.main()
