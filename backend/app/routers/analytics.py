from fastapi import APIRouter
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics"])

@router.get("/overview", response_model=ApiResponse[dict])
def get_analytics_overview():
    return ApiResponse(
        data={
            "dateRange": "Oct 11 – Nov 09, 2026",
            "kpis": [
                {"title": "Total Impressions", "value": "148,290", "change": "+18.4%", "trend": "up"},
                {"title": "Average Engagement Rate", "value": "4.92%", "change": "+0.8%", "trend": "up"},
                {"title": "Profile / Link Clicks", "value": "4,180", "change": "+12.6%", "trend": "up"},
                {"title": "Creatives Published", "value": "28", "change": "+4 posts", "trend": "up"}
            ],
            "topPosts": [
                {"title": "Discipline Over Mood Quote Card", "platform": "Instagram", "impressions": "42,800", "engagements": "3,120", "rate": "7.3%", "saves": "1,420"},
                {"title": "4-Step Ankle Mobility for Runners", "platform": "Instagram", "impressions": "38,500", "engagements": "2,890", "rate": "7.5%", "saves": "2,110"},
                {"title": "Synthetic Fabrics vs Natural Warp Knit", "platform": "LinkedIn", "impressions": "24,200", "engagements": "1,440", "rate": "5.9%", "saves": "580"}
            ]
        }
    )

