const WorkflowService = require('../services/WorkflowService');

const createWorkflow = async (req, res) => {
  try {
    const workflow = await WorkflowService.createWorkflow(req.body);
    res.status(201).json(workflow);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getWorkflows = async (req, res) => {
  try {
    const workflows = await WorkflowService.getWorkflows();
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getWorkflow = async (req, res) => {
  try {
    const workflow = await WorkflowService.getWorkflowById(req.params.id);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    res.json(workflow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateWorkflow = async (req, res) => {
  try {
    const workflow = await WorkflowService.updateWorkflow(req.params.id, req.body);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    res.json(workflow);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteWorkflow = async (req, res) => {
  try {
    const workflow = await WorkflowService.deleteWorkflow(req.params.id);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    res.json({ message: 'Workflow deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createWorkflow,
  getWorkflows,
  getWorkflow,
  updateWorkflow,
  deleteWorkflow
};
