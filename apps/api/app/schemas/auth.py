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


class ProfilePatch(BaseModel):
    display_name: str | None = Field(default=None, max_length=80)
    favorite_team: str | None = Field(default=None, max_length=80)
    favorite_player: str | None = Field(default=None, max_length=80)


class ProfileResponse(BaseModel):
    display_name: str
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
