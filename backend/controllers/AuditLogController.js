const AuditLog = require('../models/AuditLog');

const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, workflow_id, action, actor } = req.query;
    
    // Build filter
    const filter = {};
    if (workflow_id) {
      filter.workflow_id = workflow_id;
    }
    if (action) {
      filter.action = action;
    }
    if (actor) {
      filter.actor = actor;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    const auditLogs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await AuditLog.countDocuments(filter);
    
    res.json({
      auditLogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};

const createAuditLog = async (req, res) => {
  try {
    const auditLog = new AuditLog(req.body);
    await auditLog.save();
    res.status(201).json(auditLog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAuditLogs,
  createAuditLog
};
