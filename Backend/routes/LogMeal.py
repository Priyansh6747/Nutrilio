from datetime import datetime, date
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
    get_meal_entry, recommend_meal, get_combined_engagement_graph_data,
)
from Engines.Generative_Engine.LogAnalysis import identify_log, FoodItem as IdentifiedFoodItem, adjust_confidence, \
    calculate_semantic_similarity, identify_image, FoodItem
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


import asyncio
from concurrent.futures import ThreadPoolExecutor

# Add this at module level (after imports)
executor = ThreadPoolExecutor(max_workers=4)


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

        # Create a temporary file for identify_image (Gemini needs file path)
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp_file:
            tmp_file.write(contents)
            tmp_file_path = tmp_file.name

        try:
            # Run both identification methods in parallel
            loop = asyncio.get_event_loop()

            # Run ML classification
            ml_task = _classify_meal(contents)

            # Run Gemini vision identification in thread pool
            vision_task = loop.run_in_executor(
                executor,
                identify_image,
                tmp_file_path
            )

            # Wait for both to complete
            prediction_dict, vision_result = await asyncio.gather(ml_task, vision_task)

        finally:
            # Clean up temp file
            import os
            if os.path.exists(tmp_file_path):
                os.unlink(tmp_file_path)

        # Store original ML confidence
        original_ml_confidence = prediction_dict["confidence"]
        ml_classification = prediction_dict["result"]

        # Get vision model results
        vision_name = vision_result["name"]
        vision_confidence = vision_result["confidence"]
        vision_description = vision_result["description"]

        # Calculate semantic similarity between ML classification and user input
        ml_similarity = await loop.run_in_executor(
            executor,
            calculate_semantic_similarity,
            ml_classification,
            name,
            description if description else ""
        )

        # Calculate semantic similarity between vision result and user input
        vision_similarity = await loop.run_in_executor(
            executor,
            calculate_semantic_similarity,
            vision_name,
            name,
            description if description else ""
        )

        print(
            f"ML Classification: {ml_classification} (confidence: {original_ml_confidence:.2f}, similarity: {ml_similarity:.2f})")
        print(
            f"Vision Classification: {vision_name} (confidence: {vision_confidence:.2f}, similarity: {vision_similarity:.2f})")

        # Decide which result to use
        # Prefer identify_image (vision) in case of dispute
        # Weighted score = confidence * similarity
        ml_score = original_ml_confidence * ml_similarity
        vision_score = vision_confidence * vision_similarity

        # Give vision model a slight preference (1.1x multiplier)
        vision_score *= 1.1

        if vision_score >= ml_score:
            # Use vision model result
            print("Using vision model result")
            final_name = vision_name
            final_description = vision_description
            suggested_food = ml_classification

            # Adjust confidence based on vision similarity
            final_confidence = adjust_confidence(vision_confidence, vision_similarity)
        else:
            # Use ML model result with LLM refinement
            print("Using ML model result with LLM refinement")
            identified_food_item = await loop.run_in_executor(
                executor,
                identify_log,
                ml_classification,
                name,
                original_ml_confidence,
                description if description else ""
            )

            final_name = identified_food_item.name
            final_description = identified_food_item.description
            final_confidence = identified_food_item.confidence
            suggested_food = ml_classification

        # Create final FoodItem
        final_food_item = FoodItem(
            name=final_name,
            description=final_description,
            confidence=final_confidence
        )

        # Return structured response
        return PredictionResponse(
            result=final_food_item,
            suggested_food=suggested_food,
            confidence=final_confidence,
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

     

@LogRouter.get("/graph")
async def get_engagement_graph(
        username: str,
        days: int = 365,
        end_date: Optional[str] = None
):
    try:
        # Parse end_date if provided
        parsed_end_date = None
        if end_date:
            try:
                parsed_end_date = date.fromisoformat(end_date)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid end_date format. Use ISO format (YYYY-MM-DD)")

        # Get combined engagement data
        result = get_combined_engagement_graph_data(username, days, parsed_end_date)

        return {
            "success": True,
            "data": result
        }

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating engagement graph: {str(e)}")
