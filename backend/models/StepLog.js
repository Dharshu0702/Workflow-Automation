const mongoose = require('mongoose');

const StepLogSchema = new mongoose.Schema({
  execution_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Execution', required: true },
  step_name: { type: String },
  step_type: { type: String },
  evaluated_rules: { type: Object },
  selected_next_step: { type: mongoose.Schema.Types.ObjectId, ref: 'Step' },
  status: { type: String },
  error_message: { type: String },
  started_at: { type: Date },
  ended_at: { type: Date }
});

module.exports = mongoose.model('StepLog', StepLogSchema);