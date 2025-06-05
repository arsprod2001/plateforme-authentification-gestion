import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import config from '../config/env.js';

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      config.FRONTEND_URL,
      'http://localhost:5173'
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Protection contre les attaques brute force
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://*"],
      connectSrc: ["'self'", config.FRONTEND_URL]
    }
  },
  hsts: {
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true
  }
});

export const corsMiddleware = cors(corsOptions);
export const rateLimitMiddleware = apiLimiter;
export const helmetMiddleware = helmetConfig;
