
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.transaction import (
    TransactionCreate,
    TransactionResponse
)
from uuid import UUID
from app.services.transaction import (
    create_transaction,
    get_customer_balance,
    get_customer_transactions
)
from fastapi import APIRouter, Depends, HTTPException, status, Query


router = APIRouter(
    prefix="/transactions",
    tags=["Transaction Management"]
)


@router.post(
    "/",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED
)
async def add_transaction(
    transaction_data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        transaction = await create_transaction(
            transaction_data=transaction_data,
            current_user=current_user,
            db=db
        )

        return transaction

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        )


@router.get("/customers/{customer_id}/balance")
async def customer_balance(
    customer_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        balance = await get_customer_balance(
            customer_id=customer_id,
            current_user=current_user,
            db=db
        )

        return {
            "customer_id": customer_id,
            "outstanding_balance": balance,
            "currency": "INR"
        }

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        )




@router.get(
    "/customers/{customer_id}/history",
    response_model=list[TransactionResponse]
)
async def customer_transaction_history(
    customer_id: UUID,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        transactions = await get_customer_transactions(
            customer_id=customer_id,
            current_user=current_user,
            db=db,
            skip=skip,
            limit=limit
        )

        return transactions

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        )



