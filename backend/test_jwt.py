
from app.core.jwt import (
    create_access_token,
    verify_access_token
)


# Generate token
token = create_access_token("test-user-123")

print("Token generated successfully!")

# Verify valid token
payload = verify_access_token(token)

print("Valid token verification:", payload is not None)

if payload:
    print("User ID:", payload["sub"])


# Verify invalid token
invalid_payload = verify_access_token("invalid.token.value")

print("Invalid token verification:", invalid_payload is None)
