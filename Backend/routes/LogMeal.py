import time
from datetime import datetime, date as date_type
from typing import Optional

from fastapi import APIRouter, HTTPException, File, UploadFile, Form, BackgroundTasks
from pydantic import BaseModel, Field
from starlette.concurrency import run_in_threadpool

from Engines.Analysis.NutritiousAnalysis import nutrient_analysis
from Engines.Barcode import read_barcode
from Engines.DB_Engine.Meal import (
    create_pending_meal_entry,
    update_meal_entry,
    AnalysisRequest,
    get_nutrient_comparison,
    get_category_breakdown,
    get_macro_breakdown,
    get_nutrient_distribution,
    get_nutrient_timeline,
    get_top_nutrients,
    calculate_meal_streak,
    get_weekly_nutrition_summary,
    get_daily_nutrition_stats,
    delete_meal_entry,
    get_meals_by_range,
    get_meals_by_date,
    get_meal_entry, recommend_meal,
)
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


def process_analysis(
        username: str,
        doc_id: str,
        name: str,
        description: Optional[str],
        amnt: float
):
    try:
        # Step 2: Do analysis
        result = nutrient_analysis(name, description, amnt)

        # Step 3: Update doc with results
        update_meal_entry(
            username=username,
            doc_id=doc_id,
            nutrient_breakdown=result,
            serving_size=amnt
        )
        print("done")
    except Exception as e:
        print(f"Analysis failed for doc {doc_id}: {str(e)}")


@LogRouter.post("/analyse")
async def analyze_endpoint(data: AnalysisRequest, bg: BackgroundTasks):
    # Step 1: Create pending doc
    doc_id = create_pending_meal_entry(data.username)
    bg.add_task(
        run_in_threadpool,
        process_analysis,
        username=data.username,
        doc_id=doc_id,
        name=data.name,
        description=data.description,
        amnt=data.amnt
    )

    return {
        "status": "started",
        "doc_id": doc_id
    }


@LogRouter.get("/meal/{meal_id}")
async def get_meal(username: str, meal_id: str):
    """Get a specific meal entry"""
    try:
        meal = get_meal_entry(username, meal_id)
        return {
            "status": "success",
            "meal": meal
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@LogRouter.get("/meals/daily")
async def get_daily_meals(username: str, date: Optional[str] = None):
    """Get all meals for a specific date"""
    try:
        # FIX: Use datetime.today().date() instead of date.today()
        target_date = datetime.strptime(date, "%Y-%m-%d").date() if date else datetime.today().date()
        meals = get_meals_by_date(username, target_date)
        return {
            "status": "success",
            "date": target_date.isoformat(),
            "meal_count": len(meals),
            "meals": meals
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@LogRouter.get("/meals/range")
async def get_meals_range(username: str, start_date: str, end_date: str):
    """Get all meals within a date range"""
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
        end = datetime.strptime(end_date, "%Y-%m-%d").date()
        meals = get_meals_by_range(username, start, end)
        return {
            "status": "success",
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
            "meal_count": len(meals),
            "meals": meals
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@LogRouter.delete("/meal/{meal_id}")
async def delete_meal(username: str, meal_id: str):
    """Delete a meal entry"""
    try:
        success = delete_meal_entry(username, meal_id)
        return {
            "status": "success",
            "message": "Meal deleted successfully",
            "meal_id": meal_id
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@LogRouter.get("/nutrition/daily")
async def get_daily_nutrition(username: str, date: Optional[str] = None):
    """Get aggregated nutrition stats for a specific day"""
    try:
        # FIX: Use datetime.today().date() instead of date.today()
        target_date = datetime.strptime(date, "%Y-%m-%d").date() if date else datetime.today().date()
        stats = get_daily_nutrition_stats(username, target_date)
        return {
            "status": "success",
            **stats
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@LogRouter.get("/nutrition/weekly")
async def get_weekly_nutrition(username: str, date: Optional[str] = None):
    """Get weekly nutrition summary"""
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d").date() if date else None
        summary = get_weekly_nutrition_summary(username, target_date)
        return {
            "status": "success",
            **summary
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@LogRouter.get("/streak")
async def get_streak(username: str, min_meals_per_day: int = 3, days_to_check: int = 30):
    """Get user's meal logging streak"""
    try:
        streak_data = calculate_meal_streak(username, min_meals_per_day, days_to_check)
        return {
            "status": "success",
            **streak_data
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@LogRouter.get("/nutrients/top")
async def get_top_nutrients_endpoint(
    username: str,
    start_date: str,
    end_date: str,
    top_n: int = 5
):
    """Get top N nutrients consumed during a date range"""
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
        end = datetime.strptime(end_date, "%Y-%m-%d").date()
        top_nutrients = get_top_nutrients(username, start, end, top_n)
        return {
            "status": "success",
            **top_nutrients
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@LogRouter.get("/nutrients/timeline")
async def get_nutrient_timeline_endpoint(
    username: str,
    nutrient_name: str,
    start_date: str,
    end_date: str
):
    """Get daily timeline data for a specific nutrient"""
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
        end = datetime.strptime(end_date, "%Y-%m-%d").date()
        timeline = get_nutrient_timeline(username, nutrient_name, start, end)
        return {
            "status": "success",
            **timeline
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@LogRouter.get("/nutrients/distribution")
async def get_nutrient_distribution_endpoint(
    username: str,
    start_date: str,
    end_date: str,
    nutrients: Optional[str] = None
):
    """Get distribution of nutrients for pie/donut charts"""
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
        end = datetime.strptime(end_date, "%Y-%m-%d").date()
        nutrient_list = nutrients.split(",") if nutrients else None
        distribution = get_nutrient_distribution(username, start, end, nutrient_list)
        return {
            "status": "success",
            **distribution
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@LogRouter.get("/macros/daily")
async def get_macro_breakdown_endpoint(username: str, date: Optional[str] = None):
    """Get macronutrient breakdown for a specific day"""
    try:
        # FIX: Use datetime.today().date() instead of date.today()
        target_date = datetime.strptime(date, "%Y-%m-%d").date() if date else datetime.today().date()
        breakdown = get_macro_breakdown(username, target_date)
        return {
            "status": "success",
            **breakdown
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@LogRouter.get("/categories/breakdown")
async def get_category_breakdown_endpoint(
    username: str,
    start_date: str,
    end_date: str
):
    """Get breakdown by food category"""
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
        end = datetime.strptime(end_date, "%Y-%m-%d").date()
        breakdown = get_category_breakdown(username, start, end)
        return {
            "status": "success",
            **breakdown
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@LogRouter.get("/nutrients/compare")
async def compare_nutrients_endpoint(
    username: str,
    nutrients: str,
    start_date: str,
    end_date: str
):
    """Compare multiple nutrients over time"""
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
        end = datetime.strptime(end_date, "%Y-%m-%d").date()
        nutrient_list = nutrients.split(",")
        comparison = get_nutrient_comparison(username, nutrient_list, start, end)
        return {
            "status": "success",
            **comparison
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@LogRouter.get("/recommendations")
async def get_recommendations_endpoint(username:str , goal:str):
     """Get recommendations for a specific goal"""
     try:
         result = recommend_meal(username, goal)
         return result
     except ValueError as e:
         raise HTTPException(status_code=400, detail=str(e))
     except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))

