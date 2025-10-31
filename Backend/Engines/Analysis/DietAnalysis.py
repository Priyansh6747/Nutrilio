from typing import List, Dict, Any, Union
from pydantic import BaseModel
from datetime import date, datetime
import statistics


class Nutrient(BaseModel):
    amt: float
    unit: str
    name: str


class Meal(BaseModel):
    id: str
    nutrients: List[Nutrient]
    serving_size: float
    category: str
    status: int
    food_id: int
    timestamp: datetime
    name: str


class DailyStats(BaseModel):
    date: date
    meal_count: int
    meals: List[Meal]
    nutrient_totals: List[Nutrient]


class WeeklyNutrient(BaseModel):
    week_start: date
    week_end: date
    daily_stats: List[DailyStats]
    total_meals: int
    days_tracked: int
    weekly_nutrient_totals: List[Nutrient]
    average_daily_nutrients: List[Nutrient]


def dict_to_weekly_nutrient(data: Dict[str, Any]) -> WeeklyNutrient:
    # Convert nutrient dictionaries to Nutrient objects
    weekly_nutrient_totals = [
        Nutrient(amt=n["amt"], unit=n["unit"], name=n["name"])
        for n in data["weekly_nutrient_totals"]
    ]

    average_daily_nutrients = [
        Nutrient(amt=n["amt"], unit=n["unit"], name=n["name"])
        for n in data["average_daily_nutrients"]
    ]

    # Convert daily stats dictionaries to DailyStats objects
    daily_stats_list = []
    for day_data in data["daily_stats"]:
        # Convert nutrient totals for this day
        nutrient_totals = [
            Nutrient(amt=n["amt"], unit=n["unit"], name=n["name"])
            for n in day_data.get("nutrient_totals", [])
        ]

        # Convert meals for this day
        meals = []
        for meal_data in day_data.get("meals", []):
            meal_nutrients = [
                Nutrient(amt=n["amt"], unit=n["unit"], name=n["name"])
                for n in meal_data.get("nutrients", [])
            ]

            meals.append(Meal(
                id=meal_data["id"],
                nutrients=meal_nutrients,
                serving_size=meal_data["serving_size"],
                category=meal_data["category"],
                status=meal_data["status"],
                food_id=meal_data["food_id"],
                timestamp=meal_data["timestamp"],
                name=meal_data["name"]
            ))

        daily_stats_list.append(DailyStats(
            date=day_data["date"],
            meal_count=day_data["meal_count"],
            meals=meals,
            nutrient_totals=nutrient_totals
        ))

    return WeeklyNutrient(
        week_start=data["week_start"],
        week_end=data["week_end"],
        daily_stats=daily_stats_list,
        total_meals=data["total_meals"],
        days_tracked=data["days_tracked"],
        weekly_nutrient_totals=weekly_nutrient_totals,
        average_daily_nutrients=average_daily_nutrients
    )


def compute_user_needs(
        weekly_nutrition_summary: Union[WeeklyNutrient, Dict[str, Any]],
        gender: str,
        age: int,
        height_cm: float,
        weight_kg: float,
        activity_factor: float,
        goal: str
) -> Dict[str, Any]:
    if isinstance(weekly_nutrition_summary, dict):
        weekly_nutrition_summary = dict_to_weekly_nutrient(weekly_nutrition_summary)

    # Step 1: Compute BMR using Mifflin-St Jeor formula
    if gender.lower() == "male":
        BMR = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    else:
        BMR = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161

    # Step 2: Compute TDEE
    TDEE = BMR * activity_factor

    # Adjust TDEE for goal
    goal_adjustments = {
        "weight_loss": 0.875,  # Average of 0.85-0.9
        "maintenance": 1.0,
        "weight_gain": 1.15,  # Average of 1.1-1.2
        "muscle_gain": 1.2  # Average of 1.15-1.25
    }
    adjusted_TDEE = TDEE * goal_adjustments.get(goal.lower(), 1.0)

    # Step 3: Set macro targets based on goal
    macro_ratios = {
        "weight_loss": {"protein": 0.25, "fat": 0.25, "carbs": 0.50},
        "maintenance": {"protein": 0.20, "fat": 0.30, "carbs": 0.50},
        "weight_gain": {"protein": 0.20, "fat": 0.25, "carbs": 0.55},
        "muscle_gain": {"protein": 0.30, "fat": 0.25, "carbs": 0.45}
    }
    ratios = macro_ratios.get(goal.lower(), macro_ratios["maintenance"])

    # Convert calories to grams
    protein_g = round((adjusted_TDEE * ratios["protein"]) / 4, 1)
    fat_g = round((adjusted_TDEE * ratios["fat"]) / 9, 1)
    carbs_g = round((adjusted_TDEE * ratios["carbs"]) / 4, 1)

    macros_target = {
        "protein_g": protein_g,
        "fat_g": fat_g,
        "carbs_g": carbs_g
    }

    # Step 4: Compute micronutrient targets (RDA-based)
    micros_target = {
        "iron_mg": 18 if gender.lower() == "female" else 8,
        "calcium_mg": 1000,
        "vitaminC_mg": 75 if gender.lower() == "female" else 90,
        "fiber_g": 30
    }

    # Step 5: Aggregate actual weekly intake
    weekly_actual = {}
    for nutrient in weekly_nutrition_summary.average_daily_nutrients:
        # Normalize nutrient names for consistency
        name_map = {
            "protein": "protein_g",
            "fat": "fat_g",
            "carbohydrates": "carbs_g",
            "carbs": "carbs_g",
            "iron": "iron_mg",
            "calcium": "calcium_mg",
            "vitamin c": "vitaminC_mg",
            "vitaminc": "vitaminC_mg",
            "fiber": "fiber_g"
        }
        normalized_name = name_map.get(nutrient.name.lower(), nutrient.name.lower())
        weekly_actual[normalized_name] = round(nutrient.amt, 1)

    # Step 6: Compute nutrient gaps
    nutrient_gaps = {}

    # Macro gaps
    for macro in ["protein_g", "fat_g", "carbs_g"]:
        target = macros_target[macro]
        actual = weekly_actual.get(macro, 0)
        nutrient_gaps[macro] = round(target - actual, 1)

    # Micro gaps
    for micro, target in micros_target.items():
        actual = weekly_actual.get(micro, 0)
        nutrient_gaps[micro] = round(target - actual, 1)

    # Step 7: Compute variability/patterns
    patterns = _compute_variability_patterns(weekly_nutrition_summary)

    # Step 8: Return structured profile
    return {
        "TDEE": round(adjusted_TDEE, 0),
        "macros_target": macros_target,
        "micros_target": micros_target,
        "weekly_actual": weekly_actual,
        "nutrient_gaps": nutrient_gaps,
        "patterns": patterns,
        "goal": goal
    }


def _compute_variability_patterns(weekly_data: WeeklyNutrient) -> Dict[str, str]:
    patterns = {}

    # Collect daily values for each nutrient
    nutrient_daily_values = {}

    for day_stats in weekly_data.daily_stats:
        for nutrient in day_stats.nutrient_totals:
            name = nutrient.name.lower()
            if name not in nutrient_daily_values:
                nutrient_daily_values[name] = []
            nutrient_daily_values[name].append(nutrient.amt)

    # Compute standard deviation and classify variability
    for nutrient_name, values in nutrient_daily_values.items():
        if len(values) < 2:
            patterns[f"{nutrient_name}_variability"] = "unknown"
            continue

        mean_val = statistics.mean(values)
        if mean_val == 0:
            patterns[f"{nutrient_name}_variability"] = "unknown"
            continue

        std_dev = statistics.stdev(values)
        coefficient_of_variation = (std_dev / mean_val) * 100

        # Classify based on CV%
        if coefficient_of_variation < 15:
            variability = "low"
        elif coefficient_of_variation < 30:
            variability = "medium"
        else:
            variability = "high"

        patterns[f"{nutrient_name}_variability"] = variability

    return patterns

