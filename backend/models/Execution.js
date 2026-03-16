const mongoose = require('mongoose');

const ExecutionSchema = new mongoose.Schema({
  workflow_id: { type: String },
  workflow_version: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'failed', 'canceled'], required: true },
  data: { type: Object },
  logs: { type: Object },
  current_step_id: { type: String },
  retries: { type: Number, default: 0 },
  triggered_by: { type: String },
  started_at: { type: Date, default: Date.now },
  ended_at: { type: Date }
});

module.exports = mongoose.model('Execution', ExecutionSchema);