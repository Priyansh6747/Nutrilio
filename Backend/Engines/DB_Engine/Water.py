from Config import firestoreDB
from datetime import datetime, date, timedelta
from typing import List, Optional, Dict, Any
from google.cloud.firestore_v1 import FieldFilter


def add_water_intake(username: str, amount: int, timestamp: Optional[datetime] = None) -> Dict[str, Any]:
    user_ref = firestoreDB.collection('users').document(username)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise ValueError(f"User {username} not found")

    if amount <= 0:
        raise ValueError("Amount must be greater than 0")

    # Use provided timestamp or current time
    timestamp = timestamp if timestamp else datetime.now()

    # Create water intake document
    water_data = {
        "timestamp": timestamp,
        "amount": amount
    }

    # Add to Water subcollection
    water_ref = user_ref.collection('Water').add(water_data)
    doc_id = water_ref[1].id

    return {
        "id": doc_id,
        "timestamp": timestamp,
        "amount": amount
    }


def get_water_intake_by_date(username: str, target_date: date) -> List[Dict[str, Any]]:
    user_ref = firestoreDB.collection('users').document(username)

    if not user_ref.get().exists:
        raise ValueError(f"User {username} not found")

    # Define start and end of the day
    start_datetime = datetime.combine(target_date, datetime.min.time())
    end_datetime = datetime.combine(target_date, datetime.max.time())

    # Query water intakes for the date
    water_query = (
        user_ref.collection('Water')
        .where(filter=FieldFilter("timestamp", ">=", start_datetime))
        .where(filter=FieldFilter("timestamp", "<=", end_datetime))
        .order_by("timestamp")
    )

    intakes = []
    for doc in water_query.stream():
        data = doc.to_dict()
        intakes.append({
            "id": doc.id,
            "timestamp": data['timestamp'],
            "amount": data['amount']
        })

    return intakes


def get_water_intake_by_range(username: str, start_date: date, end_date: date) -> List[Dict[str, Any]]:
    if start_date > end_date:
        raise ValueError("Start date must be before or equal to end date")

    user_ref = firestoreDB.collection('users').document(username)

    if not user_ref.get().exists:
        raise ValueError(f"User {username} not found")

    start_datetime = datetime.combine(start_date, datetime.min.time())
    end_datetime = datetime.combine(end_date, datetime.max.time())

    water_query = (
        user_ref.collection('Water')
        .where(filter=FieldFilter("timestamp", ">=", start_datetime))
        .where(filter=FieldFilter("timestamp", "<=", end_datetime))
        .order_by("timestamp")
    )

    intakes = []
    for doc in water_query.stream():
        data = doc.to_dict()
        intakes.append({
            "id": doc.id,
            "timestamp": data['timestamp'],
            "amount": data['amount']
        })

    return intakes


def update_water_intake(username: str, intake_id: str, amount: Optional[int] = None,
                        timestamp: Optional[datetime] = None) -> Dict[str, Any]:
    if amount is not None and amount <= 0:
        raise ValueError("Amount must be greater than 0")

    if amount is None and timestamp is None:
        raise ValueError("Must provide at least one field to update")

    user_ref = firestoreDB.collection('users').document(username)
    water_ref = user_ref.collection('Water').document(intake_id)

    water_doc = water_ref.get()
    if not water_doc.exists:
        raise ValueError(f"Water intake {intake_id} not found")

    # Prepare update data
    update_dict = {}
    if amount is not None:
        update_dict['amount'] = amount
    if timestamp is not None:
        update_dict['timestamp'] = timestamp

    water_ref.update(update_dict)

    # Get updated document
    updated_doc = water_ref.get()
    data = updated_doc.to_dict()

    return {
        "id": intake_id,
        "timestamp": data['timestamp'],
        "amount": data['amount']
    }


def delete_water_intake(username: str, intake_id: str) -> bool:
    user_ref = firestoreDB.collection('users').document(username)
    water_ref = user_ref.collection('Water').document(intake_id)

    water_doc = water_ref.get()
    if not water_doc.exists:
        raise ValueError(f"Water intake {intake_id} not found")

    water_ref.delete()
    return True


def get_daily_water_stats(username: str, target_date: date) -> Dict[str, Any]:
    user_ref = firestoreDB.collection('users').document(username)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise ValueError(f"User {username} not found")

    user_data = user_doc.to_dict()

    # Calculate recommended water intake (basic formula: 30-35ml per kg)
    weight = user_data.get('weight', 70)
    recommended = int(weight * 33)  # ml

    # Get intakes for the date
    intakes = get_water_intake_by_date(username, target_date)

    total_intake = sum(intake['amount'] for intake in intakes)
    percentage = (total_intake / recommended * 100) if recommended > 0 else 0

    return {
        "date": target_date,
        "total_intake": total_intake,
        "intake_count": len(intakes),
        "intakes": intakes,
        "recommended_intake": recommended,
        "percentage_completed": round(percentage, 2)
    }


def add_quick_glass(username: str) -> Dict[str, Any]:

    user_ref = firestoreDB.collection('users').document(username)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise ValueError(f"User {username} not found")

    user_data = user_doc.to_dict()
    glass_size = user_data.get('GlassSize', 250)

    return add_water_intake(username, int(glass_size))


def calculate_water_streak(username: str, target_percentage: float = 80.0, days_to_check: int = 30) -> Dict[str, Any]:
    """
    Calculate user's water intake streak

    Args:
        username: User's unique identifier
        target_percentage: Minimum percentage of goal to count as success (default 80%)
        days_to_check: Number of days to check for streak calculation

    Returns:
        Dictionary with current_streak, longest_streak, and target_percentage

    Raises:
        ValueError: If user not found
    """
    user_ref = firestoreDB.collection('users').document(username)

    if not user_ref.get().exists:
        raise ValueError(f"User {username} not found")

    current_streak = 0
    longest_streak = 0
    temp_streak = 0

    # Check specified number of days
    today = date.today()
    for i in range(days_to_check):
        check_date = today - timedelta(days=i)
        stats = get_daily_water_stats(username, check_date)

        if stats['percentage_completed'] >= target_percentage:
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
        "target_percentage": target_percentage
    }


def get_weekly_summary(username: str, target_date: Optional[date] = None) -> Dict[str, Any]:
    """
    Get weekly water intake summary

    Args:
        username: User's unique identifier
        target_date: Date within the week to summarize (defaults to today)

    Returns:
        Dictionary with week stats including daily breakdown and averages

    Raises:
        ValueError: If user not found
    """
    if target_date is None:
        target_date = date.today()

    # Get start of week (Monday)
    days_since_monday = target_date.weekday()
    week_start = target_date - timedelta(days=days_since_monday)
    week_end = week_start + timedelta(days=6)

    daily_stats = []
    total_intake = 0
    total_recommended = 0
    days_met_goal = 0

    for i in range(7):
        current_date = week_start + timedelta(days=i)
        if current_date <= date.today():
            stats = get_daily_water_stats(username, current_date)
            daily_stats.append(stats)
            total_intake += stats['total_intake']
            total_recommended += stats['recommended_intake']
            if stats['percentage_completed'] >= 100:
                days_met_goal += 1

    days_with_data = len(daily_stats)
    avg_intake = total_intake / days_with_data if days_with_data > 0 else 0
    avg_recommended = total_recommended / days_with_data if days_with_data > 0 else 0
    avg_percentage = (avg_intake / avg_recommended * 100) if avg_recommended > 0 else 0

    return {
        "week_start": week_start,
        "week_end": week_end,
        "daily_stats": daily_stats,
        "total_intake": total_intake,
        "average_daily_intake": round(avg_intake, 2),
        "average_percentage": round(avg_percentage, 2),
        "days_met_goal": days_met_goal,
        "days_tracked": days_with_data
    }