require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/corporate_hr',
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_jwt_key_cia3_christ_university_2026'
};
