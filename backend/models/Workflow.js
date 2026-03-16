const mongoose = require('mongoose');

const WorkflowSchema = new mongoose.Schema({
  name: { type: String, required: true },
  version: { type: Number, required: true },
  is_active: { type: Boolean, default: true },
  deleted_at: { type: Date },
  input_schema: { type: Object },
  start_step_id: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Workflow', WorkflowSchema);