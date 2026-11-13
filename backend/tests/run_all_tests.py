import sys
import os

# Add backend root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import app.main  # Ensures Base.metadata.create_all and SQLite column migrations execute

from tests.test_ai_gateway import test_capability_aware_routing, test_generate_copy_and_hooks
from tests.test_blueprint_engine import test_carousel_blueprint_generation, test_square_aspect_ratio_dimensions
from tests.test_tenant_isolation import test_tenant_workspace_isolation
from tests.test_renderer import test_render_single_slide_png, test_export_carousel_zip_package
from tests.test_reference_analyzer import test_reference_image_palette_and_dimensions
from tests.test_rbac_and_persistence import (
    test_rbac_role_enforcement,
    test_reference_and_visual_dna_rebuild_flow,
    test_calendar_and_publishing_persistence,
)

def main():
    print("=" * 60)
    print("RUNNING XYZ BACKEND COMPREHENSIVE TEST SUITE")
    print("=" * 60)

    print("\n[Suite 1: AI Provider Gateway]")
    test_capability_aware_routing()
    print("  ✓ Capability-aware task routing passed")
    test_generate_copy_and_hooks()
    print("  ✓ Copy, hook, and hashtag generation passed")

    print("\n[Suite 2: Controlled Design Blueprint Engine]")
    test_carousel_blueprint_generation()
    print("  ✓ 5-slide carousel blueprint schema validation passed")
    test_square_aspect_ratio_dimensions()
    print("  ✓ Aspect ratio geometry (1:1 / 4:5) validation passed")

    print("\n[Suite 3: Multi-Tenant Workspace Isolation]")
    test_tenant_workspace_isolation()
    print("  ✓ Multi-tenant boundary separation verified")

    print("\n[Suite 4: Controlled Blueprint Image Renderer]")
    test_render_single_slide_png()
    print("  ✓ Single slide PNG render (1080x1350) passed")
    test_export_carousel_zip_package()
    print("  ✓ Multi-slide carousel ZIP export passed")

    print("\n[Suite 5: Visual Reference Analyzer]")
    test_reference_image_palette_and_dimensions()
    print("  ✓ Pixel color quantization & dimension extraction passed")

    print("\n[Suite 6: RBAC, Persistence & Publishing Workflow]")
    test_rbac_role_enforcement()
    print("  ✓ RBAC role authorization (403 on viewer writes) passed")
    test_reference_and_visual_dna_rebuild_flow()
    print("  ✓ Reference re-analysis & Visual DNA aggregation rebuild passed")
    test_calendar_and_publishing_persistence()
    print("  ✓ Content calendar scheduling & publishing queue transition passed")

    print("\n" + "=" * 60)
    print("ALL 11 TEST SUITES PASSED CLEANLY (100% SUCCESS RATE)")
    print("=" * 60)

if __name__ == "__main__":
    main()
