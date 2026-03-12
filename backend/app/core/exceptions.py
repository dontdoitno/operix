from __future__ import annotations


class AppError(Exception):
    """Base application error with an attached HTTP status code."""

    status_code: int = 400

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


class NotFoundError(AppError):
    status_code = 404


class ConflictError(AppError):
    status_code = 409


class PermissionDeniedError(AppError):
    status_code = 403


class ValidationError(AppError):
    status_code = 422
