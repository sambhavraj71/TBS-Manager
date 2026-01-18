const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// CORS
app.use(cors({
  origin: '*',
  credentials: true,
}));

app.use(express.json());

// MongoDB Connection
console.log('🚀 Starting TBS Manager Backend...');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dev_manager';
    
    console.log('🔗 Connecting to MongoDB...');
    
    // SIMPLE CONNECTION
    await mongoose.connect(mongoURI);
    
    console.log('✅ MongoDB Connected!');
    
    // Create admin if doesn't exist
    createAdminUser();
    
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    console.log('⚠️  Running without database connection');
  }
};

// Create admin user
async function createAdminUser() {
  try {
    const bcrypt = require('bcryptjs');
    
    // User Schema
    const UserSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String
    });
    
    const User = mongoose.model('User', UserSchema);
    
    const admin = await User.findOne({ email: 'admin@devmanager.com' });
    
    if (!admin) {
      console.log('👑 Creating admin user...');
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const newAdmin = new User({
        name: 'Admin',
        email: 'admin@devmanager.com',
        password: hashedPassword,
        role: 'admin'
      });
      
      await newAdmin.save();
      console.log('✅ Admin created');
    }
    
  } catch (error) {
    console.log('⚠️  Could not create admin:', error.message);
  }
}

connectDB();

// ========== ROUTES ==========

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    service: 'Dev Manager API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    port: port,
    login_test: 'Use POST /api/auth/login with admin@devmanager.com / admin123'
  });
});

// Login route - WORKING VERSION
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt for:', req.body.email);
    
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Try database first
    if (mongoose.connection.readyState === 1) {
      try {
        const bcrypt = require('bcryptjs');
        const jwt = require('jsonwebtoken');
        
        // User model
        const User = mongoose.model('User');
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (user) {
          // Check password
          const isMatch = await bcrypt.compare(password, user.password);
          
          if (isMatch) {
            // Create token
            const token = jwt.sign(
              { userId: user._id },
              process.env.JWT_SECRET || 'dev-secret-key',
              { expiresIn: '7d' }
            );
            
            return res.json({
              token,
              user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
              }
            });
          }
        }
      } catch (dbError) {
        console.log('Database login failed:', dbError.message);
      }
    }
    
    // Fallback: Hardcoded users
    console.log('🔄 Using fallback login');
    
    if (email === 'admin@devmanager.com' && password === 'admin123') {
      return res.json({
        token: 'jwt-token-admin-' + Date.now(),
        user: {
          id: 'admin-001',
          name: 'Admin',
          email: 'admin@devmanager.com',
          role: 'admin',
          employeeId: 'ADM001'
        }
      });
    }
    
    if (email === 'employee@devmanager.com' && password === 'employee123') {
      return res.json({
        token: 'jwt-token-emp-' + Date.now(),
        user: {
          id: 'emp-001',
          name: 'Employee',
          email: 'employee@devmanager.com',
          role: 'employee',
          employeeId: 'EMP001'
        }
      });
    }
    
    res.status(401).json({ error: 'Invalid credentials' });
    
  } catch (error) {
    console.error('🔥 Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Profile
app.get('/api/auth/profile', (req, res) => {
  res.json({ message: 'Profile endpoint' });
});

// Projects
app.get('/api/projects', (req, res) => {
  res.json([
    { id: 1, name: 'Project 1', status: 'active' },
    { id: 2, name: 'Project 2', status: 'completed' }
  ]);
});

// Clients
app.get('/api/clients', (req, res) => {
  res.json([
    { id: 1, name: 'Client 1', email: 'client1@test.com' },
    { id: 2, name: 'Client 2', email: 'client2@test.com' }
  ]);
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Test endpoint working',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Root
app.get('/', (req, res) => {
  res.json({
    message: 'TBS Manager API',
    endpoints: [
      'GET    /api/health',
      'POST   /api/auth/login',
      'GET    /api/auth/profile',
      'GET    /api/projects',
      'GET    /api/clients',
      'GET    /api/test'
    ]
  });
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`📡 Health: https://tbs-manager.onrender.com/api/health`);
  console.log(`🔐 Test Login: admin@devmanager.com / admin123`);
});
