# Food Prediction API Documentation

## Overview

AI-powered food identification and product lookup API that analyzes food images and retrieves detailed product information via barcodes.

## Base URL

```
http://your-api-domain.com
```

---

## Endpoints

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
        "description": "Momos are a type of steamed or pan-fried dumpling popular across South Asia, particularly in Tibetan, Nepali, and Indian cuisine. They typically feature a savory filling of minced meat (such as chicken, pork, or buffalo) or vegetables, seasoned with aromatic spices, encased in a delicate dough wrapper.",
        "confidence": 0.95
    },
    "suggested_food": "momos",
    "confidence": 0.95,
    "original_ml_confidence": 0.9839858412742615,
    "timestamp": "2025-10-04T18:46:48.500101"
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| result.name | string | Identified food name |
| result.description | string | Detailed description of the food |
| result.confidence | float | Adjusted confidence score (0.0-1.0) |
| suggested_food | string | ML model's suggested food classification |
| confidence | float | Final confidence score after similarity check |
| original_ml_confidence | float | Raw ML model confidence score |
| timestamp | string | UTC timestamp of prediction |

#### Status Codes

- `200 OK` - Success
- `400 Bad Request` - Invalid file type
- `422 Unprocessable Entity` - Missing required fields
- `500 Internal Server Error` - Processing failed

---

### 2. GET /barcode/read/{code}

Retrieve detailed product information using a barcode number.

#### Request

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| code | string | Yes | Product barcode number (e.g., 8904063254450) |

#### Example Request

```bash
curl -X GET "http://your-api-domain.com/barcode/read/8904063254450"
```

#### Response

```json
{
    "code": "8904063254450",
    "product": {
        "_id": "8904063254450",
        "product_name": "Haldiram's Punjabi Tadka",
        "product_name_en": "Haldiram's Punjabi Tadka",
        "brands": "Haldiram's",
        "brands_tags": ["haldiram-s"],
        "countries": "India",
        "countries_tags": ["en:india"],
        "image_front_url": "https://images.openfoodfacts.org/images/products/890/406/325/4450/front_en.3.400.jpg",
        "image_front_small_url": "https://images.openfoodfacts.org/images/products/890/406/325/4450/front_en.3.200.jpg",
        "image_front_thumb_url": "https://images.openfoodfacts.org/images/products/890/406/325/4450/front_en.3.100.jpg",
        "nutriscore_grade": "unknown",
        "nutrition_grades": "unknown",
        "nutriments": {},
        "allergens": "",
        "packagings": [
            {
                "material": "en:o-7-other-plastics"
            }
        ],
        "categories_properties_tags": [
            "all-products",
            "categories-known"
        ]
    },
    "status": 1,
    "status_verbose": "product found"
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| code | string | Product barcode |
| product._id | string | Unique product identifier |
| product.product_name | string | Product name |
| product.brands | string | Brand name |
| product.countries | string | Country of sale |
| product.image_front_url | string | Full-size product image URL |
| product.nutriscore_grade | string | Nutrition score (A-E or unknown) |
| product.nutriments | object | Nutritional information |
| product.allergens | string | Allergen information |
| product.packagings | array | Packaging materials |
| status | integer | 1 = found, 0 = not found |
| status_verbose | string | Human-readable status |

#### Status Codes

- `200 OK` - Product found
- `404 Not Found` - Product not found in database
- `500 Internal Server Error` - Server error

---
## Important Notes

### Food Prediction Endpoint

- **Accepted Files:** Only image files (JPEG, PNG, WebP, etc.)
- **Confidence Scores:** Range from 0.0 to 1.0
  - `original_ml_confidence`: Raw ML model output
  - `confidence`: Adjusted score after name similarity analysis
- **Processing:** Uses deep learning for food classification and NLP for name matching
- **Timestamps:** All timestamps are in UTC format

### Barcode Lookup Endpoint

- **Data Source:** Open Food Facts database
- **Coverage:** Global product database with emphasis on food items
- **Images:** Available in three sizes (thumb: 100px, small: 200px, full: 400px+)
- **Nutritional Data:** When available, includes detailed nutrient information
- **Status Field:** Always check `status` field (1 = found, 0 = not found)
- **Limitations:** Some products may have incomplete information

---

## Error Handling

All endpoints return standard HTTP status codes. Error responses include a detail field:

```json
{
    "detail": "Error description here"
}
```

Common errors:

- **400 Bad Request:** Invalid file type or malformed request
- **404 Not Found:** Product not found (barcode endpoint only)
- **422 Unprocessable Entity:** Missing required fields
- **500 Internal Server Error:** Server-side processing error

---

## Rate Limits

Contact your API administrator for rate limit information specific to your deployment.

---

## Support

For API issues or questions, please contact your API administrator or refer to the project repository.