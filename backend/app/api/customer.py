
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User

from app.schemas.customer import (
    CustomerCreate,
    CustomerUpdate,
    CustomerResponse
)

from app.services.customer import (
    create_customer,
    get_all_customers,
    get_customer_by_id,
    update_customer,
    delete_customer
)


router = APIRouter(
    prefix="/customers",
    tags=["Customer Management"]
)


# CREATE CUSTOMER
@router.post(
    "/",
    response_model=CustomerResponse,
    status_code=status.HTTP_201_CREATED
)
async def add_customer(
    customer_data: CustomerCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        customer = await create_customer(
            customer_data=customer_data,
            current_user=current_user,
            db=db
        )

        return customer

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error)
        )


# GET ALL CUSTOMERS
@router.get(
    "/",
    response_model=list[CustomerResponse]
)
async def list_customers(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if skip < 0 or limit < 1 or limit > 100:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid pagination parameters"
        )

    try:
        customers = await get_all_customers(
            current_user=current_user,
            db=db,
            skip=skip,
            limit=limit
        )

        return customers

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        )


# GET CUSTOMER BY ID
@router.get(
    "/{customer_id}",
    response_model=CustomerResponse
)
async def get_customer_details(
    customer_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    customer = await get_customer_by_id(
        customer_id=str(customer_id),
        current_user=current_user,
        db=db
    )

    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )

    return customer


# UPDATE CUSTOMER
@router.patch(
    "/{customer_id}",
    response_model=CustomerResponse
)
async def update_customer_details(
    customer_id: UUID,
    customer_data: CustomerUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        customer = await update_customer(
            customer_id=str(customer_id),
            customer_data=customer_data,
            current_user=current_user,
            db=db
        )

        if customer is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )

        return customer

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error)
        )




@router.delete(
    "/{customer_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
async def remove_customer(
    customer_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        deleted = await delete_customer(
            customer_id=str(customer_id),
            current_user=current_user,
            db=db
        )

        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error)
        )
