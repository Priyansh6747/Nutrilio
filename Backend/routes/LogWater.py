from datetime import datetime, date
from typing import Optional, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from Engines.DB_Engine.Water import (
    add_water_intake,
    get_water_intake_by_date,
    get_water_intake_by_range,
    update_water_intake,
    delete_water_intake,
    get_daily_water_stats,
    add_quick_glass,
    calculate_water_streak,
    get_weekly_summary
)

WaterRouter = APIRouter()

# Pydantic Models
class WaterIntakeCreate(BaseModel):
    amount: int = Field(..., gt=0, description="Amount of water in ml")
    timestamp: Optional[datetime] = None

class WaterIntakeUpdate(BaseModel):
    amount: Optional[int] = Field(None, gt=0, description="Amount of water in ml")
    timestamp: Optional[datetime] = None

class WaterIntakeResponse(BaseModel):
    id: str
    timestamp: datetime
    amount: int

class DailyStatsResponse(BaseModel):
    date: date
    total_intake: int
    intake_count: int
    intakes: List[dict]
    recommended_intake: int
    percentage_completed: float

class StreakResponse(BaseModel):
    current_streak: int
    longest_streak: int
    target_percentage: float

class WeeklySummaryResponse(BaseModel):
    week_start: date
    week_end: date
    daily_stats: List[dict]
    total_intake: int
    average_daily_intake: float
    average_percentage: float
    days_met_goal: int
    days_tracked: int


# Endpoints
@WaterRouter.post("/water/intake/{username}", response_model=WaterIntakeResponse)
async def create_water_intake(username: str, intake: WaterIntakeCreate):
    """Add a new water intake entry for a user"""
    try:
        result = add_water_intake(username, intake.amount, intake.timestamp)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding water intake: {str(e)}")


@WaterRouter.post("/water/quick-glass/{username}", response_model=WaterIntakeResponse)
async def create_quick_glass(username: str):
    """Add a quick glass of water (uses user's default glass size)"""
    try:
        result = add_quick_glass(username)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding quick glass: {str(e)}")


@WaterRouter.get("/water/intake/{username}/date/{target_date}", response_model=List[WaterIntakeResponse])
async def get_water_by_date(username: str, target_date: date):
    """Get all water intakes for a specific date"""
    try:
        intakes = get_water_intake_by_date(username, target_date)
        return intakes
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving water intakes: {str(e)}")


@WaterRouter.get("/water/intake/{username}/range", response_model=List[WaterIntakeResponse])
async def get_water_by_range(username: str, start_date: date, end_date: date):
    """Get all water intakes within a date range"""
    try:
        intakes = get_water_intake_by_range(username, start_date, end_date)
        return intakes
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving water intakes: {str(e)}")


@WaterRouter.put("/water/intake/{username}/{intake_id}", response_model=WaterIntakeResponse)
async def update_water(username: str, intake_id: str, intake_update: WaterIntakeUpdate):
    """Update an existing water intake entry"""
    try:
        result = update_water_intake(username, intake_id, intake_update.amount, intake_update.timestamp)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating water intake: {str(e)}")


@WaterRouter.delete("/water/intake/{username}/{intake_id}")
async def delete_water(username: str, intake_id: str):
    """Delete a water intake entry"""
    try:
        success = delete_water_intake(username, intake_id)
        return {"success": success, "message": "Water intake deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting water intake: {str(e)}")


@WaterRouter.get("/water/stats/{username}/daily/{target_date}", response_model=DailyStatsResponse)
async def get_daily_stats(username: str, target_date: date):
    """Get daily water intake statistics"""
    try:
        stats = get_daily_water_stats(username, target_date)
        return stats
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving daily stats: {str(e)}")


@WaterRouter.get("/water/stats/{username}/daily", response_model=DailyStatsResponse)
async def get_today_stats(username: str):
    """Get today's water intake statistics"""
    try:
        stats = get_daily_water_stats(username, date.today())
        return stats
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving daily stats: {str(e)}")


@WaterRouter.get("/water/streak/{username}", response_model=StreakResponse)
async def get_water_streak(username: str, target_percentage: float = 80.0, days_to_check: int = 30):
    """Calculate water intake streak"""
    try:
        streak = calculate_water_streak(username, target_percentage, days_to_check)
        return streak
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating streak: {str(e)}")


@WaterRouter.get("/water/summary/{username}/weekly", response_model=WeeklySummaryResponse)
async def get_weekly_water_summary(username: str, target_date: Optional[date] = None):
    """Get weekly water intake summary"""
    try:
        summary = get_weekly_summary(username, target_date)
        return summary
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving weekly summary: {str(e)}")