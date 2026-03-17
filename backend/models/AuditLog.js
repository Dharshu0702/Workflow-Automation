const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  execution_id: { type: String, required: true },
  workflow_id: { type: String },
  action: { type: String },
  actor: { type: String },
  timestamp: { type: Date, default: Date.now },
  details: { type: Object }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
