# Habit Analysis API Documentation

## Base URL
```
/api/v1/habit
```

## Overview
The Habit Analysis API provides endpoints for generating and retrieving AI-powered habit analysis reports. The analysis process runs asynchronously in the background, allowing users to initiate analysis and retrieve results separately.

---

## Endpoints

### 1. Refresh Habit Analysis
**GET** `/refresh/{user_id}`

Initiates a new habit analysis for the specified user. The analysis runs asynchronously in the background, allowing the request to return immediately with a tracking ID.

#### Path Parameters
- `user_id` (string, required): User's unique identifier

#### Response
**Status Code:** 200 OK
```json
{
  "status": "started",
  "doc_id": "abc123xyz789",
  "message": "Habit analysis initiated successfully"
}
```

| Field | Type | Description |
|-------|------|-------------|
| status | string | Current status of the analysis ("started") |
| doc_id | string | Unique identifier for this analysis document |
| message | string | Confirmation message |

#### Error Responses
- **409 Conflict**: Analysis already in progress for this user
  ```json
  {
    "detail": "Analysis already in progress for this user"
  }
  ```
- **500 Internal Server Error**: Server error while initiating analysis

#### Usage Notes
- Only one analysis can run at a time per user
- The analysis process includes:
  1. Creating a pending analysis document
  2. Generating the habit analysis report in the background
  3. Updating the document with results when complete
- Use the returned `doc_id` to track or retrieve the analysis results

#### Example Request
```http
GET /habit/refresh/KwpGnNMQiYYaN3RY5qDT9xIsWZ33
```

#### Example Response
```json
{
  "status": "started",
  "doc_id": "analysis_20251108_123456",
  "message": "Habit analysis initiated successfully"
}
```

---

### 2. Get Habit Analysis Report
**GET** `/report/{user_id}`

Retrieves the latest completed habit analysis report for the specified user.

#### Path Parameters
- `user_id` (string, required): User's unique identifier

#### Response
**Status Code:** 200 OK
```json
{
    "user_id": "KwpGnNMQiYYaN3RY5qDT9xIsWZ33",
    "report": {
        "forecast_data": [
            {
                "vitamin_b6_mg": 0.0,
                "carbs_g": 0.0,
                "calories_roll_std_7d": 324.89,
                "calories_per_meal": 0.42,
                "saturated_fat_g": -0.0,
                "longest_streak": 1.0,
                "calories_roll_mean_7d": 185.15,
                "fiber_g_roll_mean_7d": 3.28,
                "potassium_g": 0.0,
                "protein_to_carb_ratio": 0.01,
                "protein_g_roll_mean_7d": 9.71,
                "vitamin_b2_(riboflavin)_mg": 0.0,
                "vitamin_c_g": 0.0,
                "calories_variability": 1.26,
                "calcium_mg": 0.0,
                "phosphorus_g": 0.0,
                "calcium_g": 0.0,
                "meal_count_roll_std_7d": 0.69,
                "vitamin_b3_(niacin)_mg": 0.0,
                "fat_to_calories": 0.0,
                "protein_g": -0.02,
                "vitamin_e_mg": -0.0,
                "cholesterol_mg": -0.0,
                "polyunsaturated_fat_g": 0.0,
                "water_intake_ml_variability": 1.38,
                "date": "2025-11-09",
                "water_percentage_completed": 12.59,
                "sodium_mg": -0.0,
                "zinc_mg": 0.0,
                "monounsaturated_fat_g": 0.0,
                "fat_g": -0.05,
                "sugar_g": -0.0,
                "meal_count_variability": 1.13,
                "macro_balance": 0.33,
                "meal_intensity": 0.01,
                "iron_mg": -0.01,
                "water_to_meal_ratio": 2656179.5,
                "water_intensity": 0.0,
                "sodium_g": -0.0,
                "cholesterol_g": 0.0,
                "calories": -0.92,
                "water_intake_ml_roll_std_7d": 285.31,
                "meal_count_roll_mean_7d": 0.71,
                "meal_count": 0.0,
                "protein_to_fat_ratio": 0.0,
                "vitamin_k_mg": 0.0,
                "carbs_g_variability": 0.0,
                "vitamin_b1_(thiamin)_mg": 0.01,
                "vitamin_c_mg": 0.0,
                "fiber_g": 0.01,
                "carbohydrates_g": 0.04,
                "protein_g_variability": 1.0,
                "carbs_g_roll_std_7d": 0.0,
                "fiber_g_variability": 1.12,
                "carb_to_calories": 0.0,
                "fiber_to_carb_ratio": 0.0,
                "current_streak": 0.0,
                "magnesium_g": 0.0,
                "protein_to_calories": 0.0,
                "folate_(b9)_mg": -0.0,
                "trans_fat_g": -0.0,
                "combined_intensity": 3.47,
                "protein_g_roll_std_7d": 9.5,
                "fat_g_roll_std_7d": 18.06,
                "fiber_g_roll_std_7d": 3.75,
                "fat_g_roll_mean_7d": 11.91,
                "water_intake_ml": 299.19,
                "vitamin_a_mg": 0.0,
                "vitamin_a_mcg": 0.0,
                "fat_g_variability": 1.61,
                "water_intake_ml_roll_mean_7d": 163.32,
                "carbs_g_roll_mean_7d": 0.0
            },
            {
                "vitamin_b6_mg": 0.0,
                "carbs_g": 0.0,
                "calories_roll_std_7d": 324.89,
                "calories_per_meal": 0.42,
                "saturated_fat_g": -0.0,
                "longest_streak": 1.0,
                "calories_roll_mean_7d": 144.73,
                "fiber_g_roll_mean_7d": 3.11,
                "potassium_g": 0.0,
                "protein_to_carb_ratio": 0.01,
                "protein_g_roll_mean_7d": 9.41,
                "vitamin_b2_(riboflavin)_mg": 0.0,
                "vitamin_c_g": 0.0,
                "calories_variability": 1.26,
                "calcium_mg": 0.0,
                "phosphorus_g": 0.0,
                "calcium_g": 0.0,
                "meal_count_roll_std_7d": 0.76,
                "vitamin_b3_(niacin)_mg": 0.0,
                "fat_to_calories": 0.0,
                "protein_g": 0.02,
                "vitamin_e_mg": -0.0,
                "cholesterol_mg": -0.0,
                "polyunsaturated_fat_g": 0.0,
                "water_intake_ml_variability": 1.41,
                "date": "2025-11-10",
                "water_percentage_completed": 6.36,
                "sodium_mg": -0.0,
                "zinc_mg": 0.0,
                "monounsaturated_fat_g": 0.0,
                "fat_g": -0.05,
                "sugar_g": 0.04,
                "meal_count_variability": 1.13,
                "macro_balance": 0.32,
                "meal_intensity": 0.01,
                "iron_mg": -0.01,
                "water_to_meal_ratio": 2656179.5,
                "water_intensity": 0.0,
                "sodium_g": -0.0,
                "cholesterol_g": 0.0,
                "calories": 19.53,
                "water_intake_ml_roll_std_7d": 294.43,
                "meal_count_roll_mean_7d": 0.71,
                "meal_count": 0.0,
                "protein_to_fat_ratio": 0.0,
                "vitamin_k_mg": 0.0,
                "carbs_g_variability": 0.0,
                "vitamin_b1_(thiamin)_mg": 0.01,
                "vitamin_c_mg": 0.0,
                "fiber_g": 0.01,
                "carbohydrates_g": 0.04,
                "protein_g_variability": 1.0,
                "carbs_g_roll_std_7d": 0.0,
                "fiber_g_variability": 1.15,
                "carb_to_calories": 0.0,
                "fiber_to_carb_ratio": 0.0,
                "current_streak": 0.0,
                "magnesium_g": 0.0,
                "protein_to_calories": 0.0,
                "folate_(b9)_mg": -0.0,
                "trans_fat_g": -0.0,
                "combined_intensity": 5.75,
                "protein_g_roll_std_7d": 9.5,
                "fat_g_roll_std_7d": 18.12,
                "fiber_g_roll_std_7d": 3.74,
                "fat_g_roll_mean_7d": 12.0,
                "water_intake_ml": 299.19,
                "vitamin_a_mg": -0.0,
                "vitamin_a_mcg": 0.0,
                "fat_g_variability": 1.58,
                "water_intake_ml_roll_mean_7d": 167.85,
                "carbs_g_roll_mean_7d": 0.0
            },
            {
                "vitamin_b6_mg": 0.0,
                "carbs_g": 0.0,
                "calories_roll_std_7d": 331.67,
                "calories_per_meal": 0.42,
                "saturated_fat_g": -0.0,
                "longest_streak": 1.0,
                "calories_roll_mean_7d": 141.69,
                "fiber_g_roll_mean_7d": 2.54,
                "potassium_g": 0.0,
                "protein_to_carb_ratio": 0.01,
                "protein_g_roll_mean_7d": 9.46,
                "vitamin_b2_(riboflavin)_mg": 0.0,
                "vitamin_c_g": 0.0,
                "calories_variability": 1.25,
                "calcium_mg": 0.0,
                "phosphorus_g": 0.0,
                "calcium_g": 0.0,
                "meal_count_roll_std_7d": 0.76,
                "vitamin_b3_(niacin)_mg": 0.0,
                "fat_to_calories": 0.0,
                "protein_g": 0.74,
                "vitamin_e_mg": 0.0,
                "cholesterol_mg": -0.0,
                "polyunsaturated_fat_g": 0.0,
                "water_intake_ml_variability": 1.38,
                "date": "2025-11-11",
                "water_percentage_completed": 12.59,
                "sodium_mg": -0.0,
                "zinc_mg": 0.0,
                "monounsaturated_fat_g": 0.0,
                "fat_g": -0.05,
                "sugar_g": -0.0,
                "meal_count_variability": 1.13,
                "macro_balance": 0.33,
                "meal_intensity": 0.01,
                "iron_mg": -0.01,
                "water_to_meal_ratio": 2656179.5,
                "water_intensity": 1.0,
                "sodium_g": -0.0,
                "cholesterol_g": 0.0,
                "calories": 10.59,
                "water_intake_ml_roll_std_7d": 288.35,
                "meal_count_roll_mean_7d": 0.86,
                "meal_count": 0.0,
                "protein_to_fat_ratio": 0.0,
                "vitamin_k_mg": 0.0,
                "carbs_g_variability": 0.0,
                "vitamin_b1_(thiamin)_mg": 0.0,
                "vitamin_c_mg": 0.0,
                "fiber_g": 0.01,
                "carbohydrates_g": 0.04,
                "protein_g_variability": 0.91,
                "carbs_g_roll_std_7d": 0.0,
                "fiber_g_variability": 1.16,
                "carb_to_calories": 0.0,
                "fiber_to_carb_ratio": 0.0,
                "current_streak": 0.0,
                "magnesium_g": 0.0,
                "protein_to_calories": 0.02,
                "folate_(b9)_mg": -0.0,
                "trans_fat_g": -0.0,
                "combined_intensity": 0.97,
                "protein_g_roll_std_7d": 9.5,
                "fat_g_roll_std_7d": 18.06,
                "fiber_g_roll_std_7d": 3.69,
                "fat_g_roll_mean_7d": 11.74,
                "water_intake_ml": 299.19,
                "vitamin_a_mg": -0.0,
                "vitamin_a_mcg": 0.0,
                "fat_g_variability": 1.5,
                "water_intake_ml_roll_mean_7d": 165.58,
                "carbs_g_roll_mean_7d": 0.0
            },
            {
                "vitamin_b6_mg": 0.0,
                "carbs_g": 0.0,
                "calories_roll_std_7d": 327.61,
                "calories_per_meal": 0.42,
                "saturated_fat_g": -0.0,
                "longest_streak": 1.0,
                "calories_roll_mean_7d": 140.68,
                "fiber_g_roll_mean_7d": 2.73,
                "potassium_g": 0.0,
                "protein_to_carb_ratio": 0.01,
                "protein_g_roll_mean_7d": 10.23,
                "vitamin_b2_(riboflavin)_mg": 0.0,
                "vitamin_c_g": 0.0,
                "calories_variability": 1.29,
                "calcium_mg": 0.0,
                "phosphorus_g": 0.0,
                "calcium_g": 0.0,
                "meal_count_roll_std_7d": 0.77,
                "vitamin_b3_(niacin)_mg": 0.03,
                "fat_to_calories": 0.0,
                "protein_g": -0.02,
                "vitamin_e_mg": -0.0,
                "cholesterol_mg": -0.0,
                "polyunsaturated_fat_g": 0.0,
                "water_intake_ml_variability": 1.34,
                "date": "2025-11-12",
                "water_percentage_completed": 12.59,
                "sodium_mg": -0.0,
                "zinc_mg": 0.0,
                "monounsaturated_fat_g": 0.0,
                "fat_g": 0.01,
                "sugar_g": 0.02,
                "meal_count_variability": 1.13,
                "macro_balance": 0.33,
                "meal_intensity": 0.02,
                "iron_mg": -0.01,
                "water_to_meal_ratio": 2656179.5,
                "water_intensity": 1.0,
                "sodium_g": -0.0,
                "cholesterol_g": 0.0,
                "calories": 0.36,
                "water_intake_ml_roll_std_7d": 286.83,
                "meal_count_roll_mean_7d": 0.86,
                "meal_count": 0.0,
                "protein_to_fat_ratio": 0.0,
                "vitamin_k_mg": 0.0,
                "carbs_g_variability": 0.0,
                "vitamin_b1_(thiamin)_mg": 0.02,
                "vitamin_c_mg": 0.0,
                "fiber_g": 0.01,
                "carbohydrates_g": 0.04,
                "protein_g_variability": 0.92,
                "carbs_g_roll_std_7d": 0.0,
                "fiber_g_variability": 1.07,
                "carb_to_calories": 0.0,
                "fiber_to_carb_ratio": 0.0,
                "current_streak": 0.0,
                "magnesium_g": 0.0,
                "protein_to_calories": 0.02,
                "folate_(b9)_mg": -0.0,
                "trans_fat_g": -0.0,
                "combined_intensity": 0.97,
                "protein_g_roll_std_7d": 9.5,
                "fat_g_roll_std_7d": 18.12,
                "fiber_g_roll_std_7d": 3.69,
                "fat_g_roll_mean_7d": 12.0,
                "water_intake_ml": 299.19,
                "vitamin_a_mg": -0.0,
                "vitamin_a_mcg": 0.0,
                "fat_g_variability": 1.53,
                "water_intake_ml_roll_mean_7d": 162.19,
                "carbs_g_roll_mean_7d": 0.0
            },
            {
                "vitamin_b6_mg": 0.0,
                "carbs_g": 0.0,
                "calories_roll_std_7d": 324.89,
                "calories_per_meal": 0.42,
                "saturated_fat_g": -0.0,
                "longest_streak": 1.0,
                "calories_roll_mean_7d": 142.7,
                "fiber_g_roll_mean_7d": 2.8,
                "potassium_g": 0.0,
                "protein_to_carb_ratio": 0.02,
                "protein_g_roll_mean_7d": 9.85,
                "vitamin_b2_(riboflavin)_mg": -0.0,
                "vitamin_c_g": 0.0,
                "calories_variability": 1.34,
                "calcium_mg": 0.0,
                "phosphorus_g": 0.0,
                "calcium_g": 0.0,
                "meal_count_roll_std_7d": 0.72,
                "vitamin_b3_(niacin)_mg": 0.14,
                "fat_to_calories": 0.0,
                "protein_g": -0.02,
                "vitamin_e_mg": -0.0,
                "cholesterol_mg": -0.0,
                "polyunsaturated_fat_g": 0.0,
                "water_intake_ml_variability": 1.3,
                "date": "2025-11-13",
                "water_percentage_completed": 12.59,
                "sodium_mg": -0.0,
                "zinc_mg": 0.0,
                "monounsaturated_fat_g": 0.0,
                "fat_g": 0.17,
                "sugar_g": -0.02,
                "meal_count_variability": 1.13,
                "macro_balance": 0.33,
                "meal_intensity": 0.01,
                "iron_mg": -0.01,
                "water_to_meal_ratio": 2656179.5,
                "water_intensity": 1.0,
                "sodium_g": -0.0,
                "cholesterol_g": 0.0,
                "calories": -0.92,
                "water_intake_ml_roll_std_7d": 289.87,
                "meal_count_roll_mean_7d": 0.86,
                "meal_count": 0.0,
                "protein_to_fat_ratio": 0.01,
                "vitamin_k_mg": 0.0,
                "carbs_g_variability": 0.0,
                "vitamin_b1_(thiamin)_mg": 0.03,
                "vitamin_c_mg": 0.0,
                "fiber_g": 0.01,
                "carbohydrates_g": 0.04,
                "protein_g_variability": 0.97,
                "carbs_g_roll_std_7d": 0.0,
                "fiber_g_variability": 1.11,
                "carb_to_calories": 0.0,
                "fiber_to_carb_ratio": 0.0,
                "current_streak": 0.0,
                "magnesium_g": 0.0,
                "protein_to_calories": 0.0,
                "folate_(b9)_mg": -0.0,
                "trans_fat_g": -0.0,
                "combined_intensity": 5.01,
                "protein_g_roll_std_7d": 9.5,
                "fat_g_roll_std_7d": 18.19,
                "fiber_g_roll_std_7d": 3.67,
                "fat_g_roll_mean_7d": 12.0,
                "water_intake_ml": 299.19,
                "vitamin_a_mg": -0.0,
                "vitamin_a_mcg": 0.0,
                "fat_g_variability": 1.53,
                "water_intake_ml_roll_mean_7d": 162.19,
                "carbs_g_roll_mean_7d": 0.0
            },
            {
                "vitamin_b6_mg": 0.0,
                "carbs_g": 0.0,
                "calories_roll_std_7d": 327.61,
                "calories_per_meal": 0.42,
                "saturated_fat_g": -0.0,
                "longest_streak": 1.0,
                "calories_roll_mean_7d": 142.7,
                "fiber_g_roll_mean_7d": 2.76,
                "potassium_g": 0.0,
                "protein_to_carb_ratio": 0.02,
                "protein_g_roll_mean_7d": 9.41,
                "vitamin_b2_(riboflavin)_mg": 0.0,
                "vitamin_c_g": 0.0,
                "calories_variability": 1.35,
                "calcium_mg": 0.0,
                "phosphorus_g": 0.05,
                "calcium_g": 0.01,
                "meal_count_roll_std_7d": 0.72,
                "vitamin_b3_(niacin)_mg": 0.13,
                "fat_to_calories": 0.0,
                "protein_g": -0.02,
                "vitamin_e_mg": 0.04,
                "cholesterol_mg": -0.0,
                "polyunsaturated_fat_g": 0.0,
                "water_intake_ml_variability": 1.32,
                "date": "2025-11-14",
                "water_percentage_completed": 12.59,
                "sodium_mg": -0.0,
                "zinc_mg": 0.0,
                "monounsaturated_fat_g": 0.0,
                "fat_g": 0.66,
                "sugar_g": -0.02,
                "meal_count_variability": 1.1,
                "macro_balance": 0.3,
                "meal_intensity": 0.02,
                "iron_mg": -0.01,
                "water_to_meal_ratio": 2656179.5,
                "water_intensity": 1.0,
                "sodium_g": -0.0,
                "cholesterol_g": 0.0,
                "calories": 0.36,
                "water_intake_ml_roll_std_7d": 267.08,
                "meal_count_roll_mean_7d": 0.86,
                "meal_count": 0.0,
                "protein_to_fat_ratio": 0.0,
                "vitamin_k_mg": 0.0,
                "carbs_g_variability": 0.0,
                "vitamin_b1_(thiamin)_mg": 0.07,
                "vitamin_c_mg": 0.0,
                "fiber_g": 0.01,
                "carbohydrates_g": 0.3,
                "protein_g_variability": 1.0,
                "carbs_g_roll_std_7d": 0.0,
                "fiber_g_variability": 1.07,
                "carb_to_calories": 0.0,
                "fiber_to_carb_ratio": 0.0,
                "current_streak": 0.0,
                "magnesium_g": 0.0,
                "protein_to_calories": 0.0,
                "folate_(b9)_mg": -0.0,
                "trans_fat_g": -0.0,
                "combined_intensity": 6.0,
                "protein_g_roll_std_7d": 8.94,
                "fat_g_roll_std_7d": 18.31,
                "fiber_g_roll_std_7d": 3.77,
                "fat_g_roll_mean_7d": 11.83,
                "water_intake_ml": 299.19,
                "vitamin_a_mg": -0.0,
                "vitamin_a_mcg": 0.0,
                "fat_g_variability": 1.53,
                "water_intake_ml_roll_mean_7d": 163.32,
                "carbs_g_roll_mean_7d": 0.0
            },
            {
                "vitamin_b6_mg": 0.01,
                "carbs_g": 0.0,
                "calories_roll_std_7d": 327.61,
                "calories_per_meal": 0.42,
                "saturated_fat_g": -0.0,
                "longest_streak": 1.0,
                "calories_roll_mean_7d": 142.7,
                "fiber_g_roll_mean_7d": 2.92,
                "potassium_g": -0.0,
                "protein_to_carb_ratio": 0.02,
                "protein_g_roll_mean_7d": 9.41,
                "vitamin_b2_(riboflavin)_mg": 0.0,
                "vitamin_c_g": 0.0,
                "calories_variability": 1.35,
                "calcium_mg": 0.0,
                "phosphorus_g": 0.05,
                "calcium_g": 0.01,
                "meal_count_roll_std_7d": 0.69,
                "vitamin_b3_(niacin)_mg": 0.37,
                "fat_to_calories": 0.01,
                "protein_g": -0.02,
                "vitamin_e_mg": -0.0,
                "cholesterol_mg": -0.0,
                "polyunsaturated_fat_g": 0.0,
                "water_intake_ml_variability": 1.28,
                "date": "2025-11-15",
                "water_percentage_completed": 12.59,
                "sodium_mg": -0.0,
                "zinc_mg": 0.0,
                "monounsaturated_fat_g": 0.08,
                "fat_g": 1.48,
                "sugar_g": -0.0,
                "meal_count_variability": 1.05,
                "macro_balance": 0.33,
                "meal_intensity": 0.02,
                "iron_mg": -0.01,
                "water_to_meal_ratio": 2656179.5,
                "water_intensity": 1.0,
                "sodium_g": 0.0,
                "cholesterol_g": 0.0,
                "calories": 0.36,
                "water_intake_ml_roll_std_7d": 289.87,
                "meal_count_roll_mean_7d": 0.86,
                "meal_count": 0.0,
                "protein_to_fat_ratio": 0.0,
                "vitamin_k_mg": 0.0,
                "carbs_g_variability": 0.0,
                "vitamin_b1_(thiamin)_mg": 0.07,
                "vitamin_c_mg": 0.0,
                "fiber_g": 0.97,
                "carbohydrates_g": 0.04,
                "protein_g_variability": 0.9,
                "carbs_g_roll_std_7d": 0.0,
                "fiber_g_variability": 1.09,
                "carb_to_calories": 0.0,
                "fiber_to_carb_ratio": 0.05,
                "current_streak": 0.0,
                "magnesium_g": 0.0,
                "protein_to_calories": 0.0,
                "folate_(b9)_mg": -0.0,
                "trans_fat_g": -0.0,
                "combined_intensity": 6.0,
                "protein_g_roll_std_7d": 9.5,
                "fat_g_roll_std_7d": 18.31,
                "fiber_g_roll_std_7d": 3.77,
                "fat_g_roll_mean_7d": 11.83,
                "water_intake_ml": 299.19,
                "vitamin_a_mg": -0.0,
                "vitamin_a_mcg": 0.0,
                "fat_g_variability": 1.54,
                "water_intake_ml_roll_mean_7d": 167.85,
                "carbs_g_roll_mean_7d": 0.0
            }
        ],
        "anomalies": [],
        "metadata": {
            "num_samples": 20,
            "prediction_length": 7,
            "features_analyzed": 8,
            "data_quality": {
                "days_with_data": 61,
                "days_loaded": 61,
                "completeness": 100.0
            },
            "context_length": 30
        },
        "summary": "Overall: protein g, fiber g declining; hydration up; 3 areas need attention.",
        "forecast_period": {
            "end": "2025-11-15",
            "start": "2025-11-09",
            "days": 7
        },
        "overall_score": {
            "description": "Habits need attention - review recommendations",
            "score": 66,
            "grade": "D"
        },
        "risk_flags": [
            "⚠ Low meal frequency predicted - consider meal planning",
            "💧 Low hydration forecast - set reminders to drink water",
            "🥩 Protein intake may be insufficient - consider protein-rich meals"
        ],
        "forecast_summary": {},
        "engagement": {
            "meal_frequency": {
                "description": "! Meal Count significantly down ↓ (-99.8%)",
                "avg_meals_per_day": 0.0,
                "status": "down"
            },
            "hydration": {
                "avg_ml_per_day": 299.0,
                "description": "✓ Water Intake Ml significantly up ↑ (+74.5%)",
                "status": "up"
            },
            "streak": {
                "projected_streak": 0.0,
                "description": "Current Streak remaining steady",
                "status": "stable"
            }
        },
        "status": "success",
        "generated_at": "2025-11-07T21:21:46.410814Z",
        "macro_trends": [
            {
                "description": " Calories significantly down ↓ (-98.4%)",
                "forecast_mean": 4.2,
                "recent_std": 327.16,
                "feature": "calories",
                "forecast_std": 7.88,
                "direction": "changing",
                "percent_change": -98.4,
                "trend": "down",
                "recent_mean": 256.77
            },
            {
                "description": "! Protein G significantly down ↓ (-99.0%)",
                "forecast_mean": 0.1,
                "recent_std": 9.52,
                "feature": "protein_g",
                "forecast_std": 0.29,
                "direction": "declining",
                "percent_change": -99.0,
                "trend": "down",
                "recent_mean": 9.48
            },
            {
                "description": "Carbs G remaining steady",
                "forecast_mean": 0.0,
                "recent_std": 0.0,
                "feature": "carbs_g",
                "forecast_std": 0.0,
                "direction": "stable",
                "percent_change": 0.0,
                "trend": "stable",
                "recent_mean": 0.0
            },
            {
                "description": " Fat G significantly down ↓ (-97.4%)",
                "forecast_mean": 0.31,
                "recent_std": 18.02,
                "feature": "fat_g",
                "forecast_std": 0.58,
                "direction": "changing",
                "percent_change": -97.4,
                "trend": "down",
                "recent_mean": 12.03
            },
            {
                "description": "! Fiber G significantly down ↓ (-95.6%)",
                "forecast_mean": 0.15,
                "recent_std": 3.76,
                "feature": "fiber_g",
                "forecast_std": 0.36,
                "direction": "declining",
                "percent_change": -95.6,
                "trend": "down",
                "recent_mean": 3.36
            }
        ],
        "username": "KwpGnNMQiYYaN3RY5qDT9xIsWZ33"
    }
}
```

| Field | Type | Description |
|-------|------|-------------|
| user_id | string | User's unique identifier |
| report | object | Complete analysis report with insights and recommendations |

**Note:** The exact structure of the `report` object depends on the analysis engine implementation and may include various habit metrics, patterns, insights, and personalized recommendations.

#### Error Responses
- **404 Not Found**: No analysis report found for this user
  ```json
  {
    "detail": "No habit analysis report found for this user"
  }
  ```
- **500 Internal Server Error**: Server error while retrieving report

#### Usage Notes
- Returns the most recent completed analysis report
- If an analysis is currently in progress, this endpoint returns the previous completed report
- Reports may contain various metrics depending on available habit data
- The report structure is determined by the `generate_habit_analysis_report` function

#### Example Request
```http
GET /habit/report/KwpGnNMQiYYaN3RY5qDT9xIsWZ33
```

---

## Background Processing

### Analysis Workflow
The habit analysis follows a multi-step asynchronous workflow:

1. **Initiation**: The `/refresh` endpoint creates a pending analysis document
2. **Background Processing**: Analysis runs in a separate thread pool
3. **Completion**: Results are saved to the database
4. **Retrieval**: The `/report` endpoint returns completed results

### Analysis States
Analysis documents can have the following states:
- **pending**: Analysis has been initiated and is in progress
- **completed**: Analysis finished successfully
- **failed**: Analysis encountered an error

### Error Handling in Background Tasks
If analysis fails during background processing:
- The analysis document is marked as "failed"
- An error message is stored for debugging
- A timestamp (`failed_at`) is recorded
- Users can initiate a new analysis attempt

---

## Usage Examples

### Complete Analysis Workflow
```http
# 1. Check if there's an existing report
GET /habit/report/USER_ID

# 2. Initiate new analysis
GET /habit/refresh/USER_ID

# Response: {"status": "started", "doc_id": "abc123", ...}

# 3. Wait for processing (typically a few seconds to minutes)
# The analysis runs in the background

# 4. Retrieve completed report
GET /habit/report/USER_ID
```

### Handling Analysis in Progress
```http
# First request - starts analysis
GET /habit/refresh/USER_ID
# Response: 200 OK with doc_id

# Second request - while analysis is running
GET /habit/refresh/USER_ID
# Response: 409 Conflict
# "Analysis already in progress for this user"
```

---

## Best Practices

### Client Implementation
1. **Check before refresh**: Call `/report` first to see if a recent analysis exists
2. **Handle 409 errors**: If analysis is in progress, poll `/report` instead of retrying `/refresh`
3. **Implement polling**: After calling `/refresh`, periodically check `/report` for results
4. **Cache reports**: Store analysis results locally to reduce API calls
5. **User feedback**: Show loading states during background processing

### Polling Strategy
```javascript
// Example polling implementation
async function waitForAnalysis(userId, maxAttempts = 30, interval = 2000) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`/habit/report/${userId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      // Continue polling
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  throw new Error('Analysis timeout');
}

// Usage
const refreshResponse = await fetch(`/habit/refresh/${userId}`);
const { doc_id } = await refreshResponse.json();
const report = await waitForAnalysis(userId);
```

---

## Integration with Water Intake API

The Habit Analysis API is designed to work alongside the Water Intake API. The analysis engine processes water intake data to generate insights:

### Data Sources
- Daily water intake records
- Weekly consumption patterns
- Streak information
- Goal achievement rates

### Analysis Components
The habit analysis may include:
- **Consistency Analysis**: How regularly the user tracks water intake
- **Pattern Recognition**: Identifying trends and behavioral patterns
- **Goal Progress**: Evaluation of progress toward hydration goals
- **Personalized Recommendations**: Actionable suggestions for improvement

---

## Technical Details

### Concurrency
- Uses FastAPI's `BackgroundTasks` for asynchronous processing
- Leverages `run_in_threadpool` for CPU-intensive analysis operations
- Prevents duplicate analyses through status checking

### Database Structure
Analysis documents are stored in Firestore:
```
/users/{user_id}/analysis/{analysis_id}
```

### Performance Considerations
- Analysis duration varies based on data volume (typically 5-30 seconds)
- Background processing prevents blocking the API
- Single concurrent analysis per user to manage resources

---

## Error Scenarios

### Common Error Cases

#### Analysis Already Running
```http
GET /habit/refresh/USER_ID
# Response: 409 Conflict
```
**Solution**: Wait for current analysis to complete, then try again

#### No Report Available
```http
GET /habit/report/USER_ID
# Response: 404 Not Found
```
**Solution**: Initiate first analysis using `/refresh` endpoint

#### Analysis Failed
If background processing fails:
- Document status set to "failed"
- Error details stored in database
- User can initiate new analysis

---

## Security Considerations

- **Authentication**: Ensure `user_id` is validated and belongs to authenticated user
- **Rate Limiting**: Consider implementing rate limits to prevent analysis abuse
- **Data Privacy**: Analysis reports contain personal habit data and should be protected
- **Authorization**: Verify users can only access their own reports

---

## Future Enhancements

Potential improvements to the API:
- Webhook notifications when analysis completes
- Historical analysis comparison
- Customizable analysis parameters
- Export reports in various formats (PDF, CSV)
- Real-time progress updates via WebSockets