const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import middleware
const { generalLimiter, strictLimiter, executionLimiter, securityHeaders, corsOptions } = require('./middleware/security');

// Import routes
const workflowRoutes = require('./routes/workflowRoutes');
const stepRoutes = require('./routes/stepRoutes');
const ruleRoutes = require('./routes/ruleRoutes');
const executionRoutes = require('./routes/executionRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');

// Initialize Express app
const app = express();

// Security middleware
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(generalLimiter);
app.use(express.json({ limit: '10mb' })); // Limit request body size

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/workflow', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Routes with rate limiting
app.use('/workflows', generalLimiter, workflowRoutes);
app.use('/workflows/:workflow_id/steps', generalLimiter, stepRoutes);
app.use('/steps', generalLimiter, stepRoutes);
app.use('/steps/:step_id/rules', generalLimiter, ruleRoutes);
app.use('/rules', generalLimiter, ruleRoutes);
app.use('/executions', executionLimiter, executionRoutes);
app.use('/audit-logs', generalLimiter, auditLogRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'Internal server error' });
  } else {
    res.status(500).json({ 
      error: 'Something went wrong!', 
      details: err.message 
    });
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
