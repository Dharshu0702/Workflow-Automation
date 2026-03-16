-- Workflow Automation System PostgreSQL Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Workflows
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    version INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    input_schema JSONB,
    start_step_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Steps
CREATE TABLE steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    step_type VARCHAR(50) NOT NULL,
    "order" INTEGER NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rules
CREATE TABLE rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    step_id UUID REFERENCES steps(id) ON DELETE CASCADE,
    condition TEXT NOT NULL,
    next_step_id UUID,
    priority INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Executions
CREATE TABLE executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
    workflow_version INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    data JSONB,
    logs JSONB,
    current_step_id UUID,
    retries INTEGER DEFAULT 0,
    triggered_by VARCHAR(255),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP
);

-- Step Execution Logs
CREATE TABLE step_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    execution_id UUID REFERENCES executions(id) ON DELETE CASCADE,
    step_name VARCHAR(255),
    step_type VARCHAR(50),
    evaluated_rules JSONB,
    selected_next_step UUID,
    status VARCHAR(20),
    error_message TEXT,
    started_at TIMESTAMP,
    ended_at TIMESTAMP
);

-- Audit Log
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    execution_id UUID REFERENCES executions(id) ON DELETE CASCADE,
    workflow_id UUID,
    action VARCHAR(50),
    actor VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details JSONB
);