const mongoose = require('mongoose');

const connectDB = async () => {
  const uri =
    process.env.MONGO_URI ||
    'mongodb://127.0.0.1:27017/realestate';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    if (error.message.includes('ENOTFOUND') && /_mongodb\._tcp\.[^.]+\b/.test(error.message)) {
      console.error(
        '   Atlas URI may be malformed — if your password contains @ # : / ? encode it in MONGO_URI (@ → %40).',
      );
    }
    console.error(
      '   Local MongoDB: brew services start mongodb-community@7.0',
    );
    console.error(
      '   Atlas: Network Access → add your IP (or 0.0.0.0/0 for dev), Database Access → user with password.',
    );
    process.exit(1);
  }
};

module.exports = connectDB;