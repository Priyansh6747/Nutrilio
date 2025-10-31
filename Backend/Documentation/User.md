# User Management API Documentation

## Overview

This FastAPI router provides a complete CRUD (Create, Read, Update, Delete) API for user management using Google Firestore as the database. Users are uniquely identified by their username, which serves as the document ID in Firestore.

## Base URL

All endpoints are prefixed with the router's base path (configured when including the router in your main FastAPI app).

## Data Models

### User (Request Model)

```python
{
    "username": str,        # Required, 3-30 characters
    "nickname": str,        # Optional
    "gender": str,          # Required, one of: "male", "female", "other"
    "age": int,            # Required, 0-120
    "height": float,       # Optional, 30-300 cm
    "weight": float,       # Optional, 1-500 kg
    "meals": List[str],    # Optional, list of meal IDs in format "UID_time" (defaults to empty list)
    "activity_factor": float # Optional, activity level multiplier (defaults to 1.375)
}
```

### UserResponse (Response Model)

```python
{
    "username": str,
    "nickname": str,        # Can be null
    "gender": str,
    "age": int,
    "height": float,       # Can be null
    "weight": float,       # Can be null
    "meals": List[str],    # List of meal IDs in format "UID_time"
    "activity_factor": float,
    "GlassSize": float,
    "Water": List[WaterIntake],
    "created_at": datetime
}
```

## API Endpoints

### 1. Health Check

**GET /** 

Simple health check endpoint.

**Response:**
```json
{
    "Msg": "Hello World"
}
```

**Status Codes:**
- `200 OK`: Service is running

---

### 2. Create User

**POST /init** 

Creates a new user in the system using the username as the unique identifier. The `meals` field is automatically initialized as an empty list if not provided, and `activity_factor` defaults to 1.375 if not specified.

**Request Body:**
```json
{
    "username": "john_doe",
    "nickname": "Johnny",
    "gender": "male",
    "age": 25,
    "height": 180.5,
    "weight": 75.0,
    "meals": ["user123_1704362400", "user123_1704366000"],
    "activity_factor": 1.375
}
```

**Response:**
```json
{
    "username": "john_doe",
    "nickname": "Johnny",
    "gender": "male",
    "age": 25,
    "height": 180.5,
    "weight": 75.0,
    "meals": ["user123_1704362400", "user123_1704366000"],
    "activity_factor": 1.375,
    "GlassSize": 250.0,
    "Water": [],
    "created_at": "2024-01-15T10:30:00.123456"
}
```

**Status Codes:**
- `200 OK`: User created successfully
- `409 Conflict`: Username already exists
- `422 Unprocessable Entity`: Validation error (invalid data)
- `500 Internal Server Error`: Database error

**Validation Rules:**
- `username`: 3-30 characters, required
- `gender`: Must be "male", "female", or "other"
- `age`: 0-120, required
- `height`: 30-300 cm (optional)
- `weight`: 1-500 kg (optional)
- `meals`: List of meal IDs in "UID_time" format (optional, defaults to empty list)
- `activity_factor`: Numeric value representing activity level (optional, defaults to 1.375)

---

### 3. Get User by Username

**GET /{username}**

Retrieves a user by their username.

**Path Parameters:**
- `username` (string): The unique username of the user

**Response:**
```json
{
    "username": "john_doe",
    "nickname": "Johnny",
    "gender": "male",
    "age": 25,
    "height": 180.5,
    "weight": 75.0,
    "meals": ["user123_1704362400", "user123_1704366000"],
    "activity_factor": 1.375,
    "GlassSize": 250.0,
    "Water": [],
    "created_at": "2024-01-15T10:30:00.123456"
}
```

**Status Codes:**
- `200 OK`: User found and returned
- `404 Not Found`: User does not exist
- `500 Internal Server Error`: Database error

**Example:**
```bash
GET /john_doe
```

**Note:** For existing users who don't have an `activity_factor` field, it will automatically default to 1.375. Similarly, missing `meals` fields default to an empty list.

---

### 4. Update User

**PUT /{username}**

Updates an existing user's information. The username in the path must match the username in the request body.

**Path Parameters:**
- `username` (string): The unique username of the user to update

**Request Body:**
```json
{
    "username": "john_doe",
    "nickname": "Johnny Updated",
    "gender": "male",
    "age": 26,
    "height": 181.0,
    "weight": 76.0,
    "meals": ["user123_1704362400", "user123_1704366000", "user123_1704369600"],
    "activity_factor": 1.55
}
```

**Response:**
```json
{
    "username": "john_doe",
    "nickname": "Johnny Updated",
    "gender": "male",
    "age": 26,
    "height": 181.0,
    "weight": 76.0,
    "meals": ["user123_1704362400", "user123_1704366000", "user123_1704369600"],
    "activity_factor": 1.55,
    "GlassSize": 250.0,
    "Water": [],
    "created_at": "2024-01-15T10:30:00.123456"
}
```

**Status Codes:**
- `200 OK`: User updated successfully
- `400 Bad Request`: Username in path doesn't match username in body
- `404 Not Found`: User does not exist
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Database error

**Important:** The `username` field in the request body must match the `username` in the URL path.

---

### 5. Update Glass Size

**PATCH /{username}/glass-size**

Updates the glass size for a user without modifying other fields.

**Path Parameters:**
- `username` (string): The unique username of the user

**Query Parameters:**
- `glass_size` (float): The new glass size value

**Response:**
```json
{
    "message": "Glass size updated successfully",
    "username": "john_doe",
    "GlassSize": 300.0
}
```

**Status Codes:**
- `200 OK`: Glass size updated successfully
- `404 Not Found`: User does not exist
- `500 Internal Server Error`: Database error

**Example:**
```bash
PATCH /john_doe/glass-size?glass_size=300
```

---

## Error Responses

All error responses follow this format:

```json
{
    "detail": "Error message description"
}
```

### Common Error Codes

- **400 Bad Request**: Invalid request data or parameters
- **404 Not Found**: Requested user does not exist
- **409 Conflict**: Username already exists (during creation)
- **422 Unprocessable Entity**: Request validation failed
- **500 Internal Server Error**: Database or server error

## Database Structure

The API uses Google Firestore with the following structure:

```
Collection: users
├── Document: {username}
│   ├── username: string
│   ├── nickname: string | null
│   ├── gender: string
│   ├── age: number
│   ├── height: number | null
│   ├── weight: number | null
│   ├── meals: array of meal ID strings (format: "UID_time")
│   ├── activity_factor: number (default: 1.375)
│   ├── GlassSize: number (default: 250.0)
│   ├── Water: array of water intake records
│   ├── created_at: timestamp
│   └── updated_at: timestamp
```

## Usage Examples

### Python Requests

```python
import requests

base_url = "http://your-api-domain.com"

# Create a user
user_data = {
    "username": "alice_smith",
    "nickname": "Alice",
    "gender": "female", 
    "age": 28,
    "height": 165.0,
    "weight": 60.5,
    "meals": ["alice123_1704362400", "alice123_1704366000", "alice123_1704369600"],
    "activity_factor": 1.55
}
response = requests.post(f"{base_url}/init", json=user_data)

# Get a user
response = requests.get(f"{base_url}/alice_smith")

# Update a user
updated_data = {
    "username": "alice_smith",
    "nickname": "Alice Updated",
    "gender": "female",
    "age": 29,
    "height": 165.0,
    "weight": 61.0,
    "meals": ["alice123_1704370200", "alice123_1704373800", "alice123_1704377400", "alice123_1704381000"],
    "activity_factor": 1.6
}
response = requests.put(f"{base_url}/alice_smith", json=updated_data)

# Update glass size
response = requests.patch(f"{base_url}/alice_smith/glass-size?glass_size=300")
```

### cURL Examples

```bash
# Create user
curl -X POST "http://your-api-domain.com/init" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "bob_jones",
    "nickname": "Bob",
    "gender": "male",
    "age": 32,
    "height": 175.0,
    "weight": 80.0,
    "meals": ["bob456_1704362400", "bob456_1704366000", "bob456_1704369600"],
    "activity_factor": 1.5
  }'

# Get user
curl -X GET "http://your-api-domain.com/bob_jones"

# Update user
curl -X PUT "http://your-api-domain.com/bob_jones" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "bob_jones",
    "nickname": "Robert",
    "gender": "male", 
    "age": 33,
    "height": 176.0,
    "weight": 81.0,
    "meals": ["bob456_1704370200", "bob456_1704373800", "bob456_1704377400", "bob456_1704381000"],
    "activity_factor": 1.625
  }'

# Update glass size
curl -X PATCH "http://your-api-domain.com/bob_jones/glass-size?glass_size=280"
```

## Activity Factor Field

The `activity_factor` field represents a user's activity level multiplier, typically used for calculating daily caloric or water intake requirements. It defaults to 1.375 if not specified during user creation.

### Common Activity Factor Values

- `1.2`: Sedentary (little or no exercise)
- `1.375`: Lightly active (light exercise 1-3 days/week)
- `1.55`: Moderately active (moderate exercise 3-5 days/week)
- `1.725`: Very active (hard exercise 6-7 days/week)
- `1.9`: Extremely active (physical job or intense training)

### Using Activity Factor

When creating or updating a user, you can set a custom activity factor:
```json
{
    "activity_factor": 1.55
}
```

If not provided, the activity factor defaults to 1.375.

## Meals Field Usage

The `meals` field is designed to store a list of meal IDs that reference meal objects in the system. Each meal ID follows the format "UID_time" where UID is a user identifier and time is a timestamp.

### Meal ID Format
- Format: `"UID_time"`
- Example: `"user123_1704362400"`
- The UID part typically corresponds to the user or a unique identifier
- The time part is a Unix timestamp representing when the meal was created

### Adding Meal IDs
When creating or updating a user, you can include meal IDs:
```json
{
    "meals": ["user123_1704362400", "user123_1704366000", "user123_1704369600"]
}
```

### Empty Meals List
If no meal IDs are provided during creation, the field defaults to an empty list:
```json
{
    "meals": []
}
```

### Updating Meal IDs
The meals field replaces the entire list during updates. To add a meal ID, include all existing meal IDs plus the new one:
```json
{
    "meals": ["user123_1704362400", "user123_1704366000", "user123_1704373800"]
}
```

### Important Notes
- Each meal ID should reference an existing meal object in your meal management system
- The API does not validate whether the meal IDs actually exist - this should be handled by your application logic
- Meal IDs are stored as strings and should follow the "UID_time" format consistently

## Setup Requirements

1. **FastAPI**: Web framework
2. **Pydantic**: Data validation
3. **Google Cloud Firestore**: Database
4. **Config module**: Must export `firestoreDB` initialized Firestore client

### Config.py Example

```python
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
cred = credentials.Certificate("path/to/serviceAccountKey.json")
firebase_admin.initialize_app(cred)

# Initialize Firestore
firestoreDB = firestore.client()
```

## Notes

- Usernames are case-sensitive and serve as unique identifiers
- All datetime fields are stored in UTC
- Optional fields (nickname, height, weight, meals, activity_factor) can be `null` or empty
- The API automatically adds `created_at` and `updated_at` timestamps
- Username validation ensures 3-30 character length
- All numeric validations prevent unrealistic values
- The `meals` field is automatically initialized as an empty list for new users
- Existing users without the `meals` field will have it automatically set to an empty list when retrieved
- The `meals` field stores an array of meal ID strings in Firestore following the "UID_time" format
- Meal IDs reference separate meal objects - the API does not validate meal ID existence
- The `activity_factor` field defaults to 1.375 for new users
- Existing users without the `activity_factor` field will have it automatically set to 1.375 when retrieved
- The `activity_factor` field is typically used in calculations for daily water intake or caloric requirements