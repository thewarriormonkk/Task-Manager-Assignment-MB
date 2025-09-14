const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI environment variable is required');
      process.exit(1);
    }

    const conn = await mongoose.connect(mongoUri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);

    // Drop problematic indexes if they exist
    try {
      await conn.connection.db.collection('users').dropIndex('username_1');
      console.log('Dropped username_1 index');
    } catch (indexError) {
      console.log('No username_1 index to drop');
    }

  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
