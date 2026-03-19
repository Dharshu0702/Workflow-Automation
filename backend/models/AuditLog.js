const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  execution_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Execution', required: true },
  workflow_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow' },
  action: { type: String },
  actor: { type: String },
  timestamp: { type: Date, default: Date.now },
  details: { type: Object }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);