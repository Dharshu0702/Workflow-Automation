const RuleService = require('../services/RuleService');

const createRule = async (req, res) => {
  try {
    const rule = await RuleService.createRule({ ...req.body, step_id: req.params.step_id });
    res.status(201).json(rule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getRules = async (req, res) => {
  try {
    const rules = await RuleService.getRulesByStep(req.params.step_id);
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRule = async (req, res) => {
  try {
    const rule = await RuleService.getRuleById(req.params.id);
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }
    res.json(rule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateRule = async (req, res) => {
  try {
    const rule = await RuleService.updateRule(req.params.id, req.body);
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }
    res.json(rule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteRule = async (req, res) => {
  try {
    const rule = await RuleService.deleteRule(req.params.id);
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }
    res.json({ message: 'Rule deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createRule,
  getRules,
  getRule,
  updateRule,
  deleteRule
};
