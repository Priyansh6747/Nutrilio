# Chatbot API Documentation

## Overview
The Chatbot API provides endpoints for processing user queries and managing chat history with context-aware responses. The API maintains conversation history for each user to provide personalized interactions.

## Base URL
```
https://nonhydraulic-dilan-preeconomical.ngrok-free.dev/api/v1
```

## Authentication
Currently uses user_id for identifying conversations. Replace `{{userID}}` in requests with actual user identifier.

## Endpoints

### Health Check
**GET** `/health`

Check if the service is running.

**Response:**
```json
{
  "status": "healthy",
  "service": "chatbot"
}
```

---

### Process Query
**POST** `/query`

Process a user query with full response metadata including document count and success status.

**Request Body:**
```json
{
  "query": "What should I eat for breakfast to lose weight?",
  "user_id": "NEANSZLVyFWoDftAr1neZi9rFSF3",
  "verbose": true
}
```

**Parameters:**
- `query` (string, required): The user's question or message
- `user_id` (string, required): Unique identifier for the user
- `verbose` (boolean, optional): Whether to return detailed processing information

**Response:**
```json
{
  "answer": "For weight loss breakfast, consider...",
  "num_docs": 3,
  "success": true
}
```

---

### Simple Query
**POST** `/query/simple`

Process a query and return only the answer without additional metadata.

**Request Body:**
```json
{
  "query": "How many calories should I consume daily?",
  "user_id": "NEANSZLVyFWoDftAr1neZi9rFSF3",
  "verbose": false
}
```

**Response:**
```json
{
  "answer": "The recommended daily calorie intake depends on..."
}
```

---

### Retrieve Chat History
**POST** `/history/retrieve`

Retrieve recent chat history with optional limit.

**Request Body:**
```json
{
  "user_id": "NEANSZLVyFWoDftAr1neZi9rFSF3",
  "limit": 10
}
```

**Parameters:**
- `user_id` (string, required): User identifier
- `limit` (integer, optional): Number of recent messages to retrieve

**Response:**
```json
{
  "user_id": "NEANSZLVyFWoDftAr1neZi9rFSF3",
  "message_count": 7,
  "messages": [
    {
      "role": "HumanMessage",
      "content": "What should I eat for breakfast?"
    },
    {
      "role": "AIMessage", 
      "content": "Consider oatmeal with fruits..."
    }
  ]
}
```

---

### Load Full Chat History
**POST** `/history/full`

Retrieve the complete chat history for a user.

**Request Body:**
```json
{
  "user_id": "NEANSZLVyFWoDftAr1neZi9rFSF3"
}
```

**Response:**
```json
{
  "user_id": "NEANSZLVyFWoDftAr1neZi9rFSF3",
  "total_messages": 15,
  "messages": [...]
}
```

---

### Get Chat Summary
**POST** `/history/summary`

Get a summary of the chat history including statistics.

**Request Body:**
```json
{
  "user_id": "NEANSZLVyFWoDftAr1neZi9rFSF3"
}
```

**Response:**
```json
{
  "user_id": "NEANSZLVyFWoDftAr1neZi9rFSF3",
  "total_messages": 15,
  "first_interaction": "2024-01-15T10:30:00Z",
  "last_interaction": "2024-01-20T14:45:00Z"
}
```

---

### Clear Chat History
**POST** `/history/clear`

Clear all chat history for a specific user.

**Request Body:**
```json
{
  "user_id": "NEANSZLVyFWoDftAr1neZi9rFSF3"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Chat history cleared for user NEANSZLVyFWoDftAr1neZi9rFSF3"
}
```

---

## Example Usage Scenarios

### Diet and Nutrition Conversation
```http
POST /api/v1/query
Content-Type: application/json

{
  "query": "I want to build muscle, what should my diet look like?",
  "user_id": "user123",
  "verbose": false
}
```

Follow-up questions maintain context:
- "How much protein do I need per day?"
- "What are good protein sources for vegetarians?"
- "Can you suggest a high protein meal plan?"

### Weight Loss Questions
- "What foods should I avoid to lose belly fat?"
- "Is intermittent fasting effective for weight loss?"

### Nutrition Information
- "What are the benefits of omega-3 fatty acids?"
- "Should I take vitamin supplements?"

## Error Handling

All endpoints return HTTP 500 status code with error details in case of failures:

```json
{
  "detail": "Error processing query: [error description]"
}
```


## Notes

- The API maintains conversation context using the `user_id` parameter
- Chat history is persisted between sessions for the same user
- The `verbose` flag provides additional processing information when needed
- All endpoints require JSON request bodies with proper Content-Type headers