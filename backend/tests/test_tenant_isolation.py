from app.database import SessionLocal
from app.models.workspace import Workspace
from app.models.brand import Brand
from app.models.creative import Creative

def test_tenant_workspace_isolation():
    db = SessionLocal()
    try:
        # Create two distinct workspaces
        ws_a = Workspace(name="Acme Health Corp", owner_id="user_a")
        ws_b = Workspace(name="Nordic Coffee Lab", owner_id="user_b")
        db.add_all([ws_a, ws_b])
        db.commit()

        # Add brands to each workspace
        brand_a = Brand(workspace_id=ws_a.id, name="Acme Fit")
        brand_b = Brand(workspace_id=ws_b.id, name="Nordic Roast")
        db.add_all([brand_a, brand_b])
        db.commit()

        # Query brands for Workspace A only
        ws_a_brands = db.query(Brand).filter(Brand.workspace_id == ws_a.id).all()
        assert len(ws_a_brands) == 1
        assert ws_a_brands[0].name == "Acme Fit"

        # Verify Brand B does NOT appear in Workspace A queries
        assert all(b.workspace_id != ws_b.id for b in ws_a_brands)

        # Cleanup test records
        db.delete(brand_a)
        db.delete(brand_b)
        db.delete(ws_a)
        db.delete(ws_b)
        db.commit()
    finally:
        db.close()

