const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/task_management');
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Drop problematic indexes if they exist
    try {
      await conn.connection.db.collection('users').dropIndex('username_1');
      console.log('Dropped username_1 index');
    } catch (indexError) {
      console.log('No username_1 index to drop');
    }
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
