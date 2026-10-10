import hashlib
import secrets
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.logging import get_logger
from app.core.security import hash_password
from app.models.session import get_db
from app.models.user import PasswordResetToken, User
from app.schemas.password import (
    ForgotPasswordRequest,
    PasswordCheckRequest,
    PasswordCheckResponse,
    PasswordCheckResponseFactory,
    ResetPasswordRequest,
)

router = APIRouter(tags=["password"])
log = get_logger("angaza.password")

RESET_TTL_MINUTES = 30


@router.post("/auth/password/check", response_model=PasswordCheckResponse)
def check_password(payload: PasswordCheckRequest) -> PasswordCheckResponse:
    return PasswordCheckResponseFactory.from_password(payload.password)


@router.post("/auth/password/forgot", status_code=202)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)) -> dict:
    """Issue a reset token if the email exists.

    Always returns 202 regardless of whether the account exists — this avoids
    user enumeration. In dev, the reset link is logged to the server console
    because email delivery is not configured.
    """
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if user is None:
        return {"status": "accepted"}

    raw = secrets.token_urlsafe(32)
    hashed = hashlib.sha256(raw.encode()).hexdigest()
    db.add(
        PasswordResetToken(
            user_id=user.id,
            token_hash=hashed,
            expires_at=datetime.now(UTC) + timedelta(minutes=RESET_TTL_MINUTES),
        )
    )
    db.commit()

    settings = get_settings()
    reset_url = f"http://localhost:3000/reset-password?token={raw}"
    if settings.is_dev:
        log.info("password_reset_link", email=user.email, url=reset_url)
    else:
        # NOT IMPLEMENTED: email delivery. Documented in README limitations.
        log.warning("password_reset_email_not_configured", email=user.email)
    return {"status": "accepted"}


@router.post("/auth/password/reset")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)) -> dict:
    hashed = hashlib.sha256(payload.token.encode()).hexdigest()
    token = db.scalar(select(PasswordResetToken).where(PasswordResetToken.token_hash == hashed))
    now = datetime.now(UTC)
    if token is None or token.used_at is not None:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")
    if token.expires_at.replace(tzinfo=UTC) < now:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")

    user = db.get(User, token.user_id)
    if user is None:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")

    user.password_hash = hash_password(payload.new_password)
    token.used_at = now
    db.commit()
    return {"status": "reset"}
