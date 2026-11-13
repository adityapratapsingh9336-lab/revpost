from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.social import SocialAccount
from app.schemas.common import ApiResponse
from app.auth import require_role

router = APIRouter(prefix="/api/v1/social", tags=["Social Accounts"])

def _seed_social_accounts(db: Session) -> List[SocialAccount]:
    seeds = [
        SocialAccount(
            id="soc_1",
            workspace_id="ws_default",
            brand_id="brand_1",
            platform="Instagram Business",
            account_name="Not Connected",
            status="Disconnected",
            health="Ready to Connect",
            token_expires_in="N/A",
            followers="0",
            avatar="📸",
            scopes=["instagram_basic", "instagram_content_publish"]
        ),
        SocialAccount(
            id="soc_2",
            workspace_id="ws_default",
            brand_id="brand_1",
            platform="LinkedIn Company",
            account_name="Not Connected",
            status="Disconnected",
            health="Ready to Connect",
            token_expires_in="N/A",
            followers="0",
            avatar="💼",
            scopes=["w_member_social", "r_organization_social"]
        ),
        SocialAccount(
            id="soc_3",
            workspace_id="ws_default",
            brand_id="brand_1",
            platform="X (Twitter) v2",
            account_name="Not Connected",
            status="Disconnected",
            health="Ready to Connect",
            token_expires_in="N/A",
            followers="0",
            avatar="🐦",
            scopes=["tweet.read", "tweet.write"]
        ),
        SocialAccount(
            id="soc_4",
            workspace_id="ws_default",
            brand_id="brand_1",
            platform="Facebook Page",
            account_name="Not Connected",
            status="Disconnected",
            health="Ready to Connect",
            token_expires_in="N/A",
            followers="0",
            avatar="📘",
            scopes=["pages_show_list", "pages_manage_posts"]
        )
    ]
    db.add_all(seeds)
    db.commit()
    return db.query(SocialAccount).all()

def _serialize_account(a: SocialAccount) -> dict:
    return {
        "id": a.id,
        "platform": a.platform,
        "accountName": a.account_name,
        "status": a.status,
        "tokenExpiresIn": a.token_expires_in,
        "health": a.health,
        "permissions": a.scopes,
        "followers": a.followers,
        "avatar": a.avatar
    }

@router.get("/accounts", response_model=ApiResponse[List[dict]])
def get_social_accounts(db: Session = Depends(get_db)):
    accounts = db.query(SocialAccount).all()
    if not accounts:
        accounts = _seed_social_accounts(db)
    return ApiResponse(data=[_serialize_account(a) for a in accounts])

@router.post("/connect", response_model=ApiResponse[dict])
def connect_social_account(payload: dict, db: Session = Depends(get_db), _auth=Depends(require_role(["owner", "admin"]))):
    platform_query = payload.get("platform", "Instagram")
    accounts = db.query(SocialAccount).all()
    if not accounts:
        accounts = _seed_social_accounts(db)

    target = next((a for a in accounts if platform_query.lower() in a.platform.lower()), None)
    if not target:
        target = SocialAccount(
            workspace_id="ws_default",
            brand_id="brand_1",
            platform=platform_query,
            account_name=payload.get("account_name", f"@{platform_query.lower()}.official"),
            status="Connected",
            health="Optimal",
            token_expires_in="90 days",
            followers="1.2K",
            avatar="🌐",
            scopes=["publish_content", "read_insights"]
        )
        db.add(target)
    else:
        target.status = "Connected"
        target.health = "Optimal"
        target.token_expires_in = "90 days"

    db.commit()
    db.refresh(target)
    return ApiResponse(data=_serialize_account(target))

@router.post("/{account_id}/revoke", response_model=ApiResponse[dict])
def revoke_social_account(account_id: str, db: Session = Depends(get_db), _auth=Depends(require_role(["owner", "admin"]))):
    acc = db.query(SocialAccount).filter(SocialAccount.id == account_id).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Social account not found")
    acc.status = "Requires Reauth"
    acc.health = "Revoked"
    acc.token_expires_in = "Revoked"
    db.commit()
    db.refresh(acc)
    return ApiResponse(data=_serialize_account(acc))
