const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const connectDB = require('../config/db');

dotenv.config();
connectDB();

const importData = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@ccms.com' });

    if (adminExists) {
      console.log('⚠️ Superadmin already exists!');
      process.exit();
    }

    await User.create({
      name: 'System Admin',
      email: 'admin@ccms.com',
      password: 'admin123',
      role: 'superadmin',
    });

    console.log('✅ Superadmin Created Successfully!');
    console.log('📧 Email: admin@ccms.com');
    console.log('🔑 Password: admin123');
    
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    console.log('🗑️ Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}