import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.workspace import Workspace, WorkspaceMember
from app.schemas.common import ApiResponse
from app.auth import require_role

router = APIRouter(prefix="/api/v1/workspaces", tags=["Workspaces"])

def _ensure_default_workspace(db: Session) -> Workspace:
    ws = db.query(Workspace).first()
    if not ws:
        ws = Workspace(
            name="My Workspace",
            slug="my-workspace",
            tier="Pro Enterprise",
            owner_id="user_admin"
        )
        db.add(ws)
        db.commit()
        db.refresh(ws)

    if not ws.members:
        seed_members = [
            WorkspaceMember(workspace_id=ws.id, user_id="user_admin", name="Workspace Owner", email="admin@xyz.app", role="Owner", status="Active"),
        ]
        db.add_all(seed_members)
        db.commit()
        db.refresh(ws)
    return ws

@router.get("", response_model=ApiResponse[List[dict]])
def get_workspaces(db: Session = Depends(get_db)):
    workspaces = db.query(Workspace).all()
    if not workspaces:
        workspaces = [_ensure_default_workspace(db)]

    return ApiResponse(
        data=[
            {
                "id": ws.id,
                "name": ws.name,
                "slug": ws.slug,
                "tier": ws.tier,
                "owner_id": ws.owner_id,
                "membersCount": len(ws.members),
                "created_at": ws.created_at.isoformat()
            }
            for ws in workspaces
        ]
    )

@router.post("", response_model=ApiResponse[dict])
def create_workspace(payload: dict, db: Session = Depends(get_db), _auth=Depends(require_role(["owner", "admin", "editor"]))):
    name = payload.get("name", "New Workspace").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Workspace name is required.")
    slug = name.lower().replace(" ", "-")
    ws = Workspace(name=name, slug=slug, tier=payload.get("tier", "Starter"), owner_id="user_admin")
    db.add(ws)
    db.commit()
    db.refresh(ws)
    owner_member = WorkspaceMember(
        workspace_id=ws.id,
        user_id="user_admin",
        name="Aditya (You)",
        email="aditya@example.com",
        role="Owner",
        status="Active"
    )
    db.add(owner_member)
    db.commit()
    return ApiResponse(
        data={
            "id": ws.id,
            "name": ws.name,
            "slug": ws.slug,
            "tier": ws.tier,
            "membersCount": 1,
            "created_at": ws.created_at.isoformat()
        }
    )

@router.patch("/{workspace_id}", response_model=ApiResponse[dict])
def update_workspace(workspace_id: str, payload: dict, db: Session = Depends(get_db), _auth=Depends(require_role(["owner", "admin"]))):
    ws = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    if "name" in payload and payload["name"].strip():
        ws.name = payload["name"].strip()
    db.commit()
    db.refresh(ws)
    return ApiResponse(data={"id": ws.id, "name": ws.name, "slug": ws.slug})

@router.get("/{workspace_id}/members", response_model=ApiResponse[List[dict]])
def get_workspace_members(workspace_id: str, db: Session = Depends(get_db)):
    ws = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not ws:
        ws = _ensure_default_workspace(db)
    return ApiResponse(
        data=[
            {
                "id": m.id,
                "name": m.name,
                "email": m.email,
                "role": m.role,
                "status": m.status,
                "created_at": m.created_at.isoformat(),
            }
            for m in ws.members
        ]
    )

@router.post("/{workspace_id}/members", response_model=ApiResponse[dict])
def invite_workspace_member(workspace_id: str, payload: dict, db: Session = Depends(get_db), _auth=Depends(require_role(["owner", "admin"]))):
    ws = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not ws:
        ws = _ensure_default_workspace(db)

    email = payload.get("email", "").strip()
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Valid email is required.")
    role = payload.get("role", "Editor")
    name = payload.get("name") or email.split("@")[0].capitalize()

    member = WorkspaceMember(
        workspace_id=ws.id,
        user_id=f"user_{uuid.uuid4().hex[:8]}",
        name=name,
        email=email,
        role=role,
        status="Invited"
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    return ApiResponse(
        data={
            "id": member.id,
            "name": member.name,
            "email": member.email,
            "role": member.role,
            "status": member.status
        }
    )

@router.patch("/{workspace_id}/members/{member_id}", response_model=ApiResponse[dict])
def update_member_role(workspace_id: str, member_id: str, payload: dict, db: Session = Depends(get_db), _auth=Depends(require_role(["owner", "admin"]))):
    member = db.query(WorkspaceMember).filter(WorkspaceMember.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    if "role" in payload:
        member.role = payload["role"]
    db.commit()
    db.refresh(member)
    return ApiResponse(data={"id": member.id, "role": member.role})

@router.delete("/{workspace_id}/members/{member_id}", response_model=ApiResponse[dict])
def remove_workspace_member(workspace_id: str, member_id: str, db: Session = Depends(get_db), _auth=Depends(require_role(["owner", "admin"]))):
    member = db.query(WorkspaceMember).filter(WorkspaceMember.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    if member.role.lower() == "owner":
        raise HTTPException(status_code=400, detail="Cannot remove workspace owner.")
    db.delete(member)
    db.commit()
    return ApiResponse(data={"deleted_id": member_id})
