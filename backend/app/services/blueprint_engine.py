from typing import List, Dict, Any
from app.schemas.blueprint import DesignBlueprint, SlideBlueprint, SlideElement

class BlueprintEngine:
    """
    Controlled Design Blueprint Engine.
    Produces strictly validated structured JSON describing visual slides.
    Never executes arbitrary AI-generated code.
    """

    @staticmethod
    def generate_carousel_blueprint(
        brand_id: str,
        brand_name: str,
        title: str,
        topic_brief: str,
        slides_count: int = 5,
        platform: str = "Instagram",
        archetype: str = "High-Contrast Technical Minimalist",
        primary_color: str = "#0F172A",
        accent_color: str = "#3B82F6"
    ) -> DesignBlueprint:
        # Determine canvas dimensions
        width, height = 1080, 1350
        if "1080x1080" in platform or "Square" in platform:
            width, height = 1080, 1080
        elif "1600x900" in platform or "Landscape" in platform:
            width, height = 1600, 900

        slides: List[SlideBlueprint] = []

        # Slide 1: Hook Slide
        slides.append(
            SlideBlueprint(
                id=1,
                slide_number=1,
                badge="HOOK [01]",
                headline=title.upper(),
                subhead=f"A strategic breakdown for modern teams: {topic_brief[:80]}...",
                type="hook",
                elements=[
                    SlideElement(
                        id="badge_1",
                        type="badge",
                        content="CORE FOCUS",
                        styles={"color": "#FFFFFF", "background": "rgba(255,255,255,0.1)", "radius": 4}
                    ),
                    SlideElement(
                        id="headline_1",
                        type="headline",
                        content=title.upper(),
                        styles={"fontSize": 32, "fontWeight": 700, "color": "#FFFFFF"}
                    ),
                    SlideElement(
                        id="subhead_1",
                        type="subhead",
                        content=topicBrief if (topicBrief := topic_brief[:100]) else "Precision framework",
                        styles={"fontSize": 16, "fontWeight": 400, "color": "#94A3B8"}
                    ),
                    SlideElement(
                        id="footer_1",
                        type="footer",
                        content=f"{brand_name.upper()} · SWIPE →",
                        styles={"fontSize": 12, "color": "#64748B"}
                    )
                ]
            )
        )

        # Slides 2 to slides_count - 1: Content Breakdown
        for i in range(2, slides_count):
            slides.append(
                SlideBlueprint(
                    id=i,
                    slide_number=i,
                    badge=f"STEP [0{i}]",
                    headline=f"PHASE 0{i - 1}: CRITICAL LEVERAGE POINT",
                    subhead=f"Focus on systematic execution. Eliminate unnecessary friction across the operational pipeline.",
                    type="content",
                    elements=[
                        SlideElement(
                            id=f"badge_{i}",
                            type="badge",
                            content=f"0{i} / 0{slides_count}",
                            styles={"color": "#FFFFFF", "background": "rgba(255,255,255,0.08)"}
                        ),
                        SlideElement(
                            id=f"headline_{i}",
                            type="headline",
                            content=f"PHASE 0{i - 1}: CRITICAL EXECUTION",
                            styles={"fontSize": 26, "fontWeight": 700, "color": "#FFFFFF"}
                        ),
                        SlideElement(
                            id=f"subhead_{i}",
                            type="subhead",
                            content="Structure your variables before scaling output. Precision outperforms volume every time.",
                            styles={"fontSize": 15, "fontWeight": 400, "color": "#CBD5E1"}
                        )
                    ]
                )
            )

        # Final Slide: CTA Outro
        slides.append(
            SlideBlueprint(
                id=slides_count,
                slide_number=slides_count,
                badge="TAKEAWAY",
                headline="READY TO DEPLOY THIS SYSTEM?",
                subhead=f"Save this guide for reference or visit the link in bio to explore {brand_name}.",
                type="cta",
                elements=[
                    SlideElement(
                        id=f"badge_{slides_count}",
                        type="badge",
                        content="ACTION REQUIRED",
                        styles={"color": accent_color, "background": "rgba(59,130,246,0.15)"}
                    ),
                    SlideElement(
                        id=f"headline_{slides_count}",
                        type="headline",
                        content="READY TO DEPLOY THIS SYSTEM?",
                        styles={"fontSize": 28, "fontWeight": 800, "color": "#FFFFFF"}
                    ),
                    SlideElement(
                        id=f"cta_btn_{slides_count}",
                        type="shape",
                        content="SAVE TO ARCHIVES",
                        styles={"background": accent_color, "color": "#FFFFFF", "radius": 6}
                    )
                ]
            )
        )

        return DesignBlueprint(
            version="1.0",
            title=title,
            platform=platform,
            aspect_ratio="4:5" if height == 1350 else "1:1",
            width=width,
            height=height,
            archetype=archetype,
            slides=slides,
            brand_id=brand_id,
            safe_margin_px=80
        )

