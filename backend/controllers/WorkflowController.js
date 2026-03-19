const WorkflowService = require('../services/WorkflowService');

exports.create = async (req, res) => {
  try {
    const workflow = await WorkflowService.createWorkflow(req.body);
    res.status(201).json(workflow);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const workflows = await WorkflowService.getWorkflows();
    res.json(workflows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const workflow = await WorkflowService.getWorkflowById(req.params.id);
    if (!workflow) return res.status(404).json({ error: 'Not found' });
    res.json(workflow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const workflow = await WorkflowService.updateWorkflow(req.params.id, req.body);
    if (!workflow) return res.status(404).json({ error: 'Not found' });
    res.json(workflow);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const workflow = await WorkflowService.deleteWorkflow(req.params.id);
    if (!workflow) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};