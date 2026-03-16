# Workflow Automation System - Architecture

## System Overview

The Workflow Automation System is a full-stack web application that enables users to:
1. Design complex workflows composed of multiple steps
2. Define conditional rules for step transitions
3. Execute workflows with custom input data
4. Track execution logs and audit trails

## Architecture Layers

### 1. Presentation Layer (Frontend)

**Technology:** React 18 + React Router 6

**Components:**
- **Sidebar** - Navigation menu
- **Navbar** - Page title and status
- **Pages** - Full page components for each feature

**Pages:**
1. **WorkflowList** - Displays all workflows with CRUD operations
2. **WorkflowEditor** - Create/edit workflows and manage steps
3. **StepRuleEditor** - Add and manage rules for steps
4. **WorkflowExecution** - Execute workflows with input data
5. **ExecutionLogs** - View detailed execution logs
6. **AuditLog** - Track workflow history

**Services:**
- **api.js** - Axios instance with base configuration
- **workflowService.js** - Workflow, step, and rule API methods
- **executionService.js** - Execution API methods

**Hooks:**
- **useApi** - Custom hook for managing API calls with loading/error states

### 2. API Layer (Backend)

**Technology:** Node.js + Express

**Route Structure:**
```
/workflows                    # Workflow CRUD
/workflows/:workflow_id/steps # Step management
/steps/:step_id/rules         # Rule management
/executions                   # Execution tracking
```

**Controllers:**
- **WorkflowController** - Handles workflow requests
- **StepController** - Handles step requests
- **RuleController** - Handles rule requests
- **ExecutionController** - Handles execution requests

### 3. Business Logic Layer (Services)

**Services:**
- **WorkflowService** - Workflow CRUD operations
- **StepService** - Step CRUD operations
- **RuleService** - Rule CRUD operations
- **ExecutionService** - Workflow execution and logging

**Rule Engine:**
- **ruleEngine.js** - Dynamic rule evaluation engine
  - Supports comparison operators (==, !=, <, >, <=, >=)
  - Supports logical operators (&&, ||)
  - Supports string functions (contains, startsWith, endsWith)
  - Evaluates rules by priority
  - Falls back to DEFAULT rule if no rule matches

### 4. Data Layer (Database)

**Technology:** MongoDB + Mongoose

**Collections:**
- **Workflows** - Workflow definitions
- **Steps** - Workflow steps
- **Rules** - Step transition rules
- **Executions** - Workflow execution records
- **StepLogs** - Detailed step execution logs
- **AuditLogs** - Audit trail

## Data Flow

### Workflow Creation Flow
```
User (Frontend)
    ↓
WorkflowEditor Component
    ↓
workflowService.createWorkflow()
    ↓
axios POST /workflows
    ↓
Express Router
    ↓
WorkflowController.create()
    ↓
WorkflowService.createWorkflow()
    ↓
Mongoose Workflow.save()
    ↓
MongoDB
    ↓
Response back to Frontend
```

### Workflow Execution Flow
```
User (Frontend)
    ↓
WorkflowExecution Component
    ↓
executionService.executeWorkflow()
    ↓
axios POST /executions/:id/run
    ↓
Express Router
    ↓
ExecutionController.execute()
    ↓
ExecutionService.executeWorkflow()
    ↓
Loop through workflow steps:
  ├─ Fetch current step
  ├─ Fetch step rules
  ├─ RuleEngine.evaluateRules()
  │   └─ Evaluate each rule condition by priority
  ├─ Select next step
  ├─ Log step execution
  └─ Create StepLog record
    ↓
Update Execution status to 'completed'
    ↓
Response with execution details
```

## Rule Engine Implementation

### Rule Evaluation Process

1. **Fetch Rules** - Get all rules for current step
2. **Sort by Priority** - Sort rules by priority (lowest first)
3. **Evaluate Conditions** - For each rule:
   - Parse condition expression
   - Evaluate against execution data
   - Return boolean result
4. **Select First Match** - Return first rule that evaluates to true
5. **Fallback** - If no rule matches, use DEFAULT rule
6. **Log Results** - Store evaluated rules and selection in StepLog

### Condition Evaluation Example

**Input Data:**
```json
{
  "amount": 1500,
  "country": "US"
}
```

**Rules (sorted by priority):**
```
1. condition: amount > 1000, priority: 1
2. condition: amount <= 1000, priority: 2
3. condition: DEFAULT, priority: 100
```

**Evaluation:**
```
Rule 1: 1500 > 1000 = true ✓ MATCH
→ Select Rule 1 (next_step_id = X)
```

## Database Schema Design

### Workflow Document
```javascript
{
  _id: ObjectId,
  name: "Expense Approval",
  version: 1,
  is_active: true,
  input_schema: { /* JSON Schema */ },
  start_step_id: ObjectId,    // Reference to first step
  created_at: Date,
  updated_at: Date
}
```

### Step Document
```javascript
{
  _id: ObjectId,
  workflow_id: ObjectId,      // Reference to Workflow
  name: "Manager Review",
  step_type: "approval",      // task | approval | notification
  order: 1,
  metadata: { /* */},
  created_at: Date,
  updated_at: Date
}
```

### Rule Document
```javascript
{
  _id: ObjectId,
  step_id: ObjectId,          // Reference to Step
  condition: "amount > 1000",
  next_step_id: ObjectId,     // Reference to next Step
  priority: 1,
  created_at: Date,
  updated_at: Date
}
```

### Execution Document
```javascript
{
  _id: ObjectId,
  workflow_id: ObjectId,      // Reference to Workflow
  workflow_version: 1,
  status: "completed",        // pending | in_progress | completed | failed | canceled
  data: { /* input data */ },
  logs: [ /* step logs */ ],
  current_step_id: ObjectId,  // Current step during execution
  retries: 0,
  triggered_by: "user",
  started_at: Date,
  ended_at: Date
}
```

### StepLog Document
```javascript
{
  _id: ObjectId,
  execution_id: ObjectId,     // Reference to Execution
  step_name: "Manager Review",
  step_type: "approval",
  evaluated_rules: [
    {
      rule_id: ObjectId,
      condition: "amount > 1000",
      priority: 1,
      matched: true
    }
  ],
  selected_next_step: ObjectId,
  status: "completed",
  error_message: null,
  started_at: Date,
  ended_at: Date
}
```

## Error Handling

### Frontend Error Handling
- Try-catch blocks in API calls
- useApi hook captures errors
- Error messages displayed to user
- Loading states managed separately

### Backend Error Handling
- Try-catch in controllers and services
- Mongoose validation errors
- HTTP status codes (201, 400, 404, 500)
- Error messages in response body

## Security Considerations

### Current Implementation
- CORS enabled for local development
- Input validation at MongoDB level
- No SQL injection risk (using MongoDB)

### Recommendations for Production
1. Add authentication (JWT or OAuth)
2. Add authorization (role-based access control)
3. Validate input data schema
4. Rate limiting on API endpoints
5. HTTPS only
6. API key management
7. Audit logging with user information

## Performance Optimizations

### Current
- Mongoose indexes on foreign keys
- Lean queries where appropriate
- Pagination on list endpoints

### Future Improvements
1. Database indexing on frequently searched fields
2. Caching for workflow definitions
3. Async job queue for long-running executions
4. WebSocket for real-time execution updates
5. Batch operations for bulk imports

## Scalability Considerations

### Horizontal Scaling
1. API server can be replicated
2. MongoDB can be sharded by workflow_id
3. Load balancer for distributing requests

### Vertical Scaling
1. Database optimization
2. Query indexing
3. Connection pooling

## Deployment

### Local Development
```bash
# Backend
cd backend
npm install
npm start

# Frontend
cd frontend
npm install
npm start
```

### Docker (Future)
```dockerfile
# Backend Dockerfile
FROM node:18
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## Testing Strategy

### Unit Testing
- Test rule engine conditions
- Test service methods
- Test route handlers

### Integration Testing
- Test API endpoints
- Test database operations
- Test workflow execution flow

### E2E Testing
- Test complete workflows
- Test UI interactions
- Test error scenarios

## Future Enhancements

1. **Parallel Branches** - Support parallel step execution
2. **Wait Nodes** - Add waiting/timeout nodes
3. **Webhooks** - Trigger external systems
4. **Variables** - Store and manipulate data between steps
5. **Sub-workflows** - Nest workflows within workflows
6. **Version Control** - Track workflow changes
7. **Analytics** - Execution metrics and reporting
8. **UI Builder** - Visual workflow designer
9. **Notifications** - Email, Slack, webhook notifications
10. **API Extensions** - Custom functions and integrations

## Monitoring & Logging

### Application Logs
- Execution logs in StepLog collection
- Error tracking in MongoDB
- Audit trail in AuditLog collection

### Recommended Monitoring
1. Application performance monitoring (APM)
2. Error tracking (Sentry, DataDog)
3. Database monitoring
4. API metrics (response time, throughput)
5. User activity analytics