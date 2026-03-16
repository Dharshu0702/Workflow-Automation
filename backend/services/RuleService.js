const Rule = require('../models/Rule');

const createRule = async (stepId, data) => {
  const rule = new Rule({ step_id: stepId, ...data });
  return await rule.save();
};

const getRulesByStep = async (stepId) => {
  return await Rule.find({ step_id: stepId }).sort({ priority: 1 });
};

const getRuleById = async (id) => {
  return await Rule.findById(id);
};

const updateRule = async (id, data) => {
  return await Rule.findByIdAndUpdate(id, { ...data, updated_at: new Date() }, { new: true });
};

const deleteRule = async (id) => {
  return await Rule.findByIdAndDelete(id);
};

module.exports = {
  createRule,
  getRulesByStep,
  getRuleById,
  updateRule,
  deleteRule
};