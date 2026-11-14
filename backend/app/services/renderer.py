import io
import os
import textwrap
import zipfile
from typing import Dict, Any, List
from PIL import Image, ImageDraw, ImageFont

class ControlledBlueprintRenderer:
    """
    Deterministic Controlled Renderer per PRD 02_TECHNICAL_ARCHITECTURE.md.
    Converts validated Design Blueprint JSON into crisp, high-resolution PNG images
    using Pillow without executing arbitrary AI-generated code.
    """

    @staticmethod
    def _load_font(size: int, bold: bool = False):
        # Attempt standard Windows / Linux fonts, fallback cleanly to default bitmap font
        font_candidates = []
        if bold:
            font_candidates = [
                "C:\\Windows\\Fonts\\arialbd.ttf",
                "C:\\Windows\\Fonts\\segoeuib.ttf",
                "C:\\Windows\\Fonts\\calibrib.ttf",
                "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            ]
        else:
            font_candidates = [
                "C:\\Windows\\Fonts\\arial.ttf",
                "C:\\Windows\\Fonts\\segoeui.ttf",
                "C:\\Windows\\Fonts\\calibri.ttf",
                "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            ]

        for path in font_candidates:
            if os.path.exists(path):
                try:
                    return ImageFont.truetype(path, size)
                except Exception:
                    continue
        return ImageFont.load_default()

    @classmethod
    def render_slide_to_png_bytes(
        cls,
        slide: Dict[str, Any],
        slide_index: int,
        total_slides: int,
        brand_name: str = "PULSEFIT ATHLETICS",
        width: int = 1080,
        height: int = 1350,
        bg_hex: str = "#0F172A",
        accent_hex: str = "#3B82F6",
        bg_image_bytes: Optional[bytes] = None,
    ) -> bytes:
        # 1. Initialize Canvas: either with genuine AI image foundation or clean matte background
        if bg_image_bytes:
            try:
                raw_bg = Image.open(io.BytesIO(bg_image_bytes)).convert("RGB")
                # Center crop to target aspect ratio
                rw, rh = raw_bg.size
                target_ratio = width / height
                cur_ratio = rw / rh
                if cur_ratio > target_ratio:
                    new_w = int(rh * target_ratio)
                    offset_x = (rw - new_w) // 2
                    cropped = raw_bg.crop((offset_x, 0, offset_x + new_w, rh))
                else:
                    new_h = int(rw / target_ratio)
                    offset_y = (rh - new_h) // 2
                    cropped = raw_bg.crop((0, offset_y, rw, offset_y + new_h))

                base_img = cropped.resize((width, height), Image.Resampling.LANCZOS).convert("RGBA")

                # Controlled contrast gradient overlay for maximum typographic legibility
                overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
                draw_ov = ImageDraw.Draw(overlay)
                for y in range(height):
                    # Subtle gradient from 45% black at top to 85% deep slate at bottom
                    alpha = int(90 + (y / height) * 130)
                    draw_ov.line([(0, y), (width, y)], fill=(15, 23, 42, alpha))

                img = Image.alpha_composite(base_img, overlay).convert("RGB")
            except Exception:
                img = Image.new("RGB", (width, height), color=bg_hex)
        else:
            img = Image.new("RGB", (width, height), color=bg_hex)

        draw = ImageDraw.Draw(img)

        margin = 80  # Strict safe margin per Visual DNA rules

        # 2. Subtle inner border frame (Matte Slate 800)
        draw.rectangle(
            [(24, 24), (width - 24, height - 24)],
            outline="#1E293B",
            width=2
        )

        # 3. Fonts
        font_badge = cls._load_font(22, bold=True)
        font_headline = cls._load_font(62, bold=True)
        font_subhead = cls._load_font(34, bold=False)
        font_footer = cls._load_font(22, bold=True)

        # 4. Header: Badge pill (top-left) and Slide Counter (top-right)
        badge_text = str(slide.get("badge", "POINT")).upper()
        badge_bbox = draw.textbbox((0, 0), badge_text, font=font_badge)
        badge_w = (badge_bbox[2] - badge_bbox[0]) + 36
        badge_h = 48

        draw.rounded_rectangle(
            [(margin, margin), (margin + badge_w, margin + badge_h)],
            radius=8,
            fill="#1E293B",
            outline="#334155",
            width=1
        )
        draw.text(
            (margin + 18, margin + 12),
            badge_text,
            font=font_badge,
            fill="#CBD5E1"
        )

        counter_text = f"[{slide_index + 1:02d}/{total_slides:02d}]"
        counter_bbox = draw.textbbox((0, 0), counter_text, font=font_badge)
        counter_w = counter_bbox[2] - counter_bbox[0]
        draw.text(
            (width - margin - counter_w, margin + 12),
            counter_text,
            font=font_badge,
            fill="#64748B"
        )

        # 5. Main Content Area (Centered vertically in safe zone)
        headline = str(slide.get("headline", "PRECISION PERFORMANCE")).upper()
        subhead = str(slide.get("subhead", ""))

        # Wrap headline nicely
        wrapped_headline = textwrap.wrap(headline, width=22)
        wrapped_subhead = textwrap.wrap(subhead, width=38)

        # Calculate total text block height for vertical centering
        headline_line_h = 74
        subhead_line_h = 46
        block_gap = 36

        total_text_h = (len(wrapped_headline) * headline_line_h) + block_gap + (len(wrapped_subhead) * subhead_line_h)
        current_y = max(margin + 120, (height - total_text_h) // 2 - 20)

        # Draw subtle accent line above headline
        draw.rectangle(
            [(margin, current_y - 32), (margin + 72, current_y - 26)],
            fill=accent_hex
        )

        for line in wrapped_headline:
            draw.text((margin, current_y), line, font=font_headline, fill="#FFFFFF")
            current_y += headline_line_h

        current_y += block_gap

        for line in wrapped_subhead:
            draw.text((margin, current_y), line, font=font_subhead, fill="#94A3B8")
            current_y += subhead_line_h

        # 6. CTA Button if final CTA slide
        if slide.get("type") == "cta":
            btn_y = current_y + 40
            btn_text = "EXPLORE MORE  →"
            btn_bbox = draw.textbbox((0, 0), btn_text, font=font_badge)
            btn_w = (btn_bbox[2] - btn_bbox[0]) + 56
            draw.rounded_rectangle(
                [(margin, btn_y), (margin + btn_w, btn_y + 58)],
                radius=10,
                fill=accent_hex
            )
            draw.text((margin + 28, btn_y + 17), btn_text, font=font_badge, fill="#FFFFFF")

        # 7. Footer (bottom border + brand name + swipe prompt)
        footer_y = height - margin - 40
        draw.line(
            [(margin, footer_y - 24), (width - margin, footer_y - 24)],
            fill="#1E293B",
            width=2
        )
        draw.text((margin, footer_y), brand_name.upper(), font=font_footer, fill="#64748B")

        swipe_text = "VISIT LINK IN BIO" if slide_index == total_slides - 1 else "SWIPE NEXT  →"
        swipe_bbox = draw.textbbox((0, 0), swipe_text, font=font_footer)
        swipe_w = swipe_bbox[2] - swipe_bbox[0]
        draw.text((width - margin - swipe_w, footer_y), swipe_text, font=font_footer, fill="#64748B")

        # Save to bytes buffer
        buf = io.BytesIO()
        img.save(buf, format="PNG", optimize=True)
        buf.seek(0)
        return buf.getvalue()

    @classmethod
    def export_blueprint_package(cls, blueprint: Dict[str, Any], brand_name: str = "PULSEFIT ATHLETICS", bg_image_bytes: Optional[bytes] = None) -> tuple[bytes, str, str]:
        """
        Exports a blueprint into either a single PNG (1 slide) or a ZIP archive of PNGs (carousel).
        Returns (file_bytes, media_type, filename).
        """
        slides: List[Dict[str, Any]] = blueprint.get("slides", [])
        if not slides:
            slides = [{"badge": "PREVIEW", "headline": blueprint.get("title", "XYZ Creative"), "subhead": ""}]

        width = int(blueprint.get("width", 1080))
        height = int(blueprint.get("height", 1350))
        total = len(slides)

        if total == 1:
            png_bytes = cls.render_slide_to_png_bytes(
                slides[0], 0, 1, brand_name=brand_name, width=width, height=height, bg_image_bytes=bg_image_bytes
            )
            return png_bytes, "image/png", "xyz_creative_post.png"

        # Multi-slide carousel: bundle all slides cleanly into an ordered ZIP file
        zip_buf = io.BytesIO()
        with zipfile.ZipFile(zip_buf, "w", zipfile.ZIP_DEFLATED) as zf:
            for idx, slide in enumerate(slides):
                png_bytes = cls.render_slide_to_png_bytes(
                    slide, idx, total, brand_name=brand_name, width=width, height=height, bg_image_bytes=bg_image_bytes
                )
                zf.writestr(f"slide_{idx + 1:02d}.png", png_bytes)

        zip_buf.seek(0)
        return zip_buf.getvalue(), "application/zip", "xyz_carousel_export.zip"

