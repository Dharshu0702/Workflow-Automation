const mongoose = require('mongoose');

const RuleSchema = new mongoose.Schema({
  step_id: { type: String, required: true },
  condition: { type: String, required: true },
  next_step_id: { type: String },
  priority: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Rule', RuleSchema);
