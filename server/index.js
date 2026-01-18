const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
  origin: '*', // Allow all origins for now
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// MongoDB Connection with better error handling
const connectDB = async () => {
  try {
    console.log('🔗 Attempting to connect to MongoDB...');
    
    // If no MONGODB_URI, use local MongoDB or exit
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dev_manager';
    
    console.log('Using MongoDB URI:', mongoURI.includes('@') ? 'MongoDB Atlas' : 'Local MongoDB');
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ MongoDB Connected Successfully');
    console.log('📊 Database:', mongoose.connection.name);
    
    // Create admin user if doesn't exist
    await createInitialAdmin();
    
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('⚠️  Running without database connection');
    console.log('📝 Admin credentials will be hardcoded for testing');
  }
};

// Function to create initial admin user
async function createInitialAdmin() {
  try {
    // Define User schema directly to avoid import issues
    const UserSchema = new mongoose.Schema({
      name: String,
      email: { type: String, unique: true },
      password: String,
      role: String,
      employeeId: String,
      department: String,
      position: String,
      isActive: Boolean,
      lastLogin: Date,
      createdAt: { type: Date, default: Date.now }
    });
    
    const User = mongoose.model('User', UserSchema);
    
    const adminEmail = 'admin@devmanager.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      console.log('👑 Creating admin user...');
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const admin = new User({
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        employeeId: 'ADM001',
        department: 'Administration',
        position: 'System Administrator',
        isActive: true,
        createdAt: new Date()
      });
      
      await admin.save();
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email:', adminEmail);
      console.log('🔑 Password: admin123');
    } else {
      console.log('👑 Admin user already exists');
    }
  } catch (error) {
    console.error('⚠️  Could not create admin:', error.message);
  }
}

connectDB();

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({ 
    status: 'OK', 
    mongodb: dbStatus,
    service: 'Dev Manager API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    port: port,
    login_test: 'Use POST /api/auth/login with admin@devmanager.com / admin123'
  });
});

// ========== AUTH ROUTES ==========

// FIXED LOGIN ROUTE - Works with or without database
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('📥 Login attempt received');
    console.log('Request body:', req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // If MongoDB is connected, try to find user in database
    if (mongoose.connection.readyState === 1) {
      try {
        console.log('🔍 Searching user in database...');
        
        // Define User schema if needed
        const UserSchema = new mongoose.Schema({
          name: String,
          email: String,
          password: String,
          role: String,
          employeeId: String,
          isActive: Boolean
        });
        
        const User = mongoose.models.User || mongoose.model('User', UserSchema);
        
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (user) {
          console.log('✅ User found in database:', user.email);
          
          // Check password
          const isMatch = await bcrypt.compare(password, user.password);
          
          if (isMatch && user.isActive !== false) {
            // Update last login
            user.lastLogin = new Date();
            await user.save();
            
            // Generate token
            const token = jwt.sign(
              { userId: user._id, email: user.email },
              process.env.JWT_SECRET || 'dev-manager-secret-key',
              { expiresIn: '7d' }
            );
            
            console.log('✅ Database login successful');
            
            return res.json({
              token,
              user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role || 'employee',
                employeeId: user.employeeId,
                department: user.department,
                position: user.position
              }
            });
          }
        }
      } catch (dbError) {
        console.log('⚠️  Database login failed, using fallback:', dbError.message);
      }
    }
    
    // Fallback: Hardcoded users (when no DB or user not found)
    console.log('🔄 Using fallback login system');
    
    // Hardcoded test users
    const testUsers = {
      'admin@devmanager.com': {
        password: 'admin123',
        user: {
          id: 'admin-001',
          name: 'Admin',
          email: 'admin@devmanager.com',
          role: 'admin',
          employeeId: 'ADM001',
          department: 'Administration',
          position: 'System Administrator'
        }
      },
      'employee@devmanager.com': {
        password: 'employee123',
        user: {
          id: 'emp-001',
          name: 'John Doe',
          email: 'employee@devmanager.com',
          role: 'employee',
          employeeId: 'EMP001',
          department: 'Development',
          position: 'Web Developer'
        }
      }
    };
    
    const userData = testUsers[email];
    
    if (!userData) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (userData.password !== password) {
      console.log('❌ Password incorrect for:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token for test user
    const token = jwt.sign(
      { userId: userData.user.id, email: email },
      process.env.JWT_SECRET || 'dev-manager-secret-key',
      { expiresIn: '7d' }
    );
    
    console.log('✅ Fallback login successful for:', email);
    
    res.json({
      token,
      user: userData.user
    });
    
  } catch (error) {
    console.error('🔥 Login route error:', error);
    console.error('🔥 Stack trace:', error.stack);
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get user profile
app.get('/api/auth/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-manager-secret-key');
    
    // For test users
    if (decoded.userId.startsWith('admin-') || decoded.userId.startsWith('emp-')) {
      const testUsers = {
        'admin-001': {
          id: 'admin-001',
          name: 'Admin',
          email: 'admin@devmanager.com',
          role: 'admin'
        },
        'emp-001': {
          id: 'emp-001',
          name: 'John Doe',
          email: 'employee@devmanager.com',
          role: 'employee'
        }
      };
      
      return res.json({ user: testUsers[decoded.userId] });
    }
    
    res.json({ user: { id: decoded.userId, email: decoded.email } });
    
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// ========== PROJECTS ROUTES ==========

app.get('/api/projects', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      try {
        // Define Project schema
        const ProjectSchema = new mongoose.Schema({
          name: String,
          description: String,
          projectType: String,
          status: String,
          client: mongoose.Schema.Types.ObjectId,
          technologies: [String],
          startDate: Date,
          endDate: Date,
          budget: Number,
          hourlyRate: Number,
          estimatedHours: Number,
          createdBy: mongoose.Schema.Types.ObjectId,
          createdAt: { type: Date, default: Date.now }
        });
        
        const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
        const projects = await Project.find().limit(50);
        return res.json(projects);
      } catch (dbError) {
        console.log('Projects DB error:', dbError.message);
      }
    }
    
    // Return empty array if no database
    res.json([]);
    
  } catch (error) {
    console.error('Projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// ========== CLIENTS ROUTES ==========

app.get('/api/clients', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      try {
        // Define Client schema
        const ClientSchema = new mongoose.Schema({
          name: String,
          email: String,
          phone: String,
          company: String,
          website: String,
          address: String,
          clientType: String,
          createdBy: mongoose.Schema.Types.ObjectId,
          createdAt: { type: Date, default: Date.now }
        });
        
        const Client = mongoose.models.Client || mongoose.model('Client', ClientSchema);
        const clients = await Client.find().limit(50);
        return res.json(clients);
      } catch (dbError) {
        console.log('Clients DB error:', dbError.message);
      }
    }
    
    // Return empty array if no database
    res.json([]);
    
  } catch (error) {
    console.error('Clients error:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// ========== TEST ENDPOINTS ==========

// Test database connection
app.get('/api/test', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.json({
      message: 'Backend is working!',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      login_test: 'POST /api/auth/login with {email: "admin@devmanager.com", password: "admin123"}'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test user creation
app.post('/api/test/create-admin', async (req, res) => {
  try {
    await createInitialAdmin();
    res.json({ message: 'Admin creation attempted. Check server logs.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ERROR HANDLING ==========

// 404 handler
app.use('*', (req, res) => {
  console.log('404 - Route not found:', req.originalUrl);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    available_endpoints: [
      'GET    /api/health',
      'POST   /api/auth/login',
      'GET    /api/auth/profile',
      'GET    /api/projects',
      'GET    /api/clients',
      'GET    /api/test'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Global error handler:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? undefined : err.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server started on port ${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Health check: http://localhost:${port}/api/health`);
  console.log(`🔐 Test login: admin@devmanager.com / admin123`);
  console.log(`👤 Test employee: employee@devmanager.com / employee123`);
  console.log(`📊 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected'}`);
});
