const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fir_management';
  await mongoose.connect(uri);
  logger.info('MongoDB connected successfully.');
};

module.exports = connectDB;
