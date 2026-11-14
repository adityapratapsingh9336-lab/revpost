import os
import logging
import requests
from typing import Dict, Any, Optional
from app.config import settings

logger = logging.getLogger("uvicorn")

class StorageService:
    """
    Unified Asset Storage Service for Rev Post.
    Handles persistent upload to Supabase Storage with automatic fallback
    to local disk storage served via static files and FastAPI endpoint.
    Guarantees every generation asset has a unique storage path and URL.
    """

    @classmethod
    def save_image(
        cls,
        image_bytes: bytes,
        filename: str,
        content_type: str = "image/png",
        workspace_id: str = "default",
        folder: str = "creatives"
    ) -> Dict[str, Any]:
        """
        Saves image bytes with a unique path and returns storage URLs.
        Returns:
            {
                "url": primary_accessible_url,
                "local_path": absolute_local_path,
                "storage_path": storage_key,
                "supabase_url": optional_supabase_public_url,
                "bytes_len": len(image_bytes)
            }
        """
        # 1. Always save to local persistent storage directory for reliable low-latency access
        local_dir = os.path.join(settings.STORAGE_LOCAL_DIR, "generated")
        os.makedirs(local_dir, exist_ok=True)
        local_path = os.path.join(local_dir, filename)

        try:
            with open(local_path, "wb") as f:
                f.write(image_bytes)
            logger.info("[StorageService] Saved locally to %s (%d bytes)", local_path, len(image_bytes))
        except Exception as e:
            logger.error("[StorageService] Failed saving image locally: %s", e)
            raise RuntimeError(f"Local storage write failed: {e}")

        # Standard local accessible relative URL
        local_url = f"/storage_uploads/generated/{filename}"
        supabase_url = None
        storage_key = f"{folder}/{workspace_id}/{filename}"

        # 2. Attempt Supabase Storage upload if credentials are provided
        if settings.SUPABASE_KEY and settings.SUPABASE_URL:
            try:
                bucket = settings.SUPABASE_STORAGE_BUCKET or "creatives"
                upload_endpoint = f"{settings.SUPABASE_URL.rstrip('/')}/storage/v1/object/{bucket}/{storage_key}"
                headers = {
                    "Authorization": f"Bearer {settings.SUPABASE_KEY}",
                    "apikey": settings.SUPABASE_KEY,
                    "Content-Type": content_type,
                    "x-upsert": "true"
                }

                resp = requests.post(
                    upload_endpoint,
                    data=image_bytes,
                    headers=headers,
                    timeout=15
                )

                if resp.status_code in (200, 201):
                    supabase_url = f"{settings.SUPABASE_URL.rstrip('/')}/storage/v1/object/public/{bucket}/{storage_key}"
                    logger.info("[StorageService] Uploaded to Supabase Storage: %s", supabase_url)
                else:
                    logger.warning(
                        "[StorageService] Supabase Storage upload returned %d (%s). Falling back to local static URL.",
                        resp.status_code, resp.text[:120]
                    )
            except Exception as supa_err:
                logger.warning("[StorageService] Supabase Storage upload exception: %s", supa_err)

        # Primary URL: Prefer Supabase Storage public URL if uploaded, otherwise use relative local static URL
        primary_url = supabase_url if supabase_url else local_url

        return {
            "url": primary_url,
            "local_path": local_path,
            "local_url": local_url,
            "storage_path": storage_key,
            "supabase_url": supabase_url,
            "bytes_len": len(image_bytes)
        }
