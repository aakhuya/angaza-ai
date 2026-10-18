from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    display_name: str = Field(default="", max_length=80)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    display_name: str
    username: str | None = None


class ProfilePatch(BaseModel):
    display_name: str | None = Field(default=None, max_length=80)
    username: str | None = Field(default=None, max_length=40, pattern="^[a-zA-Z0-9_]{3,40}$")
    favorite_team: str | None = Field(default=None, max_length=80)
    favorite_player: str | None = Field(default=None, max_length=80)


class ProfileResponse(BaseModel):
    display_name: str
    username: str | None = None
    avatar_url: str = ""
    favorite_team: str
    favorite_player: str


class PreferencesPatch(BaseModel):
    viewer_mode: str | None = Field(default=None, pattern="^(casual|analyst|player_focus)$")
    language: str | None = Field(default=None, max_length=8)
    explanation_detail: str | None = Field(default=None, pattern="^(brief|standard|deep)$")


class PreferencesResponse(BaseModel):
    viewer_mode: str
    language: str
    explanation_detail: str


class OnboardingPatch(BaseModel):
    """Payload sent once, at the end of first-run setup."""

    favorite_teams: list[str] = Field(default_factory=list, max_length=6)
    favorite_players: list[str] = Field(default_factory=list, max_length=6)
    viewer_mode: str = Field(pattern="^(casual|analyst|player_focus)$")
    language: str = Field(default="en", max_length=8)
    explanation_detail: str = Field(default="standard", pattern="^(brief|standard|deep)$")


class OnboardingResponse(BaseModel):
    completed: bool
    favorite_teams: list[str]
    favorite_players: list[str]
    viewer_mode: str
