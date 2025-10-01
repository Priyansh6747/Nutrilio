from fastapi import APIRouter, HTTPException, File, UploadFile
from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
from datetime import datetime
from Config import firestoreDB

from routes.ML_Engine.core import predict_food

LogRouter = APIRouter()


class PredictionResponse(BaseModel):
    result: str
    confidence: float
    timestamp: datetime = Field(default_factory=datetime.now)





async def _classifyMeal(file_contents: bytes) -> dict:
    try:
        prediction = predict_food(file_contents)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")


@LogRouter.post("/predict", response_model=PredictionResponse)
async def predict_endpoint(file: UploadFile = File(...)):
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        # Read file contents
        contents = await file.read()

        # Classify the meal
        prediction_dict = await _classifyMeal(contents)

        # Return structured response
        return PredictionResponse(
            result=prediction_dict["result"],
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
        await file.close()