const Workflow = require('../models/Workflow');

const createWorkflow = async (data) => {
  const workflow = new Workflow(data);
  return await workflow.save();
};

const getWorkflows = async () => {
  return await Workflow.find();
};

const getWorkflowById = async (id) => {
  return await Workflow.findById(id);
};

const updateWorkflow = async (id, data) => {
  return await Workflow.findByIdAndUpdate(id, data, { new: true });
};

const deleteWorkflow = async (id) => {
  return await Workflow.findByIdAndDelete(id);
};

module.exports = {
  createWorkflow,
  getWorkflows,
  getWorkflowById,
  updateWorkflow,
  deleteWorkflow
};