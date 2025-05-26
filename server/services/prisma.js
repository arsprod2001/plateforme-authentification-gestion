import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL + (process.env.NODE_ENV === 'production' ? '?connection_limit=20' : '')
    }
  }
});

export default prisma;
