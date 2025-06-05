import app from './app.js';
import config from './config/env.js';
import prisma from './services/prisma.js';
import redis from './services/redis.js';
import { createServer } from 'http';

const startServer = async () => {
  try {
    await prisma.$connect();
    await redis.connect();

    const server = createServer(app);

    server.listen(config.PORT, () => {
      console.log(`Server running on port ${config.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
