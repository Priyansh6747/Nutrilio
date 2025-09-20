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
    "weight": float        # Optional, 1-500 kg
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

**POST /** 

Creates a new user in the system using the username as the unique identifier.

**Request Body:**
```json
{
    "username": "john_doe",
    "nickname": "Johnny",
    "gender": "male",
    "age": 25,
    "height": 180.5,
    "weight": 75.0
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
    "weight": 76.0
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

### 5. Delete User

**DELETE /{username}**

Deletes a user from the system.

**Path Parameters:**
- `username` (string): The unique username of the user to delete

**Response:**
```json
{
    "message": "User john_doe deleted successfully"
}
```

**Status Codes:**
- `200 OK`: User deleted successfully
- `404 Not Found`: User does not exist
- `500 Internal Server Error`: Database error

**Example:**
```bash
DELETE /john_doe
```

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
    "weight": 60.5
}
response = requests.post(f"{base_url}/", json=user_data)

# Get a user
response = requests.get(f"{base_url}/alice_smith")

# Update a user
updated_data = {
    "username": "alice_smith",
    "nickname": "Alice Updated",
    "gender": "female",
    "age": 29,
    "height": 165.0,
    "weight": 61.0
}
response = requests.put(f"{base_url}/alice_smith", json=updated_data)

# Delete a user
response = requests.delete(f"{base_url}/alice_smith")
```

### cURL Examples

```bash
# Create user
curl -X POST "http://your-api-domain.com/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "bob_jones",
    "nickname": "Bob",
    "gender": "male",
    "age": 32,
    "height": 175.0,
    "weight": 80.0
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
    "weight": 81.0
  }'

# Delete user
curl -X DELETE "http://your-api-domain.com/bob_jones"
```

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
- Optional fields (nickname, height, weight) can be `null`
- The API automatically adds `created_at` and `updated_at` timestamps
- Username validation ensures 3-30 character length
- All numeric validations prevent unrealistic values