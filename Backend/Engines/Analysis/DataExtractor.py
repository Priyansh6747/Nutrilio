"""
DataExtractor.py - Module 1 of Habit Analysis Pipeline

This module is responsible for bridging your database (Firestore + local engine functions) 
with the analysis layer. Think of it as your data gateway — a clean, normalized interface 
between raw stored data and the rest of the pipeline.

Primary Goal:
    To fetch and standardize user-level nutrition and engagement data over time — directly 
    from your backend's internal functions (Engines.DB_Engine.Meal).

Responsibilities:
    - Data Retrieval: Calls get_weekly_nutrition_summary, get_combined_engagement_graph_data, 
                     get_daily_nutrition_stats, and calculate_meal_streak
    - Normalization: Converts nested structures into simple dicts with scalar values per day
    - Data Continuity: Ensures all dates in range exist — fills missing ones with zeros or nulls
    - Temporal Ordering: Outputs results sorted by date
    - Logging: Warns if any sub-fetch fails but does not break pipeline
"""

from datetime import date, timedelta
from typing import Dict, List, Optional
import logging

# Import your existing DB engine functions
from Engines.DB_Engine.Meal import (
    get_daily_nutrition_stats,
    get_weekly_nutrition_summary,
    get_combined_engagement_graph_data,
    calculate_meal_streak
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DataExtractor:
    """
    Handles data retrieval and normalization from backend sources for habit analysis.
    Uses DB_Engine functions directly instead of hitting HTTP endpoints.
    """

    def __init__(self, username: str):
        """
        Initialize the DataExtractor for a specific user.
        
        Args:
            username (str): Unique user identifier.
        """
        self.username = username
        logger.info(f"DataExtractor initialized for user: {username}")

    def fetch_daily_nutrition(self, target_date: date) -> Dict:
        """
        Fetches nutrient totals for a single date.
        
        Args:
            target_date (date): The date to fetch nutrition data for.
            
        Returns:
            Dict: Normalized dictionary with date and nutrient values.
                  Example:
                  {
                      "date": "2025-11-06",
                      "calories": 591.79,
                      "protein_g": 21.01,
                      "carbs_g": 83.01,
                      "fat_g": 22.00,
                      "fiber_g": 7.83,
                      "sugar_g": 11.2,
                      ...
                  }
        """
        try:
            stats = get_daily_nutrition_stats(self.username, target_date)
            
            # Initialize result with date
            result = {"date": target_date.isoformat()}
            
            # Extract and normalize nutrient totals
            nutrient_totals = stats.get('nutrient_totals', [])
            
            for nutrient in nutrient_totals:
                name = nutrient.get('name', '').lower().replace(' ', '_')
                amt = float(nutrient.get('amt', 0.0))
                unit = nutrient.get('unit', '')
                
                # Standardize common nutrient names
                # Map various names to canonical forms
                name_mapping = {
                    'energy': 'calories',
                    'carbohydrate': 'carbs',
                    'total_carbohydrate': 'carbs',
                    'protein': 'protein',
                    'total_fat': 'fat',
                    'fat': 'fat',
                    'dietary_fiber': 'fiber',
                    'fiber': 'fiber',
                    'sugars': 'sugar',
                    'total_sugars': 'sugar',
                    'vitamin_a': 'vitamin_a',
                    'vitamin_c': 'vitamin_c',
                    'vitamin_d': 'vitamin_d',
                    'vitamin_e': 'vitamin_e',
                    'calcium': 'calcium',
                    'iron': 'iron',
                    'potassium': 'potassium',
                    'sodium': 'sodium',
                    'magnesium': 'magnesium',
                    'zinc': 'zinc'
                }
                
                # Use mapped name if available, otherwise use normalized name
                canonical_name = name_mapping.get(name, name)
                
                # Add unit suffix if not calories
                if canonical_name != 'calories':
                    key = f"{canonical_name}_{unit.lower()}" if unit else canonical_name
                else:
                    key = canonical_name
                
                result[key] = amt
            
            # Ensure common nutrients exist even if not present (fill with 0)
            default_nutrients = [
                'calories', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g', 
                'sugar_g', 'sodium_mg', 'calcium_mg', 'iron_mg'
            ]
            
            for nutrient in default_nutrients:
                if nutrient not in result:
                    result[nutrient] = 0.0
            
            return result
            
        except Exception as e:
            logger.warning(f"Failed to fetch daily nutrition for {target_date}: {e}")
            return self.handle_missing_day(target_date)

    def fetch_weekly_summary(self, target_date: Optional[date] = None) -> Dict:
        """
        Fetches 7-day aggregate nutrition data.
        This helps calculate averages, variability, and context-level stats.
        
        Args:
            target_date (Optional[date]): Reference date for the week. Defaults to today.
            
        Returns:
            Dict: Weekly summary data.
                  Example:
                  {
                      "week_start": "2025-10-27",
                      "week_end": "2025-11-02",
                      "average_daily_nutrients": [
                          {"name": "Calories", "amt": 729.11, "unit": "kcal"},
                          {"name": "Protein", "amt": 18.15, "unit": "g"},
                          ...
                      ],
                      "days_tracked": 6,
                      "total_meals": 8
                  }
        """
        try:
            summary = get_weekly_nutrition_summary(self.username, target_date)
            
            # Convert dates to ISO format for consistency
            summary['week_start'] = summary['week_start'].isoformat()
            summary['week_end'] = summary['week_end'].isoformat()
            
            return summary
            
        except Exception as e:
            logger.warning(f"Failed to fetch weekly summary: {e}")
            return {
                "week_start": None,
                "week_end": None,
                "average_daily_nutrients": [],
                "days_tracked": 0,
                "total_meals": 0
            }

    def fetch_engagement(self, days: int = 60, end_date: Optional[date] = None) -> List[Dict]:
        """
        Fetches engagement metrics like meal count, water intake, streaks, etc.
        
        Args:
            days (int): Number of days to look back. Default 60.
            end_date (Optional[date]): End date for the range. Default today.
            
        Returns:
            List[Dict]: Daily engagement data with all gaps filled.
                        Example:
                        [
                            {
                                "date": "2025-10-27",
                                "meal_count": 3,
                                "meal_intensity": 2,
                                "water_intensity": 3,
                                "combined_intensity": 9,
                                "intake_amount": 1200,
                                "percentage_completed": 58.3
                            },
                            ...
                        ]
        """
        try:
            engagement_data = get_combined_engagement_graph_data(
                self.username, 
                days=days, 
                end_date=end_date
            )
            
            # Extract daily activity
            daily_activity = engagement_data.get('daily_activity', [])
            
            # Ensure date range completeness
            if end_date is None:
                end_date = date.today()
            
            start_date = end_date - timedelta(days=days - 1)
            all_dates = self.get_date_range(start_date, end_date)
            
            # Create a map for quick lookup
            activity_map = {item['date']: item for item in daily_activity}
            
            # Fill gaps and normalize
            normalized_activity = []
            for current_date in all_dates:
                date_str = current_date.isoformat()
                
                if date_str in activity_map:
                    item = activity_map[date_str]
                    normalized_activity.append({
                        "date": date_str,
                        "meal_count": int(item.get('meal_count', 0)),
                        "meal_intensity": int(item.get('meal_intensity', 0)),
                        "water_intensity": int(item.get('water_intensity', 0)),
                        "combined_intensity": int(item.get('combined_intensity', 0)),
                        "intake_amount": float(item.get('intake_amount', 0.0)),
                        "percentage_completed": float(item.get('percentage_completed', 0.0))
                    })
                else:
                    # Missing day - fill with zeros
                    normalized_activity.append({
                        "date": date_str,
                        "meal_count": 0,
                        "meal_intensity": 0,
                        "water_intensity": 0,
                        "combined_intensity": 0,
                        "intake_amount": 0.0,
                        "percentage_completed": 0.0
                    })
            
            return normalized_activity
            
        except Exception as e:
            logger.warning(f"Failed to fetch engagement data: {e}")
            return []

    def fetch_streak(self) -> Dict:
        """
        Fetches user's meal logging streak information.
        
        Returns:
            Dict: Streak data.
                  Example:
                  {
                      "current_streak": 4,
                      "longest_streak": 10,
                      "min_meals_per_day": 3
                  }
        """
        try:
            streak_data = calculate_meal_streak(self.username, min_meals_per_day=3, days_to_check=30)
            return streak_data
            
        except Exception as e:
            logger.warning(f"Failed to fetch streak data: {e}")
            return {
                "current_streak": 0,
                "longest_streak": 0,
                "min_meals_per_day": 3
            }

    def get_date_range(self, start_date: date, end_date: date) -> List[date]:
        """
        Helper function to generate a continuous daily range.
        
        Args:
            start_date (date): Start of the range (inclusive).
            end_date (date): End of the range (inclusive).
            
        Returns:
            List[date]: List of dates in chronological order.
        """
        delta = end_date - start_date
        return [start_date + timedelta(days=i) for i in range(delta.days + 1)]

    def build_raw_data(self, start_date: date, end_date: date) -> List[Dict]:
        """
        Combines all data sources to create a unified, gap-free daily dataset 
        ready for feature engineering.
        
        Flow:
            1. fetch_engagement() → get daily logs (meals/water)
            2. fetch_daily_nutrition() for each day → get macros/micros
            3. fetch_streak() → apply globally
            4. merge → fill gaps → output list of dicts
        
        Args:
            start_date (date): Start of the date range.
            end_date (date): End of the date range.
            
        Returns:
            List[Dict]: Unified daily-level dataset.
                        Example:
                        [
                            {
                                "date": "2025-10-27",
                                "calories": 2713.05,
                                "protein_g": 61.4,
                                "fat_g": 149.1,
                                "carbs_g": 289.0,
                                "fiber_g": 31.9,
                                "meal_count": 3,
                                "water_intake_ml": 1200,
                                "combined_intensity": 9,
                                "current_streak": 4,
                                "longest_streak": 10
                            },
                            ...
                        ]
        """
        logger.info(f"Building raw data from {start_date} to {end_date}")
        
        # Calculate number of days
        days = (end_date - start_date).days + 1
        
        # Fetch engagement data (includes meal counts and water intake)
        engagement_data = self.fetch_engagement(days=days, end_date=end_date)
        
        # Fetch streak information (applies to all days)
        streak_data = self.fetch_streak()
        
        # Build comprehensive dataset
        raw_data = []
        
        for engagement_record in engagement_data:
            date_str = engagement_record['date']
            current_date = date.fromisoformat(date_str)
            
            # Fetch nutrition data for this specific day
            nutrition_data = self.fetch_daily_nutrition(current_date)
            
            # Merge all data sources
            merged_record = {
                "date": date_str,
                # Nutrition data
                "calories": nutrition_data.get('calories', 0.0),
                "protein_g": nutrition_data.get('protein_g', 0.0),
                "carbs_g": nutrition_data.get('carbs_g', 0.0),
                "fat_g": nutrition_data.get('fat_g', 0.0),
                "fiber_g": nutrition_data.get('fiber_g', 0.0),
                "sugar_g": nutrition_data.get('sugar_g', 0.0),
                "sodium_mg": nutrition_data.get('sodium_mg', 0.0),
                "calcium_mg": nutrition_data.get('calcium_mg', 0.0),
                "iron_mg": nutrition_data.get('iron_mg', 0.0),
                # Engagement data
                "meal_count": engagement_record.get('meal_count', 0),
                "meal_intensity": engagement_record.get('meal_intensity', 0),
                "water_intake_ml": engagement_record.get('intake_amount', 0.0),
                "water_intensity": engagement_record.get('water_intensity', 0),
                "water_percentage_completed": engagement_record.get('percentage_completed', 0.0),
                "combined_intensity": engagement_record.get('combined_intensity', 0),
                # Streak data (global for all days)
                "current_streak": streak_data.get('current_streak', 0),
                "longest_streak": streak_data.get('longest_streak', 0)
            }
            
            # Add any additional nutrients from nutrition_data
            for key, value in nutrition_data.items():
                if key not in merged_record and key != 'date':
                    merged_record[key] = value
            
            raw_data.append(merged_record)
        
        logger.info(f"Successfully built {len(raw_data)} days of raw data")
        return raw_data

    def handle_missing_day(self, target_date: date) -> Dict:
        """
        Used when no data exists for a day — returns a standardized zero-filled entry.
        
        Args:
            target_date (date): The date to create a zero-filled entry for.
            
        Returns:
            Dict: Zero-filled daily record.
                  Example:
                  {
                      "date": "2025-11-03",
                      "calories": 0.0,
                      "protein_g": 0.0,
                      "carbs_g": 0.0,
                      "fat_g": 0.0,
                      "fiber_g": 0.0,
                      "sugar_g": 0.0,
                      ...
                  }
        """
        return {
            "date": target_date.isoformat(),
            "calories": 0.0,
            "protein_g": 0.0,
            "carbs_g": 0.0,
            "fat_g": 0.0,
            "fiber_g": 0.0,
            "sugar_g": 0.0,
            "sodium_mg": 0.0,
            "calcium_mg": 0.0,
            "iron_mg": 0.0,
            "meal_count": 0,
            "meal_intensity": 0,
            "water_intake_ml": 0.0,
            "water_intensity": 0,
            "water_percentage_completed": 0.0,
            "combined_intensity": 0,
            "current_streak": 0,
            "longest_streak": 0
        }


# Example usage and testing
def Test():
    from datetime import date, timedelta

    # Initialize with a test username
    username = "KwpGnNMQiYYaN3RY5qDT9xIsWZ33"
    extractor = DataExtractor(username)

    # Define date range (last 30 days)
    end = date.today()
    start = end - timedelta(days=30)

    print("\n" + "="*80)
    print("DATA EXTRACTOR - TEST RUN")
    print("="*80)
    print(f"User: {username}")
    print(f"Date Range: {start} to {end}")
    print("="*80 + "\n")

    # Test 1: Fetch daily nutrition
    print("[TEST 1] Fetching daily nutrition for today...")
    daily_nutrition = extractor.fetch_daily_nutrition(date.today())
    print(f"✓ Retrieved {len(daily_nutrition)} fields")
    print(f"  Sample: calories={daily_nutrition.get('calories', 0)}, "
          f"protein={daily_nutrition.get('protein_g', 0)}g\n")

    # Test 2: Fetch weekly summary
    print("[TEST 2] Fetching weekly summary...")
    weekly_summary = extractor.fetch_weekly_summary()
    print(f"✓ Week: {weekly_summary.get('week_start')} to {weekly_summary.get('week_end')}")
    print(f"  Days tracked: {weekly_summary.get('days_tracked')}")
    print(f"  Total meals: {weekly_summary.get('total_meals')}\n")

    # Test 3: Fetch engagement
    print("[TEST 3] Fetching engagement data (30 days)...")
    engagement = extractor.fetch_engagement(days=30)
    print(f"✓ Retrieved {len(engagement)} days of engagement data")
    if engagement:
        print(f"  Sample (latest): {engagement[-1]}\n")

    # Test 4: Fetch streak
    print("[TEST 4] Fetching streak information...")
    streak = extractor.fetch_streak()
    print(f"✓ Current streak: {streak.get('current_streak')} days")
    print(f"  Longest streak: {streak.get('longest_streak')} days\n")

    # Test 5: Build complete raw data
    print("[TEST 5] Building complete raw dataset (30 days)...")
    raw_data = extractor.build_raw_data(start, end)
    print(f"✓ Successfully built {len(raw_data)} days of unified data")
    
    if raw_data:
        print("\n[PREVIEW] First 2 records:")
        for i, record in enumerate(raw_data[:2]):
            print(f"\n  Day {i+1}:")
            for key, value in list(record.items())[:10]:  # Show first 10 fields
                print(f"    {key}: {value}")
            print(f"    ... ({len(record)} total fields)")

    print("\n" + "="*80)
    print("DATA EXTRACTION COMPLETE")
    print("="*80)