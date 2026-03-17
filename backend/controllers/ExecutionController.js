const Execution = require('../models/Execution');
const Workflow = require('../models/Workflow');
const Step = require('../models/Step');
const Rule = require('../models/Rule');
const RuleEngine = require('../ruleEngine');

const createExecution = async (req, res) => {
  try {
    const { workflow_id, triggered_by = 'user' } = req.query;
    const executionData = req.body;
    
    // Get workflow details
    const workflow = await Workflow.findOne({ _id: workflow_id });
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    // Create execution
    const execution = new Execution({
      workflow_id: workflow_id,
      workflow_version: workflow.version,
      status: 'pending',
      data: executionData,
      triggered_by
    });

    const savedExecution = await execution.save();

    // Start execution asynchronously
    setImmediate(() => executeWorkflow(savedExecution._id));

    res.status(201).json({ execution: savedExecution });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const executeWorkflow = async (executionId) => {
  try {
    const execution = await Execution.findById(executionId);
    if (!execution) return;

    // Update status to in_progress
    execution.status = 'in_progress';
    await execution.save();

    const workflow = await Workflow.findOne({ _id: execution.workflow_id });
    if (!workflow) {
      execution.status = 'failed';
      execution.ended_at = new Date();
      await execution.save();
      return;
    }

    const logs = [];
    let currentStepId = workflow.start_step_id;
    let stepCount = 0;
    const maxSteps = 50; // Prevent infinite loops

    while (currentStepId && stepCount < maxSteps) {
      const step = await Step.findOne({ _id: currentStepId });
      if (!step) break;

      // Get rules for this step
      const rules = await Rule.find({ step_id: step._id }).sort({ priority: 1 });
      
      // Evaluate rules
      const ruleResult = await RuleEngine.evaluateRules(rules, execution.data, step._id);
      
      const stepLog = {
        step_name: step.name,
        step_type: step.step_type,
        evaluated_rules: ruleResult.evaluatedRules,
        selected_next_step: ruleResult.selectedNextStepId,
        status: 'completed',
        started_at: new Date(),
        ended_at: new Date()
      };

      logs.push(stepLog);
      currentStepId = ruleResult.selectedNextStepId;
      stepCount++;
    }

    // Update execution with logs and completion status
    execution.logs = logs;
    execution.status = 'completed';
    execution.ended_at = new Date();
    await execution.save();

  } catch (error) {
    const execution = await Execution.findById(executionId);
    if (execution) {
      execution.status = 'failed';
      execution.ended_at = new Date();
      await execution.save();
    }
  }
};

const getExecutions = async (req, res) => {
  try {
    const { workflow_id } = req.query;
    const filter = workflow_id ? { workflow_id } : {};
    const executions = await Execution.find(filter).sort({ started_at: -1 });
    res.json(executions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getExecution = async (req, res) => {
  try {
    const execution = await Execution.findById(req.params.id);
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }
    res.json(execution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const cancelExecution = async (req, res) => {
  try {
    const execution = await Execution.findByIdAndUpdate(
      req.params.id,
      { status: 'canceled', ended_at: new Date() },
      { new: true }
    );
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }
    res.json({ message: 'Execution canceled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const retryExecution = async (req, res) => {
  try {
    const execution = await Execution.findById(req.params.id);
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    // Reset execution status and retry
    execution.status = 'pending';
    execution.logs = [];
    execution.ended_at = null;
    execution.retries += 1;
    await execution.save();

    // Start execution again
    setImmediate(() => executeWorkflow(execution._id));

    res.json({ message: 'Execution retry started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createExecution,
  getExecutions,
  getExecution,
  cancelExecution,
  retryExecution
};
