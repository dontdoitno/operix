from fastapi import APIRouter

from app.api.v1.endpoints.procurement import router as procurement_router
from app.api.v1.endpoints.users import router as users_router

api_router = APIRouter()
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(procurement_router, prefix="/procurement", tags=["procurement"])
