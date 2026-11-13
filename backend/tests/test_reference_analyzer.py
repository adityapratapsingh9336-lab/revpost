import io
from PIL import Image
from app.services.reference_analyzer import ReferenceAnalyzer

def test_reference_image_palette_and_dimensions():
    # Generate a synthetic 1080x1350 test image with known matte colors
    img = Image.new("RGB", (1080, 1350), color="#0F172A")
    # Paint an accent region
    for x in range(100, 400):
        for y in range(100, 400):
            img.putpixel((x, y), (59, 130, 246))  # #3B82F6

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    metrics = ReferenceAnalyzer.analyze_image_bytes(buf.getvalue(), "test_slide.png")

    assert metrics["width"] == 1080
    assert metrics["height"] == 1350
    assert metrics["format"] == "PNG"
    assert "4:5 Portrait" in metrics["archetype"]
    assert "#0F172A" in metrics["extracted_palette"]
    assert "#3B82F6" in metrics["extracted_palette"]

