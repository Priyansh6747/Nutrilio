import time
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, File, UploadFile, Form, BackgroundTasks
from pydantic import BaseModel, Field

from Engines.Barcode import read_barcode
from Engines.Generative_Engine.LogAnalysis import identify_log, FoodItem as IdentifiedFoodItem
from Engines.ML_Engine.core import predict_food

LogRouter = APIRouter()


class PredictionResponse(BaseModel):
    result: IdentifiedFoodItem
    suggested_food: str
    confidence: float
    original_ml_confidence: float
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

        # Store original ML confidence
        original_ml_confidence = prediction_dict["confidence"]

        # Identify food and adjust confidence based on similarity
        identified_food_item = identify_log(
            image_class=prediction_dict["result"],
            name=name,
            confidence=original_ml_confidence,
            desc=description if description else ""
        )

        # Return structured response with both confidences
        return PredictionResponse(
            result=identified_food_item,
            suggested_food=prediction_dict["result"],
            confidence=identified_food_item.confidence,
            original_ml_confidence=original_ml_confidence,
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


@LogRouter.get("/barcode/read/{code}")
async def get_product(code: str):
    data = read_barcode(code)
    if data is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return data


def temp():
    print("\nStarted \n")
    time.sleep(20)
    print("\nEnded \n")

class AnalysisRequest(BaseModel):
    name: str
    description: Optional[str] = None
    amnt: float

@LogRouter.post("/analyse")
async def analyze_endpoint(data: AnalysisRequest, bg: BackgroundTasks):
    bg.add_task(temp)
    return {"status": "started"}