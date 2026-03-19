
const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB setup
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/workflow', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});


// Register routes
const authRoutes = require('./routes/authRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const stepRoutes = require('./routes/stepRoutes');
const ruleRoutes = require('./routes/ruleRoutes');
const executionRoutes = require('./routes/executionRoutes');

app.use('/auth', authRoutes);
app.use('/workflows', workflowRoutes);
app.use('/workflows/:workflow_id/steps', stepRoutes);
app.use('/steps/:step_id/rules', ruleRoutes);
app.use('/executions', executionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ message: 'Backend running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});





