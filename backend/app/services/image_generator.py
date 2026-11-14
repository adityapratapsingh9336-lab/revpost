import io
import os
import time
import uuid
import random
import logging
import urllib.parse
import requests
from typing import Optional, Dict, Any, Tuple
from PIL import Image
from app.config import settings

logger = logging.getLogger("uvicorn")

class ImageGeneratorService:
    """
    Genuine AI Image Generation Service.
    Produces brand-new, unique high-resolution images for each generation request
    using real diffusion/foundation models (Flux.1 / SDXL / DALL-E).
    Never uses hardcoded templates or static placeholders.
    """

    @classmethod
    def generate_image(
        cls,
        visual_prompt: str,
        width: int = 1080,
        height: int = 1350,
        provider: str = "flux",
        archetype: Optional[str] = None,
        brand_palette: Optional[list] = None
    ) -> Tuple[bytes, Dict[str, Any]]:
        """
        Invokes an actual image-generation model with the visual prompt.
        Returns (image_bytes, generation_metadata).
        Raises RuntimeError on failure (never silently returns a fake image).
        """
        start_time = time.time()
        generation_id = f"gen_{uuid.uuid4().hex[:12]}_{int(time.time())}"
        
        # Clean and enrich the prompt for maximum visual quality
        style_suffix = "cinematic lighting, hyper-realistic, 8k resolution, professional architectural and commercial photography, high dynamic range, clean composition"
        if archetype and "minimalist" in archetype.lower():
            style_suffix = "minimalist aesthetics, clean negative space, architectural digest photography, muted premium tones, 8k"
        elif archetype and "editorial" in archetype.lower():
            style_suffix = "editorial magazine photography, studio lighting, high fashion commercial framing, award-winning cinematography"
        
        full_prompt = f"{visual_prompt.strip()}, {style_suffix}"
        seed = random.randint(1000, 99999999)
        
        logger.info(
            "[ImageGenerator] Starting image generation [id=%s, model=%s, size=%dx%d, seed=%d]",
            generation_id, provider, width, height, seed
        )

        # 1. Attempt Cloudflare Workers AI if token & account ID are configured
        cf_token = getattr(settings, "CLOUDFLARE_API_TOKEN", None) or os.getenv("CLOUDFLARE_API_TOKEN")
        cf_account_id = getattr(settings, "CLOUDFLARE_ACCOUNT_ID", None) or os.getenv("CLOUDFLARE_ACCOUNT_ID")
        if cf_token and cf_account_id:
            cf_models = [
                "@cf/black-forest-labs/flux-1-schnell",
                "@cf/stabilityai/stable-diffusion-xl-base-1.0",
                "@cf/bytedance/stable-diffusion-xl-lightning"
            ]
            for cf_m in cf_models:
                try:
                    cf_url = f"https://api.cloudflare.com/client/v4/accounts/{cf_account_id}/ai/run/{cf_m}"
                    cf_headers = {
                        "Authorization": f"Bearer {cf_token}",
                        "Content-Type": "application/json"
                    }
                    cf_payload = {
                        "prompt": full_prompt[:500],
                        "num_steps": 20
                    }
                    res = requests.post(cf_url, headers=cf_headers, json=cf_payload, timeout=25)
                    if res.status_code == 200 and len(res.content) > 1000:
                        image_bytes = res.content
                        img = Image.open(io.BytesIO(image_bytes))
                        img.verify()

                        img = Image.open(io.BytesIO(image_bytes))
                        if img.size != (width, height):
                            img = img.resize((width, height), Image.Resampling.LANCZOS)
                            buf = io.BytesIO()
                            img.save(buf, format="JPEG", quality=92)
                            image_bytes = buf.getvalue()

                        latency_ms = int((time.time() - start_time) * 1000)
                        meta = {
                            "generation_id": generation_id,
                            "provider": "cloudflare-workers-ai",
                            "model": cf_m,
                            "prompt": full_prompt,
                            "seed": seed,
                            "width": width,
                            "height": height,
                            "latency_ms": latency_ms,
                            "status": "completed"
                        }
                        logger.info("[ImageGenerator] Cloudflare Workers AI (%s) generated image in %dms", cf_m, latency_ms)
                        return image_bytes, meta
                    else:
                        logger.info("[ImageGenerator] Cloudflare model %s returned status %d. Trying next engine.", cf_m, res.status_code)
                except Exception as cf_err:
                    logger.info("[ImageGenerator] Cloudflare Workers AI call notice: %s", cf_err)

        # 2. Attempt OpenAI DALL-E 3 if key is configured and requested
        openai_key = settings.OPENAI_API_KEY
        if provider == "dall-e-3" and openai_key:
            try:
                from openai import OpenAI
                client = OpenAI(api_key=openai_key)
                dalle_size = "1024x1024" if width == height else "1024x1792"
                resp = client.images.generate(
                    model="dall-e-3",
                    prompt=full_prompt[:1000],
                    size=dalle_size,
                    quality="standard",
                    n=1
                )
                image_url = resp.data[0].url
                img_res = requests.get(image_url, timeout=30)
                if img_res.status_code == 200:
                    image_bytes = img_res.content
                    latency_ms = int((time.time() - start_time) * 1000)
                    meta = {
                        "generation_id": generation_id,
                        "provider": "openai",
                        "model": "dall-e-3",
                        "prompt": full_prompt,
                        "seed": seed,
                        "width": width,
                        "height": height,
                        "latency_ms": latency_ms,
                        "status": "completed"
                    }
                    logger.info("[ImageGenerator] OpenAI DALL-E 3 generation succeeded in %dms", latency_ms)
                    return image_bytes, meta
            except Exception as e:
                logger.warning("[ImageGenerator] OpenAI DALL-E call failed: %s. Switching to Flux diffusion engine.", e)

        # 2. Production Cloud Diffusion Engine (SDXL Turbo / Flux.1 Schnell)
        # Guarantees fresh unique synthesis per request using prompt and random seed
        encoded_prompt = urllib.parse.quote(full_prompt[:250])  # Clean URL length
        gen_w = 768 if width <= 1080 else 1024
        gen_h = 960 if height > width else (768 if height == width else 576)

        pollen_key = os.getenv("POLLEN_API_KEY") or getattr(settings, "POLLEN_API_KEY", None)

        # Prefer turbo/flux
        model_name = "turbo" if provider in ("flux", "turbo", "sdxl") else provider
        url = (
            f"https://image.pollinations.ai/prompt/{encoded_prompt}"
            f"?width={gen_w}&height={gen_h}&model={model_name}&seed={seed}&nologo=true"
        )

        req_headers = {
            "User-Agent": "XYZ-RevPost-AI-Generator/2.0",
            "Accept": "image/jpeg,image/png,image/*"
        }
        if pollen_key:
            req_headers["Authorization"] = f"Bearer {pollen_key}"

        max_attempts = 2
        for attempt in range(max_attempts):
            try:
                res = requests.get(url, headers=req_headers, timeout=35)
                
                # Check for rate limit
                if res.status_code in (402, 503) and "FREE_LIMIT" in res.text:
                    import re
                    m = re.search(r"Retry after (\d+)s", res.text)
                    wait_seconds = int(m.group(1)) if m else 15
                    if wait_seconds <= 15 and attempt == 0:
                        logger.info("[ImageGenerator] Rate limit hit. Waiting %ds for retry attempt...", wait_seconds + 1)
                        time.sleep(wait_seconds + 1)
                        continue
                    else:
                        raise RuntimeError(
                            f"Cloud diffusion rate limit: 1 image every 45s on free tier. "
                            f"Please retry in {wait_seconds}s or configure an API key."
                        )

                if res.status_code != 200:
                    raise RuntimeError(f"Image generation provider returned HTTP {res.status_code}: {res.text[:180]}")

                image_bytes = res.content
                # Verify actual image content with Pillow
                img = Image.open(io.BytesIO(image_bytes))
                img.verify()

                # Re-read image for scaling/post-processing
                img = Image.open(io.BytesIO(image_bytes))
                if img.size != (width, height):
                    img = img.resize((width, height), Image.Resampling.LANCZOS)
                    buf = io.BytesIO()
                    img.save(buf, format="JPEG", quality=92)
                    image_bytes = buf.getvalue()

                latency_ms = int((time.time() - start_time) * 1000)
                meta = {
                    "generation_id": generation_id,
                    "provider": "pollinations-diffusion",
                    "model": f"sdxl-{model_name}",
                    "prompt": full_prompt,
                    "seed": seed,
                    "width": width,
                    "height": height,
                    "latency_ms": latency_ms,
                    "status": "completed"
                }
                logger.info(
                    "[ImageGenerator] Genuine AI image generated successfully in %dms (%d bytes, %dx%d)",
                    latency_ms, len(image_bytes), width, height
                )
                return image_bytes, meta

            except Exception as exc:
                if attempt == max_attempts - 1:
                    logger.error("[ImageGenerator] Image generation failed on attempt %d: %s", attempt + 1, exc)
                    raise RuntimeError(f"AI image generation failed: {exc}")
                time.sleep(2)

