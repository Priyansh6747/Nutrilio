# Food Prediction API Documentation

## Overview

AI-powered food identification API that analyzes food images and returns detailed information about the dish.

## Endpoint

### POST /predict

Upload a food image to get AI-powered identification and description.

**Content-Type:** `multipart/form-data`

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | User-provided name for the food |
| image | file | Yes | Image file (JPEG, PNG, etc.) |
| description | string | No | Additional context about the food |

## Request Example

```bash
curl -X POST "http://your-api-domain.com/predict" \
  -F "name=Dal Baati" \
  -F "image=@/path/to/food.jpg" \
  -F "description=Traditional homemade recipe"
```

## Response Example

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

## Status Codes

- `200 OK` - Success
- `400 Bad Request` - Invalid file type
- `422 Unprocessable Entity` - Missing required fields
- `500 Internal Server Error` - Processing failed

## Python Example

```python
import requests

with open("food.jpg", "rb") as f:
    response = requests.post(
        "http://your-api-domain.com/predict",
        files={"image": f},
        data={"name": "Dal Baati"}
    )
    
print(response.json())
```

## Notes

- Only image files are accepted
- Confidence score ranges from 0.0 to 1.0
- Timestamps are in UTC format