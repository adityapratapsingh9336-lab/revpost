import io
import zipfile
from PIL import Image
from app.services.renderer import ControlledBlueprintRenderer
from app.services.blueprint_engine import BlueprintEngine

def test_render_single_slide_png():
    slide = {
        "badge": "HOOK [01]",
        "headline": "4 KINETIC DRILLS FOR RUNNERS",
        "subhead": "Optimize hip mobility without overloading the patellar tendon.",
        "type": "hook"
    }
    png_bytes = ControlledBlueprintRenderer.render_slide_to_png_bytes(
        slide=slide,
        slide_index=0,
        total_slides=5,
        brand_name="PULSEFIT ATHLETICS"
    )
    assert len(png_bytes) > 1000
    img = Image.open(io.BytesIO(png_bytes))
    assert img.format == "PNG"
    assert img.size == (1080, 1350)

def test_export_carousel_zip_package():
    bp = BlueprintEngine.generate_carousel_blueprint(
        brand_id="brand_1",
        brand_name="PulseFit",
        title="Winter Training Layering",
        topic_brief="Thermodynamic base layers for sub-zero cardio.",
        slides_count=4
    ).dict()

    file_bytes, media_type, filename = ControlledBlueprintRenderer.export_blueprint_package(
        blueprint=bp, brand_name="PulseFit"
    )
    assert media_type == "application/zip"
    assert filename == "xyz_carousel_export.zip"

    with zipfile.ZipFile(io.BytesIO(file_bytes), "r") as zf:
        names = zf.namelist()
        assert names == ["slide_01.png", "slide_02.png", "slide_03.png", "slide_04.png"]
        first_slide = Image.open(io.BytesIO(zf.read("slide_01.png")))
        assert first_slide.size == (1080, 1350)

