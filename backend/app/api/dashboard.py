
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.dashboard import DashboardSummary
from app.services.dashboard import get_dashboard_summary


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard & Analytics"]
)


@router.get(
    "/summary",
    response_model=DashboardSummary
)
async def dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        summary = await get_dashboard_summary(
            current_user=current_user,
            db=db
        )

        return summary

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        )
