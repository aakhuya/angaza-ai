from fastapi import APIRouter, HTTPException, Query

from app.core.config import get_settings

router = APIRouter(prefix="/auth/oauth", tags=["oauth"])


@router.get("/{provider}/start")
def start(provider: str, next: str = Query("/dashboard")) -> dict:
    """Begin an OAuth flow.

    Reads provider credentials from settings. If they are not set, returns a
    clear error rather than a fake redirect. This route is intentionally a stub
    until the credentials are provisioned.
    """
    settings = get_settings()
    if provider == "google":
        if not settings.google_client_id:
            raise HTTPException(
                status_code=503,
                detail="Google OAuth is not configured on this deployment.",
            )
        # Real implementation would build the redirect to accounts.google.com.
        raise HTTPException(
            status_code=501,
            detail="Google OAuth transport is not implemented yet.",
        )
    if provider == "apple":
        if not settings.apple_client_id:
            raise HTTPException(
                status_code=503,
                detail="Apple OAuth is not configured on this deployment.",
            )
        raise HTTPException(
            status_code=501,
            detail="Apple OAuth transport is not implemented yet.",
        )
    raise HTTPException(status_code=404, detail="Unknown provider")
