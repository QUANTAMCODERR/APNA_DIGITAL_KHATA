
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.notification import NotificationResponse
from app.services.notification import get_customer_notifications


router = APIRouter(
    prefix="/notifications",
    tags=["Notification Management"]
)


@router.get(
    "/customers/{customer_id}",
    response_model=list[NotificationResponse]
)
async def customer_notifications(
    customer_id: UUID,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        notifications = await get_customer_notifications(
            customer_id=customer_id,
            current_user=current_user,
            db=db,
            skip=skip,
            limit=limit
        )

        return notifications

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        )
