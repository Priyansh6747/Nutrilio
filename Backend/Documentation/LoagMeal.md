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
        "name": "Dal Baati",
        "description": "Dal Baati is a traditional Indian dish originating from Rajasthan, known for its unique combination of flavors and textures. It consists of a hearty, spiced lentil curry (dal) served alongside baked, unleavened wheat bread balls (baati) that are typically hard and dense."
    },
    "confidence": 0.587,
    "timestamp": "2025-10-02T00:18:58.568054"
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