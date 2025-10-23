from Config import firestoreDB
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

from Engines.Analysis.MacroBreakdown import NutrientBreakDown

class AnalysisRequest(BaseModel):
    username: str = Field(...)
    name: str
    description: Optional[str] = None
    amnt: float



class MealEntry(BaseModel):
    """Model for storing meal data with timestamp"""
    nutrient_breakdown: NutrientBreakDown
    timestamp: datetime
    serving_size: Optional[float] = None


def update_meal_entry(
        username: str,
        doc_id: str,
        nutrient_breakdown: NutrientBreakDown,
        timestamp: Optional[datetime] = None,
        serving_size: Optional[float] = None,
) -> Dict[str, Any]:
    user_ref = firestoreDB.collection('users').document(username)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise ValueError(f"User {username} not found")

    # Get reference to the specific meal document
    meal_ref = user_ref.collection('Meals').document(doc_id)
    meal_doc = meal_ref.get()

    if not meal_doc.exists:
        raise ValueError(f"Meal document {doc_id} not found")

    # Use provided timestamp or current time
    timestamp = timestamp if timestamp else datetime.now()

    # Convert NutrientBreakDown to dict for Firestore storage
    meal_data = {
        "status": 1,  # Mark as completed
        "timestamp": timestamp,
        "name": nutrient_breakdown.name,
        "food_id": nutrient_breakdown.id,
        "category": nutrient_breakdown.category,
        "nutrients": [
            {
                "name": nutrient.name,
                "amt": nutrient.amt,
                "unit": nutrient.unit
            }
            for nutrient in nutrient_breakdown.nutrients
        ]
    }

    if serving_size:
        meal_data["serving_size"] = serving_size

    # Update the existing document
    meal_ref.update(meal_data)

    return {
        "id": doc_id,
        "status": 1,
        "timestamp": timestamp,
        "name": nutrient_breakdown.name,
        "food_id": nutrient_breakdown.id,
        "category": nutrient_breakdown.category,
        "serving_size": serving_size,
    }






def create_pending_meal_entry(username: str) -> str:
    user_ref = firestoreDB.collection('users').document(username)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise ValueError(f"User {username} not found")

    initial_data = {
        "status": -1,
        "timestamp": datetime.now()
    }
    meal_ref = user_ref.collection('Meals').add(initial_data)
    doc_id = meal_ref[1].id

    return doc_id



