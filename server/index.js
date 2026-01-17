const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
  });

// Import routes
const authRouter = require('./routes/auth');
const projectsRouter = require('./routes/projects');
const clientsRouter = require('./routes/clients');

// Routes
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/clients', clientsRouter);

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Dev Manager API is running!',
    version: '1.0.0',
    endpoints: [
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET  /api/auth/profile',
      'GET  /api/projects',
      'GET  /api/clients'
    ]
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    port: port
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});