
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from uuid import UUID


# User registration request
class UserRegister(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


# User login request
class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


# User information returned by API
class UserResponse(BaseModel):
    id: UUID
    full_name: str
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)


# JWT token response
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
