const StepService = require('../services/StepService');

exports.create = async (req, res) => {
  try {
    const step = await StepService.createStep(req.params.workflow_id, req.body);
    res.status(201).json(step);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const steps = await StepService.getStepsByWorkflow(req.params.workflow_id);
    res.json(steps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const step = await StepService.getStepById(req.params.id);
    if (!step) return res.status(404).json({ error: 'Not found' });
    res.json(step);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const step = await StepService.updateStep(req.params.id, req.body);
    if (!step) return res.status(404).json({ error: 'Not found' });
    res.json(step);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const step = await StepService.deleteStep(req.params.id);
    if (!step) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};