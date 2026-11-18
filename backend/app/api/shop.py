
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.shop import ShopCreate, ShopResponse
from app.services.shop import create_shop, get_my_shop
from app.schemas.shop import ShopCreate, ShopResponse, ShopUpdate

from app.services.shop import (
    create_shop,
    get_my_shop,
    update_my_shop
)

router = APIRouter(
    prefix="/shops",
    tags=["Shop Management"]
)


@router.post(
    "/",
    response_model=ShopResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_my_shop(
    shop_data: ShopCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        shop = await create_shop(
            shop_data=shop_data,
            current_user=current_user,
            db=db
        )

        return shop

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error)
        )




@router.get(
    "/me",
    response_model=ShopResponse
)
async def get_my_shop_details(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    shop = await get_my_shop(
        current_user=current_user,
        db=db
    )

    if shop is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shop not found. Please register your shop."
        )

    return shop




@router.patch(
    "/me",
    response_model=ShopResponse
)
async def update_my_shop_details(
    shop_data: ShopUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        shop = await update_my_shop(
            shop_data=shop_data,
            current_user=current_user,
            db=db
        )

        if shop is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shop not found"
            )

        return shop

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error)
        )
