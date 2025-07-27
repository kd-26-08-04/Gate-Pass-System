// Database setup script for Gate Pass System
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./Backend/models/User');
const GatePass = require('./Backend/models/GatePass');

// MongoDB connection
const MONGODB_URI = 'mongodb://localhost:27017/gatepass';

async function setupDatabase() {
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    await User.deleteMany({});
    await GatePass.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create sample users
    const users = [
      {
        name: 'John Doe',
        email: 'student@example.com',
        password: await bcrypt.hash('password123', 10),
        userType: 'student',
        studentId: 'STU001',
        department: 'Computer Science',
        year: 3,
        section: 'A',
        phoneNumber: '1234567890',
        parentContact: '0987654321',
        address: '123 Student Street, City',
      },
      {
        name: 'Dr. Jane Smith',
        email: 'hod@example.com',
        password: await bcrypt.hash('password123', 10),
        userType: 'hod',
        employeeId: 'EMP001',
        department: 'Computer Science',
        designation: 'HOD',
        phoneNumber: '1234567891',
        address: '456 Faculty Avenue, City',
      },
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: await bcrypt.hash('password123', 10),
        userType: 'student',
        studentId: 'STU002',
        department: 'Computer Science',
        year: 2,
        section: 'B',
        phoneNumber: '1234567892',
        parentContact: '0987654322',
        address: '789 Student Lane, City',
      }
    ];

    // Insert sample users
    await User.insertMany(users);
    console.log('✅ Sample users created');

    // Create sample gate passes
    const student1 = await User.findOne({ email: 'student@example.com' });
    const student2 = await User.findOne({ email: 'alice@example.com' });
    const hod = await User.findOne({ email: 'hod@example.com' });

    const gatePasses = [
      {
        studentId: student1._id,
        reason: 'Medical appointment',
        destination: 'City Hospital',
        exitTime: new Date(),
        expectedReturnTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours later
        emergencyContact: '1234567890',
        parentContact: '0987654321',
        status: 'pending',
        department: 'Computer Science',
      },
      {
        studentId: student2._id,
        reason: 'Family emergency',
        destination: 'Home',
        exitTime: new Date(),
        expectedReturnTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours later
        emergencyContact: '1234567892',
        parentContact: '0987654322',
        status: 'approved',
        approvedBy: hod._id,
        approvedAt: new Date(),
        department: 'Computer Science',
      }
    ];

    await GatePass.insertMany(gatePasses);
    console.log('✅ Sample gate passes created');

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📝 Sample Login Credentials:');
    console.log('Student: student@example.com / password123');
    console.log('Student 2: alice@example.com / password123');
    console.log('HOD: hod@example.com / password123');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the setup
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;