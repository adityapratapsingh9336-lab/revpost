from app.services.blueprint_engine import BlueprintEngine
from app.schemas.blueprint import DesignBlueprint

def test_carousel_blueprint_generation():
    slides_count = 5
    blueprint = BlueprintEngine.generate_carousel_blueprint(
        brand_id="brand_test_123",
        brand_name="PulseFit Athletics",
        title="4 Mobility Drills For Stride Frequency",
        topic_brief="Fix your hip hinge before your first mile to prevent knee loading.",
        slides_count=slides_count,
        platform="Instagram",
        archetype="High-Contrast Technical Minimalist",
        primary_color="#0F172A",
        accent_color="#3B82F6"
    )

    assert isinstance(blueprint, DesignBlueprint)
    assert blueprint.version == "1.0"
    assert blueprint.width == 1080
    assert blueprint.height == 1350
    assert len(blueprint.slides) == slides_count

    # Slide 1 must be a hook
    slide_1 = blueprint.slides[0]
    assert slide_1.type == "hook"
    assert slide_1.slide_number == 1
    assert any(el.type == "headline" for el in slide_1.elements)

    # Middle slides must be content breakdown
    for slide in blueprint.slides[1:slides_count - 1]:
        assert slide.type == "content"
        assert len(slide.elements) >= 2

    # Final slide must be CTA
    last_slide = blueprint.slides[-1]
    assert last_slide.type == "cta"
    assert last_slide.slide_number == slides_count

def test_square_aspect_ratio_dimensions():
    blueprint = BlueprintEngine.generate_carousel_blueprint(
        brand_id="brand_test_123",
        brand_name="PulseFit",
        title="Square Post",
        topic_brief="Brief topic",
        slides_count=3,
        platform="Square 1080x1080",
    )
    assert blueprint.width == 1080
    assert blueprint.height == 1080
    assert blueprint.aspect_ratio == "1:1"

