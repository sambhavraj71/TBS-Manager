const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdminDirect() {
  try {
    // Connect without using models
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dev_manager');
    console.log('✅ Connected to MongoDB');
    
    // Get database connection
    const db = mongoose.connection.db;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Check if admin exists
    const existingAdmin = await db.collection('users').findOne({ 
      email: 'admin@devmanager.com' 
    });
    
    if (existingAdmin) {
      console.log('👑 Admin already exists');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.name);
      
      // Update password if needed
      await db.collection('users').updateOne(
        { email: 'admin@devmanager.com' },
        { $set: { password: hashedPassword } }
      );
      console.log('✅ Password updated to: admin123');
    } else {
      // Create new admin
      await db.collection('users').insertOne({
        name: 'Admin',
        email: 'admin@devmanager.com',
        password: hashedPassword,
        role: 'admin',
        employeeId: 'ADM001',
        department: 'Administration',
        position: 'System Administrator',
        isActive: true,
        createdAt: new Date(),
        __v: 0
      });
      
      console.log('✅ Admin created successfully!');
    }
    
    console.log('\n📋 ADMIN CREDENTIALS:');
    console.log('📧 Email: admin@devmanager.com');
    console.log('🔑 Password: admin123');
    
    await mongoose.disconnect();
    console.log('\n✅ Done!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

createAdminDirect();