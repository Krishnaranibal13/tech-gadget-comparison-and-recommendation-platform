
from typing import Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User


router = APIRouter()


# Accept JSON requests from the React frontend.
class RegisterRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    full_name: Optional[str] = None


class LoginRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None


@router.get("/test")
def auth_test():
    return {
        "message": "Authentication API is working"
    }


@router.post("/register")
def register_user(
    request: Optional[RegisterRequest] = Body(default=None),
    username: Optional[str] = Query(default=None),
    email: Optional[str] = Query(default=None),
    password: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    # Accept values from either JSON or query parameters.
    email_value = (
        (request.email if request else None)
        or email
        or ""
    ).strip().lower()

    username_value = (
        (request.username if request else None)
        or username
        or email_value
    ).strip()

    password_value = (
        (request.password if request else None)
        or password
        or ""
    )

    full_name_value = (
        (request.full_name if request else None) or ""
    ).strip()

    # Validate required information.
    if not username_value or not email_value or not password_value:
        raise HTTPException(
            status_code=422,
            detail="Username, email, and password are required.",
        )

    if "@" not in email_value or "." not in email_value.rsplit("@", 1)[-1]:
        raise HTTPException(
            status_code=422,
            detail="Please enter a valid email address.",
        )

    if len(password_value) < 8:
        raise HTTPException(
            status_code=422,
            detail="Password must contain at least 8 characters.",
        )

    # Check whether the username or email already exists.
    existing_user = (
        db.query(User)
        .filter(
            or_(
                User.username == username_value,
                User.email == email_value,
            )
        )
        .first()
    )

    if existing_user:
        if existing_user.username == username_value:
            raise HTTPException(
                status_code=409,
                detail="This username is already registered.",
            )

        raise HTTPException(
            status_code=409,
            detail="This email address is already registered.",
        )

    # Create the user using the columns supported by the model.
    user_data = {
        "username": username_value,
        "email": email_value,
        "password": password_value,
    }

    # Store the full name if the existing User model supports it.
    if full_name_value:
        if hasattr(User, "full_name"):
            user_data["full_name"] = full_name_value
        elif hasattr(User, "name"):
            user_data["name"] = full_name_value

    new_user = User(**user_data)

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {
            "message": "User registered successfully",
            "user_id": new_user.id,
            "username": new_user.username,
            "email": new_user.email,
        }

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Registration failed. Please try again.",
        )


@router.post("/login")
def login_user(
    request: Optional[LoginRequest] = Body(default=None),
    username: Optional[str] = Query(default=None),
    password: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    # Accept JSON from React or query parameters from Swagger.
    identifier = (
        (request.username if request else None)
        or (request.email if request else None)
        or username
        or ""
    ).strip()

    password_value = (
        (request.password if request else None)
        or password
        or ""
    )

    if not identifier or not password_value:
        raise HTTPException(
            status_code=422,
            detail="Username/email and password are required.",
        )

    # Allow login with either username or email.
    user = (
        db.query(User)
        .filter(
            or_(
                User.username == identifier,
                User.email == identifier.lower(),
            )
        )
        .first()
    )

    # Compatibility with the existing local authentication setup.
    if not user or user.password != password_value:
        raise HTTPException(
            status_code=401,
            detail="Invalid username/email or password.",
        )

    return {
        "message": "Login successful",
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
    }