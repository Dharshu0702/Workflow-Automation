const RuleService = require('../services/RuleService');

exports.create = async (req, res) => {
  try {
    const rule = await RuleService.createRule(req.params.step_id, req.body);
    res.status(201).json(rule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const rules = await RuleService.getRulesByStep(req.params.step_id);
    res.json(rules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const rule = await RuleService.getRuleById(req.params.id);
    if (!rule) return res.status(404).json({ error: 'Not found' });
    res.json(rule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const rule = await RuleService.updateRule(req.params.id, req.body);
    if (!rule) return res.status(404).json({ error: 'Not found' });
    res.json(rule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const rule = await RuleService.deleteRule(req.params.id);
    if (!rule) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};