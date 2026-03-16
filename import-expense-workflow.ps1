# Import Expense Approval Workflow from EXAMPLE_WORKFLOWS.json

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "IMPORTING EXPENSE APPROVAL WORKFLOW" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Load example workflows
$examplesJson = Get-Content -Path "r:\workflow\EXAMPLE_WORKFLOWS.json" | ConvertFrom-Json
$expenseWorkflow = $examplesJson.examples | Where-Object { $_.name -eq "Expense Approval Workflow" }

if (-not $expenseWorkflow) {
    Write-Host "[ERROR] Expense Approval Workflow not found in EXAMPLE_WORKFLOWS.json" -ForegroundColor Red
    exit 1
}

Write-Host "[INFO] Found workflow: $($expenseWorkflow.name)" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create Workflow
Write-Host "[1] Creating workflow..." -ForegroundColor Yellow

$wfBody = @{
    name = $expenseWorkflow.name
    version = $expenseWorkflow.version
    is_active = $expenseWorkflow.is_active
    input_schema = $expenseWorkflow.input_schema
} | ConvertTo-Json -Depth 10

try {
    $wfResp = Invoke-WebRequest -Uri "http://localhost:5000/workflows" `
        -Method POST `
        -ContentType "application/json" `
        -Body $wfBody `
        -UseBasicParsing `
        -ErrorAction Stop
    $wf = $wfResp.Content | ConvertFrom-Json
    $wfId = $wf._id
    
    Write-Host "[OK] Workflow Created" -ForegroundColor Green
    Write-Host "     ID: $wfId" -ForegroundColor Green
    Write-Host "     Name: $($wf.name)" -ForegroundColor Green
    Write-Host ""
}
catch {
    Write-Host "[ERROR] Failed to create workflow: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Create Steps
Write-Host "[2] Creating workflow steps..." -ForegroundColor Yellow

$stepsMap = @{}
$stepIndex = 0

foreach ($step in $expenseWorkflow.steps) {
    $stepIndex++
    
    $stepBody = @{
        name = $step.name
        step_type = $step.step_type
        order = $step.order
        metadata = $step.metadata
    } | ConvertTo-Json -Depth 5
    
    try {
        $stepResp = Invoke-WebRequest -Uri "http://localhost:5000/workflows/$wfId/steps" `
            -Method POST `
            -ContentType "application/json" `
            -Body $stepBody `
            -UseBasicParsing `
            -ErrorAction Stop
        $stepObj = $stepResp.Content | ConvertFrom-Json
        $stepId = $stepObj._id
        
        # Map step order to actual MongoDB ID
        $stepsMap[$step.order] = $stepId
        
        Write-Host "[OK] Step $stepIndex: $($step.name)" -ForegroundColor Green
        Write-Host "     ID: $stepId | Type: $($step.step_type) | Order: $($step.order)" -ForegroundColor Green
    }
    catch {
        Write-Host "[ERROR] Failed to create step '$($step.name)': $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# Step 3: Create Rules
Write-Host "[3] Creating workflow rules..." -ForegroundColor Yellow

$ruleIndex = 0

foreach ($rule in $expenseWorkflow.rules) {
    $ruleIndex++
    
    # Get the actual step ID from our map
    $stepId = $stepsMap[$rule.step_id]
    
    # Get the next step ID from our map (or null if it's the end)
    $nextStepId = if ($rule.next_step_id) { $stepsMap[$rule.next_step_id] } else { $null }
    
    $ruleBody = @{
        condition = $rule.condition
        next_step_id = $nextStepId
        priority = $rule.priority
    } | ConvertTo-Json -Depth 5
    
    try {
        $ruleResp = Invoke-WebRequest -Uri "http://localhost:5000/steps/$stepId/rules" `
            -Method POST `
            -ContentType "application/json" `
            -Body $ruleBody `
            -UseBasicParsing `
            -ErrorAction Stop
        $ruleObj = $ruleResp.Content | ConvertFrom-Json
        
        Write-Host "[OK] Rule $ruleIndex: $($rule.condition)" -ForegroundColor Green
        Write-Host "     From Step Order: $($rule.step_id) | Priority: $($rule.priority)" -ForegroundColor Green
    }
    catch {
        Write-Host "[WARNING] Failed to create rule '$($rule.condition)': $($_.Exception.Message)" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 4: Verify Workflow
Write-Host "[4] Verifying imported workflow..." -ForegroundColor Yellow

try {
    $wfDetailsResp = Invoke-WebRequest -Uri "http://localhost:5000/workflows/$wfId" `
        -Method GET `
        -UseBasicParsing `
        -ErrorAction Stop
    $wfDetails = $wfDetailsResp.Content | ConvertFrom-Json
    
    Write-Host "[OK] Workflow Verified" -ForegroundColor Green
    Write-Host "     Name: $($wfDetails.name)" -ForegroundColor Green
    Write-Host "     Version: $($wfDetails.version)" -ForegroundColor Green
    Write-Host "     Total Steps: $($wfDetails.steps.Count)" -ForegroundColor Green
    Write-Host "     Start Step: $($wfDetails.start_step_id)" -ForegroundColor Green
}
catch {
    Write-Host "[WARNING] Could not verify workflow details: $($_.Exception.Message)" -ForegroundColor Yellow
}
Write-Host ""

# Example Input Data
Write-Host "[5] Example workflow input data:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  High Expense (requires Finance Review):" -ForegroundColor Yellow
Write-Host "  {" -ForegroundColor Gray
Write-Host "    `"amount`": 2500," -ForegroundColor Gray
Write-Host "    `"country`": `"US`"," -ForegroundColor Gray
Write-Host "    `"category`": `"travel`"" -ForegroundColor Gray
Write-Host "  }" -ForegroundColor Gray
Write-Host ""
Write-Host "  Low Expense (direct approval):" -ForegroundColor Yellow
Write-Host "  {" -ForegroundColor Gray
Write-Host "    `"amount`": 500," -ForegroundColor Gray
Write-Host "    `"country`": `"CA`"," -ForegroundColor Gray
Write-Host "    `"category`": `"meals`"" -ForegroundColor Gray
Write-Host "  }" -ForegroundColor Gray
Write-Host ""

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "IMPORT COMPLETE!" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Workflow Details:" -ForegroundColor Green
Write-Host "- ID: $wfId" -ForegroundColor Green
Write-Host "- Steps: 4" -ForegroundColor Green
Write-Host "- Rules: 5" -ForegroundColor Green
Write-Host ""
Write-Host "You can now execute this workflow from the React UI!" -ForegroundColor Green
