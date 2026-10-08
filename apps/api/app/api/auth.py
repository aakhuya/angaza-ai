from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import ACCESS_COOKIE, REFRESH_COOKIE, get_current_user
from app.core.config import get_settings
from app.core.logging import get_logger
from app.core.security import (
    create_access_token,
    hash_password,
    hash_refresh_token,
    new_refresh_token,
    verify_password,
)
from app.models.session import get_db
from app.models.user import Preferences, Profile, RefreshToken, User
from app.schemas.auth import (
    LoginRequest,
    PreferencesPatch,
    PreferencesResponse,
    ProfilePatch,
    ProfileResponse,
    SignupRequest,
    UserResponse,
)

router = APIRouter(tags=["auth"])
log = get_logger("angaza.auth")


def _set_auth_cookies(response: Response, access: str, refresh: str) -> None:
    settings = get_settings()
    # HttpOnly + SameSite=Lax. Secure is enabled outside dev.
    common = dict(httponly=True, samesite="lax", secure=not settings.is_dev, path="/")
    response.set_cookie(
        ACCESS_COOKIE, access, max_age=settings.jwt_access_ttl_minutes * 60, **common
    )
    response.set_cookie(
        REFRESH_COOKIE, refresh, max_age=settings.jwt_refresh_ttl_days * 86400, **common
    )


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(ACCESS_COOKIE, path="/")
    response.delete_cookie(REFRESH_COOKIE, path="/")


def _issue_refresh(db: Session, user: User) -> str:
    settings = get_settings()
    raw, hashed = new_refresh_token()
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hashed,
            expires_at=datetime.now(UTC)
            + timedelta(days=settings.jwt_refresh_ttl_days),
        )
    )
    db.flush()
    return raw


def _user_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        email=user.email,
        display_name=user.profile.display_name if user.profile else "",
    )


@router.post(
    "/auth/signup",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def signup(
    payload: SignupRequest,
    response: Response,
    db: Session = Depends(get_db),
) -> UserResponse:
    existing = db.scalar(select(User).where(User.email == payload.email))
    if existing is not None:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(email=payload.email, password_hash=hash_password(payload.password))
    user.profile = Profile(display_name=payload.display_name)
    user.preferences = Preferences()
    db.add(user)
    db.flush()

    raw_refresh = _issue_refresh(db, user)
    db.commit()
    db.refresh(user)

    _set_auth_cookies(response, create_access_token(user.id), raw_refresh)
    log.info("signup", user_id=user.id)
    return _user_response(user)


@router.post("/auth/login", response_model=UserResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)) -> UserResponse:
    user = db.scalar(select(User).where(User.email == payload.email))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    raw_refresh = _issue_refresh(db, user)
    db.commit()

    _set_auth_cookies(response, create_access_token(user.id), raw_refresh)
    log.info("login", user_id=user.id)
    return _user_response(user)


@router.post("/auth/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> None:
    raw = request.cookies.get(REFRESH_COOKIE)
    if raw:
        hashed = hash_refresh_token(raw)
        token = db.scalar(select(RefreshToken).where(RefreshToken.token_hash == hashed))
        if token is not None and token.user_id == user.id:
            token.revoked_at = datetime.now(UTC)
            db.commit()
    _clear_auth_cookies(response)


@router.post("/auth/refresh", response_model=UserResponse)
def refresh(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
) -> UserResponse:
    raw = request.cookies.get(REFRESH_COOKIE)
    if not raw:
        raise HTTPException(status_code=401, detail="Not authenticated")

    hashed = hash_refresh_token(raw)
    token = db.scalar(select(RefreshToken).where(RefreshToken.token_hash == hashed))
    now = datetime.now(UTC)
    if token is None or token.revoked_at is not None:
        raise HTTPException(status_code=401, detail="Invalid session")
    if token.expires_at.replace(tzinfo=UTC) < now:
        raise HTTPException(status_code=401, detail="Session expired")

    user = db.get(User, token.user_id)
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid session")

    # Rotate: revoke old, issue new.
    token.revoked_at = now
    new_raw = _issue_refresh(db, user)
    db.commit()

    _set_auth_cookies(response, create_access_token(user.id), new_raw)
    return _user_response(user)


@router.get("/auth/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)) -> UserResponse:
    return _user_response(user)


# ---- profile ---------------------------------------------------------------


@router.get("/profile", response_model=ProfileResponse)
def get_profile(user: User = Depends(get_current_user)) -> ProfileResponse:
    p = user.profile or Profile(user_id=user.id)
    return ProfileResponse(
        display_name=p.display_name,
        favorite_team=p.favorite_team,
        favorite_player=p.favorite_player,
    )


@router.patch("/profile", response_model=ProfileResponse)
def patch_profile(
    payload: ProfilePatch,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ProfileResponse:
    p = user.profile
    if p is None:
        p = Profile(user_id=user.id)
        db.add(p)
    for field in ("display_name", "favorite_team", "favorite_player"):
        value = getattr(payload, field)
        if value is not None:
            setattr(p, field, value)
    db.commit()
    db.refresh(p)
    return ProfileResponse(
        display_name=p.display_name,
        favorite_team=p.favorite_team,
        favorite_player=p.favorite_player,
    )


# ---- preferences -----------------------------------------------------------


@router.get("/preferences", response_model=PreferencesResponse)
def get_preferences(user: User = Depends(get_current_user)) -> PreferencesResponse:
    prefs = user.preferences or Preferences(user_id=user.id)
    return PreferencesResponse(
        viewer_mode=prefs.viewer_mode,
        language=prefs.language,
        explanation_detail=prefs.explanation_detail,
    )


@router.patch("/preferences", response_model=PreferencesResponse)
def patch_preferences(
    payload: PreferencesPatch,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> PreferencesResponse:
    prefs = user.preferences
    if prefs is None:
        prefs = Preferences(user_id=user.id)
        db.add(prefs)
    for field in ("viewer_mode", "language", "explanation_detail"):
        value = getattr(payload, field)
        if value is not None:
            setattr(prefs, field, value)
    db.commit()
    db.refresh(prefs)
    return PreferencesResponse(
        viewer_mode=prefs.viewer_mode,
        language=prefs.language,
        explanation_detail=prefs.explanation_detail,
    )
