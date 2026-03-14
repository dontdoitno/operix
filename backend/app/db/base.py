from app.db.base_class import Base

# Import models to ensure they are registered on SQLAlchemy metadata.
from app.models import auth_session, purchase_order, purchase_request, user  # noqa: F401

__all__ = ["Base"]
