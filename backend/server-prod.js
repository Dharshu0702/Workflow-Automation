const mongoose = require('mongoose');

// MongoDB Atlas connection (production)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/workflow', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
