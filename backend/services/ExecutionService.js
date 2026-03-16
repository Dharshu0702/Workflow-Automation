const Execution = require('../models/Execution');
const StepLog = require('../models/StepLog');
const AuditLog = require('../models/AuditLog');
const Workflow = require('../models/Workflow');
const Step = require('../models/Step');
const Rule = require('../models/Rule');
const RuleEngine = require('../ruleEngine');

const createExecution = async (workflowId, data, triggeredBy) => {
  const workflow = await Workflow.findById(workflowId);
  if (!workflow) throw new Error('Workflow not found');

  // Extract input_data from the request (data could be { workflow_id, input_data } or just input_data)
  const inputData = data.input_data || data;

  const execution = new Execution({
    workflow_id: workflowId,
    workflow_version: workflow.version,
    status: 'pending',
    data: inputData,  // Store only the input_data, not the entire request body
    logs: [],
    triggered_by: triggeredBy,
    current_step_id: workflow.start_step_id
  });

  return await execution.save();
};

const executeWorkflow = async (executionId) => {
  const execution = await Execution.findById(executionId);
  if (!execution) throw new Error('Execution not found');

  execution.status = 'in_progress';
  execution.started_at = new Date();
  await execution.save();

  const stepLogs = [];
  let currentStepId = execution.current_step_id;
  let hasError = false;
  let errorMessage = null;

  try {
    while (currentStepId) {
      const step = await Step.findById(currentStepId);
      if (!step) break;

      const stepStartTime = new Date();
      const rules = await Rule.find({ step_id: currentStepId });

      // Evaluate rules
      const { evaluatedRules, selectedNextStepId } = await RuleEngine.evaluateRules(
        rules,
        execution.data,
        currentStepId
      );

      const stepLog = new StepLog({
        execution_id: executionId,
        step_name: step.name,
        step_type: step.step_type,
        evaluated_rules: evaluatedRules,
        selected_next_step: selectedNextStepId,
        status: 'completed',
        started_at: stepStartTime,
        ended_at: new Date()
      });

      await stepLog.save();
      stepLogs.push(stepLog);

      // Log to audit
      await AuditLog.create({
        execution_id: executionId,
        workflow_id: execution.workflow_id,
        action: 'step_executed',
        actor: execution.triggered_by,
        details: {
          step_id: currentStepId,
          step_name: step.name,
          evaluated_rules: evaluatedRules
        }
      });

      // Move to next step
      currentStepId = selectedNextStepId;
    }

    execution.status = 'completed';
    execution.current_step_id = null;
  } catch (error) {
    execution.status = 'failed';
    errorMessage = error.message;
    hasError = true;
  }

  execution.ended_at = new Date();
  execution.logs = stepLogs.map(log => log.toObject());
  await execution.save();

  return {
    execution: execution.toObject(),
    stepLogs,
    error: hasError ? errorMessage : null
  };
};

const getExecution = async (id) => {
  return await Execution.findById(id).populate('workflow_id').populate('current_step_id');
};

const getExecutions = async (workflowId) => {
  if (workflowId) {
    return await Execution.find({ workflow_id: workflowId });
  }
  return await Execution.find();
};

const cancelExecution = async (id) => {
  const execution = await Execution.findById(id);
  if (!execution) throw new Error('Execution not found');
  if (execution.status === 'completed' || execution.status === 'failed' || execution.status === 'canceled') {
    throw new Error(`Cannot cancel execution with status: ${execution.status}`);
  }

  execution.status = 'canceled';
  execution.ended_at = new Date();
  return await execution.save();
};

const retryExecution = async (id) => {
  const execution = await Execution.findById(id);
  if (!execution) throw new Error('Execution not found');
  if (execution.status !== 'failed') {
    throw new Error('Can only retry failed executions');
  }

  execution.status = 'pending';
  execution.retries = (execution.retries || 0) + 1;
  execution.logs = [];
  execution.ended_at = null;

  const workflow = await Workflow.findById(execution.workflow_id);
  execution.current_step_id = workflow.start_step_id;

  return await execution.save();
};

module.exports = {
  createExecution,
  executeWorkflow,
  getExecution,
  getExecutions,
  cancelExecution,
  retryExecution
};