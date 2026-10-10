from pydantic import BaseModel, Field, field_validator

from app.core.password_policy import evaluate


class PasswordCheckRequest(BaseModel):
    password: str = Field(min_length=1, max_length=128)


class PasswordCheckResponse(BaseModel):
    valid: bool
    rules: dict[str, bool]
    classes_met: int


class PasswordCheckResponseFactory:
    @staticmethod
    def from_password(p: str) -> PasswordCheckResponse:
        r = evaluate(p)
        return PasswordCheckResponse(valid=r["valid"], rules=r["rules"], classes_met=r["classes_met"])


# --- forgot / reset ---


class ForgotPasswordRequest(BaseModel):
    email: str = Field(min_length=3, max_length=255)


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=10, max_length=256)
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def _strong(cls, v: str) -> str:
        if not evaluate(v)["valid"]:
            raise ValueError("Password does not meet the required strength")
        return v
