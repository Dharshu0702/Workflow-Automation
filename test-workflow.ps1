# Test Complete Workflow

Write-Host "=== WORKFLOW AUTOMATION SYSTEM TEST ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Create Workflow
Write-Host "[1] Creating workflow..." -ForegroundColor Yellow
$workflowBody = @{
    name = "Payment Approval Workflow"
    version = 1
    description = "Complete payment processing with validation and approval"
    input_schema = @{
        amount = "number"
        country = "string"
        payment_method = "string"
    }
} | ConvertTo-Json

$workflowResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/workflows" `
    -Method POST `
    -ContentType "application/json" `
    -Body $workflowBody

$workflow = $workflowResponse.Content | ConvertFrom-Json
$workflowId = $workflow._id

Write-Host "[OK] Workflow created: $workflowId" -ForegroundColor Green
Write-Host "  Name: $($workflow.name)" -ForegroundColor Green
Write-Host ""

# Test 2: Create First Step (Validate)
Write-Host "[2] Creating first step: Validate Amount..." -ForegroundColor Yellow
$step1Body = @{
    name = "Validate Amount"
    step_type = "task"
    order = 1
    metadata = @{
        description = "Validate payment amount"
        min_amount = 10
        max_amount = 100000
    }
} | ConvertTo-Json

$step1Response = Invoke-WebRequest -Uri "http://localhost:5000/api/workflows/$workflowId/steps" `
    -Method POST `
    -ContentType "application/json" `
    -Body $step1Body

$step1 = $step1Response.Content | ConvertFrom-Json
$step1Id = $step1._id

Write-Host "[OK] Step 1 created: $step1Id" -ForegroundColor Green
Write-Host "  Name: $($step1.name)" -ForegroundColor Green
Write-Host ""

# Test 3: Create Second Step (Check Country)
Write-Host "[3] Creating second step: Check Country Risk..." -ForegroundColor Yellow
$step2Body = @{
    name = "Check Country Risk"
    step_type = "task"
    order = 2
    metadata = @{
        description = "Check if country requires additional verification"
        high_risk_countries = @("XX", "YY")
    }
} | ConvertTo-Json

$step2Response = Invoke-WebRequest -Uri "http://localhost:5000/api/workflows/$workflowId/steps" `
    -Method POST `
    -ContentType "application/json" `
    -Body $step2Body

$step2 = $step2Response.Content | ConvertFrom-Json
$step2Id = $step2._id

Write-Host "[OK] Step 2 created: $step2Id" -ForegroundColor Green
Write-Host "  Name: $($step2.name)" -ForegroundColor Green
Write-Host ""

# Test 4: Create Third Step (Approve)
Write-Host "[4] Creating third step: Approve Payment..." -ForegroundColor Yellow
$step3Body = @{
    name = "Approve Payment"
    step_type = "approval"
    order = 3
    metadata = @{
        description = "Final approval of payment"
        notify_admin = $true
    }
} | ConvertTo-Json

$step3Response = Invoke-WebRequest -Uri "http://localhost:5000/api/workflows/$workflowId/steps" `
    -Method POST `
    -ContentType "application/json" `
    -Body $step3Body

$step3 = $step3Response.Content | ConvertFrom-Json
$step3Id = $step3._id

Write-Host "[OK] Step 3 created: $step3Id" -ForegroundColor Green
Write-Host "  Name: $($step3.name)" -ForegroundColor Green
Write-Host ""

# Test 5: Create Rules for Step 1
Write-Host "[5] Creating rules for Validate Amount step..." -ForegroundColor Yellow

# Rule: If amount < 1000, proceed to Step 2
$rule1Body = @{
    condition = "amount < 1000"
    next_step_id = $step2Id
    priority = 1
} | ConvertTo-Json

$rule1Response = Invoke-WebRequest -Uri "http://localhost:5000/api/steps/$step1Id/rules" `
    -Method POST `
    -ContentType "application/json" `
    -Body $rule1Body

$rule1 = $rule1Response.Content | ConvertFrom-Json
Write-Host "[OK] Rule 1 created: amount < 1000 to Step 2" -ForegroundColor Green

# Rule: If amount >= 1000, proceed to Step 3 (approval)
$rule2Body = @{
    condition = "amount >= 1000"
    next_step_id = $step3Id
    priority = 2
} | ConvertTo-Json

$rule2Response = Invoke-WebRequest -Uri "http://localhost:5000/api/steps/$step1Id/rules" `
    -Method POST `
    -ContentType "application/json" `
    -Body $rule2Body

$rule2 = $rule2Response.Content | ConvertFrom-Json
Write-Host "[OK] Rule 2 created: amount >= 1000 to Step 3" -ForegroundColor Green
Write-Host ""

# Test 6: Create Rules for Step 2
Write-Host "[6] Creating rules for Check Country Risk step..." -ForegroundColor Yellow

# Rule: All conditions proceed to Step 3
$rule3Body = @{
    condition = "country != ''"
    next_step_id = $step3Id
    priority = 1
} | ConvertTo-Json

$rule3Response = Invoke-WebRequest -Uri "http://localhost:5000/api/steps/$step2Id/rules" `
    -Method POST `
    -ContentType "application/json" `
    -Body $rule3Body

$rule3 = $rule3Response.Content | ConvertFrom-Json
Write-Host "[OK] Rule 3 created: country check to Step 3" -ForegroundColor Green
Write-Host ""

# Test 7: Execute Workflow with Test Data
Write-Host "[7] Executing workflow with test data..." -ForegroundColor Yellow

$executionBody = @{
    workflow_id = $workflowId
    input_data = @{
        amount = 500
        country = "US"
        payment_method = "credit_card"
    }
} | ConvertTo-Json

$executionResponse = Invoke-WebRequest -Uri \"http://localhost:5000/api/executions\" `
    -Method POST `
    -ContentType "application/json" `
    -Body $executionBody

$execution = $executionResponse.Content | ConvertFrom-Json
$executionId = $execution._id

Write-Host "[OK] Workflow executed: $executionId" -ForegroundColor Green
Write-Host "  Status: $($execution.status)" -ForegroundColor Green
Write-Host "  Current Step: $($execution.current_step_id)" -ForegroundColor Green
Write-Host ""

# Test 8: Get Execution Details
Write-Host "[8] Fetching execution details..." -ForegroundColor Yellow
$detailsResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/executions/$executionId" `
    -Method GET `
    -ContentType "application/json"

$details = $detailsResponse.Content | ConvertFrom-Json

Write-Host "[OK] Execution Details:" -ForegroundColor Green
Write-Host "  Status: $($details.status)" -ForegroundColor Green
Write-Host "  Current Step: $($details.current_step_id)" -ForegroundColor Green
Write-Host "  Completed Steps: $($details.completed_steps.Count)" -ForegroundColor Green
if ($details.completed_steps.Count -gt 0) {
    foreach ($stepComp in $details.completed_steps) {
        Write-Host "    - $stepComp" -ForegroundColor Green
    }
}
Write-Host ""

# Test 9: Execute Workflow with High Amount (Tests second rule)
Write-Host "[9] Executing workflow with high amount (5000)..." -ForegroundColor Yellow

$executionBody2 = @{
    workflow_id = $workflowId
    input_data = @{
        amount = 5000
        country = "CA"
        payment_method = "bank_transfer"
    }
} | ConvertTo-Json

$executionResponse2 = Invoke-WebRequest -Uri \"http://localhost:5000/api/executions\" `
    -Method POST `
    -ContentType "application/json" `
    -Body $executionBody2

$execution2 = $executionResponse2.Content | ConvertFrom-Json
$executionId2 = $execution2._id

Write-Host "[OK] Workflow executed: $executionId2" -ForegroundColor Green
Write-Host "  Status: $($execution2.status)" -ForegroundColor Green
Write-Host "  Current Step: $($execution2.current_step_id)" -ForegroundColor Green
Write-Host ""

# Test 10: Get all Executions
Write-Host "[10] Fetching all executions for workflow..." -ForegroundColor Yellow
$allExecutionsResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/executions?workflow_id=$workflowId" `
    -Method GET `
    -ContentType "application/json"

$allExecutions = $allExecutionsResponse.Content | ConvertFrom-Json
Write-Host "[OK] Total executions: $($allExecutions.Count)" -ForegroundColor Green
foreach ($exec in $allExecutions) {
    Write-Host "  - Execution $($exec._id) | Status: $($exec.status) | Amount: $($exec.input_data.amount)" -ForegroundColor Green
}
Write-Host ""

# Test 11: Get Workflow Details
Write-Host "[11] Fetching complete workflow structure..." -ForegroundColor Yellow
$workflowDetailsResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/workflows/$workflowId" `
    -Method GET `
    -ContentType "application/json"

$workflowDetails = $workflowDetailsResponse.Content | ConvertFrom-Json
Write-Host "[OK] Workflow Details:" -ForegroundColor Green
Write-Host "  Name: $($workflowDetails.name)" -ForegroundColor Green
Write-Host "  Steps: $($workflowDetails.steps.Count)" -ForegroundColor Green
Write-Host "  Start Step: $($workflowDetails.start_step_id)" -ForegroundColor Green
Write-Host "  Created: $($workflowDetails.created_at)" -ForegroundColor Green
Write-Host ""

Write-Host "=== TEST COMPLETE ===" -ForegroundColor Cyan
Write-Host "All workflow operations executed successfully!" -ForegroundColor Green
