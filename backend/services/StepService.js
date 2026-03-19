const Step = require('../models/Step');
const Workflow = require('../models/Workflow');

const createStep = async (workflowId, data) => {
  const step = new Step({ workflow_id: workflowId, ...data });
  const savedStep = await step.save();

  // If this is the first step, set it as the start step
  const workflow = await Workflow.findById(workflowId);
  if (!workflow.start_step_id) {
    workflow.start_step_id = savedStep._id;
    await workflow.save();
  }

  return savedStep;
};

const getStepsByWorkflow = async (workflowId) => {
  return await Step.find({ workflow_id: workflowId }).sort({ order: 1 });
};

const getStepById = async (id) => {
  return await Step.findById(id);
};

const updateStep = async (id, data) => {
  return await Step.findByIdAndUpdate(id, { ...data, updated_at: new Date() }, { new: true });
};

const deleteStep = async (id) => {
  return await Step.findByIdAndDelete(id);
};

module.exports = {
  createStep,
  getStepsByWorkflow,
  getStepById,
  updateStep,
  deleteStep
};