import dotenv from 'dotenv';
dotenv.config();

const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  REDIS_URL: process.env.REDIS_URL,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
  HIBP_API_URL: process.env.HIBP_API_URL || 'https://api.pwnedpasswords.com/range/'
};

export default config;
