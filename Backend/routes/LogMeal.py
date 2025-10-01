from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
from datetime import datetime
from Config import firestoreDB

from routes.ML_Engine.core import predict_food
from routes.Generative_Engine.LogAnalysis import identify_log , FoodItem as IdentifiedFoodItem

LogRouter = APIRouter()


class PredictionResponse(BaseModel):
    result: IdentifiedFoodItem
    confidence: float
    timestamp: datetime = Field(default_factory=datetime.now)




async def _classify_meal(file_contents: bytes) -> dict:
    try:
        prediction = predict_food(file_contents)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")


@LogRouter.post("/predict", response_model=PredictionResponse)
async def predict_endpoint(
    name: str = Form(...),
    image: UploadFile = File(...),
    description: Optional[str] = Form(None),
):
    # Validate file type
    if not image.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        # Read file contents
        contents = await image.read()

        # Classify the meal
        prediction_dict = await _classify_meal(contents)

        identified_food_item = identify_log(prediction_dict["result"],name,description)

        # Return structured response
        return PredictionResponse(
            result=identified_food_item,
            confidence=prediction_dict["confidence"],
            timestamp=datetime.now()
        )

    except HTTPException:
        raise
    except KeyError as e:
        raise HTTPException(status_code=500, detail=f"Invalid prediction format: missing {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
    finally:
        await image.close()