
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user
from app.models.user import User

from app.core.database import get_db
from app.core.jwt import create_access_token
from app.schemas.auth import (
    UserRegister,
    UserResponse,
    UserLogin,
    TokenResponse
)
from app.services.auth import register_user, authenticate_user


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
async def register(
    user_data: UserRegister,
    db: AsyncSession = Depends(get_db)
):
    try:
        user = await register_user(user_data, db)
        return user

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error)
        )


@router.post(
    "/login",
    response_model=TokenResponse
)
async def login(
    user_data: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    user = await authenticate_user(
        email=str(user_data.email),
        password=user_data.password,
        db=db
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    access_token = create_access_token(
        subject=str(user.id)
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer"
    )


@router.get(
    "/me",
    response_model=UserResponse
)
async def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    return current_user
