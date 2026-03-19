const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/AuditLogController');

// Get audit logs with filtering and pagination
router.get('/', auditLogController.getAuditLogs);

// Create new audit log entry
router.post('/', auditLogController.createAuditLog);

module.exports = router;
