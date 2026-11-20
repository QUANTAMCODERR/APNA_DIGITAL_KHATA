
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.credit_risk import CreditRiskResponse
from app.services.credit_risk import analyze_customer_credit_risk


router = APIRouter(
    prefix="/credit-risk",
    tags=["AI/ML Credit Risk Analysis"]
)


@router.get(
    "/customers/{customer_id}",
    response_model=CreditRiskResponse
)
async def customer_credit_risk(
    customer_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        assessment = await analyze_customer_credit_risk(
            customer_id=customer_id,
            current_user=current_user,
            db=db
        )

        return assessment

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        )
