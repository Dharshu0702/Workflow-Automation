const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const workflowRoutes = require('./routes/workflowRoutes');
const stepRoutes = require('./routes/stepRoutes');
const ruleRoutes = require('./routes/ruleRoutes');
const executionRoutes = require('./routes/executionRoutes');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/workflow', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Routes
app.use('/workflows', workflowRoutes);
app.use('/workflows/:workflow_id/steps', stepRoutes);
app.use('/steps', stepRoutes);
app.use('/steps/:step_id/rules', ruleRoutes);
app.use('/rules', ruleRoutes);
app.use('/executions', executionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

module.exports = app;
