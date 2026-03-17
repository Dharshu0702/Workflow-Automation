
# Workflow Automation System

A full-stack **Workflow Automation System** built with **React**, **Node.js + Express**, and **MongoDB**. This system allows users to design workflows, define steps, create conditional rules, execute workflows, and track execution logs.

## Features

✅ **Workflow Management** - Create, edit, and manage workflows with versioning  
✅ **Step Management** - Define workflow steps (task, approval, notification)  
✅ **Rule Engine** - Dynamic conditional logic with rule evaluation  
✅ **Workflow Execution** - Execute workflows and track progress  
✅ **Execution Logs** - Detailed logs of workflow execution and rule evaluations  
✅ **Audit Trail** - Track all workflow actions and executions  
✅ **Clean Architecture** - Modular backend with services, controllers, models  
✅ **Modern Dashboard** - Responsive React UI with navigation and forms  

## Project Structure

```
workflow/
├── backend/
│   ├── models/           # Mongoose schemas
│   ├── controllers/      # Route handlers
│   ├── routes/           # API endpoints
│   ├── services/         # Business logic
│   ├── ruleEngine.js     # Rule evaluation engine
│   ├── server.js         # Express server
│   ├── package.json
│   ├── schema.sql        # PostgreSQL schema (reference)
│   ├── TESTING.md        # API testing guide
│   └── Postman_Collection.json
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable components (Sidebar, Navbar)
│   │   ├── pages/        # Full page components
│   │   ├── services/     # API client services
│   │   ├── hooks/        # Custom React hooks
│   │   ├── App.js        # Main routing
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── EXAMPLE_WORKFLOWS.json
└── README.md
```

## Tech Stack

**Frontend:**
- React 18.2
- React Router 6
- Axios (HTTP client)
- CSS3 (custom styling)

**Backend:**
- Node.js + Express 4.18
- MongoDB + Mongoose 7
- CORS enabled

**Database:**
- MongoDB (NoSQL)
- Mongoose ODM

## Prerequisites

- Node.js (v14+)
- npm or yarn
- MongoDB (running locally on port 27017)

## Setup & Installation

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Start MongoDB

Ensure MongoDB is running on `mongodb://localhost:27017`

```bash
# On Mac/Linux
mongod

# On Windows
mongod.exe
```

### 4. Start Backend Server

```bash
cd backend
npm start

# Backend runs on http://localhost:5000
```

### 5. Start Frontend Development Server

```bash
cd frontend
npm start

# Frontend runs on http://localhost:3000
```

The dashboard will open automatically at `http://localhost:3000`

## API Endpoints

### Workflows
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/workflows` | Create workflow |
| GET | `/workflows` | List all workflows |
| GET | `/workflows/:id` | Get workflow by ID |
| PUT | `/workflows/:id` | Update workflow |
| DELETE | `/workflows/:id` | Delete workflow |

### Steps
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/workflows/:workflow_id/steps` | Add step to workflow |
| GET | `/workflows/:workflow_id/steps` | List workflow steps |
| PUT | `/steps/:id` | Update step |
| DELETE | `/steps/:id` | Delete step |

### Rules
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/steps/:step_id/rules` | Add rule to step |
| GET | `/steps/:step_id/rules` | List step rules |
| PUT | `/rules/:id` | Update rule |
| DELETE | `/rules/:id` | Delete rule |

### Executions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/workflows/:workflow_id/execute` | Create & execute workflow |
| POST | `/executions/:id/run` | Execute workflow |
| GET | `/executions/:id` | Get execution details |
| GET | `/executions?workflow_id=X` | List executions |
| POST | `/executions/:id/cancel` | Cancel execution |
| POST | `/executions/:id/retry` | Retry failed execution |

## Example Workflow

### Expense Approval Workflow

**Input:**
```json
{
  "amount": 1500,
  "country": "US",
  "category": "travel"
}
```

**Steps:**
1. **Manager Review** (approval) → Routes to step 2
2. **High Amount Check** (task) → If `amount > 1000` go to Finance Review, else go to Approval Notification
3. **Finance Review** (approval) → Routes to step 4
4. **Approval Notification** (notification) → End

**Rules:**
```
Step 1: DEFAULT → Step 2 (Priority: 100)
Step 2: amount > 1000 → Step 3 (Priority: 1)
Step 2: amount <= 1000 → Step 4 (Priority: 2)
Step 3: DEFAULT → Step 4 (Priority: 100)
Step 4: DEFAULT → End (Priority: 100)
```

## Rule Engine

The rule engine evaluates conditions dynamically with support for:

### Operators
- Comparison: `==`, `!=`, `<`, `>`, `<=`, `>=`
- Logical: `&&` (AND), `||` (OR)

### String Functions
- `contains(field, value)` - Check if field contains value
- `startsWith(field, value)` - Check if field starts with value
- `endsWith(field, value)` - Check if field ends with value

### Example Conditions
```javascript
amount > 1000                              // Simple comparison
amount > 1000 && country == 'US'          // Logical AND
category == 'travel' || category == 'meals' // Logical OR
contains(vendor, 'Amazon')                // String function
startsWith(department, 'IT')              // String function
```

## Dashboard Pages

### 1. Workflow List
- View all workflows with search and pagination
- Create, edit, execute, or delete workflows
- See workflow version and status

### 2. Workflow Editor
- Create new workflows
- Edit workflow details (name, version, active status)
- Add/remove steps
- Define input schema

### 3. Step Rule Editor
- Add rules to a step
- Define conditions and next steps
- Set rule priorities
- Delete rules

### 4. Workflow Execution
- Execute workflow with custom input data
- View real-time execution status
- See current step and step logs
- Check evaluated rules and their results

### 5. Execution Logs
- Detailed execution summary
- View input data used
- Step-by-step execution details
- Rules evaluation table
- Error messages (if any)

### 6. Audit Logs
- History of all workflow executions
- Filter by workflow or action
- View execution details
- Track who triggered each execution

## Testing

### Using Postman
1. Import `backend/Postman_Collection.json` into Postman
2. Run requests against the backend

### Using cURL
See `backend/TESTING.md` for complete cURL examples

### Example cURL Request
```bash
curl -X POST http://localhost:5000/workflows \
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

## Data Models

### Workflow
```javascript
{
  _id: ObjectId,
  name: String,
  version: Number,
  is_active: Boolean,
  input_schema: Object,
  start_step_id: ObjectId,
  created_at: Date,
  updated_at: Date
}
```

### Step
```javascript
{
  _id: ObjectId,
  workflow_id: ObjectId,
  name: String,
  step_type: String, // 'task', 'approval', 'notification'
  order: Number,
  metadata: Object,
  created_at: Date,
  updated_at: Date
}
```

### Rule
```javascript
{
  _id: ObjectId,
  step_id: ObjectId,
  condition: String,
  next_step_id: ObjectId,
  priority: Number,
  created_at: Date,
  updated_at: Date
}
```

### Execution
```javascript
{
  _id: ObjectId,
  workflow_id: ObjectId,
  workflow_version: Number,
  status: String, // 'pending', 'in_progress', 'completed', 'failed', 'canceled'
  data: Object,
  logs: Array,
  current_step_id: ObjectId,
  retries: Number,
  triggered_by: String,
  started_at: Date,
  ended_at: Date
}
```

### Step Log
```javascript
{
  _id: ObjectId,
  execution_id: ObjectId,
  step_name: String,
  step_type: String,
  evaluated_rules: Array,
  selected_next_step: ObjectId,
  status: String,
  error_message: String,
  started_at: Date,
  ended_at: Date
}
```

## Troubleshooting

### MongoDB Connection Error
```
Error: MongoDB connection is not established
```
**Solution:** Ensure MongoDB is running on `localhost:27017`

### Frontend API Connection Error
```
Network Error: Cannot reach backend
```
**Solution:** Ensure backend is running on `http://localhost:5000` and CORS is enabled

### Rule Condition Syntax Error
```
Rule evaluation failed
```
**Solution:** Check condition syntax. Use operators like `==`, `>`, `&&`, `||`


## Frontend
cd frontend
npm install
npm start

Runs on http://localhost:3000

## Features
- Create workflow
- Execute workflow
- Simple rule engine
- React UI
