const mongoose = require('mongoose');

const StepLogSchema = new mongoose.Schema({
  execution_id: { type: String, required: true },
  step_name: { type: String },
  step_type: { type: String },
  evaluated_rules: { type: Object },
  selected_next_step: { type: String },
  status: { type: String },
  error_message: { type: String },
  started_at: { type: Date },
  ended_at: { type: Date }
});

module.exports = mongoose.model('StepLog', StepLogSchema);
