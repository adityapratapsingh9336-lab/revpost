from fastapi import HTTPException
from app.database import SessionLocal
from app.auth import require_role
from app.routers.brands import get_brands, create_brand
from app.routers.references import upload_simulated_reference, reanalyse_reference, delete_reference
from app.routers.visual_dna import get_visual_dna, rebuild_visual_dna
from app.routers.calendar import schedule_post, get_calendar_events
from app.routers.publishing import get_publishing_queue, publish_now
from app.schemas.brand import BrandCreate

def test_rbac_role_enforcement():
    checker = require_role(["owner", "admin", "editor"])

    # Owner should be allowed
    res = checker(x_workspace_role="owner", x_user_id="u1")
    assert res["role"] == "owner"

    # Viewer must be rejected with 403
    rejected = False
    try:
        checker(x_workspace_role="viewer", x_user_id="u2")
    except HTTPException as exc:
        assert exc.status_code == 403
        rejected = True
    assert rejected, "Viewer role should return 403 Forbidden"

def test_reference_and_visual_dna_rebuild_flow():
    db = SessionLocal()
    try:
        brands = get_brands(db=db).data
        brand_id = brands[0]["id"]

        # Create simulated reference and verify re-analysis & cleanup
        ref = upload_simulated_reference({"brand_id": brand_id, "title": "RBAC Test Ref"}, db=db).data
        assert ref["title"] == "RBAC Test Ref"

        reanalysed = reanalyse_reference(ref["id"], db=db).data
        assert reanalysed["confidenceScore"] >= 92.0

        # Rebuild Visual DNA from analyzed references
        initial_dna = get_visual_dna(brand_id, db=db).data
        rebuilt = rebuild_visual_dna(brand_id, db=db).data
        assert rebuilt["version"] != initial_dna["version"]
        assert len(rebuilt["versionHistory"]) >= 2

        # Cleanup created reference
        del_res = delete_reference(ref["id"], db=db).data
        assert del_res["deleted_id"] == ref["id"]
    finally:
        db.close()

def test_calendar_and_publishing_persistence():
    db = SessionLocal()
    try:
        scheduled = schedule_post(
            {
                "creative_id": "crt_1",
                "title": "Test Scheduled Mobility Post",
                "date": "2026-11-28",
                "time": "14:00",
                "platform": "Instagram",
                "target_account": "@pulsefit.athletics",
            },
            db=db,
        ).data
        assert scheduled["status"] == "Scheduled"

        events = get_calendar_events(db=db).data
        assert any(e["id"] == scheduled["id"] for e in events)

        published = publish_now(scheduled["id"], db=db).data
        assert published["status"] == "Published"

        queue = get_publishing_queue(db=db).data
        assert any(i["id"] == scheduled["id"] and i["status"] == "Published" for i in queue["items"])
    finally:
        db.close()

