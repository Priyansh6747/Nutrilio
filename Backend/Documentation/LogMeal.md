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

## Streak & Engagement

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