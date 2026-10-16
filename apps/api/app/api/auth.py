import os
import secrets
from contextlib import suppress
from datetime import UTC, datetime, timedelta
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Request, Response, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import ACCESS_COOKIE, REFRESH_COOKIE, get_current_user
from app.core.config import get_settings
from app.core.logging import get_logger
from app.core.password_policy import assert_valid as assert_password_valid
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
    OnboardingPatch,
    OnboardingResponse,
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
    # TEMPORARY DEBUG: force insecure Lax cookies in dev so we can prove
    # the 401 is a cookie-transport problem. Revert after diagnosis.
    log.info("set_auth_cookies", app_env=settings.app_env, is_dev=settings.is_dev)
    common = dict(httponly=True, samesite="lax", secure=False, path="/")
    response.set_cookie(
        ACCESS_COOKIE, access, max_age=settings.jwt_access_ttl_minutes * 60, **common
    )
    response.set_cookie(
        REFRESH_COOKIE, refresh, max_age=settings.jwt_refresh_ttl_days * 86400, **common
    )


def _clear_auth_cookies(response: Response) -> None:
    settings = get_settings()
    common = dict(path="/", samesite="none", secure=not settings.is_dev)
    response.delete_cookie(ACCESS_COOKIE, **common)
    response.delete_cookie(REFRESH_COOKIE, **common)
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


@router.post("/auth/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(
    payload: SignupRequest,
    response: Response,
    db: Session = Depends(get_db),
) -> UserResponse:
    try:
        assert_password_valid(payload.password)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    email = payload.email.lower()
    existing = db.scalar(select(User).where(User.email == email))
    if existing is not None:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(email=email, password_hash=hash_password(payload.password))
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
def login(
    payload: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
) -> UserResponse:
    email = payload.email.lower()
    user = db.scalar(select(User).where(User.email == email))
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
        username=user.username,
        avatar_url=p.avatar_url or "",
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
    if payload.username is not None:
        # Reject duplicates explicitly.
        conflict = db.scalar(select(User).where(User.username == payload.username, User.id != user.id))
        if conflict is not None:
            raise HTTPException(status_code=409, detail="Username already taken")
        user.username = payload.username
    db.commit()
    db.refresh(p)
    return ProfileResponse(
        display_name=p.display_name,
        username=user.username,
        avatar_url=p.avatar_url or "",
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


# ---- onboarding ------------------------------------------------------------


@router.get("/onboarding", response_model=OnboardingResponse)
def get_onboarding(user: User = Depends(get_current_user)) -> OnboardingResponse:
    prefs = user.preferences or Preferences(user_id=user.id)
    blob = (prefs.preferences_json or {}) if hasattr(prefs, "preferences_json") else {}
    return OnboardingResponse(
        completed=getattr(prefs, "onboarding_completed", False),
        favorite_teams=list(blob.get("favorite_teams", [])),
        favorite_players=list(blob.get("favorite_players", [])),
        viewer_mode=prefs.viewer_mode,
    )


@router.post("/onboarding", response_model=OnboardingResponse)
def complete_onboarding(
    payload: OnboardingPatch,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> OnboardingResponse:
    prefs = user.preferences
    if prefs is None:
        prefs = Preferences(user_id=user.id)
        db.add(prefs)

    prefs.viewer_mode = payload.viewer_mode
    prefs.language = payload.language
    prefs.explanation_detail = payload.explanation_detail
    prefs.onboarding_completed = True
    prefs.preferences_json = {
        "favorite_teams": payload.favorite_teams,
        "favorite_players": payload.favorite_players,
    }
    db.commit()
    db.refresh(prefs)

    return OnboardingResponse(
        completed=True,
        favorite_teams=payload.favorite_teams,
        favorite_players=payload.favorite_players,
        viewer_mode=prefs.viewer_mode,
    )


# ---- avatar upload ---------------------------------------------------------


UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "./uploads"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_AVATAR_TYPES = {"image/png", "image/jpeg", "image/webp"}
MAX_AVATAR_BYTES = 3 * 1024 * 1024  # 3 MB


@router.post("/profile/avatar", response_model=ProfileResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ProfileResponse:
    if file.content_type not in ALLOWED_AVATAR_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported image type")
    content = await file.read()
    if len(content) > MAX_AVATAR_BYTES:
        raise HTTPException(status_code=400, detail="Image too large (max 3 MB)")

    ext = {"image/png": "png", "image/jpeg": "jpg", "image/webp": "webp"}[file.content_type]
    name = f"{user.id}-{secrets.token_hex(4)}.{ext}"
    target = UPLOAD_DIR / name
    target.write_bytes(content)

    p = user.profile
    if p is None:
        p = Profile(user_id=user.id)
        db.add(p)
    # Delete the previous avatar file if it was one of ours.
    if p.avatar_url and p.avatar_url.startswith("/uploads/"):
        old = UPLOAD_DIR / p.avatar_url.rsplit("/", 1)[-1]
        with suppress(OSError):
            old.unlink(missing_ok=True)

    p.avatar_url = f"/uploads/{name}"
    db.commit()
    db.refresh(p)

    return ProfileResponse(
        display_name=p.display_name,
        username=user.username,
        avatar_url=p.avatar_url or "",
        favorite_team=p.favorite_team,
        favorite_player=p.favorite_player,
    )


# ---- account deletion ------------------------------------------------------


@router.delete("/account", status_code=200)
def delete_account(
    response: Response,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    """Permanently delete the authenticated user's account.

    Related rows (profile, preferences, refresh tokens, reset tokens) are
    deleted via ON DELETE CASCADE in the schema. Local avatar file, if any,
    is removed explicitly.
    """
    avatar = user.profile.avatar_url if user.profile else None
    db.delete(user)
    db.commit()

    if avatar and avatar.startswith("/uploads/"):
        from pathlib import Path as _P
        try:
            target = _P(os.getenv("UPLOAD_DIR", "./uploads")) / avatar.rsplit("/", 1)[-1]
            target.unlink(missing_ok=True)
        except OSError:
            pass

    _clear_auth_cookies(response)
    return {"status": "deleted"}
