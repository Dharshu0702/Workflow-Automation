// Input validation middleware for API endpoints
const validateInput = (schema) => {
  return (req, res, next) => {
    const errors = [];
    
    // Validate workflow data
    if (schema === 'workflow') {
      if (!req.body.name || req.body.name.trim() === '') {
        errors.push('Workflow name is required');
      }
      if (!req.body.version || req.body.version < 1) {
        errors.push('Version must be at least 1');
      }
      if (req.body.name && req.body.name.length > 100) {
        errors.push('Workflow name must be less than 100 characters');
      }
      if (req.body.input_schema && typeof req.body.input_schema !== 'object') {
        errors.push('Input schema must be a valid JSON object');
      }
    }
    
    // Validate step data
    if (schema === 'step') {
      if (!req.body.name || req.body.name.trim() === '') {
        errors.push('Step name is required');
      }
      if (!req.body.step_type || !['task', 'approval', 'notification'].includes(req.body.step_type)) {
        errors.push('Step type must be task, approval, or notification');
      }
      if (!req.body.order || req.body.order < 1) {
        errors.push('Step order must be a positive number');
      }
      if (req.body.name && req.body.name.length > 100) {
        errors.push('Step name must be less than 100 characters');
      }
    }
    
    // Validate rule data
    if (schema === 'rule') {
      if (!req.body.step_id) {
        errors.push('Step ID is required');
      }
      if (!req.body.condition || req.body.condition.trim() === '') {
        errors.push('Rule condition is required');
      }
      if (!req.body.priority || req.body.priority < 1) {
        errors.push('Rule priority must be a positive number');
      }
      if (req.body.priority && req.body.priority > 99) {
        errors.push('Rule priority must be less than 100');
      }
      // Basic condition validation
      if (req.body.condition && !isValidCondition(req.body.condition)) {
        errors.push('Invalid rule condition syntax');
      }
    }
    
    // Validate execution data
    if (schema === 'execution') {
      if (!req.body.workflow_id) {
        errors.push('Workflow ID is required');
      }
      if (!req.body.input_data || typeof req.body.input_data !== 'object') {
        errors.push('Input data must be a valid JSON object');
      }
      if (!req.body.initiated_by || req.body.initiated_by.trim() === '') {
        errors.push('Initiated by field is required');
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors 
      });
    }
    
    next();
  };
};

// Basic condition validation
function isValidCondition(condition) {
  if (condition === 'DEFAULT') return true;
  
  // Check for dangerous patterns
  const dangerousPatterns = [
    /eval\s*\(/,
    /Function\s*\(/,
    /require\s*\(/,
    /import\s+/,
    /process\./,
    /global\./,
    /__dirname/,
    /__filename/
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(condition)) {
      return false;
    }
  }
  
  // Basic syntax check
  try {
    new Function(`return ${condition}`);
    return true;
  } catch {
    return false;
  }
}

module.exports = { validateInput };
