const mongoose = require('mongoose');

const WorkflowSchema = new mongoose.Schema({
  name: { type: String, required: true },
  version: { type: Number, required: true },
  is_active: { type: Boolean, default: true },
  input_schema: { type: Object },
  start_step_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Step' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Workflow', WorkflowSchema);