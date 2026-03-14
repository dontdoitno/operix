from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.auth_session import AuthSession


class AuthSessionRepository:
    """Repository for auth session persistence and lifecycle operations."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, session: AuthSession) -> AuthSession:
        self.db.add(session)
        self.db.flush()
        self.db.refresh(session)
        return session

    def get_active_by_token_hash(self, token_hash: str) -> Optional[AuthSession]:
        now = datetime.now(timezone.utc)
        stmt = select(AuthSession).where(
            AuthSession.token_hash == token_hash,
            AuthSession.revoked_at.is_(None),
            AuthSession.expires_at > now,
        )
        return self.db.scalar(stmt)

    def revoke(self, session: AuthSession) -> AuthSession:
        session.revoked_at = datetime.now(timezone.utc)
        self.db.flush()
        self.db.refresh(session)
        return session
