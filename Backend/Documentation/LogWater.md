# Water Intake API Documentation

## Base URL
```
https://nonhydraulic-dilan-preeconomical.ngrok-free.dev/api/v1/water
```

## Authentication
All endpoints require a valid username parameter. The username is a unique identifier for each user (e.g., `KwpGnNMQiYYaN3RY5qDT9xIsWZ33`).

---

## Endpoints

### 1. Add Water Intake
**POST** `/water/intake/{username}`

Records a new water intake entry for the specified user.

#### Path Parameters
- `username` (string, required): User's unique identifier

#### Request Body
```json
{
  "amount": 500,
  "timestamp": "2025-10-22T10:30:00"  
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| amount | integer | Yes | Amount of water in milliliters (must be > 0) |
| timestamp | datetime | No | When the water was consumed. Defaults to current time if not provided |

#### Response
**Status Code:** 200 OK
```json
{
  "id": "hOIrKd7ZcgKswCQNGsb5",
  "timestamp": "2025-10-22T10:30:00",
  "amount": 500
}
```

#### Error Responses
- **400 Bad Request**: Invalid amount (≤ 0) or malformed timestamp
- **500 Internal Server Error**: Server error while processing request

#### Example Requests
```http
# Basic intake
POST /water/intake/KwpGnNMQiYYaN3RY5qDT9xIsWZ33
Content-Type: application/json

{
  "amount": 500
}

# With custom timestamp
POST /water/intake/KwpGnNMQiYYaN3RY5qDT9xIsWZ33
Content-Type: application/json

{
  "amount": 300,
  "timestamp": "2025-10-22T10:30:00"
}
```

---

### 2. Add Quick Glass
**POST** `/water/quick-glass/{username}`

Quickly logs a glass of water using the user's predefined default glass size. This is a convenience endpoint that doesn't require specifying an amount.

#### Path Parameters
- `username` (string, required): User's unique identifier

#### Request Body
None required

#### Response
**Status Code:** 200 OK
```json
{
  "id": "xyz123abc456",
  "timestamp": "2025-10-22T14:23:15",
  "amount": 250
}
```

#### Error Responses
- **400 Bad Request**: User doesn't have a default glass size configured
- **500 Internal Server Error**: Server error while processing request

#### Example Request
```http
POST /water/quick-glass/KwpGnNMQiYYaN3RY5qDT9xIsWZ33
```

---

### 3. Get Water Intakes by Date
**GET** `/water/intake/{username}/date/{target_date}`

Retrieves all water intake entries for a specific date.

#### Path Parameters
- `username` (string, required): User's unique identifier
- `target_date` (date, required): Date in `YYYY-MM-DD` format

#### Response
**Status Code:** 200 OK
```json
[
  {
    "id": "intake1",
    "timestamp": "2025-10-22T08:30:00",
    "amount": 250
  },
  {
    "id": "intake2",
    "timestamp": "2025-10-22T12:15:00",
    "amount": 500
  }
]
```

#### Error Responses
- **404 Not Found**: User not found or no data for specified date
- **500 Internal Server Error**: Server error while retrieving data

#### Example Requests
```http
# Get today's intakes
GET /water/intake/KwpGnNMQiYYaN3RY5qDT9xIsWZ33/date/2025-10-22

# Get specific date
GET /water/intake/KwpGnNMQiYYaN3RY5qDT9xIsWZ33/date/2025-10-15
```

---

### 4. Get Water Intakes by Date Range
**GET** `/water/intake/{username}/range`

Retrieves all water intake entries within a specified date range (inclusive).

#### Path Parameters
- `username` (string, required): User's unique identifier

#### Query Parameters
- `start_date` (date, required): Start date in `YYYY-MM-DD` format
- `end_date` (date, required): End date in `YYYY-MM-DD` format

#### Response
**Status Code:** 200 OK
```json
[
  {
    "id": "intake1",
    "timestamp": "2025-10-15T08:30:00",
    "amount": 250
  },
  {
    "id": "intake2",
    "timestamp": "2025-10-16T10:00:00",
    "amount": 300
  },
  {
    "id": "intake3",
    "timestamp": "2025-10-22T14:20:00",
    "amount": 500
  }
]
```

#### Error Responses
- **400 Bad Request**: Invalid date range (start_date after end_date)
- **500 Internal Server Error**: Server error while retrieving data

#### Example Request
```http
GET /water/intake/KwpGnNMQiYYaN3RY5qDT9xIsWZ33/range?start_date=2025-10-15&end_date=2025-10-22
```

---

### 5. Update Water Intake
**PUT** `/water/intake/{username}/{intake_id}`

Updates an existing water intake entry. You can update the amount, timestamp, or both.

#### Path Parameters
- `username` (string, required): User's unique identifier
- `intake_id` (string, required): ID of the intake entry to update

#### Request Body
```json
{
  "amount": 600,
  "timestamp": "2025-10-22T15:30:00"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| amount | integer | No | New amount in milliliters (must be > 0) |
| timestamp | datetime | No | New timestamp for the intake |

**Note:** At least one field must be provided.

#### Response
**Status Code:** 200 OK
```json
{
  "id": "hOIrKd7ZcgKswCQNGsb5",
  "timestamp": "2025-10-22T15:30:00",
  "amount": 600
}
```

#### Error Responses
- **400 Bad Request**: Invalid amount, invalid timestamp, or no fields provided
- **404 Not Found**: Intake entry not found
- **500 Internal Server Error**: Server error while updating

#### Example Requests
```http
# Update amount only
PUT /water/intake/KwpGnNMQiYYaN3RY5qDT9xIsWZ33/hOIrKd7ZcgKswCQNGsb5
Content-Type: application/json

{
  "amount": 600
}

# Update timestamp only
PUT /water/intake/KwpGnNMQiYYaN3RY5qDT9xIsWZ33/hOIrKd7ZcgKswCQNGsb5
Content-Type: application/json

{
  "timestamp": "2025-10-22T14:00:00"
}

# Update both
PUT /water/intake/KwpGnNMQiYYaN3RY5qDT9xIsWZ33/hOIrKd7ZcgKswCQNGsb5
Content-Type: application/json

{
  "amount": 450,
  "timestamp": "2025-10-22T15:30:00"
}
```

---

### 6. Delete Water Intake
**DELETE** `/water/intake/{username}/{intake_id}`

Deletes a specific water intake entry.

#### Path Parameters
- `username` (string, required): User's unique identifier
- `intake_id` (string, required): ID of the intake entry to delete

#### Response
**Status Code:** 200 OK
```json
{
  "success": true,
  "message": "Water intake deleted successfully"
}
```

#### Error Responses
- **404 Not Found**: Intake entry not found
- **500 Internal Server Error**: Server error while deleting

#### Example Request
```http
DELETE /water/intake/KwpGnNMQiYYaN3RY5qDT9xIsWZ33/hOIrKd7ZcgKswCQNGsb5
```

---

### 7. Get Today's Daily Stats
**GET** `/water/stats/{username}/daily`

Retrieves comprehensive statistics for the current day's water intake.

#### Path Parameters
- `username` (string, required): User's unique identifier

#### Response
**Status Code:** 200 OK
```json
{
  "date": "2025-10-22",
  "total_intake": 1250,
  "intake_count": 5,
  "intakes": [
    {
      "id": "intake1",
      "timestamp": "2025-10-22T08:00:00",
      "amount": 250
    },
    {
      "id": "intake2",
      "timestamp": "2025-10-22T10:30:00",
      "amount": 300
    }
  ],
  "recommended_intake": 2000,
  "percentage_completed": 62.5
}
```

| Field | Type | Description |
|-------|------|-------------|
| date | date | Date of the statistics |
| total_intake | integer | Total milliliters consumed |
| intake_count | integer | Number of intake entries |
| intakes | array | List of all intake entries for the day |
| recommended_intake | integer | User's daily water goal in milliliters |
| percentage_completed | float | Percentage of daily goal achieved |

#### Error Responses
- **404 Not Found**: User not found
- **500 Internal Server Error**: Server error while retrieving stats

#### Example Request
```http
GET /water/stats/KwpGnNMQiYYaN3RY5qDT9xIsWZ33/daily
```

---

### 8. Get Daily Stats for Specific Date
**GET** `/water/stats/{username}/daily/{target_date}`

Retrieves comprehensive statistics for a specific date's water intake.

#### Path Parameters
- `username` (string, required): User's unique identifier
- `target_date` (date, required): Date in `YYYY-MM-DD` format

#### Response
Same structure as "Get Today's Daily Stats"

#### Error Responses
- **404 Not Found**: User not found or no data for specified date
- **500 Internal Server Error**: Server error while retrieving stats

#### Example Request
```http
GET /water/stats/KwpGnNMQiYYaN3RY5qDT9xIsWZ33/daily/2025-10-22
```

---

### 9. Get Water Streak
**GET** `/water/streak/{username}`

Calculates the user's current and longest water intake streaks based on achieving a target percentage of their daily goal.

#### Path Parameters
- `username` (string, required): User's unique identifier

#### Query Parameters
- `target_percentage` (float, optional): Minimum percentage of daily goal to count as success. Default: `80.0`
- `days_to_check` (integer, optional): Number of days to analyze. Default: `30`

#### Response
**Status Code:** 200 OK
```json
{
  "current_streak": 7,
  "longest_streak": 14,
  "target_percentage": 80.0
}
```

| Field | Type | Description |
|-------|------|-------------|
| current_streak | integer | Number of consecutive days meeting the target |
| longest_streak | integer | Longest streak achieved in the analyzed period |
| target_percentage | float | The percentage threshold used for calculation |

#### Error Responses
- **404 Not Found**: User not found
- **500 Internal Server Error**: Server error while calculating streak

#### Example Requests
```http
# Default parameters (80% target, 30 days)
GET /water/streak/KwpGnNMQiYYaN3RY5qDT9xIsWZ33

# Custom parameters
GET /water/streak/KwpGnNMQiYYaN3RY5qDT9xIsWZ33?target_percentage=90.0&days_to_check=60
```

---

### 10. Get Weekly Summary
**GET** `/water/summary/{username}/weekly`

Provides a comprehensive summary of water intake for a week, including daily breakdowns and aggregate statistics.

#### Path Parameters
- `username` (string, required): User's unique identifier

#### Query Parameters
- `target_date` (date, optional): Any date within the desired week (format: `YYYY-MM-DD`). Defaults to current week if not provided.

#### Response
**Status Code:** 200 OK
```json
{
  "week_start": "2025-10-20",
  "week_end": "2025-10-26",
  "daily_stats": [
    {
      "date": "2025-10-20",
      "total_intake": 2100,
      "intake_count": 8,
      "percentage_completed": 105.0
    },
    {
      "date": "2025-10-21",
      "total_intake": 1800,
      "intake_count": 7,
      "percentage_completed": 90.0
    }
  ],
  "total_intake": 12500,
  "average_daily_intake": 1785.7,
  "average_percentage": 89.3,
  "days_met_goal": 5,
  "days_tracked": 7
}
```

| Field | Type | Description |
|-------|------|-------------|
| week_start | date | Start date of the week (Monday) |
| week_end | date | End date of the week (Sunday) |
| daily_stats | array | Statistics for each day in the week |
| total_intake | integer | Total milliliters consumed during the week |
| average_daily_intake | float | Average milliliters per day |
| average_percentage | float | Average percentage of goal achieved |
| days_met_goal | integer | Number of days goal was met (≥100%) |
| days_tracked | integer | Number of days with recorded intake |

#### Error Responses
- **404 Not Found**: User not found
- **500 Internal Server Error**: Server error while retrieving summary

#### Example Requests
```http
# Current week
GET /water/summary/KwpGnNMQiYYaN3RY5qDT9xIsWZ33/weekly

# Specific week (containing 2025-10-15)
GET /water/summary/KwpGnNMQiYYaN3RY5qDT9xIsWZ33/weekly?target_date=2025-10-15
```

---

## Error Handling

All endpoints follow consistent error response patterns:

### Common HTTP Status Codes
- **200 OK**: Successful request
- **400 Bad Request**: Invalid input parameters
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side error

### Error Response Format
```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common Validation Errors
- Amount must be greater than 0
- Invalid date format (must be `YYYY-MM-DD`)
- Invalid datetime format (must be ISO 8601)
- Start date cannot be after end date
- User not found
- Intake entry not found

---

## Data Types

### Date Format
All dates use `YYYY-MM-DD` format (ISO 8601 date).

Example: `2025-10-22`

### DateTime Format
All timestamps use ISO 8601 datetime format with optional timezone.

Examples:
- `2025-10-22T10:30:00`
- `2025-10-22T10:30:00Z`
- `2025-10-22T10:30:00+05:30`

### Units
- All water amounts are in **milliliters (ml)**
- All percentages are expressed as floats (e.g., 80.0 for 80%)

---

## Usage Examples

### Daily Tracking Workflow
```http
# 1. Log morning water
POST /water/quick-glass/USER_ID

# 2. Log custom amount at lunch
POST /water/intake/USER_ID
{
  "amount": 500
}

# 3. Check progress
GET /water/stats/USER_ID/daily

# 4. Update if needed
PUT /water/intake/USER_ID/INTAKE_ID
{
  "amount": 450
}
```

### Weekly Review Workflow
```http
# 1. Get weekly summary
GET /water/summary/USER_ID/weekly

# 2. Check streak
GET /water/streak/USER_ID

# 3. Review specific day
GET /water/stats/USER_ID/daily/2025-10-20
```

### Historical Analysis Workflow
```http
# 1. Get data for date range
GET /water/intake/USER_ID/range?start_date=2025-10-01&end_date=2025-10-22

# 2. Check long-term streak
GET /water/streak/USER_ID?days_to_check=90&target_percentage=85
```

---

## Rate Limiting & Best Practices

### Best Practices
1. Use `/water/quick-glass` for frequent logging to reduce payload size
2. Batch retrieve data using date ranges instead of multiple single-date requests
3. Cache user settings (like recommended intake) on the client side
4. Use appropriate datetime timezones to ensure accurate tracking
5. Handle errors gracefully and provide user feedback

### Performance Tips
- The `/water/intake/{username}/range` endpoint is more efficient than multiple date-specific requests
- Weekly summaries are pre-aggregated for better performance
- Streak calculations may be resource-intensive for large `days_to_check` values

---

## Testing Endpoints

### Valid Test Cases
```http
# Add intake
POST /water/intake/{{username}}
{"amount": 500}

# Quick glass
POST /water/quick-glass/{{username}}

# Get stats
GET /water/stats/{{username}}/daily
```

### Error Test Cases
```http
# Invalid amount (negative)
POST /water/intake/{{username}}
{"amount": -100}
# Expected: 400 Bad Request

# Invalid amount (zero)
POST /water/intake/{{username}}
{"amount": 0}
# Expected: 400 Bad Request

# Invalid date range
GET /water/intake/{{username}}/range?start_date=2025-10-22&end_date=2025-10-15
# Expected: 400 Bad Request

# Non-existent ID
DELETE /water/intake/{{username}}/nonexistent_id
# Expected: 404 Not Found
```