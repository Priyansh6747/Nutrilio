# Food Prediction API Documentation

## Overview

AI-powered food identification and product lookup API that analyzes food images and retrieves detailed product information via barcodes. Includes comprehensive nutrition tracking, meal logging, and analytics capabilities.

## Base URL

```
https://nonhydraulic-dilan-preeconomical.ngrok-free.dev/api/v1/log
```

---

## Table of Contents

1. [Prediction & Analysis](#prediction--analysis)
2. [Barcode Lookup](#barcode-lookup)
3. [Meal CRUD Operations](#meal-crud-operations)
4. [Nutrition Statistics](#nutrition-statistics)
5. [Streak & Engagement](#streak--engagement)
6. [Nutrient Analytics](#nutrient-analytics)
7. [Macros & Categories](#macros--categories)
8. [Error Handling](#error-handling)

---

## Prediction & Analysis

### 1. POST /predict

Upload a food image to get AI-powered identification and description.

#### Request

**Content-Type:** `multipart/form-data`

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | User-provided name for the food |
| image | file | Yes | Image file (JPEG, PNG, etc.) |
| description | string | No | Additional context about the food |

#### Example Request

```bash
curl -X POST "http://your-api-domain.com/predict" \
  -F "name=Dal Baati" \
  -F "image=@/path/to/food.jpg" \
  -F "description=Traditional homemade recipe"
```

#### Response

```json
{
    "result": {
        "name": "Momos",
        "description": "Momos are a type of steamed or pan-fried dumpling popular across South Asia...",
        "confidence": 0.95
    },
    "suggested_food": "momos",
    "confidence": 0.95,
    "original_ml_confidence": 0.9839858412742615,
    "timestamp": "2025-10-04T18:46:48.500101"
}
```

#### Status Codes

- `200 OK` - Success
- `400 Bad Request` - Invalid file type
- `422 Unprocessable Entity` - Missing required fields
- `500 Internal Server Error` - Processing failed

---

### 2. POST /analyse

Analyze a meal and get detailed nutrient breakdown. Creates a pending meal entry and starts background analysis.

#### Request

**Content-Type:** `application/json`

**Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| username | string | Yes | User identifier |
| name | string | Yes | Food/meal name |
| description | string | No | Additional details about the meal |
| amnt | float | Yes | Serving size in grams |

#### Example Request

```bash
curl -X POST "http://your-api-domain.com/analyse" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user123",
    "name": "Grilled Chicken Breast",
    "description": "Seasoned chicken breast with herbs",
    "amnt": 150.0
  }'
```

#### Response

```json
{
    "status": "started",
    "doc_id": "meal_abc123xyz"
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| status | string | Processing status ("started") |
| doc_id | string | Unique meal entry ID for tracking |

#### Status Codes

- `200 OK` - Analysis started successfully
- `422 Unprocessable Entity` - Invalid request body
- `500 Internal Server Error` - Analysis failed to start

---

## Barcode Lookup

### 3. GET /barcode/read/{code}

Retrieve detailed product information using a barcode number.

#### Request

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| code | string | Yes | Product barcode number (e.g., 8904063254450) |

#### Example Request

```bash
curl -X GET "http://your-api-domain.com/barcode/read/5449000000996"
```

#### Response

```json
{
    "code": "8904063254450",
    "product": {
        "_id": "8904063254450",
        "product_name": "Haldiram's Punjabi Tadka",
        "brands": "Haldiram's",
        "countries": "India",
        "image_front_url": "https://images.openfoodfacts.org/...",
        "nutriscore_grade": "unknown",
        "nutriments": {},
        "allergens": "",
        "packagings": []
    },
    "status": 1,
    "status_verbose": "product found"
}
```

#### Status Codes

- `200 OK` - Product found
- `404 Not Found` - Product not found in database
- `500 Internal Server Error` - Server error

---

## Meal CRUD Operations

### 4. GET /meal/{meal_id}

Get a specific meal entry by ID.

#### Request

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| username | string | Yes | User identifier |

#### Example Request

```bash
curl -X GET "http://your-api-domain.com/meal/meal_abc123?username=user123"
```

#### Response

```json
{
    "status": "success",
    "meal": {
        "id": "meal_abc123",
        "name": "Grilled Chicken Breast",
        "serving_size": 150.0,
        "nutrient_breakdown": {},
        "timestamp": "2025-10-25T10:30:00"
    }
}
```

#### Status Codes

- `200 OK` - Meal found
- `404 Not Found` - Meal not found
- `500 Internal Server Error` - Server error

---

### 5. GET /meals/daily

Get all meals for a specific date.

#### Request

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| username | string | Yes | User identifier |
| date | string | No | Date in YYYY-MM-DD format (defaults to today) |

#### Example Request

```bash
# Get meals for specific date
curl -X GET "http://your-api-domain.com/meals/daily?username=user123&date=2025-10-25"

# Get meals for today
curl -X GET "http://your-api-domain.com/meals/daily?username=user123"
```

#### Response

```json
{
    "status": "success",
    "date": "2025-10-25",
    "meal_count": 3,
    "meals": [
        {
            "id": "meal_1",
            "name": "Breakfast Bowl",
            "serving_size": 200.0,
            "timestamp": "2025-10-25T08:00:00"
        }
    ]
}
```

#### Status Codes

- `200 OK` - Success
- `400 Bad Request` - Invalid date format
- `500 Internal Server Error` - Server error

---

### 6. GET /meals/range

Get all meals within a date range.

#### Request

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| username | string | Yes | User identifier |
| start_date | string | Yes | Start date in YYYY-MM-DD format |
| end_date | string | Yes | End date in YYYY-MM-DD format |

#### Example Request

```bash
curl -X GET "http://your-api-domain.com/meals/range?username=user123&start_date=2025-10-01&end_date=2025-10-25"
```

#### Response

```json
{
    "status": "success",
    "start_date": "2025-10-01",
    "end_date": "2025-10-25",
    "meal_count": 75,
    "meals": []
}
```

#### Status Codes

- `200 OK` - Success
- `400 Bad Request` - Invalid date format or range
- `500 Internal Server Error` - Server error

---

### 7. DELETE /meal/{meal_id}

Delete a meal entry.

#### Request

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| username | string | Yes | User identifier |

#### Example Request

```bash
curl -X DELETE "http://your-api-domain.com/meal/meal_abc123?username=user123"
```

#### Response

```json
{
    "status": "success",
    "message": "Meal deleted successfully",
    "meal_id": "meal_abc123"
}
```

#### Status Codes

- `200 OK` - Meal deleted successfully
- `404 Not Found` - Meal not found
- `500 Internal Server Error` - Server error

---

## Nutrition Statistics

### 8. GET /nutrition/daily

Get aggregated nutrition stats for a specific day.

#### Request

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| username | string | Yes | User identifier |
| date | string | No | Date in YYYY-MM-DD format (defaults to today) |

#### Example Request

```bash
# Get stats for specific date
curl -X GET "http://your-api-domain.com/nutrition/daily?username=user123&date=2025-10-25"

# Get stats for today
curl -X GET "http://your-api-domain.com/nutrition/daily?username=user123"
```

#### Response

```json
{
    "status": "success",
    "date": "2025-10-25",
    "total_calories": 2150.5,
    "total_protein": 85.2,
    "total_carbs": 245.0,
    "total_fat": 68.5,
    "meal_count": 3
}
```

#### Status Codes

- `200 OK` - Success
- `400 Bad Request` - Invalid date format
- `500 Internal Server Error` - Server error

---

### 9. GET /nutrition/weekly

Get weekly nutrition summary.

#### Request

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| username | string | Yes | User identifier |
| date | string | No | Any date within the target week (YYYY-MM-DD) |

#### Example Request

```bash
# Get weekly summary for specific week
curl -X GET "http://your-api-domain.com/nutrition/weekly?username=user123&date=2025-10-25"

# Get current week summary
curl -X GET "http://your-api-domain.com/nutrition/weekly?username=user123"
```

#### Response

```json
{
    "status": "success",
    "week_start": "2025-10-20",
    "week_end": "2025-10-26",
    "daily_averages": {
        "calories": 2100.0,
        "protein": 80.0,
        "carbs": 240.0,
        "fat": 70.0
    },
    "total_meals": 21
}
```

#### Status Codes

- `200 OK` - Success
- `400 Bad Request` - Invalid date format
- `500 Internal Server Error` - Server error

---

## Streak

### 10. GET /streak

Get user's meal logging streak.

#### Request

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| username | string | Yes | User identifier |
| min_meals_per_day | integer | No | Minimum meals per day to count (default: 3) |
| days_to_check | integer | No | Number of days to check (default: 30) |

#### Example Request

```bash
# Get streak with custom parameters
curl -X GET "http://your-api-domain.com/streak?username=user123&min_meals_per_day=3&days_to_check=30"

# Get streak with defaults
curl -X GET "http://your-api-domain.com/streak?username=user123"
```

#### Response

```json
{
    "status": "success",
    "current_streak": 7,
    "longest_streak": 14,
    "total_days_logged": 25,
    "days_checked": 30
}
```

#### Status Codes

- `200 OK` - Success
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

---

## Nutrient Analytics

### 11. GET /nutrients/top

Get top N nutrients consumed during a date range.

#### Request

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| username | string | Yes | User identifier |
| start_date | string | Yes | Start date (YYYY-MM-DD) |
| end_date | string | Yes | End date (YYYY-MM-DD) |
| top_n | integer | No | Number of top nutrients to return (default: 5) |

#### Example Request

```bash
# Get top 5 nutrients
curl -X GET "http://your-api-domain.com/nutrients/top?username=user123&start_date=2025-10-01&end_date=2025-10-25&top_n=5"

# Get top 10 nutrients
curl -X GET "http://your-api-domain.com/nutrients/top?username=user123&start_date=2025-10-01&end_date=2025-10-25&top_n=10"
```

#### Response

```json
{
    "status": "success",
    "top_nutrients": [
        {
            "nutrient": "Protein",
            "total_amount": 2100.5,
            "unit": "g",
            "daily_average": 84.0
        },
        {
            "nutrient": "Carbohydrates",
            "total_amount": 6000.0,
            "unit": "g",
            "daily_average": 240.0
        }
    ]
}
```

#### Status Codes

- `200 OK` - Success
- `400 Bad Request` - Invalid date format
- `500 Internal Server Error` - Server error

---

### 12. GET /nutrients/timeline

Get daily timeline data for a specific nutrient.

#### Request

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| username | string | Yes | User identifier |
| nutrient_name | string | Yes | Name of the nutrient (e.g., "Protein", "Calcium") |
| start_date | string | Yes | Start date (YYYY-MM-DD) |
| end_date | string | Yes | End date (YYYY-MM-DD) |

#### Example Request

```bash
# Get protein timeline
curl -X GET "http://your-api-domain.com/nutrients/timeline?username=user123&nutrient_name=Protein&start_date=2025-10-01&end_date=2025-10-25"

# Get calcium timeline
curl -X GET "http://your-api-domain.com/nutrients/timeline?username=user123&nutrient_name=Calcium&start_date=2025-10-01&end_date=2025-10-25"
```

#### Response

```json
{
    "status": "success",
    "nutrient": "Protein",
    "unit": "g",
    "timeline": [
        {
            "date": "2025-10-01",
            "amount": 85.2
        },
        {
            "date": "2025-10-02",
            "amount": 92.5
        }
    ]
}
```

#### Status Codes

- `200 OK` - Success
- `400 Bad Request` - Invalid parameters
- `500 Internal Server Error` - Server error

---

### 13. GET /nutrients/distribution

Get distribution of nutrients for pie/donut charts.

#### Request

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| username | string | Yes | User identifier |
| start_date | string | Yes | Start date (YYYY-MM-DD) |
| end_date | string | Yes | End date (YYYY-MM-DD) |
| nutrients | string | No | Comma-separated list of nutrients to include |

#### Example Request

```bash
# Get all nutrients distribution
curl -X GET "http://your-api-domain.com/nutrients/distribution?username=user123&start_date=2025-10-01&end_date=2025-10-25"

# Get specific nutrients
curl -X GET "http://your-api-domain.com/nutrients/distribution?username=user123&start_date=2025-10-01&end_date=2025-10-25&nutrients=Protein,Carbohydrates,Fat,Fiber"
```

#### Response

```json
{
    "status": "success",
    "distribution": [
        {
            "nutrient": "Protein",
            "percentage": 20.5,
            "total_amount": 2100.0
        },
        {
            "nutrient": "Carbohydrates",
            "percentage": 50.2,
            "total_amount": 5150.0
        }
    ]
}
```

#### Status Codes

- `200 OK` - Success
- `400 Bad Request` - Invalid parameters
- `500 Internal Server Error` - Server error

---

### 14. GET /nutrients/compare

Compare multiple nutrients over time.

#### Request

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| username | string | Yes | User identifier |
| nutrients | string | Yes | Comma-separated list of nutrients to compare |
| start_date | string | Yes | Start date (YYYY-MM-DD) |
| end_date | string | Yes | End date (YYYY-MM-DD) |

#### Example Request

```bash
curl -X GET "http://your-api-domain.com/nutrients/compare?username=user123&nutrients=Protein,Carbohydrates,Fat&start_date=2025-10-01&end_date=2025-10-25"
```

#### Response

```json
{
    "status": "success",
    "comparison": {
        "Protein": {
            "timeline": [
                {"date": "2025-10-01", "amount": 85.2}
            ],
            "average": 82.5,
            "total": 2062.5
        },
        "Carbohydrates": {
            "timeline": [
                {"date": "2025-10-01", "amount": 245.0}
            ],
            "average": 240.0,
            "total": 6000.0
        }
    }
}
```

#### Status Codes

- `200 OK` - Success
- `400 Bad Request` - Invalid parameters
- `500 Internal Server Error` - Server error

---

## Macros & Categories

### 15. GET /macros/daily

Get macronutrient breakdown for a specific day.

#### Request

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| username | string | Yes | User identifier |
| date | string | No | Date in YYYY-MM-DD format (defaults to today) |

#### Example Request

```bash
# Get macros for specific date
curl -X GET "http://your-api-domain.com/macros/daily?username=user123&date=2025-10-25"

# Get macros for today
curl -X GET "http://your-api-domain.com/macros/daily?username=user123"
```

#### Response

```json
{
    "status": "success",
    "date": "2025-10-25",
    "macros": {
        "protein": {
            "amount": 85.2,
            "calories": 340.8,
            "percentage": 15.8
        },
        "carbohydrates": {
            "amount": 245.0,
            "calories": 980.0,
            "percentage": 45.6
        },
        "fat": {
            "amount": 68.5,
            "calories": 616.5,
            "percentage": 28.6
        }
    },
    "total_calories": 2150.5
}
```

#### Status Codes

- `200 OK` - Success
- `400 Bad Request` - Invalid date format
- `500 Internal Server Error` - Server error

---

### 16. GET /categories/breakdown

Get breakdown by food category.

#### Request

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| username | string | Yes | User identifier |
| start_date | string | Yes | Start date (YYYY-MM-DD) |
| end_date | string | Yes | End date (YYYY-MM-DD) |

#### Example Request

```bash
curl -X GET "http://your-api-domain.com/categories/breakdown?username=user123&start_date=2025-10-01&end_date=2025-10-25"
```

#### Response

```json
{
    "status": "success",
    "categories": [
        {
            "category": "Protein",
            "meal_count": 25,
            "percentage": 33.3,
            "total_calories": 5250.0
        },
        {
            "category": "Grains",
            "meal_count": 30,
            "percentage": 40.0,
            "total_calories": 7200.0
        }
    ]
}
```

#### Status Codes

- `200 OK` - Success
- `400 Bad Request` - Invalid parameters
- `500 Internal Server Error` - Server error

---
## Recommendations & Engagement

### 15. GET /recommendations

Get personalized meal recommendations based on a specific health goal.

#### Request

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| username | string | Yes | User identifier |
| goal | string | Yes | Health goal (e.g., "weight_loss", "muscle_gain", "balanced_diet") |

#### Example Request

```bash
# Get recommendations for weight loss
curl -X GET "http://your-api-domain.com/recommendations?username=user123&goal=weight_loss"

# Get recommendations for muscle gain
curl -X GET "http://your-api-domain.com/recommendations?username=user123&goal=muscle_gain"
```

#### Response

```json
{
    "status": "success",
    "username": "KwpGnNMQiYYaN3RY5qDT9xIsWZ33",
    "goal": "weight_loss",
    "recommendations": {
        "recommended_meals": [
            {
                "name": "Masala Dosa",
                "score": 3.213,
                "key_nutrients": {
                    "calories": 672.02,
                    "calcium_mg": 0.13,
                    "protein_g": 17.63,
                    "vitaminC_mg": 0.07,
                    "fat_g": 24.52
                },
                "goal_alignment": "moderate for weight loss",
                "reason": "Rich in Calories, Fat G",
                "meal_id": "ZJ6S81EdrcppbFcOWaHm",
                "timestamp": "2025-10-27 11:46:55.719196+00:00"
            },
            {
                "name": "Rajma \n",
                "score": 2.46,
                "key_nutrients": {
                    "calories": 486.81,
                    "calcium_mg": 0.08,
                    "protein_g": 14.39,
                    "vitaminC_mg": 0.03,
                    "fat_g": 1.85
                },
                "goal_alignment": "good for weight loss",
                "reason": "Rich in Calories",
                "meal_id": "4WE1zURYWolNbOyfxB1m",
                "timestamp": "2025-10-25 12:25:23.856106+00:00"
            },
            {
                "name": "Chole Bhature",
                "score": 2.416,
                "key_nutrients": {
                    "calories": 1482.34,
                    "calcium_mg": 0.14,
                    "protein_g": 27.57,
                    "vitaminC_mg": 0.01,
                    "fat_g": 82.75
                },
                "goal_alignment": "moderate for weight loss",
                "reason": "Rich in Calories, Protein G, Fat G; high protein",
                "meal_id": "VIqf3RfR54sBuOPtDqhR",
                "timestamp": "2025-10-27 12:50:12.904750+00:00"
            },
            {
                "name": "Paneer Butter Masala ",
                "score": 2.369,
                "key_nutrients": {
                    "calories": 558.69,
                    "calcium_mg": 0.15,
                    "protein_g": 16.25,
                    "vitaminC_mg": 0.05,
                    "fat_g": 41.87
                },
                "goal_alignment": "moderate for weight loss",
                "reason": "Rich in Calories, Fat G",
                "meal_id": "DYg6bRlKWsqINZrlbaOG",
                "timestamp": "2025-10-27 12:43:42.702981+00:00"
            },
            {
                "name": "Paneer butter masala With Naan",
                "score": 2.327,
                "key_nutrients": {
                    "calories": 512.93,
                    "calcium_mg": 0.1,
                    "protein_g": 12.22,
                    "vitaminC_mg": 0.02,
                    "fat_g": 27.27
                },
                "goal_alignment": "moderate for weight loss",
                "reason": "Rich in Calories, Fat G",
                "meal_id": "lJZoh5PTvYwvePnJ229I",
                "timestamp": "2025-10-29 12:09:27.320843+00:00"
            }
        ],
        "nutrient_coverage_summary": {
            "calories_gap_filled_pct": 100,
            "calcium_mg_gap_filled_pct": 0.1,
            "carbs_g_gap_filled_pct": 0.0,
            "protein_g_gap_filled_pct": 80.4,
            "vitaminC_mg_gap_filled_pct": 0.2,
            "total_gap_filled_pct": 36.1
        },
        "recommendation_metadata": {
            "total_meals_analyzed": 11,
            "meals_with_positive_score": 11,
            "recommendations_returned": 5,
            "goal": "weight_loss",
            "tdee": 2042.0
        }
    },
    "user_needs": {
        "TDEE": 2042.0,
        "macros_target": {
            "protein_g": 127.6,
            "fat_g": 56.7,
            "carbs_g": 255.3
        },
        "micros_target": {
            "iron_mg": 8,
            "calcium_mg": 1000,
            "vitaminC_mg": 90,
            "fiber_g": 30
        },
        "weekly_actual": {
            "calories": 729.1,
            "protein_g": 18.1,
            "fat_g": 34.9,
            "carbs_g": 90.0,
            "fiber_g": 10.6,
            "sugar": 11.2,
            "vitamin a": 0.2,
            "vitaminC_mg": 0.0,
            "vitamin e": 2.1,
            "vitamin k": 0.1,
            "vitamin b1 (thiamin)": 0.4,
            "vitamin b2 (riboflavin)": 0.2,
            "vitamin b3 (niacin)": 4.4,
            "vitamin b6": 0.5,
            "folate (b9)": 0.1,
            "calcium_mg": 0.1,
            "iron_mg": 3.6,
            "magnesium": 0.1,
            "phosphorus": 0.4,
            "potassium": 1.1,
            "sodium": 1.8,
            "zinc": 2.0,
            "cholesterol": 0.6,
            "saturated fat": 19.8,
            "monounsaturated fat": 7.6,
            "polyunsaturated fat": 4.1,
            "trans fat": 0.4
        },
        "nutrient_gaps": {
            "protein_g": 109.5,
            "fat_g": 21.8,
            "carbs_g": 165.3,
            "iron_mg": 4.4,
            "calcium_mg": 999.9,
            "vitaminC_mg": 90.0,
            "fiber_g": 19.4
        },
        "patterns": {
            "calories_variability": "high",
            "protein_variability": "high",
            "fat_variability": "high",
            "carbohydrates_variability": "high",
            "fiber_variability": "high",
            "sugar_variability": "high",
            "vitamin a_variability": "high",
            "vitamin c_variability": "high",
            "vitamin e_variability": "high",
            "vitamin k_variability": "high",
            "vitamin b1 (thiamin)_variability": "high",
            "vitamin b2 (riboflavin)_variability": "high",
            "vitamin b3 (niacin)_variability": "high",
            "vitamin b6_variability": "high",
            "folate (b9)_variability": "high",
            "calcium_variability": "high",
            "iron_variability": "high",
            "magnesium_variability": "high",
            "phosphorus_variability": "high",
            "potassium_variability": "high",
            "sodium_variability": "high",
            "zinc_variability": "high",
            "cholesterol_variability": "high",
            "saturated fat_variability": "high",
            "monounsaturated fat_variability": "high",
            "polyunsaturated fat_variability": "high",
            "trans fat_variability": "high"
        },
        "goal": "weight_loss"
    },
    "gap_analysis": {
        "nutrient_gaps": {
            "protein_g": 109.5,
            "fat_g": 21.8,
            "carbs_g": 165.3,
            "iron_mg": 4.4,
            "calcium_mg": 999.9,
            "vitaminC_mg": 90.0,
            "fiber_g": 19.4,
            "calories": 1312.9
        },
        "priority_nutrients": [
            "calories",
            "calcium_mg",
            "carbs_g",
            "protein_g",
            "vitaminC_mg"
        ]
    }
}
```

#### Status Codes

- `200 OK` - Success
- `400 Bad Request` - Invalid goal parameter
- `500 Internal Server Error` - Server error

---

### 16. GET /graph

Get combined engagement graph data showing meal logging activity over time.

#### Request

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| username | string | Yes | User identifier |
| days | integer | No | Number of days to retrieve (default: 365) |
| end_date | string | No | End date in YYYY-MM-DD format (defaults to today) |

#### Example Request

```bash
# Get last 365 days of engagement data
curl -X GET "http://your-api-domain.com/graph?username=user123"

# Get last 90 days
curl -X GET "http://your-api-domain.com/graph?username=user123&days=90"

# Get specific date range
curl -X GET "http://your-api-domain.com/graph?username=user123&days=30&end_date=2025-10-25"
```

#### Response

```json
{
    "success": true,
    "data": {
        "start_date": "2024-11-02",
        "end_date": "2025-11-01",
        "daily_activity": [
            {
                "date": "2024-11-02",
                "day_of_week": "Sat",
                "meal_count": 1,
                "meal_intensity": 1,
                "intake_amount": 1300,
                "water_intensity": 2,
                "percentage_completed": 54.71,
                "combined_intensity": 7
            },
            {
                "date": "2024-11-03",
                "day_of_week": "Sun",
                "meal_count": 1,
                "meal_intensity": 1,
                "intake_amount": 300,
                "water_intensity": 1,
                "percentage_completed": 12.63,
                "combined_intensity": 6
            },
            },......365 entries
        ],
        "weekly_grid": [
            [
                {
                    "date": "2024-10-27",
                    "meal_count": 1,
                    "meal_intensity": 1,
                    "intake_amount": 1300,
                    "water_intensity": 2,
                    "percentage_completed": 54.71,
                    "combined_intensity": 7
                },
                {
                    "date": "2024-10-28",
                    "meal_count": 1,
                    "meal_intensity": 1,
                    "intake_amount": 300,
                    "water_intensity": 1,
                    "percentage_completed": 12.63,
                    "combined_intensity": 6
                },
                {
                    "date": "2024-10-29",
                    "meal_count": null,
                    "meal_intensity": null,
                    "intake_amount": null,
                    "water_intensity": null,
                    "percentage_completed": null,
                    "combined_intensity": 0
                },.....52 entries
            ]
        ],
        "month_labels": [
            {
                "month": "Oct",
                "week_index": 0
            },
            {
                "month": "Nov",
                "week_index": 0
            },
            {
                "month": "Dec",
                "week_index": 5
            },
            {
                "month": "Jan",
                "week_index": 9
            },
            {
                "month": "Feb",
                "week_index": 13
            },
            {
                "month": "Mar",
                "week_index": 17
            },
            {
                "month": "Apr",
                "week_index": 22
            },
            {
                "month": "May",
                "week_index": 26
            },
            {
                "month": "Jun",
                "week_index": 31
            },
            {
                "month": "Jul",
                "week_index": 35
            },
            {
                "month": "Aug",
                "week_index": 39
            },
            {
                "month": "Sep",
                "week_index": 44
            },
            {
                "month": "Oct",
                "week_index": 48
            },
            {
                "month": "Nov",
                "week_index": 52
            }
        ],
        "statistics": {
            "total_days": 365,
            "meal_stats": {
                "total_days": 365,
                "active_days": 7,
                "inactive_days": 358,
                "total_meals": 13,
                "average_meals_per_day": 0.04,
                "average_meals_per_active_day": 1.86,
                "current_streak": 2,
                "longest_streak": 3,
                "max_meals_in_day": 4,
                "activity_rate": 1.92
            },
            "water_stats": {
                "total_days": 365,
                "active_days": 9,
                "inactive_days": 356,
                "days_met_goal": 1,
                "total_intake": 8610,
                "recommended_daily": 2376,
                "average_intake_per_day": 23.59,
                "average_intake_per_active_day": 956.67,
                "average_percentage": 0.99,
                "current_streak": 0,
                "longest_streak": 1,
                "max_intake_in_day": 2800,
                "activity_rate": 2.47
            },
            "combined_active_days": 9,
            "both_activities_days": 7,
            "perfect_days": 0
        },
        "intensity_levels": {
            "0": {
                "combined": "Meals: No activity | Water: No water logged",
                "meal_intensity": 0,
                "water_intensity": 0,
                "meal_description": "No activity",
                "water_description": "No water logged"
            },
            "1": {
                "combined": "Meals: No activity | Water: 1-49% of daily goal",
                "meal_intensity": 0,
                "water_intensity": 1,
                "meal_description": "No activity",
                "water_description": "1-49% of daily goal"
            },
            "2": {
                "combined": "Meals: No activity | Water: 50-79% of daily goal",
                "meal_intensity": 0,
                "water_intensity": 2,
                "meal_description": "No activity",
                "water_description": "50-79% of daily goal"
            },
            "3": {
                "combined": "Meals: No activity | Water: 80-99% of daily goal",
                "meal_intensity": 0,
                "water_intensity": 3,
                "meal_description": "No activity",
                "water_description": "80-99% of daily goal"
            },
            "4": {
                "combined": "Meals: No activity | Water: 100%+ of daily goal",
                "meal_intensity": 0,
                "water_intensity": 4,
                "meal_description": "No activity",
                "water_description": "100%+ of daily goal"
            },
            "5": {
                "combined": "Meals: 1 meal | Water: No water logged",
                "meal_intensity": 1,
                "water_intensity": 0,
                "meal_description": "1 meal",
                "water_description": "No water logged"
            },
            "6": {
                "combined": "Meals: 1 meal | Water: 1-49% of daily goal",
                "meal_intensity": 1,
                "water_intensity": 1,
                "meal_description": "1 meal",
                "water_description": "1-49% of daily goal"
            },
            "7": {
                "combined": "Meals: 1 meal | Water: 50-79% of daily goal",
                "meal_intensity": 1,
                "water_intensity": 2,
                "meal_description": "1 meal",
                "water_description": "50-79% of daily goal"
            },
            "8": {
                "combined": "Meals: 1 meal | Water: 80-99% of daily goal",
                "meal_intensity": 1,
                "water_intensity": 3,
                "meal_description": "1 meal",
                "water_description": "80-99% of daily goal"
            },
            "9": {
                "combined": "Meals: 1 meal | Water: 100%+ of daily goal",
                "meal_intensity": 1,
                "water_intensity": 4,
                "meal_description": "1 meal",
                "water_description": "100%+ of daily goal"
            },
            "10": {
                "combined": "Meals: 2-1 meals | Water: No water logged",
                "meal_intensity": 2,
                "water_intensity": 0,
                "meal_description": "2-1 meals",
                "water_description": "No water logged"
            },
            "11": {
                "combined": "Meals: 2-1 meals | Water: 1-49% of daily goal",
                "meal_intensity": 2,
                "water_intensity": 1,
                "meal_description": "2-1 meals",
                "water_description": "1-49% of daily goal"
            },
            "12": {
                "combined": "Meals: 2-1 meals | Water: 50-79% of daily goal",
                "meal_intensity": 2,
                "water_intensity": 2,
                "meal_description": "2-1 meals",
                "water_description": "50-79% of daily goal"
            },
            "13": {
                "combined": "Meals: 2-1 meals | Water: 80-99% of daily goal",
                "meal_intensity": 2,
                "water_intensity": 3,
                "meal_description": "2-1 meals",
                "water_description": "80-99% of daily goal"
            },
            "14": {
                "combined": "Meals: 2-1 meals | Water: 100%+ of daily goal",
                "meal_intensity": 2,
                "water_intensity": 4,
                "meal_description": "2-1 meals",
                "water_description": "100%+ of daily goal"
            },
            "15": {
                "combined": "Meals: 2-2 meals | Water: No water logged",
                "meal_intensity": 3,
                "water_intensity": 0,
                "meal_description": "2-2 meals",
                "water_description": "No water logged"
            },
            "16": {
                "combined": "Meals: 2-2 meals | Water: 1-49% of daily goal",
                "meal_intensity": 3,
                "water_intensity": 1,
                "meal_description": "2-2 meals",
                "water_description": "1-49% of daily goal"
            },
            "17": {
                "combined": "Meals: 2-2 meals | Water: 50-79% of daily goal",
                "meal_intensity": 3,
                "water_intensity": 2,
                "meal_description": "2-2 meals",
                "water_description": "50-79% of daily goal"
            },
            "18": {
                "combined": "Meals: 2-2 meals | Water: 80-99% of daily goal",
                "meal_intensity": 3,
                "water_intensity": 3,
                "meal_description": "2-2 meals",
                "water_description": "80-99% of daily goal"
            },
            "19": {
                "combined": "Meals: 2-2 meals | Water: 100%+ of daily goal",
                "meal_intensity": 3,
                "water_intensity": 4,
                "meal_description": "2-2 meals",
                "water_description": "100%+ of daily goal"
            },
            "20": {
                "combined": "Meals: 3+ meals | Water: No water logged",
                "meal_intensity": 4,
                "water_intensity": 0,
                "meal_description": "3+ meals",
                "water_description": "No water logged"
            },
            "21": {
                "combined": "Meals: 3+ meals | Water: 1-49% of daily goal",
                "meal_intensity": 4,
                "water_intensity": 1,
                "meal_description": "3+ meals",
                "water_description": "1-49% of daily goal"
            },
            "22": {
                "combined": "Meals: 3+ meals | Water: 50-79% of daily goal",
                "meal_intensity": 4,
                "water_intensity": 2,
                "meal_description": "3+ meals",
                "water_description": "50-79% of daily goal"
            },
            "23": {
                "combined": "Meals: 3+ meals | Water: 80-99% of daily goal",
                "meal_intensity": 4,
                "water_intensity": 3,
                "meal_description": "3+ meals",
                "water_description": "80-99% of daily goal"
            },
            "24": {
                "combined": "Meals: 3+ meals | Water: 100%+ of daily goal",
                "meal_intensity": 4,
                "water_intensity": 4,
                "meal_description": "3+ meals",
                "water_description": "100%+ of daily goal"
            }
        }
    }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Request success status |
| data.dates | array | Array of dates in the range |
| data.meal_counts | array | Number of meals logged per day |
| data.total_days | integer | Total days in the range |
| data.active_days | integer | Days with at least one meal logged |
| data.activity_rate | float | Percentage of active days |

#### Status Codes

- `200 OK` - Success
- `400 Bad Request` - Invalid date format
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

---


## Error Handling

All endpoints return standard HTTP status codes. Error responses include a detail field:

```json
{
    "detail": "Error description here"
}
```

### Common Errors

- **400 Bad Request:** Invalid file type, malformed request, or invalid date format
- **404 Not Found:** Resource not found (meal, product, user)
- **422 Unprocessable Entity:** Missing required fields
- **500 Internal Server Error:** Server-side processing error

### Example Error Scenarios

```bash
# Invalid date format
GET /meals/daily?username=user123&date=2025-13-45
# Response: 400 Bad Request

# Non-existent meal ID
GET /meal/non_existent_id?username=user123
# Response: 404 Not Found

# Invalid date range (end before start)
GET /meals/range?username=user123&start_date=2025-10-25&end_date=2025-10-01
# Response: 400 Bad Request

# Missing image in predict
POST /predict
# Response: 422 Unprocessable Entity

# Non-existent barcode
GET /barcode/read/0000000000000
# Response: 404 Not Found
```

---

## Important Notes

### Food Prediction

- **Accepted Files:** Only image files (JPEG, PNG, WebP, etc.)
- **Confidence Scores:** Range from 0.0 to 1.0
- **Processing:** Uses deep learning for food classification and NLP for name matching
- **Timestamps:** All timestamps are in UTC format

### Meal Analysis

- **Background Processing:** Analysis runs asynchronously after creating pending entry
- **Serving Size:** Amount should be in grams
- **Nutrient Data:** Comprehensive breakdown including vitamins, minerals, and macros

### Date Formats

- All dates must be in **YYYY-MM-DD** format
- When date parameter is omitted, current date is used
- Date ranges are inclusive (includes both start and end dates)

### Barcode Lookup

- **Data Source:** Open Food Facts database
- **Coverage:** Global product database with emphasis on food items
- **Images:** Available in three sizes (thumb: 100px, small: 200px, full: 400px+)

---

## Rate Limits

Contact your API administrator for rate limit information specific to your deployment.

---

## Support

For API issues or questions, please contact your API administrator or refer to the project repository.