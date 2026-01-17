const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setupAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dev_manager');
    console.log('✅ Connected to MongoDB');
    
    // Define User model directly here to avoid middleware issues
    const UserSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
      employeeId: String,
      department: String,
      position: String,
      isActive: Boolean,
      createdAt: Date,
    });
    
    const User = mongoose.model('User', UserSchema);
    
    // Admin credentials
    const adminData = {
      name: 'Admin',
      email: 'admin@devmanager.com',
      password: 'admin123',
      role: 'admin',
      employeeId: 'ADM001',
      department: 'Administration',
      position: 'System Administrator',
      isActive: true,
      createdAt: new Date(),
    };
    
    // Check if admin exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('👑 Admin already exists. Updating password...');
      
      // Update password
      const salt = await bcrypt.genSalt(10);
      existingAdmin.password = await bcrypt.hash(adminData.password, salt);
      await existingAdmin.save();
      
      console.log('✅ Admin password updated!');
    } else {
      console.log('👑 Creating new admin user...');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      adminData.password = await bcrypt.hash(adminData.password, salt);
      
      // Create admin
      const admin = new User(adminData);
      await admin.save();
      
      console.log('✅ Admin user created successfully!');
    }
    
    console.log('\n📋 ADMIN CREDENTIALS:');
    console.log('📧 Email: admin@devmanager.com');
    console.log('🔑 Password: admin123');
    console.log('\n⚠️  IMPORTANT: Change these credentials after first login!');
    
    // Disconnect
    await mongoose.disconnect();
    console.log('\n✅ Setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupAdmin();