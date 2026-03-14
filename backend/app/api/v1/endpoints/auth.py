from typing import Annotated

from fastapi import APIRouter, Header, Response, status

from app.api.deps import DbSession, extract_bearer_token
from app.core.exceptions import UnauthorizedError
from app.schemas.auth import AuthSessionOut, LoginRequest, RegisterRequest
from app.schemas.user import UserOut
from app.services.auth_service import AuthService

router = APIRouter()


@router.post("/register", response_model=AuthSessionOut, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: DbSession) -> AuthSessionOut:
    """Register a new user and issue an authentication token."""
    service = AuthService(db)
    user, access_token, expires_at = service.register(payload)
    return AuthSessionOut(
        access_token=access_token,
        expires_at=expires_at,
        user=UserOut.model_validate(user),
    )


@router.post("/login", response_model=AuthSessionOut)
def login(payload: LoginRequest, db: DbSession) -> AuthSessionOut:
    """Authenticate existing user credentials and issue a new token."""
    service = AuthService(db)
    user, access_token, expires_at = service.login(payload)
    return AuthSessionOut(
        access_token=access_token,
        expires_at=expires_at,
        user=UserOut.model_validate(user),
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    db: DbSession,
    authorization: Annotated[str, Header(alias="Authorization")],
) -> Response:
    """Revoke active bearer token and terminate current session."""
    token = extract_bearer_token(authorization)
    if token is None:
        raise UnauthorizedError("Authorization header must use Bearer token format.")

    AuthService(db).logout(token)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
