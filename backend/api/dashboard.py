"""Dashboard aggregation endpoints for chart data."""

from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select, and_, case
from sqlalchemy.ext.asyncio import AsyncSession

from api.deps import get_db, verify_token
from models.content import Content, Track, SuccessMetrics
from models.action import Action
from models.instruction import Instruction
from models.royalties import Royalty, RoyaltyTransaction
from models.signals import (
    InstagramProfileInsights, InstagramMediaInsights,
    TiktokProfileInsight, TiktokMediaInsights,
    TwitterXPublicMetrics, TwitterXUserMetrics,
    YoutubeChannelReport, YoutubeContentReport,
)

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"], dependencies=[Depends(verify_token)])

PERIOD_MAP = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "180d": 180,
    "365d": 365,
}


def _since(period: str) -> Optional[datetime]:
    days = PERIOD_MAP.get(period)
    if days is None:
        return None  # "all"
    return datetime.utcnow() - timedelta(days=days)


# GET /api/dashboard/platform-metrics - Aggregated platform metrics for dashboard charts
# Query Parameters:
#   - period (string, optional): Time period for data ("7d", "30d", "90d", "180d", "365d", defaults to "30d")
#   - track_id (UUID, optional): Filter metrics by specific track
# Returns: Aggregated metrics dict by platform (Instagram, TikTok, Twitter)
#   - instagram: impressions, profile_views, follower_growth, reach
#   - tiktok: followers, likes
#   - twitter: impressions
# Use Case: Dashboard overview of platform performance across all social media channels
# Note: Data is aggregated from platform-specific signal tables with period filtering
@router.get("/platform-metrics")
async def platform_metrics(
    period: str = Query("30d"),
    track_id: Optional[UUID] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    since = _since(period)

    # Instagram profile insights aggregated
    ig_stmt = select(
        func.sum(InstagramProfileInsights.impressions_count).label("impressions"),
        func.sum(InstagramProfileInsights.profile_views_count).label("profile_views"),
        func.sum(InstagramProfileInsights.follower_growth).label("follower_growth"),
        func.sum(InstagramProfileInsights.reach).label("reach"),
    )
    if since:
        ig_stmt = ig_stmt.where(InstagramProfileInsights.created_at >= since)
    if track_id:
        ig_stmt = ig_stmt.where(InstagramProfileInsights.track_id == track_id)
    ig_result = (await db.execute(ig_stmt)).one()

    # TikTok profile insights
    tk_stmt = select(
        func.sum(TiktokProfileInsight.followers_count).label("followers"),
        func.sum(TiktokProfileInsight.likes_count).label("likes"),
    )
    if since:
        tk_stmt = tk_stmt.where(TiktokProfileInsight.created_at >= since)
    if track_id:
        tk_stmt = tk_stmt.where(TiktokProfileInsight.track_id == track_id)
    tk_result = (await db.execute(tk_stmt)).one()

    # Twitter/X user metrics
    tw_stmt = select(
        func.sum(TwitterXUserMetrics.impressions).label("impressions"),
    )
    if since:
        tw_stmt = tw_stmt.where(TwitterXUserMetrics.created_at >= since)
    if track_id:
        tw_stmt = tw_stmt.where(TwitterXUserMetrics.track_id == track_id)
    tw_result = (await db.execute(tw_stmt)).one()

    return {
        "instagram": {
            "impressions": ig_result.impressions or 0,
            "profile_views": ig_result.profile_views or 0,
            "follower_growth": ig_result.follower_growth or 0,
            "reach": ig_result.reach or 0,
        },
        "tiktok": {
            "followers": tk_result.followers or 0,
            "likes": tk_result.likes or 0,
        },
        "twitter": {
            "impressions": tw_result.impressions or 0,
        },
    }


# GET /api/dashboard/content-performance - Content engagement analytics and performance metrics
# Query Parameters:
#   - period (string, optional): Time period for data ("7d", "30d", "90d", "180d", "365d", defaults to "30d")
#   - track_id (UUID, optional): Filter content by specific track
# Returns: Content performance breakdown
#   - by_type: Engagement metrics grouped by content type (likes, shares, comments)
#   - top_content: Top 10 content items by total engagement
#   - total_count: Total number of content items in period
# Use Case: Analyze which content types perform best, identify top performing content
# Note: Engagement data extracted from polymorphic content fields
@router.get("/content-performance")
async def content_performance(
    period: str = Query("30d"),
    track_id: Optional[UUID] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    since = _since(period)
    stmt = select(Content).order_by(Content.created_at.desc())
    if since:
        stmt = stmt.where(Content.created_at >= since)
    if track_id:
        stmt = stmt.where(Content.track_id == track_id)
    result = await db.execute(stmt)
    contents = result.scalars().all()

    # Aggregate engagement by type
    by_type: Dict[str, Dict[str, int]] = {}
    top_items: List[Dict[str, Any]] = []
    for c in contents:
        likes = getattr(c, "likes_count", 0) or 0
        shares = getattr(c, "shares_count", 0) or 0
        comments = getattr(c, "comments_count", 0) or 0
        total = likes + shares + comments

        ctype = c.type or "unknown"
        if ctype not in by_type:
            by_type[ctype] = {"likes": 0, "shares": 0, "comments": 0}
        by_type[ctype]["likes"] += likes
        by_type[ctype]["shares"] += shares
        by_type[ctype]["comments"] += comments

        top_items.append({
            "content_id": str(c.content_id),
            "name": c.name,
            "type": ctype,
            "total_engagement": total,
        })

    top_items.sort(key=lambda x: x["total_engagement"], reverse=True)

    return {
        "by_type": by_type,
        "top_content": top_items[:10],
        "total_count": len(contents),
    }


# GET /api/dashboard/royalty-income - Royalty income analytics and financial summaries
# Query Parameters:
#   - period (string, optional): Time period for data ("7d", "30d", "90d", "180d", "365d", defaults to "30d")
#   - track_id (UUID, optional): Filter royalties by specific track
# Returns: Royalty income breakdown
#   - by_type: Total income grouped by royalty type
#   - by_platform: Total income grouped by platform ID
#   - grand_total: Sum of all royalty income in period
# Use Case: Financial dashboard for tracking royalty earnings across platforms and types
# Note: Joins royalty and royalty_transaction tables for complete financial picture
@router.get("/royalty-income")
async def royalty_income(
    period: str = Query("30d"),
    track_id: Optional[UUID] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    since = _since(period)

    # Join royalty + transactions
    stmt = (
        select(
            Royalty.royalty,
            Royalty.platform_id,
            func.sum(RoyaltyTransaction.amount).label("total"),
        )
        .join(RoyaltyTransaction, RoyaltyTransaction.royalty_id == Royalty.royalty_id)
        .group_by(Royalty.royalty, Royalty.platform_id)
    )
    if since:
        stmt = stmt.where(RoyaltyTransaction.created_at >= since)
    if track_id:
        stmt = stmt.where(Royalty.track_id == track_id)

    result = await db.execute(stmt)
    rows = result.all()

    by_type: Dict[str, float] = {}
    by_platform: Dict[str, float] = {}
    grand_total = 0.0
    for row in rows:
        rtype = row.royalty or "unknown"
        pid = str(row.platform_id) if row.platform_id else "unknown"
        amount = float(row.total or 0)
        by_type[rtype] = by_type.get(rtype, 0) + amount
        by_platform[pid] = by_platform.get(pid, 0) + amount
        grand_total += amount

    return {
        "by_type": by_type,
        "by_platform": by_platform,
        "grand_total": grand_total,
    }


# GET /api/dashboard/action-pipeline - Action workflow analytics and deadline tracking
# Query Parameters:
#   - period (string, optional): Time period for data ("7d", "30d", "90d", "180d", "365d", defaults to "30d")
#   - track_id (UUID, optional): Filter actions by specific track
# Returns: Action pipeline analytics
#   - status_breakdown: Count of actions by status (pending, in_progress, completed, failed)
#   - upcoming_deadlines: Next 20 upcoming action deadlines sorted by date
#   - by_phase: Instruction completion counts by phase
# Use Case: Project management dashboard for tracking action progress and upcoming deadlines
# Note: Filters actions by track through content association
@router.get("/action-pipeline")
async def action_pipeline(
    period: str = Query("30d"),
    track_id: Optional[UUID] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    since = _since(period)
    stmt = select(Action)
    if since:
        stmt = stmt.where(Action.created_at >= since)
    if track_id:
        stmt = stmt.where(Action.track_id == track_id)

    result = await db.execute(stmt)
    actions = result.scalars().all()

    status_breakdown: Dict[str, int] = {}
    upcoming: List[Dict[str, Any]] = []
    now = datetime.utcnow()
    for a in actions:
        s = a.status or "pending"
        status_breakdown[s] = status_breakdown.get(s, 0) + 1
        if a.next_action_due_date and a.next_action_due_date > now:
            upcoming.append({
                "action_id": str(a.action_id),
                "due_date": a.next_action_due_date.isoformat(),
                "status": s,
                "notes": a.action_notes,
            })

    upcoming.sort(key=lambda x: x["due_date"])

    # Instruction completion by phase (instructions are global; group all)
    instr_stmt = select(Instruction.phase, func.count()).group_by(Instruction.phase)
    instr_result = await db.execute(instr_stmt)
    by_phase = {row[0] or "various": row[1] for row in instr_result.all()}

    return {
        "status_breakdown": status_breakdown,
        "upcoming_deadlines": upcoming[:20],
        "by_phase": by_phase,
    }


# GET /api/dashboard/notifications - Upcoming deadlines and notifications within 14 days
# Query Parameters: None
# Returns: List of upcoming deadline notifications
#   - type: "action_deadline" or "frequency_end"
#   - id: UUID of the related entity
#   - due_date: ISO formatted due date
#   - label: Human-readable description
# Use Case: Notification system for upcoming action deadlines and frequency endings
# Note: Fixed 14-day horizon from current date, sorted by due date
@router.get("/notifications")
async def notifications(db: AsyncSession = Depends(get_db)):
    """Upcoming deadlines within 14 days."""
    now = datetime.utcnow()
    horizon = now + timedelta(days=14)

    # Actions with upcoming due dates
    action_stmt = select(Action).where(
        and_(
            Action.next_action_due_date.isnot(None),
            Action.next_action_due_date >= now,
            Action.next_action_due_date <= horizon,
        )
    ).order_by(Action.next_action_due_date)
    action_result = await db.execute(action_stmt)
    actions = action_result.scalars().all()

    Frequency = Instruction.Frequency
    freq_stmt = select(Frequency).where(
        and_(
            Frequency.end_date.isnot(None),
            Frequency.end_date >= now,
            Frequency.end_date <= horizon,
        )
    ).order_by(Frequency.end_date)
    freq_result = await db.execute(freq_stmt)
    frequencies = freq_result.scalars().all()

    items = []
    for a in actions:
        items.append({
            "type": "action_deadline",
            "id": str(a.action_id),
            "due_date": a.next_action_due_date.isoformat(),
            "label": a.action_notes or "Action due",
        })
    for f in frequencies:
        items.append({
            "type": "frequency_end",
            "id": str(f.frequency_id),
            "due_date": f.end_date.isoformat(),
            "label": f.name or "Frequency ending",
        })

    items.sort(key=lambda x: x["due_date"])
    return items
