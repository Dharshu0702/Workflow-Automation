# Workflow CRUD Testing Guide

## Setup

1. Ensure MongoDB is running on `mongodb://localhost:27017`
2. Start the backend server: `cd backend && npm start` (runs on `http://localhost:3000`)

## Testing with Postman

Import the `Postman_Collection.json` file into Postman, then execute the requests.

## Testing with cURL

### 1. Create a Workflow

```bash
curl -X POST http://localhost:3000/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Expense Approval",
    "version": 1,
    "is_active": true,
    "input_schema": {
      "properties": {
        "amount": { "type": "number" },
        "country": { "type": "string" }
      }
    }
  }'
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Expense Approval",
  "version": 1,
  "is_active": true,
  "input_schema": {
    "properties": {
      "amount": { "type": "number" },
      "country": { "type": "string" }
    }
  },
  "created_at": "2026-03-15T16:00:00Z",
  "updated_at": "2026-03-15T16:00:00Z"
}
```

### 2. Get All Workflows

```bash
curl -X GET http://localhost:3000/workflows
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Expense Approval",
    "version": 1,
    "is_active": true,
    ...
  }
]
```

### 3. Get Workflow by ID

```bash
curl -X GET http://localhost:3000/workflows/507f1f77bcf86cd799439011
```

### 4. Update Workflow

```bash
curl -X PUT http://localhost:3000/workflows/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Expense Approval v2",
    "version": 2,
    "is_active": true
  }'
```

### 5. Delete Workflow

```bash
curl -X DELETE http://localhost:3000/workflows/507f1f77bcf86cd799439011
```

## Expected Status Codes

- **201**: Resource created (POST)
- **200**: Success (GET, PUT)
- **404**: Resource not found
- **400**: Bad request
- **500**: Server error
