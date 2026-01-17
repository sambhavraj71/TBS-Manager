const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setup() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import models
    const User = require('./models/User');
    
    // Clear existing users
    await User.deleteMany({});
    console.log('🧹 Cleared existing users');
    
    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    const admin = new User({
      name: 'Admin',
      email: 'admin@devmanager.com',
      password: hashedPassword,
      role: 'admin',
      employeeId: 'ADM001',
      department: 'Administration',
      position: 'System Administrator',
      isActive: true,
    });
    
    await admin.save();
    
    // Create sample employee
    const employeePassword = await bcrypt.hash('employee123', salt);
    const employee = new User({
      name: 'John Doe',
      email: 'employee@devmanager.com',
      password: employeePassword,
      role: 'employee',
      employeeId: 'EMP001',
      department: 'Development',
      position: 'Web Developer',
      isActive: true,
    });
    
    await employee.save();
    
    console.log('✅ Users created successfully!');
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('=====================');
    console.log('👑 ADMIN:');
    console.log('   Email: admin@devmanager.com');
    console.log('   Password: admin123');
    console.log('\n👤 EMPLOYEE:');
    console.log('   Email: employee@devmanager.com');
    console.log('   Password: employee123');
    console.log('\n⚠️  Change these passwords after first login!');
    
    await mongoose.disconnect();
    console.log('\n✅ Setup completed!');
    
  } catch (error) {
    console.error('❌ Setup error:', error.message);
    process.exit(1);
  }
}

setup();