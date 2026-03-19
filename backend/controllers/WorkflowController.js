const WorkflowService = require('../services/WorkflowService');
const { validateInput } = require('../middleware/validation');

const createWorkflow = async (req, res) => {
  try {
    const workflow = await WorkflowService.createWorkflow(req.body);
    res.status(201).json(workflow);
  } catch (error) {
    if (error.message.includes('Validation Error')) {
      res.status(400).json({ error: error.message });
    } else if (error.message.includes('already exists')) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

const getWorkflows = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const filter = {};
    
    if (req.query.is_active !== undefined) {
      filter.is_active = req.query.is_active === 'true';
    }
    
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }
    
    const result = await WorkflowService.getWorkflows(page, limit, filter);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workflows' });
  }
};

const getWorkflow = async (req, res) => {
  try {
    const workflow = await WorkflowService.getWorkflowById(req.params.id);
    res.json(workflow);
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('deleted')) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes('Invalid workflow ID')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch workflow' });
    }
  }
};

const updateWorkflow = async (req, res) => {
  try {
    const workflow = await WorkflowService.updateWorkflow(req.params.id, req.body);
    res.json(workflow);
  } catch (error) {
    if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes('Invalid workflow ID')) {
      res.status(400).json({ error: error.message });
    } else if (error.message.includes('Validation Error')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update workflow' });
    }
  }
};

const deleteWorkflow = async (req, res) => {
  try {
    const workflow = await WorkflowService.deleteWorkflow(req.params.id);
    res.json({ 
      message: 'Workflow deleted successfully',
      workflow: workflow 
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes('Invalid workflow ID')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to delete workflow' });
    }
  }
};

module.exports = {
  createWorkflow: [validateInput('workflow'), createWorkflow],
  getWorkflows: getWorkflows,
  getWorkflow: getWorkflow,
  updateWorkflow: [validateInput('workflow'), updateWorkflow],
  deleteWorkflow: deleteWorkflow
};
