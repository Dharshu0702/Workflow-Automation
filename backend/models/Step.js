const mongoose = require('mongoose');

const StepSchema = new mongoose.Schema({
  workflow_id: { type: String, required: true },
  name: { type: String, required: true },
  step_type: { type: String, enum: ['task', 'approval', 'notification'], required: true },
  order: { type: Number, required: true },
  metadata: { type: Object },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Step', StepSchema);
