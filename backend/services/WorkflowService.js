const Workflow = require('../models/Workflow');
const Step = require('../models/Step');

const createWorkflow = async (data) => {
  try {
    const workflow = new Workflow(data);
    return await workflow.save();
  } catch (error) {
    if (error.name === 'ValidationError') {
      throw new Error(`Validation Error: ${Object.values(error.errors).map(e => e.message).join(', ')}`);
    } else if (error.code === 11000) {
      throw new Error('Workflow with this name already exists');
    } else {
      throw new Error(`Failed to create workflow: ${error.message}`);
    }
  }
};

const getWorkflows = async (page = 1, limit = 50, filter = {}) => {
  try {
    const skip = (page - 1) * limit;
    const query = { ...filter, deleted_at: null };
    
    const workflows = await Workflow.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
      
    const total = await Workflow.countDocuments(query);
    
    return {
      workflows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw new Error(`Failed to fetch workflows: ${error.message}`);
  }
};

const getWorkflowById = async (id) => {
  try {
    if (!id || id.toString().length !== 24) {
      throw new Error('Invalid workflow ID format');
    }
    
    const workflow = await Workflow.findById(id).lean();
    if (!workflow) {
      throw new Error('Workflow not found');
    }
    
    if (workflow.deleted_at) {
      throw new Error('Workflow has been deleted');
    }
    
    return workflow;
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('deleted')) {
      throw error;
    }
    throw new Error(`Failed to fetch workflow: ${error.message}`);
  }
};

const updateWorkflow = async (id, data) => {
  try {
    if (!id || id.toString().length !== 24) {
      throw new Error('Invalid workflow ID format');
    }
    
    // Add updated timestamp
    data.updated_at = new Date();
    
    const workflow = await Workflow.findByIdAndUpdate(
      id, 
      data, 
      { new: true, runValidators: true }
    );
    
    if (!workflow) {
      throw new Error('Workflow not found');
    }
    
    return workflow;
  } catch (error) {
    if (error.name === 'ValidationError') {
      throw new Error(`Validation Error: ${Object.values(error.errors).map(e => e.message).join(', ')}`);
    } else if (error.message.includes('not found')) {
      throw error;
    } else {
      throw new Error(`Failed to update workflow: ${error.message}`);
    }
  }
};

const deleteWorkflow = async (id) => {
  try {
    if (!id || id.toString().length !== 24) {
      throw new Error('Invalid workflow ID format');
    }
    
    const workflow = await Workflow.findByIdAndUpdate(id, { 
      is_active: false, 
      deleted_at: new Date(),
      updated_at: new Date()
    }, { new: true });
    
    if (!workflow) {
      throw new Error('Workflow not found');
    }
    
    // Soft delete associated steps
    await Step.updateMany(
      { workflow_id: id },
      { deleted_at: new Date(), updated_at: new Date() }
    );
    
    return workflow;
  } catch (error) {
    if (error.message.includes('not found')) {
      throw error;
    }
    throw new Error(`Failed to delete workflow: ${error.message}`);
  }
};

module.exports = {
  createWorkflow,
  getWorkflows,
  getWorkflowById,
  updateWorkflow,
  deleteWorkflow
};
