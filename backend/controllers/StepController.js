const StepService = require('../services/StepService');

const createStep = async (req, res) => {
  try {
    const step = await StepService.createStep(req.params.workflow_id, req.body);
    res.status(201).json(step);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getSteps = async (req, res) => {
  try {
    const steps = await StepService.getStepsByWorkflow(req.params.workflow_id);
    res.json(steps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStep = async (req, res) => {
  try {
    const step = await StepService.getStepById(req.params.id);
    if (!step) {
      return res.status(404).json({ error: 'Step not found' });
    }
    res.json(step);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateStep = async (req, res) => {
  try {
    const step = await StepService.updateStep(req.params.id, req.body);
    if (!step) {
      return res.status(404).json({ error: 'Step not found' });
    }
    res.json(step);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteStep = async (req, res) => {
  try {
    const step = await StepService.deleteStep(req.params.id);
    if (!step) {
      return res.status(404).json({ error: 'Step not found' });
    }
    res.json({ message: 'Step deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createStep,
  getSteps,
  getStep,
  updateStep,
  deleteStep
};
