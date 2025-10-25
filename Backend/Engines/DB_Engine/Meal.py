from Config import firestoreDB
from datetime import datetime, date, timedelta
from typing import List, Optional, Dict, Any
from google.cloud.firestore_v1 import FieldFilter
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


def create_pending_meal_entry(username: str) -> str:
    """Create a pending meal entry and return its ID"""
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


def add_meal_entry(
        username: str,
        nutrient_breakdown: NutrientBreakDown,
        timestamp: Optional[datetime] = None,
        serving_size: Optional[float] = None,
) -> Dict[str, Any]:
    """Add a new completed meal entry"""
    user_ref = firestoreDB.collection('users').document(username)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise ValueError(f"User {username} not found")

    timestamp = timestamp if timestamp else datetime.now()

    meal_data = {
        "status": 1,
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

    meal_ref = user_ref.collection('Meals').add(meal_data)
    doc_id = meal_ref[1].id

    return {
        "id": doc_id,
        "status": 1,
        "timestamp": timestamp,
        "name": nutrient_breakdown.name,
        "food_id": nutrient_breakdown.id,
        "category": nutrient_breakdown.category,
        "serving_size": serving_size,
    }


def update_meal_entry(
        username: str,
        doc_id: str,
        nutrient_breakdown: NutrientBreakDown,
        timestamp: Optional[datetime] = None,
        serving_size: Optional[float] = None,
) -> Dict[str, Any]:
    """Update an existing meal entry"""
    user_ref = firestoreDB.collection('users').document(username)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise ValueError(f"User {username} not found")

    meal_ref = user_ref.collection('Meals').document(doc_id)
    meal_doc = meal_ref.get()

    if not meal_doc.exists:
        raise ValueError(f"Meal document {doc_id} not found")

    timestamp = timestamp if timestamp else datetime.now()

    meal_data = {
        "status": 1,
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


def get_meal_entry(username: str, meal_id: str) -> Dict[str, Any]:
    """Get a specific meal entry by ID"""
    user_ref = firestoreDB.collection('users').document(username)
    meal_ref = user_ref.collection('Meals').document(meal_id)

    meal_doc = meal_ref.get()
    if not meal_doc.exists:
        raise ValueError(f"Meal entry {meal_id} not found")

    data = meal_doc.to_dict()
    return {
        "id": meal_id,
        **data
    }


def get_meals_by_date(username: str, target_date: date) -> List[Dict[str, Any]]:
    """Get all meal entries for a specific date"""
    user_ref = firestoreDB.collection('users').document(username)

    if not user_ref.get().exists:
        raise ValueError(f"User {username} not found")

    start_datetime = datetime.combine(target_date, datetime.min.time())
    end_datetime = datetime.combine(target_date, datetime.max.time())

    meals_query = (
        user_ref.collection('Meals')
        .where(filter=FieldFilter("timestamp", ">=", start_datetime))
        .where(filter=FieldFilter("timestamp", "<=", end_datetime))
        .where(filter=FieldFilter("status", "==", 1))
        .order_by("timestamp")
    )

    meals = []
    for doc in meals_query.stream():
        data = doc.to_dict()
        meals.append({
            "id": doc.id,
            **data
        })

    return meals


def get_meals_by_range(username: str, start_date: date, end_date: date) -> List[Dict[str, Any]]:
    """Get all meal entries within a date range"""
    if start_date > end_date:
        raise ValueError("Start date must be before or equal to end date")

    user_ref = firestoreDB.collection('users').document(username)

    if not user_ref.get().exists:
        raise ValueError(f"User {username} not found")

    start_datetime = datetime.combine(start_date, datetime.min.time())
    end_datetime = datetime.combine(end_date, datetime.max.time())

    meals_query = (
        user_ref.collection('Meals')
        .where(filter=FieldFilter("timestamp", ">=", start_datetime))
        .where(filter=FieldFilter("timestamp", "<=", end_datetime))
        .where(filter=FieldFilter("status", "==", 1))
        .order_by("timestamp")
    )

    meals = []
    for doc in meals_query.stream():
        data = doc.to_dict()
        meals.append({
            "id": doc.id,
            **data
        })

    return meals


def delete_meal_entry(username: str, meal_id: str) -> bool:
    """Delete a meal entry"""
    user_ref = firestoreDB.collection('users').document(username)
    meal_ref = user_ref.collection('Meals').document(meal_id)

    meal_doc = meal_ref.get()
    if not meal_doc.exists:
        raise ValueError(f"Meal entry {meal_id} not found")

    meal_ref.delete()
    return True


def get_daily_nutrition_stats(username: str, target_date: date) -> Dict[str, Any]:
    """Get aggregated nutrition stats for a specific day"""
    user_ref = firestoreDB.collection('users').document(username)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise ValueError(f"User {username} not found")

    meals = get_meals_by_date(username, target_date)

    # Aggregate nutrients
    nutrient_totals = {}
    for meal in meals:
        if 'nutrients' in meal:
            for nutrient in meal['nutrients']:
                name = nutrient['name']
                amt = nutrient['amt']
                unit = nutrient['unit']

                if name not in nutrient_totals:
                    nutrient_totals[name] = {"amt": 0, "unit": unit}
                nutrient_totals[name]["amt"] += amt

    return {
        "date": target_date,
        "meal_count": len(meals),
        "meals": meals,
        "nutrient_totals": [
            {"name": name, "amt": data["amt"], "unit": data["unit"]}
            for name, data in nutrient_totals.items()
        ]
    }


def get_weekly_nutrition_summary(username: str, target_date: Optional[date] = None) -> Dict[str, Any]:
    """Get weekly nutrition summary"""
    if target_date is None:
        target_date = date.today()

    days_since_monday = target_date.weekday()
    week_start = target_date - timedelta(days=days_since_monday)
    week_end = week_start + timedelta(days=6)

    daily_stats = []
    total_meals = 0
    weekly_nutrient_totals = {}

    for i in range(7):
        current_date = week_start + timedelta(days=i)
        if current_date <= date.today():
            stats = get_daily_nutrition_stats(username, current_date)
            daily_stats.append(stats)
            total_meals += stats['meal_count']

            # Aggregate weekly nutrients
            for nutrient in stats['nutrient_totals']:
                name = nutrient['name']
                amt = nutrient['amt']
                unit = nutrient['unit']

                if name not in weekly_nutrient_totals:
                    weekly_nutrient_totals[name] = {"amt": 0, "unit": unit}
                weekly_nutrient_totals[name]["amt"] += amt

    days_with_data = len(daily_stats)

    # Calculate averages
    avg_nutrient_totals = {}
    if days_with_data > 0:
        for name, data in weekly_nutrient_totals.items():
            avg_nutrient_totals[name] = {
                "amt": round(data["amt"] / days_with_data, 2),
                "unit": data["unit"]
            }

    return {
        "week_start": week_start,
        "week_end": week_end,
        "daily_stats": daily_stats,
        "total_meals": total_meals,
        "days_tracked": days_with_data,
        "weekly_nutrient_totals": [
            {"name": name, "amt": data["amt"], "unit": data["unit"]}
            for name, data in weekly_nutrient_totals.items()
        ],
        "average_daily_nutrients": [
            {"name": name, "amt": data["amt"], "unit": data["unit"]}
            for name, data in avg_nutrient_totals.items()
        ]
    }


def calculate_meal_streak(username: str, min_meals_per_day: int = 3, days_to_check: int = 30) -> Dict[str, Any]:
    """Calculate user's meal logging streak"""
    user_ref = firestoreDB.collection('users').document(username)

    if not user_ref.get().exists:
        raise ValueError(f"User {username} not found")

    current_streak = 0
    longest_streak = 0
    temp_streak = 0

    today = date.today()
    for i in range(days_to_check):
        check_date = today - timedelta(days=i)
        stats = get_daily_nutrition_stats(username, check_date)

        if stats['meal_count'] >= min_meals_per_day:
            temp_streak += 1
            if i == 0 or current_streak > 0:
                current_streak = temp_streak
        else:
            if temp_streak > longest_streak:
                longest_streak = temp_streak
            temp_streak = 0
            if i == 0:
                current_streak = 0

    if temp_streak > longest_streak:
        longest_streak = temp_streak

    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "min_meals_per_day": min_meals_per_day
    }


def get_top_nutrients(username: str, start_date: date, end_date: date, top_n: int = 5) -> Dict[str, Any]:
    """Get top N nutrients consumed during a date range"""
    if start_date > end_date:
        raise ValueError("Start date must be before or equal to end date")

    user_ref = firestoreDB.collection('users').document(username)
    if not user_ref.get().exists:
        raise ValueError(f"User {username} not found")

    meals = get_meals_by_range(username, start_date, end_date)

    # Aggregate all nutrients
    nutrient_totals = {}
    for meal in meals:
        if 'nutrients' in meal:
            for nutrient in meal['nutrients']:
                name = nutrient['name']
                amt = nutrient['amt']
                unit = nutrient['unit']

                if name not in nutrient_totals:
                    nutrient_totals[name] = {"amt": 0, "unit": unit, "count": 0}
                nutrient_totals[name]["amt"] += amt
                nutrient_totals[name]["count"] += 1

    # Sort by amount and get top N
    sorted_nutrients = sorted(
        nutrient_totals.items(),
        key=lambda x: x[1]["amt"],
        reverse=True
    )[:top_n]

    return {
        "start_date": start_date,
        "end_date": end_date,
        "total_meals": len(meals),
        "top_nutrients": [
            {
                "name": name,
                "total_amount": round(data["amt"], 2),
                "unit": data["unit"],
                "occurrence_count": data["count"],
                "average_per_meal": round(data["amt"] / len(meals), 2) if meals else 0
            }
            for name, data in sorted_nutrients
        ]
    }


def get_nutrient_timeline(username: str, nutrient_name: str, start_date: date, end_date: date) -> Dict[str, Any]:
    """Get daily timeline data for a specific nutrient (for line charts)"""
    if start_date > end_date:
        raise ValueError("Start date must be before or equal to end date")

    user_ref = firestoreDB.collection('users').document(username)
    if not user_ref.get().exists:
        raise ValueError(f"User {username} not found")

    timeline_data = []
    total_days = (end_date - start_date).days + 1

    for i in range(total_days):
        current_date = start_date + timedelta(days=i)
        stats = get_daily_nutrition_stats(username, current_date)

        # Find the specific nutrient
        nutrient_amt = 0
        nutrient_unit = ""
        for nutrient in stats['nutrient_totals']:
            if nutrient['name'].lower() == nutrient_name.lower():
                nutrient_amt = nutrient['amt']
                nutrient_unit = nutrient['unit']
                break

        timeline_data.append({
            "date": current_date.isoformat(),
            "amount": round(nutrient_amt, 2),
            "meal_count": stats['meal_count']
        })

    # Calculate statistics
    amounts = [d['amount'] for d in timeline_data]
    avg_amount = sum(amounts) / len(amounts) if amounts else 0
    max_amount = max(amounts) if amounts else 0
    min_amount = min(amounts) if amounts else 0

    return {
        "nutrient_name": nutrient_name,
        "unit": nutrient_unit if timeline_data else "",
        "start_date": start_date,
        "end_date": end_date,
        "timeline": timeline_data,
        "statistics": {
            "average": round(avg_amount, 2),
            "max": round(max_amount, 2),
            "min": round(min_amount, 2),
            "total": round(sum(amounts), 2)
        }
    }


def get_nutrient_distribution(username: str, start_date: date, end_date: date,
                              nutrient_list: Optional[List[str]] = None) -> Dict[str, Any]:
    """Get distribution of nutrients for pie/donut charts"""
    if start_date > end_date:
        raise ValueError("Start date must be before or equal to end date")

    user_ref = firestoreDB.collection('users').document(username)
    if not user_ref.get().exists:
        raise ValueError(f"User {username} not found")

    meals = get_meals_by_range(username, start_date, end_date)

    # Aggregate nutrients
    nutrient_totals = {}
    for meal in meals:
        if 'nutrients' in meal:
            for nutrient in meal['nutrients']:
                name = nutrient['name']
                amt = nutrient['amt']
                unit = nutrient['unit']

                if name not in nutrient_totals:
                    nutrient_totals[name] = {"amt": 0, "unit": unit}
                nutrient_totals[name]["amt"] += amt

    # Filter by nutrient list if provided
    if nutrient_list:
        filtered_nutrients = {
            name: data for name, data in nutrient_totals.items()
            if name.lower() in [n.lower() for n in nutrient_list]
        }
        nutrient_totals = filtered_nutrients

    # Calculate total and percentages
    total_amount = sum(data["amt"] for data in nutrient_totals.values())

    distribution = [
        {
            "name": name,
            "amount": round(data["amt"], 2),
            "unit": data["unit"],
            "percentage": round((data["amt"] / total_amount * 100), 2) if total_amount > 0 else 0
        }
        for name, data in sorted(nutrient_totals.items(), key=lambda x: x[1]["amt"], reverse=True)
    ]

    return {
        "start_date": start_date,
        "end_date": end_date,
        "total_meals": len(meals),
        "distribution": distribution,
        "total_amount": round(total_amount, 2)
    }


def get_macro_breakdown(username: str, target_date: date) -> Dict[str, Any]:
    """Get macronutrient breakdown for a specific day (for pie charts)"""
    user_ref = firestoreDB.collection('users').document(username)
    if not user_ref.get().exists:
        raise ValueError(f"User {username} not found")

    stats = get_daily_nutrition_stats(username, target_date)

    # Common macronutrient names (adjust based on your data)
    macro_names = {
        'protein': ['protein', 'proteins'],
        'carbohydrates': ['carbohydrate', 'carbohydrates', 'carbs', 'total carbohydrate'],
        'fat': ['fat', 'fats', 'total fat', 'lipid'],
        'fiber': ['fiber', 'dietary fiber', 'fibre']
    }

    macros = {
        'protein': {'amount': 0, 'calories': 0, 'unit': 'g'},
        'carbohydrates': {'amount': 0, 'calories': 0, 'unit': 'g'},
        'fat': {'amount': 0, 'calories': 0, 'unit': 'g'},
        'fiber': {'amount': 0, 'calories': 0, 'unit': 'g'}
    }

    # Extract macros from nutrients
    for nutrient in stats['nutrient_totals']:
        nutrient_name_lower = nutrient['name'].lower()

        for macro_key, name_variations in macro_names.items():
            if any(variation in nutrient_name_lower for variation in name_variations):
                macros[macro_key]['amount'] = nutrient['amt']
                macros[macro_key]['unit'] = nutrient['unit']

                # Calculate calories (Protein: 4 cal/g, Carbs: 4 cal/g, Fat: 9 cal/g)
                if macro_key == 'protein':
                    macros[macro_key]['calories'] = nutrient['amt'] * 4
                elif macro_key == 'carbohydrates':
                    macros[macro_key]['calories'] = nutrient['amt'] * 4
                elif macro_key == 'fat':
                    macros[macro_key]['calories'] = nutrient['amt'] * 9
                break

    # Calculate total calories and percentages
    total_calories = sum(m['calories'] for m in macros.values() if m['amount'] > 0)

    breakdown = []
    for name, data in macros.items():
        if data['amount'] > 0:
            breakdown.append({
                "name": name.capitalize(),
                "amount": round(data['amount'], 2),
                "unit": data['unit'],
                "calories": round(data['calories'], 2),
                "percentage": round((data['calories'] / total_calories * 100), 2) if total_calories > 0 else 0
            })

    return {
        "date": target_date,
        "meal_count": stats['meal_count'],
        "macros": breakdown,
        "total_calories": round(total_calories, 2)
    }


def get_category_breakdown(username: str, start_date: date, end_date: date) -> Dict[str, Any]:
    """Get breakdown by food category (for bar/pie charts)"""
    if start_date > end_date:
        raise ValueError("Start date must be before or equal to end date")

    user_ref = firestoreDB.collection('users').document(username)
    if not user_ref.get().exists:
        raise ValueError(f"User {username} not found")

    meals = get_meals_by_range(username, start_date, end_date)

    # Count meals by category
    category_counts = {}
    category_nutrients = {}

    for meal in meals:
        category = meal.get('category', 'Uncategorized')

        if category not in category_counts:
            category_counts[category] = 0
            category_nutrients[category] = {}

        category_counts[category] += 1

        # Aggregate nutrients by category
        if 'nutrients' in meal:
            for nutrient in meal['nutrients']:
                name = nutrient['name']
                amt = nutrient['amt']
                unit = nutrient['unit']

                if name not in category_nutrients[category]:
                    category_nutrients[category][name] = {"amt": 0, "unit": unit}
                category_nutrients[category][name]["amt"] += amt

    # Format output
    categories = []
    total_meals = len(meals)

    for category, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True):
        categories.append({
            "category": category,
            "meal_count": count,
            "percentage": round((count / total_meals * 100), 2) if total_meals > 0 else 0,
            "top_nutrients": sorted(
                [
                    {"name": name, "amount": round(data["amt"], 2), "unit": data["unit"]}
                    for name, data in category_nutrients[category].items()
                ],
                key=lambda x: x["amount"],
                reverse=True
            )[:5]  # Top 5 nutrients per category
        })

    return {
        "start_date": start_date,
        "end_date": end_date,
        "total_meals": total_meals,
        "categories": categories
    }


def get_nutrient_comparison(username: str, nutrient_names: List[str],
                            start_date: date, end_date: date) -> Dict[str, Any]:
    """Compare multiple nutrients over time (for grouped bar charts)"""
    if start_date > end_date:
        raise ValueError("Start date must be before or equal to end date")

    user_ref = firestoreDB.collection('users').document(username)
    if not user_ref.get().exists:
        raise ValueError(f"User {username} not found")

    comparison_data = []
    total_days = (end_date - start_date).days + 1

    for i in range(total_days):
        current_date = start_date + timedelta(days=i)
        stats = get_daily_nutrition_stats(username, current_date)

        day_data = {
            "date": current_date.isoformat(),
        }

        # Get amounts for each requested nutrient
        for nutrient_name in nutrient_names:
            amount = 0
            unit = ""
            for nutrient in stats['nutrient_totals']:
                if nutrient['name'].lower() == nutrient_name.lower():
                    amount = nutrient['amt']
                    unit = nutrient['unit']
                    break

            day_data[nutrient_name] = {
                "amount": round(amount, 2),
                "unit": unit
            }

        comparison_data.append(day_data)

    return {
        "start_date": start_date,
        "end_date": end_date,
        "nutrients": nutrient_names,
        "comparison": comparison_data
    }
