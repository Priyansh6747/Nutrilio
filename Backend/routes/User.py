from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
from datetime import datetime
from Config import firestoreDB


class Gender(str, Enum):
    male = "male"
    female = "female"
    other = "other"


class User(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    nickname: Optional[str] = None
    gender: Gender
    age: int = Field(..., ge=0, le=120)
    height: Optional[float] = Field(None, ge=30, le=300, description="Height in cm")
    weight: Optional[float] = Field(None, ge=1, le=500, description="Weight in kg")
    meals: List[str] = Field(default_factory=list, description="List of meals")
    activity_factor: float = Field(default=1.375)


class WaterIntake(BaseModel):
    timestamp: datetime
    amount: int


class UserResponse(BaseModel):
    username: str
    nickname: Optional[str]
    gender: Gender
    age: int
    height: Optional[float]
    weight: Optional[float]
    meals: List[str]
    activity_factor: float
    GlassSize: float = 250
    Water: List[WaterIntake] = Field(default_factory=list)
    created_at: datetime


user_router = APIRouter()


@user_router.get("/")
async def get_user():
    return {"Msg": "Hello World"}


@user_router.post("/init", response_model=UserResponse)
async def init_user(user: User):
    """Create a user in Firestore using username as document ID"""
    try:
        # Check if username already exists
        doc_ref = firestoreDB.collection("users").document(user.username)
        if doc_ref.get().exists:
            raise HTTPException(status_code=409, detail="Username already exists")

        # Prepare user data for storage
        user_data = {
            "username": user.username,
            "nickname": user.nickname,
            "gender": user.gender.value,
            "age": user.age,
            "height": user.height,
            "weight": user.weight,
            "meals": user.meals if user.meals else [],
            "activity_factor": user.activity_factor,
            "GlassSize": 250.0,  # Auto-initialize with default value
            "Water": [],  # Auto-initialize as empty list
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }

        # Store in Firestore using username as document ID
        doc_ref.set(user_data)

        # Return the created user
        return UserResponse(
            username=user.username,
            nickname=user.nickname,
            gender=user.gender,
            age=user.age,
            height=user.height,
            weight=user.weight,
            meals=user_data["meals"],
            activity_factor=user_data["activity_factor"],
            GlassSize=user_data["GlassSize"],
            Water=user_data["Water"],
            created_at=user_data["created_at"]
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")


@user_router.get("/{username}", response_model=UserResponse)
async def get_user_by_username(username: str):
    """Retrieve a user by their username"""
    try:
        doc_ref = firestoreDB.collection("users").document(username)
        doc = doc_ref.get()

        if not doc.exists:
            raise HTTPException(status_code=404, detail="User not found")

        user_data = doc.to_dict()

        # Ensure required fields exist with default values
        if "meals" not in user_data or user_data["meals"] is None:
            user_data["meals"] = []
        if "activity_factor" not in user_data:
            user_data["activity_factor"] = 1.375
        if "GlassSize" not in user_data:
            user_data["GlassSize"] = 250.0
        if "Water" not in user_data or user_data["Water"] is None:
            user_data["Water"] = []

        return UserResponse(**user_data)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve user: {str(e)}")


@user_router.put("/{username}", response_model=UserResponse)
async def update_user(username: str, user: User):
    """Update an existing user"""
    try:
        # Check if user exists
        doc_ref = firestoreDB.collection("users").document(username)
        doc = doc_ref.get()

        if not doc.exists:
            raise HTTPException(status_code=404, detail="User not found")

        # Ensure username in path matches username in body
        if username != user.username:
            raise HTTPException(status_code=400, detail="Username in path must match username in request body")

        # Get existing data to preserve GlassSize and Water
        existing_data = doc.to_dict()

        # Update user data (preserve GlassSize and Water from existing data)
        user_data = {
            "username": user.username,
            "nickname": user.nickname,
            "gender": user.gender.value,
            "age": user.age,
            "height": user.height,
            "weight": user.weight,
            "meals": user.meals if user.meals else [],
            "activity_factor": user.activity_factor,
            "updated_at": datetime.now()
        }

        # Update in Firestore
        doc_ref.update(user_data)

        # Get updated document
        updated_doc = doc_ref.get()
        updated_data = updated_doc.to_dict()

        # Ensure all fields exist in response with default values
        if "meals" not in updated_data or updated_data["meals"] is None:
            updated_data["meals"] = []
        if "activity_factor" not in updated_data:
            updated_data["activity_factor"] = 1.375
        if "GlassSize" not in updated_data:
            updated_data["GlassSize"] = 250.0
        if "Water" not in updated_data or updated_data["Water"] is None:
            updated_data["Water"] = []

        return UserResponse(**updated_data)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update user: {str(e)}")


@user_router.patch("/{username}/glass-size")
async def update_glass_size(username: str, glass_size: float):
    """Update the glass size for a user"""
    try:
        doc_ref = firestoreDB.collection("users").document(username)
        doc = doc_ref.get()

        if not doc.exists:
            raise HTTPException(status_code=404, detail="User not found")

        # Update glass size
        doc_ref.update({
            "GlassSize": glass_size,
            "updated_at": datetime.now()
        })

        return {
            "message": "Glass size updated successfully",
            "username": username,
            "GlassSize": glass_size
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update glass size: {str(e)}")