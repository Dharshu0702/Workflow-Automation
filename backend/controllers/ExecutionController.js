const ExecutionService = require('../services/ExecutionService');

exports.create = async (req, res) => {
  try {
    const execution = await ExecutionService.createExecution(
      req.params.workflow_id,
      req.body,
      req.query.triggered_by || 'system'
    );
    res.status(201).json(execution);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.createAndExecute = async (req, res) => {
  try {
    // Get workflow_id from route params or request body
    const workflow_id = req.params.workflow_id || req.body.workflow_id;
    
    if (!workflow_id) {
      return res.status(400).json({ error: 'workflow_id is required' });
    }

    // Create execution record
    const execution = await ExecutionService.createExecution(
      workflow_id,
      req.body,
      req.query.triggered_by || 'system'
    );

    // Immediately execute the workflow
    const result = await ExecutionService.executeWorkflow(execution._id);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.execute = async (req, res) => {
  try {
    const result = await ExecutionService.executeWorkflow(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const execution = await ExecutionService.getExecution(req.params.id);
    if (!execution) return res.status(404).json({ error: 'Not found' });
    res.json(execution);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const executions = await ExecutionService.getExecutions(req.query.workflow_id);
    res.json(executions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cancel = async (req, res) => {
  try {
    const execution = await ExecutionService.cancelExecution(req.params.id);
    res.json(execution);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.retry = async (req, res) => {
  try {
    const execution = await ExecutionService.retryExecution(req.params.id);
    res.json(execution);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};