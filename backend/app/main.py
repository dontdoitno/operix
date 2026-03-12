from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.api.v1.api import api_router
from app.core.config import get_settings
from app.core.exceptions import AppError

settings = get_settings()
app = FastAPI(title=settings.project_name)


@app.exception_handler(AppError)
async def app_error_handler(_: Request, exc: AppError) -> JSONResponse:
    """Convert domain-level application errors into consistent API responses."""
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})


@app.get("/")
def health() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok"}


app.include_router(api_router, prefix=settings.api_v1_prefix)
